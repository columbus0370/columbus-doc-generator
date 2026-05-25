import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.generate import router

app = FastAPI(title="Columbus AI 書類ジェネレーター API")

_raw = os.environ.get("CORS_ORIGINS", "*")
origins = [o.strip() for o in _raw.split(",")]

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

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}
