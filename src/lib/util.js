// Dates, text comparison and the small sound and voice helpers.
const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (s, n) => { const d = new Date(`${s}T00:00`); d.setDate(d.getDate() + n); return ymd(d); };
export const shortDay = (s) => new Date(`${s}T00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const fmtTime = (sec) => `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
// Typed text is compared after trimming and collapsing spaces; letters must match exactly.
export const same = (a, b) => a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim();

// Voice on/off (the Pause voice button). Off means nothing is spoken until it is turned back on.
let voiceOn = true;
export const isVoiceOn = () => voiceOn;
export function setVoiceOn(on) {
  voiceOn = on;
  try { if (!on) window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
// Stops whatever is being read, for example when the user leaves the page.
export function stopSpeech() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

// Speaks text once with the browser's English voice.
export function speak(text) {
  if (!voiceOn) return;
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.92;
    const v = s.getVoices().find((x) => /en[-_]US/i.test(x.lang));
    if (v) u.voice = v;
    s.speak(u);
  } catch { /* voice not available in this browser */ }
}

let ctx = null;
const audio = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

// Short mechanical key click, slightly different on every key press.
export function keyClick() {
  try {
    const c = audio();
    const len = Math.floor(c.sampleRate * 0.025);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800 + Math.random() * 1200;
    f.Q.value = 1.4;
    const g = c.createGain();
    g.gain.value = 0.4;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  } catch { /* audio blocked */ }
}

// Feedback tones: ok (correct), bad (wrong), done (session finished).
export function tone(kind) {
  try {
    const c = audio();
    const seq = kind === 'ok' ? [[660, 0.08], [990, 0.14]] : kind === 'bad' ? [[196, 0.18]] : [[523, 0.12], [659, 0.12], [784, 0.3]];
    let t = c.currentTime;
    for (const [freq, dur] of seq) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = kind === 'bad' ? 'sawtooth' : 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
      t += dur * 0.8;
    }
  } catch { /* audio blocked */ }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
