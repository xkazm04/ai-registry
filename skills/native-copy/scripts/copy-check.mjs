#!/usr/bin/env node
// copy-check.mjs - the native-copy mechanical gate for English web copy. Builtins only.
//
//   node copy-check.mjs [--all]                       lint every string the contract's sources hold
//   node copy-check.mjs --changed [--base <ref>]      lint only strings changed against <ref>
//   node copy-check.mjs --baseline write              record current findings as the ratchet baseline
//   node copy-check.mjs --baseline ignore             check without the baseline (every error is new)
//   node copy-check.mjs --init [--write] [--source <glob>=<kind>]   count conventions, propose a contract
//   node copy-check.mjs --list-rules [--registry <dir>]             rule table (+ drift against the english subject)
//   options: --contract <path> --root <dir> --json --errors-only --limit <n>
//
// Exit: 0 ok; 1 new error-severity findings (not in the baseline) or unreadable files;
// 2 config or usage failure (the message says which). Detectors never gate; every
// finding cites an EN rule ID from the registry's `english` subject.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { expandSources, toPosix } from './lib/glob.mjs';
import { extractFile, KINDS } from './lib/extract.mjs';
import { RULES, RULE_IDS, lintRecords } from './lib/rules.mjs';
import { normalizeContract, contractFor } from './lib/contract.mjs';
import { applyBaseline, buildBaseline, changedRecords, parseBaseline } from './lib/baseline.mjs';
import { countConventions, proposeContract } from './lib/init.mjs';
import { formatHuman, formatJson, summaryLine } from './lib/report.mjs';

const VERSION = 'native-copy/copy-check 1.1.0';
const DEFAULT_CONTRACT = 'docs/i18n/copy-contract.json';

function usage(msg) {
  if (msg) console.error(`copy-check: usage error: ${msg}`);
  console.error('usage: copy-check [--all|--changed [--base <ref>]] [--contract <path>] [--root <dir>] [--json] [--errors-only] [--all-findings] [--limit <n>] [--baseline write|ignore] | --init [--write] [--source <glob>=<kind>] | --list-rules [--registry <dir>]');
  process.exit(msg ? 2 : 0);
}
const fail2 = (msg) => { console.error(`copy-check: config failure: ${msg}`); process.exit(2); };

function parseArgs(argv) {
  const a = { mode: 'all', sources: [] };
  const needs = (i, flag) => { if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) usage(`${flag} needs a value`); return argv[i + 1]; };
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    switch (f) {
      case '--all': a.mode = 'all'; break;
      case '--changed': a.mode = 'changed'; break;
      case '--base': a.base = needs(i, f); i++; break;
      case '--contract': a.contract = needs(i, f); i++; break;
      case '--root': a.root = needs(i, f); i++; break;
      case '--json': a.json = true; break;
      case '--errors-only': a.errorsOnly = true; break;
      case '--all-findings': a.allFindings = true; break;
      case '--limit': a.limit = Number(needs(i, f)); i++; if (!Number.isInteger(a.limit) || a.limit < 0) usage('--limit takes a non-negative integer'); break;
      case '--baseline': a.baseline = needs(i, f); i++; if (!['write', 'ignore'].includes(a.baseline)) usage('--baseline takes write|ignore'); break;
      case '--init': a.init = true; break;
      case '--write': a.write = true; break;
      case '--source': a.sources.push(needs(i, f)); i++; break;
      case '--list-rules': a.listRules = true; break;
      case '--strings': a.strings = true; break;
      case '--registry': a.registry = needs(i, f); i++; break;
      case '--help': case '-h': usage(); break;
      default: usage(`unknown argument ${f}`);
    }
  }
  if (a.baseline === 'write' && a.mode === 'changed') usage('--baseline write needs a full scan; drop --changed');
  return a;
}

// ------------------------------------------------------------------ git

function git(root, args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

function changedFiles(root, baseArg) {
  const top = git(root, ['rev-parse', '--show-toplevel'], { allowFail: true });
  if (top === null) fail2(`--changed needs a git repository at ${root}`);
  const topDir = top.trim();
  const candidates = baseArg ? [baseArg] : [process.env.COPY_CHECK_BASE, 'origin/main', 'main', 'origin/master', 'master'].filter(Boolean);
  const base = candidates.find((ref) => git(root, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { allowFail: true }) !== null);
  if (!base) fail2(`--changed cannot resolve a base ref (tried ${candidates.join(', ')}); pass --base <ref>`);
  const mb = (git(root, ['merge-base', base, 'HEAD'], { allowFail: true }) || '').trim() || base;
  const split = (s) => (s || '').split('\0').filter(Boolean);
  const names = new Set([
    ...split(git(root, ['diff', '--name-only', '-z', mb, 'HEAD'], { allowFail: true })),
    ...split(git(root, ['diff', '--name-only', '-z'], { allowFail: true })),
    ...split(git(root, ['diff', '--name-only', '-z', '--cached'], { allowFail: true })),
    ...split(git(root, ['ls-files', '--others', '--exclude-standard', '--full-name', '-z'], { allowFail: true })),
  ]);
  const prefix = toPosix(path.relative(topDir, root));
  const rel = new Set();
  for (const n of names) {
    if (!prefix) rel.add(n);
    else if (n.startsWith(`${prefix}/`)) rel.add(n.slice(prefix.length + 1));
  }
  const showBase = (file) => git(root, ['show', `${mb}:${prefix ? `${prefix}/` : ''}${file}`], { allowFail: true });
  return { base, mergeBase: mb, files: rel, showBase };
}

// ------------------------------------------------------------------ commands

function listRules(args) {
  let registryIds = null; let note = null;
  if (args.registry) {
    const indexPath = path.join(args.registry, 'knowledge', 'localization', 'index.json');
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const subj = index.subjects?.english;
      if (!subj?.file) note = 'the english subject is not in the localization index yet; no drift check';
      else {
        const dir = path.join(args.registry, path.dirname(subj.file));
        registryIds = new Set();
        const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.md')) for (const m of fs.readFileSync(p, 'utf8').matchAll(/\bEN-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g)) registryIds.add(m[0]); } };
        walk(dir);
      }
    } catch (e) { note = `cannot read ${indexPath}: ${e.message}`; }
  }
  let drift = 0;
  for (const r of RULES) {
    const inSubject = registryIds ? (registryIds.has(r.id) ? 'in subject' : 'MISSING from subject') : '';
    if (registryIds && !registryIds.has(r.id)) drift += 1;
    console.log(`${r.id.padEnd(20)} ${r.defaultSeverity.padEnd(6)} ${r.fragmentSafe ? 'fragments+sentences' : 'sentences only     '} ${inSubject}`);
  }
  if (note) console.log(`note: ${note}`);
  console.log(`${RULES.length} rules${registryIds ? `; ${drift} missing from the english subject` : ''}`);
  process.exit(drift ? 1 : 0);
}

const DISCOVER = [
  ['messages/en.json', 'json-catalog'], ['messages/en-US.json', 'json-catalog'], ['messages/en-GB.json', 'json-catalog'],
  ['locales/en.json', 'json-catalog'], ['locales/en/*.json', 'json-catalog'], ['public/locales/en/*.json', 'json-catalog'],
  ['src/locales/en.json', 'json-catalog'], ['src/locales/en/*.json', 'json-catalog'], ['src/i18n/en.json', 'json-catalog'],
  ['src/messages/en.json', 'json-catalog'], ['i18n/en.json', 'json-catalog'], ['src/i18n/locales/en.json', 'json-catalog'],
];

function readSources(root, contractPath, args) {
  if (args.sources.length) {
    return args.sources.map((s) => {
      const at = s.lastIndexOf('=');
      if (at < 1) usage(`--source takes <glob>=<kind>, got ${s}`);
      const kind = s.slice(at + 1);
      if (!KINDS.includes(kind)) usage(`--source kind must be one of ${KINDS.join('|')}`);
      return { path: s.slice(0, at), kind };
    });
  }
  if (fs.existsSync(contractPath)) {
    try { const raw = JSON.parse(fs.readFileSync(contractPath, 'utf8')); if (Array.isArray(raw.sources) && raw.sources.length) return raw.sources.map((s) => ({ path: s.path ?? s.glob, kind: s.kind })); } catch { /* fall through */ }
  }
  const found = DISCOVER.filter(([p, kind]) => expandSources(root, [{ path: p, kind }]).files.length).map(([p, kind]) => ({ path: p, kind }));
  if (!found.length) fail2('--init found no English catalog at the usual paths; pass --source <glob>=<kind> (kinds: json-catalog, ts-module, jsx, mdx, markdown)');
  return found;
}

function extractAll(root, files) {
  const records = []; const unreadable = [];
  for (const f of files) {
    try {
      const text = fs.readFileSync(path.join(root, f.file), 'utf8');
      const recs = extractFile(text, f.file, f.kind);
      f.records = recs;
      records.push(...recs);
    } catch (e) {
      unreadable.push({ file: f.file, reason: e.message.split('\n')[0] });
      f.records = [];
    }
  }
  return { records, unreadable };
}

function init(root, contractPath, args) {
  const sources = readSources(root, contractPath, args);
  const { files } = expandSources(root, sources, []);
  const { records, unreadable } = extractAll(root, files);
  const counts = countConventions(records, contractFor());
  const proposal = proposeContract(counts, sources);
  const text = `${JSON.stringify(proposal, null, 2)}\n`;
  console.log(text);
  console.log(`counted ${records.length} strings in ${files.length} files from ${sources.length} sources; ${unreadable.length} unreadable`);
  for (const u of unreadable) console.log(`  unreadable: ${u.file}: ${u.reason}`);
  if (args.write) {
    if (fs.existsSync(contractPath)) fail2(`${contractPath} exists; --init --write never overwrites a declared contract`);
    fs.mkdirSync(path.dirname(contractPath), { recursive: true });
    fs.writeFileSync(contractPath, text);
    console.log(`wrote ${toPosix(path.relative(root, contractPath))} - the "_notes" are counts, not decisions; declare, then run --baseline write`);
  } else {
    console.log('proposal only - nothing written (add --write to create the contract)');
  }
  process.exit(0);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.listRules) listRules(args);
  const root = path.resolve(args.root || process.cwd());
  const contractPath = args.contract ? path.resolve(process.cwd(), args.contract) : path.join(root, DEFAULT_CONTRACT);
  if (args.init) init(root, contractPath, args);

  if (!fs.existsSync(contractPath)) fail2(`no contract at ${contractPath}; run --init to count the catalog and propose one`);
  let raw;
  try { raw = JSON.parse(fs.readFileSync(contractPath, 'utf8')); } catch (e) { fail2(`${contractPath} is not valid JSON: ${e.message}`); }
  const { contract, errors } = normalizeContract(raw, { knownRules: RULE_IDS });
  if (errors.length) fail2(`${contractPath}:\n  - ${errors.join('\n  - ')}`);

  const notes = [];
  const { files: allFiles, perSource } = expandSources(root, contract.sources, contract.exclude);
  perSource.forEach((n, i) => { if (n === 0) notes.push(`source ${JSON.stringify(contract.sources[i].path)} matched 0 files`); });
  if (!allFiles.length) fail2(`the contract's sources matched no files under ${root}`);

  let files = allFiles;
  let changed = null;
  if (args.mode === 'changed') {
    changed = changedFiles(root, args.base);
    files = allFiles.filter((f) => changed.files.has(f.file));
    notes.push(`changed against ${changed.base} (merge-base ${changed.mergeBase.slice(0, 10)}): ${files.length} of ${allFiles.length} source files touched`);
  }

  const { records, unreadable } = extractAll(root, files);
  let inScope = records;
  if (changed) {
    inScope = [];
    for (const f of files) {
      const baseText = changed.showBase(f.file);
      let baseRecs = [];
      if (baseText !== null) { try { baseRecs = extractFile(baseText, f.file, f.kind); } catch { baseRecs = []; } }
      inScope.push(...changedRecords(f.records, baseRecs));
    }
  }
  const scopeSet = new Set(inScope);
  const degraded = new Set(records.filter((r) => r.degraded).map((r) => r.file));
  for (const d of degraded) notes.push(`${d}: JSX parse failed; strings were read without JSX (degraded coverage)`);
  const icuBroken = inScope.filter((r) => r.icuError);
  if (icuBroken.length) notes.push(`${icuBroken.length} message(s) failed ICU parsing and were linted with simple placeholder substitution (first: ${icuBroken[0].file} ${icuBroken[0].key})`);

  if (args.strings) {
    // Coverage audit: exactly the strings the rules would see, nothing linted.
    for (const r of inScope) console.log(`${r.file}:${r.line} ${r.key || '-'} [${r.kind}${r.tag ? ` ${r.tag}` : ''}] ${JSON.stringify(r.text)}`);
    console.log(`${inScope.length} strings (${inScope.filter((r) => r.kind === 'fragment').length} fragments) in ${files.length} files; ${unreadable.length} unreadable`);
    process.exit(unreadable.length ? 1 : 0);
  }

  const findings = lintRecords(records, contract).filter((f) => scopeSet.has(f.record));

  const baselinePath = path.resolve(root, contract.baseline);
  if (args.baseline === 'write') {
    const b = buildBaseline(findings, { checker: VERSION, generatedAt: new Date().toISOString() });
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(baselinePath, `${JSON.stringify(b, null, 2)}\n`);
    notes.push(`baseline written: ${b.count} fingerprints to ${toPosix(path.relative(root, baselinePath))}`);
  }
  let baseline = null;
  if (args.baseline !== 'ignore') {
    if (fs.existsSync(baselinePath)) {
      try { baseline = parseBaseline(fs.readFileSync(baselinePath, 'utf8')); } catch (e) { fail2(`baseline ${baselinePath} is unreadable: ${e.message}`); }
    } else notes.push(`no baseline at ${toPosix(path.relative(root, baselinePath))}; every error counts as new`);
  }
  const { newErrors, resolved } = applyBaseline(findings, baseline);
  if (baseline && resolved && args.mode === 'all') notes.push(`${resolved} baseline entr${resolved === 1 ? 'y is' : 'ies are'} no longer produced; rewrite the baseline to tighten the ratchet`);
  for (const u of unreadable) notes.push(`unreadable: ${u.file}: ${u.reason}`);

  const summary = {
    checker: VERSION, mode: args.mode, variant: contract.variant,
    strings: inScope.length, fragments: inScope.filter((r) => r.kind === 'fragment').length,
    files: files.length, sources: contract.sources.length, unreadable: unreadable.length,
    errors: findings.filter((f) => f.severity === 'error').length, newErrors,
    warnings: findings.filter((f) => f.severity === 'warn').length, notes,
  };

  if (args.json) console.log(formatJson(findings, summary));
  else console.log(formatHuman(findings, summary, { errorsOnly: args.errorsOnly, limit: args.limit, allFindings: args.allFindings }));

  const failing = newErrors > 0 || unreadable.length > 0;
  if (!args.json) console.log(failing ? `copy-check: FAIL - ${newErrors} new error(s)${unreadable.length ? `, ${unreadable.length} unreadable file(s)` : ''}` : 'copy-check: OK');
  void summaryLine;
  process.exit(failing && args.baseline !== 'write' ? 1 : 0);
}

// A crash is not a finding: exit 2 (the checker failed) so a hook or an agent never reads a
// broken instrument as "new errors in the copy" (2026-09-14: a half-applied edit threw inside a
// rule and a fleet pre-push reported exit 1 as if the copy were at fault).
try {
  main();
} catch (e) {
  console.error(`copy-check: internal failure (the checker, not the copy): ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
  process.exit(2);
}
