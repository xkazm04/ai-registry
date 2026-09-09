---
name: straighten
description: "Drain the fleet's version debt against the registry in one sitting. Run from the registry checkout when a bundle landing, a context-map rebuild or a project rename has left registry maps behind: rebuild every project's .ai/registry-map.json that is checked out on this machine, print one debt table across the fleet (stale verdicts ranked by contexts x revisionsBehind, plus orphaned and arrived contexts), then walk it in order running /conform --stale per project until the run budget is spent, committing each map with a pathspec commit in its own project. Proposes only - no merges, no pushes. Use after `node scripts/build-index.mjs` moved subject digests, after /project-populate rebuilt a context map, or whenever `build-registry-map.mjs --churn` reports orphans. Invoke with /straighten [--project <slug>] [--budget <n>] [--dry-run]."
category: ai-native
memory: project
version: 1.1.0
tags: registry-map, conformance, stale, orphans, fleet, version-debt
argument-hint: "[--project <slug>] [--budget <n>] [--dry-run]"
---

# Straighten - drain version debt across the fleet

`/conform` judges one repository, a handful of pairs at a time, and writes the verdict
beside the digest it judged against. That is the right unit for a verdict and the wrong
unit for a fleet: when a subject moves in the registry, every project that judged it is
now behind, and nobody is standing in each of those repos to notice. When a project's
context map is rebuilt, contexts disappear (their verdicts become **orphans**), arrive
(`arrived: true`, unjudged) or are renamed (`source: "renamed"`, verdicts carried under
`renamedFrom`). Nothing today walks the fleet and drains that debt in order.

This skill does. It runs **from the registry checkout**, rebuilds every map it can reach,
ranks the debt across projects, and then spends a bounded budget running `/conform --stale`
where it pays back most. It writes exactly two kinds of thing: a project's
`.ai/registry-map.json`, and the pathspec commit that records it.

**Propose, never adopt.** A run may rebuild, judge and commit inside each project. It never
pushes, never merges, and never opens a branch unless that project's own law says a commit
on the current branch is forbidden - and then it says so in the report and stops at the
branch. Merging is the project owner's decision (`knowledge-registry/propose-then-adopt`).

## Project overlay

This skill reads no config of its own. Everything it needs is already on disk:

| Input | Where | If missing |
| --- | --- | --- |
| the fleet | `<registry>/projects.json` (`projects.<slug>.checkouts.<machine>`) plus the gitignored `<registry>/.machine.local.json` (`machine`, and `root` when `projects.json` declares none for it) | stop: `build-registry-map.mjs` cannot resolve a checkout either, so there is nothing to rebuild |
| a project's contexts | `<checkout>/context-map.json` | skip the project and say so - the map has no rows without it |
| a project's law | its `CLAUDE.md` / `AGENTS.md` (branch rules, commit format) | commit on the current branch with the message below |
| the conform method | `skills/conform/SKILL.md` - this skill calls it, it does not re-implement it | stop: the drain phase has no procedure to run |

A repo-specific note for the next run (a project whose maps must never be committed on
`main`, say) goes to `.claude/straighten/config.md` in **that project** under
`## Skill improvement log` - never into this file.

## Flags

```
/straighten                        # every project on this machine, budget 3
/straighten --project <slug>       # one project: rebuild, table, drain
/straighten --budget <n>           # projects to drain this run (default 3)
/straighten --dry-run              # rebuild to scratch files + table only; writes nothing to any project
```

## Procedure

### Phase 0 - resolve the fleet

1. Resolve the registry root: `$AI_REGISTRY_DIR`, else the checkout this skill is linked
   from. Every script below is `node <registry>/scripts/...`.
2. Read `projects.json` and `.machine.local.json`. This machine's key is the local file's
   `machine`; a project is **on this machine** when `checkouts[<machine>]` (or a local
   `overrides[<slug>]`) names a directory that exists.
3. Keep only projects that are on this machine **and** carry a `context-map.json`. Print
   the roster before touching anything, one line per project, and for every project left
   out say which of the two conditions failed - "not checked out on <machine>" or "no
   context-map.json (run /project-populate contexts first)". `--project <slug>` narrows
   the roster to one and still prints why the others were left out.
4. `git -C <checkout> status --porcelain -- .ai/registry-map.json` for each kept project.
   A project whose map is already dirty is listed as **dirty** and is rebuilt but never
   committed by this run: someone is mid-edit there, and committing around them is how
   their work ends up in a commit that does not mention it.

### Phase 1 - rebuild every map

For each project in the roster:

```sh
node <registry>/scripts/build-registry-map.mjs --project <slug>
node <registry>/scripts/build-registry-map.mjs --project <slug> --churn
```

The first writes `<checkout>/.ai/registry-map.json` in place - that is the intended effect
of this phase, not a side effect. The generator carries every verdict and every
`source: "conform"` pair forward, so a rebuild loses nothing a person wrote. The second
prints only the **churn report**: `stats.orphanedVerdicts`, `stats.arrivedContexts`,
`stats.renamedContexts`, `stats.staleVerdicts`. Keep it per project; Phase 2 is built from
it.

Under `--dry-run` both commands take `--out <scratch>/<slug>.registry-map.json` and the
project tree is not written.

Then, unless `--dry-run` or the project was **dirty** in Phase 0, commit the rebuilt map
with a pathspec commit and nothing else:

```sh
git -C <checkout> commit -m "chore(registry-map): rebuild after <reason>" -- .ai/registry-map.json
```

`<reason>` is what moved: `subject digests` (a bundle landing), `context-map rebuild`, or
`fleet straighten`. Never `git add -A`, never stage a second path, never commit when the
only change is `generatedAt`. A project whose rebuilt map is byte-identical to the
committed one is reported as **current** and skipped.

### Phase 2 - the debt table

From every rebuilt map, take each pair marked `stale: true` and every entry under the
top-level `orphans[]`, and print one table across the fleet:

```
project | subject | contexts | revisionsBehind | days since changedAt | stale verdicts | orphaned
```

- `contexts` - how many contexts in that project pair with the subject.
- `revisionsBehind` - the pair's `revision - evaluatedRevision`, as the generator computes
  it. A verdict written before subjects carried a `revision` has no `evaluatedRevision`;
  print it as `unknown (pre-revision verdict)`, never as `0`.
- `days since changedAt` - today minus the subject's `changedAt` (from the pair, mirrored
  from the bundle index).
- `stale verdicts` - the count of that project's pairs on that subject with `stale: true`.
- `orphaned` - the number of the subject's verdicts that now sit under `orphans[]` because
  their context left the context map.

Sort by `contexts x max(revisionsBehind, 1)` descending. A row whose `revisionsBehind` is
unknown ranks **after** every known row with the same `contexts` - a known debt is a
measured one, and the measured row pays back first. Then list every orphan on its own line
(`project | orphan key | name | group | paths | verdicts carried`) and every `arrived: true`
context (`project | context | subjects`) - arrivals are unjudged, not stale, and they go to
`/conform` next in its own pick order.

Under `--dry-run` this table is the whole output; stop here.

### Phase 3 - drain, in table order

Walk the table from the top. For each **distinct project** in order, until `--budget`
projects (default 3) have been drained:

1. Change into that checkout and run **the conform skill's own procedure** as
   `/conform --stale`, with conform's own per-run budget of 3-6 pairs. Do not widen it: a
   drain that skims forty pairs produces forty guesses, and the table will still be here
   next run. Conform's pick order already puts `--stale` first and `arrived: true` pairs
   next, so a project with no stale pairs but fresh arrivals still gets its budget spent.
2. Orphans are conform's to decide, per its Orphans step: offer each one as **adopt into
   `<context>`** (the pair moves under that context's `subjects[]` with
   `source: "conform"` and `adoptedFrom`, and is re-judged if stale) or **leave it**. A run
   never hand-deletes an orphan; an orphan nobody adopts stays under `orphans[]` for the
   next run, retained by the generator.
3. Every verdict conform writes carries `evaluatedAgainst` **and** `evaluatedRevision`
   copied from the pair - the second is what makes `revisionsBehind` computable next time.
   A verdict without it will reappear in this table as `unknown`.
4. Commit the map with the same pathspec commit as Phase 1, message
   `chore(registry-map): straighten <n> stale verdict(s), <m> orphan(s) adopted`. Skip the
   commit for a project that was **dirty** in Phase 0, and say so.

A project whose law forbids a commit on the current branch gets a branch named
`chore/registry-map-straighten` and the commit lands there; the report names the branch
and states plainly that nothing was merged or pushed.

### Phase 4 - report

Print the debt table again as **after**, beside the **before** from Phase 2, then:

- the commits made, one line each: `<slug> <sha> <message>`;
- projects rebuilt but not committed, with the reason (dirty, current, dry-run);
- projects skipped in Phase 0, with the reason;
- orphans adopted, orphans left, arrivals judged;
- what remains: the rows the budget did not reach, so the next run has its starting point.

Close with what the registry owes, exactly as conform's step 6 does: coverage questions
and upward lessons go to the registry, not into any project.

## Anti-patterns

- **Draining with a widened conform budget.** The table is for ordering, not for
  finishing. Ten honest runs beat one that guesses.
- **Committing a map beside other changes.** The pathspec commit is the whole safety
  argument for writing into somebody else's checkout; `git add -A` there is a takeover.
- **Hand-deleting an orphan to make the table shorter.** The generator retains orphans on
  purpose; a verdict somebody paid for is dropped by a decision, not by tidying.
- **Treating `unknown (pre-revision verdict)` as zero debt.** It is unmeasured, which is
  a different thing; that is why it ranks after the measured rows, not below the table.
- **Pushing or merging.** This skill ends at the commit. The project owner adopts.

---

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"straighten@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/straighten/config.md` for Codex or `.claude/straighten/config.md` for Claude.
If the harness is unknown, propose the note in the response instead of guessing a path.
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
