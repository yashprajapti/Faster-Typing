import React, { useEffect, useRef, useState } from 'react';
import { signUp, signIn, USERNAME_RULE } from '../lib/cloud.js';
import { supabaseReady } from '../lib/supabase.js';
import Icon from './Icons.jsx';
import TryIt from './TryIt.jsx';
import LoginLogo from './LoginLogo.jsx';

const INTRO = [
  { icon: 'courses', title: 'Courses', text: '20 courses, from beginner to advanced. Every word and sentence is read aloud once, then you type it.' },
  { icon: 'games', title: 'Six games', text: 'Bubble Shooter, Falling Words, Typing Racer, Typing Tower, Football Shots and Word Beats. Each one starts easy and climbs.' },
  { icon: 'analysis', title: 'Learning analysis', text: 'Your speed on a gauge in words per minute, genuine accuracy from every key, a yearly heatmap and your personal best.' },
  { icon: 'notes', title: 'Notes and mistakes', text: 'Write notes for every course you finish, and review each missed word with the one to practise next.' },
  { icon: 'sound', title: 'Songs while you type', text: '30 songs in Word Beats. Pick one to play, or play your own mp3. Only the music plays, never a video.' },
];

// Scroll reveal: each card fades up when it enters the screen.
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${on ? 'on' : ''}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

// Accounts live in Supabase Auth; progress is saved in the app_data table for each account.
export default function Login({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [display, setDisplay] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const u = user.trim().toLowerCase();
    if (!supabaseReady) return setErr('Supabase is not connected yet. Add the keys in .env (see the setup steps).');
    if (!USERNAME_RULE.test(u)) return setErr('Username: 3 to 20 letters, numbers or underscores.');
    if (pass.length < 6) return setErr('Password needs at least 6 characters.');
    setBusy(true);
    try {
      const session = mode === 'register'
        ? await signUp(u, display.trim() || u, pass)
        : await signIn(u, pass);
      if (!session) return setErr('Account created. Ask the owner to turn off email confirmation in Supabase (see the setup steps).');
      await onAuthed(session);
    } catch (ex) {
      setErr(ex.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m) => { setMode(m); setErr(''); };

  return (
    <div className="auth-page">
      <section className="intro-black">
        <div className="grid-bg" aria-hidden="true" />
        <div className="orb orb-a" aria-hidden="true" />
        <div className="orb orb-b" aria-hidden="true" />
        <div className="intro-inner">
          <p className="kicker">Welcome to Faster</p>
          <h2 className="intro-h">Listen. Type. Move on only when it is exactly right.</h2>
          <LoginLogo />
          <p className="intro-sub">Here is what you get, all in one place.</p>
          <div className="intro-grid">
            {INTRO.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <article className="intro-card">
                  <span className="ic-wrap"><Icon name={f.icon} size={22} /></span>
                  <h3 className="display">{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="try-sec">
        <TryIt soundOn />
      </section>

      <section className="login-sec">
        <form className="auth-card" onSubmit={submit}>
          <h1 className="auth-title">{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1>
          <p className="muted small">Your progress and analysis are saved to your account.</p>
          <div className="seg" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Log in</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'on' : ''} onClick={() => switchMode('register')}>Register</button>
          </div>
          {mode === 'register' && (
            <label className="field"><span>Your name</span><input value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="e.g. Alex" /></label>
          )}
          <label className="field"><span>Username</span><input value={user} onChange={(e) => setUser(e.target.value)} placeholder="e.g. alex01" autoComplete="username" /></label>
          <label className="field"><span>Password</span><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
      </section>
    </div>
  );
}
