import React, { useEffect, useRef, useState } from 'react';
import GameFrame from './GameFrame.jsx';
import { tierFor, pick } from './words.js';
import { keyClick } from '../../lib/util.js';

// Your car creeps forward by itself. Each word you type gives it a boost. The rival car gets faster as the race goes on.
export default function Racer({ soundOn, best, onBest, onExit }) {
  const [phase, setPhase] = useState('start');
  const [me, setMe] = useState(0);
  const [ai, setAi] = useState(0);
  const [word, setWord] = useState('');
  const [val, setVal] = useState('');
  const [done, setDone] = useState(0);
  const [result, setResult] = useState('');
  const S = useRef({ me: 0, ai: 0, word: '', done: 0, boost: 0, val: '' });
  const inputRef = useRef(null);

  const level = 1 + Math.floor(done / 5);

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const dt = 0.05;
    const id = setInterval(() => {
      const s = S.current;
      const lvl = 1 + Math.floor(s.done / 5);
      s.me += (1.1 + s.boost) * dt;
      s.boost = Math.max(0, s.boost - dt * 1.2);
      s.ai += (1.4 + lvl * 0.55) * dt;
      if (s.me >= 100 || s.ai >= 100) {
        const won = s.me >= 100 && s.me >= s.ai;
        setResult(won ? 'You won the race!' : 'Rival finished first');
        setPhase('over');
        onBest(s.done);
      }
      setMe(Math.min(100, s.me));
      setAi(Math.min(100, s.ai));
    }, dt * 1000);
    return () => clearInterval(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const newWord = () => {
    const s = S.current;
    s.word = pick(tierFor(Math.min(3, Math.floor(s.done / 5))));
    setWord(s.word);
  };

  const onChange = (e) => {
    const v = e.target.value;
    const s = S.current;
    if (v.length > s.val.length && soundOn) keyClick();
    s.val = v;
    setVal(v);
    if (v.trim().toLowerCase() === s.word) {
      s.me += 2 + s.word.length * 0.35;
      s.boost = Math.min(2.5, s.boost + 1.2);
      s.done += 1;
      s.val = '';
      setVal('');
      setDone(s.done);
      newWord();
    }
  };

  useEffect(() => { if (phase === 'play') inputRef.current?.focus(); }, [phase]);

  const start = () => {
    S.current = { me: 0, ai: 0, word: '', done: 0, boost: 0, val: '' };
    setMe(0); setAi(0); setVal(''); setDone(0);
    newWord();
    setPhase('play');
  };

  return (
    <GameFrame
      title="Typing Racer"
      blurb="Your car moves on its own. Type the word on the track to boost it. Reach the finish line before the rival. The rival speeds up every 5 words."
      phase={phase}
      onStart={start}
      onExit={onExit}
      best={best}
      result={result}
      sub={`Words typed: ${done}. Level ${level}.`}
      hud={<><span>Words <b>{done}</b></span><span>Level <b>{level}</b></span></>}
    >
      <div className="race">
        <div className="road">
          <div className="lane">
            <div className="car you" style={{ left: `${me * 0.86}%` }}><i /></div>
            <span className="lane-tag">You</span>
          </div>
          <div className="lane">
            <div className="car rival" style={{ left: `${ai * 0.86}%` }}><i /></div>
            <span className="lane-tag">Rival</span>
          </div>
          <div className="finish" aria-hidden="true" />
        </div>
        {phase === 'play' && (
          <div className="prompt-box">
            <span className="muted small">Type this word to boost</span>
            <p className="prompt-word">{word}</p>
            <input ref={inputRef} className="game-input" value={val} onChange={onChange} aria-label={`Type ${word}`} autoComplete="off" spellCheck={false} />
          </div>
        )}
      </div>
    </GameFrame>
  );
}
