import React, { useState } from 'react';
import { ThematicBasket } from '../types';

interface ThematicBasketsProps {
  baskets: ThematicBasket[];
  onInvestInBasket: (basket: ThematicBasket) => void;
  availableCash: number;
}

export const ThematicBaskets: React.FC<ThematicBasketsProps> = ({
  baskets,
  onInvestInBasket,
  availableCash,
}) => {
  const [selectedBasket, setSelectedBasket] = useState<ThematicBasket>(baskets[0]);
  const [filterExchange, setFilterExchange] = useState<'ALL' | 'BSE' | 'NSE' | 'NASDAQ' | 'HYBRID'>('ALL');

  const filteredBaskets = baskets.filter(
    (b) => filterExchange === 'ALL' || b.exchange === filterExchange
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quantitative Thematic Baskets (Smallcase Style Models)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curated algorithmic model portfolios built with modern portfolio theory, rule-based rebalancing, and 1-click multi-stock basket orders.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
          {(['ALL', 'BSE', 'NSE', 'NASDAQ', 'HYBRID'] as const).map((ex) => (
            <button
              key={ex}
              onClick={() => setFilterExchange(ex)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterExchange === ex
                  ? 'bg-[#001A8C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Basket Cards List */}
        <div className="lg:col-span-5 space-y-4">
          {filteredBaskets.map((basket) => {
            const isSelected = selectedBasket.id === basket.id;
            return (
              <div
                key={basket.id}
                onClick={() => setSelectedBasket(basket)}
                className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#001A8C] ring-1 ring-[#001A8C] shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {basket.exchange} · {basket.volatility} Risk
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {basket.name}
                    </h3>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-lg font-extrabold text-emerald-600">
                      +{basket.cagr3Y}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">3Y CAGR</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {basket.tagline}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Min Investment:</span>
                  <strong className="text-slate-900">
                    ₹{basket.minInvestment.toLocaleString()}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Basket Inspector & 1-Click Investment Execution */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#001A8C] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  Model Portfolio Deep Dive
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedBasket.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedBasket.description}
                </p>
              </div>

              <div className="text-left sm:text-right font-mono shrink-0">
                <span className="text-2xl font-extrabold text-emerald-600">
                  +{selectedBasket.cagr3Y}%
                </span>
                <span className="text-[11px] text-slate-400 block">
                  3-Year Backtested Alpha
                </span>
              </div>
            </div>

            {/* Constituents Table */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Constituents & Weightage Matrix</span>
                <span className="text-slate-400 font-mono font-normal">
                  Cadence: {selectedBasket.rebalanceCadence}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 font-mono text-[11px]">
                      <th className="py-2.5 px-3">Stock Symbol</th>
                      <th className="py-2.5 px-3">Weight (%)</th>
                      <th className="py-2.5 px-3 text-right">CMP</th>
                      <th className="py-2.5 px-3 text-right">Shares</th>
                      <th className="py-2.5 px-3 text-right">Allocated (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedBasket.constituents.map((item) => (
                      <tr key={item.symbol} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <strong className="text-slate-900">{item.symbol}</strong>
                          <span className="text-slate-400 text-[10px] block truncate max-w-[140px]">
                            {item.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#001A8C] h-full rounded-full"
                                style={{ width: `${item.weight}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-slate-800">{item.weight}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {item.price.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {item.shares}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{Math.round(item.shares * item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Metric Badges */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Sharpe Ratio</span>
                <strong className="text-slate-900 text-sm">2.14</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Max Drawdown (3Y)</span>
                <strong className="text-rose-600 text-sm">-8.4%</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Benchmark Outperformance</span>
                <strong className="text-emerald-600 text-sm">+18.2% Alpha</strong>
              </div>
            </div>
          </div>

          {/* 1-Click Investment Execution Footer */}
          <div className="pt-5 mt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs font-mono">
              <span className="text-slate-500 block">Total Basket Order Cost:</span>
              <strong className="text-lg font-extrabold text-[#001A8C]">
                ₹{selectedBasket.minInvestment.toLocaleString()}
              </strong>
            </div>

            <button
              onClick={() => onInvestInBasket(selectedBasket)}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg shadow-sm transition-colors cursor-pointer text-center"
            >
              1-Click Invest in Basket (All {selectedBasket.constituents.length} Stocks) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
