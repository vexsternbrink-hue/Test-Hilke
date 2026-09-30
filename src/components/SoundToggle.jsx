import { useEffect, useRef, useState } from 'react';

/**
 * Optionale Marktgeräusche – synthetisiert per WebAudio (kein Asset nötig):
 * weiches Windrauschen + leises Stimmengemurmel. Standard: aus.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!on) {
      ctxRef.current?.close();
      ctxRef.current = null;
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);

    const makeNoise = () => {
      const len = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      return src;
    };

    // Wind
    const wind = makeNoise();
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(windFilter.frequency);
    wind.connect(windFilter).connect(master);
    wind.start();
    lfo.start();

    // Marktgemurmel: bandpass-gefiltertes Rauschen mit langsamer Modulation
    const crowd = makeNoise();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.6;
    const crowdGain = ctx.createGain();
    crowdGain.gain.value = 0.25;
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.35;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 0.12;
    lfo2.connect(lfo2Gain).connect(crowdGain.gain);
    crowd.connect(bp).connect(crowdGain).connect(master);
    crowd.start();
    lfo2.start();

    return () => {
      ctx.close();
    };
  }, [on]);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label={on ? 'Marktgeräusche aus' : 'Marktgeräusche an'}
      className="glass fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full border border-[#E2D8C8] px-4 text-sm font-medium text-wood shadow-lg transition-transform hover:-translate-y-0.5"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /> : <path d="M22 9l-6 6M16 9l6 6" />}
      </svg>
      <span className="hidden sm:inline">{on ? 'Markt an' : 'Marktgeräusche'}</span>
    </button>
  );
}
