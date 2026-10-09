import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Phone,
  Hash,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import {
  MfsTransaction,
  MfsProvider,
  MfsTxType,
  AccountBalances,
  AppSettings,
} from '../types';
import { formatBDT, formatDateBangla, safeAdd, safeSub } from '../utils/accounting';
import { translations } from '../utils/translations';

interface MfsScreenProps {
  transactions: MfsTransaction[];
  balances: AccountBalances;
  settings: AppSettings;
  onRecordTransaction: (tx: MfsTransaction) => void;
}

export const MfsScreen: React.FC<MfsScreenProps> = ({
  transactions,
  balances,
  settings,
  onRecordTransaction,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  const [activeProvider, setActiveProvider] = useState<MfsProvider | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [provider, setProvider] = useState<MfsProvider>('BKASH');
  const [txType, setTxType] = useState<MfsTxType>('CASH_OUT');
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Auto calculate default commission based on standard BD agent commission rates
  // bKash Cash-Out: agent gets ~৳4.10 per ৳1000
  // Nagad Cash-Out: agent gets ~৳4.00 per ৳1000
  // Recharge: ~2.5% to 2.8% (৳25 to ৳28 per ৳1000)
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const amt = parseFloat(val) || 0;
    if (amt > 0) {
      if (txType === 'CASH_OUT') {
        const comm = (amt / 1000) * 4.1;
        setCommission(comm.toFixed(1));
      } else if (txType === 'CASH_IN') {
        const comm = (amt / 1000) * 4.0;
        setCommission(comm.toFixed(1));
      } else if (txType === 'RECHARGE') {
        const comm = (amt / 1000) * 27.0;
        setCommission(comm.toFixed(1));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    const comm = parseFloat(commission) || 0;

    const newTx: MfsTransaction = {
      id: 'mfs-' + Date.now(),
      provider,
      type: txType,
      amount: amt,
      customerFee: 0,
      commission: comm,
      customerPhone: customerPhone.trim() || undefined,
      refNumber: refNumber.trim() || undefined,
      date: new Date().toISOString(),
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onRecordTransaction(newTx);

    // Reset Form
    setAmount('');
    setCommission('');
    setCustomerPhone('');
    setRefNumber('');
    setNotes('');
    setIsModalOpen(false);
  };

  const filteredList = transactions.filter((tx) => {
    if (activeProvider === 'ALL') return true;
    return tx.provider === activeProvider;
  });

  const totalCommissionsEarned = transactions.reduce(
    (sum, tx) => safeAdd(sum, tx.commission || 0),
    0
  );

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Screen Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {t.mfsTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'bn'
              ? 'বিকাশ, নগদ, রকেট ও রিচার্জ এজেন্টের ক্যাশ-ফ্লোট হিসাব ও কমিশন'
              : 'Separate MFS agency float, cashflow, and commissions'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন এমএফএস এন্ট্রি' : 'New MFS Entry'}</span>
        </button>
      </div>

      {/* Float Balance Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* bKash */}
        <div
          onClick={() => setActiveProvider('BKASH')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeProvider === 'BKASH'
              ? 'bg-pink-100/70 border-pink-500 shadow-2xs'
              : 'bg-white border-pink-200/80 hover:bg-pink-50/50'
          }`}
        >
          <span className="text-[11px] font-bold text-pink-900 block">
            bKash (বিকাশ এজেন্ট)
          </span>
          <div className="text-base sm:text-lg font-bold text-pink-700 font-mono tabular-nums mt-1">
            {formatBDT(balances.bkashFloat, { lang })}
          </div>
          <span className="text-[10px] text-pink-800/80 mt-0.5 block">ফ্লোট ব্যালেন্স</span>
        </div>

        {/* Nagad */}
        <div
          onClick={() => setActiveProvider('NAGAD')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeProvider === 'NAGAD'
              ? 'bg-orange-100/70 border-orange-500 shadow-2xs'
              : 'bg-white border-orange-200/80 hover:bg-orange-50/50'
          }`}
        >
          <span className="text-[11px] font-bold text-orange-900 block">
            Nagad (নগদ উদোক্তা)
          </span>
          <div className="text-base sm:text-lg font-bold text-orange-700 font-mono tabular-nums mt-1">
            {formatBDT(balances.nagadFloat, { lang })}
          </div>
          <span className="text-[10px] text-orange-800/80 mt-0.5 block">ফ্লোট ব্যালেন্স</span>
        </div>

        {/* Rocket */}
        <div
          onClick={() => setActiveProvider('ROCKET')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeProvider === 'ROCKET'
              ? 'bg-purple-100/70 border-purple-500 shadow-2xs'
              : 'bg-white border-purple-200/80 hover:bg-purple-50/50'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-900 block">
            Rocket (রকেট)
          </span>
          <div className="text-base sm:text-lg font-bold text-purple-700 font-mono tabular-nums mt-1">
            {formatBDT(balances.rocketFloat, { lang })}
          </div>
          <span className="text-[10px] text-purple-800/80 mt-0.5 block">ফ্লোট ব্যালেন্স</span>
        </div>

        {/* Recharge */}
        <div
          onClick={() => setActiveProvider('RECHARGE')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeProvider === 'RECHARGE'
              ? 'bg-teal-100/70 border-teal-500 shadow-2xs'
              : 'bg-white border-teal-200/80 hover:bg-teal-50/50'
          }`}
        >
          <span className="text-[11px] font-bold text-teal-900 block">
            Flexiload (রিচার্জ সিম)
          </span>
          <div className="text-base sm:text-lg font-bold text-teal-700 font-mono tabular-nums mt-1">
            {formatBDT(balances.rechargeBalance, { lang })}
          </div>
          <span className="text-[10px] text-teal-800/80 mt-0.5 block">সিম ব্যালেন্স</span>
        </div>

        {/* Total Commission Earned */}
        <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold text-emerald-900 block">
            {t.commissionEarned}
          </span>
          <div className="text-base sm:text-lg font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {formatBDT(totalCommissionsEarned, { lang })}
          </div>
          <span className="text-[10px] text-emerald-800/80 mt-0.5 block">
            {lang === 'bn' ? 'মোট উপার্জিত লাভ' : 'Total Profit'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveProvider('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
            activeProvider === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'bn' ? 'সকল লেনদেন' : 'All MFS'} ({transactions.length})
        </button>
        <button
          onClick={() => setActiveProvider('BKASH')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
            activeProvider === 'BKASH'
              ? 'bg-pink-700 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          bKash (বিকাশ)
        </button>
        <button
          onClick={() => setActiveProvider('NAGAD')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
            activeProvider === 'NAGAD'
              ? 'bg-orange-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Nagad (নগদ)
        </button>
        <button
          onClick={() => setActiveProvider('ROCKET')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
            activeProvider === 'ROCKET'
              ? 'bg-purple-700 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Rocket (রকেট)
        </button>
        <button
          onClick={() => setActiveProvider('RECHARGE')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
            activeProvider === 'RECHARGE'
              ? 'bg-teal-700 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Flexiload (রিচার্জ)
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {lang === 'bn' ? 'কোনো লেনদেন রেকর্ড নেই' : 'No MFS records found'}
          </div>
        ) : (
          filteredList.map((tx) => (
            <div
              key={tx.id}
              className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    tx.provider === 'BKASH'
                      ? 'bg-pink-100 text-pink-800'
                      : tx.provider === 'NAGAD'
                      ? 'bg-orange-100 text-orange-800'
                      : tx.provider === 'ROCKET'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>
                      {tx.provider} -{' '}
                      {tx.type === 'CASH_OUT'
                        ? 'ক্যাশ-আউট'
                        : tx.type === 'CASH_IN'
                        ? 'ক্যাশ-ইন'
                        : tx.type === 'RECHARGE'
                        ? 'মোবাইল রিচার্জ'
                        : tx.type === 'FLOAT_DEPOSIT'
                        ? 'ফ্লোট লোড'
                        : 'সেন্ড মানি'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                    {tx.customerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {tx.customerPhone}
                      </span>
                    )}
                    {tx.refNumber && (
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        {tx.refNumber}
                      </span>
                    )}
                    <span>·</span>
                    <span>{formatDateBangla(tx.date)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-sm text-slate-900">
                  {formatBDT(tx.amount, { lang })}
                </div>
                {tx.commission > 0 && (
                  <div className="text-[11px] font-semibold text-emerald-700">
                    {lang === 'bn' ? 'কমিশন লাভ:' : 'Commission:'} +৳{tx.commission}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New MFS Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'bn' ? 'নতুন বিকাশ / নগদ / রিচার্জ হিসাব' : 'Record MFS Transaction'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              {/* Provider */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সার্ভিস / মাধ্যম
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['BKASH', 'NAGAD', 'ROCKET', 'RECHARGE'] as MfsProvider[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        provider === p
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p === 'RECHARGE' ? 'Recharge' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  লেনদেনের প্রকার
                </label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as MfsTxType)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                >
                  <option value="CASH_OUT">ক্যাশ-আউট (কাস্টমারকে নগদ ক্যাশ প্রদান, ফ্লোট জমা)</option>
                  <option value="CASH_IN">ক্যাশ-ইন (কাস্টমার থেকে নগদ ক্যাশ গ্রহণ, ফ্লোট প্রদান)</option>
                  <option value="RECHARGE">মোবাইল রিচার্জ (কাস্টমার থেকে ক্যাশ, সিম ব্যালেন্স কর্তন)</option>
                  <option value="FLOAT_DEPOSIT">ফ্লোট ব্যালেন্স লোড (নগদ টাকা দিয়ে ফ্লোট ক্রয়)</option>
                  <option value="FLOAT_WITHDRAW">ফ্লোট ক্যাশ করা (ফ্লোট বিক্রি করে ক্যাশ গ্রহণ)</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  লেনদেনের পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Commission */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  অর্জিত কমিশন / দোকান লাভ (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-emerald-700"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {lang === 'bn' ? 'স্বয়ংক্রিয় হিসাবকৃত রেট (প্রয়োজনে এডিট করা যাবে)' : 'Auto-calculated estimate'}
                </span>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  গ্রাহকের মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  placeholder="017xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* TrxID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ট্রানজেকশন আইডি / TrxID (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: BKI9842109"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
