#!/usr/bin/env node
/**
 * signals-collect — an OPERATOR-SIDE writer for the `signals/` lane (docs/signals-lane.md).
 *
 * The lane's rule is "the consumer computes, the registry receives verdicts, never
 * pointers". This script runs on the machine that holds the consuming checkouts, reads
 * the gitignored `.projects.local.json` bridge, and for every connected project collects:
 *
 *   - `stack`  : capability -> major version, lifted from the repo's package.json
 *                (node engines, react, next, vite, typescript...) - a bare major is enough;
 *   - `consults`: subject slug -> count, from `<repo>/.ai/consults.jsonl`, the append-only
 *                log `/consult` writes (one line per consult; slugs only);
 *   - `deviations`: subject slug -> count, from the same log's `deviations` field.
 *
 * It writes ONE file, `signals/<contributor>.json`, for this installation - every project
 * folded into one aggregate, because a per-repo breakdown is a fact about one fleet and
 * the lane forbids it. Citations (`resolved/moved/gone`) are NOT produced here: they need
 * an evidence overlay resolved against a tree, and the consumer that owns the overlay is
 * the only thing that can write them honestly. The file says what it did and did not
 * measure in `meta`, so an absent key reads as "not measured", never as zero.
 *
 * Counts and slugs only. Paths never leave this machine. Run `node scripts/check-signals.mjs`
 * after it; commit the file alongside something else you were already committing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const BRIDGE = path.join(ROOT, '.projects.local.json');
const OUT_DIR = path.join(ROOT, 'signals');
const WINDOW_DAYS = 30;

if (!fs.existsSync(BRIDGE)) {
  console.error(`FATAL: no ${path.basename(BRIDGE)} at the registry root - this writer reads the local bridge (slug -> path).`);
  process.exit(2);
}
const bridge = JSON.parse(fs.readFileSync(BRIDGE, 'utf8'));
const contributor = String(process.argv.find((a) => a.startsWith('--contributor='))?.slice(14) || bridge.contributor || '').trim();
if (!/^[a-z0-9][a-z0-9-]*$/.test(contributor)) {
  console.error('FATAL: a contributor id is required ([a-z0-9-], non-identifying): --contributor=<id> or "contributor" in the bridge.');
  process.exit(2);
}

const since = Date.now() - WINDOW_DAYS * 86400000;
const stack = {};
const bundles = {};
let projectsRead = 0;
let consultLines = 0;

const majorOf = (spec) => {
  const m = String(spec ?? '').match(/(\d+)(?:\.(\d+))?/);
  return m ? Number(m[1]) : null;
};
const STACK_KEYS = { node: ['engines.node'], react: ['dependencies.react'], next: ['dependencies.next'], vite: ['devDependencies.vite', 'dependencies.vite'], typescript: ['devDependencies.typescript', 'dependencies.typescript'], tailwindcss: ['dependencies.tailwindcss', 'devDependencies.tailwindcss'], vitest: ['devDependencies.vitest'], playwright: ['devDependencies.@playwright/test'] };
const dig = (obj, dotted) => dotted.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);

for (const [slug, p] of Object.entries(bridge.projects ?? {})) {
  if (!p?.path || !fs.existsSync(p.path)) continue;
  projectsRead += 1;
  const pkgPath = path.join(p.path, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      for (const [cap, paths] of Object.entries(STACK_KEYS)) {
        for (const dp of paths) {
          const v = majorOf(dig(pkg, dp));
          if (v !== null) { stack[cap] = Math.max(stack[cap] ?? 0, v); break; }
        }
      }
    } catch { /* a project with a broken package.json contributes no stack; it still contributes consults */ }
  }
  const log = path.join(p.path, '.ai', 'consults.jsonl');
  if (fs.existsSync(log)) {
    for (const line of fs.readFileSync(log, 'utf8').split(/\r?\n/)) {
      if (!line.trim()) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { continue; }
      const ts = Date.parse(rec.ts ?? '');
      if (!Number.isFinite(ts) || ts < since) continue;
      const bundle = String(rec.bundle ?? '').trim();
      if (!/^[a-z0-9-]+$/.test(bundle)) continue;
      consultLines += 1;
      const b = (bundles[bundle] ??= { consults: {}, deviations: {} });
      for (const s of rec.subjects ?? []) {
        if (!/^[a-z0-9-]+$/.test(String(s))) continue; // slugs only - a path-shaped value is dropped, not sanitized
        b.consults[s] = (b.consults[s] ?? 0) + 1;
        if (Number.isInteger(rec.deviations) && rec.deviations > 0) b.deviations[s] = (b.deviations[s] ?? 0) + rec.deviations;
      }
    }
  }
}
for (const b of Object.values(bundles)) { if (!Object.keys(b.deviations).length) delete b.deviations; }

const doc = {
  schema: 'rkb-signals/1',
  contributor,
  app: 'ai-registry-scripts',
  generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  windowDays: WINDOW_DAYS,
  stack,
  bundles,
  // No `meta`/notes key: the lane's key set is closed (check-signals.mjs) and an absent
  // `citations` already means "not measured, never zero" by the lane's own rule.
};
fs.mkdirSync(OUT_DIR, { recursive: true });
const out = path.join(OUT_DIR, `${contributor}.json`);
fs.writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`signals/${contributor}.json written - ${projectsRead} project(s) folded, ${consultLines} consult(s) in the last ${WINDOW_DAYS}d, ${Object.keys(bundles).length} bundle(s) witnessed, stack: ${JSON.stringify(stack)}`);
if (Object.keys(bundles).length === 0) console.log('  note: no consults logged yet - every bundle still reads UNWITNESSED until /consult runs in a connected project.');
