import React, { useState } from 'react';
import Icon from './Icons.jsx';
import BubbleShooter from './games/BubbleShooter.jsx';
import FallingWords from './games/FallingWords.jsx';
import Racer from './games/Racer.jsx';
import TypingTower from './games/TypingTower.jsx';
import FootballGame from './games/FootballGame.jsx';
import MusicGame from './games/MusicGame.jsx';
import GameScene from './GameScene.jsx';

export const GAMES = [
  { id: 'bubble', title: 'Bubble Shooter', tag: 'Pop the letters', cls: 'g-bubble', C: BubbleShooter },
  { id: 'fall', title: 'Falling Words', tag: 'Clear the words', cls: 'g-fall', C: FallingWords },
  { id: 'race', title: 'Typing Racer', tag: 'Race the rival', cls: 'g-race', C: Racer },
  { id: 'tower', title: 'Typing Tower', tag: 'Stack the blocks', cls: 'g-tower', C: TypingTower },
  { id: 'foot', title: 'Football Shots', tag: 'Score the goal', cls: 'g-foot', C: FootballGame },
  { id: 'music', title: 'Word Beats', tag: 'Type to the music', cls: 'g-music', C: MusicGame },
];

// Games menu and the game screen. Best scores are kept per user.
export default function Games({ soundOn, bests, onBest, initial }) {
  const [open, setOpen] = useState(initial || null);
  const game = GAMES.find((g) => g.id === open);

  if (game) {
    const { C } = game;
    return <C soundOn={soundOn} best={bests[game.id]} onBest={(s) => onBest(game.id, s)} onExit={() => setOpen(null)} />;
  }

  return (
    <div className="page-stack">
      <section className="intro-band">
        <p className="kicker">Games</p>
        <h1 className="display">Six games. Every one gets harder.</h1>
        <p className="muted">Each game starts slow and climbs. Keys click as you type, so you can hear your rhythm.</p>
      </section>
      <div className="game-grid">
        {GAMES.map((g) => (
          <button key={g.id} type="button" className={`game-card ${g.cls}`} onClick={() => setOpen(g.id)}>
            <span className="gc-art" aria-hidden="true"><GameScene variant={g.id} /></span>
            <span className="gc-body">
              <span className="pill">{g.tag}</span>
              <h3 className="display">{g.title}</h3>
              <span className="muted small">Best score: {bests[g.id] ?? 0}</span>
              <span className="go">Play <Icon name="next" size={16} /></span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
