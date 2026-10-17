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
// not the clock), and an unchanged file is not rewritten. Writes are atomic (temp file + rename): the
// blueprint writes the same file (temporary lenses) and reads it while a scan runs.
// A 1:1 re-map (no declared tree) still keeps a facet's `applicable: false` and its `reason`: that is a
// judgement (the facet command below), not something the context map can say.
//
//   node structure.mjs facet --feature <slug> --lens <id> --applicable false --reason "<why>" [--structure <path>]
//   node structure.mjs facet --feature <slug> --lens <id> --applicable true [--structure <path>]
//     The map-side record of a judgement scan's "no impact": `false` sets facets[feature][lens].applicable
//     = false with the reason (health `na`, and no reading is written); `true` removes both again (the
//     manifest decides). Every other facet and key is kept; the file is rewritten atomically, and not at
//     all when nothing changed. --structure defaults to .ai/lens-scan/app-structure.json.
//   node structure.mjs lens --id <id> [--structure <path>]
//     How lens-scan measures a lens in the map: method `builtin` (development, security, design - a
//     built-in keeps its own method even when its manifest has a scan block), `judgement` (the manifest's
//     instructions) or `steps` (the manifest's ordered scan.steps), each with the numeric metric fields a
//     reading may be written for and their `unit` (every measure write takes its unit from here); refused
//     (exit 1) when it has none, or a step lens-scan does not run (a skill other than conform, a script
//     yielding a field that is not a numeric metric). An unknown lens id exits 2. business, operations and
//     quality are built-in ids WITHOUT a built-in method: their scan block decides, as for any project lens.
//   node structure.mjs lens-add --manifest <file> [--structure <path>]
//     Onboarding's write (references/lens-onboarding.md): checks the manifest (checkManifest: a tmp.<kebab>
//     id is temporary, any other a reverse-DNS project id; a look another enabled lens draws is refused),
//     then appends {id, version, source: 'project', enabled: true, [temporary: true,] created_at, manifest}
//     to lenses[] atomically. An id the map already has is refused (exit 1); a bad manifest exits 2.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, renameSync, rmSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const DEFAULT_OUT = '.ai/lens-scan/app-structure.json';
/** The lenses lens-scan measures with its own methods (metrics.md). Any other lens needs a manifest scan block. */
export const BUILTIN_METHODS = ['development', 'security', 'design', 'performance'];
/** Field types a judgement reading may fill: the store holds numbers only. */
export const NUMERIC_TYPES = ['integer', 'number', 'percent', 'money'];
/** The skills a `skill` scan step may run (1.3.0): conform judges registry-map pairs. */
export const STEP_SKILLS = ['conform'];
export const MAX_STEPS = 8;
const inputError = (m) => Object.assign(new Error(m), { code: 2 });
const refusal = (m) => Object.assign(new Error(m), { code: 1 });

/** Writes `text` to `path` through a temp file in the same directory and a rename, so a reader never sees half a file. */
export function writeAtomic(path, text) {
  const abs = resolve(path);
  mkdirSync(dirname(abs), { recursive: true });
  const tmp = `${abs}.${process.pid}-${randomBytes(3).toString('hex')}.tmp`;
  try { writeFileSync(tmp, text); renameSync(tmp, abs); } catch (e) { rmSync(tmp, { force: true }); throw e; }
}

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
  const known = new Set(tree.features.map((f) => f.slug));
  const facets = declared ? JSON.parse(JSON.stringify(existing.facets ?? {})) : {};
  if (!declared) { // a 1:1 re-map rebuilds metric values, but a judged "does not apply" survives it
    for (const [feat, byLens] of Object.entries(existing?.facets ?? {})) {
      if (!known.has(feat)) continue;
      for (const [lens, f] of Object.entries(byLens ?? {})) {
        if (f?.applicable !== false) continue;
        (facets[feat] ??= {})[lens] = { applicable: false, ...(f.reason ? { reason: f.reason } : {}), ...(f.source ? { source: f.source } : {}) };
      }
    }
  }
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

// ------------------------------------------------------------------------------------- facet, lens
/**
 * Sets (applicable false, with a reason) or clears (applicable true) one facet's applicability in a
 * parsed structure, in place. Returns { changed, facet } - facet is what the (feature, lens) now holds,
 * absent when clearing left nothing. A facet this creates carries source "lens-scan"; one that exists
 * keeps its values, source and every other key.
 */
export function setApplicable(structure, { feature, lens, applicable, reason }) {
  if (!structure.features?.some((f) => f.slug === feature)) throw inputError(`no feature ${JSON.stringify(feature)} in the structure`);
  if (!structure.lenses?.some((l) => l.id === lens)) throw inputError(`no lens ${JSON.stringify(lens)} in the structure's lenses[]`);
  const facets = (structure.facets ??= {});
  const before = JSON.stringify(facets[feature]?.[lens]);
  if (applicable === false) {
    const why = String(reason ?? '').trim();
    if (!why) throw inputError('--applicable false needs --reason "<why the lens does not touch this feature>"');
    const f = ((facets[feature] ??= {})[lens] ??= { source: 'lens-scan' });
    f.applicable = false;
    f.reason = why;
  } else {
    const f = facets[feature]?.[lens];
    if (f) {
      delete f.applicable;
      delete f.reason;
      if (Object.keys(f).every((k) => k === 'source')) delete facets[feature][lens]; // nothing but a source left
      if (!Object.keys(facets[feature]).length) delete facets[feature];
    }
  }
  const facet = facets[feature]?.[lens];
  return { changed: JSON.stringify(facet) !== before, ...(facet ? { facet } : {}) };
}

/** The fields a reading may be written for: numeric, with a metric block. `unit` is the one every write takes. */
export const metricFields = (m) => (m?.fields ?? []).filter((f) => f?.metric && NUMERIC_TYPES.includes(f.type))
  .map((f) => ({ key: f.key, type: f.type, ...(f.unit ? { unit: f.unit } : {}), better: f.metric.better, ...(f.metric.method ? { method: f.metric.method } : {}), ...(f.label ? { label: f.label } : {}), ...(f.description ? { description: f.description } : {}) }));
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== '';
const only = (o, keys) => Object.keys(o).every((k) => keys.includes(k));

/**
 * Why a steps list cannot run, one sentence, or null. `keys` are the lens's numeric metric field keys: a
 * script step yields only those. The skill refusal is the line a headless job shows after `lens-scan refused: `.
 */
export function stepsProblem(steps, keys) {
  if (!Array.isArray(steps) || steps.length < 1 || steps.length > MAX_STEPS) return `scan.steps holds 1 to ${MAX_STEPS} steps`;
  for (const [i, st] of steps.entries()) {
    if (!st || typeof st !== 'object' || Array.isArray(st)) return `scan.steps[${i}] must be an object`;
    if (st.kind === 'script') {
      if (!nonEmpty(st.run)) return `scan.steps[${i}]: a script step needs run`;
      if (!Array.isArray(st.yields) || !st.yields.length || st.yields.some((k) => typeof k !== 'string')) return `scan.steps[${i}]: a script step lists the fields it yields`;
      const bad = st.yields.find((k) => !keys.includes(k));
      if (bad) return `scan.steps[${i}] yields ${bad}, which is not a numeric metric field of the lens`;
      if (!only(st, ['kind', 'run', 'yields'])) return `scan.steps[${i}]: a script step takes kind, run and yields only`;
    } else if (st.kind === 'skill') {
      if (!STEP_SKILLS.includes(st.skill)) return `step skill ${st.skill} is not allowed`;
      if (st.args !== undefined && typeof st.args !== 'string') return `scan.steps[${i}].args must be a string`;
      if (st.budget !== undefined && !(Number.isInteger(st.budget) && st.budget > 0)) return `scan.steps[${i}].budget must be a positive integer`;
      if (!only(st, ['kind', 'skill', 'args', 'budget'])) return `scan.steps[${i}]: a skill step takes kind, skill, args and budget only`;
    } else if (st.kind === 'judgement') {
      if (!nonEmpty(st.instructions)) return `scan.steps[${i}]: a judgement step needs instructions`;
      if (!only(st, ['kind', 'instructions'])) return `scan.steps[${i}]: a judgement step takes kind and instructions only`;
    } else return `scan.steps[${i}].kind must be script, skill or judgement (got ${JSON.stringify(st.kind)})`;
  }
  return null;
}

/**
 * How lens-scan measures a lens entry: builtin, judgement (instructions) or steps (the ordered steps), each
 * with the numeric metric fields; `none` when nothing measures it, `invalid` (with `why`) when its steps
 * cannot run. Only development, security and design are builtin: business, operations and quality are
 * measured by their scan block like any project lens.
 */
export function lensMethod(entry) {
  const m = entry.manifest ?? {};
  const out = { id: entry.id, ...(entry.source ? { source: entry.source } : {}), enabled: entry.enabled !== false, ...(entry.temporary ? { temporary: true } : {}) };
  const fields = metricFields(m);
  if (BUILTIN_METHODS.includes(entry.id)) return { ...out, method: 'builtin', ...(m.scan ? { ignored: 'scan block: a built-in lens keeps its built-in method' } : {}), fields };
  if (m.scan?.method === 'steps') {
    const why = stepsProblem(m.scan.steps, fields.map((f) => f.key));
    return why ? { ...out, method: 'invalid', why } : { ...out, method: 'steps', steps: m.scan.steps, fields };
  }
  if (m.scan?.method !== 'judgement' || !nonEmpty(m.scan.instructions)) return { ...out, method: 'none' };
  return { ...out, method: 'judgement', instructions: m.scan.instructions, fields };
}

// ------------------------------------------------------------------------------------- manifest check
// The structural check onboarding passes before lens-add writes a manifest: the JS twin of the blueprint's
// checkLensManifest (bp src/lib/scan/manifest-check.ts), so a lens written here is one bp draws and scans.
export const TEMP_LENS_ID = /^tmp\.[a-z0-9][a-z0-9-]{1,40}$/;
export const PROJECT_LENS_ID = /^[a-z]{2,}(?:\.[a-z0-9-]+){2,}$/;
export const GLYPHS = ['bars', 'set-square', 'brackets', 'pulse', 'padlock', 'check'];
export const LINES = ['solid', 'double', 'dotted', 'comb', 'chain', 'hatched', 'dimension'];
const TYPES = ['number', 'integer', 'percent', 'money', 'boolean', 'string', 'enum', 'date'];
const METRIC_METHODS = ['static', 'probe', 'harness', 'judgement'];
const HEALTHS = ['good', 'watch', 'bad'];
const TOP = ['$schema', 'id', 'version', 'name', 'short', 'description', 'reader', 'fields', 'health', 'presentation', 'scan'];
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, KEY = /^[a-z][A-Za-z0-9]*$/, SHORT = /^[A-Z0-9]{2,4}$/;
const PATH_OK = /^[Mm][MmZzLlHhVvCcSsQqTtAa0-9eE.,+\- ]{0,2047}$/;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const condFields = (c, out = []) => {
  if (!isObj(c)) return out;
  for (const k of ['all', 'any']) if (Array.isArray(c[k])) for (const x of c[k]) condFields(x, out);
  if (c.not !== undefined) condFields(c.not, out);
  if (typeof c.field === 'string') out.push(c.field);
  return out;
};
// Per command: numbers per segment, and which of them are coordinates (A: radii, rotation and flags are not).
const PATH_CMDS = { M: [2, [0, 1]], L: [2, [0, 1]], T: [2, [0, 1]], H: [1, [0]], V: [1, [0]], C: [6, [0, 1, 2, 3, 4, 5]], S: [4, [0, 1, 2, 3]], Q: [4, [0, 1, 2, 3]], A: [7, [5, 6]], Z: [0, []] };

/**
 * Why a custom glyph path is not a free icon lens-scan accepts, or null: absolute commands only, every
 * coordinate inside the 16x16 box, at least 2 drawing segments (a move alone draws nothing).
 */
export function glyphPathProblem(d) {
  if (typeof d !== 'string' || !PATH_OK.test(d)) return 'presentation.glyph.path must be SVG path commands and numbers only (at most 2048 characters, starting with M)';
  const tokens = d.match(/[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const isCmd = (t) => /^[A-Za-z]$/.test(t);
  let draws = 0, i = 0;
  while (i < tokens.length) {
    const c = tokens[i++];
    if (!isCmd(c)) return `presentation.glyph.path has a number where a command belongs (${c})`;
    if (c !== c.toUpperCase()) return `presentation.glyph.path uses the relative command ${c}: write absolute (upper-case) commands inside 0..16`;
    const [arity, coords] = PATH_CMDS[c];
    if (!arity) continue; // Z closes the shape; it draws no segment of its own
    let segs = 0;
    while (i < tokens.length && !isCmd(tokens[i])) {
      const args = tokens.slice(i, i + arity);
      if (args.length < arity || args.some(isCmd)) return `presentation.glyph.path: ${c} takes ${arity} numbers per segment`;
      const n = args.map(Number);
      if (coords.some((k) => n[k] < 0 || n[k] > 16)) return `presentation.glyph.path leaves the 16x16 box (${c} ${args.join(' ')})`;
      i += arity;
      if (c !== 'M' || segs > 0) draws += 1; // pairs after a move are line segments
      segs += 1;
    }
    if (!segs) return `presentation.glyph.path: ${c} has no numbers`;
  }
  return draws >= 2 ? null : 'presentation.glyph.path draws fewer than 2 segments; a free icon needs at least 2 drawing commands';
}

/** The look a manifest draws, comparable across lenses: a shared glyph name, or its path with spaces normalized. */
export const lookOf = (p) => ({ glyph: isObj(p?.glyph) ? { path: String(p.glyph.path ?? '').trim().replace(/\s+/g, ' ') } : p?.glyph, line: p?.line });
const sameLook = (a, b) => a.line === b.line && JSON.stringify(a.glyph) === JSON.stringify(b.glyph);
/** The looks the map's other enabled lenses draw (bp's TakenLook, plus the id): what a new lens may not repeat. */
export const takenLooks = (structure, exceptId) => (structure?.lenses ?? [])
  .filter((l) => l?.enabled !== false && l.id !== exceptId && isObj(l.manifest?.presentation)).map((l) => ({ id: l.id, ...lookOf(l.manifest.presentation) }));

/**
 * null when `x` is a lens manifest lens-add may write and a scan can measure; else what failed, one
 * sentence. `mode` 'temporary' wants a tmp.<kebab> id, 'project' a reverse-DNS id. `taken` (takenLooks)
 * refuses a glyph+line pair another enabled lens already draws.
 */
export function checkManifest(x, { mode, taken = [] } = {}) {
  if (!isObj(x)) return 'the manifest must be a JSON object';
  const extra = Object.keys(x).filter((k) => !TOP.includes(k));
  if (extra.length) return `unknown keys: ${extra.join(', ')}`;
  if (x.$schema !== 'lens-manifest/1') return '$schema must be "lens-manifest/1"';
  const id = typeof x.id === 'string' ? x.id : '';
  if (mode === 'temporary' && !TEMP_LENS_ID.test(id)) return `id must be tmp.<kebab> (got ${JSON.stringify(x.id)})`;
  if (mode !== 'temporary' && (!PROJECT_LENS_ID.test(id) || id.startsWith('tmp.'))) return `id must be reverse-DNS, e.g. com.<org>.<kebab> (got ${JSON.stringify(x.id)})`;
  if (typeof x.version !== 'string' || !SEMVER.test(x.version)) return 'version must be semver, e.g. 1.0.0';
  if (!nonEmpty(x.name)) return 'name is required';
  if (x.short !== undefined && (typeof x.short !== 'string' || !SHORT.test(x.short))) return 'short must be 2-4 capital letters or digits';
  if (x.description !== undefined && typeof x.description !== 'string') return 'description must be a string';
  if (!isObj(x.reader) || !['simple', 'standard', 'dense'].includes(x.reader.density)) return 'reader.density must be simple, standard or dense';
  if (x.reader.role !== undefined && typeof x.reader.role !== 'string') return 'reader.role must be a string';

  if (!Array.isArray(x.fields) || !x.fields.length) return 'fields must list at least one field';
  const keys = new Set(), numeric = new Set(), metricKeys = [];
  for (const [i, f] of x.fields.entries()) {
    if (!isObj(f)) return `fields[${i}] must be an object`;
    if (typeof f.key !== 'string' || !KEY.test(f.key)) return `fields[${i}].key must be camelCase`;
    if (keys.has(f.key)) return `field key ${f.key} is used twice`;
    keys.add(f.key);
    if (!nonEmpty(f.label)) return `field ${f.key} needs a label`;
    if (!TYPES.includes(f.type)) return `field ${f.key} has an unknown type ${JSON.stringify(f.type)}`;
    if (f.type === 'enum' && (!Array.isArray(f.values) || !f.values.length || f.values.some((v) => typeof v !== 'string'))) return `enum field ${f.key} needs its values`;
    if (f.type === 'money' && (typeof f.currency !== 'string' || !/^[A-Z]{3}$/.test(f.currency))) return `money field ${f.key} needs a currency`;
    if (f.unit !== undefined && !nonEmpty(f.unit)) return `field ${f.key}: unit must be a short word`;
    if (NUMERIC_TYPES.includes(f.type)) numeric.add(f.key);
    if (f.metric !== undefined) {
      if (!NUMERIC_TYPES.includes(f.type)) return `field ${f.key} has a metric but is not numeric (integer, number, percent or money)`;
      if (!isObj(f.metric) || (f.metric.better !== 'up' && f.metric.better !== 'down') || !METRIC_METHODS.includes(f.metric.method)) return `field ${f.key}: metric needs better (up|down) and a method`;
      metricKeys.push(f.key);
    }
  }
  if (!metricKeys.length) return 'at least one numeric field needs a metric block, or the scan has nothing to fill';

  const h = x.health;
  if (!isObj(h) || !Array.isArray(h.rules)) return 'health.rules is required';
  for (const [i, r] of h.rules.entries()) {
    if (!isObj(r) || !isObj(r.when) || !HEALTHS.includes(r.health) || !nonEmpty(r.reason)) return `health.rules[${i}] needs when, health (good|watch|bad) and reason`;
    const unknown = condFields(r.when).find((k) => !keys.has(k));
    if (unknown) return `health.rules[${i}] names an unknown field ${unknown}`;
  }
  if (!HEALTHS.includes(h.default)) return 'health.default must be good, watch or bad';
  const ru = h.rollup;
  if (!isObj(ru)) return 'health.rollup is required';
  if (ru.method === 'share') { if (typeof ru.watch !== 'number' || typeof ru.bad !== 'number') return 'a share rollup needs watch and bad fractions'; }
  else if (ru.method === 'weighted') { if (typeof ru.by !== 'string' || !numeric.has(ru.by)) return 'a weighted rollup needs by = a numeric field'; }
  else if (ru.method !== 'worst-of') return 'health.rollup.method must be worst-of, share or weighted';

  const p = x.presentation;
  if (!isObj(p)) return 'presentation is required';
  if (isObj(p.glyph)) { const why = glyphPathProblem(p.glyph.path); if (why) return why; }
  else if (!GLYPHS.includes(p.glyph)) return `presentation.glyph must be one of ${GLYPHS.join(', ')}, or { path } in a 16x16 box`;
  if (!LINES.includes(p.line)) return `presentation.line must be one of ${LINES.join(', ')}`;
  if (p.measures !== undefined && (typeof p.measures !== 'string' || !keys.has(p.measures))) return 'presentation.measures must name a field';
  if (p.evidence !== undefined && (!Array.isArray(p.evidence) || p.evidence.some((k) => typeof k !== 'string' || !keys.has(k)))) return 'presentation.evidence must list field keys';
  const clash = taken.find((t) => sameLook(lookOf(t), lookOf(p)));
  if (clash) return `presentation draws the same glyph and line as ${clash.id ?? 'another enabled lens'}; pick another glyph or line`;

  const s = x.scan;
  if (!isObj(s)) return "scan is required: { method: 'judgement', instructions } or { method: 'steps', steps }";
  if (s.method === 'judgement') {
    if (!nonEmpty(s.instructions)) return 'a judgement scan needs instructions';
    if (!only(s, ['method', 'instructions'])) return 'a judgement scan takes only method and instructions';
  } else if (s.method === 'steps') {
    if (!only(s, ['method', 'steps'])) return 'a steps scan takes only method and steps';
    const why = stepsProblem(s.steps, metricKeys);
    if (why) return why;
  } else return "scan.method must be 'judgement' or 'steps'";
  return null;
}

/**
 * Appends a checked manifest to a parsed structure, in place: {id, version, source 'project', enabled,
 * [temporary,] created_at, manifest} - the entry the blueprint writes. Refuses an id the map has.
 */
export function addLens(structure, manifest, { now = new Date() } = {}) {
  const temporary = TEMP_LENS_ID.test(manifest?.id ?? '');
  const lenses = (structure.lenses ??= []);
  if (lenses.some((l) => l?.id === manifest?.id)) throw refusal(`lens ${manifest.id} already exists in the map; an id is never reused or renamed`);
  const why = checkManifest(manifest, { mode: temporary ? 'temporary' : 'project', taken: takenLooks(structure, manifest?.id) });
  if (why) throw inputError(`lens manifest refused: ${why}`);
  const entry = { id: manifest.id, version: manifest.version, source: 'project', enabled: true, ...(temporary ? { temporary: true } : {}), created_at: now.toISOString(), manifest };
  lenses.push(entry);
  if (structure.stats && typeof structure.stats === 'object') structure.stats.lenses = lenses.length;
  return entry;
}

function readStructure(path) {
  if (!existsSync(path)) throw inputError(`no app-structure at ${path} - run phase 1 first, or pass --structure <path>`);
  const text = readFileSync(path, 'utf8');
  try { return { text, structure: JSON.parse(text) }; } catch { throw inputError(`${path} is not JSON`); }
}

// ------------------------------------------------------------------------------------- cli
const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^#!.*\n/, '').replace(/^\/\/ ?/gm, '');

export async function main(argv) {
  const { parseArgs, openStore, latest, skillVersion, DEFAULT_DB } = await import('./store.mjs');
  const a = parseArgs(argv);
  if (a.help) return { help: HELP };
  const cmd = a._[0];
  if (cmd === 'facet' || cmd === 'lens' || cmd === 'lens-add') {
    const path = typeof a.structure === 'string' ? a.structure : typeof a.out === 'string' ? a.out : DEFAULT_OUT;
    const { text, structure } = readStructure(path);
    if (cmd === 'lens') {
      const entry = structure.lenses?.find((l) => l.id === a.id);
      if (typeof a.id !== 'string' || !entry) throw inputError(`no lens ${JSON.stringify(a.id ?? null)} in the structure's lenses[] (--id <lens id>)`);
      const info = lensMethod(entry);
      if (info.method === 'none') throw refusal(`lens ${entry.id} has no scan method: it is not a built-in lens-scan measures and its manifest declares no scan { method: 'judgement', instructions } or { method: 'steps', steps }`);
      if (info.method === 'invalid') throw refusal(info.why);
      return info;
    }
    if (cmd === 'lens-add') {
      if (typeof a.manifest !== 'string') throw inputError('lens-add needs --manifest <file>');
      let manifest;
      try { manifest = JSON.parse(readFileSync(a.manifest, 'utf8')); } catch (e) { throw inputError(`--manifest is not readable JSON (${e.message})`); }
      const entry = addLens(structure, manifest);
      const next = `${JSON.stringify(structure, null, 2)}\n`;
      // re-read right before the rename: the blueprint writes this file too, and a lens it added meanwhile is kept
      if (readFileSync(path, 'utf8') !== text) throw refusal(`${path} changed while the lens was being added; run lens-add again`);
      writeAtomic(path, next);
      return { out: basename(path), written: true, added: { id: entry.id, version: entry.version, source: entry.source, ...(entry.temporary ? { temporary: true } : {}), created_at: entry.created_at } };
    }
    if (typeof a.feature !== 'string' || typeof a.lens !== 'string') throw inputError('facet needs --feature <slug> --lens <id>');
    if (a.applicable !== 'false' && a.applicable !== 'true') throw inputError('--applicable is true or false');
    const r = setApplicable(structure, { feature: a.feature, lens: a.lens, applicable: a.applicable === 'true', reason: typeof a.reason === 'string' ? a.reason : undefined });
    const next = `${JSON.stringify(structure, null, 2)}\n`;
    const written = r.changed && next !== text;
    if (written) writeAtomic(path, next);
    return { out: basename(path), written, feature: a.feature, lens: a.lens, ...(r.facet ? { facet: r.facet } : {}) };
  }
  if (cmd !== undefined) throw inputError(`unknown subcommand ${JSON.stringify(cmd)} - run with --help`);
  const mapPath = typeof a.map === 'string' ? a.map : 'context-map.json';
  if (!existsSync(mapPath)) throw Object.assign(new Error(`no context map at ${mapPath} - pass --map <path>`), { code: 2 });
  const map = JSON.parse(readFileSync(mapPath, 'utf8'));
  const { lenses, skipped } = readLenses(typeof a.lenses === 'string' ? a.lenses : undefined);
  const dbPath = typeof a.db === 'string' ? a.db : DEFAULT_DB;
  const db = openStore(dbPath, { readOnly: true });
  const rows = db ? latest(db) : [];
  db?.close();
  const v = skillVersion();
  const out = typeof a.out === 'string' ? a.out : DEFAULT_OUT;
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
    if (changed) writeAtomic(out, text);
  }
  return {
    out: basename(out), written: changed, ...report,
    store: db ? 'read' : 'none',
    ...(a.lenses === undefined ? { warning: 'no --lenses: the structure embeds no lens manifests' } : {}),
    ...(skipped.length ? { skipped_lens_files: skipped } : {}),
  };
}

// run as a script: compare real paths, so a skills folder reached through a junction or symlink still runs
if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  main(process.argv.slice(2)).then((out) => {
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  }).catch((e) => { process.stderr.write(`structure: ${e.message}\n`); process.exit(e.code === 2 ? 2 : 1); });
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
