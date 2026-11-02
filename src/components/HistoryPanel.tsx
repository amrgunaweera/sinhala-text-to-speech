import React, { useState } from 'react';
import { GeneratedClip } from '../types';
import {
  History,
  Trash2,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  X,
  Volume2,
  Calendar,
} from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  clips: GeneratedClip[];
  onSelectClip: (clip: GeneratedClip) => void;
  onDeleteClip: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  clips,
  onSelectClip,
  onDeleteClip,
  onClearAll,
}) => {
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlayClip = (clip: GeneratedClip) => {
    if (playingClipId === clip.id) {
      if (activeAudio) {
        activeAudio.pause();
        setActiveAudio(null);
      }
      setPlayingClipId(null);
      return;
    }

    if (activeAudio) {
      activeAudio.pause();
    }

    const audio = new Audio(`data:${clip.mimeType};base64,${clip.audioBase64}`);
    audio.play().catch(console.error);
    setActiveAudio(audio);
    setPlayingClipId(clip.id);

    audio.onended = () => {
      setPlayingClipId(null);
      setActiveAudio(null);
    };
  };

  const handleDownloadClip = (clip: GeneratedClip) => {
    const a = document.createElement('a');
    a.href = `data:${clip.mimeType};base64,${clip.audioBase64}`;
    a.download = `sinhala_clip_${clip.voice.toLowerCase()}_${clip.id.slice(0, 6)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = (clip: GeneratedClip) => {
    navigator.clipboard.writeText(clip.text);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col backdrop-blur-md">
      {/* Header */}
      <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-200">Generated Clips</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {clips.length}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {clips.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear all clips"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clips List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {clips.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Volume2 className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs font-medium text-slate-400">No clips saved yet</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Generated Sinhala speech clips will automatically appear here for replay and download.
            </p>
          </div>
        ) : (
          clips.map((clip) => {
            const isPlaying = playingClipId === clip.id;
            const formattedDate = new Date(clip.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={clip.id}
                className={`p-3 rounded-xl border transition-all ${
                  isPlaying
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-amber-400">{clip.voice}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 font-mono">{formattedDate}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {clip.charCount} chars
                  </span>
                </div>

                {/* Sinhala Text preview */}
                <p
                  onClick={() => onSelectClip(clip)}
                  className="font-sinhala text-xs text-slate-300 line-clamp-2 leading-relaxed cursor-pointer hover:text-white mb-2.5"
                  title="Click to load into editor"
                >
                  {clip.text}
                </p>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handlePlayClip(clip)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 font-medium'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3 h-3 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectClip(clip)}
                      className="px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                      title="Load this clip into main player"
                    >
                      Load
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopy(clip)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy Sinhala Text"
                    >
                      {copiedId === clip.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadClip(clip)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Download WAV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteClip(clip.id)}
                      className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete clip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
