import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Phone,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  FileText,
  Search,
} from 'lucide-react';
import { Supplier, SupplierLedgerEntry, AppSettings, PaymentMethod } from '../types';
import { formatBDT, formatDateBangla, safeAdd, safeSub } from '../utils/accounting';
import { translations } from '../utils/translations';

interface SupplierScreenProps {
  suppliers: Supplier[];
  ledgers: SupplierLedgerEntry[];
  settings: AppSettings;
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onAddLedgerEntry: (entry: Omit<SupplierLedgerEntry, 'id' | 'balanceAfter'>) => void;
}

export const SupplierScreen: React.FC<SupplierScreenProps> = ({
  suppliers,
  ledgers,
  settings,
  onSaveSupplier,
  onDeleteSupplier,
  onAddLedgerEntry,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Modals
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState('');

  // Transaction form states
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDesc, setEntryDesc] = useState('');
  const [entryMethod, setEntryMethod] = useState<PaymentMethod>('CASH');

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.companyName && s.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.phone.includes(searchQuery)
    );
  });

  const totalPayables = suppliers.reduce(
    (sum, s) => (s.currentBalance > 0 ? safeAdd(sum, s.currentBalance) : sum),
    0
  );

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const opening = parseFloat(formOpeningBalance) || 0;
    const newSupplier: Supplier = {
      id: 'supp-' + Date.now(),
      name: formName.trim(),
      companyName: formCompany.trim() || undefined,
      phone: formPhone.trim(),
      address: formAddress.trim() || undefined,
      openingBalance: opening,
      currentBalance: opening,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveSupplier(newSupplier);
    setIsAddSupplierOpen(false);
    setSelectedSupplier(newSupplier);
  };

  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amt = parseFloat(entryAmount);
    if (!amt || amt <= 0) return;

    onAddLedgerEntry({
      supplierId: selectedSupplier.id,
      type: 'PURCHASE',
      amount: amt,
      description: entryDesc.trim() || (lang === 'bn' ? 'মালামাল ক্রয় চালান' : 'Purchase bill'),
      date: new Date().toISOString(),
    });

    setSelectedSupplier((prev) =>
      prev ? { ...prev, currentBalance: safeAdd(prev.currentBalance, amt) } : null
    );

    setEntryAmount('');
    setEntryDesc('');
    setIsAddPurchaseOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amt = parseFloat(entryAmount);
    if (!amt || amt <= 0) return;

    onAddLedgerEntry({
      supplierId: selectedSupplier.id,
      type: 'PAYMENT_MADE',
      amount: amt,
      description: entryDesc.trim() || (lang === 'bn' ? 'মহাজনকে বিল পরিশোধ' : 'Payment made to supplier'),
      date: new Date().toISOString(),
      paymentMethod: entryMethod,
    });

    setSelectedSupplier((prev) =>
      prev ? { ...prev, currentBalance: safeSub(prev.currentBalance, amt) } : null
    );

    setEntryAmount('');
    setEntryDesc('');
    setIsAddPaymentOpen(false);
  };

  const supplierHistory = selectedSupplier
    ? ledgers.filter((l) => l.supplierId === selectedSupplier.id).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {!selectedSupplier ? (
        <>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t.suppliers} (মহাজন ও পাইকার খাতা)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn'
                  ? 'কাগজ, কালি ও স্টেশনারি সরবরাহকারীদের দেনা-পাওনা হিসাব'
                  : 'Supplier & wholesaler credit payables ledger'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">
                  {lang === 'bn' ? 'মোট মহাজন দেনা:' : 'Total Payables:'}
                </span>
                <span className="text-lg sm:text-xl font-bold text-indigo-900 font-mono tabular-nums">
                  {formatBDT(totalPayables, { lang })}
                </span>
              </div>
              <button
                onClick={() => {
                  setFormName('');
                  setFormCompany('');
                  setFormPhone('');
                  setFormAddress('');
                  setFormOpeningBalance('');
                  setIsAddSupplierOpen(true);
                }}
                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addSupplier}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'মহাজন বা কোম্পানির নাম খুঁজুন...' : 'Search supplier or company...'}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {lang === 'bn' ? 'কোনো মহাজন পাওয়া যায়নি' : 'No suppliers found'}
              </div>
            ) : (
              filteredSuppliers.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSupplier(s)}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {s.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {s.companyName && <span>{s.companyName} ·</span>}
                        <span>{s.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                        s.currentBalance > 0 ? 'text-indigo-900' : 'text-slate-500'
                      }`}
                    >
                      {formatBDT(s.currentBalance, { lang })}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {s.currentBalance > 0
                        ? (lang === 'bn' ? 'পাওনাদার' : 'Payable')
                        : (lang === 'bn' ? 'পরিশোধিত' : 'Paid')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Selected Supplier Detail */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সব মহাজন তালিকায় ফিরে যান' : 'Back to Suppliers'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedSupplier.name}
                </h3>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                  {selectedSupplier.companyName && (
                    <span className="font-medium text-slate-700">
                      {selectedSupplier.companyName}
                    </span>
                  )}
                  <span>{selectedSupplier.phone}</span>
                  {selectedSupplier.address && <span>· {selectedSupplier.address}</span>}
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                <span className="text-xs text-slate-500 block">
                  {t.supplierPayables}:
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-indigo-900">
                  {formatBDT(selectedSupplier.currentBalance, { lang })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddPurchaseOpen(true)}
                className="py-2.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'ক্রয় বিল যোগ (+দেনা)' : 'Add Purchase Bill'}</span>
              </button>
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{lang === 'bn' ? 'টাকা পরিশোধ (-দেনা)' : 'Pay Supplier'}</span>
              </button>
            </div>
          </div>

          {/* Supplier History */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              {lang === 'bn' ? 'মহাজনের সাথে লেনদেনের ইতিহাস' : 'Transaction History'}
            </h4>

            {supplierHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {lang === 'bn' ? 'কোনো লেনদেন রেকর্ড নেই' : 'No records found'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {supplierHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {item.description}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatDateBangla(item.date)}
                        {item.paymentMethod && <span> · {item.paymentMethod}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono tabular-nums font-bold text-xs sm:text-sm ${
                          item.type === 'PURCHASE'
                            ? 'text-indigo-800'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.type === 'PURCHASE' ? '+' : '-'}
                        {formatBDT(item.amount, { lang })}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'bn' ? 'ব্যালেন্স:' : 'Balance:'} {formatBDT(item.balanceAfter, { lang })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{t.addSupplier}</h3>
              <button
                onClick={() => setIsAddSupplierOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSupplier} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.supplierName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আল-মদিনা পেপার হাউস"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'কোম্পানি / দোকানের নাম' : 'Company Name'}
                </label>
                <input
                  type="text"
                  placeholder="বাংলাবাজার, ঢাকা"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
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
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'পূর্বের বকেয়া দেনা (৳)' : 'Opening Payable (৳)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formOpeningBalance}
                  onChange={(e) => setFormOpeningBalance(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Purchase */}
      {isAddPurchaseOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {lang === 'bn' ? 'মালামাল ক্রয় বিল যোগ' : 'Record Purchase'}
                </h3>
                <p className="text-xs text-slate-500">{selectedSupplier.name}</p>
              </div>
              <button
                onClick={() => setIsAddPurchaseOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordPurchase} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ক্রয় বিলের পরিমাণ (৳) *' : 'Purchase Amount (৳) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ক্রয়কৃত পণ্যের বিবরণ' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: A4 ফটোকপি কাগজ ৫ বক্স ও প্রিন্টার কালি"
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPurchaseOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Supplier */}
      {isAddPaymentOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {lang === 'bn' ? 'মহাজনকে টাকা পরিশোধ' : 'Pay Supplier'}
                </h3>
                <p className="text-xs text-slate-500">{selectedSupplier.name}</p>
              </div>
              <button
                onClick={() => setIsAddPaymentOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'পরিশোধের পরিমাণ (৳) *' : 'Amount Paid (৳) *'}
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
                  <option value="BANK">{t.bank}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিবরণ / ব্যাংক ভাউচার' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="চেক নম্বর বা নগদ প্রদান"
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
                  {lang === 'bn' ? 'পরিশোধ নিশ্চিত করুন' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
