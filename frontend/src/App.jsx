import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import FileUpload from './components/FileUpload';
import './App.css';

const API_URL = '';  // Vite proxy üzerinden backend'e gider (CORS sorunsuz)

export default function App() {
  // ─── State ───────────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [chatHistories, setChatHistories] = useState({});  // { doc_id: [messages] }
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Aktif dokümanın mesajlarını al
  const messages = activeDocId ? (chatHistories[activeDocId] || []) : [];

  // ─── Toast bildirimleri ──────────────────────────────────────
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ─── Dokümanları getir ───────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Dokümanlar getirilemedi:', err);
    }
  }, []);

  // Sayfa yüklendiğinde dokümanları getir
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ─── Doküman yükle ──────────────────────────────────────────
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Yükleme başarısız');
    }

    const data = await res.json();
    addToast(data.message, 'success');
    await fetchDocuments();
    setActiveDocId(data.doc_id);
  };

  // ─── Doküman sil ────────────────────────────────────────────
  const handleDeleteDoc = async (docId) => {
    try {
      const res = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        addToast('Doküman silindi', 'success');
        // Silinen dokümanın sohbet geçmişini de sil
        setChatHistories((prev) => {
          const updated = { ...prev };
          delete updated[docId];
          return updated;
        });
        if (activeDocId === docId) setActiveDocId(null);
        await fetchDocuments();
      }
    } catch (err) {
      addToast('Silme başarısız', 'error');
    }
  };

  // ─── Soru sor ────────────────────────────────────────────────
  const handleSendMessage = async (question) => {
    if (!activeDocId) return;
    const docId = activeDocId;

    // Kullanıcı mesajını bu dokümanın sohbetine ekle
    setChatHistories((prev) => ({
      ...prev,
      [docId]: [...(prev[docId] || []), { role: 'user', content: question }],
    }));
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          doc_id: activeDocId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Cevap alınamadı');
      }

      const data = await res.json();
      setChatHistories((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), { role: 'bot', content: data.answer }],
      }));
    } catch (err) {
      setChatHistories((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), { role: 'bot', content: `❌ Hata: ${err.message}` }],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="app">
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={setActiveDocId}
        onDeleteDoc={handleDeleteDoc}
        onUploadClick={() => setShowUpload(true)}
      />

      <ChatArea
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        hasDocuments={documents.length > 0}
      />

      {/* Upload modal */}
      {showUpload && (
        <FileUpload
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Toast bildirimleri */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.type === 'success' ? '✅' : '❌'} {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
