#!/usr/bin/env node
/**
 * registry-lens - how one product stands against this registry, feature by feature, as the
 * JSON rows a lens-scan `script` step reads.
 *
 * ## Why rows and not a report
 *
 * bp's registry lens (`com.xkazm04.registry`) is a lens like any other: a manifest with fields,
 * measured per feature, trended over time. lens-scan runs this script as a composed scan step
 * and records each row as a static measurement, so the contract is exactly the steps row
 * contract - `[{feature, metric, value, evidence?, applicable?, reason?}]` - and nothing else
 * reaches stdout. The meaning of every metric lives in docs/registry-lens.md.
 *
 * ## The join
 *
 * The registry map is per CONTEXT; bp measures per FEATURE. A feature's files are the
 * `file_paths` of the structure contexts it names (adopt-bp's app-structure.json). A context
 * from the product's full `context-map.json` claims the feature when the two file sets overlap
 * at all - so a feature is measured over every context that holds any of its code, and a
 * directory entry on either side is expanded to the tracked files under it first. A feature
 * no context claims is reported `applicable: false` with the reason, never as zeroes.
 *
 * ## Unmeasured is not zero
 *
 * No registry map means nobody has joined this product to the registry: the per-feature
 * metrics are OMITTED, which bp reads as unmeasured. Writing 0 would say "measured, and
 * nothing governs this", which is a different and false claim. The same rule holds for a
 * percentage with no denominator. An `unknown` pair counts toward `topicsMapped` and never
 * toward `judgedPct` - it is mapped, not judged, and certainly not a pass.
 *
 *   node scripts/registry-lens.mjs --project <slug> --path <root> [--structure <file>]
 *                                  [--features a,b] [--registry <dir>] --json
 *
 * `--registry` names the registry checkout whose projects.json, .machine.local.json and
 * librarian/inbox.md answer the project-level metrics; it defaults to the one this script
 * sits in. Never writes anything. Exit 0 with rows; exit 2 with a one-line reason on bad input.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const EVIDENCE_SUBJECTS = 5;

class BadInput extends Error {}

const readJson = (file, what) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { throw new BadInput(`${what} is not readable JSON: ${file} (${e.message})`); }
};
const norm = (p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '');
const samePath = (a, b) => {
  const x = path.resolve(a);
  const y = path.resolve(b);
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
};
const lines = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()) : null);
const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Directory entries -> the tracked files under them. `git ls-files` runs once per product and
 * only when some entry is a directory; outside a git checkout the tree is walked instead.
 */
function fileExpander(root) {
  let tracked = null;
  const all = () => {
    if (tracked) return tracked;
    try {
      tracked = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] })
        .split('\0').filter(Boolean).map(norm);
    } catch {
      tracked = [];
      const walk = (dir) => {
        for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
          if (e.name === '.git' || e.name === 'node_modules') continue;
          const rel = dir ? `${dir}/${e.name}` : e.name;
          if (e.isDirectory()) walk(rel); else tracked.push(rel);
        }
      };
      walk('');
    }
    return tracked;
  };
  return (entries) => {
    const out = new Set();
    for (const raw of entries ?? []) {
      const p = norm(raw).replace(/\/+$/, '');
      if (!p) continue;
      let dir = norm(raw).endsWith('/');
      if (!dir) { try { dir = fs.statSync(path.join(root, p)).isDirectory(); } catch { dir = false; } }
      if (!dir) { out.add(p); continue; }
      for (const f of all()) if (f.startsWith(`${p}/`)) out.add(f);
    }
    return out;
  };
}

/** context-map.json in either generator shape, keyed the way build-registry-map keys them. */
function contextMapContexts(cm) {
  const out = [];
  const push = (c, group) => out.push({
    key: c.id ?? `${group ? `${group}/` : ''}${c.name}`,
    name: c.name,
    paths: c.file_paths ?? c.filePaths ?? [],
  });
  if (Array.isArray(cm.contexts) && cm.contexts.length && cm.contexts[0]?.name) for (const c of cm.contexts) push(c, c.group ?? null);
  for (const g of cm.groups ?? []) for (const c of g.contexts ?? []) push(c, g.name);
  for (const c of cm.ungrouped ?? []) push(c, null);
  return out;
}

/** LANDED rows of librarian/inbox.md whose `from` cell names this project. */
function landedLeads(inboxFile, slug) {
  const rows = lines(inboxFile);
  if (!rows) return null;
  let n = 0;
  for (const line of rows) {
    if (!line.startsWith('|') || !line.includes('LANDED')) continue;
    // The claim cell carries escaped pipes, so split on unescaped ones only.
    const cells = line.split(/(?<!\\)\|/).map((c) => c.trim());
    const from = cells[cells.length - 2] ?? '';
    if (from.startsWith(`${slug} /`)) n += 1;
  }
  return n;
}

export function projectRows({ slug, root, registry = ROOT }) {
  const out = [];
  const fleet = loadFleet(registry);
  if (fleet.machine) {
    const p = fleet.projects[slug];
    const ok = Boolean(p && samePath(p.path, root));
    out.push({ metric: 'registered', value: ok ? 1 : 0,
      evidence: ok ? `project-level: projects.json ${slug} -> ${p.relPath} on ${fleet.machine}`
        : p ? `project-level: projects.json ${slug} resolves to ${p.path} on ${fleet.machine}, not to --path`
          : `project-level: ${slug} has no checkout for ${fleet.machine} in projects.json` });
  }
  // No machine identity: whether the slug resolves here is unanswerable, so the row is omitted.
  const ai = path.join(root, '.ai');
  const filed = lines(path.join(ai, 'registry-leads.jsonl'));
  out.push({ metric: 'leadsFiled', value: filed?.length ?? 0,
    evidence: `project-level: ${filed ? `${filed.length} line(s) in .ai/registry-leads.jsonl` : 'no .ai/registry-leads.jsonl'}` });
  const landed = landedLeads(path.join(registry, 'librarian', 'inbox.md'), slug);
  if (landed !== null) out.push({ metric: 'leadsLanded', value: landed, evidence: `project-level: ${landed} LANDED row(s) from "${slug} /" in librarian/inbox.md` });
  const applied = lines(path.join(ai, 'applied.jsonl'));
  let better = 0;
  for (const l of applied ?? []) { try { if (JSON.parse(l).verdict === 'better') better += 1; } catch { /* a torn line is not a verdict */ } }
  out.push({ metric: 'appliedBetter', value: better,
    evidence: `project-level: ${applied ? `${better} of ${applied.length} line(s) in .ai/applied.jsonl with verdict better` : 'no .ai/applied.jsonl'}` });
  return out;
}

/** The per-feature numbers over a set of registry-map rows. Values omitted, never zeroed. */
export function pairMetrics(mapRows) {
  const pairs = new Map();
  for (const row of mapRows) for (const s of row.subjects ?? []) pairs.set(`${row.context}|${s.subject}`, s);
  const all = [...pairs.values()];
  const judged = all.filter((s) => s.state && s.state !== 'unknown');
  const conformant = judged.filter((s) => s.state === 'conformant').length;
  const deviations = judged.filter((s) => s.state === 'deviation').length;
  const m = {
    topicsMapped: all.length,
    deviations,
    staleVerdicts: all.filter((s) => s.stale === true || s.revisionsBehind > 0).length,
  };
  if (all.length) m.judgedPct = round1((100 * judged.length) / all.length);
  // Conformance is asked only of pairs the subject governs: a not-applicable verdict is the
  // matcher's miss, not the product's shortfall, so it stays out of both sides.
  if (conformant + deviations) m.conformantPct = round1((100 * conformant) / (conformant + deviations));
  return { metrics: m, subjects: [...new Set(all.map((s) => s.subject))] };
}

export function registryLensRows({ slug, root, structure, features, registry = ROOT }) {
  if (!SLUG_RE.test(slug ?? '')) throw new BadInput(`--project must be a slug, got "${slug ?? ''}"`);
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new BadInput(`--path is not a directory: ${root ?? ''}`);
  const structFile = structure ? path.resolve(structure) : path.join(root, '.ai', 'lens-scan', 'app-structure.json');
  if (!fs.existsSync(structFile)) throw new BadInput(`no app structure at ${structFile} - pass --structure`);
  const struct = readJson(structFile, 'the app structure');
  let feats = Array.isArray(struct.features) ? struct.features : [];
  if (features?.length) {
    const known = new Set(feats.map((f) => f.slug));
    const missing = features.filter((f) => !known.has(f));
    if (missing.length) throw new BadInput(`--features names unknown feature(s): ${missing.join(', ')}`);
    feats = feats.filter((f) => features.includes(f.slug));
  }

  const expand = fileExpander(root);
  const structPaths = new Map((struct.contexts ?? []).map((c) => [c.name, c.file_paths ?? []]));
  const cmFile = path.join(root, 'context-map.json');
  const contexts = fs.existsSync(cmFile)
    ? contextMapContexts(readJson(cmFile, 'context-map.json')).map((c) => ({ ...c, files: expand(c.paths) }))
    : null;
  const mapFile = path.join(root, '.ai', 'registry-map.json');
  const map = fs.existsSync(mapFile) ? readJson(mapFile, 'the registry map') : null;
  const mapByKey = new Map((map?.contexts ?? []).map((r) => [r.context, r]));
  const shared = projectRows({ slug, root, registry });

  const rows = [];
  for (const f of feats) {
    const files = expand((f.contexts ?? []).flatMap((n) => structPaths.get(n) ?? []));
    if (contexts) {
      const claiming = contexts.filter((c) => [...c.files].some((p) => files.has(p)));
      if (!claiming.length) {
        rows.push({ feature: f.slug, applicable: false, reason: files.size
          ? 'no context in context-map.json claims its files'
          : 'its structure contexts list no files' });
        continue;
      }
      const mapRows = claiming.map((c) => mapByKey.get(c.key)).filter(Boolean);
      // A context the map has never seen is unmeasured; only the ones it holds are counted.
      if (map && mapRows.length) {
        const { metrics, subjects } = pairMetrics(mapRows);
        const unmapped = claiming.filter((c) => !mapByKey.has(c.key)).map((c) => c.name);
        const shown = subjects.slice(0, EVIDENCE_SUBJECTS).join(', ');
        const more = subjects.length > EVIDENCE_SUBJECTS ? ` (+${subjects.length - EVIDENCE_SUBJECTS} more)` : '';
        const evidence = `contexts: ${mapRows.map((r) => r.name ?? r.context).join(', ')}`
          + `${unmapped.length ? `; not in the registry map: ${unmapped.join(', ')}` : ''}`
          + `; subjects: ${shown || 'none'}${more}`;
        for (const [metric, value] of Object.entries(metrics)) rows.push({ feature: f.slug, metric, value, evidence });
      }
    }
    for (const r of shared) rows.push({ feature: f.slug, ...r });
  }
  return rows;
}

const isMain = process.argv[1] && samePath(process.argv[1], fileURLToPath(import.meta.url));
if (isMain) {
  const argv = process.argv.slice(2);
  const arg = (flag) => { const i = argv.indexOf(flag); return i === -1 ? null : argv[i + 1] ?? null; };
  // The flag set is CLOSED. lens-scan runs this unattended and records whatever rows come
  // back: `--feature x` (singular) used to be ignored and every feature measured, and a
  // valued flag at the end of the line (`--registry`) silently took its default.
  const VALUED = new Set(['--project', '--path', '--structure', '--features', '--registry']);
  const closed = () => {
    for (let i = 0; i < argv.length; i++) {
      if (argv[i] === '--json') continue;
      if (!VALUED.has(argv[i])) throw new BadInput(`unknown argument ${JSON.stringify(argv[i])}`);
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) throw new BadInput(`${argv[i]} needs a value`);
      i++;
    }
  };
  try {
    closed();
    const features = arg('--features')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null;
    const root = arg('--path');
    const rows = registryLensRows({
      slug: arg('--project'),
      root: root && path.resolve(root),
      structure: arg('--structure'),
      features,
      registry: arg('--registry') ? path.resolve(arg('--registry')) : ROOT,
    });
    process.stdout.write(`${JSON.stringify(rows, null, argv.includes('--json') ? 0 : 2)}\n`);
    process.exitCode = EXIT.OK;
  } catch (e) {
    console.error(`registry-lens: ${e instanceof BadInput ? e.message : `could not run: ${e.message}`}`);
    process.exitCode = EXIT.FATAL;
  }
}
