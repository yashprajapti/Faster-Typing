// Compares what was meant to be typed with what was typed: word by word, then letter by letter.
export function letterMarks(exp, got) {
  const len = Math.max(exp.length, got.length);
  const e = [];
  const g = [];
  for (let i = 0; i < len; i += 1) {
    const a = exp[i];
    const b = got[i];
    if (a !== undefined) e.push({ ch: a, cls: a === b ? '' : (b === undefined ? 'miss' : 'bad') });
    if (b !== undefined) g.push({ ch: b, cls: a === b ? '' : 'bad' });
  }
  return { exp: e, got: g };
}

// Lines the typed words up with the target words (so one extra or missing word does not shift every row after it).
export function compareWords(target, typed) {
  const t = (target || '').trim().split(/\s+/).filter(Boolean);
  const g = (typed || '').trim().split(/\s+/).filter(Boolean);
  const n = t.length;
  const m = g.length;
  // Edit-distance table over words: equal words cost 0, anything else costs 1.
  const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i += 1) d[i][0] = i;
  for (let j = 0; j <= m; j += 1) d[0][j] = j;
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const sub = d[i - 1][j - 1] + (t[i - 1] === g[j - 1] ? 0 : 1);
      d[i][j] = Math.min(sub, d[i - 1][j] + 1, d[i][j - 1] + 1);
    }
  }
  const rows = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (t[i - 1] === g[j - 1] ? 0 : 1)) {
      rows.unshift({ exp: t[i - 1], got: g[j - 1] });
      i -= 1;
      j -= 1;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      rows.unshift({ exp: t[i - 1], got: '' });
      i -= 1;
    } else {
      rows.unshift({ exp: '', got: g[j - 1] });
      j -= 1;
    }
  }
  return rows.map((r) => ({ ...r, ok: r.exp !== '' && r.exp === r.got, letters: letterMarks(r.exp, r.got) }));
}

export const wrongWords = (target, typed) => compareWords(target, typed).filter((r) => !r.ok);
