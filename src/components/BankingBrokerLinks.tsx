import React, { useState } from 'react';
import { BrokerAccount } from '../types';

interface BankingBrokerLinksProps {
  brokerAccounts: BrokerAccount[];
  availableCash: number;
  onDepositFunds: (amount: number) => void;
  onWithdrawFunds: (amount: number) => void;
  onToggleBroker: (brokerName: string) => void;
}

export const BankingBrokerLinks: React.FC<BankingBrokerLinksProps> = ({
  brokerAccounts,
  availableCash,
  onDepositFunds,
  onWithdrawFunds,
  onToggleBroker,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(25000);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'IMPS' | 'NetBanking'>('UPI');
  const [notification, setNotification] = useState<string | null>(null);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    onDepositFunds(depositAmount);
    setNotification(`Successfully added ₹${depositAmount.toLocaleString()} via ${selectedMethod} into Trading Demat.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > availableCash) return;
    onWithdrawFunds(withdrawAmount);
    setNotification(`Payout request of ₹${withdrawAmount.toLocaleString()} initiated to linked HDFC Bank account.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Broker Integrations & Banking Capital Gateway
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage linked trading accounts (5paisa, Zerodha), instant UPI/IMPS deposits, collateral margin pledges, and regulatory clearing banks.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          SEBI Clearing Rails: Active
        </span>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center justify-between font-mono animate-in fade-in">
          <span>✓ {notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* Margin Summary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Available Liquid Trading Cash</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
            ₹{availableCash.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            100% Withdrawable & Margin Eligible
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Pledged Collateral Margin</div>
          <div className="text-3xl font-extrabold text-[#001A8C] mt-2 font-mono tabular-nums">
            ₹3,50,000
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Backed by Bluechip Equities (10-15% Haircut)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Effective Buying Power (5x MIS)</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2 font-mono tabular-nums">
            ₹{((availableCash + 350000) * 5).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Intraday Equity & Option Buying Power
          </div>
        </div>
      </div>

      {/* Brokers & Banking Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linked Brokers List */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Connected Brokerage Gateways (5paisa / Zerodha)
          </h2>

          <div className="space-y-3">
            {brokerAccounts.map((b) => {
              const isConnected = b.status === 'CONNECTED';
              return (
                <div
                  key={b.broker}
                  className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-base font-bold text-slate-900">{b.broker}</strong>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isConnected
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Account ID: {b.accountId} · Bank: {b.linkedBank} ({b.bankAccountNo})
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      API Auth: {b.apiKey}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleBroker(b.broker)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      isConnected
                        ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        : 'border-[#001A8C] text-[#001A8C] hover:bg-blue-50'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              );
            })}

            {/* Additional Broker Linking Box */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-center text-slate-600">
              <span>Looking to connect Interactive Brokers for US/Nasdaq or Upstox?</span>
              <button
                onClick={() => alert('Opening OAuth Gateway for Interactive Brokers')}
                className="ml-2 font-bold text-[#001A8C] hover:underline cursor-pointer"
              >
                + Connect Another Gateway
              </button>
            </div>
          </div>
        </div>

        {/* Instant Fund Deposit & Withdrawal */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Instant Capital Rails (UPI / IMPS)
            </h2>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              0% Gateway Fees
            </span>
          </div>

          {/* Deposit Form */}
          <form onSubmit={handleDeposit} className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Add Margin (Deposit)</label>
              <div className="flex gap-1.5 text-[11px] font-semibold">
                {(['UPI', 'IMPS', 'NetBanking'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMethod(m)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      selectedMethod === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="5000"
                min="1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001A8C] font-mono font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                + Instant Deposit
              </button>
            </div>
            <div className="flex gap-2 text-[10px] font-mono text-slate-500">
              {[25000, 50000, 100000, 250000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDepositAmount(val)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  +₹{(val / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </form>

          {/* Withdrawal Form */}
          <form onSubmit={handleWithdraw} className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Withdraw Funds to Bank</label>
              <span className="text-[11px] text-slate-400 font-mono">
                Settles within 2 hours
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="5000"
                min="1000"
                max={availableCash}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Request Payout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
