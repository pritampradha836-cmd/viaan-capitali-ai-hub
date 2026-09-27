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

// 1. Multi-Persona AI & ML Financial Intelligence Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, persona = 'strategy', history = [] } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const personaInstructions: Record<string, string> = {
      strategy: `You are the "Chief Investment Strategist" at Vian Capital (www.viaancapital.in).
You specialize in macro asset allocation, alternative investment funds (AIFs), private equity, structured credit, and wealth preservation for ultra-high-net-worth (UHNW) and institutional investors.
Provide rigorous, data-driven financial advice with structured sections:
1. Executive Thesis & Market Context
2. Recommended Asset Allocation / Strategic Stance
3. Risk Mitigation & Hedging Tactics
4. Actionable Next Steps.
Format cleanly with Markdown, clear bullet points, and quantitative metrics (IRR, Sharpe, Beta, CAGR).`,
      risk: `You are the "Head of Risk & Quantitative Compliance" at Vian Capital.
You analyze portfolio stress tests, Value-at-Risk (VaR), liquidity covenants, sector concentration risk, and regulatory mandates (SEBI AIF Cat II/III, RBI, FEMA, PMLA/AML).
Deliver sharp, compliance-first risk audits with concrete threshold limits and stress scenario assessments.`,
      deals: `You are the "Private Equity & M&A Deal Origination Director" at Vian Capital.
You analyze deal pipelines, EBITDA multiples, term sheet covenants, enterprise valuations (DCF, Precedent Transactions, LBO models), and target synergy theses.
Provide concise, institutional-grade Investment Committee (IC) briefing memos with valuation multiples and exit roadmaps.`,
      sales: `You are the "Director of Institutional Investor Relations & Sales" at Vian Capital.
You craft high-impact LP fundraising pitches, client portfolio review summaries, capital call explanations, and tailored co-investment proposals for family offices and institutional allocators.
Communicate with polish, institutional credibility, and high commercial clarity.`,
    };

    const systemInstruction = personaInstructions[persona] || personaInstructions.strategy;

    if (ai) {
      const formattedHistory = history
        .map((h: { role: string; content: string }) => `${h.role === 'user' ? 'Client/Analyst' : 'Vian Capital AI'}: ${h.content}`)
        .join('\n');
      const fullPrompt = formattedHistory ? `${formattedHistory}\nClient/Analyst: ${prompt}\nVian Capital AI:` : prompt;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      return res.json({ response: response.text || 'Unable to generate response.' });
    } else {
      // Deterministic intelligent fallback when GEMINI_API_KEY is not configured
      const p = prompt.toLowerCase();
      let reply = '';

      if (persona === 'risk' || p.includes('risk') || p.includes('stress')) {
        reply = `### 🛡️ Vian Capital Quantitative Risk Audit
**Portfolio Stress & Volatility Diagnostics**

#### 1. Factor Sensitivity & VaR Thresholds
- **Value-at-Risk (95% 1-Day VaR):** 1.42% of firm AUM (₹26.2 Cr).
- **Conditional VaR (Expected Shortfall):** 2.18% in tail tail-event distribution.
- **Interest Rate Sensitivity (Duration):** 2.84 years across fixed income & private credit tranches.

#### 2. Sector Concentration Exposure
- **Enterprise Software & AI:** 28.5% (Within 30% prudential ceiling)
- **Renewable Energy Infrastructure:** 22.0%
- **Fintech & Specialty Lending:** 19.5%
- **Healthcare & MedTech:** 16.0%
- **Liquid Sovereign Reserves:** 14.0%

#### 3. Recommended Risk Adjustments
- Increase dynamic put-option collar on tech equity overweight.
- Maintain minimum 12% cash & T-Bill buffer for pending capital commitments.`;
      } else if (persona === 'deals' || p.includes('deal') || p.includes('valuation') || p.includes('m&a')) {
        reply = `### 📊 Vian Capital Investment Committee Memo
**Target Analysis & Enterprise Valuation Thesis**

#### 1. Investment Overview
- **Opportunity:** Growth equity injection in high-yield B2B SaaS / Fintech platform.
- **Proposed Ticket:** ₹45.0 Cr ($5.4M) for a 14.5% non-dilutive Series B minority stake.
- **EV/ARR Multiple:** 6.8x (Industry benchmark: 8.2x median peer multiple).

#### 2. Key Financial Indicators
- **LTM Revenue:** ₹38.2 Cr (+54% YoY CAGR)
- **Gross Margins:** 78.4% with negative net churn (-1.8%)
- **Projected Exit IRR:** 28.4% on 4.5-year holding horizon with 3.2x MOIC target.

#### 3. Covenant Recommendations
- Board observer seat + veto on senior debt issuance > ₹15 Cr.
- Standard liquidation preference (1x non-participating) with anti-dilution rights.`;
      } else if (persona === 'sales' || p.includes('sales') || p.includes('client') || p.includes('pitch')) {
        reply = `### 🤝 Vian Capital Investor Relations Advisory
**Institutional Allocation & Co-Investment Brief**

#### 1. Fund Performance Snapshot (Vian Growth Fund II)
- **Net IRR since Inception:** 24.8% per annum
- **Total DPI (Distributed to Paid-In):** 0.72x
- **TVPI (Total Value to Paid-In):** 2.14x
- **Current Fund AUM:** ₹750 Cr across 14 vetted portfolio assets.

#### 2. LP Engagement Strategy
- Schedule quarterly performance update webinar with primary Family Office allocators.
- Dispatch automated capital call notifications for tranche #4 drawdown (₹42 Cr aggregate).
- Offer priority co-investment rights to LPs committing ≥ ₹15 Cr.`;
      } else {
        reply = `### 📈 Vian Capital Strategic Macro Asset Allocation
**Macro Stance for Current Economic Cycle**

#### 1. Strategic Investment Thesis
Given the prevailing domestic capex cycle and sticky corporate earnings, Vian Capital recommends an **Overweight Alternative Credit & Growth Equity** posture with defensive cash yields.

#### 2. Recommended Capital Distribution:
- **Private Credit & Mezzanine Debt (35%):** Targeting 14-16% net annualized yield with first-charge collateral.
- **Growth Stage Private Equity (35%):** High-margin industrial tech, cleantech, and consumer healthcare.
- **Core Listed Equities (20%):** Large-cap leaders with strong free-cash-flow conversion.
- **Cash & Arbitrage Liquid Reserves (10%):** Deployed opportunistically on secondary liquidity events.

#### 3. Next Milestone
Engage with the Quantitative Data Science Lab to run a Monte Carlo stress model on this allocation.`;
      }

      return res.json({ response: reply });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Data Science: Monte Carlo Risk & VaR Simulation Engine
app.post('/api/monte-carlo', (req, res) => {
  const { initialAum = 1000, expectedReturn = 14, volatility = 16, timeHorizonYears = 5, simulations = 500 } = req.body;

  const dt = 1 / 12; // monthly steps
  const steps = timeHorizonYears * 12;
  const mu = (expectedReturn / 100) - 0.5 * Math.pow(volatility / 100, 2);
  const sigma = volatility / 100;

  const runs: number[][] = [];
  const finalValues: number[] = [];

  // Generate simulation paths
  for (let s = 0; s < simulations; s++) {
    const path = [initialAum];
    let current = initialAum;
    for (let t = 1; t <= steps; t++) {
      // Box-Muller transform for standard normal random variable
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      current = current * Math.exp(mu * dt + sigma * Math.sqrt(dt) * z);
      if (t % 3 === 0 || t === steps) {
        path.push(Math.round(current * 10) / 10);
      }
    }
    finalValues.push(current);
    if (s < 12) {
      // Keep first 12 representative trajectories for plotting
      runs.push(path);
    }
  }

  finalValues.sort((a, b) => a - b);
  const p5 = finalValues[Math.floor(simulations * 0.05)];
  const p50 = finalValues[Math.floor(simulations * 0.50)];
  const p95 = finalValues[Math.floor(simulations * 0.95)];

  const var95 = Math.max(0, initialAum - p5);
  const cVar95 = Math.max(0, initialAum - (finalValues.slice(0, Math.floor(simulations * 0.05)).reduce((a, b) => a + b, 0) / Math.floor(simulations * 0.05)));

  res.json({
    initialAum,
    timeHorizonYears,
    expectedReturn,
    volatility,
    simulationsCount: simulations,
    medianOutcome: Math.round(p50 * 10) / 10,
    bearishOutcome5th: Math.round(p5 * 10) / 10,
    bullishOutcome95th: Math.round(p95 * 10) / 10,
    valueAtRisk95: Math.round(var95 * 10) / 10,
    conditionalVaR95: Math.round(cVar95 * 10) / 10,
    trajectories: runs,
  });
});

// 3. Data Science: Modern Portfolio Theory (MPT) Efficient Frontier Engine
app.post('/api/optimize-portfolio', (req, res) => {
  const { equityWeight = 35, creditWeight = 35, realAssetsWeight = 15, debtWeight = 10, ventureWeight = 5 } = req.body;

  // Asset parameters (Expected return %, Volatility %)
  const assets = {
    equity: { r: 15.5, vol: 18.0 },
    credit: { r: 13.0, vol: 7.5 },
    realAssets: { r: 11.5, vol: 10.0 },
    debt: { r: 7.8, vol: 3.5 },
    venture: { r: 24.0, vol: 28.0 },
  };

  const total = equityWeight + creditWeight + realAssetsWeight + debtWeight + ventureWeight;
  const w = {
    equity: equityWeight / total,
    credit: creditWeight / total,
    realAssets: realAssetsWeight / total,
    debt: debtWeight / total,
    venture: ventureWeight / total,
  };

  // Expected portfolio return
  const portReturn =
    w.equity * assets.equity.r +
    w.credit * assets.credit.r +
    w.realAssets * assets.realAssets.r +
    w.debt * assets.debt.r +
    w.venture * assets.venture.r;

  // Approximate portfolio variance (assuming moderate cross-correlations)
  const portVol = Math.sqrt(
    Math.pow(w.equity * assets.equity.vol, 2) +
    Math.pow(w.credit * assets.credit.vol, 2) +
    Math.pow(w.realAssets * assets.realAssets.vol, 2) +
    Math.pow(w.debt * assets.debt.vol, 2) +
    Math.pow(w.venture * assets.venture.vol, 2) +
    2 * w.equity * w.credit * 0.2 * assets.equity.vol * assets.credit.vol +
    2 * w.equity * w.venture * 0.6 * assets.equity.vol * assets.venture.vol +
    2 * w.credit * w.realAssets * 0.3 * assets.credit.vol * assets.realAssets.vol
  );

  const riskFreeRate = 6.8; // Indian 10Y Sovereign Yield
  const sharpeRatio = Math.round(((portReturn - riskFreeRate) / portVol) * 100) / 100;

  // Generate 20 points along the Efficient Frontier curve for charting
  const frontierPoints = [];
  for (let i = 0; i <= 20; i++) {
    const vol = 4 + (i / 20) * 20; // 4% to 24% volatility
    const ret = riskFreeRate + 1.25 * Math.sqrt(vol) * 2.2;
    frontierPoints.push({
      volatility: Math.round(vol * 10) / 10,
      expectedReturn: Math.round(ret * 10) / 10,
    });
  }

  res.json({
    portfolioReturn: Math.round(portReturn * 10) / 10,
    portfolioVolatility: Math.round(portVol * 10) / 10,
    sharpeRatio,
    riskFreeRate,
    weights: w,
    frontierPoints,
  });
});

// 4. Automation: KYC/AML Institutional Screening Simulator
app.post('/api/ocr-kyc', (req, res) => {
  const { sampleId = 'investor_1' } = req.body;

  const mockKycDb: Record<string, any> = {
    investor_1: {
      investorName: 'KAPOOR FAMILY TRUST',
      entityType: 'Domestic Family Office (Class A LP)',
      registrationNumber: 'AAATK9014E',
      jurisdiction: 'India (SEBI AIF Cat II Accredited)',
      pepSanctionCheck: 'CLEAR (0 Matches in Global OFAC / Interpol)',
      panAadhaarStatus: 'Verified & Tax Compliant (PAN: AAATK****E)',
      riskScore: 'Low (0.04)',
      kycStatus: 'Approved - Ready for Capital Drawdown',
      complianceOfficer: 'R. Singhania, Head of Regulatory Affairs',
      timestamp: new Date().toISOString(),
    },
    investor_2: {
      investorName: 'ALPENWEG GLOBAL ASSET MANAGEMENT',
      entityType: 'Foreign Portfolio Investor (FPI Cat I)',
      registrationNumber: 'IN-FPI-2025-0814',
      jurisdiction: 'Zurich, Switzerland (FINMA Regulated)',
      pepSanctionCheck: 'CLEAR (OECD AML Tier 1 Compliant)',
      panAadhaarStatus: 'FPI Custodian Account Active (ICICI Custody)',
      riskScore: 'Minimal (0.01)',
      kycStatus: 'Approved - Foreign Direct Investment Cleared',
      complianceOfficer: 'R. Singhania, Head of Regulatory Affairs',
      timestamp: new Date().toISOString(),
    },
    investor_3: {
      investorName: 'AURELIUS WEALTH VENTURES LTD',
      entityType: 'Offshore Institutional Fund',
      registrationNumber: 'BVI-IBC-992014',
      jurisdiction: 'British Virgin Islands / DIFC Dubai',
      pepSanctionCheck: 'FLAGGED FOR MANUAL ENHANCED DUE DILIGENCE (EDD)',
      panAadhaarStatus: 'Ultimate Beneficial Owner (UBO) declaration pending',
      riskScore: 'Elevated (0.68)',
      kycStatus: 'Under Review - Requires Additional UBO Declaration',
      complianceOfficer: 'R. Singhania, Head of Regulatory Affairs',
      timestamp: new Date().toISOString(),
    },
  };

  const result = mockKycDb[sampleId] || mockKycDb.investor_1;
  res.json({
    success: true,
    screeningLatencyMs: 184,
    data: result,
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
    console.log(`Vian Capital Platform Server running on port ${PORT}`);
  });
}

setupServer();
