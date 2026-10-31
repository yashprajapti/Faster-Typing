import React, { useEffect, useRef, useState } from 'react';
import GameFrame from './GameFrame.jsx';
import { tierFor, pick } from './words.js';
import { keyClick } from '../../lib/util.js';

// A block swings at the top. Type the word to drop it. Each block must overlap the one below it, or the tower falls.
export default function TypingTower({ soundOn, best, onBest, onExit }) {
  const [phase, setPhase] = useState('start');
  const [blocks, setBlocks] = useState([{ c: 50, w: 60 }]);
  const [sway, setSway] = useState(50);
  const [word, setWord] = useState('');
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('');
  const S = useRef({ blocks: [{ c: 50, w: 60 }], t: 0, word: '', score: 0, val: '', over: false });
  const inputRef = useRef(null);

  const height = blocks.length - 1;

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const dt = 0.05;
    const id = setInterval(() => {
      const s = S.current;
      s.t += dt;
      const top = s.blocks[s.blocks.length - 1];
      const freq = 1.1 + (s.blocks.length - 1) * 0.07;
      const amp = Math.max(8, 40 - (s.blocks.length - 1) * 0.6);
      const x = 50 + Math.sin(s.t * freq) * (amp - top.w / 2 + 10);
      setSway(Math.max(top.w / 2, Math.min(100 - top.w / 2, x)));
    }, dt * 1000);
    return () => clearInterval(id);
  }, [phase]);

  const drop = () => {
    const s = S.current;
    const top = s.blocks[s.blocks.length - 1];
    const x = sway;
    const L = Math.max(x - top.w / 2, top.c - top.w / 2);
    const R = Math.min(x + top.w / 2, top.c + top.w / 2);
    if (R - L < 4) {
      setMsg('The tower fell!');
      s.over = true;
      setPhase('over');
      onBest(s.score);
      return;
    }
    s.blocks = [...s.blocks, { c: (L + R) / 2, w: R - L }];
    s.score += 10 + s.blocks.length;
    setBlocks(s.blocks.slice());
    setScore(s.score);
    setMsg(R - L < top.w * 0.6 ? 'Tight fit. Keep it steady.' : 'Nice drop.');
    s.word = pick(tierFor(Math.min(3, Math.floor((s.blocks.length - 1) / 5))));
    setWord(s.word);
  };

  const onChange = (e) => {
    const v = e.target.value;
    const s = S.current;
    if (v.length > s.val.length && soundOn) keyClick();
    s.val = v;
    setVal(v);
    if (v.trim().toLowerCase() === s.word) {
      s.val = '';
      setVal('');
      drop();
    }
  };

  useEffect(() => { if (phase === 'play') inputRef.current?.focus(); }, [phase]);

  const start = () => {
    S.current = { blocks: [{ c: 50, w: 60 }], t: 0, word: '', score: 0, val: '', over: false };
    setBlocks([{ c: 50, w: 60 }]); setScore(0); setVal(''); setSway(50); setMsg('');
    const w = pick(tierFor(0));
    S.current.word = w;
    setWord(w);
    setPhase('play');
  };

  const top = blocks[blocks.length - 1];
  return (
    <GameFrame
      title="Typing Tower"
      blurb="Type the word to drop the swinging block onto the tower. Each block must sit on the one below it. Words get longer and the swing faster as the tower grows."
      phase={phase}
      onStart={start}
      onExit={onExit}
      best={best}
      result={`Height ${height}`}
      sub={`Score ${score}. ${msg}`}
      hud={<><span>Height <b>{height}</b></span><span>Score <b>{score}</b></span></>}
    >
      <div className="tower-wrap">
        <div className="tower-scene" aria-live="off">
          {phase === 'play' && <div className="swing" style={{ left: `${sway}%`, width: `${top.w}%`, bottom: `${blocks.length * 26 + 10}px` }} />}
          {blocks.map((b, i) => (
            <div key={i} className={`tower-block ${i === 0 ? 'base' : ''}`} style={{ left: `${b.c - b.w / 2}%`, width: `${b.w}%`, bottom: `${i * 26}px` }} />
          ))}
        </div>
        {phase === 'play' && (
          <div className="prompt-box">
            <span className="muted small">Type to drop</span>
            <p className="prompt-word">{word}</p>
            <input ref={inputRef} className="game-input" value={val} onChange={onChange} aria-label={`Type ${word}`} autoComplete="off" spellCheck={false} />
          </div>
        )}
      </div>
    </GameFrame>
  );
}
