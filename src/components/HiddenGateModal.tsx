import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, AlertTriangle } from 'lucide-react';

export const HiddenGateModal: React.FC = () => {
  const { isGateModalOpen, setIsGateModalOpen, navigateTo } = useApp();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  if (!isGateModalOpen) return null;

  // Generate 50 options
  // Option 40 is explicitly "পৃথিবী"
  // Other options have neutral terms
  const dummyAnswers = [
    "সমুদ্র", "বাতাস", "আকাশ", "নক্ষত্র", "অগ্নি", "পর্বত", "ঝর্ণা", "অরণ্য", "সূর্য", "চন্দ্র",
    "ধূমকেতু", "গ্রহাণু", "উপগ্রহ", "মহাকাশ", "দিগন্ত", "মেঘমালা", "মরুভূমি", "নদীমাতৃক", "উপত্যকা", "হিমবাহ",
    "প্রান্তর", "সৈকত", "দ্বীপপুঞ্জ", "জলপ্রপাত", "জ্যোতির্বলয়", "নীহারিকা", "ছায়াপথ", "মহাজাগতিক", "অনন্ত", "মহাশূন্য",
    "বায়ুমণ্ডল", "জলবায়ু", "ঋতুচক্র", "প্রতিধ্বনি", "প্রভাত", "সন্ধ্যা", "গোধূলি", "উষাকাল", "রজনী", "পৃথিবী",
    "সৃষ্টি", "প্রকৃতি", "জীববৈচিত্র্য", "বায়োস্ফিয়ার", "ভূত্বক", "গুরুমণ্ডল", "কেন্দ্রমণ্ডল", "সৌরজগৎ", "মহাসমুদ্র", "কালপুরুষ"
  ];

  const handleVerify = async (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const res = await fetch('/api/admin/verify-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOption: optionIndex })
      });
      const data = await res.json();

      if (data.success) {
        setIsGateModalOpen(false);
        // Store temporary gate token for login screen
        if (data.gateToken) {
          sessionStorage.setItem('fleearn_gate_token', data.gateToken);
        }
        navigateTo('admin-login');
      } else {
        setIsError(true);
        setStatusMessage(data.error || "Verification criteria not met.");
        if (data.remainingAttempts !== undefined) {
          setAttemptsRemaining(data.remainingAttempts);
        }
        if (data.locked) {
          setIsLocked(true);
        }
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage("Network verification failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111816] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#044541] dark:text-emerald-400" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              System Gateway Verification
            </h3>
          </div>
          <button
            onClick={() => setIsGateModalOpen(false)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt description */}
        <div className="py-3 text-xs text-neutral-600 dark:text-neutral-400">
          <p>
            Select the designated verification marker to confirm administrative session eligibility.
            Maximum 2 attempts permitted per browser session.
          </p>
          {attemptsRemaining !== null && (
            <p className="mt-1 font-semibold text-amber-600 dark:text-amber-400">
              Remaining attempts: {attemptsRemaining}
            </p>
          )}
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`mb-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
              isError
                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 50 Options Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
            const word = dummyAnswers[num - 1] || `Option ${num}`;
            const isSelected = selectedOption === num;

            return (
              <button
                key={num}
                disabled={loading || isLocked}
                onClick={() => handleVerify(num)}
                className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#044541] bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-500'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-emerald-600 dark:hover:border-emerald-500'
                } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                  #{num < 10 ? `0${num}` : num}
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 mt-1 truncate">
                  {word}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>Protected Access Protocol</span>
          <button
            onClick={() => setIsGateModalOpen(false)}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
