import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface AIAdvisorProps {
  initialPrompt?: string;
  initialPersona?: 'strategy' | 'risk' | 'deals' | 'sales';
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  initialPrompt = '',
  initialPersona = 'strategy',
}) => {
  const [persona, setPersona] = useState<'strategy' | 'risk' | 'deals' | 'sales'>(initialPersona);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to Vian Capital Intelligence Suite (AI & ML Advisory)
I am your **Institutional Financial Intelligence & Autonomous Advisory Agent**, connected to real-time quantitative algorithms and regulatory frameworks.

Select an executive persona above or try queries such as:
- **Strategy:** *"Analyze macro asset allocation strategy for Vian Growth Fund II under rising rate expectations"*
- **Risk:** *"Perform a portfolio stress test assuming a 15% tech sector drawdown and 75 bps rate shock"*
- **Deals & M&A:** *"Draft an Investment Committee thesis for a ₹45 Cr Series B stake in enterprise AI at 7x ARR"*
- **Sales & IR:** *"Generate a high-impact executive summary for an offshore Family Office considering our AIF Cat II"*`,
      timestamp: 'Just now',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const personaDetails = {
    strategy: {
      name: 'Chief Investment Strategist',
      tagline: 'Macro Asset Allocation, Fund Economics & Yield Structuring',
      badge: 'Macro & Asset Allocation',
    },
    risk: {
      name: 'Head of Quantitative Risk & Compliance',
      tagline: 'Value-at-Risk (VaR), Stress Testing & Regulatory Audits',
      badge: 'Risk & SEBI Compliance',
    },
    deals: {
      name: 'Deal Origination & M&A Director',
      tagline: 'Enterprise Valuations, LBO Multiples & Term Sheet Covenants',
      badge: 'Deal Origination & IC',
    },
    sales: {
      name: 'Institutional Investor Relations & Sales',
      tagline: 'LP Pitch Synthesis, Capital Drawdowns & Co-Investment Allocations',
      badge: 'Institutional IR & Sales',
    },
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          persona,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply = data.response || 'Unable to generate institutional advisory output.';

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: Unable to connect to Vian Capital AI gateway.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vian-capital-memo-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vian Capital AI & ML Financial Intelligence Advisory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Autonomous multi-agent intelligence specializing in macro strategies, risk quantification, deal memos, and investor communications.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto self-start sm:self-auto border border-slate-200">
          {(['strategy', 'risk', 'deals', 'sales'] as const).map((pKey) => {
            const isSelected = persona === pKey;
            return (
              <button
                key={pKey}
                onClick={() => setPersona(pKey)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#001A8C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {pKey === 'strategy'
                  ? 'Macro Strategy'
                  : pKey === 'risk'
                  ? 'Risk & Audit'
                  : pKey === 'deals'
                  ? 'Deal Origination'
                  : 'Institutional IR'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Advisory Chat Interface */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 flex flex-col h-[650px] shadow-sm overflow-hidden">
          {/* Active Persona Banner */}
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <span className="text-xs font-bold text-slate-900">
                  {personaDetails[persona].name}
                </span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-[11px] text-slate-500">
                  {personaDetails[persona].tagline}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'reset',
                    role: 'assistant',
                    content: 'Advisory session reset. Ready for your strategic financial prompt.',
                    timestamp: 'Just now',
                  },
                ])
              }
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear Session
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-200/50 text-[11px] opacity-75">
                    <span className="font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? 'Executive Inquiry' : 'Vian Capital Advisory Output'}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="prose prose-sm max-w-none space-y-2 whitespace-pre-line font-normal">
                    {msg.content}
                  </div>

                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(msg.content)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                        >
                          Copy Output
                        </button>
                        <button
                          onClick={() => downloadReport(msg.content)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                        >
                          Download Memo (.md)
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Model: Gemini 3.8 Flash
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-[#001A8C] border-t-transparent rounded-full animate-spin"></div>
                  <span>Vian Capital AI analyzing macroeconomic indicators & financial matrices...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about macro thesis, portfolio stress, deal multiples, or LP pitch..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] focus:border-[#001A8C]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="px-4 py-2.5 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Execute Analysis
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Pre-Configured Prompt Templates */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Institutional Prompt Library
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  label: 'Macro Fund Allocation Thesis',
                  p: 'strategy' as const,
                  query: 'Evaluate optimal capital allocation between private credit and growth equity for a ₹500 Cr AIF tranche under sticky inflation.',
                },
                {
                  label: 'Portfolio VaR & Stress Test',
                  p: 'risk' as const,
                  query: 'Run a stress test simulation analyzing a 200 bps sovereign rate shock and credit spread widening across our senior secured loans.',
                },
                {
                  label: 'Investment Committee Deal Memo',
                  p: 'deals' as const,
                  query: 'Draft an IC evaluation memo for a ₹60 Cr Series B investment in clean energy microgrid infrastructure with 9.4x EBITDA multiple.',
                },
                {
                  label: 'Family Office LP Pitch Brief',
                  p: 'sales' as const,
                  query: 'Synthesize a co-investment pitch deck overview for an institutional family office outlining our 24.8% net IRR track record.',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPersona(item.p);
                    handleSendMessage(item.query);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#001A8C] hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 group-hover:text-[#001A8C]">
                      {item.label}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {item.p}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {item.query}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Quantitative Architecture
            </h3>
            <p>
              Integrated with Vian Capital’s internal valuation matrices, SEBI AIF regulatory guidelines, and Monte Carlo probability engines.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Security: AES-256 Encrypted</span>
              <span>Latency: &lt; 720ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
