import React, { useState } from 'react';
import { TradingBot } from '../types';

interface AutomationBotsProps {
  bots: TradingBot[];
  onToggleBot: (botId: string) => void;
  onCreateBot: (bot: Omit<TradingBot, 'id' | 'pnl' | 'tradesToday'>) => void;
}

export const AutomationBots: React.FC<AutomationBotsProps> = ({
  bots,
  onToggleBot,
  onCreateBot,
}) => {
  const [newBotName, setNewBotName] = useState('');
  const [newBotStrategy, setNewBotStrategy] = useState<TradingBot['strategyType']>('Options Scalper');
  const [newBotTarget, setNewBotTarget] = useState('NIFTY 50 Options');
  const [newBotRule, setNewBotRule] = useState('Buy 100 Qty ATM CE when RSI(14) > 65 and Price > VWAP.');

  const [botLogs, setBotLogs] = useState([
    { id: '1', time: '09:20:00', bot: 'Delta-Neutral Straddle', message: 'Executed sell order for 25250 CE & PE at ₹226 combo premium.', level: 'success' },
    { id: '2', time: '10:14:22', bot: 'Options Gamma Scalper', message: 'BankNifty 3-min breakout detected. Scalp long 52200 CE filled at ₹112.4.', level: 'info' },
    { id: '3', time: '11:05:40', bot: 'Options Gamma Scalper', message: 'Trailing stoploss triggered at target +18%. Position squared off. Profit: +₹4,500.', level: 'success' },
    { id: '4', time: '12:30:15', bot: 'Delta-Neutral Straddle', message: 'Net Delta shifted to +0.18. Auto-rebalanced: Shifting CE strike to 25300.', level: 'info' },
  ]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName) return;
    onCreateBot({
      name: newBotName,
      strategyType: newBotStrategy,
      targetIndex: newBotTarget,
      ruleCondition: newBotRule,
      status: 'RUNNING',
    });
    setNewBotName('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Algorithmic Trading Bots & Automation Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deploy low-latency execution bots, automated delta-neutral hedging loops, and conditional event triggers.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          Algo Engine: Low-Latency Active
        </span>
      </div>

      {/* Active Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {bots.map((bot) => {
          const isRunning = bot.status === 'RUNNING';
          return (
            <div
              key={bot.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {bot.strategyType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                      }`}
                    ></span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        isRunning ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {bot.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {bot.name}
                </h3>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  Target: <strong className="text-slate-800">{bot.targetIndex}</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 mt-3 font-mono leading-relaxed">
                  {bot.ruleCondition}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Today's P&L</span>
                    <strong className="text-emerald-600 font-extrabold text-sm">
                      +₹{bot.pnl.toLocaleString()}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Trades Today</span>
                    <strong className="text-slate-900 font-bold">{bot.tradesToday}</strong>
                  </div>
                </div>

                <button
                  onClick={() => onToggleBot(bot.id)}
                  className={`w-full py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    isRunning
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isRunning ? 'Pause Algorithmic Bot' : 'Resume Bot Execution'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bot Creator & Execution Log Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Creator Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Configure New Conditional Trading Bot
          </h2>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bot Identifier Name
              </label>
              <input
                type="text"
                required
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                placeholder="e.g. Nifty Opening Range Breakout"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Strategy Archetype
                </label>
                <select
                  value={newBotStrategy}
                  onChange={(e) => setNewBotStrategy(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none bg-white font-medium"
                >
                  <option value="Options Scalper">Options Scalper</option>
                  <option value="Delta-Neutral">Delta-Neutral Straddle</option>
                  <option value="VWAP Momentum">VWAP Momentum</option>
                  <option value="Breakout">Volatility Breakout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Instrument
                </label>
                <input
                  type="text"
                  value={newBotTarget}
                  onChange={(e) => setNewBotTarget(e.target.value)}
                  placeholder="e.g. BANKNIFTY 0DTE"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trigger Rule Specification
              </label>
              <textarea
                rows={3}
                required
                value={newBotRule}
                onChange={(e) => setNewBotRule(e.target.value)}
                placeholder="e.g. If 15m candle closes > 200 EMA and volume > 1.5x avg, enter Long with 20pt Stoploss..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Deploy Algorithmic Rule Bot →
            </button>
          </form>
        </div>

        {/* Live Execution Stream */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-md flex flex-col justify-between text-slate-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live Execution & Webhook Audit Console
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Gateway: 5paisa / NSE Direct</span>
            </div>

            <div className="my-4 h-64 overflow-y-auto space-y-2 font-mono text-xs pr-1">
              {botLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-900 rounded border border-slate-800/80 leading-relaxed">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>[{log.time}]</span>
                    <span className="text-sky-400 font-bold uppercase">{log.bot}</span>
                  </div>
                  <div className={log.level === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Automated Safety Check: Zero Slip Execution</span>
            <span className="text-emerald-400">Status: Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
