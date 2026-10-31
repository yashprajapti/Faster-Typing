import React, { useEffect, useRef, useState } from 'react';
import { JOURNAL } from '../data/content.js';
import { speak, same, keyClick, tone } from '../lib/util.js';

const ITEMS = JOURNAL[0].items.slice(0, 8);

// Try it: the target is shown above the box and read aloud. Type it, press Enter.
export default function TryIt({ soundOn }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState('');
  const [mood, setMood] = useState('');
  const ref = useRef(null);
  const timer = useRef(null);
  const target = ITEMS[i];
  const done = i >= ITEMS.length;

  useEffect(() => {
    if (done) return;
    speak(ITEMS[i]);
    setVal(''); setMood('');
    ref.current?.focus();
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(timer.current), []);

  const advance = () => {
    setMood('good'); tone('ok');
    timer.current = setTimeout(() => setI((x) => x + 1), 650);
  };

  const onChange = (e) => {
    if (mood === 'good') return;
    const v = e.target.value;
    if (v.length > val.length && soundOn) keyClick();
    setVal(v);
  };

  const onKeyDown = (e) => {
    if (e.key !== 'Enter' || mood === 'good') return;
    if (same(val, target)) return advance();
    tone('bad');
    setMood('bad');
  };

  return (
    <div className="try-card">
      <div className="row between">
        <p className="kicker">Try it</p>
        <span className="muted small">{Math.min(i + 1, ITEMS.length)} / {ITEMS.length}</span>
      </div>
      {done ? (
        <div className="try-done">
          <p>You finished the taster.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setI(0)}>Practise again</button>
        </div>
      ) : (
        <>
          <p className="try-target" key={i}>{target}</p>
          <input
            ref={ref}
            className={`try-input ${mood}`}
            value={val}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Type it, then press Enter"
            autoComplete="off"
            spellCheck={false}
            disabled={mood === 'good'}
            aria-label="Type the words shown above"
          />
          <div className="row between">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => speak(target)}>Hear again</button>
            <span className={`try-note ${mood}`} role="status">{mood === 'good' ? 'Correct' : mood === 'bad' ? 'Not yet. Try again.' : ''}</span>
          </div>
        </>
      )}
    </div>
  );
}
