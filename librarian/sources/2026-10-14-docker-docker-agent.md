---
source: github:docker/docker-agent
kind: repository
url: https://github.com/docker/docker-agent
title: "docker/docker-agent: agent builder and runtime, read for its budget and approval design"
author: Docker Engineering
words: 635 (landing page via ingest); in-tree sweep read about 9,000 words of operating docs (budget, permissions) plus 6 Go files
extracted: 7
accepted: 5
declined: 0
leads: 1
already_covered: 2
untriaged: 0
dispatched: 0
applied: 2
shipped: 0
run_id: intake-dockeragent-1014
siblings: 2
rescan_when: a release changes the budget or safety-mode semantics (the budget doc or pkg/runtime/toolexec/permissions.go); or 8 weeks elapse (2026-12-09)
---

# An agent runtime read for its budget and approval design: five techniques, two homes

**Class:** vendor repository over a runtime in the tree (a Go agent builder with a
TUI, an API server and MCP/A2A serving). The ingest returned the landing page (635
words), which is the advertisement; the run cloned the tree at
`f412343dc305` (2026-10-13) and swept the operating documents first
(`docs/configuration/budget`, `docs/configuration/permissions`), then the
instrument (`pkg/runtime/budget.go`, `pkg/runtime/toolexec/permissions.go`,
`pkg/runtime/native_compaction.go`, `pkg/runtime/session_compaction.go`,
`pkg/safety/safety.go`), then `AGENTS.md`. The hooks reference (about 12,000 words), the
sandbox page, the multi-agent page, the changelog (about 57,000 words) and the
other 1,200 Go files were **not read**; they are the unswept half of this tree.
Siblings live at start: 2 (`hv-se-1014` harvest, `seo-0ctl14` intake), holding
agent-memory, quality-gates, accessibility; no subject overlap. Fetches: 0 of 3
(the tree is the primary).

Expected yield, said before the table: a system with many subsystems and a corpus
that already holds 1,800 techniques in its domain, so most rows are catches and
the yield is in the asymmetries.

## Design record

Two systems, counted separately (Phase 2d).

**System A: run budgets.**

```
decision:  delegated and nested runs charge the root run's tracker, never a copy
forces:    a fan-out of N children multiplies a per-agent allowance to N x C
buys:      the ceiling bounds the run, not the loop
rejects:   per-child allowances and per-child division (the doc says so)
where:     pkg/runtime/loop.go:277 "against one wallet rather than one allowance per child."
stage:     tracker construction, at the root stream entry
corpus:    cost-metering; per-run scope exists, delegation does not. NONE for the sub-case
```

```
decision:  a time ceiling sums turn durations; it is not a clock
forces:    a session stays open while a person reads and types
buys:      the ceiling expires on work, not on attendance
rejects:   wall-clock since session open
where:     docs/configuration/budget/index.md:103 "the sum of their turn durations"
stage:     the unit of the accumulator
corpus:    NONE (one-deadline-across-attempts is a request deadline, a different mechanism)
```

```
decision:  the summarizer is checked before, charged after, and its refusal is a skip
forces:    compaction fires when the session is long, which is when the ceiling is near
buys:      an exhausted ceiling stops cleanly, not as a broken session
rejects:   exempting internal calls; failing the session on refusal
where:     pkg/runtime/native_compaction.go:109 "errCompactionBudgetExceeded"
stage:     the amplifier list in the spend-path enumeration
corpus:    cost-metering names retries, not the summarizer. NONE
```

System A: three NONE, one home (cost-metering, existing). Technique triple in an
existing subject.

**System B: tool-call approval.**

```
decision:  a never-prompting fail-closed profile over a three-valued classifier
forces:    headless and served runs have nobody to ask
buys:      an unanswerable gate resolves to a verdict, not a hang or a silent pass
rejects:   prompting anyway; approving everything
where:     pkg/runtime/toolexec/permissions.go:127 "Restricted is the fail-closed profile for"
stage:     the (policy x label) table
corpus:    hitl-approval holds the open grant (unattended-mode); the closed default is NONE
```

```
decision:  rules carry the tier of their writer; an author's ask is advisory
forces:    an agent file may arrive from a URL or a registry
buys:      the user's chosen mode cannot be re-promptified or loosened by the file
rejects:   later or more specific source wins
where:     pkg/runtime/toolexec/permissions.go:104 "Team-tier ask is advisory under Balanced/"
stage:     rule evaluation
corpus:    settings has precedence of values, not authority to relax. NONE
```

```
decision:  config schema versions are frozen packages; only the latest is edited
where:     AGENTS.md "Older config types are **frozen**"
corpus:    self-describing-model-packages/config-frozen-artifact. CATCH
```

System B: two NONE, one home (hitl-approval). Whole tree: five NONE across two
systems. Per-system counts at three and two, both homes exist, so neither is a
forge job and the XL trigger (shared HOME IF NEW) does not fire. Routing: stay in
intake; no handoff.

## Triage table

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
|---|------|-------|-----|-------|-----------|--------|-------|------|----------|
| 1 | K | design/technique | M | One pot across delegation | cost-metering | new-technique | 2/0/2 | real gap | accept |
| 2 | K | design/technique | M | Time ceilings count working time | cost-metering | new-technique | 2/0/2 | real gap | accept |
| 3 | K | design/technique | M | Housekeeping calls obey the ceiling | cost-metering | new-technique | 2/0/2 | real gap | accept |
| 4 | K | design/technique | M | Fail-closed profile for headless | hitl-approval | new-technique | 2/0/2 | real gap | accept |
| 5 | K | design/technique | M | Author advisories yield to the user's mode | hitl-approval | new-technique | 2/0/2 | partial, promoted | accept |
| 6 | K | design | S | Unpriced spend is flagged, not zero | cost-metering/price-tables | none | 1/0/1 | likely catch | already covered (price-tables, "default for unknowns: loud, conservative, counted") |
| 7 | K | design | S | Frozen older config versions | config-frozen-artifact | none | 1/0/1 | likely catch | already covered |

Rules each row ran under: all seven are upper-layer rows and ran under the score.
No currency row. Scores are +2 over a threshold of +2: GAIN 2 (new technique in a
subject outside the scan's top 15), RISK 0 (the director opened the code and the
documentation). `auto=5/2/0`, `fp=0`. V1: no category was touched (techniques land
in existing subjects). Row 5 was `partial` (settings owns value precedence); the
promoting question, "does settings own authority to relax, not only supply a
value?", was answered by reading its techniques' `use_when`: it does not.

## Corrections the run made to its own draft

- The first draft of technique 5 said relaxations come only from the owner. The tree
  disagrees: an author-tier allow rule relaxes the fail-closed fallback
  (`docs/configuration/permissions/index.md:147`). The technique now records the
  hole instead of claiming the guarantee.
- Technique 2 narrows the interactive "proceed anyway" in `budget-enforcement`:
  a ceiling declared by the person running the agent in their own configuration is
  terminal, since the override is the edit. The older text is kept and bounded, not
  reversed. A reviewer should look at that sentence first.

## Landed

- `cost-metering`: `one-pot-across-delegation`, `time-ceilings-count-working-time`,
  `housekeeping-calls-obey-the-ceiling`; three Go applications against the source
  tree (anchors checked with `check-anchors`, 21 of 21 held after two line fixes).
- `hitl-approval`: `fail-closed-profile-for-headless`,
  `author-advisories-yield-to-the-users-mode`; two Go applications.

## Apply (Phase 7.5)

Seams searched in one managed project (personas); other projects not read.

- `one-pot-across-delegation`: personas keeps a run-level ledger keyed by one shared
  run id, so evolution cycles, fitness replays and pipeline nodes already draw from one
  pot by identity. Seam chosen to falsify: the breeding path, which registers its own
  ceiling for the measurement phase only (`breeding-measure-<run>`), leaving the
  generation phase under no run ceiling. Mode simulation (three real cases), verdict
  unmeasurable.
- `fail-closed-profile-for-headless`: personas builds every headless CLI invocation
  with the open permission flag, and restricts only through a persona-declared tool
  roster (no roster, no restriction). That is the opposite default. Not changed: it is
  a posture decision for the owner, and a change would affect every persona run.
  Mode simulation, verdict unmeasurable.
- The other three techniques have no seam in the one project read; they are unapplied
  with the return condition "when a managed project grows the seam".

## Leads

- **Hooks reference and sandbox page** (about 15,000 words, unread). Return: when a
  harvest or intake round targets `agent-runtime-assembly` or `untrusted-extension-host`.

## Directions not proposed

`directions=0/1`: personas and the open-permission default (above), left as an
observation, not a proposal, because the scope question (does personas run
unreviewed agent definitions?) is the owner's to answer.

## What would change this run's read

If the runtime's hooks page shows a pre-tool hook that can deny under the open
profile, technique 4's table needs a fifth column; not read.
