---
layer: technique
type: technique
subject: codebase-scanning
technique: reconcile-before-the-cut
status: forged
applied: blind-ab
ab_verdict: better
laws: [failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [a periodic sweep hands its top few findings to fix workers or a human, a worker fixed something a branch or open PR already fixed, errors keep arriving after the fix merged, a sweep's top three came back with nothing left to do, designing the triage step of an unattended start-of-day sweep]
---

# Reconcile before the cut

[finding-lifecycle](./finding-lifecycle.md) verifies a candidate against the
current tree before filing it. A sweep that hands its top few findings to
workers needs one more check, because the current tree on the default branch
does not show the work that is already moving: a fix on an open pull request,
a commit sitting unpushed on someone's live checkout, a branch another session
holds, a fix merged but not yet deployed. To the tree and to the error stream,
each of those looks like an open defect. A sweep that skips this check sends a
worker to write a fix that already exists, and the two copies then collide at
merge time.

## The check, and what it reads

For each candidate, before ranking is final, ask whether something in flight
already claims it. Look in four places, from the cheapest to the most often
missed:

1. **Open change requests** whose diff touches the finding's location, or whose
   description cites its identity.
2. **Branches not yet merged**, local and remote, that touch the same unit.
3. **Live working copies and session claims**: unpushed commits on a checkout
   another session is using, and any claim a coordinator holds on the path.
   This place is missed most often, because it is not on the forge at all.
4. **Merged but not yet in effect**: a fix on the default branch whose deploy,
   release or rollout has not reached the place the signal comes from.

Match on the finding's stable identity and its containing unit, not on the
title, because a fix rarely names the alert it fixes
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## Reconcile first, then cut

The order matters. A sweep that ranks, takes the top three and only then checks
for in-flight work can come back with one actionable item, or none, while the
fourth- and fifth-ranked items wait a whole cycle. Run the check over the
ranked list before truncation, so the slots go to work nobody is doing. The
disclosed-truncation rule in finding-lifecycle still applies; the report says
how many candidates were set aside as in flight.

## An item in flight is attached, not dropped

A reconciled item leaves the dispatch list but stays in the report, attached to
the work that claims it, with the condition that reopens it:

- **Open or unmerged**: reopen if the change is closed without merging, or goes
  stale past a stated age.
- **Merged, not yet in effect**: signals from before the fix takes effect are
  expected and say nothing about the fix. Signals that continue after it takes
  effect are the fix failing. That is louder than a new finding and goes to the
  top of the next sweep.

## A listing that failed is not an empty listing

If the change-request query timed out, a remote was unreachable, or a live
checkout could not be read, the sweep does not know what is in flight. It must
not conclude that nothing is
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Dispatch with the gap named in the worker's brief: the worker checks for the
duplicate before writing anything.

## When not to use it

- **A single author with no parallel work.** If nothing else can be in flight,
  the check has nothing to find.
- **Weak overlap.** A change request that merely touches the same file is not a
  claim on the finding. Attach only on a match of identity or unit, and
  otherwise dispatch with the possible overlap noted. Refusing to dispatch on a
  guess spends the slot as badly as the duplicate would.
