---
layer: application
type: application
subject: cost-metering
technique: one-pot-across-delegation
stack: go
status: forged
verified_on: 2026-10-14
verified_against: go@1.27
---

# One pot across delegation in an agent runtime (docker-agent)

Read from a clone of `docker/docker-agent` at commit `f412343dc305`. The stack
version is the one the tree witnesses: `go.mod` declares `go 1.27` with
`toolchain go1.27.2`. Nothing here was run; every statement is a read of the
tree at that commit.

## What the tree does

The runtime installs a budget set once per *root* stream and lets every
sub-session reach it. The code says why in a comment at the install site:
`pkg/runtime/loop.go:277 "against one wallet rather than one allowance per child."`
The guard is a root test, so a delegated session never builds a tracker:
`pkg/runtime/loop.go:272 "rootStream := !sess.IsSubSession()"`.

Nested runs that are not delegation get the same treatment by injection. The
compaction runtime is constructed with the parent's budget,
`pkg/runtime/session_compaction.go:365 "withSharedBudget(budget)"`, and that
option does two things: replace the tracker set and mark the budget as already
started (`pkg/runtime/budget.go:345 "r.budget = budget"`).

Named ceilings follow the same identity rule, and the documentation states the
reason as the whole point of the feature:
`docs/configuration/budget/index.md:74 "A name is one shared pot"`. Distinct
pots are expressed by distinct names.

## Where the tree stops short of the technique

- **The pot is per runtime object, not durable.**
  `docs/configuration/budget/index.md:97 "Budget counters are in-memory, not persistent quotas"`;
  a rebuilt runtime starts at zero even when stored cost totals are restored.
  The technique says to state that scope; the tree does, in its user
  documentation, and it has no ledger-backed alternative inside this feature.
- **Attribution is kept beside the total.** The tracker carries a per-actor map,
  `pkg/runtime/budget.go:35 "perAgent  map[string]*agentSpend"`, and the
  snapshot sorts it by cost: the breakdown the technique asks for.

## What this realization cannot do

It cannot protect against a child started *outside* the runtime, such as an
external harness process: the documentation says external harness execution
does not use the native enforcement loop. The ceiling covers work that goes
through the runtime's own loop and nothing else, and the technique's
enumeration step is what would find the gap.
