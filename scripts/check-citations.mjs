#!/usr/bin/env node
// check-citations.mjs — external-citation liveness over the knowledge lane.
//
// WHY THIS IS SEPARATE FROM check-bundles.mjs
// check-bundles resolves every RELATIVE markdown link and explicitly skips
// anything matching /^(https?:|mailto:|#)/. Its headline therefore counts
// internal links only, and the excluded population is the one that rots
// without anyone touching this repository. `verified_on` on an application
// claims its citations resolved on that date; nothing in the gate can see
// whether they still do.
//
// ADVISORY BY DESIGN. This never fails the build and never edits a file.
// A detector runs over the real population in advisory mode, and its misfire
// rate is measured against ground truth, before it may produce a failure
// (conformance-checking/checker-false-positive-discipline).
//
// THREE STATES, and deletion is authorized by none of them:
//   alive        2xx/3xx
//   gone         404 or 410 — the codes that ASSERT the resource is absent
//   unverifiable everything else: 401/403/405/406/429, every 5xx, timeouts,
//                DNS and TLS errors. The checker was refused; that is a fact
//                about the checker, not about the citation.
// Deleting on any non-2xx is a 95% false-deletion rate on this corpus as of
// 2026-09-04 (1 gone, 21 unverifiable, 18 of those 403).
//
// Exit: 0 advisory (always, when it ran) · 2 the INSTRUMENT failed.
//
// Usage: node scripts/check-citations.mjs [--json] [--timeout ms] [--conc n]

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const argv = process.argv.slice(2);
const JSON_OUT = argv.includes('--json');
const num = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : Number(argv[i + 1]) || dflt;
};
const TIMEOUT = num('--timeout', 15000);
const CONC = num('--conc', 12);

const die = (msg) => { console.error(`FATAL: ${msg}`); process.exit(2); };

// ---- population -------------------------------------------------------
let files;
try {
  files = execSync('git grep -lE "https?://" -- knowledge/', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
} catch (e) {
  die('git grep failed; cannot enumerate the population.');
}
if (files.length === 0) die('zero files carry a URL. THE MATCHER IS BROKEN.');

// A citation is prose. Code is not a citation: strip fenced blocks and inline
// spans before matching, or template literals and regexes are read as URLs.
// (Measured: without this, 5 of 6 reported-gone were code fragments.)
const FENCE = /^```[\s\S]*?^```/gm;
const INLINE = /`[^`\n]*`/g;
const URLRE = /https?:\/\/[^\s)>"'\]`]+/g;
const HOSTOK = /^https?:\/\/[^/]+\.[a-z]{2,}(\/|$|\?|#)/i;
const FRAGMENT = /[<>{}$\\()*?|]/;

const cites = new Map();
for (const f of files) {
  const txt = readFileSync(f, 'utf8').replace(FENCE, '').replace(INLINE, '');
  for (const m of txt.matchAll(URLRE)) {
    const u = m[0].replace(/[.,;:]+$/, '');
    if (!HOSTOK.test(u) || FRAGMENT.test(u)) continue;
    if (u.includes('\u2026') || u.includes('example.com')) continue;
    if (!cites.has(u)) cites.set(u, []);
    if (!cites.get(u).includes(f)) cites.get(u).push(f);
  }
}
const urls = [...cites.keys()];
if (urls.length < 50) die(`only ${urls.length} citations extracted over ${files.length} files; expected 100+. THE EXTRACTOR IS BROKEN.`);

// ---- probe ------------------------------------------------------------
const UA = 'Mozilla/5.0 (compatible; registry-citation-check/1.0)';
async function probe(u) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    let r = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA } });
    if (r.status === 405 || r.status === 501)
      r = await fetch(u, { method: 'GET', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA } });
    const state = (r.status === 404 || r.status === 410) ? 'gone'
                : (r.status >= 200 && r.status < 400) ? 'alive' : 'unverifiable';
    return { state, code: r.status };
  } catch (e) {
    return { state: 'unverifiable', code: e.name === 'AbortError' ? 'timeout' : (e.cause?.code || 'neterr') };
  } finally { clearTimeout(t); }
}

// ---- assert the instrument BEFORE the result --------------------------
// A liveness checker that cannot tell alive from gone reports a clean sweep
// on a corpus of dead links. Two fixed controls, one of each class.
const CONTROL_ALIVE = 'https://www.w3.org/TR/2024/REC-WCAG22-20241212/';
const CONTROL_GONE  = 'https://www.w3.org/TR/this-recommendation-does-not-exist/';
const [ga, gg] = await Promise.all([probe(CONTROL_ALIVE), probe(CONTROL_GONE)]);
if (ga.state !== 'alive' || gg.state !== 'gone') {
  die(`controls failed (known-good=${ga.state}/${ga.code}, known-gone=${gg.state}/${gg.code}). ` +
      `Network or host policy is shaping results; refusing to report a verdict.`);
}

// ---- sweep ------------------------------------------------------------
const results = [];
const queue = [...urls];
await Promise.all(Array.from({ length: CONC }, async () => {
  while (queue.length) {
    const u = queue.shift();
    results.push({ url: u, ...(await probe(u)) });
  }
}));

const by = { alive: [], gone: [], unverifiable: [] };
for (const r of results) by[r.state].push(r);
const rel = (f) => f.replace(/\\/g, '/');

if (JSON_OUT) {
  console.log(JSON.stringify({
    checked_on: new Date().toISOString().slice(0, 10),
    predicate: 'prose citations in knowledge/, code blocks and inline spans excluded',
    files: files.length, citations: urls.length,
    alive: by.alive.length, gone: by.gone.length, unverifiable: by.unverifiable.length,
    gone_list: by.gone.map(r => ({ ...r, cited_in: cites.get(r.url).map(rel) })),
    unverifiable_list: by.unverifiable.map(r => ({ ...r, cited_in: cites.get(r.url).map(rel) })),
  }, null, 2));
  process.exit(0);
}

// count-carries-predicate: the headline says what it did and did not check.
console.log(`${urls.length} prose citations across ${files.length} files ` +
            `(code blocks and inline spans excluded; internal links are check-bundles' population)`);
console.log(`  alive        ${by.alive.length}`);
console.log(`  gone         ${by.gone.length}   (404/410 only — the codes that assert absence)`);
console.log(`  unverifiable ${by.unverifiable.length}   (checker refused or network failed — NOT evidence the citation is dead)`);

if (by.gone.length) {
  console.log('\nGONE — a definitive 404/410. Confirm by hand, then repoint or annotate.');
  console.log('Do not bulk-delete: a citation carries the judgment that it belonged, which no re-fetch restores.');
  for (const r of by.gone) {
    console.log(`  ${r.code}  ${r.url}`);
    for (const f of cites.get(r.url)) console.log(`        <- ${rel(f)}`);
  }
}
if (by.unverifiable.length) {
  const codes = {};
  for (const r of by.unverifiable) codes[r.code] = (codes[r.code] || 0) + 1;
  console.log('\nUNVERIFIABLE — no claim is being made about these citations.');
  console.log(`  ${Object.entries(codes).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${n}x ${c}`).join('  ')}`);
}
console.log('\nadvisory — this check never fails the build and never edits a file');
