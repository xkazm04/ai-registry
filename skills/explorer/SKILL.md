---
name: explorer
description: Wander one logical area of a codebase, surface 10 items worth fixing, build the small ones (xs/s) without asking, and triage only the larger ones with the user. Every item is premise-verified, gated and committed atomically. Daily low-friction quality sweeps with per-context coverage memory.
argument-hint: "[area] [--triage-all]"
category: workflow
memory: vault
contexts: tracked
version: 2.1.2
---
# Explorer

Wander a logical section of a codebase, surface exactly **10 items** worth fixing, **build the small ones without asking** and put only the larger ones to the user, then execute in-session. Designed for frequent / low-friction use — daily wandering — and pairs with `/research` (external sources) and `/architect` (heavy structural change).

The method is **repo-agnostic**: it takes its area taxonomy from whatever context source the repo has, and keeps a vault for run records, coverage tracking, and cross-run learning. Everything one repository is lives in the overlay below, each key with a default, so a repo that carries no overlay still gets a full sweep.

## Project overlay

Everything project-specific lives in ONE overlay the run reads in Phase 0: **`.claude/explorer/config.md` in the consuming repo** (tracked, so it travels with the clone and survives the vault, which is not version-controlled). **The sweep runs with no overlay at all** — every key below has a default — but say so in the Phase 0 opening line when defaults are in force, and never paste one repo's overlay into this file.

Overlay shape: YAML frontmatter for scalars, markdown `##` sections for lists and prose. Keys (default in brackets):

```yaml
---
product: "<product name>"             # sweep-note header  [the repo directory name]
stack: "<one-line stack description>" # what the scan expects to read  [detected from package.json / Cargo.toml / manifest, else "unknown"]
vault: ["<abs obsidian root>", ...]   # candidate roots, first existing wins  [<repo>/.explorer]
vault_subdir: Explorer                # namespace inside the vault; "" = the root itself  [Explorer]
context_map: context-map.json         # the area taxonomy's machine-readable source  [context-map.json if present, else none]
coverage_context_source: ""           # which name set the memory outbox anchors to  [the context map's names]
active_runs_ledger: ""                # path of a live-sessions ledger if the repo keeps one  [none; git status only]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Context sources` | the documents Phase 1 reads, in order, each with one line on what it is for (area taxonomy, architecture digest, project rules) | `context-map.json` if present, else `CLAUDE.md` (then `AGENTS.md`); a missing source is **noted, never fatal** |
| `## Area menu` | the numbered options for Q1 and what each maps to | derived from the context map's groups (or the repo's top-level source directories), capped at 8 |
| `## Category menu` | extra categories beyond the built-in eight | the built-in eight only |
| `## Gates` | the validation each executed item must pass, keyed by what it touched | detect from `package.json` scripts (`check`/`typecheck`, `lint`, `test`) and the toolchain (`cargo check` when `Cargo.toml` exists, `npx tsc --noEmit` when a tsconfig does); say what was detected |
| `## Repo law` | the conventions an executed item must honor: i18n contract (which locale files a new string lands in, by which pipeline), design tokens, shared-component catalog, error handling, boundary wrappers | "read the repo's CLAUDE.md/AGENTS.md first; reuse before building" |
| `## Baseline exclusions` | known-noisy migrations that must never become items (a large lint baseline the repo fixes as-you-touch, a half-done extraction) | none — but if the linter reports thousands of warnings of one rule, treat that rule as a baseline and say so |
| `## Smoke` | how to run the app and exercise a surface for visual verification | state plainly that the change was NOT visually verified |

## Interaction conventions

Built for parallel CLI control — every user prompt is single-keystroke answerable.

- **Every prompt is a numbered menu.** Numeric input picks the option; **Enter** triggers the default; option `1. other → …` is the deviation lane (free text).
- **Every phase output (intermediate or final) ends with a `Next?` block** of 2–5 numbered next-step actions. Replying with a digit advances the run without typing prose.
- Long free-text answers are still accepted everywhere; the menu just makes the common case instant.
- **The run does not ask permission for small work.** `xs`/`s` items are built as they are found
  (§ Phase 7); the only mid-run question is about `m`/`l` items, and a run that surfaces none
  asks nothing at all between the two opening questions and the final summary.

## Input

Ask **two** numbered-menu questions, in this order. Numeric input picks the option; **Enter** picks the default; option `1. other → …` is the deviation lane and accepts free text.

### Q1 — Area

```
Area? (Enter = pick for me)
  1. other -> type a hint (path fragment, keyword, or context id)
  2. {area 1}
  ...
  9. {area 8}
  10. pick for me   <- default
```

Numeric options 2–9 are the overlay's `## Area menu`; with no overlay, derive up to 8 from the context map's groups (or the repo's top-level source directories) and print what you derived them from. Option 1's free text falls through to the Phase 2a resolver (path fragment / keyword / exact context id). Option 10 / Enter triggers Phase 2b auto-pick.

### Q2 — Category

```
Category? (Enter = any)
  1. other -> describe (free-form intent; layered onto an auto-picked category)
  2. any            <- default
  3. quality
  4. dx
  5. ui
  6. perf
  7. bug
  8. i18n
  9. a11y
  10. sec
```

Wait for both answers. Don't ask anything else upfront — further questions only if a phase requires clarification.

If the user replies just "go" or "wander" or types `/explorer` with no arguments, treat as "pick for me" + "any" (Enter defaults for both).

---

## Constants

- **Codebase reference files** (always loaded) — whatever the overlay's `## Context sources` names, in its order. With no overlay, resolve in this order and use what exists:
  - `context-map.json` (repo root, or the overlay's `context_map`) — the machine-readable area taxonomy: contexts, file lists, keywords, entry points.
  - `CLAUDE.md` (then `AGENTS.md`, then `.claude/CLAUDE.md`) — project rules: conventions, error handling, any lint baseline, parallel-session discipline.
  - Any architecture digest or feature map the overlay maps in — these are what let the wander go deeper than a file listing.
  - A missing source is **noted in the opening line, never fatal.** With none at all, derive a provisional taxonomy from the repo's top-level source directories and say the sweep is running provisional.
- **Vault root** (resolved at Phase 0; `$VAULT/<vault_subdir>/` throughout, written below as `Explorer/` for the default subdir):
  - `Explorer/sweeps/` — one note per run, the canonical artifact
  - `Explorer/state.md` — informational claim board (which areas are being explored *right now*)
  - `Explorer/coverage.md` — heatmap of last visit per area + yield density
  - `Explorer/passes.md` — per-area "already considered and rejected" memory; future passes skip these
  - `Patterns/explorer-preferences.md` — distilled rules across runs (promoted from Lessons)
  - `Lessons/{date}-explorer.md` — append-only self-reflection
- **Categories** — `quality | dx | ui | perf | bug | i18n | a11y | sec`
- **Severities** — `critical | high | medium | low`
- **Effort buckets** — `xs (<15m) | s (15-60m) | m (1-3h) | l (>3h)`. Since v2 this is
  an APPROVAL boundary, not a label: `xs`/`s` are built without asking, `m`/`l` are the
  only ones triaged. Size the WHOLE change (§ Phase 7).

---

## Phase 0: Read the overlay, resolve the vault

Read `.claude/explorer/config.md` if it exists (§ Project overlay). Resolve `VAULT` = the first `vault` candidate that exists; if none does, fall back to `<repo>/.explorer/` — the same schema, still an Obsidian-openable folder — and **create it**. A missing vault is never a reason to abort:

```bash
VAULT=""
for c in "${VAULT_CANDIDATES[@]}"; do [ -d "$c" ] && { VAULT="$c"; break; }; done
[ -n "$VAULT" ] || { VAULT="$PWD/.explorer"; mkdir -p "$VAULT"; echo "No configured vault found - using fallback $VAULT"; }
```

Record `$VAULT` (and `vault_subdir`, default `Explorer`) for the rest of the run, and open with one line saying which vault won and whether an overlay was found. Git-ignore a fallback vault if a concurrent agent shares the branch.

### Bootstrap (one-time per vault)

If any of these are missing, create them:

- `$VAULT/Explorer/` (directory)
- `$VAULT/Explorer/sweeps/` (directory)
- `$VAULT/Explorer/state.md` — header only:
  ```markdown
  # Explorer State

  Active claims by `/explorer` runs. Informational only - not a hard lock.
  Stale entries (>2h) are released automatically by the next run.

  ## Active

  _No active explorers._
  ```
- `$VAULT/Explorer/coverage.md` — header only:
  ```markdown
  # Explorer Coverage

  Heatmap of areas explored. Used by Phase 2 to pick the staleest, highest-yield area.

  ## Areas
  ```
- `$VAULT/Explorer/passes.md` — header only:
  ```markdown
  # Explorer Passes

  Per-area record of items that were surfaced and **rejected** in past runs.
  Future passes over the same area skip these. Accepted items don't appear here
  (their fix is in the codebase). Items that were not surfaced are also absent.

  ## Areas
  ```
- `$VAULT/Patterns/explorer-preferences.md` — header only:
  ```markdown
  # Explorer Preferences (distilled from /explorer runs)

  > Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1.

  _No patterns yet. Will be populated as runs accumulate._
  ```

Don't create `Lessons/` (already shared with `/research`).

---

## Phase 1: Load context & memory

### 1a. Context-source check

Resolve the overlay's `## Context sources` (or the defaults in § Constants). Report which exist and which do not in one line. **Nothing here stops the run** — a missing source narrows the wander, and saying so is the honest opening. If the repo has a command that regenerates one and the overlay names it, offer it as a `Next?` option rather than blocking.

### 1b. Read in order

1. The **area taxonomy** — groups, contexts, file paths, keywords, entry points.
2. The **architecture digest** the overlay names, if any — engine internals and conventions.
3. The repo's **rules file** — conventions, error handling, any lint baseline; plus the overlay's `## Repo law`.
4. `$VAULT/Architect/strong-patterns.md` (if present) — to know the canonical shapes the codebase has been observed to do well. When you propose a fix in Phase 5, **prefer the shape of an existing strong pattern** over inventing a new one. Reference the pattern in the item's `strong_pattern_ref` field.
5. `$VAULT/Patterns/explorer-preferences.md` — to deprioritize finding shapes the user has rejected before.
6. `$VAULT/Explorer/state.md` — to know what *other* explorers are working on right now.
7. `$VAULT/Explorer/coverage.md` — to know last-visit dates and yield per area.
8. `$VAULT/Explorer/passes.md` — to know which items were already rejected per area.
9. The 3 most recent files in `$VAULT/Lessons/` matching `*-explorer.md` (sorted descending) — to absorb recent self-reflection.

### 1c. Stale-claim sweep

In `$VAULT/Explorer/state.md`, any entry whose `claimed_at` is older than 2 hours is **stale** — assume the run was abandoned. Remove stale entries before proceeding. This keeps the file honest without an explicit lock.

### 1d. Snapshot freshness

If the area taxonomy carries a generation timestamp or commit count, compare it to now. If >30 days old OR `git rev-list --count HEAD` has advanced by >200 since it was written, warn but continue:
```
Warning: the area taxonomy may be stale ({N} commits / {D} days since it was generated).
Consider regenerating it after this session.
```

---

## Phase 2: Pick area

### 2a. If user gave a hint

Resolve the hint to one or more contexts in the area taxonomy:
- Exact group name → all contexts under that group.
- Exact context id → that single context.
- Path fragment → contexts whose file lists overlap.
- Keyword → contexts whose keywords match.

If the resolution is ambiguous (>3 plausible areas), present a short numbered list and ask "which one?" before continuing.

### 2b. If user said "pick for me"

Score each context by:
- **Staleness** — days since last visit per `coverage.md` (more days = higher score). Never-visited = max staleness.
- **Past yield density** — items accepted / items surfaced in last 1–2 visits (higher = higher score). Tie-breaker.
- **Active claim penalty** — if the context appears in `state.md` Active section, score = 0 (skip it; pick a different area).

Pick the top-scored context. If multiple tie, pick the one with the smaller file count (faster to scan, tighter feedback loop).

Tell the user which area you picked and why (one short sentence), then a `Next?` menu:

```
Next?
  1. other -> name a different area or context id
  2. proceed with {picked-area}   <- default
  3. abort
```

### 2c. Category filter

If the user's category filter is not `any`, narrow the scan focus accordingly. The area stays the same; the filter only changes what kind of items count toward the 10-item budget.

---

## Phase 3: Claim the area

Append an entry to `$VAULT/Explorer/state.md` under the `## Active` section:

```markdown
- **{area-slug}** - claimed_at: {ISO timestamp}, run_id: {short random id}, category: {filter}
```

This is **informational, not a lock.** Other explorers reading this file will pick a different area. There's no enforcement, but the user said only one explorer runs at a time, so this is sufficient for awareness.

**If the overlay names an `active_runs_ledger`**, also append one entry to it under `## Active`, following the format conventions at the top of that file, declaring the area's paths as your scope. If an existing `started` entry <2h old overlaps those paths, surface the conflict to the user before scanning. With no ledger declared, `git status` is the whole coordination surface: note foreign uncommitted work and never sweep it into your commits.

Print the claim line to the user so they know what's recorded.

---

## Phase 4: Wander the code

Read enough of the area to identify 10 items. Budget your tool calls — don't read every file in a 100-file area. Sample strategically.

### 4a. Sampling strategy

For an area with N files:
- N ≤ 5: read all of them.
- 5 < N ≤ 20: read all entry-point files (the taxonomy's entry points for the context; failing that, the files the rest of the area imports most) + a random sampling of the rest, capped at 10 file reads.
- N > 20: read all entry points + grep-discover the largest files (`Glob` then sort by line count) + sample 5–8 of those.

Use `Read` with offset/limit when files are >500 lines — read top + bottom + a middle slice rather than the full file.

### 4b. What to look for, by category

**Hard exclusion — lint-baseline migrations.** Anything the overlay's `## Baseline exclusions` lists is fix-as-you-touch, never a standalone item. With no overlay, detect the same shape: a lint rule reporting warnings in the thousands is a declared migration, not a finding. Do NOT surface "migrate the raw utility classes in X" or "extract N hardcoded strings from Y" as items. Such items must be *structural* defects (wrong mechanism, broken behavior), not baseline backlog.

For `quality`:
- Dead code, unreachable branches, unused exports.
- Duplicated logic across files (3+ near-identical blocks).
- Misleading names, unclear intent, leaking abstraction.
- Comments that explain "what" instead of "why" — flag the comment, not just the code.
- Commented-out code older than current branch.

For `dx`:
- Test setup boilerplate that could be a fixture.
- Call sites bypassing the repo's own typed wrapper for a boundary (a raw client call where the repo law names a wrapper).
- Repeated try/catch boilerplate that should use the repo's error helpers.
- Build-time hot-paths (large bundles, slow rebuilds) — use recent build output if there is any.
- Missing error context (errors thrown without enough info to debug).

For `ui`:
- Hand-rolled duplicates of shared primitives (spinner, empty state, modal backdrop, tooltip — check the repo's shared-component catalog before calling one missing).
- Visual bugs (overflow, alignment, contrast). Only flag if you can reproduce or strongly suspect from the code.
- Inconsistent spacing/radius/shadow vs the design tokens.
- Missing loading / empty / error states on user-facing components.
- Accessibility gaps that double as UX gaps (missing aria-label on icon-only buttons, focus traps, keyboard nav broken).

For `perf`:
- Unnecessary re-renders (object/array literals in deps, missing `useShallow`, missing memoization on expensive children).
- N+1 queries / IPC calls in a loop.
- Large lists without virtualization.
- `useEffect` chains where one effect depends on another's state (cascade).
- Subscriptions that don't unsubscribe.
- Synchronous work on the render path that could be async.

For `bug`:
- Race conditions (state read-then-write without a transaction, async effects without abort).
- Edge cases unhandled (empty arrays, null/undefined, NaN).
- Stale closures in effects/callbacks.
- Off-by-one, boundary errors.
- Wrong dependency arrays in hooks.
- Errors swallowed silently (catch with empty body or just `console.log`).

For `i18n`:
- Status tokens displayed raw where the repo law names a token-label helper.
- Error messages bypassing the repo's translated-error path.
- Constants carrying a literal label where the convention is a key.
- Feature-scoped locale directories or parallel locale data that route around the repo's single catalog.
- NOT bulk string extraction — that's the lint-baseline exclusion above.

For `a11y`:
- Missing labels on form inputs.
- Color contrast (you can't measure it, but you can flag `text-foreground/40` on `bg-secondary/30` style stacks).
- Keyboard navigation broken (clickable divs without role/tabIndex).
- Missing focus styles.
- Modal without focus trap, escape handler, or backdrop click.

**The cross-layer claim — run this lens in EVERY category, not instead of one.** The lists below are
single-artifact questions, and the highest-value defect in a mature codebase usually is not in any one
artifact: every file is internally consistent and the bug lives in what one layer CLAIMS about another.
Two cheap greps find them:

- **A doc comment with a modal verb about a CONSUMER** — "a consumer that shows this must also show
  X", "the caller must Y", "the term is named for what it measures". Every such sentence is a claim
  about code the module cannot see, and it is unenforced by construction. Open the consumer and check.
- **A rule enforced on one path of a pair** — reads but not writes, POST but not DELETE, the barrel but
  not the deep import, the arming screen but not the receipt. When you find a guard, ask what its
  sibling path does; the asymmetry is invisible from inside either side.

Measured across two sweeps of one mature repo: this lens produced the top finding of BOTH runs and four
of ten items in the second, and in every case the code had already been read by an earlier pass.

For `sec`:
- A visibility/ownership rule applied to reads and not to writes (see the cross-layer lens above) — a
  rule enforced on reads alone is a display rule, not an access rule.
- Externally-reachable surfaces (HTTP routes, IPC commands, webhooks) without auth/validation.
- Privileged subprocess spawns without sandboxing.
- User input directly interpolated into SQL/command strings.
- Credentials logged or surfaced in error messages.
- See `/research` Phase 6 "Security escalation rule" — same logic applies. Auto-promote sec findings to severity `critical`.

### 4c. Honor the deprioritization signals

- If `Patterns/explorer-preferences.md` contains a rule like "user rejects cosmetic CSS findings without a measurable issue," skip those.
- If `Explorer/passes.md` for this area lists items by short fingerprint (file:line + 1-line summary), skip exact matches. A near-match is OK to surface — but note "previously passed; resurfacing because <reason>".
- Cross-check the area's previous sweep notes (`Explorer/sweeps/*-{area-slug}.md`) — don't resurface an item a past run already surfaced, unless its status changed.

### 4d. Dedupe against recent history (one command, seconds)

Before finalizing candidates, run **one** git log over the area's paths:

```bash
git log --oneline -20 -- <area path globs>
```

Drop any candidate whose anchor was plausibly fixed or reworked by a recent commit (verify by reading the current code, not the commit message). If a candidate survives despite recent activity, note "still present after <sha>" in its evidence. This plus passes.md plus prior sweeps is the full dedupe — no deeper archaeology.

### 4e. Stop conditions

- 10 items found → stop scanning, move to Phase 5.
- Exhausted the area without 10 items → widen scope by pulling in the *adjacent* context from the same group in the area taxonomy. Note the widening in the run record. If still <10 after widening twice, stop with what you have and explain the shortfall.
- Tool budget exceeded (>40 file reads) → stop with what you have.

**Do not pad the list** with low-value items just to hit 10. Quality over quota. If you stop short, the run record explains why.

---

## Phase 5: Categorize and structure each item

### Premise verification (hard gate — no item ships without it)

Every item's `anchor` must be a `file:line` **you actually Read in this session**, and its `evidence` must quote or paraphrase the real code at that line. Before presenting, re-Read the anchor lines of any item whose premise came from a grep hit or a sampled slice, and confirm the defect is really there (the guard isn't elsewhere, the "dead" export isn't imported, the "missing" abort isn't in a wrapper — one targeted Grep settles it). Pattern-matched suspicion ("this *usually* means…") is not an item. If verification kills a candidate, replace it or run short — never pad with unverified ones.

For each of the 10 (or fewer) items, capture:

```yaml
- id: 1
  title: "<short imperative phrase, <=60 chars>"
  category: quality | dx | ui | perf | bug | i18n | a11y | sec
  severity: critical | high | medium | low
  effort: xs | s | m | l
  anchor: "<file_path>:<line_number>"
  evidence: "<2-3 sentence explanation of the gap, with verbatim code snippet if helpful>"
  suggested_fix: "<1-2 sentence shape of the fix - not the fix itself>"
  strong_pattern_ref: "<wikilink to Architect/strong-patterns#... entry>" | null
  i18n_impact: "<none | adds new strings (every locale in the same change!) | touches existing keys>"
  cluster_hint: "<other ids that ship naturally with this one, or 'standalone'>"
```

**On `strong_pattern_ref`:** if the suggested fix matches the shape of an entry in `Architect/strong-patterns.md` (proposing a shape the digest already records as load-bearing), set `strong_pattern_ref` to the wikilink. The fix should then **conform to the canonical example** in that entry, not invent a new shape. If no strong pattern applies, leave it null.

### Severity rubric (be honest)

- **critical** — security gap, data loss risk, crash on common path. Drop everything and ship.
- **high** — wrong behavior on the golden path, broken on a common edge case, regression risk if left.
- **medium** — paper cut, confusing UX, small perf hit, latent risk.
- **low** — polish, nice-to-have, taste-level.

If you find yourself rating most items "high," recalibrate downward. A 10-item list typically lands as 0–1 critical, 2–3 high, 4–6 medium, 1–3 low.

### Cluster detection

After categorizing, scan for items that should ship together:
- Same file → same PR.
- Type/function dependency → ship in order.
- Same i18n component bundle → one extraction PR.

Note these in `cluster_hint`.

---

## Phase 6: Present to user

Print a summary table, then per-item detail.

### Summary table

```
#   Cat     Sev    Effort  Title                                              Anchor
─   ─────   ────   ──────  ─────────────────────────────────────────────────  ──────────────────────────
1   bug     high   s       Race in session-resume effect                      src/features/agents/sub_chat/hooks/useResumeSession.ts:42
2   perf    med    xs      Memoize ChatBubble props (renders on every tick)   src/features/agents/sub_chat/ChatBubbles.tsx:118
3   i18n    med    s       Status badge shows raw token, bypasses tokenLabel  src/features/agents/sub_chat/SessionBadge.tsx:31
...
```

### Per-item detail

For each row:
```
[N] {title}
    Category / Severity / Effort:  {cat} / {sev} / {effort}
    Anchor:    {file:line}
    Evidence:  {explanation + snippet}
    Suggested: {1-2 sentence fix shape}
    Follows:   {strong-pattern wikilink + canonical example, or "-" if none applies}
    i18n:      {none | N new keys | touches existing}
    Cluster:   {standalone | ships with [a, b]}
```

If any items are clustered, end the section with a short "Clusters" block:
```
Clusters:
  - [2, 5, 8] - all in ChatBubbles.tsx; ship in one PR. Order: 5 -> 2 -> 8.
  - [3] alone - tokenLabel fix, separate commit.
```

---

## Phase 7: Triage — the small band is auto-accepted

**`xs` and `s` items are ACCEPTED WITHOUT ASKING.** A prompt whose answer is always "yes" is
not a decision, it is a round trip. Measured across three consecutive sweeps of one codebase:
13 of 15 items sized `xs`/`s`, and every single one was accepted. Asking cost three questions
and changed nothing.

The split is not really about size. It is about **who can answer "did this work"**. An
`xs`/`s` item is one the repo's own gates settle — the typecheck, the test, the lint, the
parity check either pass or they do not, and a human reading a summary adds no information.
An `m`/`l` item is almost always one where something outside the gates has to be judged: a
visual design decision, a change to an established pattern, a trade-off with no test. In the
measured runs both `m` items were exactly that (a dual-theme palette redesign; a nine-site
a11y idiom), and both genuinely deserved the conversation.

Two properties make the auto band safe, and both are load-bearing — do not weaken either:

- **The Phase 5 premise gate still applies in full.** Auto-accept changes who approves a
  VERIFIED finding. It does not lower the bar for what becomes one. An item whose anchor you
  did not read, or whose defect you did not confirm at that anchor, is not eligible for any
  band — it is not an item.
- **Every item is its own gated, atomic commit** (Execution rules below), so an unwanted one
  reverts alone, by sha, without touching its neighbours.

### The two bands

1. **Auto band (`xs`, `s`)** — build them. Print the plan first (Option B step 1) so the user
   can interrupt, then execute in risk-ascending order.
2. **Triage band (`m`, `l`)** — ask, and ask ONLY about these:

```
{N} small item(s) (xs/s) accepted automatically - building now.

{M} larger item(s) need your call:

  [3] {title}  (m)  {the one thing only you can decide}
  [7] {title}  (l)  {the one thing only you can decide}

Reply with numbers to action, or:
  all     - action these too
  none    - skip them (still written to the sweep note)
  Enter   - same as "none"   <- default
```

With no `m`/`l` item, **ask nothing**: say what you are building, and build it.

`/explorer <area> --triage-all` restores the pre-v2 behaviour and asks about every item. Offer
it in the `Next?` block when a run's auto band turned out larger or riskier than the user
seemed to expect.

### Sizing is now an approval decision

Because the band gates approval, `effort` must be the honest cost of the WHOLE change: the
edit, its test, its locale parity across every catalog, its doc-sync obligation, its visual
verification. A one-line edit that ships 28 catalog entries in four languages is not `xs`.
**Between two buckets, take the larger one** — over-sizing costs one question, under-sizing
costs an unasked-for change.

And the rule that falls out of why the split works: **an item the repo's gates cannot settle
is `m` at minimum, however small the diff.** If finishing it requires a browser, a credential,
a design judgement, or a "does this look right", then "did this work" is precisely the question
being handed to the user, and handing it over without asking is the one thing this phase must
not do.

For each accepted item, execute it **in this same session**. Same default as `/research`: discover → decide → implement → commit, all in one context window.

### Execution rules

**Single accepted item with a clear anchor (Option A):**
1. Apply the edit at `anchor`.
2. Run validation:
   Run what the overlay's `## Gates` maps to what the item touched; with no overlay, the detected typecheck / lint / test / compile commands — print what you detected. Lint warnings at the repo's known baseline are OK; errors, and NEW warnings in the files you touched, are not.
3. **Stage scoped + verify + commit in ONE Bash invocation** (concurrent sessions rewrite the index between separate calls):
   ```bash
   git add path/one path/two && git diff --cached --stat
   ```
   Never `git add -A`, `git add .`, or `git add -u`. If the cached stat lists **more files than you added**, the index held another session's pre-staged work — `git restore --staged <path>` each unrelated file, re-verify, THEN commit. Never trust the index.
4. Commit atomically: `explorer: <short title>` + Co-Authored-By footer + body explaining the why.
5. **Verify the change landed in YOUR commit**: `git log -1 --format=%h -- <path>`. The index discipline above protects other sessions from you; this protects you from them. A concurrent agent that runs a broad `git add` between your edit and your commit absorbs your working-tree change into *its* commit — your own `git commit -- <path>` then reports "no changes added" and, worse, can commit whatever that session had staged. Measured on a shared checkout, 2026-08-29. If the sha it names is not yours, the fix is already in the tree under someone else's authorship: say so in the run record and do NOT re-apply it. Keep the edit→commit window short; that is the only real mitigation.

**2+ accepted items (Option B):**
1. Print the inline plan (one paragraph per item: file, change shape, validation).
2. Execute in **risk-ascending order** (xs effort first, l last; severity ties broken by category — `bug` before `perf` before `i18n` before `quality`).
3. Atomic commit per item, validation per commit, same one-invocation stage-verify-commit discipline as Option A.
4. If validation fails → fix inline, do NOT stack failing commits. No `--no-verify`, no `--amend`.
5. If a downstream item turns out to be redundant after an upstream commit, drop it and note the drop in the run record.

**Item that needs more thought (Option D — escape hatch):**
Record it in the run record as `decided: deferred` with the reason. Do NOT write a handoff file. The run record is the future search target. Use sparingly — prefer A or B.

### Read the caller before changing a contract

Before an item changes a status code, a return type, a thrown error, or any other thing a caller
branches on, open the callers and check what they do with it. An "obviously more correct" contract
routinely breaks a caller that was written against the old one — a DELETE made to 404 on no-match
"for symmetry" broke an optimistic UI that rolls back on `!res.ok`, restoring a row the database does
not have. Idempotent operations in particular are usually right to stay idempotent.

This costs one grep and is not optional: the item is not done because the tests pass, it is done when
the callers still mean what they meant.

### Repo law — non-negotiable

Every accepted item honors the overlay's `## Repo law` in full: its i18n contract (which locale files a new string must land in, and by which pipeline — a repo with a no-gap pre-commit hook will block you otherwise), its token-label and translated-error helpers, its design tokens and shared-component catalog, its boundary wrappers. With no overlay, read the repo's rules file and follow what it states; where it states nothing, match the shape of the surrounding code rather than inventing one.

**A string-adding item in a many-locale repo is not a paper cut.** If an item would add more than a handful of keys, defer it — that's a session of its own.

If you can't honor the repo law in the change, defer the item — don't ship it half-converted.

### Frontend visual verification

If a change is visually meaningful (UI category, or any change to a rendered component shape), follow the overlay's `## Smoke` to run the app and exercise the affected surface before committing. With no `## Smoke`, state explicitly that you have NOT visually verified. Don't claim "looks good" from code review alone.

---

## Phase 8: Persist the sweep

Write `$VAULT/Explorer/sweeps/{YYYY-MM-DD}-{area-slug}.md`:

```markdown
---
date: 2026-05-01
run_id: {short id}
area: {context-id or group}
files_sampled: {N}
category_filter: any | quality | ...
total_items: 10
auto_accepted: [1, 4, 5]      # the xs/s band - built without asking
triaged: [2, 3]               # the m/l band - put to the user
accepted: [1, 3, 4, 5]        # everything actually built (auto + triaged-in)
declined: [2]                 # only ever from the triage band
deferred: []
commits: [<sha1>, <sha2>]
widened: false
---

# {Area title} sweep - {date}

## Items

### [1] {title}  ✅ accepted -> {commit sha} `{commit subject}`
**Category / Severity / Effort:** {cat} / {sev} / {effort}
**Anchor:** `{file:line}`
**Evidence:** {evidence}
**Fix shape:** {what was actually done; reference commit body for detail}

### [2] {title}  ❌ declined
**Category / Severity / Effort:** ...
**Anchor:** ...
**Evidence:** ...
**Decline reason:** _filled in Phase 9_

### [3] {title}  ⏸ deferred
**Category / Severity / Effort:** ...
**Reason:** {why deferred - concrete blocker, not vague "later"}

...

## Cross-references
- Adjacent areas not yet swept: {list from coverage.md, optional}
- Related preferences: [[Patterns/explorer-preferences]]
```

---

## Phase 9: Self-reflection

### 9a. Ask why for declined items

Only a TRIAGE-band item can be declined, so this question is about `m`/`l` items and nothing
else. **Skip it entirely when nothing was declined** — which, after v2, is most runs. Do not
ask it about the auto band: those were not offered, so there is no reason to collect.

Single batched question:
```
For the declined items, why did you skip them?

  [2] {title}
  [5] {title}
  ...

Reply per-item ("2: too vague, 5: already planned") or one overall reason.

Shortcuts:
  skip    - record "no reason given"
  Enter   - same as "skip"   <- default
```

### 9b. Append to Lessons

Write/append `$VAULT/Lessons/{YYYY-MM-DD}-explorer.md`:

```markdown
## Run: {timestamp} - {area} ({category filter})

Sampled: {N} files
Surfaced: {M} items
Accepted: [list]
Declined: [list] (with reasons)
Deferred: [list] (with blockers)

### Self-reflection
- Categories that resonated: {pattern}
- Categories that didn't: {pattern}
- Calibration drift: {e.g. "rated 7 items 'high' but user accepted only 2; over-weighting severity"}
- Tools to use more / less next time: {observation}
```

### 9c. Backfill the sweep note

Add the decline reasons to the Phase 8 sweep note's `[N] declined` blocks.

### 9d. Update passes.md

For each declined item, append a fingerprint to `$VAULT/Explorer/passes.md` under the area's section (create section if missing):

```markdown
## {area}

- {file:line} - {1-line summary of the rejected suggestion} - pass {date}, run {id}, reason: {short reason}
```

The fingerprint matters — future passes over the same area skip these. Keep entries short.

### 9e. Pattern promotion check

Read all `$VAULT/Lessons/*-explorer.md`. If a decline reason has appeared in **3+ runs** (or close synonym), propose adding it to `$VAULT/Patterns/explorer-preferences.md`:

```
I've seen this 3+ times - promote to permanent rule?
  "{distilled rule}"

Source runs: [[2026-04-12-vault-credentials]], [[2026-04-20-overview-metrics]], [[2026-04-28-agents-editor]]

Next?
  1. promote to Patterns/explorer-preferences.md   <- default
  2. snooze (re-ask after 3 more observations)
  3. drop (don't promote, reset the counter)
```

If the user picks 1, append to `Patterns/explorer-preferences.md`.

### 9f. Update coverage.md

Update or insert the row for this area:

```markdown
## Areas

### {area-slug}

- Last visited: {date}
- Last run: [[Explorer/sweeps/{date}-{area-slug}]]
- Items surfaced (last 3 runs): [10, 8, 10]
- Items accepted (last 3 runs): [3, 5, 4]
- Yield density: {accepted / surfaced average}
- Notes: {anything noteworthy across runs}
```

### 9g. Release the claim

Remove the entry written in Phase 3 from `$VAULT/Explorer/state.md`, and — if a ledger was used — move its entry to the top of `## Recently completed` with the resulting commit SHA(s) (or `aborted (<reason>)`).

---

## Phase 10: Final summary

Print:
```
Explorer run complete.

  Area:           {name} (group: {group})
  Category:       {filter}
  Files sampled:  {N}
  Items surfaced: {M} / 10
  Auto-accepted:  {A} (xs/s, built without asking) -> {commit shas}
  Triaged:        {T} put to you -> {K} actioned, {L} declined
  Deferred:       {D}

  Coverage update: last visit {date} -> {today}, yield density {X}/{Y}

  Files updated:
    + $VAULT/Explorer/sweeps/{date}-{slug}.md
    + $VAULT/Lessons/{date}-explorer.md
    ~ $VAULT/Explorer/coverage.md
    ~ $VAULT/Explorer/passes.md  (if any declines)
    ~ $VAULT/Explorer/state.md   (claim released)
    {if pattern promoted:}
    ~ $VAULT/Patterns/explorer-preferences.md

  Next?
    1. /explorer {staleest adjacent area}                <- default
    2. /explorer {same area, different category}
    3. /research {area}    (external-source companion run)
    4. /architect resume   (drain backlog)
    5. done
```

If zero items were accepted, frame the run as a successful pass over a healthy area. The point is signal, not action.

**Say what you did without being asked.** The auto band is the run acting on the user's behalf,
so the summary owes them a plain account of it: what was built, under which shas, and — for
anything the gates could not settle — what stayed unverified. A run that quietly built five
things and reported a tidy total has taken the round trip it saved and spent it on opacity.
Offer `--triage-all` in the `Next?` block if the auto band ran larger than they expected.

---

## Notes on use

- **Pair with `/research`** — run `/explorer` after a research session that touched a specific area, to immediately surface adjacent gaps the research run didn't cover.
- **Cadence** — daily or every-other-day is a reasonable rhythm. Coverage.md will tell you when the codebase is uniformly fresh and you should switch to `/architect` instead.
- **Coexist with uncommitted work.** Multiple CLIs and editor sessions share the working tree. Explorer never stashes, resets, or discards anything it didn't author. Each commit stages **only the specific paths** the explorer touched (`git add path/one path/two`); never `git add -A`, `git add .`, or `git add -u`. If an item's anchor file already has uncommitted changes from someone else, surface it: "this file already has changes — commit them first, or layer on top?" Default to layer-on-top if the user doesn't pick. Forbidden at all times: `git stash`, `git reset --hard`, worktree-touching `git restore` / `git checkout --` on paths the run didn't author, `git clean -f`. (`git restore --staged <path>` to unstage a foreign pre-staged file is allowed — it never touches the working tree.)
- **The auto band changes what a decline MEANS.** Before v2, a decline was the main calibration
  signal and `passes.md` was fed mostly by small rejected items. Now the only declinable items are
  `m`/`l`, so `passes.md` fills slowly and a run of zero declines says nothing about calibration.
  Read the SHORTFALL instead — how often a run stops short of 10 — and the user's reaction to the
  auto band. A user who starts reverting auto-accepted commits is the v2 equivalent of a decline
  streak, and it means the sizing rubric is running small, not that the findings are wrong.
- **Drift signal** — if 3+ explorer runs in a row produce 0 accepted items, the calibration is off (severity bar too low, or area was wrong). Trigger a self-reflection: read the last 3 sweeps and ask the user "what shape would have actually been useful?"

## App context coverage (Personas-managed repos)

This skill declares `contexts: tracked` — the Personas app measures per-context memory coverage for it. When run inside a Personas-managed repo (a `.personas/` dir exists, or the app dispatched this run), before finishing append JSON lines to `.personas/memory-outbox.jsonl` at the repo root (append, never rewrite) — one node per context you meaningfully worked on:

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name the app knows>","skill":"explorer"}
```

**Which name — this is the part that silently fails.** The ingest anchors a node
by matching `context` against the names the app actually knows, case-insensitively.
A name it does not recognize is NOT an error: the node is stored with a null
context and simply never counts toward coverage. Use the name set the overlay's
`coverage_context_source` declares; with no overlay, use the context map's names.
**A repo whose map and whose app disagree must say so in the overlay** — a
mechanically generated map and a product-level taxonomy can share almost no names,
and anchoring to the wrong one loses every node silently.

Always set both `"skill":"explorer"` and `"context":"<name>"` — together they drive the per-skill context-coverage % (last 30 days). The app ingests and deletes the file when the session ends. Skip silently when not Personas-managed.

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

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"explorer@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/explorer/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - explorer` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/explorer` in a consuming repo is a symlink to `<registry>/skills/explorer` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/explorer` and `git -C <registry> commit -m "skill(explorer): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/explorer/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/explorer` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
