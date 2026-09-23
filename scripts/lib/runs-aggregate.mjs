/**
 * runs-aggregate — the one fold of the run log, shared by `scripts/runs-report.mjs` (the
 * librarian's view) and `scripts/build-catalog.mjs` (the catalog's `*30d` fields).
 *
 * One function, two callers, because two folds of one log is two answers to "how did this
 * skill do" - the catalog would drift from the report the first time either changed.
 *
 * The rule this module exists to enforce: ESTIMATE AND MEASUREMENT ARE NEVER BLENDED.
 * A run's measured fresh tokens (sidecar, `freshTokens`) and its self-reported `tokensEst`
 * are different instruments; a median over a mix of them has no predicate. So both are
 * reported apart (`medianExact`, `medianEst`, each with its count), and the single headline
 * `tokens` names its basis: the exact median when at least half the rows are measured,
 * else the estimate median, else null.
 *
 * Skill names go through the registry's alias map (identity-aliases.json, lane `skills`,
 * via lib/telemetry.mjs) before grouping: a renamed skill's old rows fold into its new
 * name, and a name that resolves to nothing (a .claude/skills lane skill, a retired one)
 * keeps the name it was logged under. Rows are never rewritten - the log is append-only.
 *
 * Pure: takes rows (and a resolver), returns numbers. `loadLane` is the only reader and
 * is separate so tests can aggregate fixture rows without a directory.
 */
import fs from 'node:fs';
import path from 'node:path';
import { OUTCOMES, freshTokens, readJsonl, runsDir } from './runs.mjs';
import { loadIdentities, resolveIdentity as resolveAlias } from './telemetry.mjs';

const sameName = (name) => name;

/**
 * The skill-name resolver for a registry root: current name -> itself, aliased old name ->
 * its target, anything else -> itself. A root without identity-aliases.json (a test
 * fixture) gets the identity resolver; a present but invalid alias file throws, because a
 * silently wrong fold is worse than a failed report.
 */
export function skillResolver(registryRoot) {
  if (!fs.existsSync(path.join(registryRoot, 'identity-aliases.json'))) return sameName;
  const ids = loadIdentities(registryRoot);
  return (name) => resolveAlias(ids, 'skills', name) ?? name;
}

/** Every log row and every sidecar row in `usage/runs/`, all devices, plus the skill resolver. */
export function loadLane(registryRoot) {
  const dir = runsDir(registryRoot);
  const rows = []; const exact = new Map(); const files = []; let bad = 0;
  const resolveSkill = skillResolver(registryRoot);
  if (!fs.existsSync(dir)) return { rows, exact, files, bad, dir, resolveSkill };
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jsonl')).sort()) {
    const r = readJsonl(path.join(dir, f));
    bad += r.bad;
    files.push(f);
    if (f.endsWith('.exact.jsonl')) { for (const x of r.rows) if (x?.id && !exact.has(x.id)) exact.set(x.id, x); }
    else rows.push(...r.rows.filter((x) => x && typeof x === 'object'));
  }
  return { rows, exact, files, bad, dir, resolveSkill };
}

/** Median of numbers, rounded to an integer; null when empty. */
export function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return Math.round(s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2);
}

const round1 = (x) => Math.round(x * 10) / 10;
const isCount = (v) => Number.isInteger(v) && v >= 0;

/**
 * Fold rows into per-group stats.
 *   by:       'skill@version' (the report) or 'skill' (the catalog)
 *   sinceMs:  rows with ts earlier than this are ignored (null = all)
 *   untilMs:  rows with ts later than this are ignored (null = all)
 *   skill, device: optional filters (skill matches the RESOLVED name)
 *   resolveSkill: logged name -> name to group under (loadLane(root).resolveSkill); default
 *                 identity, so fixture rows aggregate as logged
 * Returns { [key]: stats }, keys sorted.
 */
export function aggregateRuns(rows, exact = new Map(), { by = 'skill@version', sinceMs = null, untilMs = null, skill = null, device = null, resolveSkill = sameName } = {}) {
  const groups = new Map();
  for (const r of rows) {
    const t = Date.parse(r?.ts);
    if (Number.isNaN(t) || typeof r.skill !== 'string') continue;
    if (sinceMs !== null && t < sinceMs) continue;
    if (untilMs !== null && t > untilMs) continue;
    const name = resolveSkill(r.skill) ?? r.skill;
    if (skill && name !== skill) continue;
    if (device && r.device !== device) continue;
    const key = by === 'skill' ? name : `${name}@${r.version}`;
    if (!groups.has(key)) groups.set(key, { name, rows: [] });
    groups.get(key).rows.push(r);
  }
  const out = {};
  for (const key of [...groups.keys()].sort()) {
    const { name, rows: grouped } = groups.get(key);
    const rs = grouped.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
    const outcomes = {};
    for (const o of OUTCOMES) { const n = rs.filter((r) => r.outcome === o).length; if (n) outcomes[o] = n; }
    const diffs = rs.map((r) => r.difficulty).filter((d) => Number.isInteger(d));
    const exactFresh = []; const exactCache = []; const est = [];
    for (const r of rs) {
      const x = exact.get(r.id);
      if (x && ['input', 'cacheWrite', 'cacheRead', 'output'].every((k) => isCount(x[k]))) { exactFresh.push(freshTokens(x)); exactCache.push(x.cacheRead); }
      if (isCount(r.tokensEst)) est.push(r.tokensEst);
    }
    const medianExact = median(exactFresh);
    const medianEst = median(est);
    // Exact wins only when it speaks for at least half the runs; a lone measured run must
    // not stand in for a skill whose other runs were never measured.
    let tokens = null; let tokensBasis = null;
    if (exactFresh.length && exactFresh.length * 2 >= rs.length) { tokens = medianExact; tokensBasis = 'exact'; }
    else if (est.length) { tokens = medianEst; tokensBasis = 'estimate'; }
    const models = new Set(); const projects = new Set(); const devices = new Set();
    for (const r of rs) {
      const x = exact.get(r.id);
      const m = x?.model ?? r.model;
      if (m) models.add(m);
      if (r.project) projects.add(r.project);
      if (r.device) devices.add(r.device);
    }
    out[key] = {
      skill: name,
      versions: [...new Set(rs.map((r) => r.version))].sort(),
      runs: rs.length,
      outcomes,
      difficulty: diffs.length ? round1(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null,
      tokens, tokensBasis,
      medianExact, exactCount: exactFresh.length,
      medianEst, estCount: est.length,
      medianCacheRead: median(exactCache),
      models: [...models].sort(), projects: [...projects].sort(), devices: [...devices].sort(),
      firstTs: rs[0].ts, lastTs: rs[rs.length - 1].ts,
      entries: rs.map((r) => ({ ts: r.ts, project: r.project, outcome: r.outcome, difficulty: r.difficulty, result: r.result, comment: r.comment })),
    };
  }
  return out;
}

/**
 * The catalog's fields for one skill, from an aggregateRuns(..., {by:'skill'}) entry.
 * Missing entry = no runs: zeros and nulls, never absent keys.
 */
export function catalogFields(stats) {
  return {
    runs30d: stats ? stats.runs : 0,
    outcomes30d: stats ? stats.outcomes : {},
    difficulty30d: stats ? stats.difficulty : null,
    tokensMedian30d: stats ? stats.tokens : null,
    tokensBasis30d: stats ? stats.tokensBasis : null,
  };
}
