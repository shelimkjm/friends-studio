import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { AppSettings } from '../types';

interface PinLockModalProps {
  settings: AppSettings;
  onUnlocked: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  settings,
  onUnlocked,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + num;
      setEnteredPin(next);
      setError(false);

      if (next.length === 4) {
        if (next === settings.pinCode) {
          onUnlocked();
        } else {
          setError(true);
          setTimeout(() => {
            setEnteredPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(enteredPin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 text-white">
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold">{settings.shopNameBangla}</h2>
          <p className="text-xs text-slate-400 mt-1">
            হিসাব খাতা খুলতে ৪ ডিজিটের পিন দিন
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                enteredPin.length > idx
                  ? 'bg-emerald-500 border-emerald-500 scale-110'
                  : 'border-slate-600'
              } ${error ? 'border-rose-500 bg-rose-500' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-semibold animate-shake">
            ভুল পিন কোড! আবার চেষ্টা করুন।
          </p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 pt-4 max-w-64 mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xl font-bold font-mono transition-all flex items-center justify-center border border-slate-700/50"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xl font-bold font-mono transition-all flex items-center justify-center border border-slate-700/50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 transition-all flex items-center justify-center border border-slate-700/50"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
