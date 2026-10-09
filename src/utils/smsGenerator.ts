import { formatBDT } from './accounting';

export interface SmsMessageOptions {
  customerName: string;
  customerPhone: string;
  dueAmount: number;
  paidAmount?: number;
  shopName: string;
  shopPhone: string;
  date?: string;
}

export const cleanPhoneForWhatsApp = (phone: string): string => {
  // Convert 017xxxxxxxx to 88017xxxxxxxx
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('880')) return clean;
  if (clean.startsWith('0')) return '88' + clean;
  return clean;
};

/**
 * Generate polite Bangla Payment Reminder for WhatsApp / SMS
 */
export const generateDueReminderMessage = (options: SmsMessageOptions): string => {
  const bdtFormatted = formatBDT(options.dueAmount, { lang: 'bn', showSymbol: true });
  return `শ্রদ্ধেয় ${options.customerName},
${options.shopName}-এ আপনার পূর্বের বাকি হিসাব রয়েছে মোট ${bdtFormatted}।

বিনীত অনুরোধ, সুবিধাজনক সময়ে বাকি টাকা পরিশোধ করে ব্যবসায়িক লেনদেন সচল রাখতে সহযোগিতা করবেন।

দোকানের ঠিকানা ও যোগাযোগ:
${options.shopPhone}
ধন্যবাদ!`;
};

/**
 * Generate Bangla Payment Receipt Message for WhatsApp / SMS
 */
export const generatePaymentReceiptMessage = (options: SmsMessageOptions): string => {
  const paidFormatted = formatBDT(options.paidAmount || 0, { lang: 'bn', showSymbol: true });
  const remainingFormatted = formatBDT(options.dueAmount, { lang: 'bn', showSymbol: true });
  return `শ্রদ্ধেয় ${options.customerName},
${options.shopName}-এ আপনার ${paidFormatted} জমা সফলভাবে রেকর্ড করা হয়েছে।

বর্তমান অবশিষ্ট বাকি: ${remainingFormatted}।
তারিখ: ${options.date || new Date().toLocaleDateString('bn-BD')}

ধন্যবাদান্তে,
${options.shopName}
যোগাযোগ: ${options.shopPhone}`;
};

/**
 * Open WhatsApp link with pre-filled message (requires explicit user click)
 */
export const getWhatsAppUrl = (phone: string, text: string): string => {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * Get native SMS protocol URI (opens default messaging app on mobile)
 */
export const getSmsUrl = (phone: string, text: string): string => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
};
