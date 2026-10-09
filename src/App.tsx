import React, { useState, useEffect } from 'react';
import {
  Customer,
  Supplier,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  Sale,
  Expense,
  Product,
  MfsTransaction,
  AccountBalances,
  AppSettings,
  FinancialSummary,
  Language,
} from './types';
import { storage } from './services/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuickActionModal } from './components/QuickActionModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { PinLockModal } from './components/PinLockModal';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { CustomerScreen } from './screens/CustomerScreen';
import { SupplierScreen } from './screens/SupplierScreen';
import { SalesScreen } from './screens/SalesScreen';
import { MfsScreen } from './screens/MfsScreen';
import { ExpenseScreen } from './screens/ExpenseScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { TestsScreen } from './screens/TestsScreen';
import { AndroidSourceScreen } from './screens/AndroidSourceScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => storage.getSuppliers());
  const [customerLedgers, setCustomerLedgers] = useState<CustomerLedgerEntry[]>(() =>
    storage.getCustomerLedger()
  );
  const [supplierLedgers, setSupplierLedgers] = useState<SupplierLedgerEntry[]>(() =>
    storage.getSupplierLedger()
  );
  const [sales, setSales] = useState<Sale[]>(() => storage.getSales());
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [mfs, setMfs] = useState<MfsTransaction[]>(() => storage.getMfsTransactions());
  const [balances, setBalances] = useState<AccountBalances>(() => storage.getBalances());
  const [summary, setSummary] = useState<FinancialSummary>(() => storage.getFinancialSummary());

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const s = storage.getSettings();
    return s.isPinEnabled && s.pinCode.length === 4;
  });

  // Recompute summary whenever state changes
  const refreshAllState = () => {
    setSettings(storage.getSettings());
    setCustomers(storage.getCustomers());
    setSuppliers(storage.getSuppliers());
    setCustomerLedgers(storage.getCustomerLedger());
    setSupplierLedgers(storage.getSupplierLedger());
    setSales(storage.getSales());
    setExpenses(storage.getExpenses());
    setProducts(storage.getProducts());
    setMfs(storage.getMfsTransactions());
    setBalances(storage.getBalances());
    setSummary(storage.getFinancialSummary());
  };

  // Language Toggle
  const handleToggleLanguage = () => {
    const newLang: Language = settings.language === 'bn' ? 'en' : 'bn';
    const updated: AppSettings = { ...settings, language: newLang };
    storage.saveSettings(updated);
    setSettings(updated);
  };

  // Quick Action routing
  const handleSelectQuickAction = (key: string) => {
    if (key === 'new_sale') {
      setActiveTab('sales');
    } else if (key === 'collect_due') {
      setActiveTab('customers');
    } else if (key === 'add_expense') {
      setActiveTab('expenses');
    } else if (key === 'mfs_tx') {
      setActiveTab('mfs');
    } else if (key === 'add_customer') {
      setActiveTab('customers');
    } else if (key === 'add_supplier') {
      setActiveTab('suppliers');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Optional PIN Lock Overlay */}
      {isLocked && (
        <PinLockModal
          settings={settings}
          onUnlocked={() => setIsLocked(false)}
        />
      )}

      {/* Top Bar Contract Navigation */}
      <Header
        settings={settings}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            summary={summary}
            settings={settings}
            recentSales={sales}
            recentExpenses={expenses}
            recentMfs={mfs}
            customers={customers}
            onNavigate={setActiveTab}
            onOpenQuickAction={() => setIsQuickActionOpen(true)}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerScreen
            customers={customers}
            ledgers={customerLedgers}
            settings={settings}
            onSaveCustomer={(c) => {
              storage.saveCustomer(c);
              refreshAllState();
            }}
            onDeleteCustomer={(id) => {
              storage.deleteCustomer(id);
              refreshAllState();
            }}
            onAddLedgerEntry={(entry) => {
              storage.addCustomerLedgerEntry(entry);
              refreshAllState();
            }}
          />
        )}

        {activeTab === 'suppliers' && (
          <SupplierScreen
            suppliers={suppliers}
            ledgers={supplierLedgers}
            settings={settings}
            onSaveSupplier={(s) => {
              storage.saveSupplier(s);
              refreshAllState();
            }}
            onDeleteSupplier={(id) => {
              storage.deleteSupplier(id);
              refreshAllState();
            }}
            onAddLedgerEntry={(entry) => {
              storage.addSupplierLedgerEntry(entry);
              refreshAllState();
            }}
          />
        )}

        {activeTab === 'sales' && (
          <SalesScreen
            sales={sales}
            products={products}
            customers={customers}
            settings={settings}
            onRecordSale={(sale) => {
              storage.recordSale(sale);
              refreshAllState();
            }}
          />
        )}

        {activeTab === 'mfs' && (
          <MfsScreen
            transactions={mfs}
            balances={balances}
            settings={settings}
            onRecordTransaction={(tx) => {
              storage.recordMfsTransaction(tx);
              refreshAllState();
            }}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseScreen
            expenses={expenses}
            settings={settings}
            onRecordExpense={(exp) => {
              storage.recordExpense(exp);
              refreshAllState();
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryScreen
            products={products}
            settings={settings}
            onSaveProduct={(prod) => {
              storage.saveProduct(prod);
              refreshAllState();
            }}
            onAdjustStock={(id, delta) => {
              storage.adjustStock(id, delta);
              refreshAllState();
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsScreen
            summary={summary}
            sales={sales}
            expenses={expenses}
            customers={customers}
            suppliers={suppliers}
            mfs={mfs}
            settings={settings}
          />
        )}

        {activeTab === 'tests' && (
          <TestsScreen
            settings={settings}
            onNavigateToCode={() => setActiveTab('android')}
          />
        )}

        {activeTab === 'android' && (
          <AndroidSourceScreen settings={settings} />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={(newSettings) => {
              storage.saveSettings(newSettings);
              refreshAllState();
            }}
            onDataReset={() => {
              refreshAllState();
            }}
          />
        )}
      </main>

      {/* Mobile Touch Navigation (Pattern 1) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={settings.language}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Quick Action Trigger Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleSelectQuickAction}
        language={settings.language}
      />

      {/* Mobile Drawer Menu for More Tabs */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectTab={setActiveTab}
        language={settings.language}
      />
    </div>
  );
}
