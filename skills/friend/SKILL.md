---
name: friend
description: Endless single-area companion loop: scan -> propose 5 development directions -> user picks a number -> execute with repo conventions -> repeat. Momentum-first, parallel-session UX/product building, scoped to one context.
argument-hint: "[context]"
category: workflow
memory: vault
contexts: tracked
version: 1.3.1
model: fable
---
# Friend

Endless companion loop scoped to **one area of a codebase** — the areas are whatever the overlay's `## Areas` table names (see `## Project overlay`), never a taxonomy baked into this file. Each cycle: scan → propose **5 development directions** → user picks a number → execute with repo conventions → report → propose 5 new directions. Designed for **parallel CLI sessions** where the user wants to keep adding UX / product value to a corner of the codebase with the least typing possible.

`/friend` is the **light, in-session, single-area companion**: one session, one worktree, one picked direction executed *immediately* per cycle. No builder fleet, no acceptance pool, no review gates — momentum, not orchestration. This skill is **development-flavored**, and it is portable: it runs with no overlay at all on defaults, and everything a particular repo is comes from the overlay. It does not do stabilization — that is `/explorer`'s job. It does not do heavy structural rewrites — that is `/architect`'s job. It does not look outside the repo — that is `/research`'s job.

Companion to:
- `/perfect` — the heavy sibling: Director/Builder loop, 10-accepted-directions gate, per-context worktree builders, vault-resident queue. When a `/friend` idea outgrows one area (multi-context scope, schema breaks, needs review gates or a human checkpoint mid-arc), **graduate it to `/perfect`** instead of stretching the cycle — see "Graduation lane" in Phase 2.
- `/explorer` — 10 paper cuts in an area, one-shot (quality / dx / perf / bug / a11y / i18n / sec)
- `/architect` — heavy structural cross-area sweeps, one-shot
- `/research` — external sources
- `/sentry` — fix prod errors

## Interaction conventions

Built for parallel CLI control — every user prompt is single-keystroke answerable.

- **Every prompt is a numbered menu.** Numeric input picks the option; **Enter** triggers the default; option `1. other → …` is the deviation lane (free text).
- **Every cycle ends with a `Next?` block** of 5 numbered next-direction options plus deviation + refresh. Replying with a digit advances the loop without typing prose.
- Long free-text answers are still accepted everywhere; the menu makes the common case instant.
- **No exit option in the menu.** The loop runs until the user interrupts, types a stop word in the deviation lane (`stop`, `done`, `bye`, `quit`), or the context window forces a wrap. On any of those, run the clean-exit ritual (Phase 6).

## Project overlay

This file is the **method** and is repo-agnostic. Everything a repo *is* — its areas, vault, gates, conventions, codegen, context taxonomy — lives in ONE overlay read at Phase 0: **`.claude/friend/config.md` in the consuming repo** (a tracked file, so it travels with the clone and survives the vault, which is not version-controlled). **The loop runs with no overlay at all** — every key below has a default — but say so once in the first cycle header (`overlay: defaults`). Never paste one repo's overlay into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

Overlay shape: YAML frontmatter for scalars, markdown `##` sections for lists and prose. Keys (default in brackets):

```yaml
---
product: "<product name>"          # cycle header  [the repo directory name]
stack: "<one-line stack>"          # sizing + gate detection  [detected from package.json / manifest, else "unknown"]
vault: ["<abs vault root>", ...]   # candidate roots, first existing wins  [<repo>/.friend/]
vault_subdir: Friend               # namespace inside the vault; "" = the root itself  [Friend]
base_branch: main                  # the exit summary's merge/inspect commands target it  [origin/HEAD, else current]
worktree_dir: .claude/worktrees    # where Phase 0c puts the cycle worktree  [.claude/worktrees]
active_runs_ledger: ""             # a live-sessions ledger, if the repo keeps one  [none; git status only]
context_taxonomy: ""               # file naming the areas/contexts  [none; derive from top-level source dirs]
context_outbox: ""                 # append-only per-context coverage file a host app ingests  [none; skip that step]
verify_url: ""                     # the running app a verified cycle drives  [none; verified mode unavailable]
locale_count: 1                    # sizing multiplier for string-heavy work  [1]
commit_types: "feat, polish"       # allowed commit types for this loop  [feat, polish]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Areas` | the area menu — one row per area, `name -> paths -> entry points`. Q1 offers these rows; Phase 0e resolves the ledger's `Paths:` and the scan scope from them | derive one area per top-level source directory and say the menu was derived |
| `## Gates` | `builder:` (what every cycle passes before each commit) and `integration:` (what passes before the exit summary), each an exact command with a when-clause | detect from `package.json` scripts (`typecheck`/`check`, `lint`, `test`) or the build manifest; else `npx tsc --noEmit` when a tsconfig exists — say what was detected |
| `## Repo law` | the convention digest Phase 4 treats as binding: the reusable-component catalog, string/i18n rules, design tokens, call/error wrappers, staging discipline, max-lines — and where the authoritative rules file lives | "read the repo's CLAUDE.md / AGENTS.md first; reuse before building" |
| `## Codegen` | commands a change can oblige (binding export, command-name generation, catalog regeneration, locale merge), each with its trigger and whether a hook enforces it | none; nothing is generated |
| `## Docs` | source-area -> doc-file map, and whether a hook enforces it | none; no doc obligation |
| `## Verified mode` | how to boot the app a cycle drives, its port, the driver primitive to use, and the driver paths known to drop work | offered only when `verify_url` is set; otherwise Q2b is skipped and behavior-changing cycles carry a manual-verify checklist |
| `## Context sources` | which name set `context_outbox` anchors to, and any known-stale map NOT to read | the `## Areas` table is the name source |
| `## Direction taste` | learned acceptance pattern; Phase 2 weights the slate by it | outcome-value over cosmetic churn |
| `## Skill improvement log` | the dated one-liners the reflection clause produces | created on first wrap |

Writes to the overlay (taste, improvement log) are committed scoped — `git commit --only .claude/friend/config.md` — never via a bare commit.

---

## Input

Ask **two** numbered-menu questions, in this order.

### Q1 — Area

```
Area? (Enter = pick for me)
  1. other -> type a hint (path fragment, keyword, or context id)
  2..N. <one row of the overlay's `## Areas` table, in overlay order>
  N+1. pick for me   <- default
```

Options `2..N` are the overlay's `## Areas` rows — the same taxonomy `/explorer` and `/architect` resolve against in this repo. With no overlay, derive one row per top-level source directory and say the menu was derived. Option 1's free text falls through to the resolver (path fragment / keyword / exact context id). The last option / Enter triggers an auto-pick weighted by which area has had the least recent `/friend` activity (see Coverage below) — fall back to round-robin if no Coverage file exists yet.

### Q2 — Goal

```
Goal? (Enter = scan and propose)
  1. other -> describe a vague intent (free text)
  2. scan and propose   <- default
  3. surprise me        - let me pick a stretch direction without telling me upfront
```

`scan and propose` and `surprise me` produce 5 directions; `surprise me` biases toward one bolder option and skips the user-readable scan summary.

A vague free-text intent (option 1) is layered as a prior over the auto-proposed directions but does not replace them — `/friend` still surfaces 5 options.

If the user typed `/friend` with no arguments, treat as area=`pick for me` + goal=`scan and propose` + verified=`no`.

### Q2b — Verified loop? (opt-in)

**Skip this question entirely when the overlay sets no `verify_url`** — there is nothing to drive, so the session is checklist-only and says so once.

```
Verify each cycle against the running app? (Enter = no)
  1. other -> free text
  2. no - validate with the overlay's builder gates only   <- default (fast loop)
  3. yes - drive the real UI at <verify_url> and observe the DOM before reporting done
```

`yes` enables **verified mode** for the whole session (see Phase 4.5). It assumes — or boots once at Phase 0 (step 0f) — a worktree-local instance per the overlay's `## Verified mode`. The cost is a running instance plus, for compiled-language cycles, a rebuild; the payoff is that no cycle is reported "done" on a clean compile alone: **never mark a UI change done on a typecheck/compile pass alone; drive the scenario and observe real DOM.** `no` keeps the fast loop and instead emits a concrete manual-verify checklist in the Phase 5 report for any behavior-changing cycle. Verified mode can be toggled mid-session from the deviation lane (`verify on` / `verify off`).

---

## Constants

- **Codebase reference files** (always loaded, all from the overlay — skip any that is absent):
  - the overlay itself, `.claude/friend/config.md`: `## Areas`, `## Gates`, `## Repo law`, `## Codegen`, `## Docs`, `## Direction taste`.
  - `context_taxonomy` — the repo's own feature/context map, when it declares one. The natural area taxonomy.
  - the authoritative rules file the overlay's `## Repo law` points at (`CLAUDE.md` / `AGENTS.md` / equivalent).
- **Active-runs ledger**: `active_runs_ledger` — register at Phase 0, deregister at Phase 6. Absent: skip both, and read `git status` / `git worktree list` for collision signal instead.
- **Vault root** (resolved at Phase 0): the first existing `vault` candidate, else `<repo>/.friend/`. The vault is where `/friend` accumulates cross-session learning so feature selection improves over time. Mirror of the `/explorer` pattern, scoped to development-flavored directions instead of paper cuts. Paths below are relative to `$VAULT/<vault_subdir>/` unless written otherwise.
  - `Friend/sessions/` — one note per session, the canonical artifact (mirrors `Explorer/sweeps/`)
  - `Friend/coverage.md` — heatmap of last `/friend` visit per area + acceptance density
  - `Friend/passes.md` — **rejected direction fingerprints per area**; Phase 2 reads this and avoids re-proposing. Hard rejects only (user typed "no", refresh, or "other" with reason); soft skips (user picked a different option this cycle) do NOT land here.
  - `Patterns/friend-preferences.md` — distilled rules promoted from `Lessons/` after **3+ observations**. Loaded by Phase 1; biases Phase 2 proposal shapes.
  - `Lessons/{date}-friend.md` — append-only per-session self-reflection. Shared folder with `/explorer` and `/research`; do NOT create the folder if missing — it lives at `$VAULT/Lessons/`.
  - `Architect/strong-patterns.md` (if present) — canonical shapes the codebase already does well. Phase 2 should **prefer the shape of an existing strong pattern** when proposing directions; reference it in the direction body.
- **Direction shape** — every proposed direction must:
  - Add or polish **user-visible product surface** (a new control, a clearer flow, a missing affordance, a new capability, an interaction that makes an existing feature feel more finished).
  - **Name the concrete files it would touch and the user-visible outcome.** "Polish X", "improve the Y experience", "make Z nicer" without named files and a stated outcome are banned menu items — if you can't name the files, you haven't scanned enough to propose it.
  - **Match learned taste** (from `/perfect` and `/friend` vault memory): outcome-value directions — a user can do or see something they couldn't before — yes; cosmetic churn with no new capability (dark-mode remount tweaks, restyling that changes nothing behavioral) — no.
  - Ship as **one or more atomic commits** — each individually compiling and lint-clean. A small self-contained polish is one commit; a complete vertical slice (schema → IPC → UI → polish) is a short ordered sequence of atomic commits delivered in the **same cycle** (see Phase 2 "two shapes for ambitious work" and Phase 4). The invariant is per-commit atomicity and never carrying a >30-min uncommitted blob (the overlay's parallel-safety rules) — NOT one-commit-per-cycle.
  - NOT be pure cleanup, dead-code removal, test-only changes, dependency bumps, or refactors without user-visible payoff. Those belong to `/explorer` / `/architect`.

---

## Phase 0: Setup (vault, ledger, worktree)

### 0a — Read the overlay, resolve the vault

Read `.claude/friend/config.md`. Every key it omits takes the default in `## Project overlay`; when the file is absent, say `overlay: defaults` once in the first cycle header and continue — the loop never blocks on it.

Then `VAULT` = the first `vault` candidate that exists on disk, else `<repo>/.friend/` (created on demand; git-ignore it when a parallel session shares the branch). A vault is optional for `/friend` — degrade gracefully and never invent one outside the repo.

Bootstrap the Friend vault tree (idempotent — only create what's missing):

- `$VAULT/Friend/` (directory)
- `$VAULT/Friend/sessions/` (directory)
- `$VAULT/Friend/coverage.md` — header only:
  ```markdown
  # Friend Coverage

  Heatmap of areas visited by `/friend`. Used by Phase 0 auto-pick to favor stale, high-yield areas.

  ## Areas
  ```
- `$VAULT/Friend/passes.md` — header only:
  ```markdown
  # Friend Passes

  Per-area record of directions that were proposed and **hard-rejected** in past sessions.
  Future Phase 2 proposals over the same area filter against these. Soft skips (user picked
  a different option) are NOT recorded here - only hard rejects (explicit "no", refresh of
  the whole menu with a reason, or "other" with a rejection note).

  ## Areas
  ```
- `$VAULT/Patterns/friend-preferences.md` — header only (create `$VAULT/Patterns/` if missing):
  ```markdown
  # Friend Preferences (distilled from /friend sessions)

  > Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1; biases Phase 2.

  _No patterns yet. Will be populated as sessions accumulate._
  ```

Do NOT create `$VAULT/Lessons/` if it's missing — that folder is shared with `/explorer` and `/research` and they handle bootstrap. If it doesn't exist, `/friend` writes its lesson note alongside the others when one of those skills first creates it; until then, the Phase 6 lesson write is a no-op (log it to the session note instead).

### 0b — Read the active-runs ledger

If the overlay sets `active_runs_ledger`, read it and scan `## Active` for entries whose declared `Paths:` overlap the resolved area's paths (Phase 0e) AND are `started`-status AND less than 2 hours old. With no ledger, take the same signal from `git worktree list` and `git status`.

If overlap is found, present:

```
Heads up - another session is editing this area:
  <name> (started <hh:mm>, paths: <paths>)

What now? (Enter = proceed in worktree - physical isolation)
  1. other -> free text
  2. proceed in worktree   <- default (recommended; worktree avoids collision)
  3. switch area
  4. abort
```

Default proceeds because `/friend` always runs in a worktree, so coexistence is safe; the prompt is informational so the user knows their commits land on a separate branch from the other session.

### 0c — Create the worktree

Compute a short slug: `friend-<area>-<HHMMSS>`. For example: `friend-agents-143012`.

```bash
SLUG="friend-<area>-$(date +%H%M%S)"
git worktree add "<worktree_dir>/$SLUG" -b "worktree-$SLUG"
cd "<worktree_dir>/$SLUG"
```

The entire loop runs inside the worktree. Branch name = `worktree-<slug>`. On clean exit (Phase 6), the worktree and branch are left in place — the user owns the merge decision.

### 0d — Append to active-runs ledger

Skip this step when the overlay sets no `active_runs_ledger`. Otherwise append to its `## Active` section in the **main checkout's** copy (not the worktree's — they share the same file via git's worktree semantics, so the Edit lands in the same place):

```
### friend - <area>
- Started: <YYYY-MM-DD HH:MM>
- Status: started
- Branch: worktree-friend-<area>-<HHMMSS>
- Worktree: <worktree_dir>/friend-<area>-<HHMMSS>/
- Paths: <the area's paths, from the overlay's `## Areas` row>
- Note: /friend endless development loop
```

### 0e — Area → path mapping

For the ledger entry and for scoping the scan, resolve the area to paths from the overlay's `## Areas` table: each row gives `name -> paths -> entry points`, and the paths are the scan scope and the collision surface. With no overlay, derive the mapping from the repo's top-level source directories and say the mapping was derived.

For free-text areas (Q1 option 1), use the same resolver as `/explorer` to map a hint → context → primary paths.

### 0f — Boot the verified-mode instance (only if Q2b = yes)

If the user enabled verified mode, start **one** worktree-local instance for the whole session (not per cycle), with the boot command the overlay's `## Verified mode` names, run from inside the worktree.

- Probe `verify_url` for readiness before the first verification. If the port is already held by another instance, surface it — that instance won't have this worktree's code, so offer to (a) reuse it read-only for verification only, (b) pick a different port if the boot command supports one, or (c) downgrade to checklist-only.
- Hot-reloaded cycles are picked up live — no restart. Cycles that touch a compiled layer need the instance rebuilt; budget for it or batch those changes within a slice.
- Drive the UI with the driver primitive the overlay names, and avoid any driver path it flags as lossy. Add the test ids you intend to assert on while writing the UI in Phase 4.
- If the instance can't be booted, tell the user once and downgrade the session to checklist-only verification rather than blocking the loop.

---

## Phase 1: Load memory + scan

### 1a — Read learning artifacts (once per session, not per cycle)

If `$VAULT` is set, read in parallel and hold in session context for the rest of the loop:

1. `context_taxonomy` — area taxonomy (skip when unset).
2. the overlay's `## Repo law` and the authoritative rules file it points at — conventions, string rules, wrappers, parallel-safety.
3. the overlay's `## Gates`, `## Codegen` and `## Docs` — what a cycle owes before it can commit.
4. `$VAULT/Patterns/friend-preferences.md` — distilled rules from prior sessions. Treat each rule as a Phase 2 constraint (e.g. "user prefers polish on hover/focus states over modal-style overlays" → bias proposals accordingly).
5. `$VAULT/Friend/passes.md` — the area's section, if present. Each line is a rejected-direction fingerprint. Phase 2 must filter against these.
6. `$VAULT/Friend/coverage.md` — last-visit date and acceptance density per area. Used by Phase 0 auto-pick; also surfaces here for the scan summary.
7. `$VAULT/Architect/strong-patterns.md` (if present) — canonical shapes. Prefer these when proposing.
8. The 3 most recent files in `$VAULT/Lessons/` matching `*-friend.md` (sorted descending) — recent self-reflection, e.g. "last session over-proposed modal-driven flows."

Skip any artifact that doesn't exist; never block on missing vault state.

### 1b — Scan the area (every session, lightweight)

Inside the worktree, do a **lightweight** scan to ground the proposals. Read budget: roughly **20–40 files**, weighted toward UI components and the most-recently-edited paths in the area. Do not exhaustively read everything — `/friend` is a fast loop.

Pull in parallel:

1. `git log --oneline --since="14 days ago" -- <area-paths>` — what's been moving here lately
2. `git diff --stat HEAD~10..HEAD -- <area-paths>` — recent volume by file
3. A `Grep` for `TODO|FIXME|XXX` scoped to the area
4. A `Grep` for the repo's string-lookup call (from `## Repo law`) to spot text-heavy components (potential UX surfaces)
5. The area's description in `context_taxonomy`, or its `## Areas` row's entry points
6. 5–10 most-recently-modified files in the area (Glob with sorted-by-mtime)

For the `surprise me` goal, also pull two random non-trivial files from the area to seed something less obvious.

Synthesize a **two-sentence area summary** for the user (skip in `surprise me` mode):

```
<Area>: <one sentence on what's here>. <one sentence on what's been moving lately>.
```

---

## Phase 2: Propose 5 directions

Produce **exactly 5** development directions. Each direction is:

```
N. <short title - verb-led, 3-6 words>
   What:  <one line, <=90 chars - concrete UX/product change>
   Why:   <one line, <=90 chars - the user-visible outcome once it lands>
   Files: <the actual files to touch - component, backend module, string catalogue, ...>
```

A direction with no named files or no stated outcome is malformed — rework it or drop it before presenting.

Constraints on the 5:

- **Always development, always outcome-value.** UX polish with behavioral payoff, missing affordances, small new capabilities, clearer flows, new product surfaces. If a candidate is "remove dead code", "extract a hook", "add tests", "bump a dep", or cosmetic-only restyling, drop it.
- **Default mix:** `1 small polish (<1h) / 2 medium feature adds (1–3h) / 2 stretch (a complete vertical slice, ~2–5 atomic commits in one cycle)`. One of the five slots may instead be a **graduation candidate** (see "Graduation lane"). `surprise me` mode drops the small and adds a second stretch. If a session signals "dial down to polish" (user picks the small repeatedly, or says "smaller next time"), shift to `2 small / 2 medium / 1 stretch` for the rest of that session. **Do not hand back a half-feature to keep a cycle short:** if the honest unit of value is a vertical slice, propose the whole slice and deliver it as a commit sequence — but if the honest unit is bigger than one cycle in one area, that's a graduation candidate, not a stretch.
- **Prefer deepening existing surfaces over net-new surfaces** in an established feature area. If the area already has obvious adjacent polish (a control that needs a sibling, a flow that needs a recap card, a panel that needs a sub-view of its own data), build on what exists. Net-new surfaces (a new tab, a new sidebar rail, a new page-level panel) should be at most **1 of the 5**. The remaining 4 slots are for direct extensions of code already in the area. Reason: net-new surface ideas read well as menu items but rarely match the user's actual want when they're already iterating on a feature.
- **Two shapes for ambitious work — pick the honest one:**
  - **Vertical slice (default for self-contained features):** the whole feature lands *this cycle* as a sequence of atomic commits (e.g. `feat(db): add view` → `feat(ipc): expose command` → `feat(ui): tab + chart` → `polish: empty/loading states`). Each commit compiles and lints clean; the cycle is "done" only when the slice is whole and — in verified mode — observed working. This is the primary way `/friend` now tackles real product work; reach for it freely.
  - **Stages-of-N (only when a gate between stages helps the user):** reserve this for work that is genuinely sequential *and* worth a human checkpoint mid-way — e.g. a risky schema migration the user wants to eyeball before the UI builds on it. Mark it `Stage 1 of N — ships <X>; next stage wires <Y>.` If the arc would span days or multiple contexts, don't stage it — graduate it to `/perfect`.
- **Each commit is atomic; a cycle may be several.** Every commit individually compiles and lints clean and represents one logical step. A polish cycle is one commit; a vertical-slice cycle is a short ordered sequence. Never carry more than ~30 minutes of uncommitted work between commits. The old "one commit per cycle" rule is retired — it was a proxy for "don't bite off more than you can finish," which the model now handles directly.
- **Honor `## Repo law`.** Every direction must be implementable without violating the repo's string / design-token / call-wrapper / error-handling / max-lines / parallel-safety rules.
- **No repeats.** Track proposed-and-completed direction titles within the session; do not re-propose. Track proposed-and-rejected titles within the session too — only re-propose if the user explicitly says "you can re-propose."
- **Drop in-session 2× soft-skips.** Maintain a set of direction titles the user has soft-skipped (i.e. picked something else when this was on the menu) in the current session. If a title hits the set twice and is still unpicked, **stop re-proposing it for the rest of the session**. The same direction can return in a future session (it's not a hard reject), but burning a 5-slot menu position on something the user has already passed on twice is noise. Net-new-surface ideas in particular tend to keep getting re-proposed because they're easy to generate — this rule is the in-session brake.
- **Filter against `Friend/passes.md`.** Any candidate whose fingerprint (area + short title + one-line What) closely matches a past hard-reject in this area is silently dropped before presentation. If it's a *near*-match (same target file, different angle), surface it but annotate `↻ previously passed; resurfacing because <reason>`.
- **Honor `Patterns/friend-preferences.md`.** Distilled rules (e.g. "prefer inline editing over modal overlays in this codebase") are hard constraints, not suggestions. If a candidate violates a preference, drop it.
- **Honor `Architect/strong-patterns.md`.** When the area has a canonical shape (e.g. "execution panels use the SidePanel primitive, not Dialog"), propose directions that reuse the canonical shape; reference the pattern by name in the direction body.

### Graduation lane (handoff to /perfect)

Multi-cycle themed arcs, multi-context builds, and anything wanting review gates belong to `/perfect` — its Director/Builder loop, acceptance pool, and per-context worktrees exist exactly for that. `/friend` does not run campaigns. Instead, when the scan surfaces a genuinely valuable idea that is **too big for one cycle in one area** (multi-context scope, schema break rippling across features, days-long arc, needs a human review gate), one menu slot may present it as a graduation candidate:

```
N. <idea title> - graduate to /perfect
   What:  <one line - the compounded payoff if the full build lands>
   Why big: <one line - multi-context / schema break / needs review gates>
```

If the user picks it: do **not** execute. Record the idea (title, what, why-big, files/contexts it spans) in this session's vault note under `## Graduated to /perfect`, tell the user to run `/perfect propose` to feed it into the acceptance pool, then return to the `Next?` menu for a normal direction. Propose a graduation candidate **only** when something real rises to that bar — never pad the slot; fill it with a medium/stretch otherwise.

Present:

```
Area: <area>  Worktree: <slug>  Cycle: <n>

<scan summary, omit in surprise-me>

Next? (pick a number - Enter = 2)
  1. other -> describe a direction in free text
  2. <Direction A title>                    <- default
  3. <Direction B title>
  4. <Direction C title>
  5. <Direction D title>
  6. <Direction E title>
  7. refresh - rescan and propose 5 new directions
```

For cycles 2+ in the same session, replace the scan summary with a one-line delta: `Since last cycle: <last commit title>, <files touched>`.

If the user types a stop word (`stop`, `done`, `bye`, `quit`, `exit`) in the free-text lane, jump to Phase 6.

---

## Phase 3: Risk gate

Before executing the chosen direction, you (the model) **silently judge** whether the path is materially risky. There is no hardcoded checklist — use judgment. Things that should trip the gate include but are not limited to:

- Changes to database schema, migrations, or table shape
- Renaming or removing a public command, an IPC/API contract, or a generated binding
- Touching credential storage, keyring backends, or encrypted fields
- Cross-area scope creep (the direction reads like one area but actually touches many)
- Deleting >50 lines of any single file, or removing a component / module
- Anything that would change behavior of a currently-active scheduler / runner / cron path
- Anything that affects production-only code paths the user cannot easily verify locally
- Anything that would invalidate the lint or typecheck baseline beyond the file being touched

If the gate trips, pause and ask before acting:

```
Heads up: <one sentence on why this is risky, in plain language>.
<one sentence on the alternative shape if relevant>.

Proceed? (Enter = yes)
  1. other -> describe an alternative
  2. yes
  3. narrower scope - describe the smaller version
  4. skip - pick a different direction
```

If the gate does **not** trip, execute immediately without asking. Do not ask for confirmation on routine UX/feature work — that is the entire point of the loop.

---

## Phase 4: Execute

Implement the chosen direction inside the worktree. **The overlay's `## Repo law` is binding** — read it as a checklist, not as background. The shapes it typically pins, and what to do when it pins none:

- **Reuse before building** — the single largest source of UI drift. Before writing any surface, read the repo's reusable-component catalogue (from `## Repo law`) and import the existing spinner / empty-state / modal / button / tooltip / toggle rather than hand-rolling it. A genuinely new reusable pattern goes into the shared location the catalogue documents, never into a feature folder. No catalogue declared: grep the shared directory for a component with the same job before writing one.
- **User-visible strings** — every new string goes through the repo's string catalogue and lookup call; never hardcode text, placeholder, title or label. When the repo ships more than one locale (`locale_count > 1`), a cycle that adds keys fills every locale in the **same commit** — hand-editing N files is the wrong tool, use the repo's extract/merge pipeline from `## Codegen` and parallelize the fill one subagent per locale, preserving placeholders and brand terms. For a tiny (<=5 key) polish cycle, inline edits per locale file are fine.
- **Design tokens and call wrappers** — use the token scales and the call/error wrappers `## Repo law` names, never their raw equivalents, and never an empty catch. Machine tokens from the backend are displayed through the repo's label helper, not string-cased in the view.
- **Generated artifacts** — when a change trips a trigger in `## Codegen` (a derived binding, a command registry, a component catalogue, a locale merge), run that command from the worktree and commit its output in the **same commit** as the change that obliged it. A generated tree is never hand-edited.
- **Schema and data** — additive only on `/friend` cycles; anything destructive trips the Phase 3 gate.
- **Docs** — when the direction is user-visible and the overlay's `## Docs` maps the area to a doc file, update it in the **same commit**. Assume a hook will catch it otherwise.

### Self-review (before validation)

Now that cycles run longer, spend one deliberate adversarial pass on the diff before validating — you are the only reviewer this code gets before it lands. Read your own `git diff` and check:

- **Correctness:** edge cases, null/empty/error states, off-by-one, races, stale closures, missing `await`. Would this break if the list were empty or the request failed?
- **Reuse & drift:** did you re-implement something the component catalogue already has? A raw utility class where a design token belongs? A raw call where the repo's wrapper belongs? An empty catch?
- **Strings:** any hardcoded user-visible text / placeholder / title / label that escaped extraction, and every locale filled?
- **Scope:** does the diff touch only files this direction needed? Anything accidental swept in?

For a small polish cycle, do this inline. For a vertical-slice cycle (multi-file, multi-commit), spawn a `general-purpose` review subagent on the staged diff (or run `/code-review`) and fix what it surfaces before committing — cheap insurance against a plausible-but-wrong change shipping. Fix findings in the worktree, then validate.

### Validation (before the commit)

Run the overlay's `## Gates` `builder:` list, scoped to what was touched — each entry names its command and the condition that selects it (a typecheck when typed sources changed, a lint, a compile check when a compiled layer changed, the string-catalogue check when keys moved). With no overlay, detect the equivalents from the build manifest and say what was detected.

Two standing rules on top of whatever the list says:

- **Lint verdicts are read against the baseline** — a repo mid-migration carries warnings; fail on new errors and on anything on the lines you just wrote, never on the pre-existing floor.
- **Tests are skipped by default** — `/friend` is fast cycles. Run the narrowest test command only when the direction added or changed test files.

If a check fails: fix inline in the worktree, re-validate, then commit. Do **not** stack failing work into the next cycle.

### Commit

**One commit per logical step.** A polish cycle is a single commit; a vertical-slice cycle is an ordered sequence — commit each step as soon as it compiles and lints clean, never batch the whole slice into one mega-commit. Message shape per commit:

```
<type>(<scope>): <imperative title for this step>

<2-4 sentences: what changed, why user-visible. No bullet lists.>

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
```

`<type>` from the overlay's `commit_types` (default `feat`, `polish`); a repo whose commit-message hook enforces a closed set declares it there. `/friend` rarely produces `fix` / `refactor` / `chore` — if you find yourself reaching for those types, the direction was probably stabilization and should have been rejected at Phase 2.

Stage only the files you intentionally touched (`git add <path>` per file, never `git add -A` / `git add .` / `git add -u`). Before **each** commit, verify the staged count matches: `git diff --cached --stat`. If the staged-file count exceeds what you wrote, run `git restore --staged <unrelated-file>` per file before committing. This is the parallel-safety discipline the overlay's `## Repo law` carries, and it matters more across a multi-commit slice — re-check the index before every commit in the sequence, since a parallel session may have pre-staged files between your commits.

After each commit: `git rev-parse --short HEAD` to capture the SHA. Collect the range (`<first-sha>..<last-sha>`) for the report.

---

## Phase 4.5: Verify (verified mode only)

Skip this phase entirely if the session is not in verified mode (Q2b = no) — the Phase 5 report carries a manual-verify checklist instead (see below).

In verified mode, after the cycle's commits land, **prove the change works before reporting it done** — a clean compile is not evidence of behavior:

1. Ensure the worktree-local instance (Phase 0f) is up and has the change — hot-reloaded layers arrive by themselves; compiled layers need a rebuild first.
2. Drive the actual scenario the direction claims to deliver, using the overlay's driver primitive against `verify_url`. Assert on real DOM: the new control renders, the flow advances, the empty/error states appear when forced.
3. If the observed behavior contradicts the claim, the cycle is **not done** — fix in the worktree, add a follow-up atomic commit, and re-verify. Never report a red scenario as green.
4. Record what you drove and saw for the Phase 5 report (`Verified: <scenario> → <observed>`).

If the instance is unavailable this cycle, downgrade *this cycle* to the manual-verify checklist (don't silently claim done) and note the downgrade in the report.

**Manual-verify checklist (non-verified sessions, behavior-changing cycles):** the report must end with a short, concrete `To verify:` list — the exact clicks/inputs and the expected result — so the user (or a later verified cycle) can confirm the change by hand. A cycle that changed user-visible behavior is never reported as flatly "done" without either an observed verification or this checklist.

---

## Phase 5: Report + propose next 5

Print the report:

```
OK <direction title>  (cycle <n>)
  Commits: <first-sha>..<last-sha>  (<count>)  -  Files: <N>  -  +<a>/-<b>
  Did:  <one sentence - what changed, behavior-first>
  Checks: <one <gate> <OK|-> pair per builder gate that applied>
  Verified: <scenario -> observed | manual checklist below | - no behavior change>
  Worktree: <worktree_dir>/<slug>/   Branch: worktree-<slug>

<non-verified + behavior changed only:>
  To verify: <exact clicks/inputs -> expected result>

Since last cycle: <previous direction or "first cycle">

Next? (Enter = 2)
  1. other -> describe a direction
  2. <new Direction A>                    <- default
  3. <new Direction B>
  4. <new Direction C>
  5. <new Direction D>
  6. <new Direction E>
  7. refresh - rescan area and propose fresh
```

The 5 new directions follow the same constraints as Phase 2:
- Always development; no stabilization.
- Spread across the calibrated mix (small / medium / stretch, optional graduation slot — see Phase 2). Every direction names its files and outcome.
- Do not re-propose anything already executed or rejected this session.
- May build on the just-completed cycle (e.g. if cycle N landed a new control, cycle N+1 could propose a polish on it) but should not require it — the user should be able to pick any of the 5 independently.

Loop back to **Phase 3** with the chosen direction (a picked graduation candidate is recorded, not executed — see Graduation lane). The loop has no built-in stopping condition.

---

## Phase 6: Clean exit + learn

Triggered by: user typing a stop word in the free-text lane, an explicit interrupt, or the context window forcing a wrap. This is also where `/friend` gets smarter — every session must close the learning loop, not just save work.

### 6a — Stabilize the worktree

1. **If anything uncommitted:** decide whether to commit. If the last cycle was interrupted mid-execute, prefer to discard the partial change (`git restore .`) rather than commit broken work; surface this decision to the user with a numbered confirm if they are still responsive.
2. **Update the active-runs ledger** in the main checkout (skip when the overlay declares none): move your `## Active` entry to the top of `## Recently completed`. Status: `completed (branch: worktree-<slug>, commits: <count>, last: <sha>)`. Keep the entry under 6 lines.

### 6b — Capture rejection reasons (one batched question)

Before writing the learning artifacts, ask the user a single batched question to attribute *why* the unpicked directions were unpicked. This is what makes `passes.md` and the preferences file actually useful — the title alone isn't enough signal.

```
For the directions you didn't pick this session, was it:
  [from cycle N] {title}
  [from cycle M] {title}
  ...

Reply per-item ("N: too risky, M: wrong layer") or one overall reason.

Shortcuts:
  skip    - record "no reason given" (still a soft skip, not a hard reject)
  hard <ids>  - mark these as hard rejects in passes.md (e.g. "hard N,M")
  Enter   - same as "skip"   <- default
```

Distinguish:
- **Soft skip** (default for unpicked) — could be re-proposed in a future session; does NOT land in `passes.md`. Recorded in the session note only.
- **Hard reject** (user typed `hard <ids>` or gave a reason that reads as principled refusal, e.g. "wrong direction", "we already tried this", "doesn't fit the product") — lands in `passes.md` so future sessions skip it.

### 6c — Write the session note

`$VAULT/Friend/sessions/{YYYY-MM-DD}-{slug}.md`:

```markdown
# Friend session: {area} - {YYYY-MM-DD HH:MM}

Worktree: `{worktree_dir}/{slug}/`
Branch: `worktree-{slug}`
Cycles: {N}
Commits: {first-sha}..{last-sha}

## Cycles

### Cycle 1 - OK {title} ({sha})
- What: {one line}
- Files: {N}, +{a}/-{b}
- Other proposed (soft-skipped): {titles}

### Cycle 2 - OK {title} ({sha})
- ...

## Hard rejects this session

- [{area}] {title} - {reason} (-> added to passes.md)

## Graduated to /perfect

- {title} - {what} - why big: {multi-context / schema / review-gate reason} - spans: {files/contexts}
  (user directed to `/perfect propose`; omit section if nothing graduated)

## Cross-references

- Related preferences: [[Patterns/friend-preferences]]
- Strong patterns referenced: [[Architect/strong-patterns]] §{pattern-name}
```

### 6d — Append to Lessons (shared folder)

If `$VAULT/Lessons/` exists, write/append `$VAULT/Lessons/{YYYY-MM-DD}-friend.md`:

```markdown
## Session: {timestamp} - {area} ({N} cycles)

Accepted: [list of titles]
Hard-rejected: [list with reasons]
Soft-skipped: [list]

### Self-reflection
- Direction shapes that resonated: {pattern observed}
- Direction shapes that didn't: {pattern observed}
- Calibration drift: {e.g. "proposed 4 modal-driven flows out of 15; only 1 picked - over-weighting modals in agents area"}
- Tools/files I should have read earlier: {observation}
- Strong patterns I should reuse more: {observation}
```

If `$VAULT/Lessons/` does not exist, embed this block at the bottom of the session note instead (do not create the shared folder unilaterally).

### 6e — Update `passes.md`

For each direction marked hard-reject in 6b, append a fingerprint to `$VAULT/Friend/passes.md` under the area's section (create the section if missing):

```markdown
## {area}

- {short-title} - {one-line What from the proposal} - pass {date}, session {slug}, reason: {short reason}
```

Keep entries short. The fingerprint is what Phase 2 filters against next session.

### 6f — Update `coverage.md`

Update or insert the row for this area in `$VAULT/Friend/coverage.md`:

```markdown
## Areas

### {area-slug}

- Last visited: {date}
- Last session: [[Friend/sessions/{date}-{slug}]]
- Cycles last 3 sessions: [3, 5, 2]
- Acceptance density last 3 sessions: [3/8, 5/15, 2/6]   <!-- picked/proposed -->
- Notes: {anything noteworthy across sessions}
```

### 6g — Pattern promotion check

Read all `$VAULT/Lessons/*-friend.md` (cap at the last 20 files for speed). If any single observation — accepted shape or rejected shape — has appeared in **3+ sessions** with close-synonym phrasing, propose adding it to `$VAULT/Patterns/friend-preferences.md`:

```
I've seen this 3+ times across sessions - promote to a permanent preference?

  "{distilled rule, e.g.: prefer inline editing affordances over modal dialogs in agents/}"

Source sessions: [[2026-05-01-friend-agents]], [[2026-05-06-friend-agents]], [[2026-05-12-friend-agents]]

Next? (Enter = 1)
  1. promote to Patterns/friend-preferences.md   <- default
  2. snooze - re-ask after 3 more observations
  3. drop - don't promote, reset the counter
```

If the user picks 1 (or Enter), append to `Patterns/friend-preferences.md` with the rule + the source-session backlinks. This is the slow loop that makes Phase 2 better over weeks of use.

### 6h — Print the exit summary

**Do NOT auto-merge to the base branch.** Do NOT delete the worktree or branch. The user owns the merge decision. Print:

```
Session done.
  Branch:    worktree-{slug}
  Worktree:  {worktree_dir}/{slug}/
  Commits:   {count}  ({first-sha}..{last-sha})
  Area:      {area}
  Acceptance: {picked}/{proposed}  ({pct}%)

To merge: from the main checkout,
  git merge --no-ff worktree-{slug}
To inspect first:
  git log --oneline worktree-{slug} ^{base_branch}
  git diff {base_branch}...worktree-{slug}
To discard:
  git worktree remove {worktree_dir}/{slug} && git branch -D worktree-{slug}

Files updated:
  + {VAULT}/{vault_subdir}/sessions/{date}-{slug}.md
  + {VAULT}/Lessons/{date}-friend.md              (if Lessons/ exists)
  ~ {VAULT}/{vault_subdir}/coverage.md
  ~ {VAULT}/{vault_subdir}/passes.md              (if any hard rejects)
  ~ {VAULT}/Patterns/friend-preferences.md        (if pattern promoted)
  ~ {active_runs_ledger}                          (entry moved to completed; omit if none)
```

---

## Learning artifacts (how the loop gets smarter)

The vault holds three artifacts that turn `/friend` from a stateless proposer into a sharpening tool over time. Mirror of `/explorer`'s machinery, scoped to development directions:

| File | Lifecycle | What it does |
| --- | --- | --- |
| `Friend/passes.md` | Append on hard-reject (Phase 6e). Read in Phase 1 / used in Phase 2 filter. | Stops `/friend` from re-proposing directions the user already principled-refused. Title-level fingerprint per area. |
| `Patterns/friend-preferences.md` | Append after 3+ observations (Phase 6g). Read in Phase 1 / hard constraint in Phase 2. | Distilled rules ("prefer X over Y in this codebase"). Slow loop; one promotion per session at most. |
| `Lessons/{date}-friend.md` | Append every session (Phase 6d). Last 3 read in Phase 1. | Per-session self-reflection. Source signal for the promotion check. |

`Friend/coverage.md` is the fourth artifact — last-visit dates and acceptance density per area. Powers the Q1 auto-pick weighting. Updated at Phase 6f.

Never block on any of these being missing — degrade gracefully. The first 2–3 sessions over a new area will run with no learned signal, and that's fine; the artifacts populate themselves.

### Pacing expectations (so users don't read "smarter over time" as "smarter on cycle 2")

The vault learning loop is real but **slow on purpose**. Concretely:

- **Session 1 over a new area:** zero patterns loaded, zero passes. Phase 2 proposals are pure scan-driven. The session writes its first Lesson entry. Expect this to feel like a stateless skill.
- **Sessions 2–3:** the in-session sticky-drop and any soft-skip filtering still come from current-session memory; cross-session signal only kicks in via the Lesson notes the model reads at Phase 1, which influence proposal *shape* but rarely cause hard filtering yet.
- **Session 3–4** is typically the first time the pattern-promotion check at Phase 6g triggers — 3+ observations of a close-synonym phrasing across Lesson notes promotes a rule to `Patterns/friend-preferences.md`, which becomes a *hard constraint* in Phase 2 from then on.
- **Session 5+:** the area starts feeling like it has a personality. Promoted preferences filter out shapes the user has rejected before; coverage scoring routes auto-pick to fresher areas; passes.md keeps the same bad idea from resurfacing.

If the user expects "/friend will adapt to my taste by cycle 2," they'll be disappointed. The right mental model: **the skill is sharpening, not adapting on every turn.** Surface this expectation in the Phase 6 exit summary on early sessions ("first pattern promotion typically happens around session 3–4 as observations accumulate") so the slow-loop design doesn't read as a missing feature.

---

## Non-goals (do not do these)

- **No stabilization.** If a direction reduces to lint cleanup, dead-code removal, type tightening, or test addition without behavior change, drop it from the Phase 2 menu. Suggest the user run `/explorer` for that area.
- **No non-atomic commits.** A cycle may now span several commits (a vertical slice), but every *individual* commit must compile and lint clean and represent one logical step — never commit broken intermediate state, and never let an uncommitted slice grow past ~30 minutes. If a step can't be made atomic, it isn't ready to commit.
- **No cross-area scope creep.** If executing a chosen direction reveals it needs to touch files outside the area, Phase 3's risk gate should trip and ask the user — often the right answer is graduating it to `/perfect`.
- **No orchestration.** No builder subagent fleets, no multi-cycle autonomous arcs, no acceptance pools — that machinery is `/perfect`'s. `/friend` executes exactly one picked direction per cycle, in-session.
- **No auto-merge.** The worktree and branch are left for the user to inspect and merge on their own time.
- **No silent stash.** Never `git stash` to clean the tree. Use `git add <path>` per file in Phase 4 and verify the staged count.
- **No `--no-verify` / `--no-gpg-sign`.** If a hook fails on commit, fix the underlying issue.
- **No memory writes** about routine cycles. Only write a `feedback_*` memory if the user gives explicit guidance during a `/friend` session that would generalize across future sessions.

---

## Quick reference (one-screen)

```
/friend
  Q1:  Area? (1=other, 2..N=overlay area, N+1=pick for me)  <- Enter = last
  Q2:  Goal? (1=other, 2=scan-and-propose, 3=surprise)    <- Enter = 2
  Q2b: Verified loop? (2=no, 3=yes)                       <- Enter = 2 (no; skipped with no verify_url)
  ->  Phase 0  overlay + vault + learning files + ledger + worktree (+ boot the app if verified)
  ->  Phase 1  load passes + preferences + recent lessons, then scan area
  ->  Phase 2  propose 5 dev directions (each names files + outcome)
              mix: 1 small / 2 medium / 2 stretch  (one slot may be a /perfect graduation)
LOOP:
  ->  Phase 3   silent risk gate; ask only if risky
  ->  Phase 4   execute slice -> self-review -> validate -> atomic commit(s)
  ->  Phase 4.5 verified mode: drive verify_url, observe DOM (else manual-verify checklist)
  ->  Phase 5   report + propose 5 new directions  ─┐
                                                   │ user picks number -> Phase 3
                            (graduation pick -> record in vault, point at /perfect)
EXIT (stop word / interrupt / context wrap):
  ->  Phase 6  capture rejections -> session note -> Lessons -> passes -> coverage
              -> pattern-promotion check -> ledger -> exit summary
              (worktree + branch left intact for user merge)
```

## App context coverage (host-app-managed repos)

This skill declares `contexts: tracked` — a host app that manages the repo can measure per-context memory coverage for it. **Skip this section silently when the overlay sets no `context_outbox`.** When it does, before finishing append JSON lines to that file (append, never rewrite) — one node per context you meaningfully worked on:

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name from the overlay's name source>","skill":"friend"}
```

**Which name — this is the part that silently fails.** The ingest anchors a node
by matching `context` against the names the host app actually knows,
case-insensitively. A name it does not recognize is NOT an error: the node is
stored with a null context and simply never counts toward coverage. Take names
only from the name source the overlay's `## Context sources` declares (falling
back to the `## Areas` table), and never from a map that section marks stale — a
mechanically generated map usually carries names no app knows.

Always set both `"skill":"friend"` and `"context":"<name>"` — together they drive the per-skill context-coverage % (last 30 days). The app ingests and deletes the file when the session ends.

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

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"friend@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/friend/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - friend` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/friend` in a consuming repo is a symlink to `<registry>/skills/friend` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/friend` and `git -C <registry> commit -m "skill(friend): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/friend/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/friend` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
