#!/usr/bin/env node
// siblings - the preflight takeover-app runs before P0: does every skill it sequences resolve in this session?
//
// WHY a script and not a reminder: a sequencer that invokes a sibling which is not installed does not fail - the
// harness answers "unknown skill", the agent improvises the step, and the judgement that skill carries is silently
// skipped (spark retro, 2026-10: a missing sibling skipped judgements before anyone noticed). So the check is
// deterministic, runs first, and stops the run with the fix when a required sibling is absent.
//
//   node siblings.mjs [--product-root <repo>] [--home <dir>]
//     Looks for <name>/SKILL.md under <repo>/.claude/skills, <repo>/.agents/skills, <home>/.claude/skills and
//     <home>/.agents/skills (project scope first; --home defaults to the user's home directory).
//     -> {resolved: {<name>: {scope, version}}, missing: [...], optional_missing: [...], notes: [...]}
//     exit 0 every required sibling resolves; 1 one is missing (the run stops); 2 could not run.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
let EXIT;
try { ({ EXIT } = await import(pathToFileURL(resolve(HERE, '../../../scripts/lib/exit-codes.mjs')).href)); } catch { EXIT = Object.freeze({ OK: 0, VIOLATIONS: 1, FATAL: 2, CONTENDED: 3 }); }

/** What each sibling is for; `required: false` has a stated fallback in SKILL.md. */
export const SIBLINGS = [
  { name: 'onboarding', phase: 'P1 boot', required: true },
  { name: 'adopt-bp', phase: 'P2 map fallback, P4 adopt', required: true },
  { name: 'lens-scan', phase: 'P4 measure, P6 rank, P8 execute', required: true },
  { name: 'perfect', phase: 'P9 UX track', required: true },
  { name: 'project-populate', phase: 'P2 map (only when Personas answers)', required: false, fallback: 'adopt-bp step 0 writes the map' },
  { name: 'passport-onboard', phase: 'P3 readiness', required: false, fallback: 'the condensed 15-dimension checklist in references/outputs.md' },
  { name: 'scan-sweep', phase: 'P4 optional second opinion', required: false, fallback: 'skipped' },
];

const versionOf = (file) => { try { return /^version:\s*["']?([^"'\s]+)/m.exec(readFileSync(file, 'utf8'))?.[1]; } catch { return undefined; } };

export function resolveSiblings({ root = process.cwd(), home = homedir(), siblings = SIBLINGS } = {}) {
  const scopes = [
    ['project', join(root, '.claude/skills')], ['project-agents', join(root, '.agents/skills')],
    ['user', join(home, '.claude/skills')], ['user-agents', join(home, '.agents/skills')],
  ];
  const resolved = {}, missing = [], optionalMissing = [], notes = [];
  for (const s of siblings) {
    const hit = scopes.find(([, dir]) => existsSync(join(dir, s.name, 'SKILL.md')));
    if (hit) {
      const file = join(hit[1], s.name, 'SKILL.md');
      resolved[s.name] = Object.fromEntries(Object.entries({ scope: hit[0], version: versionOf(file) }).filter(([, v]) => v !== undefined));
      if (s.name === 'passport-onboard' && hit[0].startsWith('user')) {
        notes.push('passport-onboard resolves only at user scope; that copy has drifted from the canonical one in the Personas repo before - compare versions or prefer the canonical copy');
      }
    } else if (s.required) missing.push({ name: s.name, phase: s.phase });
    else optionalMissing.push({ name: s.name, phase: s.phase, fallback: s.fallback });
  }
  const fix = missing.length
    ? `link the registry skills into this repo: declare ${missing.map((m) => m.name).join(', ')} under \`skills:\` in .ai/manifest.yaml and run <registry>/scripts/link-registry.mjs, then rerun /takeover-app`
    : undefined;
  return Object.fromEntries(Object.entries({ resolved, missing, optional_missing: optionalMissing, notes, fix })
    .filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length)));
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  const argv = process.argv.slice(2);
  const flag = (k) => { const i = argv.indexOf(k); return i === -1 ? undefined : argv[i + 1]; };
  const root = resolve(flag('--product-root') ?? process.cwd());
  if (!existsSync(root)) { process.stderr.write(`siblings: --product-root ${root} does not exist\n`); process.exit(EXIT.FATAL); }
  const out = resolveSiblings({ root, home: flag('--home') ?? homedir() });
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(out.missing ? EXIT.VIOLATIONS : EXIT.OK);
}
