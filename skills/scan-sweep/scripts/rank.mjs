#!/usr/bin/env node
// rank - the round's slot allocation (scan-finding/1 "Coverage"), in one place.
//
// Why: the round used to cap findings PER TIER (deep <=3, matched <=2, rest <=1) under a 16-item
// budget, while the 13-lens stabilize deep tier alone could emit 39 - so the tail lenses were
// crowded out of a budget the head had already spent, and what did not fit was simply not written.
// Now every lens with a verified finding gets its MVP ranked first, the remaining slots go by
// score across lenses, and everything else verified is `band: reserve` - filed, never dropped.
//
// Usage:
//   node rank.mjs --file <findings.jsonl> --cap <N> [--out <ranked.jsonl>] [--json]
//                 [--trust <door trust JSON>] [--start technical=2,product=0] [--frozen <p1,p2>] [--strict]
//                 [--tokens <lens=n,...>] [--skipped <lens,...>]
//
// Each line is one VERIFIED finding of this round (snake_case finding shape; `lens` required). The
// script computes `score` / `score_parts` with score.mjs (effort from size when only a size is known;
// a card's own score is overwritten), then sets `band`, `mvp` and, on the MVP, `mvp_rule`. A finding
// carrying `mvp_rule: "override"` + `mvp_why` is its lens's MVP whatever its score.
// --trust (the output of `door.mjs trust`, reachable or not) adds per finding `slice`, `level`,
// `lane_a_ok` and `auto_decide` - SKILL.md section 5's ladder routing.
// Output: the findings in rank order (ranked band first) to --out, and the per-lens table on stdout.
// Exit 0 ok; 1 a line is unreadable, lacks `lens`, or carries an out-of-scale value (nothing written);
// 2 bad arguments.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { scanScore, sizeToEffort } from './score.mjs';
import { levelFor, isEntry } from './door.mjs';

const present = (v) => v !== undefined && v !== null && v !== '';
// Scored first by score desc; unscored after every scored finding (the contract); stable otherwise.
const byScore = (a, b) => (present(b.f.score) ? b.f.score : -1) - (present(a.f.score) ? a.f.score : -1) || a.i - b.i;

/**
 * @param {object[]} findings verified findings (lens required)
 * @param {number} cap the round's ranked slots N
 * @returns {object[]} new objects, rank order, with score/score_parts/band/mvp/mvp_rule set
 */
export function allocate(findings, cap) {
  const rows = findings.map((f0, i) => {
    const f = { ...f0 };
    if (!present(f.lens)) throw new Error(`finding ${i + 1} has no lens`);
    if (f.mvp_rule === 'override' && !present(f.mvp_why)) throw new Error(`finding ${i + 1}: mvp_rule override needs mvp_why`);
    const effort = present(f.effort) ? f.effort : sizeToEffort(present(f.size) ? String(f.size).toUpperCase() : undefined);
    if (!present(f.effort) && present(effort)) f.effort = effort;
    const s = scanScore({ impact: f.impact, confidence: f.confidence, effort, risk: f.risk });
    delete f.score; delete f.score_parts;
    if (s) { f.score = s.score; f.score_parts = s.score_parts; }
    return { f, i };
  });
  const lenses = new Map();
  for (const r of rows) (lenses.get(r.f.lens) ?? lenses.set(r.f.lens, []).get(r.f.lens)).push(r);
  const mvps = new Set();
  for (const group of lenses.values()) {
    const override = group.find((r) => r.f.mvp_rule === 'override');
    mvps.add(override ?? [...group].sort(byScore)[0]);
  }
  // MVPs are never reserved: with more lenses than slots the ranked band exceeds N, and says so.
  const rest = rows.filter((r) => !mvps.has(r)).sort(byScore);
  const free = Math.max(0, cap - mvps.size);
  const ranked = new Set([...mvps, ...rest.slice(0, free)]);
  for (const r of rows) {
    r.f.band = ranked.has(r) ? 'ranked' : 'reserve';
    r.f.mvp = mvps.has(r);
    if (r.f.mvp) r.f.mvp_rule = r.f.mvp_rule === 'override' ? 'override' : 'top-score';
    else { delete r.f.mvp_rule; delete r.f.mvp_why; }
  }
  return [...rows].sort((a, b) => (a.f.band === b.f.band ? byScore(a, b) : a.f.band === 'ranked' ? -1 : 1)).map((r) => r.f);
}

/** The per-lens table the round report prints (lens order: MVP score desc). */
export function lensTable(ranked, { tokens = {} } = {}) {
  const by = new Map();
  for (const f of ranked) {
    const e = by.get(f.lens) ?? { lens: f.lens, ranked: 0, reserve: 0 };
    e[f.band] += 1;
    if (f.mvp) { e.mvp_title = f.title; if (present(f.score)) e.mvp_score = f.score; }
    if (Number.isFinite(tokens[f.lens])) e.tokens = tokens[f.lens];
    by.set(f.lens, e);
  }
  return [...by.values()].sort((a, b) => (b.mvp_score ?? -1) - (a.mvp_score ?? -1) || a.lens.localeCompare(b.lens));
}

function main(argv) {
  const has = (f) => argv.includes(f);
  const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const file = opt('--file');
  const cap = Number(opt('--cap'));
  if (!file || !existsSync(file) || !Number.isInteger(cap) || cap < 0) {
    console.error('usage: rank.mjs --file <findings.jsonl> --cap <N> [--out <p>] [--json] [--trust <p>] [--start technical=2,product=0] [--frozen <p1,p2>] [--strict] [--tokens <lens=n,...>] [--skipped <lens,...>]');
    return 2;
  }
  const findings = [];
  const bad = [];
  readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
    if (!raw.trim()) return;
    try { findings.push(JSON.parse(raw)); } catch { bad.push(`line ${i + 1}: not JSON`); }
  });
  let ranked;
  try { if (!bad.length) ranked = allocate(findings, cap); } catch (e) { bad.push(e.message); }
  if (bad.length) { for (const b of bad) console.error(b); console.error('nothing written'); return 1; }

  const kv = (s) => Object.fromEntries((s ?? '').split(',').filter(Boolean).map((p) => { const [k, v] = p.split('='); return [k.trim(), Number(v)]; }));
  const trustPath = opt('--trust');
  if (trustPath) {
    const t = JSON.parse(readFileSync(trustPath, 'utf8'));
    const o = { reachable: t.reachable === true, slices: t.slices ?? [], start: kv(opt('--start')), frozen: (opt('--frozen') ?? '').split(',').filter(Boolean), strict: has('--strict') };
    for (const f of ranked) Object.assign(f, levelFor(f, o));
  }
  const outPath = opt('--out');
  if (outPath) writeFileSync(outPath, ranked.map((f) => JSON.stringify(f)).join('\n') + (ranked.length ? '\n' : ''));

  const table = lensTable(ranked, { tokens: kv(opt('--tokens')) });
  const skipped = (opt('--skipped') ?? '').split(',').filter(Boolean);
  const nRanked = ranked.filter((f) => f.band === 'ranked').length;
  const summary = { cap, ranked: nRanked, reserve: ranked.length - nRanked, over_cap: Math.max(0, nRanked - cap), unscored: ranked.filter((f) => !present(f.score)).length, lenses: table, skipped };
  if (has('--json')) { console.log(JSON.stringify(summary, null, 2)); return 0; }
  const withTokens = table.some((r) => present(r.tokens));
  console.log(`| lens | ranked | reserve | MVP | MVP score |${withTokens ? ' tokens |' : ''}`);
  console.log(`|---|---|---|---|---|${withTokens ? '---|' : ''}`);
  for (const r of table) console.log(`| ${r.lens} | ${r.ranked} | ${r.reserve} | ${r.mvp_title ?? '-'} | ${present(r.mvp_score) ? r.mvp_score : 'unscored'} |${withTokens ? ` ${present(r.tokens) ? r.tokens : '-'} |` : ''}`);
  console.log(`\n${nRanked} ranked (cap ${cap}${summary.over_cap ? `, +${summary.over_cap} MVPs over it` : ''}), ${summary.reserve} reserve${summary.unscored ? `, ${summary.unscored} unscored` : ''}`);
  console.log(`skipped: ${skipped.length ? skipped.join(', ') : 'none'}`);
  return 0;
}

// Real-path entry check: through the skill link a plain compare never fired (see door.mjs isEntry).
if (isEntry(process.argv[1], import.meta.url)) process.exitCode = main(process.argv.slice(2));
