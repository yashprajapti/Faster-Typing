import React from 'react';
import { JOURNAL, COURSES } from '../data/content.js';
import { fmtTime } from '../lib/util.js';

// Lists the courses for one section. "journal" = 10 word/sentence courses, "courses" = 5 paragraph courses.
export default function Courses({ section, onPick }) {
  const list = section === 'journal' ? JOURNAL : COURSES;
  const heading = section === 'journal' ? 'Typing Warm-Ups' : 'Courses';
  const blurb = section === 'journal'
    ? 'Ten courses of twenty words and sentences each. Each one starts small and gets harder. Every item is spoken once, then typed.'
    : 'Eight paragraph courses, from beginner to advanced. Each timer is generous, so you can finish calmly.';
  return (
    <div className="page-stack">
      <section className="intro-band">
        <p className="kicker">{heading}</p>
        <h1 className="display">{section === 'journal' ? 'Build speed one word at a time.' : 'Type whole paragraphs with rhythm.'}</h1>
        <p className="muted">{blurb}</p>
      </section>
      <div className="course-grid">
        {list.map((c, i) => (
          <button key={c.id} type="button" className={`course-card lift ${c.level === 'Advanced' ? 'adv' : 'beg'}`} style={{ animationDelay: `${i * 60}ms` }} onClick={() => onPick(c.id)}>
            <div className="course-top">
              <span className="course-no">{section === 'journal' ? `J${i + 1}` : `C${i + 1}`}</span>
              <span className="pill">{c.level}</span>
            </div>
            <h3>{c.title}</h3>
            <p className="muted small">
              {section === 'journal' ? `${c.items.length} items · words to sentences` : `${c.items[0].split(' ').length} words · one paragraph`}
            </p>
            <p className="small time">Time: {fmtTime(c.timeSec)}</p>
            <span className="go">Start →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
