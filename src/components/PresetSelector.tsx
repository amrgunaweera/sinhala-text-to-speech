import React from 'react';
import { SAMPLE_TEXTS } from '../data/presets';
import { SinhalaSample } from '../types';
import { BookOpen, Sparkles, X, ArrowRight, Play } from 'lucide-react';

interface PresetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SinhalaSample) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Sinhala Sample Library (ආදර්ශ පාඨ)
              </h3>
              <p className="text-[11px] text-slate-400">
                Click any template to auto-load text, recommended voice, and speaking style.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          {SAMPLE_TEXTS.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-amber-500/40 hover:bg-slate-800/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                  {sample.category}
                </span>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span>Voice: <strong className="text-slate-300">{sample.suggestedVoice}</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors group-hover:translate-x-0.5" />
                </div>
              </div>

              <h4 className="text-xs font-semibold text-slate-200 mb-1">{sample.title}</h4>

              <p className="font-sinhala text-sm text-slate-300 leading-relaxed line-clamp-2 mb-1.5">
                {sample.sinhalaText}
              </p>

              <p className="text-[11px] text-slate-500 italic">
                &ldquo;{sample.englishMeaning}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
