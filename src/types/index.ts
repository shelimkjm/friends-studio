export type Language = 'bn' | 'en';
export type ThemeMode = 'light' | 'dark';

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'DUE';

export type TransactionType =
  | 'SALE'
  | 'SALE_PAYMENT'
  | 'CUSTOMER_PAYMENT'
  | 'PURCHASE'
  | 'SUPPLIER_PAYMENT'
  | 'EXPENSE'
  | 'INCOME'
  | 'MFS_CASH_IN'
  | 'MFS_CASH_OUT'
  | 'MFS_SEND_MONEY'
  | 'MFS_RECHARGE'
  | 'MFS_COMMISSION'
  | 'FLOAT_ADJUSTMENT';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  openingBalance: number; // positive = customer owes shop (receivable)
  currentBalance: number; // positive = customer owes shop, negative = shop owes customer (advance)
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  companyName?: string;
  address?: string;
  openingBalance: number; // positive = shop owes supplier (payable)
  currentBalance: number; // positive = shop owes supplier, negative = advance paid to supplier
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'CREDIT_SALE' | 'PAYMENT_RECEIVED' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string; // e.g. saleId
  paymentMethod?: PaymentMethod;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  date: string;
  type: 'PURCHASE' | 'PAYMENT_MADE' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  paymentMethod?: PaymentMethod;
}

export interface SaleItem {
  id: string;
  productId?: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: SaleItem[];
  date: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  reference?: string;
  date: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockAlert: number;
  isService: boolean; // if true, doesn't deplete stock (e.g., Photocopy, Online Apply)
  unit: string; // 'pcs', 'page', 'pkt', 'box', 'set'
  createdAt: string;
  updatedAt: string;
}

export type MfsProvider = 'BKASH' | 'NAGAD' | 'ROCKET' | 'RECHARGE';
export type MfsTxType = 'CASH_IN' | 'CASH_OUT' | 'SEND_MONEY' | 'RECHARGE' | 'FLOAT_DEPOSIT' | 'FLOAT_WITHDRAW';

export interface MfsTransaction {
  id: string;
  provider: MfsProvider;
  type: MfsTxType;
  amount: number;
  customerFee: number;
  commission: number; // profit earned by agent
  customerPhone?: string;
  refNumber?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface AccountBalances {
  cashOnHand: number;
  bkashFloat: number;
  nagadFloat: number;
  rocketFloat: number;
  rechargeBalance: number;
  bankBalance: number;
}

export interface AppSettings {
  shopName: string;
  shopNameBangla: string;
  ownerName: string;
  phone: string;
  address: string;
  currencySymbol: string;
  language: Language;
  theme: ThemeMode;
  pinCode: string;
  isPinEnabled: boolean;
  businessType: string;
}

export interface FinancialSummary {
  todaySales: number;
  todaySalesCash: number;
  todaySalesDue: number;
  todayExpenses: number;
  todayCashCollected: number;
  totalReceivables: number; // মোট বাকি পাওনা
  totalPayables: number; // মোট মহাজন দেনা
  currentCashBalance: number;
  estimatedProfitToday: number;
  mfsTotalBalance: number;
  totalInventoryValue: number;
}
