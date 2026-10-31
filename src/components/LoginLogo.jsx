import React from 'react';

// Faster logo for the login page: a laptop types F-A-S-T, and dots travel out to each part of the app.
const LABELS = ['Courses', 'Types', 'Games', 'Mistakes', 'Analysis', 'Right', 'Wrong', 'Improve'];
const PILL_W = 92;
const GAP = 8;
const X0 = 4;
const PILL_Y = 330;
const PILL_H = 44;

export default function LoginLogo() {
  const pills = LABELS.map((label, i) => {
    const x = X0 + i * (PILL_W + GAP);
    const cx = x + PILL_W / 2;
    return { label, x, cx, d: `M400 226 C400 262 ${cx} 270 ${cx} ${PILL_Y}` };
  });

  return (
    <svg
      className="flow logo-flow"
      viewBox="0 0 800 390"
      role="img"
      aria-label="Faster covers courses, types, games, mistakes, analysis, right and wrong answers, and improvement."
    >
      <rect x="300" y="18" width="200" height="150" rx="16" className="fl-lid" />
      <rect x="316" y="34" width="168" height="118" rx="8" className="fl-screen" />
      <g className="fl-word">
        {['F', 'A', 'S', 'T'].map((c, i) => (
          <text key={c} x={400 + (i - 1.5) * 40} y="106" className="fl-letter" style={{ animationDelay: `${i * 0.5}s` }}>{c}</text>
        ))}
      </g>
      <path d="M280 186 H520 L536 204 H264 Z" className="fl-base" />

      {pills.map((p) => <path key={`l-${p.label}`} d={p.d} className="fl-line" />)}
      {pills.map((p, i) => (
        <circle key={`d-${p.label}`} r="5" className="fl-dot">
          <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${(i % 4) * 0.5}s`} path={p.d} />
        </circle>
      ))}

      {pills.map((p, i) => (
        <g key={p.label} className="fl-pill" style={{ animationDelay: `${i * 0.3}s` }}>
          <rect x={p.x} y={PILL_Y} width={PILL_W} height={PILL_H} rx="22" />
          <text x={p.cx} y={PILL_Y + 28} className="fl-pill-t">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
