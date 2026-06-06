import os
import logging
from fastapi import APIRouter, Request
from pydantic import BaseModel
from limiter import limiter

router = APIRouter()
logger = logging.getLogger(__name__)


class VerifyKeyRequest(BaseModel):
    access_key: str


def _load_valid_keys() -> set[str]:
    raw = os.environ.get("VALID_ACCESS_KEYS", "")
    static_keys = {k.strip() for k in raw.split(",") if k.strip()}
    try:
        from routers.square_webhook import get_runtime_keys
        return static_keys | get_runtime_keys()
    except Exception:
        return static_keys


@router.post("/verify-key")
@limiter.limit("5/minute")
async def verify_key(request: Request, req: VerifyKeyRequest):
    valid_keys = _load_valid_keys()
    is_valid = req.access_key in valid_keys
    return {"valid": is_valid}
