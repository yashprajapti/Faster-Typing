import React from 'react';

// Original illustrated scene for each game. Used as the game card art and as the wallpaper behind the game.
const BUB_COLS = ['#F472B6', '#FBBF24', '#34D399', '#A78BFA', '#FB7185', '#60A5FA'];
const BUB_LET = 'ABCDEFGHJKLMNPRSTUVW';
const bubbles = [];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 8; c++) {
    if (r > 1 && (r + c) % 5 === 4) continue;
    bubbles.push({ x: 28 + c * 46 + (r % 2) * 23, y: 24 + r * 38, col: BUB_COLS[(r * 3 + c) % BUB_COLS.length], l: BUB_LET[(r * 8 + c) % BUB_LET.length] });
  }
}
const tiles = [
  { l: 'F', x: 70, y: 52, r: -12 }, { l: 'O', x: 150, y: 30, r: 8 }, { l: 'R', x: 240, y: 62, r: -6 },
  { l: 'D', x: 300, y: 28, r: 14 }, { l: 'W', x: 120, y: 98, r: 6 }, { l: 'M', x: 268, y: 104, r: -10 },
];

const scenes = {
  bubble: (
    <>
      <defs><linearGradient id="gsb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0EA5A4" /><stop offset="1" stopColor="#0C4A6E" /></linearGradient></defs>
      <rect width="400" height="220" fill="url(#gsb)" />
      <g className="gs-drift">
        {bubbles.map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r="19" fill={b.col} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <text x={b.x} y={b.y + 6} textAnchor="middle" className="gs-letter">{b.l}</text>
          </g>
        ))}
      </g>
      <circle cx="232" cy="130" r="17" fill="#FBBF24" className="gs-fly" />
      <text x="232" y="136" textAnchor="middle" className="gs-letter">A</text>
      <g className="gs-cannon">
        <rect x="186" y="150" width="28" height="72" rx="12" fill="#0F172A" transform="rotate(22 200 200)" />
        <circle cx="200" cy="202" r="28" fill="#1E293B" />
      </g>
    </>
  ),
  fall: (
    <>
      <defs><linearGradient id="gsf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FB923C" /><stop offset="1" stopColor="#9A3412" /></linearGradient></defs>
      <rect width="400" height="220" fill="url(#gsf)" />
      <path d="M40 220 L360 220 L300 120 L100 120 Z" fill="#B45309" />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={100 + i * 40} y1="120" x2={40 + i * 64} y2="220" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />)}
      {[0, 1, 2].map((i) => <line key={`h${i}`} x1={70 - i * 10} y1={170 + i * 16} x2={330 + i * 10} y2={170 + i * 16} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />)}
      {tiles.map((t, i) => (
        <g key={t.l} className="gs-fall" style={{ animationDelay: `${i * 0.35}s` }}>
          <rect x={t.x - 19} y={t.y - 19} width="38" height="38" rx="7" fill="#FEF3C7" stroke="#92400E" strokeWidth="2" transform={`rotate(${t.r} ${t.x} ${t.y})`} />
          <text x={t.x} y={t.y + 8} textAnchor="middle" className="gs-tile" transform={`rotate(${t.r} ${t.x} ${t.y})`}>{t.l}</text>
        </g>
      ))}
      {[30, 90, 160, 230, 300, 360].map((x, i) => <line key={`s${i}`} x1={x} y1="0" x2={x + 6} y2="36" stroke="rgba(255,255,255,0.45)" strokeWidth="2" className="gs-streak" style={{ animationDelay: `${i * 0.2}s` }} />)}
    </>
  ),
  race: (
    <>
      <defs><linearGradient id="gsr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0F172A" /><stop offset="1" stopColor="#4C1D95" /></linearGradient></defs>
      <rect width="400" height="220" fill="url(#gsr)" />
      <polygon points="0,220 400,220 262,72 138,72" fill="#334155" />
      <line x1="200" y1="72" x2="200" y2="220" stroke="#F8FAFC" strokeWidth="3" strokeDasharray="14 14" className="gs-lane" />
      <line x1="170" y1="72" x2="110" y2="220" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="10 16" className="gs-lane" />
      <line x1="230" y1="72" x2="290" y2="220" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="10 16" className="gs-lane" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={60 + i * 90} y1="30" x2={20 + i * 110} y2="200" stroke="rgba(94,234,212,0.35)" strokeWidth="2" className="gs-speed" style={{ animationDelay: `${i * 0.3}s` }} />)}
      <g className="gs-car-b">
        <rect x="150" y="128" width="60" height="22" rx="8" fill="#FB7185" />
        <rect x="162" y="118" width="36" height="12" rx="5" fill="#FDA4AF" />
        <circle cx="166" cy="152" r="6" fill="#020617" /><circle cx="196" cy="152" r="6" fill="#020617" />
      </g>
      <g className="gs-car-a">
        <rect x="170" y="176" width="72" height="26" rx="9" fill="#22D3EE" />
        <rect x="184" y="164" width="44" height="14" rx="6" fill="#A5F3FC" />
        <circle cx="186" cy="204" r="7" fill="#020617" /><circle cx="226" cy="204" r="7" fill="#020617" />
      </g>
    </>
  ),
  tower: (
    <>
      <defs><linearGradient id="gst" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34D399" /><stop offset="1" stopColor="#0F766E" /></linearGradient></defs>
      <rect width="400" height="220" fill="url(#gst)" />
      <g className="gs-cloud"><ellipse cx="90" cy="46" rx="44" ry="13" fill="rgba(255,255,255,0.35)" /><ellipse cx="300" cy="72" rx="52" ry="14" fill="rgba(255,255,255,0.3)" /></g>
      <rect x="0" y="196" width="400" height="24" fill="#065F46" />
      {[0, 1, 2, 3, 4].map((i) => {
        const w = 120 - i * 10;
        const cols = ['#FDE68A', '#FCA5A5', '#93C5FD', '#C4B5FD', '#FDBA74'];
        return <rect key={i} x={200 - w / 2} y={180 - i * 24} width={w} height="22" rx="5" fill={cols[i]} stroke="#065F46" strokeWidth="2" />;
      })}
      <rect x="338" y="20" width="10" height="176" fill="#334155" />
      <rect x="252" y="16" width="100" height="8" fill="#475569" />
      <g className="gs-hook">
        <line x1="290" y1="24" x2="290" y2="82" stroke="#E2E8F0" strokeWidth="2" />
        <rect x="270" y="82" width="40" height="18" rx="4" fill="#F59E0B" />
      </g>
    </>
  ),
  foot: (
    <>
      <rect width="400" height="220" fill="#166534" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={i * 60} y="0" width="30" height="220" fill="rgba(255,255,255,0.05)" />)}
      <g stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none">
        <rect x="90" y="18" width="220" height="110" />
        <rect x="140" y="18" width="120" height="50" />
        <path d="M150 128 A 60 60 0 0 0 250 128" />
      </g>
      <rect x="130" y="18" width="140" height="62" fill="rgba(255,255,255,0.12)" />
      {Array.from({ length: 10 }, (_, i) => <line key={`v${i}`} x1={134 + i * 14} y1="18" x2={134 + i * 14} y2="80" stroke="rgba(255,255,255,0.35)" />)}
      {Array.from({ length: 4 }, (_, i) => <line key={`h${i}`} x1="130" y1={18 + i * 16} x2="270" y2={18 + i * 16} stroke="rgba(255,255,255,0.35)" />)}
      <circle cx="200" cy="168" r="6" fill="#F8FAFC" />
      <g className="gs-ball"><circle cx="200" cy="184" r="16" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" /><circle cx="200" cy="184" r="5" fill="#334155" /></g>
    </>
  ),
  music: (
    <>
      <defs><linearGradient id="gsm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED" /><stop offset="1" stopColor="#DB2777" /></linearGradient></defs>
      <rect width="400" height="220" fill="url(#gsm)" />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={20 + i * 15.5} y={110 - (12 + ((i * 37) % 60)) / 2} width="8" height={12 + ((i * 37) % 60)} rx="4" fill="rgba(255,255,255,0.55)" className="gs-bar" style={{ animationDelay: `${(i % 6) * 0.12}s` }} />
      ))}
      <path d="M118 118 A 82 82 0 0 1 282 118" fill="none" stroke="#F8FAFC" strokeWidth="9" strokeLinecap="round" />
      <rect x="104" y="106" width="28" height="48" rx="10" fill="#F8FAFC" />
      <rect x="268" y="106" width="28" height="48" rx="10" fill="#F8FAFC" />
      <g className="gs-note"><circle cx="58" cy="60" r="8" fill="#FDE68A" /><rect x="64" y="30" width="4" height="34" fill="#FDE68A" /></g>
      <g className="gs-note" style={{ animationDelay: '-1.6s' }}><circle cx="338" cy="50" r="8" fill="#FDE68A" /><rect x="344" y="20" width="4" height="34" fill="#FDE68A" /></g>
    </>
  ),
};

export default function GameScene({ variant = 'bubble' }) {
  return (
    <svg className="gscene" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      {scenes[variant] || scenes.bubble}
    </svg>
  );
}
