import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your HEXCloud AI support system. Ask me about deploying VPS instances, configuring high-end GPU Cloud PCs, setting up SSH keys, or funding your Stripe wallet. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const presetQuestions = [
    "How to connect to VPS via SSH?",
    "Explain GPU Cloud PC pricing",
    "How do I add wallet credits?",
    "Do you support Ubuntu 24.04?"
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqKey) {
      setError('AI chat is not configured. Set VITE_GROQ_API_KEY in your environment.');
      setIsTyping(false);
      return;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are HEXCloud AI Support, an expert system administrator and customer support engineer for HEXCloud cloud hosting SaaS.
              HEXCloud Specifications:
              1. Linux VPS Hosting:
                 - Basic: $10/mo (2 vCPU, 4GB RAM, 50GB NVMe storage, max 2 active instances).
                 - Pro: $25/mo (4 vCPU, 8GB RAM, 150GB NVMe storage, max 5 active instances).
                 - Customize: Select vCPUs, Memory, and Disk allocations directly in the Resource Estimator.
              2. GPU Cloud PC:
                 - Stream high-performance Windows PCs with dedicated graphics.
                 - GPU tiers: RTX 3080, RTX 4090, or NVIDIA A10G from $0.80/hour pay-as-you-go.
                 - Connect protocols: Sunshine + Moonlight, or Parsec at 4K 120 FPS.
                 - Session limits: Max 4 hours active session duration, with FIFO queue system if slots are full.
              3. Database Integration:
                 - Direct serverless connection using Supabase client.
                 - User tables synchronized automatically on authentication.
              4. Support Features:
                 - Community help on Discord for general users.
                 - 15-Minute SLA support response time for Developer Pro users.
                 - 24/7 custom admin logs and VM lifecycle power controls.
              Guidelines:
              - Solve user technical issues (SSH keys, Moonlight stream lag, Stripe credits).
              - Explain pricing simply.
              - Provide complete terminal command code blocks (e.g., SSH connect command template) where appropriate.
              - Keep responses highly technical, concise, friendly, and formatted in markdown.`
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: textToSend }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from Groq API');
      }

      const data = await response.json();
      const botResponse = data.choices[0]?.message?.content || "I couldn't process that query. Please try again.";

      setMessages((prev) => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (err: any) {
      console.error(err);
      setError("AI Service connection error. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I am your HEXCloud AI support system. Ask me about deploying VPS instances, configuring high-end GPU Cloud PCs, setting up SSH keys, or funding your Stripe wallet. How can I help you today?"
      }
    ]);
    setError(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-slate-800">
      <AnimatePresence>
        {/* Chat window panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-2">
                <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
                  <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">HEXCloud System AI</h3>
                  <span className="text-[10px] text-indigo-100 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active Support Bot</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  title="Reset Conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Render basic markdown inline spacing */}
                    <div className="whitespace-pre-line font-medium">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] flex items-center space-x-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Presets suggestions drawer */}
            {messages.length === 1 && (
              <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-1.5 justify-center">
                {presetQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1 hover:bg-indigo-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input form */}
            <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask AI support..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-600 font-medium"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all shadow-indigo-300 animate-pulse-glowing"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-600" />
          </div>
        )}
      </button>
    </div>
  );
};
