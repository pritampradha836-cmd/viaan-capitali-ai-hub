export type NavigationTab = 
  | 'terminal'
  | 'fand-o'
  | 'baskets'
  | 'quant'
  | 'automation'
  | 'banking'
  | 'admin';

export type Exchange = 'NSE' | 'BSE' | 'NASDAQ';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  exchange: Exchange;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  peRatio?: number;
  marketCap?: string;
  candles: Candle[];
}

export interface Order {
  id: string;
  symbol: string;
  exchange: Exchange;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'SL';
  product: 'MIS' | 'CNC' | 'NRML';
  quantity: number;
  price: number;
  triggerPrice?: number;
  status: 'EXECUTED' | 'OPEN' | 'CANCELLED';
  timestamp: string;
}

export interface Position {
  id: string;
  symbol: string;
  exchange: Exchange;
  product: 'MIS' | 'CNC' | 'NRML';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  isOption?: boolean;
  optionType?: 'CE' | 'PE';
  strikePrice?: number;
}

export interface OptionStrike {
  strike: number;
  callOi: number;
  callOiChange: number;
  callIv: number;
  callLtp: number;
  callDelta: number;
  callTheta: number;
  callGamma: number;
  callVega: number;
  putLtp: number;
  putIv: number;
  putOiChange: number;
  putOi: number;
  putDelta: number;
  putTheta: number;
  putGamma: number;
  putVega: number;
}

export interface ThematicBasket {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cagr3Y: number;
  volatility: 'Low' | 'Medium' | 'High';
  minInvestment: number;
  exchange: 'NSE' | 'NASDAQ' | 'HYBRID';
  rebalanceCadence: string;
  constituents: Array<{
    symbol: string;
    name: string;
    weight: number;
    price: number;
    shares: number;
  }>;
}

export interface BacktestResult {
  strategy: string;
  symbol: string;
  timeframe: string;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
  netProfitPercent: number;
  sharpeRatio: number;
  description: string;
  equityCurve: Array<{
    tradeIndex: number;
    equity: number;
    benchmark: number;
  }>;
}

export interface BrokerAccount {
  broker: '5paisa' | 'Zerodha' | 'Upstox' | 'InteractiveBrokers';
  accountId: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  apiKey: string;
  linkedBank: string;
  bankAccountNo: string;
  availableCash: number;
  collateralMargin: number;
  utilizedMargin: number;
}

export interface TradingBot {
  id: string;
  name: string;
  strategyType: 'Delta-Neutral' | 'Options Scalper' | 'VWAP Momentum' | 'Breakout';
  status: 'RUNNING' | 'PAUSED';
  targetIndex: string;
  pnl: number;
  tradesToday: number;
  ruleCondition: string;
}

export interface AdminSettings {
  intradayLeverage: number;
  maxDrawdownLimitPct: number;
  circuitBreakerEnabled: boolean;
  autoSquareOffTime: string;
  brokerApiGateway: string;
  brokeragePerOrder: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: any;
}
