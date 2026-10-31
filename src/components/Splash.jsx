import React, { useEffect } from 'react';
import TypeHand from './TypeHand.jsx';
import Logo from './Logo.jsx';

// Opening: the F mark reveals first, then the name letter by letter, then two hands type on the keyboard.
// Click or wait to continue.
export default function Splash({ onDone }) {
  useEffect(() => {
    const end = setTimeout(onDone, 7000);
    return () => clearTimeout(end);
  }, [onDone]);

  return (
    <div className="splash" onClick={onDone} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onDone()} aria-label="Continue">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />
      <div className="grid-bg" aria-hidden="true" />
      <div className="splash-inner">
        <div className="splash-logo"><Logo size={170} animated reveal /></div>
        <h1 className="splash-brand" aria-label="Faster">
          {'Faster'.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.95 + i * 0.1}s` }}>{ch}</span>
          ))}
        </h1>
        <p className="splash-kicker">Your faster typing</p>
        <TypeHand big />
        <p className="splash-skip">Tap to continue</p>
      </div>
    </div>
  );
}
