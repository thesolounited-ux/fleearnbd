import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, AlertTriangle } from 'lucide-react';

export const HiddenGateModal: React.FC = () => {
  const { isGateModalOpen, setIsGateModalOpen, navigateTo } = useApp();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(2);
  const [isLocked, setIsLocked] = useState(false);

  if (!isGateModalOpen) return null;

  // 50 verification choices
  // Option #40 is strictly "পৃথিবী"
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

    // Option 40 ("পৃথিবী") is the correct administrator pass-key
    if (optionIndex === 40) {
      const generatedGateToken = 'gate_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      sessionStorage.setItem('fleearn_gate_token', generatedGateToken);

      // Notify backend if available (fire-and-forget or non-blocking)
      try {
        fetch('/api/admin/verify-gate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedOption: 40 })
        }).catch(() => {});
      } catch {
        // ignore network error
      }

      setIsGateModalOpen(false);
      setLoading(false);
      navigateTo('admin-login');
      return;
    }

    // Incorrect choice
    const nextAttempts = attemptsRemaining - 1;
    setAttemptsRemaining(nextAttempts);

    if (nextAttempts <= 0) {
      setIsLocked(true);
      setIsError(true);
      setStatusMessage("Maximum verification attempts reached for this session.");
      setLoading(false);
      return;
    }

    setIsError(true);
    setStatusMessage(`Verification criteria not met. ${nextAttempts} attempt remaining.`);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl md:max-w-2xl bg-[#111816] rounded-2xl shadow-2xl border border-[#1E2B27] p-4 sm:p-6 max-h-[90vh] flex flex-col text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#1E2B27]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                System Gateway Verification
              </h3>
              <p className="text-[11px] text-neutral-400">
                Administrative session eligibility check
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGateModalOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt description */}
        <div className="py-2.5 text-xs text-neutral-300">
          <p>
            Select the designated verification marker to confirm administrative session eligibility.
          </p>
          {attemptsRemaining < 2 && (
            <p className="mt-1 font-semibold text-amber-400">
              Remaining attempts: {attemptsRemaining}
            </p>
          )}
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`mb-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
              isError
                ? 'bg-red-950/50 text-red-300 border border-red-900/60'
                : 'bg-emerald-950/50 text-emerald-300 border border-emerald-900/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 50 Options Grid - Mobile Friendly */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
            const word = dummyAnswers[num - 1] || `Option ${num}`;
            const isSelected = selectedOption === num;

            return (
              <button
                key={num}
                type="button"
                disabled={loading || isLocked}
                onClick={() => handleVerify(num)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer min-h-[52px] active:scale-95 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/70 text-white shadow-sm'
                    : 'border-[#1E2B27] bg-[#16201D] hover:border-emerald-600/70 hover:bg-[#1A2622] text-neutral-200'
                } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="text-[10px] text-neutral-400 font-mono">
                  #{num < 10 ? `0${num}` : num}
                </span>
                <span className="font-semibold text-white mt-0.5 truncate text-xs sm:text-[13px]">
                  {word}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 sm:pt-4 border-t border-[#1E2B27] flex items-center justify-between text-xs text-neutral-400 mt-2">
          <span className="text-[11px]">Protected Access Protocol</span>
          <button
            type="button"
            onClick={() => setIsGateModalOpen(false)}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 hover:text-white transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
