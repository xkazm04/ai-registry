#!/usr/bin/env node
/**
 * dispatch - send one brief to a Claude Code cloud session, or show what would be sent.
 *
 *   node dispatch.mjs --brief <file> --repo <path> [--model opus] [--label <s>] [--from <skill>] [--allow-ahead] [--show-prompt]
 *        plan only: runs the sync gate, composes the prompt, prints the plan, spawns nothing
 *        --allow-ahead: a default branch ahead of origin is a warning (its unpushed commits are
 *        listed) instead of a refusal - the cloud still clones origin and will not see them
 *   node dispatch.mjs --brief <file> --repo <path> ... --go
 *        writes the prompt file, opens a NEW console window running launch.mjs, appends a ledger row
 *   node dispatch.mjs --status [--json]
 *        ledger rows newest first, joined with the remote branch and pull request
 *
 * Why it exists: the cloud-session credit is spent only by `claude --cloud` sessions, and
 * `claude --cloud` refuses unless stdout is an interactive terminal - so a local agent cannot
 * run it inline. A new console window opened with `cmd /c start` is that terminal (a plain
 * detached spawn is not: its std handles are NUL - see launchCommand in lib/core.mjs). The cloud clones GitHub origin and
 * never sees unpushed commits, so the sync gate refuses a repo whose default branch is ahead
 * of origin, and every prompt ends with a landing contract (own branch, RESULT.md, one PR) so
 * the result comes back as a reviewable pull request, never a push to the default branch.
 *
 * Exit codes: 0 ok, 1 refused, 2 usage/fatal. Builtins only; imports only its own lib/.
 */
import { EXIT_OK, EXIT_REFUSED, EXIT_USAGE, UNPUSHED_HEADING, dispatchBrief, statusRows, parseArgs } from './lib/core.mjs';

const opts = parseArgs(process.argv.slice(2));
const die = (msg, code = EXIT_USAGE) => { console.error(`cloud-dispatch: ${msg}`); process.exit(code); };
const str = (k) => (typeof opts[k] === 'string' ? opts[k] : undefined);

if (opts.status) {
  const rows = statusRows();
  if (opts.json) { console.log(JSON.stringify(rows, null, 2)); process.exit(EXIT_OK); }
  if (!rows.length) { console.log('no cloud dispatches in the ledger yet'); process.exit(EXIT_OK); }
  for (const r of rows) {
    const when = r.ts ? new Date(r.ts).toLocaleString() : '?';
    console.log(`${r.id}  ${r.state.padEnd(16)} ${r.mode ?? ''}  ${when}  ${r.label ?? ''}${r.from ? `  (from ${r.from})` : ''}`);
    if (r.pr?.url) console.log(`    ${r.pr.url}`);
    if (r.launcher?.error) console.log(`    launcher: ${r.launcher.error}`);
  }
  process.exit(EXIT_OK);
}

if (!str('brief')) die('--brief <file> is required (or --status)');
for (const k of ['repo', 'model', 'label', 'from']) if (opts[k] === true) die(`--${k} needs a value`);

let res;
try {
  res = dispatchBrief({ briefPath: str('brief'), repo: str('repo'), model: str('model'), label: str('label'), from: str('from'), mode: 'explicit', go: Boolean(opts.go), allowAhead: Boolean(opts['allow-ahead']) });
} catch (e) {
  die(e.message);
}

const p = res.plan;
const lines = [
  `${opts.go && res.ok ? 'dispatched' : 'plan'}  ${res.id}  (an id is minted per run; --go mints its own)`,
  `  repo      ${p.repo ?? '-'}`,
  `  origin    ${p.slug ?? p.origin ?? '-'}`,
  `  base      origin/${p.defaultBranch ?? '?'} @ ${p.base_sha ? p.base_sha.slice(0, 12) : '?'}  (local ${p.defaultBranch ?? '?'} ahead: ${p.ahead ?? '?'})`,
  `  branch    ${res.branch}`,
  `  label     ${p.label}`,
  `  from      ${p.from ?? '-'}`,
  `  model     ${p.model}`,
  `  prompt    ${p.prompt_chars ?? '?'} chars`,
];
for (const w of p.warnings ?? []) lines.push(`  warning   ${w}`);
if (p.unpushed?.length) {
  lines.push(`  ${UNPUSHED_HEADING}:`);
  for (const c of p.unpushed) lines.push(`    ${c}`);
}
console.log(lines.join('\n'));

if (!res.ok) die(`refused: ${res.reason}`, res.exit ?? EXIT_REFUSED);
if (opts['show-prompt']) console.log(`\n----- prompt -----\n${p.prompt}`);
if (opts.go) {
  console.log(`\nlaunched in a new console window; it closes by itself once the cloud session exists.`);
  console.log(`track it:  node "${process.argv[1]}" --status`);
} else {
  console.log(`\nnothing spawned. Re-run with --go to launch.`);
}
process.exit(EXIT_OK);
