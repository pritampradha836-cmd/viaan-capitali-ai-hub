import React, { useState } from 'react';
import { INITIAL_LOGS } from '../data/mockData';
import { OperationalLog, KycScreeningResult } from '../types';

export const AutomationEngine: React.FC = () => {
  const [agents, setAgents] = useState({
    capitalCall: true,
    amlKyc: true,
    portfolioDrift: true,
    sebiAudit: true,
  });

  const [logs, setLogs] = useState<OperationalLog[]>(INITIAL_LOGS);
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);

  // KYC Screening State
  const [selectedInvestor, setSelectedInvestor] = useState<'investor_1' | 'investor_2' | 'investor_3'>('investor_1');
  const [kycResult, setKycResult] = useState<KycScreeningResult | null>({
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
  });
  const [kycLoading, setKycLoading] = useState(false);

  const handleRunKyc = async (invId = selectedInvestor) => {
    setKycLoading(true);
    try {
      const res = await fetch('/api/ocr-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: invId }),
      });
      const json = await res.json();
      setKycResult(json.data);

      const newLog: OperationalLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: 'AML_KYC',
        message: `Automated screening finished for ${json.data.investorName}: Status: ${json.data.kycStatus}.`,
        level: json.data.riskScore.includes('Elevated') ? 'warning' : 'success',
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error('KYC Error:', err);
    } finally {
      setKycLoading(false);
    }
  };

  const handleTriggerCapitalCallWorkflow = async () => {
    if (isExecutingWorkflow) return;
    setIsExecutingWorkflow(true);

    const trancheId = `TR-${Math.floor(100 + Math.random() * 900)}`;

    const steps: Array<{ source: OperationalLog['source']; message: string; level: OperationalLog['level']; delay: number }> = [
      {
        source: 'AI_AGENT',
        message: `Investment Committee approved capital call tranche #${trancheId} (Total ₹35.0 Cr for Kratos CyberShield AI).`,
        level: 'info',
        delay: 450,
      },
      {
        source: 'AML_KYC',
        message: `Autonomous AML & Sanctions screening executed across 18 participating LPs. All cleared without flags.`,
        level: 'success',
        delay: 1200,
      },
      {
        source: 'QUANT',
        message: `Liquidity validation: Escrow buffer check complete. Foreign exchange hedge rate locked at 84.15 INR/USD.`,
        level: 'info',
        delay: 2000,
      },
      {
        source: 'DISPATCH',
        message: `Encrypted Capital Call notices dispatched to Institutional LP portals with RTGS/SWIFT escrow instructions.`,
        level: 'success',
        delay: 2800,
      },
      {
        source: 'SYS_AUDIT',
        message: `SEBI AIF Category II audit trail logged. Escrow transaction ID recorded in immutable ledger.`,
        level: 'success',
        delay: 3500,
      },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      setLogs((prev) => [
        {
          id: Date.now().toString() + Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          source: step.source,
          message: step.message,
          level: step.level,
        },
        ...prev,
      ]);
    }

    setIsExecutingWorkflow(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations & Autonomous Financial Tasks Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Institutional automation pipelines: Automated capital calls, AI document KYC/AML verification, and real-time regulatory compliance audits.
          </p>
        </div>

        <button
          onClick={handleTriggerCapitalCallWorkflow}
          disabled={isExecutingWorkflow}
          className="px-4 py-2 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          {isExecutingWorkflow ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Executing Autonomous Pipeline...</span>
            </>
          ) : (
            <span>Execute Automated Capital Call Flow →</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Autonomous Agents & KYC Screening */}
        <div className="lg:col-span-6 space-y-6">
          {/* Autonomous Agents Status */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Autonomous Financial Agent Pipelines
            </h2>
            <div className="space-y-3.5">
              {[
                {
                  key: 'capitalCall' as const,
                  title: 'Automated Capital Call & Distribution Pipeline',
                  desc: 'Issues drawdown notices, reconciles bank RTGS escrow receipts, and mints LP unit certificates.',
                },
                {
                  key: 'amlKyc' as const,
                  title: 'Institutional KYC, PEP & Sanction Screening Agent',
                  desc: 'Screens LPs against Interpol, OFAC, and domestic regulatory watchlists in sub-second latency.',
                },
                {
                  key: 'portfolioDrift' as const,
                  title: 'Portfolio Drift & Dynamic Rebalancing Sentinel',
                  desc: 'Monitors sector concentration and triggers algorithmic alert if single-asset exposure > 15%.',
                },
                {
                  key: 'sebiAudit' as const,
                  title: 'SEBI AIF Cat II Regulatory Compliance Monitor',
                  desc: 'Validates investment limits, foreign remittance FEMA limits, and quarterly returns.',
                },
              ].map((agent) => (
                <label
                  key={agent.key}
                  className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={agents[agent.key]}
                    onChange={(e) =>
                      setAgents((prev) => ({ ...prev, [agent.key]: e.target.checked }))
                    }
                    className="mt-1 w-4 h-4 text-[#001A8C] rounded border-slate-300 focus:ring-[#001A8C] cursor-pointer"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">{agent.title}</div>
                    <div className="text-slate-500 mt-0.5">{agent.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Interactive KYC / AML Screening Tool */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Investor KYC / AML Screening Simulator
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Screen institutional LPs for PEP sanctions, tax verification, and beneficial ownership
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                PMLA / FATCA Compliant
              </span>
            </div>

            {/* Investor Selector */}
            <div className="flex items-center gap-2">
              {[
                { id: 'investor_1' as const, label: 'Kapoor Family Trust (IND)' },
                { id: 'investor_2' as const, label: 'Alpenweg Asset Mgmt (SUI)' },
                { id: 'investor_3' as const, label: 'Aurelius Wealth (BVI/DIFC)' },
              ].map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    setSelectedInvestor(inv.id);
                    handleRunKyc(inv.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    selectedInvestor === inv.id
                      ? 'bg-blue-50 border-[#001A8C] text-[#001A8C]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {inv.label}
                </button>
              ))}
            </div>

            {/* KYC Output Box */}
            {kycResult && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900">
                    Entity: {kycResult.investorName}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Jurisdiction: {kycResult.jurisdiction}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Registration / PAN</span>
                    <strong className="text-slate-900 font-mono">{kycResult.registrationNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Entity Classification</span>
                    <strong className="text-slate-900">{kycResult.entityType}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Sanctions & PEP Status</span>
                    <strong className={kycResult.pepSanctionCheck.includes('CLEAR') ? 'text-emerald-700' : 'text-amber-700'}>
                      {kycResult.pepSanctionCheck}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Risk Rating</span>
                    <strong className="text-slate-900 font-mono">{kycResult.riskScore}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Drawdown Clearance:</span>
                  <span className={`font-bold ${kycResult.kycStatus.includes('Approved') ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {kycResult.kycStatus}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Institutional Operational Audit Terminal */}
        <div className="lg:col-span-6 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-md flex flex-col justify-between text-slate-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Operations & Audit Trail
                </h2>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear Log
              </button>
            </div>

            {/* Monospace Stream */}
            <div className="my-4 h-[440px] overflow-y-auto space-y-2.5 font-mono text-xs pr-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-20">
                  Audit buffer cleared. Trigger an automated workflow to stream events.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded bg-slate-900/90 border border-slate-800/80 leading-relaxed hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-500">[{log.timestamp}]</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold uppercase text-[10px] ${
                          log.source === 'AI_AGENT'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : log.source === 'QUANT'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800'
                            : log.source === 'AML_KYC'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.source === 'DISPATCH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.source}
                      </span>
                    </div>
                    <div
                      className={`${
                        log.level === 'success'
                          ? 'text-emerald-300'
                          : log.level === 'warning'
                          ? 'text-amber-300'
                          : 'text-slate-200'
                      }`}
                    >
                      {log.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Audit Trail: Immutable Hash Chain</span>
            <span className="text-emerald-400">SEBI Regulatory Status: OK (200)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
