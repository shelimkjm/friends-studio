import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  MapPin,
  FileText,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Printer,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Customer,
  CustomerLedgerEntry,
  AppSettings,
  PaymentMethod,
} from '../types';
import { formatBDT, formatDateBangla, safeAdd, safeSub } from '../utils/accounting';
import { translations } from '../utils/translations';
import {
  generateDueReminderMessage,
  generatePaymentReceiptMessage,
  getWhatsAppUrl,
  getSmsUrl,
} from '../utils/smsGenerator';

interface CustomerScreenProps {
  customers: Customer[];
  ledgers: CustomerLedgerEntry[];
  settings: AppSettings;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddLedgerEntry: (entry: Omit<CustomerLedgerEntry, 'id' | 'balanceAfter'>) => void;
}

export const CustomerScreen: React.FC<CustomerScreenProps> = ({
  customers,
  ledgers,
  settings,
  onSaveCustomer,
  onDeleteCustomer,
  onAddLedgerEntry,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddDueOpen, setIsAddDueOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState('');

  // Payment/Due entry form states
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDesc, setEntryDesc] = useState('');
  const [entryMethod, setEntryMethod] = useState<PaymentMethod>('CASH');

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesDue = filterDueOnly ? c.currentBalance > 0 : true;
    return matchesSearch && matchesDue;
  });

  // Calculate totals
  const totalReceivables = customers.reduce(
    (sum, c) => (c.currentBalance > 0 ? safeAdd(sum, c.currentBalance) : sum),
    0
  );
  const totalDueCustomersCount = customers.filter((c) => c.currentBalance > 0).length;

  const handleOpenAddCustomer = () => {
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormNotes('');
    setFormOpeningBalance('');
    setIsAddCustomerOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const opening = parseFloat(formOpeningBalance) || 0;
    const newCustomer: Customer = {
      id: 'cust-' + Date.now(),
      name: formName.trim(),
      phone: formPhone.trim(),
      address: formAddress.trim() || undefined,
      notes: formNotes.trim() || undefined,
      openingBalance: opening,
      currentBalance: opening,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCustomer(newCustomer);
    setIsAddCustomerOpen(false);
    setSelectedCustomer(newCustomer);
  };

  // Submit payment received from customer
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amt = parseFloat(entryAmount);
    if (!amt || amt <= 0) return;

    onAddLedgerEntry({
      customerId: selectedCustomer.id,
      type: 'PAYMENT_RECEIVED',
      amount: amt,
      description: entryDesc.trim() || (lang === 'bn' ? 'নগদ টাকা জমা গ্রহণ' : 'Payment received'),
      date: new Date().toISOString(),
      paymentMethod: entryMethod,
    });

    // Update local selected view
    setSelectedCustomer((prev) =>
      prev ? { ...prev, currentBalance: safeSub(prev.currentBalance, amt) } : null
    );

    setEntryAmount('');
    setEntryDesc('');
    setIsAddPaymentOpen(false);
  };

  // Submit new credit sale / due to customer
  const handleSubmitDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amt = parseFloat(entryAmount);
    if (!amt || amt <= 0) return;

    onAddLedgerEntry({
      customerId: selectedCustomer.id,
      type: 'CREDIT_SALE',
      amount: amt,
      description: entryDesc.trim() || (lang === 'bn' ? 'বাকি বিক্রি' : 'Credit sale'),
      date: new Date().toISOString(),
    });

    setSelectedCustomer((prev) =>
      prev ? { ...prev, currentBalance: safeAdd(prev.currentBalance, amt) } : null
    );

    setEntryAmount('');
    setEntryDesc('');
    setIsAddDueOpen(false);
  };

  // Customer transactions history
  const customerHistory = selectedCustomer
    ? ledgers.filter((l) => l.customerId === selectedCustomer.id).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  // Export CSV of selected customer or all customers
  const exportCustomerCsv = () => {
    if (selectedCustomer) {
      const rows = [
        ['তারিখ', 'বিবরণ', 'প্রকার', 'পরিমাণ (৳)', 'ব্যালেন্স (৳)'],
        ...customerHistory.map((h) => [
          new Date(h.date).toLocaleDateString(),
          h.description,
          h.type === 'CREDIT_SALE' ? 'বাকি যোগ' : 'জমা আদায়',
          h.amount.toString(),
          h.balanceAfter.toString(),
        ]),
      ];
      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        rows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `statement_${selectedCustomer.name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Top Header & Search Bar */}
      {!selectedCustomer ? (
        <>
          {/* Summary Strip */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t.customers} (বাকি খাতা)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn'
                  ? 'গ্রাহকদের বাকি বিক্রি ও আদায়ের ডিজিটাল টালি হিসাব'
                  : 'Customer digital credit ledger & due collection'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">
                  {lang === 'bn' ? 'মোট বাকি পাওনা:' : 'Total Due:'}
                </span>
                <span className="text-lg sm:text-xl font-bold text-amber-800 font-mono tabular-nums">
                  {formatBDT(totalReceivables, { lang })}
                </span>
              </div>
              <button
                onClick={handleOpenAddCustomer}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.addCustomer}</span>
              </button>
            </div>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchCustomer}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              >
              </input>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterDueOnly(false)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  !filterDueOnly
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.all} ({customers.length})
              </button>
              <button
                onClick={() => setFilterDueOnly(true)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  filterDueOnly
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                }`}
              >
                {t.totalDueCustomers} ({totalDueCustomersCount})
              </button>
            </div>
          </div>

          {/* Customers List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {t.noCustomersFound}
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {c.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </span>
                        {c.address && (
                          <>
                            <span>·</span>
                            <span>{c.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                        c.currentBalance > 0
                          ? 'text-amber-800'
                          : c.currentBalance < 0
                          ? 'text-teal-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatBDT(c.currentBalance, { lang })}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {c.currentBalance > 0
                        ? (lang === 'bn' ? 'বাকি পাবে' : 'Due')
                        : c.currentBalance < 0
                        ? (lang === 'bn' ? 'অগ্রিম জমা' : 'Advance')
                        : (lang === 'bn' ? 'পরিশোধিত' : 'Cleared')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Selected Customer Detailed Ledger View */
        <div className="space-y-4">
          {/* Back button & Customer Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সব গ্রাহক তালিকায় ফিরে যান' : 'Back to Customers'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportCustomerCsv}
                  title="CSV ডাউনলোড"
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  onClick={() => setIsSmsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'বাকি তাগাদা মেসেজ' : 'Send Reminder'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedCustomer.name}
                </h3>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedCustomer.phone}
                  </span>
                  {selectedCustomer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedCustomer.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                <span className="text-xs text-slate-500 block">
                  {t.currentBalance}:
                </span>
                <span
                  className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                    selectedCustomer.currentBalance > 0
                      ? 'text-amber-800'
                      : 'text-emerald-700'
                  }`}
                >
                  {formatBDT(selectedCustomer.currentBalance, { lang })}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons for this customer */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddDueOpen(true)}
                className="py-2.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-rose-200 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>{lang === 'bn' ? 'বাকি বিক্রি (৳ বাকি যোগ)' : 'Add Due'}</span>
              </button>
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{lang === 'bn' ? 'টাকা জমা নিন (পরিশোধ)' : 'Receive Payment'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Ledger Transactions History */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              {lang === 'bn' ? 'লেনদেনের বিস্তারিত ইতিহাস' : 'Ledger History'}
            </h4>

            {customerHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {lang === 'bn'
                  ? 'এই গ্রাহকের কোনো লেনদেন রেকর্ড নেই'
                  : 'No ledger records found'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {customerHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                          item.type === 'CREDIT_SALE'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.type === 'CREDIT_SALE' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {item.description}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatDateBangla(item.date)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono tabular-nums font-bold text-xs sm:text-sm ${
                          item.type === 'CREDIT_SALE'
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.type === 'CREDIT_SALE' ? '+' : '-'}
                        {formatBDT(item.amount, { lang })}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'bn' ? 'অবশিষ্ট বাকি:' : 'Balance:'} {formatBDT(item.balanceAfter, { lang })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add New Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{t.addCustomer}</h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর হাসান"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017xxxxxxxx"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  placeholder="গ্রাম বা এলাকা"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.openingBalance} (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formOpeningBalance}
                  onChange={(e) => setFormOpeningBalance(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Customer Payment */}
      {isAddPaymentOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {lang === 'bn' ? 'টাকা জমা নিন' : 'Receive Payment'}
                </h3>
                <p className="text-xs text-slate-500">{selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => setIsAddPaymentOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitPayment} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'জমার পরিমাণ (টাকা) *' : 'Amount Received (৳) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.paymentMethod}
                </label>
                <select
                  value={entryMethod}
                  onChange={(e) => setEntryMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                >
                  <option value="CASH">{t.cash}</option>
                  <option value="BKASH">{t.bkash}</option>
                  <option value="NAGAD">{t.nagad}</option>
                  <option value="ROCKET">{t.rocket}</option>
                  <option value="BANK">{t.bank}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিবরণ / রসিদ নোট' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="নগদ পরিশোধ বা চালান রেফারেন্স"
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  {lang === 'bn' ? 'জমা নিশ্চিত করুন' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Due / Credit Sale */}
      {isAddDueOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {lang === 'bn' ? 'বাকি যোগ করুন' : 'Add Credit Due'}
                </h3>
                <p className="text-xs text-slate-500">{selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => setIsAddDueOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitDue} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বাকির পরিমাণ (টাকা) *' : 'Due Amount (৳) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'পণ্যের বিবরণ' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ফটোকপি ২০০ কপি ও খাতা"
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDueOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                >
                  {lang === 'bn' ? 'বাকি রেকর্ড করুন' : 'Record Due'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Share Due Reminder WhatsApp / SMS */}
      {isSmsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'bn' ? 'বাকি তাগাদা পাঠান' : 'Send Payment Reminder'}
              </h3>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed">
                {generateDueReminderMessage({
                  customerName: selectedCustomer.name,
                  customerPhone: selectedCustomer.phone,
                  dueAmount: selectedCustomer.currentBalance,
                  shopName: settings.shopNameBangla,
                  shopPhone: settings.phone,
                })}
              </div>

              <p className="text-[11px] text-slate-500">
                {lang === 'bn'
                  ? 'আপনার অনুমতি ছাড়া নিজে নিজে কোনো মেসেজ যাবে না। নিচের বাটনে চাপ দিলে আপনার মোবাইলের হোয়াটসঅ্যাপ বা মেসেজ অ্যাপ চালু হবে।'
                  : 'Requires user consent. Opens native messaging client directly.'}
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={getWhatsAppUrl(
                    selectedCustomer.phone,
                    generateDueReminderMessage({
                      customerName: selectedCustomer.name,
                      customerPhone: selectedCustomer.phone,
                      dueAmount: selectedCustomer.currentBalance,
                      shopName: settings.shopNameBangla,
                      shopPhone: settings.phone,
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Send via WhatsApp'}</span>
                </a>

                <a
                  href={getSmsUrl(
                    selectedCustomer.phone,
                    generateDueReminderMessage({
                      customerName: selectedCustomer.name,
                      customerPhone: selectedCustomer.phone,
                      dueAmount: selectedCustomer.currentBalance,
                      shopName: settings.shopNameBangla,
                      shopPhone: settings.phone,
                    })
                  )}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <span>{lang === 'bn' ? 'মোবাইল মেসেজ (SMS)' : 'Send via SMS'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
