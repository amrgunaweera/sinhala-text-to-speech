import React from 'react';
import { Volume2, Sparkles, Terminal, Keyboard, History, HelpCircle } from 'lucide-react';

interface DesktopHeaderProps {
  onToggleHistory: () => void;
  historyCount: number;
  onOpenKeyboardGuide: () => void;
  statusText?: string;
  isGenerating?: boolean;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onToggleHistory,
  historyCount,
  onOpenKeyboardGuide,
  statusText = 'Ready',
  isGenerating = false,
}) => {
  return (
    <header className="h-12 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* Mac-style Window Controls & App Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer shadow-sm shadow-rose-900/40 transition-colors" title="Close" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer shadow-sm shadow-amber-900/40 transition-colors" title="Minimize" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer shadow-sm shadow-emerald-900/40 transition-colors" title="Maximize" />
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Volume2 className="w-3.5 h-3.5 text-slate-950 font-bold" />
          </div>
          <span className="font-semibold text-sm text-slate-200 tracking-tight flex items-center gap-1.5">
            SinhalaVoice <span className="text-amber-400 font-normal">Studio</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-sinhala border border-amber-500/20">
              සිංහල හඬ
            </span>
          </span>
        </div>
      </div>

      {/* Center Status Pill */}
      <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs">
        <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
        <span className="text-slate-400 text-[11px] font-mono">
          {isGenerating ? 'Synthesizing Sinhala Voice...' : statusText}
        </span>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={onOpenKeyboardGuide}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-transparent hover:border-slate-700"
          title="Singlish Typing Guide & Diacritics"
        >
          <Keyboard className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Typing Guide</span>
        </button>

        <button
          onClick={onToggleHistory}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors border border-slate-700/60"
          title="Generated Audio Clips History"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>Library</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
