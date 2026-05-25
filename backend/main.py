import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.generate import router

app = FastAPI(title="Columbus AI 書類ジェネレーター API")

origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}
