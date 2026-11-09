#!/usr/bin/env node
/**
 * check-generated-contract - the fields other repositories parse out of our generated files
 * are a contract, and this is the instrument that holds it.
 *
 * Why it exists. `registry.yaml` promises `compatibility: additive`, and the generated JSON
 * views (catalog.json, knowledge/<domain>/index.json, recipes/index.json,
 * publications/index.json, .claude-plugin/marketplace.json) are read at run time by code in
 * OTHER repositories. Nothing checked the promise. On 2026-10-25 a builder answered "no
 * consumer reads index.json laws techniques" from a grep inside this repo, and only a grep
 * across the fleet found the personas app reading it. A dropped or renamed field breaks a
 * consumer in another repository, at run time, with nobody present - so the field list is
 * committed (scripts/contracts/generated-fields.json) and compared against the tree.
 *
 * Path notation: dotted keys, `[]` for every element of an array, `{}` for every value of a
 * map (an object keyed by data, e.g. subject slugs). `subjects{}.techniques[].slug`.
 * Whether an object is a map or a record is read from the contract (a declared `x{}` makes
 * `x` a map, a declared `x.key` makes it a record); for an object the contract has never
 * seen, a key that is not an identifier, or more than 30 keys, makes it a map.
 *
 * Verdicts, per file the glob matches:
 *   - a declared path that is absent, or present on only some of the objects that should
 *     carry it, or whose JSON type is not in its declared union -> VIOLATION (exit 1), and
 *     the message names the consumers that read it;
 *   - a declared path is NOT absent when its container is empty everywhere in this file
 *     (an empty array has no elements to carry a field): that is vacuous, not a drop;
 *   - `"optional": true` excuses absence and partial presence, never a wrong type;
 *   - a path in the file that the contract does not declare -> NOTE (additive is allowed);
 *     `--write` adds it with `"consumers": []` and never removes or edits a declared entry;
 *   - a glob that matches no file, a generated file or contract that does not parse ->
 *     could not run (exit 2).
 * Removing a path from the contract is how a breaking change is made on purpose; see
 * docs/generated-contract.md. rules/*.md are markdown and out of scope.
 *
 * Usage:
 *   node scripts/check-generated-contract.mjs                 check the tree (the gate)
 *   node scripts/check-generated-contract.mjs --write         also add undeclared paths
 *   node scripts/check-generated-contract.mjs --self-test     prove a dropped field is seen
 *   node scripts/check-generated-contract.mjs --consumers <dir> --slug <slug>
 *        report-only lead scan of one consumer checkout: field names it appears to read
 *        that the contract does not yet attribute to <slug>. Writes nothing.
 *   --root <dir> / --contract <file>   another tree or contract (tests, fixtures)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';

const HERE = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
export const DEFAULT_CONTRACT = path.join('scripts', 'contracts', 'generated-fields.json');
export const SCHEMA = 'generated-contract/1';
const TYPES = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null'];
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const MAP_KEY_LIMIT = 30;

export class CouldNotRun extends Error {}

// ---------------------------------------------------------------- path helpers

/** `a.b[]{}.c` -> { parent: 'a.b[]{}', step: 'key'|'elem', key } */
export function splitPath(p) {
  if (p.endsWith('[]') || p.endsWith('{}')) return { parent: p.slice(0, -2), step: 'elem', key: p.slice(-2) };
  // A key after `[]`/`{}` is joined with a dot too, so the last dot is always the split.
  const i = p.lastIndexOf('.');
  if (i === -1) return { parent: '', step: 'key', key: p };
  return { parent: p.slice(0, i), step: 'key', key: p.slice(i + 1) };
}

const join = (parent, key) => (parent ? `${parent}.${key}` : key);

/** Map and record containers implied by a set of declared paths. */
export function shapeHints(paths) {
  const maps = new Set();
  const records = new Set();
  for (const p of paths) {
    let cur = p;
    while (cur) {
      const { parent, step, key } = splitPath(cur);
      if (step === 'elem' && key === '{}') maps.add(parent);
      if (step === 'key') records.add(parent);
      cur = parent;
    }
  }
  return { maps, records };
}

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

// ---------------------------------------------------------------- derivation

/**
 * Walk one parsed JSON document. Per path: the types seen, how many values were seen, how
 * many were objects / arrays, how many containers had at least one element, and whether
 * every number seen was an integer.
 */
export function derive(doc, hints = { maps: new Set(), records: new Set() }) {
  const stats = new Map();
  const at = (p) => {
    let s = stats.get(p);
    if (!s) { s = { types: new Set(), count: 0, objects: 0, containers: 0, nonEmpty: 0, allInt: true }; stats.set(p, s); }
    return s;
  };
  const isMap = (p, obj) => {
    if (hints.maps.has(p)) return true;
    if (hints.records.has(p)) return false;
    const keys = Object.keys(obj);
    const map = keys.length > MAP_KEY_LIMIT || keys.some((k) => !IDENT.test(k));
    if (map) hints.found?.add(p);
    return map;
  };
  const walk = (v, p) => {
    const t = typeOf(v);
    if (p !== '') {
      const s = at(p);
      s.types.add(t);
      s.count += 1;
      if (t === 'number' && !Number.isInteger(v)) s.allInt = false;
    }
    if (t === 'array') {
      const s = p === '' ? null : at(p);
      if (s) { s.containers += 1; if (v.length) s.nonEmpty += 1; }
      for (const e of v) walk(e, `${p}[]`);
    } else if (t === 'object') {
      const s = p === '' ? null : at(p);
      if (s) s.objects += 1;
      if (p !== '' && isMap(p, v)) {
        s.containers += 1;
        if (Object.keys(v).length) s.nonEmpty += 1;
        for (const k of Object.keys(v)) walk(v[k], `${p}{}`);
      } else {
        for (const k of Object.keys(v)) walk(v[k], join(p, k));
      }
    }
  };
  if (typeOf(doc) !== 'object') throw new CouldNotRun('the document root is not a JSON object');
  walk(doc, '');
  return stats;
}

/** 'ok' | 'vacuous' | 'missing' | 'partial', with the shortfall for partial. */
export function presence(stats, p, optionalOf = () => false) {
  const s = stats.get(p);
  const { parent, step } = splitPath(p);
  if (s) {
    if (step === 'key' && parent !== '') {
      const ps = stats.get(parent);
      if (ps && s.count < ps.objects) return { state: 'partial', missing: ps.objects - s.count, of: ps.objects };
    }
    return { state: 'ok' };
  }
  if (parent === '') return { state: 'missing' };
  const ps = stats.get(parent);
  if (!ps) {
    const up = presence(stats, parent, optionalOf);
    if (up.state === 'vacuous') return { state: 'vacuous' };
    if (up.state === 'missing' && optionalOf(parent)) return { state: 'vacuous' };
    return { state: 'missing' };
  }
  if (step === 'elem') return ps.nonEmpty === 0 ? { state: 'vacuous' } : { state: 'missing' };
  return ps.objects === 0 ? { state: 'vacuous' } : { state: 'missing' };
}

export function observedType(s) {
  const out = [...s.types];
  return TYPES.filter((t) => out.includes(t)).join('|');
}

export function typeFits(s, declared) {
  const want = new Set(String(declared).split('|').map((x) => x.trim()));
  for (const t of s.types) {
    if (want.has(t)) continue;
    if (t === 'number' && want.has('integer') && s.allInt) continue;
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- the contract

export function loadContract(file) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch (e) { throw new CouldNotRun(`contract ${file} could not be read (${e.code ?? e.message})`); }
  let c;
  try { c = JSON.parse(raw); } catch (e) { throw new CouldNotRun(`contract ${file} does not parse: ${e.message}`); }
  if (!c || c.schema !== SCHEMA || typeof c.files !== 'object' || c.files === null) {
    throw new CouldNotRun(`contract ${file} is not ${SCHEMA} (needs "schema" and a "files" object)`);
  }
  for (const [glob, entry] of Object.entries(c.files)) {
    if (!entry || typeof entry.fields !== 'object' || entry.fields === null) throw new CouldNotRun(`contract glob ${glob} has no "fields" object`);
    for (const [p, f] of Object.entries(entry.fields)) {
      const bad = String(f?.type ?? '').split('|').filter((t) => !TYPES.includes(t.trim()));
      if (!f || typeof f.type !== 'string' || bad.length) throw new CouldNotRun(`contract ${glob} ${p}: type ${JSON.stringify(f?.type)} is not a union of ${TYPES.join('|')}`);
      if (!Array.isArray(f.consumers)) throw new CouldNotRun(`contract ${glob} ${p}: "consumers" must be an array`);
    }
  }
  return c;
}

/** Expand a glob whose only wildcard is `*` inside one path segment. Sorted, forward slashes. */
export function expandGlob(root, glob) {
  const segs = glob.split('/');
  let found = [''];
  for (const [i, seg] of segs.entries()) {
    const last = i === segs.length - 1;
    const next = [];
    for (const base of found) {
      if (!seg.includes('*')) {
        const rel = base ? `${base}/${seg}` : seg;
        const abs = path.join(root, rel);
        if (last ? isFile(abs) : isDir(abs)) next.push(rel);
        continue;
      }
      const re = new RegExp(`^${seg.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`);
      let names = [];
      try { names = fs.readdirSync(path.join(root, base || '.'), { withFileTypes: true }); } catch { names = []; }
      for (const d of names) {
        if (!re.test(d.name)) continue;
        if (last ? d.isFile() : d.isDirectory()) next.push(base ? `${base}/${d.name}` : d.name);
      }
    }
    found = next;
  }
  return found.sort();
}
const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

function readDoc(root, rel) {
  let raw;
  try { raw = fs.readFileSync(path.join(root, rel), 'utf8'); } catch (e) { throw new CouldNotRun(`${rel} could not be read (${e.code ?? e.message})`); }
  try { return JSON.parse(raw.replace(/^\uFEFF/, '')); } catch (e) { throw new CouldNotRun(`${rel} does not parse: ${e.message}`); }
}

// ---------------------------------------------------------------- the check

/**
 * Compare every glob's files with the contract. Returns { violations, notes, additions,
 * files } where additions is glob -> path -> {type, optional} for undeclared paths.
 * Throws CouldNotRun for an unmatched glob or an unparseable file.
 */
export function check(root, contract) {
  const violations = [];
  const notes = [];
  const additions = {};
  const files = {};
  for (const [glob, entry] of Object.entries(contract.files)) {
    const fields = entry.fields;
    const matched = expandGlob(root, glob);
    if (!matched.length) throw new CouldNotRun(`glob ${glob} matches no file under ${root}`);
    files[glob] = matched;
    const declared = shapeHints(Object.keys(fields));
    const optionalOf = (p) => fields[p]?.optional === true;
    const docs = matched.map((rel) => ({ rel, doc: readDoc(root, rel) }));
    // An object the contract has not classified is a map if the heuristic calls ANY instance
    // of its path a map, in any file of the glob - a sparse enum-keyed object whose `no-op`
    // key shows up on one element must not be a record on the others. Iterate to a fixpoint:
    // classifying one path as a map changes the paths below it.
    let auto = new Set();
    for (let round = 0; round < 8; round += 1) {
      const found = new Set();
      const hints = { maps: new Set([...declared.maps, ...auto]), records: declared.records, found };
      for (const { doc } of docs) derive(doc, hints);
      if ([...found].every((p) => auto.has(p))) break;
      auto = new Set([...auto, ...found]);
    }
    const hints = { maps: new Set([...declared.maps, ...auto]), records: declared.records };
    const perFile = docs.map(({ rel, doc }) => ({ rel, stats: derive(doc, hints) }));

    for (const { rel, stats } of perFile) {
      for (const [p, f] of Object.entries(fields)) {
        const who = f.consumers.length ? f.consumers.join(', ') : 'no recorded consumer';
        const pr = presence(stats, p, optionalOf);
        if ((pr.state === 'missing' || pr.state === 'partial') && !f.optional) {
          const what = pr.state === 'missing' ? 'is absent' : `is missing on ${pr.missing} of ${pr.of} objects`;
          violations.push({ glob, file: rel, path: p, kind: pr.state, consumers: f.consumers, message: `${rel}: ${p} ${what} - read by ${who}` });
          continue;
        }
        const s = stats.get(p);
        if (s && !typeFits(s, f.type)) {
          violations.push({ glob, file: rel, path: p, kind: 'type', consumers: f.consumers, message: `${rel}: ${p} is ${observedType(s)}, contract says ${f.type} - read by ${who}` });
        }
      }
    }

    // Undeclared paths, aggregated over every file of the glob.
    const seen = new Map();
    for (const { stats } of perFile) {
      for (const [p, s] of stats) {
        if (Object.prototype.hasOwnProperty.call(fields, p)) continue;
        const cur = seen.get(p) ?? { types: new Set(), allInt: true };
        for (const t of s.types) cur.types.add(t);
        cur.allInt = cur.allInt && s.allInt;
        seen.set(p, cur);
      }
    }
    if (seen.size) {
      additions[glob] = {};
      for (const [p, s] of seen) {
        const optional = perFile.some(({ stats }) => ['missing', 'partial'].includes(presence(stats, p, optionalOf).state));
        additions[glob][p] = { type: observedType(s), ...(optional ? { optional: true } : {}) };
        notes.push(`${glob}: ${p} (${observedType(s)}${optional ? ', optional' : ''}) is not declared`);
      }
    }
  }
  return { violations, notes, additions, files };
}

/** Add undeclared paths. Never removes a path, never edits a declared entry. Returns count added. */
export function applyAdditions(contract, additions) {
  let n = 0;
  for (const [glob, paths] of Object.entries(additions)) {
    const fields = contract.files[glob].fields;
    for (const [p, a] of Object.entries(paths)) {
      if (Object.prototype.hasOwnProperty.call(fields, p)) continue;
      fields[p] = { type: a.type, ...(a.optional ? { optional: true } : {}), consumers: [] };
      n += 1;
    }
  }
  return n;
}

export const serialize = (contract) => `${JSON.stringify(contract, null, 2)}\n`;

// ---------------------------------------------------------------- consumer lead scan

const CODE_EXT = /\.(mjs|cjs|js|jsx|ts|tsx|mts|cts|py|rs|go|sh|ps1)$/i;
const SKIP_DIRS = new Set(['.git', 'node_modules', 'target', 'dist', 'build', 'out', '.next', '.venv', 'venv', '__pycache__', 'coverage']);
/** Which glob a file is about, from the generated file names it mentions. */
const GLOB_SIGNS = [
  { re: /catalog\.json/, test: (g) => g === 'catalog.json' },
  { re: /marketplace\.json/, test: (g) => g.endsWith('marketplace.json') },
  { re: /recipes[\\/"', ]+index\.json|recipes\/index/, test: (g) => g.startsWith('recipes/') },
  { re: /publications[\\/"', ]+index\.json|publications\/index/, test: (g) => g.startsWith('publications/') },
  { re: /knowledge[\s\S]{0,80}index\.json/, test: (g) => g.startsWith('knowledge/') },
];

function* walkFiles(dir, base = dir) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.isDirectory()) {
      const sub = path.join(dir, e.name);
      // A nested checkout (a git worktree under the consumer, a vendored clone) is another
      // tree: its readers are counted when that tree is scanned, not twice here.
      if (SKIP_DIRS.has(e.name) || fs.existsSync(path.join(sub, '.git'))) continue;
      yield* walkFiles(sub, base);
    }
    else if (e.isFile() && CODE_EXT.test(e.name)) yield path.join(dir, e.name);
  }
}

const lastKey = (p) => {
  const keys = p.split(/\[\]|\{\}|\./).filter(Boolean);
  return keys[keys.length - 1] ?? null;
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The consumer's own source files: git's view (tracked, plus untracked and not ignored) when
 *  the directory is a checkout, so build output and nested worktrees stay out; else a walk. */
function sourceFiles(dir) {
  try {
    const out = execFileSync('git', ['-C', dir, 'ls-files', '--cached', '--others', '--exclude-standard'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024,
    });
    return out.split('\n').filter((f) => f && CODE_EXT.test(f)).map((f) => path.join(dir, f));
  } catch {
    return [...walkFiles(dir)];
  }
}

/** A lead list: for each glob, declared paths whose last key appears property-shaped in a file
 *  that mentions that generated file, and that the contract does not attribute to `slug`. */
export function consumerLeads(dir, slug, contract) {
  const leads = [];
  for (const abs of sourceFiles(dir)) {
    let text;
    try {
      if (fs.statSync(abs).size > 2_000_000) continue;
      text = fs.readFileSync(abs, 'utf8');
    } catch { continue; }
    const globs = Object.keys(contract.files).filter((g) => GLOB_SIGNS.some((s) => s.re.test(text) && s.test(g)));
    if (!globs.length) continue;
    const rel = path.relative(dir, abs).split(path.sep).join('/');
    for (const glob of globs) {
      for (const [p, f] of Object.entries(contract.files[glob].fields)) {
        if (f.consumers.includes(slug)) continue;
        const k = lastKey(p);
        if (!k) continue;
        const re = new RegExp(`(?:[.'"\\[]${esc(k)}\\b|\\b${esc(k)}\\s*:)`);
        if (re.test(text)) leads.push({ glob, path: p, file: rel });
      }
    }
  }
  return leads;
}

// ---------------------------------------------------------------- self-test

export function selfTest() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-contract-'));
  try {
    const write = (rel, obj) => {
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), JSON.stringify(obj));
    };
    const index = {
      meta: { bundle: 'demo' },
      subjects: { 'a-subject': { file: 'knowledge/demo/a/a.md', techniques: [{ slug: 't-one', use_when: ['x'] }] } },
      laws: { 'a-law': { statement: 'S', techniques: ['t-one'] } },
    };
    write('knowledge/demo/index.json', index);
    const contract = { schema: SCHEMA, files: { 'knowledge/*/index.json': { fields: {} } } };
    applyAdditions(contract, check(dir, contract).additions);
    contract.files['knowledge/*/index.json'].fields['laws{}.techniques'].consumers = ['self-test-consumer'];
    const clean = check(dir, contract);
    if (clean.violations.length || clean.notes.length) return { ok: false, why: `seeded contract is not clean: ${clean.violations.map((v) => v.message).join('; ')}${clean.notes.join('; ')}` };
    delete index.laws['a-law'].techniques;
    write('knowledge/demo/index.json', index);
    const broken = check(dir, contract);
    const hit = broken.violations.find((v) => v.path === 'laws{}.techniques' && v.consumers.includes('self-test-consumer'));
    if (!hit) return { ok: false, why: 'a dropped laws{}.techniques was not reported with its consumer' };
    return { ok: true, why: hit.message };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- CLI

function main() {
  installCrashDoor();
  const argv = process.argv.slice(2);
  const valued = new Set(['--root', '--contract', '--consumers', '--slug']);
  const flags = new Set(['--write', '--self-test']);
  const stray = argv.filter((a, i) => !valued.has(a) && !flags.has(a) && !valued.has(argv[i - 1]));
  if (stray.length) {
    console.error(`check-generated-contract FATAL: unknown argument(s) ${stray.join(' ')}`);
    process.exit(EXIT.FATAL);
  }
  const opt = (name) => { const i = argv.indexOf(name); return i === -1 ? undefined : argv[i + 1]; };
  for (const v of valued) if (argv.includes(v) && (opt(v) === undefined || opt(v).startsWith('--'))) {
    console.error(`check-generated-contract FATAL: ${v} needs a value`);
    process.exit(EXIT.FATAL);
  }
  const root = path.resolve(opt('--root') ?? HERE);
  const contractFile = path.resolve(root, opt('--contract') ?? DEFAULT_CONTRACT);

  if (argv.includes('--self-test')) {
    const r = selfTest();
    if (!r.ok) { console.error(`check-generated-contract self-test FAILED: ${r.why}`); process.exit(EXIT.FATAL); }
    console.log(`self-test OK - a dropped field is reported with its consumer:\n  ${r.why}`);
    return EXIT.OK;
  }

  try {
    const contract = loadContract(contractFile);

    if (argv.includes('--consumers')) {
      const dir = path.resolve(opt('--consumers'));
      const slug = opt('--slug');
      if (!slug) { console.error('check-generated-contract FATAL: --consumers needs --slug <slug>'); return EXIT.FATAL; }
      if (!isDir(dir)) { console.error(`check-generated-contract FATAL: ${dir} is not a directory`); return EXIT.FATAL; }
      const leads = consumerLeads(dir, slug, contract);
      console.log(`consumer lead scan for ${slug}: a TEXT SCAN, not a proof. A lead is a field name that appears`);
      console.log('property-shaped in a file that mentions the generated file; read the code before attributing.');
      const by = new Map();
      for (const l of leads) { const k = `${l.glob}  ${l.path}`; by.set(k, [...(by.get(k) ?? []), l.file]); }
      for (const [k, fs_] of [...by].sort()) console.log(`  ${k}  <- ${fs_.length} file(s): ${fs_.slice(0, 4).join(', ')}${fs_.length > 4 ? ', ...' : ''}`);
      console.log(`${by.size} unattributed path lead(s). Nothing was written.`);
      return EXIT.OK;
    }

    const result = check(root, contract);
    const write = argv.includes('--write');
    let added = 0;
    if (write && Object.keys(result.additions).length) {
      added = applyAdditions(contract, result.additions);
      fs.mkdirSync(path.dirname(contractFile), { recursive: true });
      fs.writeFileSync(contractFile, serialize(contract));
    }
    const nFiles = Object.values(result.files).reduce((n, f) => n + f.length, 0);
    const nFields = Object.values(contract.files).reduce((n, e) => n + Object.keys(e.fields).length, 0);
    if (result.notes.length) {
      console.log(`${result.notes.length} undeclared path(s) (additive; ${write ? `added ${added} with "consumers": []` : 'run --write to declare them'}):`);
      for (const n of result.notes.slice(0, 40)) console.log(`  note: ${n}`);
      if (result.notes.length > 40) console.log(`  ... and ${result.notes.length - 40} more`);
    }
    for (const v of result.violations) console.error(`VIOLATION ${v.kind}: ${v.message}`);
    if (result.violations.length) {
      console.error(`\n${result.violations.length} contract violation(s) over ${nFiles} file(s). A consumer in another repository reads these.`);
      console.error('Restore the field, or remove it from the contract on purpose (docs/generated-contract.md).');
      return EXIT.VIOLATIONS;
    }
    console.log(`generated contract OK: ${nFields} declared path(s) over ${Object.keys(contract.files).length} glob(s), ${nFiles} file(s).`);
    return EXIT.OK;
  } catch (e) {
    if (e instanceof CouldNotRun) { console.error(`check-generated-contract FATAL (could not run): ${e.message}`); return EXIT.FATAL; }
    throw e;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main() ?? EXIT.OK;
}
