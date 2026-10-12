#!/usr/bin/env node
// lens-scan structure - phase 1. Converts a context map (v2) into an app-structure v3.1 file, the
// review UI's format, with contexts as features 1:1, the lens manifests embedded, and the store's
// latest measurement per (feature, lens, metric) merged into facets.
//
//   node structure.mjs [--map context-map.json] [--lenses <dir>] [--db .ai/lens-scan/scan.db]
//                      [--out .ai/lens-scan/app-structure.json] [--project-slug s] [--project-name n] [--dry] [--fresh]
//
// The mapping (SKILL.md phase 1):
//   Domain     = group.domain (slugged; a group with no domain lands in "unassigned")
//   Capability = group (slug from the group name)
//   Feature    = context: slug from the context name, name = business_feature || context name,
//                kind = context.category, contexts = primary_context = [context name],
//                tags = names of the use_cases that list the context (by name or id), summary = description
//   lenses[]   = every lens-manifest/1 file in --lenses, enabled; source "builtin" for a short id,
//                "project" for a reverse-DNS id
//   facets     = latest store measurement per (feature, lens, metric), measured_at = the newest of them,
//                source "lens-scan"; a measurement for a feature not in the map is skipped and counted
// The v2 groups and contexts are copied as the code tree, minus null keys (v3 omits an unknown value).
// A context name the map repeats keeps its first use; each later copy becomes `<name>-<group slug>`
// (dedupeContexts, shared with /adopt-bp), so the code tree stays keyed by unique names.
//
// Merge, not overwrite (spec section 11). When --out already holds a DECLARED product tree - features
// that are not this script's 1:1 mapping (provenance.product_tree is anything but "contexts", e.g. a map
// /adopt-bp wrote, or one a person keeps by hand) - only the code tree, the --lenses manifests and the
// store's metric values are regenerated. Domains, capabilities, features (with stage), milestones, KPIs,
// project lenses, extensions and every non-metric facet value (status, applicable, overrides) are kept.
// --fresh ignores the existing file and maps 1:1 again.
// Stage, priority and milestone are never guessed: the map does not carry them, so they are omitted.
// Re-runnable: the same inputs give byte-identical output (generated_at is the newest input timestamp,
// not the clock), and an unchanged file is not rewritten.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const slugify = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^[-.]+|-+$/g, '');
const title = (s) => String(s).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
/** A unique slug within one namespace: a second "x" becomes "x-2". */
const uniq = (taken, base) => {
  let s = base || 'item', n = 2;
  while (taken.has(s)) s = `${base}-${n++}`;
  taken.add(s);
  return s;
};
/** v3 never writes null (an unknown value is omitted), so copied v2 objects drop their null keys. */
const dropNulls = (v) => Array.isArray(v) ? v.filter((x) => x !== null).map(dropNulls)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== null).map(([k, x]) => [k, dropNulls(x)])) : v;
/** Unique context names: a repeated name keeps its first use, later copies get `-<group slug>` (then -2, -3). */
export function dedupeContexts(contexts) {
  const seen = new Set(), renamed = [];
  const out = contexts.map((c) => {
    if (!seen.has(c.name)) { seen.add(c.name); return c; }
    let n = `${c.name}-${slugify(c.group ?? 'x') || 'x'}`, i = 2;
    while (seen.has(n)) n = `${c.name}-${i++}`;
    seen.add(n);
    renamed.push({ from: c.name, to: n, group: c.group });
    return { ...c, name: n };
  });
  return { contexts: out, renamed };
}
const iso = (v) => { const d = new Date(v); return Number.isNaN(d.getTime()) ? undefined : d.toISOString(); };

/** Reads every lens-manifest/1 JSON file in a directory, sorted by file name. */
export function readLenses(dir) {
  if (!dir) return { lenses: [], skipped: [] };
  const lenses = [], skipped = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    let m;
    try { m = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { skipped.push(f); continue; }
    if (m?.$schema !== 'lens-manifest/1' || typeof m.id !== 'string' || typeof m.version !== 'string') { skipped.push(f); continue; }
    lenses.push(m);
  }
  return { lenses, skipped };
}

/**
 * The pure conversion. `latest` is the store's latest-per-key rows ({feature, lens, metric, value,
 * measured_at}); `lenses` are parsed manifests. Returns { structure, report }.
 */
export function toAppStructure(map, { lenses = [], latest = [], projectSlug, projectName, generator, existing } = {}) {
  const groups = dropNulls(map.groups ?? []);
  const { contexts, renamed } = dedupeContexts(dropNulls(map.contexts ?? []));
  const declared = Array.isArray(existing?.features) && existing.features.length > 0 && existing.provenance?.product_tree !== 'contexts';
  const groupByName = new Map(groups.map((g) => [g.name, g]));
  const groupById = new Map(groups.filter((g) => g.id).map((g) => [g.id, g]));

  // ---- domains and capabilities, in group order
  const domains = new Map(), capByGroup = new Map(), capSlugs = new Set();
  const domainOf = (g) => {
    const raw = g?.domain && slugify(g.domain) ? g.domain : 'unassigned';
    const slug = slugify(raw);
    if (!domains.has(slug)) domains.set(slug, { slug, name: title(raw), order: domains.size, source: 'declared' });
    return slug;
  };
  const capOf = (g) => {
    if (!g) return undefined;
    if (!capByGroup.has(g.name)) {
      const domain = domainOf(g);
      capByGroup.set(g.name, { slug: uniq(capSlugs, slugify(g.name)), domain, name: g.name, order: capByGroup.size, source: 'declared' });
    }
    return capByGroup.get(g.name).slug;
  };
  for (const g of groups) capOf(g);

  // ---- use cases as tags: a use case lists contexts by name or id
  const tagsOf = new Map();
  for (const u of map.use_cases ?? []) {
    for (const ref of u.contexts ?? []) {
      const key = typeof ref === 'string' ? ref : ref?.name ?? ref?.id;
      if (!key) continue;
      if (!tagsOf.has(key)) tagsOf.set(key, new Set());
      tagsOf.get(key).add(u.name);
    }
  }

  // ---- features, one per context
  const featSlugs = new Set(), featureByContext = new Map();
  const features = contexts.map((c) => {
    const g = groupByName.get(c.group) ?? groupById.get(c.group_id);
    const slug = uniq(featSlugs, slugify(c.name));
    featureByContext.set(c.name, slug);
    const tags = [...new Set([...(tagsOf.get(c.name) ?? []), ...(c.id ? tagsOf.get(c.id) ?? [] : [])])].sort();
    const f = { slug, name: c.business_feature || c.name };
    if (c.description) f.summary = c.description;
    if (c.category) f.kind = c.category;
    const cap = capOf(g);
    if (cap) f.capability = cap;
    f.contexts = [c.name];
    f.primary_context = c.name;
    if (tags.length) f.tags = tags;
    return f;
  });

  // ---- lenses
  let entries = lenses.map((m) => ({ id: m.id, version: m.version, source: m.id.includes('.') ? 'project' : 'builtin', enabled: true, manifest: m }));
  if (existing?.lenses?.length) {
    if (!entries.length) entries = existing.lenses; // no --lenses: never drop the lenses a map already embeds
    else {
      const prev = new Map(existing.lenses.map((l) => [l.id, l]));
      entries = entries.map((e) => (prev.has(e.id) ? { ...e, enabled: prev.get(e.id).enabled !== false } : e)); // a switched-off lens stays off
      for (const l of existing.lenses) if (l.source === 'project' && !entries.some((e) => e.id === l.id)) entries.push(l);
    }
  }
  // a declared tree is kept as it is; the 1:1 mapping above is only the fallback
  const tree = declared
    ? { domains: existing.domains ?? [], capabilities: existing.capabilities ?? [], features: existing.features }
    : { domains: [...domains.values()], capabilities: [...capByGroup.values()], features };
  const ctxNames = new Set(contexts.map((c) => c.name));
  const dangling = declared ? [...new Set(tree.features.flatMap((f) => (f.contexts ?? []).filter((c) => !ctxNames.has(c))))].sort() : [];

  // ---- facets from the store
  const facets = declared ? JSON.parse(JSON.stringify(existing.facets ?? {})) : {};
  const known = new Set(tree.features.map((f) => f.slug));
  let merged = 0, unknownRows = 0;
  const unknownFeatures = new Set();
  let newest;
  for (const r of [...latest].sort((a, b) => `${a.feature}\0${a.lens}\0${a.metric}`.localeCompare(`${b.feature}\0${b.lens}\0${b.metric}`))) {
    if (!known.has(r.feature)) { unknownRows += 1; unknownFeatures.add(r.feature); continue; }
    const facet = ((facets[r.feature] ??= {})[r.lens] ??= { values: {}, source: 'lens-scan' });
    facet.values[r.metric] = r.value;
    const at = iso(r.measured_at);
    if (at && (!facet.measured_at || at > facet.measured_at)) facet.measured_at = at;
    if (at && (!newest || at > newest)) newest = at;
    merged += 1;
  }

  const mapAt = iso(map.generated_at);
  const generatedAt = [mapAt, newest, declared ? iso(existing.generated_at) : undefined].filter(Boolean).sort().pop();
  const base = declared ? existing.project ?? {} : {};
  const project = { slug: projectSlug || base.slug || slugify(map.project?.name) || 'project', name: projectName || base.name || map.project?.name || projectSlug || 'Project' };
  const pid = base.id ?? map.project?.id, pdesc = base.description ?? map.project?.description;
  if (pid) project.id = pid;
  if (pdesc) project.description = pdesc;

  const structure = {
    $schema: 'app-structure/3',
    version: 3,
    generator: generator ?? 'lens-scan/structure.mjs',
    ...(generatedAt ? { generated_at: generatedAt } : {}),
    provenance: {
      ...(declared ? existing.provenance ?? {} : {}),
      source: 'context-map.json',
      product_tree: declared ? existing.provenance?.product_tree ?? 'declared' : 'contexts',
      context_map_version: map.version,
      ...(map.generated_at ? { context_map_generated_at: map.generated_at } : {}),
      ...(map.generator ? { context_map_generator: map.generator } : {}),
      ...(map.provenance?.git_commit ? { git_commit: map.provenance.git_commit } : {}),
    },
    project,
    ...(map.taxonomy || existing?.taxonomy ? { taxonomy: { ...(map.taxonomy ?? {}), ...(declared ? existing.taxonomy ?? {} : {}) } } : {}),
    stats: { groups: groups.length, contexts: contexts.length, features: tree.features.length, ...(declared && existing.kpis?.length ? { kpis: existing.kpis.length } : {}), lenses: entries.length },
    groups,
    contexts,
    domains: tree.domains,
    capabilities: tree.capabilities,
    features: tree.features,
    ...(declared && existing.milestones?.length ? { milestones: existing.milestones } : {}),
    ...(declared && existing.kpis?.length ? { kpis: existing.kpis } : {}),
    lenses: entries,
    facets,
    ...(declared && existing.extensions ? { extensions: existing.extensions } : {}),
  };
  const report = {
    mode: declared ? 'merge' : '1:1',
    domains: structure.domains.length, capabilities: structure.capabilities.length, features: tree.features.length,
    ...(renamed.length ? { renamed_contexts: renamed } : {}),
    ...(dangling.length ? { dangling_feature_contexts: dangling } : {}),
    lenses: entries.map((l) => l.id), facets: Object.keys(facets).length, measurements: merged,
    ...(unknownRows ? { skipped_measurements: unknownRows, skipped_features: [...unknownFeatures].sort() } : {}),
  };
  return { structure, report };
}

// ------------------------------------------------------------------------------------- cli
const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^#!.*\n/, '').replace(/^\/\/ ?/gm, '');

export async function main(argv) {
  const { parseArgs, openStore, latest, skillVersion, DEFAULT_DB } = await import('./store.mjs');
  const a = parseArgs(argv);
  if (a.help) return { help: HELP };
  const mapPath = typeof a.map === 'string' ? a.map : 'context-map.json';
  if (!existsSync(mapPath)) throw Object.assign(new Error(`no context map at ${mapPath} - pass --map <path>`), { code: 2 });
  const map = JSON.parse(readFileSync(mapPath, 'utf8'));
  const { lenses, skipped } = readLenses(typeof a.lenses === 'string' ? a.lenses : undefined);
  const dbPath = typeof a.db === 'string' ? a.db : DEFAULT_DB;
  const db = openStore(dbPath, { readOnly: true });
  const rows = db ? latest(db) : [];
  db?.close();
  const v = skillVersion();
  const out = typeof a.out === 'string' ? a.out : '.ai/lens-scan/app-structure.json';
  let existing;
  if (!a.fresh && existsSync(out)) {
    try { existing = JSON.parse(readFileSync(out, 'utf8')); } catch { throw Object.assign(new Error(`${out} is not JSON - fix it or pass --fresh to map 1:1 again`), { code: 2 }); }
  }
  const { structure, report } = toAppStructure(map, { existing,
    lenses, latest: rows, projectSlug: typeof a.projectSlug === 'string' ? a.projectSlug : undefined,
    projectName: typeof a.projectName === 'string' ? a.projectName : undefined,
    generator: `lens-scan/structure.mjs${v ? `@${v}` : ''}`,
  });
  const text = `${JSON.stringify(structure, null, 2)}\n`;
  let changed = false;
  if (!a.dry) {
    changed = !existsSync(out) || readFileSync(out, 'utf8') !== text;
    if (changed) { mkdirSync(dirname(resolve(out)), { recursive: true }); writeFileSync(out, text); }
  }
  return {
    out: basename(out), written: changed, ...report,
    store: db ? 'read' : 'none',
    ...(a.lenses === undefined ? { warning: 'no --lenses: the structure embeds no lens manifests' } : {}),
    ...(skipped.length ? { skipped_lens_files: skipped } : {}),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((out) => {
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  }).catch((e) => { process.stderr.write(`structure: ${e.message}\n`); process.exit(e.code === 2 ? 2 : 1); });
}
