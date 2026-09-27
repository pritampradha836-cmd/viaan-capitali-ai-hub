import React, { useState, useEffect } from 'react';
import { Deal } from '../types';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal | null;
  onSave: (deal: Deal) => void;
}

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Deal>>({
    name: '',
    sector: 'SaaS & Enterprise AI',
    ticketSizeCr: 35.0,
    stage: 'Origination',
    targetIrr: 28.0,
    targetMoic: 3.2,
    leadPartner: 'A. Singhania',
    expectedClose: '2026-11-30',
    description: '',
    evMultiple: '6.5x ARR',
  });

  useEffect(() => {
    if (deal) {
      setFormData(deal);
    } else {
      setFormData({
        id: `VC-D${Math.floor(200 + Math.random() * 800)}`,
        name: '',
        sector: 'SaaS & Enterprise AI',
        ticketSizeCr: 35.0,
        stage: 'Origination',
        targetIrr: 28.0,
        targetMoic: 3.2,
        leadPartner: 'A. Singhania',
        expectedClose: '2026-11-30',
        description: '',
        evMultiple: '6.5x ARR',
      });
    }
  }, [deal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    onSave({
      id: formData.id || `VC-D${Math.floor(200 + Math.random() * 800)}`,
      name: formData.name,
      sector: (formData.sector as any) || 'SaaS & Enterprise AI',
      ticketSizeCr: Number(formData.ticketSizeCr) || 25.0,
      stage: (formData.stage as any) || 'Origination',
      targetIrr: Number(formData.targetIrr) || 25.0,
      targetMoic: Number(formData.targetMoic) || 3.0,
      leadPartner: formData.leadPartner || 'A. Singhania',
      expectedClose: formData.expectedClose || '2026-12-31',
      description: formData.description || 'Target enterprise investment opportunity.',
      evMultiple: formData.evMultiple || '7.0x ARR',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {deal ? `Investment Evaluation (${deal.id})` : 'New Deal Origination Submission'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Company Name
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apex Defense AI"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Investment Sector
              </label>
              <select
                value={formData.sector || 'SaaS & Enterprise AI'}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none bg-white"
              >
                <option value="SaaS & Enterprise AI">SaaS & Enterprise AI</option>
                <option value="Fintech & Credit">Fintech & Credit</option>
                <option value="Clean Energy Infra">Clean Energy Infra</option>
                <option value="Healthcare & MedTech">Healthcare & MedTech</option>
                <option value="Consumer Brands">Consumer Brands</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ticket (₹ Cr)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.ticketSizeCr || 0}
                onChange={(e) => setFormData({ ...formData, ticketSizeCr: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target IRR (%)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.targetIrr || 0}
                onChange={(e) => setFormData({ ...formData, targetIrr: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                EV Multiple
              </label>
              <input
                type="text"
                value={formData.evMultiple || ''}
                onChange={(e) => setFormData({ ...formData, evMultiple: e.target.value })}
                placeholder="e.g. 7.5x ARR"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pipeline Stage Gate
              </label>
              <select
                value={formData.stage || 'Origination'}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none bg-white"
              >
                <option value="Origination">Origination</option>
                <option value="Due Diligence">Due Diligence</option>
                <option value="Term Sheet">Term Sheet</option>
                <option value="IC Approved">IC Approved</option>
                <option value="Portfolio Active">Portfolio Active</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Partner
              </label>
              <input
                type="text"
                value={formData.leadPartner || ''}
                onChange={(e) => setFormData({ ...formData, leadPartner: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Investment Thesis & Core Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key value proposition, revenue model, moats, and expected exit path..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#001A8C] focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#001A8C] hover:bg-[#00146e] rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Save Deal Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
