import React from 'react';
import { X, Keyboard, ArrowRight } from 'lucide-react';

interface KeyboardGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardGuideModal: React.FC<KeyboardGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const examples = [
    { singlish: 'aayubowan', sinhala: 'ආයුබෝවන්', note: 'Greeting' },
    { singlish: 'subha udhaasanak', sinhala: 'සුබ උදෑසනක්', note: 'Good Morning' },
    { singlish: 'kohomadha?', sinhala: 'කොහොමද?', note: 'How are you?' },
    { singlish: 'sthuthiyi', sinhala: 'ස්තුතියි', note: 'Thank you' },
    { singlish: 'karunaakarala', sinhala: 'කරුණාකරලා', note: 'Please' },
    { singlish: 'mama sinhala katha karanawa', sinhala: 'මම සිංහල කතා කරනවා', note: 'I speak Sinhala' },
  ];

  const mappings = [
    { key: 'k', val: 'ක', sample: 'ka -> ක, kaa -> කා, ki -> කි' },
    { key: 'g', val: 'ග', sample: 'ga -> ග, gi -> ගි, gu -> ගු' },
    { key: 't / T', val: 'ට / ඨ', sample: 'ta -> ට, Ti -> ඨි' },
    { key: 'th / Th', val: 'ත / ථ', sample: 'tha -> ත, Tha -> ථ' },
    { key: 'd / dh', val: 'ඩ / ද', sample: 'da -> ඩ, dha -> ද' },
    { key: 'n / N', val: 'න / ණ', sample: 'na -> න, Na -> ණ' },
    { key: 'p / b', val: 'ප / බ', sample: 'pa -> ප, ba -> බ' },
    { key: 'm / y', val: 'ම / ය', sample: 'ma -> ම, ya -> ය' },
    { key: 'r / l / L', val: 'ර / ල / ළ', sample: 'ra -> ර, la -> ල, La -> ළ' },
    { key: 's / sh / S', val: 'ස / ශ / ෂ', sample: 'sa -> ස, sha -> ශ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Singlish Typing &amp; Phonetic Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                Learn how to write Sinhala using English letters on any keyboard.
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Examples */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-2">Common Singlish Examples:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {examples.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-amber-300 text-[11px]">{item.singlish}</span>
                    <span className="text-[10px] text-slate-500">{item.note}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="font-sinhala text-sm text-slate-200 font-medium">
                    {item.sinhala}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phonetic Rules */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-2">Letter Combinations:</h4>
            <div className="rounded-lg border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
              {mappings.map((m, idx) => (
                <div key={idx} className="p-2 bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium text-amber-400 text-xs w-16">
                      {m.key}
                    </span>
                    <span className="font-sinhala text-sm text-slate-300 w-8">{m.val}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{m.sample}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] leading-relaxed">
            💡 <strong>Pro Tip:</strong> You can type freely in the &quot;Singlish&quot; tab and hit{' '}
            <strong>Convert to Sinhala (AI Enhanced)</strong> to get perfect grammatical Sinhala
            script instantly!
          </div>
        </div>
      </div>
    </div>
  );
};
