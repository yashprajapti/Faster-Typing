import React, { useEffect, useRef, useState } from 'react';
import GameFrame from './GameFrame.jsx';
import { tierFor, pick } from './words.js';
import { keyClick } from '../../lib/util.js';
import { SONGS, parseYouTubeId, ensurePlayer, playVideo, resumeVideo, pauseVideo } from '../../lib/yt.js';

const LANES = [22, 50, 78];
const levelOf = (score) => 1 + Math.floor(score / 120);

// Pick a song, press start, and type the words that stream in with the beat. The game ends when the full song ends or six words are missed.
export default function MusicGame({ soundOn, best, onBest, onExit }) {
  const [phase, setPhase] = useState('start');
  const [words, setWords] = useState([]);
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [source, setSource] = useState(null); // { kind: 'yt', id, title } | { kind: 'file', url, title }
  const [playing, setPlaying] = useState(false);
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const audio = useRef(null);
  const inputRef = useRef(null);
  const phaseRef = useRef('start');
  const scoreRef = useRef(0);
  const onBestRef = useRef(onBest);
  onBestRef.current = onBest;
  const S = useRef({ words: [], score: 0, misses: 0, spawn: 0, id: 0 });
  const level = levelOf(score);

  const pauseAll = () => { pauseVideo(); audio.current?.pause(); };

  // The song ending is the end of the game: the player sees the whole song from start to finish.
  const finishSong = () => {
    if (phaseRef.current !== 'play') return;
    phaseRef.current = 'over';
    setPhase('over');
    setPlaying(false);
    onBestRef.current(scoreRef.current);
  };

  useEffect(() => {
    ensurePlayer({
      onState: (code) => {
        if (code === 1) setPlaying(true);
        if (code === 2) setPlaying(false);
        if (code === 0) finishSong();
      },
    }).catch(() => setNote('YouTube could not load. Check your connection, or pick an mp3 from your computer.'));
    return () => pauseAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    phaseRef.current = phase;
    if (phase !== 'play') pauseAll();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const dt = 0.05;
    const id = setInterval(() => {
      const s = S.current;
      const lvl = levelOf(s.score);
      const gap = Math.max(850, 2000 - (lvl - 1) * 170);
      const speed = 9 + (lvl - 1) * 2.2;
      s.spawn += dt * 1000;
      if (s.spawn >= gap && s.words.length < 6) {
        s.spawn = 0;
        s.id += 1;
        s.words.push({ id: s.id, text: pick(tierFor(Math.min(3, lvl - 1))), x: 100, lane: LANES[s.id % 3] });
      }
      s.words = s.words.map((w) => ({ ...w, x: w.x - speed * dt }));
      const lost = s.words.filter((w) => w.x <= 0).length;
      if (lost) { s.misses += lost; setMisses(s.misses); }
      s.words = s.words.filter((w) => w.x > 0);
      setWords(s.words.slice());
      if (s.misses >= 6) {
        phaseRef.current = 'over';
        setPhase('over');
        onBestRef.current(s.score);
      }
    }, dt * 1000);
    return () => clearInterval(id);
  }, [phase]);

  const chooseSong = (song) => {
    audio.current?.pause();
    setSource({ kind: 'yt', id: song.id, title: song.title });
    setNote('');
    playVideo(song.id);
    setPlaying(true);
  };

  const onFile = (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    pauseVideo();
    setSource({ kind: 'file', url: URL.createObjectURL(f), title: f.name });
    setNote('');
    setTimeout(() => { audio.current?.play().catch(() => {}); }, 60);
  };

  const useLink = () => {
    const id = parseYouTubeId(link);
    if (!id) { setNote('That does not look like a YouTube link.'); return; }
    chooseSong({ id, title: 'Your link' });
  };

  const togglePlay = () => {
    if (!source) return;
    if (source.kind === 'yt') {
      if (playing) pauseVideo(); else resumeVideo();
      setPlaying(!playing);
    } else if (audio.current) {
      if (audio.current.paused) audio.current.play().catch(() => {}); else audio.current.pause();
    }
  };

  const start = () => {
    if (!source) { setNote('Pick a song first. Tap any song below, or choose an mp3.'); return; }
    S.current = { words: [], score: 0, misses: 0, spawn: 0, id: 0 };
    scoreRef.current = 0;
    setWords([]); setScore(0); setMisses(0); setVal('');
    phaseRef.current = 'play';
    setPhase('play');
    if (source.kind === 'yt') playVideo(source.id);
    else if (audio.current) { audio.current.currentTime = 0; audio.current.play().catch(() => {}); }
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onChange = (e) => {
    const v = e.target.value;
    if (v.length > val.length && soundOn) keyClick();
    setVal(v);
    if (phase !== 'play') return;
    const s = S.current;
    const hit = s.words.find((w) => w.text === v.trim().toLowerCase());
    if (hit) {
      s.words = s.words.filter((w) => w.id !== hit.id);
      s.score += hit.text.length * 3;
      scoreRef.current = s.score;
      setScore(s.score);
      setWords(s.words.slice());
      setVal('');
    }
  };

  return (
    <GameFrame
      title="Word Beats"
      blurb="Pick a song, press start, and type the words that stream in with the beat. The full song plays from start to end."
      phase={phase}
      onStart={start}
      onExit={onExit}
      best={best}
      hud={<><span>Score <b>{score}</b></span><span>Misses <b>{misses}/6</b></span><span>Level <b>{level}</b></span></>}
      result={`Score ${score}`}
      sub={misses >= 6 ? 'Six words missed. Try again and keep up with the beat.' : 'The song finished. Nice run.'}
    >
      <div className="music-wrap">
        <div className="music-panel">
          <p className="kicker">Pick a song</p>
          <div className="song-grid">
            {SONGS.map((s) => {
              const on = source?.kind === 'yt' && source.id === s.id;
              return (
                <button key={s.id} type="button" className={`song-btn ${on ? 'on' : ''}`} onClick={() => chooseSong(s)}>
                  {on && playing ? <span className="eq-mini" aria-hidden="true"><i /><i /><i /></span> : null}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>
          <div className="src-row">
            <label className="btn btn-ghost btn-sm file-btn">Choose mp3<input type="file" accept="audio/*" onChange={onFile} /></label>
            <input className="link-in" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Or paste a YouTube link" aria-label="YouTube link" />
            <button type="button" className="btn btn-ghost btn-sm" onClick={useLink}>Use link</button>
          </div>
          <div className="now-row">
            <button type="button" className="btn btn-primary btn-sm" disabled={!source} onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
            <span className="now">{source ? `Now: ${source.title}` : 'No song selected yet'}</span>
          </div>
          {note && <p className="error small">{note}</p>}
          <audio ref={audio} src={source?.kind === 'file' ? source.url : undefined} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={finishSong} preload="auto" />
        </div>
        <div className="beat-lane">
          <div className="beat-line" aria-hidden="true" />
          {words.map((w) => (
            <span key={w.id} className="beat-word" style={{ left: `${w.x}%`, top: `${w.lane}%` }}>{w.text}</span>
          ))}
        </div>
        <input
          ref={inputRef}
          className="game-input"
          value={val}
          onChange={onChange}
          disabled={phase !== 'play'}
          placeholder="type the word on the beat"
          autoComplete="off"
          spellCheck={false}
          aria-label="Type the word on the beat"
        />
      </div>
    </GameFrame>
  );
}
