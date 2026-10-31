import React from 'react';

// Donut for a percentage, with the number in the middle.
export default function Ring({ pct = 0, size = 120, label = '', stroke = 'var(--accent)' }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <div className="ring-mini" style={{ width: size, height: size }} role="img" aria-label={`${p}% ${label}`}>
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <circle cx="60" cy="60" r={r} className="ring-arc" stroke={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} />
      </svg>
      <div className="ring-txt"><strong>{Math.round(p * 10) / 10}%</strong>{label && <span>{label}</span>}</div>
    </div>
  );
}
