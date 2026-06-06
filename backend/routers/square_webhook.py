import os
import hmac
import hashlib
import base64
import secrets
import json
import logging
import httpx
from fastapi import APIRouter, Request, Response

router = APIRouter()
logger = logging.getLogger(__name__)

# インメモリのキーセット（Render.com再起動でリセットされるため、VALID_ACCESS_KEYSと併用）
_runtime_keys: set[str] = set()


def _verify_square_signature(body: bytes, signature: str, key: str, notification_url: str) -> bool:
    # Square は notification_url + raw_body を結合してHMAC-SHA256を計算する
    payload = notification_url.encode() + body
    expected = base64.b64encode(
        hmac.new(key.encode(), payload, hashlib.sha256).digest()
    ).decode()
    return hmac.compare_digest(expected, signature)


def _extract_buyer_email(payload: dict, event_type: str) -> str:
    obj = payload.get("data", {}).get("object", {})
    # payment.completed
    email = obj.get("payment", {}).get("buyer_email_address", "")
    if email:
        return email
    # invoice.payment_made
    email = obj.get("invoice", {}).get("primary_recipient", {}).get("email_address", "")
    if email:
        return email
    # その他のネスト構造を広く探す
    for key in obj:
        candidate = obj[key]
        if isinstance(candidate, dict):
            email = candidate.get("buyer_email_address", "") or candidate.get("email_address", "")
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
    logger.info("Square webhook payload: %s", json.dumps(payload, ensure_ascii=False)[:1000])

    buyer_email = _extract_buyer_email(payload, event_type)
    logger.info("Extracted buyer_email: %s", buyer_email or "(none)")

    # payment.updated は COMPLETED になった時のみ処理
    if event_type == "payment.updated":
        status = payload.get("data", {}).get("object", {}).get("payment", {}).get("status", "")
        logger.info("payment.updated status: %s", status)
        if status != "COMPLETED":
            return Response(status_code=200)

    if event_type in ("payment.completed", "payment.updated", "invoice.payment_made") and buyer_email:
        access_key = _generate_access_key()
        _runtime_keys.add(access_key)
        logger.info("New access key issued for %s", buyer_email)

        try:
            _send_access_key_email(buyer_email, access_key)
            logger.info("Access key email sent to %s", buyer_email)
        except Exception as e:
            logger.exception("Failed to send access key email: %s", e)

    return Response(status_code=200)


def get_runtime_keys() -> set[str]:
    return _runtime_keys
