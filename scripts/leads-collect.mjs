#!/usr/bin/env node
/**
 * leads-collect - an OPERATOR-SIDE reader for consumer-originated knowledge LEADS.
 *
 * The sibling of `signals-collect.mjs`, and it obeys the same lane rule: the consumer
 * computes, the registry receives. A consuming repo's sweep (`/scan-sweep` section 6)
 * appends a line to `<repo>/.ai/registry-leads.jsonl` when a fix it LANDED taught a rule
 * that would transplant to an unrelated team. This script folds every connected project's
 * ledger into ONE queue the librarian reads: `librarian/inbox.md`.
 *
 * What this script is NOT, and the distinction is the whole design:
 *
 *   A lead ORIGINATES a finding. It never AUTHORIZES one.
 *
 * Nothing here writes into `knowledge/`. A lead is a dated claim from one repository with
 * one repository's evidence behind it; landing it is `/intake`-class work - corroborate,
 * check prior art, decide whether it is a technique, an application or nothing. This
 * script only makes the claim VISIBLE, because a ledger nobody reads is theatre and this
 * fleet has enough of those.
 *
 * Idempotent: a lead already in the inbox (same ts + bundle + claim) is not re-appended,
 * so it is safe to run on every collection pass. Entries are never rewritten or removed -
 * the librarian strikes them through when it rules on them.
 *
 * Usage:  node scripts/leads-collect.mjs [--since-days N] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBridge } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const INBOX = path.join(ROOT, 'librarian', 'inbox.md');

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const sinceDays = Number(argv[argv.indexOf('--since-days') + 1]) || 90;

const fleet = loadBridge(ROOT)._fleet;
if (!fleet.machine && !Object.keys(fleet.projects).length) {
  console.error('FATAL: this machine has no resolvable fleet.');
  for (const p of fleet.problems) console.error(`  - ${p}`);
  console.error('  Expected a committed projects.json plus a local .machine.local.json (see librarian/projects.md).');
  process.exit(2);
}
const bridge = fleet;
const since = Date.now() - sinceDays * 86400000;

const HEADER = `# Inbox - leads from connected projects

Knowledge candidates originated by a sweep in a consuming repository and folded here by
[\`scripts/leads-collect.mjs\`](../scripts/leads-collect.mjs). **A lead originates a finding;
it never authorizes one.** Nothing below is in a bundle. Triage is \`/intake\`-class work:
check prior art against the named subject, corroborate against a second source, and land
only what survives - as a technique, an application, or a decline with a reason.

Append-only. Strike a line through when it is ruled on, and record the ruling in the
subject note; never delete, or the same lead arrives again next quarter looking new.

| date | bundle | nearest subject | kind | claim | conf | from |
| --- | --- | --- | --- | --- | --- | --- |
`;

const existing = fs.existsSync(INBOX) ? fs.readFileSync(INBOX, 'utf8') : HEADER;

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

/**
 * Has this lead already been filed?
 *
 * Asked by looking for the RENDERED CLAIM inside the file, rather than by
 * reconstructing a key out of the row's columns. The first version did the
 * latter and was not idempotent: it split rows on `|` — which the claim text
 * itself contains, escaped — and compared against the claim alone while the
 * rendered cell also carries the `*why:*` sentence. A second run appended all
 * five leads again. A dedup key that has to be kept in step with the renderer is
 * the same hand-maintained-list failure these leads are about.
 *
 * The date is deliberately NOT part of the identity: the same claim arriving
 * again next month is the same lead, and the librarian should see it once.
 */
const alreadyFiled = (claimCell) => existing.includes(claimCell);
const rows = [];
let projectsRead = 0;
let malformed = 0;

for (const [slug, p] of Object.entries(bridge.projects ?? {})) {
  const ledger = p?.path && path.join(p.path, '.ai', 'registry-leads.jsonl');
  if (!ledger || !fs.existsSync(ledger)) continue;
  projectsRead += 1;
  for (const line of fs.readFileSync(ledger, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    let rec;
    try { rec = JSON.parse(line); } catch { malformed += 1; continue; }
    const ts = Date.parse(rec.ts ?? '');
    const bundle = String(rec.bundle ?? '').trim();
    const claim = String(rec.claim ?? '').trim();
    // A lead with no bundle, no claim or no timestamp is not triageable. Dropped and
    // counted, never guessed at - the same rule the signals lane applies to a slug.
    if (!Number.isFinite(ts) || !/^[a-z0-9-]+$/.test(bundle) || claim.length < 12) { malformed += 1; continue; }
    if (ts < since) continue;
    const nearest = /^[a-z0-9-]+$/.test(String(rec.nearest ?? '')) ? rec.nearest : '-';
    const kind = ['technique', 'application', 'subject'].includes(rec.kind) ? rec.kind : 'technique';
    const conf = ['low', 'medium', 'high'].includes(rec.confidence) ? rec.confidence : 'low';
    const date = new Date(ts).toISOString().slice(0, 10);
    const claimCell = cell(claim);
    // Against the file AND against this run's own rows: one ledger can carry the
    // same claim twice, and two connected projects can each have filed it.
    if (alreadyFiled(claimCell) || rows.some((r) => r.claim === claimCell)) continue;
    // `slug` is the project's own name, already in the bridge and already in
    // librarian/projects.md. It is the only project-identifying value that crosses, and
    // it must: a lead whose origin is unknown cannot be corroborated or declined.
    rows.push({ date, bundle, nearest, kind, claim: claimCell, because: cell(rec.because), conf, from: `${slug} / ${cell(rec.from) || 'unknown'}` });
  }
}

rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

if (rows.length === 0) {
  console.log(`no new leads - ${projectsRead} project ledger(s) read${malformed ? `, ${malformed} malformed line(s) dropped` : ''}`);
  process.exit(0);
}

const appended = rows.map((r) => `| ${r.date} | ${r.bundle} | ${r.nearest} | ${r.kind} | ${r.claim}${r.because ? `<br>*why:* ${r.because}` : ''} | ${r.conf} | ${r.from} |`).join('\n');

if (dryRun) {
  console.log(appended);
  console.log(`\n(dry run - ${rows.length} new lead(s) from ${projectsRead} project(s) would be appended to librarian/inbox.md)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(INBOX), { recursive: true });
fs.writeFileSync(INBOX, `${existing.replace(/\s*$/, '')}\n${appended}\n`);
console.log(`librarian/inbox.md - ${rows.length} new lead(s) appended from ${projectsRead} project ledger(s)${malformed ? `, ${malformed} malformed line(s) dropped` : ''}`);
