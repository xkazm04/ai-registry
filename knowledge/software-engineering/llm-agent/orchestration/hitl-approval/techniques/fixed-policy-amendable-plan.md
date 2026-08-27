---
layer: technique
type: technique
subject: hitl-approval
technique: fixed-policy-amendable-plan
status: forged
laws: [gate-sees-target, silent-state-is-ungoverned, creation-names-reaper]
shared_with: []
use_when: [a dispatched executor hits a fact that makes its assigned plan wrong, an agent widened its own scope and nothing recorded that it had, deciding which mid-run changes an executor may make alone and which must escalate, every deviation from the brief routes to a human and low-risk work has become slower, the task's constraints live in the same context the executor can rewrite]
---

# Fixed policy, amendable plan

The three flows this subject owns all gate the machine's *actions*. None of
them governs the machine's **terms** — the scope it was given, the route it
intends to take, the definition of done it is working against. That record is
usually treated as static, written once at dispatch and never revisited, and
the treatment survives because both ways of fixing it look obviously wrong:

- **A plan fixed at dispatch meets facts that were not available at dispatch.**
  The dependency turns out to be abandoned, the test the task assumed exists
  does not, the file the change belongs in is not the one anybody named. An
  executor that cannot amend either stops — and the operator performs the
  re-dispatch by hand, which is the expensive half of the work — or it does the
  amended thing anyway while reporting against the original plan.
- **An executor that can edit its constraints edits the one blocking it**,
  which is by construction the one that was working. A policy the gated party
  can rewrite is a decoration
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)); the specific form
  here is that for a model with a file-writing tool, *in its editable context*
  and *editable by it* are the same property.

Both are real, and they are not in tension once the record is split by **write
authority rather than by content**.

## The two tiers

**The fixed tier — the executor reads it and can never write it.** It holds
the four answers that make the task bounded: what may change (the allowed
paths and write scope), what must not happen (the forbidden operations), how
success is checked (the validation commands, as commands and not as prose),
and the condition under which the executor stops and asks. This is the trust
boundary, and it lives *outside* the executor's working context — recorded by
the harness, supplied to the executor as a read, never as an editable region
of its own prompt or workspace.

**The amendable tier — the executor writes it, and every write leaves a
record.** It holds the route: the order of work, the approach chosen, the
files it expects to touch *within* the allowed paths, the intermediate steps.
This tier exists because the alternative is not a disciplined executor, it is
a silent one.

An amendment is a transition with a required shape. It records what changed,
**the fact that made the previous plan wrong**, and which fixed-tier
constraint the new plan was checked against. An amendment that names no new
fact is a preference wearing an amendment's clothes, and it is the one to
reject in review. The record is not bookkeeping: an unrecorded amendment is
exactly the private epistemic state that
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
names — the executor's belief about what the task now *is*, shaping the
outcome, reachable by no rule, gate or reviewer downstream.

## The discriminator, which is a trigger predicate

The split is only worth building because it decides, mechanically, which
mid-run changes cost a human anything:

- **The change stays inside the fixed tier** — a different file within the
  allowed paths, a different order, a different approach that the same
  validation commands still judge. *Amend, record, continue.* No gate fires.
- **The change requires the fixed tier to move** — a path outside the allowed
  set, an operation on the forbidden list, a validation command that cannot
  pass as written, a success condition that has turned out to be wrong.
  *Stop and escalate.* The executor may **propose** the new policy; it may not
  adopt it.

That is what keeps the gate map mostly white space without letting the
boundary go soft. Without the amendable tier, every encounter with an
unforeseen fact presents to the operator as an approval request, and the
attention budget this subject spends its whole design protecting is drained by
events where no judgment was required.

**This does not weaken
[gate-state-machines](./gate-state-machines.md)'s rule that only a human
drives a gate transition.** An amendment is not a verdict. A verdict says a
gated thing may take effect; an amendment says the route changed inside a
scope that was already granted. Conflating them fails in both directions:
treat every amendment as a verdict and the human is buried in decisions that
were never theirs; treat a verdict as an amendment and the executor has
approved itself.

The same two-tier shape governs a different record elsewhere in this domain —
a companion's constitution is fixed while its self-model accretes, and the
amendment procedure is deliberately the slow path
([constitution-self-model-split](../../../companion/companion-identity/techniques/constitution-self-model-split.md)).
What that subject protects is identity; what this one protects is scope. The
recurring rule is that the two halves of a governed record want different
write authorities, and a design that gives them the same one has picked which
failure it gets.

## Tuning the fixed tier, and what it costs to get wrong

The fixed tier's cost is asymmetric and both directions are quiet.

- **Too narrow and the boundary leaks** — the forbidden list gates yesterday's
  risks, which is the failure the subject's closed-by-default rule already
  answers.
- **Too broad and every task escalates.** Over-broad forbidden-command
  patterns are the reported failure of harnesses in real use: legitimate work
  matches a pattern written for a destructive neighbour, the amendment lane
  never fires, and the operator is back to reflexive approval — gate fatigue
  reached by the route that looks most responsible. Tune it from the same
  signal the golden path names for gate triggers: the rejection reasons, and
  any rung whose escalations are approved near-unanimously for weeks.

**The amendment record is task-scoped and names its reaper**
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). Stale
task state read by a later session as current policy is a reported failure
mode of exactly this machinery: the abandoned route is indistinguishable from
the standing one unless the record expires with the task that owned it.

## What this cannot do

An amendment trail explains why the *plan* changed. It does not explain why
the *task* failed, and the two get confused precisely when someone needs the
answer. A failed run whose amendment history is complete still requires a
person to interpret the outcome — which route was abandoned too early, which
escalation should have fired and did not. Building the trail buys reviewable
scope change; it does not buy self-describing failure, and a harness whose
post-mortem story is "read the amendments" has not built one.

## The evidence, and its shape

One practitioner's recorded harness data over four weeks in mid-2026: 173
recorded task harnesses across 104 sessions and 10 real project workspaces,
of which 144 reached a completed state at least once and 155 recorded
validation or review evidence, with enforcement blocking an action 133 times
across 69 sessions. The reported weaknesses are the load-bearing part — that
plans needed legitimate amendments *more often than the author expected*, that
forbidden patterns ran too broad, and that stale task state confused later
sessions.

This is one designer's harness, so it is an existence proof and not a
distribution: it establishes that the amendment lane is the normal case rather
than an edge case in sustained real use, and that its two tuning failures show
up quickly. It does not establish a rate anyone else should plan against.
