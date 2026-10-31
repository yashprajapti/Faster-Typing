import React from 'react';
import Icon from '../Icons.jsx';
import GameScene from '../GameScene.jsx';

// Each game gets its own illustrated wallpaper and its own animated arena backdrop.
const VARIANTS = {
  'Bubble Shooter': 'bubble',
  'Falling Words': 'fall',
  'Typing Racer': 'race',
  'Typing Tower': 'tower',
  'Football Shots': 'foot',
  'Word Beats': 'music',
};

export default function GameFrame({ title, blurb, phase, onStart, onExit, hud, best, children, result, sub }) {
  const variant = VARIANTS[title] || 'bubble';
  return (
    <div className="game">
      <div className="game-wall" aria-hidden="true"><GameScene variant={variant} /></div>
      <div className="game-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}><Icon name="back" size={16} /> Games</button>
        <h2 className="game-title display">{title}</h2>
        <span className="muted small">Best: {best ?? 0}</span>
      </div>
      {phase === 'play' && hud && <div className="hud">{hud}</div>}
      <div className={`arena ${phase}`}>
        <div className={`backdrop bd-${variant}`} aria-hidden="true">
          {variant === 'music' && Array.from({ length: 28 }, (_, i) => (
            <i key={i} style={{ '--d': `${(i * 0.07).toFixed(2)}s`, '--h': `${22 + ((i * 53) % 68)}%` }} />
          ))}
          {variant === 'bubble' && Array.from({ length: 9 }, (_, i) => (
            <i key={i} className="rise" style={{ left: `${6 + i * 10.5}%`, '--d': `${(i * 0.9) % 4}s`, '--s': `${26 + (i % 4) * 10}px` }} />
          ))}
          {variant === 'tower' && <span className="crane"><i /></span>}
        </div>
        {children}
        {phase === 'start' && (
          <div className="overlay-card">
            <p className="kicker">Get ready</p>
            <h3 className="display">{title}</h3>
            <p className="muted">{blurb}</p>
            <button type="button" className="btn btn-primary" onClick={onStart}><Icon name="play" size={16} /> Start game</button>
          </div>
        )}
        {phase === 'over' && (
          <div className="overlay-card">
            <p className="kicker">Game over</p>
            <h3 className="display">{result}</h3>
            {sub && <p className="muted">{sub}</p>}
            <div className="row gap">
              <button type="button" className="btn btn-primary" onClick={onStart}>Play again</button>
              <button type="button" className="btn btn-ghost" onClick={onExit}>Back to games</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
