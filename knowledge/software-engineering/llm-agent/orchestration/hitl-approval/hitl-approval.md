---
layer: golden-path
type: golden-path
subject: hitl-approval
status: forged
techniques:
  - gate-state-machines
  - human-performed-steps
  - consent-gates
  - review-queues
  - unattended-mode
  - decision-records
  - resume-after-decision
  - severity-sla-ladder
  - cosmetic-vs-enforced-threshold-invariant
  - fail-loud-classification-default
  - fixed-policy-amendable-plan
---

# Human-in-the-loop approval

An autonomous system earns its autonomy by knowing when to stop. Human-in-the-
loop approval is the discipline of pausing a machine at a consequence boundary
and handing the decision to a person — and the design of the pause matters as
much as the design of the action. Done well, the mechanism concentrates human
judgment exactly where it changes outcomes. Done carelessly, it degrades into
one of two failure states that look nothing alike and are equally fatal: a
prompt the machine can talk its way past, or a click the human performs without
reading. Everything in this subject exists to prevent those two endings.

The subject owns **two flows that are mirror images of each other**:

- **The review flow** — the machine has *produced* something (a draft, a plan,
  a change set) and a human evaluates the output before it takes effect.
  The gate sits between production and effect.
- **The consent flow** — the machine *wants to act* and asks the human for
  authorization before execution: first use of a new capability, an action
  with disclosed impact, a step beyond the granted autonomy level. The gate
  sits between intent and execution.

Review gates output after it exists; consent gates action before it happens.
They share everything that matters — the pending state, the decision surface,
the durable record, the continuation — which is why they are one subject and
not two. A system that builds them separately builds the same machinery twice
and then lets the two copies disagree about what a decision means.

## A third flow: the human does the work

Both flows above keep the machine as the actor — in each, the human decides and
the machine does. There is a third case with no gate in it at all, and it is
handled worst for exactly that reason: **the machine must not perform the step,
so the human performs it.** Credentials nobody should hand to a process, an
action bound to a person's identity, a physical act, a provider's terms that
bind the human rather than their tools.

The default output for it is prose — a numbered list — and prose hands the
person the whole task: tracking position, retyping values the machine already
holds, judging whether each step worked. The human was needed for *authority*,
not for bookkeeping. The right artifact is an **executable runbook** that
sequences the work, holds the state, prompts for exactly what only they can
supply, verifies what it can, and resumes where it stopped.

It must be **deterministic** — written by a model, never run by one — which is
what makes it reviewable before a production credential is pasted into it, and
what keeps that credential off any inference path. And the flow is not closed
until the runbook hands back a record of what ran and what was verified, in the
same vocabulary the other two flows use.
[human-performed-steps](./techniques/human-performed-steps.md) owns it, including
the rule that a capability existing only to compensate for a tooling gap states
the condition under which it should be deleted.

## What none of the three flows governs: the machine's own terms

All three flows above gate an **action**. None of them governs the **scope** the
machine was given — the allowed paths, the forbidden operations, the checks that
define done, and against those, the route it currently intends to take. That
record is normally written once at dispatch and treated as static, and the habit
holds because both repairs look wrong on sight: a plan the executor cannot amend
is defeated by the first fact that arrives after dispatch, and a plan it *can*
amend is a policy whose first edit removes whichever constraint was working.

The resolution is to split the record by **write authority rather than by
content**. The trust boundary — what may change, what must not happen, how
success is checked, when to stop and ask — is fixed and lives outside the
executor's working context. The route inside that boundary is the executor's to
revise, and every revision leaves a record naming the fact that made the old one
wrong. Which side a mid-run change falls on is then a trigger predicate like any
other in this subject: inside the boundary it is an amendment and no gate fires;
requiring the boundary to move, it is an escalation, and the executor may propose
the new policy but never adopt it
([fixed-policy-amendable-plan](./techniques/fixed-policy-amendable-plan.md)).

This is the flow that keeps the gate map mostly white space under sustained
autonomous work. Without it, every unforeseen fact reaches the operator as an
approval request, and the attention budget the rest of this subject exists to
protect is spent on events where no judgment was ever required.

## When a gate is mandatory

Not every action deserves a gate — most must not have one, or the mechanism
dies of fatigue (below). A gate is *mandatory* when any of these hold:

- **Irreversibility.** The action cannot be undone at acceptable cost:
  deletion, sending, publishing, signing, overwriting the only copy. The gate
  is the last moment the mistake is free.
- **Spend.** The action commits real resources — money, quota, paid capacity.
  Budgets are a human contract; the machine executes them but does not get to
  extend them.
- **External visibility.** The action's effect leaves the boundary of the
  system: a message to a third party, a post, anything a customer or outsider
  will see. Inside the boundary, errors are bugs; outside, they are incidents.
- **Low confidence or first exposure.** The machine is doing something novel —
  a capability never used before, an instruction it is unsure it understood, a
  situation outside its trained competence. Novelty is a risk signal even when
  the action class is otherwise safe.

The complement is equally load-bearing: **actions that cannot change the world
need no gate**. Reads, previews, dry runs, and queries are exempt *by design*,
not by oversight — gating them spends the human's attention budget on events
where their judgment cannot matter. A correct gate map is mostly white space.

## The gate lives in the substrate, not the prompt

Telling the machine "always ask before deleting" is a request, not a gate. A
gate is only real when it lives in the layer that *executes* the action — when
the action's sole path to effect passes through a structural checkpoint that
inspects recorded state, and no output the machine produces can move that state
by itself. The distinction is not pedantic; it is the whole mechanism. A
prompt-level gate holds exactly as long as the machine behaves, and the
scenario the gate exists for is the one where it doesn't — misunderstanding,
hallucinated authority, injected instructions, or plain drift. A gate the
gated party can open is a decoration
([gate-sees-target](../../../_laws.md#gate-sees-target)).

Two corollaries:

1. **Transition authority is separated from work authority.** The identity
   that produces the work cannot be the identity that approves it. In code
   terms: the decision write comes from the decision surface, authenticated as
   the human, and the executor verifies the recorded state — never a claim of
   approval carried in the requester's own message.
2. **The human decides on the real thing.** The decision surface shows the
   actual content, diff, or disclosed impact — not a summary produced by the
   same untrusted process being gated. A summary written by the gated party is
   the fox describing the henhouse door.

## Anatomy of a gate

Every gate, in either flow, has five parts; skipping any one of them produces
a recognizable defect.

| Part | What it is | Defect when missing |
| --- | --- | --- |
| **Trigger predicate** | the condition that arms the gate — action class, threshold, first-use, confidence | gates fire arbitrarily, or everything is gated |
| **Pause state** | a durable pending record; the system survives restart while waiting | a crash while pending silently loses the question |
| **Decision surface** | where the human sees pending items, with enough context to decide in place | decisions stall, or are made blind |
| **Decision record** | who decided what, when, on which version, having seen what | approvals cannot be audited or bounded |
| **Continuation** | approve → resume; reject → cleanup; timeout → policy | approved work re-runs from scratch, rejected work lingers as a zombie |

The pause deserves emphasis because it is the part naive implementations get
wrong first: a pending decision **must be durable state, not a live process
blocked on an answer**. Humans answer in minutes, hours, or days. Any design
where the question exists only in a running process's memory has decided that
a restart, a deploy, or a crash silently discards the question — and a
discarded question defaults to whatever the code does next, which is never a
decision anyone made.

## The decision is a record, not an event

An approval that exists only as a state flip is unauditable and unboundable.
The decision is a first-class durable record: **who** decided, **what verdict**,
**when**, on **which exact version** of the gated thing, having been shown
**what disclosure**. From this record two properties follow that the whole
mechanism depends on:

- **Approval binds to what was approved.** If the gated content changes after
  the verdict, the approval is void and the gate re-closes. Approval of
  version N is not approval of version N+1, however small the diff.
- **Approval does not travel.** A verdict is a fact about one (actor, action,
  target, version, context) tuple. Approval in one context does not extend to
  the next occurrence, the next target, or the broader category — unless a
  consent rule *explicitly* grants that scope, recorded as such. Silent scope
  creep is how "I approved one message" becomes "it has been sending messages
  for a week".

The full treatment — record shape, immutability, reuse boundaries, learning
from rejections — is the [decision-records](./techniques/decision-records.md)
technique.

## Gate fatigue is the failure mode that kills the mechanism

Every prompt for human judgment debits a finite attention budget. When the
budget is overdrawn, the human does not stop approving — they stop *reading*,
and click approve reflexively. At that point the mechanism is dead while every
metric says it is healthy: gates fire, decisions are recorded, the audit trail
is immaculate, and no judgment is occurring anywhere in it. A rubber stamp is
worse than no gate, because it manufactures accountability for decisions
nobody actually made.

Fatigue is a *design* failure, not a user failure, and every technique in this
subject carries part of the countermeasure:

- **Tier by consequence.** Gate the four mandatory categories; exempt reads
  and reversible acts; let everything in between earn a gate with evidence.
- **Remember decisions with explicit scope.** First-use consent that is
  recorded and honored means the second use asks nothing
  ([consent-gates](./techniques/consent-gates.md)).
- **Batch the homogeneous.** Twenty items of identical shape and risk are one
  decision, not twenty ([review-queues](./techniques/review-queues.md)).
- **Make the opt-out honest.** When an operator genuinely wants the machine to
  run ungated, an explicit, scoped, expiring, audited unattended grant is the
  truthful form of that trust — reflexive approval is the dishonest form of
  the same thing ([unattended-mode](./techniques/unattended-mode.md)).
- **Learn from verdicts.** A gate whose approvals run near 100% for months is
  measuring nothing; its trigger belongs at a higher threshold. Rejection
  reasons are the highest-signal input for tuning triggers.

## Defaults are part of the design

Three defaults recur, and each has exactly one safe direction:

- **Closed by default.** New capabilities, new action classes, and unknown
  requests start gated (or denied), and openings are enumerated — an
  allowlist, not a blocklist. A blocklist gates yesterday's risks.
- **Timeout is deny or hold, never proceed.** A pending decision must not be
  immortal — it expires on a named schedule
  ([creation-names-reaper](../../../_laws.md#creation-names-reaper)) — but expiry
  resolves to the safe verdict. "Nobody answered, so it went ahead" is the
  mechanism executing the exact outcome it was built to prevent.
- **A failed decision write is a failure, not a decision.** If recording the
  verdict fails, the gate stays closed and the surface says so; the one thing
  the mechanism may never do is let a lost write be indistinguishable from a
  verdict ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## The clock, and what feeds it

Two facts about every pending item arrive from outside the gate itself: how
long it may wait, and how severe it is. Neither is free, and both have a
characteristic way of going wrong.

The waiting is answered by a **ladder** — one table, keyed by severity, giving
each severity a deadline and one terminal action
([severity-sla-ladder](./techniques/severity-sla-ladder.md)). Its terminal
actions number three, not two: auto-approve, escalate, and *hold* — the
deadline passes, the item stays pending and starts showing as overdue, and
nothing is decided. A ladder without the third rung has nowhere to put the
severities that genuinely require a person, so it resolves them by picking the
least-bad automated action instead. And where a ladder does auto-approve, that
is not an exception to "timeout is deny or hold" above; it is a claim that the
actions at that severity never met the bar for a gate in the first place. If
any of them is irreversible, spends, or leaves the boundary, the rung is a
defect wearing a policy's clothes.

A ladder that acts acquires a **second, cosmetic ladder** the moment the queue
renders — the elapsed times at which a row starts *looking* urgent. The two get
tuned by different people for different reasons, and the invariant between them
is that the cosmetic one fires strictly earlier at every severity, asserted in
running code rather than described in a comment
([cosmetic-vs-enforced-threshold-invariant](./techniques/cosmetic-vs-enforced-threshold-invariant.md)).
Inverted, the machine acts while the screen is still calm, and the operator's
model of the system and the system diverge at precisely the moment that costs.

Severity itself is a claim read out of an item's payload, so it has a failure
case: an item whose payload cannot be read takes the **most** severe bucket and
carries a marker saying why
([fail-loud-classification-default](./techniques/fail-loud-classification-default.md)).
The cheap default is the mildest bucket, and it is quiet, which is exactly what
makes it dangerous — composed with a ladder whose mildest rung auto-approves,
an unreadable payload belonging to a genuinely critical event is approved by
the machine with nobody ever having seen it.

## The techniques

- [gate-state-machines](./techniques/gate-state-machines.md) — the gate as
  enumerated, durable state on the gated entity; transitions only a human can
  drive; approval invalidation on change.
- [human-performed-steps](./techniques/human-performed-steps.md) — the third
  flow: executable runbooks for work the machine must not do, deterministic and
  secret-safe, and the retirement condition a compensating one carries.
- [consent-gates](./techniques/consent-gates.md) — the machine-asks-human flow:
  first-use consent, informed consent with impact disclosure, the autonomy
  dial, revocation.
- [review-queues](./techniques/review-queues.md) — one surface for pending
  judgment: context to decide in place, batch verdicts, write-back
  reliability, queue hygiene.
- [unattended-mode](./techniques/unattended-mode.md) — the explicit opt-out:
  scoped, expiring, audited auto-approval that goes *through* the gate rather
  than around it.
- [decision-records](./techniques/decision-records.md) — the durable verdict:
  who/what/when/why/what-was-shown, immutability, and the reuse boundary.
- [resume-after-decision](./techniques/resume-after-decision.md) — the
  continuation half: approve→resume without re-generation, reject→cleanup
  without zombies, staleness checks at resume time.
- [severity-sla-ladder](./techniques/severity-sla-ladder.md) — one table from
  severity to deadline and terminal action; the closed three-member action set,
  and why hold is the member that makes it honest.
- [cosmetic-vs-enforced-threshold-invariant](./techniques/cosmetic-vs-enforced-threshold-invariant.md)
  — the urgency ladder fires strictly before the enforcing one, and the
  relation is asserted at load by the side that acts, never documented.
- [fail-loud-classification-default](./techniques/fail-loud-classification-default.md)
  — an unreadable payload classifies to the most severe bucket with a marker
  saying why; the quiet default is the one that gets things waved through.
- [fixed-policy-amendable-plan](./techniques/fixed-policy-amendable-plan.md) —
  the fourth flow: the executor's scope split by write authority, so a route
  change records itself and only a boundary change reaches a human.
