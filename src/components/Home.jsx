import React, { useEffect, useState } from 'react';
import Logo from './Logo.jsx';

const RING = ['F', 'A', 'S', 'T', 'E', 'R'];
import Icon from './Icons.jsx';
import { ymd } from '../lib/util.js';
import { JOURNAL, COURSES } from '../data/content.js';

const WORDS = ['faster.', 'sharper.', 'cleaner.', 'unstoppable.'];
const KEYS = ['F', 'A', 'S', 'T'];

// Home: a full-width hero with a rotating headline, keycaps that follow the pointer, and quick entry points.
export default function Home({ name, attempts, go, startCourse, startGame }) {
  const [wi, setWi] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const id = setInterval(() => setWi((i) => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(id);
  }, []);

  const today = attempts.filter((a) => a.date === ymd()).length;
  const avgAcc = attempts.length ? Math.round((attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length) * 10) / 10 : null;
  const bestWpm = attempts.length ? Math.max(...attempts.map((a) => a.wpm)) : null;
  const last = [...attempts].sort((a, b) => b.at - a.at)[0];

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
  };

  return (
    <div className="home">
      <section className="hero" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
        <div className="hero-bg" aria-hidden="true">
          <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
          <span className="ring r1" /><span className="ring r2" />
        </div>
        <div className="hero-copy">
          <p className="badge"><Icon name="bolt" size={14} /> Level up your fingers</p>
          <h1 className="hero-title display">
            Type <span className="grad">{WORDS[wi]}</span>
            <span key={wi} className="swap-line" aria-hidden="true" />
          </h1>
          <p className="hero-sub">Hi {name}. Listen, type, and move on only when it is exactly right. Four games and typing warm-ups, all in one place.</p>
          <div className="row gap wrap">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => go('journal')}><Icon name="play" size={16} /> Start typing</button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => go('games')}><Icon name="games" size={18} /> Play games</button>
          </div>
        </div>
        <div className="hero-art" style={{ '--tx': tilt.x, '--ty': tilt.y }} aria-hidden="true">
          <div className="keyboard-glow" />
          <div className="tile-stage">
            <div className="run-wrap"><Logo size={140} reveal running /></div>
            <div className="key-row">
              {RING.map((l, i) => (
                <span key={l} className="keytile" style={{ animationDelay: `${i * 0.12}s` }}>
                  <span className="keytile-face" style={{ animationDelay: `${i * 0.35}s` }}>{l}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <Stat label="Sessions today" value={today} />
        <Stat label="Average accuracy" value={avgAcc === null ? '–' : `${avgAcc}%`} />
        <Stat label="Best speed" value={bestWpm === null ? '–' : `${bestWpm} of 120`} />
        <Stat label="Courses" value={JOURNAL.length + COURSES.length} />
      </div>

      <div className="two-col">
        <section className="panel pick-card" onClick={() => last && startCourse(last.courseId)} role={last ? 'button' : undefined} tabIndex={last ? 0 : undefined}>
          <p className="kicker">Pick up where you left off</p>
          {last ? (
            <>
              <h3 className="display">{last.courseTitle}</h3>
              <p className="muted small">{last.accuracy}% right · {last.wpm} of 120 · {last.mistakes.length} mistakes</p>
              <span className="go">Practise again <Icon name="next" size={16} /></span>
            </>
          ) : (
            <>
              <h3 className="display">Your first course is waiting.</h3>
              <button type="button" className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); go('journal'); }}>Open warm-ups</button>
            </>
          )}
        </section>
        <section className="panel">
          <p className="kicker">Quick games</p>
          <div className="mini-games">
            {[['bubble', 'Bubble Shooter'], ['fall', 'Falling Words'], ['race', 'Typing Racer'], ['tower', 'Typing Tower'], ['foot', 'Football Shots'], ['music', 'Word Beats']].map(([id, t]) => (
              <button key={id} type="button" className={`mini-game g-${id}`} onClick={() => startGame(id)}>{t}</button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="tile">
      <span className="tile-label">{label}</span>
      <strong className="tile-value">{value}</strong>
    </div>
  );
}
