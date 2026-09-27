import React from 'react';
import { NavigationTab, BusinessRole } from '../types';
import { VianLogo } from './VianLogo';
import { ROLE_PROFILES } from '../data/mockData';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentRole: BusinessRole;
  onChangeRole: (role: BusinessRole) => void;
  onNewDealClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onChangeRole,
  onNewDealClick,
}) => {
  const navItems: Array<{ id: NavigationTab; label: string }> = [
    { id: 'dashboard', label: 'Executive' },
    { id: 'ai-advisor', label: 'AI Advisory' },
    { id: 'datascience', label: 'Data Science' },
    { id: 'sales-crm', label: 'Sales & Deals' },
    { id: 'automation', label: 'Automation' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single brand mark element */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2 cursor-pointer text-left shrink-0 focus:outline-none"
        >
          <VianLogo size="sm" showText={true} />
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 font-medium text-xs sm:text-sm ${
                  isActive
                    ? 'border-[#001A8C] text-[#001A8C] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Role Switcher & Action CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Business Role Switcher Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 hidden md:inline-block">
              Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as BusinessRole)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="managing_director">Managing Director (CXO)</option>
              <option value="portfolio_manager">Portfolio Manager (Quant)</option>
              <option value="sales_ir">Sales & Investor Relations</option>
              <option value="compliance_ops">Operations & Compliance</option>
            </select>
          </div>

          <button
            onClick={onNewDealClick}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            + New Deal
          </button>
        </div>
      </div>
    </header>
  );
};
