---
name: architect
description: "Heavy structural codebase scan - surfaces weak patterns to upgrade and strong patterns to codify, and proves whether the repo's own gates (lint rules, hooks, CI checks, type rules, test guards, ratchets) still fire, producing ADR-style decisions with a durable cross-session backlog. The highest-risk / highest-payoff scan in the suite; walks the context map area by area. Modes: scan (one theme, parallel-angle sweep), area (one area), gates (inventory every gate touching a theme, state what it checks versus what the standard wants, and prove it fires with a planted-violation probe on a scratch copy - fires / silent / partial N of M / unprobed), resume (refresh and execute one queued decision), status (read-only - re-measure every pending ADR, classify still-valid / re-sized / done-elsewhere / stale, re-date the backlog). Every surviving finding ends as an ADR, a lint rule / CI gate / test guard, a scoped rollout plan, or a shrink-only ratchet pinned to the dry-run count."
argument-hint: "[scan|area|gates|resume|status] [theme or area]"
category: workflow
memory: vault
contexts: tracked
version: 1.10.1
model: sonnet
---
# Architect

Heavy-hitter codebase scan for **structural patterns** — both weak ones to upgrade and strong ones to codify. Designed for rare, deliberate, high-effort sessions where the payoff is a class of bugs eliminated, a tech swap landed, or a convention promoted from "tribal knowledge" to "lint-enforced rule."

This is the highest-risk, highest-payoff skill in the suite. It pairs with `/research` (external sources) and `/explorer` (per-area paper cuts) — those handle the small and the medium; `/architect` handles the large.

The method is **repo-agnostic**: it reads whatever context sources the repo actually has for its taxonomy, and keeps a vault for a durable backlog of architectural decisions that span multiple sessions. Everything one repository is — its vault root, context documents, gates, area menu, conventions — lives in the overlay below, and every key has a default, so the run works in a repo that carries no overlay at all.

**Deliverable contract — every finding ends as an artifact.** An architect run that produces observations without enforcement artifacts is a failed run. Each finding that survives triage must terminate as exactly one of: **(a)** an ADR-style vault note (Phase 7b/8a), **(b)** a lint rule / CI gate / structural-test proposal (Phase 7B), **(c)** a scoped rollout plan with per-PR steps (the ADR's Rollout section), or **(d)** a **shrink-only ratchet pinned to the dry-run count** — the enforcement dry run (Phase 7c step 4) lists today's offenders, that list becomes the allowlist, a new offender fails, a converted site must delist itself, and the list may only shrink. (d) is the sanctioned terminal artifact for a partial migration too large for one session: a one-session gate that does not pretend the migration happened. A proven negative (Phase 3d) terminates as (b) — the gate that keeps the bug class absent, either an existing gate proven to fire or a proposed one. Only `drop` verdicts are artifact-free, and they are recorded with a reason. If you reach Phase 12 with a surviving finding that has none of the four, the run is not done.

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
knowledge_registry: ../ai-registry    # local checkout of the org's knowledge registry  [read .ai/manifest.yaml `registry.local`; else none]
knowledge_domains: [software-engineering]  # which domains govern this repo  [.ai/manifest.yaml `knowledge.domains`]
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
| `## Knowledge registry` | where the governing standards live, and which subjects map to which themes/areas. **This is the authority a finding is measured against** — a repo-local convention is evidence, the registry subject is the standard | resolve `knowledge_registry`; if it exists, the subject map is `knowledge/<domain>/index.json` → `subjects["<slug>"].file`. Absent → the scan judges against repo-local convention only, and says so |
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

### Q1 — Mode

```
Mode? (Enter = scan)
  1. scan      - pick a theme, parallel-agent sweep        <- default
  2. area      - bound the sweep to one area
  3. gates     - prove the theme's gates still fire (probe on a scratch copy)
  4. resume    - drain the backlog (skip scanning)
  5. status    - read-only: refresh every pending ADR, re-date the backlog
```

`gates` asks Q2a (the theme) and runs § Gates mode in place of Phase 3. `resume` and `status` skip the rest of Input — after Phases 0-1, load [resume and status](references/resume-status.md) and go straight to Phase 9 or its § Status mode. Status reads a pending ADR's governing subject (Phase 1b step 0) only when re-sizing that ADR needs it.

### Q2a — Theme (scan and gates modes)

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

Theme is required for scan and gates modes — `pick for me` (option 10) is fine, but a one-word vague free-form theme yields shallow findings; if option 1's input is too thin, re-ask.

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

If the user's first message is ambiguous about mode (e.g. just `/architect`), present Q1; if they typed `resume`, `status` or `gates` directly, take that mode without asking.

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
- **Categories of finding** — `weak-pattern | strong-pattern | tech-swap | structural-bug-class | convention-gap | enforcement-gap | proven-negative`
- **Risk** — 1 (low, isolated) … 5 (production-critical surface)
- **Effort** — `s | m | l | xl`
- **Reach** — concrete number: "{N} files / {M} call sites / {K} components" — never vague.
- **Payoff** — 1 (incremental) … 5 (eliminates a recurring bug class or unblocks a major future)

---

## Coordination

With no `active_runs_ledger` in the overlay, `git status` is the whole coordination surface: note foreign uncommitted work and never sweep it into your commits. When the overlay names a ledger, follow § Coordination in [the execute reference](references/execute.md) before the first working-tree edit (Phase 7 or 7B) and again at session end.

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

If any vault file Phase 1 reads is missing (`Architect/` with `scans/` and `decisions/`, `backlog.md`, `strong-patterns.md`, `weak-patterns.md`, `coverage.md`, `Patterns/architect-preferences.md`), load [the bootstrap templates](references/vault-bootstrap.md) and create what is missing from them. `Lessons/` is shared with the other skills — don't recreate.

---

## Phase 1: Load context & memory

### 1a. Context-source check

Resolve the overlay's `## Context sources` (or the defaults in § Constants). Report which exist and which do not in one line. **Nothing here stops the run** — a missing source narrows the scan, and saying so is the honest opening. If the repo has a command that regenerates a missing source and the overlay names it, offer it as a `Next?` option rather than blocking.

### 1b. Read in order

0. **The governing registry subjects — read these BEFORE the sub-agents are briefed.** Resolve the overlay's `## Knowledge registry`, then for the chosen theme (or the area's dominant concerns) open the subject through `knowledge/<domain>/index.json` — `subjects["<slug>"].file`, never a path built from the slug — plus the techniques whose `use_when` matches. This is not background reading; it changes what the run produces:
   - A finding becomes a **deviation from a named standard** instead of one reviewer's opinion, which is what makes it survive triage.
   - It stops the run from "discovering" what the standard already says, and from proposing a fix the standard has already rejected.
   - It can **overturn a strong-pattern candidate**: a repo-local habit that looks load-bearing may be a documented anti-pattern, in which case codifying it would have entrenched the wrong thing.
   - Where the repo is right and the registry is silent, that gap is a **contribution back** — see the `registry` vehicle in Phase 7B.
   Paste the relevant standard into the sub-agent briefs (Phase 3b) so angles measure against it too. If no registry resolves, say so in the opening line and judge against repo-local convention.
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
### Gates mode → § Gates mode, then Phase 3c onward
### Resume mode → Phase 9 ([resume and status](references/resume-status.md))
### Status mode → § Status mode in the same reference; read-only, and the run ends there

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

   **Swap rule — enforcement coverage.** When the repo's rules file, the overlay's `## Gates` / `## Lint vehicle`, or a custom-rule directory names gates, replace angle 5 with **enforcement coverage**: inventory every gate touching the theme and state what each observes versus what the standard wants observed (§ Gates mode, G1-G2). The angle reports; the main session runs the probes (G3), because a read-only agent does not create scratch worktrees. A gate with zero violations for its whole life is invisible to every defect-shaped angle — this is the angle that sees it.

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
Background: {1 paragraph from the architecture digest relevant to the theme;
            every number followed by the command that produced it}

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

**Every number in a brief carries the command that produced it, or is omitted.** The receiving agent treats a background number as fact, and a quick `grep -c` is usually the wrong predicate — two such counts sent two agents spending their budget refuting them.

**If the harness refuses an agent** (a concurrency cap — nested builders count against it — or a "do not retry" reply), do not retry and do not drop the angle: run its brief yourself in the main session, sequentially. The brief is the thinking; the agent is only the throughput. Mark each such angle `main session (agent refused)` in the scan note and count it as an angle, not a sub-agent. A theme that reduces to a countable predicate degrades well (one reproducible instrument beats five estimates); one that needs wide semantic reading degrades badly — say which this was.

### 3c. Synthesize

Merge the sub-agent reports into a single pattern model. Look specifically for:

- **Convergence** — multiple angles flagging the same module → high-confidence finding.
- **Conflict** — one angle calls something a strength, another calls it a weakness → investigate; usually means context-dependent (strong in module A, weak in module B).
- **Surprise** — something none of the angles expected → likely the most valuable finding of the run.
- **Internal precedent** — the same pattern implemented TWICE at different levels of rigour, where one copy drifted. Actively look for these: for each weakness, ask "does a correct version of this already exist somewhere in the tree?" They are the cheapest findings a mature repo offers — the design argument is already won, the rationale can be quoted from the correct copy's own comment, and the fix is mechanical rather than invented. A close cousin is the **unfinished generalization**: a documented fix (a helper, a hook, a guard) applied to one call site while the others still carry the defect.
- **Reach quantification** — every weakness has a concrete count: "47 files, 12 components, 3 stores."

If sub-agent reports are thin (smell strengths all 1-2, inconsistencies few), the area is healthy in this theme. **Say so explicitly** and offer to either pick a different theme or downgrade the run to "passive scan, no findings to action." Don't manufacture findings to fill a quota.

### 3d. Output structure

After synthesis, you should have:
- 0–8 **weak-pattern findings** with reach, risk, effort, payoff.
- 0–4 **strong-pattern findings** worth codifying.
- 0–2 **tech-swap proposals** (replace lib X with Y) — only when smell strength is ≥4 AND swap unlocks payoff a refactor can't.
- 0–3 **structural-bug-class** findings — recurring bugs whose root is structural (e.g. "every effect that polls leaks because we have no `useInterval` primitive — fix the missing primitive, not 14 effects").
- 0–3 **proven negatives** — a bug class the run feared and measured absent: the predicate, the command, the count (zero), and the gate that keeps it absent (an existing gate proven to fire, or a proposed one). A clean sweep is not a null result: it converts a suspected weakness into a codifiable strength, and a rule that ships at `error` with nothing to migrate is the cheapest gate a repo will ever get. Runs under-report these because a clean sweep reads as nothing found — list them. Each is recorded in the scan note and as a strong-patterns entry with `Kept absent by: <gate or none>`.
- 0–4 **enforcement-gap** findings (gates mode, or the enforcement-coverage angle) — a gate that is `silent` or `partial`.

Cap total findings at **8**; proven negatives are listed beside them and do not count against the cap. If you have more, rank by `(reach × payoff) / (risk × effort)` — reach = the first integer in `reach` — and drop the bottom.

---

## Gates mode: prove the theme's gates fire

Replaces Phase 3a-3b when Q1 picked `gates`; Phase 3c onward runs as usual. It exists because in a repo whose laws are already gates, the yield moves from the code to the enforcement layer: a lint selector silently overridden by a later config block, or a rule enforced by a hand-listed array covering 8 of ~200 sites, produces no violations, no symptom and no drift — the only observable is the gate itself. Scope: one theme; budget about 30-40 minutes.

### G1. Inventory

Every gate that touches the theme, by kind: **lint rule** (custom rules and config selectors), **hook** (git hooks, pre-commit / pre-push), **CI check** (workflow steps, required jobs), **type rule** (compiler strictness flags, type-level brands), **test guard** (structural / invariant tests), **ratchet** (allowlists, baselines, count caps). Sources: the overlay's `## Gates`, `## Lint vehicle` and `## Test guard vehicle`, the rules file, linter and compiler config, hook directories, CI workflows, `package.json` scripts. Read the **resolved** configuration wherever the tool can print it (a linter's print-config for a file in scope, the compiler's show-config): a source file can declare a selector that a later block overrides, and only the resolved config shows it. A gate kind that does not touch the theme is listed as `n/a` in one line, never omitted.

### G2. What it checks vs what the standard wants

One row per gate: what it OBSERVES (its predicate and its scope — globs, listed sites) versus what the governing standard (Phase 1b step 0; else the repo law) wants observed. Two shapes recur: the gate watches a **proxy** rather than the target, and the gate's **scope is a hand-kept list**. For a scoped gate count M, the sites the standard covers, with an independent walker — never the gate's own list — and N, the sites the gate covers.

### G3. Prove it fires — by probe, never by reading

For each gate, plant the exact violation it exists to catch on a scratch copy, and run the gate. A gate that watches other gates (a config-resolution guard, a meta-test) is probed with each theme rule shadowed in turn, not only its own family:

- **Never in the user's tree.** Prefer a tool's stdin mode with a virtual path when it has one (a linter's `--stdin --stdin-filename <a path in scope>` writes nothing; check its output, since a virtual path the linter ignores exits 0 with a warning and reads as silent). Otherwise a temp detached worktree: `git worktree add --detach <scratch>/gate-probe HEAD`, dependencies shared as in the execute reference 7a. Clean it up the same run: remove a `node_modules` junction with `rmdir` first (a recursive delete follows it into the main checkout), then `git worktree remove --force <scratch>/gate-probe` and `git worktree prune`.
- **Pair every probe with a control.** The planted violation must fail the gate and an otherwise identical clean file must pass. Without the control, "fires" cannot be told from "always red".
- **Read the exit status from the gate itself**, never through a pipe, and read its output: a failure raised by some other rule is not this gate firing.
- **Record the probe command** in the scan note, so the next run and the fix's own test can re-run it.

Each gate ends **fires** (violation caught, control clean), **silent** (violation passes), **unprobed (<why>)** (no safe probe, e.g. a hook that runs only on push; never counts as fires), or **partial** (fires on the probe but covers N of M sites, or catches some anti-shapes the standard names and not others). A silent or partial gate is an `enforcement-gap` finding, and its fix is not done until the probe is kept as a test (a canary violation, or an assertion on the resolved config) so the gate cannot go silent again. A gate that fires plus a measured zero of its violations is a proven negative (Phase 3d).

### G4. Hand over

With no gate touching the theme, say so and offer `scan` instead — an empty enforcement layer is a `convention-gap` finding only where the standard names a gate. Otherwise synthesize as Phase 3c (G2's proxies and partial scopes are findings in their own right) and continue at Phase 3d.

---

## Phase 4: Surface against existing memory

Before presenting, cross-check every finding against:
- `$VAULT/Architect/strong-patterns.md` — if you're flagging a "weakness" in something previously identified as strong, the user's expectation has changed; flag the conflict explicitly. A strong-pattern entry a later run refutes gets a dated `Conflict:` line with the evidence, never a silent deletion.
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

For enforcement-gap, use the weak-pattern block plus three lines — `Gate:` (kind and file), `Checks / wants:` (G2's row), `Probe:` (the command, then fires / silent / unprobed / partial N of M). For a proven negative, one block: `Predicate:`, `Command:`, `Count: 0`, `Kept absent by:` (a gate proven to fire, or the proposed gate).

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

- **execute now** → load [the execute reference](references/execute.md) and run Phase 7. When more than one finding is marked execute-now, run them as one session **sequenced by ascending risk**, with the gate re-run between findings so a regression is attributable to the finding that caused it. State the sequence before starting. Do not ask the user to reduce the set — they chose it.
- **queue** → proceed to Phase 8 (write ADR + add to backlog).
- **drop** → record in scan note as `decided: dropped` with reason. Pattern-track in Lessons (Phase 10).
- **rework** → ask: "what shape would actually fit?" Capture user's reframe, update the finding, re-present. If they don't have a clear redo, queue it as `proposed (needs reshape)` so a future scan can revisit.

Strong-pattern findings and proven negatives have a different triage (for a proven negative, `codify` means shipping or keeping the gate that holds it absent):
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

Load [the execute reference](references/execute.md) when triage marked any finding `execute now` or a resume picked one, and read it in full before the first edit. It carries 7a isolation (worktree by default, feasibility-tested for EVERY gate class), 7b the ADR template (with `reach_cmd`), 7c pre-flight (inspect, classify and coexist with foreign work; baselines with numbers AND exit status; the counted enforcement dry run and the shrink-only ratchet), 7d atomic commits (exact-path staging, a `--name-only` index check, a line-ending check, the repo's own commit convention, never `--no-verify`), and 7e-7h final sweep, ADR status, repo law and visual verification.

At every phase, never `git stash`, `git reset --hard`, `git restore` / `git checkout --` on a path, `git clean`, or `git add -A` / `.` / `-u`.

---

## Phase 7B: Codify strong patterns

Load [the strong-pattern procedure](references/codify-patterns.md) when triage selected `codify`, `snooze`, or `drop` for a strong pattern. Read the complete reference before handling that branch. With no such decision, continue to Phase 8.

---

## Phase 8: Backlog the queued decisions

For every finding marked **queue** in Phase 6, and every strong pattern or proven negative marked `note` or `codify`, load [the backlog entries](references/backlog-entries.md): 8a a stub ADR (the 7b template at `status: proposed`, with its `reach_cmd`), 8b the backlog line, sorted by `(reach × payoff) / (risk × effort)`, 8c the weak-patterns / strong-patterns entries. Never persist a strong pattern marked `drop`; an aging one marked `drop` is deleted, not tombstoned.

---

## Phase 9: Resume and status

Load [resume and status](references/resume-status.md). **Resume** prints the backlog, picks one decision, refreshes its ADR (9c: anchors, `reach_cmd` re-run, acceptance criteria re-measured against the tree, classified still-valid / re-sized / done-elsewhere / stale, delta presented before anything executes), then executes through Phase 7; a finding the resume uncovers becomes its own backlog entry (9e). **Status** runs 9c over every pending ADR, read-only, re-dates `backlog.md`, and ends with `resume N`.

---

## Phases 10-12: Close out

Load [close-out](references/close-out.md) once the triage work is done, for scan, area, gates and resume runs: Phase 10 self-reflection (drop reasons, Lessons, pattern promotion, architecture-digest update, coverage.md), Phase 11 the scan note (including its gate-probe table and proven negatives), Phase 12 the final summary and its `Next?` block.

---

## Notes on use

- **Cadence** — once a week is plenty. Architect runs are heavy; the backlog absorbs the inventory and resume mode amortizes the work.
- **Scan vs resume** — alternate. Scan to fill the queue, resume to drain it. A backlog of 20 pending items means the next session should be resume, not scan; a backlog not refreshed in 30 days gets a `status` run first, so the resume picks from today's numbers.
- **Coexist with uncommitted work.** Where the repo law declares parallel-safety primitives, this is the pattern they describe — keep the two aligned. Architect never requires a clean baseline on a shared checkout: inspect what's there, edit only its own paths, stage only those paths, and verify the staged index before every commit (Phase 7d step 6). Never `git stash`, never `git reset --hard`, never `git checkout --` someone else's work. Physical isolation comes from the worktree default (Phase 7a), not from cleaning the shared tree.
- **Conflict signal** — if a finding contradicts a `strong-pattern` already in the vault, treat it as the most interesting finding of the run. Either the strong-pattern entry is stale (codebase moved on) or the new finding is wrong. Either way, the answer changes the model meaningfully.
- **Drift signal** — if 3 consecutive scans on different themes produce backlog items but zero get executed via resume, the user is using architect as a brainstorming tool, not a shipping tool. Surface this in self-reflection: ask whether to lower the bar for execution or accept that the backlog is the artifact.
- **Tech swaps are the riskiest** — never propose a swap with reach ≥100 files unless smell strength is 5. A reach-280 swap (the react-hook-form example) is a multi-week project; the ADR's Rollout section should reflect that with 5–10+ atomic PRs.

## App context coverage (Personas-managed repos)

This skill declares `contexts: tracked`. When a `.personas/` directory exists in the MAIN checkout — resolve it from `git rev-parse --git-common-dir`, never `$PWD`, since a worktree has none — or the Personas app dispatched the run, load [the coverage procedure](references/personas-coverage.md) before finishing. Skip silently otherwise.

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

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"architect@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
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
node <registry>/scripts/log-run.mjs --skill architect --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"architect","outcome":…,
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
