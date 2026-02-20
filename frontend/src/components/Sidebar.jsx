import React from 'react';

const FILE_ICONS = {
    pdf: '📕',
    docx: '📘',
    txt: '📄',
    pptx: '📙',
    ppt: '📙',
};

function getExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

export default function Sidebar({ documents, activeDocId, onSelectDoc, onDeleteDoc, onUploadClick }) {
    return (
        <div className="sidebar">
            {/* Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">📚</div>
                    <h1>DocQ&A</h1>
                </div>
                <p className="sidebar-subtitle">Dokümanlarınıza soru sorun</p>
            </div>

            {/* Upload button */}
            <div style={{ padding: '16px' }}>
                <button className="upload-btn" onClick={onUploadClick} style={{ width: '100%', justifyContent: 'center' }}>
                    <span>📎</span> Doküman Yükle
                </button>
            </div>

            {/* Document list */}
            <div className="doc-list">
                <div className="doc-list-title">Yüklü Dokümanlar</div>

                {documents.length === 0 ? (
                    <div className="no-docs">
                        <div className="no-docs-icon">📂</div>
                        <p>Henüz doküman yüklenmedi.<br />Başlamak için bir doküman yükleyin!</p>
                    </div>
                ) : (
                    documents.map((doc) => {
                        const ext = getExtension(doc.filename);
                        return (
                            <div
                                key={doc.doc_id}
                                className={`doc-item ${activeDocId === doc.doc_id ? 'active' : ''}`}
                                onClick={() => onSelectDoc(doc.doc_id)}
                            >
                                <div className={`doc-icon ${ext}`}>
                                    {FILE_ICONS[ext] || '📄'}
                                </div>
                                <div className="doc-info">
                                    <div className="doc-name" title={doc.filename}>{doc.filename}</div>
                                    <div className="doc-meta">{doc.chunk_count} parça</div>
                                </div>
                                <button
                                    className="doc-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteDoc(doc.doc_id);
                                    }}
                                    title="Dokümanı sil"
                                >
                                    🗑️
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
