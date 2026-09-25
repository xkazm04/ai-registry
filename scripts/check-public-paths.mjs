#!/usr/bin/env node
/**
 * check-public-paths - no machine's home directory in a published lane.
 *
 * AGENTS.md: "Absolute fleet roots belong only in `.machine.local.json`." Nothing enforced
 * it for the content lanes. The purity gate checks product NAMES and nothing else, so on
 * 2026-09-23 a librarian sweep found 159 lines in 92 published files carrying
 * `C:\Users\<name>\kiro\<project>\...` - two operators' usernames and every fleet
 * checkout's layout, in a public repository - plus one application quoting a PRIVATE
 * project by its absolute path. They were rewritten to repo-relative form (`pof/src/x.ts`),
 * and this check keeps them out.
 *
 * What it flags: a user-profile path, Windows (`C:\Users\<name>\`, either slash) or POSIX
 * (`/home/<name>/`, `/Users/<name>/`), in any tracked text file of a published lane.
 * What it lets through, on purpose:
 *   - placeholder names (`<user>`, `me`, `x`, `example`...): an example path is teaching,
 *     not leaking;
 *   - Windows' shared profile folders (`Public`, `Default`, `All Users`) and
 *     `C:\Users\node_modules` - the literal a broken junction resolves to, which a
 *     worktree recipe has to be able to name;
 *   - `scripts/`, whose tests are fixtures FOR detectors like this one.
 *
 * Usage:  node scripts/check-public-paths.mjs            # the gate
 *         node scripts/check-public-paths.mjs --self-test
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANES = ['knowledge', 'librarian', 'recipes', 'practices', 'memory', 'docs', 'skills', '.claude/skills', 'rules', 'README.md', 'CONTRIBUTING.md', 'AGENTS.md'];
const TEXT = /\.(md|json|jsonl|ya?ml|txt|mjs|js|ts|py|sh)$/i;
const PLACEHOLDER = new Set(['me', 'you', 'x', 'y', 'u', 'user', 'username', 'name', 'example', 'someone', 'somebody', 'foo', 'jdoe', 'alice', 'bob']);
const SHARED = new Set(['public', 'default', 'all users', 'default user', 'node_modules']);

const PROFILE = [
  /(?<![A-Za-z])[A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}([^\\/\s`'"<>|:*?]+)[\\/]/g,
  // not after `:` - `C:/Users/<name>/` is the Windows pattern's, and counting it twice
  // would report one leak as two
  /(?<![\w.~:-])\/(?:home|Users)\/([^/\s`'"<>|:*?]+)\//g,
];

export function leaksIn(line) {
  const out = [];
  for (const re of PROFILE) {
    re.lastIndex = 0;
    for (const m of line.matchAll(re)) {
      const who = m[1].replace(/^<|>$/g, '').toLowerCase();
      if (m[1].startsWith('<') || PLACEHOLDER.has(who) || SHARED.has(who)) continue;
      out.push(m[0]);
    }
  }
  return out;
}

function selfTest() {
  const cases = [
    ['see `C:\\Users\\kazda\\kiro\\pof\\src\\x.ts`', 1],
    ['"path": "C:/Users/mkdol/dolla/gravitone-gcloud"', 1],
    ['cloned to /home/runner/work/repo', 1],
    ['on a Mac: /Users/jane/code/app', 1],
    ['the junction resolves to `C:\\Users\\node_modules` and still prints', 0],
    ['an example: C:\\Users\\<user>\\repo or /home/me/repo', 0],
    ['C:\\Users\\Public\\Documents is shared', 0],
    ['repo-relative `pof/src/x.ts` is the published form', 0],
    ['`~/.personas/companion-brain` is a product path, not a machine', 0],
  ];
  let failed = 0;
  for (const [text, want] of cases) {
    const got = leaksIn(text).length;
    const ok = got === want;
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${want ? 'flags ' : 'passes'} ${JSON.stringify(text.slice(0, 60))} (found ${got})`);
  }
  if (failed) { console.error(`\n${failed} self-test case(s) failed.`); process.exit(EXIT.FATAL); }
  console.log('\nself-test OK - a flag here is a real home path; a pass is not silence.');
}

function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const files = execFileSync('git', ['-C', ROOT, 'ls-files', '--', ...LANES], { encoding: 'utf8' })
    .split('\n').filter((f) => f && TEXT.test(f));
  const hits = [];
  for (const rel of files) {
    let text;
    try { text = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { continue; } // deleted in the working tree
    text.split(/\r?\n/).forEach((line, i) => { for (const m of leaksIn(line)) hits.push(`${rel}:${i + 1}: ${m}`); });
  }
  if (hits.length) {
    for (const h of hits) console.error(`  ${h}`);
    console.error(`\ncheck-public-paths: ${hits.length} machine home path(s) in ${files.length} published file(s).`);
    console.error('Write a repo-relative path (`<project>/src/x.ts`) or a placeholder (`<vault>`). Absolute roots belong in .machine.local.json.');
    process.exitCode = EXIT.VIOLATIONS;
    return;
  }
  console.log(`public paths OK - ${files.length} published file(s), no machine home path.`);
  process.exitCode = EXIT.OK;
}

main();
