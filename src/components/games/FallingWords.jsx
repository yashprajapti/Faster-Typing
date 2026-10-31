import React, { useEffect, useRef, useState } from 'react';
import GameFrame from './GameFrame.jsx';
import { tierFor, pick } from './words.js';
import { keyClick } from '../../lib/util.js';

// Words fall from the top. Type the full word exactly to clear it. Five escapes and it is over.
export default function FallingWords({ soundOn, best, onBest, onExit }) {
  const [phase, setPhase] = useState('start');
  const [words, setWords] = useState([]);
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [cleared, setCleared] = useState(0);
  const S = useRef({ words: [], score: 0, lives: 5, cleared: 0, spawn: 0, id: 0, val: '' });
  const inputRef = useRef(null);

  const stage = Math.floor(S.current.cleared / 8);

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const dt = 0.05;
    const id = setInterval(() => {
      const s = S.current;
      const st = Math.floor(s.cleared / 8);
      const speed = 5 + st * 1.4;
      const gap = Math.max(1000, 2600 - st * 220);
      s.spawn += dt * 1000;
      if (s.spawn >= gap && s.words.length < 7) {
        s.spawn = 0;
        s.id += 1;
        const text = pick(tierFor(Math.min(3, st >> 0)));
        s.words.push({ id: s.id, text, x: 4 + Math.random() * 74, y: -6 });
      }
      s.words = s.words.map((w) => ({ ...w, y: w.y + speed * dt }));
      const escaped = s.words.filter((w) => w.y >= 100).length;
      if (escaped) {
        s.lives = Math.max(0, s.lives - escaped);
        setLives(s.lives);
      }
      s.words = s.words.filter((w) => w.y < 100);
      setWords(s.words.slice());
      if (s.lives <= 0) {
        setPhase('over');
        onBest(s.score);
      }
    }, dt * 1000);
    return () => clearInterval(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (e) => {
    const v = e.target.value;
    if (v.length > S.current.val.length && soundOn) keyClick();
    S.current.val = v;
    setVal(v);
    const s = S.current;
    const hit = s.words.find((w) => w.text === v.trim().toLowerCase());
    if (hit) {
      s.words = s.words.filter((w) => w.id !== hit.id);
      s.cleared += 1;
      s.score += hit.text.length * 2 + Math.floor(s.cleared / 4) * 5;
      s.val = '';
      setVal('');
      setScore(s.score);
      setCleared(s.cleared);
      setWords(s.words.slice());
    }
  };

  useEffect(() => { if (phase === 'play') inputRef.current?.focus(); }, [phase]);

  const start = () => {
    S.current = { words: [], score: 0, lives: 5, cleared: 0, spawn: 1500, id: 0, val: '' };
    setWords([]); setVal(''); setScore(0); setLives(5); setCleared(0);
    setPhase('play');
  };

  return (
    <GameFrame
      title="Falling Words"
      blurb="Words drop from the top. Type each word exactly and press nothing else. It clears the moment it matches. Let five words hit the bottom and you are out. Words get longer and falling gets faster every 8 clears."
      phase={phase}
      onStart={start}
      onExit={onExit}
      best={best}
      result={`Score ${score}`}
      sub={`You cleared ${cleared} words. Stage ${stage + 1}.`}
      hud={<><span>Score <b>{score}</b></span><span>Lives <b className="bad-t">{'♥'.repeat(lives)}</b></span><span>Cleared <b>{cleared}</b></span><span>Stage <b>{stage + 1}</b></span></>}
    >
      <div className="field-play fall-field">
        {words.map((w) => (
          <div key={w.id} className="fall-word" style={{ left: `${w.x}%`, top: `${w.y}%` }}>{w.text}</div>
        ))}
        <div className="floor" aria-hidden="true" />
      </div>
      {phase === 'play' && (
        <input ref={inputRef} className="game-input" value={val} onChange={onChange} placeholder="Start typing…" aria-label="Type the falling words" autoComplete="off" spellCheck={false} />
      )}
    </GameFrame>
  );
}
