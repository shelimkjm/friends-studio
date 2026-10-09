import React from 'react';
import {
  TrendingUp,
  Receipt,
  HandCoins,
  CreditCard,
  Building2,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  ChevronRight,
  ShoppingCart,
  UserPlus,
} from 'lucide-react';
import { FinancialSummary, AppSettings, Sale, Expense, MfsTransaction, Customer } from '../types';
import { formatBDT, formatDateBangla } from '../utils/accounting';
import { translations } from '../utils/translations';

interface DashboardScreenProps {
  summary: FinancialSummary;
  settings: AppSettings;
  recentSales: Sale[];
  recentExpenses: Expense[];
  recentMfs: MfsTransaction[];
  customers: Customer[];
  onNavigate: (tab: string) => void;
  onOpenQuickAction: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  summary,
  settings,
  recentSales,
  recentExpenses,
  recentMfs,
  customers,
  onNavigate,
  onOpenQuickAction,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  // Combine and sort recent transactions
  type RecentItem = {
    id: string;
    type: 'sale' | 'expense' | 'mfs';
    title: string;
    subtitle: string;
    amount: number;
    isIncome: boolean;
    date: string;
  };

  const combinedRecent: RecentItem[] = [
    ...recentSales.map((s) => ({
      id: s.id,
      type: 'sale' as const,
      title: s.customerName || (lang === 'bn' ? 'নগদ বিক্রি' : 'Cash Sale'),
      subtitle: `${s.invoiceNo} · ${s.items.length} ${lang === 'bn' ? 'টি আইটেম' : 'items'}`,
      amount: s.totalAmount,
      isIncome: true,
      date: s.date,
    })),
    ...recentExpenses.map((e) => ({
      id: e.id,
      type: 'expense' as const,
      title: e.category,
      subtitle: e.description || e.paymentMethod,
      amount: e.amount,
      isIncome: false,
      date: e.date,
    })),
    ...recentMfs.map((m) => ({
      id: m.id,
      type: 'mfs' as const,
      title: `${m.provider} ${m.type === 'CASH_OUT' ? 'ক্যাশ-আউট' : m.type === 'CASH_IN' ? 'ক্যাশ-ইন' : 'রিচার্জ'}`,
      subtitle: m.customerPhone || m.refNumber || 'MFS',
      amount: m.amount,
      isIncome: m.type === 'CASH_IN' || m.type === 'RECHARGE',
      date: m.date,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Welcome & Shop Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            {lang === 'bn' ? 'ডিজিটাল হিসাব খাতা' : 'Digital Business Ledger'}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            {lang === 'bn' ? settings.shopNameBangla : settings.shopName}
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            {lang === 'bn'
              ? 'ফটোকপি, কম্পিউটার স্টুডিও, বিকাশ-নগদ ও দোকানের বাকি-নগদ হিসাব।'
              : 'Photocopy, computer studio services, MFS agency, and shop ledger.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('sales')}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-semibold text-xs sm:text-sm shadow-sm hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span>{t.newSale}</span>
          </button>
          <button
            onClick={() => onNavigate('customers')}
            className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap border border-emerald-600/50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.customers}</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.todaySales}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatBDT(summary.todaySales, { lang, showSymbol: true })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>{lang === 'bn' ? 'নগদ:' : 'Cash:'} {formatBDT(summary.todaySalesCash, { lang })}</span>
              <span>·</span>
              <span className="text-amber-700 font-medium">{lang === 'bn' ? 'বাকি:' : 'Due:'} {formatBDT(summary.todaySalesDue, { lang })}</span>
            </div>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.todayExpenses}</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatBDT(summary.todayExpenses, { lang, showSymbol: true })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {lang === 'bn' ? 'দোকান ভাড়া, কাগজ, বিল ও খরচ' : 'Rent, utility, paper & misc'}
            </div>
          </div>
        </div>

        {/* Money Collected Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.moneyCollectedToday}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatBDT(summary.todayCashCollected, { lang, showSymbol: true })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {lang === 'bn' ? 'নগদ বিক্রি + বাকি টাকা আদায়' : 'Sales cash + due collected'}
            </div>
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.estimatedProfit}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {formatBDT(summary.estimatedProfitToday, { lang, showSymbol: true })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {lang === 'bn' ? 'বিক্রি + কমিশন - মোট খরচ' : 'Revenue + commission - expenses'}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Financial Ledger Status (Receivables vs Payables & Cash Balance) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Customer Receivables (মোট বাকি পাওনা) */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 p-4 rounded-xl cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-amber-900">
                {t.customerReceivables}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 font-mono tabular-nums">
            {formatBDT(summary.totalReceivables, { lang, showSymbol: true })}
          </div>
          <div className="text-xs text-amber-800/80 mt-1 flex items-center justify-between">
            <span>{customers.filter((c) => c.currentBalance > 0).length} {lang === 'bn' ? 'জন গ্রাহকের বাকি আছে' : 'customers owe due'}</span>
            <span className="font-medium underline">{lang === 'bn' ? 'খাতা দেখুন' : 'View Ledger'}</span>
          </div>
        </div>

        {/* Supplier Payables (মোট মহাজন দেনা) */}
        <div
          onClick={() => onNavigate('suppliers')}
          className="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/80 p-4 rounded-xl cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-indigo-900">
                {t.supplierPayables}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-900 font-mono tabular-nums">
            {formatBDT(summary.totalPayables, { lang, showSymbol: true })}
          </div>
          <div className="text-xs text-indigo-800/80 mt-1 flex items-center justify-between">
            <span>{lang === 'bn' ? 'কাগজ ও কালি পাইকারদের দেনা' : 'Wholesaler dues'}</span>
            <span className="font-medium underline">{lang === 'bn' ? 'খাতা দেখুন' : 'View Ledger'}</span>
          </div>
        </div>

        {/* Cash Balance on Hand (ক্যাশ বাক্সে নগদ) */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-slate-900 text-white p-4 rounded-xl shadow-xs cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {t.currentCashBalance}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {formatBDT(summary.currentCashBalance, { lang, showSymbol: true })}
          </div>
          <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
            <span>{lang === 'bn' ? 'দৈনিক ক্যাশবুক হিসাব' : 'Daily Cashbook'}</span>
            <span className="text-slate-400">{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
          </div>
        </div>
      </div>

      {/* MFS Quick Status Strip (bKash / Nagad / Rocket Agent Floats) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'বিকাশ, নগদ ও রকেট এজেন্ট ফ্লোট' : 'MFS & Recharge Float Balances'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('mfs')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>{lang === 'bn' ? 'সব দেখুন ও নতুন এন্ট্রি' : 'Manage MFS'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg bg-pink-50/60 border border-pink-100 flex flex-col">
            <span className="text-[11px] font-semibold text-pink-900">bKash (বিকাশ)</span>
            <span className="text-sm sm:text-base font-bold text-pink-700 font-mono tabular-nums mt-0.5">
              ৳ ২৫,০০০
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-100 flex flex-col">
            <span className="text-[11px] font-semibold text-orange-900">Nagad (নগদ)</span>
            <span className="text-sm sm:text-base font-bold text-orange-700 font-mono tabular-nums mt-0.5">
              ৳ ১৮,৫০০
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-100 flex flex-col">
            <span className="text-[11px] font-semibold text-purple-900">Rocket (রকেট)</span>
            <span className="text-sm sm:text-base font-bold text-purple-700 font-mono tabular-nums mt-0.5">
              ৳ ৮,০০০
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 flex flex-col">
            <span className="text-[11px] font-semibold text-teal-900">Flexiload (রিচার্জ)</span>
            <span className="text-sm sm:text-base font-bold text-teal-700 font-mono tabular-nums mt-0.5">
              ৳ ৪,২০০
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {t.recentTransactions}
          </h2>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {lang === 'bn' ? 'সব লেনদেন' : 'View all'}
          </button>
        </div>

        {combinedRecent.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {lang === 'bn' ? 'কোনো সাম্প্রতিক লেনদেন পাওয়া যায়নি' : 'No transactions recorded yet'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {combinedRecent.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-lg px-1 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.isIncome
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{item.subtitle}</span>
                      <span>·</span>
                      <span>{formatDateBangla(item.date)}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`font-mono tabular-nums font-bold text-xs sm:text-sm ${
                    item.isIncome ? 'text-emerald-700' : 'text-slate-800'
                  }`}
                >
                  {item.isIncome ? '+' : '-'}{formatBDT(item.amount, { lang })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
