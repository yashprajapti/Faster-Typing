import React, { useEffect, useRef, useState } from 'react';
import GameFrame from './GameFrame.jsx';
import { tierFor, pick } from './words.js';
import { keyClick, speak } from '../../lib/util.js';

// Penalty shootout. The app says one of three words out loud. Type that word and press Enter:
// the right word is a goal, a wrong word is caught by the keeper. Show or hear it again any time.
const ZONES = [27, 50, 73]; // horizontal centre of left, middle and right zones (% of the pitch)
const MAX_SAVES = 5;
const levelOf = (goals) => 1 + Math.floor(goals / 3);

export default function FootballGame({ soundOn, best, onBest, onExit }) {
  const [phase, setPhase] = useState('start');
  const [words, setWords] = useState(['', '', '']);
  const [target, setTarget] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [val, setVal] = useState('');
  const [pct, setPct] = useState(100);
  const [goals, setGoals] = useState(0);
  const [saves, setSaves] = useState(0);
  const [shot, setShot] = useState(null);
  const [keeperAt, setKeeperAt] = useState(1);
  const [flash, setFlash] = useState(null);
  const [shake, setShake] = useState(0);
  const S = useRef({ goals: 0, saves: 0, words: ['', '', ''], target: 0, prev: [], start: 0, limit: 9000, busy: false });
  const inputRef = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const newRound = () => {
    const s = S.current;
    const lvl = levelOf(s.goals);
    const pool = tierFor(Math.min(3, lvl - 1));
    const picked = [];
    while (picked.length < 3) {
      const w = pick(pool);
      if (!picked.includes(w) && !s.prev.includes(w)) picked.push(w);
    }
    const t = Math.floor(Math.random() * 3);
    s.words = picked;
    s.target = t;
    s.prev = picked;
    s.start = Date.now();
    s.limit = Math.max(4500, 10000 - lvl * 900);
    s.busy = false;
    setWords(picked); setTarget(t); setRevealed(false); setVal(''); setShot(null); setFlash(null);
    setPct(100); setKeeperAt(1);
    later(() => speak(picked[t]), 350);
    later(() => inputRef.current?.focus(), 0);
  };

  const after = () => {
    const s = S.current;
    if (s.saves >= MAX_SAVES) { later(() => { setPhase('over'); onBest(s.goals); }, 1100); return; }
    later(newRound, 1300);
  };

  const resolve = (correct) => {
    const s = S.current;
    if (s.busy) return;
    s.busy = true;
    const t = s.target;
    const dive = correct ? pick([0, 1, 2].filter((z) => z !== t)) : t; // right word: keeper dives the wrong way. Wrong word: keeper catches it.
    setKeeperAt(dive);
    setShot({ zone: t, goal: correct });
    later(() => {
      if (correct) { s.goals += 1; setGoals(s.goals); setFlash({ t: 'GOAL!', ok: true, n: Date.now() }); }
      else { s.saves += 1; setSaves(s.saves); setFlash({ t: 'SAVED!', ok: false, n: Date.now() }); }
      after();
    }, 950);
  };

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setInterval(() => {
      const s = S.current;
      if (s.busy) return;
      const elapsed = Date.now() - s.start;
      setPct(Math.max(0, 100 - (elapsed / s.limit) * 100));
      if (elapsed >= s.limit) {
        s.busy = true;
        s.saves += 1;
        setSaves(s.saves);
        setKeeperAt(s.target);
        setShot({ zone: s.target, goal: false });
        setFlash({ t: 'TOO SLOW', ok: false, n: Date.now() });
        after();
      }
    }, 80);
    return () => clearInterval(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    S.current = { goals: 0, saves: 0, words: ['', '', ''], target: 0, prev: [], start: 0, limit: 9000, busy: false };
    setGoals(0); setSaves(0); setShot(null); setFlash(null);
    setPhase('play');
    newRound();
  };

  const onChange = (e) => {
    const v = e.target.value;
    if (v.length > val.length && soundOn) keyClick();
    setVal(v);
  };

  const onKeyDown = (e) => {
    if (e.key !== 'Enter' || phase !== 'play' || S.current.busy) return;
    const typed = val.trim().toLowerCase();
    if (!typed) return;
    const correct = typed === S.current.words[S.current.target];
    if (!correct) setShake((x) => x + 1);
    resolve(correct);
  };

  const hidden = (w) => w.replace(/[^ ]/g, '_ ').trim();
  const lvl = levelOf(goals);
  const ballStyle = shot
    ? { left: `${ZONES[shot.zone]}%`, top: '112px', transform: 'translate(-50%, -50%) scale(0.5)', transition: 'left .55s cubic-bezier(.2,.7,.2,1), top .55s cubic-bezier(.2,.7,.2,1), transform .55s' }
    : { left: '50%', top: '300px', transform: 'translate(-50%, -50%) scale(1)', transition: 'none' };

  return (
    <GameFrame
      title="Football Shots"
      blurb="The app says one word out loud. Type it and press Enter. The right word is a goal. A wrong word is caught by the keeper."
      phase={phase}
      onStart={start}
      onExit={onExit}
      best={best}
      hud={<><span>Goals <b>{goals}</b></span><span>Saves <b>{saves}/{MAX_SAVES}</b></span><span>Level <b>{lvl}</b></span></>}
      result={`${goals} goal${goals === 1 ? '' : 's'} scored`}
      sub={`Saves: ${saves}. Every three goals the words get longer and the keeper gets sharper.`}
    >
      <div className="football">
        <div className="pitch-line box-big" aria-hidden="true" />
        <div className="pitch-line box-small" aria-hidden="true" />
        <div className="pitch-spot" aria-hidden="true" />
        <div className="goal">
          <div className={`net ${shot?.goal && flash?.ok ? 'shake' : ''}`} />
          {words.map((w, z) => (
            <span key={`${z}-${w}`} className={`zone-chip z${z} ${revealed && shot === null && target === z ? 'picked' : ''}`} style={{ left: `${(ZONES[z] - 15) / 0.7}%` }}>{w}</span>
          ))}
        </div>
        <div className={`keeper ${shot ? 'diving' : 'idle'}`} style={{ left: `${ZONES[keeperAt]}%` }} aria-hidden="true">
          <div className="kp-fig"><i className="k-head" /><i className="k-body" /><i className="k-arm l" /><i className="k-arm r" /></div>
        </div>
        <div className={`ball ${shot ? 'flying' : ''}`} style={ballStyle} aria-hidden="true" />
        {flash && <div className={`flash ${flash.ok ? 'good' : 'bad'}`} key={flash.n}>{flash.t}</div>}
        <div className="bar foot-bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="foot-prompt">
          <span className="fp-word">{phase === 'play' && words[target] ? (revealed ? words[target] : hidden(words[target])) : 'Press start'}</span>
          <div className="row gap">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => speak(words[target])} disabled={phase !== 'play'}>Hear again</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRevealed((r) => !r)} disabled={phase !== 'play'}>{revealed ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <input
          key={shake}
          ref={inputRef}
          className={`game-input foot-input ${shake && !shot ? 'nope' : ''}`}
          value={val}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={phase !== 'play' || !!shot}
          placeholder="type the word, then Enter"
          autoComplete="off"
          spellCheck={false}
          aria-label="Type the word, then press Enter"
        />
      </div>
    </GameFrame>
  );
}
