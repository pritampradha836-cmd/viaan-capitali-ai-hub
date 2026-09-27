/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TradingTerminal } from './components/TradingTerminal';
import { MarketOptimizations } from './components/MarketOptimizations';
import { FandODesk } from './components/FandODesk';
import { ThematicBaskets } from './components/ThematicBaskets';
import { QuantDataScience } from './components/QuantDataScience';
import { AutomationBots } from './components/AutomationBots';
import { BankingBrokerLinks } from './components/BankingBrokerLinks';
import { AdminConsole } from './components/AdminConsole';
import { TradingChatbot } from './components/TradingChatbot';
import { QuickOrderModal } from './components/QuickOrderModal';
import { VianLogo } from './components/VianLogo';
import {
  INITIAL_STOCKS,
  INITIAL_OPTION_CHAIN,
  INITIAL_BASKETS,
  INITIAL_BOTS,
  INITIAL_BROKER_ACCOUNTS,
  INITIAL_POSITIONS,
  INITIAL_ORDERS,
  INITIAL_ADMIN_SETTINGS,
} from './data/mockMarketData';
import { NavigationTab, Stock, Order, Position, ThematicBasket, TradingBot, BrokerAccount, AdminSettings } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('terminal');
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [selectedStock, setSelectedStock] = useState<Stock>(INITIAL_STOCKS[0]);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [optionChain, setOptionChain] = useState(INITIAL_OPTION_CHAIN);
  const [baskets, setBaskets] = useState<ThematicBasket[]>(INITIAL_BASKETS);
  const [bots, setBots] = useState<TradingBot[]>(INITIAL_BOTS);
  const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>(INITIAL_BROKER_ACCOUNTS);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(INITIAL_ADMIN_SETTINGS);
  const [availableCash, setAvailableCash] = useState<number>(485000);

  // Modals & Chatbot State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time simulated market price ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.49) * (s.price * 0.0015);
          const newPrice = Math.round((s.price + delta) * 100) / 100;
          const newChange = Math.round((s.change + delta) * 100) / 100;
          const newPercent = Math.round(((newChange / (newPrice - newChange)) * 100) * 100) / 100;

          return {
            ...s,
            price: newPrice,
            change: newChange,
            changePercent: newPercent,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Sync selectedStock with updated stock list
  useEffect(() => {
    const updated = stocks.find((s) => s.symbol === selectedStock.symbol);
    if (updated) setSelectedStock(updated);
  }, [stocks]);

  // Order Placement Handler
  const handlePlaceOrder = (newOrderData: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
    const orderId = `ORD-${Math.floor(80000 + Math.random() * 20000)}`;
    const now = new Date().toLocaleTimeString();

    const createdOrder: Order = {
      id: orderId,
      ...newOrderData,
      status: newOrderData.orderType === 'MARKET' ? 'EXECUTED' : 'OPEN',
      timestamp: now,
    };

    setOrders((prev) => [createdOrder, ...prev]);

    // If market order, instantly create / update position
    if (newOrderData.orderType === 'MARKET') {
      const leverage = newOrderData.product === 'MIS' ? adminSettings.intradayLeverage : 1;
      const marginReq = Math.round((newOrderData.quantity * newOrderData.price) / leverage);
      setAvailableCash((prev) => Math.max(0, prev - marginReq));

      const newPos: Position = {
        id: `pos-${Date.now()}`,
        symbol: newOrderData.symbol,
        exchange: newOrderData.exchange,
        product: newOrderData.product,
        quantity: newOrderData.quantity,
        avgPrice: newOrderData.price,
        currentPrice: newOrderData.price,
        pnl: 0,
        pnlPercent: 0,
      };

      setPositions((prev) => [newPos, ...prev]);
      showToast(`Market ${newOrderData.type} order for ${newOrderData.quantity} ${newOrderData.symbol} EXECUTED at ${newOrderData.price}`);
    } else {
      showToast(`Limit order for ${newOrderData.quantity} ${newOrderData.symbol} placed at ${newOrderData.price}`);
    }
  };

  // Square off position
  const handleSquareOffPosition = (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;

    setPositions((prev) => prev.filter((p) => p.id !== posId));
    setAvailableCash((prev) => prev + pos.pnl + (pos.quantity * pos.avgPrice) / 5);
    showToast(`Position in ${pos.symbol} squared off. Realized P&L: ₹${pos.pnl.toLocaleString()}`);
  };

  // Square off all open positions (Kill-Switch)
  const handleSquareOffAll = () => {
    if (positions.length === 0) {
      showToast('No open positions to square off.');
      return;
    }
    const totalRealized = positions.reduce((acc, p) => acc + p.pnl, 0);
    setPositions([]);
    setAvailableCash((prev) => prev + totalRealized);
    showToast(`Emergency RMS: All ${positions.length} positions squared off! Total Realized P&L: ₹${totalRealized.toLocaleString()}`);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
    );
    showToast(`Order ${orderId} has been cancelled.`);
  };

  // Basket 1-Click Investment Handler
  const handleInvestInBasket = (basket: ThematicBasket) => {
    if (availableCash < basket.minInvestment) {
      showToast(`Insufficient cash. Required: ₹${basket.minInvestment.toLocaleString()}, Available: ₹${availableCash.toLocaleString()}`);
      return;
    }

    setAvailableCash((prev) => prev - basket.minInvestment);

    const newPositions: Position[] = basket.constituents.map((c) => ({
      id: `pos-${Date.now()}-${c.symbol}`,
      symbol: c.symbol,
      exchange: basket.exchange === 'NASDAQ' ? 'NASDAQ' : 'NSE',
      product: 'CNC',
      quantity: c.shares,
      avgPrice: c.price,
      currentPrice: c.price,
      pnl: 0,
      pnlPercent: 0,
    }));

    setPositions((prev) => [...newPositions, ...prev]);
    showToast(`1-Click Invest Complete: All ${basket.constituents.length} stocks in "${basket.name}" added to portfolio!`);
    setCurrentTab('terminal');
  };

  // F&O Strategy Deployment Handler
  const handleDeployOptionStrategy = (name: string, legs: any[]) => {
    const newPos: Position = {
      id: `opt-${Date.now()}`,
      symbol: `NIFTY ${name.toUpperCase()} SPREAD`,
      exchange: 'NSE',
      product: 'NRML',
      quantity: 100,
      avgPrice: 226.5,
      currentPrice: 226.5,
      pnl: 0,
      pnlPercent: 0,
      isOption: true,
    };
    setPositions((prev) => [newPos, ...prev]);
    showToast(`Multi-Leg ${name} deployed successfully! Position active in derivatives ledger.`);
    setCurrentTab('terminal');
  };

  // Bot Toggle Handler
  const handleToggleBot = (botId: string) => {
    setBots((prev) =>
      prev.map((b) =>
        b.id === botId
          ? { ...b, status: b.status === 'RUNNING' ? 'PAUSED' : 'RUNNING' }
          : b
      )
    );
  };

  const handleCreateBot = (newBot: Omit<TradingBot, 'id' | 'pnl' | 'tradesToday'>) => {
    setBots((prev) => [
      {
        ...newBot,
        id: `bot-${Date.now()}`,
        pnl: 0,
        tradesToday: 0,
      },
      ...prev,
    ]);
    showToast(`New Algorithmic Bot "${newBot.name}" deployed and active!`);
  };

  // Banking Handlers
  const handleDepositFunds = (amount: number) => {
    setAvailableCash((prev) => prev + amount);
  };

  const handleWithdrawFunds = (amount: number) => {
    setAvailableCash((prev) => Math.max(0, prev - amount));
  };

  const handleToggleBroker = (brokerName: string) => {
    setBrokerAccounts((prev) =>
      prev.map((b) =>
        b.broker === brokerName
          ? { ...b, status: b.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' }
          : b
      )
    );
    showToast(`Broker connection status updated for ${brokerName}.`);
  };

  // Autonomous Chatbot Action Execution Handler
  const handleExecuteAIAction = (action: any) => {
    if (!action) return;

    if (action.action === 'PLACE_ORDER') {
      const stock = stocks.find((s) => s.symbol.toUpperCase() === action.symbol.toUpperCase()) || stocks[0];
      handlePlaceOrder({
        symbol: stock.symbol,
        exchange: stock.exchange,
        type: action.type || 'BUY',
        orderType: action.orderType || 'MARKET',
        product: 'MIS',
        quantity: action.quantity || 10,
        price: stock.price,
      });
    } else if (action.action === 'DEPLOY_STRATEGY') {
      handleDeployOptionStrategy(action.name || 'Iron Condor', []);
    } else if (action.action === 'RUN_BACKTEST') {
      setCurrentTab('quant');
      showToast(`Quant Lab loaded for strategy: ${action.strategy}`);
    } else if (action.action === 'SQUARE_OFF_ALL') {
      handleSquareOffAll();
    } else if (action.action === 'LINK_BROKER') {
      setCurrentTab('banking');
      showToast(`Navigated to Banking & 5paisa Gateway Settings.`);
    }
  };

  const activeBrokerAccount = brokerAccounts.find((b) => b.status === 'CONNECTED') || brokerAccounts[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-blue-600/20 selection:text-[#001A8C]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 bg-slate-900 text-white text-xs font-mono rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with 3-Zone Contract and Ticker Tape */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        stocks={stocks}
        availableMargin={availableCash}
        activeBroker={activeBrokerAccount.broker}
        onQuickOrderClick={() => setIsQuickOrderOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'terminal' && (
          <TradingTerminal
            stocks={stocks}
            selectedStock={selectedStock}
            onSelectStock={(s) => setSelectedStock(s)}
            positions={positions}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            onSquareOffPosition={handleSquareOffPosition}
            onCancelOrder={handleCancelOrder}
            availableCash={availableCash}
          />
        )}

        {currentTab === 'optimizations' && (
          <MarketOptimizations
            stocks={stocks}
            onPlaceOrder={handlePlaceOrder}
            availableCash={availableCash}
          />
        )}

        {currentTab === 'fand-o' && (
          <FandODesk
            optionChain={optionChain}
            spotPrice={stocks[0].price}
            onDeployStrategy={handleDeployOptionStrategy}
          />
        )}

        {currentTab === 'baskets' && (
          <ThematicBaskets
            baskets={baskets}
            onInvestInBasket={handleInvestInBasket}
            availableCash={availableCash}
          />
        )}

        {currentTab === 'quant' && <QuantDataScience />}

        {currentTab === 'automation' && (
          <AutomationBots
            bots={bots}
            onToggleBot={handleToggleBot}
            onCreateBot={handleCreateBot}
          />
        )}

        {currentTab === 'banking' && (
          <BankingBrokerLinks
            brokerAccounts={brokerAccounts}
            availableCash={availableCash}
            onDepositFunds={handleDepositFunds}
            onWithdrawFunds={handleWithdrawFunds}
            onToggleBroker={handleToggleBroker}
          />
        )}

        {currentTab === 'admin' && (
          <AdminConsole
            settings={adminSettings}
            onUpdateSettings={(s) => {
              setAdminSettings(s);
              showToast('Admin RMS settings updated.');
            }}
            onSquareOffAll={handleSquareOffAll}
          />
        )}
      </main>

      {/* Floating AI Trading Copilot Chatbot */}
      <TradingChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onExecuteAction={handleExecuteAIAction}
        stocks={stocks}
        availableCash={availableCash}
      />

      {/* Floating Quick Order Ticket Modal */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        stocks={stocks}
        onPlaceOrder={handlePlaceOrder}
        availableCash={availableCash}
      />

      {/* Floating Trigger for AI Chat if closed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-[#001A8C] hover:bg-[#00146e] text-white p-3.5 rounded-full shadow-2xl transition-transform hover:scale-105 cursor-pointer flex items-center gap-2"
          title="Open AI Trading Assistant"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-extrabold pr-1">Quant AI</span>
        </button>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2 font-sans">
            <VianLogo size="sm" showText={false} />
            <span className="font-bold text-[#001A8C]">VIAN CAPITAL MARKETS</span>
            <span>·</span>
            <span>Multi-Exchange Quantitative & F&O Trading Terminal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>SEBI Reg No: INZ00028423</span>
            <span>·</span>
            <span>5paisa API Gateway: Connected</span>
            <span>·</span>
            <span>NASDAQ FIX 4.4: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
