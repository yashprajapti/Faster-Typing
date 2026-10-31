import React, { useMemo, useState } from 'react';
import { shortDay } from '../lib/util.js';
import { wrongWords } from '../lib/diff.js';
import Letters from './Letters.jsx';

// Every wrong word, shown next to the word it should have been, letter by letter.
export default function Mistakes({ attempts, onPractice }) {
  const [course, setCourse] = useState('all');
  const [q, setQ] = useState('');
  const courses = useMemo(() => [...new Map(attempts.map((a) => [a.courseId, a.courseTitle])).entries()], [attempts]);
  const all = useMemo(() => attempts.flatMap((a) => (a.mistakes || []).flatMap((m) => wrongWords(m.target, m.typed).map((r) => ({
    ...r, target: m.target, courseId: a.courseId, course: a.courseTitle, date: a.date, at: a.at,
  })))), [attempts]);
  const shown = all.filter((m) => (course === 'all' || m.courseId === course)
    && (!q || m.exp.toLowerCase().includes(q.toLowerCase()) || m.got.toLowerCase().includes(q.toLowerCase())));
  const top = useMemo(() => {
    const map = {};
    for (const m of all) map[m.exp] = (map[m.exp] || 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [all]);

  return (
    <div className="page-stack">
      <div className="mistake-head">
        <div className="stats-grid mistake-stats">
          <div className="tile bad"><span className="tile-label">Wrong words</span><strong className="tile-value">{all.length}</strong><span className="tile-hint">Each word you typed wrongly</span></div>
          <div className="tile"><span className="tile-label">Different words missed</span><strong className="tile-value">{top.length}</strong></div>
          <div className="tile"><span className="tile-label">Missed most</span><strong className="tile-value small-v">{top[0] ? top[0][0] : '–'}</strong><span className="tile-hint">{top[0] ? `${top[0][1]} times` : ''}</span></div>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head"><h3>Words you miss most</h3><span className="muted small">Retype these slowly, then practise the course</span></div>
        {top.length === 0 ? <p className="empty">No wrong words yet. Clean runs show no mistakes here.</p> : (
          <div className="chip-cloud">
            {top.map(([w, n]) => <span key={w} className="miss-chip"><b>{w}</b><em>{n}×</em></span>)}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head filters">
          <h3>All wrong words</h3>
          <div className="row gap wrap">
            <select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Filter by course">
              <option value="all">All courses</option>
              {courses.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
            </select>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search word…" aria-label="Search mistakes" />
          </div>
        </div>
        <p className="muted small mk-note">Red letters are the ones that did not match. A red gap means a letter was left out.</p>
        {shown.length === 0 ? <p className="empty">Nothing matches. Try another filter.</p> : (
          <ul className="mistake-list">
            {[...shown].sort((a, b) => b.at - a.at).slice(0, 200).map((m, i) => (
              <li key={i} className="mk-row">
                <div className="mk-words">
                  <span className="rec-tag">Should be</span><span className="rec-word"><Letters marks={m.letters.exp} /></span>
                  <span className="rec-tag got">You typed</span><span className="rec-word"><Letters marks={m.letters.got} empty="(nothing)" /></span>
                </div>
                <span className="muted small">{m.course} · {shortDay(m.date)}</span>
                {m.courseId && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPractice(m.courseId)}>Practise</button>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
