import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Smartphone,
  Menu,
} from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  language,
  onOpenMenu,
}) => {
  const t = translations[language];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[48px] transition-colors ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight truncate">{t.dashboard}</span>
        </button>

        <button
          onClick={() => onSelectTab('customers')}
          className={`flex flex-col items-center justify-center min-h-[48px] transition-colors ${
            activeTab === 'customers'
              ? 'text-emerald-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight truncate">{t.customers}</span>
        </button>

        <button
          onClick={() => onSelectTab('sales')}
          className={`flex flex-col items-center justify-center min-h-[48px] transition-colors ${
            activeTab === 'sales'
              ? 'text-emerald-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight truncate">{t.sales}</span>
        </button>

        <button
          onClick={() => onSelectTab('mfs')}
          className={`flex flex-col items-center justify-center min-h-[48px] transition-colors ${
            activeTab === 'mfs'
              ? 'text-emerald-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight truncate">{t.mfs}</span>
        </button>

        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center min-h-[48px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight truncate">মেন্যু</span>
        </button>
      </div>
    </nav>
  );
};
