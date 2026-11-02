import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Check,
  FastForward,
  Music,
} from 'lucide-react';

interface AudioPlayerProps {
  audioBase64: string | null;
  mimeType?: string;
  voiceName: string;
  sourceText: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  voiceName,
  sourceText,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [copied, setCopied] = useState(false);

  // Generate an audio blob URL from the base64 string
  const audioSrc = useMemo(() => {
    if (!audioBase64) return null;
    try {
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Failed to create audio blob:', e);
      return `data:${mimeType};base64,${audioBase64}`;
    }
  }, [audioBase64, mimeType]);

  // Clean up object URLs on unmount/update
  useEffect(() => {
    return () => {
      if (audioSrc && audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  // Setup audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(0);
      setIsPlaying(false);
      // Auto play on new generation for responsive feel
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Draw simulated or interactive audio waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const barCount = 48;
    const progress = duration > 0 ? currentTime / duration : 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount - 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const barProgress = i / barCount;
        const isPassed = barProgress <= progress;

        // Create an organic wave shape with dynamic pulse when playing
        const baseHeight = Math.sin((i / barCount) * Math.PI) * 24 + 6;
        const waveFlutter = isPlaying
          ? Math.sin(Date.now() * 0.008 + i * 0.4) * 8
          : 0;
        const height = Math.max(4, Math.min(canvas.height - 4, baseHeight + waveFlutter));

        const x = i * (barWidth + 2);
        const y = centerY - height / 2;

        if (isPassed) {
          ctx.fillStyle = '#f59e0b'; // amber-500
        } else {
          ctx.fillStyle = '#334155'; // slate-700
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [currentTime, duration, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percentage * duration;

    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const handleDownload = () => {
    if (!audioSrc) return;
    const a = document.createElement('a');
    a.href = audioSrc;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `sinhala_voice_${voiceName.toLowerCase()}_${timestamp}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(sourceText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!audioBase64) {
    return (
      <div className="h-28 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 flex flex-col items-center justify-center text-slate-500 text-xs px-4 text-center">
        <Music className="w-6 h-6 text-slate-600 mb-1.5" />
        <p className="font-medium text-slate-400">No Sinhala audio generated yet</p>
        <p className="text-slate-600 text-[11px] mt-0.5">
          Type or convert Sinhala text above and click &quot;Generate Sinhala Audio&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl shadow-xl shadow-amber-950/10">
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}

      {/* Top Details & Action Bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-medium text-slate-200">
            Voice: <span className="text-amber-400 font-semibold">{voiceName}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono text-[11px]">24kHz WAV (Studio Quality)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Copy Sinhala Script"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium transition-colors shadow-sm shadow-amber-950/40"
            title="Download WAV Audio File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Download WAV</span>
          </button>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div className="relative py-2">
        <canvas
          ref={canvasRef}
          width={520}
          height={48}
          onClick={handleSeek}
          className="w-full h-12 cursor-pointer rounded-lg bg-slate-950/70 border border-slate-800/60 transition-opacity hover:opacity-95"
          title="Click to seek position"
        />
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 px-1 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span className="text-slate-500">Tap anywhere on wave to seek</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="flex items-center justify-between pt-2">
        {/* Play/Pause & Restart */}
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-amber-500/20 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={restartAudio}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-[10px] text-slate-500 px-1.5 flex items-center gap-1">
            <FastForward className="w-3 h-3 text-slate-400" /> Speed:
          </span>
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                playbackRate === rate
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
