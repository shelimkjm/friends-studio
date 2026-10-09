import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  CreditCard,
  Building2,
  DollarSign,
  PieChart,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  FinancialSummary,
  Sale,
  Expense,
  Customer,
  Supplier,
  MfsTransaction,
  AppSettings,
} from '../types';
import { formatBDT, formatDateBangla, safeAdd, safeSub } from '../utils/accounting';
import { translations } from '../utils/translations';

interface ReportsScreenProps {
  summary: FinancialSummary;
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  mfs: MfsTransaction[];
  settings: AppSettings;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  summary,
  sales,
  expenses,
  customers,
  suppliers,
  mfs,
  settings,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  const [reportType, setReportType] = useState<
    'cashbook' | 'pnl' | 'receivables' | 'payables' | 'mfs'
  >('cashbook');

  // CSV Export
  const handleExportCsv = () => {
    let rows: string[][] = [];
    let filename = `friends_hisab_${reportType}.csv`;

    if (reportType === 'cashbook') {
      rows = [
        ['তারিখ', 'ধরণ', 'বিবরণ', 'জমা (আয় ৳)', 'খরচ (ব্যয় ৳)'],
        ...sales.map((s) => [
          s.date,
          'বিক্রি',
          s.customerName || 'নগদ ক্রেতা',
          s.paidAmount.toString(),
          '0',
        ]),
        ...expenses.map((e) => [
          e.date,
          'খরচ',
          e.description,
          '0',
          e.amount.toString(),
        ]),
      ];
    } else if (reportType === 'receivables') {
      rows = [
        ['গ্রাহকের নাম', 'মোবাইল', 'ঠিকানা', 'বর্তমান বাকি (৳)'],
        ...customers
          .filter((c) => c.currentBalance > 0)
          .map((c) => [c.name, c.phone, c.address || '', c.currentBalance.toString()]),
      ];
    } else if (reportType === 'payables') {
      rows = [
        ['মহাজনের নাম', 'কোম্পানি', 'মোবাইল', 'পাওনা দেনা (৳)'],
        ...suppliers
          .filter((s) => s.currentBalance > 0)
          .map((s) => [s.name, s.companyName || '', s.phone, s.currentBalance.toString()]),
      ];
    } else if (reportType === 'pnl') {
      rows = [
        ['খাত', 'পরিমাণ (৳)'],
        ['আজকের মোট বিক্রি (Revenue)', summary.todaySales.toString()],
        ['এমএফএস কমিশন আয়', mfs.reduce((acc, m) => acc + (m.commission || 0), 0).toString()],
        ['আজকের মোট খরচ (Expenses)', summary.todayExpenses.toString()],
        ['আনুমানিক নিট লাভ (Net Profit)', summary.estimatedProfitToday.toString()],
      ];
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {t.reports} (হিসাব বিবরণী ও রিপোর্ট)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'bn'
              ? 'দৈনিক ক্যাশবুক, লাভ-ক্ষতি, বাকি তালিকা ও এক্সেল/প্রিন্ট'
              : 'Daily cashbook, profit & loss, receivables, and export'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            onClick={handlePrint}
            className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setReportType('cashbook')}
          className={`px-3 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
            reportType === 'cashbook'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'bn' ? 'দৈনিক ক্যাশবুক (Cashbook)' : 'Daily Cashbook'}
        </button>
        <button
          onClick={() => setReportType('pnl')}
          className={`px-3 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
            reportType === 'pnl'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'bn' ? 'লাভ-ক্ষতি বিবরণী (P&L)' : 'Profit & Loss'}
        </button>
        <button
          onClick={() => setReportType('receivables')}
          className={`px-3 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
            reportType === 'receivables'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'bn' ? 'বাকি পাওনা তালিকা (Receivables)' : 'Customer Due List'}
        </button>
        <button
          onClick={() => setReportType('payables')}
          className={`px-3 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
            reportType === 'payables'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'bn' ? 'মহাজন দেনা তালিকা (Payables)' : 'Supplier Due List'}
        </button>
      </div>

      {/* Report Content Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs" id="printable-voucher">
        {/* Printable Header */}
        <div className="border-b border-slate-200 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {settings.shopNameBangla}
            </h3>
            <p className="text-xs text-slate-500">
              {settings.address} · মোবাইল: {settings.phone}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <span>প্রতিবেদন তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
          </div>
        </div>

        {/* 1. Daily Cashbook View */}
        {reportType === 'cashbook' && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              দৈনিক ক্যাশবুক খাতা (নগদ আগমন ও বহির্গমন)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2 px-3">তারিখ ও সময়</th>
                    <th className="py-2 px-3">বিবরণ</th>
                    <th className="py-2 px-3">মাধ্যম</th>
                    <th className="py-2 px-3 text-right text-emerald-800">নগদ জমা (+৳)</th>
                    <th className="py-2 px-3 text-right text-rose-800">নগদ খরচ (-৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 text-slate-500">{formatDateBangla(s.date)}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        বিক্রি: {s.customerName || 'নগদ ক্রেতা'} ({s.invoiceNo})
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatBDT(s.paidAmount, { lang })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono">-</td>
                    </tr>
                  ))}
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2.5 px-3 text-slate-500">{formatDateBangla(e.date)}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        খরচ: {e.category} ({e.description})
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{e.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono">-</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                        {formatBDT(e.amount, { lang })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Profit and Loss View */}
        {reportType === 'pnl' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h4 className="font-bold text-slate-900 text-sm">
              ব্যবসায়িক লাভ-ক্ষতি বিবরণী (Profit & Loss Statement)
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-700 py-1 border-b border-slate-200">
                <span className="font-semibold">মোট পণ্য ও সেবা বিক্রয় আয়:</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {formatBDT(summary.todaySales, { lang })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 py-1 border-b border-slate-200">
                <span className="font-semibold">এমএফএস কমিশন ও সেবা আয়:</span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  +{formatBDT(
                    mfs.reduce((acc, m) => acc + (m.commission || 0), 0),
                    { lang }
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 py-1 border-b border-slate-200">
                <span className="font-semibold text-rose-700">মোট অপারেটিং খরচ (দোকান ব্যয়):</span>
                <span className="font-mono font-bold text-sm text-rose-700">
                  -{formatBDT(summary.todayExpenses, { lang })}
                </span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-emerald-800 pt-2 border-t-2 border-slate-300">
                <span>আনুমানিক নিট লাভ (Net Profit):</span>
                <span className="font-mono text-lg text-emerald-700">
                  {formatBDT(summary.estimatedProfitToday, { lang })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Receivables View */}
        {reportType === 'receivables' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                গ্রাহক বাকি পাওনা তালিকা (Customer Receivables)
              </h4>
              <span className="text-xs font-bold text-amber-800 font-mono">
                মোট বাকি: {formatBDT(summary.totalReceivables, { lang })}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2 px-3">গ্রাহকের নাম</th>
                    <th className="py-2 px-3">মোবাইল নম্বর</th>
                    <th className="py-2 px-3">ঠিকানা</th>
                    <th className="py-2 px-3 text-right">বাকি পরিমাণ (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers
                    .filter((c) => c.currentBalance > 0)
                    .map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{c.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.phone}</td>
                        <td className="py-2.5 px-3 text-slate-500">{c.address || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                          {formatBDT(c.currentBalance, { lang })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Payables View */}
        {reportType === 'payables' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                মহাজন ও পাইকার দেনা তালিকা (Supplier Payables)
              </h4>
              <span className="text-xs font-bold text-indigo-900 font-mono">
                মোট দেনা: {formatBDT(summary.totalPayables, { lang })}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2 px-3">মহাজনের নাম</th>
                    <th className="py-2 px-3">কোম্পানি</th>
                    <th className="py-2 px-3">মোবাইল</th>
                    <th className="py-2 px-3 text-right">দেনা পরিমাণ (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers
                    .filter((s) => s.currentBalance > 0)
                    .map((s) => (
                      <tr key={s.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{s.companyName || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-500">{s.phone}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-900">
                          {formatBDT(s.currentBalance, { lang })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
