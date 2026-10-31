import React, { useEffect, useRef, useState } from 'react';
import GameFrame from './GameFrame.jsx';
import { LETTERS } from './words.js';
import { keyClick } from '../../lib/util.js';

// Bubbles drift down with a letter inside. Type the letter to pop the lowest matching bubble.
export default function BubbleShooter({ soundOn, best, onBest, onExit }) {
  const [phase, setPhase] = useState('start');
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [pops, setPops] = useState(0);
  const [flash, setFlash] = useState(null);
  const S = useRef({ bubbles: [], score: 0, missed: 0, pops: 0, spawn: 0, id: 0 });

  const level = 1 + Math.floor(pops / 8);

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const dt = 0.05;
    const id = setInterval(() => {
      const s = S.current;
      const lvl = 1 + Math.floor(s.pops / 8);
      const speed = 6 + lvl * 1.6;
      s.spawn += dt * 1000;
      const gap = Math.max(850, 2100 - lvl * 200);
      if (s.spawn >= gap && s.bubbles.length < 12) {
        s.spawn = 0;
        const pool = lvl <= 2 ? LETTERS.home : lvl <= 4 ? [...LETTERS.home, ...LETTERS.top] : LETTERS.all;
        s.id += 1;
        s.bubbles.push({ id: s.id, ch: pool[Math.floor(Math.random() * pool.length)], x: 6 + Math.random() * 84, y: -8, hue: Math.floor(Math.random() * 360) });
      }
      s.bubbles = s.bubbles.map((b) => ({ ...b, y: b.y + speed * dt }));
      const gone = s.bubbles.filter((b) => b.y >= 100).length;
      if (gone) {
        s.missed += gone;
        setMissed(s.missed);
      }
      s.bubbles = s.bubbles.filter((b) => b.y < 100);
      setBubbles(s.bubbles.slice());
      if (s.missed >= 10) {
        setPhase('over');
        onBest(s.score);
      }
    }, dt * 1000);
    return () => clearInterval(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKey = (e) => {
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
      if (soundOn) keyClick();
      const s = S.current;
      const ch = e.key.toLowerCase();
      let target = null;
      for (const b of s.bubbles) if (b.ch === ch && (!target || b.y > target.y)) target = b;
      if (target) {
        s.bubbles = s.bubbles.filter((b) => b.id !== target.id);
        s.pops += 1;
        s.score += 10 + (1 + Math.floor(s.pops / 8)) * 2;
        setPops(s.pops);
        setScore(s.score);
        setBubbles(s.bubbles.slice());
        setFlash({ ok: true, n: s.pops });
      } else {
        setFlash({ ok: false, n: Date.now() });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, soundOn]);

  const start = () => {
    S.current = { bubbles: [], score: 0, missed: 0, pops: 0, spawn: 1200, id: 0 };
    setBubbles([]); setScore(0); setMissed(0); setPops(0); setFlash(null);
    setPhase('play');
  };

  return (
    <GameFrame
      title="Bubble Shooter"
      blurb="Letters float down in bubbles. Type the letter to pop the lowest one. Let 10 bubbles escape and it is over. Every 8 pops the bubbles speed up."
      phase={phase}
      onStart={start}
      onExit={onExit}
      best={best}
      result={`Score ${score}`}
      sub={`You popped ${pops} bubbles at level ${level}. Missed ${missed} of 10.`}
      hud={<><span>Score <b>{score}</b></span><span>Missed <b className="bad-t">{missed}/10</b></span><span>Level <b>{level}</b></span></>}
    >
      <div className="field-play bubble-field" aria-live="off">
        {bubbles.map((b) => (
          <div key={b.id} className="bubble" style={{ left: `${b.x}%`, top: `${b.y}%`, '--h': b.hue }}>{b.ch.toUpperCase()}</div>
        ))}
        {phase === 'play' && <p className="type-hint">Type anywhere</p>}
        {flash && phase === 'play' && <span key={flash.n} className={`flash ${flash.ok ? 'good' : 'bad'}`}>{flash.ok ? 'POP' : 'Miss'}</span>}
      </div>
    </GameFrame>
  );
}
