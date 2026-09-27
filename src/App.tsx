/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AIAdvisor } from './components/AIAdvisor';
import { DataScienceLab } from './components/DataScienceLab';
import { SalesCrm } from './components/SalesCrm';
import { AutomationEngine } from './components/AutomationEngine';
import { DealModal } from './components/DealModal';
import { VianLogo } from './components/VianLogo';
import { INITIAL_DEALS } from './data/mockData';
import { NavigationTab, BusinessRole, Deal } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<BusinessRole>('managing_director');
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [advisorPrompt, setAdvisorPrompt] = useState<string>('');
  const [advisorPersona, setAdvisorPersona] = useState<'strategy' | 'risk' | 'deals' | 'sales'>('strategy');

  const handleOpenDealModal = (deal?: Deal) => {
    setSelectedDeal(deal || null);
    setIsModalOpen(true);
  };

  const handleSaveDeal = (saved: Deal) => {
    setDeals((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleAdvanceDealStage = (dealId: string, nextStage: Deal['stage']) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: nextStage } : d))
    );
  };

  const handleNavigateToAdvisor = (prompt?: string, persona?: string) => {
    if (prompt) setAdvisorPrompt(prompt);
    if (persona && ['strategy', 'risk', 'deals', 'sales'].includes(persona)) {
      setAdvisorPersona(persona as any);
    }
    setCurrentTab('ai-advisor');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-600/20 selection:text-[#001A8C]">
      {/* Top Bar adheres to 3-Zone Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentRole={currentRole}
        onChangeRole={(role) => setCurrentRole(role)}
        onNewDealClick={() => handleOpenDealModal()}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <ExecutiveDashboard
            deals={deals}
            currentRole={currentRole}
            onOpenDealModal={handleOpenDealModal}
            onNavigateToAdvisor={handleNavigateToAdvisor}
            onNavigateToDataScience={() => setCurrentTab('datascience')}
          />
        )}

        {currentTab === 'ai-advisor' && (
          <AIAdvisor
            initialPrompt={advisorPrompt}
            initialPersona={advisorPersona}
          />
        )}

        {currentTab === 'datascience' && <DataScienceLab />}

        {currentTab === 'sales-crm' && (
          <SalesCrm
            deals={deals}
            onOpenDealModal={handleOpenDealModal}
            onAdvanceDealStage={handleAdvanceDealStage}
            onConsultAI={handleNavigateToAdvisor}
          />
        )}

        {currentTab === 'automation' && <AutomationEngine />}
      </main>

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deal={selectedDeal}
        onSave={handleSaveDeal}
      />

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <VianLogo size="sm" showText={false} />
            <span className="font-bold text-[#001A8C]">VIAN CAPITAL</span>
            <span>·</span>
            <span>Enterprise Wealth & Investment Management Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://www.viaancapital.in"
              target="_blank"
              rel="noreferrer"
              className="text-[#001A8C] hover:underline font-semibold"
            >
              www.viaancapital.in
            </a>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('ai-advisor')}
              className="hover:text-slate-900 cursor-pointer"
            >
              AI Advisors
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('datascience')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Quant Risk Lab
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('automation')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Autonomous Compliance
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
