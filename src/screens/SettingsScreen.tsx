import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Store,
  Phone,
  MapPin,
  Lock,
  Check,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { AppSettings, Language } from '../types';
import { translations } from '../utils/translations';
import { storage } from '../services/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onDataReset: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onDataReset,
}) => {
  const t = translations[settings.language];
  const lang = settings.language;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shopName, setShopName] = useState(settings.shopName);
  const [shopNameBangla, setShopNameBangla] = useState(settings.shopNameBangla);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);

  // PIN Lock states
  const [isPinEnabled, setIsPinEnabled] = useState(settings.isPinEnabled);
  const [pinCode, setPinCode] = useState(settings.pinCode);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      shopName,
      shopNameBangla,
      ownerName,
      phone,
      address,
      isPinEnabled,
      pinCode,
    };
    onUpdateSettings(updated);
    setStatusMessage({ text: 'দোকানের তথ্য ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = storage.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `friends_hisab_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMessage({ text: 'আপনার সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importBackupJson(content);
      if (res.success) {
        setStatusMessage({ text: res.message });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setStatusMessage({ text: res.message, isError: true });
      }
    };
    reader.readAsText(file);
  };

  // Reset to Defaults
  const handleResetData = () => {
    if (
      window.confirm(
        'সতর্কতা: আপনি কি নিশ্চিত যে সমস্ত হিসাব রিসেট করে ফ্রেন্ডস স্টুডিও-র নমুনা ডাটা ফিরিয়ে আনতে চান?'
      )
    ) {
      storage.resetToDefaults();
      onDataReset();
      setStatusMessage({ text: 'ডাটা সফলভাবে রিসেট করা হয়েছে।' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {t.settings} (দোকান ও অ্যাপ সেটিংস)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === 'bn'
            ? 'দোকানের নাম, ঠিকানা, ব্যাকআপ ও অফলাইন নিরাপত্তা কনফিগারেশন'
            : 'Shop profile, offline backup & security settings'}
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            statusMessage.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Shop Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>দোকানের বিবরণ (রসিদ ও চালানে প্রদর্শিত হবে)</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                দোকানের নাম (বাংলায়)
              </label>
              <input
                type="text"
                required
                value={shopNameBangla}
                onChange={(e) => setShopNameBangla(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop Name (English)
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                স্বত্বাধিকারী / মালিকের নাম
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর (যোগাযোগ)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              দোকানের ঠিকানা
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* App Security (Optional PIN lock) */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>নিরাপত্তা পিন লক (ঐচ্ছিক)</span>
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinEnabled}
                  onChange={(e) => setIsPinEnabled(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span>অ্যাপ ওপেন করার সময় ৪ ডিজিটের পিন আবশ্যক করুন</span>
              </label>

              {isPinEnabled && (
                <input
                  type="password"
                  maxLength={4}
                  placeholder="৪ ডিজিট পিন"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-32 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-center font-mono tracking-widest"
                />
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              সেটিংস পরিবর্তন সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>

      {/* Offline Backup & Restore Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>অফলাইন ডাটা ব্যাকআপ ও রিস্টোর</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t.backupNotice} আপনার দোকানের হিসাব সুরক্ষিত রাখতে নিয়মিত ব্যাকআপ ফাইলটি ডাউনলোড করে গুগল ড্রাইভে বা মেমোরিতে রেখে দিন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Download Backup */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                সম্পূর্ণ ব্যাকআপ ডাউনলোড করুন
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                সকল বাকি, বিক্রি, এমএফএস ও খরচের একটি নিরাপদ .json ফাইল সেভ হবে
              </div>
            </div>
          </button>

          {/* Restore Backup */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all flex items-start gap-3"
            >
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  ব্যাকআপ ফাইল রিস্টোর করুন
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  পূর্বে সেভ করা .json ব্যাকআপ ফাইল থেকে সকল তথ্য ফিরিয়ে আনুন
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Reset / Sample Data */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-800">
              নমুনা তথ্য ফিরিয়ে আনা (Reset Sample Data)
            </h4>
            <p className="text-[11px] text-slate-500">
              ফটোকপি, পাসপোর্ট ছবি ও বাকি খাতার প্রাথমিক ডেমো ডাটা রিলোড করবে
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-xs font-medium text-slate-600 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডাটা রিসেট</span>
          </button>
        </div>
      </div>
    </div>
  );
};
