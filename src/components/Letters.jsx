import React from 'react';

// Draws letters with the mismatched ones in red (a gap shows where a letter is missing).
export default function Letters({ marks = [], empty = '' }) {
  if (!marks.length) return <span className="muted">{empty}</span>;
  return marks.map((m, i) => (
    <span key={i} className={m.cls ? `ch-${m.cls}` : ''}>{m.ch}</span>
  ));
}
