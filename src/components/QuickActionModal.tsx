import React from 'react';
import {
  X,
  ShoppingCart,
  HandCoins,
  Receipt,
  Smartphone,
  UserPlus,
  Truck,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string) => void;
  language: Language;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const actions = [
    {
      key: 'new_sale',
      label: t.newSale,
      sublabel: language === 'bn' ? 'নগদ বা বাকি বিক্রি ও চালান' : 'Cash or credit invoice',
      icon: ShoppingCart,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    },
    {
      key: 'collect_due',
      label: t.recordPayment,
      sublabel: language === 'bn' ? 'গ্রাহক থেকে বাকি টাকা জমা' : 'Receive customer due payment',
      icon: HandCoins,
      color: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      key: 'add_expense',
      label: t.recordExpense,
      sublabel: language === 'bn' ? 'ভাড়া, বিদ্যুৎ, কালি, নাস্তা' : 'Rent, paper, tea, utility bills',
      icon: Receipt,
      color: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100',
    },
    {
      key: 'mfs_tx',
      label: t.mfsTransaction,
      sublabel: language === 'bn' ? 'ক্যাশ-ইন, ক্যাশ-আউট ও রিচার্জ' : 'Cash in, Cash out, Recharge',
      icon: Smartphone,
      color: 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      key: 'add_customer',
      label: t.addCustomer,
      sublabel: language === 'bn' ? 'নতুন গ্রাহক ও পূর্বের বাকি' : 'Create customer ledger profile',
      icon: UserPlus,
      color: 'text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100',
    },
    {
      key: 'add_supplier',
      label: t.addSupplier,
      sublabel: language === 'bn' ? 'মহাজন বা পাইকার যোগ' : 'Create supplier / vendor account',
      icon: Truck,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {t.quickActions}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'যে কোনো লেনদেন দ্রুত রেকর্ড করুন' : 'Select quick transaction action'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[75vh] overflow-y-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.key}
                onClick={() => {
                  onSelectAction(act.key);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all active:scale-98 ${act.color}`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-xs shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {act.label}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {act.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
