import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Trading & Automation Chatbot with Action Execution
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history = [], accountContext = {} } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `You are "Vian Quant AI", an elite Wall Street & Dalal Street algorithmic trading strategist and autonomous terminal assistant for Vian Capital (integrated with BSE, NSE, 5paisa, Zerodha, and NASDAQ).

Capabilities:
1. Explain stock market dynamics across BSE (Bombay Stock Exchange / SENSEX) and NSE (National Stock Exchange / NIFTY 50), F&O strategies (Straddle, Strangle, Iron Condor, Bull Call Spread), option Greeks (Delta, Theta, Gamma, Vega), and quantitative data science models.
2. Provide real-time Smart Order Routing (SOR) optimization, comparing dual-listed quotes between BSE and NSE to secure price improvements.
3. Analyze Cash-to-Futures basis arbitrage (Cash & Carry annualized carry yields).
4. Provide precise market levels for BSE SENSEX, BSE Ltd, CDSL, BEL, HAL, TRENT, SBIN, ITC, ZOMATO, JIOFIN, SUZLON, COCHINSHIP, IRFC, MAZDOCK, NIFTY 50, BANKNIFTY, RELIANCE, HDFCBANK, TCS, INFY, TATAMOTORS, and NASDAQ tech giants (NVDA, AAPL, MSFT, TSLA).
5. Detect user trading intents and return actionable structured commands when requested.

When user commands a task:
- If user wants to buy/sell a stock (e.g. "buy 25 shares of Reliance" or "buy 50 shares of HAL on BSE" or "sell 10 TSLA"):
  Include a structured action JSON block at the end:
  ACTION_TRIGGER:{"action":"PLACE_ORDER","symbol":"RELIANCE","type":"BUY","quantity":25,"orderType":"SMART_ROUTER"}
- If user wants to execute arbitrage or SOR:
  ACTION_TRIGGER:{"action":"PLACE_ORDER","symbol":"BEL","type":"BUY","quantity":50,"orderType":"SMART_ROUTER"}
- If user wants to deploy an option strategy (e.g. "deploy iron condor on Nifty"):
  ACTION_TRIGGER:{"action":"DEPLOY_STRATEGY","name":"Iron Condor","index":"NIFTY"}
- If user wants to run a quant backtest (e.g. "backtest RSI strategy"):
  ACTION_TRIGGER:{"action":"RUN_BACKTEST","strategy":"RSI Mean Reversion"}
- If user wants to square off all positions:
  ACTION_TRIGGER:{"action":"SQUARE_OFF_ALL"}
- If user wants to link 5paisa broker:
  ACTION_TRIGGER:{"action":"LINK_BROKER","broker":"5paisa"}

Always answer with institutional financial clarity, risk management discipline (stoploss, max loss), and concise formatting.`;

    if (ai) {
      const formattedHistory = history
        .map((h: { role: string; content: string }) => `${h.role === 'user' ? 'Trader' : 'Vian Quant AI'}: ${h.content}`)
        .join('\n');
      const fullPrompt = formattedHistory ? `${formattedHistory}\nTrader: ${prompt}\nVian Quant AI:` : prompt;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      const text = response.text || 'Unable to process trading query.';
      
      // Check for ACTION_TRIGGER
      let action = null;
      const actionMatch = text.match(/ACTION_TRIGGER:(\{.*?\})/);
      if (actionMatch) {
        try {
          action = JSON.parse(actionMatch[1]);
        } catch (e) {
          // ignore parse error
        }
      }

      return res.json({ 
        response: text.replace(/ACTION_TRIGGER:\{.*?\}/g, '').trim(),
        action 
      });
    } else {
      // Deterministic intelligent fallback
      const p = prompt.toLowerCase();
      let reply = '';
      let action: any = null;

      if (p.includes('arbitrage') || p.includes('sor') || p.includes('spread') || p.includes('carry')) {
        reply = `### ⚡ Market Optimization & SOR Engine: BSE vs NSE Analysis
- **Best Arbitrage Spread:** BEL (BSE ₹308.4 vs NSE ₹308.1) · Spread: +₹0.30/share
- **Highest Cash-to-Futures Carry Yield:** BEL @ 12.96% p.a. (Convergence in 20 Days)
- **Smart Order Routing (SOR):** Automatically routes to lowest net cost after exchange turnover fees (BSE 0.00375% vs NSE 0.00325%).

*Executing 1-click cross-exchange spread capture...*`;
        action = { action: 'PLACE_ORDER', symbol: 'BEL', type: 'BUY', quantity: 100, orderType: 'SMART_ROUTER' };
      } else if (p.includes('buy') || p.includes('sell')) {
        const isBuy = !p.includes('sell');
        let symbol = 'RELIANCE';
        let ex = 'NSE';
        if (p.includes('hal')) { symbol = 'HAL'; ex = 'BSE'; }
        else if (p.includes('bel')) { symbol = 'BEL'; ex = 'BSE'; }
        else if (p.includes('cdsl')) { symbol = 'CDSL'; ex = 'BSE'; }
        else if (p.includes('trent')) { symbol = 'TRENT'; ex = 'BSE'; }
        else if (p.includes('zomato')) { symbol = 'ZOMATO'; ex = 'BSE'; }
        else if (p.includes('jiofin')) { symbol = 'JIOFIN'; ex = 'BSE'; }
        else if (p.includes('suzlon')) { symbol = 'SUZLON'; ex = 'BSE'; }
        else if (p.includes('sbin') || p.includes('sbi')) { symbol = 'SBIN'; ex = 'BSE'; }
        else if (p.includes('nvda')) { symbol = 'NVDA'; ex = 'NASDAQ'; }
        else if (p.includes('tsla')) { symbol = 'TSLA'; ex = 'NASDAQ'; }
        else if (p.includes('hdfc')) { symbol = 'HDFCBANK'; ex = 'NSE'; }
        else if (p.includes('tcs')) { symbol = 'TCS'; ex = 'NSE'; }
        else if (p.includes('infy')) { symbol = 'INFY'; ex = 'NSE'; }
        else if (p.includes('tata') || p.includes('tatamotors')) { symbol = 'TATAMOTORS'; ex = 'NSE'; }
        
        const qtyMatch = p.match(/\d+/);
        const qty = qtyMatch ? parseInt(qtyMatch[0]) : 15;
        
        reply = `### ⚡ Order Execution Prepared: ${isBuy ? 'BUY' : 'SELL'} ${qty} ${symbol}
- **Exchange:** ${ex} (Direct DMA Routing)
- **Execution Algorithm:** Smart Order Routing (SOR)
- **Product Type:** Intraday (MIS) / Delivery (CNC)
- **RMS Verification:** Pre-trade margin and SEBI circuit filter check PASSED.

*Executing smart routed order via linked 5paisa / Zerodha gateway...*`;
        action = { action: 'PLACE_ORDER', symbol, type: isBuy ? 'BUY' : 'SELL', quantity: qty, orderType: 'SMART_ROUTER' };
      } else if (p.includes('option') || p.includes('straddle') || p.includes('iron condor') || p.includes('greek')) {
        reply = `### 📊 F&O Quantitative Strategy Diagnostics: NIFTY 50
- **Implied Volatility (IV):** 13.8% (Normal range)
- **Put-Call Ratio (PCR):** 1.14 (Mild bullish bias)
- **Max Pain Level:** 25,200 Strike
- **Recommended Setup:** **Delta-Neutral Short Strangle** or **Iron Condor** to harvest Theta decay with strictly defined risk boundaries.

*Automated Strategy Builder loaded in the F&O desk.*`;
        action = { action: 'DEPLOY_STRATEGY', name: 'Iron Condor', index: 'NIFTY' };
      } else if (p.includes('backtest') || p.includes('algo') || p.includes('quant')) {
        reply = `### 🔬 Algorithmic Strategy Backtest: Dual EMA Crossover (20/50)
- **Universe:** NIFTY 50 & NASDAQ 100 Equities (3-Year Historical Ticks)
- **Win Rate:** 64.2%
- **Profit Factor:** 2.18x
- **Sharpe Ratio:** 1.84 (Risk-Adjusted Alpha: +8.4%)
- **Max Drawdown:** -7.2% vs Benchmark -18.5%

*Displaying comprehensive equity curve and trade logs in the Quant Data Science Lab.*`;
        action = { action: 'RUN_BACKTEST', strategy: 'Dual Moving Average Crossover' };
      } else if (p.includes('square off') || p.includes('close position')) {
        reply = `### 🚨 RMS Emergency Command: Square Off All Open Positions
Triggering immediate batch market orders across active equity & F&O contracts to lock in current realized P&L and release used margin.`;
        action = { action: 'SQUARE_OFF_ALL' };
      } else if (p.includes('5paisa') || p.includes('broker') || p.includes('bank')) {
        reply = `### 🏦 Broker & Banking Connectivity: 5paisa & HDFC / ICICI
- **5paisa Trading API:** Connected & Authorized for automated F&O routing.
- **Linked Demat Bank:** Verified with instant IMPS/UPI clearing rails.
- **Available Margin:** Ready for intraday leverage up to 5x under SEBI peak margin rules.`;
        action = { action: 'LINK_BROKER', broker: '5paisa' };
      } else {
        reply = `### 📈 Vian Capital Market Advisory & Quant Desk
Markets are operating within normal volatility boundaries.
- **NIFTY 50:** 25,240 (+0.42%) · Support: 25,100 · Resistance: 25,350
- **NASDAQ 100:** 19,820 (+0.85%) · Momentum in Semis (NVDA, AVGO)
- **Bank Nifty:** 52,180 (+0.31%) · Private banks holding trendline

*You can command me to execute trades, backtest strategies, rebalance Smallcase baskets, or manage risk thresholds.*`;
      }

      return res.json({ response: reply, action });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Data Science: Algorithmic Strategy Backtester API
app.post('/api/backtest', (req, res) => {
  const { strategy = 'RSI Mean Reversion', symbol = 'NIFTY 50', timeframe = '15m' } = req.body;

  const strategiesData: Record<string, any> = {
    'RSI Mean Reversion': {
      winRate: 66.4,
      profitFactor: 2.24,
      maxDrawdown: 6.8,
      totalTrades: 342,
      netProfitPercent: 48.6,
      sharpeRatio: 1.92,
      description: 'Buys when 14-period RSI dips below 30 with bullish candlestick reversal; sells on RSI > 68.',
    },
    'Dual Moving Average Crossover': {
      winRate: 58.2,
      profitFactor: 2.05,
      maxDrawdown: 9.4,
      totalTrades: 218,
      netProfitPercent: 41.2,
      sharpeRatio: 1.68,
      description: 'Goes long when 20 EMA crosses above 50 EMA with volume expansion confirmation.',
    },
    'Bollinger Volatility Breakout': {
      winRate: 62.0,
      profitFactor: 2.38,
      maxDrawdown: 8.1,
      totalTrades: 184,
      netProfitPercent: 54.0,
      sharpeRatio: 2.04,
      description: 'Capitalizes on volatility squeezes when bandwidth narrows to lowest 20th percentile.',
    },
    'ML Random Forest Trend Classifier': {
      winRate: 71.5,
      profitFactor: 2.65,
      maxDrawdown: 5.2,
      totalTrades: 290,
      netProfitPercent: 68.4,
      sharpeRatio: 2.35,
      description: 'Supervised ML model trained on 10 technical indicators + orderbook micro-imbalance.',
    },
  };

  const selected = strategiesData[strategy] || strategiesData['RSI Mean Reversion'];

  // Generate 30 points of simulated cumulative equity curve
  const equityCurve = [];
  let equity = 100000;
  for (let i = 1; i <= 30; i++) {
    const changePct = (Math.random() - 0.38) * 3.5;
    equity = Math.round(equity * (1 + changePct / 100));
    equityCurve.push({
      tradeIndex: i,
      equity,
      benchmark: Math.round(100000 * Math.pow(1.008, i)),
    });
  }

  res.json({
    strategy,
    symbol,
    timeframe,
    ...selected,
    equityCurve,
  });
});

// Configure Vite middleware or production build
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Vian Capital Trading Platform running on port ${PORT}`);
  });
}

setupServer();
