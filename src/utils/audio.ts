// Gentle Web Audio API sound effects & Vietnamese SpeechSynthesis helper
// Safe, gentle, no startling loud tones, zero external audio URLs.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTone(
  freq: number,
  duration = 0.14,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delay = 0
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const sfx = {
  pop(enabled = true) {
    if (!enabled) return;
    playTone(540, 0.08, 'sine', 0.12);
    playTone(820, 0.1, 'sine', 0.1, 0.04);
  },
  tap(enabled = true) {
    if (!enabled) return;
    playTone(480, 0.07, 'triangle', 0.09);
  },
  star(enabled = true) {
    if (!enabled) return;
    playTone(523.25, 0.12, 'triangle', 0.12, 0);
    playTone(659.25, 0.12, 'triangle', 0.12, 0.08);
    playTone(783.99, 0.18, 'triangle', 0.14, 0.16);
  },
  bounce(enabled = true) {
    if (!enabled) return;
    playTone(320, 0.11, 'sine', 0.11);
    playTone(460, 0.12, 'sine', 0.09, 0.05);
  },
  gentleOops(enabled = true) {
    if (!enabled) return;
    playTone(280, 0.15, 'sine', 0.08);
    playTone(240, 0.18, 'sine', 0.06, 0.08);
  },
  victory(enabled = true) {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      playTone(n, 0.22, 'triangle', 0.13, idx * 0.11);
    });
  },
  chestOpen(enabled = true) {
    if (!enabled) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((n, idx) => {
      playTone(n, 0.24, 'sine', 0.12, idx * 0.09);
    });
  },
  bubblePop(enabled = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.085);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
    playTone(1180, 0.07, 'triangle', 0.06, 0.035);
  },
  bubblePopType(bubbleType: 'normal' | 'star' | 'diamond' | 'treasure', enabled = true) {
    if (!enabled) return;
    if (bubbleType === 'normal') {
      this.bubblePop(true);
    } else if (bubbleType === 'star') {
      this.bubblePop(true);
      playTone(659.25, 0.11, 'triangle', 0.11, 0.03);
      playTone(987.77, 0.14, 'triangle', 0.11, 0.08);
    } else if (bubbleType === 'diamond') {
      playTone(987.77, 0.1, 'sine', 0.11, 0);
      playTone(1318.51, 0.12, 'sine', 0.11, 0.045);
      playTone(1760, 0.18, 'triangle', 0.1, 0.09);
    } else {
      playTone(523.25, 0.11, 'triangle', 0.12, 0);
      playTone(659.25, 0.11, 'triangle', 0.12, 0.05);
      playTone(783.99, 0.13, 'triangle', 0.12, 0.1);
      playTone(1046.5, 0.22, 'sine', 0.13, 0.16);
    }
  },
  waveUp(enabled = true) {
    if (!enabled) return;
    playTone(587.33, 0.11, 'triangle', 0.1, 0);
    playTone(783.99, 0.14, 'triangle', 0.11, 0.08);
    playTone(1046.5, 0.2, 'sine', 0.12, 0.16);
  },
  treasureCollect(kind: 'star' | 'diamond' | 'gem' | 'chest', enabled = true) {
    if (!enabled) return;
    if (kind === 'diamond') {
      playTone(880, 0.12, 'sine', 0.11, 0);
      playTone(1174.66, 0.14, 'sine', 0.11, 0.06);
      playTone(1567.98, 0.22, 'triangle', 0.12, 0.12);
    } else if (kind === 'chest') {
      playTone(523.25, 0.12, 'triangle', 0.12, 0);
      playTone(659.25, 0.12, 'triangle', 0.12, 0.07);
      playTone(783.99, 0.14, 'triangle', 0.13, 0.14);
      playTone(1046.5, 0.26, 'sine', 0.14, 0.21);
    } else if (kind === 'gem') {
      playTone(698.46, 0.11, 'sine', 0.11, 0);
      playTone(932.33, 0.16, 'triangle', 0.11, 0.065);
    } else {
      playTone(587.33, 0.1, 'triangle', 0.11, 0);
      playTone(880, 0.16, 'sine', 0.12, 0.06);
    }
  },
  animalCall(animalId: string, enabled = true) {
    if (!enabled) return;
    switch (animalId) {
      case 'dog':
        playTone(260, 0.12, 'triangle', 0.14, 0);
        playTone(210, 0.14, 'triangle', 0.13, 0.16);
        break;
      case 'cat':
        playTone(680, 0.22, 'sine', 0.11, 0);
        playTone(540, 0.24, 'sine', 0.1, 0.14);
        break;
      case 'duck':
        playTone(420, 0.1, 'sawtooth', 0.06, 0);
        playTone(400, 0.1, 'sawtooth', 0.06, 0.14);
        break;
      case 'frog':
        playTone(190, 0.1, 'triangle', 0.12, 0);
        playTone(280, 0.12, 'triangle', 0.12, 0.12);
        break;
      case 'rooster':
        playTone(520, 0.14, 'triangle', 0.11, 0);
        playTone(660, 0.14, 'triangle', 0.11, 0.15);
        playTone(780, 0.25, 'triangle', 0.12, 0.3);
        break;
      default:
        playTone(440, 0.18, 'sine', 0.11);
    }
  },
  iceJump(powerRatio = 0.5, enabled = true) {
    if (!enabled) return;
    const baseFreq = 320 + powerRatio * 140;
    playTone(baseFreq, 0.09, 'sine', 0.11, 0);
    playTone(baseFreq * 1.45, 0.12, 'triangle', 0.09, 0.04);
  },
  iceLand(enabled = true) {
    if (!enabled) return;
    playTone(240, 0.07, 'triangle', 0.11, 0);
    playTone(340, 0.06, 'sine', 0.07, 0.025);
  },
  iceCrack(enabled = true) {
    if (!enabled) return;
    playTone(190, 0.07, 'sawtooth', 0.05, 0);
    playTone(145, 0.09, 'triangle', 0.07, 0.04);
  },
  waterSplash(enabled = true) {
    if (!enabled) return;
    playTone(360, 0.08, 'sine', 0.09, 0);
    playTone(260, 0.12, 'sine', 0.09, 0.05);
    playTone(180, 0.16, 'triangle', 0.08, 0.11);
  },
  fishCollect(enabled = true) {
    if (!enabled) return;
    playTone(659.25, 0.09, 'triangle', 0.11, 0);
    playTone(880, 0.12, 'sine', 0.12, 0.05);
    playTone(1174.66, 0.14, 'sine', 0.1, 0.1);
  },
};

// Soft procedural children's music box / marimba background loop
let bgTimerId: number | null = null;
let bgStep = 0;
const GENTLE_MELODY = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 880.0, 698.46,
  523.25, 659.25, 783.99, 1046.5,
  880.0, 783.99, 659.25, 523.25,
];

export const bubbleMusic = {
  start() {
    if (typeof window === 'undefined' || bgTimerId !== null) return;
    const tick = () => {
      const note = GENTLE_MELODY[bgStep % GENTLE_MELODY.length];
      const bass = bgStep % 4 === 0 ? note * 0.5 : 0;
      playTone(note, 0.32, 'sine', 0.024, 0);
      if (bass > 0) {
        playTone(bass, 0.45, 'triangle', 0.018, 0);
      }
      bgStep += 1;
    };
    tick();
    bgTimerId = window.setInterval(tick, 460);
  },
  stop() {
    if (typeof window === 'undefined') return;
    if (bgTimerId !== null) {
      window.clearInterval(bgTimerId);
      bgTimerId = null;
    }
  },
};

// Cheerful Arctic Adventure melody loop for Penguin Ice Adventure
let penguinBgTimerId: number | null = null;
let penguinBgStep = 0;
const ARCTIC_MELODY = [
  587.33, 739.99, 880.0, 739.99,
  659.25, 783.99, 987.77, 783.99,
  587.33, 880.0, 1174.66, 987.77,
  880.0, 739.99, 659.25, 587.33,
];

export const penguinMusic = {
  start() {
    if (typeof window === 'undefined' || penguinBgTimerId !== null) return;
    const tick = () => {
      const note = ARCTIC_MELODY[penguinBgStep % ARCTIC_MELODY.length];
      const bass = penguinBgStep % 4 === 0 ? note * 0.5 : 0;
      playTone(note, 0.28, 'triangle', 0.022, 0);
      if (bass > 0) {
        playTone(bass, 0.4, 'sine', 0.018, 0);
      }
      penguinBgStep += 1;
    };
    tick();
    penguinBgTimerId = window.setInterval(tick, 430);
  },
  stop() {
    if (typeof window === 'undefined') return;
    if (penguinBgTimerId !== null) {
      window.clearInterval(penguinBgTimerId);
      penguinBgTimerId = null;
    }
  },
};

export function speakVietnamese(text: string, enabled = true) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.94;
    utterance.pitch = 1.12;
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.toLowerCase().startsWith('vi'));
    if (viVoice) {
      utterance.voice = viVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    // Gracefully ignore speech synthesis errors in restricted environments
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
