import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Package,
} from 'lucide-react';
import { Product, AppSettings } from '../types';
import { formatBDT, safeAdd, safeSub } from '../utils/accounting';
import { translations } from '../utils/translations';

interface InventoryScreenProps {
  products: Product[];
  settings: AppSettings;
  onSaveProduct: (product: Product) => void;
  onAdjustStock: (productId: string, deltaQty: number) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  products,
  settings,
  onSaveProduct,
  onAdjustStock,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('খাতা, কলম ও স্টেশনারি');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minAlert, setMinAlert] = useState('5');
  const [unit, setUnit] = useState('পিস');
  const [isService, setIsService] = useState(false);

  // Inventory valuation
  let totalValuation = 0;
  let lowStockCount = 0;
  for (const p of products) {
    if (!p.isService) {
      totalValuation = safeAdd(totalValuation, p.currentStock * p.costPrice);
      if (p.currentStock <= p.minStockAlert) {
        lowStockCount += 1;
      }
    }
  }

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('খাতা, কলম ও স্টেশনারি');
    setCostPrice('');
    setSellingPrice('');
    setStock('0');
    setMinAlert('5');
    setUnit('পিস');
    setIsService(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setCostPrice(p.costPrice.toString());
    setSellingPrice(p.sellingPrice.toString());
    setStock(p.currentStock.toString());
    setMinAlert(p.minStockAlert.toString());
    setUnit(p.unit);
    setIsService(p.isService);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cost = parseFloat(costPrice) || 0;
    const sell = parseFloat(sellingPrice) || 0;
    const curStock = parseInt(stock, 10) || 0;
    const alertLvl = parseInt(minAlert, 10) || 0;

    const prodToSave: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      name: name.trim(),
      category,
      costPrice: cost,
      sellingPrice: sell,
      currentStock: isService ? 0 : curStock,
      minStockAlert: isService ? 0 : alertLvl,
      isService,
      unit: unit.trim() || 'পিস',
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(prodToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {t.inventory} (স্টক ও পণ্য তালিকা)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'bn'
              ? 'স্টেশনারি স্টক, ক্রয়মূল্য, বিক্রয়মূল্য ও সম্ভাব্য মুনাফা'
              : 'Product inventory valuation & low-stock alerts'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">
              {lang === 'bn' ? 'মোট স্টক মূল্য:' : 'Stock Value:'}
            </span>
            <span className="text-lg sm:text-xl font-bold text-emerald-800 font-mono tabular-nums">
              {formatBDT(totalValuation, { lang })}
            </span>
          </div>
          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন পণ্য / সেবা যোগ' : 'Add Item'}</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {lang === 'bn'
                ? `সতর্কতা: ${lowStockCount}টি পণ্যের স্টক কমে গেছে! পাইকার থেকে মালামাল আনা প্রয়োজন।`
                : `Low stock alert: ${lowStockCount} items running low.`}
            </span>
          </div>
        </div>
      )}

      {/* Products Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {products.map((p) => {
          const isLow = !p.isService && p.currentStock <= p.minStockAlert;
          const profitMargin = safeSub(p.sellingPrice, p.costPrice);

          return (
            <div
              key={p.id}
              className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    p.isService
                      ? 'bg-purple-50 text-purple-700'
                      : isLow
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-50 text-teal-700'
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>{p.name}</span>
                    {p.isService ? (
                      <span className="text-[10px] text-purple-800 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                        সেবা (ডিজিটাল)
                      </span>
                    ) : (
                      isLow && (
                        <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          স্টক শেষ প্রায়
                        </span>
                      )
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>{p.category}</span>
                    <span>·</span>
                    <span>ক্রয়: ৳{p.costPrice}</span>
                    <span>·</span>
                    <span>বিক্রয়: ৳{p.sellingPrice}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold">
                      লাভ: +৳{profitMargin} / {p.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!p.isService ? (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-sm ${
                          isLow ? 'text-amber-700' : 'text-slate-900'
                        }`}
                      >
                        {p.currentStock} {p.unit}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        স্টক মান: ৳{p.currentStock * p.costPrice}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onAdjustStock(p.id, 10)}
                        title="+10 স্টক যোগ"
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold"
                      >
                        +১০
                      </button>
                      <button
                        onClick={() => onAdjustStock(p.id, -1)}
                        title="-1 স্টক কমানো"
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold"
                      >
                        -১
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">অসীম (সার্ভিস)</span>
                )}

                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct
                  ? (lang === 'bn' ? 'পণ্য সম্পাদনা' : 'Edit Item')
                  : (lang === 'bn' ? 'নতুন পণ্য বা সেবা যোগ' : 'Add Item')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পণ্য বা সেবার নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ম্যাটাডোর বলপেন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                >
                  <option value="খাতা, কলম ও স্টেশনারি">খাতা, কলম ও স্টেশনারি</option>
                  <option value="ফটোকপি">ফটোকপি</option>
                  <option value="কালার/সাদা-কালো প্রিন্টিং">কালার/সাদা-কালো প্রিন্টিং</option>
                  <option value="পাসপোর্ট সাইজ ছবি ও প্রিন্ট">পাসপোর্ট সাইজ ছবি ও প্রিন্ট</option>
                  <option value="লেমিনেটিং">লেমিনেটিং</option>
                  <option value="চাকরির আবেদন ও রেজাল্ট">চাকরির আবেদন ও রেজাল্ট</option>
                  <option value="অনলাইন ফরম পূরণ ও চালান">অনলাইন ফরম পূরণ ও চালান</option>
                  <option value="অন্যান্য মালামাল ও সেবা">অন্যান্য মালামাল ও সেবা</option>
                </select>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isServiceCheck"
                  checked={isService}
                  onChange={(e) => setIsService(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <label htmlFor="isServiceCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  এটি একটি ডিজিটাল সেবা (যেমন: ফটোকপি বা প্রিন্ট, স্টক কমবে না)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ক্রয়মূল্য / খরচ (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিক্রয়মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {!isService && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      বর্তমান স্টক
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      একক (Unit)
                    </label>
                    <input
                      type="text"
                      placeholder="পিস/রিম"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      অ্যালার্ট লেভেল
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minAlert}
                      onChange={(e) => setMinAlert(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              )}

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
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs"
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
