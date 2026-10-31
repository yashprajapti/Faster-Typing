import React, { useEffect, useState } from 'react';

// Full keyboard (widths in key units) drawn in one SVG so every key position is exact.
const U = 42;
const KH = 40;
const X0 = 25;
const W = 680;
const ROW_Y = [12, 58, 104, 150, 196];
const letters = (s) => s.split('').map((c) => [c, 1]);
const LAYOUT = [
  [['`', 1], ...letters('1234567890'), ['-', 1], ['=', 1], ['Back', 2]],
  [['Tab', 1.5], ...letters('qwertyuiop'), ['[', 1], [']', 1], ['\\', 1.5]],
  [['Caps', 1.75], ...letters('asdfghjkl'), [';', 1], ["'", 1], ['Enter', 2.25]],
  [['Shift', 2.25], ...letters('zxcvbnm'), [',', 1], ['.', 1], ['/', 1], ['Shift', 2.75]],
  [['Ctrl', 1.25], ['Win', 1.25], ['Alt', 1.25], ['Space', 7.5], ['Alt', 1.25], ['Win', 1.25], ['Ctrl', 1.25]],
];

// Which finger types which key (standard touch-typing).
const FINGER_KEYS = {
  LP: '`1qaz',
  LR: '2wsx',
  LM: '3edc',
  LI: '4rfvtgb5',
  RI: '6yhnujm7',
  RM: '8ik,',
  RR: '9ol.',
  RP: "0-=p[]\;'/",
};
const FINGER_OF = {};
Object.entries(FINGER_KEYS).forEach(([f, chars]) => chars.split('').forEach((c) => { FINGER_OF[c] = f; }));
const FINGER_COLOR = {
  LP: '#FBCFE8', LR: '#FDE68A', LM: '#BBF7D0', LI: '#BAE6FD',
  RI: '#DDD6FE', RM: '#FED7AA', RR: '#FECACA', RP: '#C7D2FE',
};

const KEYS = [];
LAYOUT.forEach((row, r) => {
  let x = X0;
  row.forEach(([label, u]) => {
    const w = u * U;
    const ch = label.length === 1 ? label : null;
    const finger = label === 'Space' ? 'RT' : (ch && FINGER_OF[ch]) || (x + w / 2 < 340 ? 'LP' : 'RP');
    KEYS.push({ id: `k${KEYS.length}`, label, ch, x, y: ROW_Y[r], w, cx: x + w / 2, cy: ROW_Y[r] + KH / 2, finger, color: ch ? FINGER_COLOR[finger] : '#E2E8F0' });
    x += w;
  });
});
const KEY_BY_CH = {};
KEYS.forEach((k) => { if (k.ch && !KEY_BY_CH[k.ch]) KEY_BY_CH[k.ch] = k; });
const SPACE_KEY = KEYS.find((k) => k.label === 'Space');
const keyTip = (k) => ({ x: k.cx, y: k.cy - 4 });
const mirror = (p) => [W - p[0], p[1]];

// Hands: each finger starts at its knuckle on the palm and reaches its key. The thumbs rest on the space bar.
const LEFT = {
  LP: { mcp: [88, 276], home: 'a', wb: 25, wt: 20 },
  LR: { mcp: [130, 266], home: 's', wb: 29, wt: 23 },
  LM: { mcp: [174, 262], home: 'd', wb: 31, wt: 24 },
  LI: { mcp: [216, 266], home: 'f', wb: 30, wt: 23 },
  LT: { mcp: [262, 318], thumb: 0.3, wb: 36, wt: 27 },
};
const RIGHT = {
  RI: { mcp: mirror([216, 266]), home: 'j', wb: 30, wt: 23 },
  RM: { mcp: mirror([174, 262]), home: 'k', wb: 31, wt: 24 },
  RR: { mcp: mirror([130, 266]), home: 'l', wb: 29, wt: 23 },
  RP: { mcp: mirror([88, 276]), home: ';', wb: 25, wt: 20 },
  RT: { mcp: mirror([262, 318]), thumb: 0.7, wb: 36, wt: 27 },
};

function targetOf(spec) {
  if (spec.thumb !== undefined) return { x: SPACE_KEY.x + spec.thumb * SPACE_KEY.w, y: SPACE_KEY.cy - 2 };
  return keyTip(KEY_BY_CH[spec.home]);
}

// Smooth closed outline through points (Catmull-Rom turned into cubic curves).
function smoothPath(pts) {
  const n = pts.length;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return `${d} Z`;
}

const PALM_LEFT = [[50, 356], [50, 314], [66, 284], [106, 264], [172, 256], [230, 264], [256, 292], [270, 328], [284, 356]];
const PALM_RIGHT = PALM_LEFT.map(mirror);
const PALM_LEFT_D = smoothPath(PALM_LEFT);
const PALM_RIGHT_D = smoothPath(PALM_RIGHT);

// One finger: a soft curve from the knuckle up to the key, with the middle joint bending and the tip curling down.
// The outline is tapered from the knuckle width to the tip width and ends in a round fingertip.
function fingerPath(mcp, tip, wb, wt, pressed) {
  const [sx, sy] = mcp;
  const ex = tip.x;
  const ey = tip.y + (pressed ? 4 : 0);
  const L = Math.hypot(ex - sx, ey - sy);
  const side = ex < sx ? -1 : 1;
  const c1 = [sx + side * 0.12 * L, sy - 0.42 * L];
  const c2 = [ex - side * 0.06 * L, ey + 0.22 * L];
  const N = 18;
  const pts = [];
  for (let i = 0; i <= N; i += 1) {
    const u = i / N;
    const a = (1 - u) ** 3;
    const b = 3 * (1 - u) ** 2 * u;
    const c = 3 * (1 - u) * u * u;
    const d = u ** 3;
    pts.push([a * sx + b * c1[0] + c * c2[0] + d * ex, a * sy + b * c1[1] + c * c2[1] + d * ey]);
  }
  const left = [];
  const right = [];
  pts.forEach((p, i) => {
    const q0 = pts[Math.max(i - 1, 0)];
    const q1 = pts[Math.min(i + 1, N)];
    const dx = q1[0] - q0[0];
    const dy = q1[1] - q0[1];
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d;
    const ny = dx / d;
    const u = i / N;
    const w = (wb + (wt - wb) * u ** 0.9) / 2;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  });
  // Round fingertip.
  const last = pts[N];
  const prev = pts[N - 1];
  const ang = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
  const r = wt / 2;
  const cap = [];
  for (let k = 1; k < 8; k += 1) {
    const t = ang + Math.PI / 2 - (Math.PI * k) / 8; // from the left edge, over the tip, to the right edge
    cap.push([last[0] + r * Math.cos(t), last[1] + r * Math.sin(t)]);
  }
  const all = [...left, ...cap, ...right.reverse()];
  return `M${all.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')} Z`;
}

const SEQ = 'fast type'.split('');
const CYCLE = SEQ.length + 4;

// Keyboard with a steady pair of hands. The finger that types a letter reaches its key, taps and returns home.
export default function TypeHand({ big = false, interval = 430 }) {
  const [step, setStep] = useState(0);
  const [lift, setLift] = useState(true);
  const [pops, setPops] = useState([]);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  const idx = step % CYCLE;
  const typed = SEQ.slice(0, Math.min(idx, SEQ.length)).join('');
  const ch = idx >= 1 && idx <= SEQ.length ? SEQ[idx - 1] : null;
  const pressKey = ch === null ? null : ch === ' ' ? SPACE_KEY : KEY_BY_CH[ch];
  const pressFinger = pressKey ? pressKey.finger : null;
  const pressTip = pressKey ? (ch === ' ' ? { x: SPACE_KEY.x + 0.7 * SPACE_KEY.w, y: SPACE_KEY.cy - 2 } : keyTip(pressKey)) : null;

  // The finger stays on the key for a moment, then lifts back to its home key.
  useEffect(() => {
    setLift(false);
    const t = setTimeout(() => setLift(true), 180);
    return () => clearTimeout(t);
  }, [step]);

  // The letter pops up above the pressed key.
  useEffect(() => {
    if (!pressKey || !pressKey.ch) return undefined;
    const id = step;
    setPops((p) => [...p.slice(-3), { id, label: pressKey.ch.toUpperCase(), x: pressKey.cx, y: pressKey.y - 4 }]);
    const t = setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 800);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const fingerD = (id, spec) => {
    const pressed = !lift && pressFinger === id && pressTip;
    const tip = pressed ? pressTip : targetOf(spec);
    return fingerPath(spec.mcp, tip, spec.wb, spec.wt, Boolean(pressed));
  };
  const hands = [LEFT, RIGHT];
  const handShapes = [
    PALM_LEFT_D,
    PALM_RIGHT_D,
    ...hands.flatMap((set) => Object.keys(set).map((id) => fingerD(id, set[id]))),
  ];

  return (
    <div className={`kbd-wrap ${big ? 'big' : ''}`} aria-hidden="true">
      <div className="kb-typed">{typed.toUpperCase()}</div>
      <svg viewBox="0 0 680 362" className="kb-svg" focusable="false">
        <defs>
          <mask id="kb-hand-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="680" height="362">
            <rect x="0" y="0" width="680" height="362" fill="#fff" />
            <g fill="#000">{handShapes.map((d, i) => <path key={`m${i}`} d={d} />)}</g>
          </mask>
        </defs>
        <rect x="8" y="0" width="664" height="340" rx="22" className="kb-body" />
        {KEYS.map((k) => (
          <g key={k.id} className={`kb-key ${pressKey && pressKey.id === k.id ? 'hit' : ''}`}>
            <rect x={k.x + 2} y={k.y + 4} width={k.w - 4} height={KH} rx="9" className="kb-shadow" />
            <rect x={k.x + 2} y={k.y} width={k.w - 4} height={KH} rx="9" className="kb-face" fill={k.color} />
            <text x={k.cx} y={k.y + KH / 2} className={`kb-label ${k.label.length > 1 ? 'sm' : ''}`}>{k.label}</text>
          </g>
        ))}
        <g className="kb-hands">
          {/* Outline: only the outer edge of the whole hand (the inside is masked out, so no seams between fingers and palm). */}
          <g mask="url(#kb-hand-mask)" className="kb-hand-edge">
            {handShapes.map((d, i) => <path key={`e${i}`} d={d} />)}
          </g>
          {/* Fill: one translucent group, so the keys and letters behind the hands still show. */}
          <g className="kb-hand-fill">
            {handShapes.map((d, i) => <path key={`f${i}`} d={d} />)}
          </g>
        </g>
        {pops.map((p) => (
          <text key={p.id} x={p.x} y={p.y} className="kb-pop">{p.label}</text>
        ))}
      </svg>
    </div>
  );
}
