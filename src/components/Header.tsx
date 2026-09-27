import React from 'react';
import { NavigationTab, Stock } from '../types';
import { VianLogo } from './VianLogo';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  stocks: Stock[];
  availableMargin: number;
  activeBroker: string;
  onQuickOrderClick: () => void;
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  stocks,
  availableMargin,
  activeBroker,
  onQuickOrderClick,
  onOpenChat,
}) => {
  const navItems: Array<{ id: NavigationTab; label: string; highlight?: boolean }> = [
    { id: 'terminal', label: 'Terminal' },
    { id: 'optimizations', label: 'Market Optimizations', highlight: true },
    { id: 'fand-o', label: 'F&O Desk' },
    { id: 'baskets', label: 'Baskets' },
    { id: 'quant', label: 'Quant Lab' },
    { id: 'automation', label: 'Auto Bots' },
    { id: 'banking', label: 'Banking & Broker' },
    { id: 'admin', label: 'Admin RMS' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Real-time Indices & Ticker Tape Banner */}
      <div className="bg-slate-900 text-white text-[11px] font-mono px-4 py-1 flex items-center justify-between overflow-x-auto border-b border-slate-800 gap-4">
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">MARKETS LIVE</span>
          </div>
          {stocks.slice(0, 6).map((s) => (
            <div key={s.symbol} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-bold text-white">{s.symbol}</span>
              <span className="tabular-nums">
                {s.exchange === 'NASDAQ' ? '$' : '₹'}
                {s.price.toLocaleString()}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  s.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {s.changePercent >= 0 ? '+' : ''}
                {s.changePercent}%
              </span>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4 text-slate-400 shrink-0">
          <span>Broker: <strong className="text-emerald-400">{activeBroker} Active</strong></span>
          <span>·</span>
          <span>Exchange: <strong className="text-white">NSE / BSE / NASDAQ</strong></span>
        </div>
      </div>

      {/* Main Navigation Top Bar (3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Zone 1: Single text element brand mark */}
        <button
          onClick={() => onSelectTab('terminal')}
          className="flex items-center gap-2 cursor-pointer text-left shrink-0 focus:outline-none"
        >
          <VianLogo size="sm" showText={true} />
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-5 text-sm font-medium overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#001A8C] text-[#001A8C] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold uppercase">
                    SOR/Carry
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Margin Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Avail Margin
            </span>
            <span className="text-xs font-mono font-extrabold text-slate-900 tabular-nums">
              ₹{(availableMargin / 100000).toFixed(2)}L
            </span>
          </div>

          <button
            onClick={onOpenChat}
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Open Vian Quant AI Assistant"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          <button
            onClick={onQuickOrderClick}
            className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            + Buy / Sell
          </button>
        </div>
      </div>
    </header>
  );
};
