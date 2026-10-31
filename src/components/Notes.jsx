import React, { useState } from 'react';
import { shortDay } from '../lib/util.js';

// Notes for every completed course run. Written after a session, saved to that session.
export default function Notes({ attempts, onSave, onPractise }) {
  const [filter, setFilter] = useState('all');
  const list = [...attempts].sort((a, b) => b.at - a.at);
  const shown = filter === 'all' ? list : list.filter((a) => a.courseId === filter);
  const courses = [...new Map(attempts.map((a) => [a.courseId, a.courseTitle])).entries()];

  return (
    <div className="page-stack">
      <section className="intro-band">
        <p className="kicker">Notes</p>
        <h1 className="display">Write what you learned after each course.</h1>
        <p className="muted">Every completed course run gets its own note. Notes save as you leave the box.</p>
      </section>
      {courses.length > 0 && (
        <div className="row gap wrap">
          <button type="button" className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All</button>
          {courses.map(([id, t]) => <button key={id} type="button" className={`chip ${filter === id ? 'on' : ''}`} onClick={() => setFilter(id)}>{t}</button>)}
        </div>
      )}
      {shown.length === 0 ? (
        <section className="panel"><p className="empty">No completed courses yet. Finish one and your note goes here.</p></section>
      ) : (
        <div className="note-grid">
          {shown.map((a) => (
            <NoteCard key={a.id || a.at} a={a} onSave={onSave} onPractise={onPractise} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ a, onSave, onPractise }) {
  const [text, setText] = useState(a.note || '');
  const dirty = text !== (a.note || '');
  return (
    <article className="panel note-card">
      <div className="panel-head">
        <div>
          <h3>{a.courseTitle}</h3>
          <p className="muted small">{shortDay(a.date)} · {a.accuracy}% right · {a.wpm} of 120 · {a.mistakes.length} mistakes</p>
        </div>
        <span className="pill">{a.level}</span>
      </div>
      <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => dirty && onSave(a.id, text)} placeholder="What went well? Which words slowed you down?" aria-label={`Note for ${a.courseTitle}`} />
      <div className="row between">
        <span className="muted small">{dirty ? 'Unsaved changes' : a.note ? 'Saved' : ''}</span>
        <div className="row gap">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPractise(a.courseId)}>Practise again</button>
          <button type="button" className="btn btn-primary btn-sm" disabled={!dirty} onClick={() => onSave(a.id, text)}>Save note</button>
        </div>
      </div>
    </article>
  );
}
