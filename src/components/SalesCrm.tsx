import React, { useState } from 'react';
import { Deal } from '../types';

interface SalesCrmProps {
  deals: Deal[];
  onOpenDealModal: (deal?: Deal) => void;
  onAdvanceDealStage: (dealId: string, nextStage: Deal['stage']) => void;
  onConsultAI: (prompt: string, persona: string) => void;
}

export const SalesCrm: React.FC<SalesCrmProps> = ({
  deals,
  onOpenDealModal,
  onAdvanceDealStage,
  onConsultAI,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'investors'>('kanban');

  const stages: Array<{ id: Deal['stage']; label: string; color: string }> = [
    { id: 'Origination', label: '1. Deal Origination', color: 'border-slate-300' },
    { id: 'Due Diligence', label: '2. Deep Diligence', color: 'border-amber-300' },
    { id: 'Term Sheet', label: '3. Term Sheet', color: 'border-purple-300' },
    { id: 'IC Approved', label: '4. IC Approved', color: 'border-sky-300' },
    { id: 'Portfolio Active', label: '5. Portfolio Active', color: 'border-emerald-300' },
  ];

  // Institutional LP commitments
  const lpCommitments = [
    {
      name: 'Singhania Heritage Single Family Office',
      type: 'Domestic UHNW Family Office',
      allocatedCr: 120.0,
      drawnCr: 84.0,
      dpi: '0.82x',
      status: 'Tier-1 Anchor LP',
      coInvestPreference: 'SaaS & Enterprise AI',
    },
    {
      name: 'Alpenweg Global Asset Management',
      type: 'Swiss Institutional FPI (Cat I)',
      allocatedCr: 250.0,
      drawnCr: 175.0,
      dpi: '0.74x',
      status: 'Active Institutional',
      coInvestPreference: 'Clean Energy Microgrids',
    },
    {
      name: 'Gulf Horizon Sovereign Wealth Subsidiary',
      type: 'Middle East Sovereign Co-Investor',
      allocatedCr: 300.0,
      drawnCr: 210.0,
      dpi: '0.68x',
      status: 'Active Anchor',
      coInvestPreference: 'Fintech & Credit',
    },
    {
      name: 'Kotak & Sen Multi-Family Wealth',
      type: 'Family Office Consortium',
      allocatedCr: 80.0,
      drawnCr: 60.0,
      dpi: '0.88x',
      status: 'Active Institutional',
      coInvestPreference: 'Healthcare & MedTech',
    },
  ];

  const getNextStage = (curr: Deal['stage']): Deal['stage'] | null => {
    switch (curr) {
      case 'Origination':
        return 'Due Diligence';
      case 'Due Diligence':
        return 'Term Sheet';
      case 'Term Sheet':
        return 'IC Approved';
      case 'IC Approved':
        return 'Portfolio Active';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Sales & Deal Pipeline Management (CRM)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track deal progression through Investment Committee gates, manage high-net-worth LP allocations, and synthesize co-investment memos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#001A8C] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deal Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode('investors')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                viewMode === 'investors'
                  ? 'bg-[#001A8C] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LP Institutional Register
            </button>
          </div>

          <button
            onClick={() => onOpenDealModal()}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            + New Deal
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const totalStageCr = stageDeals.reduce((acc, d) => acc + d.ticketSizeCr, 0);

            return (
              <div
                key={stage.id}
                className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono mb-3">
                  Volume: <strong className="text-slate-900">₹{totalStageCr.toFixed(1)} Cr</strong>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const nextStage = getNextStage(deal.stage);
                      return (
                        <div
                          key={deal.id}
                          onClick={() => onOpenDealModal(deal)}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs hover:border-[#001A8C] transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-[#001A8C] leading-snug">
                              {deal.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#001A8C] shrink-0">
                              ₹{deal.ticketSizeCr} Cr
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 line-clamp-2">
                            {deal.description}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                            <span>Target IRR: <strong className="text-emerald-600">{deal.targetIrr}%</strong></span>
                            <span>{deal.evMultiple}</span>
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() =>
                                onConsultAI(
                                  `Draft a detailed Investment Committee briefing memo for ${deal.name} (${deal.sector}) seeking ₹${deal.ticketSizeCr} Cr with target IRR ${deal.targetIrr}%.`,
                                  'deals'
                                )
                              }
                              className="text-[10px] text-[#001A8C] hover:underline font-bold cursor-pointer"
                            >
                              AI IC Memo →
                            </button>

                            {nextStage && (
                              <button
                                onClick={() => onAdvanceDealStage(deal.id, nextStage)}
                                className="px-2 py-0.5 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              >
                                Advance Stage »
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Institutional LP Register */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institutional Limited Partner (LP) Capital Allocations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Committed capital tranches, drawdown schedule, and co-investment appetite
              </p>
            </div>
            <button
              onClick={() =>
                onConsultAI(
                  'Generate a quarterly performance update letter for our top 4 Institutional LPs outlining Fund II returns and DPI distributions.',
                  'sales'
                )
              }
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg transition-colors cursor-pointer"
            >
              Generate LP Letter (AI) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Institutional LP Name</th>
                  <th className="py-3 px-4">Entity Classification</th>
                  <th className="py-3 px-4 text-right">Committed Capital</th>
                  <th className="py-3 px-4 text-right">Drawn (Called)</th>
                  <th className="py-3 px-4 text-right">Realized DPI</th>
                  <th className="py-3 px-4">Co-Investment Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lpCommitments.map((lp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{lp.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{lp.type}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{lp.allocatedCr.toFixed(1)} Cr
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                      ₹{lp.drawnCr.toFixed(1)} Cr
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      {lp.dpi}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{lp.coInvestPreference}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {lp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Aggregate LP Commitments: ₹750.0 Cr</span>
            <span className="font-mono text-slate-700">Total Called: ₹529.0 Cr (70.5%)</span>
          </div>
        </div>
      )}
    </div>
  );
};
