import React, { useState } from 'react';
import { Stock, Order } from '../types';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  onPlaceOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
  availableCash: number;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  stocks,
  onPlaceOrder,
  availableCash,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(stocks[0]?.symbol || 'RELIANCE');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'SL'>('MARKET');
  const [product, setProduct] = useState<'MIS' | 'CNC'>('MIS');
  const [quantity, setQuantity] = useState(10);
  const [customPrice, setCustomPrice] = useState<number>(stocks[0]?.price || 100);

  if (!isOpen) return null;

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const execPrice = orderType === 'MARKET' ? currentStock.price : customPrice;
  const leverage = product === 'MIS' ? 5 : 1;
  const requiredMargin = Math.round(((quantity * execPrice) / leverage) * 10) / 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder({
      symbol: currentStock.symbol,
      exchange: currentStock.exchange,
      type,
      orderType,
      product,
      quantity,
      price: execPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Quick Multi-Exchange Order Ticket
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Buy/Sell toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`py-2 rounded-lg font-bold cursor-pointer transition-colors ${
                type === 'BUY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`py-2 rounded-lg font-bold cursor-pointer transition-colors ${
                type === 'SELL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              SELL
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Instrument Symbol
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => {
                setSelectedSymbol(e.target.value);
                const st = stocks.find((s) => s.symbol === e.target.value);
                if (st) setCustomPrice(st.price);
              }}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] bg-white font-mono font-bold"
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} ({s.exchange}) - {s.exchange === 'NASDAQ' ? '$' : '₹'}{s.price}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product Type
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium"
              >
                <option value="MIS">Intraday (MIS 5x)</option>
                <option value="CNC">Delivery (CNC 1x)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium"
              >
                <option value="MARKET">Market</option>
                <option value="LIMIT">Limit</option>
                <option value="SL">Stoploss</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.05"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? currentStock.price : customPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none font-mono font-bold disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between font-mono">
            <span>Required Margin ({leverage}x):</span>
            <strong className="text-slate-900">
              {currentStock.exchange === 'NASDAQ' ? '$' : '₹'}
              {requiredMargin.toLocaleString()}
            </strong>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 font-bold text-white rounded-lg cursor-pointer ${
                type === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm {type} {quantity} {currentStock.symbol}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
