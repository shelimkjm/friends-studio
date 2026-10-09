import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  History,
  Tag,
  CreditCard,
  User,
} from 'lucide-react';
import {
  Sale,
  SaleItem,
  Customer,
  Product,
  AppSettings,
  PaymentMethod,
} from '../types';
import {
  formatBDT,
  formatDateBangla,
  calculateSaleDue,
  safeAdd,
  safeSub,
} from '../utils/accounting';
import { translations } from '../utils/translations';
import { PrintVoucherModal } from '../components/PrintVoucherModal';

interface SalesScreenProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  settings: AppSettings;
  onRecordSale: (sale: Sale) => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  sales,
  products,
  customers,
  settings,
  onRecordSale,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [cartItems, setCartItems] = useState<SaleItem[]>([
    {
      id: 'item-1',
      productId: 'prod-1',
      name: 'ফটোকপি (A4 এক পৃষ্ঠা)',
      category: 'ফটোকপি',
      quantity: 10,
      unitPrice: 2.0,
      total: 20,
    },
  ]);

  // Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');

  // Payment inputs
  const [discount, setDiscount] = useState<string>('0');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('20');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [saleNotes, setSaleNotes] = useState('');

  // Voucher preview modal
  const [selectedSaleForVoucher, setSelectedSaleForVoucher] = useState<Sale | null>(null);

  // Quick preset buttons for Friends Studio
  const shopPresets = [
    { name: 'ফটোকপি (১ পাতা)', category: 'ফটোকপি', price: 2.0, unit: 'পাতা', isService: true },
    { name: 'পাসপোর্ট ছবি (৪ কপি)', category: 'পাসপোর্ট সাইজ ছবি ও প্রিন্ট', price: 50.0, unit: 'সেট', isService: true },
    { name: 'চাকরির আবেদন', category: 'চাকরির আবেদন ও রেজাল্ট', price: 100.0, unit: 'আবেদন', isService: true },
    { name: 'কালার প্রিন্ট', category: 'কালার/সাদা-কালো প্রিন্টিং', price: 10.0, unit: 'পাতা', isService: true },
    { name: 'আইডি লেমিনেটিং', category: 'লেমিনেটিং', price: 20.0, unit: 'পিস', isService: true },
    { name: 'ম্যাটাডোর বলপেন', category: 'খাতা, কলম ও স্টেশনারি', price: 6.0, unit: 'পিস', isService: false },
    { name: 'প্র্যাকটিক্যাল খাতা', category: 'খাতা, কলম ও স্টেশনারি', price: 55.0, unit: 'পিস', isService: false },
    { name: 'অনলাইন ফরম পূরণ', category: 'অনলাইন ফরম পূরণ ও চালান', price: 80.0, unit: 'সেবা', isService: true },
  ];

  // Cart calculations
  const subtotal = cartItems.reduce((sum, item) => safeAdd(sum, item.total), 0);
  const discountVal = Math.max(0, parseFloat(discount) || 0);
  const totalBill = Math.max(0, safeSub(subtotal, discountVal));

  const paidVal = Math.max(0, parseFloat(paidAmountInput) || 0);
  const { paid: confirmedPaid, due: remainingDue } = calculateSaleDue(totalBill, paidVal);

  const addItemToCart = (preset: { name: string; category: string; price: number }) => {
    const existingIndex = cartItems.findIndex((i) => i.name === preset.name);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      const item = updated[existingIndex];
      item.quantity += 1;
      item.total = safeAdd(item.total, item.unitPrice);
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          id: 'item-' + Date.now() + Math.random().toString(36).substring(2, 5),
          name: preset.name,
          category: preset.category,
          quantity: 1,
          unitPrice: preset.price,
          total: preset.price,
        },
      ]);
    }
  };

  const updateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCartItems(cartItems.filter((i) => i.id !== id));
      return;
    }
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: qty,
            total: qty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const updateItemPrice = (id: string, price: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            unitPrice: Math.max(0, price),
            total: item.quantity * Math.max(0, price),
          };
        }
        return item;
      })
    );
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || totalBill <= 0) return;

    let custName = customCustomerName.trim();
    let custPhone = customCustomerPhone.trim();
    let custId: string | undefined = undefined;

    if (selectedCustomerId) {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (found) {
        custId = found.id;
        custName = found.name;
        custPhone = found.phone;
      }
    }

    // Generate Invoice Number
    const invoiceNo = 'INV-' + (1000 + sales.length + 1);

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNo,
      customerId: custId,
      customerName: custName || (lang === 'bn' ? 'নগদ ক্রেতা' : 'Cash Customer'),
      customerPhone: custPhone || undefined,
      subtotal,
      discount: discountVal,
      totalAmount: totalBill,
      paidAmount: confirmedPaid,
      dueAmount: remainingDue,
      paymentMethod,
      notes: saleNotes.trim() || undefined,
      items: [...cartItems],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    onRecordSale(newSale);

    // Reset Form
    setCartItems([]);
    setDiscount('0');
    setPaidAmountInput('0');
    setSelectedCustomerId('');
    setCustomCustomerName('');
    setCustomCustomerPhone('');
    setSaleNotes('');

    // Open Voucher Preview
    setSelectedSaleForVoucher(newSale);
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Top Toggle Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {t.sales} (নতুন বিক্রি ও পিওএস)
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'bn'
              ? 'ফটোকপি, স্টুডিও ও স্টেশনারি বিক্রির হিসাব এবং রসিদ তৈরি'
              : 'Record cash and credit sales with printable vouchers'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'pos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'নতুন বিক্রি চালান' : 'New Invoice'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'বিক্রির ইতিহাস' : 'Sales History'} ({sales.length})
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Fast Presets & Product Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Friends Studio Quick Presets */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                {lang === 'bn' ? 'ফ্রেন্ডস স্টুডিও কুইক সার্ভিস ও প্রেসেট' : 'Shop Quick Presets'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {shopPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addItemToCart(preset)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all active:scale-95 flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {preset.name}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums mt-1">
                      ৳ {preset.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Products List (if shopkeeper has stock items) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                {lang === 'bn' ? 'স্টক প্রোডাক্ট থেকে যোগ করুন' : 'From Inventory'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      addItemToCart({
                        name: p.name,
                        category: p.category,
                        price: p.sellingPrice,
                      })
                    }
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 text-left transition-all active:scale-95"
                  >
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {p.name}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-bold text-slate-900 font-mono">
                        ৳ {p.sellingPrice}
                      </span>
                      {!p.isService && (
                        <span className="text-[10px] text-slate-500">
                          {p.currentStock} {p.unit}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active Cart & Billing Checkout (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    {lang === 'bn' ? 'চালানের আইটেম' : 'Invoice Items'} ({cartItems.length})
                  </h3>
                </div>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    {lang === 'bn' ? 'খালি করুন' : 'Clear'}
                  </button>
                )}
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'বাম পাশের প্রেসেট বা প্রোডাক্টে ক্লিক করে আইটেম যোগ করুন'
                    : 'Cart is empty. Select services or products to add.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">
                          {item.name}
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                          <span>
                            দর: ৳
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItemPrice(item.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-14 px-1 py-0.5 text-xs bg-white border border-slate-300 rounded ml-1"
                            />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-300 bg-white rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-slate-100 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-slate-100 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold font-mono text-slate-900 w-12 text-right">
                          ৳ {item.total}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateItemQty(item.id, 0)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Link (Optional or for due credit) */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {lang === 'bn' ? 'গ্রাহক নির্বাচন (বাকি থাকলে আবশ্যক)' : 'Customer (Required for Due)'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    if (e.target.value) {
                      const c = customers.find((cust) => cust.id === e.target.value);
                      if (c) {
                        setCustomCustomerName(c.name);
                        setCustomCustomerPhone(c.phone);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                >
                  <option value="">{lang === 'bn' ? '-- নগদ ক্রেতা (নামহীন) --' : '-- Cash Customer --'}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {lang === 'bn' ? 'পূর্বের বাকি' : 'Due'}: ৳{c.currentBalance}
                    </option>
                  ))}
                </select>

                {!selectedCustomerId && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="ক্রেতার নাম (ঐচ্ছিক)"
                      value={customCustomerName}
                      onChange={(e) => setCustomCustomerName(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder="মোবাইল (ঐচ্ছিক)"
                      value={customCustomerPhone}
                      onChange={(e) => setCustomCustomerPhone(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Billing Math Calculations */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t.subtotal}:</span>
                  <span className="font-mono font-semibold">৳ {subtotal}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>{t.discount}:</span>
                  <div className="flex items-center gap-1">
                    <span>৳</span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>{t.totalBill}:</span>
                  <span className="font-mono text-emerald-700">৳ {totalBill}</span>
                </div>

                {/* Amount Paid vs Due */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                      {t.paidAmount} (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={paidAmountInput}
                      onChange={(e) => setPaidAmountInput(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm font-bold font-mono border border-emerald-300 rounded-lg bg-emerald-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                      {t.dueAmount} (৳)
                    </label>
                    <div className="w-full px-2.5 py-2 text-sm font-bold font-mono border border-amber-300 rounded-lg bg-amber-50/50 text-amber-900">
                      ৳ {remainingDue}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  >
                    <option value="CASH">{t.cash}</option>
                    <option value="BKASH">{t.bkash}</option>
                    <option value="NAGAD">{t.nagad}</option>
                    <option value="ROCKET">{t.rocket}</option>
                    <option value="DUE">{t.dueOnly}</option>
                  </select>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || totalBill <= 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.saveAndPrint} (৳{totalBill})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Sales History Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {sales.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {lang === 'bn' ? 'কোনো বিক্রির রেকর্ড নেই' : 'No sales recorded yet'}
            </div>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {sale.invoiceNo.replace('INV-', '#')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {sale.customerName || (lang === 'bn' ? 'নগদ ক্রেতা' : 'Cash')}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{formatDateBangla(sale.date)}</span>
                      <span>·</span>
                      <span>{sale.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}</span>
                      <span>·</span>
                      <span className="font-semibold">{sale.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      {formatBDT(sale.totalAmount, { lang })}
                    </div>
                    {sale.dueAmount > 0 && (
                      <div className="text-[11px] font-semibold text-amber-700">
                        {lang === 'bn' ? 'বাকি:' : 'Due:'} ৳{sale.dueAmount}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedSaleForVoucher(sale)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                    title="রসিদ দেখুন ও প্রিন্ট করুন"
                  >
                    <Printer className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Printable Thermal Receipt Voucher Modal */}
      <PrintVoucherModal
        isOpen={!!selectedSaleForVoucher}
        onClose={() => setSelectedSaleForVoucher(null)}
        sale={selectedSaleForVoucher}
        settings={settings}
      />
    </div>
  );
};
