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
} from '../types';
import { toPaisa, fromPaisa, safeAdd, safeSub } from '../utils/accounting';

const STORAGE_KEYS = {
  VERSION: 'friends_hisab_version_v1',
  CUSTOMERS: 'friends_hisab_customers',
  SUPPLIERS: 'friends_hisab_suppliers',
  CUSTOMER_LEDGERS: 'friends_hisab_customer_ledgers',
  SUPPLIER_LEDGERS: 'friends_hisab_supplier_ledgers',
  SALES: 'friends_hisab_sales',
  EXPENSES: 'friends_hisab_expenses',
  PRODUCTS: 'friends_hisab_products',
  MFS_TRANSACTIONS: 'friends_hisab_mfs_transactions',
  BALANCES: 'friends_hisab_balances',
  SETTINGS: 'friends_hisab_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'Friends Studio & Cyber Cafe',
  shopNameBangla: 'ফ্রেন্ডস স্টুডিও ও হিসাব',
  ownerName: 'মো: রফিকুল ইসলাম',
  phone: '01712-345678',
  address: 'কলেজ রোড, নতুন বাজার, ঢাকা',
  currencySymbol: '৳',
  language: 'bn',
  theme: 'light',
  pinCode: '',
  isPinEnabled: false,
  businessType: 'ফটোকপি, কম্পিউটার সেবা ও স্টেশনারি',
};

const DEFAULT_BALANCES: AccountBalances = {
  cashOnHand: 15450, // নগদ ক্যাশ
  bkashFloat: 25000, // বিকাশ এজেন্ট ফ্লোট
  nagadFloat: 18500, // নগদ এজেন্ট ফ্লোট
  rocketFloat: 8000,  // রকেট এজেন্ট ফ্লোট
  rechargeBalance: 4200, // রিচার্জ সিম ব্যালেন্স
  bankBalance: 45000,
};

// Seed realistic data for Friends Studio
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'ফটোকপি (A4 এক পৃষ্ঠা)',
    category: 'ফটোকপি',
    costPrice: 0.8,
    sellingPrice: 2.0,
    currentStock: 0,
    minStockAlert: 0,
    isService: true,
    unit: 'পৃষ্ঠা',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'পাসপোর্ট সাইজ ছবি (৪ কপি ল্যাব প্রিন্ট)',
    category: 'পাসপোর্ট সাইজ ছবি ও প্রিন্ট',
    costPrice: 15.0,
    sellingPrice: 50.0,
    currentStock: 0,
    minStockAlert: 0,
    isService: true,
    unit: 'সেট',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'অনলাইন সরকারি চাকরির আবেদন',
    category: 'চাকরির আবেদন ও রেজাল্ট',
    costPrice: 0,
    sellingPrice: 100.0,
    currentStock: 0,
    minStockAlert: 0,
    isService: true,
    unit: 'আবেদন',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'ম্যাটাডোর অল-টাইম বলপেন (কালো)',
    category: 'খাতা, কলম ও স্টেশনারি',
    costPrice: 4.5,
    sellingPrice: 6.0,
    currentStock: 120,
    minStockAlert: 20,
    isService: false,
    unit: 'পিস',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'প্র্যাকটিক্যাল খাতা (বড়)',
    category: 'খাতা, কলম ও স্টেশনারি',
    costPrice: 38.0,
    sellingPrice: 55.0,
    currentStock: 35,
    minStockAlert: 10,
    isService: false,
    unit: 'পিস',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'আইডি কার্ড ও সার্টিফিকেট লেমিনেটিং',
    category: 'লেমিনেটিং',
    costPrice: 8.0,
    sellingPrice: 20.0,
    currentStock: 0,
    minStockAlert: 0,
    isService: true,
    unit: 'পিস',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'তানভীর হাসান (শিক্ষক)',
    phone: '01711223344',
    address: 'মডেল হাই স্কুল রোড',
    notes: 'স্কুলের প্রশ্নপত্র ও শিট প্রিন্ট করান',
    openingBalance: 400,
    currentBalance: 400, // ৳400 due
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    name: 'মেসার্স ভাই ভাই হার্ডওয়্যার',
    phone: '01819556677',
    address: 'দোকান নং ১২, মেইন বাজার',
    notes: 'মাসিক ভাউচার খাতা প্রিন্ট',
    openingBalance: 1250,
    currentBalance: 1250,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    name: 'শরীফুল ইসলাম',
    phone: '01911445566',
    address: 'গ্রাম: চরপাড়া',
    notes: 'চাকরির আবেদন ও ছবি',
    openingBalance: 0,
    currentBalance: 0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'আল-মদিনা পেপার হাউস',
    companyName: 'আল-মদিনা পেপার হাউস (বাংলাবাজার)',
    phone: '01715889900',
    address: 'বাংলাবাজার, ঢাকা',
    openingBalance: 4500,
    currentBalance: 4500, // ৳4,500 payable to supplier
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'supp-2',
    name: 'স্মার্ট কালার টোনার ও ইঙ্ক',
    companyName: 'স্মার্ট টেকনোলজিস',
    phone: '01612778899',
    address: 'এলিফ্যান্ট রোড, ঢাকা',
    openingBalance: 1800,
    currentBalance: 1800,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_CUSTOMER_LEDGERS: CustomerLedgerEntry[] = [
  {
    id: 'cledger-1',
    customerId: 'cust-1',
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    type: 'CREDIT_SALE',
    amount: 1000,
    balanceAfter: 1000,
    description: 'স্কুলের পরীক্ষার প্রশ্ন ফটোকপি ৫০০ পাতা',
  },
  {
    id: 'cledger-2',
    customerId: 'cust-1',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    type: 'PAYMENT_RECEIVED',
    amount: 600,
    balanceAfter: 400,
    description: 'নগদ ক্যাশ পরিশোধ',
    paymentMethod: 'CASH',
  },
];

const INITIAL_SUPPLIER_LEDGERS: SupplierLedgerEntry[] = [
  {
    id: 'sledger-1',
    supplierId: 'supp-1',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    type: 'PURCHASE',
    amount: 9500,
    balanceAfter: 9500,
    description: 'A4 ফটোকপি পেপার ৫ কার্টন ক্রয়',
  },
  {
    id: 'sledger-2',
    supplierId: 'supp-1',
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    type: 'PAYMENT_MADE',
    amount: 5000,
    balanceAfter: 4500,
    description: 'ব্যাংক ট্রান্সফারের মাধ্যমে পরিশোধ',
    paymentMethod: 'BANK',
  },
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    invoiceNo: 'INV-1001',
    customerId: 'cust-1',
    customerName: 'তানভীর হাসান (শিক্ষক)',
    customerPhone: '01711223344',
    subtotal: 1000,
    discount: 0,
    totalAmount: 1000,
    paidAmount: 600,
    dueAmount: 400,
    paymentMethod: 'CASH',
    notes: 'স্কুল প্রশ্ন ফটোকপি',
    items: [
      {
        id: 'sitem-1',
        productId: 'prod-1',
        name: 'ফটোকপি (A4 এক পৃষ্ঠা)',
        category: 'ফটোকপি',
        quantity: 500,
        unitPrice: 2.0,
        total: 1000,
      },
    ],
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'sale-2',
    invoiceNo: 'INV-1002',
    customerName: 'নগদ ক্রেতা',
    subtotal: 150,
    discount: 0,
    totalAmount: 150,
    paidAmount: 150,
    dueAmount: 0,
    paymentMethod: 'CASH',
    notes: 'পাসপোর্ট ছবি ও ফটোকপি',
    items: [
      {
        id: 'sitem-2',
        productId: 'prod-2',
        name: 'পাসপোর্ট সাইজ ছবি (৪ কপি ল্যাব প্রিন্ট)',
        category: 'পাসপোর্ট সাইজ ছবি ও প্রিন্ট',
        quantity: 1,
        unitPrice: 50.0,
        total: 50,
      },
      {
        id: 'sitem-3',
        productId: 'prod-3',
        name: 'অনলাইন সরকারি চাকরির আবেদন',
        category: 'চাকরির আবেদন ও রেজাল্ট',
        quantity: 1,
        unitPrice: 100.0,
        total: 100,
      },
    ],
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    category: 'বিদ্যুৎ ও ইন্টারনেট বিল',
    amount: 1200,
    paymentMethod: 'BKASH',
    description: 'পল্লী বিদ্যুৎ অফিস বিল প্রদান',
    reference: 'PDB-98441',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'exp-2',
    category: 'চা-নাস্তা ও আপ্যায়ন',
    amount: 60,
    paymentMethod: 'CASH',
    description: 'গ্রাহক আপ্যায়ন ও চা',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_MFS: MfsTransaction[] = [
  {
    id: 'mfs-1',
    provider: 'BKASH',
    type: 'CASH_OUT',
    amount: 2000,
    customerFee: 0,
    commission: 8.2, // bKash agent commission ~4.10 per thousand
    customerPhone: '01722334455',
    refNumber: 'BKI9842109',
    date: new Date().toISOString(),
    notes: 'গ্রাহককে ২০০০ টাকা ক্যাশ প্রদান, ফ্লোট জমা',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mfs-2',
    provider: 'NAGAD',
    type: 'CASH_IN',
    amount: 1500,
    customerFee: 0,
    commission: 6.0,
    customerPhone: '01833445566',
    refNumber: 'NGD443918',
    date: new Date().toISOString(),
    notes: 'গ্রাহক থেকে নগদ ক্যাশ গ্রহণ, ফ্লোট ট্রান্সফার',
    createdAt: new Date().toISOString(),
  },
];

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
    }
  }

  public init() {
    if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.setItem(STORAGE_KEYS.VERSION, '1.0.0');
    this.setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    this.setItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    this.setItem(STORAGE_KEYS.CUSTOMER_LEDGERS, INITIAL_CUSTOMER_LEDGERS);
    this.setItem(STORAGE_KEYS.SUPPLIER_LEDGERS, INITIAL_SUPPLIER_LEDGERS);
    this.setItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    this.setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.setItem(STORAGE_KEYS.MFS_TRANSACTIONS, INITIAL_MFS);
    this.setItem(STORAGE_KEYS.BALANCES, DEFAULT_BALANCES);
    this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  }

  public saveCustomer(customer: Customer): void {
    const list = this.getCustomers();
    const idx = list.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      list[idx] = { ...customer, updatedAt: new Date().toISOString() };
    } else {
      list.push(customer);
    }
    this.setItem(STORAGE_KEYS.CUSTOMERS, list);
  }

  public deleteCustomer(id: string): void {
    const list = this.getCustomers().filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.CUSTOMERS, list);
  }

  // --- Customer Ledger ---
  public getCustomerLedger(customerId?: string): CustomerLedgerEntry[] {
    const list = this.getItem<CustomerLedgerEntry[]>(
      STORAGE_KEYS.CUSTOMER_LEDGERS,
      []
    );
    if (!customerId) return list;
    return list.filter((e) => e.customerId === customerId);
  }

  /**
   * Record Customer Ledger Transaction and automatically update customer's current balance
   * e.g., credit sale adds to balance (receivable), payment reduces balance
   */
  public addCustomerLedgerEntry(
    entry: Omit<CustomerLedgerEntry, 'id' | 'balanceAfter'>
  ): CustomerLedgerEntry {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === entry.customerId);
    const currentBal = customer ? customer.currentBalance : 0;

    let newBalance = currentBal;
    if (entry.type === 'CREDIT_SALE') {
      newBalance = safeAdd(currentBal, entry.amount);
    } else if (entry.type === 'PAYMENT_RECEIVED') {
      newBalance = safeSub(currentBal, entry.amount);
    } else if (entry.type === 'REFUND') {
      newBalance = safeAdd(currentBal, entry.amount);
    } else if (entry.type === 'ADJUSTMENT') {
      newBalance = entry.amount; // explicit set
    }

    const fullEntry: CustomerLedgerEntry = {
      ...entry,
      id: 'cledger-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      balanceAfter: newBalance,
    };

    const ledgers = this.getItem<CustomerLedgerEntry[]>(
      STORAGE_KEYS.CUSTOMER_LEDGERS,
      []
    );
    ledgers.push(fullEntry);
    this.setItem(STORAGE_KEYS.CUSTOMER_LEDGERS, ledgers);

    if (customer) {
      customer.currentBalance = newBalance;
      this.saveCustomer(customer);
    }

    // If payment was received in cash/mfs, update the relevant balance
    if (entry.type === 'PAYMENT_RECEIVED' && entry.paymentMethod) {
      this.updateBalanceOnIncome(entry.amount, entry.paymentMethod);
    }

    return fullEntry;
  }

  // --- Suppliers ---
  public getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
  }

  public saveSupplier(supplier: Supplier): void {
    const list = this.getSuppliers();
    const idx = list.findIndex((s) => s.id === supplier.id);
    if (idx >= 0) {
      list[idx] = { ...supplier, updatedAt: new Date().toISOString() };
    } else {
      list.push(supplier);
    }
    this.setItem(STORAGE_KEYS.SUPPLIERS, list);
  }

  public deleteSupplier(id: string): void {
    const list = this.getSuppliers().filter((s) => s.id !== id);
    this.setItem(STORAGE_KEYS.SUPPLIERS, list);
  }

  // --- Supplier Ledger ---
  public getSupplierLedger(supplierId?: string): SupplierLedgerEntry[] {
    const list = this.getItem<SupplierLedgerEntry[]>(
      STORAGE_KEYS.SUPPLIER_LEDGERS,
      []
    );
    if (!supplierId) return list;
    return list.filter((e) => e.supplierId === supplierId);
  }

  public addSupplierLedgerEntry(
    entry: Omit<SupplierLedgerEntry, 'id' | 'balanceAfter'>
  ): SupplierLedgerEntry {
    const suppliers = this.getSuppliers();
    const supplier = suppliers.find((s) => s.id === entry.supplierId);
    const currentBal = supplier ? supplier.currentBalance : 0;

    let newBalance = currentBal;
    if (entry.type === 'PURCHASE') {
      newBalance = safeAdd(currentBal, entry.amount);
    } else if (entry.type === 'PAYMENT_MADE') {
      newBalance = safeSub(currentBal, entry.amount);
    }

    const fullEntry: SupplierLedgerEntry = {
      ...entry,
      id: 'sledger-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      balanceAfter: newBalance,
    };

    const ledgers = this.getItem<SupplierLedgerEntry[]>(
      STORAGE_KEYS.SUPPLIER_LEDGERS,
      []
    );
    ledgers.push(fullEntry);
    this.setItem(STORAGE_KEYS.SUPPLIER_LEDGERS, ledgers);

    if (supplier) {
      supplier.currentBalance = newBalance;
      this.saveSupplier(supplier);
    }

    // Payment made reduces cash or bank balance
    if (entry.type === 'PAYMENT_MADE' && entry.paymentMethod) {
      this.updateBalanceOnExpense(entry.amount, entry.paymentMethod);
    }

    return fullEntry;
  }

  // --- Sales & Inventory Integration ---
  public getSales(): Sale[] {
    return this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
  }

  /**
   * Process a sale:
   * 1. Deduct stock for inventory items (services are skipped)
   * 2. If customer owes due amount > 0, post credit sale entry to customer ledger
   * 3. Update cash/MFS balances for the paid portion
   * 4. Save sale record
   */
  public recordSale(sale: Sale): void {
    const sales = this.getSales();
    sales.unshift(sale);
    this.setItem(STORAGE_KEYS.SALES, sales);

    // 1. Deduct inventory items
    const products = this.getProducts();
    for (const item of sale.items) {
      if (item.productId) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && !prod.isService) {
          prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
          prod.updatedAt = new Date().toISOString();
        }
      }
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // 2. Post to Customer Ledger if due or attached customer
    if (sale.customerId && sale.dueAmount > 0) {
      this.addCustomerLedgerEntry({
        customerId: sale.customerId,
        date: sale.date,
        type: 'CREDIT_SALE',
        amount: sale.dueAmount,
        description: `চালান #${sale.invoiceNo} (মোট: ৳${sale.totalAmount}, পরিশোধ: ৳${sale.paidAmount}, বাকি: ৳${sale.dueAmount})`,
        referenceId: sale.id,
      });
    }

    // 3. Update Account Balances for the cash/paid portion
    if (sale.paidAmount > 0 && sale.paymentMethod !== 'DUE') {
      this.updateBalanceOnIncome(sale.paidAmount, sale.paymentMethod);
    }
  }

  // --- Expenses ---
  public getExpenses(): Expense[] {
    return this.getItem<Expense[]>(STORAGE_KEYS.EXPENSES, []);
  }

  public recordExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    expenses.unshift(expense);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);

    // Deduct from matching payment source
    this.updateBalanceOnExpense(expense.amount, expense.paymentMethod);
  }

  // --- Products / Inventory ---
  public getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  }

  public saveProduct(product: Product): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      list[idx] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      list.push(product);
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, list);
  }

  public adjustStock(productId: string, deltaQty: number): void {
    const list = this.getProducts();
    const prod = list.find((p) => p.id === productId);
    if (prod && !prod.isService) {
      prod.currentStock = Math.max(0, prod.currentStock + deltaQty);
      prod.updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.PRODUCTS, list);
    }
  }

  // --- MFS (bKash / Nagad / Rocket / Recharge) Ledger ---
  public getMfsTransactions(): MfsTransaction[] {
    return this.getItem<MfsTransaction[]>(STORAGE_KEYS.MFS_TRANSACTIONS, []);
  }

  /**
   * Record MFS Transaction and cleanly adjust Cash on hand vs MFS Float:
   * - CASH_IN: Customer brings physical cash to shop -> Shop takes cash (+Cash), Shop transfers MFS Float (-Float)
   * - CASH_OUT: Customer sends MFS to Shop Float (+Float) -> Shop hands physical cash to customer (-Cash)
   * - RECHARGE: Shop dials recharge from balance (-Recharge) -> Customer gives physical cash (+Cash)
   * - FLOAT_DEPOSIT: Shop buys float with cash -> (-Cash, +Float)
   * - FLOAT_WITHDRAW: Shop liquidates float for cash -> (+Cash, -Float)
   * Commission earned is added to income and cash on hand or float balance!
   */
  public recordMfsTransaction(tx: MfsTransaction): void {
    const list = this.getMfsTransactions();
    list.unshift(tx);
    this.setItem(STORAGE_KEYS.MFS_TRANSACTIONS, list);

    const balances = this.getBalances();
    const amount = tx.amount;
    const commission = tx.commission || 0;

    // Helper to get float property
    const getFloatKey = (provider: string): keyof AccountBalances => {
      if (provider === 'BKASH') return 'bkashFloat';
      if (provider === 'NAGAD') return 'nagadFloat';
      if (provider === 'ROCKET') return 'rocketFloat';
      return 'rechargeBalance';
    };

    const floatKey = getFloatKey(tx.provider);

    switch (tx.type) {
      case 'CASH_IN':
        // Customer gives cash to shop, shop sends MFS
        balances.cashOnHand = safeAdd(balances.cashOnHand, amount);
        balances[floatKey] = safeSub(balances[floatKey], amount);
        if (commission > 0) {
          balances.cashOnHand = safeAdd(balances.cashOnHand, commission);
        }
        break;

      case 'CASH_OUT':
        // Shop gives physical cash to customer, shop receives float
        balances.cashOnHand = safeSub(balances.cashOnHand, amount);
        balances[floatKey] = safeAdd(balances[floatKey], amount);
        if (commission > 0) {
          // Agent commission is credited to float or cash
          balances.cashOnHand = safeAdd(balances.cashOnHand, commission);
        }
        break;

      case 'RECHARGE':
        // Shop uses recharge balance, customer gives cash
        balances.cashOnHand = safeAdd(balances.cashOnHand, amount);
        balances.rechargeBalance = safeSub(balances.rechargeBalance, amount);
        if (commission > 0) {
          balances.cashOnHand = safeAdd(balances.cashOnHand, commission);
        }
        break;

      case 'SEND_MONEY':
        balances.cashOnHand = safeAdd(balances.cashOnHand, amount);
        balances[floatKey] = safeSub(balances[floatKey], amount);
        if (commission > 0) {
          balances.cashOnHand = safeAdd(balances.cashOnHand, commission);
        }
        break;

      case 'FLOAT_DEPOSIT':
        // Shop spent cash to buy float
        balances.cashOnHand = safeSub(balances.cashOnHand, amount);
        balances[floatKey] = safeAdd(balances[floatKey], amount);
        break;

      case 'FLOAT_WITHDRAW':
        balances.cashOnHand = safeAdd(balances.cashOnHand, amount);
        balances[floatKey] = safeSub(balances[floatKey], amount);
        break;
    }

    this.saveBalances(balances);
  }

  // --- Balances ---
  public getBalances(): AccountBalances {
    return this.getItem<AccountBalances>(
      STORAGE_KEYS.BALANCES,
      DEFAULT_BALANCES
    );
  }

  public saveBalances(balances: AccountBalances): void {
    this.setItem(STORAGE_KEYS.BALANCES, balances);
  }

  private updateBalanceOnIncome(amount: number, method: string): void {
    const balances = this.getBalances();
    if (method === 'CASH') {
      balances.cashOnHand = safeAdd(balances.cashOnHand, amount);
    } else if (method === 'BKASH') {
      balances.bkashFloat = safeAdd(balances.bkashFloat, amount);
    } else if (method === 'NAGAD') {
      balances.nagadFloat = safeAdd(balances.nagadFloat, amount);
    } else if (method === 'ROCKET') {
      balances.rocketFloat = safeAdd(balances.rocketFloat, amount);
    } else if (method === 'BANK') {
      balances.bankBalance = safeAdd(balances.bankBalance, amount);
    }
    this.saveBalances(balances);
  }

  private updateBalanceOnExpense(amount: number, method: string): void {
    const balances = this.getBalances();
    if (method === 'CASH') {
      balances.cashOnHand = safeSub(balances.cashOnHand, amount);
    } else if (method === 'BKASH') {
      balances.bkashFloat = safeSub(balances.bkashFloat, amount);
    } else if (method === 'NAGAD') {
      balances.nagadFloat = safeSub(balances.nagadFloat, amount);
    } else if (method === 'ROCKET') {
      balances.rocketFloat = safeSub(balances.rocketFloat, amount);
    } else if (method === 'BANK') {
      balances.bankBalance = safeSub(balances.bankBalance, amount);
    }
    this.saveBalances(balances);
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // --- Financial Dashboard Summary Calculation ---
  public getFinancialSummary(): FinancialSummary {
    const now = new Date();
    const todayYMD = now.toISOString().split('T')[0];

    const sales = this.getSales();
    const expenses = this.getExpenses();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();
    const balances = this.getBalances();
    const products = this.getProducts();
    const mfs = this.getMfsTransactions();

    // Today's sales
    const todaySalesList = sales.filter((s) => s.date.startsWith(todayYMD));
    let todaySales = 0;
    let todaySalesCash = 0;
    let todaySalesDue = 0;
    for (const s of todaySalesList) {
      todaySales = safeAdd(todaySales, s.totalAmount);
      todaySalesCash = safeAdd(todaySalesCash, s.paidAmount);
      todaySalesDue = safeAdd(todaySalesDue, s.dueAmount);
    }

    // Today's expenses
    const todayExpensesList = expenses.filter((e) => e.date.startsWith(todayYMD));
    let todayExpenses = 0;
    for (const e of todayExpensesList) {
      todayExpenses = safeAdd(todayExpenses, e.amount);
    }

    // Today's MFS commissions
    const todayMfsList = mfs.filter((m) => m.date.startsWith(todayYMD));
    let todayMfsCommissions = 0;
    for (const m of todayMfsList) {
      todayMfsCommissions = safeAdd(todayMfsCommissions, m.commission || 0);
    }

    // Cash collected today (from sales + customer payments)
    const customerLedgers = this.getItem<CustomerLedgerEntry[]>(
      STORAGE_KEYS.CUSTOMER_LEDGERS,
      []
    );
    const todayPayments = customerLedgers.filter(
      (l) => l.type === 'PAYMENT_RECEIVED' && l.date.startsWith(todayYMD)
    );
    let todayCustomerPaymentsReceived = 0;
    for (const p of todayPayments) {
      todayCustomerPaymentsReceived = safeAdd(
        todayCustomerPaymentsReceived,
        p.amount
      );
    }
    const todayCashCollected = safeAdd(
      todaySalesCash,
      todayCustomerPaymentsReceived
    );

    // Total Customer Receivables (সব কাস্টমারের মোট বাকি)
    let totalReceivables = 0;
    for (const c of customers) {
      if (c.currentBalance > 0) {
        totalReceivables = safeAdd(totalReceivables, c.currentBalance);
      }
    }

    // Total Supplier Payables (মহাজনের মোট পাওনা)
    let totalPayables = 0;
    for (const s of suppliers) {
      if (s.currentBalance > 0) {
        totalPayables = safeAdd(totalPayables, s.currentBalance);
      }
    }

    // Estimated Profit Today = Today's Revenue + Commissions - Operating Expenses
    // Note: Revenue is generated at the point of sale (totalSales), not cash collections
    const estimatedProfitToday = safeSub(
      safeAdd(todaySales, todayMfsCommissions),
      todayExpenses
    );

    // Total MFS balance
    const mfsTotalBalance =
      balances.bkashFloat +
      balances.nagadFloat +
      balances.rocketFloat +
      balances.rechargeBalance;

    // Total Inventory Value
    let totalInventoryValue = 0;
    for (const p of products) {
      if (!p.isService && p.currentStock > 0) {
        totalInventoryValue = safeAdd(
          totalInventoryValue,
          p.currentStock * p.costPrice
        );
      }
    }

    return {
      todaySales,
      todaySalesCash,
      todaySalesDue,
      todayExpenses,
      todayCashCollected,
      totalReceivables,
      totalPayables,
      currentCashBalance: balances.cashOnHand,
      estimatedProfitToday,
      mfsTotalBalance,
      totalInventoryValue,
    };
  }

  // --- Backup & Restore ---
  public exportBackupJson(): string {
    const backup = {
      app: 'Friends Hisab',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        customers: this.getCustomers(),
        suppliers: this.getSuppliers(),
        customerLedgers: this.getCustomerLedger(),
        supplierLedgers: this.getSupplierLedger(),
        sales: this.getSales(),
        expenses: this.getExpenses(),
        products: this.getProducts(),
        mfsTransactions: this.getMfsTransactions(),
        balances: this.getBalances(),
        settings: this.getSettings(),
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackupJson(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !parsed.app) {
        return {
          success: false,
          message: 'ভুল ব্যাকআপ ফাইল ফরম্যাট! ফ্রেন্ডস হিসাব ব্যাকআপ ফাইল নির্বাচন করুন।',
        };
      }
      const data = parsed.data;
      if (data.customers) this.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.suppliers) this.setItem(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.customerLedgers)
        this.setItem(STORAGE_KEYS.CUSTOMER_LEDGERS, data.customerLedgers);
      if (data.supplierLedgers)
        this.setItem(STORAGE_KEYS.SUPPLIER_LEDGERS, data.supplierLedgers);
      if (data.sales) this.setItem(STORAGE_KEYS.SALES, data.sales);
      if (data.expenses) this.setItem(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.products) this.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.mfsTransactions)
        this.setItem(STORAGE_KEYS.MFS_TRANSACTIONS, data.mfsTransactions);
      if (data.balances) this.setItem(STORAGE_KEYS.BALANCES, data.balances);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);

      return {
        success: true,
        message: 'ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!',
      };
    } catch (e: any) {
      return {
        success: false,
        message: 'ব্যাকআপ রিস্টোর ব্যর্থ হয়েছে: ' + (e?.message || 'অজানা ত্রুটি'),
      };
    }
  }
}

export const storage = new StorageService();
storage.init();
