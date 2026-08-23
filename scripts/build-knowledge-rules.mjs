#!/usr/bin/env node
/**
 * build-knowledge-rules — generate the always-on knowledge context that projects LINK.
 *
 * ## The gap this closes
 *
 * Until now the only way a bundle reached a session was for an agent to decide to invoke
 * `/consult`. That is recall, and recall is exactly what fails: a standard nobody remembers
 * to look up is a standard that does not exist at the moment a decision is made. The same
 * failure the consuming app already wrote down about its own golden paths - "none of it
 * reaches a session at the moment it matters, because a path is found by someone
 * remembering it exists".
 *
 * The harness has a mechanism built for this: `.claude/rules/`. A rule with no `paths:`
 * frontmatter is loaded into EVERY session at the same priority as `.claude/CLAUDE.md`,
 * and the rules directory supports symlinks so one file can serve every project. So the
 * registry generates the rules, each project links the ones its manifest declares, and the
 * corpus becomes present rather than fetchable - with no skill invocation, no hook, and no
 * copy to sync.
 *
 * ## What is generated
 *
 *   rules/ai-registry-access.md        the access contract - how to resolve and read a
 *                                      subject, and what to do when the repo deviates.
 *                                      Linked by every project.
 *   rules/ai-registry-<domain>.md      one per bundle: its categories and the SLUGS of the
 *                                      subjects in them. Linked by the projects whose
 *                                      manifest declares that domain.
 *
 * Slugs only, deliberately. A slug is a recognition cue - `rate-limiting`, `retry-backoff`,
 * `hitl-approval` - and recognition is what an always-on card has to buy. The `use_when`
 * triggers that make routing precise are an order of magnitude more text and already live
 * in each bundle's index.json, which is where a deeper pass reads them from.
 *
 *   node scripts/build-knowledge-rules.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sameIgnoringNewlines } from './lib/bundle-hash.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
const OUT = path.join(ROOT, 'rules');
const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(KNOWLEDGE)) {
  console.error(`FATAL: no knowledge/ lane at ${KNOWLEDGE}. Refusing to write rules that describe nothing.`);
  process.exit(2);
}

const ACCESS = `# The organization's knowledge registry

The registry is a git repository of **Reference Knowledge Bundles**: domain standards
forged from these codebases and hardened against outside research. It sits at the path in
this repo's \`.ai/manifest.yaml\` under \`registry.local\` (a sibling \`../ai-registry\` by
default); \`registry.remote\` names its origin. The bundles this project consumes are listed
in that same manifest under \`knowledge.domains\`, and each one has a companion rule file
beside this one listing its subjects.

## Four layers, and which of them binds

| Layer | What it is | How to treat it |
| --- | --- | --- |
| **Golden path** (\`<subject>.md\`) | what the subject IS and what a principal practitioner holds true | the standard; read it first |
| **Technique** (\`techniques/<slug>.md\`) | one named concern, with its procedure and decision rules | the actionable rule, stated as "when X, do Y, because Z" |
| **Application** (\`applications/<stack>--<technique>.md\`) | how one concrete stack realizes it, citing real code | teaching material and evidence - never a mandate |
| Evidence | which file proves a claim in a particular tree | not published; consumer-local by design |

The upper two layers carry no repo paths, file extensions or product names, so they apply
here unchanged. Applications name their stack in the filename.

## Resolving a subject - never construct a path

Bundles are **nested** under \`<category>/[<subcategory>/]<subject>/\` and the shape is
owned by \`taxonomy.json\`, so a path built from a slug is a path that breaks the next time
a subject moves. The address is the generated index:

\`\`\`
<registry>/knowledge/<domain>/index.json  ->  subjects["<slug>"].file
\`\`\`

That field is the golden path's real location; its techniques sit in \`techniques/\` beside
it and its applications in \`applications/\`. The same index carries every technique's
\`use_when\` triggers, which is what to grep when the right subject is not obvious from the
slug lists.

## When to open one, and what to do with it

**Before a design, architecture or product decision in a covered domain** - not after.
Open the governing subject, read the golden path, then the techniques it names.

- **The standard does not bend to the code.** Where this repo falls short, that is a
  **deviation**: say so out loud, record it where this repo tracks gaps, and let the
  standard stand. Lowering the standard to match the code is how a corpus rots.
- **Numbers carry their measurement.** A figure in an application comes with its n and its
  date; it is evidence about one tree, not a universal constant.
- **A technique that fits badly is a finding.** If the rule is wrong here for a reason the
  corpus does not know, that reason is worth contributing back - it is how the bundle got
  good in the first place.

## The map: which subject governs which part of THIS repo

\`.ai/registry-map.json\` is the generated join between this repository's contexts and the
subjects above. Consult it **before searching the corpus by hand** - it turns "what does the
standard say about this file?" into a lookup:

- Each row is a context: its \`paths\`, and the subjects that govern it with a \`confidence\`
  and the tokens that earned the match. Find the row whose \`paths\` cover the file you are
  about to change.
- Each pair carries a \`state\`: \`unknown\` (nobody has judged it), \`conformant\`,
  \`deviation\` (with \`evidence\` naming the anchor and the consequence), or
  \`not-applicable\`. **A \`deviation\` is a known, recorded gap** - do not rediscover it, and
  do not treat it as licence to add another.
- \`subjectIndex\` inverts it: given a subject slug, which contexts it governs.
- A row marked \`governance: "weak"\` means the declared domains barely cover that context.
  Treat guidance there with suspicion and say so; it is a coverage question for the
  registry, not a standard to force onto the code.

\`/conform\` is what fills the states in, a few pairs at a time, and writes the verdicts
back. \`/consult <topic>\` runs the read loop deliberately and logs it so the registry can
see which knowledge is actually reached for. This rule exists so that the corpus is in
front of you even when nobody invokes either.
`;

const bundles = fs.readdirSync(KNOWLEDGE, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(KNOWLEDGE, e.name, 'index.json')))
  .map((e) => e.name).sort();

const files = new Map([['ai-registry-access.md', ACCESS]]);

for (const b of bundles) {
  const idx = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE, b, 'index.json'), 'utf8'));
  const title = (() => {
    const im = path.join(KNOWLEDGE, b, 'index.md');
    const m = fs.existsSync(im) ? fs.readFileSync(im, 'utf8').match(/^okf_bundle_title:\s*(.+)$/m) : null;
    return m ? m[1].trim() : b;
  })();
  // Group subjects by category, preserving the index's own category order.
  const byCat = new Map((idx.meta.categories ?? []).map((c) => [c, new Map()]));
  for (const [slug, s] of Object.entries(idx.subjects)) {
    if (!byCat.has(s.category)) byCat.set(s.category, new Map());
    const sub = s.subcategory ?? '';
    const m = byCat.get(s.category);
    if (!m.has(sub)) m.set(sub, []);
    m.get(sub).push(slug);
  }
  const lines = [
    `# ${title} - the subjects this registry carries`,
    '',
    `\`${b}\` - ${idx.meta.subjects} subjects, ${idx.meta.techniques} techniques, ${idx.meta.applications} applications.`,
    'Slugs only; resolve one through `index.json` as the access rule beside this file describes.',
    '',
  ];
  for (const [cat, subs] of byCat) {
    const flat = [...subs.entries()].sort((a, b2) => a[0].localeCompare(b2[0]));
    const total = flat.reduce((n, [, v]) => n + v.length, 0);
    if (total === 0) continue;
    lines.push(`### ${cat}`);
    for (const [sub, slugs] of flat) {
      slugs.sort();
      lines.push(sub ? `- **${sub}** - ${slugs.join(', ')}` : `- ${slugs.join(', ')}`);
    }
    lines.push('');
  }
  files.set(`ai-registry-${b}.md`, `${lines.join('\n').replace(/\n+$/, '')}\n`);
}

let stale = 0;
const report = [];
if (!checkOnly) fs.mkdirSync(OUT, { recursive: true });
for (const [name, body] of files) {
  const p = path.join(OUT, name);
  const cur = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  const fresh = cur !== null && sameIgnoringNewlines(cur, body);
  if (!fresh) { stale += 1; if (!checkOnly) fs.writeFileSync(p, body); }
  report.push({ name, lines: body.split('\n').length, chars: body.length, fresh });
}
// A rule for a bundle that no longer exists must not keep loading into every session.
const orphans = fs.existsSync(OUT)
  ? fs.readdirSync(OUT).filter((f) => f.startsWith('ai-registry-') && !files.has(f))
  : [];
for (const o of orphans) { stale += 1; if (!checkOnly) fs.rmSync(path.join(OUT, o)); }

console.log(`knowledge rules - ${files.size} file(s) for ${bundles.length} bundle(s)\n`);
console.log('  file                                  lines   chars   state');
for (const r of report) {
  console.log(`  ${r.name.padEnd(37)} ${String(r.lines).padEnd(7)} ${String(r.chars).padEnd(7)} ${r.fresh ? 'current' : checkOnly ? 'STALE' : 'written'}`);
}
for (const o of orphans) console.log(`  ${o.padEnd(37)} ${' '.repeat(15)}${checkOnly ? 'ORPHAN' : 'removed'}`);
const totalChars = report.reduce((n, r) => n + r.chars, 0);
console.log(`\n  ~${Math.round(totalChars / 4 / 100) / 10}k tokens if every rule loaded at once; a project links only its declared domains.`);

if (checkOnly && stale) {
  console.error('\nrules are STALE - run `node scripts/build-knowledge-rules.mjs` and commit the result.');
  process.exit(1);
}
if (checkOnly) console.log('  rules are current.');
