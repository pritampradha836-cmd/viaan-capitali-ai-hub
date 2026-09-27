import React, { useState } from 'react';
import { Stock, Order, Position } from '../types';

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
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'NSE' | 'NASDAQ'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartTimeframe, setChartTimeframe] = useState<'1m' | '5m' | '15m' | '1D'>('15m');
  const [showIndicators, setShowIndicators] = useState(true);

  // Order Ticket state
  const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'SL'>('MARKET');
  const [productType, setProductType] = useState<'MIS' | 'CNC'>('MIS');
  const [orderQty, setOrderQty] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(selectedStock.price);
  const [triggerPrice, setTriggerPrice] = useState<number>(Math.round(selectedStock.price * 0.98 * 10) / 10);
  const [bottomTab, setBottomTab] = useState<'positions' | 'orders'>('positions');

  const filteredStocks = stocks.filter((s) => {
    const matchesExchange = exchangeFilter === 'ALL' || s.exchange === exchangeFilter;
    const matchesSearch =
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExchange && matchesSearch;
  });

  const leverage = productType === 'MIS' ? 5 : 1;
  const executionPrice = orderType === 'MARKET' ? selectedStock.price : limitPrice;
  const estimatedTotal = orderQty * executionPrice;
  const requiredMargin = Math.round((estimatedTotal / leverage) * 10) / 10;

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder({
      symbol: selectedStock.symbol,
      exchange: selectedStock.exchange,
      type: orderAction,
      orderType,
      product: productType,
      quantity: orderQty,
      price: executionPrice,
      triggerPrice: orderType === 'SL' ? triggerPrice : undefined,
    });
  };

  // Total Realized & Unrealized P&L
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

    // EMA Curve
    const emaPoints = candles.map((c, idx) => ({ x: toX(idx), y: toY((c.open + c.close + c.high + c.low) / 4) }));
    const emaPath = emaPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');

    return (
      <svg className="w-full h-64 select-none" viewBox={`0 0 ${width} ${height}`}>
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

        {/* 20 EMA Line */}
        {showIndicators && (
          <path d={emaPath} fill="none" stroke="#0284c7" strokeWidth="1.8" strokeDasharray="2 2" />
        )}

        {/* Candlesticks */}
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
              {/* Wick */}
              <line x1={x} y1={highY} x2={x} y2={lowY} stroke={candleColor} strokeWidth="1.5" />
              {/* Body */}
              <rect
                x={x - 8}
                y={bodyTop}
                width="16"
                height={bodyHeight}
                fill={candleColor}
                rx="1"
              />
            </g>
          );
        })}

        {/* Axes prices */}
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
      {/* 3-Column Layout: Watchlist (Left) | Interactive Chart & Depth (Center) | Order Placement Desk (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Watchlist & Search */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[620px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Market Watchlist
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Live Feed
              </span>
            </div>

            {/* Exchange Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              {(['ALL', 'NSE', 'NASDAQ'] as const).map((ex) => (
                <button
                  key={ex}
                  onClick={() => setExchangeFilter(ex)}
                  className={`flex-1 py-1 rounded-md transition-colors cursor-pointer text-center ${
                    exchangeFilter === ex ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search ticker, company..."
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
                  onClick={() => onSelectStock(stock)}
                  className={`p-3 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-blue-50/50 border-l-4 border-l-[#001A8C]' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{stock.symbol}</span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                        {stock.exchange}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {stock.name}
                    </div>
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

        {/* Column 2: Live Candlestick & Technical Analysis Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[620px] overflow-hidden">
          {/* Header with active ticker stats */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {selectedStock.symbol}
                  </h2>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                    {selectedStock.exchange}
                  </span>
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

            {/* Timeframe & indicator toggles */}
            <div className="flex items-center gap-2">
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

              <button
                onClick={() => setShowIndicators(!showIndicators)}
                className={`px-2.5 py-1 text-xs font-semibold rounded border cursor-pointer ${
                  showIndicators
                    ? 'bg-blue-50 border-blue-300 text-[#001A8C]'
                    : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                20 EMA
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
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

          {/* Level 2 Market Depth (Bid vs Ask) */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Market Depth (Level 2)</span>
              <span className="text-slate-400 font-mono">Bids: 54% | Asks: 46%</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-emerald-700 font-bold border-b border-emerald-100 pb-0.5">
                  <span>BID QTY</span>
                  <span>BID PRICE</span>
                </div>
                {[
                  { qty: 450, price: selectedStock.price },
                  { qty: 1200, price: Math.round((selectedStock.price - 0.5) * 10) / 10 },
                  { qty: 850, price: Math.round((selectedStock.price - 1.2) * 10) / 10 },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-slate-700 text-[11px]">
                    <span className="text-emerald-600">{row.qty}</span>
                    <span className="font-semibold">{row.price}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-rose-700 font-bold border-b border-rose-100 pb-0.5">
                  <span>ASK PRICE</span>
                  <span>ASK QTY</span>
                </div>
                {[
                  { price: Math.round((selectedStock.price + 0.3) * 10) / 10, qty: 620 },
                  { price: Math.round((selectedStock.price + 0.8) * 10) / 10, qty: 1450 },
                  { price: Math.round((selectedStock.price + 1.5) * 10) / 10, qty: 980 },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-slate-700 text-[11px]">
                    <span className="font-semibold">{row.price}</span>
                    <span className="text-rose-600">{row.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Fast Order Placement Desk */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[620px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Execution Desk
            </span>

            {/* Buy / Sell Big Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => setOrderAction('BUY')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  orderAction === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setOrderAction('SELL')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  orderAction === 'SELL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SELL
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleOrderSubmit} className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              {/* Product Type (MIS Intraday vs CNC Delivery) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Type
                </label>
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
                    Intraday (MIS 5x)
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
                    Delivery (CNC 1x)
                  </button>
                </div>
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Order Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono font-bold">
                  {(['MARKET', 'LIMIT', 'SL'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1 rounded border text-center cursor-pointer ${
                        orderType === t
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Quantity (Shares)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Lot Size: 1</span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] font-mono font-bold"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[10, 25, 50, 100].map((q) => (
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

              {/* Price (if Limit or SL) */}
              {orderType !== 'MARKET' && (
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

              {/* Trigger Price if SL */}
              {orderType === 'SL' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stoploss Trigger Price
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] font-mono font-bold text-rose-600"
                  />
                </div>
              )}
            </div>

            {/* Margin Calculation & Submit */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="text-xs font-mono space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Req Margin ({leverage}x):</span>
                  <strong className="text-slate-900">
                    {selectedStock.exchange === 'NASDAQ' ? '$' : '₹'}
                    {requiredMargin.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Avail Cash Margin:</span>
                  <span className="text-emerald-600 font-bold">
                    ₹{availableCash.toLocaleString()}
                  </span>
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
                <span>{orderAction} {orderQty} {selectedStock.symbol}</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Pane: Open Positions & Order Book */}
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
          {bottomTab === 'positions' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono">
                  <th className="py-2.5 px-4">Instrument</th>
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
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                      No active open positions. Place an order above.
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => {
                    const isPositive = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {pos.symbol}
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                            ({pos.exchange})
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
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono">
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Instrument</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Order Type</th>
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
                    <td
                      className={`py-3 px-4 font-bold ${
                        ord.type === 'BUY' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {ord.type}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ord.orderType}</td>
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
        </div>
      </div>
    </div>
  );
};
