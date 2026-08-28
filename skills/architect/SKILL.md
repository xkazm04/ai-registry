---
name: architect
description: Heavy structural codebase scan - surfaces weak patterns to upgrade and strong patterns to codify, producing ADR-style decisions with a durable cross-session backlog. The highest-risk / highest-payoff scan in the suite; walks the context map area by area.
argument-hint: "[area]"
category: workflow
memory: vault
contexts: tracked
version: 1.2.0
---
# Architect

Heavy-hitter codebase scan for **structural patterns** — both weak ones to upgrade and strong ones to codify. Designed for rare, deliberate, high-effort sessions where the payoff is a class of bugs eliminated, a tech swap landed, or a convention promoted from "tribal knowledge" to "lint-enforced rule."

This is the highest-risk, highest-payoff skill in the suite. It pairs with `/research` (external sources) and `/explorer` (per-area paper cuts) — those handle the small and the medium; `/architect` handles the large.

The method is **repo-agnostic**: it reads whatever context sources the repo actually has for its taxonomy, and keeps a vault for a durable backlog of architectural decisions that span multiple sessions. Everything one repository is — its vault root, context documents, gates, area menu, conventions — lives in the overlay below, and every key has a default, so the run works in a repo that carries no overlay at all.

**Deliverable contract — every finding ends as an artifact.** An architect run that produces observations without enforcement artifacts is a failed run. Each finding that survives triage must terminate as exactly one of: **(a)** an ADR-style vault note (Phase 7b/8a), **(b)** a lint rule / CI gate / structural-test proposal (Phase 7B), or **(c)** a scoped rollout plan with per-PR steps (the ADR's Rollout section). Only `drop` verdicts are artifact-free, and they are recorded with a reason. If you reach Phase 12 with a surviving finding that has none of the three, the run is not done.

## Project overlay

Everything project-specific lives in ONE overlay the run reads in Phase 0: **`.claude/architect/config.md` in the consuming repo** (tracked, so it travels with the clone and survives the vault, which is not version-controlled). **The scan runs with no overlay at all** — every key below has a default — but say so in the Phase 0 opening line when defaults are in force, and never paste one repo's overlay into this file.

Overlay shape: YAML frontmatter for scalars, markdown `##` sections for lists and prose. Keys (default in brackets):

```yaml
---
product: "<product name>"             # scan-note header  [the repo directory name]
stack: "<one-line stack description>" # sub-agent briefs  [detected from package.json / Cargo.toml / manifest, else "unknown"]
vault: ["<abs obsidian root>", ...]   # candidate roots, first existing wins  [<repo>/.architect]
vault_subdir: Architect               # namespace inside the vault; "" = the root itself  [Architect]
context_map: context-map.json         # machine-readable file->context authority  [context-map.json if present, else none]
coverage_context_source: ""           # which name set the memory outbox anchors to  [the context map's names]
base_branch: master                   # rollouts fork from / land on it  [detected from origin/HEAD, else current]
worktree_root: .claude/worktrees      # where Phase 7a puts its worktree  [.claude/worktrees]
active_runs_ledger: ""                # path of a live-sessions ledger if the repo keeps one  [none; git status only]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Context sources` | the documents Phase 1 reads, in order, each with one line on what it is for (architecture digest, area taxonomy, project rules, design system) | `context-map.json` if present, else `CLAUDE.md` (then `AGENTS.md`); missing sources are **noted, never fatal** |
| `## Area menu` | the numbered options for Q2b and what each maps to | derived from the context map's groups (or the repo's top-level source directories), capped at 8 |
| `## Theme menu` | extra themes beyond the built-in nine | the built-in nine only |
| `## Gates` | `baseline:` (commands Phase 7c snapshots), `step:` (per-commit), `final:` (Phase 7e), `slow:` (run in background) | detect from `package.json` scripts (`check`/`typecheck`, `lint`, `test`) and the toolchain (`cargo check` when `Cargo.toml` exists, `npx tsc --noEmit` when a tsconfig does); say what was detected |
| `## Repo law` | the convention digest pasted verbatim into briefs and enforced in 7g: i18n contract, design tokens, shared-component catalog, error handling, IPC discipline, out-of-scope walls | "read the repo's CLAUDE.md/AGENTS.md first; reuse before building" |
| `## Docs vehicles` | which files a Phase 7B codification may append to, and what belongs in each | the repo's rules file (`CLAUDE.md`/`AGENTS.md`); a second architecture digest if `## Context sources` names one |
| `## Lint vehicle` | how the repo writes a custom lint rule (config file, rule directory, naming, registration, default severity) | read the repo's linter config and follow whatever custom-rule shape is already there; if none exists, propose `docs` instead |
| `## Test guard vehicle` | the test runner and where a structural test lives | the runner in `package.json` scripts (or the toolchain's default), test beside the code it guards |
| `## Smoke` | how to run the app and exercise a surface for Phase 7h | say plainly that the change was NOT visually verified |
| `## Baseline exclusions` | known-noisy migrations that must never become findings | none |

## Interaction conventions

Built for parallel CLI control — every user prompt is single-keystroke answerable.

- **Every prompt is a numbered menu.** Numeric input picks the option; **Enter** triggers the default; option `1. other → …` is the deviation lane (free text).
- **Every phase output (intermediate or final) ends with a `Next?` block** of 2–5 numbered next-step actions. Replying with a digit advances the run without typing prose.
- Multi-finding triages use `<id>=<verdict-number>` syntax (e.g. `1=2 2=1 3=3`); `all=<n>` and `ask` shortcuts are always accepted.
- Long free-text answers are still accepted everywhere; the menu just makes the common case instant.

## Input

Ask numbered-menu questions. Numeric input picks the option; **Enter** picks the default; option `1. other → …` is the deviation lane and accepts free text.

### Q1 — Mode

```
Mode? (Enter = scan)
  1. scan      - pick a theme, parallel-agent sweep        <- default
  2. area      - bound the sweep to one area
  3. resume    - drain the backlog (skip scanning)
```

`resume` skips the rest of Input — jump straight to Phase 9.

### Q2a — Theme (scan mode)

```
Theme? (Enter = pick for me)
  1. other -> describe (free-form theme; angles auto-picked in Phase 3a)
  2. state-management
  3. error-handling
  4. ipc-boundary
  5. data-modeling
  6. testing-strategy
  7. async-patterns
  8. type-safety
  9. build-tooling
  10. pick for me   <- default (uses Architect/coverage.md staleness)
```

Theme is required for scan mode — `pick for me` (option 10) is fine, but a one-word vague free-form theme yields shallow findings; if option 1's input is too thin, re-ask.

### Q2b — Area (area mode)

```
Area? (Enter = pick for me)
  1. other -> type a hint (path fragment, keyword, or context id)
  2. {area 1}
  ...
  9. {area 8}
  10. pick for me   <- default
```

Numeric options 2–9 are the overlay's `## Area menu`; with no overlay, derive up to 8 from the context map's groups (or the repo's top-level source directories) and print what you derived them from. Option 1's free text falls through to the existing area resolver. Scan is bounded to that area but still cross-cutting within it; same parallel-agent shape as scan mode.

If the user's first message is ambiguous about mode (e.g. just `/architect`), present Q1; if they typed `resume` directly, skip to Phase 9.

---

## Constants

- **Codebase reference files** — whatever the overlay's `## Context sources` names, in its order. With no overlay, resolve in this order and use what exists:
  - `context-map.json` (repo root, or the overlay's `context_map`) — machine-readable file→context map; the authority for area scope and target file lists, and the tiebreak when a prose doc and reality disagree.
  - `CLAUDE.md` (then `AGENTS.md`, then `.claude/CLAUDE.md`) — project rules, including any parallel-session/isolation primitives the repo declares.
  - Any architecture digest, area taxonomy or design-system doc the overlay maps in — these are what make scan mode deep rather than generic.
  - A source that is missing is **noted in the opening line, never fatal.** With no context source at all, derive a provisional taxonomy from the repo's top-level source directories and say the scan is running provisional.
- **Vault root** (resolved at Phase 0; `$VAULT/<vault_subdir>/` throughout, written below as `Architect/` for the default subdir):
  - `Architect/scans/` — one note per scan run, the synthesis output
  - `Architect/decisions/` — one ADR per accepted decision (Markdown, ADR-style)
  - `Architect/backlog.md` — durable queue of accepted decisions with status
  - `Architect/strong-patterns.md` — patterns identified as load-bearing, kept for codification
  - `Architect/weak-patterns.md` — anti-patterns identified, with affected files
  - `Architect/coverage.md` — themes/areas previously scanned, staleness, last-decision date
  - `Patterns/architect-preferences.md` — distilled rules across runs (promoted from Lessons)
  - `Lessons/{date}-architect.md` — append-only self-reflection
- **Categories of finding** — `weak-pattern | strong-pattern | tech-swap | structural-bug-class | convention-gap`
- **Risk** — 1 (low, isolated) … 5 (production-critical surface)
- **Effort** — `s | m | l | xl`
- **Reach** — concrete number: "{N} files / {M} call sites / {K} components" — never vague.
- **Payoff** — 1 (incremental) … 5 (eliminates a recurring bug class or unblocks a major future)

---

## Coordination — Active-Runs Ledger

**Only when the overlay names an `active_runs_ledger`.** With no ledger declared, `git status` is the whole coordination surface: note foreign uncommitted work, never sweep it into your commits, and skip the rest of this section.

Before materially editing the working tree (which `/architect` always does in Phase 7 — Execute), register this session in the ledger, following the format conventions at the top of the ledger file itself. Read its `## Active` section first; if any `started`-status entry overlaps your area-mode scope and is <2h old, surface the conflict to the user before proceeding. Overlap on the ledger file itself is expected and is not a conflict.

**Ledger edits are a single bash invocation** (read + append/move in one command) — parallel sessions rewrite the file between an Edit-tool read and its write, so multi-step edits lose entries. Always edit the ledger in the **main checkout**, even when the code work happens in a worktree.

**Declared paths for `/architect`:**
- Vault: `Architect/scans/<run>.md`, `Architect/decisions/<adr>.md`, `Architect/backlog.md`, `Architect/strong-patterns.md`, `Architect/weak-patterns.md`, `Lessons/{date}-architect.md`
- Working tree (varies by area mode): the area's file paths as the context source lists them
- Always: the ledger itself

**At session end** (Phase 7 commit lands, the user closes without execute, or the run aborts): move your entry to the top of `## Recently completed`. Update `Status` to `completed (commit: <sha>)` or `aborted (<reason>)`. Trim entries older than 14 days while you're there.

---

## Phase 0: Read the overlay, resolve the vault

Read `.claude/architect/config.md` if it exists (§ Project overlay). Resolve `VAULT` = the first `vault` candidate that exists; if none does, fall back to `<repo>/.architect/` — the same schema, still an Obsidian-openable folder — and **create it**. A missing vault is never a reason to abort:

```bash
VAULT=""
for c in "${VAULT_CANDIDATES[@]}"; do [ -d "$c" ] && { VAULT="$c"; break; }; done
[ -n "$VAULT" ] || { VAULT="$PWD/.architect"; mkdir -p "$VAULT"; echo "No configured vault found - using fallback $VAULT"; }
```

Record `$VAULT` (and `vault_subdir`, default `Architect`) for the rest of the run, and open with one line saying which vault won and whether an overlay was found. Git-ignore a fallback vault if a concurrent agent shares the branch.

### Bootstrap (one-time per vault)

If any of these are missing, create them:

- `$VAULT/Architect/` (directory)
- `$VAULT/Architect/scans/`, `$VAULT/Architect/decisions/` (directories)
- `$VAULT/Architect/backlog.md`:
  ```markdown
  # Architect Backlog

  Durable queue of architectural decisions. Sorted manually by priority.
  Status values: `proposed | approved | in-progress | shipped | abandoned | blocked`.

  ## Pending
  _No pending decisions._

  ## Shipped
  _None yet._

  ## Abandoned / Blocked
  _None yet._
  ```
- `$VAULT/Architect/strong-patterns.md`:
  ```markdown
  # Strong Patterns

  Load-bearing patterns identified by `/architect`. Promote-worthy: ideally these
  graduate into lint rules, design-doc sections, or codified conventions.

  ## Patterns

  _No patterns yet._
  ```
- `$VAULT/Architect/weak-patterns.md`:
  ```markdown
  # Weak Patterns

  Anti-patterns identified by `/architect`, with reach data. Each entry should
  eventually convert into a backlog decision (or get explicitly accepted as
  "tolerable for now" with a reason).

  ## Patterns

  _No patterns yet._
  ```
- `$VAULT/Architect/coverage.md`:
  ```markdown
  # Architect Coverage

  Heatmap of themes and areas scanned, with last-scan date.

  ## Themes
  _No themes scanned._

  ## Areas
  _No areas scanned._
  ```
- `$VAULT/Patterns/architect-preferences.md`:
  ```markdown
  # Architect Preferences (distilled from /architect runs)

  > Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1.

  _No patterns yet. Will be populated as runs accumulate._
  ```

`Lessons/` is shared with the other skills — don't recreate.

---

## Phase 1: Load context & memory

### 1a. Context-source check

Resolve the overlay's `## Context sources` (or the defaults in § Constants). Report which exist and which do not in one line. **Nothing here stops the run** — a missing source narrows the scan, and saying so is the honest opening. If the repo has a command that regenerates a missing source and the overlay names it, offer it as a `Next?` option rather than blocking.

### 1b. Read in order

1. The **architecture digest** the overlay names first — most important for architect: engine internals, conventions, module boundaries. Read in full.
2. The **area taxonomy** (context map, or the doc the overlay maps to it) — area scope, file paths.
3. The repo's **rules file** and any design-system doc the overlay names.
4. `$VAULT/Architect/strong-patterns.md` — to know what's already considered load-bearing (avoid re-flagging strengths as "discoveries").
5. `$VAULT/Architect/weak-patterns.md` — to know what's already on the radar.
6. `$VAULT/Architect/backlog.md` — to know what's pending or in-progress.
7. `$VAULT/Architect/coverage.md` — for staleness signals.
8. `$VAULT/Patterns/architect-preferences.md` — to deprioritize finding shapes the user has rejected before.
9. The 3 most recent `$VAULT/Lessons/*-architect.md` files — recent self-reflection.

### 1c. Snapshot freshness

Same check as research/explorer. If the area taxonomy carries a generation timestamp or commit count, warn (never stop) when it is >30 days old or commits have advanced >200 since it was written — a context that has been split or renamed since scores wrong.

### 1d. Aging strong-patterns review

Parse `$VAULT/Architect/strong-patterns.md`. For each entry:
- Compute age = `today − Identified` date.
- If `Codification status: noted` AND age > 60 days AND no `Last reviewed` within 30 days → mark as **aging**.

Hold the aging list in working memory; surface it in Phase 5 alongside new findings. The intent is gentle pressure, not nagging — a pattern can stay `noted` indefinitely if the user explicitly snoozes or accepts that informal status is fine.

If a pattern's `Codification status` is already `lint-rule-added`, `docs-written`, or `test-guard-added`, don't flag it as aging. The codification has happened.

---

## Phase 2: Mode dispatch

### Scan mode → Phase 3
### Area mode → Phase 3 (with area scope override applied to all sub-agent prompts)
### Resume mode → Phase 9

---

## Phase 3: Parallel scan (scan + area modes)

This is where the heavy lifting happens. Spawn **3–5 `Explore` sub-agents in parallel**, each looking at the theme/area from a different angle. Each agent gets a focused prompt and reports back in a structured shape.

### 3a. Pick the angles

For a generic theme, default angles:
1. **Usage map** — where does this concept appear? Count call sites, group by feature module. Identify shape variation.
2. **Type/contract** — are the types consistent? Are interface boundaries respected? Any leaky abstractions?
3. **Failure mode** — what happens when this fails? Error handling consistency, recovery, observability.
4. **Performance surface** — any hot paths? Sync work that should be async? N+1 patterns? Bundle weight contributions?
5. **Test coverage** — is this tested at the right layer? Unit, integration, e2e? Test gaps that hide regressions?

Pick the angles that match the theme. Examples:

- `state-management` → angles 1, 2, 4, 5 (drop "failure mode" — state isn't error-prone in the usual sense; replace with "subscription / re-render footprint").
- `error-handling` → angles 1, 2, 3, 5.
- `ipc-boundary` → angles 1, 2, 3, plus a sec-leaning one ("auth and validation at the boundary").
- `data-modeling` → angles 1, 2, plus "migration history" and "schema-vs-types drift".
- `testing-strategy` → angles 5 (deeply), plus "fixture duplication" and "test harness reach".
- `async-patterns` → angles 1, 2, 3, 4.
- `type-safety` → angles 2, 4, plus "any-leak audit" and "type-errors-on-the-base-branch surfaces".
- `build-tooling` → angles 4, 5, plus "config drift across packages" and "lock file health".

If `area` mode, every angle is bounded to the files the area's contexts list in the area taxonomy.

### 3b. Sub-agent prompt template

Each sub-agent prompt should be **self-contained** — they don't have your context. Use `Explore` (read-only) for all of them.

```
You are scanning the {product} codebase ({stack}) for {angle name}.

Theme: {theme}
{If area mode:} Scope: only files under {area paths from the area taxonomy}
Background: {1 paragraph from the architecture digest relevant to the theme}

Specific questions:
1. {question 1 tailored to angle}
2. {question 2}
3. {question 3}

Report format (Markdown):
- Files inspected: {list, capped at top 30 by relevance}
- Observed shapes: {distinct patterns found, with file:line examples for each}
- Inconsistencies: {where shapes diverge - call out specific files}
- Outliers: {any single file doing it differently from the rest}
- Smell strength: 1-5 (1 = healthy, 5 = active drag on the codebase)
- Cross-references: {where this angle interacts with other parts of the system}

Budget: 30-60 minutes of equivalent work. Don't enumerate every match - sample
strategically and report shape, not exhaustive detail.
```

Run all sub-agents **in parallel** (single message, multiple `Agent` tool calls).

### 3c. Synthesize

Merge the sub-agent reports into a single pattern model. Look specifically for:

- **Convergence** — multiple angles flagging the same module → high-confidence finding.
- **Conflict** — one angle calls something a strength, another calls it a weakness → investigate; usually means context-dependent (strong in module A, weak in module B).
- **Surprise** — something none of the angles expected → likely the most valuable finding of the run.
- **Reach quantification** — every weakness has a concrete count: "47 files, 12 components, 3 stores."

If sub-agent reports are thin (smell strengths all 1-2, inconsistencies few), the area is healthy in this theme. **Say so explicitly** and offer to either pick a different theme or downgrade the run to "passive scan, no findings to action." Don't manufacture findings to fill a quota.

### 3d. Output structure

After synthesis, you should have:
- 0–8 **weak-pattern findings** with reach, risk, effort, payoff.
- 0–4 **strong-pattern findings** worth codifying.
- 0–2 **tech-swap proposals** (replace lib X with Y) — only when smell strength is ≥4 AND swap unlocks payoff a refactor can't.
- 0–3 **structural-bug-class** findings — recurring bugs whose root is structural (e.g. "every effect that polls leaks because we have no `useInterval` primitive — fix the missing primitive, not 14 effects").

Cap total findings at **8**. If you have more, rank by `(reach × payoff) / (risk × effort)` and drop the bottom.

---

## Phase 4: Surface against existing memory

Before presenting, cross-check every finding against:
- `$VAULT/Architect/strong-patterns.md` — if you're flagging a "weakness" in something previously identified as strong, the user's expectation has changed; flag the conflict explicitly.
- `$VAULT/Architect/backlog.md` — if a finding duplicates a pending decision, merge them and note "previously proposed in [[backlog#decision-N]], re-confirming with new reach data."
- `$VAULT/Architect/weak-patterns.md` — same for weak patterns. If reach or risk has shifted, update the existing entry instead of creating a new one.

This step prevents architecture findings from drifting into "we keep finding the same thing every quarter and never doing it."

---

## Phase 5: Present findings

Print a summary table, then per-finding detail with full tradeoff context.

### Summary table

```
#   Type                   Sev    R   E    Reach                              Title
─   ────────────────────   ────   ─   ──   ─────────────────────────────────  ──────────────────────────────
1   weak-pattern           high   3   m    47 files / 12 components / 3 stores  Inconsistent loading state shape across feature modules
2   structural-bug-class   high   4   l    8 polling effects                    Missing useInterval primitive; every poll leaks subscriptions
3   tech-swap              med    4   xl   ~280 files                            Replace handcrafted form state with react-hook-form
4   strong-pattern          -     -   -    23 stores                             Zustand slice + useShallow is rigorously consistent - codify
...
```

R = risk (1-5), E = effort (s/m/l/xl). Strong patterns have no risk/effort — they're observations, not changes.

### Per-finding detail

For weak-pattern / structural-bug-class / tech-swap:

```
[N] {title}
    Type:        {weak-pattern | structural-bug-class | tech-swap}
    Reach:       {concrete count}
    Risk:        {1-5} - {1-line explanation: what could break, recovery path}
    Effort:      {s/m/l/xl} - {rough breakdown: scan/migrate/test ratio}
    Payoff:      {1-5} - {what this unlocks, what bug class it eliminates}

    Current shape:
      {2-3 sentences describing how it's done today, with 2-3 file:line examples
       showing variation if relevant}

    Proposed shape:
      {2-3 sentences describing the proposed convention/replacement, with one
       canonical example file:line showing where it's already done right (or
       a sketch of what it would look like)}

    Migration plan (sketch):
      {3-7 numbered steps, each shippable independently. Note which are
       breaking vs additive. Ballpark commit count and PR size.}

    Risks:
      - {risk 1, with mitigation}
      - {risk 2}
      - {risk 3}

    Already-on-radar: {link to weak-patterns.md entry or backlog item if any}
```

For strong-pattern:

```
[N] {title}
    Type:           strong-pattern
    Reach:          {concrete count}
    Why it works:   {2-3 sentences}
    Codification:   {how to promote - lint rule? a docs vehicle? a test guard?}
    Risk to losing: {what would happen if it drifts - concrete bug shape}
```

### Aging strong patterns (from Phase 1d)

After the new findings, print a short Aging block — only if Phase 1d found any:

```
Aging strong patterns (noted but not codified):

[A1] {title}  - noted {date} ({N} days ago)  -> [[Architect/strong-patterns#{title}]]
[A2] {title}  - noted {date} ({N} days ago)  -> [[Architect/strong-patterns#{title}]]
```

These are not new findings — they're re-surfaced from prior runs. Phase 6 triage handles them with their own verdicts.

---

## Phase 6: Triage

Ask the user:
```
For each finding, pick a verdict:
  1. execute now    - implement this one in this session
  2. queue          - accept as backlog decision; defer       <- default
  3. drop           - not worth pursuing
  4. rework         - true gap, wrong proposed shape

Reply with `<finding>=<verdict>`, space-separated. Examples:
  "1=2 2=1 3=3 4=4"   ->  finding 1 queued, 2 executed, 3 dropped, 4 reworked
  "all=2"             ->  queue everything
  "ask"               ->  guided walkthrough item-by-item
  Enter               ->  same as "all=2"   <- default
```

The four-way triage matters: architect findings rarely all execute now, but they shouldn't all drop either. Most go to the queue. Every non-drop verdict routes to a concrete enforcement artifact (ADR, lint rule / CI gate / test guard, or per-PR rollout plan) — see the deliverable contract at the top. A finding left as prose in the scan note is a run failure.

For each verdict:

- **execute now** → proceed to Phase 7. When more than one finding is marked execute-now, run them as one session **sequenced by ascending risk**, with the gate re-run between findings so a regression is attributable to the finding that caused it. State the sequence before starting. Do not ask the user to reduce the set — they chose it.
- **queue** → proceed to Phase 8 (write ADR + add to backlog).
- **drop** → record in scan note as `decided: dropped` with reason. Pattern-track in Lessons (Phase 10).
- **rework** → ask: "what shape would actually fit?" Capture user's reframe, update the finding, re-present. If they don't have a clear redo, queue it as `proposed (needs reshape)` so a future scan can revisit.

Strong-pattern findings have a different triage:
```
For strong patterns (new this run), pick a verdict:
  1. codify   - proceed to Phase 7B; ship lint rule / docs / test guard
  2. note     - record in strong-patterns.md but defer codification   <- default
  3. drop     - not actually load-bearing; do NOT persist

Reply `<finding>=<verdict>` (e.g. "4=2 7=1") or Enter for `all=2`.
```

For aging strong patterns (from Phase 1d):
```
For aging strong patterns, pick a verdict:
  1. codify    - same Phase 7B path (aging is meant to push toward this)   <- default
  2. snooze    - bump Last reviewed to today; won't re-surface for 30 days
  3. drop      - pattern no longer load-bearing; remove from strong-patterns.md

Reply `<aging-id>=<verdict>` (e.g. "A1=1 A2=2") or Enter for `all=1`.
```

Codification is on by default if the user picks `codify` for any pattern (new or aging). The "triage first, docs after" preference means `note` is a valid steady state, but aging review eventually nudges noted patterns toward action or honest acceptance that informal status is fine.

---

## Phase 7: Execute (one decision, this session)

This is the high-rigor execution path, with full validation. Isolation follows the repo law's parallel-safety rules where it declares any, not ad-hoc branching.

### 7a. Isolation: worktree by default

Multi-file work MUST NOT happen on the base branch next to other sessions. Architect rollouts are almost always multi-file, so the default is a dedicated worktree under the overlay's `worktree_root` (default `.claude/worktrees`):

```
Isolation for this decision:

  1. worktree {worktree_root}/architect-{slug}   <- default (mandatory for multi-file rollouts)
  2. commit on current checkout                  <- only if the rollout touches a single file

Pick 1 or 2 (Enter = 1).
```

If option 1:
```bash
git worktree add {worktree_root}/architect-{slug} -b worktree-architect-{slug}
cd {worktree_root}/architect-{slug}
```
Work and commit inside the worktree; vault writes and ledger edits still target the main checkout/vault paths. After the branch is merged into `{base_branch}` and confirmed in `git log {base_branch}`, clean up (Phase 12 ritual): `git worktree remove {worktree_root}/architect-{slug}` then `git branch -D worktree-architect-{slug}`.

Option 2 is legitimate only for genuinely single-file changes. If the user insists on the main checkout for a multi-file rollout, warn once (citing the repo law's isolation rule if it has one), then honor it — the ADR is what gives the change its identity either way.

### 7b. Write the ADR first

Before any code change, write `$VAULT/Architect/decisions/{YYYY-MM-DD}-{slug}.md`:

```markdown
---
date: 2026-05-01
slug: {slug}
status: in-progress
type: weak-pattern | structural-bug-class | tech-swap
reach: "{concrete count}"
risk: {1-5}
effort: {s/m/l/xl}
payoff: {1-5}
branch: worktree-architect-{slug} | "(committed on main checkout)"
related_scan: [[Architect/scans/{date}-{theme}]]
---

# {Title}

## Context
{What's the codebase reality today, with file:line examples. ~1 paragraph.}

## Decision
{What we're going to do. ~1 paragraph. Be specific about scope.}

## Consequences
### Positive
- {what we gain}
### Negative / risks
- {what we lose or risk}
### Mitigations
- {pre-flight checks, rollback plan}

## Rollout
{Numbered list of atomic commits planned. Each one is independently shippable.}
1. {step 1} - {validation: cargo check / tsc / lint / tests}
2. {step 2} - {validation}
3. ...

## Acceptance criteria
- {observable criterion 1}
- {observable criterion 2}
- {observable criterion 3}

## Regression checklist
- [ ] {area 1 still works} - verified by: {how}
- [ ] {area 2 still works} - verified by: {how}
- ...
```

### 7c. Pre-flight checks

In a fresh worktree (7a option 1) the tree starts clean — skip straight to step 3 (baselines). On the main checkout (option 2), **do NOT require a clean working tree.** Concurrent CLIs run on the same tree; assuming a clean baseline is wrong, and acting on that assumption (stash, reset, checkout) destroys other people's work. Instead, **inspect, classify, and coexist**:

1. **Inspect the tree:**
   ```bash
   git status --short
   ```
   Read every modified or untracked path.

2. **Classify each path** as one of:
   - **In-flight by someone else** — paths that have nothing to do with this architect decision. Leave them strictly alone for the rest of the run.
   - **Pre-existing in your touch zone** — paths the decision will edit that already have uncommitted changes. Surface to the user:
     ```
     File X already has uncommitted changes. The architect decision wants to edit it.
     Options:
       1. commit those changes first (you do it; I'll re-inspect after)
       2. let me commit on top of them (your changes stay; mine layer on)
       3. abort - pick a different decision
     ```
     Default to option 2 if the user doesn't pick — commit-on-top is the principle.
   - **Yours from this session** — paths only this session has authored. Normal.

3. **Capture validation baselines** — run the overlay's `## Gates` → `baseline:` commands (with no overlay, the detected typecheck / lint / test / compile commands; print what you detected). Record the numbers in the ADR's `## Pre-flight baseline` section. Subsequent commits compare to this baseline — a lint count going from 10086 → 10089 warnings is a regression caused by *you*, not the in-flight other-author work (whose net contribution to the baseline is captured in the snapshot you just took). In a repo with a large pre-existing warning baseline the metric is **delta on the files this diff touched**, never an absolute count.

**Forbidden during pre-flight (and at every later phase):**
- `git stash` — never. Not even with `--keep-index`.
- `git reset --hard`, `git reset --merge`, `git restore`, `git checkout --` on any path.
- `git clean -f`, `git clean -fdx`.
- `git add -A`, `git add .`, `git add -u` — always specify exact paths so you don't accidentally claim someone else's work.

If the working tree contains a path that conflicts with your edits and the user doesn't want to commit it first, abort the decision and queue it back to the backlog with a `blocked: working-tree-conflict` note. Re-attempting later (when the conflict has cleared) is fine.

### 7d. Atomic commits per rollout step

For each step in the ADR's Rollout section:

1. Apply the changes for that step.
2. Run the validation listed for that step.
3. **Compare to baseline** — TS errors must not increase, lint warnings must not exceed baseline + small rounding (5 max), tests must pass at the baseline rate. Note: if the baseline already had non-zero errors/warnings from in-flight other-author work, those propagate forward — that's fine; the metric is *delta*, not absolute.
4. If validation regresses → fix inline. Do NOT stack failing commits. Do NOT use `--no-verify` or `--amend`.
5. Stage **only the paths this step touched** — `git add path/one path/two`. Never `git add -A`, `git add .`, or `git add -u` — those would sweep up in-flight work from other CLIs or the user's editor. If you can't enumerate the paths, you don't know what you changed; stop and re-inspect with `git status --short` and `git diff --name-only`.
6. **Verify the staged index before committing:** run `git diff --cached --stat`. If the staged file count exceeds the paths you just `git add`-ed, the index held pre-staged files from another session — `git restore --staged <path>` each unrelated file first. Never trust the index; even worktrees can carry foreign pre-staged content.
7. Commit with `architect: <step title>` prefix, Co-Authored-By footer, body referencing the ADR by wikilink.
8. Record the commit SHA in the ADR's Rollout section as you go.

### 7e. Final regression sweep

After the last step:

1. Run the overlay's `## Gates` → `final:` commands in full (default: the same set the baseline snapshotted). Long gates go `run_in_background` and their output is read before the next state-changing action.
2. Walk through the ADR's regression checklist. For each item, verify it works — run the actual code path if the overlay's `## Smoke` says how.
3. **If any checklist item is unverified, do not mark the ADR as `shipped`.** Mark `in-progress` with a "needs verification" note and queue the verification as a follow-up.

### 7f. Update ADR status

When all rollout steps are committed and regression checklist passes:
- Update ADR frontmatter: `status: shipped`, add `commits: [<sha>, ...]`.
- Move the entry in `Architect/backlog.md` from Pending to Shipped.

If only some steps shipped, status stays `in-progress` and the ADR records which steps remain.

### 7g. Repo law — non-negotiable

Every commit honors the overlay's `## Repo law` in full: its i18n contract (which locale files a new string must land in, and by which pipeline), its design-token and shared-component rules, its error-handling and IPC discipline, its out-of-scope walls. With no overlay, read the repo's rules file and follow what it states; where it states nothing, match the shape of the surrounding code rather than inventing one.

If a rollout step cannot honor the repo law, do not ship it half-converted — split that step out and record it in the ADR as remaining.

### 7h. Visual verification

For UI-affecting decisions: follow the overlay's `## Smoke` to run the app, exercise the affected surface, confirm. With no `## Smoke`, state explicitly that you have NOT visually verified — never claim "looks good" from code review alone.

---

## Phase 7B: Codify strong patterns

Triggered for every strong pattern (new or aging) marked `codify` in Phase 6. Multiple codifications can run in the same session — they're independent and lower-risk than a Phase 7 weak-pattern execution.

### 7B.a. Pick the vehicle

For each pattern marked `codify`, ask:

```
How should "{pattern title}" be codified? Pick one or more:

  1. lint-rule    - write a custom lint rule that flags non-conforming code
  2. docs-arch    - append a section to the architecture digest (loaded by all skills)
  3. docs-rules   - append a convention to the repo's rules file (surfaces in every session)
  4. test-guard   - add a structural test that asserts the pattern (fails if drift introduced)
  5. multiple     - pick a combination (e.g. "1+2" = lint rule + architecture docs)
```

Options 2 and 3 name the files the overlay's `## Docs vehicles` maps; with no overlay, 3 is the repo's rules file and 2 is offered only if a second architecture digest exists.

**Rule of thumb for which vehicle fits:**
- Pattern is a code shape (call site discipline, hook usage, type contract) → `lint-rule` is strongest. Falls back to `docs-arch` if the pattern is too contextual to lint mechanically.
- Pattern is an architectural boundary (module vs plugin, IPC contract, where things live) → `docs-arch` so future skills load it.
- Pattern is a project-wide convention humans need to know (i18n, design tokens, error handling) → `docs-rules` so it is loaded into every session.
- Pattern can be detected by file scan but not in a single file's AST (cross-file invariant, count threshold) → `test-guard` (a vitest test that walks the tree).

If the user picks `multiple`, codify each vehicle in a separate atomic commit.

### 7B.b. Lint rule vehicle

1. Read the linter config and any existing custom-rule directory (the overlay's `## Lint vehicle` names both) to learn the project's custom-rule conventions — rule file shape, naming, registration. If the repo has no custom-rule mechanism at all, say so and fall back to a docs vehicle.
2. Write the new rule where the existing ones live, following their shape — name format, severity, message, fix function if mechanically auto-fixable.
3. Register it in the linter config. Default severity: `warn` (a new rule over existing code is a migration, not a wall). Only use `error` if the user explicitly says "ship blocker."
4. Run the lint gate and capture the new warning count. Compare to baseline. If the new count is enormous (>500 warnings), warn the user — the rule is too noisy and either the pattern isn't actually as load-bearing as thought, or the rule needs scope narrowing. Pause for guidance.
5. Commit: `architect: codify <pattern> as lint rule` — body explains the rule, threshold, and current warning count.

### 7B.c. Docs vehicle (architecture digest or rules file)

1. Read the target file the overlay's `## Docs vehicles` names.
2. Find the right insertion point — for the digest: a "Strong patterns" section or the architecture section it relates to; for the rules file: under its conventions heading, with a subsection.
3. Write the section: name, why it works (the "load-bearing" reasoning from the strong-pattern entry), canonical example with `file:line` reference, anti-shape to avoid, optional pointer to the lint rule if `multiple` was picked.
4. Keep it concise — 10-25 lines. Long convention docs go unread.
5. Commit: `architect: codify <pattern> in <file>` — body quotes the appended section.

### 7B.d. Test guard vehicle

1. Read existing structural tests if any (grep the test tree for `structural` / `invariant` describes).
2. Write the test with the repo's own runner (the overlay's `## Test guard vehicle`, else the runner in `package.json` scripts or the toolchain default), in the location the repo already puts such tests.
3. The test should walk the file tree, grep for the anti-shape, and assert zero violations. Provide a clear failure message that points the offender to the strong-patterns entry and the rule.
4. Run the test gate and confirm the new test passes against current code.
5. Commit: `architect: codify <pattern> as structural test guard`.

### 7B.e. Update the strong-patterns entry

In `$VAULT/Architect/strong-patterns.md`, update the entry:
- `Codification status: lint-rule-added | docs-written | test-guard-added` (or combination — list all that were added)
- Add `Codified: {date}` line.
- Add `Codification ADR: [[Architect/decisions/{date}-codify-{slug}]]` (see 7B.f).
- If a docs vehicle was used, link to the file: `Docs at: <file>#<anchor>`.
- If a lint vehicle was used: `Lint rule: <rule file path>`.

### 7B.f. Mini-ADR

Codification is a real decision with rollback considerations. Write a small ADR at `$VAULT/Architect/decisions/{YYYY-MM-DD}-codify-{slug}.md`:

```markdown
---
date: 2026-05-01
slug: codify-{slug}
status: shipped
type: codification
vehicle: lint-rule | docs-stack | docs-claude | test-guard | combination
parent_strong_pattern: [[Architect/strong-patterns#{title}]]
related_scan: [[Architect/scans/{date}-{theme}]]
commits: [<sha>]
---

# Codify: {pattern title}

## Why now
{reason - typically "noted N days ago, surfaced as aging" or "identified this run, smell-strength enough to enforce"}

## Vehicle and rationale
{which vehicle picked, why this one fits}

## Rollback
{how to undo if the codification turns out wrong - e.g. "drop the lint rule, the underlying pattern remains noted in strong-patterns.md"}
```

### 7B.g. For aging patterns marked `snooze`

No codification work — just update the entry in `strong-patterns.md`:
- Add or update `Last reviewed: {today}`.
- Bump the `Snoozed until: {today + 30 days}` field (create if missing).

This commit is optional — if it's the only change of the run, commit `architect: snooze {pattern} for 30d`. Otherwise bundle into the run's regular activity.

### 7B.h. For aging patterns marked `drop`

Remove the entry from `strong-patterns.md` entirely. Add a one-line entry to `Lessons/{date}-architect.md`:
```
- Dropped strong pattern "{title}" - original date {date}, reason: {user reason}.
```

This is the cleanup path. Don't keep zombie entries.

---

## Phase 8: Backlog the queued decisions

For every finding the user marked **queue** in Phase 6:

### 8a. Write a stub ADR

Same template as Phase 7b, but with:
- `status: proposed`
- Rollout section can be sketchy (filled in when the decision moves to `in-progress` in a future session).
- No commits, no branch.

Save to `$VAULT/Architect/decisions/{YYYY-MM-DD}-{slug}.md`.

### 8b. Append to the backlog

In `$VAULT/Architect/backlog.md`, under `## Pending`, add:

```markdown
- **[{date}] {Title}** - type: {type}, risk: {N}, effort: {s/m/l/xl}, payoff: {N}, reach: {concrete}
  ADR: [[Architect/decisions/{date}-{slug}]]
  Source scan: [[Architect/scans/{date}-{theme}]]
  Status: proposed
  Notes: {any user input from triage}
```

Sort the Pending section by `(reach × payoff) / (risk × effort)` descending — easiest high-payoff first. The user can manually re-sort.

### 8c. Update weak-patterns.md / strong-patterns.md

For weak-pattern findings, add or update an entry in `$VAULT/Architect/weak-patterns.md`:

```markdown
## {Pattern title}

- First seen: {date} (this run)  /  Last seen: {date}
- Reach: {count, current}
- Reach trend: {growing | stable | shrinking}
- Backlog item: [[Architect/backlog#decision-N]] (or "no decision queued yet")
- Examples: `{file:line}`, `{file:line}`, `{file:line}`
```

For strong-pattern findings — write only when triage verdict is `note` or `codify`. **Never write entries the user marked `drop`** (drop means "not actually load-bearing"; persisting it would pollute the file). For `codify` verdicts, the entry is written here in skeleton form, then Phase 7B fills in `Codified`, `Codification status`, and `Codification ADR` when the codification ships.

```markdown
## {Pattern title}

- Identified: {date}
- Reach: {count}
- Why it works: {1 sentence}
- Codification status: noted | docs-written | lint-rule-added | test-guard-added | combination
- Last reviewed: {date - set on every aging review snooze}
- Examples: `{file:line}`, `{file:line}`
```

For aging strong patterns marked `drop` in Phase 6, **delete** the existing entry from `strong-patterns.md` (see Phase 7B.h). Entries are not kept around as tombstones.

---

## Phase 9: Resume mode

Triggered when input was `resume`. Skip all of Phase 3 (no scanning).

### 9a. Read the backlog

Open `$VAULT/Architect/backlog.md`. Print the Pending section to the user, formatted as a numbered table:

```
Pending architect decisions ({N}):

#   Date         Title                                                   Type           R/E/P  Reach
─   ──────────   ─────────────────────────────────────────────────────   ────────────   ─────  ──────────────
1   2026-04-15   Inconsistent loading state shape across feature modules  weak-pattern   3/m/4  47f / 12c / 3s
2   2026-04-15   Replace handcrafted form state with react-hook-form      tech-swap      4/xl/4 ~280f
3   2026-04-22   Missing useInterval primitive; polling leaks             struct-bug     4/l/4  8 effects
...
```

R/E/P = risk / effort / payoff.

### 9b. Pick one to execute

Ask:
```
Which to execute now? Reply with a decision number (1-{N}).

Shortcuts:
  open N   - read the full ADR before deciding (re-asks after)
  abort    - bail; nothing executes
  Enter    - pick decision #1 (top-priority)   <- default
```

If they pick `open N`, read the ADR file and print it. Then re-ask.

### 9c. Refresh the ADR

The ADR was written previously and may be stale (codebase has moved on). Before executing:
- Re-verify the file:line anchors still exist.
- Re-count reach (run the original grep, see if numbers shifted).
- Read recent git log on touched files to spot conflicts.
- If anything material has changed (a step was already done by another change, the shape of the proposed fix is now wrong, the reach has shrunk to a level where it's not worth the effort), **stop and present the delta to the user**. Ask whether to proceed, reshape, or abandon.

If nothing material has changed, fill in any sketchy parts of the Rollout section and proceed.

### 9d. Execute

Jump to Phase 7a (isolation) and run through 7b–7h normally — resume executions get a worktree like any other multi-file rollout.

---

## Phase 10: Self-reflection

### 10a. Ask why for dropped findings

Single batched question:
```
For the dropped findings, why did you drop them?

  [3] {title}
  [5] {title}

Per-item reasons or one overall reason.

Shortcuts:
  skip    - record "no reason given"
  Enter   - same as "skip"   <- default
```

### 10b. Append to Lessons

Write `$VAULT/Lessons/{YYYY-MM-DD}-architect.md`:

```markdown
## Run: {timestamp} - {theme or area} ({mode})

Sub-agents spawned: {N} angles
Findings surfaced: {weak: M, strong: K, swap: J, struct-bug: L}
Triage:
  - executed: [list]
  - queued: [list]
  - dropped: [list]
  - reworked: [list]

### Drop reasons
- [3] {reason}
- [5] {reason}

### Self-reflection
- Sub-agent angles that produced strong signal: {which ones}
- Sub-agent angles that produced noise: {which ones}
- Synthesis miss: {anything I framed wrong that the user corrected}
- Calibration drift: {e.g. "rated 4 findings 'high payoff' but user dropped 2 of 4 - over-weighting payoff"}
- Re-usable insight for future scans: {1 sentence}
```

### 10c. Backfill the scan note

(See Phase 11 for the scan note structure — backfill drop reasons there.)

### 10d. Pattern promotion

Same logic as `/research` and `/explorer`: read all `Lessons/*-architect.md`, look for repeated drop reasons. After 3+ observations, propose adding to `$VAULT/Patterns/architect-preferences.md`.

### 10e. Architecture-digest update check

Did this run discover a structural fact about the codebase that future runs need to know? Architect runs are *especially* prone to this — sub-agent reports often surface boundaries the skill didn't have on its map. If yes, edit the architecture digest (the overlay's first `## Context sources` entry; with no overlay, the repo's rules file) directly with the new fact, tagged with run date.

### 10f. Update coverage.md

Update the Themes section (or Areas if area mode):

```markdown
### {theme}
- Last scanned: {date}
- Last scan: [[Architect/scans/{date}-{theme}]]
- Findings (last 3 scans): [8, 4, 6]
- Findings actioned: [3, 1, 2]
- Yield density: {actioned / surfaced}
- Notes: {observations across runs}
```

---

## Phase 11: Persist the scan

Write `$VAULT/Architect/scans/{YYYY-MM-DD}-{theme-or-area-slug}.md`:

```markdown
---
date: 2026-05-01
mode: scan | area | resume
theme: state-management | (n/a for resume)
area: vault | (n/a unless area mode)
sub_agents_spawned: 4
findings_total: 8
findings_weak: 5
findings_strong: 2
findings_swap: 1
findings_struct_bug: 0
executed: [2]
queued: [1, 3, 5]
dropped: [4, 6]
reworked: [7, 8]
adrs_written: ["[[2026-05-01-loading-state-shape]]", "[[2026-05-01-poll-primitive]]"]
commits: [<sha1>, <sha2>, <sha3>]   # only if execute path was taken
branch: worktree-architect-loading-state-shape | "(committed on main checkout)" | "(no execution this run)"
---

# Architect scan - {theme or area} ({date})

## Sub-agent reports
{1-2 sentence summary per angle, with link to full text if you want to keep
the full reports in working memory; otherwise omit}

## Findings

### [1] {title}  ➤ queued (ADR [[date-slug]])
**Type:** weak-pattern
**Reach / Risk / Effort / Payoff:** ...
**Verdict:** queued - {1 sentence reason}

### [2] {title}  ✅ executed -> {commit shas}
**Type:** struct-bug
**Reach / Risk / Effort / Payoff:** ...
**Verdict:** executed; ADR [[date-slug]]; branch worktree-architect-{slug}

### [3] ...

## Strong patterns observed
- {pattern title} -> noted in strong-patterns.md (or "codify" if user picked that)

## Cross-references
- Related ADRs (existing): [[...]]
- Related preferences: [[Patterns/architect-preferences]]
```

---

## Phase 12: Final summary

Print:

```
Architect run complete.

  Mode:           {scan | area | resume}
  Theme/area:     {theme or area name}
  Sub-agents:     {N} angles
  Findings:       {weak} weak / {strong} strong / {swap} swap / {sb} struct-bug

  Triage outcome:
    Executed:     {K} -> ADR [[...]], commits {shas}, branch {branch}
    Queued:       {Q} (in backlog)
    Dropped:      {D}
    Reworked:     {R}

  Strong patterns:
    Identified:   {N} new this run
    Codified:     {C} -> vehicles {[lint-rule|docs-stack|docs-claude|test-guard]}, commits {shas}
    Noted:        {M} -> strong-patterns.md
    Aging surfaced: {A} (from prior runs >=60d old)
    Aging actioned: {codified: K, snoozed: S, dropped: D}

  Files updated:   ($VAULT = {resolved vault root})
    + $VAULT/Architect/scans/{date}-{slug}.md
    + $VAULT/Lessons/{date}-architect.md
    + $VAULT/Architect/decisions/{date}-{slug}.md  (x {N})
    ~ $VAULT/Architect/backlog.md
    ~ $VAULT/Architect/weak-patterns.md  (if any weak findings)
    ~ $VAULT/Architect/strong-patterns.md  (if any strong findings)
    ~ $VAULT/Architect/coverage.md
    {if pattern promoted:}
    ~ $VAULT/Patterns/architect-preferences.md
    {if the architecture digest was updated:}
    ~ {digest path}

  Next?
    1. /architect resume     - execute next decision ({Q} pending)   <- default if Q > 0
    2. /architect scan       - fill the queue with a new theme
    3. /explorer             - daily wandering on adjacent area
    4. /research             - external-source companion run
    5. done
    {if a worktree was created: also note "merge worktree-architect-{slug}, then
     remove the worktree (.claude/worktrees/architect-{slug}) and delete the branch"}
```

---

## Notes on use

- **Cadence** — once a week is plenty. Architect runs are heavy; the backlog absorbs the inventory and resume mode amortizes the work.
- **Scan vs resume** — alternate. Scan to fill the queue, resume to drain it. A backlog of 20 pending items means the next session should be resume, not scan.
- **Coexist with uncommitted work.** Where the repo law declares parallel-safety primitives, this is the pattern they describe — keep the two aligned. Architect never requires a clean baseline on a shared checkout: inspect what's there, edit only its own paths, stage only those paths, and verify the staged index before every commit (Phase 7d step 6). Never `git stash`, never `git reset --hard`, never `git checkout --` someone else's work. Physical isolation comes from the worktree default (Phase 7a), not from cleaning the shared tree.
- **Conflict signal** — if a finding contradicts a `strong-pattern` already in the vault, treat it as the most interesting finding of the run. Either the strong-pattern entry is stale (codebase moved on) or the new finding is wrong. Either way, the answer changes the model meaningfully.
- **Drift signal** — if 3 consecutive scans on different themes produce backlog items but zero get executed via resume, the user is using architect as a brainstorming tool, not a shipping tool. Surface this in self-reflection: ask whether to lower the bar for execution or accept that the backlog is the artifact.
- **Tech swaps are the riskiest** — never propose a swap with reach ≥100 files unless smell strength is 5. A reach-280 swap (the react-hook-form example) is a multi-week project; the ADR's Rollout section should reflect that with 5–10+ atomic PRs.

## App context coverage (Personas-managed repos)

This skill declares `contexts: tracked` — the Personas app measures per-context memory coverage for it. When run inside a Personas-managed repo (a `.personas/` dir exists, or the app dispatched this run), before finishing append JSON lines to `.personas/memory-outbox.jsonl` at the repo root (append, never rewrite) — one node per context you meaningfully worked on:

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name the app knows>","skill":"architect"}
```

**Which name — this is the part that silently fails.** The ingest anchors a node
by matching `context` against the names the app actually knows, case-insensitively.
A name it does not recognize is NOT an error: the node is stored with a null
context and simply never counts toward coverage. Use the name set the overlay's
`coverage_context_source` declares; with no overlay, use the context map's names.
**A repo whose map and whose app disagree must say so in the overlay** — a
mechanically generated map and a product-level taxonomy can share almost no names,
and anchoring to the wrong one loses every node silently.

Always set both `"skill":"architect"` and `"context":"<name>"` — together they drive the per-skill context-coverage % (last 30 days). The app ingests and deletes the file when the session ends. Skip silently when not Personas-managed.

---

## Skill Reflection

After the run’s real work is done, reflect twice — autonomously, without asking the user. Be honest about volume: most runs produce NOTHING for lane 2. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

Lane 1 — PROJECT learnings (what the next session in THIS repo needs): write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Project-specific insight only.

Lane 2 — METHOD learnings (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append an entry to `LESSONS.md` in this skill’s directory: `## <version-used> — <YYYY-MM-DD> — <project-name>` followed by `- ` bullets (create the file with a `# Lessons — <skill>` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a methodic redesign you are NOT applying now.
3. Version bump — ONLY when you also edit SKILL.md to apply the improvement in the same change: minor (1.2 → 1.3) for a prompt/step refinement, major (1.x → 2.0) for a methodic redesign. Update the `version:` frontmatter field (add `version: 1.1` if the file had none — absent means 1.0). Never bump without an applied edit; never edit the method without a bump.
4. Sync ritual (only when you bumped): (a) commit the skill directory as a STANDALONE commit on the current branch — message `skill(<name>): v<new> — <one-line reason>` — containing nothing but this skill’s files; (b) copy the updated skill directory to `~/.claude/skills/<name>/` (overwrite) so sibling projects can adopt it. EXCEPTION: read `.personas/skill-registry.json` first — if the library already carries a HIGHER version than yours, do not overwrite it; keep your lesson in LESSONS.md and note the version conflict in the entry.

Sibling awareness: `.personas/skill-registry.json` (repo root, when present) lists this skill’s installed version, the workspace library version, and which sibling projects run it at which version with recent usage. Use it to judge whether a lesson is worth a bump (heavily-used siblings raise the bar for majors) and to notice you are BEHIND (library newer than yours → prefer recording the lesson over editing a stale method).
