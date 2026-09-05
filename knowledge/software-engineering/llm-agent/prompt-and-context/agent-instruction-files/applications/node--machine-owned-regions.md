---
layer: application
type: application
subject: agent-instruction-files
technique: machine-owned-regions
stack: node
status: forged
verified_on: 2026-09-05
verified_against: node@24
---

# A framework that stamps its own fence into the instruction file, read across three fleet trees (Node)

Read 2026-09-05 in `kp` (commit `c571bfde`, 2026-09-05; `engines` pins
`node >=24 <25`, CI `node-version: 24`), with `politicas` (`b228b1b`) and
`gravitone-gcloud` (`16907fa`) as the two other carriers. The generator is
not the team's: it ships inside the Next.js dependency and writes into the
repository's own `AGENTS.md`.

## What the generator does

`node_modules/next/dist/esm/server/lib/generate-agent-files.js` exports
`hasCurrentAgentRules` and `writeAgentFiles`; `server/lib/app-info-log.js`
calls them from `ensureAgentRulesForDev` on `next dev` start, gated on
`getAgentName() !== null` (the dev server detects that an AI coding agent
launched it) and on `config.agentRules !== false` (opt-out is declarative in
`next.config`). The block is fenced by `<!-- BEGIN:nextjs-agent-rules -->` /
`<!-- END:nextjs-agent-rules -->`; a legacy marker pair from an earlier codemod
is stripped on upsert so a tree never holds two vintages. Where neither file
exists it creates `AGENTS.md` with the block and `CLAUDE.md` containing only
`@AGENTS.md` — the import bridge this subject's topology technique prescribes,
written by a framework with no rule telling it to.

Against the fence contract:

1. **Fenced by markers** — yes, and the upsert replaces only the span between
   them (`upsertAgentRulesBlock`), leaving hand territory alone.
2. **Names its generator** — the 16.3.3 wording does: "This block is written
   and re-added by `next dev` — verify at
   `node_modules/next/dist/server/lib/generate-agent-files.js`." It carries no
   run date; the stamp that dates it is the installed dependency version.
3. **Edits go through regeneration** — stated in the block's visible prose,
   not in the marker: "Removing it from a diff only re-creates the uncommitted
   change; committing it with your work keeps the tree clean." That placement
   matters on this host, whose loader strips block-level HTML comments before
   injection: the markers never reach the agent that was handed the file at
   session start, the sentence does.

## Two vintages in one fleet

`kp` and `gravitone-gcloud` run Next 16.3.3 and carry the nine-line block
above. `politicas` runs 16.3.1 and carries a five-line block with the same
markers and an older wording — no generator named, no regeneration notice,
and no monorepo caveat. `hasCurrentAgentRules` compares the installed block
byte-for-byte against the wording its own release carries, so on `politicas`
the next `next dev` under an agent after an upgrade will rewrite the block;
until then it is *current for its tree* and would fail the technique's rule 2
if audited without the version in hand. The block's content is a function of
the generator's version, and the freshness check for it is "does the
installed block match the installed dependency", not "how old is it".

## Where the fence sits relative to the bridge

In `gravitone-gcloud` the whole of `AGENTS.md` is the machine block (9 lines),
and `CLAUDE.md` opens with `@AGENTS.md` followed by a second, unrelated
machine region (`<!-- personas:context-map:start -->`, a different generator
with its own markers — two regions, two owners, neither writing into the
other's fence). In `kp` the block is
the first nine lines of a 141-line `AGENTS.md` whose canonical guidance lives
in `.claude/CLAUDE.md`; the root `CLAUDE.md` imports `AGENTS.md` and then
tells a reader whose tool did not expand the import to open the canonical
file. The fence is therefore always loaded on this host, through the import,
in a file the team does not treat as canonical — a generated block riding a
bridge, admitted by nobody under line-earning. Whether it earns its place is
the technique's admission question, not its fence question: the block is a
version-drift warning whose failure mode (an agent writing last year's
framework API) is real and unreachable from the tree, so it plausibly passes.

## Defects found

- **No run date, and no way to derive one** except the dependency version;
  the technique asks for "when it last ran" and the framework answers with
  "which release wrote this". Recording the version in the block would close
  it; the framework does not.
- **The opt-out is per tree and invisible in the file.** A tree with
  `agentRules: false` shows nothing where the block would be, which is the
  same artifact as a tree the generator has not visited yet.

Verified: three trees, three `AGENTS.md` heads, the generator's source at
the installed version, `hasCurrentAgentRules` and `ensureAgentRulesForDev`
read in full.
