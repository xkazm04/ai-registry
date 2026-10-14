---
name: explorer
description: "Short, interactive, joins-first probe sweep of one codebase area. Picks a (context, lens) pair that neither explorer nor scan-sweep has run yet (scripts/pick.mjs reads the context map, explorer's coverage ledger and scan-sweep's history), runs a catalog of one-command cross-layer probes before sampling any file (a gate matrix over a route family, the repo's own idiom where it was not applied, a test title contradicting its assertion, a comment citing a gate, Known gaps docs, flags with no readers, config keys no validator names), and surfaces up to 10 evidence-backed items whose premise is closed with claim-appropriate evidence before any edit. Builds the small ones (xs/s) without asking, triages only the larger ones with the user, and commits each atomically in the repo's own commit convention. Use for a daily 20-40 minute quality pass over one area; use scan-sweep for the long multi-lens loop over every context."
argument-hint: "[area] [--triage-all]"
category: workflow
memory: vault
contexts: tracked
version: 2.6.1
---
# Explorer

Sweep one area of a codebase through one lens, surface **up to 10 evidence-backed items**,
**build the small ones without asking**, put only the larger ones to the user, and execute
in-session. Explorer is the short, interactive member of the quality loops: **joins first**
(one-command probes over the seams between layers before any file is read end to end), one
area, one sitting. `/scan-sweep` is the long multi-lens loop over every context; explorer
**reads** its ledger to choose a lens neither loop has run, and never writes it. Pairs with
`/research` (external sources) and `/architect` (structural change).

Bundled material, loaded when a phase reaches for it:
`${CLAUDE_SKILL_DIR}/scripts/pick.mjs` (the picker), `references/probes.md` (probe catalog and
lens vocabulary), `references/categories.md` (per-lens hunting lists), `references/vault.md`
(every vault template), `references/personas-outbox.md` (app coverage outbox).

## Project overlay

Everything project-specific lives in ONE overlay read in Phase 0: **`.claude/explorer/config.md`
in the consuming repo** (tracked, so it travels with the clone). **The sweep runs with no overlay
at all** - every key has a default - but say so in the opening line when defaults are in force,
and never paste one repo's overlay into this file. YAML frontmatter for scalars, `##` sections
for lists and prose. Keys (default in brackets):

```yaml
---
product: "<product name>"             # sweep-note header  [the repo directory name]
stack: "<one-line stack description>" # what the scan expects to read  [detected from the manifest, else "unknown"]
vault: ["<abs obsidian root>", ...]   # candidate roots, first existing wins  [<repo>/.explorer]
vault_subdir: Explorer                # namespace inside the vault; "" = the root itself  [Explorer]
context_map: context-map.json         # the area taxonomy's machine-readable source  [context-map.json if present, else none]
coverage_context_source: ""           # which name set the memory outbox anchors to  [the context map's names]
active_runs_ledger: ""                # path of a live-sessions ledger if the repo keeps one  [none; git status only]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Context sources` | documents Phase 1 reads, in order, one line each | `context-map.json` if present, else `CLAUDE.md` (then `AGENTS.md`); a missing source is **noted, never fatal** |
| `## Area menu` | numbered options for Q1 and what each maps to | derived from the map's groups (or top-level source dirs), capped at 8 |
| `## Category menu` | extra categories beyond the built-in eight | the built-in eight only |
| `## Gates` | validation per kind of touched file | detected from `package.json` scripts and the toolchain (`cargo check`, `npx tsc --noEmit`); say what was detected |
| `## Repo law` | i18n contract, design tokens, shared components, error handling, boundary wrappers, commit convention | "read the repo's CLAUDE.md/AGENTS.md first; reuse before building" |
| `## Baseline exclusions` | known-noisy migrations that never become items | none - a lint rule with thousands of warnings is a baseline; say so |
| `## Smoke` | how to run the app and exercise a surface | state plainly that the change was NOT visually verified |

## Input

Every prompt is single-keystroke answerable: a numbered menu where a digit picks, **Enter** takes
the default, and `1. other -> ...` accepts free text. Every phase output ends with a `Next?` block
of 2-5 numbered actions. **The run does not ask permission for small work**: `xs`/`s` items are
built as found (Phase 7); the only mid-run question is about `m`/`l` items, and a run with none
asks nothing between the opening questions and the final summary.

Use the area and category already supplied; explicit instructions override the menus. When
inputs are missing, ask two questions in order. `/explorer`, "go" or "wander" with no arguments
means Enter for both.

```
Area? (Enter = pick for me)
  1. other -> type a hint (path fragment, keyword, or context id)
  2. {area 1}
  ...
  9. {area 8}
  10. pick for me   <- default

Lens? (Enter = the picked lens, or any when you named an area)
  1. other -> describe (free-form intent)
  2. picked / any   <- default
  3. quality   4. dx   5. ui   6. perf   7. bug   8. i18n   9. a11y   10. sec
```

Options 2-9 of Q1 are the overlay's `## Area menu` (or up to 8 derived ones, saying from what).
Free text goes to the Phase 2a resolver; option 10 runs Phase 2b. Ask nothing else upfront.

## Constants

- **Context sources**: the overlay's list, else what exists of `context-map.json`, `CLAUDE.md` /
  `AGENTS.md`; with none, a provisional taxonomy from top-level source dirs, said as such.
- **Vault** (`$VAULT/<vault_subdir>/`, written `Explorer/` below): `sweeps/` (one note per run),
  `state.md` (claim board), `coverage.md` (visits and **lenses run** per area), `passes.md`
  (human declines), `Patterns/explorer-preferences.md`, `Lessons/{date}-explorer.md`.
- **Lenses (categories)**: `quality | dx | ui | perf | bug | i18n | a11y | sec`. How scan-sweep's
  and lens-scan's keys map onto them: `references/probes.md`, "Lens vocabulary". **Severities**:
  `critical | high | medium | low`.
- **Effort**: `xs (<15m) | s (15-60m) | m (1-3h) | l (>3h)` - an APPROVAL boundary, not a label:
  `xs`/`s` are built without asking, `m`/`l` are triaged. Size the WHOLE change (Phase 7).

## Phase 0: Read the overlay, resolve the vault

Read `.claude/explorer/config.md` if it exists. `VAULT` = the first `vault` candidate that
exists; else `<repo>/.explorer/` (same schema, git-ignore it if a concurrent agent shares the
branch) - a missing vault never aborts. Open with one line: which vault won, whether an overlay
was found. Create any missing vault file from `references/vault.md` ("Bootstrap"). **Write every
vault note with the file-writing tool, never a shell heredoc** - the notes carry backticks,
quotes and `${}`, and heredocs have broken on exactly that.

## Phase 1: Load context and memory

1. **Context-source check** - one line naming which sources exist. Nothing here stops the run;
   if the overlay names a regenerate command for a stale source, offer it under `Next?`.
2. **Read in order**: the area taxonomy; the architecture digest; the rules file plus the
   overlay's `## Repo law`; the **feature docs** the area maps to (a "Known gaps" section is a
   pre-verified backlog - the `known-gaps` probe); `$VAULT/Architect/strong-patterns.md` if
   present (prefer an existing strong pattern's shape in any fix); `Patterns/explorer-preferences.md`;
   `Explorer/state.md`, `coverage.md`, `passes.md`; the 3 newest `Lessons/*-explorer.md`.
3. **Knowledge-sync read happens HERE**, before Phase 4 - the governing subjects and techniques
   (§ Knowledge sync). Read after the wander, it informs nothing. **Append the consults line at
   the end of this phase, before any commit** - a pre-commit hook may read it.
4. **Stale claims** - drop `state.md` Active entries older than 2 hours.
5. **Snapshot freshness** - taxonomy >30 days old or >200 commits behind HEAD: warn, continue.

## Phase 2: Pick the area and the lens

**The lens matters more than recency.** An area swept recently through one lens is not swept:
four separate runs found full yields in areas with fresh dedicated passes, because each pass had
run a different lens. So the unit of coverage is the pair (context, lens), and a lens counts as
run when **either** explorer or scan-sweep ran it there.

### 2a. The user named an area

Resolve the hint: exact group name -> its contexts; exact context id -> that context; path
fragment -> contexts whose file lists overlap; keyword -> contexts whose keywords match. More
than 3 plausible areas -> a short numbered list, "which one?". With no lens given, run the picker
(below) with `--all` and take the first open lens it lists for those contexts.

### 2b. "Pick for me"

```sh
node ${CLAUDE_SKILL_DIR}/scripts/pick.mjs            # from the repo root; --json, --category <c>, --top N, --all
```

Read-only, it joins the context map (flat or grouped), `Explorer/coverage.md` (`Contexts:` and
`Lenses:` fields, format in `references/vault.md`; legacy rows inferred from sweep notes),
scan-sweep's `.claude/scan-history/scan-sweep.jsonl`, lens-scan's `.ai/lens-scan/scan.db` if
present, and `state.md` claims. It prints its sources, then one row per context offering only
lenses **neither loop has run** that have surface there. Order: >= 3 files first, then fewest
lenses run, oldest explorer visit, most cross-references. On a **first run** (empty ledger) it
ranks by cross-references - "smallest file count" picks the context least able to yield.

Take row 1 unless the user's scope excludes it, and quote its `pick: <context> / <lens> - <why>`
line verbatim (the why cites both ledgers). If the script cannot run, apply the same rules by hand
and say `pick: DEGRADED (<why>)`. `Next?`: 1 other area / 2 proceed (default) / 3 abort.

The chosen lens focuses the probe pass and the hunting list. A real defect of another lens met on
the way is still an item, but **an incidental item does not mark its lens run**: record the
picked lens, plus any lens whose probe set ran.

## Phase 3: Claim the area

Append the claim line (`references/vault.md`) under `## Active` in `Explorer/state.md` and print
it. Informational, not a lock. If the overlay names an `active_runs_ledger`, also add an entry
there declaring the area's paths; an overlapping `started` entry <2h old is surfaced to the user
before scanning. With no ledger, `git status` is the coordination surface: note foreign
uncommitted work and never sweep it into your commits.

## Phase 4: Wander - joins first

Up to 10 items; zero is a valid result. Budget about 40 file reads.

### 4a. Probe pass - before any file is sampled

Run the probes from `references/probes.md` in its run order: the always-run set (`known-gaps`,
`gate-matrix`, `consumer-claim` - or its `stated-rule` variant when it finds nothing -
`comment-cites-gate`, `unapplied-idiom`), then the lens's probes, `technique-first` when the area
is registry-governed. About ten commands; note each one's hit count. A hit is a **candidate**.

Measured: 5 of 5 items in one run (single-file reading: 0 of 14 files), 3 of 9 in another, 3 of
4 high items in a third. A probe pass that finds nothing in the joins is a signal to widen the
probes or the area, not to fall back to reading files end to end.

### 4b. Sampling - what the probes pointed at, then the rest

Read the files the probes flagged first. Then, for an area with N files: N <= 5 read all;
N <= 20 the entry points plus a sample (10 reads at most); N > 20 the entry points plus 5-8 of
the largest files. Files over 500 lines: top, bottom and a middle slice. Hunt with the chosen
lens's list in `references/categories.md` (it also carries the **lint-baseline exclusion** -
a declared migration is never an item). For more than ~40 files, fan out with the
`scout-ruled-out` probe: each scout must report what it checked to rule out the guard elsewhere.

### 4c. Dedupe, then stop

- **Signals**: skip shapes `explorer-preferences.md` says the user rejects; skip exact `passes.md`
  fingerprints (a near-match may resurface, saying why); skip what a prior sweep note of this area
  already carried unless its status changed.
- **History**: `git log --oneline -20 -- <area path globs>`. Drop a candidate a recent commit
  plausibly fixed (confirm in the code, not the message); a survivor notes "still present after
  <sha>". Recent commits map **which lenses already ran**; they do not mean "covered".
- **Stop** at 10 items; or when the area is exhausted (report what is supported and what remains
  uncertain; widen only within the user's accepted scope - a quota never authorizes expansion);
  or when the read budget is spent. **Never pad.**

## Phase 5: Close the premise, then structure the item

### Premise check - a hard gate that closes BEFORE any edit to that item

Every item's `anchor` is a `file:line` you Read this session, and its evidence quotes or
paraphrases the code there. But the anchor is where a pattern-matched suspicion looks MOST
convincing; candidates die one call site away. So the evidence required depends on the claim:

| The item claims | Required evidence (read it, cite it) |
|---|---|
| something present or absent at the anchor (dead export, missing guard, literal) | the anchor re-read, plus one grep proving the guard/import/use is not elsewhere |
| **lifetime, identity or reachability** (state survives a switch, a value reaches the user, a branch runs) | the **mounting parent or the caller** - the component that remounts, the branch that reaches the formatter, the button that calls the writer |
| **locks, snapshots, ordering, concurrency** | **a failing test** - in the repo's harness, or a throwaway probe test in its own test lane, deleted before staging |
| a rule a gate enforces ("covered by <check>") | the gate's source, showing what it actually checks |
| one layer's claim about another (UI promises X of the server; a doc obliges a consumer) | both sides, a line quoted from each |
| a derived flag or constant | the definition it derives from, wherever it lives |
| a contract change (status code, return type, thrown error) | every caller that branches on it |

The check closes **before you touch the file**: a written edit creates a sunk cost that argues
for itself. A candidate the check kills is recorded under "Killed candidates" in the sweep note
with its **deciding file:line** - the record that the gate ran. Replace it or run short.

### Item fields

Each item carries the fields in `references/vault.md` ("Item fields"), among them **`probe`**
(the catalog id that surfaced it, or `sample`) and **`premise`** (claim type -> the evidence
read). A fix matching a strong-pattern entry conforms to that entry's canonical example.
**Severity**: critical = security gap, data loss, crash on a common path (every `sec` finding is
promoted to critical); high = wrong on the golden path or a common edge case; medium = paper cut,
latent risk; low = polish. Most items "high" means recalibrate; ten items typically land 0-1
critical, 2-3 high, 4-6 medium, 1-3 low. **Clusters**: same file, a dependency order, or one
i18n bundle ship together - note it in `cluster_hint`.

## Phase 6: Present

A summary table (`#`, lens, severity, effort, probe, title, anchor), then each item's fields
(`references/vault.md`). End with a `Clusters:` block when any exist ("[2, 5, 8] - one file;
order 5 -> 2 -> 8").

## Phase 7: Triage - the small band is auto-accepted

**`xs` and `s` items are accepted without asking** (13 of 15 measured were, all accepted). The
split is **who can answer "did this work"**: the repo's gates settle an `xs`/`s` item; an `m`/`l`
item needs a judgement outside them. Two properties keep the auto band safe; neither may weaken: **the Phase 5 premise gate applies in full** (auto-accept changes who approves a VERIFIED
finding, not what becomes one), and **every item is its own gated atomic commit** (an unwanted
one reverts alone, by sha).

1. **Auto band (`xs`, `s`)** - print the plan (Option B step 1) so the user can interrupt, then
   build in risk-ascending order. **Built and committed, never parked**: a `.patch` file is an
   unbuilt item wearing a deliverable's clothes. A small item that cannot be built is deferred
   or re-sized to `m`, and said so.
2. **Triage band (`m`, `l`)** - ask about these only, once, each with the one thing only the
   user can decide (prompt in `references/vault.md`); Enter means none. With no `m`/`l` item,
   ask nothing: say what you are building, and build it.

**`--triage-all` is still ONE question.** It restores asking about every item, as a single
multi-select: the `m`/`l` items named individually, the `xs`/`s` items bundled as one option
("the small band: [1, 2, 4, 6]") with per-number exclusion allowed. One round trip, never one
prompt per item. Offer it under `Next?` when the auto band ran larger or riskier than expected.

**Nobody answered is not "none".** Unattended - no operator, or no reply - the triage band's
outcome is `decided: unasked`, never `declined`: written in full to the sweep note, never
fingerprinted in `passes.md`, so the next pass resurfaces it with a human present. Silence once
retired a `critical` security finding nobody read. Say how many went unasked and why.

**Sizing is an approval decision.** `effort` is the honest cost of the WHOLE change: edit, test,
locale parity across every catalog, doc-sync, visual verification. Between two buckets take the
larger. **An item the gates cannot settle is `m` at minimum, however small the diff** - a browser,
a credential or "does this look right" is the question being handed to the user. Reusing an
established visual mark, asserted by a DOM test, keeps its size; a new visual treatment is `m`.
`m` means "needs a decision", not "takes an hour".

### Execution rules

Execute each accepted item **in this session**: decide -> implement -> gate -> commit.

**Gate baseline, once, before the first edit.** Baseline = the overlay's `## Gates` set; with
none, lint + typecheck + the area's tests. Name anything skipped. Record it verbatim: command,
pass/fail per stage, counts.
"Pre-existing" is a claim that must quote this line. Scoped runs are fine in the edit loop and
are *named* as scoped wherever their numbers appear. If the full gate cannot run here, say so once
and treat every later gate claim as scoped.

**One item (Option A):**

1. Apply the edit at `anchor`.
2. **Run the gates** the overlay maps to what the item touched (with no overlay, the detected
   typecheck / lint / test / compile - print what you detected). Known-baseline lint warnings
   are fine; errors and new warnings in touched files are not. **When a gate is red, classify
   before acting** - never `--no-verify`, never `--amend`:

   | Red because of | Tell | Move |
   |---|---|---|
   | **your change** | the failure names a file or symbol you touched | fix it before committing |
   | **a stale generated file** | the failure names a generated artifact (type stubs, route manifests, codegen) | regenerate it (or delete it and let the build remake it); never hand-edit it |
   | **someone else's file** | the failure is in a path you did not touch, and it reproduces on a clean export of the base SHA (`git archive <sha>` into a scratch dir, run the test there) | lint/test your own paths for a clean signal, commit, report the foreign failure in the commit body and the run record; do not touch the foreign source |
   | **the checkout itself** | it passes in a clean `git worktree add --detach <sha>` outside the shared tree and fails here | run the gate from that worktree; the comparison baseline is a SHA, never a branch that moves |

3. **Stage, verify and commit in ONE shell invocation** (concurrent sessions rewrite the index
   between calls): `git add <path> <path> && git diff --cached --stat`. Never `git add -A`, `.`
   or `-u`. More files in the stat than you added means another session pre-staged work:
   `git restore --staged <path>` each stranger, re-verify, then commit. An insertion count far
   above your edit means rewritten line endings: normalize and re-stage.
4. **Commit in the repo's own convention.** Read it once per run - the `commit-msg` hook if one
   exists, the overlay's repo law, `git log --oneline -15` - and write the subject that way
   (`fix(scope): ...` where conventional commits are required). **Explorer attribution goes in
   the body** (`explorer <version>, run <id>, item <n>, probe <id>`) with the why and the
   Co-Authored-By footer. `explorer: <title>` is the subject only when the repo has no convention.
   A repo with a same-change doc gate gets its trailers (`Doc-sync(...)`) in every commit's
   template - read the hook once, not after the first bounce. **Write the message with the file
   tool and commit with `git commit -F <file>`**: context names carry shell metacharacters (`&`).
5. **Verify the change landed in YOUR commit**: `git log -1 --format=%h -- <path>`. A concurrent
   broad `git add` between your edit and your commit absorbs your change into its commit, and
   your own commit then finds nothing or commits its staged work. If the sha is not yours, the fix
   is in the tree under another author: say so, do NOT re-apply it. Keep the edit -> commit
   window short.

**Several items (Option B):** print the inline plan (file, change shape, validation per item);
execute risk-ascending (xs first; ties `bug` > `perf` > `i18n` > `quality`); one gated atomic
commit per item, Option A's steps each time - two items in one region of one file still land
sequentially, as two commits. A failing gate is fixed inline, never stacked. An item made
redundant by an earlier commit is dropped and recorded. **Option D**: `decided: deferred` with the
reason in the run record - no handoff file.

**Tracked ledger lines ride with the work.** The registry-lead line (§ Knowledge sync) is a
tracked file: commit it with the fix that earned it, or in one closing ledger commit in the repo's
convention. `.ai/consults.jsonl` and the vault are gitignored - never stage them. End with nothing
the run authored left dirty; the summary names the commit that carries the lead, or says none.

**Read the caller before changing a contract.** Before an item changes a status code, return
type, thrown error or anything a caller branches on, read the callers: an idempotent DELETE made
to 404 "for symmetry" broke an optimistic UI that rolls back on `!res.ok`, restoring a row the
database no longer had. Done means the callers still mean what they meant. Also read a source
guard's pattern before restructuring a call it pins (a guard test can pin call *shape*), and
prefer a literal substring check over a regex in any guard you write - it survives tool
boundaries and a reader can verify it at a glance.

**Repo law is non-negotiable.** Every item honors the overlay's `## Repo law` in full (i18n
contract and pipeline, token-label and translated-error helpers, design tokens, shared
components, boundary wrappers); with no overlay, the rules file, then the surrounding code's
shape. An item that would add more than a handful of locale keys is a session of its own - defer
it. An item that cannot honor the law is deferred, never shipped half-converted. File-size caps apply
to tests too: when the existing test file is over the cap, add a new sibling test file.

**Visual verification.** A visually meaningful change follows the overlay's `## Smoke` before
committing - and first confirms the server it reaches is this repo's app (one `curl` of the
page title; a busy port may belong to another project). With no `## Smoke`, say plainly the
change was NOT visually verified. Never "looks good" from code review.

## Phase 8: Persist the sweep

Write `Explorer/sweeps/{YYYY-MM-DD}-{area-slug}.md` from the template in `references/vault.md`,
with the file tool: the pick line verbatim, the probes run, the lenses recorded, each item's probe
and premise evidence, and every **killed candidate with its deciding file:line**.

## Phase 9: Self-reflection

- **9a. Declines** - only `m`/`l` items can be declined; skip this step when none were (most runs,
  and every unattended run). One batched question (`references/vault.md`).
- **9b. Lessons** - append to `$VAULT/Lessons/{date}-explorer.md` (template in `vault.md`):
  which probes paid, which came back empty, calibration drift.
- **9c.** Backfill decline reasons into the sweep note.
- **9d. passes.md records only an explicit human "no".** A fingerprint suppresses the item in
  every future pass; `unasked`, deferred and auto-band items are never fingerprinted.
- **9e. Pattern promotion** - a decline reason seen in 3+ runs is offered for
  `Patterns/explorer-preferences.md` (prompt in `vault.md`).
- **9f. Coverage** - update the area's row: `Last visited`, `Contexts:` (exact map names) and
  `Lenses:` (a running union; date the picked lens and any lens whose probe set ran). This row and
  scan-sweep's ledger are what the next pick reads; a lens written for a pass that looked at
  nothing inflates coverage permanently.
- **9g. Release the claim** in `state.md`; move a ledger entry to `## Recently completed` with
  the commit SHAs (or `aborted (<reason>)`).

## Phase 10: Final summary

Print the summary block from `references/vault.md` (pick, probes, items by source, killed,
shas, unasked, unverified, gate baseline, coverage, `Next?` defaulting to the next pick). Zero
accepted items is a successful pass over a healthy area. **Say what you did without being
asked**: what was built on the user's behalf, under which shas, and what the gates could not settle.
Run log (§ Skill Reflection): with no token figure, omit `--tokens-est` - `log-run.mjs` rejects `null`.

## Notes on use

- **Cadence**: daily or every other day, 20-40 minutes. When `pick.mjs` reports few open pairs,
  switch to `/architect` or a `/scan-sweep` challenge round.
- **Coexist with uncommitted work.** Never stash, reset, discard or clean anything the run did
  not author (`git stash`, `git reset --hard`, worktree-touching `git restore` / `git checkout --`,
  `git clean -f`); `git restore --staged <path>` for a foreign pre-staged file is allowed. An
  anchor file with someone else's uncommitted changes: ask "commit them first, or layer on top?"
  (default: layer on top). After an isolated-index commit, resync only your own paths with
  `git reset HEAD -- <own paths>`, never a bare `git reset`.
- **Calibration under the auto band.** Declines now come only from `m`/`l` items, so zero declines
  says little. Read the shortfall (how often a run stops short of 10), the killed-candidate count,
  and any **revert of an auto-accepted commit** - that is the decline streak of v2, and it means
  sizing runs small. Three runs in a row with zero accepted items, or every item always accepted,
  are both calibration signals: read the last three sweeps and ask what would have been useful.

## App context coverage (Personas-managed repos)

`contexts: tracked`: in a repo with `.personas/`, append one progress node per context worked on
to `.personas/memory-outbox.jsonl` - format and the name-matching trap in
`references/personas-outbox.md`. Skip silently otherwise.

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

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"explorer@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
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
node <registry>/scripts/log-run.mjs --skill explorer --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"explorer","outcome":…,
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
