
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Sparkles, Loader2, X, Send } from 'lucide-react';
import { getBabaWisdom } from '../services/geminiService';

const BabaWisdom: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'baba', text: string}[]>([
      { role: 'baba', text: "Habari! I am Baba. I know everything about this game, football, golf, and coding (I coded this on my tractor). Ask me anything!" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    const answer = await getBabaWisdom(userText);
    
    setMessages(prev => [...prev, { role: 'baba', text: answer }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {isOpen ? (
        <div className="bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl shadow-2xl w-80 border-2 border-orange-500 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300" style={{ height: '450px' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 flex justify-between items-center text-white shadow-md">
                <div className="flex items-center gap-2">
                    <div className="bg-white text-orange-600 rounded-full w-8 h-8 flex items-center justify-center font-black border-2 border-orange-600 shadow-sm">B</div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Ask Baba</span>
                        <span className="text-[10px] opacity-90">Expert in Life & Oranges</span>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-orange-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                            <span className="text-xs text-gray-500 italic">Consulting the ancestors...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about software, football, tips..."
                    className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2 rounded-xl transition-colors shadow-sm"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
      ) : (
        <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white pl-4 pr-2 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-white/20 animate-bounce-in"
        >
            <div className="relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <span className="text-sm">Ask Baba</span>
            <div className="bg-white/20 rounded-full p-1 ml-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
        </button>
      )}
    </div>
  );
};

export default BabaWisdom;
