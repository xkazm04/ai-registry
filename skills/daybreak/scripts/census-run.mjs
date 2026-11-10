#!/usr/bin/env node
/**
 * census-run - dispatch a daybreak census: one read-only Codex per bounded chunk of source.
 *
 *   node census-run.mjs census --slug <s> --tree <dir> --runs <run-dir> --registry <root> [--map <registry-map.json>] [--slots 4]
 *   node census-run.mjs adjudicate --census <census.json> --roots <json> --runs <run-dir> --registry <root> [--slots 4]
 *
 * WHY: the first pilot scoped each survey from .ai/registry-map.json, whose context paths are
 * capped at 12. All 54 surveys finished clean having read 18% of the source. So the scope
 * here is the tree itself (git ls-files), and the map contributes only which standards to
 * name. Every chunk is resumable: a run directory already holding a `done` result is skipped.
 *
 * `adjudicate` is the second pass. A survey sees a handful of standards, so its `no-standard`
 * meant only "not among those I was shown". Each such part goes back to Codex with what the
 * whole registry's search returns for it.
 *
 *   node census-run.mjs rejudge --census <census.json> --roots <json> --runs <run-dir> --registry <root> [--slots 4]
 *
 * `rejudge` is the third pass. Passes that look for a standard to attach over-claim: the
 * rule is real and does not govern the code. Each `reinvents` must now pass scope,
 * responsibility and consequence, and quote the broken rule from the standard's own files.
 *
 *   node census-run.mjs judge --census <census.json> --roots <json> --runs <run-dir> --registry <root> --out <census.json> [--slots 4]
 *
 * `judge` is the whole judging chain in order: dedupe, adjudicate, rejudge, confirm, repeat.
 * Each finished stage is saved, so a rerun resumes. `confirm` makes a `consumes` that names a
 * standard show a rule and a line of code. `repeat` is a second independent judgment on each
 * upheld accusation; only agreement keeps it.
 */
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EXIT, installCrashDoor } from '../../../scripts/lib/exit-codes.mjs';
import { slots } from './ram-governor.mjs';
import { KINDS, quotedInFile, applyAdjudication, applyConfirm, applyRejudge, applyRepeat, dedupe, loadVerdicts, makeRuleFound } from './census.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte|py|rs|go|kt|java|cs|rb|php|swift)$/i;
const OUT_OF_SCOPE = [
  /(^|\/)\.[^/]+\//,
  /(^|\/)(node_modules|dist|build|out|vendor|coverage|__snapshots__|__mocks__|__tests__|__generated__|generated|fixtures?|tests?|e2e|uat|migrations)\//i,
  /\.(test|spec|stories|d)\.[a-z]+$/i,
  /\.min\.js$/i,
];

/** Pure: is this tracked file product source? */
export const inScope = (f) => CODE.test(f) && !OUT_OF_SCOPE.some((re) => re.test(f));

/**
 * Pure: bounded chunks in path order, so neighbours stay together. A file larger than the
 * byte budget gets a chunk of its own rather than being dropped.
 */
export function partition(files, { maxFiles = 30, maxBytes = 180000 } = {}) {
  const chunks = [];
  let cur = null;
  for (const f of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    if (!cur || cur.files.length >= maxFiles || cur.bytes + f.bytes > maxBytes) {
      cur = { files: [], bytes: 0 };
      chunks.push(cur);
    }
    cur.files.push(f.path);
    cur.bytes += f.bytes;
  }
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  return chunks.map((c, i) => ({ id: `c${String(i + 1).padStart(3, '0')}-${slug(path.posix.dirname(c.files[0]))}`, files: c.files, bytes: c.bytes }));
}

/** Pure: subjects of the map contexts that share a file or directory with this chunk. */
export function subjectsFor(chunk, contexts, cap = 6) {
  const files = new Set(chunk.files);
  const dirs = new Set(chunk.files.map((f) => path.posix.dirname(f)));
  const best = new Map();
  for (const c of contexts ?? []) {
    if (!(c.paths ?? []).some((p) => files.has(p) || dirs.has(path.posix.dirname(p)))) continue;
    for (const s of c.subjects ?? []) {
      const prior = best.get(s.subject);
      if (!prior || (s.score ?? 0) > (prior.score ?? 0)) best.set(s.subject, s);
    }
  }
  return [...best.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, cap);
}

const KIND_TERMS = {
  table: 'data table sorting filtering pagination', 'list-or-feed': 'long list windowing feed infinite scroll',
  chart: 'chart data visualization', form: 'form validation submission', 'modal-or-overlay': 'modal dialog focus overlay',
  'data-fetch-wrapper': 'client fetch cache loading state stale retry backoff', 'api-client-wrapper': 'retry backoff circuit breaking transient failure',
  'error-wrapper': 'retry backoff error classification', 'auth-wrapper': 'authorization guard route session',
  'cache-layer': 'cache invalidation stale', 'render-optimization': 'render performance memoization', 'background-job': 'background job queue worker retry',
};

// The standard that governs each kind of part, offered beside a cited one that may be wrong. Search picked
// bounded-enumeration for a table. A kind with no standard of its own gets none.
export const KIND_SUBJECT = Object.freeze({
  table: 'table', 'list-or-feed': 'feed', chart: 'data-viz', 'modal-or-overlay': 'modal-stack',
  'data-fetch-wrapper': 'client-fetch-cache', 'api-client-wrapper': 'retry-backoff', 'error-wrapper': 'retry-backoff',
  'auth-wrapper': 'authorization', 'cache-layer': 'client-state', 'background-job': 'background-jobs',
});

async function loadRegistry(registry) {
  const lib = await import(pathToFileURL(path.join(registry, 'scripts/lib/registry-query.mjs')).href);
  const projection = lib.loadProjection(registry, {});
  const search = (terms, top) => lib.query(projection, terms, { top, kinds: ['technique', 'subject'], budgetTokens: 6000 }).hits;
  return { search };
}

const fill = (tpl, values) => Object.entries(values).reduce((t, [k, v]) => t.split(`{{${k}}}`).join(v), tpl);
const templateOf = (name) => fs.readFileSync(path.join(HERE, '..', 'references', name), 'utf8').split(/^---$/m).slice(1).join('---').trim();

/** Run read-only surveys under the RAM governor; resolves when all have finished. */
function runPool(jobs, cwdOf, cap, log) {
  let active = 0, next = 0, finished = 0;
  const freeGb = () => os.freemem() / 1024 ** 3;
  return new Promise((resolve) => {
    const pump = () => {
      if (next >= jobs.length && active === 0) return resolve();
      while (next < jobs.length && active < Math.min(cap, slots({ freeGb: freeGb() }) + active)) {
        const j = jobs[next++];
        active += 1;
        const child = spawn(process.execPath, [path.join(HERE, 'codex-run.mjs'), '--cwd', cwdOf(j), '--brief', path.join(j.dir, 'brief.md'), '--run-dir', j.dir, '--sandbox', 'read', '--timeout-min', String(EFFORT.timeoutMin), '--effort', EFFORT.level], { stdio: 'ignore', windowsHide: true });
        child.on('close', (code) => {
          active -= 1; finished += 1;
          log(`${finished}/${jobs.length} ${j.id} exit=${code} free=${freeGb().toFixed(1)}GB`);
          pump();
        });
      }
      if (active === 0 && next < jobs.length) { log(`waiting for RAM: free=${freeGb().toFixed(1)}GB`); setTimeout(pump, 60000); }
    };
    pump();
  });
}

/** One automatic retry for a batch that did not finish; a second failure stays visible as unchecked. */
async function poolWithRetry(jobs, cwdOf, cap, log) {
  await runPool(jobs, cwdOf, cap, log);
  const failed = jobs.filter((j) => !isDone(j.dir));
  if (failed.length) { log(`retrying ${failed.length} unfinished`); await runPool(failed, cwdOf, cap, log); }
}

// Reasoning effort for every Codex job this process starts. High is slower, so it gets a longer timeout.
const EFFORT = { level: 'medium', timeoutMin: 30 };
export const effortOf = (level) => {
  if (level == null) return { level: 'medium', timeoutMin: 30 };
  if (!['low', 'medium', 'high'].includes(level)) throw new Error(`unknown effort ${level}`);
  return { level, timeoutMin: level === 'high' ? 60 : 30 };
};

const isDone = (dir) => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'result.json'), 'utf8')).class === 'done'; } catch { return false; } };

async function census(arg) {
  const slug = arg('--slug'), tree = arg('--tree'), runs = arg('--runs'), registry = path.resolve(arg('--registry'));
  const tracked = execFileSync('git', ['-C', tree, 'ls-files'], { encoding: 'utf8', maxBuffer: 1e9 }).split('\n').filter(Boolean);
  const scoped = tracked.filter(inScope).flatMap((f) => { try { return [{ path: f, bytes: fs.statSync(path.join(tree, f)).size }]; } catch { return []; } });
  const chunks = partition(scoped);
  const root = path.join(runs, 'census', slug);
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({ tracked: tracked.length, scoped: scoped.length, chunks }, null, 1) + '\n');
  let contexts = [];
  try { contexts = JSON.parse(fs.readFileSync(arg('--map') ?? path.join(tree, '.ai/registry-map.json'), 'utf8')).contexts ?? []; } catch { /* no map: name none */ }
  const { search } = await loadRegistry(registry);
  const kindLines = KINDS.map((k) => {
    const hit = search(KIND_TERMS[k], 1)[0];
    return hit ? `- ${k}: open ${registry.replace(/\\/g, '/')}/${hit.path}` : `- ${k}: none known`;
  }).join('\n');
  const addressOf = (s) => search(s.subject, 1).find((h) => h.subject === s.subject);
  const template = templateOf('census-brief.md');
  const jobs = [];
  for (const c of chunks) {
    const dir = path.join(root, c.id);
    if (isDone(dir)) continue;
    const named = subjectsFor(c, contexts).map((s) => {
      const hit = addressOf(s);
      return hit ? `- ${s.subject}: open ${registry.replace(/\\/g, '/')}/${hit.path}` : `- ${s.subject}`;
    }).join('\n') || 'none known';
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'brief.md'), fill(template, {
      chunk: c.id, files: c.files.map((f) => `- ${f}`).join('\n'), standards: named, kindStandards: kindLines, focus: arg('--focus') ?? 'none',
    }));
    jobs.push({ id: c.id, dir });
  }
  const log = (m) => fs.appendFileSync(path.join(runs, 'driver.log'), `${new Date().toISOString()} ${m}\n`);
  log(`census ${slug}: ${jobs.length} of ${chunks.length} chunks to run; ${scoped.length} of ${tracked.length} tracked files in scope`);
  await runPool(jobs, () => tree, Number(arg('--slots') ?? 4), log);
  log('census done');
}

/** Pure: search by what the part is and by what it does. Its own name retrieved a civic scraper for a retry wrapper. */
export function candidatesFor(p, search) {
  const seen = new Set();
  const queries = [[KIND_TERMS[p.kind] ?? p.kind, 3], [p.capabilities.join(' '), 3], [`${p.kind} ${p.name}`, 2]];
  return queries.flatMap(([q, n]) => (q.trim() ? search(q, n) : [])).filter((h) => !seen.has(h.path) && seen.add(h.path)).slice(0, 7);
}

async function adjudicate(arg) {
  const runs = arg('--runs'), registry = path.resolve(arg('--registry'));
  const censusFile = JSON.parse(fs.readFileSync(arg('--census'), 'utf8'));
  const roots = JSON.parse(fs.readFileSync(arg('--roots'), 'utf8'));
  const { search } = await loadRegistry(registry);
  const template = templateOf('adjudicate-brief.md');
  const byProject = {};
  for (const p of censusFile.parts) if (p.relation === 'no-standard') (byProject[p.project] ??= []).push(p);
  const jobs = [];
  for (const [slug, parts] of Object.entries(byProject)) {
    for (let i = 0; i < parts.length; i += 15) {
      const dir = path.join(runs, 'adjudicate', slug, `batch-${String(i / 15 + 1).padStart(3, '0')}`);
      if (isDone(dir)) continue;
      const list = parts.slice(i, i + 15).map((p) => {
        const candidates = candidatesFor(p, search).map((h) => `  - ${h.subject}${h.technique ? `/${h.technique}` : ''}: open ${registry.replace(/\\/g, '/')}/${h.path}`).join('\n');
        return `### ${p.id}\nKind: ${p.kind}. Name: ${p.name}. Code: ${p.file}:${p.line}.\nDoes: ${p.capabilities.join(', ')}.\nCandidate standards:\n${candidates || '  (none found)'}`;
      }).join('\n\n');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'brief.md'), fill(template, { parts: list }));
      jobs.push({ id: `${slug}-${path.basename(dir)}`, dir, slug });
    }
  }
  const log = (m) => fs.appendFileSync(path.join(runs, 'driver.log'), `${new Date().toISOString()} ${m}\n`);
  log(`adjudicate: ${jobs.length} batches`);
  await poolWithRetry(jobs, (j) => roots[j.slug], Number(arg('--slots') ?? 4), log);
  log('adjudicate done');
}

/** Pure: where a census subject's files live, given a search over the registry. Null if unknown. */
export function standardFiles(subject, search, exists) {
  const segments = String(subject ?? '').split('/').filter(Boolean);
  for (const seg of segments) {
    const hit = search(segments.join(' '), 6).concat(search(seg, 6)).find((h) => h.subject === seg || h.technique === seg);
    if (!hit) continue;
    const norm = hit.path.replace(/\\/g, '/');
    const dir = norm.includes('/techniques/') ? norm.slice(0, norm.indexOf('/techniques/')) : path.posix.dirname(norm);
    const last = segments[segments.length - 1];
    const files = [...new Set([`${dir}/${hit.subject}.md`, ...(last === hit.subject ? [] : [`${dir}/techniques/${last}.md`])])].filter(exists);
    const technique = last !== hit.subject && files.includes(`${dir}/techniques/${last}.md`) ? `${dir}/techniques/${last}.md` : null;
    if (files.length) return { dir, files, technique };
  }
  return null;
}

/**
 * Pure: what a judge may read, and what an accusation may quote. A claim that named a technique
 * is judged on that technique; the rest of the standard decides only whether it applies.
 */
export function accusationTargets(cited, other) {
  if (!cited && !other) return null;
  const follow = [cited?.dir, other?.dir].filter(Boolean);
  const accuse = [cited ? cited.technique ?? cited.dir : null, other?.dir].filter(Boolean);
  return { follow, accuse, files: [...(cited?.files ?? []), ...(other?.files ?? [])] };
}

const PASSES = {
  rejudge: { name: 'rejudge', brief: 'rejudge-brief.md', include: (p) => p.relation === 'reinvents' },
  // The cited standard may be the wrong one, so the standard for this kind of part is offered beside it.
  confirm: { name: 'confirm', brief: 'confirm-brief.md', include: (p) => p.relation === 'consumes' && !!p.subject, alternate: true },
  // A different mix per batch, so the second reading is not the first one's context again.
  repeat: { name: 'repeat', brief: 'rejudge-brief.md', include: (p) => p.relation === 'reinvents' && p.rejudged === 'upheld', shuffle: true },
};

const shuffled = (id) => crypto.createHash('sha1').update('repeat' + id).digest('hex');

async function accusationPass(arg, pass) {
  const runs = arg('--runs'), registry = path.resolve(arg('--registry'));
  const censusFile = JSON.parse(fs.readFileSync(arg('--census'), 'utf8'));
  const roots = JSON.parse(fs.readFileSync(arg('--roots'), 'utf8'));
  const { search } = await loadRegistry(registry);
  const template = templateOf(pass.brief);
  const reg = registry.replace(/\\/g, '/');
  const byProject = {};
  // Sorted by subject so a batch opens the same few standards instead of one each.
  for (const p of censusFile.parts) if (pass.include(p)) (byProject[p.project] ??= []).push(p);
  const jobs = [];
  for (const [slug, unsorted] of Object.entries(byProject)) {
    const parts = [...unsorted].sort((a, b) => (pass.shuffle ? shuffled(a.id).localeCompare(shuffled(b.id)) : String(a.subject).localeCompare(String(b.subject)) || a.id.localeCompare(b.id)));
    const root = path.join(runs, pass.name, slug);
    fs.mkdirSync(root, { recursive: true });
    const exists = (f) => fs.existsSync(path.join(registry, f));
    const found = new Map(parts.map((p) => {
      const cited = standardFiles(p.subject, search, exists);
      const other = pass.alternate && KIND_SUBJECT[p.kind] ? standardFiles(KIND_SUBJECT[p.kind], search, exists) : null;
      const usable = other && other.dir !== cited?.dir ? other : null;
      return [p.id, accusationTargets(cited, usable)];
    }));
    const abs = (xs) => xs.map((x) => `${reg}/${x}`);
    fs.writeFileSync(path.join(root, 'targets.json'), JSON.stringify(Object.fromEntries([...found].map(([id, t]) => [id, t ? { follow: abs(t.follow), accuse: abs(t.accuse) } : null])), null, 1) + '\n');
    for (let i = 0; i < parts.length; i += 15) {
      const dir = path.join(root, `batch-${String(i / 15 + 1).padStart(3, '0')}`);
      if (isDone(dir)) continue;
      const list = parts.slice(i, i + 15).map((p) => {
        const t = found.get(p.id);
        const files = t ? `${t.files.map((f) => `  - ${reg}/${f}`).join('\n')}\nAccuse from: ${t.accuse.map((x) => `${reg}/${x}`).join(', ')}` : '  (the cited standard could not be found)';
        return `### ${p.id}\nKind: ${p.kind}. Name: ${p.name}. Code: ${p.file}:${p.line}.\nCited standard: ${p.subject}.\nClaim: ${(p.missed ?? []).join(' ') || '(none given)'}\nStandard files:\n${files}`;
      }).join('\n\n');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'brief.md'), fill(template, { parts: list }));
      jobs.push({ id: `${slug}-${path.basename(dir)}`, dir, slug });
    }
  }
  const log = (m) => fs.appendFileSync(path.join(runs, 'driver.log'), `${new Date().toISOString()} ${m}\n`);
  log(`${pass.name}: ${jobs.length} batches`);
  await poolWithRetry(jobs, (j) => roots[j.slug], Number(arg('--slots') ?? 4), log);
  log(`${pass.name} done`);
}

const rejudge = (arg) => accusationPass(arg, PASSES.rejudge);

/** Every stage saved as it finishes; a stage already recorded in the census is skipped. */
async function judge(arg) {
  const runs = arg('--runs'), out = arg('--out');
  const roots = JSON.parse(fs.readFileSync(arg('--roots'), 'utf8'));
  let cur = JSON.parse(fs.readFileSync(arg('--census'), 'utf8'));
  // A quote may come from the part's file or, for a trigger, from the file it originates in.
  const codeFound = (p, quote, file = p.file) => quotedInFile(roots[p.project], file, quote);
  const save = () => fs.writeFileSync(out, JSON.stringify(cur, null, 1) + '\n');
  const a = (n) => (n === '--census' ? out : arg(n));
  const passDir = (name) => path.join(runs, name);
  if (!cur.deduped) { cur = dedupe(cur); }
  save();
  if (!cur.adjudication) {
    await adjudicate(a);
    cur = applyAdjudication(cur, loadVerdicts(passDir('adjudicate')).verdicts); save();
  }
  if (!cur.rejudge) {
    await accusationPass(a, PASSES.rejudge);
    const v = loadVerdicts(passDir('rejudge'));
    cur = applyRejudge(cur, v.verdicts, makeRuleFound(v.targets), codeFound); save();
  }
  if (!cur.confirm) {
    await accusationPass(a, PASSES.confirm);
    const v = loadVerdicts(passDir('confirm'));
    cur = applyConfirm(cur, v.verdicts, makeRuleFound(v.targets), codeFound); save();
  }
  if (!cur.repeat) {
    await accusationPass(a, PASSES.repeat);
    const v = loadVerdicts(passDir('repeat'));
    cur = applyRepeat(cur, v.verdicts, makeRuleFound(v.targets), codeFound); save();
  }
  console.log(JSON.stringify({ deduped: cur.deduped, adjudication: cur.adjudication, rejudge: cur.rejudge, confirm: cur.confirm, repeat: cur.repeat }));
}

async function main() {
  installCrashDoor();
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = (n) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : null; };
  Object.assign(EFFORT, effortOf(arg('--effort')));
  if (cmd === 'census' && arg('--slug') && arg('--tree') && arg('--runs') && arg('--registry')) await census(arg);
  else if (cmd === 'adjudicate' && arg('--census') && arg('--roots') && arg('--runs') && arg('--registry')) await adjudicate(arg);
  else if (cmd === 'rejudge' && arg('--census') && arg('--roots') && arg('--runs') && arg('--registry')) await rejudge(arg);
  else if (cmd === 'judge' && arg('--census') && arg('--roots') && arg('--runs') && arg('--registry') && arg('--out')) await judge(arg);
  else { console.error('usage: census-run.mjs census|adjudicate|rejudge|judge (see the header)'); process.exit(EXIT.FATAL); }
  process.exit(EXIT.OK);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
