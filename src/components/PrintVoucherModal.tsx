import React from 'react';
import { X, Printer, Share2, Check } from 'lucide-react';
import { Sale, AppSettings } from '../types';
import { formatBDT, formatDateBangla } from '../utils/accounting';
import { getWhatsAppUrl, getSmsUrl } from '../utils/smsGenerator';

interface PrintVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  settings: AppSettings;
}

export const PrintVoucherModal: React.FC<PrintVoucherModalProps> = ({
  isOpen,
  onClose,
  sale,
  settings,
}) => {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const shareText = `*${settings.shopNameBangla}*
চালান নং: ${sale.invoiceNo}
তারিখ: ${formatDateBangla(sale.date)}
গ্রাহক: ${sale.customerName || 'নগদ ক্রেতা'}
মোট বিল: ${formatBDT(sale.totalAmount, { lang: 'bn' })}
নগদ পরিশোধ: ${formatBDT(sale.paidAmount, { lang: 'bn' })}
অবশিষ্ট বাকি: ${formatBDT(sale.dueAmount, { lang: 'bn' })}

ধন্যবাদান্তে,
${settings.shopNameBangla}
যোগাযোগ: ${settings.phone}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="font-bold text-slate-800 text-sm">
            বিক্রির রসিদ / ভাউচার
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable thermal receipt view */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs" id="printable-voucher">
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="text-lg font-bold text-slate-900 font-sans">
              {settings.shopNameBangla}
            </h2>
            <p className="text-slate-600 text-[11px] font-sans">{settings.address}</p>
            <p className="text-slate-600 text-[11px]">মোবাইল: {settings.phone}</p>
          </div>

          <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">চালান নং:</span>
              <span className="font-bold text-slate-800">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">তারিখ:</span>
              <span>{formatDateBangla(sale.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">গ্রাহকের নাম:</span>
              <span className="font-semibold text-slate-800">{sale.customerName || 'নগদ ক্রেতা'}</span>
            </div>
            {sale.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">মোবাইল:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="py-1">বিবরণ</th>
                  <th className="py-1 text-center">পরিমাণ</th>
                  <th className="py-1 text-right">দর</th>
                  <th className="py-1 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="text-[12px]">
                    <td className="py-1.5 pr-2 font-medium text-slate-800">{item.name}</td>
                    <td className="py-1.5 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-600">{item.unitPrice}</td>
                    <td className="py-1.5 text-right font-semibold text-slate-900">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-3 space-y-1.5 font-sans">
            <div className="flex justify-between text-xs text-slate-600">
              <span>মোট মূল্য:</span>
              <span>{formatBDT(sale.subtotal, { lang: 'bn' })}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-xs text-red-600">
                <span>ছাড় (ডিসকাউন্ট):</span>
                <span>-{formatBDT(sale.discount, { lang: 'bn' })}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
              <span>সর্বমোট বিল:</span>
              <span>{formatBDT(sale.totalAmount, { lang: 'bn' })}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-700">
              <span>জমা প্রদান:</span>
              <span>{formatBDT(sale.paidAmount, { lang: 'bn' })}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-amber-700 border-t border-dashed border-slate-300 pt-1">
              <span>অবশিষ্ট বাকি:</span>
              <span>{formatBDT(sale.dueAmount, { lang: 'bn' })}</span>
            </div>
          </div>

          <div className="pt-4 text-center border-t border-dashed border-slate-300 text-[11px] text-slate-500 font-sans">
            <p>আমাদের সাথে থাকার জন্য ধন্যবাদ!</p>
            <p className="mt-0.5">ডিজিটাল হিসাব: ফ্রেন্ডস হিসাব অ্যাপ</p>
          </div>
        </div>

        {/* Footer sharing options */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          {sale.customerPhone ? (
            <a
              href={getWhatsAppUrl(sale.customerPhone, shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>হোয়াটসঅ্যাপে পাঠান</span>
            </a>
          ) : (
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'মেসেজ কপি হয়েছে' : 'রসিদ কপি করুন'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
