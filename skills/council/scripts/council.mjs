#!/usr/bin/env node
/**
 * council - the file-backed instrument behind the /council method.
 *
 * Four subcommands, all deterministic, all dependency-free, none of them a judge:
 *
 *   receipt   - pin what this round looked at (head sha + a content digest over the span)
 *   drift     - compare two receipts: none | grown | changed | unknown
 *   aggregate - fold the members' verdict files into one result.json by the pass rule
 *   validate  - check a result.json, or one member's verdict, against the contract
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
 *   node council.mjs aggregate --run-dir <dir> --summary "<paragraph>" [--rubric <file>] [--trust-state <s>] [--round <n>] [--state <state.json>]
 *   node council.mjs validate  --result <result.json>
 *   node council.mjs validate  --verdict <verdict-<dimension>.json> [--dimension <d>]
 *
 * Every subcommand prints JSON on stdout and human notes on stderr, so it composes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReceipt } from './lib/receipt.mjs';
import { drift } from './lib/drift.mjs';
import { aggregate, buildResult, validateRubric } from './lib/aggregate.mjs';
import { validateResult, validateVerdict } from './lib/schema.mjs';

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
  // Disclosures, never refusals. A span is a product decision; the receipt says what it
  // noticed about its shape and a person judges the map.
  for (const o of receipt.orphan_tests) console.error(`  note: ${o.path} tests ${o.subjects.join(', ')}, which the span does not cover`);
  if (receipt.tests_outnumber_sources) console.error(`  note: the span holds more test files (${receipt.test_file_count}) than sources (${receipt.source_file_count})`);
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

  // The DECLARED scenarios come from the product's exported state, never from a member:
  // --state <state.json> (rows filtered to this subject), else whatever phase 1 copied
  // into started.json, else none. Absence is tolerated everywhere - a subject that
  // declares no branches aggregates exactly as it did before scenarios existed.
  const stateFile = flag('state');
  let declaredScenarios = Array.isArray(started.scenarios) ? started.scenarios : [];
  if (stateFile) {
    if (!fs.existsSync(stateFile)) console.error(`  note: no state file at ${stateFile} - no declared scenarios`);
    else {
      const rows = readJson(stateFile)?.scenarios;
      declaredScenarios = Array.isArray(rows)
        ? rows.filter((r) => !r?.subject_slug || r.subject_slug === started.subject?.slug)
        : [];
      if (!Array.isArray(rows)) console.error('  note: the state file declares no scenarios key - none read');
    }
  }

  // `summary` is REQUIRED, and it is resolved before anything is written. The documented
  // command line used to carry no way to supply one, `started.summary` was never set by
  // any phase, and the fallback was the empty string - so every run that followed the
  // instructions shipped `"summary": ""` and the consuming door substituted the subject's
  // own blurb, which then read to a person as what the council concluded.
  //
  // Third source: the first paragraph of a `report.md` this run already wrote. `aggregate`
  // is idempotent and gets re-run after synthesis often enough for that to be the honest
  // answer rather than a guess.
  const reportFirstParagraph = () => {
    const f = path.join(dir, 'report.md');
    if (!fs.existsSync(f)) return '';
    const body = fs.readFileSync(f, 'utf8')
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .find((b) => b && !b.startsWith('#') && !b.startsWith('|') && !b.startsWith('---'));
    return (body ?? '').replace(/\s+/g, ' ').trim();
  };
  const summary = String(flag('summary') ?? started.summary ?? reportFirstParagraph() ?? '').trim();
  if (!summary) {
    die(`aggregate refuses an empty summary. Pass --summary "<the synthesis in a paragraph>", or put one in started.json, or write ${path.join(dir, 'report.md')} first.
  An empty summary is not a blank: the consuming door substitutes the SUBJECT's own description for it, so a person reads the thing describing itself labelled as what the council concluded.`);
  }

  const agg = aggregate(rubric, verdicts, {
    trustState, roundNo, hardFailures, mustAddress: carriedMustAddress, scenarios: declaredScenarios,
  });
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
    summary,
  }, agg);

  const problems = validateResult(result);
  const outFile = path.join(dir, 'result.json');
  fs.writeFileSync(outFile, `${JSON.stringify(result, null, 2)}\n`);
  console.error(`  written ${outFile}`);
  emit({
    outcome: result.outcome, overall: result.overall, coverage: result.coverage,
    ...(result.envelope ? { envelope: result.envelope } : {}),
    must_address: result.must_address, problems,
  });
  if (problems.length) { console.error(`\nthe result does not validate:\n  - ${problems.join('\n  - ')}`); process.exit(1); }
  process.exit(0);
}

// ----------------------------------------------------------------- validate
if (cmd === 'validate') {
  // Two shapes, because a member has a file to check too and used to have no way to check
  // it: a broken verdict was discovered at `aggregate`, after every member had already run.
  const verdictFile = flag('verdict');
  if (verdictFile) {
    const named = flag('dimension');
    const inferred = /verdict-([A-Za-z0-9_-]+)\.json$/.exec(path.basename(verdictFile))?.[1] ?? null;
    const problems = validateVerdict(readJson(verdictFile), { dimension: named ?? inferred });
    emit({ valid: problems.length === 0, dimension: named ?? inferred, problems });
    process.exit(problems.length ? 1 : 0);
  }
  const file = flag('result') ?? argv[1];
  if (!file) die('validate needs --result <result.json> or --verdict <verdict-<dimension>.json>');
  const problems = validateResult(readJson(file));
  emit({ valid: problems.length === 0, problems });
  process.exit(problems.length ? 1 : 0);
}

console.error(`council: unknown subcommand ${JSON.stringify(cmd ?? '')}

  receipt   --root <dir> --paths <a,b,...> [--head <sha>] [--out <file>]
  drift     --prior <receipt.json> --current <receipt.json>
  aggregate --run-dir <dir> --summary "<paragraph>" [--rubric <file>] [--trust-state <s>] [--round <n>] [--state <state.json>]
  validate  --result <result.json>
  validate  --verdict <verdict-<dimension>.json> [--dimension <d>]
`);
process.exit(2);
