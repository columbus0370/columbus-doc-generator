import os
import hmac
import hashlib
import base64
import secrets
import json
import logging
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Request, Response, HTTPException

router = APIRouter()
logger = logging.getLogger(__name__)

# 発行済みキーの履歴（メモリ保持。再起動でリセットされるが VALID_ACCESS_KEYS で永続化可能）
_issued_keys: list[dict] = []


def _runtime_key_set() -> set[str]:
    return {r["key"] for r in _issued_keys}


def _verify_square_signature(body: bytes, signature: str, key: str, notification_url: str) -> bool:
    # Square は notification_url + raw_body を結合して HMAC-SHA256 を計算する
    payload = notification_url.encode() + body
    expected = base64.b64encode(
        hmac.new(key.encode(), payload, hashlib.sha256).digest()
    ).decode()
    return hmac.compare_digest(expected, signature)


def _extract_buyer_email(payload: dict) -> str:
    obj = payload.get("data", {}).get("object", {})
    # payment.completed / payment.updated
    email = obj.get("payment", {}).get("buyer_email_address", "")
    if email:
        return email
    # invoice.payment_made
    email = obj.get("invoice", {}).get("primary_recipient", {}).get("email_address", "")
    if email:
        return email
    # 広く探す
    for val in obj.values():
        if isinstance(val, dict):
            email = val.get("buyer_email_address", "") or val.get("email_address", "")
            if email:
                return email
    return ""


def _generate_access_key() -> str:
    return "key_" + secrets.token_urlsafe(16)


def _send_access_key_email(to_email: str, access_key: str) -> None:
    resend_api_key = os.environ.get("RESEND_API_KEY", "")
    tool_url = os.environ.get("TOOL_URL", "")
    email_from = os.environ.get("EMAIL_FROM", "Columbus AI <onboarding@resend.dev>")

    if not resend_api_key:
        logger.warning("RESEND_API_KEY not configured — skipping email send")
        return

    subject = "【Columbus AI 書類ジェネレーター】スタンダードプラン登録完了"
    body = f"""この度はスタンダードプランにご登録いただきありがとうございます。

以下のアクセスキーをツール内でご入力ください。

アクセスキー: {access_key}

ツールURL: {tool_url}

ご不明な点がございましたらお気軽にご連絡ください。

Columbus AI 書類ジェネレーター
"""

    response = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {resend_api_key}"},
        json={"from": email_from, "to": [to_email], "subject": subject, "text": body},
        timeout=10,
    )
    response.raise_for_status()


@router.post("/square/webhook")
async def square_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Square-Hmacsha256-Signature", "")
    sig_key = os.environ.get("SQUARE_WEBHOOK_SIGNATURE_KEY", "")

    notification_url = str(request.url)
    if sig_key and not _verify_square_signature(body, signature, sig_key, notification_url):
        logger.warning("Square webhook signature verification failed")
        return Response(status_code=400)

    try:
        payload = json.loads(body)
    except Exception:
        return Response(status_code=200)

    event_type = payload.get("type", "")
    logger.info("Square webhook received: type=%s", event_type)

    # payment.updated は COMPLETED のみ処理
    if event_type == "payment.updated":
        status = payload.get("data", {}).get("object", {}).get("payment", {}).get("status", "")
        logger.info("payment.updated status: %s", status)
        if status != "COMPLETED":
            return Response(status_code=200)

    if event_type not in ("payment.completed", "payment.updated", "invoice.payment_made"):
        return Response(status_code=200)

    buyer_email = _extract_buyer_email(payload)
    logger.info("Extracted buyer_email: %s", buyer_email or "(none)")

    if not buyer_email:
        return Response(status_code=200)

    access_key = _generate_access_key()
    _issued_keys.append({
        "key": access_key,
        "email": buyer_email,
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "email_sent": False,
    })
    logger.info("ACCESS KEY ISSUED — email=%s key=%s", buyer_email, access_key)

    try:
        _send_access_key_email(buyer_email, access_key)
        _issued_keys[-1]["email_sent"] = True
        logger.info("Access key email sent to %s", buyer_email)
    except Exception as e:
        logger.exception("Failed to send access key email: %s", e)
        logger.warning("ACTION REQUIRED: manually send key=%s to email=%s", access_key, buyer_email)

    return Response(status_code=200)


@router.get("/admin/keys")
async def admin_list_keys(request: Request):
    """発行済みアクセスキー一覧（ADMIN_SECRET ヘッダーまたはクエリパラメータで認証）"""
    admin_secret = os.environ.get("ADMIN_SECRET", "")
    if not admin_secret:
        raise HTTPException(status_code=503, detail="ADMIN_SECRET not configured")

    token = request.headers.get("X-Admin-Secret") or request.query_params.get("secret", "")
    if not hmac.compare_digest(token, admin_secret):
        raise HTTPException(status_code=401, detail="Unauthorized")

    static_keys = [
        k.strip()
        for k in os.environ.get("VALID_ACCESS_KEYS", "").split(",")
        if k.strip()
    ]

    return {
        "issued": _issued_keys,
        "static_keys": static_keys,
        "total_runtime": len(_issued_keys),
    }


def get_runtime_keys() -> set[str]:
    return _runtime_key_set()
