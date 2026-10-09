import React from 'react';
import {
  X,
  Truck,
  Receipt,
  Boxes,
  FileText,
  Code2,
  ShieldCheck,
  Settings,
  Store,
} from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  language: Language;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-xs bg-white h-full flex flex-col shadow-xl animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'bn' ? 'সব বিভাগ ও সেটিংস' : 'All Sections'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <button
            onClick={() => handleSelect('suppliers')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>{t.suppliers}</span>
          </button>

          <button
            onClick={() => handleSelect('expenses')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Receipt className="w-5 h-5 text-amber-600" />
            <span>{t.expenses}</span>
          </button>

          <button
            onClick={() => handleSelect('inventory')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Boxes className="w-5 h-5 text-teal-600" />
            <span>{t.inventory}</span>
          </button>

          <button
            onClick={() => handleSelect('reports')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span>{t.reports}</span>
          </button>

          <div className="my-2 border-t border-slate-100" />

          <button
            onClick={() => handleSelect('android')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <Code2 className="w-5 h-5 text-emerald-700" />
            <span>{t.androidCode}</span>
          </button>

          <button
            onClick={() => handleSelect('tests')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{t.tests}</span>
          </button>

          <button
            onClick={() => handleSelect('settings')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-600" />
            <span>{t.settings}</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-500 text-center">
          ফ্রেন্ডস হিসাব · ১০০% অফলাইন ও ফ্রি
        </div>
      </div>
    </div>
  );
};
