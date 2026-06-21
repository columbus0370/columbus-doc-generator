import re
import logging
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator
from services.claude import generate_document, generate_email_body
from services.pdf import generate_pdf

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


class GenerateRequest(BaseModel):
    doc_type: str = Field(..., max_length=20)
    client_name: str = Field(..., min_length=1, max_length=100)
    company_name: str = Field("", max_length=500)
    content: str = Field(..., min_length=1, max_length=2000)
    amount: str = Field("", max_length=20)
    notes: str = Field("", max_length=500)

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: str) -> str:
        if v and not re.fullmatch(r"[\d,，.。\s]*", v):
            raise ValueError("amountには数字・カンマ・ピリオドのみ使用できます")
        return v


class GenerateResponse(BaseModel):
    generated_text: str
    title: str


class PdfRequest(BaseModel):
    html_content: str = Field(..., min_length=1, max_length=500_000)


class EmailRequest(BaseModel):
    client_name: str = Field(default="", max_length=100)
    company_name: str = Field(default="", max_length=100)
    work_type: str = Field(default="", max_length=50)
    total_amount: str = Field(default="", max_length=20)
    deadline: str = Field(default="", max_length=50)


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    if req.doc_type not in ["estimate", "invoice"]:
        raise HTTPException(status_code=400, detail="Invalid doc_type")
    if not req.client_name.strip():
        raise HTTPException(status_code=400, detail="顧客名を入力してください")
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="業務内容を入力してください")

    try:
        result = await run_in_threadpool(
            generate_document,
            doc_type=req.doc_type,
            client_name=req.client_name,
            company_name=req.company_name,
            content=req.content,
            amount=req.amount,
            notes=req.notes,
        )
        return result
    except RuntimeError as e:
        logger.exception("generate RuntimeError: %s", e)
        raise HTTPException(status_code=503, detail="生成に失敗しました")
    except ValueError as e:
        logger.exception("generate ValueError: %s", e)
        raise HTTPException(status_code=400, detail="生成に失敗しました")
    except Exception as e:
        logger.exception("generate unexpected error: %s", e)
        raise HTTPException(status_code=500, detail="生成に失敗しました")


@router.post("/download-pdf")
async def download_pdf(req: PdfRequest):
    if not req.html_content.strip():
        raise HTTPException(status_code=400, detail="html_content is required")

    try:
        pdf_bytes = await run_in_threadpool(generate_pdf, req.html_content)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=document.pdf"},
        )
    except Exception as e:
        logger.exception("download_pdf unexpected error: %s", e)
        raise HTTPException(status_code=500, detail="PDF生成に失敗しました")


@router.post("/generate-email")
async def generate_email(req: EmailRequest):
    try:
        result = await run_in_threadpool(
            generate_email_body,
            client_name=req.client_name,
            company_name=req.company_name,
            work_type=req.work_type,
            total_amount=req.total_amount,
            deadline=req.deadline,
        )
        return result
    except RuntimeError as e:
        logger.exception("generate_email RuntimeError: %s", e)
        raise HTTPException(status_code=503, detail="メール生成に失敗しました")
    except Exception as e:
        logger.exception("generate_email unexpected error: %s", e)
        raise HTTPException(status_code=500, detail="メール生成に失敗しました")
