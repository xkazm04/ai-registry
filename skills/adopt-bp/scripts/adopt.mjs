#!/usr/bin/env node
// adopt-bp: the deterministic half of onboarding a repo into the bp product blueprint.
// The LLM half (product tree, judgement) writes JSON into <root>/.ai/lens-scan/work/; this script
// checks, seeds, measures, merges, validates and registers. Spec: bp docs/standard/app-structure-v3.md.
// Every store write, every static metric and every facet refresh goes through the sibling /lens-scan
// skill's scripts (store.mjs, footprint.mjs, structure.mjs): one writer, one metric catalog, one series.
//
//   node adopt.mjs check     [--root .] [--bp <bp checkout>]          what exists, what is needed (JSON with --json)
//   node adopt.mjs seed      [--root .] [--bp ..] [--slug s --name n] skeleton v3 map + work/inventory.json
//   node adopt.mjs tree      [--root .]                               merge work/product-tree.json into the map
//   node adopt.mjs events    [--root .]                               events.jsonl from git history (append-only)
//   node adopt.mjs measure   [--root .] [--bp ..]                     static metrics -> scan.db + facets
//   node adopt.mjs batches   [--root .] [--size 8]                    work/batches/NN.json for the judgement pass
//   node adopt.mjs judge     [--root .] [--model m]                   merge work/judgement/*.json -> facets + store
//   node adopt.mjs validate  [--root .] [--bp ..]                     bp validator + adopt's own checks
//   node adopt.mjs register  [--root .] [--bp ..] [--slug s --name n] bp.products.local.json + .gitignore
//   node adopt.mjs report    [--root .]                               ADOPT.md + work/report.json
//
// Exit 1 on an error the next phase cannot survive; warnings never fail.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// node:sqlite still prints an ExperimentalWarning on every run; it is noise in an agent's transcript.
const emitWarning = process.emitWarning.bind(process);
process.emitWarning = (w, ...a) => (/SQLite/.test(String(w)) ? undefined : emitWarning(w, ...a));
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LENS_SCAN = path.join(HERE, '..', '..', 'lens-scan', 'scripts');
const REGISTRY = path.resolve(HERE, '..', '..', '..');
const lensScan = async () => {
  if (!fs.existsSync(path.join(LENS_SCAN, 'store.mjs'))) die(`the lens-scan skill is not beside adopt-bp (${LENS_SCAN}); install the registry's skills lane, not adopt-bp alone`);
  const url = (f) => pathToFileURL(path.join(LENS_SCAN, f)).href;
  const [store, footprint, structure] = await Promise.all([import(url('store.mjs')), import(url('footprint.mjs')), import(url('structure.mjs'))]);
  return { store, footprint, structure };
};
const SKILL_VERSION = (fs.readFileSync(path.join(HERE, '..', 'SKILL.md'), 'utf8').match(/^version:\s*(\S+)/m) ?? [])[1] ?? '0';
const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const flag = (k) => argv.includes(`--${k}`);
const ROOT = path.resolve(opt('root', '.'));
const STORE = path.join(ROOT, '.ai', 'lens-scan');
const WORK = path.join(STORE, 'work');
const MAP = path.join(STORE, 'app-structure.json');
const EVENTS = path.join(STORE, 'events.jsonl');
const DB = path.join(STORE, 'scan.db');
const STAGES = ['idea', 'specified', 'in-dev', 'in-review', 'flagged', 'live', 'deprecated'];
const SLUG = /^[a-z0-9][a-z0-9.-]*$/; // app-structure slug (spec 3)
const PRODUCT_SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/; // bp's registry (src/lib/scan/readiness.ts SLUG_RE)
const now = () => new Date().toISOString();
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); const t = `${f}.tmp`; fs.writeFileSync(t, `${JSON.stringify(v, null, 2)}\n`); fs.renameSync(t, f); };
const exists = (f) => fs.existsSync(f);
const posix = (p) => p.split(path.sep).join('/');
const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'x';
let errors = 0;
const err = (m) => { errors += 1; console.error(`error: ${m}`); };
const warn = (m) => console.error(`warn: ${m}`);
const die = (m) => { console.error(`adopt-bp: ${m}`); process.exit(1); };

// ------------------------------------------------------------------------------------- bp checkout
function bpRoot(required = true) {
  const cands = [opt('bp'), process.env.ADOPT_BP_ROOT, path.join(ROOT, '..', 'bp'), path.join(HERE, '..', '..', '..', '..', 'bp')].filter(Boolean);
  for (const c of cands) if (exists(path.join(c, 'docs', 'standard', 'lenses', 'development.json'))) return path.resolve(c);
  if (required) die(`no bp checkout found (tried ${cands.join(', ')}); pass --bp <path> or set ADOPT_BP_ROOT`);
  return null;
}
const builtinLenses = (bp) => fs.readdirSync(path.join(bp, 'docs', 'standard', 'lenses')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => readJson(path.join(bp, 'docs', 'standard', 'lenses', f)));

// ------------------------------------------------------------------------------------- git
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8', maxBuffer: 1 << 30 });
const isGit = () => { try { git('rev-parse', '--git-dir'); return true; } catch { return false; } };
/** One pass over history: per file, first/last commit date and commit count (renames not followed). */
function fileHistory() {
  const out = git('log', '--no-merges', '--name-only', '--format=%x00%cI');
  const h = new Map();
  for (const block of out.split('\0')) {
    const lines = block.split('\n').filter(Boolean);
    if (!lines.length) continue;
    const at = lines[0];
    for (const f of lines.slice(1)) {
      const r = h.get(f);
      if (!r) h.set(f, { first: at, last: at, commits: 1 });
      else { r.first = at; r.commits += 1; } // log is newest first
    }
  }
  return h;
}

// ------------------------------------------------------------------------------------- context map
function findContextMap() {
  for (const f of ['context-map.json', '.ai/context-map.json', 'docs/context-map.json']) {
    const p = path.join(ROOT, f);
    if (!exists(p)) continue;
    try {
      const m = readJson(p);
      const version = m.$schema === 'app-structure/3' ? 3 : m.version ?? (Array.isArray(m.contexts) ? 2 : null);
      return { file: f, path: p, map: m, version, contexts: (m.contexts ?? []).length, groups: (m.groups ?? []).length };
    } catch (e) { return { file: f, path: p, error: e.message }; }
  }
  return null;
}

// ------------------------------------------------------------------------------------- file facts
// Inventory and batch rows only (what the model reads). The measured numbers come from footprint.mjs.
const UI_RE = /\.(tsx|jsx|vue|svelte|html)$/;
const CODE_RE = /\.([cm]?[jt]sx?|vue|svelte|py|rs|go|java|kt|cs|cpp|cc|c|h|hpp|rb|php|swift|css|scss|sql)$/;
let FP = null; // lens-scan footprint module, loaded once
let FILES = null;
const repoFiles = () => (FILES ??= FP.repoFiles(ROOT));
const expand = (paths) => FP.expandPaths(paths, ROOT, repoFiles());
function fileFacts(rel, cache) {
  if (cache.has(rel)) return cache.get(rel);
  let f = null;
  try {
    const st = fs.statSync(path.join(ROOT, rel));
    if (st.isFile() && st.size < 2_000_000) {
      const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      f = { rel, loc: FP.nonBlank(text), test: FP.isTest(rel), ui: UI_RE.test(rel), code: CODE_RE.test(rel) };
    }
  } catch { /* missing on disk: the context map is stale here */ }
  cache.set(rel, f);
  return f;
}

// ------------------------------------------------------------------------------------- map io
function loadMap() { if (!exists(MAP)) die(`no map at ${MAP} - run seed first`); return readJson(MAP); }
function saveMap(m) {
  m.generated_at = now();
  m.generator = 'adopt-bp';
  m.stats = { groups: (m.groups ?? []).length, contexts: (m.contexts ?? []).length, features: (m.features ?? []).length, kpis: (m.kpis ?? []).length, lenses: (m.lenses ?? []).length };
  writeJson(MAP, m);
}

// =================================================================================== check
function check() {
  const bp = bpRoot(false);
  const cm = findContextMap();
  const items = [];
  const add = (key, state, detail, need) => items.push({ key, state, detail, ...(need ? { need } : {}) });
  const nodeOk = Number(process.versions.node.split('.')[0]) > 22 || (Number(process.versions.node.split('.')[0]) === 22 && Number(process.versions.node.split('.')[1]) >= 5);
  add('node', nodeOk ? 'ok' : 'missing', `node ${process.versions.node}`, nodeOk ? null : 'node >= 22.5 (node:sqlite)');
  add('git', isGit() ? 'ok' : 'missing', ROOT, isGit() ? null : 'a git repo (events and stage evidence come from history)');
  add('bp', bp ? 'ok' : 'missing', bp ?? 'not found', bp ? null : 'pass --bp <bp checkout> or set ADOPT_BP_ROOT');
  if (!cm) add('context-map', 'missing', 'no context-map.json', 'phase 0: build the code tree (contexts) - see SKILL.md');
  else if (cm.error) add('context-map', 'broken', `${cm.file}: ${cm.error}`, 'fix or regenerate the context map');
  else {
    let tracked = true;
    try { tracked = git('ls-files', cm.file).trim() !== ''; } catch { /* not git */ }
    add('context-map', 'ok', `${cm.file} v${cm.version}, ${cm.contexts} contexts, ${cm.groups} groups${tracked ? '' : ', UNTRACKED'}`, tracked ? null : 'commit the context map so a fresh clone can be adopted');
    if (cm.map.contexts) {
      const names = cm.map.contexts.map((c) => c.name);
      const dups = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
      const dirs = cm.map.contexts.flatMap((c) => c.file_paths ?? []).filter((f) => f.endsWith('/')).length;
      const ungrouped = cm.map.contexts.filter((c) => !c.group).length;
      if (dups.length || ungrouped || dirs) add('context-map-defects', 'warn', [dups.length ? `duplicate names: ${dups.join(', ')}` : '', ungrouped ? `${ungrouped} ungrouped` : '', dirs ? `${dirs} directory paths (expanded to tracked files)` : ''].filter(Boolean).join('; '), dups.length ? 'seed renames duplicates (name-<group>); fix the source map when you can' : null);
      const all = cm.map.contexts.flatMap((c) => c.file_paths ?? []);
      const missing = all.filter((f) => !exists(path.join(ROOT, f))).length;
      add('context-map-fresh', missing / Math.max(1, all.length) > 0.1 ? 'stale' : 'ok', `${all.length - missing}/${all.length} mapped files exist`, missing / Math.max(1, all.length) > 0.1 ? 'rescan contexts before adopting' : null);
    }
  }
  let map = null;
  if (exists(MAP)) { try { map = readJson(MAP); } catch (e) { add('map', 'broken', e.message, 'reseed'); } }
  if (map) {
    const f = map.features ?? [];
    add('map', 'ok', `v${map.$schema === 'app-structure/3' ? 3 : map.version}, ${(map.contexts ?? []).length} contexts`);
    add('product-tree', f.length ? 'ok' : 'missing', `${(map.domains ?? []).length} domains, ${(map.capabilities ?? []).length} capabilities, ${f.length} features`, f.length ? null : 'phase A: product tree');
    add('stages', f.length && f.every((x) => x.stage) ? 'ok' : 'missing', `${f.filter((x) => x.stage).length}/${f.length} staged`, f.every((x) => x.stage) && f.length ? null : 'phase A sets stage');
    add('lenses', (map.lenses ?? []).length ? 'ok' : 'missing', `${(map.lenses ?? []).length} lenses`, (map.lenses ?? []).length ? null : 'seed copies the built-in lenses');
    const facets = Object.values(map.facets ?? {}).flatMap((x) => Object.values(x));
    const judged = facets.filter((x) => x.values && ['dupSites', 'findingsCritical', 'undesignedStates'].some((k) => k in x.values)).length;
    add('static-metrics', facets.length ? 'ok' : 'missing', `${facets.length} facets`, facets.length ? null : 'measure');
    add('judgement', judged ? 'ok' : 'missing', `${judged} judged facets`, judged ? null : 'phase B: judgement');
  } else if (!items.some((i) => i.key === 'map')) add('map', 'missing', MAP, 'seed');
  add('events', exists(EVENTS) ? 'ok' : 'missing', exists(EVENTS) ? `${fs.readFileSync(EVENTS, 'utf8').split('\n').filter(Boolean).length} events` : 'none', exists(EVENTS) ? null : 'events');
  add('store', exists(DB) ? 'ok' : 'missing', exists(DB) ? DB : 'none', exists(DB) ? null : 'measure creates it');
  const gi = exists(path.join(ROOT, '.gitignore')) ? fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8') : '';
  let ignored = /^\/?\.ai\/lens-scan\/?$/m.test(gi) || /^\/?\.ai\/?$/m.test(gi);
  if (!ignored) { try { git('check-ignore', '-q', '.ai/lens-scan/app-structure.json'); ignored = true; } catch { /* not ignored */ } }
  add('gitignore', ignored ? 'ok' : 'missing', ignored ? '.ai/lens-scan ignored' : 'not ignored', ignored ? null : 'register adds .ai/lens-scan/ to .gitignore');
  if (bp) {
    const reg = path.join(bp, 'bp.products.local.json');
    const prods = exists(reg) ? (readJson(reg).products ?? []) : [];
    const mine = prods.find((p) => path.resolve(p.root ?? '') === ROOT || path.resolve(bp, p.root ?? '') === ROOT);
    add('registered', mine ? 'ok' : 'missing', mine ? `as ${mine.slug}` : 'not in bp.products.local.json', mine ? null : 'register');
  }
  const needed = items.filter((i) => i.need);
  if (flag('json')) { console.log(JSON.stringify({ root: ROOT, bp, items, needed: needed.map((i) => i.key) }, null, 2)); return; }
  console.log(`adopt-bp check - ${ROOT}`);
  for (const i of items) console.log(`  ${i.state === 'ok' ? '✓' : i.state === 'missing' ? '·' : '!'} ${i.key.padEnd(18)} ${i.detail}${i.need ? `  -> ${i.need}` : ''}`);
  console.log(needed.length ? `\nneeded: ${needed.map((i) => i.key).join(', ')}` : '\nadopted: nothing needed');
}

// =================================================================================== seed
async function seed() {
  const bp = bpRoot();
  const LS = await lensScan();
  FP = LS.footprint;
  const cm = findContextMap();
  if (!cm || cm.error || !Array.isArray(cm.map.contexts) || !cm.map.contexts.length) die('no usable context map (contexts[]): run phase 0 first (SKILL.md), writing context-map.json in v2 shape');
  const prev = exists(MAP) ? readJson(MAP) : null;
  const slug = opt('slug') ?? prev?.project?.slug ?? slugify(cm.map.project?.name ?? path.basename(ROOT));
  const name = opt('name') ?? prev?.project?.name ?? cm.map.project?.name ?? path.basename(ROOT);
  const lenses = builtinLenses(bp).map((m) => ({ id: m.id, version: m.version, source: 'builtin', enabled: true, manifest: m }));
  // Rescan rule (spec 11): regenerate the code tree, keep everything else, keep project lenses and orphaned facets.
  const map = {
    $schema: 'app-structure/3', version: 3,
    project: { slug, name, ...(cm.map.project?.id ? { id: cm.map.project.id } : {}) },
    generator: 'adopt-bp', generated_at: now(),
    provenance: { ...(prev?.provenance ?? {}), source: 'context-map.json', git_commit: isGit() ? git('rev-parse', 'HEAD').trim() : undefined, context_map: cm.file, context_map_version: cm.version, skill_version: SKILL_VERSION },
    taxonomy: { ...(cm.map.taxonomy ?? {}), ...(prev?.taxonomy ?? {}) },
    groups: (cm.map.groups ?? []).map(clean),
    contexts: dedupe(LS.structure, cm.map.contexts.map(clean)),
    domains: prev?.domains ?? [], capabilities: prev?.capabilities ?? [], features: prev?.features ?? [],
    milestones: prev?.milestones ?? [], kpis: prev?.kpis ?? [],
    lenses: [...lenses, ...(prev?.lenses ?? []).filter((l) => l.source === 'project')],
    facets: prev?.facets ?? {},
    ...(prev?.extensions ? { extensions: prev.extensions } : {}),
  };
  for (const k of ['milestones', 'kpis', 'domains', 'capabilities', 'features']) if (!map[k].length) delete map[k];
  saveMap(map);
  // inventory: what the product-tree pass reads instead of crawling the repo
  const hist = isGit() ? fileHistory() : new Map();
  const cache = new Map();
  const inv = map.contexts.map((c) => {
    const paths = expand(c.file_paths);
    const files = paths.map((f) => fileFacts(f, cache)).filter(Boolean);
    const h = paths.map((f) => hist.get(f)).filter(Boolean);
    return {
      name: c.name, group: c.group, category: c.category, business_feature: c.business_feature, description: c.description,
      entry_points: c.entry_points ?? [], api_surface: c.api_surface || undefined, db_tables: c.db_tables?.length ? c.db_tables : undefined,
      files: files.length, missing_files: paths.length - files.length, loc: files.reduce((n, f) => n + f.loc, 0),
      test_files: files.filter((f) => f.test).length, ui_files: files.filter((f) => f.ui).length,
      first_commit: h.length ? h.map((x) => x.first).sort()[0].slice(0, 10) : undefined,
      last_commit: h.length ? h.map((x) => x.last).sort().at(-1).slice(0, 10) : undefined,
      commits: h.reduce((n, x) => n + x.commits, 0),
    };
  });
  writeJson(path.join(WORK, 'inventory.json'), { root: posix(ROOT), project: map.project, generated_at: now(), groups: map.groups.map((g) => ({ name: g.name, domain: g.domain, context_count: g.context_count })), contexts: inv });
  console.log(`seeded ${posix(path.relative(ROOT, MAP))}: ${map.contexts.length} contexts, ${map.groups.length} groups, ${lenses.length} built-in lenses${prev ? ' (rescan: product tree, facets and project lenses kept)' : ''}`);
  console.log(`inventory: ${posix(path.relative(ROOT, path.join(WORK, 'inventory.json')))} (${inv.reduce((n, c) => n + c.loc, 0)} lines across ${inv.reduce((n, c) => n + c.files, 0)} files)`);
}
/** Context names are the code tree's key (spec 5): lens-scan's rule, so both skills key the tree alike. */
function dedupe(structureMod, cs) {
  const { contexts, renamed } = structureMod.dedupeContexts(cs);
  for (const r of renamed) warn(`context name "${r.from}" is duplicated in the context map; the copy in group "${r.group}" is renamed "${r.to}"`);
  return contexts;
}
function clean(o) { const r = {}; for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined && k !== 'root') r[k] = v; return r; }

// =================================================================================== tree
function tree() {
  const map = loadMap();
  const f = path.join(WORK, 'product-tree.json');
  if (!exists(f)) die(`no ${f} - phase A writes it (references/product-tree.md)`);
  const t = readJson(f);
  const ctx = new Set(map.contexts.map((c) => c.name));
  const doms = t.domains ?? [], caps = t.capabilities ?? [], feats = t.features ?? [];
  const uniq = (xs, what) => { const s = new Set(); for (const x of xs) { if (!x.slug || !SLUG.test(x.slug)) err(`${what} slug "${x.slug}" is not a slug`); if (s.has(x.slug)) err(`${what} slug "${x.slug}" twice`); s.add(x.slug); if (!x.name) err(`${what} ${x.slug} has no name`); } return s; };
  const D = uniq(doms, 'domain'), C = uniq(caps, 'capability'); uniq(feats, 'feature');
  for (const c of caps) if (!D.has(c.domain)) err(`capability ${c.slug}: unknown domain "${c.domain}"`);
  const covered = new Set();
  for (const x of feats) {
    if (!C.has(x.capability)) err(`feature ${x.slug}: unknown capability "${x.capability}"`);
    if (!STAGES.includes(x.stage)) err(`feature ${x.slug}: stage "${x.stage}" not in ${STAGES.join('|')}`);
    if (!x.summary) warn(`feature ${x.slug}: no summary`);
    for (const c of x.contexts ?? []) { if (!ctx.has(c)) err(`feature ${x.slug}: unknown context "${c}"`); covered.add(c); }
    if (!(x.contexts ?? []).length) warn(`feature ${x.slug}: no contexts (unmeasurable)`);
    if (x.primary_context && !(x.contexts ?? []).includes(x.primary_context)) err(`feature ${x.slug}: primary_context not in its contexts`);
    if (x.stage_since && !/^\d{4}-\d{2}-\d{2}$/.test(x.stage_since)) err(`feature ${x.slug}: stage_since must be YYYY-MM-DD`);
  }
  const uncovered = [...ctx].filter((c) => !covered.has(c));
  if (uncovered.length / Math.max(1, ctx.size) > 0.1) err(`${uncovered.length}/${ctx.size} contexts belong to no feature: ${uncovered.slice(0, 12).join(', ')}${uncovered.length > 12 ? ', ...' : ''}`);
  else if (uncovered.length) warn(`${uncovered.length} contexts belong to no feature: ${uncovered.join(', ')}`);
  if (errors) die(`product tree refused (${errors} errors); fix work/product-tree.json and rerun`);
  const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined && o[k] !== null && o[k] !== '').map((k) => [k, o[k]]));
  map.domains = doms.map((d, i) => ({ ...pick(d, ['slug', 'name', 'id', 'summary']), order: d.order ?? i }));
  map.capabilities = caps.map((c, i) => ({ ...pick(c, ['slug', 'name', 'id', 'summary', 'domain']), order: c.order ?? i }));
  const prev = new Map((map.features ?? []).map((x) => [x.slug, x]));
  map.features = feats.map((x) => ({
    ...(prev.get(x.slug) ?? {}),
    ...pick(x, ['slug', 'name', 'summary', 'kind', 'tier', 'capability', 'contexts', 'primary_context', 'stage', 'stage_since', 'priority', 'surfaces', 'tags', 'experience', 'depends_on', 'parts']),
    status: 'active',
  }));
  // a feature that disappeared from the tree is archived, not removed (spec 11)
  for (const [slug, old] of prev) if (!feats.some((x) => x.slug === slug)) map.features.push({ ...old, status: 'archived' });
  if (t.milestones?.length) map.milestones = t.milestones;
  // lens-scan's structure.mjs keeps a tree it did not map 1:1 (it merges facets and the code tree only)
  map.provenance = { ...(map.provenance ?? {}), product_tree: 'adopt-bp' };
  map.taxonomy = { ...(map.taxonomy ?? {}), feature_kinds: [...new Set(map.features.map((x) => x.kind).filter(Boolean))], feature_tiers: [...new Set(map.features.map((x) => x.tier).filter(Boolean))] };
  for (const k of ['feature_kinds', 'feature_tiers']) if (!map.taxonomy[k].length) delete map.taxonomy[k];
  saveMap(map);
  console.log(`product tree merged: ${doms.length} domains, ${caps.length} capabilities, ${feats.length} features, ${covered.size}/${ctx.size} contexts covered`);
}

// =================================================================================== events
async function events() {
  FP = (await lensScan()).footprint;
  const map = loadMap();
  if (!(map.features ?? []).length) die('no features - run tree first');
  const hist = isGit() ? fileHistory() : new Map();
  const ctxFiles = new Map(map.contexts.map((c) => [c.name, expand(c.file_paths)]));
  const have = exists(EVENTS) ? fs.readFileSync(EVENTS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
  const seen = new Set(have.map((e) => `${e.type}|${e.feature}|${e.to ?? ''}`));
  const add = [];
  for (const f of map.features.filter((x) => x.status !== 'archived')) {
    const h = (f.contexts ?? []).flatMap((c) => ctxFiles.get(c) ?? []).map((p) => hist.get(p)).filter(Boolean);
    if (!h.length) continue;
    const first = h.map((x) => x.first).sort()[0];
    const last = h.map((x) => x.last).sort().at(-1);
    const startStage = ['idea', 'specified'].includes(f.stage) ? f.stage : 'in-dev';
    if (!seen.has(`feature-added|${f.slug}|${startStage}`) && !have.some((e) => e.type === 'feature-added' && e.feature === f.slug)) add.push({ at: first, type: 'feature-added', feature: f.slug, to: startStage, source: 'adopt-bp/git' });
    const lastStage = [...have, ...add].filter((e) => e.feature === f.slug && (e.type === 'stage' || e.type === 'feature-added')).sort((a, b) => a.at.localeCompare(b.at)).at(-1)?.to;
    if (f.stage && lastStage && f.stage !== lastStage) {
      // when it got there: the tree's stage_since (with evidence) or the last commit to its files
      const at = f.stage_since ? `${f.stage_since}T12:00:00Z` : last;
      add.push({ at: at < first ? first : at, type: 'stage', feature: f.slug, from: lastStage, to: f.stage, source: 'adopt-bp/git' });
      if (!f.stage_since) f.stage_since = at.slice(0, 10);
    }
  }
  add.sort((a, b) => a.at.localeCompare(b.at));
  fs.mkdirSync(STORE, { recursive: true });
  if (add.length) fs.appendFileSync(EVENTS, add.map((e) => JSON.stringify(e)).join('\n') + '\n');
  saveMap(map);
  console.log(`events: ${add.length} appended (${have.length} kept) -> ${posix(path.relative(ROOT, EVENTS))}`);
}

// =================================================================================== store
const upsertFacet = (map, feature, lens, values, extra = {}) => {
  map.facets ??= {}; map.facets[feature] ??= {};
  const f = map.facets[feature][lens] ?? {};
  map.facets[feature][lens] = { ...f, ...extra, values: { ...(f.values ?? {}), ...values }, source: f.source ?? 'adopt-bp' };
};
const STATUS_OF = { idea: 'not-started', specified: 'not-started', 'in-dev': 'in-progress', 'in-review': 'in-review', flagged: 'done', live: 'done', deprecated: 'done' };
/** Metric facets come from the store, through lens-scan's structure merge: the map can never disagree with the store. */
function refreshFacets(LS, map, db) {
  const cm = findContextMap();
  const { structure, report } = LS.structure.toAppStructure(cm.map, { existing: map, latest: LS.store.latest(db), lenses: builtinLenses(bpRoot()), generator: 'adopt-bp' });
  if (report.dangling_feature_contexts?.length) warn(`features name contexts the code tree no longer has: ${report.dangling_feature_contexts.join(', ')} - rescan the product tree`);
  return structure;
}

// =================================================================================== measure
async function measure() {
  const LS = await lensScan();
  FP = LS.footprint;
  const map = loadMap();
  const feats = (map.features ?? []).filter((x) => x.status !== 'archived');
  if (!feats.length) die('no features - run tree first');
  const db = LS.store.openStore(DB);
  const { id: run } = LS.store.runStart(db, { phase: 'measure', lenses: ['development', 'security', 'design'], scope: { features: feats.map((f) => f.slug), tool: 'adopt-bp' }, knownFeatures: new Set(feats.map((f) => f.slug)), model: 'static', note: `adopt-bp ${SKILL_VERSION} baseline: footprint.mjs --lens all` });
  let results;
  try {
    results = LS.footprint.measureFeatures({ structure: map, root: ROOT, lenses: ['development', 'security', 'design'], store: LS.store, db, run });
    LS.store.runEnd(db, { run, status: 'done' });
  } catch (e) { LS.store.runEnd(db, { run, status: 'failed', note: String(e.message).slice(0, 300) }); db.close(); throw e; }
  // non-metric development fields and design applicability live in the map only (they are not measurements)
  const hist = isGit() ? fileHistory() : new Map();
  const files = new Map(LS.footprint.featureFiles(map, null, ROOT, repoFiles()).map((f) => [f.slug, f.files]));
  const today = Date.now();
  for (const f of feats) {
    const h = (files.get(f.slug) ?? []).map((r) => hist.get(r)).filter(Boolean);
    const last = h.length ? h.map((x) => x.last).sort().at(-1) : null;
    upsertFacet(map, f.slug, 'development', { ...(STATUS_OF[f.stage] ? { status: STATUS_OF[f.stage] } : {}), ...(last ? { lastCommit: last.slice(0, 10), stalled: f.stage === 'in-dev' && today - Date.parse(last) > 45 * 864e5 } : {}) });
    if (results.find((r) => r.feature === f.slug)?.no_ui) upsertFacet(map, f.slug, 'design', {}, { applicable: false });
  }
  const out = refreshFacets(LS, map, db);
  db.close();
  saveMap(out);
  const n = results.filter((r) => r.loc !== undefined).length;
  console.log(`measured ${n}/${feats.length} features through lens-scan footprint (static: development, security, design) -> run ${run}`);
}

// =================================================================================== batches
/** Registry techniques that govern a feature, via the repo's .ai/registry-map.json and the registry's knowledge index. */
function standardsFor(feature, regMap, ctxByName) {
  if (!regMap) return [];
  const subjects = new Map();
  for (const c of feature.contexts ?? []) {
    const row = (regMap.contexts ?? []).find((r) => r.name === c || r.name === ctxByName.get(c)?.name);
    for (const s of (row?.subjects ?? []).slice(0, 3)) if (!subjects.has(s.subject) || subjects.get(s.subject).score < s.score) subjects.set(s.subject, s);
  }
  const out = [];
  for (const s of [...subjects.values()].sort((a, b) => b.score - a.score).slice(0, 3)) {
    const idx = path.join(REGISTRY, 'knowledge', s.bundle, 'index.json');
    let techniques = [];
    try { techniques = readJson(idx).subjects?.[s.subject]?.techniques ?? []; } catch { /* bundle not in this registry */ }
    for (const t of techniques.slice(0, 5)) out.push({ standard: `${s.subject}/${t.slug}`, use_when: (t.use_when ?? [])[0] });
  }
  return out;
}
async function batches() {
  FP = (await lensScan()).footprint;
  const map = loadMap();
  const size = Number(opt('size', '8'));
  const feats = (map.features ?? []).filter((x) => x.status !== 'archived');
  const ctx = new Map(map.contexts.map((c) => [c.name, c]));
  const regFile = path.join(ROOT, '.ai', 'registry-map.json');
  const regMap = exists(regFile) ? readJson(regFile) : null;
  const cache = new Map();
  const dir = path.join(WORK, 'batches');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  // biggest first, so a run cut short has judged what matters most
  const rows = feats.map((f) => {
    const rels = [...new Set((f.contexts ?? []).flatMap((c) => expand(ctx.get(c)?.file_paths)))];
    const files = rels.map((r) => fileFacts(r, cache)).filter((x) => x && x.code && !x.test).sort((a, b) => b.loc - a.loc);
    return { slug: f.slug, name: f.name, summary: f.summary, stage: f.stage, ui: files.some((x) => x.ui),
      entry_points: [...new Set((f.contexts ?? []).flatMap((c) => ctx.get(c)?.entry_points ?? []))].slice(0, 6),
      files: files.slice(0, 12).map((x) => `${x.rel} (${x.loc})`), more_files: Math.max(0, files.length - 12),
      standards: standardsFor(f, regMap, ctx),
      static: { development: map.facets?.[f.slug]?.development?.values, security: map.facets?.[f.slug]?.security?.values } };
  }).sort((a, b) => (b.static.development?.loc ?? 0) - (a.static.development?.loc ?? 0));
  let i = 0;
  for (let k = 0; k < rows.length; k += size) { i += 1; writeJson(path.join(dir, `${String(i).padStart(2, '0')}.json`), { batch: i, of: Math.ceil(rows.length / size), features: rows.slice(k, k + size) }); }
  const governed = rows.filter((r) => r.standards.length).length;
  console.log(`${i} batches of <= ${size} features -> ${posix(path.relative(ROOT, dir))}/ (judge each into work/judgement/NN.json); ${governed}/${rows.length} features carry registry standards${regMap ? '' : ' (no .ai/registry-map.json: standardsPct stays unmeasured unless house rules apply)'}`);
}

// =================================================================================== judge
// Judgement metrics per lens (lens-scan metrics.md). standardsPct is never judged as a number: it is
// derived from the coverage rows of the same run, as lens-scan derives it. techDebt is a non-metric field.
const RANGES = {
  development: { dupSites: [0, 1e4] },
  security: { findingsCritical: [0, 1e4], findingsHigh: [0, 1e4], findingsMedium: [0, 1e4], findingsLow: [0, 1e4] },
  design: { undesignedStates: [0, 1e4] },
};
const JUDGED_KEY = { development: 'dupSites', security: 'findingsCritical', design: 'undesignedStates' };
const FIELDS = { development: { techDebt: [0, 3] } };
const STANDARD_RE = /^(?:house:)?[a-z0-9][a-z0-9.-]*\/[a-z0-9][a-z0-9.-]*$/;
const norm = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
async function judge() {
  const LS = await lensScan();
  const map = loadMap();
  const dir = path.join(WORK, 'judgement');
  const files = exists(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  if (!files.length) die(`no ${dir}/*.json - phase B writes them (references/judgement.md)`);
  const slugs = new Set((map.features ?? []).map((x) => x.slug));
  // 1. validate everything first: a refused file writes nothing
  const metrics = { development: [], security: [], design: [] }, cov = { development: [], security: [], design: [] }, props = [], fields = [], na = [];
  for (const file of files) {
    let j;
    try { j = readJson(path.join(dir, file)); } catch (e) { err(`${file}: not JSON (${e.message})`); continue; }
    for (const [slug, lenses] of Object.entries(j.features ?? {})) {
      if (!slugs.has(slug)) { err(`${file}: unknown feature "${slug}"`); continue; }
      for (const [lens, v] of Object.entries(lenses ?? {})) {
        if (!RANGES[lens]) { warn(`${file}: ${slug}: lens "${lens}" is not judged by adopt-bp, ignored`); continue; }
        if (v?.applicable === false) { na.push([slug, lens]); continue; }
        if (v?.standardsPct !== undefined) warn(`${file}: ${slug}.${lens}.standardsPct ignored - it is derived from coverage rows`);
        for (const [k, [lo, hi]] of Object.entries(RANGES[lens])) {
          if (v?.[k] === undefined || v?.[k] === null) continue;
          const x = Number(v[k]);
          if (!Number.isFinite(x) || x < lo || x > hi) { err(`${file}: ${slug}.${lens}.${k} = ${v[k]} out of ${lo}..${hi}`); continue; }
          metrics[lens].push({ feature: slug, lens, metric: k, value: Math.round(x), method: 'judgement', unit: k.startsWith('findings') ? 'findings' : k === 'dupSites' ? 'sites' : 'states', evidence: typeof v.evidence === 'string' ? v.evidence.slice(0, 2000) : undefined });
        }
        for (const [k, [lo, hi]] of Object.entries(FIELDS[lens] ?? {})) if (v?.[k] !== undefined) { const x = Number(v[k]); if (Number.isInteger(x) && x >= lo && x <= hi) fields.push([slug, lens, k, x]); else err(`${file}: ${slug}.${lens}.${k} = ${v[k]} out of ${lo}..${hi}`); }
      }
    }
    for (const c of j.coverage ?? []) {
      if (!slugs.has(c.feature) || !RANGES[c.lens] || !STANDARD_RE.test(c.standard ?? '') || !['conformant', 'deviation', 'not-applicable', 'unknown'].includes(c.state)) { err(`${file}: coverage row refused (feature, lens, standard '<subject>/<technique>' or 'house:...', state): ${JSON.stringify(c).slice(0, 140)}`); continue; }
      cov[c.lens].push(c);
    }
    for (const p of j.proposals ?? []) {
      if (!slugs.has(p.feature) || !RANGES[p.lens] || !p.title || !p.metric || !Number.isFinite(p.expected_delta)) { err(`${file}: proposal refused - a fix names feature, lens, title, the metric it moves and expected_delta: ${JSON.stringify(p).slice(0, 140)}`); continue; }
      if (p.standard && p.standard !== 'none' && !STANDARD_RE.test(p.standard)) { err(`${file}: proposal standard "${p.standard}" is not '<subject>/<technique>', 'house:...' or 'none'`); continue; }
      props.push(p);
    }
  }
  if (errors) die(`judgement refused (${errors} errors); fix work/judgement/*.json and rerun - nothing was written`);
  // 2. write through lens-scan's store: one measure run per lens, then one propose run
  const db = LS.store.openStore(DB);
  const model = opt('model', 'unknown');
  const runs = [];
  let derived = 0, written = 0;
  for (const lens of Object.keys(RANGES)) {
    if (!metrics[lens].length && !cov[lens].length) continue;
    const { id: run } = LS.store.runStart(db, { phase: 'measure', lenses: [lens], scope: { tool: 'adopt-bp', judgement: true }, model, note: `adopt-bp ${SKILL_VERSION} judgement baseline` });
    runs.push(run);
    if (metrics[lens].length) { LS.store.measure(db, run, metrics[lens]); written += metrics[lens].length; }
    for (const c of cov[lens]) LS.store.coverage(db, { run, feature: c.feature, standard: c.standard, state: c.state, evidence: c.evidence });
    // standardsPct = conformant / (conformant + deviation) over this run's rows for the feature (lens-scan metrics.md)
    const per = new Map();
    for (const c of cov[lens]) { const r = per.get(c.feature) ?? { ok: 0, dev: 0 }; if (c.state === 'conformant') r.ok += 1; if (c.state === 'deviation') r.dev += 1; per.set(c.feature, r); }
    const rows = [...per].filter(([, r]) => r.ok + r.dev > 0).map(([feature, r]) => ({ feature, lens, metric: 'standardsPct', value: Math.round((r.ok / (r.ok + r.dev)) * 1000) / 10, unit: '%', method: 'judgement', evidence: `coverage: ${r.ok} conformant / ${r.dev} deviation (run ${run})` }));
    if (rows.length) { LS.store.measure(db, run, rows); derived += rows.length; }
    LS.store.runEnd(db, { run, status: 'done' });
  }
  let proposed = 0, skipped = 0;
  if (props.length) {
    const open = LS.store.proposals(db).filter((x) => ['proposed', 'approved', 'executing', 'declined'].includes(x.status));
    const { id: run } = LS.store.runStart(db, { phase: 'propose', lenses: [...new Set(props.map((p) => p.lens))], scope: { tool: 'adopt-bp' }, model, note: `adopt-bp ${SKILL_VERSION} proposals` });
    runs.push(run);
    for (const p of props) {
      // lens-scan rule: never re-propose an open or declined item (same feature, lens, metric and title)
      if (open.some((x) => x.feature === p.feature && x.lens === p.lens && x.metric === p.metric && norm(x.title) === norm(p.title))) { skipped += 1; continue; }
      LS.store.propose(db, { run, feature: p.feature, lens: p.lens, kind: 'fix', metric: p.metric, expectedDelta: p.expected_delta, standard: p.standard || 'none', size: ['XS', 'S', 'M', 'L', 'XL'].includes(p.size) ? p.size : undefined, risk: Number.isInteger(p.risk) && p.risk >= 1 && p.risk <= 10 ? p.risk : undefined, title: String(p.title).slice(0, 200), body: p.body });
      LS.store.activity(db, { run, kind: 'proposed', feature: p.feature, lens: p.lens, text: String(p.title).slice(0, 200) });
      proposed += 1;
    }
    LS.store.runEnd(db, { run, status: 'done' });
  }
  for (const [slug, lens] of na) upsertFacet(map, slug, lens, {}, { applicable: false });
  for (const [slug, lens, k, x] of fields) upsertFacet(map, slug, lens, { [k]: x });
  const out = refreshFacets(LS, map, db);
  db.close();
  saveMap(out);
  const active = (out.features ?? []).filter((x) => x.status !== 'archived');
  const lensCov = (lens) => active.filter((f) => { const fc = out.facets?.[f.slug]?.[lens]; return fc && (fc.applicable === false || JUDGED_KEY[lens] in (fc.values ?? {})); }).length;
  const gaps = Object.keys(RANGES).map((l) => [l, lensCov(l)]).filter(([, n]) => n < active.length);
  console.log(`coverage: ${Object.keys(RANGES).map((l) => `${l} ${lensCov(l)}/${active.length}`).join(', ')}`);
  if (gaps.length) warn(`judgement gaps: ${gaps.map(([l, n]) => `${l} missing on ${active.length - n}`).join('; ')} - judge them or mark design applicable:false`);
  console.log(`judgement through lens-scan store: ${written} metric rows, ${derived} standardsPct derived from ${Object.values(cov).flat().length} coverage rows, ${proposed} proposals${skipped ? ` (${skipped} already open or declined, not re-proposed)` : ''} -> runs ${runs.join(', ')}`);
}

// =================================================================================== validate
function validate() {
  const bp = bpRoot();
  const map = loadMap();
  const r = spawnSync(process.execPath, [path.join(bp, 'scripts', 'validate-structure.mjs'), MAP, ...(exists(EVENTS) ? ['--events', EVENTS] : [])], { cwd: bp, encoding: 'utf8' });
  process.stdout.write(r.stdout ?? ''); process.stderr.write(r.stderr ?? '');
  if (r.status !== 0) err('bp validator failed');
  const feats = (map.features ?? []).filter((x) => x.status !== 'archived');
  const ctx = new Set(map.contexts.map((c) => c.name));
  const covered = new Set(feats.flatMap((f) => f.contexts ?? []));
  const facetCount = (lens, key) => feats.filter((f) => map.facets?.[f.slug]?.[lens]?.values?.[key] !== undefined).length;
  const summary = {
    features: feats.length, domains: (map.domains ?? []).length, capabilities: (map.capabilities ?? []).length,
    unplaced: feats.filter((f) => !f.capability).length, unstaged: feats.filter((f) => !f.stage).length,
    contexts_covered: `${[...ctx].filter((c) => covered.has(c)).length}/${ctx.size}`,
    static_measured: facetCount('development', 'loc'), judged_dev: facetCount('development', 'dupSites'),
    judged_sec: facetCount('security', 'findingsCritical'), judged_design: facetCount('design', 'undesignedStates'),
    standards_dev: facetCount('development', 'standardsPct'), standards_sec: facetCount('security', 'standardsPct'), standards_design: facetCount('design', 'standardsPct'),
    lenses: (map.lenses ?? []).length,
  };
  if (!feats.length) err('no features');
  if (summary.unplaced) err(`${summary.unplaced} features have no capability`);
  if (summary.unstaged) err(`${summary.unstaged} features have no stage`);
  if (!summary.lenses) err('no lenses (bp would show none)');
  for (const [s, l] of Object.entries(map.facets ?? {})) for (const [lens, f] of Object.entries(l)) for (const [k, v] of Object.entries(f.values ?? {})) if (v === null) err(`facet ${s}.${lens}.${k} is null (absent means unmeasured)`);
  console.log(JSON.stringify(summary));
  if (errors) process.exit(1);
  console.log('adopt-bp validate: ok');
}

// =================================================================================== register
function register() {
  const bp = bpRoot();
  const map = loadMap();
  const slug = opt('slug') ?? map.project.slug, name = opt('name') ?? map.project.name;
  if (!PRODUCT_SLUG.test(slug) || slug === 'kettle') die(`bad product slug "${slug}" (bp wants ^[a-z0-9][a-z0-9-]{0,62}$, not "kettle")`);
  const reg = path.join(bp, 'bp.products.local.json');
  const doc = exists(reg) ? readJson(reg) : { products: [] };
  doc.products ??= [];
  const root = posix(ROOT);
  const i = doc.products.findIndex((p) => p.slug === slug);
  const other = doc.products.find((p) => p.slug !== slug && path.resolve(bp, p.root ?? '') === ROOT);
  if (other) warn(`this root is also registered as "${other.slug}"`);
  if (i >= 0 && path.resolve(bp, doc.products[i].root) !== ROOT && !flag('force')) die(`slug "${slug}" already points at ${doc.products[i].root} (use --slug or --force)`);
  if (i >= 0) doc.products[i] = { ...doc.products[i], name, root }; else doc.products.push({ slug, name, root });
  writeJson(reg, doc);
  const gi = path.join(ROOT, '.gitignore');
  const txt = exists(gi) ? fs.readFileSync(gi, 'utf8') : '';
  if (!/^\/?\.ai\/lens-scan\/?$/m.test(txt) && !/^\/?\.ai\/?$/m.test(txt)) {
    // A .gitignore with uncommitted edits may be another session's work in progress: never touch it,
    // ignore the store locally instead (.git/info/exclude is per-clone and untracked).
    let dirty = false;
    try { dirty = git('status', '--porcelain', '--', '.gitignore').trim() !== ''; } catch { /* no git */ }
    if (dirty) {
      const ex = path.join(git('rev-parse', '--git-path', 'info/exclude').trim().replace(/^(?![A-Za-z]:|\/)/, `${ROOT}/`));
      const et = exists(ex) ? fs.readFileSync(ex, 'utf8') : '';
      if (!/^\/?\.ai\/lens-scan\/?$/m.test(et)) { fs.mkdirSync(path.dirname(ex), { recursive: true }); fs.appendFileSync(ex, `${et && !et.endsWith('\n') ? '\n' : ''}.ai/lens-scan/\n`); }
      console.log(`.gitignore has uncommitted edits - ignored .ai/lens-scan/ in ${posix(path.relative(ROOT, ex))} instead; add it to .gitignore when that work lands`);
    } else {
      fs.appendFileSync(gi, `${txt && !txt.endsWith('\n') ? '\n' : ''}\n# bp product blueprint: machine-local scan store (adopt-bp)\n.ai/lens-scan/\n`);
      console.log('.gitignore: added .ai/lens-scan/');
    }
  }
  // hand-off: /lens-scan reads its overlay for the context map, the lens manifests and the project
  const ov = path.join(ROOT, '.claude', 'lens-scan', 'config.md');
  if (!exists(ov)) {
    const cm = findContextMap();
    fs.mkdirSync(path.dirname(ov), { recursive: true });
    fs.writeFileSync(ov, ['---', `context_map: ${cm?.file ?? 'context-map.json'}`, `standard_lenses: ${posix(path.join(bp, 'docs', 'standard', 'lenses'))}`,
      `project_slug: ${slug}`, `project_name: "${name.replace(/"/g, '\\"')}"`, 'default_lens: development', '---', '',
      `# lens-scan overlay - written by /adopt-bp ${SKILL_VERSION} on ${now().slice(0, 10)}`, '',
      'The product tree in .ai/lens-scan/app-structure.json is declared (provenance.product_tree: adopt-bp): lens-scan',
      "phase 1 merges into it and never remaps contexts 1:1. Add `## Gates`, `## Harness` and `## Probes` as the",
      'lens-scan SKILL.md overlay table describes; standard_lenses is a machine path to the bp checkout.', ''].join('\n'));
    console.log(`lens-scan overlay: ${posix(path.relative(ROOT, ov))} (uncommitted)`);
  }
  console.log(`registered "${slug}" (${name}) -> ${root} in ${posix(reg)}; open bp at /?product=${slug}`);
}

// =================================================================================== report
async function report() {
  const map = loadMap();
  const feats = (map.features ?? []).filter((x) => x.status !== 'archived');
  let props = [], runs = [];
  if (exists(DB)) {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(DB, { readOnly: true });
    props = db.prepare('SELECT feature, lens, title, size, risk FROM proposals ORDER BY risk DESC').all();
    runs = db.prepare('SELECT id, phase, status, model, started_at, ended_at FROM runs ORDER BY started_at').all();
    db.close();
  }
  const byStage = Object.fromEntries(STAGES.map((s) => [s, feats.filter((f) => f.stage === s).length]).filter(([, n]) => n));
  const r = { project: map.project, generated_at: now(), domains: (map.domains ?? []).length, capabilities: (map.capabilities ?? []).length, features: feats.length, by_stage: byStage, proposals: props.length, runs };
  writeJson(path.join(WORK, 'report.json'), r);
  const lines = [`# ${map.project.name} - adopted into bp`, '', `Generated ${r.generated_at} by adopt-bp ${SKILL_VERSION}.`, '',
    `- ${r.domains} domains, ${r.capabilities} capabilities, ${r.features} features (${Object.entries(byStage).map(([s, n]) => `${n} ${s}`).join(', ')})`,
    `- ${props.length} proposals in scan.db; ${runs.length} runs`, '', '## Product tree', ''];
  for (const d of map.domains ?? []) {
    lines.push(`### ${d.name}`, '', d.summary ?? '', '');
    for (const c of (map.capabilities ?? []).filter((x) => x.domain === d.slug)) lines.push(`- **${c.name}**: ${feats.filter((f) => f.capability === c.slug).map((f) => `${f.name} (${f.stage})`).join(', ')}`);
    lines.push('');
  }
  if (props.length) { lines.push('## Top proposals', ''); for (const p of props.slice(0, 15)) lines.push(`- [${p.lens}] ${p.feature}: ${p.title} (${p.size ?? '?'}, risk ${p.risk ?? '?'})`); }
  fs.writeFileSync(path.join(STORE, 'ADOPT.md'), lines.join('\n') + '\n');
  console.log(`report -> ${posix(path.relative(ROOT, path.join(STORE, 'ADOPT.md')))}`);
}

const CMDS = { check, seed, tree, events, measure, batches, judge, validate, register, report };
if (!CMDS[cmd]) die(`usage: adopt.mjs <${Object.keys(CMDS).join('|')}> [--root <repo>] [--bp <bp checkout>]`);
await CMDS[cmd]();
