
import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon } from '../constants';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS = [
    "Run code quality check",
    "Analyze performance",
    "Security audit",
    "Check SEO health"
];

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: Date.now(),
                text: "🤖 Welcome to Kiro AI Assistant!\n\nI'm powered by Claude Haiku and provide:\n✅ Code quality analysis\n✅ Performance optimization\n✅ Security audits\n✅ SEO validation\n✅ Multi-version support\n\nAll features are lifetime free with no limits!\n\nHow can I help you today?",
                sender: 'bot'
            }]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        const userMessage: ChatMessage = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Simulate AI response with helpful guidance
            const responses: { [key: string]: string } = {
                'code quality': '📊 Code Quality Analysis\n\nTo check code quality:\n1. Save any TypeScript/JavaScript file\n2. The lint-on-save hook runs automatically\n3. Check chat for analysis results\n\nOr ask me: "Analyze [filename] for issues"',
                'performance': '⚡ Performance Analysis\n\nTo analyze performance:\n1. Ask: "Run performance analysis on the codebase"\n2. I\'ll check:\n   • Bundle size\n   • Import efficiency\n   • Memory usage\n   • Query performance\n   • Component re-renders',
                'security': '🔒 Security Audit\n\nTo run security audit:\n1. Save any auth/security file\n2. The security-audit hook runs automatically\n3. I\'ll scan for:\n   • Vulnerabilities\n   • Authentication issues\n   • Data protection gaps\n   • API security',
                'seo': '🔍 SEO Validation\n\nTo validate SEO:\n1. Save any SEO file\n2. The seo-validation hook runs automatically\n3. I\'ll check:\n   • Metadata completeness\n   • Content optimization\n   • Linking structure\n   • Schema markup',
                'help': '📚 Available Commands\n\n✅ "Run code quality check"\n✅ "Analyze performance"\n✅ "Security audit"\n✅ "Check SEO health"\n✅ "Run complete codebase health check"\n✅ "Analyze [filename] for issues"\n\nAll analysis is powered by Claude Haiku - lifetime free!'
            };

            let response = 'I\'m here to help with code analysis, performance optimization, security audits, and SEO validation. What would you like me to analyze?';

            const lowerText = textToSend.toLowerCase();
            for (const [key, value] of Object.entries(responses)) {
                if (lowerText.includes(key)) {
                    response = value;
                    break;
                }
            }

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const botMessage: ChatMessage = {
                id: Date.now() + 1,
                text: response,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                text: "I encountered an error. Please try again.",
                sender: 'bot'
            };
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
                                <h3 className="font-bold text-lg">Kiro AI Assistant</h3>
                                <div className="flex items-center text-xs text-indigo-100 mt-0.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                    Claude Haiku • Lifetime Free
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.sender === 'user'
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
