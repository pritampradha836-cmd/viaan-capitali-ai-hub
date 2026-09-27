import React, { useState } from 'react';
import { Stock, Order, Position, Exchange } from '../types';

interface TradingTerminalProps {
  stocks: Stock[];
  selectedStock: Stock;
  onSelectStock: (stock: Stock) => void;
  positions: Position[];
  orders: Order[];
  onPlaceOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
  onSquareOffPosition: (positionId: string) => void;
  onCancelOrder: (orderId: string) => void;
  availableCash: number;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  positions,
  orders,
  onPlaceOrder,
  onSquareOffPosition,
  onCancelOrder,
  availableCash,
}) => {
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'NSE' | 'BSE' | 'NASDAQ'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [centerViewMode, setCenterViewMode] = useState<'chart' | 'dual-depth'>('chart');
  const [chartTimeframe, setChartTimeframe] = useState<'1m' | '5m' | '15m' | '1D'>('15m');
  const [showIndicators, setShowIndicators] = useState(true);

  // Order Ticket state
  const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<Order['orderType']>('SMART_ROUTER');
  const [productType, setProductType] = useState<'MIS' | 'CNC'>('MIS');
  const [orderQty, setOrderQty] = useState<number>(25);
  const [limitPrice, setLimitPrice] = useState<number>(selectedStock.price);
  const [triggerPrice, setTriggerPrice] = useState<number>(Math.round(selectedStock.price * 0.98 * 10) / 10);
  const [selectedExchange, setSelectedExchange] = useState<Exchange>(selectedStock.exchange);
  const [bottomTab, setBottomTab] = useState<'positions' | 'orders' | 'arbitrage' | 'basis-carry'>('positions');

  const bseCount = stocks.filter((s) => s.exchange === 'BSE').length;
  const nseCount = stocks.filter((s) => s.exchange === 'NSE').length;
  const nasdaqCount = stocks.filter((s) => s.exchange === 'NASDAQ').length;

  const filteredStocks = stocks.filter((s) => {
    const matchesExchange = exchangeFilter === 'ALL' || s.exchange === exchangeFilter;
    const matchesSearch =
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.sector && s.sector.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesExchange && matchesSearch;
  });

  const leverage = productType === 'MIS' ? 5 : 1;
  const executionPrice = orderType === 'LIMIT' ? limitPrice : selectedStock.price;
  const estimatedTotal = orderQty * executionPrice;
  const requiredMargin = Math.round((estimatedTotal / leverage) * 10) / 10;

  // Dual-exchange price improvement calculation
  const hasDualListing = selectedStock.nsePrice && selectedStock.bsePrice;
  const bestBuyExchange: 'BSE' | 'NSE' = hasDualListing
    ? (selectedStock.nsePrice! <= selectedStock.bsePrice! ? 'NSE' : 'BSE')
    : (selectedStock.exchange === 'BSE' ? 'BSE' : 'NSE');
  const bestSellExchange: 'BSE' | 'NSE' = hasDualListing
    ? (selectedStock.nsePrice! >= selectedStock.bsePrice! ? 'NSE' : 'BSE')
    : (selectedStock.exchange === 'BSE' ? 'BSE' : 'NSE');

  const targetExchange = orderType === 'SMART_ROUTER'
    ? (orderAction === 'BUY' ? bestBuyExchange : bestSellExchange)
    : selectedExchange;

  const priceImprovement = hasDualListing
    ? Math.abs(selectedStock.nsePrice! - selectedStock.bsePrice!) * orderQty
    : 0;

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder({
      symbol: selectedStock.symbol,
      exchange: targetExchange,
      type: orderAction,
      orderType,
      product: productType,
      quantity: orderQty,
      price: executionPrice,
      triggerPrice: orderType === 'SL' ? triggerPrice : undefined,
      sorExchangeExecuted: orderType === 'SMART_ROUTER' ? (targetExchange as any) : undefined,
      priceImprovement: orderType === 'SMART_ROUTER' ? Math.round(priceImprovement * 100) / 100 : undefined,
    });
  };

  const totalPnl = positions.reduce((acc, p) => acc + p.pnl, 0);

  // Render SVG Candlestick / Area Chart
  const renderChart = () => {
    const candles = selectedStock.candles;
    if (!candles || candles.length === 0) return null;

    const width = 640;
    const height = 240;
    const paddingX = 40;
    const paddingY = 20;

    const minPrice = Math.min(...candles.map((c) => c.low)) * 0.998;
    const maxPrice = Math.max(...candles.map((c) => c.high)) * 1.002;

    const toY = (val: number) => height - paddingY - ((val - minPrice) / (maxPrice - minPrice)) * (height - paddingY * 2);
    const toX = (idx: number) => paddingX + (idx / (candles.length - 1)) * (width - paddingX * 2);

    const emaPoints = candles.map((c, idx) => ({ x: toX(idx), y: toY((c.open + c.close + c.high + c.low) / 4) }));
    const emaPath = emaPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');

    return (
      <svg className="w-full h-64 select-none" viewBox={`0 0 ${width} ${height}`}>
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

        {showIndicators && (
          <path d={emaPath} fill="none" stroke="#0284c7" strokeWidth="1.8" strokeDasharray="2 2" />
        )}

        {candles.map((c, idx) => {
          const x = toX(idx);
          const isGreen = c.close >= c.open;
          const candleColor = isGreen ? '#10b981' : '#e11d48';

          const openY = toY(c.open);
          const closeY = toY(c.close);
          const highY = toY(c.high);
          const lowY = toY(c.low);

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(3, Math.abs(closeY - openY));

          return (
            <g key={idx}>
              <line x1={x} y1={highY} x2={x} y2={lowY} stroke={candleColor} strokeWidth="1.5" />
              <rect x={x - 8} y={bodyTop} width="16" height={bodyHeight} fill={candleColor} rx="1" />
            </g>
          );
        })}

        <text x={paddingX} y={paddingY + 10} fontSize="10" fill="#64748b" fontWeight="bold">
          High: {selectedStock.exchange === 'NASDAQ' ? '$' : '₹'}{selectedStock.high}
        </text>
        <text x={paddingX} y={height - paddingY - 4} fontSize="10" fill="#64748b" fontWeight="bold">
          Low: {selectedStock.exchange === 'NASDAQ' ? '$' : '₹'}{selectedStock.low}
        </text>
        <text x={width - paddingX} y={toY(selectedStock.price) - 4} fontSize="11" fill="#001A8C" fontWeight="bold" textAnchor="end" className="font-mono">
          LTP: {selectedStock.exchange === 'NASDAQ' ? '$' : '₹'}{selectedStock.price}
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Smart Order Routing & Arbitrage Optimization Bar */}
      {hasDualListing && (
        <div className="bg-gradient-to-r from-blue-900 via-[#001A8C] to-slate-900 text-white rounded-xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm border border-blue-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                  Smart Order Routing (SOR) Optimization
                </span>
                <span className="text-[10px] font-mono bg-blue-800/80 px-1.5 py-0.2 rounded border border-blue-600">
                  Best Execution Algorithm
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-0.5 font-mono">
                {selectedStock.symbol} Live Quotes:{' '}
                <span className="text-white font-bold">BSE ₹{selectedStock.bsePrice}</span> vs{' '}
                <span className="text-white font-bold">NSE ₹{selectedStock.nsePrice}</span> ·{' '}
                <span className="text-emerald-300 font-bold">
                  Spread: {selectedStock.arbitrageSpread && selectedStock.arbitrageSpread >= 0 ? '+' : ''}
                  ₹{selectedStock.arbitrageSpread}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-sky-200 block uppercase">Optimal Route</span>
              <strong className="text-emerald-400">
                {orderAction === 'BUY' ? `Buy on ${bestBuyExchange}` : `Sell on ${bestSellExchange}`} (Save ₹{priceImprovement.toFixed(2)})
              </strong>
            </div>
            <button
              onClick={() => {
                setOrderType('SMART_ROUTER');
              }}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-xs"
            >
              Route Best Price
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Layout: Watchlist (Left) | Interactive Chart & Depth (Center) | Execution Desk (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Watchlist & Search */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[660px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Multi-Exchange Watchlist
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {stocks.length} Tickers Active
              </span>
            </div>

            {/* Exchange Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setExchangeFilter('ALL')}
                className={`flex-1 py-1 rounded-md transition-colors cursor-pointer text-center text-[11px] ${
                  exchangeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ALL ({stocks.length})
              </button>
              <button
                onClick={() => setExchangeFilter('BSE')}
                className={`flex-1 py-1 rounded-md transition-colors cursor-pointer text-center text-[11px] ${
                  exchangeFilter === 'BSE' ? 'bg-amber-100 text-amber-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                BSE ({bseCount})
              </button>
              <button
                onClick={() => setExchangeFilter('NSE')}
                className={`flex-1 py-1 rounded-md transition-colors cursor-pointer text-center text-[11px] ${
                  exchangeFilter === 'NSE' ? 'bg-blue-100 text-blue-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                NSE ({nseCount})
              </button>
              <button
                onClick={() => setExchangeFilter('NASDAQ')}
                className={`flex-1 py-1 rounded-md transition-colors cursor-pointer text-center text-[11px] ${
                  exchangeFilter === 'NASDAQ' ? 'bg-purple-100 text-purple-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                US ({nasdaqCount})
              </button>
            </div>

            <input
              type="text"
              placeholder="Search BSE / NSE / NASDAQ stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C]"
            />
          </div>

          {/* Watchlist Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredStocks.map((stock) => {
              const isSelected = selectedStock.symbol === stock.symbol;
              const isPositive = stock.change >= 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    onSelectStock(stock);
                    setSelectedExchange(stock.exchange);
                  }}
                  className={`p-3 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-blue-50/60 border-l-4 border-l-[#001A8C]' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{stock.symbol}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          stock.exchange === 'BSE'
                            ? 'bg-amber-100 text-amber-800'
                            : stock.exchange === 'NSE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {stock.exchange}
                      </span>
                      {stock.bsePrice && stock.nsePrice && (
                        <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                          Dual SOR
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                      {stock.name}
                    </div>
                    {stock.sector && (
                      <span className="text-[9px] font-mono text-slate-400 block">
                        {stock.sector}
                      </span>
                    )}
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {stock.exchange === 'NASDAQ' ? '$' : '₹'}
                      {stock.price.toLocaleString()}
                    </div>
                    <div
                      className={`text-[11px] font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {stock.changePercent}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Live Candlestick & Technical Analysis Chart / Dual Depth */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[660px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {selectedStock.symbol}
                  </h2>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      selectedStock.exchange === 'BSE'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedStock.exchange === 'NSE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedStock.exchange}
                  </span>
                  {selectedStock.sector && (
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {selectedStock.sector}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate max-w-xs">
                  {selectedStock.name}
                </div>
              </div>

              <div className="pl-3 border-l border-slate-200 font-mono">
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                  {selectedStock.exchange === 'NASDAQ' ? '$' : '₹'}
                  {selectedStock.price.toLocaleString()}
                </span>
                <span
                  className={`ml-2 text-xs font-bold tabular-nums ${
                    selectedStock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {selectedStock.change >= 0 ? '+' : ''}
                  {selectedStock.change} ({selectedStock.changePercent}%)
                </span>
              </div>
            </div>

            {/* View Mode & Timeframe */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-0.5 bg-slate-200 rounded text-xs font-bold">
                <button
                  onClick={() => setCenterViewMode('chart')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${
                    centerViewMode === 'chart' ? 'bg-white text-[#001A8C] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Chart
                </button>
                <button
                  onClick={() => setCenterViewMode('dual-depth')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${
                    centerViewMode === 'dual-depth' ? 'bg-white text-[#001A8C] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Dual L2 Depth
                </button>
              </div>

              {centerViewMode === 'chart' && (
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded text-xs font-mono font-bold">
                  {(['1m', '5m', '15m', '1D'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        chartTimeframe === tf ? 'bg-white text-[#001A8C] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chart Canvas OR Dual Market Depth */}
          {centerViewMode === 'chart' ? (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>{renderChart()}</div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs font-mono text-center">
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block text-[10px]">Day High</span>
                  <strong className="text-slate-800">{selectedStock.high}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block text-[10px]">Day Low</span>
                  <strong className="text-slate-800">{selectedStock.low}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block text-[10px]">Volume</span>
                  <strong className="text-slate-800">{selectedStock.volume}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block text-[10px]">P/E Ratio</span>
                  <strong className="text-slate-800">{selectedStock.peRatio || '28.4'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div>
                <div className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Cross-Exchange Consolidated Level-2 Book</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Dual Quotes Streaming
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* BSE Depth Book */}
                  <div className="p-3 border border-amber-200 bg-amber-50/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-amber-900 font-bold border-b border-amber-200 pb-1">
                      <span>BSE Order Book</span>
                      <span>LTP: ₹{selectedStock.bsePrice || selectedStock.price}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <div className="text-emerald-700 font-bold border-b border-slate-200 pb-0.5 flex justify-between">
                          <span>BID QTY</span>
                          <span>BID (₹)</span>
                        </div>
                        {[
                          { qty: 850, price: selectedStock.bsePrice || selectedStock.price },
                          { qty: 1400, price: Math.round(((selectedStock.bsePrice || selectedStock.price) - 0.5) * 10) / 10 },
                          { qty: 2200, price: Math.round(((selectedStock.bsePrice || selectedStock.price) - 1.0) * 10) / 10 },
                          { qty: 3100, price: Math.round(((selectedStock.bsePrice || selectedStock.price) - 1.5) * 10) / 10 },
                        ].map((b, i) => (
                          <div key={i} className="flex justify-between text-slate-700 py-0.5">
                            <span className="text-emerald-600 font-semibold">{b.qty}</span>
                            <span>{b.price}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="text-rose-700 font-bold border-b border-slate-200 pb-0.5 flex justify-between">
                          <span>ASK (₹)</span>
                          <span>ASK QTY</span>
                        </div>
                        {[
                          { price: Math.round(((selectedStock.bsePrice || selectedStock.price) + 0.3) * 10) / 10, qty: 620 },
                          { price: Math.round(((selectedStock.bsePrice || selectedStock.price) + 0.8) * 10) / 10, qty: 1100 },
                          { price: Math.round(((selectedStock.bsePrice || selectedStock.price) + 1.2) * 10) / 10, qty: 1900 },
                          { price: Math.round(((selectedStock.bsePrice || selectedStock.price) + 1.8) * 10) / 10, qty: 2600 },
                        ].map((a, i) => (
                          <div key={i} className="flex justify-between text-slate-700 py-0.5">
                            <span>{a.price}</span>
                            <span className="text-rose-600 font-semibold">{a.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* NSE Depth Book */}
                  <div className="p-3 border border-blue-200 bg-blue-50/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-blue-900 font-bold border-b border-blue-200 pb-1">
                      <span>NSE Order Book</span>
                      <span>LTP: ₹{selectedStock.nsePrice || selectedStock.price}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <div className="text-emerald-700 font-bold border-b border-slate-200 pb-0.5 flex justify-between">
                          <span>BID QTY</span>
                          <span>BID (₹)</span>
                        </div>
                        {[
                          { qty: 1500, price: selectedStock.nsePrice || selectedStock.price },
                          { qty: 2800, price: Math.round(((selectedStock.nsePrice || selectedStock.price) - 0.4) * 10) / 10 },
                          { qty: 3900, price: Math.round(((selectedStock.nsePrice || selectedStock.price) - 0.9) * 10) / 10 },
                          { qty: 5200, price: Math.round(((selectedStock.nsePrice || selectedStock.price) - 1.4) * 10) / 10 },
                        ].map((b, i) => (
                          <div key={i} className="flex justify-between text-slate-700 py-0.5">
                            <span className="text-emerald-600 font-semibold">{b.qty}</span>
                            <span>{b.price}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="text-rose-700 font-bold border-b border-slate-200 pb-0.5 flex justify-between">
                          <span>ASK (₹)</span>
                          <span>ASK QTY</span>
                        </div>
                        {[
                          { price: Math.round(((selectedStock.nsePrice || selectedStock.price) + 0.2) * 10) / 10, qty: 980 },
                          { price: Math.round(((selectedStock.nsePrice || selectedStock.price) + 0.6) * 10) / 10, qty: 1800 },
                          { price: Math.round(((selectedStock.nsePrice || selectedStock.price) + 1.1) * 10) / 10, qty: 2700 },
                          { price: Math.round(((selectedStock.nsePrice || selectedStock.price) + 1.6) * 10) / 10, qty: 3800 },
                        ].map((a, i) => (
                          <div key={i} className="flex justify-between text-slate-700 py-0.5">
                            <span>{a.price}</span>
                            <span className="text-rose-600 font-semibold">{a.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basis & Derivatives Data if available */}
              {selectedStock.futuresPrice && (
                <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cash-to-Futures Near Month Basis:</span>
                    <strong className="text-emerald-400">+₹{selectedStock.basisSpread} (+{((selectedStock.basisSpread! / selectedStock.price) * 100).toFixed(2)}%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annualized Carry Yield:</span>
                    <strong className="text-sky-300">{selectedStock.annualizedCarryYield}% p.a. (Risk-Free)</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Level 2 Market Depth Summary Bar */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{selectedStock.exchange} Consolidated Depth</span>
              <span className="text-slate-400 font-mono">Bids: 58% | Asks: 42%</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex justify-between text-slate-700 text-[11px]">
                <span className="text-emerald-600 font-bold">Total Bid Qty: 42,500</span>
                <span>Best Bid: ₹{selectedStock.price}</span>
              </div>
              <div className="flex justify-between text-slate-700 text-[11px]">
                <span>Best Ask: ₹{Math.round((selectedStock.price + 0.3) * 10) / 10}</span>
                <span className="text-rose-600 font-bold">Total Ask Qty: 31,200</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Advanced Execution Desk (Market Optimizations) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[660px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Execution Desk
              </span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                5paisa FIX API
              </span>
            </div>
          </div>

          <form onSubmit={handleOrderSubmit} className="p-4 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-3.5">
              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setOrderAction('BUY')}
                  className={`py-2 rounded-lg transition-colors cursor-pointer text-center ${
                    orderAction === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setOrderAction('SELL')}
                  className={`py-2 rounded-lg transition-colors cursor-pointer text-center ${
                    orderAction === 'SELL'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Target Exchange */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exchange Routing
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono font-semibold">
                  {(['BSE', 'NSE', 'NASDAQ'] as const).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setSelectedExchange(ex)}
                      className={`py-1.5 rounded-lg border text-center cursor-pointer ${
                        selectedExchange === ex
                          ? 'bg-blue-50 border-[#001A8C] text-[#001A8C] font-bold'
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Algorithm Optimization (Order Types) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Execution Algorithm Optimization
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] bg-white font-semibold text-slate-800"
                >
                  <option value="SMART_ROUTER">Smart Order Routing (Auto BSE/NSE Best Fill)</option>
                  <option value="MARKET">Market Execution (Direct Fill)</option>
                  <option value="LIMIT">Limit Order (Resting Book)</option>
                  <option value="SL">Stoploss Trigger (SL-M)</option>
                  <option value="ICEBERG">Iceberg Order (Slice Quantities)</option>
                  <option value="TWAP">TWAP (Time-Weighted Slices)</option>
                  <option value="SNIPE_PEGGED">Pegged Midpoint Snipe</option>
                </select>
              </div>

              {/* Product Type (MIS Intraday vs CNC Delivery) */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setProductType('MIS')}
                  className={`py-1.5 rounded-lg border text-center cursor-pointer ${
                    productType === 'MIS'
                      ? 'bg-blue-50 border-[#001A8C] text-[#001A8C]'
                      : 'border-slate-300 text-slate-600'
                  }`}
                >
                  MIS (5x Leverage)
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('CNC')}
                  className={`py-1.5 rounded-lg border text-center cursor-pointer ${
                    productType === 'CNC'
                      ? 'bg-blue-50 border-[#001A8C] text-[#001A8C]'
                      : 'border-slate-300 text-slate-600'
                  }`}
                >
                  CNC (Cash Delivery)
                </button>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Quantity
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Lot: 1</span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] font-mono font-bold"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[25, 50, 100, 250].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setOrderQty(q)}
                      className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono cursor-pointer"
                    >
                      +{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price if Limit */}
              {orderType === 'LIMIT' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Limit Price
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] font-mono font-bold"
                  />
                </div>
              )}
            </div>

            {/* Margin Calculation & Submit */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="text-xs font-mono space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Target Route:</span>
                  <strong className="text-emerald-700 font-bold">{targetExchange} via 5paisa</strong>
                </div>
                <div className="flex justify-between">
                  <span>Req Margin ({leverage}x):</span>
                  <strong className="text-slate-900">
                    {selectedStock.exchange === 'NASDAQ' ? '$' : '₹'}
                    {requiredMargin.toLocaleString()}
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 px-4 text-xs font-extrabold text-white rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  orderAction === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <span>{orderAction} {orderQty} {selectedStock.symbol} on {targetExchange}</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Pane: Open Positions & Order Book & Arbitrage Monitor & Basis Carry */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBottomTab('positions')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                bottomTab === 'positions'
                  ? 'bg-[#001A8C] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open Positions ({positions.length})
            </button>
            <button
              onClick={() => setBottomTab('orders')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                bottomTab === 'orders'
                  ? 'bg-[#001A8C] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Book ({orders.length})
            </button>
            <button
              onClick={() => setBottomTab('arbitrage')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                bottomTab === 'arbitrage'
                  ? 'bg-[#001A8C] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BSE vs NSE Arbitrage Monitor
            </button>
            <button
              onClick={() => setBottomTab('basis-carry')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                bottomTab === 'basis-carry'
                  ? 'bg-[#001A8C] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cash-Futures Basis Yields
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span>
              Total Net P&L:{' '}
              <strong
                className={`text-sm tabular-nums ${
                  totalPnl >= 0 ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'
                }`}
              >
                {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {bottomTab === 'positions' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono">
                  <th className="py-2.5 px-4">Instrument</th>
                  <th className="py-2.5 px-4">Exchange</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4 text-right">Qty</th>
                  <th className="py-2.5 px-4 text-right">Avg Price</th>
                  <th className="py-2.5 px-4 text-right">LTP</th>
                  <th className="py-2.5 px-4 text-right">Net P&L</th>
                  <th className="py-2.5 px-4 text-right">P&L %</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                      No active open positions. Place an order above.
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => {
                    const isPositive = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{pos.symbol}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.exchange === 'BSE'
                                ? 'bg-amber-100 text-amber-800'
                                : pos.exchange === 'NSE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {pos.exchange}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{pos.product}</td>
                        <td className="py-3 px-4 text-right font-bold">{pos.quantity}</td>
                        <td className="py-3 px-4 text-right">{pos.avgPrice}</td>
                        <td className="py-3 px-4 text-right font-bold">{pos.currentPrice}</td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {pos.exchange === 'NASDAQ' ? '$' : '₹'}
                          {pos.pnl.toLocaleString()}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {pos.pnlPercent}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onSquareOffPosition(pos.id)}
                            className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 rounded transition-colors cursor-pointer"
                          >
                            Square Off
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {bottomTab === 'orders' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono">
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Instrument</th>
                  <th className="py-2.5 px-4">Exchange</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Order Algorithm</th>
                  <th className="py-2.5 px-4 text-right">Qty</th>
                  <th className="py-2.5 px-4 text-right">Price</th>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{ord.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{ord.symbol}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{ord.exchange}</td>
                    <td
                      className={`py-3 px-4 font-bold ${
                        ord.type === 'BUY' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {ord.type}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {ord.orderType}
                      {ord.sorExchangeExecuted && (
                        <span className="text-[10px] text-emerald-600 ml-1">
                          (Filled on {ord.sorExchangeExecuted})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">{ord.quantity}</td>
                    <td className="py-3 px-4 text-right font-bold">{ord.price}</td>
                    <td className="py-3 px-4 text-slate-500">{ord.timestamp}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.status === 'EXECUTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ord.status === 'OPEN'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ord.status === 'OPEN' ? (
                        <button
                          onClick={() => onCancelOrder(ord.id)}
                          className="px-2 py-0.5 text-[10px] text-slate-600 hover:text-rose-600 border border-slate-300 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {bottomTab === 'arbitrage' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono">
                  <th className="py-2.5 px-4">Dual Listed Ticker</th>
                  <th className="py-2.5 px-4 text-right">BSE Quote (₹)</th>
                  <th className="py-2.5 px-4 text-right">NSE Quote (₹)</th>
                  <th className="py-2.5 px-4 text-right">Arbitrage Delta</th>
                  <th className="py-2.5 px-4 text-center">Recommended Action</th>
                  <th className="py-2.5 px-4 text-right">1-Click Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {stocks
                  .filter((s) => s.bsePrice && s.nsePrice)
                  .map((stock) => {
                    const diff = Math.round((stock.nsePrice! - stock.bsePrice!) * 100) / 100;
                    const isNseHigher = diff > 0;
                    return (
                      <tr key={stock.symbol} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{stock.symbol}</td>
                        <td className="py-3 px-4 text-right font-semibold">₹{stock.bsePrice}</td>
                        <td className="py-3 px-4 text-right font-semibold">₹{stock.nsePrice}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          ₹{Math.abs(diff).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center text-[11px]">
                          {isNseHigher ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                              Buy BSE @ ₹{stock.bsePrice} → Sell NSE @ ₹{stock.nsePrice}
                            </span>
                          ) : (
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                              Buy NSE @ ₹{stock.nsePrice} → Sell BSE @ ₹{stock.bsePrice}
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
                                quantity: 25,
                                price: isNseHigher ? stock.bsePrice! : stock.nsePrice!,
                                sorExchangeExecuted: isNseHigher ? 'BSE' : 'NSE',
                              });
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-[#001A8C] hover:bg-blue-50 border border-blue-200 rounded cursor-pointer"
                          >
                            Capture Spread →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {bottomTab === 'basis-carry' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono">
                  <th className="py-2.5 px-4">Instrument</th>
                  <th className="py-2.5 px-4 text-right">Spot Price (₹)</th>
                  <th className="py-2.5 px-4 text-right">Near Futures (₹)</th>
                  <th className="py-2.5 px-4 text-right">Basis Spread</th>
                  <th className="py-2.5 px-4 text-right">Annualized Yield</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Execute</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {stocks
                  .filter((s) => s.futuresPrice && s.basisSpread)
                  .map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{stock.symbol}</td>
                      <td className="py-3 px-4 text-right font-semibold">₹{stock.price}</td>
                      <td className="py-3 px-4 text-right font-semibold">₹{stock.futuresPrice}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700">+₹{stock.basisSpread}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                        {stock.annualizedCarryYield}% p.a.
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          Risk-Free Convergence
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            onPlaceOrder({
                              symbol: `${stock.symbol} CARRY PAIR`,
                              exchange: 'NSE',
                              type: 'BUY',
                              orderType: 'SMART_ROUTER',
                              product: 'NRML',
                              quantity: 50,
                              price: stock.price,
                            });
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#001A8C] text-white rounded cursor-pointer"
                        >
                          Lock Yield →
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
