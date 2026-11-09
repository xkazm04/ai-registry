#!/usr/bin/env node
/**
 * census - fold Codex's read-only part census into one fleet-wide, checkable gap table.
 *
 *   node census.mjs collect --runs <dir> --roots <json-file> --out <census.json>
 *   node census.mjs sample  --census <census.json> --per-project 5 --out <sample.json>
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

/** Read every run under <runs>. Pure over the filesystem it is given. */
export function collect(runs, roots) {
  const parts = [], unusable = [];
  let dropped = 0, invalid = 0;
  for (const slug of fs.readdirSync(runs).sort()) {
    const dir = path.join(runs, slug);
    if (!fs.statSync(dir).isDirectory() || !roots[slug]) continue;
    for (const context of fs.readdirSync(dir).sort()) {
      const lastFile = path.join(dir, context, 'last.md');
      let body = null;
      try { body = lastJsonBlock(fs.readFileSync(lastFile, 'utf8')); } catch { /* no result yet */ }
      if (!body || !Array.isArray(body.parts)) { unusable.push(`${slug}/${context}`); continue; }
      body.parts.forEach((p, i) => {
        if (!p || !KINDS.includes(p.kind) || !RELATIONS.includes(p.relation)) { invalid += 1; return; }
        const a = anchor(roots[slug], p.file, p.line, p.quote);
        if (a === 'missing') { dropped += 1; return; }
        parts.push({
          id: `${slug}:${context}:${i}`, project: slug, context, kind: String(p.kind), name: String(p.name ?? ''),
          file: p.file, line: p.line, quote: p.quote, stack: String(p.stack ?? 'unknown'), relation: p.relation,
          subject: p.subject ?? null, capabilities: Array.isArray(p.capabilities) ? p.capabilities.map(String) : [],
          missed: Array.isArray(p.missed) ? p.missed.map(String) : [], anchor: a,
        });
      });
    }
  }
  return { parts, unusable, dropped, invalid };
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

/** Pure: a stable per-project sample, the same for the same census. */
export function sample(parts, perProject) {
  const h = (s) => crypto.createHash('sha1').update(s).digest('hex');
  const by = {};
  for (const p of [...parts].sort((a, b) => h(a.id).localeCompare(h(b.id)))) (by[p.project] ??= []).push(p);
  return Object.values(by).flatMap((list) => list.slice(0, perProject));
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
  const list = clusters(census.parts);
  const repeat = list.filter((c) => c.sharedCandidate)
    .map((c) => `| ${c.kind} | ${c.stack} | ${c.projects.length} | ${c.count} | ${Object.entries(c.capabilities).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, n]) => `${k} (${n})`).join(', ')} |`)
    .join('\n');
  return [
    accuracy,
    '',
    `Parts kept: ${census.parts.length}. Dropped, quote not found in the cited file: ${census.dropped}. Invalid rows: ${census.invalid}. Contexts with no usable result: ${census.unusable.length}.`,
    '',
    'Counts are what the census saw, not the size of the true gap.',
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
  } else if (cmd === 'sample') {
    if (!arg('--census') || !arg('--out')) fail('usage: sample --census <file> --per-project <n> --out <file>');
    const picked = sample(readJson(arg('--census')).parts, Number(arg('--per-project') ?? 5));
    fs.writeFileSync(arg('--out'), JSON.stringify(picked, null, 1) + '\n');
    console.log(`${picked.length} parts to audit`);
  } else if (cmd === 'report') {
    if (!arg('--census')) fail('usage: report --census <file> [--audit <file>] [--no-vault]');
    const body = renderReport(readJson(arg('--census')), arg('--audit') ? readJson(arg('--audit')) : null);
    if (rest.includes('--no-vault')) { console.log(body); process.exit(EXIT.OK); }
    const vault = vaultRoot();
    if (!vault) fail('FATAL: no vault (set DAYBREAK_VAULT)');
    console.log(writeNewNote({ vault, dir: 'census', title: 'Daybreak census', body }));
  } else fail('usage: census.mjs collect|sample|report');
  process.exit(EXIT.OK);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
