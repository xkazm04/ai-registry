---
name: agent-guidance-bootstrap
description: "Create or refresh a repo's AGENTS.md so an agent joining the codebase gets commands, architecture and constraints without guessing. Use on a repo with no agent guidance, or when the existing file has gone stale."
category: ai-native
memory: project
version: 0.9.0
tags: agents-md, onboarding, context, conventions
argument-hint: "[project-root]"
---

# Agent guidance bootstrap

An agent with no repo context re-derives the same facts every session, gets half of them wrong,
and writes code that does not match the house style. An `AGENTS.md` at the repo root is the
cheapest available fix: one file, read first, that answers the questions every session starts
with.

## Before writing anything: gather evidence

Never write guidance from assumption. Collect, in this order:

0. **The guidance that is already here.** `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`,
   `.cursorrules`, `CONTRIBUTING.md` — read each in full before writing a line. Whichever
   already carries real content is the canonical file (see the content rules); this run either
   refreshes it or points at it.
1. **Commands that actually exist.** `package.json` scripts, `Makefile` targets, `justfile`,
   `pyproject.toml`, `Cargo.toml`, the CI workflow. If CI runs it, it is real.
2. **The shape of the tree.** Top-level directories and what each owns. Two levels deep is
   enough; deeper is churn.
3. **Entry points.** Where execution starts: the server bootstrap, the CLI main, the route root.
4. **Conventions the code already keeps.** Read 5 to 10 recent commits and 3 representative
   source files. Whatever is consistent (naming, error handling, test layout, commit format) is
   the convention, whether or not anyone wrote it down.
5. **The things that would be expensive to get wrong.** Generated files, vendored code, the
   public API surface, anything security-sensitive.

If you cannot find a fact, leave a `TODO:` marker. A confident wrong command is worse than a
visible gap, because the next agent will run it.

## The file

Keep it short enough to be read every session. Aim for under 200 lines.

```
# <repo name>

<One paragraph: what this is and who uses it.>

## Commands
- Install: <cmd>
- Test: <cmd>          # the one command that proves a change
- Lint: <cmd>
- Typecheck: <cmd>
- Build: <cmd>
- Run locally: <cmd>

## Architecture
- Entry points: <path> (<what happens there>)
- <dir>/ - <what it owns>
- Data flow: <request -> ... -> response, in one line>

## Verify after every change
1. <test cmd>
2. <typecheck cmd>
3. <build cmd, if the repo has one>
Do not report a change as done before these pass.

## Constraints (never break these)
- <generated or vendored paths that must not be hand-edited>
- <public API or schema that needs a migration, not an edit>
- <security rules: where secrets come from, what must never be committed>

## Conventions
- <commit format>
- <test location and naming>
- <error handling and logging pattern>

## A good change looks like
- <link to, or three lines describing, one exemplary recent commit or PR>
```

## Rules for the content

- **Capabilities, not tools.** Write `Test: npm test`, not "we use vitest". The command survives
  a migration; the tool name does not.
- **Every claim checkable.** If a line cannot be verified by running something or opening a named
  file, it does not belong.
- **Rules with reasons.** "Do not edit `src/generated/`, it is rewritten by the codegen step" is
  followed; "follow best practices" is not.
- **One file, one root — and the incumbent keeps the crown.** If the repo already carries a
  guidance file with real content, **that file stays canonical** and the file you are adding
  becomes the one-line pointer to it. Never demote a populated `CLAUDE.md` to a pointer in
  order to promote a fresh `AGENTS.md`; the new file is the one with nothing to lose. Measured:
  five of five runs on a repo with a 77-line canonical `CLAUDE.md` chose the lossy direction,
  and each dropped rules nobody noticed were gone. Only when both files carry content does
  merging arise, and then the older, more-referenced one is canonical.
- **The pointer must be in the form the reader resolves.** A pointer written for a human -
  "see AGENTS.md" in prose, or the bare filename - delivers nothing to an agent that does not
  decide to open it. Three topologies are valid, and each has one check:
  - `AGENTS.md` canonical, no `CLAUDE.md` anywhere on the path: harnesses that read
    `AGENTS.md` natively serve it directly. Check that no `CLAUDE.md`, `.claude/CLAUDE.md` or
    `CLAUDE.local.md` exists at or above the root, because any one of them suppresses it.
  - `AGENTS.md` canonical and a `CLAUDE.md` also needed: the `CLAUDE.md` carries the line
    `@AGENTS.md` (an import, not a sentence), with anything Claude-specific below it.
  - `CLAUDE.md` canonical: `AGENTS.md` is a pointer for other tools and restates nothing.
  Two populated files with neither importing the other is a fork, and in the common harness
  the second file never loads at all. Adding an `AGENTS.md` beside a populated `CLAUDE.md` does
  not "enable native support"; fold its content into the canonical file instead.
- **Demotion is no-loss.** Before a file becomes a pointer, every rule in it appears in the
  canonical file — same meaning, same specificity. A rule you deliberately leave out is named
  in the report as dropped, with the reason. Check by listing the demoted file's rules and
  ticking each one off against the canonical file; "the content was similar" is not the check.
- **Generated blocks are neither edited nor deleted.** A block between stamped markers
  (`<!-- personas:context-map:start -->` … `:end`, or any tool's equivalent) belongs to the
  command that writes it. Leave it byte-for-byte, and carry it with its file. If its content is
  stale, say so **outside** the block — one line above or below it — and name the command that
  regenerates it. Both failures are measured: runs that deleted such a block, and runs that
  "fixed" a genuinely stale one in place. Neither is yours to do.

## Landing it

The guidance file is the deliverable, and an uncommitted deliverable is a draft. Commit it as
one `docs(agents): <file> for <repo>` commit, staging the guidance files by explicit path, when
the tree is otherwise clean. If other work is uncommitted, stage only your paths and say so.
Commit on the current branch; do not push. If the task forbids committing, say plainly that the
file is written but uncommitted.

## Refresh mode

Stale guidance is worse than none, because it is trusted. Re-run this skill when the build
commands change, when a top-level directory is added or removed, and when a constraint is added.
A refresh is not "read the file and improve it" — it is a diff against re-derived evidence:

1. **Re-derive the evidence** exactly as above (commands, tree shape, entry points, conventions,
   expensive-to-get-wrong). Do this before re-reading the file, or the file will tell you what
   to look for.
2. **Diff line by line.** Walk the existing file one line at a time and mark each:
   **confirmed** (the evidence says the same thing), **stale** (the evidence contradicts it), or
   **unverifiable** (nothing in the repo can settle it).
3. **Run every command** in the Commands section. One that fails is stale, not an aside; any
   failure takes the whole file's credibility with it.
4. **Fix the stale lines in place** and leave everything else alone — a refresh is not a rewrite,
   and reformatting a file to look like the template is churn. Generated blocks are exempt from
   every step (see the content rules above).
5. **Report the counts**: N confirmed, N fixed, N unverifiable (each named).

Two results are valid and neither is a proposal: **no drift** — nothing changed, nothing
committed, and the report says what was checked — or **drift found and fixed**, committed.
Drift found and only *proposed* is a failed refresh: you did the expensive part and stopped
before the cheap one.

## Related

- Practice `agent-guidance` (D1) - the starter file this skill fills in.
- `ci-gate-check` - the Commands section, executed.

---

<!-- clause: skill-reflection v5 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the checkout you worked in: local,
gitignored run output inside the task's own repository, never a write into the registry.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill agent-guidance-bootstrap --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"agent-guidance-bootstrap","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null`; exact figures are measured later from transcripts - never guess one.
- `result` is one line (max 240 chars). `comment` (max 2000) is the self-reflection a
  reviewer reads: what worked, what the method made harder, where its instructions were
  wrong, missing or ignored. No filesystem paths or email addresses.
- Never read run logs during a run. They are evidence ABOUT this skill for its reviewer;
  an executor that reads its own diagnosis contaminates the next measurement.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
