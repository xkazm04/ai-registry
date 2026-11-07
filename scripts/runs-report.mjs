#!/usr/bin/env node
/**
 * runs-report - the librarian's read of the skill run log (`usage/runs/`).
 *
 * The log's only consumer is `/librarian skills`; this is the instrument it reads through.
 * Per skill@version: how often it ran, how runs ended, how hard they felt, what they cost,
 * where and on what - and every run's own result + comment, because the comments are the
 * evidence a skill edit is argued from and a table of means cannot carry them.
 *
 * Token figures come in two instruments and are never blended (lib/runs-aggregate.mjs
 * says why): `medianExact` from the backfilled sidecar, `medianEst` from the agent's own
 * estimate, and a headline `tokens` that names its `tokensBasis`.
 *
 * With `--skill X` the report adds a version-over-version section (`versionDelta` in --json):
 * for each adjacent version pair in semver order the outcome mix, shipped share, median
 * difficulty and tokens - measured and estimated medians kept apart, never blended - with
 * deltas. A version with fewer than MIN_RUNS_FOR_VERSION_DELTA runs (default 3, lib/
 * runs-aggregate.mjs) is marked insufficient and gets no delta claim. The window still
 * applies, so use e.g. `--since 365d` to see more than the last 30 days of versions.
 *
 * Reads all devices' files - the report is a fleet view, unlike the backfill.
 *
 * Usage:  node scripts/runs-report.mjs [--since <N>d] [--skill <name>] [--device <d>] [--json] [--root <registry>]
 *   --since defaults to 30d, counted back from now.
 *
 * The flag set is closed: an unknown flag, or a valued flag with no value, exits 2. A
 * `--root` with no value used to fall back to THIS checkout's registry (a report about the
 * wrong lane that looked right), and `--skill --json` took "--json" as the skill name and
 * reported an empty lane.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { OUTCOMES } from './lib/runs.mjs';
import { loadLane, aggregateRuns, versionDeltas } from './lib/runs-aggregate.mjs';

const HERE_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
export const REPORT_SCHEMA = 'rkb-runs-report/1';

/** Build the report object. `now` is injectable so fixtures are deterministic. */
export function buildReport({ registryRoot = HERE_ROOT, sinceDays = 30, skill = null, device = null, now = Date.now() } = {}) {
  const lane = loadLane(registryRoot);
  const sinceMs = now - sinceDays * 86400000;
  const skills = aggregateRuns(lane.rows, lane.exact, { by: 'skill@version', sinceMs, skill, device, resolveSkill: lane.resolveSkill });
  const rep = {
    schema: REPORT_SCHEMA,
    since: new Date(sinceMs).toISOString(),
    generatedAt: new Date(now).toISOString(),
    lane: { files: lane.files.length, rows: lane.rows.length, sidecarRows: lane.exact.size, unparseableLines: lane.bad },
    skills,
  };
  // One skill named: also say how its versions compare (lib/runs-aggregate.mjs versionDeltas).
  if (skill) rep.versionDelta = versionDeltas(skills);
  return rep;
}

const pad = (s, n) => String(s ?? '-').padEnd(n);

function printText(rep, log = console.log) {
  const keys = Object.keys(rep.skills);
  log(`runs-report since ${rep.since.slice(0, 10)} - ${rep.lane.rows} row(s) in ${rep.lane.files} file(s), ${rep.lane.sidecarRows} measured${rep.lane.unparseableLines ? `, ${rep.lane.unparseableLines} unparseable line(s) skipped` : ''}`);
  if (!keys.length) { log('  the lane is empty for this window - nothing to report.'); return; }
  const oc = (o) => OUTCOMES.filter((k) => o[k]).map((k) => `${k}:${o[k]}`).join(' ') || '-';
  log('');
  log(`${pad('skill@version', 28)}${pad('runs', 6)}${pad('diff', 6)}${pad('tokens', 18)}${pad('exact/est n', 13)}${pad('cacheRead', 11)}outcomes`);
  for (const k of keys) {
    const s = rep.skills[k];
    const tok = s.tokens === null ? '-' : `${s.tokens} (${s.tokensBasis})`;
    log(`${pad(k, 28)}${pad(s.runs, 6)}${pad(s.difficulty, 6)}${pad(tok, 18)}${pad(`${s.exactCount}/${s.estCount}`, 13)}${pad(s.medianCacheRead, 11)}${oc(s.outcomes)}`);
  }
  for (const k of keys) {
    const s = rep.skills[k];
    log(`\n## ${k}  (${s.firstTs} .. ${s.lastTs})`);
    log(`   medianExact ${s.medianExact ?? '-'} (n=${s.exactCount}) | medianEst ${s.medianEst ?? '-'} (n=${s.estCount})`);
    log(`   models: ${s.models.join(', ') || '-'} | projects: ${s.projects.join(', ') || '-'} | devices: ${s.devices.join(', ') || '-'}`);
    for (const e of s.entries) {
      log(`   - ${e.ts} ${e.project} ${e.outcome} d${e.difficulty}: ${e.result}`);
      log(`       ${String(e.comment ?? '').replace(/\s*\n\s*/g, ' / ')}`);
    }
  }
  if (rep.versionDelta) printVersionDelta(rep.versionDelta, log);
}

/** The version-over-version section: one row per version, then one delta line per adjacent pair. */
function printVersionDelta(vd, log) {
  const sgn = (n, unit = '') => (n === null ? '-' : `${n > 0 ? '+' : ''}${n}${unit}`);
  const tok = (t) => (t.median === null ? '-' : `${t.median} (n=${t.n})`);
  log(`\n# versions, oldest to newest (a version with fewer than ${vd.minRuns} runs is insufficient: shown, never compared)`);
  log(`${pad('version', 14)}${pad('runs', 6)}${pad('shipped', 10)}${pad('diff~', 7)}${pad('tokens measured', 19)}${pad('tokens estimated', 19)}outcomes`);
  const oc = (o) => OUTCOMES.map((k) => `${k}:${o[k]}`).join(' ');
  for (const v of vd.versions) {
    const share = v.shippedShare === null ? '-' : `${Math.round(v.shippedShare * 100)}%`;
    log(`${pad(v.version, 14)}${pad(v.runs, 6)}${pad(share, 10)}${pad(v.difficultyMedian, 7)}${pad(tok(v.tokensExact), 19)}${pad(tok(v.tokensEstimate), 19)}${oc(v.outcomes)}${v.insufficient ? '  [insufficient]' : ''}`);
  }
  for (const d of vd.deltas) {
    if (d.insufficient) { log(`  ${d.from} -> ${d.to}: insufficient (${d.reason})`); continue; }
    log(`  ${d.from} -> ${d.to}: shipped share ${sgn(d.shippedShare === null ? null : Math.round(d.shippedShare * 100), ' pts')}, median difficulty ${sgn(d.difficultyMedian)}, measured tokens ${sgn(d.tokensExact)}, estimated tokens ${sgn(d.tokensEstimate)}`);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const USAGE = 'Usage: runs-report.mjs [--since <N>d] [--skill <name>] [--device <d>] [--json] [--root <registry>]';
  const VALUED = new Set(['--since', '--skill', '--device', '--root']);
  const given = {};
  let json = false;
  if (argv.includes('--help') || argv.includes('-h')) { console.log(USAGE); process.exit(EXIT.OK); }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') { json = true; continue; }
    if (!VALUED.has(a)) { console.error(`FATAL: unknown argument ${JSON.stringify(a)}. ${USAGE}`); process.exit(EXIT.FATAL); }
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) { console.error(`FATAL: ${a} needs a value. ${USAGE}`); process.exit(EXIT.FATAL); }
    given[a] = v;
  }
  const val = (flag) => given[flag];
  const sinceRaw = val('--since') ?? '30d';
  const m = /^(\d+)d?$/.exec(sinceRaw);
  if (!m) {
    console.error(`FATAL: --since takes a day count like 30d, got "${sinceRaw}"`);
    process.exit(EXIT.FATAL);
  }
  const rep = buildReport({
    registryRoot: val('--root') ? path.resolve(val('--root')) : HERE_ROOT,
    sinceDays: Number(m[1]),
    skill: val('--skill') ?? null,
    device: val('--device') ?? null,
  });
  if (json) console.log(JSON.stringify(rep, null, 2));
  else printText(rep);
  process.exit(EXIT.OK);
}
