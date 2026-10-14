# Close-out: Phases 10-12 (architect reference)

Loaded once triage and its execute / codify / backlog work are done, for every `scan`, `area`, `gates` and `resume` run. A `status` run skips Phases 10-12 entirely (its output is the refreshed backlog).

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
- Last scan: [[Architect/scans/{date}-{theme}-{mode}]]
- Findings (last 3 scans): [8, 4, 6]
- Findings actioned: [3, 1, 2]
- Yield density: {actioned / surfaced}
- Notes: {observations across runs}
```

---

## Phase 11: Persist the scan

Write `$VAULT/Architect/scans/{YYYY-MM-DD}-{theme-or-area-slug}-{mode}.md` (e.g. `2026-10-14-error-handling-gates.md`, so a gates and a scan run on one theme and day do not collide):

```markdown
---
date: 2026-05-01
mode: scan | area | gates | resume
theme: state-management | (n/a for resume)
area: vault | (n/a unless area mode)
sub_agents_spawned: 4
angles_run_in_main_session: 0   # angles the harness refused and you ran yourself
gates_probed: 0                 # gates mode, or scan with the enforcement-coverage angle
findings_proven_negative: 0
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
the full reports in working memory; otherwise omit. Mark each angle
"sub-agent" or "main session (agent refused)".}

## Gate probes
{gates mode or the enforcement-coverage angle only - one row per gate:
gate | checks | standard wants | probe command | fires / silent / partial (N of M) / unprobed (why)}

## Proven negatives
{each feared bug class found absent: the predicate, the command, the count (0),
and the gate that keeps it absent - existing (probe proven) or proposed}

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

  Mode:           {scan | area | gates | resume}
  Theme/area:     {theme or area name}
  Sub-agents:     {N} angles ({M} run in main session)
  Findings:       {weak} weak / {strong} strong / {swap} swap / {sb} struct-bug / {eg} enforcement-gap
  Proven negatives: {P}
  Gates probed:   {G} -> fires {F} / silent {S} / partial {P} / unprobed {U}

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
    + $VAULT/Architect/scans/{date}-{slug}-{mode}.md
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
    3. /architect gates      - prove this theme's gates still fire
    4. /architect status     - refresh every pending ADR (read-only)
    5. done
    {if a worktree was created: also note "merge worktree-architect-{slug}, then
     remove the worktree (.claude/worktrees/architect-{slug}) and delete the branch"}
```
