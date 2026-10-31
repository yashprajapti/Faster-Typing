import React from 'react';

// Faster logo: a speed-F with motion streaks behind it, in the theme colours, and the name FASTER under it.
// wordmark = false gives only the mark (used in the sidebar and in the centre of the home page).
export default function Logo({ size = 40, animated = false, wordmark = false, reveal = false, running = false }) {
  const vb = wordmark ? '0 50 240 200' : '0 44 240 136';
  const h = wordmark ? size * (200 / 240) : size * (136 / 240);
  return (
    <svg className={`logo ${animated ? 'logo-anim' : ''} ${reveal ? 'logo-reveal' : ''} ${running ? 'logo-running' : ''}`} width={size} height={h} viewBox={vb} aria-label="Faster logo" role="img">
      <defs>
        <linearGradient id="lg-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--accent)' }} />
          <stop offset="1" style={{ stopColor: 'var(--accent2)' }} />
        </linearGradient>
      </defs>
      <g className="logo-streaks" fill="url(#lg-red)">
        <path d="M8 76 L100 71 L100 81 Z" opacity="0.7" />
        <path d="M26 96 L100 91 L100 101 Z" opacity="0.85" />
        <path d="M4 116 L100 111 L100 121 Z" opacity="0.6" />
        <path d="M34 134 L100 129 L100 139 Z" opacity="0.8" />
      </g>
      <g className="logo-f" fill="url(#lg-red)">
        <path d="M120 58 L228 58 L220 82 L146 82 L140 100 L192 100 L186 122 L134 122 L122 150 L94 150 Z" />
        <path d="M118 58 L146 58 L116 170 L88 170 Z" />
      </g>
      {wordmark && (
        <text x="120" y="236" textAnchor="middle" className="logo-word" letterSpacing="5">FASTER</text>
      )}
    </svg>
  );
}
