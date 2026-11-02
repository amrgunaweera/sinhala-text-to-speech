import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  hasEnvKey: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  hasEnvKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    onClose();
  };

  const handleTestKey = async () => {
    const keyToTest = inputKey.trim() || (hasEnvKey ? 'env' : '');
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('Please enter an API key to test.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Verifying Gemini API key...');

    try {
      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(inputKey.trim() ? { 'x-gemini-api-key': inputKey.trim() } : {}),
        },
        body: JSON.stringify({ apiKey: inputKey.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setTestMessage('Gemini API key is valid and working!');
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'Failed to authenticate with Gemini API.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e?.message || 'Could not reach server endpoint.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100 text-sm sm:text-base">Gemini API Settings</h2>
              <p className="text-xs text-slate-400">Configure speech synthesis & AI transliteration credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Status Banner */}
          {hasEnvKey && !inputKey && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Active from Environment / .env</p>
                <p className="text-emerald-400/80 text-[11px] mt-0.5">
                  A Gemini API key was detected in your system environment or local <code className="bg-emerald-950/50 px-1 py-0.5 rounded">.env</code> file. You can leave this blank to use that key or enter a custom one below.
                </p>
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <span>Gemini API Key</span>
                {inputKey && <span className="text-[10px] text-amber-400 font-normal">(Custom In-App Key)</span>}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder={hasEnvKey ? 'Using .env key (enter new key to override)' : 'AIzaSy...'}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none pr-10 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test connection feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testStatus === 'testing'
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                  : testStatus === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-400" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span className="truncate">{testMessage}</span>
            </div>
          )}

          {/* Secondary fallback notice */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Desktop .env Fallback</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              You can also place a file named <code className="text-amber-300 font-mono">.env</code> in the same folder as the <code className="text-amber-300 font-mono">SinhalaVoice Studio.exe</code> file containing:
            </p>
            <pre className="p-2 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 border border-slate-800 select-all overflow-x-auto">
              GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Key</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors shadow-sm shadow-amber-500/20"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
