import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import useAromiStore from '../../store/useAromiStore';

const AromiChatbot = () => {
    const { messages, isOpen, isTyping, toggleChat, sendMessage, loadHistory } = useAromiStore();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen, loadHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 group hover:scale-110 ${isOpen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gradient-to-r from-primary to-accent text-black hover:shadow-primary/50'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 w-[380px] h-[600px] max-h-[80vh] glass rounded-2xl border border-gray-800 flex flex-col shadow-2xl z-40 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 bg-black/40 rounded-t-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-wide">AROMI AI</h3>
                        <p className="text-xs text-primary/80">Your Personal Health Coach</p>
                    </div>
                </div>

                {/* Messages view */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.length === 0 && !isTyping && (
                        <div className="text-center text-gray-500 mt-10 text-sm">
                            Hi! I'm AROMI. Ask me about your health, workouts, or diet!
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}

                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-black rounded-br-none'
                                    : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700 whitespace-pre-line leading-relaxed'
                                }`}>
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center mt-1">
                                    <User className="w-4 h-4 text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700">
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 bg-black/40 border-t border-gray-800 rounded-b-2xl">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask AROMI anything..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-black rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AromiChatbot;
