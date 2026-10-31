import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase.js';
import { getProfile, loadData, saveData, signOut } from './lib/cloud.js';
import { ymd, uid, stopSpeech } from './lib/util.js';
import { JOURNAL, COURSES, courseById } from './data/content.js';
import Splash from './components/Splash.jsx';
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';
import Courses from './components/Courses.jsx';
import Practice from './components/Practice.jsx';
import Analysis from './components/Analysis.jsx';
import Mistakes from './components/Mistakes.jsx';
import Notes from './components/Notes.jsx';
import Games from './components/Games.jsx';
import Icon from './components/Icons.jsx';
import Logo from './components/Logo.jsx';

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'journal', label: 'Typing Warm-Ups', icon: 'journal' },
  { id: 'courses', label: 'Courses', icon: 'courses' },
  { id: 'games', label: 'Games', icon: 'games' },
  { id: 'analysis', label: 'Learning analysis', icon: 'analysis' },
  { id: 'notes', label: 'Notes', icon: 'notes' },
  { id: 'mistakes', label: 'Mistakes', icon: 'mistakes' },
];
const MOBILE = { analysis: 'Analysis', mistakes: 'Mistakes', courses: 'Courses', journal: 'Warm-Ups', games: 'Games', notes: 'Notes', home: 'Home' };
const TITLES = Object.fromEntries(NAV.map((n) => [n.id, n.label]));

const EMPTY = { attempts: [], bests: {}, sound: true, theme: 'dark' };

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [profile, setProfile] = useState(null);
  const [db, setDb] = useState(EMPTY);
  const [dataReady, setDataReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState('home');
  const [tick, setTick] = useState(0);
  const [courseId, setCourseId] = useState(null);
  const [gameStart, setGameStart] = useState(null);
  const [runKey, setRunKey] = useState(0);

  const persist = useCallback((next) => setDb(next), []);
  const onSplashDone = useCallback(() => setShowSplash(false), []);
  const theme = db.theme || 'dark';
  const me = session ? session.user.id : null;
  const myName = profile ? profile.display_name || profile.username : '';

  const loadAccount = useCallback(async (user) => {
    const [prof, data] = await Promise.all([getProfile(user.id), loadData(user.id)]);
    setProfile(prof);
    setDb({ ...EMPTY, ...data });
    setDataReady(true);
  }, []);

  // On start: restore the Supabase session if there is one, and react to login/logout.
  useEffect(() => {
    if (!supabase) { setSession(null); return undefined; }
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      let ok = Boolean(data.session);
      if (data.session) {
        try { await loadAccount(data.session.user); } catch { ok = false; }
      }
      if (alive) setSession(ok ? data.session : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) { setSession(null); setProfile(null); setDataReady(false); setDb(EMPTY); }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [loadAccount]);

  // Save this account's progress to Supabase shortly after each change.
  useEffect(() => {
    if (!me || !dataReady) return undefined;
    const t = setTimeout(() => {
      saveData(me, db).catch((e) => console.error('Could not save progress:', e.message));
    }, 500);
    return () => clearTimeout(t);
  }, [db, me, dataReady]);

  const onAuthed = async (s) => {
    await loadAccount(s.user);
    setSession(s);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F4F6FF' : '#060912');
  }, [theme]);

  const mine = useMemo(() => db.attempts.filter((a) => a.user === me), [db.attempts, me]);
  const myBests = db.bests || {};

  const addAttempt = (summary) => {
    const rec = { ...summary, id: uid(), user: me, date: ymd(), at: Date.now(), note: '' };
    persist({ ...db, attempts: [...db.attempts, rec] });
  };
  const saveNote = (id, note) => persist({ ...db, attempts: db.attempts.map((a) => (a.id === id ? { ...a, note } : a)) });
  const onGameBest = (gameId, score) => {
    const cur = myBests[gameId] || 0;
    if (score <= cur) return;
    persist({ ...db, bests: { ...myBests, [gameId]: score } });
  };

  const logout = () => { stopSpeech(); setCourseId(null); setGameStart(null); setPage('home'); signOut(); };
  const toggleSound = () => persist({ ...db, sound: !db.sound });
  const toggleTheme = () => persist({ ...db, theme: theme === 'dark' ? 'light' : 'dark' });

  if (showSplash) return <Splash onDone={onSplashDone} />;
  if (session === undefined) return <div className="auth-page"><p className="muted" style={{ padding: 40 }}>Loading…</p></div>;
  if (!session) return <Login onAuthed={onAuthed} />;

  const course = courseId ? courseById(courseId) : null;
  const go = (p) => { stopSpeech(); setCourseId(null); setGameStart(null); setPage(p); setTick((t) => t + 1); window.scrollTo({ top: 0 }); };
  const startCourse = (id) => { setRunKey((k) => k + 1); setCourseId(id); window.scrollTo({ top: 0 }); };
  const startGame = (id) => { setGameStart(id); setPage('games'); window.scrollTo({ top: 0 }); };

  let body;
  if (course) {
    body = (
      <Practice key={`${course.id}-${runKey}`} course={course} soundOn={db.sound} onFinish={addAttempt}
        onExit={() => setCourseId(null)} onAgain={() => startCourse(course.id)} />
    );
  } else if (page === 'journal') body = <Courses section="journal" onPick={startCourse} />;
  else if (page === 'courses') body = <Courses section="courses" onPick={startCourse} />;
  else if (page === 'games') body = <Games soundOn={db.sound} bests={myBests} onBest={onGameBest} initial={gameStart} key={`${gameStart || 'menu'}-${tick}`} />;
  else if (page === 'analysis') body = <Analysis attempts={mine} name={myName} onPractise={() => go('journal')} />;
  else if (page === 'notes') body = <Notes attempts={mine} onSave={saveNote} onPractise={startCourse} />;
  else if (page === 'mistakes') body = <Mistakes attempts={mine} onPractice={startCourse} />;
  else body = <Home name={myName} attempts={mine} go={go} startCourse={startCourse} startGame={startGame} />;

  const showTop = !course && page !== 'home' && page !== 'games';

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo size={40} />
          <div><strong>Faster</strong><span className="muted small">Your faster typing</span></div>
        </div>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <button key={n.id} type="button" className={`nav-btn ${page === n.id && !course ? 'on' : ''}`} onClick={() => go(n.id)}>
              <Icon name={n.icon} size={18} /><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={toggleTheme} aria-label="Switch theme">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} /> {theme === 'dark' ? 'Light theme' : 'Dark theme'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={toggleSound} aria-pressed={db.sound}>
            <Icon name={db.sound ? 'sound' : 'mute'} size={16} /> Typing sound {db.sound ? 'on' : 'off'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={logout}><Icon name="logout" size={16} /> Log out</button>
          <span className="muted small">Signed in as {myName}</span>
        </div>
      </aside>

      <main className={`main ${page === 'home' && !course ? 'main-home' : ''}`}>
        {showTop && (
          <header className="topbar">
            <h2 className="page-title display">{TITLES[page]}</h2>
          </header>
        )}
        {body}
      </main>

      {!course && (
        <nav className="mobile-nav" aria-label="Mobile">
          {NAV.map((n) => (
            <button key={n.id} type="button" className={page === n.id ? 'on' : ''} onClick={() => go(n.id)} aria-label={n.label}>
              <Icon name={n.icon} size={20} /><span>{MOBILE[n.id] || n.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
