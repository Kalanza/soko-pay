/**
 * SupportChatbot Component
 * AI-powered customer support assistant
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { aiService } from '@/services/aiService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface Props {
  orderId?: string;
  buyerName?: string;
  onClose?: () => void;
}

export function SupportChatbot({ orderId, buyerName, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: `👋 Hi${buyerName ? ` ${buyerName}` : ''}! I'm here to help. What can I assist you with today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.handleSupportQuery(
        input,
        orderId,
        buyerName
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (response.suggests_escalation) {
        const escalationMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          text: '⚠️ This issue needs human attention. Our support team will contact you shortly.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, escalationMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: '❌ Sorry, I encountered an error. Please try again or contact our support team.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="font-semibold text-sm">Soko Pay Support</h3>
            <p className="text-xs text-blue-100">AI Assistant</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
              } text-sm`}
            >
              <p className="leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.type === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none text-sm">
              <div className="flex gap-1">
                <span className="inline-block animate-bounce">●</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>
                  ●
                </span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>
                  ●
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 bg-white space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            📤
          </button>
        </div>
        <p className="text-xs text-gray-500">
          💡 Ask about orders, tracking, payments, or products
        </p>
      </div>
    </div>
  );
}
