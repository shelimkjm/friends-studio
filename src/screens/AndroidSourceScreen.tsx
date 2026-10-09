import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  FolderTree,
  Terminal,
  ExternalLink,
  Smartphone,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../android/androidProjectFiles';
import { AppSettings } from '../types';

interface AndroidSourceScreenProps {
  settings: AppSettings;
}

export const AndroidSourceScreen: React.FC<AndroidSourceScreenProps> = ({ settings }) => {
  const lang = settings.language;
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.path.split('/').pop() || 'file.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download all files as a single bundle (or JSON/script)
  const handleDownloadAllScript = () => {
    // Generate a bash unpacker script or text file that reconstructs the entire Android folder structure
    let script = `#!/bin/bash\n# Friends Hisab Android Project Unpacker\nmkdir -p friends-hisab-android/app/src/main/java/com/friendshisab/app/data/database/entity\nmkdir -p friends-hisab-android/app/src/main/java/com/friendshisab/app/data/database/dao\nmkdir -p friends-hisab-android/app/src/main/java/com/friendshisab/app/domain\nmkdir -p friends-hisab-android/app/src/main/java/com/friendshisab/app/ui/viewmodel\nmkdir -p friends-hisab-android/app/src/test/java/com/friendshisab/app\nmkdir -p friends-hisab-android/.github/workflows\ncd friends-hisab-android\n\n`;

    for (const f of ANDROID_PROJECT_FILES) {
      script += `cat << 'EOF' > "${f.path}"\n${f.content}\nEOF\n\n`;
    }

    script += `echo "Friends Hisab Android source code extracted successfully!"\n`;

    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'setup_friends_hisab_android.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {lang === 'bn'
                ? 'নেটিভ অ্যান্ড্রয়েড সোর্স কোড ও APK তৈরির ব্যবস্থা'
                : 'Native Android Studio Source & APK Delivery'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn'
              ? 'Kotlin, Jetpack Compose ও Room Database দিয়ে তৈরি আসল অ্যান্ড্রয়েড প্রজেক্ট ফাইল'
              : 'Production-ready Kotlin + Compose + Room database native code.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAllScript}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সম্পূর্ণ সোর্স প্রজেক্ট স্ক্রিপ্ট' : 'Export Full Android Project'}</span>
          </button>
        </div>
      </div>

      {/* APK Delivery Notice & Educational Guide */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
          <Cpu className="w-4 h-4 text-emerald-700" />
          <span>{lang === 'bn' ? 'APK ফাইল পাওয়ার ২টি সহজ পদ্ধতি (জিরো বাজেট):' : 'How to Build Installable APK (Zero Budget):'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white/90 rounded-lg border border-emerald-200/80">
            <span className="font-bold text-emerald-900 block mb-1">
              {lang === 'bn' ? 'পদ্ধতি ১: গিটহাব অ্যাকশন (GitHub Actions) - সবচেয়ে সহজ' : 'Method 1: Free GitHub Actions (Recommended)'}
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {lang === 'bn'
                ? 'আপনার কম্পিউটারে অ্যান্ড্রয়েড স্টুডিও ইন্সটল না থাকলেও গিটহাবে এই প্রজেক্ট পুশ করলে ক্লাউডেই স্বয়ংক্রিয়ভাবে ২ মিনিটে ফ্রেন্ডস হিসাবের আসল .apk ফাইল তৈরি হয়ে যাবে (বিল্ড ফাইল: .github/workflows/build-apk.yml)।'
                : 'Free automated cloud builder builds the APK artifact without requiring local Android SDK.'}
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-lg border border-emerald-200/80">
            <span className="font-bold text-emerald-900 block mb-1">
              {lang === 'bn' ? 'পদ্ধতি ২: অ্যান্ড্রয়েড স্টুডিও (Android Studio)' : 'Method 2: Android Studio'}
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {lang === 'bn'
                ? 'অ্যান্ড্রয়েড স্টুডিওতে এই ফাইলগুলো ওপেন করুন -> Build > Build Bundle(s) / APK(s) > Build APK(s) চাপলেই সরাসরি app-debug.apk জেনারেট হয়ে যাবে।'
                : 'Open the project in Android Studio and run Build APK directly.'}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Code Viewer with Sidebar File Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Tree (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 space-y-1 max-h-[550px] overflow-y-auto">
          <div className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'প্রজেক্ট ফাইলসমূহ' : 'Project Files'}</span>
          </div>

          {ANDROID_PROJECT_FILES.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                selectedFile.path === file.path
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode
                  className={`w-4 h-4 shrink-0 ${
                    file.category === 'workflow'
                      ? 'text-purple-600'
                      : file.category === 'kotlin_data'
                      ? 'text-blue-600'
                      : file.category === 'test'
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{file.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Code Content Display (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 flex flex-col overflow-hidden max-h-[550px]">
          {/* Code Viewer Toolbar */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="text-emerald-400 font-semibold">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কোড কপি'}</span>
              </button>
              <button
                onClick={handleDownloadFile}
                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-xs font-medium text-white flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Code Viewer Area */}
          <div className="p-4 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 selection:bg-emerald-900 selection:text-emerald-100 flex-1 whitespace-pre">
            {selectedFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
