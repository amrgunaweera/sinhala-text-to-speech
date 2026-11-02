import React, { useState } from 'react';
import {
  SINHALA_DIACRITICS,
  SINHALA_VOWELS,
  SINHALA_CONSONANTS,
} from '../utils/sinhalaPhonetics';
import { ChevronDown, ChevronUp, Type, Sparkles } from 'lucide-react';

interface SinhalaKeypadProps {
  onInsertChar: (char: string) => void;
}

export const SinhalaKeypad: React.FC<SinhalaKeypadProps> = ({ onInsertChar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'diacritics' | 'vowels' | 'consonants'>('diacritics');

  return (
    <div className="border border-slate-800 bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-slate-300">Sinhala Character Helper</span>
          <span className="text-[11px] text-slate-500 font-sinhala">(පිල්ලම් සහ අකුරු පුවරුව)</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400">
          <span className="text-[10px] text-slate-500">{isOpen ? 'Hide' : 'Quick Insert'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          {/* Tabs */}
          <div className="flex items-center space-x-2 mb-2.5 pb-2 border-b border-slate-800/60 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('diacritics')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'diacritics'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              පිල්ලම් (Diacritics)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vowels')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'vowels'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              ස්වර (Vowels)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('consonants')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'consonants'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              ව්‍යඤ්ජන (Consonants)
            </button>
          </div>

          {/* Diacritics Tab */}
          {activeTab === 'diacritics' && (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {SINHALA_DIACRITICS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(item.char)}
                  title={item.name}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 font-sinhala text-base transition-colors flex items-center gap-1.5"
                >
                  <span className="font-medium">{item.char}</span>
                  <span className="text-[10px] text-slate-400 font-sans">{item.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Vowels Tab */}
          {activeTab === 'vowels' && (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {SINHALA_VOWELS.map((vowel, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(vowel)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 font-sinhala text-base transition-colors"
                >
                  {vowel}
                </button>
              ))}
            </div>
          )}

          {/* Consonants Tab */}
          {activeTab === 'consonants' && (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {SINHALA_CONSONANTS.map((consonant, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(consonant)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 font-sinhala text-base transition-colors"
                >
                  {consonant}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
