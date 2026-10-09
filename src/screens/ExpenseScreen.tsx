import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  Calendar,
  Filter,
  DollarSign,
} from 'lucide-react';
import { Expense, AppSettings, PaymentMethod } from '../types';
import { formatBDT, formatDateBangla, safeAdd } from '../utils/accounting';
import { translations } from '../utils/translations';

interface ExpenseScreenProps {
  expenses: Expense[];
  settings: AppSettings;
  onRecordExpense: (expense: Expense) => void;
}

export const ExpenseScreen: React.FC<ExpenseScreenProps> = ({
  expenses,
  settings,
  onRecordExpense,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(t.paperCartridge);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  const expenseCategories = [
    t.rent,
    t.electricity,
    t.paperCartridge,
    t.inventoryPurchase,
    t.transport,
    t.entertainment,
    t.otherExpenses,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      category,
      amount: amt,
      paymentMethod,
      description: description.trim() || category,
      reference: reference.trim() || undefined,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    onRecordExpense(newExpense);

    setAmount('');
    setDescription('');
    setReference('');
    setIsModalOpen(false);
  };

  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory === 'ALL') return true;
    return e.category === filterCategory;
  });

  const totalExpenseAmount = filteredExpenses.reduce(
    (sum, e) => safeAdd(sum, e.amount),
    0
  );

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Screen Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {t.expenses} (খরচ খাতা)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'bn'
              ? 'দোকান ভাড়া, বিদ্যুৎ বিল, কাগজ-কালি ও দৈনন্দিন খরচের হিসাব'
              : 'Shop expenses, utilities, paper supplies & bills'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">
              {lang === 'bn' ? 'মোট খরচ:' : 'Total Expenses:'}
            </span>
            <span className="text-lg sm:text-xl font-bold text-rose-700 font-mono tabular-nums">
              {formatBDT(totalExpenseAmount, { lang })}
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.recordExpense}</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
            filterCategory === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'bn' ? 'সব খরচ' : 'All Expenses'} ({expenses.length})
        </button>
        {expenseCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              filterCategory === cat
                ? 'bg-rose-700 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {lang === 'bn' ? 'কোনো খরচের রেকর্ড নেই' : 'No expenses recorded yet'}
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {exp.category}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>{exp.description}</span>
                    <span>·</span>
                    <span>{formatDateBangla(exp.date)}</span>
                    <span>·</span>
                    <span className="font-semibold">{exp.paymentMethod}</span>
                    {exp.reference && <span>· ভাউচার: {exp.reference}</span>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-sm text-rose-700">
                  -{formatBDT(exp.amount, { lang })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Record Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {t.recordExpense}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'খরচের পরিমাণ (৳) *' : 'Amount (৳) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.expenseCategory}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
                >
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.paymentMethod}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
                >
                  <option value="CASH">{t.cash}</option>
                  <option value="BKASH">{t.bkash}</option>
                  <option value="NAGAD">{t.nagad}</option>
                  <option value="BANK">{t.bank}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'খরচের বিস্তারিত বিবরণ' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ফটোকপি পেপার ৩ রিম ক্রয়"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'রসিদ / ভাউচার নম্বর (ঐচ্ছিক)' : 'Receipt Number'}
                </label>
                <input
                  type="text"
                  placeholder="ভাউচার নং"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
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
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs"
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
