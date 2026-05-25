from typing import Literal
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from pydantic import BaseModel
from services.claude import generate_document
from services.pdf import generate_pdf

router = APIRouter(prefix="/api")


class GenerateRequest(BaseModel):
    doc_type: Literal["estimate", "proposal", "report"]
    client_name: str
    company_name: str = ""
    content: str
    amount: str = ""
    notes: str = ""


class GenerateResponse(BaseModel):
    generated_text: str
    title: str


class PdfRequest(BaseModel):
    html_content: str


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
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
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成に失敗しました: {str(e)}")


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
        raise HTTPException(status_code=500, detail=f"PDF生成に失敗しました: {type(e).__name__}: {str(e)}")
