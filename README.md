# 📚 Document Q&A Bot

PDF, DOCX, TXT ve PPT dokümanlarınızı yükleyip doğal dilde soru sorabileceğiniz RAG tabanlı AI chatbot.

## 🚀 Özellikler

- 📄 **Çoklu format desteği** — PDF, DOCX, TXT, PPT/PPTX
- 🔍 **RAG (Retrieval-Augmented Generation)** — Dokümanlarınıza dayalı cevaplar
- 🤖 **Google Gemini AI** — Güçlü ve ücretsiz LLM
- 💬 **Chat arayüzü** — Sohbet tarzı soru-cevap
- 🎨 **Modern UI** — Dark theme, glassmorphism, animasyonlar
- ⚡ **Hızlı** — Sentence-transformers ile lokal embedding

## 📋 Gereksinimler

- Python 3.10+
- Node.js 18+
- Google Gemini API Key ([buradan alın](https://aistudio.google.com/apikey))

## 🛠️ Kurulum

### 1. Repo'yu klonlayın
```bash
git clone https://github.com/YOUR_USERNAME/document-qa-bot.git
cd document-qa-bot
```

### 2. API Key'i ayarlayın
`.env` dosyasını düzenleyin:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Backend'i kurun
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Frontend'i kurun
```bash
cd frontend
npm install
npm run dev
```

### 5. Tarayıcınızda açın
```
http://localhost:5173
```

## 🏗️ Mimari

```
Kullanıcı → React Frontend → FastAPI Backend → ChromaDB (Vector DB)
                                             → Gemini API (LLM)
```

## 📁 Proje Yapısı

```
document-qa-bot/
├── backend/
│   ├── main.py           # FastAPI endpoints
│   ├── rag_pipeline.py   # RAG: metin çıkarma, embedding, LLM
│   ├── config.py         # Ayarlar
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/   # React bileşenleri
│       ├── App.jsx       # Ana uygulama
│       └── *.css         # Stiller
├── .env                  # API anahtarları
└── README.md
```

## 🛡️ Teknolojiler

| Teknoloji | Kullanım |
|---|---|
| FastAPI | Backend API |
| ChromaDB | Vektör veritabanı |
| Sentence-Transformers | Embedding oluşturma |
| Google Gemini | LLM (cevap üretme) |
| React + Vite | Frontend |
| PyMuPDF | PDF okuma |
| python-docx | DOCX okuma |
| python-pptx | PPT okuma |

## 📝 Lisans

MIT
