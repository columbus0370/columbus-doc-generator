import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
from routers.generate import router
from routers import access_key, square_webhook

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Columbus AI 書類ジェネレーター API",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ────────────────────────────────────────────────────────────────────
_env = os.environ.get("ENV", "development")
_raw = os.environ.get("CORS_ORIGINS", "")

if not _raw:
    if _env == "production":
        raise RuntimeError(
            "ENV=production のとき CORS_ORIGINS 環境変数は必須です。"
        )
    # development fallback
    _raw = "http://localhost:5173,http://localhost:3000"

origins = [o.strip() for o in _raw.split(",") if o.strip()]

# Vercel preview deployments use per-commit URLs; allow all *.vercel.app subdomains
origin_regex = r"https://.*\.vercel\.app" if "*" not in origins else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=origin_regex,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Security Headers Middleware ───────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'"
        )
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.include_router(router)
app.include_router(access_key.router, prefix="/api", tags=["access_key"])
app.include_router(square_webhook.router, prefix="/api", tags=["square"])


@app.get("/health")
async def health():
    return {"status": "ok"}
