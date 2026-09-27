import React, { useState } from 'react';
import { Deal, BusinessRole } from '../types';
import { ROLE_PROFILES } from '../data/mockData';

interface ExecutiveDashboardProps {
  deals: Deal[];
  currentRole: BusinessRole;
  onOpenDealModal: (deal?: Deal) => void;
  onNavigateToAdvisor: (prompt?: string, persona?: string) => void;
  onNavigateToDataScience: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  deals,
  currentRole,
  onOpenDealModal,
  onNavigateToAdvisor,
  onNavigateToDataScience,
}) => {
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const role = ROLE_PROFILES[currentRole];

  const filteredDeals = deals.filter(
    (d) => sectorFilter === 'All' || d.sector === sectorFilter
  );

  return (
    <div className="space-y-8">
      {/* Role Context Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <span>Active Perspective</span>
            <span>·</span>
            <span>{role.badge}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            {role.name} — {role.title}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {role.focus}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() =>
              onNavigateToAdvisor(
                `Analyze current portfolio factor risk and macroeconomic positioning for ${role.title}`,
                currentRole === 'portfolio_manager' ? 'risk' : 'strategy'
              )
            }
            className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Consult AI Advisor →
          </button>
          <button
            onClick={onNavigateToDataScience}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] border border-sky-500/30 rounded-lg transition-colors cursor-pointer"
          >
            Launch Quant Lab
          </button>
        </div>
      </div>

      {/* Primary KPI Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Assets Under Management (AUM)</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums font-mono">₹1,850 Cr</span>
            <span className="text-xs font-semibold text-emerald-600 tabular-nums font-mono">+28.4% YoY</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            $221M USD Equivalent · Across 2 Flagship Funds
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Net Portfolio IRR (Inception)</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums font-mono">24.8%</span>
            <span className="text-xs font-semibold text-emerald-600 font-mono">Top Decile</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Blended TVPI: 2.14x · Total DPI: 0.74x
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Active Capital Pipeline</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#001A8C] tabular-nums font-mono">₹215 Cr</span>
            <span className="text-xs font-semibold text-[#001A8C]">6 Deals In Review</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Avg target MOIC: 3.2x · Median ARR growth: 52%
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Regulatory & Risk Compliance</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 tabular-nums font-mono">100%</span>
            <span className="text-xs font-semibold text-emerald-700">Audit Pristine</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            SEBI AIF Cat II/III Compliant · Zero Red Flags
          </div>
        </div>
      </div>

      {/* Visual Analytics: Fund Allocation & Deployment Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Class Allocation Donut */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Asset Allocation by Asset Class
              </h2>
              <span className="text-xs font-mono text-slate-500">₹1,850 Cr Base</span>
            </div>

            {/* Custom SVG Donut */}
            <div className="py-6 flex items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Private Equity (40%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#001A8C"
                    strokeWidth="16"
                    strokeDasharray="95.5 143.2"
                    strokeDashoffset="0"
                  />
                  {/* Structured Credit (30%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#0284c7"
                    strokeWidth="16"
                    strokeDasharray="71.6 167.1"
                    strokeDashoffset="-95.5"
                  />
                  {/* Real Assets / Infrastructure (18%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeDasharray="43.0 195.7"
                    strokeDashoffset="-167.1"
                  />
                  {/* Liquid Sovereign Reserves (12%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="16"
                    strokeDasharray="28.6 210.1"
                    strokeDashoffset="-210.1"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums font-mono">4</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Strategies</span>
                </div>
              </div>
            </div>

            {/* Legend & Allocation Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#001A8C]"></span>
                  <span className="font-medium text-slate-800">Growth Private Equity</span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-bold">₹740 Cr (40%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  <span className="font-medium text-slate-800">Specialty Credit & Mezzanine</span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-bold">₹555 Cr (30%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-800">Clean Energy & Real Assets</span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-bold">₹333 Cr (18%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-medium text-slate-800">Liquid Sovereign T-Bills</span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-bold">₹222 Cr (12%)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Portfolio rebalanced quarterly</span>
            <button
              onClick={() => onNavigateToAdvisor('Run portfolio rebalancing analysis for Q4')}
              className="text-[#001A8C] hover:underline font-bold cursor-pointer"
            >
              Rebalance Model →
            </button>
          </div>
        </div>

        {/* 6-Month Capital Flow & Deployment Trajectory */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Monthly Capital Inflow & Fund Deployment
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between LP Capital Calls received vs Target Investments deployed (₹ Crores)
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded bg-[#001A8C]"></span> Inflow (₹Cr)
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span> Deployed (₹Cr)
                </span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="pt-8 pb-4">
              <div className="h-52 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2">
                {[
                  { month: 'May 26', inFlow: 45, dep: 38, inH: '50%', depH: '42%' },
                  { month: 'Jun 26', inFlow: 60, dep: 55, inH: '66%', depH: '60%' },
                  { month: 'Jul 26', inFlow: 75, dep: 70, inH: '80%', depH: '76%' },
                  { month: 'Aug 26', inFlow: 50, dep: 45, inH: '55%', depH: '50%' },
                  { month: 'Sep 26 (Now)', inFlow: 85, dep: 80, inH: '92%', depH: '88%', active: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      {/* Inflow bar */}
                      <div
                        style={{ height: item.inH }}
                        className={`w-5 sm:w-8 rounded-t transition-all ${
                          item.active ? 'bg-[#001A8C]' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                      ></div>
                      {/* Deployed bar */}
                      <div
                        style={{ height: item.depH }}
                        className={`w-5 sm:w-8 rounded-t transition-all ${
                          item.active ? 'bg-emerald-600' : 'bg-emerald-300 group-hover:bg-emerald-400'
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap ${
                        item.active ? 'font-bold text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {item.month}
                    </span>

                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-slate-900 text-white text-[11px] py-1 px-2 rounded shadow-lg transition-opacity whitespace-nowrap z-10 tabular-nums font-mono">
                      Inflow: ₹{item.inFlow}Cr · Deployed: ₹{item.dep}Cr
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fund deployment velocity: 94.2% of committed capital</span>
            <span className="font-mono font-semibold text-slate-800">Dry Powder: ₹430 Cr</span>
          </div>
        </div>
      </div>

      {/* Active Deal Pipeline Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Vian Capital Deal Pipeline & Portfolio Holdings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active investment opportunities, stage gates, target returns, and lead partners
            </p>
          </div>

          {/* Sector filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Filter Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#001A8C]"
            >
              <option value="All">All Sectors</option>
              <option value="SaaS & Enterprise AI">SaaS & Enterprise AI</option>
              <option value="Fintech & Credit">Fintech & Credit</option>
              <option value="Clean Energy Infra">Clean Energy Infra</option>
              <option value="Healthcare & MedTech">Healthcare & MedTech</option>
              <option value="Consumer Brands">Consumer Brands</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Deal ID</th>
                <th className="py-3 px-4">Target Company</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Ticket (₹ Cr)</th>
                <th className="py-3 px-4 text-center">Stage</th>
                <th className="py-3 px-4 text-right">Target IRR</th>
                <th className="py-3 px-4">Valuation Multiple</th>
                <th className="py-3 px-4">Lead Partner</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.map((deal) => (
                <tr
                  key={deal.id}
                  onClick={() => onOpenDealModal(deal)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                    {deal.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{deal.name}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{deal.description}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {deal.sector}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    ₹{deal.ticketSizeCr.toFixed(1)} Cr
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        deal.stage === 'Portfolio Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : deal.stage === 'IC Approved'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : deal.stage === 'Term Sheet'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {deal.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 tabular-nums whitespace-nowrap">
                    {deal.targetIrr}%
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {deal.evMultiple}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {deal.leadPartner}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenDealModal(deal)}
                      className="text-xs text-[#001A8C] hover:underline font-bold px-2 py-1 rounded cursor-pointer"
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDeals.length} active opportunities</span>
          <span className="font-mono text-slate-700">Official Portal: www.viaancapital.in</span>
        </div>
      </div>
    </div>
  );
};
