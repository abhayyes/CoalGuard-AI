import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Globe,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  ClipboardList,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { aiService } from '../../lib/aiApi';
import { useMineStore } from '../../stores/mineStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickActions?: { label: string; action_type: string; payload: string }[];
}

export const AssistantModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'auto' | 'en' | 'hi'>('auto');
  const { selectedMine } = useMineStore();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Welcome to **CoalGuard AI Copilot**!\n\nI can analyze statutory compliance, uncover high-risk hazards, and summarize DGMS field inspections in English and **हिन्दी**.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '⚠️ Overdue Compliance', action_type: 'query', payload: 'Show overdue compliance items' },
        { label: '🚨 High Risk Hazards', action_type: 'query', payload: 'Which mines have high-risk observations?' },
        { label: '📋 Recent Inspections', action_type: 'query', payload: 'Show recent inspections' },
        { label: '🇮🇳 हिन्दी में सारांश', action_type: 'query', payload: 'खदान की वर्तमान स्थिति और जोखिम का सारांश दें' },
      ],
    },
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || inputMessage.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputMessage('');
    setLoading(true);

    try {
      const res = await apiClient.post('/assistant/chat', {
        message: textToSend,
        language: language,
        mine_id: selectedMine?.id,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: res.data.quick_actions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Assistant error:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ I encountered an error connecting to the governance analytics engine. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (qa: { label: string; action_type: string; payload: string }) => {
    if (qa.action_type === 'navigate') {
      navigate(qa.payload);
      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    } else if (qa.action_type === 'query') {
      handleSendMessage(qa.payload);
    }
  };

  return (
    <>
      {/* Floating Copilot Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-gentle">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl font-black text-xs text-coal transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 group"
          style={{
            background: 'linear-gradient(135deg, #FFC0CB 0%, #FFD6DC 50%, #FFF0F3 100%)',
            boxShadow: '0 10px 30px rgba(255,192,203,0.45), 0 0 0 1px rgba(255,255,255,0.8)',
          }}
        >
          <div className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-coal" />
          </div>
          <span className="tracking-tight font-black uppercase text-[11px]">AI Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col ${
            isExpanded
              ? 'bottom-4 right-4 left-4 sm:left-auto sm:w-[650px] h-[85vh]'
              : 'bottom-20 right-6 w-[92vw] sm:w-[420px] h-[550px]'
          } rounded-3xl overflow-hidden animate-scale-in`}
          style={{
            background: 'rgba(253,248,251,0.96)',
            border: '1px solid rgba(255,192,203,0.3)',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,192,203,0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between border-b"
            style={{
              background: 'linear-gradient(to right, rgba(255,192,203,0.2), rgba(255,214,220,0.1))',
              borderColor: 'rgba(255,192,203,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-pink-sm"
                style={{ background: 'linear-gradient(135deg, #FFC0CB, #F9B8C3)' }}
              >
                <Bot className="w-4 h-4 text-coal" />
              </div>
              <div>
                <h3 className="text-xs font-black text-coal flex items-center gap-1.5">
                  CoalGuard Conversational AI
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">
                    Multilingual
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {selectedMine ? `Context: ${selectedMine.name}` : 'Multi-Mine Autonomous Copilot'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Selector */}
              <div className="flex items-center bg-white/70 border border-pink-100 rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setLanguage('auto')}
                  className={`px-1.5 py-0.5 rounded ${language === 'auto' ? 'bg-pink-200 text-coal' : 'text-slate-500'}`}
                >
                  Auto
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-pink-200 text-coal' : 'text-slate-500'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-pink-200 text-coal' : 'text-slate-500'}`}
                >
                  हिन्दी
                </button>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-coal hover:bg-pink-100/50 transition-colors hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-coal hover:bg-pink-100/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)' }}
                  >
                    <Bot className="w-3.5 h-3.5 text-coal" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-coal text-white rounded-tr-sm'
                        : 'bg-white/80 border border-pink-100 text-coal shadow-sm rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>
                    <div
                      className={`text-[9px] mt-1.5 font-bold ${
                        m.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {/* Quick Action Chips */}
                  {m.quickActions && m.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(qa)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all duration-150 active:scale-95"
                          style={{
                            background: 'rgba(255,192,203,0.18)',
                            color: '#8A4A58',
                            border: '1px solid rgba(255,192,203,0.3)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.35)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.18)')}
                        >
                          {qa.label}
                          {qa.action_type === 'navigate' && <ArrowRight className="w-2.5 h-2.5 ml-0.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-coal flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                <span>CoalGuard AI is searching statutory database...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <div
            className="p-3 border-t bg-white/50 flex items-center gap-2"
            style={{ borderColor: 'rgba(255,192,203,0.2)' }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                language === 'hi'
                  ? 'अनुपालन या सुरक्षा के बारे में पूछें...'
                  : 'Ask about compliance, hazard risks, inspections...'
              }
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white border border-pink-100 text-coal placeholder:text-slate-300 focus:outline-none focus:border-pink-300 transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-xl text-coal transition-all disabled:opacity-40 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)',
                boxShadow: '0 2px 8px rgba(255,192,203,0.4)',
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
