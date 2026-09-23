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
 * Reads all devices' files - the report is a fleet view, unlike the backfill.
 *
 * Usage:  node scripts/runs-report.mjs [--since <N>d] [--skill <name>] [--device <d>] [--json] [--root <registry>]
 *   --since defaults to 30d, counted back from now.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { OUTCOMES } from './lib/runs.mjs';
import { loadLane, aggregateRuns } from './lib/runs-aggregate.mjs';

const HERE_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
export const REPORT_SCHEMA = 'rkb-runs-report/1';

/** Build the report object. `now` is injectable so fixtures are deterministic. */
export function buildReport({ registryRoot = HERE_ROOT, sinceDays = 30, skill = null, device = null, now = Date.now() } = {}) {
  const lane = loadLane(registryRoot);
  const sinceMs = now - sinceDays * 86400000;
  const skills = aggregateRuns(lane.rows, lane.exact, { by: 'skill@version', sinceMs, skill, device, resolveSkill: lane.resolveSkill });
  return {
    schema: REPORT_SCHEMA,
    since: new Date(sinceMs).toISOString(),
    generatedAt: new Date(now).toISOString(),
    lane: { files: lane.files.length, rows: lane.rows.length, sidecarRows: lane.exact.size, unparseableLines: lane.bad },
    skills,
  };
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
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const val = (flag) => { const i = argv.indexOf(flag); return i === -1 ? undefined : argv[i + 1]; };
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
  if (argv.includes('--json')) console.log(JSON.stringify(rep, null, 2));
  else printText(rep);
  process.exit(EXIT.OK);
}
