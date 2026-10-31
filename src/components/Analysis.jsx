import React, { useMemo, useState } from 'react';
import { ymd, shortDay } from '../lib/util.js';
import { windowFor, datesBetween, minutesOf, avgOf, minutesByDay, speedBand, pad, monthKey } from '../lib/stats.js';
import Gauge from './Gauge.jsx';
import Ring from './Ring.jsx';
import Letters from './Letters.jsx';
import ShareModal from './ShareCard.jsx';
import { compareWords, wrongWords } from '../lib/diff.js';
import { same } from '../lib/util.js';

const PERIODS = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Heat level from minutes practised that day.
const level = (m) => (!m ? 0 : m < 15 ? 1 : m < 30 ? 2 : m < 60 ? 3 : 4);
const LEVEL_LABEL = ['No study time', 'Under 15 min', '15–30 min', '30–60 min', '60+ min'];
const fmtMin = (m) => (m < 1 ? `${Math.round(m * 60)} sec` : `${Math.round(m)} min`);
const mondayIndex = (d) => (new Date(`${d}T00:00`).getDay() + 6) % 7;

export default function Analysis({ attempts, onPractise, name = '' }) {
  const [period, setPeriod] = useState('week');
  const [offset, setOffset] = useState(0);
  const thisYear = new Date().getFullYear();
  const years = useMemo(() => {
    const ys = new Set([thisYear, ...attempts.map((a) => Number(a.date.slice(0, 4)))]);
    return [...ys].sort((a, b) => b - a);
  }, [attempts, thisYear]);
  const [year, setYear] = useState(thisYear);
  const [perf, setPerf] = useState('speed');
  const [selDay, setSelDay] = useState(null);
  const [openId, setOpenId] = useState(null);
  const openSession = openId ? attempts.find((a) => a.id === openId) : null;
  const [cardOpen, setCardOpen] = useState(false);

  const win = windowFor(period, offset, year);
  const list = useMemo(() => attempts.filter((a) => a.date >= win.from && a.date <= win.to), [attempts, win.from, win.to]);
  const days = useMemo(() => datesBetween(win.from, win.to), [win.from, win.to]);
  const minsDay = useMemo(() => minutesByDay(list), [list]);
  const sessions = list.length;
  const accuracy = avgOf(list, 'accuracy');
  const speed = avgOf(list, 'wpm');
  const items = list.reduce((s, a) => s + a.completed, 0);
  const firstTry = list.reduce((s, a) => s + a.firstTry, 0);
  const mistakes = list.reduce((s, a) => s + a.mistakes.length, 0);
  const keys = list.reduce((s, a) => s + a.keystrokes, 0);
  const errs = list.reduce((s, a) => s + a.errors, 0);
  const minutes = minutesOf(list);
  const genuine = keys ? Math.round(((keys - errs) / keys) * 1000) / 10 : null;
  const band = speed === null ? null : speedBand(speed);
  const wpmRuns = list.filter((a) => a.wpm > 0).sort((a, b) => a.at - b.at);
  const bestWpm = wpmRuns.length ? Math.max(...wpmRuns.map((a) => a.wpm)) : null;
  const trend = wpmRuns.slice(-10);
  const rangeText = period === 'year' ? `${year}` : period === 'month' ? `${MONTHS[new Date(`${win.from}T00:00`).getMonth()]} ${win.year}` : `${shortDay(win.from)} – ${shortDay(win.to)}`;
  const onChangePeriod = (p) => { setPeriod(p); setOffset(0); setSelDay(null); };
  const onDayClick = (d) => setSelDay(selDay === d ? null : d);
  const detailDay = period === 'day' ? win.from : selDay;
  const detail = detailDay ? attempts.filter((a) => a.date === detailDay) : [];

  // Built from the period and data on screen, so the card always matches what is shown.
  const buildCard = () => {
    const counts = {};
    list.forEach((a) => (a.mistakes || []).forEach((m) => wrongWords(m.target, m.typed).forEach((r) => {
      if (r.exp) counts[r.exp] = (counts[r.exp] || 0) + 1;
    })));
    const top = Object.entries(counts).sort((x, y) => y[1] - x[1])[0];
    let chart;
    if (period === 'day') {
      const runs = [...list].sort((x, y) => x.at - y.at);
      chart = { title: 'Speed in each session (out of 120)', labels: runs.map((_, i) => `${i + 1}`), values: runs.map((a) => a.wpm || 0), max: 120 };
    } else if (period === 'week') {
      chart = { title: 'Minutes practised each day', labels: days.map((d) => WEEKDAYS[mondayIndex(d)]), values: days.map((d) => minsDay[d] || 0) };
    } else if (period === 'month') {
      chart = { title: 'Minutes practised each day', labels: days.map((d) => `${Number(d.slice(8))}`), values: days.map((d) => minsDay[d] || 0) };
    } else {
      chart = { title: `Minutes practised each month in ${year}`, labels: MONTHS, values: MONTHS.map((_, i) => minutesOf(attempts.filter((a) => a.date.startsWith(monthKey(year, i))))) };
    }
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const range = period === 'day' ? shortDay(win.from) : rangeText;
    return {
      name: name || 'Typist',
      periodLabel: { day: 'Day', week: 'Week', month: 'Month', year: 'Year' }[period],
      rangeText: range,
      fileTag: `${period}-${range.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}`,
      speed,
      speedBand: band ? band.label : 'No data yet',
      accuracy: genuine ?? accuracy,
      sessions,
      items,
      mistakes,
      time: fmtMin(minutes),
      best: bestWpm,
      chart,
      topMiss: top ? { word: top[0], count: top[1] } : null,
      dateText: `Made ${today}`,
    };
  };
  const card = useMemo(() => (cardOpen ? buildCard() : null), [cardOpen, period, year, win.from, list, attempts, name]);

  return (
    <div className="page-stack an">
      <div className="an-top">
        <div className="seg" role="tablist" aria-label="Period">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={period === p.id} className={period === p.id ? 'on' : ''} onClick={() => onChangePeriod(p.id)}>{p.label}</button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm share-btn" onClick={() => setCardOpen(true)} disabled={!sessions}>Download card</button>
        {period === 'year' ? (
          <label className="year-pick"><span className="muted small">Year</span>
            <select value={year} onChange={(e) => { setYear(Number(e.target.value)); setSelDay(null); }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        ) : (
          <div className="row gap">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOffset(offset + 1); setSelDay(null); }}>← Earlier</button>
            <span className="range">{rangeText}{offset === 0 ? ' · now' : ''}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={offset === 0} onClick={() => { setOffset(Math.max(0, offset - 1)); setSelDay(null); }}>Later →</button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <Tile label="Sessions" value={sessions} />
        <Tile label="Accuracy" value={accuracy === null ? '–' : `${genuine ?? accuracy}%`} tone={genuine !== null && genuine >= 95 ? 'good' : ''} hint="correct keys ÷ all keys" />
        <Tile label="Speed" value={speed === null ? '–' : `${speed}`} hint={band ? band.label : ''} />
        <Tile label="Items done" value={items} hint={`${firstTry} first try`} />
        <Tile label="Mistakes" value={mistakes} tone={mistakes ? 'bad' : ''} />
        <Tile label="Time" value={fmtMin(minutes)} />
      </div>

      <div className="two-col">
        <section className="panel speed-card">
          <div className="panel-head"><h3>Typing speed</h3><span className="muted small">Out of 120, the top speed</span></div>
          <div className="speed-row">
            <Gauge value={speed || 0} best={bestWpm} />
            <div className="speed-txt">
              <span className="pill">{band ? band.label : 'No data yet'}</span>
              <p className="muted">{band ? band.note : 'Finish a course to see your speed.'}</p>
              <p className="small muted">Speed is how fast you type. The gauge goes up to 120, which is the top speed.</p>
              {trend.length > 0 && (
                <div className="wpm-trend" aria-label="Speed for recent sessions">
                  <div className="trend-head"><span>Last {trend.length} session{trend.length === 1 ? '' : 's'}</span><strong>Best {bestWpm} of 120</strong></div>
                  <div className="trend-bars">{trend.map((a) => <span key={a.id} title={`${a.wpm} of 120`}><i style={{ height: `${Math.max(6, Math.min(100, (a.wpm / 120) * 100))}%` }} /><b>{a.wpm}</b></span>)}</div>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="panel acc-card">
          <div className="panel-head"><h3>Accuracy</h3><span className="muted small">Out of every 100 keys you press, how many were right</span></div>
          <div className="acc-row">
            <Ring pct={genuine ?? 0} label="accuracy" stroke="var(--good)" />
            <ul className="acc-list">
              <li><span>Keys pressed</span><strong>{keys}</strong></li>
              <li><span>Wrong keys</span><strong className={errs ? 'bad-t' : ''}>{errs}</strong></li>
              <li><span>Items right first try</span><strong>{items ? Math.round((firstTry / items) * 100) : 0}%</strong></li>
            </ul>
          </div>
        </section>
      </div>

      {period === 'day' && (
        <section className="panel">
          <div className="panel-head"><h3>Sessions on {shortDay(win.from)}</h3><span className="muted small">{fmtMin(minutes)} practised</span></div>
          <SessionList onOpen={setOpenId} list={detail.length ? detail : list} />
        </section>
      )}

      {period === 'week' && (
        <section className="panel">
          <div className="panel-head"><h3>This week</h3><span className="muted small">Tap a day to see its sessions below</span></div>
          <div className="week-grid">
            {days.map((d) => {
              const dl = attempts.filter((a) => a.date === d);
              const acc = avgOf(dl, 'accuracy');
              const h = Math.min(100, (minsDay[d] || 0) * 2);
              return (
                <button type="button" key={d} className={`day-card ${selDay === d ? 'on' : ''} ${dl.length ? 'has' : ''}`} onClick={() => onDayClick(d)} aria-pressed={selDay === d}>
                  <span className="dc-name">{WEEKDAYS[mondayIndex(d)]}</span>
                  <span className="dc-date">{shortDay(d)}</span>
                  <div className="dc-bar"><span style={{ height: `${Math.max(4, h)}%` }} /></div>
                  <span className="dc-acc">{acc === null ? '–' : `${acc}% right`}</span>
                  <span className="muted small">{avgOf(dl, 'wpm') === null ? '' : `${avgOf(dl, 'wpm')} of 120`}</span>
                  <span className="muted small">{dl.length} {dl.length === 1 ? 'session' : 'sessions'}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {period === 'month' && (
        <section className="panel">
          <div className="panel-head"><h3>{MONTHS[new Date(`${win.from}T00:00`).getMonth()]} {win.year}</h3><span className="muted small">Tap a day to see its sessions below</span></div>
          <div className="cal">
            {WEEKDAYS.map((w) => <span key={w} className="cal-h">{w}</span>)}
            {Array.from({ length: mondayIndex(win.from) }).map((_, i) => <span key={`p${i}`} />)}
            {days.map((d) => {
              const m = minsDay[d] || 0;
              return (
                <button type="button" key={d} className={`cal-d lv${level(m)} ${selDay === d ? 'on' : ''}`} onClick={() => onDayClick(d)} title={`${shortDay(d)}: ${fmtMin(m)}`}>
                  {Number(d.slice(8))}
                </button>
              );
            })}
          </div>
          <Legend />
        </section>
      )}

      {(period === 'month' || period === 'week') && selDay && (
        <section className="panel detail-panel" key={selDay}>
          <div className="panel-head"><h3>Sessions on {shortDay(selDay)}</h3><button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelDay(null)}>Close</button></div>
          <SessionList onOpen={setOpenId} list={detail} empty="No practice on this day." />
        </section>
      )}

      {period === 'year' && (
        <>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>Learning activity</h3>
                <p className="muted small">{days.filter((d) => minsDay[d]).length} study days · {fmtMin(minutes)} practised in {year}</p>
              </div>
              <span className="pill">{year}</span>
            </div>
            <Heat year={year} minsDay={minsDay} selDay={selDay} onDay={onDayClick} />
            <Legend />
          </section>

          <div className="two-col">
            <section className="panel">
              <div className="panel-head">
                <div><h3>Practice performance</h3><p className="muted small">Per month in {year}</p></div>
                <div className="seg small-seg" role="tablist" aria-label="Performance metric">
                  {[['speed', 'Speed'], ['accuracy', 'Accuracy'], ['mistakes', 'Mistakes']].map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={perf === k} className={perf === k ? 'on' : ''} onClick={() => setPerf(k)}>{l}</button>
                  ))}
                </div>
              </div>
              <MonthBars year={year} attempts={attempts} perf={perf} />
            </section>
            <section className="panel">
              <div className="panel-head"><h3>Months at a glance</h3></div>
              <ul className="month-list">
                {MONTHS.map((m, i) => {
                  const ml = attempts.filter((a) => a.date.startsWith(monthKey(year, i)));
                  const mins = minutesOf(ml);
                  return (
                    <li key={m}><span>{m}</span><span className="muted small">{ml.length} sessions</span><span>{mins ? fmtMin(mins) : '–'}</span></li>
                  );
                })}
              </ul>
            </section>
          </div>

          {selDay && (
            <section className="panel detail-panel" key={selDay}>
              <div className="panel-head"><h3>Sessions on {shortDay(selDay)}</h3><button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelDay(null)}>Close</button></div>
              <SessionList onOpen={setOpenId} list={detail} empty="No practice on this day." />
            </section>
          )}
        </>
      )}

      {openSession && <SessionDetail a={openSession} onClose={() => setOpenId(null)} />}
      {card && <ShareModal data={card} onClose={() => setCardOpen(false)} />}

      <section className="panel cta-panel">
        <div><h3>Every session adds to these charts.</h3><p className="muted small">Pick a course and start.</p></div>
        <button type="button" className="btn btn-primary" onClick={onPractise}>Start a course</button>
      </section>
    </div>
  );
}

function Tile({ label, value, tone = '', hint }) {
  return (
    <div className={`tile ${tone}`}>
      <span className="tile-label">{label}</span>
      <strong className="tile-value">{value}</strong>
      {hint && <span className="tile-hint">{hint}</span>}
    </div>
  );
}

function SessionList({ list, empty = 'No sessions in this period yet.', onOpen }) {
  if (!list.length) return <p className="empty">{empty}</p>;
  return (
    <ul className="session-list">
      {[...list].sort((a, b) => b.at - a.at).map((a) => (
        <li key={a.id || a.at}>
          <button type="button" className="session-row" onClick={() => onOpen && onOpen(a.id)}>
            <span className="pill">{a.level}</span>
            <strong>{a.courseTitle}</strong>
            <span className="muted small">{a.accuracy}% right · {a.wpm} of 120 · {a.mistakes.length} with mistakes · {a.completed}/{a.total} · {fmtMin(a.seconds / 60)}</span>
            <span className="open-hint">See record ›</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// The full record of one session: every item, how it was typed, and each wrong word.
function SessionDetail({ a, onClose }) {
  const items = a.items || [];
  const misses = (a.mistakes || []).flatMap((m) => wrongWords(m.target, m.typed));
  return (
    <section className="panel detail-panel session-detail" key={a.id}>
      <div className="panel-head">
        <div>
          <h3>{a.courseTitle}</h3>
          <p className="muted small">{shortDay(a.date)} · {fmtMin(a.seconds / 60)} · {a.completed} of {a.total} done</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      <div className="rec-stats">
        <span><b>{a.accuracy}%</b> right keys</span>
        <span><b>{a.wpm}</b> speed, out of 120</span>
        <span><b className={a.errors ? 'bad-t' : ''}>{a.errors}</b> wrong keys out of {a.keystrokes}</span>
        <span><b className={misses.length ? 'bad-t' : ''}>{misses.length}</b> wrong words</span>
      </div>

      <h4 className="rec-h">Item by item</h4>
      {items.length === 0 ? <p className="empty">No items were finished in this session.</p> : (
        <ul className="rec-list">
          {items.map((it, i) => {
            const typed = it.typed || '';
            const right = same(typed, it.target);
            return (
              <li key={i} className={right ? 'rec-ok' : 'rec-bad'}>
                <span className="rec-tag">{right ? (it.firstTry ? 'Right first try' : 'Right') : 'Has wrong words'}</span>
                <p className="rec-line">
                  {compareWords(it.target, typed).map((r, j) => (
                    <span key={j} className={r.ok ? 'w-ok' : 'w-bad'} title={r.ok ? '' : `should be: ${r.exp}`}>
                      {r.ok ? r.exp : <Letters marks={r.letters.got} />}{' '}
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <h4 className="rec-h">Wrong words</h4>
      {misses.length === 0 ? <p className="empty">No wrong words in this session. Every word was right.</p> : (
        <ul className="rec-list">
          {misses.map((r, i) => (
            <li key={i} className="rec-bad mk-words">
              <span className="rec-tag">Should be</span><span className="rec-word"><Letters marks={r.letters.exp} /></span>
              <span className="rec-tag got">You typed</span><span className="rec-word"><Letters marks={r.letters.got} empty="(nothing)" /></span>
            </li>
          ))}
        </ul>
      )}
      <p className="muted small mk-note">Red letters did not match. A red gap means a letter was left out.</p>
    </section>
  );
}

function Legend() {
  return (
    <div className="legend">
      {LEVEL_LABEL.map((l, i) => <span key={l}><i className={`sw lv${i}`} />{l}</span>)}
    </div>
  );
}

// GitHub-style grid: one column per week, Monday at the top.
function Heat({ year, minsDay, selDay, onDay }) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const all = datesBetween(start, end);
  const first = mondayIndex(start);
  return (
    <div className="heat-wrap">
      <div className="heat-grid" role="img" aria-label={`Learning activity ${year}`}>
        {all.map((d, i) => {
          const idx = i + first;
          const m = minsDay[d] || 0;
          return (
            <button type="button" key={d} className={`heat-cell lv${level(m)} ${selDay === d ? 'on' : ''}`}
              style={{ gridColumn: Math.floor(idx / 7) + 1, gridRow: (idx % 7) + 1 }}
              title={`${shortDay(d)}: ${fmtMin(m)}`} onClick={() => onDay(d)} aria-label={`${shortDay(d)} ${fmtMin(m)}`} />
          );
        })}
      </div>
      <div className="heat-months">{MONTHS.map((m) => <span key={m}>{m}</span>)}</div>
    </div>
  );
}

function MonthBars({ year, attempts, perf }) {
  const rows = MONTHS.map((m, i) => {
    const ml = attempts.filter((a) => a.date.startsWith(monthKey(year, i)));
    if (perf === 'speed') return { m, v: avgOf(ml, 'wpm'), max: 120, fmt: (x) => `${x} of 120` };
    if (perf === 'accuracy') return { m, v: avgOf(ml, 'accuracy'), max: 100, fmt: (x) => `${x}%` };
    return { m, v: ml.reduce((s, a) => s + a.mistakes.length, 0), max: Math.max(1, ...[0]), fmt: (x) => `${x}` };
  });
  const maxMistakes = Math.max(1, ...rows.map((r) => (perf === 'mistakes' ? r.v : 0)));
  return (
    <div className="bars" role="img" aria-label={`${perf} by month`}>
      {rows.map((r) => {
        const pct = r.v === null || r.v === undefined ? 0 : perf === 'mistakes' ? (r.v / maxMistakes) * 100 : (r.v / r.max) * 100;
        return (
          <div className="bar-col" key={r.m}>
            <span className="bar-val">{r.v === null || (perf !== 'mistakes' && r.v === null) ? '' : r.fmt(r.v)}</span>
            <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(pct ? 4 : 0, pct)}%` }} /></div>
            <span className="bar-lbl">{r.m}</span>
          </div>
        );
      })}
    </div>
  );
}
