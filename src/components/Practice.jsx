import React, { useEffect, useMemo, useRef, useState } from 'react';
import { speak, stopSpeech, isVoiceOn, setVoiceOn, keyClick, tone, same, fmtTime } from '../lib/util.js';

// One course run: the target appears, is spoken once, then typed. Enter moves on only when it is exactly right.
export default function Practice({ course, soundOn, onFinish, onExit, onAgain }) {
  const items = course.items;
  const isParagraph = course.kind === 'course';
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState('Listen, then type it exactly. Press Enter when it is right.');
  const [msgTone, setMsgTone] = useState('');
  const [left, setLeft] = useState(course.timeSec);
  const [shake, setShake] = useState(0);
  const [result, setResult] = useState(null);
  const rec = useRef({ start: Date.now(), keystrokes: 0, errors: 0, tries: 0, items: [], mistakes: [], done: false });
  const inputRef = useRef(null);
  const valRef = useRef('');

  const target = items[idx];
  const [voice, setVoice] = useState(isVoiceOn());

  // Leaving the course stops the reading at once.
  useEffect(() => () => stopSpeech(), []);

  // Speak each new target once.
  useEffect(() => {
    if (!result && target) speak(target);
  }, [idx, result]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (!result) inputRef.current?.focus(); }, [idx, result]);

  // Countdown.
  useEffect(() => {
    if (result) return undefined;
    const id = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [result]);
  useEffect(() => { if (left === 0 && !result) finish(true); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = (timedOut) => {
    if (rec.current.done) return;
    rec.current.done = true;
    const r = rec.current;
    const minutes = Math.max(1 / 60, (Date.now() - r.start) / 60000);
    const acc = r.keystrokes ? Math.round(((r.keystrokes - r.errors) / r.keystrokes) * 1000) / 10 : 100;
    const wpm = Math.round((r.keystrokes / 5) / minutes);
    const firstTry = r.items.filter((i) => i.firstTry).length;
    const summary = {
      courseId: course.id, courseTitle: course.title, level: course.level, kind: course.kind,
      items: r.items, mistakes: r.mistakes, total: items.length, completed: r.items.length, firstTry,
      keystrokes: r.keystrokes, errors: r.errors, accuracy: acc, wpm, seconds: Math.round((Date.now() - r.start) / 1000), timedOut,
    };
    tone('done');
    setResult(summary);
    onFinish(summary);
  };

  // Counts keystrokes against a ref, not state, so fast typing is never missed.
  const onChange = (e) => {
    const v = e.target.value;
    const prev = valRef.current;
    if (v.length > prev.length && target) {
      const pos = v.length - 1;
      rec.current.keystrokes++;
      if (v[pos] !== target[pos]) rec.current.errors++;
      if (soundOn) keyClick();
    }
    if (isParagraph && target && v.length >= target.length) { submit(v, true); return; }
    // Each finished word is read aloud as it is typed.
    if (v.length > prev.length && v.endsWith(' ')) {
      const w = v.trim().split(/\s+/).pop();
      if (w) speak(w);
    }
    valRef.current = v;
    setValue(v);
  };

  const submit = (typedIn = value, forced = false) => {
    if (result || !target) return;
    const typed = typedIn;
    if (same(typed, target)) {
      rec.current.items.push({ target, typed, firstTry: rec.current.tries === 0 });
      rec.current.tries = 0;
      tone('ok');
      setMsg('Correct. Next one is coming.');
      setMsgTone('good');
      valRef.current = '';
      setValue('');
      if (idx + 1 >= items.length) return finish(false);
      setIdx(idx + 1);
    } else if (forced) {
      // A paragraph ends by itself once every letter is typed. Wrong words are kept for the Mistakes page.
      rec.current.mistakes.push({ target, typed });
      rec.current.items.push({ target, typed, firstTry: false });
      rec.current.tries = 0;
      tone('bad');
      valRef.current = '';
      setValue('');
      setMsg('Paragraph finished. Wrong words are on the Mistakes page.');
      setMsgTone('bad');
      if (idx + 1 >= items.length) return finish(false);
      setIdx(idx + 1);
    } else {
      rec.current.tries++;
      rec.current.mistakes.push({ target, typed });
      tone('bad');
      setShake((s) => s + 1);
      setMsgTone('bad');
      setMsg('Not quite. Check the highlighted letters and type it again.');
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) speak(value.trim()); // the finished sentence is read aloud
      submit();
    }
  };

  // Highlight each target character as the user types.
  const marks = useMemo(() => {
    if (!target) return [];
    return target.split('').map((ch, i) => {
      if (i >= value.length) return { ch, cls: '' };
      return { ch, cls: value[i] === ch ? 'ok' : 'bad' };
    });
  }, [target, value]);

  if (result) return <Result r={result} course={course} onExit={onExit} onAgain={onAgain} />;

  const pct = Math.round((idx / items.length) * 100);
  const warn = left <= 30;

  return (
    <div className="practice">
      <div className="practice-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}>← Exit</button>
        <div className="practice-title">
          <span className="pill">{course.level}</span>
          <strong>{course.title}</strong>
        </div>
        <div className={`timer ${warn ? 'warn' : ''}`} aria-label="Time left">{fmtTime(left)}</div>
      </div>

      <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="muted small count">{isParagraph ? 'Paragraph' : 'Item'} {Math.min(idx + 1, items.length)} of {items.length}</p>

      <div className={`stage ${shake ? 'shake' : ''}`} key={idx}>
        <p className={isParagraph ? 'target para' : 'target'} aria-label={`Target: ${target}`}>
          {marks.map((m, i) => <span key={i} className={m.cls}>{m.ch}</span>)}
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => speak(target)}>▶ Listen again</button>
        <button type="button" className="btn btn-ghost btn-sm" aria-pressed={voice} onClick={() => { const next = !voice; setVoiceOn(next); setVoice(next); }}>{voice ? '❚❚ Pause voice' : '▶ Play voice'}</button>
      </div>

      <div className="input-wrap">
        {isParagraph ? (
          <textarea ref={inputRef} rows={6} value={value} onChange={onChange} onKeyDown={onKey} spellCheck={false} aria-label="Type the paragraph" placeholder="Type here…" />
        ) : (
          <input ref={inputRef} value={value} onChange={onChange} onKeyDown={onKey} spellCheck={false} autoComplete="off" aria-label="Type the word or sentence" placeholder="Type here…" />
        )}
      </div>
      <p className={`feedback ${msgTone}`} role="status">{msg}</p>
      <p className="muted small hint">Enter submits. Only an exact match moves you on.</p>
    </div>
  );
}

function Result({ r, course, onExit, onAgain }) {
  return (
    <div className="result">
      <p className="kicker">{r.timedOut ? 'Time is up' : 'Session complete'}</p>
      <h1 className="display result-title">{course.title}</h1>
      <div className="stats-grid">
        <Tile label="Accuracy" value={`${r.accuracy}%`} tone={r.accuracy >= 90 ? 'good' : r.accuracy < 70 ? 'bad' : ''} />
        <Tile label="Speed" value={`${r.wpm} of 120`} />
        <Tile label="Completed" value={`${r.completed}/${r.total}`} />
        <Tile label="First-try correct" value={`${r.firstTry}`} />
        <Tile label="Mistakes" value={`${r.mistakes.length}`} tone={r.mistakes.length ? 'bad' : 'good'} />
        <Tile label="Time" value={fmtTime(r.seconds)} />
      </div>
      {r.mistakes.length > 0 && (
        <div className="panel">
          <h3>Where you slipped</h3>
          <ul className="mistake-list">
            {r.mistakes.slice(0, 12).map((m, i) => (
              <li key={i}><span className="exp">{m.target}</span><span className="got">you typed: {m.typed || '(empty)'}</span></li>
            ))}
          </ul>
        </div>
      )}
      <div className="row gap wrap">
        <button type="button" className="btn btn-primary" onClick={onAgain}>Practise again</button>
        <button type="button" className="btn btn-ghost" onClick={onExit}>Back to courses</button>
      </div>
    </div>
  );
}

function Tile({ label, value, tone = '' }) {
  return (
    <div className={`tile ${tone}`}>
      <span className="tile-label">{label}</span>
      <strong className="tile-value">{value}</strong>
    </div>
  );
}
