#!/usr/bin/env node
/**
 * council - the file-backed instrument behind the /council method.
 *
 * Four subcommands, all deterministic, all dependency-free, none of them a judge:
 *
 *   receipt   - pin what this round looked at (head sha + a content digest over the span)
 *   drift     - compare two receipts: none | grown | changed | unknown
 *   aggregate - fold the members' verdict files into one result.json by the pass rule
 *   validate  - check a result.json against the contract before anything consumes it
 *
 * The instrument never scores, never calls a model, never writes a database and never
 * decides. It exists so the arithmetic of a council is the same every time and can be
 * re-run by anyone holding the run directory.
 *
 * Run directory (in the CONSUMING repo, never in the skill):
 *
 *   .personas/council/runs/<run_id>/
 *     started.json            run identity, written at phase 1
 *     receipt.json            this round's receipt
 *     verdict-<dimension>.json  one per member, written by that member and nobody else
 *     hard-failures.json      optional array of {code, detail}
 *     must-address.json       optional array of strings carried in from a human rejection
 *     result.json             written by `aggregate`
 *     report.md               written by the method
 *     evidence/               the evidence pack and any captures
 *
 * Usage:
 *   node council.mjs receipt   --root <dir> --paths <a,b,...> [--head <sha>] [--out <file>]
 *   node council.mjs drift     --prior <receipt.json> --current <receipt.json>
 *   node council.mjs aggregate --run-dir <dir> [--rubric <file>] [--trust-state <s>] [--round <n>]
 *   node council.mjs validate  --result <result.json>
 *
 * Every subcommand prints JSON on stdout and human notes on stderr, so it composes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReceipt } from './lib/receipt.mjs';
import { drift } from './lib/drift.mjs';
import { aggregate, buildResult, validateRubric } from './lib/aggregate.mjs';
import { validateResult } from './lib/schema.mjs';

const SKILL_DIR = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const argv = process.argv.slice(2);
const cmd = argv[0];

const flag = (name, dflt = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 || i === argv.length - 1 ? dflt : argv[i + 1];
};
const die = (msg, code = 2) => { console.error(`council: ${msg}`); process.exit(code); };
const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { die(`cannot read ${file}: ${e.message}`); return null; }
};
const emit = (obj) => process.stdout.write(`${JSON.stringify(obj, null, 2)}\n`);

// ------------------------------------------------------------------ receipt
if (cmd === 'receipt') {
  const root = path.resolve(flag('root', process.cwd()));
  const spanFile = flag('span-file');
  const paths = spanFile
    ? readJson(spanFile)
    : String(flag('paths', '')).split(',').map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(paths) || !paths.length) die('receipt needs --paths a,b,... or --span-file <json array>');
  let receipt;
  try { receipt = buildReceipt({ root, paths, headSha: flag('head') }); }
  catch (e) { die(e.message); }
  if (receipt.missing.length) console.error(`  note: ${receipt.missing.length} spanned path(s) matched nothing: ${receipt.missing.join(', ')}`);
  const out = flag('out');
  if (out) { fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true }); fs.writeFileSync(out, `${JSON.stringify(receipt, null, 2)}\n`); console.error(`  written ${out}`); }
  emit(receipt);
  process.exit(0);
}

// -------------------------------------------------------------------- drift
if (cmd === 'drift') {
  const priorFile = flag('prior');
  const currentFile = flag('current');
  if (!currentFile) die('drift needs --current <receipt.json> (and --prior for anything but "unknown")');
  const prior = priorFile && fs.existsSync(priorFile) ? readJson(priorFile) : null;
  const current = readJson(currentFile);
  const state = drift(prior, current);
  emit({
    drift: state,
    prior_span_digest: prior?.span_digest ?? null,
    current_span_digest: current?.span_digest ?? null,
    carryable: state === 'none' || state === 'grown',
  });
  process.exit(0);
}

// ---------------------------------------------------------------- aggregate
if (cmd === 'aggregate') {
  const runDir = flag('run-dir');
  if (!runDir) die('aggregate needs --run-dir <dir>');
  const dir = path.resolve(runDir);
  const startedFile = path.join(dir, 'started.json');
  if (!fs.existsSync(startedFile)) die(`no started.json in ${dir} - phase 1 writes it, and a run without an identity cannot produce a verdict`);
  const started = readJson(startedFile);

  const rubricFile = flag('rubric') ?? path.join(SKILL_DIR, 'rubric', `${started.rubric_version}.json`);
  if (!fs.existsSync(rubricFile)) die(`no rubric at ${rubricFile}`);
  const rubric = readJson(rubricFile);
  const rubricProblems = validateRubric(rubric);
  if (rubricProblems.length) die(`the rubric is invalid:\n  - ${rubricProblems.join('\n  - ')}`);
  if (rubric.version !== started.rubric_version) die(`rubric version mismatch: run says ${started.rubric_version}, file says ${rubric.version}. A verdict points at the version that scored it; it is never re-pointed.`);

  const verdicts = {};
  const missing = [];
  for (const d of rubric.dimensions) {
    const f = path.join(dir, `verdict-${d.dimension}.json`);
    if (fs.existsSync(f)) verdicts[d.dimension] = readJson(f);
    else missing.push(d.dimension);
  }
  if (missing.length) console.error(`  note: no verdict file for ${missing.join(', ')} - recorded unmeasured, which lowers coverage and never scores zero`);

  const hfFile = path.join(dir, 'hard-failures.json');
  const maFile = path.join(dir, 'must-address.json');
  const hardFailures = fs.existsSync(hfFile) ? readJson(hfFile) : [];
  const carriedMustAddress = fs.existsSync(maFile) ? readJson(maFile) : [];

  const trustState = flag('trust-state') ?? started.trust_state ?? 'uncalibrated';
  const roundNo = Number(flag('round') ?? started.round_no ?? 1);

  const agg = aggregate(rubric, verdicts, { trustState, roundNo, hardFailures, mustAddress: carriedMustAddress });
  for (const p of agg.problems) console.error(`  problem: ${p}`);

  const result = buildResult({
    run_id: started.run_id,
    subject: started.subject,
    rubric_version: rubric.version,
    round_no: roundNo,
    supersedes_run_id: started.supersedes_run_id ?? null,
    trust_state: trustState,
    receipt: started.receipt ?? (fs.existsSync(path.join(dir, 'receipt.json'))
      ? (({ head_sha, spanned_paths, span_digest }) => ({ head_sha, spanned_paths, span_digest }))(readJson(path.join(dir, 'receipt.json')))
      : null),
    hard_failures: hardFailures,
    summary: flag('summary') ?? started.summary ?? '',
  }, agg);

  const problems = validateResult(result);
  const outFile = path.join(dir, 'result.json');
  fs.writeFileSync(outFile, `${JSON.stringify(result, null, 2)}\n`);
  console.error(`  written ${outFile}`);
  emit({ outcome: result.outcome, overall: result.overall, coverage: result.coverage, must_address: result.must_address, problems });
  if (problems.length) { console.error(`\nthe result does not validate:\n  - ${problems.join('\n  - ')}`); process.exit(1); }
  process.exit(0);
}

// ----------------------------------------------------------------- validate
if (cmd === 'validate') {
  const file = flag('result') ?? argv[1];
  if (!file) die('validate needs --result <result.json>');
  const problems = validateResult(readJson(file));
  emit({ valid: problems.length === 0, problems });
  process.exit(problems.length ? 1 : 0);
}

console.error(`council: unknown subcommand ${JSON.stringify(cmd ?? '')}

  receipt   --root <dir> --paths <a,b,...> [--head <sha>] [--out <file>]
  drift     --prior <receipt.json> --current <receipt.json>
  aggregate --run-dir <dir> [--rubric <file>] [--trust-state <s>] [--round <n>]
  validate  --result <result.json>
`);
process.exit(2);
