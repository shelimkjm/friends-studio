import React from 'react';
import {
  Store,
  Plus,
  Languages,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { AppSettings, Language } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  settings: AppSettings;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAction: () => void;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  onSelectTab,
  onOpenQuickAction,
  onToggleLanguage,
}) => {
  const t = translations[settings.language];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base leading-tight tracking-tight whitespace-nowrap">
              {settings.language === 'bn' ? settings.shopNameBangla : settings.shopName}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, unboxed) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'dashboard'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.dashboard}
          </button>
          <button
            onClick={() => onSelectTab('customers')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'customers'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.customers}
          </button>
          <button
            onClick={() => onSelectTab('suppliers')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'suppliers'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.suppliers}
          </button>
          <button
            onClick={() => onSelectTab('sales')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'sales'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.sales}
          </button>
          <button
            onClick={() => onSelectTab('mfs')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'mfs'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.mfs}
          </button>
          <button
            onClick={() => onSelectTab('expenses')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'expenses'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.expenses}
          </button>
          <button
            onClick={() => onSelectTab('inventory')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'inventory'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.inventory}
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'reports'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.reports}
          </button>
          <button
            onClick={() => onSelectTab('android')}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'text-indigo-600 hover:text-indigo-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.androidCode}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleLanguage}
            title="বাংলা / English"
            className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>{settings.language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button
            onClick={() => onSelectTab('tests')}
            title="১০টি আর্থিক অডিট টেস্ট"
            className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hidden sm:flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.tests}</span>
          </button>

          <button
            onClick={onOpenQuickAction}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t.quickActions}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
