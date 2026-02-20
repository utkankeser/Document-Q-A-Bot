import React, { useRef, useEffect } from 'react';
import MessageBubble, { TypingIndicator } from './MessageBubble';

export default function ChatArea({ messages, isLoading, onSendMessage, hasDocuments }) {
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Yeni mesaj gelince aşağı kaydır
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const input = inputRef.current;
        const question = input.value.trim();
        if (!question || isLoading) return;
        onSendMessage(question);
        input.value = '';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Hoş geldin ekranı — mesaj yokken göster
    if (messages.length === 0) {
        return (
            <div className="main-content">
                <div className="welcome-screen">
                    <div className="welcome-icon">🔮</div>
                    <h2 className="welcome-title">Document Q&A Bot</h2>
                    <p className="welcome-subtitle">
                        Dokümanlarınızı yükleyin ve doğal dilde sorular sorun.
                        AI destekli asistan, dokümanlarınızdaki bilgilere dayanarak cevaplar üretir.
                    </p>
                    <div className="welcome-steps">
                        <div className="welcome-step">
                            <div className="welcome-step-num">01</div>
                            <h4>Doküman Yükle</h4>
                            <p>PDF, DOCX, TXT veya PPT dosyanızı yükleyin</p>
                        </div>
                        <div className="welcome-step">
                            <div className="welcome-step-num">02</div>
                            <h4>Soru Sorun</h4>
                            <p>Dokümanınız hakkında herhangi bir soru sorun</p>
                        </div>
                        <div className="welcome-step">
                            <div className="welcome-step-num">03</div>
                            <h4>Cevap Alın</h4>
                            <p>AI, dokümanınıza dayanarak cevap üretir</p>
                        </div>
                    </div>
                </div>

                {/* Input — her zaman altta */}
                <div className="chat-input-area">
                    <form className="chat-input-wrapper" onSubmit={handleSubmit}>
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            placeholder={hasDocuments ? "Dokümanınız hakkında bir soru sorun..." : "Önce bir doküman yükleyin..."}
                            rows={1}
                            onKeyDown={handleKeyDown}
                            disabled={!hasDocuments}
                        />
                        <button type="submit" className="send-btn" disabled={!hasDocuments || isLoading}>
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            {/* Chat header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <h2>💬 Sohbet</h2>
                    <p>{messages.length} mesaj</p>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <MessageBubble key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
                <form className="chat-input-wrapper" onSubmit={handleSubmit}>
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        placeholder="Dokümanınız hakkında bir soru sorun..."
                        rows={1}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <button type="submit" className="send-btn" disabled={isLoading}>
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
