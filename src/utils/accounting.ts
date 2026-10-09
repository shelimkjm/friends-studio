/**
 * Decimal-safe financial arithmetic using integer minor units (Paisa).
 * 1 Taka = 100 Paisa.
 * Eliminates floating point rounding errors in JavaScript/TypeScript.
 * Equivalent to Kotlin BigDecimal or Long minor units in Room Database.
 */

export const toPaisa = (taka: number): number => {
  return Math.round((taka || 0) * 100);
};

export const fromPaisa = (paisa: number): number => {
  return Math.round(paisa || 0) / 100;
};

export const safeAdd = (a: number, b: number): number => {
  return fromPaisa(toPaisa(a) + toPaisa(b));
};

export const safeSub = (a: number, b: number): number => {
  return fromPaisa(toPaisa(a) - toPaisa(b));
};

export const safeMul = (amount: number, qty: number): number => {
  const paisa = toPaisa(amount);
  return fromPaisa(Math.round(paisa * qty));
};

export const safeDiv = (amount: number, divisor: number): number => {
  if (divisor === 0) return 0;
  const paisa = toPaisa(amount);
  return fromPaisa(Math.round(paisa / divisor));
};

// Bengali digits map
const banglaDigits: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '.': '.',
  ',': ',',
  '-': '-',
};

export const toBanglaNumber = (num: number | string): string => {
  const str = String(num);
  return str.split('').map((char) => banglaDigits[char] || char).join('');
};

/**
 * Format currency in Bangladeshi Taka (BDT)
 * e.g., ৳ ১,৪৫০ or ৳ 1,450
 */
export const formatBDT = (
  amount: number,
  options?: {
    lang?: 'bn' | 'en';
    showDecimals?: boolean;
    showSymbol?: boolean;
  }
): string => {
  const lang = options?.lang ?? 'bn';
  const showDecimals = options?.showDecimals ?? false;
  const showSymbol = options?.showSymbol ?? true;

  const validAmount = Number.isFinite(amount) ? amount : 0;
  const isNegative = validAmount < 0;
  const absAmount = Math.abs(validAmount);

  // Bangladeshi comma grouping format (Lakh & Crore: 12,34,567.00)
  const parts = absAmount.toFixed(showDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  let result = formattedInteger;
  if (showDecimals && decimalPart) {
    result += '.' + decimalPart;
  }

  if (lang === 'bn') {
    result = toBanglaNumber(result);
  }

  const sign = isNegative ? (lang === 'bn' ? '-' : '-') : '';
  const symbol = showSymbol ? '৳ ' : '';

  return `${sign}${symbol}${result}`;
};

/**
 * Calculate customer balance change on sale:
 * Sale Total - Amount Paid = Due Amount (added to customer receivable balance)
 * e.g., ৳1,000 total with ৳600 paid => ৳400 due
 */
export const calculateSaleDue = (
  totalAmount: number,
  paidAmount: number
): { paid: number; due: number } => {
  const safeTotal = Math.max(0, totalAmount);
  const safePaid = Math.max(0, paidAmount);
  const paidPaisa = toPaisa(safePaid);
  const totalPaisa = toPaisa(safeTotal);

  if (paidPaisa >= totalPaisa) {
    return {
      paid: safeTotal,
      due: 0,
    };
  }

  const duePaisa = totalPaisa - paidPaisa;
  return {
    paid: fromPaisa(paidPaisa),
    due: fromPaisa(duePaisa),
  };
};

/**
 * Format relative date time or standard date for Bangladesh
 */
export const formatDateBangla = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const monthsBn = [
      'জানুয়ারি',
      'ফেব্রুয়ারি',
      'মার্চ',
      'এপ্রিল',
      'মে',
      'জুন',
      'জুলাই',
      'আগস্ট',
      'সেপ্টেম্বর',
      'অক্টোবর',
      'নভেম্বর',
      'ডিসেম্বর',
    ];
    const day = toBanglaNumber(d.getDate());
    const month = monthsBn[d.getMonth()];
    const year = toBanglaNumber(d.getFullYear());

    let hours = d.getHours();
    const minutes = toBanglaNumber(
      d.getMinutes().toString().padStart(2, '0')
    );
    const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year}, ${toBanglaNumber(hours)}:${minutes} ${ampm}`;
  } catch {
    return dateStr;
  }
};
