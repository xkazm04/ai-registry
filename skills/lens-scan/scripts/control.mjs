#!/usr/bin/env node
// lens-scan control - the red control of a test-adding item, run the same way every time. bp's cycle-3 execute
// built five test commits (pack qa-4) and ran a control for each by hand (activity notes "control p-..: ... -> FAIL"),
// yet every proof said method judgement, control absent, so the machine could not accept one and the run's own
// evidence never reached the proof. This script turns that by-hand step into a reading the store can check:
// the new test, green at the item's commit, re-run with the guarded production line reverted or drifted, must
// fail ON AN ASSERTION (a crash or an import error proves nothing about the line). Its output's `proof_fields`
// go into the item's proof as they are (SKILL.md 5. Execute step 7, store.mjs proof method test).
//
//   node control.mjs classify --repo <dir> --base <sha> --sha <sha> [--tests <regex>]
//        the item's diff base..sha split into test files and production files; method `test` when the diff adds or
//        extends a test file. --tests adds a project pattern (bp: its checks are scripts/check-*.ts - built in).
//   node control.mjs run --repo <dir> --sha <sha> --test "<command>" (--patch <file> | --revert-production --base <sha>)
//        [--scratch <dir>] [--tests <regex>]
//        1. the test at the item's commit, unmutated: it must pass (else it is red already and controls nothing);
//        2. the mutation: --patch applies a diff that drifts the guarded line (a test-only item has no production
//           line of its own to revert); --revert-production reverse-applies the item's own production changes;
//        3. the test again: it must exit non-zero with an assertion line in its output;
//        4. the mutation is undone and the tree checked clean.
//        In place (default) --repo is the pack worktree, at --sha and clean (tracked files): it has the product's
//        installed dependencies. --scratch <dir> runs in a fresh `git worktree add --detach` there instead and removes
//        it after - only for a test that needs no installed dependencies (a scratch worktree has none, and a
//        node_modules junction resolves workspace packages to the base checkout, not the mutated scratch).
//   -> {red, why?, control: red|absent, method, control_value, test_control: {command, mutation, exit, assertion},
//       proof_fields: {method, control, control_value, test_control} (red only), green_exit, output_tail}
//
// Exit 0 a red control was read, 1 the run worked and the control is NOT red (the test does not bite, crashed, or was
// red before the mutation), 2 bad input or a git step that could not run. (Bundled into product repos with the rest of
// lens-scan, so it cannot import the registry's scripts/lib/exit-codes.mjs; the codes are that file's OK /
// VIOLATIONS-in-reverse / FATAL, the same as store.mjs: 0 what the caller asked for, 1 a rule said no, 2 cannot run.)
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

export class ControlError extends Error {
  constructor(message, code = 2) { super(message); this.code = code; }
}
const bad = (m) => { throw new ControlError(m, 2); };

// A test file: the common shapes, plus bp's check scripts (scripts/check-*.ts|mjs are its test suite).
export const TEST_PATTERNS = [
  /(^|\/)(tests?|__tests__|spec)\//i,
  /\.(test|spec)\.[cm]?[jt]sx?$/i,
  /(^|\/)test_[^/]+\.py$/i,
  /_test\.(py|go)$/i,
  /(^|\/)scripts\/check-[^/]+\.[cm]?[jt]s$/i,
];
// An assertion failed (node:assert, node:test, check scripts that print FAIL, pytest, jest/vitest expect).
const ASSERTION = [
  /AssertionError/,
  /^\s*(not ok|FAIL|FAILED|✖)(?=\s|:|$)/,
  /^\s*E\s+assert/,
  /\bexpect(ed)?\b.*\b(to|but|received|got)\b/i,
];
// The run never reached an assertion: the mutation broke loading, not behaviour.
const CRASH = [/Cannot find module/, /ERR_MODULE_NOT_FOUND/, /SyntaxError/, /error TS\d+/, /ReferenceError/, /ImportError/, /ModuleNotFoundError/];
// node:test repeats every failing test under a summary heading; that heading is not an assertion of its own
const SUMMARY = /^\s*✖\s+failing tests:?\s*$/;

const git = (cwd, args, input) => {
  try { return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }); } catch (e) {
    bad(`git ${args.join(' ')} failed: ${(e.stderr || e.message).toString().trim().split('\n')[0]}`);
  }
};
// Tracked files that differ from HEAD by content. Not `status --porcelain`: with core.autocrlf=true (this Windows
// machine) a file git apply rewrote with LF reads ` M` there while its content equals HEAD's.
const dirty = (cwd) => git(cwd, ['diff', '--name-only', 'HEAD']).trim() !== '';
const patternsOf = (extra) => (typeof extra === 'string' && extra ? [...TEST_PATTERNS, new RegExp(extra)] : TEST_PATTERNS);
export const isTestFile = (path, extra) => patternsOf(extra).some((re) => re.test(path.replace(/\\/g, '/')));

/** The item's diff, split: method `test` when it adds or extends a test file. */
export function classify({ repo, base, sha, tests } = {}) {
  const dir = need('repo', repo), from = need('base', base), to = need('sha', sha);
  const files = git(dir, ['diff', '--name-only', `${from}..${to}`]).split('\n').map((s) => s.trim()).filter(Boolean);
  const testFiles = files.filter((f) => isTestFile(f, tests));
  const production = files.filter((f) => !testFiles.includes(f));
  return {
    files, tests: testFiles, production, method: testFiles.length ? 'test' : null,
    rule: testFiles.length
      ? `the diff adds or extends ${testFiles.length} test file(s): the proof's method is test, its control the new test failing with ${production.length ? 'the production change reverted (--revert-production)' : 'a drift of the guarded line (--patch): the diff has no production line of its own'}`
      : 'no test file in the diff: the proof\'s method is the method its readings were recorded with',
  };
}

function shell(cwd, command) {
  const r = spawnSync(command, { cwd, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } });
  if (r.error) bad(`the test command could not start: ${r.error.message}`);
  return { exit: r.status ?? 1, output: `${r.stdout ?? ''}\n${r.stderr ?? ''}` };
}
const lines = (out) => out.split(/\r?\n/).map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim());
const tail = (out, n = 12) => lines(out).slice(-n).join('\n');

/** Reads the mutated run: the distinct assertion lines, and whether it crashed instead. */
export function readFailure(output) {
  const ls = lines(output);
  const asserted = [...new Set(ls.filter((l) => !SUMMARY.test(l) && ASSERTION.some((re) => re.test(l))).map((l) => l.trim()))];
  const crashed = ls.find((l) => CRASH.some((re) => re.test(l)));
  return { asserted, crashed };
}

export function run({ repo, sha, test: command, patch, revertProduction, base, scratch, tests } = {}) {
  const home = need('repo', repo), at = need('sha', sha), cmd = need('test', command);
  if ((patch === undefined) === (revertProduction === undefined)) bad('name the mutation: --patch <file> (drift the guarded line) or --revert-production --base <sha> (undo the item\'s own production change)');
  let mutation;
  if (patch !== undefined) {
    const file = resolve(need('patch', patch));
    if (!existsSync(file)) bad(`--patch ${patch} does not exist`);
    mutation = { kind: 'patch', diff: readFileSync(file, 'utf8') };
    if (!mutation.diff.trim()) bad(`--patch ${patch} is empty`);
    const touched = [...mutation.diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((m) => m[1]);
    mutation.label = `patch ${basename(file)} (${touched.join(', ') || 'files unnamed'})`;
  } else {
    const c = classify({ repo: home, base, sha: at, tests });
    if (!c.production.length) bad('the item\'s diff changes test files only: there is no production line of its own to revert - write the drift of the guarded line as a diff and pass --patch');
    mutation = { kind: 'revert', diff: git(home, ['diff', `${base}..${at}`, '--', ...c.production]) };
    mutation.label = `reverted the item's production change (${c.production.join(', ')})`;
  }
  const full = git(home, ['rev-parse', `${at}^{commit}`]).trim();
  let dir = home, made = false;
  if (scratch !== undefined) {
    dir = resolve(need('scratch', scratch));
    if (existsSync(dir)) bad(`--scratch ${scratch} exists: name a fresh directory`);
    git(home, ['worktree', 'add', '--detach', dir, full]);
    made = true;
  } else {
    if (git(home, ['rev-parse', 'HEAD']).trim() !== full) bad(`--repo is not at ${at}: check out the item's commit in the pack worktree (or pass --scratch)`);
    if (dirty(home)) bad('--repo has uncommitted changes to tracked files: the control mutates the tree, so it starts clean');
  }
  try {
    const green = shell(dir, cmd);
    const result = { command: cmd, mutation: mutation.label, green_exit: green.exit };
    if (green.exit !== 0) return { ...result, red: false, control: 'absent', why: `the test fails at ${at} without any mutation (exit ${green.exit}): it is red already, so a failure under the mutation proves nothing`, output_tail: tail(green.output) };
    git(dir, ['apply', '--whitespace=nowarn', ...(mutation.kind === 'revert' ? ['-R'] : []), '-'], mutation.diff);
    let mutated;
    try { mutated = shell(dir, cmd); } finally {
      git(dir, ['apply', '--whitespace=nowarn', ...(mutation.kind === 'revert' ? [] : ['-R']), '-'], mutation.diff);
    }
    if (dirty(dir)) bad(`the mutation did not undo cleanly in ${dir}: inspect it before building anything else there`);
    const { asserted, crashed } = readFailure(mutated.output);
    const out = { ...result, exit: mutated.exit, output_tail: tail(mutated.output) };
    if (mutated.exit === 0) return { ...out, red: false, control: 'absent', why: 'the test still passes with the guarded line mutated: it does not guard that line' };
    if (!asserted.length) return { ...out, red: false, control: 'absent', why: crashed ? `the mutated run crashed before any assertion (${crashed.trim()}): drift the line's behaviour, not its loading` : 'the mutated run failed with no assertion line in its output: a failure the script cannot tell from a crash' };
    const test_control = { command: cmd, mutation: mutation.label, exit: mutated.exit, assertion: asserted[0].slice(0, 300) };
    const proof_fields = { method: 'test', control: 'red', control_value: asserted.length, test_control };
    return { ...out, red: true, control: 'red', method: 'test', control_value: asserted.length, test_control, proof_fields };
  } finally {
    if (made) { try { execFileSync('git', ['-C', home, 'worktree', 'remove', '--force', dir], { stdio: 'ignore' }); } catch { /* reported by a later worktree list */ } }
  }
}

function need(name, v) { if (v === undefined || v === null || v === '' || v === true) bad(`--${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} is required`); return String(v); }

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const next = argv[i + 1];
    if (key === 'revertProduction') { out[key] = true; continue; }
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i += 1; }
  }
  return out;
}
const FLAGS = { classify: ['repo', 'base', 'sha', 'tests'], run: ['repo', 'sha', 'test', 'patch', 'revertProduction', 'base', 'scratch', 'tests'] };
const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^#!.*\n/, '').replace(/^\/\/ ?/gm, '');

export function main(argv) {
  const a = parseArgs(argv);
  const cmd = a._[0];
  if (!cmd || a.help) return { help: HELP };
  if (!FLAGS[cmd]) bad(`unknown subcommand ${JSON.stringify(cmd)} - run with --help`);
  const unknown = Object.keys(a).filter((k) => k !== '_' && !FLAGS[cmd].includes(k));
  if (unknown.length) bad(`unknown flag(s) for ${cmd}: ${unknown.map((k) => `--${k}`).join(', ')}`);
  return cmd === 'classify' ? classify(a) : run(a);
}

const isEntry = (argv1) => { try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } };
if (process.argv[1] && isEntry(process.argv[1])) {
  try {
    const out = main(process.argv.slice(2));
    if (out.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    process.exit(out.help || out.red !== false ? 0 : 1);
  } catch (e) {
    process.stderr.write(`control: ${e.message}\n`);
    process.exit(e instanceof ControlError ? e.code : 2);
  }
}
