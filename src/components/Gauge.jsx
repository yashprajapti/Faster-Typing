import React from 'react';

// Speedometer for WPM, 0 to 120, with a needle that swings in on load.
export default function Gauge({ value = 0, max = 120, label = "speed", best = null }) {
  const bestAngle = best === null ? null : (-180 + (Math.min(max, best) / max) * 180) * (Math.PI / 180);
  const v = Math.max(0, Math.min(max, Number(value) || 0));
  const angle = -90 + (v / max) * 180;
  const ticks = [];
  for (let i = 0; i <= 12; i++) {
    const a = (-180 + (i / 12) * 180) * (Math.PI / 180);
    const major = i % 2 === 0;
    const r1 = 78;
    const r2 = major ? 66 : 72;
    ticks.push(
      <line key={i} x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)} x2={100 + r2 * Math.cos(a)} y2={100 + r2 * Math.sin(a)} className={major ? 'tick major' : 'tick'} />,
    );
  }
  const labels = [0, 20, 40, 60, 80, 100, 120].map((n) => {
    const a = (-180 + (n / max) * 180) * (Math.PI / 180);
    return <text key={n} x={100 + 55 * Math.cos(a)} y={100 + 55 * Math.sin(a) + 4} className="tick-label">{n}</text>;
  });
  return (
    <div className="gauge" role="img" aria-label={`${v} ${label}`}>
      <svg viewBox="0 0 200 118">
        <path d="M22 100 A78 78 0 0 1 178 100" className="gauge-track" />
        <path d="M22 100 A78 78 0 0 1 178 100" className="gauge-fill" pathLength="100" style={{ strokeDasharray: `${(v / max) * 100} 100` }} />
        {ticks}
        {labels}
        <g className="needle" style={{ transform: `rotate(${angle}deg)` }}>
          <line x1="100" y1="100" x2="100" y2="34" />
        </g>
        {bestAngle !== null && <circle cx={100 + 78 * Math.cos(bestAngle)} cy={100 + 78 * Math.sin(bestAngle)} r="5" className="best-dot"><title>Your best: {best} of 120</title></circle>}
        <circle cx="100" cy="100" r="7" className="hub" />
      </svg>
      <div className="gauge-val"><strong>{Math.round(v)}</strong><span>{label}</span></div>
    </div>
  );
}
