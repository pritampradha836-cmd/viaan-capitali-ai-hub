import React, { useState } from 'react';
import { OptionStrike } from '../types';

interface FandODeskProps {
  optionChain: OptionStrike[];
  spotPrice: number;
  onDeployStrategy: (name: string, legs: any[]) => void;
}

export const FandODesk: React.FC<FandODeskProps> = ({
  optionChain,
  spotPrice,
  onDeployStrategy,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'Iron Condor' | 'Short Straddle' | 'Bull Call Spread' | 'Long Straddle'>('Iron Condor');
  const [expiryDate, setExpiryDate] = useState('29-OCT-2026 (Monthly Expiry)');
  const [lotCount, setLotCount] = useState(2); // 50 shares per lot in Nifty

  // Strategy payoff calculations
  const calculatePayoff = () => {
    switch (selectedStrategy) {
      case 'Iron Condor':
        return {
          maxProfit: Math.round(180 * lotCount * 50),
          maxLoss: Math.round(320 * lotCount * 50),
          breakevenLow: 25020,
          breakevenHigh: 25480,
          probProfit: '78.4%',
          netCreditDebit: 'Net Credit: ₹18,000',
        };
      case 'Short Straddle':
        return {
          maxProfit: Math.round(226 * lotCount * 50),
          maxLoss: 'Unlimited (Undefined Risk)',
          breakevenLow: 25024,
          breakevenHigh: 25476,
          probProfit: '62.0%',
          netCreditDebit: 'Net Credit: ₹22,600',
        };
      case 'Bull Call Spread':
        return {
          maxProfit: Math.round(150 * lotCount * 50),
          maxLoss: Math.round(50 * lotCount * 50),
          breakevenLow: 25280,
          breakevenHigh: 25400,
          probProfit: '56.2%',
          netCreditDebit: 'Net Debit: ₹5,000',
        };
      case 'Long Straddle':
        return {
          maxProfit: 'Unlimited',
          maxLoss: Math.round(226 * lotCount * 50),
          breakevenLow: 25024,
          breakevenHigh: 25476,
          probProfit: '38.0%',
          netCreditDebit: 'Net Debit: ₹22,600',
        };
    }
  };

  const payoff = calculatePayoff();

  // Render Payoff Diagram SVG
  const renderPayoffDiagram = () => {
    const width = 640;
    const height = 220;
    const paddingX = 40;
    const paddingY = 25;
    const midY = height / 2;

    return (
      <svg className="w-full h-56 select-none" viewBox={`0 0 ${width} ${height}`}>
        {/* Zero P&L Axis */}
        <line x1={paddingX} y1={midY} x2={width - paddingX} y2={midY} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={paddingX} y={midY - 6} fontSize="10" fill="#64748b" fontWeight="bold">₹0 P&L</text>

        {/* Spot Price Vertical Line */}
        <line x1={width / 2} y1={paddingY} x2={width / 2} y2={height - paddingY} stroke="#001A8C" strokeWidth="1.5" strokeDasharray="2 2" />
        <text x={width / 2} y={paddingY - 8} fontSize="10" fill="#001A8C" fontWeight="bold" textAnchor="middle">
          Spot: {spotPrice}
        </text>

        {/* Payoff line depending on strategy */}
        {selectedStrategy === 'Iron Condor' && (
          <path
            d={`M ${paddingX} ${midY + 50} L ${paddingX + 120} ${midY + 50} L ${width / 2 - 80} ${midY - 45} L ${width / 2 + 80} ${midY - 45} L ${width - paddingX - 120} ${midY + 50} L ${width - paddingX} ${midY + 50}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.8"
          />
        )}

        {selectedStrategy === 'Short Straddle' && (
          <path
            d={`M ${paddingX} ${height - paddingY} L ${width / 2} ${paddingY + 20} L ${width - paddingX} ${height - paddingY}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.8"
          />
        )}

        {selectedStrategy === 'Bull Call Spread' && (
          <path
            d={`M ${paddingX} ${midY + 35} L ${width / 2 - 40} ${midY + 35} L ${width / 2 + 80} ${midY - 45} L ${width - paddingX} ${midY - 45}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.8"
          />
        )}

        {selectedStrategy === 'Long Straddle' && (
          <path
            d={`M ${paddingX} ${paddingY + 10} L ${width / 2} ${height - paddingY - 15} L ${width - paddingX} ${paddingY + 10}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.8"
          />
        )}

        {/* Labels for Breakeven */}
        <text x={paddingX + 120} y={height - 6} fontSize="10" fill="#64748b" textAnchor="middle">
          Lower BE: {payoff.breakevenLow}
        </text>
        <text x={width - paddingX - 120} y={height - 6} fontSize="10" fill="#64748b" textAnchor="middle">
          Upper BE: {payoff.breakevenHigh}
        </text>
      </svg>
    );
  };

  const handleDeploy = () => {
    onDeployStrategy(selectedStrategy, [
      { strike: 25250, type: 'CE', qty: lotCount * 50 },
      { strike: 25250, type: 'PE', qty: lotCount * 50 },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: F&O Market Status */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <span>DERIVATIVES DESK</span>
            <span>·</span>
            <span>NIFTY 50 OPTIONS (WEEKLY & MONTHLY)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Futures & Options (F&O) Algorithmic Strategy Builder
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live Greeks quantification (Delta, Theta, Gamma, Vega), Open Interest distribution, and multi-leg risk-defined spread execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none"
          >
            <option value="29-OCT-2026 (Monthly Expiry)">29-OCT-2026 (Monthly)</option>
            <option value="05-NOV-2026 (Weekly Expiry)">05-NOV-2026 (Weekly)</option>
            <option value="12-NOV-2026 (Weekly Expiry)">12-NOV-2026 (Weekly)</option>
          </select>
        </div>
      </div>

      {/* Strategy Builder & Payoff Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Strategy Presets & Configuration */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Multi-Leg Strategy Presets
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {(['Iron Condor', 'Short Straddle', 'Bull Call Spread', 'Long Straddle'] as const).map((strat) => (
              <button
                key={strat}
                onClick={() => setSelectedStrategy(strat)}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedStrategy === strat
                    ? 'bg-blue-50 border-[#001A8C] text-[#001A8C]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {strat}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1 font-semibold">
                <span className="text-slate-700">Contract Quantity (Lots)</span>
                <span className="font-mono text-[#001A8C] font-bold">{lotCount} Lots ({lotCount * 50} Qty)</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={lotCount}
                onChange={(e) => setLotCount(parseInt(e.target.value))}
                className="w-full accent-[#001A8C] cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Max Profit:</span>
                <strong className="text-emerald-600">
                  {typeof payoff.maxProfit === 'number' ? `₹${payoff.maxProfit.toLocaleString()}` : payoff.maxProfit}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Loss:</span>
                <strong className="text-rose-600">
                  {typeof payoff.maxLoss === 'number' ? `₹${payoff.maxLoss.toLocaleString()}` : payoff.maxLoss}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Probability of Profit (PoP):</span>
                <strong className="text-slate-900">{payoff.probProfit}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Strategy Premium:</span>
                <strong className="text-[#001A8C]">{payoff.netCreditDebit}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeploy}
            className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Deploy {selectedStrategy} Order ({lotCount} Lots) →
          </button>
        </div>

        {/* Right: Dynamic Payoff Curve Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Expiry Payoff Projection: {selectedStrategy}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual P&L distribution at contract expiration relative to underlying spot index
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                PoP: {payoff.probProfit}
              </span>
            </div>

            <div className="pt-2">
              {renderPayoffDiagram()}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Automated Delta & Theta Decay Hedging</span>
            <span className="text-[#001A8C] font-semibold">Margin Benefit: 68% Margin Release</span>
          </div>
        </div>
      </div>

      {/* Live Option Chain Table with Greeks & OI */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              NIFTY 50 Live Option Chain & Greek Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive Open Interest, IV, Delta, and Theta matrix for ATM & OTM strikes
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-600">Spot: <strong className="text-slate-900">{spotPrice}</strong></span>
            <span>·</span>
            <span className="text-slate-600">PCR: <strong className="text-emerald-600">1.14 (Bullish)</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold font-mono text-[11px]">
                {/* Calls Header */}
                <th colSpan={5} className="py-2 px-3 bg-emerald-50/60 border-r border-slate-200 text-emerald-800">
                  CALL OPTIONS (CE)
                </th>
                {/* Strike */}
                <th className="py-2 px-4 bg-slate-200 text-slate-900">STRIKE</th>
                {/* Puts Header */}
                <th colSpan={5} className="py-2 px-3 bg-rose-50/60 border-l border-slate-200 text-rose-800">
                  PUT OPTIONS (PE)
                </th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-mono">
                <th className="py-2 px-2 text-right">OI</th>
                <th className="py-2 px-2 text-right">IV%</th>
                <th className="py-2 px-2 text-right">Delta</th>
                <th className="py-2 px-2 text-right">Theta</th>
                <th className="py-2 px-2 text-right border-r border-slate-200">CALL LTP</th>

                <th className="py-2 px-3 font-bold text-slate-900 bg-slate-100">STRIKE</th>

                <th className="py-2 px-2 text-left border-l border-slate-200">PUT LTP</th>
                <th className="py-2 px-2 text-left">Delta</th>
                <th className="py-2 px-2 text-left">Theta</th>
                <th className="py-2 px-2 text-left">IV%</th>
                <th className="py-2 px-2 text-left">OI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {optionChain.map((row) => {
                const isAtm = row.strike === 25250;
                return (
                  <tr
                    key={row.strike}
                    className={`hover:bg-slate-50 transition-colors ${
                      isAtm ? 'bg-amber-50/60 font-semibold' : ''
                    }`}
                  >
                    {/* Call Columns */}
                    <td className="py-2.5 px-2 text-right text-slate-600">{row.callOi.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{row.callIv}%</td>
                    <td className="py-2.5 px-2 text-right text-emerald-600">{row.callDelta}</td>
                    <td className="py-2.5 px-2 text-right text-rose-500">{row.callTheta}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 border-r border-slate-200">
                      ₹{row.callLtp}
                    </td>

                    {/* Strike Center */}
                    <td
                      className={`py-2.5 px-4 font-bold text-slate-900 ${
                        isAtm ? 'bg-amber-200/60 text-[#001A8C]' : 'bg-slate-50'
                      }`}
                    >
                      {row.strike} {isAtm ? '· ATM' : ''}
                    </td>

                    {/* Put Columns */}
                    <td className="py-2.5 px-2 text-left font-bold text-slate-900 border-l border-slate-200">
                      ₹{row.putLtp}
                    </td>
                    <td className="py-2.5 px-2 text-left text-rose-600">{row.putDelta}</td>
                    <td className="py-2.5 px-2 text-left text-rose-500">{row.putTheta}</td>
                    <td className="py-2.5 px-2 text-left text-slate-500">{row.putIv}%</td>
                    <td className="py-2.5 px-2 text-left text-slate-600">{row.putOi.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
