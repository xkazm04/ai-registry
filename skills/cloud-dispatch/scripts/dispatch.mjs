#!/usr/bin/env node
/**
 * dispatch - send one brief to a Claude Code cloud session or a key-lane worker, or show what would be sent.
 *
 *   node dispatch.mjs --brief <file> --repo <path> [--model opus] [--label <s>] [--from <skill>] [--allow-ahead] [--show-prompt]
 *        plan only: runs the sync gate, composes the prompt, prints the plan, spawns nothing
 *        --allow-ahead: a default branch ahead of origin is a warning (its unpushed commits are
 *        listed) instead of a refusal - the cloud still clones origin and will not see them
 *   node dispatch.mjs --brief <file> --repo <path> ... --go
 *        writes the prompt file, opens a NEW console window running launch.mjs, appends a ledger row
 *   node dispatch.mjs --brief <file> --repo <path> --engine key --lane <lane> [--model m] [--effort e] ... [--go]
 *        the key engine: the same sync gate, plus the lane's refusals (key unset, expired, budget,
 *        concurrency); --go opens keyworker.mjs in a NEW console window instead of launch.mjs
 *   node dispatch.mjs --status [--json]
 *        ledger rows newest first, joined with the remote branch and pull request
 *   node dispatch.mjs --lanes [--json] | --lanes-init | --record --lane <lane> --cost <usd> --label <s>
 *        per-lane spend; write the lane file once; record spend this script did not launch
 *
 * Why it exists: the cloud-session credit is spent only by `claude --cloud` sessions, and
 * `claude --cloud` refuses unless stdout is an interactive terminal - so a local agent cannot
 * run it inline. A new console window opened with `cmd /c start` is that terminal (a plain
 * detached spawn is not: its std handles are NUL - see launchCommand in lib/core.mjs). The cloud clones GitHub origin and
 * never sees unpushed commits, so the sync gate refuses a repo whose default branch is ahead
 * of origin, and every prompt ends with a landing contract (own branch, RESULT.md, one PR) so
 * the result comes back as a reviewable pull request, never a push to the default branch.
 * The key engine reuses all of that for a local worker that bills a lane's API key; its key
 * lives in an ANTHROPIC_KEY_LANE_* variable and no output here ever prints a key value.
 *
 * Exit codes: 0 ok, 1 refused, 2 usage/fatal. Builtins only; imports only its own lib/.
 */
import {
  EXIT_OK, EXIT_REFUSED, EXIT_USAGE, UNPUSHED_HEADING, ENGINES, dispatchBrief, statusRows, parseArgs,
  lanesReport, initLanes, recordSpend,
} from './lib/core.mjs';

const opts = parseArgs(process.argv.slice(2));
const die = (msg, code = EXIT_USAGE) => { console.error(`cloud-dispatch: ${msg}`); process.exit(code); };
const str = (k) => (typeof opts[k] === 'string' ? opts[k] : undefined);
const usd = (n) => (typeof n === 'number' ? `${n < 0 ? '-' : ''}$${Math.abs(n).toFixed(2)}` : '-');

if (opts['lanes-init']) {
  const r = initLanes();
  if (!r.ok) die(`refused: ${r.reason}`, EXIT_REFUSED);
  console.log(`wrote ${r.file}: lanes registry, cloud, overlord with budgetUsd 0 and expires "" - fill both in before a key run`);
  process.exit(EXIT_OK);
}

if (opts.record) {
  for (const k of ['lane', 'cost', 'label']) if (typeof opts[k] !== 'string') die(`--record needs --${k} <value>`);
  const r = recordSpend({ lane: str('lane'), cost: str('cost'), label: str('label') });
  if (!r.ok) die(`refused: ${r.reason}`, EXIT_REFUSED);
  console.log(`recorded ${usd(r.row.cost_usd)} against lane ${r.row.lane}: ${r.row.label}`);
  process.exit(EXIT_OK);
}

if (opts.lanes) {
  const r = lanesReport();
  if (!r.ok) die(`refused: ${r.reason}`, EXIT_REFUSED);
  if (opts.json) { console.log(JSON.stringify({ lanes: r.lanes, invalid: r.invalid }, null, 2)); process.exit(EXIT_OK); }
  if (r.missing) { console.log('no .ai/credit-lanes.local.json yet; write one with --lanes-init'); process.exit(EXIT_OK); }
  for (const l of r.lanes) {
    console.log(`${l.lane.padEnd(10)} spent ${usd(l.spent)} of ${usd(l.budgetUsd)}  remaining ${usd(l.remaining)}  running ${l.running}/${l.maxConcurrent}  expires ${l.expires || '-'}${l.expired ? ' (EXPIRED)' : ''}  keyEnv: ${l.keyEnv} (${l.keyEnvName})`);
  }
  for (const x of r.invalid) console.log(`${x.lane.padEnd(10)} invalid: ${x.reason}`);
  process.exit(EXIT_OK);
}

if (opts.status) {
  const rows = statusRows();
  if (opts.json) { console.log(JSON.stringify(rows, null, 2)); process.exit(EXIT_OK); }
  if (!rows.length) { console.log('no cloud dispatches in the ledger yet'); process.exit(EXIT_OK); }
  for (const r of rows) {
    const when = r.ts ? new Date(r.ts).toLocaleString() : '?';
    const engine = r.engine === 'key' ? `  engine key  lane ${r.lane ?? '?'}  ${r.cost_usd !== undefined ? usd(r.cost_usd) : 'cost -'}` : '';
    console.log(`${r.id}  ${r.state.padEnd(16)} ${r.mode ?? ''}${engine}  ${when}  ${r.label ?? ''}${r.from ? `  (from ${r.from})` : ''}`);
    if (r.pr?.url) console.log(`    ${r.pr.url}`);
    if (r.launcher?.error) console.log(`    ${r.engine === 'key' ? 'worker' : 'launcher'}: ${r.launcher.error}`);
    if (r.launcher?.cleanup_error) console.log(`    worktree kept: ${r.launcher.cleanup_error}`);
  }
  process.exit(EXIT_OK);
}

if (!str('brief')) die('--brief <file> is required (or --status, --lanes, --lanes-init, --record)');
for (const k of ['repo', 'model', 'label', 'from', 'engine', 'lane', 'effort']) if (opts[k] === true) die(`--${k} needs a value`);
const engine = str('engine') ?? 'cloud';
if (!ENGINES.includes(engine)) die(`--engine must be ${ENGINES.join(' or ')}`);
if (engine === 'cloud' && (str('lane') || str('effort'))) die('--lane and --effort apply to --engine key only');

let res;
try {
  res = dispatchBrief({ briefPath: str('brief'), repo: str('repo'), model: str('model'), effort: str('effort'), label: str('label'), from: str('from'), mode: 'explicit', go: Boolean(opts.go), allowAhead: Boolean(opts['allow-ahead']), engine, lane: str('lane') });
} catch (e) {
  die(e.message);
}

const p = res.plan;
const lines = [
  `${opts.go && res.ok ? 'dispatched' : 'plan'}  ${res.id}  (an id is minted per run; --go mints its own)`,
  `  engine    ${p.engine}`,
  `  repo      ${p.repo ?? '-'}`,
  `  origin    ${p.slug ?? p.origin ?? '-'}`,
  `  base      origin/${p.defaultBranch ?? '?'} @ ${p.base_sha ? p.base_sha.slice(0, 12) : '?'}  (local ${p.defaultBranch ?? '?'} ahead: ${p.ahead ?? '?'})`,
  `  branch    ${res.branch}`,
  `  label     ${p.label}`,
  `  from      ${p.from ?? '-'}`,
  `  model     ${p.model}${p.effort ? ` @ ${p.effort}` : ''}`,
  `  prompt    ${p.prompt_chars ?? '?'} chars`,
];
if (p.lane) {
  const l = p.lane;
  lines.push(
    `  lane      ${l.lane}  keyEnv: ${l.keyEnv} (${l.keyEnvName})`,
    `  budget    ${usd(l.budgetUsd)}  spent ${usd(l.spent)}  remaining ${usd(l.remaining)}${l.running ? `  held ${usd(l.reserved)} for running` : ''}  per run ${usd(l.perRunUsd)}`,
    `  running   ${l.running}/${l.maxConcurrent}`,
    `  expires   ${l.expires || '- (not set)'}${l.expired ? '  EXPIRED' : ''}`,
    `  worktree  ${p.worktree}`,
  );
  for (const x of l.refusals) lines.push(`  refusal   ${x}`);
}
for (const w of p.warnings ?? []) lines.push(`  warning   ${w}`);
if (p.unpushed?.length) {
  lines.push(`  ${UNPUSHED_HEADING}:`);
  for (const c of p.unpushed) lines.push(`    ${c}`);
}
console.log(lines.join('\n'));

if (!res.ok) die(`refused: ${res.reason}`, res.exit ?? EXIT_REFUSED);
if (opts['show-prompt']) console.log(`\n----- prompt -----\n${p.prompt}`);
if (opts.go) {
  console.log(engine === 'key'
    ? `\nworker started in a new console window; it removes its worktree when it ends, and the branch stays.`
    : `\nlaunched in a new console window; it closes by itself once the cloud session exists.`);
  console.log(`track it:  node "${process.argv[1]}" --status`);
} else {
  console.log(`\nnothing spawned. Re-run with --go to launch.`);
}
process.exit(EXIT_OK);
