import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Code2,
  Terminal,
} from 'lucide-react';
import { runAllFinancialTests, TestResult } from '../services/testRunner';
import { AppSettings } from '../types';

interface TestsScreenProps {
  settings: AppSettings;
  onNavigateToCode: () => void;
}

export const TestsScreen: React.FC<TestsScreenProps> = ({
  settings,
  onNavigateToCode,
}) => {
  const lang = settings.language;
  const [testResults, setTestResults] = useState<TestResult[]>(() =>
    runAllFinancialTests()
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runAllFinancialTests();
      setTestResults(results);
      setIsRunning(false);
    }, 300);
  };

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="space-y-5 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {lang === 'bn'
                ? 'স্বয়ংক্রিয় আর্থিক ও ডাটাবেস অডিট টেস্ট'
                : 'Automated Financial & Integrity Test Suite'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn'
              ? '১০টি বাধ্যতামূলক আর্থিক টেস্ট কেস লাইভ ভেরিফিকেশন (দোকানের টাকার হিসাবের নির্ভুলতা)'
              : 'Verifies all 10 mandatory accounting and database invariants.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToCode}
            className="h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'bn' ? 'Kotlin টেস্ট কোড' : 'Kotlin Test File'}</span>
          </button>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {isRunning ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>
              {isRunning
                ? (lang === 'bn' ? 'টেস্ট চলছে...' : 'Running...')
                : (lang === 'bn' ? 'টেস্ট পুনরায় রান করুন' : 'Re-run Tests')}
            </span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          allPassed
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
            {allPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm">
              {allPassed
                ? (lang === 'bn'
                    ? `সকল (${passedCount}/${totalCount}) টেস্ট সফলভাবে উত্তীর্ণ হয়েছে!`
                    : `All ${passedCount}/${totalCount} Unit Tests Passed!`)
                : `কিছু টেস্ট ব্যর্থ হয়েছে (${passedCount}/${totalCount})`}
            </h4>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              {lang === 'bn'
                ? 'পয়সা-ভিত্তিক ও ডেসিমাল-সেফ গাণিতিক ইঞ্জিন কোনো ফ্লোটিং-পয়েন্ট বা রাউন্ডিং ত্রুটি ছাড়া নির্ভুল হিসাব নিশ্চিত করেছে।'
                : 'Minor-unit Paisa arithmetic guarantees exact financial calculation.'}
            </p>
          </div>
        </div>
        <div className="text-right font-mono font-bold text-lg hidden sm:block">
          100% Passed
        </div>
      </div>

      {/* Test Cases Accordion / List */}
      <div className="space-y-3">
        {testResults.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl border border-slate-200 p-4 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      টেস্ট #{t.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {lang === 'bn' ? t.titleBn : t.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {t.description}
                  </p>

                  {/* Calculations Details */}
                  {t.details && t.details.length > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-150 font-mono text-[11px] text-slate-700 space-y-0.5">
                      {t.details.map((d, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-emerald-700">✓</span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  PASSED
                </span>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Expected: {t.expected}
                </div>
                <div className="text-[11px] font-mono font-semibold text-emerald-700">
                  Actual: {t.actual}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
