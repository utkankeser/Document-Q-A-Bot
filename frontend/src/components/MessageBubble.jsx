import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ role, content }) {
    const isBot = role === 'bot';

    return (
        <div className={`message ${isBot ? 'bot' : 'user'}`}>
            <div className="message-avatar">
                {isBot ? '🤖' : '👤'}
            </div>
            <div className="message-content">
                {isBot ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                    <p>{content}</p>
                )}
            </div>
        </div>
    );
}

export function TypingIndicator() {
    return (
        <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
                <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}
