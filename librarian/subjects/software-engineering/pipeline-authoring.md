---
subject: pipeline-authoring
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# pipeline-authoring

First note: [[2026-09-04-opik]] — /intake, round 11.

## State

6 techniques, 3 applications (node x2, process x1).

## 2026-09-04 — /intake `opik`

New technique `foreign-config-replay`, and one `node--` application carrying its
A/B.

The gap the subject had: `runtime-pipeline-generation` says the generator reads
its inputs explicitly, and treats an input as a *value*. One class of input is a
**program another tool executes** — a hook runner's config, a test framework's
collection rules. A generator that fans out one unit per configured check has to
compute an answer that tool owns and usually will not expose, and the moment it
does, the repo holds two implementations of one selection semantics. The drift
is directional and silent: when the generator's model is narrower, a check is
never scheduled and both surfaces report green.

Four rules landed. Replay the tool's matcher rather than author a second
opinion; **declare the modeled subset in the generator and fail closed at config
load** on anything outside it — which is the deliberate counterpoint to
`change-scoped-work-selection`'s fail-open-on-scope rule, and the note is worth
keeping: the two rules govern different moments (a deliberate config edit vs a
runtime crash on a real change) and collapsing them loses the reason either is
right. Address a generated unit by the tuple that isolates one configured entry,
because a tool's own ids are routinely non-unique in its own config and the
collision renders as a pass. Keep mirrored upstream defaults in one dated table
and prefer configuration that removes rows from it.

Applied `task`/`better` against a fleet desktop app at n=11: 3 of 11 local hook
jobs had no CI counterpart, including a secret scan that was consequently the
only enforcement of its own control. First step shipped on a branch — a parity
checker that ships red deliberately.

## Boundary recorded

`quality-gates/policy-projection` is the near neighbour and the finding is its
dual: policy-projection covers a policy *described* in many places drifting
downward from the enforced one; this covers the enforcement tool's policy being
re-implemented by a *planner*, where the failure is not understatement but a
gate that never runs. Stated in prose on this side; no cross-bundle link needed
since both are in `software-engineering`, but the two subjects should not absorb
each other.

## Still open

Scope parity, not just presence. The application's own "what this cannot do"
section names it: a check present on both sides may still be narrowed
differently in each, and the instrument shipped reports that as covered. The
full replay is written down as an unstarted step in the project's plan.
