"""
main.py — FastAPI Uygulaması

Bu dosya API endpoint'lerini tanımlar:
- POST /upload    → Doküman yükleme
- POST /ask       → Soru sorma
- GET /documents  → Doküman listeleme
- DELETE /documents/{doc_id} → Doküman silme
"""

import uuid
import shutil
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from config import UPLOAD_DIR, ALLOWED_EXTENSIONS
from rag_pipeline import process_document, ask_question, delete_document, get_all_documents

# ─── FastAPI Uygulaması ─────────────────────────────────────────
app = FastAPI(
    title="Document Q&A Bot",
    description="PDF, DOCX, TXT ve PPT dokümanlarınıza soru sorun!",
    version="1.0.0",
)

# CORS — React frontend'in backend'e erişebilmesi için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme aşamasında tüm origin'lere izin ver
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Modelleri ─────────────────────────────────

class AskRequest(BaseModel):
    """Soru sorma isteği"""
    question: str
    doc_id: str | None = None  # Belirli bir dokümana soru sormak için (opsiyonel)


class AskResponse(BaseModel):
    """Soru cevap yanıtı"""
    answer: str
    context_used: list[str]


class UploadResponse(BaseModel):
    """Doküman yükleme yanıtı"""
    doc_id: str
    filename: str
    total_chunks: int
    text_length: int
    message: str


class DocumentInfo(BaseModel):
    """Doküman bilgisi"""
    doc_id: str
    filename: str
    chunk_count: int


# ─── Endpoint'ler ───────────────────────────────────────────────

@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Doküman yükler ve RAG pipeline'dan geçirir.

    1. Dosya uzantısını kontrol et
    2. Dosyayı uploads/ dizinine kaydet
    3. Metin çıkar → chunk'la → embedding oluştur → ChromaDB'ye kaydet
    """
    # Dosya uzantısını kontrol et
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen dosya formatı: {ext}. "
                   f"Desteklenen formatlar: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Benzersiz ID oluştur
    doc_id = str(uuid.uuid4())

    # Dosyayı kaydet
    file_path = UPLOAD_DIR / f"{doc_id}{ext}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya kaydedilemedi: {str(e)}")

    # RAG pipeline'dan geçir
    try:
        result = process_document(str(file_path), doc_id, file.filename)
    except ValueError as e:
        # Hata durumunda dosyayı sil
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Doküman işlenemedi: {str(e)}")

    return UploadResponse(
        doc_id=result["doc_id"],
        filename=result["filename"],
        total_chunks=result["total_chunks"],
        text_length=result["text_length"],
        message=f"✅ '{file.filename}' başarıyla yüklendi! "
                f"{result['total_chunks']} parça oluşturuldu.",
    )


@app.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    """
    Kullanıcının sorusunu cevaplar.

    1. Soruyu embedding'e çevir
    2. ChromaDB'den en alakalı parçaları bul
    3. Gemini API'ye gönder
    4. Cevabı döndür
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Soru boş olamaz!")

    try:
        result = ask_question(request.question, request.doc_id)
        return AskResponse(
            answer=result["answer"],
            context_used=result["context_used"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soru cevaplanamadı: {str(e)}")


@app.get("/documents", response_model=list[DocumentInfo])
async def list_documents():
    """Yüklü tüm dokümanları listeler."""
    docs = get_all_documents()
    return [DocumentInfo(**doc) for doc in docs]


@app.delete("/documents/{doc_id}")
async def remove_document(doc_id: str):
    """Bir dokümanı siler (ChromaDB + dosya)."""
    # ChromaDB'den sil
    success = delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Doküman bulunamadı.")

    # Dosyayı da sil
    for f in UPLOAD_DIR.iterdir():
        if f.stem == doc_id:
            f.unlink(missing_ok=True)
            break

    return {"message": "Doküman başarıyla silindi.", "doc_id": doc_id}


@app.get("/health")
async def health_check():
    """Sağlık kontrolü endpoint'i."""
    return {"status": "healthy", "message": "Document Q&A Bot çalışıyor! 🚀"}
