/**
 * map-compare - the pure half of map-state.mjs. Builtins only, no fs, no git, no child
 * processes, so `node --test` can import it from a bare clone.
 *
 * Three questions /straighten has to answer before it writes or commits anything:
 *
 * 1. **Is a modified `.ai/registry-map.json` somebody's work in progress, or only a rebuild
 *    nobody committed?** A fleet rebuild (`scripts/converge.mjs`) writes every map and commits
 *    none, so "modified" alone cannot mean "mid-edit". The test: rebuild the map from the
 *    project's HEAD inputs into scratch and compare it with the working copy. Equal apart from
 *    the generator's volatile stamps -> `generator-dirty` (safe to rebuild and commit). Equal on
 *    every JUDGEMENT field but not on generator-owned ones (the registry moved since that
 *    rebuild) -> still `generator-dirty`: a rebuild owns those fields and carries every verdict.
 *    Any judgement field differs -> `dirty`: a person or an agent wrote it, and this run never
 *    commits around them.
 * 2. **Would a commit rewrite every line?** `git ls-files --eol` says what the index and the
 *    working copy hold; the builder always writes LF.
 * 3. **Did a parallel merge stamp what conform section 4 requires?** Every merged row must carry
 *    the subject's own digest and `evaluatedRevision`, with `stale` cleared (conform LESSONS
 *    1.8.2: a merge that stamped the bundle digest would have re-staled its own wave).
 */

/** Top-level keys the builder rewrites on every run, whatever its inputs. */
export const VOLATILE_KEYS = Object.freeze(['generatedAt', 'projectSha']);

/** Pair fields only /conform (or a person) writes. The builder carries them, never computes them. */
export const JUDGEMENT_FIELDS = Object.freeze(['state', 'evidence', 'evaluatedAt', 'evaluatedAgainst', 'evaluatedRevision', 'adoptedFrom']);

/** JSON with object keys sorted at every depth, so key order is never a difference. */
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().filter((k) => value[k] !== undefined).map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** A shallow copy of a map document without the volatile stamps. */
export function stripVolatile(doc) {
  const out = { ...(doc || {}) };
  for (const k of VOLATILE_KEYS) delete out[k];
  return out;
}

/** Equal as generated content: same document apart from the volatile stamps and key order. */
export function sameGenerated(a, b) {
  return canonical(stripVolatile(a)) === canonical(stripVolatile(b));
}

/** Parse map text the way a reader on Windows meets it: BOM and CRLF are not content. */
export function parseMapText(text) {
  return JSON.parse(String(text).replace(/^﻿/, ''));
}

const carriesJudgement = (s) =>
  Boolean(s && ((s.state && s.state !== 'unknown') || s.source === 'conform' || s.adoptedFrom));

function projectPair(s) {
  const out = {};
  for (const f of JUDGEMENT_FIELDS) if (s[f] !== undefined && s[f] !== null) out[f] = s[f];
  if (s.source === 'conform') out.source = 'conform';
  return out;
}

/**
 * Every judgement a map holds, keyed `<context>|<bundle>|<subject>` for live rows and
 * `orphan:<context>|<bundle>|<subject>` for verdicts parked under `orphans[]`.
 */
export function judgementOf(doc) {
  const out = new Map();
  for (const c of doc?.contexts || []) {
    for (const s of c.subjects || []) {
      if (carriesJudgement(s)) out.set(`${c.context}|${s.bundle ?? ''}|${s.subject}`, projectPair(s));
    }
  }
  for (const o of doc?.orphans || []) {
    for (const s of o.subjects || []) {
      if (carriesJudgement(s)) out.set(`orphan:${o.context}|${s.bundle ?? ''}|${s.subject}`, projectPair(s));
    }
  }
  return out;
}

/** What differs between two judgement sets: `[{ key, kind: added|removed|changed, fields }]`. */
export function judgementDiff(base, next) {
  const diffs = [];
  for (const [key, b] of base) {
    const n = next.get(key);
    if (!n) { diffs.push({ key, kind: 'removed', fields: Object.keys(b) }); continue; }
    const fields = [...new Set([...Object.keys(b), ...Object.keys(n)])].filter((f) => canonical(b[f]) !== canonical(n[f]));
    if (fields.length) diffs.push({ key, kind: 'changed', fields });
  }
  for (const [key, n] of next) if (!base.has(key)) diffs.push({ key, kind: 'added', fields: Object.keys(n) });
  return diffs;
}

/**
 * Classify a modified map.
 *   working - the working copy (parsed)
 *   rebuilt - the builder's output from HEAD inputs (parsed), or null when none could be made
 *   head    - the committed map (parsed), or null when the map is untracked
 * Returns `{ class, reason, diffs }`, class one of current | generator-dirty | dirty.
 */
export function classifyMap({ working, rebuilt, head }) {
  if (head && sameGenerated(working, head)) {
    return { class: 'current', reason: 'differs from HEAD only in generatedAt/projectSha', diffs: [] };
  }
  if (!head) {
    const held = judgementOf(working);
    return held.size
      ? { class: 'dirty', reason: `untracked map already holds ${held.size} judgement(s) nobody committed`, diffs: [] }
      : { class: 'generator-dirty', reason: 'untracked map with no judgement in it', diffs: [] };
  }
  if (!rebuilt) return { class: 'dirty', reason: 'no rebuild from HEAD to compare against - unproven, so treated as work in progress', diffs: [] };
  if (sameGenerated(working, rebuilt)) {
    return { class: 'generator-dirty', reason: 'equal to a rebuild from HEAD apart from generatedAt/projectSha', diffs: [] };
  }
  const diffs = judgementDiff(judgementOf(rebuilt), judgementOf(working));
  if (!diffs.length) {
    return { class: 'generator-dirty', reason: 'judgement equal to a rebuild from HEAD; only generator-owned fields differ', diffs: [] };
  }
  return { class: 'dirty', reason: `${diffs.length} judgement difference(s) against a rebuild from HEAD`, diffs };
}

/** One `git ls-files --eol` line -> `{ index, worktree, attr, path }`, or null. */
export function parseLsFilesEol(line) {
  const m = /^i\/(\S*)\s+w\/(\S*)\s+attr\/(\S*)\s+(.+)$/.exec(String(line || '').trim());
  if (!m) return null;
  return { index: m[1], worktree: m[2], attr: m[3], path: m[4].trim() };
}

/**
 * Would committing this path rewrite its line endings wholesale? The builder writes LF.
 * Returns a reason string, or null when the commit carries content changes only.
 */
export function eolHazard(eol, autocrlf) {
  if (!eol) return null; // untracked: nothing in the index to rewrite
  if (eol.index === 'crlf' || eol.index === 'mixed') {
    return `the index holds ${eol.index.toUpperCase()} and the builder writes LF - a commit would rewrite every line`;
  }
  const normalized = /(^|[^-])text/.test(eol.attr) || ['true', 'input'].includes(String(autocrlf || '').trim().toLowerCase());
  if ((eol.worktree === 'crlf' || eol.worktree === 'mixed') && !normalized) {
    return `the working copy is ${eol.worktree.toUpperCase()} with no text attribute or core.autocrlf - a commit would store it as is`;
  }
  return null;
}

/** `<bundle>/<slug>` keyed index, from `{ bundle: indexJson }`. */
export function subjectIndex(indexes) {
  const out = {};
  for (const [bundle, doc] of Object.entries(indexes || {})) {
    for (const [slug, s] of Object.entries(doc?.subjects || {})) out[`${bundle}/${slug}`] = { digest: s.digest ?? null, revision: s.revision ?? null };
  }
  return out;
}

/**
 * The 1.8.2 check, after merge-conform-runs wrote the map. For every pair a run file judged
 * (state other than unknown) whose verdict the map now holds, the row must carry the subject's
 * current digest as `evaluatedAgainst`, an integer `evaluatedRevision` equal to the index's,
 * and no `stale`. A pair whose verdict the map does NOT hold was skipped or lost to a newer
 * verdict - listed as `notApplied`, read beside the merge's funnel, never a pass.
 */
export function verifyMerged({ map, index, runPairs }) {
  const contexts = map?.contexts || [];
  const byId = new Map(contexts.map((c) => [c.context, c]));
  const nameCount = new Map();
  for (const c of contexts) nameCount.set(c.name, (nameCount.get(c.name) || 0) + 1);
  const byName = new Map(contexts.filter((c) => nameCount.get(c.name) === 1).map((c) => [c.name, c]));
  const res = { checked: 0, ok: 0, wrongDigest: [], missingRevision: [], stillStale: [], notApplied: [] };
  for (const p of runPairs || []) {
    if (!p || !p.state || p.state === 'unknown') continue;
    const ctx = byId.get(p.context) || byName.get(p.context);
    const row = ctx && (ctx.subjects || []).find((s) => s.subject === p.subject && (!p.bundle || !s.bundle || s.bundle === p.bundle));
    const label = `${p.subject} @ ${ctx?.name ?? p.context}`;
    if (!row || row.state !== p.state || row.evidence !== p.evidence) { res.notApplied.push(label); continue; }
    res.checked += 1;
    const ix = index[`${p.bundle || row.bundle}/${p.subject}`];
    let good = true;
    if (!ix || row.evaluatedAgainst !== ix.digest) { res.wrongDigest.push(`${label}: evaluatedAgainst ${row.evaluatedAgainst ?? 'missing'}, index ${ix?.digest ?? 'missing'}`); good = false; }
    if (!Number.isInteger(row.evaluatedRevision) || (Number.isInteger(ix?.revision) && row.evaluatedRevision !== ix.revision)) {
      res.missingRevision.push(`${label}: evaluatedRevision ${row.evaluatedRevision ?? 'missing'}, index ${ix?.revision ?? 'missing'}`); good = false;
    }
    if (row.stale) { res.stillStale.push(label); good = false; }
    if (good) res.ok += 1;
  }
  res.pass = res.checked > 0 && res.ok === res.checked;
  return res;
}
