import React, { useState, useEffect } from 'react';
import { MonteCarloResult, EfficientFrontierResult } from '../types';

export const DataScienceLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monte-carlo' | 'efficient-frontier' | 'valuation'>('monte-carlo');

  // Monte Carlo parameters
  const [initialAum, setInitialAum] = useState<number>(1000); // ₹1000 Cr
  const [expectedReturn, setExpectedReturn] = useState<number>(18);
  const [volatility, setVolatility] = useState<number>(15);
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(5);
  const [mcLoading, setMcLoading] = useState<boolean>(false);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);

  // Efficient Frontier parameters
  const [equityWeight, setEquityWeight] = useState<number>(35);
  const [creditWeight, setCreditWeight] = useState<number>(35);
  const [realAssetsWeight, setRealAssetsWeight] = useState<number>(15);
  const [debtWeight, setDebtWeight] = useState<number>(10);
  const [ventureWeight, setVentureWeight] = useState<number>(5);
  const [efResult, setEfResult] = useState<EfficientFrontierResult | null>(null);

  const fetchMonteCarlo = async () => {
    setMcLoading(true);
    try {
      const res = await fetch('/api/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialAum,
          expectedReturn,
          volatility,
          timeHorizonYears,
          simulations: 500,
        }),
      });
      const data = await res.json();
      setMcResult(data);
    } catch (err) {
      console.error('Error fetching Monte Carlo:', err);
    } finally {
      setMcLoading(false);
    }
  };

  const fetchFrontier = async () => {
    try {
      const res = await fetch('/api/optimize-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equityWeight,
          creditWeight,
          realAssetsWeight,
          debtWeight,
          ventureWeight,
        }),
      });
      const data = await res.json();
      setEfResult(data);
    } catch (err) {
      console.error('Error fetching frontier:', err);
    }
  };

  useEffect(() => {
    fetchMonteCarlo();
    fetchFrontier();
  }, []);

  // Render Monte Carlo SVG Trajectories
  const renderMonteCarloChart = () => {
    if (!mcResult || !mcResult.trajectories || mcResult.trajectories.length === 0) return null;

    const width = 680;
    const height = 260;
    const paddingX = 45;
    const paddingY = 25;

    // Collect all values to determine scale
    const allVals = mcResult.trajectories.flat();
    const minVal = Math.min(...allVals, mcResult.bearishOutcome5th) * 0.85;
    const maxVal = Math.max(...allVals, mcResult.bullishOutcome95th) * 1.1;

    const steps = mcResult.trajectories[0].length;

    const toCoord = (val: number, stepIdx: number) => {
      const x = paddingX + (stepIdx / (steps - 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
      return { x, y };
    };

    return (
      <svg className="w-full h-64" viewBox={`0 0 ${width} ${height}`}>
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

        {/* Individual trajectory paths */}
        {mcResult.trajectories.map((path, pIdx) => {
          const pathString = path.reduce((acc, curr, idx) => {
            const pt = toCoord(curr, idx);
            return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
          }, '');

          return (
            <path
              key={pIdx}
              d={pathString}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.2"
              opacity="0.35"
            />
          );
        })}

        {/* 5th percentile line (Bearish bound) */}
        <line
          x1={paddingX}
          y1={toCoord(initialAum, 0).y}
          x2={width - paddingX}
          y2={toCoord(mcResult.bearishOutcome5th, steps - 1).y}
          stroke="#e11d48"
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />

        {/* Median 50th percentile */}
        <line
          x1={paddingX}
          y1={toCoord(initialAum, 0).y}
          x2={width - paddingX}
          y2={toCoord(mcResult.medianOutcome, steps - 1).y}
          stroke="#001A8C"
          strokeWidth="3"
        />

        {/* 95th percentile (Bullish bound) */}
        <line
          x1={paddingX}
          y1={toCoord(initialAum, 0).y}
          x2={width - paddingX}
          y2={toCoord(mcResult.bullishOutcome95th, steps - 1).y}
          stroke="#10b981"
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />

        {/* Axes Labels */}
        <text x={paddingX} y={height - 6} fontSize="10" fill="#64748b">
          Year 0 (₹{initialAum} Cr)
        </text>
        <text x={width / 2} y={height - 6} fontSize="10" fill="#64748b" textAnchor="middle">
          Year {Math.round(timeHorizonYears / 2)}
        </text>
        <text x={width - paddingX} y={height - 6} fontSize="10" fill="#64748b" textAnchor="end">
          Year {timeHorizonYears} Exit
        </text>

        {/* Y-Axis High and Low */}
        <text x={paddingX} y={paddingY + 8} fontSize="10" fill="#0f172a" fontWeight="bold">
          Bullish 95th: ₹{mcResult.bullishOutcome95th} Cr
        </text>
        <text x={paddingX} y={height - paddingY - 14} fontSize="10" fill="#e11d48" fontWeight="bold">
          Bearish 5th: ₹{mcResult.bearishOutcome5th} Cr
        </text>
      </svg>
    );
  };

  // Render Efficient Frontier Chart
  const renderFrontierChart = () => {
    if (!efResult || !efResult.frontierPoints || efResult.frontierPoints.length === 0) return null;

    const width = 640;
    const height = 240;
    const paddingX = 40;
    const paddingY = 25;

    const minVol = 2;
    const maxVol = 26;
    const minRet = 4;
    const maxRet = 28;

    const toCoord = (vol: number, ret: number) => {
      const x = paddingX + ((vol - minVol) / (maxVol - minVol)) * (width - paddingX * 2);
      const y = height - paddingY - ((ret - minRet) / (maxRet - minRet)) * (height - paddingY * 2);
      return { x, y };
    };

    const frontierPath = efResult.frontierPoints.reduce((acc, curr, idx) => {
      const pt = toCoord(curr.volatility, curr.expectedReturn);
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    // Current portfolio coordinate
    const currentPt = toCoord(efResult.portfolioVolatility, efResult.portfolioReturn);

    return (
      <svg className="w-full h-60" viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((pct, i) => (
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

        {/* Frontier Curve */}
        <path d={frontierPath} fill="none" stroke="#001A8C" strokeWidth="2.8" />

        {/* Capital Allocation Line (CAL) from Risk Free Rate */}
        <line
          x1={toCoord(0, efResult.riskFreeRate).x}
          y1={toCoord(0, efResult.riskFreeRate).y}
          x2={toCoord(22, 24).x}
          y2={toCoord(22, 24).y}
          stroke="#0284c7"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Current Allocation Dot */}
        <circle cx={currentPt.x} cy={currentPt.y} r="7" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />

        {/* Tooltip on current point */}
        <rect
          x={Math.max(paddingX, currentPt.x - 55)}
          y={Math.max(10, currentPt.y - 30)}
          width="110"
          height="22"
          rx="4"
          fill="#0f172a"
        />
        <text
          x={Math.max(paddingX + 55, currentPt.x)}
          y={Math.max(25, currentPt.y - 15)}
          fill="#ffffff"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          className="font-mono"
        >
          Ret: {efResult.portfolioReturn}% | Vol: {efResult.portfolioVolatility}%
        </text>

        {/* Axis Labels */}
        <text x={paddingX} y={height - 6} fontSize="10" fill="#64748b">
          Vol: 4% (Low Risk)
        </text>
        <text x={width - paddingX} y={height - 6} fontSize="10" fill="#64748b" textAnchor="end">
          Vol: 24% (Aggressive)
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quantitative Data Science & Portfolio Analytics Lab
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulate Value-at-Risk (VaR) via Monte Carlo models, optimize Markowitz efficient frontier weights, and evaluate enterprise multiples.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('monte-carlo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'monte-carlo'
                ? 'bg-[#001A8C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monte Carlo VaR
          </button>
          <button
            onClick={() => setActiveTab('efficient-frontier')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'efficient-frontier'
                ? 'bg-[#001A8C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Efficient Frontier (MPT)
          </button>
          <button
            onClick={() => setActiveTab('valuation')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'valuation'
                ? 'bg-[#001A8C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            LBO & Multiples Matrix
          </button>
        </div>
      </div>

      {activeTab === 'monte-carlo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Monte Carlo Model Input Variables
            </h2>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Fund Capital Base (AUM)</span>
                <span className="font-mono text-[#001A8C]">₹{initialAum} Cr</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={initialAum}
                onChange={(e) => setInitialAum(Number(e.target.value))}
                className="w-full accent-[#001A8C] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Target Annual Return (CAGR)</span>
                <span className="font-mono text-emerald-600">{expectedReturn}%</span>
              </div>
              <input
                type="range"
                min="8"
                max="35"
                step="1"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Annualized Volatility (σ)</span>
                <span className="font-mono text-rose-600">{volatility}%</span>
              </div>
              <input
                type="range"
                min="6"
                max="30"
                step="1"
                value={volatility}
                onChange={(e) => setVolatility(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Investment Horizon</span>
                <span className="font-mono text-slate-900">{timeHorizonYears} Years</span>
              </div>
              <select
                value={timeHorizonYears}
                onChange={(e) => setTimeHorizonYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none bg-white text-slate-800"
              >
                <option value={3}>3 Years (Short-Term Credit Cycle)</option>
                <option value={5}>5 Years (Standard PE Fund Horizon)</option>
                <option value={7}>7 Years (Full Market Infrastructure Cycle)</option>
              </select>
            </div>

            <button
              onClick={fetchMonteCarlo}
              disabled={mcLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              {mcLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Simulating 500 Stochastic Paths...</span>
                </>
              ) : (
                <span>Recompute Monte Carlo VaR (500 Runs)</span>
              )}
            </button>
          </div>

          {/* Visualization & Output Metrics */}
          <div className="lg:col-span-7 space-y-6">
            {mcResult && (
              <>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        500-Run Geometric Brownian Motion Trajectories
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Log-normal probability distribution under {volatility}% annual volatility
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Median: ₹{mcResult.medianOutcome} Cr
                    </span>
                  </div>

                  <div className="pt-2">
                    {renderMonteCarloChart()}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-1 bg-[#001A8C] inline-block"></span> 50th Median
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                      <span className="w-2.5 h-1 bg-emerald-600 inline-block"></span> 95th Bullish
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-rose-700">
                      <span className="w-2.5 h-1 bg-rose-600 inline-block"></span> 5th Bearish Bound
                    </span>
                  </div>
                </div>

                {/* Risk & VaR Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">95% Value-at-Risk (VaR)</div>
                    <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
                      ₹{mcResult.valueAtRisk95} Cr
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Maximum 95% tail risk</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">Conditional VaR (CVaR)</div>
                    <div className="text-2xl font-extrabold text-rose-700 mt-1 font-mono">
                      ₹{mcResult.conditionalVaR95} Cr
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Expected Shortfall beyond 95%</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">Projected Capital Multiple</div>
                    <div className="text-2xl font-extrabold text-[#001A8C] mt-1 font-mono">
                      {(mcResult.medianOutcome / initialAum).toFixed(2)}x MOIC
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      CAGR: {expectedReturn}%
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'efficient-frontier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Asset Class Weight Sliders */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Asset Class Allocation Weights
            </h2>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Growth Private Equity</span>
                <span className="font-mono text-[#001A8C]">{equityWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={equityWeight}
                onChange={(e) => {
                  setEquityWeight(Number(e.target.value));
                  fetchFrontier();
                }}
                className="w-full accent-[#001A8C] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Specialty Private Credit</span>
                <span className="font-mono text-sky-600">{creditWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={creditWeight}
                onChange={(e) => {
                  setCreditWeight(Number(e.target.value));
                  fetchFrontier();
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Clean Energy & Real Assets</span>
                <span className="font-mono text-emerald-600">{realAssetsWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={realAssetsWeight}
                onChange={(e) => {
                  setRealAssetsWeight(Number(e.target.value));
                  fetchFrontier();
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Liquid Sovereign T-Bills</span>
                <span className="font-mono text-amber-600">{debtWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={debtWeight}
                onChange={(e) => {
                  setDebtWeight(Number(e.target.value));
                  fetchFrontier();
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Early Venture Opportunistic</span>
                <span className="font-mono text-purple-600">{ventureWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={ventureWeight}
                onChange={(e) => {
                  setVentureWeight(Number(e.target.value));
                  fetchFrontier();
                }}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Risk-Free Benchmark: 6.8%</span>
              <span className="font-mono font-bold text-slate-900">
                Sum: {equityWeight + creditWeight + realAssetsWeight + debtWeight + ventureWeight}%
              </span>
            </div>
          </div>

          {/* Frontier Output */}
          <div className="lg:col-span-7 space-y-6">
            {efResult && (
              <>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Markowitz Modern Portfolio Theory (MPT) Frontier
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Optimal risk-adjusted Sharpe ratio curve vs current portfolio allocation
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#001A8C] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Sharpe: {efResult.sharpeRatio}
                    </span>
                  </div>

                  <div className="pt-2">
                    {renderFrontierChart()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">Expected Portfolio Return</div>
                    <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
                      {efResult.portfolioReturn}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Annualized expected yield</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">Portfolio Volatility (σ)</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                      {efResult.portfolioVolatility}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Diversified covariance</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">Sharpe Ratio Efficiency</div>
                    <div className="text-2xl font-extrabold text-[#001A8C] mt-1 font-mono">
                      {efResult.sharpeRatio}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      {efResult.sharpeRatio > 1.2 ? 'Superior Risk-Adjusted' : 'Moderate'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'valuation' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institutional Private Equity & M&A Valuation Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark valuation multiples, revenue growth percentiles, and exit returns across target sectors
              </p>
            </div>
            <span className="text-xs font-mono text-[#001A8C] font-semibold">
              Updated: Q3 2026 Peer Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Investment Sector</th>
                  <th className="py-3 px-4">Median EV / ARR</th>
                  <th className="py-3 px-4">Median EV / EBITDA</th>
                  <th className="py-3 px-4">Rule of 40 Score</th>
                  <th className="py-3 px-4">Target Net IRR</th>
                  <th className="py-3 px-4">Exit Multiple Benchmark</th>
                  <th className="py-3 px-4 text-right">Vian Stance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    sector: 'SaaS & Enterprise AI',
                    arr: '7.8x',
                    ebitda: '24.0x',
                    rule40: '58%',
                    irr: '32.0%',
                    moic: '3.6x',
                    stance: 'Strong Overweight',
                  },
                  {
                    sector: 'Clean Energy & Microgrid Infra',
                    arr: 'N/A',
                    ebitda: '9.2x',
                    rule40: '42%',
                    irr: '21.5%',
                    moic: '2.5x',
                    stance: 'Core Defensive',
                  },
                  {
                    sector: 'Fintech & Structured Credit',
                    arr: '5.4x',
                    ebitda: '16.5x',
                    rule40: '48%',
                    irr: '26.0%',
                    moic: '3.0x',
                    stance: 'Opportunistic Overweight',
                  },
                  {
                    sector: 'Healthcare Devices & Robotic Surgery',
                    arr: '8.5x',
                    ebitda: '18.0x',
                    rule40: '45%',
                    irr: '27.5%',
                    moic: '3.2x',
                    stance: 'Selective Growth',
                  },
                  {
                    sector: 'Direct-to-Consumer Wellness',
                    arr: '3.8x',
                    ebitda: '12.0x',
                    rule40: '38%',
                    irr: '22.0%',
                    moic: '2.6x',
                    stance: 'Neutral / Yield Focus',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.sector}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{row.arr}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{row.ebitda}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600">{row.rule40}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.irr}</td>
                    <td className="py-3.5 px-4 font-mono">{row.moic}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#001A8C] border border-blue-200">
                        {row.stance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
