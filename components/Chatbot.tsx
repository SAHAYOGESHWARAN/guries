
import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { startChat } from '../utils/gemini';
import { ChatIcon } from '../constants';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS = [
    "Analyze current traffic",
    "Draft a LinkedIn post",
    "Check SEO health",
    "Suggest blog topics"
];

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            chatRef.current = startChat();
            setMessages([{ 
                id: Date.now(), 
                text: "Hello! I'm connected to your Marketing Knowledge Graph via Gemini 1.5 Pro. I can analyze data, draft content, or manage campaigns. What's on your mind?", 
                sender: 'bot' 
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || !chatRef.current) return;

        const userMessage: ChatMessage = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: textToSend });
            const botMessage: ChatMessage = { id: Date.now() + 1, text: response.text, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { id: Date.now() + 1, text: "I encountered a connection error. Please check your API configuration.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        }
        setIsLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 group ${isOpen ? 'bg-red-500 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'}`}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <ChatIcon />
                )}
            </button>
            
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-100 animate-scale-in origin-bottom-right">
                    {/* Header */}
                    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">Marketing Assistant</h3>
                                <div className="flex items-center text-xs text-indigo-100 mt-0.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                    Gemini 3 Pro Active
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start mb-4">
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length < 3 && (
                        <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto scrollbar-hide">
                            {QUICK_PROMPTS.map((prompt, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handleSend(prompt)}
                                    className="whitespace-nowrap px-3 py-1 bg-white border border-indigo-100 text-indigo-600 text-xs rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                placeholder="Ask anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                disabled={isLoading}
                                autoFocus
                            />
                            <button 
                                onClick={() => handleSend()} 
                                disabled={isLoading || !input.trim()} 
                                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
