import os
import hmac
import hashlib
import base64
import secrets
import smtplib
import json
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Request, Response

router = APIRouter()
logger = logging.getLogger(__name__)

# インメモリのキーセット（Render.com再起動でリセットされるため、VALID_ACCESS_KEYSと併用）
_runtime_keys: set[str] = set()


def _verify_square_signature(body: bytes, signature: str, key: str) -> bool:
    expected = base64.b64encode(
        hmac.new(key.encode(), body, hashlib.sha256).digest()
    ).decode()
    return hmac.compare_digest(expected, signature)


def _generate_access_key() -> str:
    return "key_" + secrets.token_urlsafe(16)


def _send_access_key_email(to_email: str, access_key: str) -> None:
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    tool_url = os.environ.get("TOOL_URL", "")

    if not smtp_user or not smtp_password:
        logger.warning("SMTP credentials not configured — skipping email send")
        return

    subject = "【Columbus AI 書類ジェネレーター】スタンダードプラン登録完了"
    body = f"""この度はスタンダードプランにご登録いただきありがとうございます。

以下のアクセスキーをツール内でご入力ください。

アクセスキー: {access_key}

ツールURL: {tool_url}

ご不明な点がございましたらお気軽にお問い合わせください。

Columbus AI 書類ジェネレーター
"""

    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())


@router.post("/square/webhook")
async def square_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Square-Hmacsha256-Signature", "")
    sig_key = os.environ.get("SQUARE_WEBHOOK_SIGNATURE_KEY", "")

    if sig_key and not _verify_square_signature(body, signature, sig_key):
        logger.warning("Square webhook signature verification failed")
        return Response(status_code=400)

    try:
        payload = json.loads(body)
    except Exception:
        return Response(status_code=200)

    event_type = payload.get("type", "")

    if event_type == "payment.completed":
        payment = payload.get("data", {}).get("object", {}).get("payment", {})
        buyer_email = payment.get("buyer_email_address", "")

        if buyer_email:
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
