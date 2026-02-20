"""
config.py — Uygulama ayarları ve ortam değişkenleri

Bu dosya .env dosyasından API anahtarını okur ve
uygulamanın kullanacağı sabitleri tanımlar.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasını yükle (backend'in bir üst dizinindeki .env)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ─── API Anahtarları ────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ─── Dosya Yolları ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
CHROMA_DIR = BASE_DIR / "chroma_data"

# Dizinleri oluştur (yoksa)
UPLOAD_DIR.mkdir(exist_ok=True)
CHROMA_DIR.mkdir(exist_ok=True)

# ─── RAG Ayarları ───────────────────────────────────────────────
CHUNK_SIZE = 500          # Her metin parçasının karakter uzunluğu
CHUNK_OVERLAP = 50        # Parçalar arası örtüşme (bağlamı korur)
TOP_K = 3                 # Sorguya en yakın kaç parça getirilecek
EMBEDDING_MODEL = "all-MiniLM-L6-v2"   # Sentence-transformers modeli
GEMINI_MODEL = "gemini-3-flash-preview"  # Gemini 3 Flash — en yeni, en zeki, ücretsiz

# ─── Desteklenen Dosya Türleri ──────────────────────────────────
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".pptx", ".ppt"}
