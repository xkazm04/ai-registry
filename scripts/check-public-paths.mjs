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
 * What it flags is the PUBLISHED preset of scripts/lib/leaks.mjs, the one table every leak
 * gate shares: a user-profile path - Windows (`C:\Users\<name>`, any case, either slash,
 * with or without a trailing separator), WSL (`/mnt/c/Users/<name>`, and a distro home
 * through its Windows share, `\\wsl.localhost\<distro>\home\<name>`), POSIX
 * (`/home/<name>`, `/Users/<name>`) - and a home-relative layout (`~/code/app/...`,
 * `$HOME/work/x`, `%USERPROFILE%\code\x`), in any text file of a published lane that is
 * tracked or new (untracked and not gitignored).
 * What it lets through, on purpose (each decided in lib/leaks.mjs):
 *   - placeholder names (`<user>`, `me`, `x`, `example`, `...`): an example path is
 *     teaching, not leaking;
 *   - Windows' shared profile folders (`Public`, `Default`, `All Users`) and
 *     `C:\Users\node_modules` - the literal a broken junction resolves to;
 *   - a home-relative dot-dir (`~/.claude/projects` is a tool's path), a bare root
 *     (`~/kiro`), and a module specifier (`from '~/lib/x'`, a tsconfig alias);
 *   - `scripts/`, whose tests are fixtures FOR detectors like this one.
 *
 * Could-not-run is exit 2, not a verdict: git unavailable (or the root not a checkout),
 * or zero published files walked. Reading nothing is not finding nothing.
 *
 * Usage:  node scripts/check-public-paths.mjs                 # the gate
 *         node scripts/check-public-paths.mjs --self-test
 *         node scripts/check-public-paths.mjs --root <dir>    # another checkout (tests)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { requirePopulation } from './lib/check-result.mjs';
import { leaksIn, assertScanner, PRESETS } from './lib/leaks.mjs';

const HERE = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
// projects.json, usage/ and signals/ joined on 2026-10-25: they are published too, and
// their own gates' blunter scans do not replace this one's profile forms.
const LANES = [
  'knowledge', 'librarian', 'recipes', 'practices', 'memory', 'docs', 'skills', '.claude/skills', 'rules', 'publications',
  'usage', 'signals', 'projects.json',
  'README.md', 'CONTRIBUTING.md', 'AGENTS.md',
];
const TEXT = /\.(md|json|jsonl|ya?ml|txt|mjs|js|ts|py|sh|html|svg)$/i;
const FORMS = PRESETS.PUBLISHED;

function selfTest() {
  const cases = [
    ['see `C:\\Users\\kazda\\kiro\\pof\\src\\x.ts`', 1],
    ['"path": "C:/Users/mkdol/dolla/gravitone-gcloud"', 1],
    ['cloned to /home/runner/work/repo', 1],
    ['on a Mac: /Users/jane/code/app', 1],
    // the forms the 2026-10-25 probe found missing, one control each
    ['lowercase c:\\users\\jane\\code\\x', 1],
    ['WSL sees /mnt/c/Users/jane/code/app', 1],
    ['a Windows profile with no separator: C:\\Users\\jane', 1],
    ['a POSIX home with no separator: /home/jane', 1],
    ['cloned under ~/code/app/src', 1],
    ['export REPO=$HOME/work/repo', 1],
    ['cd %USERPROFILE%\\code\\app', 1],
    ['cd $env:USERPROFILE\\code\\app', 1],
    ['Explorer copied \\\\wsl.localhost\\Ubuntu\\home\\jane\\code', 1],
    // what passes, on purpose
    ['the junction resolves to `C:\\Users\\node_modules` and still prints', 0],
    ['an example: C:\\Users\\<user>\\repo or /home/me/repo', 0],
    ['C:\\Users\\Public\\Documents is shared', 0],
    ['elided: C:\\Users\\... and C:\\Users\\\u2026', 0],
    ['repo-relative `pof/src/x.ts` is the published form', 0],
    ['`~/.personas/companion-brain` is a product path, not a machine', 0],
    ['transcripts live in ~/.claude/projects and $HOME/.config/x', 0],
    ['the ~/kiro fleet root names no layout', 0],
    ["import { Home } from '~/features/home/sub_start'", 0],
    ["lazy(() => import('~/features/settings/Admin'))", 0],
    ['%USERPROFILE%\\.claude\\settings.json', 0],
    ['a URL path https://example.com/home/jane/x is not a home', 0],
    ['repo-relative src/home/page.tsx', 0],
  ];
  try { assertScanner(FORMS); } catch (e) {
    console.error(`check-public-paths: ${e.message}`);
    process.exit(EXIT.FATAL);
  }
  let failed = 0;
  for (const [text, want] of cases) {
    const got = leaksIn(text, FORMS).length;
    const ok = got === want;
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${want ? 'flags ' : 'passes'} ${JSON.stringify(text.slice(0, 60))} (found ${got})`);
  }
  if (failed) { console.error(`\n${failed} self-test case(s) failed.`); process.exit(EXIT.FATAL); }
  console.log('\nself-test OK - a flag here is a real home path; a pass is not silence.');
}

function main() {
  const argv = process.argv.slice(2);
  // Closed flag set: `--selftest` used to run the whole gate under the wrong name.
  const stray = argv.filter((a, i) => a !== '--self-test' && a !== '--root' && argv[i - 1] !== '--root');
  if (stray.length) {
    console.error(`check-public-paths FATAL: unknown argument(s) ${stray.join(' ')} (expected --self-test or --root <dir>).`);
    process.exitCode = EXIT.FATAL;
    return;
  }
  if (argv.includes('--self-test')) return selfTest();
  let root = HERE;
  const at = argv.indexOf('--root');
  if (at !== -1) {
    if (!argv[at + 1]) { console.error('check-public-paths FATAL: --root needs a directory.'); process.exitCode = EXIT.FATAL; return; }
    root = path.resolve(argv[at + 1]);
  }
  try { assertScanner(FORMS); } catch (e) {
    console.error(`check-public-paths FATAL: ${e.message}. Refusing to report a clean tree.`);
    process.exitCode = EXIT.FATAL;
    return;
  }
  let listed;
  try {
    // Tracked plus untracked-not-ignored, as run-tests reads its population: the gate runs
    // before a commit, when a new file is still untracked, and CI must not be the first to
    // see it. Ignored files (the `.*.local.md` overlays) stay out by design.
    listed = execFileSync('git', ['-C', root, 'ls-files', '--cached', '--others', '--exclude-standard', '--', ...LANES], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const why = e.code === 'ENOENT' ? 'git is not on PATH' : (String(e.stderr ?? '').trim().split('\n')[0] || e.message);
    console.error(`check-public-paths FATAL: could not list the published files (${why}).`);
    console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
    process.exitCode = EXIT.FATAL;
    return;
  }
  const files = listed.split('\n').filter((f) => f && TEXT.test(f));
  const floor = requirePopulation(files.length, 'published text files');
  if (floor.code !== EXIT.OK) {
    console.error(`check-public-paths FATAL: ${floor.reason}.`);
    process.exitCode = floor.code;
    return;
  }
  const hits = [];
  for (const rel of files) {
    let text;
    try { text = fs.readFileSync(path.join(root, rel), 'utf8'); } catch { continue; } // deleted in the working tree
    text.split(/\r?\n/).forEach((line, i) => {
      for (const h of leaksIn(line, FORMS)) hits.push(`${rel}:${i + 1}: ${h.match} (${h.what})`);
    });
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
