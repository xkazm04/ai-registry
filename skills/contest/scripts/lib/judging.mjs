// Pure half of judging: blinding, identity scrubbing, verdict validation, aggregation.
//
// A judge never sees who made an entry. Entries become letters in an order derived from
// the contest id (deterministic, so a rerun of `collect` does not reshuffle under a
// verdict already written), and every model or vendor name a participant let slip into
// its files is redacted in the blinded copy and reported as a leak.

export const DIMENSIONS = ['wow', 'clarity', 'wayfinding', 'interaction', 'craft', 'concept'];

// FNV-1a: small, deterministic, dependency-free. Not a security primitive.
const hash32 = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
};

/** ids -> { A: id, B: id, ... } shuffled by a hash of (seed, id). Stable for a given seed. */
export function blindMap(ids, seed) {
  if (ids.length > 26) throw new Error('more than 26 entries - blinding uses one letter per entry');
  const order = [...ids].sort((a, b) => hash32(`${seed}|${a}`) - hash32(`${seed}|${b}`) || a.localeCompare(b));
  const map = {};
  order.forEach((id, i) => { map[String.fromCharCode(65 + i)] = id; });
  return map;
}

export const unblind = (map, letter) => map[letter] ?? null;

/**
 * Words that would tell a judge which family wrote an entry. Participant ids, models
 * and engines are added per contest; the constant part covers vendor and product names.
 */
export const IDENTITY_WORDS = [
  'claude', 'anthropic', 'opus', 'sonnet', 'haiku', 'fable', 'mythos',
  'grok', 'xai', 'x\\.ai', 'codex', 'openai', 'gpt-?[0-9]', 'chatgpt', 'gemini', 'google deepmind',
];

export function identityPattern(extra = []) {
  // Contest-specific words first, so a full model name is redacted whole instead of leaving its version behind.
  const words = [...extra.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), ...IDENTITY_WORDS];
  return new RegExp(`\\b(?:${words.join('|')})\\b`, 'gi');
}

/** Returns the scrubbed text and how many replacements were made. */
export function scrubIdentity(text, extra = []) {
  let count = 0;
  const out = text.replace(identityPattern(extra), () => { count += 1; return '[redacted]'; });
  return { text: out, count };
}

// ---------------------------------------------------------------- verdicts

/**
 * A verdict is one judge's reading of every blinded variant:
 * { judge, entries: { A: { variants: [ { n, scores: {dim: 1..10}, strengths, weaknesses, broken? } ] } },
 *   ranking: ["B/2", ...], patterns: [...], anti_patterns: [...] }
 * Returns the list of problems; an empty list is a usable verdict.
 */
export function validateVerdict(v, expected) {
  const problems = [];
  if (!v || typeof v !== 'object') return ['verdict is not an object'];
  if (!v.entries || typeof v.entries !== 'object') return ['verdict has no entries'];
  for (const [letter, n] of Object.entries(expected)) {
    const e = v.entries[letter];
    if (!e || !Array.isArray(e.variants)) { problems.push(`entry ${letter}: missing`); continue; }
    for (let i = 1; i <= n; i += 1) {
      const var_ = e.variants.find((x) => Number(x.n) === i);
      if (!var_) { problems.push(`entry ${letter}/${i}: not scored`); continue; }
      if (var_.broken) continue;
      for (const d of DIMENSIONS) {
        const s = Number(var_.scores?.[d]);
        if (!Number.isFinite(s) || s < 1 || s > 10) problems.push(`entry ${letter}/${i}: ${d} is not a score 1..10`);
      }
    }
  }
  if (!Array.isArray(v.ranking) || v.ranking.length === 0) problems.push('ranking missing');
  return problems;
}

export const variantTotal = (scores) => {
  const vals = DIMENSIONS.map((d) => Number(scores?.[d])).filter(Number.isFinite);
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
};

/**
 * Aggregate several verdicts over the same blind map into one scoreboard.
 * Each row: { key: "A/1", letter, n, mean, spread, per_judge: {judge: total}, dims: {dim: mean}, broken_by: [judge] }.
 * Sorted by mean desc; a variant any judge marked broken sinks below every intact one.
 */
export function aggregate(verdicts) {
  const rows = new Map();
  for (const v of verdicts) {
    for (const [letter, e] of Object.entries(v.entries ?? {})) {
      for (const var_ of e.variants ?? []) {
        const key = `${letter}/${var_.n}`;
        if (!rows.has(key)) rows.set(key, { key, letter, n: Number(var_.n), per_judge: {}, dims: {}, broken_by: [], notes: [] });
        const row = rows.get(key);
        if (var_.broken) { row.broken_by.push(v.judge); continue; }
        row.per_judge[v.judge] = variantTotal(var_.scores);
        for (const d of DIMENSIONS) {
          const s = Number(var_.scores?.[d]);
          if (Number.isFinite(s)) (row.dims[d] ??= []).push(s);
        }
        if (var_.strengths) row.notes.push({ judge: v.judge, strengths: var_.strengths, weaknesses: var_.weaknesses ?? '' });
      }
    }
  }
  const out = [];
  for (const row of rows.values()) {
    const totals = Object.values(row.per_judge).filter((x) => x !== null);
    row.mean = totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 100) / 100 : null;
    row.spread = totals.length > 1 ? Math.round((Math.max(...totals) - Math.min(...totals)) * 100) / 100 : 0;
    row.dims = Object.fromEntries(Object.entries(row.dims).map(([d, xs]) => [d, Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100]));
    out.push(row);
  }
  out.sort((a, b) => {
    if (a.broken_by.length !== b.broken_by.length) return a.broken_by.length - b.broken_by.length;
    return (b.mean ?? -1) - (a.mean ?? -1) || a.key.localeCompare(b.key);
  });
  return out;
}

/** Judges' pattern statements, tallied by a normalized key so near-duplicates merge. */
export function tallyPatterns(verdicts, field = 'patterns') {
  const tally = new Map();
  for (const v of verdicts) {
    for (const raw of v[field] ?? []) {
      const text = typeof raw === 'string' ? raw : raw?.statement ?? '';
      if (!text.trim()) continue;
      const key = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 6).join('-');
      if (!tally.has(key)) tally.set(key, { key, statement: text.trim(), judges: [], variants: [] });
      const t = tally.get(key);
      t.judges.push(v.judge);
      for (const x of (typeof raw === 'object' && Array.isArray(raw?.variants)) ? raw.variants : []) t.variants.push(x);
    }
  }
  return [...tally.values()].sort((a, b) => b.judges.length - a.judges.length || a.key.localeCompare(b.key));
}

/** The scoreboard as a markdown table a human reads in the vault note. */
export function scoreboardMarkdown(rows, blind, participants = {}) {
  const head = `| # | Entry | Who | Mean | Spread | ${DIMENSIONS.join(' | ')} | Judges |\n|--:|---|---|--:|--:|${DIMENSIONS.map(() => '--:').join('|')}|---|`;
  const lines = rows.map((r, i) => {
    const who = blind ? (participants[unblind(blind, r.letter)]?.spec ?? unblind(blind, r.letter) ?? '?') : '?';
    const dims = DIMENSIONS.map((d) => (r.dims[d] ?? '-')).join(' | ');
    const judges = Object.entries(r.per_judge).map(([j, t]) => `${j}: ${t}`).join(', ') + (r.broken_by.length ? ` (broken per ${r.broken_by.join(', ')})` : '');
    return `| ${i + 1} | ${r.key} | ${who} | ${r.mean ?? '-'} | ${r.spread} | ${dims} | ${judges} |`;
  });
  return [head, ...lines].join('\n');
}
