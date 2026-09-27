import React, { useState } from 'react';
import { AdminSettings } from '../types';

interface AdminConsoleProps {
  settings: AdminSettings;
  onUpdateSettings: (newSettings: AdminSettings) => void;
  onSquareOffAll: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  settings,
  onUpdateSettings,
  onSquareOffAll,
}) => {
  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Risk Management System (RMS) & Operations Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure firm-wide leverage parameters, circuit breakers, broker gateway API tokens, and emergency position halts.
          </p>
        </div>

        <button
          onClick={onSquareOffAll}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>🚨 Emergency Kill-Switch: Square Off All</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg font-mono">
          ✓ RMS Risk settings updated and deployed across all live broker gateways.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RMS Controls */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Risk & Margin Multipliers
          </h2>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-slate-700">Intraday (MIS) Leverage Multiplier</span>
              <span className="font-mono text-[#001A8C] font-bold">{localSettings.intradayLeverage}x Exposure</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={localSettings.intradayLeverage}
              onChange={(e) => setLocalSettings({ ...localSettings, intradayLeverage: parseFloat(e.target.value) })}
              className="w-full accent-[#001A8C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1x (No Leverage)</span>
              <span>3x (Standard)</span>
              <span>5x (SEBI Peak Maximum)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-slate-700">Max Account Loss Circuit Breaker</span>
              <span className="font-mono text-rose-600 font-bold">-{localSettings.maxDrawdownLimitPct}% Daily Loss</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={localSettings.maxDrawdownLimitPct}
              onChange={(e) => setLocalSettings({ ...localSettings, maxDrawdownLimitPct: parseFloat(e.target.value) })}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              If daily unrealized loss touches this limit, all positions automatically liquidate.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auto Square-Off Time
              </label>
              <select
                value={localSettings.autoSquareOffTime}
                onChange={(e) => setLocalSettings({ ...localSettings, autoSquareOffTime: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] bg-white font-mono"
              >
                <option value="15:10 IST">15:10 IST (Safe Buffer)</option>
                <option value="15:15 IST">15:15 IST (Standard NSE)</option>
                <option value="15:20 IST">15:20 IST (Late Settlement)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brokerage Fee per Executed Order
              </label>
              <input
                type="number"
                value={localSettings.brokeragePerOrder}
                onChange={(e) => setLocalSettings({ ...localSettings, brokeragePerOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.circuitBreakerEnabled}
                onChange={(e) => setLocalSettings({ ...localSettings, circuitBreakerEnabled: e.target.checked })}
                className="w-4 h-4 text-[#001A8C] rounded border-slate-300 focus:ring-[#001A8C] cursor-pointer"
              />
              <div className="text-xs">
                <strong className="text-slate-900 block font-bold">Automated Circuit Breaker Guard</strong>
                <span className="text-slate-500">Prevent freak trade executions during market flash crashes.</span>
              </div>
            </label>
          </div>
        </div>

        {/* API Gateway & Infrastructure */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Broker API Gateways & Webhook Security
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Gateway Routing Pipeline
              </label>
              <input
                type="text"
                value={localSettings.brokerApiGateway}
                onChange={(e) => setLocalSettings({ ...localSettings, brokerApiGateway: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-[11px] text-slate-400">
                <span>GATEWAY SYSTEM HEALTH</span>
                <span className="text-emerald-400">PULSE: 12ms</span>
              </div>
              <div className="flex justify-between">
                <span>5paisa Open API Connector:</span>
                <span className="text-emerald-400 font-bold">ONLINE (HTTP 200)</span>
              </div>
              <div className="flex justify-between">
                <span>Zerodha Kite Connect:</span>
                <span className="text-emerald-400 font-bold">ONLINE (Websocket)</span>
              </div>
              <div className="flex justify-between">
                <span>NASDAQ Direct Market Access:</span>
                <span className="text-emerald-400 font-bold">ONLINE (FIX 4.4)</span>
              </div>
              <div className="flex justify-between">
                <span>SEBI Order Audit Trail:</span>
                <span className="text-sky-400 font-bold">ENCRYPTED</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save RMS Parameters & Sync Gateways →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
