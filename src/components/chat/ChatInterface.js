'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';

export default function ChatInterface({ messages = [], onSendMessage }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };
  
  return (
    <>
      {/* Messages container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-zinc-950">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-gray-200'
              }`}
            >
              {message.loading ? (
                <div className="flex items-center space-x-2">
                  <Loader size={16} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="flex-shrink-0 border-t border-zinc-800 p-4 bg-zinc-900">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="input flex-grow bg-zinc-800 border-zinc-700"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`btn btn-primary p-2 rounded-lg ${
              !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </>
  );
}