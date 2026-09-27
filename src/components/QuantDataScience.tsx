import React, { useState, useEffect } from 'react';
import { BacktestResult } from '../types';

export const QuantDataScience: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('RSI Mean Reversion');
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY 50');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [loading, setLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: selectedStrategy,
          symbol: selectedSymbol,
          timeframe: selectedTimeframe,
        }),
      });
      const data = await res.json();
      setBacktestResult(data);
    } catch (err) {
      console.error('Error running backtest:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBacktest();
  }, [selectedStrategy, selectedSymbol, selectedTimeframe]);

  // Render Equity Curve Chart
  const renderEquityChart = () => {
    if (!backtestResult || !backtestResult.equityCurve || backtestResult.equityCurve.length === 0) return null;

    const width = 640;
    const height = 240;
    const paddingX = 45;
    const paddingY = 25;

    const equities = backtestResult.equityCurve.map((e) => e.equity);
    const benchmarks = backtestResult.equityCurve.map((e) => e.benchmark);
    const minVal = Math.min(...equities, ...benchmarks) * 0.95;
    const maxVal = Math.max(...equities, ...benchmarks) * 1.05;

    const steps = backtestResult.equityCurve.length;

    const toX = (idx: number) => paddingX + (idx / (steps - 1)) * (width - paddingX * 2);
    const toY = (val: number) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - paddingY * 2);

    const algoPoints = backtestResult.equityCurve.map((e, idx) => ({ x: toX(idx), y: toY(e.equity) }));
    const benchmarkPoints = backtestResult.equityCurve.map((e, idx) => ({ x: toX(idx), y: toY(e.benchmark) }));

    const algoPath = algoPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');
    const benchPath = benchmarkPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');

    return (
      <svg className="w-full h-60 select-none" viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((pct, i) => (
          <line
            key={i}
            x1={paddingX}
            y1={paddingY + pct * (height - paddingY * 2)}
            x2={width - paddingX}
            y2={paddingY + pct * (height - paddingY * 2)}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
        ))}

        {/* Benchmark line */}
        <path d={benchPath} fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="3 3" />

        {/* Algo strategy equity curve */}
        <path d={algoPath} fill="none" stroke="#10b981" strokeWidth="2.8" />

        {/* Ending value markers */}
        <circle cx={algoPoints[steps - 1].x} cy={algoPoints[steps - 1].y} r="5" fill="#10b981" />
        <circle cx={benchmarkPoints[steps - 1].x} cy={benchmarkPoints[steps - 1].y} r="4" fill="#94a3b8" />

        {/* Labels */}
        <text x={paddingX} y={height - 6} fontSize="10" fill="#64748b">
          Start: ₹1,00,000
        </text>
        <text x={width - paddingX} y={algoPoints[steps - 1].y - 8} fontSize="11" fill="#10b981" fontWeight="bold" textAnchor="end" className="font-mono">
          Strategy Final: ₹{equities[steps - 1]?.toLocaleString()}
        </text>
        <text x={width - paddingX} y={benchmarkPoints[steps - 1].y + 14} fontSize="10" fill="#64748b" textAnchor="end" className="font-mono">
          Buy & Hold: ₹{benchmarks[steps - 1]?.toLocaleString()}
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Algorithmic Trading & Quantitative Data Science Lab
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Backtest high-frequency quantitative models, test machine learning trend classifiers, and analyze risk-adjusted Sharpe performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Model Parameters */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Backtest Strategy Configuration
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Algorithmic Model
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none bg-white text-slate-800 font-semibold"
            >
              <option value="RSI Mean Reversion">RSI Mean Reversion (14-Period Extreme)</option>
              <option value="Dual Moving Average Crossover">Dual EMA Crossover (20 / 50)</option>
              <option value="Bollinger Volatility Breakout">Bollinger Volatility Squeeze Breakout</option>
              <option value="ML Random Forest Trend Classifier">ML Random Forest Trend Classifier</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Universe
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none bg-white text-slate-800 font-mono"
              >
                <option value="NIFTY 50">NIFTY 50 (NSE)</option>
                <option value="BANKNIFTY">BANKNIFTY (NSE)</option>
                <option value="NVDA">NVDA (NASDAQ)</option>
                <option value="RELIANCE">RELIANCE (NSE)</option>
                <option value="TSLA">TSLA (NASDAQ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tick Candlestick Timeframe
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none bg-white text-slate-800 font-mono"
              >
                <option value="5m">5 Minutes (Intraday)</option>
                <option value="15m">15 Minutes (Swing)</option>
                <option value="1D">1 Day (Positional)</option>
              </select>
            </div>
          </div>

          {backtestResult && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <strong className="text-slate-900 block font-bold">Model Logic:</strong>
              <p className="leading-relaxed">{backtestResult.description}</p>
            </div>
          )}

          <button
            onClick={runBacktest}
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Simulating Strategy Ticks...</span>
              </>
            ) : (
              <span>Re-run Algorithmic Backtest</span>
            )}
          </button>
        </div>

        {/* Right: Equity Curve & Performance Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {backtestResult && (
            <>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Cumulative Strategy Equity Growth Curve
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Starting capital ₹1,00,000 backtested across {backtestResult.totalTrades} historical trades
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Net Profit: +{backtestResult.netProfitPercent}%
                  </span>
                </div>

                <div className="pt-2">
                  {renderEquityChart()}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-emerald-500 inline-block"></span> Strategy Alpha
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-slate-400 inline-block"></span> Benchmark (Buy & Hold)
                  </span>
                </div>
              </div>

              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                    Win Rate
                  </span>
                  <strong className="text-lg font-extrabold text-emerald-600 font-mono">
                    {backtestResult.winRate}%
                  </strong>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                    Profit Factor
                  </span>
                  <strong className="text-lg font-extrabold text-slate-900 font-mono">
                    {backtestResult.profitFactor}x
                  </strong>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                    Max Drawdown
                  </span>
                  <strong className="text-lg font-extrabold text-rose-600 font-mono">
                    -{backtestResult.maxDrawdown}%
                  </strong>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                    Sharpe Ratio
                  </span>
                  <strong className="text-lg font-extrabold text-[#001A8C] font-mono">
                    {backtestResult.sharpeRatio}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
