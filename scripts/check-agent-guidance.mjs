#!/usr/bin/env node
/**
 * check-agent-guidance - does each fleet project's agent guidance actually REACH a session?
 *
 * The harness reads `AGENTS.md` natively (2.1.277+) only when no `CLAUDE.md`,
 * `.claude/CLAUDE.md` or `CLAUDE.local.md` sits in the checkout; otherwise the bridge is an
 * `@AGENTS.md` import line. A sentence that tells the agent to read `AGENTS.md`, or a second
 * populated guidance file beside the first, delivers nothing - and nothing errors. On
 * 2026-09-24 one fleet project carried exactly that: a 52-line `AGENTS.md` that a paired probe
 * showed reaching 0 of 4 questions until it was folded into the canonical file.
 *
 * Topologies (per project root):
 *   native   AGENTS.md, no CLAUDE.md of any kind          -> read directly
 *   import   a CLAUDE.md carries the line `@AGENTS.md`     -> read through the import
 *   pointer  CLAUDE.md canonical, AGENTS.md points at it   -> other tools reach the same file
 *   single   no AGENTS.md                                  -> nothing to bridge
 *   FORK     both present, neither import nor pointer     -> the second file never loads (FAIL)
 *
 * Also reported, never failed: lines per always-loaded file against the documented ~200-line
 * target, and how many linked skills carry each listing tier (see link-registry.mjs).
 *
 *   node scripts/check-agent-guidance.mjs [--project <slug>] [--self-test]
 *
 * Exit 1 on any FORK, 2 when the instrument cannot run (no fleet, or the self-test fails).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBridge } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const TARGET_LINES = 200;
const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };
const lines = (t) => (t == null ? 0 : t.split(/\r?\n/).length);

export const classify = (root) => {
  const claude = [path.join(root, 'CLAUDE.md'), path.join(root, '.claude', 'CLAUDE.md'), path.join(root, 'CLAUDE.local.md')]
    .map((f) => ({ f, t: read(f) })).filter((x) => x.t != null);
  const agents = read(path.join(root, 'AGENTS.md'));
  if (agents == null) return 'single';
  if (!claude.length) return 'native';
  if (claude.some((x) => /^@\.?\/?AGENTS\.md\s*$/m.test(x.t))) return 'import';
  // The reverse topology: AGENTS.md exists to send other tools to the canonical CLAUDE.md.
  if (/\]\((?:\.\/)?CLAUDE\.md\)|`CLAUDE\.md`/.test(agents) && /canonical/i.test(agents)) return 'pointer';
  return 'FORK';
};

const selfTest = () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'cag-'));
  const mk = (name, files) => {
    const d = path.join(base, name);
    for (const [rel, body] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true }); fs.writeFileSync(path.join(d, rel), body); }
    return d;
  };
  const cases = [
    ['native', { 'AGENTS.md': '# a\n' }],
    ['import', { 'CLAUDE.md': '@AGENTS.md\n\nextra\n', 'AGENTS.md': '# a\n' }],
    ['pointer', { 'CLAUDE.md': '# canonical\n', 'AGENTS.md': 'The canonical guidance is [`CLAUDE.md`](CLAUDE.md).\n' }],
    ['single', { 'CLAUDE.md': '# only\n' }],
    ['FORK', { 'CLAUDE.md': '# rules\n', 'AGENTS.md': '# commands\n- Test: x\n' }],
    ['FORK', { '.claude/CLAUDE.md': 'Read AGENTS.md for commands.\n', 'AGENTS.md': '# commands\n' }],
  ];
  let bad = 0;
  cases.forEach(([want, files], i) => { const got = classify(mk(`c${i}`, files)); if (got !== want) { bad += 1; console.error(`self-test: case ${i} expected ${want}, got ${got}`); } });
  fs.rmSync(base, { recursive: true, force: true });
  return bad === 0;
};

if (!selfTest()) { console.error('FATAL: the classifier failed its own cases - not reporting on the fleet.'); process.exit(2); }
if (process.argv.includes('--self-test')) { console.log('self-test: 6/6 topologies classified'); process.exit(0); }

const idx = process.argv.indexOf('--project');
const only = idx === -1 ? null : process.argv[idx + 1];
const fleet = loadBridge(ROOT)._fleet;
const projects = Object.entries(fleet.projects ?? {}).filter(([s]) => !only || s === only);
if (!projects.length) { console.error('FATAL: no fleet project resolved on this machine.'); process.exit(2); }

let forks = 0;
console.log('  project             topology  CLAUDE.md  .claude/CLAUDE.md  AGENTS.md  rules(always)  listing on/name/hidden');
for (const [slug, p] of projects) {
  if (!p?.path || !fs.existsSync(p.path)) { console.log(`  ${slug.padEnd(19)} (checkout not found)`); continue; }
  const r = p.path;
  const topo = classify(r);
  if (topo === 'FORK') forks += 1;
  const flag = (n) => `${n}${n > TARGET_LINES ? '!' : ''}`;
  let ruleLines = 0;
  for (const f of fs.existsSync(path.join(r, '.claude', 'rules')) ? fs.readdirSync(path.join(r, '.claude', 'rules')) : []) {
    const t = read(path.join(r, '.claude', 'rules', f)) || '';
    if (f.endsWith('.md') && !/^---[\s\S]*?^paths:/m.test(t)) ruleLines += lines(t);
  }
  const ov = (() => { try { return JSON.parse(read(path.join(r, '.claude', 'settings.local.json')) || '{}').skillOverrides || {}; } catch { return {}; } })();
  const tiers = Object.values(ov);
  const agentsLoaded = topo === 'import' || topo === 'native';
  console.log(`  ${slug.padEnd(19)} ${topo.padEnd(9)} ${String(flag(lines(read(path.join(r, 'CLAUDE.md'))))).padEnd(10)} ${String(flag(lines(read(path.join(r, '.claude', 'CLAUDE.md'))))).padEnd(18)} ${String(agentsLoaded ? flag(lines(read(path.join(r, 'AGENTS.md')))) : '-').padEnd(10)} ${String(ruleLines).padEnd(14)} ${tiers.filter((x) => x === 'on').length}/${tiers.filter((x) => x === 'name-only').length}/${tiers.filter((x) => x === 'user-invocable-only' || x === 'off').length}`);
}
console.log(`\n  ! = over the ~${TARGET_LINES}-line target for one always-loaded file (reported, not failed: trimming is a judgement, see line-earning and rewrite-behavior-pinning).`);
if (forks) { console.error(`\n${forks} project(s) carry two populated guidance files with no bridge - the second never loads. Fold it into the canonical file (skills/agent-guidance-bootstrap).`); process.exit(1); }
console.log('\nevery project\'s guidance reaches a session through one canonical file.');
