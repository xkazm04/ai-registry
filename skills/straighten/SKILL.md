---
name: straighten
description: "Drain the fleet's version debt against the registry in one sitting. Run from the registry checkout when a bundle landing, a context-map rebuild, a rename or an uncommitted converge rebuild has left registry maps behind: classify every checked-out project's .ai/registry-map.json (modified but equal to a rebuild from HEAD: generator-dirty, committed; verdicts differ: somebody's work, never touched), rebuild through converge's builder, print one debt table across the fleet (stale verdicts ranked by contexts x revisionsBehind, plus orphaned and arrived contexts), then drain it in order with /conform --stale - one judge per project, or with --wave <n> n read-only judges whose run files merge-conform-runs folds into the map once - committing each map with a pathspec commit in its own project and refreshing the fleet-coverage report. Proposes only - no merges, no pushes. Use after `node scripts/build-index.mjs` moved subject digests, after /project-populate rebuilt a context map, after converge left maps modified, or whenever `build-registry-map.mjs --churn` reports orphans. Invoke with /straighten [--project <slug>] [--budget <n>] [--wave <n>] [--dry-run]."
category: ai-native
memory: project
version: 1.3.2
tags: registry-map, conformance, stale, orphans, fleet, version-debt
argument-hint: "[--project <slug>] [--budget <n>] [--wave <n>] [--dry-run]"
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
where it pays back most. Inside a project it writes a project's `.ai/registry-map.json`
and the pathspec commit that records it - plus, under `--wave`, the files the parallel merge
owns (below). In the registry it refreshes the generated `librarian/fleet-coverage.md`.

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
| the rebuild and report | `scripts/converge.mjs` (`--only maps`, `--only report`) and the builder it runs, `scripts/build-registry-map.mjs` | stop: there is no second rebuild path to fall back on |
| the wave merge | `scripts/merge-conform-runs.mjs` (only under `--wave`) | run without `--wave` and say why |

A repo-specific note for the next run (a project whose maps must never be committed on
`main`, say) goes to `.claude/straighten/config.md` in **that project** under
`## Skill improvement log` - never into this file.

## Flags

```
/straighten                        # every project on this machine, budget 3
/straighten --project <slug>       # one project: classify, rebuild, table, drain
/straighten --budget <n>           # projects to drain this run (default 3)
/straighten --wave <n>             # drain each project with n read-only judges + one merge (n <= 8)
/straighten --dry-run              # classify + rebuild to scratch + table only; writes nothing to any project
```

`--wave` changes how a project is drained, not how many projects are: `--budget` still
counts projects.

## Procedure

`<scratch>` below is a run-scoped directory outside every checkout (the session's scratchpad,
`straighten-<run-id>/`), never a shared `/tmp` path another session can overwrite.

### Phase 0 - resolve the fleet and classify every map

1. Resolve the registry root: `$AI_REGISTRY_DIR`, else the checkout this skill is linked
   from. Every script below is `node <registry>/scripts/...`.
2. Read `projects.json` and `.machine.local.json`. This machine's key is the local file's
   `machine`; a project is **on this machine** when `checkouts[<machine>]` (or a local
   `overrides[<slug>]`) names a directory that exists.
3. Keep only projects that are on this machine **and** carry a `context-map.json`. Print
   the roster before touching anything, one line per project, and for every project left
   out say why - "not checked out on <machine>", "no context-map.json (run
   /project-populate contexts first)", or "not selected (--project)". `--project <slug>`
   narrows the roster to one and still prints a reason for every other project.
4. Classify each kept project's map. A modified map is **not** evidence that someone is
   mid-edit: a fleet rebuild (`converge.mjs`) writes every map and commits none, so most of
   the fleet can read modified at once with nobody working. The test is a rebuild from the
   project's HEAD inputs into scratch, compared with the working copy:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/map-state.mjs classify --checkout <checkout> --slug <slug> --scratch <scratch>
   ```

   It seeds `<scratch>/<slug>.head-rebuild.json` with `HEAD:.ai/registry-map.json` and runs
   `build-registry-map.mjs --project <slug> --out` on it, so the verdicts carried are exactly
   the committed ones and the project tree is not written. It compares as JSON (CRLF, BOM and
   key order are not differences) ignoring the builder's volatile stamps `generatedAt` and
   `projectSha`, and prints one class:

   | class | means | this run |
   | --- | --- | --- |
   | `clean` | matches HEAD | rebuild, commit if the rebuild changed it |
   | `current` | differs from HEAD only in `generatedAt` / `projectSha` | rebuild; Phase 1 restores it if still only stamps |
   | `generator-dirty` | equal to the rebuild from HEAD, or equal on every judgement field (`state`, `evidence`, `evaluatedAt`, `evaluatedAgainst`, `evaluatedRevision`, `adoptedFrom`, `source: "conform"`, orphans included) while only generator-owned fields differ - the registry moved since the uncommitted rebuild | rebuild and commit |
   | `dirty` | a judgement field differs, the map is staged, `context-map.json` has uncommitted changes, or no rebuild could be made to prove otherwise | **never touched**: not rebuilt in place, not drained, not committed; its debt table row comes from the scratch rebuild |

   The classifier also prints the map's `git ls-files --eol` row and a `hazard` when a commit
   would rewrite line endings (an index holding CRLF, or a CRLF working copy with no `text`
   attribute and no `core.autocrlf`). A project with a hazard is rebuilt but not committed,
   and the report says why. A `dirty` row lists the differing pairs (`diffs`); print them, so
   the owner sees what this run stepped around. A false `dirty` is the safe error; a false
   `generator-dirty` would commit somebody's work under a rebuild message, so the classifier
   says `dirty` whenever it cannot prove otherwise.

### Phase 1 - rebuild every map

One builder, one path. `converge.mjs`'s maps phase is `build-registry-map.mjs` with no
arguments, every project at once - so:

- **Fleet run, no `dirty` project in the roster:**
  `node <registry>/scripts/converge.mjs --only maps`.
- **`--project <slug>`, or any roster project `dirty`:** the same builder scoped, once per
  non-dirty project: `node <registry>/scripts/build-registry-map.mjs --project <slug>`.
  converge has no project filter, and running it would rewrite every other project's map,
  the dirty ones included.
- **`dirty` projects:** `build-registry-map.mjs --project <slug> --out <scratch>/<slug>.registry-map.json`
  only, for the table.
- **`--dry-run`:** every project that way, to scratch; nothing in any project is written.

Then, per project, the churn report: `build-registry-map.mjs --project <slug> --churn` (add
`--out <file>` for a scratch build). It prints `stats.orphanedVerdicts`,
`stats.arrivedContexts`, `stats.renamedContexts`, `stats.staleVerdicts`; keep it per project.
Phase 2 is built from it. The generator carries every verdict and every `source: "conform"`
pair forward, so an in-place rebuild loses nothing a person wrote.

Then, unless `--dry-run`, run `map-state.mjs classify` again on every project rebuilt in place
and act on the new class:

- `current` - the rebuild changed only the stamps: `git -C <checkout> restore -- .ai/registry-map.json`
  and report it as **current**. Never commit a stamp.
- `generator-dirty` or a changed `clean` - check line endings, then commit the map alone:

```sh
git -C <checkout> diff --cached --name-only
git -C <checkout> diff --numstat -- .ai/registry-map.json
git -C <checkout> diff --numstat --ignore-cr-at-eol -- .ai/registry-map.json
git -C <checkout> commit -m "chore(registry-map): rebuild after <reason>" -- .ai/registry-map.json
```

The first line shows what a sibling has staged; the pathspec commit leaves it staged. The two
numstat lines must agree - when they differ the commit would rewrite every line ending, so
skip the commit and report the hazard. `<reason>` is what moved, the first that applies:
`fleet rebuild` (the map was `generator-dirty` - a converge run left it uncommitted, whatever
else moved since), `subject digests` (a bundle landing), `context-map rebuild`, or
`fleet straighten`. Never `git add -A`, never stage a second path.

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
`/conform` next in its own pick order. Mark `dirty` projects' rows `(dirty - not drained)`.

Under `--dry-run` this table is the whole output; stop here.

### Phase 3 - drain, in table order

Walk the table from the top. For each **distinct project** in order, skipping `dirty`
projects, until `--budget` projects (default 3) have been drained:

**Without `--wave`** - one judge:

1. Change into that checkout and run **the conform skill's own procedure** as
   `/conform --stale`, with conform's own per-run budget of 3-6 pairs. Do not widen it.
   Conform's pick order already puts `--stale` first and `arrived: true` pairs next, so a
   project with no stale pairs but fresh arrivals still gets its budget spent.
2. Orphans are conform's to decide, per its Orphans step: offer each one as **adopt into
   `<context>`** (the pair moves under that context's `subjects[]` with
   `source: "conform"` and `adoptedFrom`, and is re-judged if stale) or **leave it**. A run
   never hand-deletes an orphan; an orphan nobody adopts stays under `orphans[]` for the
   next run, retained by the generator. **Without an operator, leave.**
3. Every verdict conform writes carries `evaluatedAgainst` **and** `evaluatedRevision`
   copied from the subject's index entry - the second is what makes `revisionsBehind`
   computable next time. A verdict without it will reappear in this table as `unknown`.
4. Refresh the header and count: conform writes rows, never `stats`. Run
   `build-registry-map.mjs --project <slug>` (it carries every verdict field conform wrote,
   `evaluatedRevision` included, and recomputes `stale` against the current digests), then
   count `stale: true` rows yourself and check `stats.staleVerdicts` agrees.
5. Commit the map with the same pathspec commit and line-ending check as Phase 1, message
   `chore(registry-map): straighten <n> stale verdict(s), <m> orphan(s) adopted`.

**With `--wave <n>`** - `n` read-only judges, one writer, one commit. Load
[references/wave.md](references/wave.md) and follow it; its sections carry these numbers:

1. **Preconditions** - the map and `.ai/conform-detail.json` clean (committed); never break a
   live `.ai/conform-runs/.merge.lock` by hand.
2. **Work list** - at most `6 x n` pairs in debt-table order, the tail dropped; dealt
   round-robin by subject, each worker within conform's 3-6.
3. **Workers** - spawned in one message; each runs conform's sections 2-3 on its slice and
   writes exactly one `.ai/conform-runs/<worker-id>.json` (`conform-run/1`). No worker touches
   the map, commits, or writes anything else.
4. **Collect** - every file parses and covers its slice; spot-check anchors. An interrupted
   wave resumes from disk here.
5. **Merge** - `merge-conform-runs.mjs --dry --only <files>`, then the real merge with the
   same list and `--wait-lock-ms 60000`.
6. **Verify** - `map-state.mjs verify-merge` exits 0: every merged row carries the subject's
   own digest and `evaluatedRevision`, `stale` cleared (conform 1.8.2). Exit 1 is a stop;
   exit 2 with `missing` names a run file it was told to read and could not - also a stop.
7. **Orphans** - this session alone, after the merge. Without an operator, leave.
8. **Rebuild and count** - `build-registry-map.mjs --project <slug>` so the header `stats`
   match the merged rows; count `stale: true` rows yourself.
9. **Commit** - one pathspec commit: the map, plus `.ai/conform-detail.json` and this wave's
   archived run files only when the project already tracks them. `.ai/consults.jsonl` is
   appended by the merge and never committed by this run.

A project whose law forbids a commit on the current branch gets a branch named
`chore/registry-map-straighten` and the commit lands there; the report names the branch
and states plainly that nothing was merged or pushed.

### Phase 4 - report

Unless `--dry-run`, refresh the fleet view first:

```sh
node <registry>/scripts/converge.mjs --only report
```

It rewrites the generated `librarian/fleet-coverage.md` in the registry from every project's
map as it now stands, and prints the per-project table. This run does not commit it; name the
file in the report so the registry's own flow lands it. It reads each map's header `stats`,
which is why every drained map was rebuilt in Phase 3 before its commit; a map merged but not
rebuilt reports its pre-merge stale count. Then build the debt table again as **after** - from
the maps' rows (`stale: true` counted per subject), not from their headers - and print it
beside the **before** from Phase 2, and:

- the commits made, one line each: `<slug> <sha> <message>` and the paths it named;
- every project's Phase 0 class, and the projects rebuilt but not committed with the reason
  (dirty - with its `diffs`, current, line-ending hazard, dry-run);
- projects skipped in Phase 0, with the reason;
- under `--wave`: per project, workers spawned, the merge funnel (merged / unchanged / older /
  skipped / declined / conflicts), the `verify-merge` result, and the anchor spot-checks;
- orphans adopted, orphans left, arrivals judged;
- what remains: the rows the budget did not reach, so the next run has its starting point.

Close with what the registry owes, exactly as conform's step 6 does: coverage questions
and upward lessons go to the registry, not into any project.

The run log of `## Skill Reflection` goes to the checkout of the project whose map this run
changed - one line in each, when it changed several - never to the registry checkout the run
started from. A `--project` run always logs in that project; only a fleet run that changed no
map logs in the registry checkout.

## Anti-patterns

- **More pairs per judge.** A judge that skims forty pairs produces forty guesses; conform's
  3-6 holds under `--wave` too. More judges is fine - that is what `--wave` is - as long as
  each keeps the budget and only the merge writes the map.
- **Workers writing the map.** Two writers on one JSON file is a lost verdict; the run file
  plus one `merge-conform-runs.mjs` is the whole safety argument for a wave in a shared
  checkout. A merge without `--only` takes other sessions' pending files.
- **Reading "modified" as "mid-edit", or "rebuilt" as "safe".** The first leaves the fleet's
  maps uncommitted forever; the second commits somebody's verdicts under a rebuild message.
  `map-state.mjs classify` decides, and it says `dirty` when it cannot prove otherwise.
- **A second rebuild path.** converge's maps phase and `build-registry-map.mjs --project` are
  the same builder; a hand-rolled loop drifts from it.
- **Committing a map beside other changes.** The pathspec commit is the whole safety
  argument for writing into somebody else's checkout; `git add -A` there is a takeover.
- **Hand-deleting an orphan to make the table shorter.** The generator retains orphans on
  purpose; a verdict somebody paid for is dropped by a decision, not by tidying.
- **Treating `unknown (pre-revision verdict)` as zero debt.** It is unmeasured, which is
  a different thing; that is why it ranks after the measured rows, not below the table.
- **Pushing or merging.** This skill ends at the commit. The project owner adopts.

---

<!-- clause: knowledge-sync v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, to `.ai/consults.jsonl` in the task's MAIN checkout (never a disposable worktree), written before the run's first commit - pre-commit consult checks read it: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"straighten@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v6 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the task's MAIN checkout: local,
gitignored run output inside the task's own repository, never a write into the registry.
A run that worked in a linked worktree logs in the main checkout that worktree belongs to
(`git rev-parse --git-common-dir`, minus `/.git`) - a disposable worktree takes the line
with it when it is removed. `log-run.mjs` resolves this on its own.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill straighten --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"straighten","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null` (with `log-run.mjs`, omit `--tokens-est`); exact figures are measured
  later from transcripts - never guess one.
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
