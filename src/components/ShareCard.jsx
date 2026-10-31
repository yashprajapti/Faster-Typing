import React, { useEffect, useRef } from 'react';

// The same mark as the app logo (streaks + F), drawn with the dark theme colours.
const STREAKS = [
  ['M8 76 L100 71 L100 81 Z', 0.7],
  ['M26 96 L100 91 L100 101 Z', 0.85],
  ['M4 116 L100 111 L100 121 Z', 0.6],
  ['M34 134 L100 129 L100 139 Z', 0.8],
];
const F_PATHS = [
  'M120 58 L228 58 L220 82 L146 82 L140 100 L192 100 L186 122 L134 122 L122 150 L94 150 Z',
  'M118 58 L146 58 L116 170 L88 170 Z',
];

const W = 1080;
const H = 1350;
const TEAL = '#5EEAD4';
const VIOLET = '#A78BFA';
const CORAL = '#FCA5A5';
const INK = '#EAF2FF';
const MUTED = 'rgba(234,242,255,0.62)';
const CARD = 'rgba(255,255,255,0.06)';
const LINE = 'rgba(255,255,255,0.12)';
const FONT = '"Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

function spaced(ctx, text, x, y, px) {
  // Letter-spaced caps; falls back to plain text where letterSpacing is not supported.
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = `${px}px`;
    ctx.fillText(text, x, y);
    ctx.letterSpacing = '0px';
  } else {
    ctx.fillText(text, x, y);
  }
}

// Logo mark: viewBox 0 44 240 136, drawn with its top-left at (x, y) and height h.
function drawMark(ctx, x, y, h) {
  const s = h / 136;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(0, -44);
  const g = ctx.createLinearGradient(0, 44, 240, 180);
  g.addColorStop(0, TEAL);
  g.addColorStop(1, VIOLET);
  ctx.fillStyle = g;
  STREAKS.forEach(([p, o]) => {
    ctx.globalAlpha = o;
    ctx.fill(new Path2D(p));
  });
  ctx.globalAlpha = 1;
  F_PATHS.forEach((p) => ctx.fill(new Path2D(p)));
  ctx.restore();
}

export function drawShareCard(canvas, d) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background: deep navy, teal and violet glows, faint grid.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#07111F');
  bg.addColorStop(1, '#0E1830');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 760);
  g1.addColorStop(0, 'rgba(94,234,212,0.30)');
  g1.addColorStop(1, 'rgba(94,234,212,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W, H, 0, W, H, 800);
  g2.addColorStop(0, 'rgba(167,139,250,0.34)');
  g2.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Gradient frame.
  roundRect(ctx, 28, 28, W - 56, H - 56, 44);
  const fr = ctx.createLinearGradient(28, 28, W - 28, H - 28);
  fr.addColorStop(0, 'rgba(94,234,212,0.55)');
  fr.addColorStop(1, 'rgba(167,139,250,0.55)');
  ctx.strokeStyle = fr;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Logo mark (same as the app).
  drawMark(ctx, 80, 84, 130);

  // Period pill (top right).
  ctx.font = `600 30px ${FONT}`;
  const pill = `${d.periodLabel} · ${d.rangeText}`;
  const pw = ctx.measureText(pill).width + 56;
  const px = W - 80 - pw;
  roundRect(ctx, px, 100, pw, 64, 32);
  ctx.fillStyle = CARD;
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textBaseline = 'middle';
  ctx.fillText(pill, px + 28, 133);

  // Account name (only the signed-in account's name) and label.
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.font = `700 64px ${FONT}`;
  ctx.fillText(fitText(ctx, d.name, W - 160), 80, 292);
  ctx.fillStyle = TEAL;
  ctx.font = `600 22px ${FONT}`;
  spaced(ctx, 'TYPING REPORT', 80, 340, 6);

  // Speed hero.
  const speedText = d.speed === null ? '–' : `${d.speed}`;
  ctx.fillStyle = TEAL;
  ctx.font = `800 220px ${FONT}`;
  ctx.fillText(speedText, 74, 560);
  const sw = ctx.measureText(speedText).width;
  ctx.fillStyle = MUTED;
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText('out of 120 · speed', 74 + sw + 30, 530);
  ctx.fillStyle = INK;
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText(d.speedBand || '', 74 + sw + 30, 580);

  // Speed bar.
  const barX = 80;
  const barY = 618;
  const barW = W - 160;
  roundRect(ctx, barX, barY, barW, 22, 11);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  const pct = d.speed === null ? 0 : Math.min(1, d.speed / 120);
  if (pct > 0) {
    const bfill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    bfill.addColorStop(0, TEAL);
    bfill.addColorStop(1, VIOLET);
    roundRect(ctx, barX, barY, Math.max(22, barW * pct), 22, 11);
    ctx.fillStyle = bfill;
    ctx.fill();
  }

  // Stat cards: 3 x 2.
  const stats = [
    { label: 'Accuracy', value: d.accuracy === null ? '–' : `${d.accuracy}%` },
    { label: 'Sessions', value: `${d.sessions}` },
    { label: 'Items done', value: `${d.items}` },
    { label: 'Mistakes', value: `${d.mistakes}`, bad: d.mistakes > 0 },
    { label: 'Time', value: d.time },
    { label: 'Best speed', value: d.best === null ? '–' : `${d.best}` },
  ];
  const cw = (W - 160 - 50) / 3;
  const ch = 120;
  stats.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 80 + col * (cw + 25);
    const y = 690 + row * (ch + 22);
    roundRect(ctx, x, y, cw, ch, 26);
    ctx.fillStyle = CARD;
    ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText(st.label, x + 30, y + 44);
    ctx.fillStyle = st.bad ? CORAL : INK;
    ctx.font = `700 52px ${FONT}`;
    ctx.fillText(fitText(ctx, st.value, cw - 60), x + 30, y + 96);
  });

  // Bar chart panel.
  const cy = 966;
  const chH = 100;
  const plotBottom = cy + 180;
  roundRect(ctx, 80, cy, W - 160, 218, 30);
  ctx.fillStyle = CARD;
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText(d.chart.title, 120, cy + 52);

  const vals = d.chart.values;
  const max = Math.max(1, d.chart.max || 0, ...vals);
  const n = vals.length;
  const plotX = 120;
  const plotW = W - 240;
  const slot = n ? plotW / n : plotW;
  const bw = Math.max(6, Math.min(70, slot * 0.6));
  if (!n || vals.every((v) => !v)) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText('No practice in this period yet', 120, cy + 130);
  } else {
    vals.forEach((v, i) => {
      const h = Math.max(v ? 6 : 0, (v / max) * chH);
      const bx = plotX + i * slot + (slot - bw) / 2;
      roundRect(ctx, bx, plotBottom - h, bw, h, Math.min(8, bw / 2));
      const bgc = ctx.createLinearGradient(0, plotBottom - h, 0, plotBottom);
      bgc.addColorStop(0, VIOLET);
      bgc.addColorStop(1, TEAL);
      ctx.fillStyle = v ? bgc : 'rgba(255,255,255,0.08)';
      ctx.fill();
    });
  }
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(plotX, plotBottom + 1);
  ctx.lineTo(plotX + plotW, plotBottom + 1);
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = `500 22px ${FONT}`;
  ctx.textAlign = 'center';
  const step = Math.ceil(n / 16) || 1;
  d.chart.labels.forEach((l, i) => {
    if (i % step !== 0) return;
    ctx.fillText(l, plotX + i * slot + slot / 2, plotBottom + 30);
  });
  ctx.textAlign = 'left';

  // Footer: date only.
  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(d.dateText, W - 80, 1300);
  ctx.textAlign = 'left';
}

export default function ShareModal({ data, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) drawShareCard(canvasRef.current, data);
  }, [data]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faster-${data.fileTag}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  return (
    <div className="share-overlay" role="dialog" aria-modal="true" aria-label="Download your progress card" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-head">
          <div>
            <h3>Your progress card</h3>
            <p className="muted small">{data.periodLabel} · {data.rangeText}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="share-preview">
          <canvas ref={canvasRef} aria-label="Preview of your progress card" />
        </div>
        <div className="share-actions">
          <button type="button" className="btn btn-primary" onClick={download}>Download PNG</button>
        </div>
      </div>
    </div>
  );
}
