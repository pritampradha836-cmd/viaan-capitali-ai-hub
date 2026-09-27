export type BusinessRole = 
  | 'managing_director' 
  | 'portfolio_manager' 
  | 'sales_ir' 
  | 'compliance_ops';

export type NavigationTab = 
  | 'dashboard'
  | 'ai-advisor'
  | 'datascience'
  | 'sales-crm'
  | 'automation';

export interface Deal {
  id: string;
  name: string;
  sector: 'Fintech & Credit' | 'SaaS & Enterprise AI' | 'Clean Energy Infra' | 'Healthcare & MedTech' | 'Consumer Brands';
  ticketSizeCr: number; // in ₹ Crores
  stage: 'Origination' | 'Due Diligence' | 'Term Sheet' | 'IC Approved' | 'Portfolio Active';
  targetIrr: number; // e.g. 26.5%
  targetMoic: number; // e.g. 3.2x
  leadPartner: string;
  expectedClose: string;
  description: string;
  evMultiple: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  persona?: 'strategy' | 'risk' | 'deals' | 'sales';
}

export interface MonteCarloResult {
  initialAum: number;
  timeHorizonYears: number;
  expectedReturn: number;
  volatility: number;
  simulationsCount: number;
  medianOutcome: number;
  bearishOutcome5th: number;
  bullishOutcome95th: number;
  valueAtRisk95: number;
  conditionalVaR95: number;
  trajectories: number[][];
}

export interface EfficientFrontierResult {
  portfolioReturn: number;
  portfolioVolatility: number;
  sharpeRatio: number;
  riskFreeRate: number;
  weights: {
    equity: number;
    credit: number;
    realAssets: number;
    debt: number;
    venture: number;
  };
  frontierPoints: Array<{ volatility: number; expectedReturn: number }>;
}

export interface KycScreeningResult {
  investorName: string;
  entityType: string;
  registrationNumber: string;
  jurisdiction: string;
  pepSanctionCheck: string;
  panAadhaarStatus: string;
  riskScore: string;
  kycStatus: string;
  complianceOfficer: string;
  timestamp: string;
}

export interface OperationalLog {
  id: string;
  timestamp: string;
  source: 'AI_AGENT' | 'QUANT' | 'AML_KYC' | 'DISPATCH' | 'SYS_AUDIT';
  message: string;
  level: 'info' | 'success' | 'warning' | 'alert';
}
