import React, { useState } from 'react';
import { Stock, MarketOptimizationMode, CashFuturesArbitrageRow, Order } from '../types';
import { CASH_FUTURES_OPPORTUNITIES } from '../data/mockMarketData';

interface MarketOptimizationsProps {
  stocks: Stock[];
  onPlaceOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
  availableCash: number;
}

export const MarketOptimizations: React.FC<MarketOptimizationsProps> = ({
  stocks,
  onPlaceOrder,
  availableCash,
}) => {
  const [activeTab, setActiveTab] = useState<MarketOptimizationMode>('sor');

  // SOR State
  const dualListedStocks = stocks.filter((s) => s.bsePrice && s.nsePrice);
  const [selectedSorSymbol, setSelectedSorSymbol] = useState<string>(dualListedStocks[0]?.symbol || 'RELIANCE');
  const [sorQty, setSorQty] = useState<number>(200);
  const [sorAction, setSorAction] = useState<'BUY' | 'SELL'>('BUY');
  const [sorSuccessMsg, setSorSuccessMsg] = useState<string | null>(null);

  // Execution Algo State
  const [selectedAlgoStock, setSelectedAlgoStock] = useState<string>('RELIANCE');
  const [algoType, setAlgoType] = useState<'TWAP' | 'VWAP' | 'ICEBERG' | 'SNIPE_PEGGED'>('VWAP');
  const [algoTotalQty, setAlgoTotalQty] = useState<number>(1000);
  const [algoDurationMins, setAlgoDurationMins] = useState<number>(30);
  const [algoExecuting, setAlgoExecuting] = useState<boolean>(false);
  const [algoCompletedSlices, setAlgoCompletedSlices] = useState<number>(0);

  // Margin Optimizer State
  const [selectedMarginStrategy, setSelectedMarginStrategy] = useState<'IRON_CONDOR' | 'BULL_CALL_SPREAD' | 'BEAR_PUT_SPREAD'>('IRON_CONDOR');
  const [marginDeployed, setMarginDeployed] = useState<boolean>(false);

  // Portfolio MPT State
  const [riskTolerance, setRiskTolerance] = useState<number>(50); // 0 (Min Vol) to 100 (Max Sharpe)

  const currentSorStock = stocks.find((s) => s.symbol === selectedSorSymbol) || dualListedStocks[0];

  // Fee calculation for BSE vs NSE
  const bsePrice = currentSorStock?.bsePrice || currentSorStock?.price || 1000;
  const nsePrice = currentSorStock?.nsePrice || currentSorStock?.price || 1000;
  const grossTradeValBse = bsePrice * sorQty;
  const grossTradeValNse = nsePrice * sorQty;

  // Real regulatory turnover fees:
  // NSE cash turnover fee: ~0.00325% (₹3.25 per lakh)
  // BSE cash turnover fee: ~0.00375% (₹3.75 per lakh)
  const turnoverFeeBse = (grossTradeValBse * 0.0000375);
  const turnoverFeeNse = (grossTradeValNse * 0.0000325);
  const stt = (grossTradeValNse * 0.001); // 0.1% delivery STT
  const sebiCharges = (grossTradeValNse * 0.000001); // ₹10 per crore
  const stampDuty = (grossTradeValNse * 0.00015); // 0.015% buy stamp duty

  const totalCostBse = grossTradeValBse + (sorAction === 'BUY' ? (turnoverFeeBse + stt + sebiCharges + stampDuty) : 0);
  const totalCostNse = grossTradeValNse + (sorAction === 'BUY' ? (turnoverFeeNse + stt + sebiCharges + stampDuty) : 0);

  const bestBuyExchange: 'BSE' | 'NSE' = totalCostBse <= totalCostNse ? 'BSE' : 'NSE';
  const bestSellExchange: 'BSE' | 'NSE' = grossTradeValBse >= grossTradeValNse ? 'BSE' : 'NSE';
  const optimalExchange = sorAction === 'BUY' ? bestBuyExchange : bestSellExchange;
  const netSavings = Math.abs(totalCostBse - totalCostNse);

  const handleExecuteSor = () => {
    const execPrice = optimalExchange === 'BSE' ? bsePrice : nsePrice;
    onPlaceOrder({
      symbol: currentSorStock.symbol,
      exchange: optimalExchange,
      type: sorAction,
      orderType: 'SMART_ROUTER',
      product: 'MIS',
      quantity: sorQty,
      price: execPrice,
      sorExchangeExecuted: optimalExchange,
      priceImprovement: Math.round(netSavings * 100) / 100,
    });
    setSorSuccessMsg(`SOR Routed successfully to ${optimalExchange} at ₹${execPrice}. Price Improvement Saved: ₹${netSavings.toFixed(2)}`);
    setTimeout(() => setSorSuccessMsg(null), 4000);
  };

  const handleExecuteAlgo = () => {
    setAlgoExecuting(true);
    setAlgoCompletedSlices(1);

    const interval = setInterval(() => {
      setAlgoCompletedSlices((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          setAlgoExecuting(false);
          const stock = stocks.find((s) => s.symbol === selectedAlgoStock) || stocks[0];
          onPlaceOrder({
            symbol: stock.symbol,
            exchange: stock.exchange,
            type: 'BUY',
            orderType: algoType as any,
            product: 'MIS',
            quantity: algoTotalQty,
            price: stock.price,
            algoSlices: 6,
          });
          return 6;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Institutional Market Microstructure Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Advanced Market Optimizations & Arbitrage Lab
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Algorithmic Smart Order Routing (SOR), BSE vs NSE Cross-Exchange Spreads, Cash-to-Futures Carry Yields, and SPAN Margin Optimization.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sor')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'sor'
                ? 'bg-[#001A8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Smart Order Routing (SOR)
          </button>
          <button
            onClick={() => setActiveTab('cash-futures')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'cash-futures'
                ? 'bg-[#001A8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📈 Cash-Futures Basis (Carry)
          </button>
          <button
            onClick={() => setActiveTab('execution-algos')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'execution-algos'
                ? 'bg-[#001A8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 Execution Algos (TWAP/VWAP)
          </button>
          <button
            onClick={() => setActiveTab('margin-optimizer')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'margin-optimizer'
                ? 'bg-[#001A8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛡️ SPAN Margin Sequencer
          </button>
          <button
            onClick={() => setActiveTab('portfolio-mpt')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'portfolio-mpt'
                ? 'bg-[#001A8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Markowitz MPT Frontier
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. SMART ORDER ROUTING (SOR) & CROSS-EXCHANGE ARBITRAGE OPTIMIZER */}
      {/* ============================================================== */}
      {activeTab === 'sor' && (
        <div className="space-y-6">
          {sorSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{sorSuccessMsg}</span>
              </div>
            </div>
          )}

          {/* Interactive SOR Simulator */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Interactive Smart Order Routing (SOR) Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time L2 orderbook scan across Bombay Stock Exchange (BSE) and National Stock Exchange (NSE) to execute at lowest net cost.
                </p>
              </div>

              {/* Ticker Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Dual-Listed Ticker:</span>
                <select
                  value={selectedSorSymbol}
                  onChange={(e) => setSelectedSorSymbol(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#001A8C]"
                >
                  {dualListedStocks.map((stk) => (
                    <option key={stk.symbol} value={stk.symbol}>
                      {stk.symbol} ({stk.name.substring(0, 20)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inputs: Action & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Order Action
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSorAction('BUY')}
                    className={`py-1.5 rounded-lg border text-center cursor-pointer transition-colors ${
                      sorAction === 'BUY'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    BUY (Seek Low Price)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSorAction('SELL')}
                    className={`py-1.5 rounded-lg border text-center cursor-pointer transition-colors ${
                      sorAction === 'SELL'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    SELL (Seek High Price)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Order Quantity (Shares)
                </label>
                <input
                  type="number"
                  min="1"
                  value={sorQty}
                  onChange={(e) => setSorQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Execution Destination Strategy
                </label>
                <div className="text-xs font-mono p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-bold flex items-center justify-between">
                  <span>Routing:</span>
                  <span className="bg-[#001A8C] text-white px-2 py-0.5 rounded text-[10px]">
                    Auto Route to {optimalExchange}
                  </span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Exchange Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* BSE Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  optimalExchange === 'BSE'
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-xs">
                      BSE (Bombay Stock Exchange)
                    </span>
                    {optimalExchange === 'BSE' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px] animate-pulse">
                        ★ OPTIMAL ROUTE
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">SEBI Regulated</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">LTP Quote:</span>
                    <strong className="text-slate-900 text-sm">₹{bsePrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Gross Notional ({sorQty} shares):</span>
                    <span className="font-semibold text-slate-800">₹{grossTradeValBse.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-[11px] text-slate-500">
                    <span>BSE Turnover Charge (0.00375%):</span>
                    <span>₹{turnoverFeeBse.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-[11px] text-slate-500">
                    <span>STT + SEBI + Stamp Duty:</span>
                    <span>₹{(stt + sebiCharges + stampDuty).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs font-bold pt-1">
                    <span className="text-slate-900">Total Net Realized Cost:</span>
                    <span className={optimalExchange === 'BSE' ? 'text-emerald-700 text-sm' : 'text-slate-800'}>
                      ₹{totalCostBse.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* NSE Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  optimalExchange === 'NSE'
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold text-xs">
                      NSE (National Stock Exchange)
                    </span>
                    {optimalExchange === 'NSE' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px] animate-pulse">
                        ★ OPTIMAL ROUTE
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">SEBI Regulated</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">LTP Quote:</span>
                    <strong className="text-slate-900 text-sm">₹{nsePrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Gross Notional ({sorQty} shares):</span>
                    <span className="font-semibold text-slate-800">₹{grossTradeValNse.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-[11px] text-slate-500">
                    <span>NSE Turnover Charge (0.00325%):</span>
                    <span>₹{turnoverFeeNse.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-[11px] text-slate-500">
                    <span>STT + SEBI + Stamp Duty:</span>
                    <span>₹{(stt + sebiCharges + stampDuty).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs font-bold pt-1">
                    <span className="text-slate-900">Total Net Realized Cost:</span>
                    <span className={optimalExchange === 'NSE' ? 'text-emerald-700 text-sm' : 'text-slate-800'}>
                      ₹{totalCostNse.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings & 1-Click Execution */}
            <div className="bg-gradient-to-r from-blue-900 via-[#001A8C] to-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Calculated Net Price Improvement
                </div>
                <div className="text-lg font-mono font-extrabold text-emerald-400">
                  Save ₹{netSavings.toFixed(2)} by routing to {optimalExchange}
                </div>
                <div className="text-[11px] text-slate-300">
                  Execution via 5paisa / Zerodha FIX Direct Market Access (DMA) sub-millisecond gateway.
                </div>
              </div>

              <button
                onClick={handleExecuteSor}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-lg transition-colors cursor-pointer text-xs font-mono shadow-md"
              >
                Execute Smart Route on {optimalExchange} →
              </button>
            </div>
          </div>

          {/* Real-time Cross-Exchange Arbitrage Monitor Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Live Dalal Street Cross-Exchange Arbitrage Board
                </h3>
                <p className="text-xs text-slate-500">
                  Simultaneous quote monitoring across BSE and NSE dual-listed flagships for zero-risk market making.
                </p>
              </div>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Active Pairs: {dualListedStocks.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono font-semibold">
                    <th className="py-2.5 px-4">Symbol</th>
                    <th className="py-2.5 px-4">Company Name</th>
                    <th className="py-2.5 px-4 text-right">BSE Quote (₹)</th>
                    <th className="py-2.5 px-4 text-right">NSE Quote (₹)</th>
                    <th className="py-2.5 px-4 text-right">Arbitrage Delta</th>
                    <th className="py-2.5 px-4 text-center">Optimal Routing Action</th>
                    <th className="py-2.5 px-4 text-right">Instant Capture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {dualListedStocks.map((stock) => {
                    const diff = Math.round(((stock.nsePrice || 0) - (stock.bsePrice || 0)) * 100) / 100;
                    const isNseHigher = diff > 0;
                    const spreadAbs = Math.abs(diff);

                    return (
                      <tr key={stock.symbol} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{stock.symbol}</td>
                        <td className="py-3 px-4 text-slate-600 font-sans">{stock.name}</td>
                        <td className="py-3 px-4 text-right font-semibold">₹{stock.bsePrice}</td>
                        <td className="py-3 px-4 text-right font-semibold">₹{stock.nsePrice}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          ₹{spreadAbs.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isNseHigher ? (
                            <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                              Buy BSE @ {stock.bsePrice} → Sell NSE @ {stock.nsePrice}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                              Buy NSE @ {stock.nsePrice} → Sell BSE @ {stock.bsePrice}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              onPlaceOrder({
                                symbol: stock.symbol,
                                exchange: isNseHigher ? 'BSE' : 'NSE',
                                type: 'BUY',
                                orderType: 'SMART_ROUTER',
                                product: 'MIS',
                                quantity: 50,
                                price: isNseHigher ? stock.bsePrice! : stock.nsePrice!,
                                sorExchangeExecuted: isNseHigher ? 'BSE' : 'NSE',
                                priceImprovement: Math.round(spreadAbs * 50 * 100) / 100,
                              });
                              setSorSuccessMsg(`Arbitrage Spread Captured for ${stock.symbol}!`);
                              setTimeout(() => setSorSuccessMsg(null), 3500);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-[#001A8C] hover:bg-blue-50 border border-blue-200 rounded cursor-pointer"
                          >
                            Capture ₹{(spreadAbs * 50).toFixed(1)} →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CASH-FUTURES BASIS & COST-OF-CARRY OPTIMIZER */}
      {/* ============================================================== */}
      {activeTab === 'cash-futures' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Cash-and-Carry Arbitrage & Basis Yield Optimization
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lock in annualized risk-free yield by taking simultaneous Long positions in Cash Equity (BSE/NSE) and Short positions in Near-Month Futures on NSE. On expiry day, Futures price converges to Spot price with zero directional risk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Annualized Basis Yield Formula</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  ((Futures - Spot) / Spot) × (365 / DTE)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Current Days to Monthly Expiry (DTE)</span>
                <span className="font-bold text-[#001A8C] text-sm mt-0.5 block">
                  20 Days (NSE Derivatives Expiry)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Peak Return Available Today</span>
                <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                  12.96% p.a. (BEL - Bharat Electronics)
                </span>
              </div>
            </div>
          </div>

          {/* Cash-Futures Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">
                Top Cash-to-Futures Basis Opportunities (NSE F&O Segment)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono font-semibold">
                    <th className="py-2.5 px-4">Instrument</th>
                    <th className="py-2.5 px-4 text-right">Spot Price (₹)</th>
                    <th className="py-2.5 px-4 text-right">Futures Price (₹)</th>
                    <th className="py-2.5 px-4 text-right">Basis Spread (₹)</th>
                    <th className="py-2.5 px-4 text-right">Basis %</th>
                    <th className="py-2.5 px-4 text-right">Annualized Yield</th>
                    <th className="py-2.5 px-4 text-right">Lot Size</th>
                    <th className="py-2.5 px-4 text-right">Net Profit (₹)</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {CASH_FUTURES_OPPORTUNITIES.map((opp) => (
                    <tr key={opp.symbol} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{opp.symbol}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{opp.name}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">₹{opp.spotPrice.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-semibold">₹{opp.futuresPrice.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700">
                        +₹{opp.basisSpread.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">+{opp.basisPct}%</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 text-sm">
                        {opp.annualizedCarryYield}% p.a.
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">{opp.lotSize}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        +₹{opp.netYieldRupees.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            onPlaceOrder({
                              symbol: `${opp.symbol} CASH+FUT PAIR`,
                              exchange: 'NSE',
                              type: 'BUY',
                              orderType: 'SMART_ROUTER',
                              product: 'NRML',
                              quantity: opp.lotSize,
                              price: opp.spotPrice,
                            });
                          }}
                          className="px-3 py-1 bg-[#001A8C] hover:bg-[#00146e] text-white font-bold rounded-lg text-[11px] cursor-pointer"
                        >
                          Deploy Pair →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. EXECUTION ALGORITHM OPTIMIZER (TWAP, VWAP, ICEBERG & SNIPE) */}
      {/* ============================================================== */}
      {activeTab === 'execution-algos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Institutional Algorithmic Execution Slicing
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Minimizes market impact and predatory front-running by breaking large institutional orders into smart, randomized slices across BSE and NSE books.
              </p>
            </div>

            {/* Config Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Target Stock
                </label>
                <select
                  value={selectedAlgoStock}
                  onChange={(e) => setSelectedAlgoStock(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                >
                  {stocks.slice(0, 10).map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} - {s.exchange}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Execution Algorithm
                </label>
                <select
                  value={algoType}
                  onChange={(e) => setAlgoType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                >
                  <option value="VWAP">VWAP (Volume-Weighted Profile)</option>
                  <option value="TWAP">TWAP (Time-Weighted Slices)</option>
                  <option value="ICEBERG">Iceberg (Hidden Quantity Clips)</option>
                  <option value="SNIPE_PEGGED">Pegged Midpoint Snipe</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Total Order Size
                </label>
                <input
                  type="number"
                  value={algoTotalQty}
                  onChange={(e) => setAlgoTotalQty(parseInt(e.target.value) || 100)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Execution Window
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={algoDurationMins}
                    onChange={(e) => setAlgoDurationMins(parseInt(e.target.value))}
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={120}>2 Hours</option>
                  </select>
                  <button
                    onClick={handleExecuteAlgo}
                    disabled={algoExecuting}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer ${
                      algoExecuting ? 'bg-amber-600' : 'bg-[#001A8C] hover:bg-[#00146e]'
                    }`}
                  >
                    {algoExecuting ? 'Executing...' : 'Start Algo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Execution Slicing Visualizer */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Algorithm Progress: <strong className="text-white">{algoCompletedSlices} of 6 Slices Filled</strong></span>
                <span className="text-emerald-400">
                  {algoCompletedSlices === 6 ? 'COMPLETED (0.8 bps Slippage)' : 'ACTIVE MONITORING'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(algoCompletedSlices / 6) * 100}%` }}
                ></div>
              </div>

              {/* Slices Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6].map((slice) => {
                  const isDone = slice <= algoCompletedSlices;
                  const sliceQty = Math.round(algoTotalQty / 6);
                  return (
                    <div
                      key={slice}
                      className={`p-2 rounded border text-center transition-all ${
                        isDone
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-700 bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] uppercase">Clip #{slice}</div>
                      <div className="font-bold text-xs">{sliceQty} Qty</div>
                      <div className="text-[9px] mt-0.5">{isDone ? 'Filled' : 'Resting'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. F&O SPAN & MULTI-LEG MARGIN OPTIMIZER (LEG SEQUENCING) */}
      {/* ============================================================== */}
      {activeTab === 'margin-optimizer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                SEBI SPAN & Exposure Margin Sequencing Optimizer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                In Indian derivatives markets, shorting naked options blocks massive intraday capital (₹1,45,000+). Our optimizer sequences multi-leg basket orders by automatically sending the long OTM protective hedge leg first, granting immediate SPAN margin relief and slashing required capital by up to 72%!
              </p>
            </div>

            {/* Strategy Selection */}
            <div className="flex gap-2">
              {[
                { id: 'IRON_CONDOR', label: 'NIFTY 50 Iron Condor' },
                { id: 'BULL_CALL_SPREAD', label: 'Bull Call Vertical Spread' },
                { id: 'BEAR_PUT_SPREAD', label: 'Bear Put Vertical Spread' },
              ].map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => {
                    setSelectedMarginStrategy(strat.id as any);
                    setMarginDeployed(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedMarginStrategy === strat.id
                      ? 'bg-[#001A8C] text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {strat.label}
                </button>
              ))}
            </div>

            {/* Margin Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20">
                <span className="text-[10px] font-bold uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                  Unoptimized Execution (Naked Leg First)
                </span>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between py-1 border-b border-rose-100">
                    <span>Initial Short Leg Margin Block:</span>
                    <strong className="text-rose-700">₹1,48,500</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100">
                    <span>Peak Margin Rejection Risk:</span>
                    <span className="text-rose-600 font-bold">High (RMS Circuit Trigger)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 font-sans">
                    Fails if account cash is under ₹1.5L, blocking the trader from initiating hedged setups.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/30">
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  ★ Vian SPAN Sequenced Execution (Hedge First)
                </span>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span>Sequence 1 (Long OTM Hedge):</span>
                    <strong className="text-slate-700">₹4,200</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span>Sequence 2 (Short Leg with SPAN Offset):</span>
                    <strong className="text-emerald-700 text-sm">₹38,500 Required</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span>Total Margin Relief Benefit:</span>
                    <span className="text-emerald-600 font-extrabold text-sm">₹1,10,000 (74.1% Saved)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMarginDeployed(true);
                  onPlaceOrder({
                    symbol: `NIFTY ${selectedMarginStrategy} (SPAN SEQUENCED)`,
                    exchange: 'NSE',
                    type: 'BUY',
                    orderType: 'SMART_ROUTER',
                    product: 'NRML',
                    quantity: 75,
                    price: 148.0,
                  });
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg transition-colors cursor-pointer text-xs font-mono shadow-sm flex items-center justify-center gap-2"
              >
                <span>Deploy SPAN Sequenced Multi-Leg Basket (Margin Req: ₹38,500)</span>
                <span>→</span>
              </button>
              {marginDeployed && (
                <div className="mt-2 text-center text-xs font-mono text-emerald-700 font-bold">
                  ✓ Multi-leg hedge sequence placed! Leg 1 (OTM Long) filled first, securing SPAN margin relief before Leg 2 execution.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODERN PORTFOLIO THEORY (MARKOWITZ EFFICIENT FRONTIER) */}
      {/* ============================================================== */}
      {activeTab === 'portfolio-mpt' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Markowitz Modern Portfolio Theory (MPT) Efficient Frontier
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mathematical optimization algorithm generating the maximum expected return for a given level of risk by solving quadratic covariance matrices across Dalal Street BSE and NSE champions.
              </p>
            </div>

            {/* Slider */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700">Optimization Objective:</span>
                <span className="text-[#001A8C] font-extrabold">
                  {riskTolerance < 40 ? 'Minimum Variance (Conservative)' : riskTolerance > 70 ? 'Maximum Sharpe Ratio (Aggressive Alpha)' : 'Balanced Growth'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-[#001A8C]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Min Volatility (Risk: 8.2% · Return: 18.5%)</span>
                <span>100% Max Sharpe (Risk: 14.8% · Return: 34.2%)</span>
              </div>
            </div>

            {/* SVG Efficient Frontier Curve */}
            <div className="bg-slate-900 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs text-slate-300 font-mono mb-2">
                <span>Efficient Frontier (Expected Return vs Portfolio Volatility)</span>
                <span className="text-emerald-400">Sharpe Ratio: {(1.2 + (riskTolerance / 100) * 0.85).toFixed(2)}</span>
              </div>

              <svg className="w-full h-56 select-none" viewBox="0 0 600 200">
                {/* Axes */}
                <line x1="40" y1="20" x2="40" y2="170" stroke="#334155" strokeWidth="1.5" />
                <line x1="40" y1="170" x2="570" y2="170" stroke="#334155" strokeWidth="1.5" />

                {/* Grid */}
                {[50, 90, 130].map((y) => (
                  <line key={y} x1="40" y1={y} x2="570" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                ))}

                {/* Frontier Curve (Hyperbolic upper bound) */}
                <path
                  d="M 70 155 Q 160 50 560 30"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Capital Allocation Line (CAL) */}
                <line x1="40" y1="160" x2="560" y2="35" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Current Selected Portfolio Point */}
                {(() => {
                  const cx = 70 + (riskTolerance / 100) * 380;
                  const cy = 155 - Math.pow(riskTolerance / 100, 0.55) * 115;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="6" fill="#10b981" className="animate-pulse" />
                      <circle cx={cx} cy={cy} r="12" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6" />
                      <text x={cx + 12} y={cy - 4} fontSize="11" fill="#10b981" fontWeight="bold" fontFamily="monospace">
                        Optimized Portfolio ({(18.5 + (riskTolerance / 100) * 15.7).toFixed(1)}% Return)
                      </text>
                    </g>
                  );
                })()}

                {/* Labels */}
                <text x="45" y="30" fontSize="10" fill="#94a3b8" fontFamily="monospace">Expected Return (%)</text>
                <text x="480" y="185" fontSize="10" fill="#94a3b8" fontFamily="monospace">Volatility / Risk (σ)</text>
              </svg>
            </div>

            {/* Optimized Asset Allocation Weights Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono font-semibold">
                    <th className="py-2.5 px-4">Instrument</th>
                    <th className="py-2.5 px-4">Exchange</th>
                    <th className="py-2.5 px-4 text-right">Optimal Weight (%)</th>
                    <th className="py-2.5 px-4 text-right">Expected ROCE</th>
                    <th className="py-2.5 px-4 text-right">Recommended Allocation (₹4,85,000 Capital)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {[
                    { symbol: 'RELIANCE', exchange: 'NSE', weight: Math.round(28 - (riskTolerance / 100) * 6), roce: '18.4%' },
                    { symbol: 'HAL', exchange: 'BSE', weight: Math.round(18 + (riskTolerance / 100) * 12), roce: '29.2%' },
                    { symbol: 'BEL', exchange: 'BSE', weight: Math.round(16 + (riskTolerance / 100) * 8), roce: '26.8%' },
                    { symbol: 'HDFCBANK', exchange: 'NSE', weight: Math.round(22 - (riskTolerance / 100) * 8), roce: '17.5%' },
                    { symbol: 'TRENT', exchange: 'BSE', weight: Math.round(16 + (riskTolerance / 100) * 6), roce: '32.1%' },
                  ].map((row) => {
                    const capitalShare = Math.round((row.weight / 100) * availableCash);
                    return (
                      <tr key={row.symbol} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{row.symbol}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.exchange === 'BSE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {row.exchange}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#001A8C]">{row.weight}%</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-semibold">{row.roce}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₹{capitalShare.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
