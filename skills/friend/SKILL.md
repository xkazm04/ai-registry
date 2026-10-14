---
name: friend
description: "Use when the operator wants steady product momentum in ONE area of a codebase: an endless single-area companion loop that scans the area, proposes 5 development directions seeded from evidence (the area's registry-map deviation pairs and their golden-path techniques, the directions ledger, sibling passes and backlogs, and which earlier friend branches were merged), executes the picked one in a worktree with the repo's conventions as atomic commits, reports, and proposes 5 more. Interactive by default - every prompt is a numbered menu and Enter takes the default. Headless with arguments: /friend <area> [goal] [--verify] [--pick N|auto] [--cycles N] skips the matching menus; --pick auto takes the highest-value direction and states why in one line; --cycles N stops cleanly after N cycles. Development-flavored UX and product work only: stabilization goes to explorer or scan-sweep, cross-context capability sweeps to scan-sweep --develop, multi-area arcs graduate to perfect."
argument-hint: "[area] [goal] [--verify] [--pick N|auto] [--cycles N]"
category: workflow
memory: vault
contexts: tracked
version: 1.6.1
model: sonnet
---
# Friend

Endless companion loop scoped to **one area of a codebase** - the areas are whatever the overlay's `## Areas` table names, never a taxonomy baked into this file. Each cycle: scan -> propose **5 development directions** -> pick -> execute with repo conventions -> report -> propose 5 new directions. Built for **parallel CLI sessions** that keep adding UX / product value to one corner with the least typing possible, and for **headless runs** that pick and land a cycle with no prompt at all.

`/friend` is the light, in-session, single-area companion: one session, one worktree, one picked direction executed *immediately* per cycle. No builder fleet, no acceptance pool, no review gates. It is development-flavored and portable: it runs with no overlay on defaults, and everything a particular repo is comes from the overlay.

Siblings - know the boundary:
- `/perfect` - the heavy sibling: Director/Builder loop, acceptance pool, per-context worktree builders. A `/friend` idea that outgrows one area (multi-context scope, schema breaks, review gates) **graduates** there (Phase 2).
- `/scan-sweep --develop` - new capability swept context by context, proved and landed without a menu. Use it when the operator wants breadth across contexts rather than a companion in one.
- `/explorer` and `/scan-sweep` (default) - stabilization: paper cuts, bugs, hardening.
- `/architect` - heavy structural cross-area change. `/research` - external sources.

## Interaction conventions

- **Every prompt is a numbered menu.** A digit picks; **Enter** takes the default; option `1. other -> ...` is the deviation lane (free text).
- **Every cycle ends with a `Next?` block** of 5 numbered directions plus deviation + refresh.
- **Arguments skip menus.** Any question an argument answers is not asked (see Input). With `--pick`, the run is **headless**: no prompt is printed anywhere in the loop, and every place that would ask takes the documented headless default instead.
- **No exit option in the menu.** The loop runs until `--cycles` is reached, the user interrupts, types a stop word in the deviation lane (`stop`, `done`, `bye`, `quit`, `exit`), or the context window forces a wrap. Each of those runs the clean-exit ritual (Phase 6).

## Project overlay

This file is the **method** and is repo-agnostic. Everything a repo *is* - its areas, vault, gates, conventions, codegen, verified-mode driver - lives in ONE overlay read at Phase 0: **`.claude/friend/config.md` in the consuming repo** (tracked, so it travels with the clone). **The loop runs with no overlay at all** - every key has a default - but says `overlay: defaults` once in the first cycle header. Never paste one repo's overlay into this file.

Scalars: `product`, `stack`, `vault`, `vault_subdir`, `base_branch`, `worktree_dir`, `active_runs_ledger`, `context_taxonomy`, `context_outbox`, `verify_url`, `locale_count`, `commit_types`. Sections: `## Areas`, `## Gates`, `## Repo law`, `## Codegen`, `## Docs`, `## Verified mode`, `## Context sources`, `## Direction taste`, `## Skill improvement log`. The full key table with every default is in [`references/overlay.md`](references/overlay.md) - read it at Phase 0a when the overlay omits a key you need, or when writing an overlay. Overlay writes are committed scoped: `git commit --only .claude/friend/config.md`.

---

## Input

```
/friend [area] [goal] [--verify] [--pick N|auto] [--cycles N]
```

| Argument | Answers | Effect |
|---|---|---|
| `area` (first bare word) | Q1 | an `## Areas` row name, or a hint (path fragment, keyword, context id) resolved as Q1 option 1 |
| `goal` (remaining bare words) | Q2 | `surprise` = surprise me; any other text = a vague intent layered as a prior |
| `--verify` | Q2b | verified mode on (requires `verify_url`; without it, say so once and continue checklist-only) |
| `--pick N` | every `Next?` menu | take menu option N (2-6) each cycle, no prompt |
| `--pick auto` | every `Next?` menu | take the highest-value direction (Phase 2 "Auto-pick") and print one line saying why |
| `--cycles N` | when to stop | after cycle N, skip the `Next?` menu and run Phase 6 |

- With `--pick` and no `--cycles`, `--cycles 1` is implied - an unattended loop never runs unbounded.
- With `--pick`, unanswered questions take their default without being printed: area = pick for me, goal = scan and propose, verify = no.
- `/friend` with no arguments asks Q1, Q2 and (when `verify_url` is set) Q2b, in that order.

### Q1 - Area

```
Area? (Enter = pick for me)
  1. other -> type a hint (path fragment, keyword, or context id)
  2..N. <one row of the overlay's `## Areas` table, in overlay order>
  N+1. pick for me   <- default
```

Options `2..N` are the overlay's `## Areas` rows (with no overlay, one per top-level source directory - say the menu was derived). Option 1 falls through to the resolver. Pick-for-me favors the area with the oldest `/friend` visit in `Friend/coverage.md`, tie-broken toward a higher `Kept/shipped` ratio there; round-robin when no coverage exists.

### Q2 - Goal

```
Goal? (Enter = scan and propose)
  1. other -> describe a vague intent (free text)
  2. scan and propose   <- default
  3. surprise me        - one bolder option, no scan summary
```

A vague intent is a prior over the 5 directions; it never replaces them.

### Q2b - Verified loop? (only when `verify_url` is set)

```
Verify each cycle against the running app? (Enter = no)
  1. other -> free text
  2. no - validate with the overlay's builder gates only   <- default (fast loop)
  3. yes - drive the real UI at <verify_url> and observe the DOM before reporting done
```

`yes` enables **verified mode** for the session (Phase 4.5): one worktree-local instance booted at Phase 0g; **never mark a UI change done on a typecheck/compile pass alone - drive the scenario and observe real DOM.** `no` keeps the fast loop and emits a manual-verify checklist for behavior-changing cycles. Toggle mid-session from the deviation lane: `verify on` / `verify off`.

---

## Constants

- **Reference files** (skip any that is absent): the overlay; `context_taxonomy`; the authoritative rules file `## Repo law` points at (`CLAUDE.md` / `AGENTS.md`).
- **Vault** (`$VAULT/<vault_subdir>/`, written `Friend/`): `sessions/`, `coverage.md`, `passes.md`; plus `$VAULT/Patterns/friend-preferences.md`, `$VAULT/Lessons/*-friend.md` (shared folder, never created here), `$VAULT/Architect/strong-patterns.md` if present. What each does and its header: [`references/learning.md`](references/learning.md).
- **Evidence this loop reads but never writes** (Phase 1a): `.ai/registry-map.json` + registry golden paths; `.ai/directions/ledger.jsonl`; `$VAULT/Explorer/passes.md`; the backlog digest and sweep history named by `.claude/scan-sweep/config.md` (key `backlogDigest`, at the default scan-sweep documents when unset; sweep history `.claude/scan-history/scan-sweep.jsonl`); `/perfect`'s direction notes (`<perfect vault>/directions/*.md`, vault from `.claude/perfect/config.md`). Read gitignored evidence (backlog digests, sweep scratch) from the **main checkout**, never the worktree - a fresh worktree does not carry it. Matching rules for all of it: [`references/evidence.md`](references/evidence.md).
- **Direction shape** - every proposed direction must:
  - Add or polish **user-visible product surface**: a new control, a clearer flow, a missing affordance, a new capability, a wrong state the user sees made right.
  - **Name the concrete files it touches and the user-visible outcome.** "Polish X" / "improve the Y experience" without files and an outcome is a banned menu item - you have not scanned enough.
  - **Name its standard:** `standard: <subject>/<technique>` when a registry technique governs it, else `standard: none`.
  - Ship as **one or more atomic commits**, each compiling and lint-clean; never carry >30 minutes uncommitted.
  - NOT be pure cleanup, dead-code removal, test-only, a dependency bump, or a refactor without user-visible payoff - those belong to `/explorer` / `/scan-sweep` / `/architect`.

---

## Phase 0: Setup

### 0a - Overlay and vault

Read `.claude/friend/config.md`; omitted keys take their defaults. Resolve `VAULT` = the first existing `vault` candidate, else `<repo>/.friend/` (git-ignore it when a parallel session shares the branch). **Do not create anything yet** - the vault is bootstrapped lazily at its first write (Phase 6), with the headers in `references/learning.md`. A session that runs no cycle leaves the vault untouched.

### 0b - Learn from merges

Earlier friend sessions answered "was this worth keeping?" by what the user did with the branch. Read that before proposing anything:

```bash
git branch --list "worktree-friend-*" --format="%(refname:short) %(committerdate:short)"
git branch --merged <base_branch> --list "worktree-friend-*"
```

Then add the branches named on the `Branch:` / `Commits:` lines of `Friend/sessions/*.md` that no longer exist. Judge each branch of the chosen area - `worktree-friend-<area>*`, plus older sub-area branches whose slug starts with the area or names one of its contexts (mapping in `references/evidence.md`):

- **shipped** - merged into `base_branch`; or deleted, and its last recorded commit is an ancestor (`git merge-base --is-ancestor <sha> <base_branch>`); or deleted, and a cycle title from its session note appears in `git log <base_branch> --since=<session date> --fixed-strings --grep "<title>"` (squash or rebase merge).
- **soft reject** - unmerged with its last commit older than 14 days, or deleted without any shipped signal.
- **pending** - unmerged and younger than 14 days; no verdict.

Shipped cycles are a taste prior (Phase 2 weights similar shapes up). Soft-rejected cycle titles join this session's soft-skip set - not `passes.md`; a person never said no. The tally is written as `Kept/shipped` in `coverage.md` at Phase 6f. No sessions and no branches: `merges: none yet`.

### 0c - Collision check

If the overlay sets `active_runs_ledger`, scan its `## Active` for `started` entries under 2 hours old whose `Paths:` overlap the area's paths (0f). Otherwise take the signal from `git worktree list` and `git status`. On overlap:

```
Heads up - another session is editing this area:
  <name> (started <hh:mm>, paths: <paths>)

What now? (Enter = proceed in worktree - physical isolation)
  1. other -> free text
  2. proceed in worktree   <- default
  3. switch area
  4. abort
```

Headless: print the heads-up line and proceed - `/friend` always works in its own worktree.

### 0d - Worktree

```bash
SLUG="friend-<area>-$(date +%H%M%S)"
git worktree add "<worktree_dir>/$SLUG" -b "worktree-$SLUG" <base_branch>
cd "<worktree_dir>/$SLUG"
```

Always name `<base_branch>`: without it the worktree branches from whatever the main checkout has checked out. If the gates need installed dependencies, link the main checkout's dependency directory (`node_modules`) in as a junction / symlink, and at Phase 6 remove the link itself (`rmdir` the junction) - never a recursive delete through it. The whole loop runs inside it. On exit, the worktree and branch stay - the user owns the merge, and the merge is what Phase 0b learns from next time.

### 0e - Register

With an `active_runs_ledger`, append a `### friend - <area>` entry to its `## Active` section in the main checkout, one bullet each for `Started:`, `Status: started`, `Branch:`, `Worktree:`, `Paths:` (the area's paths) and `Note: /friend development loop`.

### 0f - Area -> paths -> contexts

Resolve the area to paths from its `## Areas` row (`name -> paths -> entry points`); with no overlay, derive from top-level source directories and say so. Free-text hints use the `/explorer` resolver (hint -> context -> paths). Then take the **contexts in scope**: every `contexts[]` entry in `.ai/registry-map.json` with a `paths` entry under one of the area's paths. These carry the registry pairs Phase 1a reads.

### 0g - Verified-mode instance (only when verified)

Start **one** worktree-local instance for the session with the boot command in `## Verified mode`, run from the worktree. Probe `verify_url` before the first verification. A port already held by another instance does not have this worktree's code: offer (a) read-only reuse, (b) another port, (c) checklist-only - headless takes (c). Compiled-layer cycles need a rebuild; hot-reloaded ones do not. Use the driver primitive the overlay names and never a driver path it flags as lossy. If boot fails, say so once and downgrade to checklist-only.

---

## Phase 1: Load evidence + scan

### 1a - Read once per session, before anything is proposed

Read in parallel and hold for the whole loop. Skip what is absent; never block.

1. **Repo law:** the overlay's `## Repo law` and the rules file it points at; `## Gates`, `## Codegen`, `## Docs`; `context_taxonomy`.
2. **Registry deviations - the standards seed.** Per `## Knowledge sync`: for each context in scope (0f), take its subject pairs from `.ai/registry-map.json`. Take every pair with `state: "deviation"` (its `evidence` is a located defect with file:line); note `conformant` pairs as regression guards. Drop pairs with a per-pair `stale: true` (not the top-level `staleSubjects`). **Filter by the rejection set (1a.3) first, then** rank by `confidence` (strong > probable) and `score` and keep the top 5. Pairs carry no technique: for each kept subject read its golden path from `<registry>/knowledge/<bundle>/index.json` (`subjects[<slug>].file`, verbatim) and choose the technique by reading its techniques' `use_when` against the evidence. No registry declared: `registry: none`, no seed.
3. **The rejection set** - what a person or a sibling already refused here. One list, each entry with its source:
   - `.ai/directions/ledger.jsonl` - `declined` rows (never re-propose that subject's direction), `deferred` rows whose return condition is unmet; `accepted` rows are in flight until their work is merged, then expire. A ledger match is subject (bundle prefix stripped) plus direction slug - a row never bans a whole subject.
   - `Friend/passes.md` and `$VAULT/Explorer/passes.md` - every section whose name contains the area or one of its sub-areas (sections are not named after overlay areas).
   - the scan-sweep backlog digest - `titles.rejected`; `titles.accepted` and `titles.pending` count as in flight.
   - `/perfect` direction notes for contexts in scope with `status: rejected` or `dropped`.
   - soft rejects from Phase 0b (soft: skippable, not banned).
4. **Taste:** `$VAULT/Patterns/friend-preferences.md` (hard constraints), the overlay's `## Direction taste`, shipped shapes from 0b, the last 3 `$VAULT/Lessons/*-friend.md`, `$VAULT/Architect/strong-patterns.md`.
5. **Coverage:** `Friend/coverage.md`, and scan-sweep's sweep history rows for contexts in scope with `strategy: "develop"` from the last 14 days - a fresh capability sweep there is work not to redo.

Log the read per `## Knowledge sync` (`.ai/consults.jsonl`, one line per context in scope). It and the run log (`## Skill Reflection`) are written in the **main checkout**, never the disposable worktree - some repos track the consults log.

### 1b - Scan the area (every session, lightweight)

Inside the worktree. Budget roughly **20-40 files**, weighted toward UI surfaces, the deviation evidence files from 1a, and recently touched paths.

1. `git log --oneline --since="14 days ago" -- <area-paths>` - what is moving.
2. `git log --since="14 days ago" --name-only --format= -- <area-paths> | sort | uniq -c | sort -rn | head -10` - the most-touched files. Never sort by mtime: a fresh worktree stamps every file with the checkout time.
3. `Grep` for `TODO|FIXME|XXX` scoped to the area.
4. `Grep` for the repo's string-lookup call (from `## Repo law`) to find text-heavy surfaces.
5. The area's entry points from its `## Areas` row or `context_taxonomy`.
6. The file:line each kept deviation's `evidence` names - confirm it still holds before it reaches a menu.

`surprise me` also pulls two random non-trivial files. Then, unless `surprise me`, a two-sentence summary: `<Area>: <what is here>. <what has been moving>.`

---

## Phase 2: Propose 5 directions

```
N. <short title - verb-led, 3-6 words>
   What:     <one line, <=90 chars - concrete UX/product change>
   Why:      <one line, <=90 chars - the user-visible outcome once it lands>
   Files:    <the actual files to touch>
   Standard: <subject>/<technique> | none
```

A direction with no files, no outcome or no standard line is malformed - rework or drop it.

Constraints on the 5:

- **Always development, always outcome-value.** Drop "remove dead code", "extract a hook", "add tests", "bump a dep", cosmetic-only restyling.
- **One slot is reserved for a standards-backed direction** built from a kept deviation (1a.2): its evidence is the problem, the golden-path technique is the fix shape, and it carries `standard: <subject>/<technique>`. It must still meet the direction shape - a deviation qualifies when fixing it changes what a user sees or can do (a wrong status shown, a silent failure surfaced, a missing affordance); a purely internal deviation belongs to `/scan-sweep` or `/conform`. No qualifying deviation: fill the slot normally and say `standard slot: empty - <reason>` in the header.
- **Default mix:** `1 small polish (<1h) / 2 medium (1-3h) / 2 stretch (a vertical slice, ~2-5 atomic commits in one cycle)`; the standards slot takes whichever size it honestly is. One slot may be a graduation candidate. `surprise me` swaps the small for a second stretch. When the user keeps picking the small one or says "smaller", shift to `2 small / 2 medium / 1 stretch`.
- **Deepen before adding.** At most **1 of 5** is a net-new surface (new tab, rail, page-level panel); the rest extend code already in the area.
- **Vertical slice is the default for ambitious work:** the whole feature lands this cycle as ordered atomic commits (`feat(db)` -> `feat(api)` -> `feat(ui)` -> `polish:` states). **Stages-of-N** only when a human checkpoint mid-way genuinely helps (a risky migration to eyeball): `Stage 1 of N - ships <X>; next stage wires <Y>.` Days-long or multi-context arcs graduate instead.
- **Honor `## Repo law`, `friend-preferences.md` (hard constraints) and `strong-patterns.md`** (reuse the canonical shape and name it).
- **Never re-propose a rejection.** A candidate whose fingerprint (area + short title + one-line What, or the same subject for a ledger row) matches the rejection set (1a.3) is dropped silently. Same target file at a different angle: surface it annotated `(previously passed; resurfacing because <reason>)` - never for a `declined` ledger row or a hard reject. Count what was dropped for the header.
- **No repeats in-session.** Do not re-propose anything executed or rejected this session. A title soft-skipped twice (or soft-rejected by 0b and skipped once) stops being proposed for the rest of the session.

### Graduation lane (handoff to /perfect)

When the scan surfaces something genuinely valuable but **too big for one cycle in one area** (multi-context, schema break rippling across features, days-long, needs a review gate), one slot may present:

```
N. <idea title> - graduate to /perfect
   What:    <one line - the compounded payoff>
   Why big: <one line - multi-context / schema break / needs review gates>
```

Picked: do **not** execute. Record it in the session note under `## Graduated to /perfect`, tell the user to run `/perfect propose`, and return to the menu. Never pad the slot.

### Auto-pick (`--pick auto`)

Rank the non-graduation directions by user-visible value per hour of work. Tie-break toward the standards-backed direction (when all are, by user-visible reach), then toward a shape that shipped before (0b). Skip any direction the Phase 3 gate would trip. Print, before executing:

```
auto-pick: <N> <title> - <one line: why this beats the other four>
```

### Present

```
Area: <area>  Worktree: <slug>  Cycle: <n>[/<cycles>]
Evidence: <d> deviations in scope, standard slot <subject/technique | empty>; <r> prior rejections loaded, <f> filtered; friend branches <s>/<j> shipped

<scan summary, omitted in surprise-me>

Next? (pick a number - Enter = 2)
  1. other -> describe a direction in free text
  2. <Direction A title>                    <- default
  3. <Direction B title>
  4. <Direction C title>
  5. <Direction D title>
  6. <Direction E title>
  7. refresh - rescan and propose 5 new directions
```

Headless prints the same block (it is the evidence a reviewer reads) followed by the `auto-pick:` or `pick: <N>` line instead of waiting. From cycle 2, replace the scan summary with `Since last cycle: <last commit title>, <files touched>`.

---

## Phase 3: Risk gate

Before executing, silently judge whether the path is materially risky: schema / migration / table shape; renaming or removing a public command, IPC/API contract or generated binding; credential storage or encrypted fields; cross-area scope creep; deleting >50 lines of one file or removing a module; changing an active scheduler / runner / cron path; production-only paths the user cannot verify locally; anything that breaks the lint or typecheck baseline beyond the touched file.

Tripped, interactive:

```
Heads up: <one sentence on why this is risky>.
<one sentence on the alternative shape if relevant>.

Proceed? (Enter = yes)
  1. other -> describe an alternative
  2. yes
  3. narrower scope - describe the smaller version
  4. skip - pick a different direction
```

Tripped, headless: never execute a gated direction unattended. `--pick auto` already skipped it; `--pick N` stops the cycle with `blocked: risk gate - <reason>` and moves on (or to Phase 6 if it was the last cycle). Not tripped: execute immediately - routine UX/feature work never asks.

---

## Phase 4: Execute

Implement inside the worktree. **`## Repo law` is binding** - read it as a checklist:

- **Reuse before building** - import the catalogue's spinner / empty state / modal / button rather than hand-rolling; a new reusable pattern goes where the catalogue says. No catalogue: grep the shared directory first.
- **User-visible strings** - through the repo's string catalogue and lookup call, never hardcoded. With `locale_count > 1`, fill every locale in the **same commit** via the `## Codegen` extract/merge pipeline (one subagent per locale for a large fill; inline for <=5 keys).
- **Design tokens and call wrappers** from `## Repo law`, never raw equivalents, never an empty catch.
- **Generated artifacts** - a change that trips a `## Codegen` trigger runs that command and commits its output in the same commit. A changed string catalogue always runs codegen: `## Codegen`'s entry, or with none, the i18n / type generators the typecheck depends on. Never hand-edit a generated tree.
- **Schema and data** - additive only; destructive trips Phase 3.
- **Docs** - a user-visible change in an area `## Docs` maps updates that doc in the same commit.
- **Standards-backed directions** implement the technique as its golden path states it; never lower the standard to fit the code.

### Self-review

One adversarial pass on your own `git diff`: correctness (empty / error / null states, races, missing `await`), reuse and drift (re-implemented catalogue pieces, raw classes, raw calls, empty catches), strings (anything hardcoded, every locale filled), scope (only files this direction needed). Polish cycle: inline. Vertical slice: spawn a `general-purpose` review subagent on the staged diff (or run `/code-review`) and fix what it finds.

### Validation

Run the `## Gates` `builder:` list scoped to what was touched (no overlay: detect from the manifest and say what was detected). Lint is read **against the baseline** - fail on new errors and on lines you wrote, never on the pre-existing floor. Tests run only when the direction added or changed test files. A failing check is fixed in this cycle, never stacked into the next.

### Commit

One commit per logical step:

```
<type>(<scope>): <imperative title for this step>

<2-4 sentences: what changed, why user-visible. No bullet lists.>

Co-Authored-By: <the running model's name> <noreply@anthropic.com>
```

`<type>` from `commit_types` (default `feat`, `polish`); reaching for `fix` / `refactor` / `chore` means the direction was stabilization - except the standards slot, whose deviation fix may honestly be a `fix`. The trailer names the model actually running, never a hard-coded one. Read the repo's commit-msg hook before the first commit. Stage per file (`git add <path>`, never `-A` / `.` / `-u`), and before **each** commit check `git diff --cached --stat` - a parallel session may have pre-staged files; `git restore --staged <file>` anything you did not write. Capture each SHA (`git rev-parse --short HEAD`) for the report.

---

## Phase 4.5: Verify (verified mode only)

After the cycle's commits: (1) make sure the 0g instance has the change - rebuild compiled layers; (2) drive the exact scenario the direction claims with the overlay's driver against `verify_url`, asserting on real DOM - the control renders, the flow advances, the empty / error states appear when forced; (3) a contradiction means the cycle is **not done** - fix, add a follow-up atomic commit, re-verify, and never report red as green; (4) record `Verified: <scenario> -> <observed>`. Instance unavailable this cycle: downgrade this cycle to the checklist and say so.

**Non-verified, behavior-changing cycles** end their report with a concrete `To verify:` list - exact clicks / inputs and the expected result. A user-visible change is never reported flatly "done" without an observation or this checklist.

---

## Phase 5: Report + propose next 5

```
OK <direction title>  (cycle <n>[/<cycles>])
  Commits: <first-sha>..<last-sha>  (<count>)  -  Files: <N>  -  +<a>/-<b>
  Did:  <one sentence - what changed, behavior-first>
  Standard: <subject>/<technique> | none
  Checks: <one <gate> <OK|-> pair per builder gate that applied>
  Verified: <scenario -> observed | manual checklist below | - no behavior change>
  Worktree: <worktree_dir>/<slug>/   Branch: worktree-<slug>

<non-verified + behavior changed only:>
  To verify: <exact clicks/inputs -> expected result>
```

Then, unless `--cycles` is reached, the Phase 2 block with 5 new directions under the same constraints (independently pickable; may build on the cycle just landed) and loop to Phase 3. `--cycles` reached: no menu - go to Phase 6.

---

## Phase 6: Clean exit + learn

Triggered by `--cycles` reached, a stop word, an interrupt, or a context wrap. Templates for 6b-6h: [`references/exit-templates.md`](references/exit-templates.md). Create vault files lazily with the headers in `references/learning.md`.

- **6a Stabilize.** Uncommitted work from an interrupted cycle is discarded (`git restore .` on your own files) rather than committed broken - interactive asks first, headless discards and says so. Remove a dependency link 0d made (`rmdir` the junction, never a recursive delete). Move the ledger entry (if any) to `## Recently completed`: `completed (branch: worktree-<slug>, commits: <count>, last: <sha>)`.
- **6b Rejection reasons - optional enrichment.** Ask the batched question only when a person is answering; headless records unpicked directions as soft skips. Merge learning (0b) is the signal that does not depend on it.
- **6c Session note** - `Friend/sessions/{date}-{slug}.md`, including the evidence loaded and how each cycle was picked.
- **6d Lessons** - append to `$VAULT/Lessons/{date}-friend.md` if the folder exists; else embed in the session note.
- **6e passes.md** - hard rejects from 6b only.
- **6f coverage.md** - the area's row, including `Kept/shipped` from 0b. Written on every session that ran a cycle, headless included.
- **6g Pattern promotion** - 3+ close-synonym observations across Lessons; interactive confirms, headless only names the candidate.
- **6h Exit summary** - never auto-merge, never delete the worktree or branch.
- Append the context coverage nodes when `context_outbox` is set ([`references/context-coverage.md`](references/context-coverage.md)), then the run log (`## Skill Reflection`).

---

## Non-goals

- **No stabilization** - lint cleanup, dead code, type tightening, test-only work: suggest `/explorer` or `/scan-sweep`.
- **No non-atomic commits** - every commit compiles and lints clean; never >30 minutes uncommitted.
- **No cross-area scope creep** - Phase 3 trips; often the answer is graduating to `/perfect`.
- **No orchestration** - no builder fleets, no acceptance pools, no unbounded autonomous arcs; headless runs are bounded by `--cycles`.
- **No auto-merge, no silent stash, no `--no-verify` / `--no-gpg-sign`.**
- **No writes to sibling ledgers** - the directions ledger, explorer passes, scan-sweep digests and perfect notes are read-only here.
- **No memory writes** about routine cycles; only explicit, generalizing user guidance.

---

## Quick reference

```
/friend [area] [goal] [--verify] [--pick N|auto] [--cycles N]
  Q1 area / Q2 goal / Q2b verify      asked only when no argument answers them
  Phase 0  overlay, vault path (lazy), merge learning, collision, worktree, area -> contexts
  Phase 1  repo law + registry deviations + rejection set + taste, then scan (git log, not mtime)
  Phase 2  5 directions: files + outcome + standard; one standards slot; rejections filtered
LOOP:
  Phase 3   silent risk gate (headless: skip or block, never prompt)
  Phase 4   execute -> self-review -> gates -> atomic commit(s)
  Phase 4.5 verified: drive verify_url, observe DOM (else To verify: checklist)
  Phase 5   report + next 5 (or Phase 6 when --cycles is reached)
EXIT:
  Phase 6  stabilize, [6b if attended], session note, lessons, passes, coverage (kept/shipped),
           promotion, exit summary; worktree + branch left for the user to merge
```

## App context coverage

`contexts: tracked`: when the overlay sets `context_outbox`, append one progress node per context worked on before finishing, per [`references/context-coverage.md`](references/context-coverage.md). Unset: skip silently.

<!-- clause: knowledge-sync v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, to `.ai/consults.jsonl` in the task's MAIN checkout (never a disposable worktree), written before the run's first commit - pre-commit consult checks read it: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"friend@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
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
node <registry>/scripts/log-run.mjs --skill friend --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"friend","outcome":…,
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
