import React, { useState, useRef } from 'react';

const ALLOWED_TYPES = ['.pdf', '.docx', '.txt', '.pptx', '.ppt'];

export default function FileUpload({ onUpload, onClose }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const fileInputRef = useRef(null);

    const handleFile = async (file) => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_TYPES.includes(ext)) {
            alert(`Desteklenmeyen format: ${ext}\nDesteklenen: ${ALLOWED_TYPES.join(', ')}`);
            return;
        }

        setUploading(true);
        setProgress(20);
        setStatusText('Doküman yükleniyor...');

        try {
            setProgress(50);
            setStatusText('Metin çıkarılıyor ve işleniyor...');
            await onUpload(file);
            setProgress(100);
            setStatusText('✅ Başarılı!');
            setTimeout(() => onClose(), 800);
        } catch (err) {
            setStatusText('❌ Hata: ' + (err.message || 'Yükleme başarısız'));
            setProgress(0);
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && !uploading && onClose()}>
            <div className="upload-modal glass-card" style={{ position: 'relative' }}>
                {!uploading && (
                    <button className="upload-close" onClick={onClose}>✕</button>
                )}

                <div
                    className={`upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <span className="upload-icon">{uploading ? '⏳' : '📤'}</span>
                    <h3 className="upload-title">
                        {uploading ? 'İşleniyor...' : 'Doküman Yükleyin'}
                    </h3>
                    <p className="upload-subtitle">
                        {uploading
                            ? statusText
                            : 'Sürükle & bırak veya tıklayarak dosya seçin'}
                    </p>

                    {!uploading && (
                        <div className="upload-formats">
                            <span className="upload-format-tag">📕 PDF</span>
                            <span className="upload-format-tag">📘 DOCX</span>
                            <span className="upload-format-tag">📄 TXT</span>
                            <span className="upload-format-tag">📙 PPT/PPTX</span>
                        </div>
                    )}

                    {uploading && (
                        <div className="upload-progress">
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="progress-text">{statusText}</p>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.pptx,.ppt"
                    style={{ display: 'none' }}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
}
