import React, { useState, useEffect, useRef } from 'react';
import { DesktopHeader } from './components/DesktopHeader';
import { AudioPlayer } from './components/AudioPlayer';
import { SinhalaKeypad } from './components/SinhalaKeypad';
import { HistoryPanel } from './components/HistoryPanel';
import { PresetSelector } from './components/PresetSelector';
import { KeyboardGuideModal } from './components/KeyboardGuideModal';
import { VOICES, STYLE_PRESETS, SAMPLE_TEXTS } from './data/presets';
import { GeneratedClip, SinhalaSample } from './types';
import { fastSinglishToSinhala } from './utils/sinhalaPhonetics';
import {
  Sparkles,
  Volume2,
  Trash2,
  Copy,
  BookOpen,
  ArrowRightLeft,
  Wand2,
  AlertCircle,
  Mic,
  Sliders,
  Check,
  CheckCircle2,
  Radio,
  User,
} from 'lucide-react';

const STORAGE_KEY = 'sinhala_voice_studio_history_v1';

export default function App() {
  // Input states
  const [inputText, setInputText] = useState(
    'ආයුබෝවන්! ඔබට සුබ දවසක් වේවා. අපගේ සේවාවන් සමඟ එක්වීම පිළිබඳව ඔබට හදපිරි ස්තුතිය පුද කරමු.'
  );
  const [singlishText, setSinglishText] = useState('');
  const [activeTab, setActiveTab] = useState<'sinhala' | 'singlish'>('sinhala');

  // Voice & Tone selection
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [selectedStyleId, setSelectedStyleId] = useState('natural');
  const [customStylePrompt, setCustomStylePrompt] = useState('');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio outputs
  const [currentAudio, setCurrentAudio] = useState<{
    base64: string;
    mimeType: string;
    sourceText: string;
    voice: string;
  } | null>(null);

  // Library & Modals
  const [historyClips, setHistoryClips] = useState<GeneratedClip[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isKeyboardGuideOpen, setIsKeyboardGuideOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistoryClips(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveClips = (newClips: GeneratedClip[]) => {
    setHistoryClips(newClips);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newClips));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  // Insert character at cursor
  const handleInsertChar = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setInputText((prev) => prev + char);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = inputText.substring(0, start) + char + inputText.substring(end);
    setInputText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  // Convert Singlish to Sinhala using AI or fallback
  const handleConvertSinglish = async (useAI = true) => {
    if (!singlishText.trim()) return;

    if (!useAI) {
      // Instant fast rule-based transliteration
      const fastResult = fastSinglishToSinhala(singlishText);
      setInputText(fastResult);
      setActiveTab('sinhala');
      return;
    }

    setIsTransliterating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts/singlish-to-sinhala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: singlishText }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to transliterate');
      }

      const data = await res.json();
      if (data.convertedText) {
        setInputText(data.convertedText);
        setActiveTab('sinhala');
      }
    } catch (err: any) {
      console.warn('AI transliteration error, using fast phonetic fallback:', err);
      // Fallback
      const fastResult = fastSinglishToSinhala(singlishText);
      setInputText(fastResult);
      setActiveTab('sinhala');
    } finally {
      setIsTransliterating(false);
    }
  };

  // Generate Sinhala Audio via Gemini TTS
  const handleGenerateAudio = async () => {
    const textToSpeak = inputText.trim();
    if (!textToSpeak) {
      setErrorMessage('Please enter or type some Sinhala text to generate speech.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // Find style prompt
      const stylePreset = STYLE_PRESETS.find((s) => s.id === selectedStyleId);
      const stylePrompt = customStylePrompt.trim()
        ? `${stylePreset?.prompt || ''}. ${customStylePrompt.trim()}`
        : stylePreset?.prompt || '';

      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: selectedVoice,
          style: stylePrompt,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (!data.audio) {
        throw new Error('No audio returned by speech synthesis');
      }

      const clip: GeneratedClip = {
        id: Date.now().toString(),
        text: textToSpeak,
        audioBase64: data.audio,
        mimeType: data.mimeType || 'audio/wav',
        voice: selectedVoice,
        style: stylePreset?.name || 'Natural',
        createdAt: Date.now(),
        charCount: textToSpeak.length,
      };

      setCurrentAudio({
        base64: data.audio,
        mimeType: data.mimeType || 'audio/wav',
        sourceText: textToSpeak,
        voice: selectedVoice,
      });

      // Prepend to history (keep up to 20 clips)
      const updatedClips = [clip, ...historyClips].slice(0, 20);
      saveClips(updatedClips);
    } catch (err: any) {
      console.error('Audio generation failed:', err);
      setErrorMessage(
        err.message || 'Failed to generate audio. Please verify your connection or API key.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Load a sample template
  const handleSelectSample = (sample: SinhalaSample) => {
    setInputText(sample.sinhalaText);
    setSelectedVoice(sample.suggestedVoice);
    setSelectedStyleId(sample.suggestedStyle);
    setActiveTab('sinhala');
  };

  // History operations
  const handleSelectClipFromHistory = (clip: GeneratedClip) => {
    setInputText(clip.text);
    setSelectedVoice(clip.voice);
    setCurrentAudio({
      base64: clip.audioBase64,
      mimeType: clip.mimeType,
      sourceText: clip.text,
      voice: clip.voice,
    });
    setIsHistoryOpen(false);
  };

  const handleDeleteClip = (id: string) => {
    saveClips(historyClips.filter((c) => c.id !== id));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear your saved audio library?')) {
      saveClips([]);
    }
  };

  const handleCopyInputText = () => {
    navigator.clipboard.writeText(inputText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Text metrics
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  // Average Sinhala speaking rate: ~125 words per minute (~2.1 words per second)
  const estSeconds = Math.max(1, Math.round((wordCount / 125) * 60));

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Desktop App Titlebar */}
      <DesktopHeader
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        historyCount={historyClips.length}
        onOpenKeyboardGuide={() => setIsKeyboardGuideOpen(true)}
        statusText="Gemini 3.8 Flash Lite TTS (24kHz WAV)"
        isGenerating={isGenerating}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Column: Text & Audio Generation Editor */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-4 border-r border-slate-800/80">
          {/* Header Action Row */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center space-x-2">
              {/* Tabs: Sinhala Script vs Singlish Typing */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('sinhala')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'sinhala'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-sinhala">සිංහල අකුරු</span>
                  <span>(Sinhala Unicode)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('singlish')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'singlish'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Singlish Typing</span>
                  <span className="text-[10px] opacity-75 font-mono">QWERTY</span>
                </button>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsPresetOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 text-xs transition-colors"
                title="Load sample Sinhala text templates"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Templates</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setSinglishText('');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCopyInputText}
                className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                title="Copy current Sinhala text"
              >
                {copiedText ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Editor Area */}
          {activeTab === 'sinhala' ? (
            <div className="flex-1 flex flex-col min-h-[200px]">
              <div className="relative flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="මෙහි සිංහලෙන් ලියන්න හෝ අලවන්න... (Type or paste Sinhala text here)"
                  className="w-full flex-1 min-h-[180px] p-4 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-slate-100 font-sinhala text-base sm:text-lg leading-relaxed placeholder:text-slate-600 outline-none resize-none transition-all shadow-inner"
                />

                {/* Bottom stats overlay inside text container */}
                <div className="flex items-center justify-between px-3 py-2 text-[11px] font-mono text-slate-500 bg-slate-900/95 border-t border-slate-800/80 rounded-b-2xl">
                  <div className="flex items-center space-x-3">
                    <span>
                      Words: <strong className="text-slate-300">{wordCount}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Characters: <strong className="text-slate-300">{charCount}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-400/80">
                    <span>Est. duration: ~{estSeconds}s</span>
                  </div>
                </div>
              </div>

              {/* Sinhala On-Screen Character Helper */}
              <div className="mt-2.5">
                <SinhalaKeypad onInsertChar={handleInsertChar} />
              </div>
            </div>
          ) : (
            /* Singlish Typing Pad */
            <div className="flex-1 flex flex-col min-h-[200px] space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-center justify-between">
                <span>
                  Type in phonetic English letters (e.g. <em>aayubowan</em>,{' '}
                  <em>subha udhaasanak</em>, <em>kohomadha</em>)
                </span>
                <button
                  onClick={() => setIsKeyboardGuideOpen(true)}
                  className="underline hover:text-amber-100 font-medium ml-2"
                >
                  View Guide
                </button>
              </div>

              <textarea
                value={singlishText}
                onChange={(e) => setSinglishText(e.target.value)}
                placeholder="Type Singlish here... e.g. mama adha gedhara yanawaa. oyaath enavadha maath ekka yanna?"
                className="w-full flex-1 min-h-[130px] p-4 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-slate-100 font-mono text-sm leading-relaxed placeholder:text-slate-600 outline-none resize-none transition-all shadow-inner"
              />

              {/* Live phonetic preview */}
              {singlishText && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                    Instant Phonetic Preview:
                  </span>
                  <p className="font-sinhala text-sm text-slate-300">
                    {fastSinglishToSinhala(singlishText)}
                  </p>
                </div>
              )}

              {/* Convert action button */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={!singlishText.trim() || isTransliterating}
                  onClick={() => handleConvertSinglish(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-950/30"
                >
                  {isTransliterating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Transliterating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Convert to Sinhala Script (AI Enhanced)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!singlishText.trim()}
                  onClick={() => handleConvertSinglish(false)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  title="Fast instant offline conversion"
                >
                  Quick Convert
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Synthesis Notice</p>
                <p className="text-[11px] text-rose-300/80 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={isGenerating || !inputText.trim()}
            onClick={handleGenerateAudio}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-amber-500/10 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Sinhala Voice with Gemini...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 fill-current" />
                <span>Generate Sinhala Audio (හඬ නිර්මාණය කරන්න)</span>
              </>
            )}
          </button>

          {/* Dedicated Audio Player Dock */}
          <div className="mt-2">
            <AudioPlayer
              audioBase64={currentAudio?.base64 || null}
              mimeType={currentAudio?.mimeType || 'audio/wav'}
              voiceName={currentAudio?.voice || selectedVoice}
              sourceText={currentAudio?.sourceText || inputText}
            />
          </div>
        </main>

        {/* Right Column: Voice & Speech Persona Controls */}
        <aside className="w-full md:w-80 lg:w-96 p-4 md:p-6 bg-slate-900/60 overflow-y-auto space-y-5 flex flex-col shrink-0">
          {/* Section: Voice Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Voice Persona (ස්වරය)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">5 Models</span>
            </div>

            <div className="space-y-2">
              {VOICES.map((v) => {
                const isSelected = selectedVoice === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-950/20'
                        : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-200">{v.name}</span>
                        <span className="text-[11px] font-sinhala text-amber-300">
                          {v.sinhalaTitle}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono capitalize ${
                          v.gender === 'female'
                            ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20'
                            : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                        }`}
                      >
                        {v.gender}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug mb-2">
                      {v.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {v.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-400 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Tone & Style Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Speaking Style (කථන විලාසය)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800/80 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-xs block text-slate-200">
                        {style.name}
                      </span>
                      <span className="text-[10px] font-sinhala text-slate-400 block mt-0.5">
                        {style.sinhalaName}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="mt-2 text-[9px] font-mono text-amber-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Style Prompt Directive */}
            <div className="mt-3">
              <label className="text-[11px] text-slate-400 block mb-1">
                Custom voice direction (Optional):
              </label>
              <input
                type="text"
                value={customStylePrompt}
                onChange={(e) => setCustomStylePrompt(e.target.value)}
                placeholder="e.g. Speak gently with clear pronunciation"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Sinhala Audio Tips Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 mt-auto">
            <span className="font-semibold text-slate-300 block text-xs">
              💡 Sinhala TTS Highlights:
            </span>
            <p>• Powered by Gemini 3.8 Flash Lite TTS audio model.</p>
            <p>• Native 24kHz studio quality mono WAV audio format.</p>
            <p>• Fast Singlish conversion allows typing with English letters.</p>
            <p>• Download uncompressed WAV for editing, YouTube, or podcasts.</p>
          </div>
        </aside>
      </div>

      {/* Slide-over Library Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        clips={historyClips}
        onSelectClip={handleSelectClipFromHistory}
        onDeleteClip={handleDeleteClip}
        onClearAll={handleClearAllHistory}
      />

      {/* Preset Selector Modal */}
      <PresetSelector
        isOpen={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        onSelectSample={handleSelectSample}
      />

      {/* Singlish Keyboard Guide Modal */}
      <KeyboardGuideModal
        isOpen={isKeyboardGuideOpen}
        onClose={() => setIsKeyboardGuideOpen(false)}
      />
    </div>
  );
}
