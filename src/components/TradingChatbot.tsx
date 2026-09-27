import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Stock } from '../types';

interface TradingChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: (action: any) => void;
  stocks: Stock[];
  availableCash: number;
}

export const TradingChatbot: React.FC<TradingChatbotProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
  stocks,
  availableCash,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### ⚡ Vian Quant AI Copilot & Autonomous Trading Agent
I can answer market questions, analyze option Greeks, and **execute automated tasks directly on your terminal**:

Try asking or commanding:
- *"Buy 20 shares of Reliance at market"*
- *"Deploy Iron Condor strategy on Nifty"*
- *"Run algorithmic backtest on RSI strategy"*
- *"Square off all my open positions"*
- *"Check 5paisa broker status & margin"*`,
      timestamp: 'Just now',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

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
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          accountContext: {
            availableCash,
            activeSymbols: stocks.map((s) => s.symbol),
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Execution command processed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If server returned an executable task action, invoke the handler!
      if (data.action) {
        onExecuteAction(data.action);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Error: Unable to connect to Vian Quant AI engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-[#001A8C] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <h3 className="text-xs font-bold leading-none">Vian Quant AI Copilot</h3>
            <span className="text-[10px] text-sky-200 font-mono">Autonomous Execution Agent</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-slate-200 text-lg leading-none cursor-pointer p-1"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#001A8C] text-white'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
              }`}
            >
              <div className="prose prose-sm max-w-none whitespace-pre-line text-xs">
                {msg.content}
              </div>

              {msg.action && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 font-bold">
                  <span>✓ Action Triggered:</span>
                  <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {msg.action.action}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <div className="w-3.5 h-3.5 border-2 border-[#001A8C] border-t-transparent rounded-full animate-spin"></div>
              <span>Processing command & market levels...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 font-mono">
        <button
          onClick={() => handleSendMessage('Buy 25 shares of RELIANCE at market')}
          className="whitespace-nowrap px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
        >
          Buy 25 RELIANCE
        </button>
        <button
          onClick={() => handleSendMessage('Deploy Iron Condor on Nifty')}
          className="whitespace-nowrap px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
        >
          Iron Condor
        </button>
        <button
          onClick={() => handleSendMessage('Run backtest on RSI strategy')}
          className="whitespace-nowrap px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
        >
          Run Backtest
        </button>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
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
            placeholder="Type query or command (e.g. 'buy 10 NVDA')..."
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] disabled:opacity-50 rounded-lg cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
