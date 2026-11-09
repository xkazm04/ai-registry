#!/usr/bin/env node
/**
 * census - fold Codex's read-only part census into one fleet-wide, checkable gap table.
 *
 *   node census.mjs collect --runs <dir> --roots <json-file> --out <census.json>
 *   node census.mjs apply-adjudication --census <census.json> --runs <adjudicate-dir> --out <census.json>
 *   node census.mjs apply-rejudge --census <census.json> --runs <rejudge-dir> --out <census.json>
 *   node census.mjs sample  --census <census.json> --per-project 5 --out <sample.json> [--salt <s>]
 *   node census.mjs report  --census <census.json> [--audit <audit.json>] [--no-vault]
 *
 * WHY: nobody knows how large the two-way gap is between the fleet and the registry: parts
 * rebuilt in every project against an existing standard, and parts the registry never heard
 * of. Codex can read all of it cheaply, but its output is an unproven judge's opinion. So
 * this script believes nothing it can check: every part must quote a line that really is at
 * the cited file (an unanchored part is dropped and counted), a sample goes to the Director,
 * and the report prints the audited error rate beside the counts it qualifies.
 *
 * Input layout: <runs>/<slug>/<context>/last.md, whose final fenced json block is
 * census-brief.md's contract. --roots maps slug to the tree that was read. A survey's text
 * is untrusted, so a cited path may not leave its root. A count here is what the census
 * saw, never the size of the true gap; contexts that returned nothing usable are listed.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { EXIT, installCrashDoor } from '../../../scripts/lib/exit-codes.mjs';
import { vaultRoot, writeNewNote } from './vault-ledger.mjs';

export const RELATIONS = Object.freeze(['consumes', 'reinvents', 'no-standard', 'better-than-standard']);
export const REPEAT_THRESHOLD = 3;
// Closed on purpose. An `other` kind let a helper function and a game screen count as parts
// the registry lacks: 3 of 7 parts on the first real context (2026-11-09).
export const KINDS = Object.freeze(['table', 'list-or-feed', 'chart', 'form', 'modal-or-overlay', 'data-fetch-wrapper', 'api-client-wrapper', 'error-wrapper', 'auth-wrapper', 'cache-layer', 'render-optimization', 'background-job']);

/** Pure: the last fenced json block of a final message, or null. */
export function lastJsonBlock(text) {
  const blocks = [...String(text).matchAll(/```json\s*\n([\s\S]*?)```/g)];
  if (!blocks.length) return null;
  try { return JSON.parse(blocks[blocks.length - 1][1]); } catch { return null; }
}

const contained = (root, file) => {
  const target = path.resolve(root, file);
  const rel = path.relative(path.resolve(root), target);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? target : null;
};

/** Does the quote sit at the cited line? exact (within 3 lines), moved (elsewhere in file), or missing. */
export function anchor(root, file, line, quote) {
  const q = String(quote ?? '').trim();
  if (!q || typeof file !== 'string') return 'missing';
  const target = contained(root, file);
  if (!target) return 'missing';
  let lines;
  try { lines = fs.readFileSync(target, 'utf8').split(/\r?\n/); } catch { return 'missing'; }
  const n = Number(line);
  for (let i = Math.max(0, n - 4); i < Math.min(lines.length, n + 3); i++) if (lines[i].includes(q)) return 'exact';
  return lines.some((l) => l.includes(q)) ? 'moved' : 'missing';
}

/**
 * Pure: was this file's content returned? True when at least half its substantial lines appear
 * in the output, null for a file too small to tell. ASCII lines only, and a share rather than
 * one probe line: Codex's PowerShell mangles characters like an em dash, and a single longest
 * line (often the one holding such a character) reported 20% of fully read files as unread.
 */
export function wasReturned(text, outputs) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length >= 12 && /^[\x20-\x7e]+$/.test(l));
  if (!lines.length) return null;
  return lines.filter((l) => outputs.includes(l)).length * 2 >= lines.length;
}

/** Pure: everything the shell commands of a Codex run returned. */
export function commandOutputs(eventsText) {
  const out = [];
  for (const line of String(eventsText).split('\n')) {
    if (!line.trim()) continue;
    try {
      const ev = JSON.parse(line);
      if (ev.type === 'item.completed' && ev.item?.type === 'command_execution') out.push(String(ev.item.aggregated_output ?? ''));
    } catch { /* a non-JSON line */ }
  }
  return out.join('\n');
}

/**
 * Files actually returned to Codex, judged from its chunk's command output. A file named
 * in a brief and never opened does not count: a run that finishes
 * clean over part of the code is the failure this exists to catch.
 */
export function coverageOf(root, manifest, slugDir) {
  let read = 0, missed = 0, trivial = 0;
  for (const chunk of manifest.chunks) {
    let outputs = '';
    try { outputs = commandOutputs(fs.readFileSync(path.join(slugDir, chunk.id, 'events.jsonl'), 'utf8')); } catch { /* never ran */ }
    for (const f of chunk.files) {
      let seen = null;
      try { seen = wasReturned(fs.readFileSync(path.join(root, f), 'utf8'), outputs); } catch { /* vanished */ }
      if (seen === null) trivial += 1;
      else if (seen) read += 1;
      else missed += 1;
    }
  }
  return { tracked: manifest.tracked, scoped: manifest.scoped, read, missed, trivial };
}

/** Read every run under <runs>. Pure over the filesystem it is given. */
export function collect(runs, roots) {
  const parts = [], unusable = [], coverage = {};
  let dropped = 0, invalid = 0;
  for (const slug of fs.readdirSync(runs).sort()) {
    const dir = path.join(runs, slug);
    if (!fs.statSync(dir).isDirectory() || !roots[slug]) continue;
    try { coverage[slug] = coverageOf(roots[slug], JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')), dir); } catch { /* no manifest */ }
    for (const context of fs.readdirSync(dir).sort()) {
      if (!fs.statSync(path.join(dir, context)).isDirectory()) continue;
      const lastFile = path.join(dir, context, 'last.md');
      let body = null;
      try { body = lastJsonBlock(fs.readFileSync(lastFile, 'utf8')); } catch { /* no result yet */ }
      if (!body || !Array.isArray(body.parts)) { unusable.push(`${slug}/${context}`); continue; }
      body.parts.forEach((p, i) => {
        if (!p || !KINDS.includes(p.kind) || !RELATIONS.includes(p.relation)) { invalid += 1; return; }
        // "Follows a standard" with no standard and no shared part behind it was a third of the first audit's errors.
        if (p.relation === 'consumes' && !p.subject && !p.builtOn) { invalid += 1; return; }
        const a = anchor(roots[slug], p.file, p.line, p.quote);
        if (a === 'missing') { dropped += 1; return; }
        parts.push({
          id: `${slug}:${context}:${i}`, project: slug, context, kind: String(p.kind), name: String(p.name ?? ''),
          file: p.file, line: p.line, quote: p.quote, stack: String(p.stack ?? 'unknown'), relation: p.relation,
          subject: p.subject ?? null, builtOn: p.builtOn ? String(p.builtOn) : null, capabilities: Array.isArray(p.capabilities) ? p.capabilities.map(String) : [],
          missed: Array.isArray(p.missed) ? p.missed.map(String) : [], anchor: a,
        });
      });
    }
  }
  return { parts, unusable, dropped, invalid, coverage };
}

/** Pure: fold the second pass's verdicts into a census. A part with no verdict stays as it was and is counted. */
export function applyAdjudication(census, verdicts) {
  const byId = new Map(verdicts.filter((v) => v && ['reinvents', 'consumes', 'no-standard'].includes(v.verdict)).map((v) => [v.id, v]));
  const stats = { checked: 0, reinvents: 0, consumes: 0, kept: 0, unchecked: 0 };
  const parts = census.parts.map((p) => {
    if (p.relation !== 'no-standard') return p;
    const v = byId.get(p.id);
    if (!v) { stats.unchecked += 1; return p; }
    stats.checked += 1;
    if (v.verdict === 'no-standard') { stats.kept += 1; return { ...p, adjudicated: true }; }
    stats[v.verdict] += 1;
    return { ...p, relation: v.verdict, subject: v.standard ?? p.subject, missed: Array.isArray(v.missed) ? v.missed.map(String) : [], adjudicated: true };
  });
  return { ...census, parts, adjudication: stats };
}

/** Pure: text compared with markup and line wrapping removed, so a quoted rule survives reflow. */
export const normalizeRule = (s) => String(s ?? '').replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Pure: apply rejudge verdicts to `reinvents` parts. An upheld accusation must carry a rule
 * that `ruleFound(part, rule)` confirms is in the cited standard; one that cannot is not
 * believed. A part no verdict reached stays as it was and is counted, never silently cleared.
 */
export function applyRejudge(census, verdicts, ruleFound) {
  const byId = new Map(verdicts.filter((v) => v && ['reinvents', 'follows', 'not-governed'].includes(v.verdict)).map((v) => [v.id, v]));
  const stats = { checked: 0, upheld: 0, follows: 0, notGoverned: 0, unbacked: 0, unchecked: 0 };
  const parts = census.parts.map((p) => {
    if (p.relation !== 'reinvents') return p;
    const v = byId.get(p.id);
    if (!v) { stats.unchecked += 1; return p; }
    stats.checked += 1;
    if (v.verdict === 'reinvents' && ruleFound(p, v.rule)) {
      stats.upheld += 1;
      return { ...p, missed: [String(v.rule)], rejudged: 'upheld' };
    }
    if (v.verdict === 'follows') { stats.follows += 1; return { ...p, relation: 'consumes', missed: [], rejudged: 'follows' }; }
    const verdict = v.verdict === 'reinvents' ? 'unbacked' : 'not-governed';
    stats[verdict === 'unbacked' ? 'unbacked' : 'notGoverned'] += 1;
    return { ...p, relation: 'no-standard', subject: null, missed: [], rejudged: verdict, rejudgeWhy: v.why ? String(v.why) : null, accusedOf: p.subject };
  });
  return { ...census, parts, rejudge: stats };
}

/** Pure: how each kind of part is put together. */
export function builtOnSummary(parts) {
  const out = {};
  for (const p of parts) {
    const r = (out[p.kind] ??= { kind: p.kind, parts: 0, scratch: 0, on: {} });
    r.parts += 1;
    if (p.builtOn) r.on[p.builtOn] = (r.on[p.builtOn] ?? 0) + 1;
    else r.scratch += 1;
  }
  return Object.values(out).sort((a, b) => b.parts - a.parts || a.kind.localeCompare(b.kind));
}

/** Pure: per-project direction counts. */
export function gaps(parts) {
  const out = {};
  for (const p of parts) {
    const g = (out[p.project] ??= { parts: 0, consumes: 0, inbound: 0, outbound: 0 });
    g.parts += 1;
    if (p.relation === 'consumes') g.consumes += 1;
    else if (p.relation === 'reinvents') g.inbound += 1;
    else g.outbound += 1;
  }
  return out;
}

/**
 * Pure: the same kind of part on the same stack, in how many projects. Consumers of a
 * standard are excluded: this is the input to deciding what the registry should host.
 */
export function clusters(parts, threshold = REPEAT_THRESHOLD) {
  const map = new Map();
  for (const p of parts) {
    if (p.relation === 'consumes') continue;
    const key = `${p.kind}|${p.stack}`;
    const c = map.get(key) ?? { kind: p.kind, stack: p.stack, projects: new Set(), count: 0, capabilities: {} };
    c.projects.add(p.project);
    c.count += 1;
    for (const k of p.capabilities) c.capabilities[k] = (c.capabilities[k] ?? 0) + 1;
    map.set(key, c);
  }
  return [...map.values()]
    .map((c) => ({ ...c, projects: [...c.projects].sort(), sharedCandidate: c.projects.size >= threshold }))
    .sort((a, b) => b.projects.length - a.projects.length || b.count - a.count || `${a.kind}${a.stack}`.localeCompare(`${b.kind}${b.stack}`));
}

/** Pure: a stable per-project sample, taken in turn from each relation so a rare one is still audited. */
export function sample(parts, perProject, salt = '') {
  const h = (s) => crypto.createHash('sha1').update(salt + s).digest('hex');
  const by = {};
  for (const p of [...parts].sort((a, b) => h(a.id).localeCompare(h(b.id)))) ((by[p.project] ??= {})[p.relation] ??= []).push(p);
  return Object.values(by).flatMap((relations) => {
    const piles = Object.keys(relations).sort().map((r) => relations[r]);
    const out = [];
    for (let i = 0; out.length < perProject && piles.some((p) => i < p.length); i++) {
      for (const pile of piles) if (i < pile.length && out.length < perProject) out.push(pile[i]);
    }
    return out;
  });
}

/** Pure: {audited, disagree, rate}; rate is omitted when nothing was audited. */
export function auditRate(audit) {
  const values = Object.values(audit ?? {}).filter((v) => v === 'agree' || v === 'disagree');
  const disagree = values.filter((v) => v === 'disagree').length;
  return values.length ? { audited: values.length, disagree, rate: disagree / values.length } : { audited: 0, disagree: 0 };
}

/** Pure: the vault note. */
export function renderReport(census, audit) {
  const a = auditRate(audit);
  const g = gaps(census.parts);
  const accuracy = a.audited
    ? `Audited sample: ${a.audited} parts, ${a.disagree} wrong (${(a.rate * 100).toFixed(1)}%).`
    : '**Not audited: every count below is an unverified Codex judgment.**';
  const projects = Object.entries(g).sort(([x], [y]) => x.localeCompare(y))
    .map(([slug, r]) => `| ${slug} | ${r.parts} | ${r.consumes} | ${r.inbound} | ${r.outbound} |`).join('\n');
  const coverageLines = Object.entries(census.coverage ?? {}).sort(([x], [y]) => x.localeCompare(y))
    .map(([slug, c]) => `| ${slug} | ${c.tracked} | ${c.scoped} | ${c.read} | ${c.missed} | ${c.scoped ? ((c.read + c.trivial) / c.scoped * 100).toFixed(1) : '0.0'}% |`).join('\n');
  const built = builtOnSummary(census.parts)
    .map((r) => `| ${r.kind} | ${r.parts} | ${r.scratch} | ${Object.entries(r.on).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([k, n]) => `${k} (${n})`).join(', ')} |`).join('\n');
  const adj = census.adjudication
    ? `No-standard claims checked against the whole registry: ${census.adjudication.checked}. Moved to reinvents: ${census.adjudication.reinvents}. Moved to consumes: ${census.adjudication.consumes}. Kept: ${census.adjudication.kept}. Not checked: ${census.adjudication.unchecked}.`
    : '**No-standard claims were not checked against the whole registry.**';
  const rej = census.rejudge
    ? `Reinvents accusations rejudged for applicability: ${census.rejudge.checked}. Upheld with a quoted rule: ${census.rejudge.upheld}. Actually follow the standard: ${census.rejudge.follows}. Standard does not govern: ${census.rejudge.notGoverned}. Upheld without a verifiable rule, so not believed: ${census.rejudge.unbacked}. Not checked: ${census.rejudge.unchecked}.`
    : '**Reinvents accusations were not rejudged for applicability.**';
  const list = clusters(census.parts);
  const repeat = list.filter((c) => c.sharedCandidate)
    .map((c) => `| ${c.kind} | ${c.stack} | ${c.projects.length} | ${c.count} | ${Object.entries(c.capabilities).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, n]) => `${k} (${n})`).join(', ')} |`)
    .join('\n');
  return [
    accuracy,
    '',
    `Parts kept: ${census.parts.length}. Dropped, quote not found in the cited file: ${census.dropped}. Invalid rows: ${census.invalid}. Contexts with no usable result: ${census.unusable.length}.`,
    '',
    adj,
    '',
    rej,
    '',
    'Counts are what the census saw, not the size of the true gap.',
    '',
    '## Coverage: files whose content was returned to Codex',
    '',
    '| project | tracked | in scope | read | not read | coverage |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    coverageLines,
    '',
    '## How each kind of part is built',
    '',
    '| kind | parts | from scratch | built on |',
    '| --- | ---: | ---: | --- |',
    built,
    '',
    '## Two-way gap per project',
    '',
    'Inbound: rebuilt although the registry has a standard. Outbound: the registry has no standard, or this part is better than it.',
    '',
    '| project | parts | consumes | inbound | outbound |',
    '| --- | ---: | ---: | ---: | ---: |',
    projects,
    '',
    `## Shared-part candidates (${REPEAT_THRESHOLD}+ projects, same kind and stack)`,
    '',
    '| kind | stack | projects | parts | most common capabilities |',
    '| --- | --- | ---: | ---: | --- |',
    repeat,
    '',
    '## Contexts with no usable result',
    '',
    census.unusable.map((u) => `- ${u}`).join('\n') || 'None.',
    '',
  ].join('\n');
}

function main() {
  installCrashDoor();
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = (n) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : null; };
  const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
  const fail = (m) => { console.error(m); process.exit(EXIT.FATAL); };
  if (cmd === 'collect') {
    if (!arg('--runs') || !arg('--roots') || !arg('--out')) fail('usage: collect --runs <dir> --roots <json> --out <file>');
    const census = collect(arg('--runs'), readJson(arg('--roots')));
    fs.writeFileSync(arg('--out'), JSON.stringify(census, null, 1) + '\n');
    console.log(JSON.stringify({ parts: census.parts.length, dropped: census.dropped, invalid: census.invalid, unusable: census.unusable.length }));
  } else if (cmd === 'apply-adjudication') {
    if (!arg('--census') || !arg('--runs') || !arg('--out')) fail('usage: apply-adjudication --census <file> --runs <adjudicate-dir> --out <file>');
    const verdicts = [];
    for (const slug of fs.readdirSync(arg('--runs'))) {
      for (const batch of fs.readdirSync(path.join(arg('--runs'), slug))) {
        try { verdicts.push(...(lastJsonBlock(fs.readFileSync(path.join(arg('--runs'), slug, batch, 'last.md'), 'utf8'))?.verdicts ?? [])); } catch { /* a batch with no result */ }
      }
    }
    const applied = applyAdjudication(readJson(arg('--census')), verdicts);
    fs.writeFileSync(arg('--out'), JSON.stringify(applied, null, 1) + '\n');
    console.log(JSON.stringify(applied.adjudication));
  } else if (cmd === 'apply-rejudge') {
    if (!arg('--census') || !arg('--runs') || !arg('--out')) fail('usage: apply-rejudge --census <file> --runs <rejudge-dir> --out <file>');
    const verdicts = [], targets = {};
    for (const slug of fs.readdirSync(arg('--runs'))) {
      const root = path.join(arg('--runs'), slug);
      Object.assign(targets, readJson(path.join(root, 'targets.json')));
      for (const batch of fs.readdirSync(root)) {
        try { verdicts.push(...(lastJsonBlock(fs.readFileSync(path.join(root, batch, 'last.md'), 'utf8'))?.verdicts ?? [])); } catch { /* targets.json, or a batch with no result */ }
      }
    }
    const texts = new Map();
    const textOf = (dir) => {
      if (!texts.has(dir)) texts.set(dir, fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.md')).map((f) => normalizeRule(fs.readFileSync(path.join(dir, String(f)), 'utf8'))).join('\n'));
      return texts.get(dir);
    };
    const ruleFound = (p, rule) => { const r = normalizeRule(rule); return r.length >= 20 && !!targets[p.id] && textOf(targets[p.id]).includes(r); };
    const applied = applyRejudge(readJson(arg('--census')), verdicts, ruleFound);
    fs.writeFileSync(arg('--out'), JSON.stringify(applied, null, 1) + '\n');
    console.log(JSON.stringify(applied.rejudge));
  } else if (cmd === 'sample') {
    if (!arg('--census') || !arg('--out')) fail('usage: sample --census <file> --per-project <n> --out <file>');
    const picked = sample(readJson(arg('--census')).parts, Number(arg('--per-project') ?? 5), arg('--salt') ?? '');
    fs.writeFileSync(arg('--out'), JSON.stringify(picked, null, 1) + '\n');
    console.log(`${picked.length} parts to audit`);
  } else if (cmd === 'report') {
    if (!arg('--census')) fail('usage: report --census <file> [--audit <file>] [--no-vault]');
    const body = renderReport(readJson(arg('--census')), arg('--audit') ? readJson(arg('--audit')) : null);
    if (rest.includes('--no-vault')) { console.log(body); process.exit(EXIT.OK); }
    const vault = vaultRoot();
    if (!vault) fail('FATAL: no vault (set DAYBREAK_VAULT)');
    console.log(writeNewNote({ vault, dir: 'census', title: 'Daybreak census', body }));
  } else fail('usage: census.mjs collect|apply-adjudication|sample|report');
  process.exit(EXIT.OK);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
