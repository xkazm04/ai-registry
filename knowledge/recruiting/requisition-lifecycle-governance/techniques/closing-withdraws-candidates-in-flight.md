---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: closing-withdraws-candidates-in-flight
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, every-decision-names-its-actor, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [designing what closing a role does, a role was closed and its candidates were never told, deciding how a cancelled or frozen requisition ends for the people in it]
---

# Closing withdraws the candidates in flight

Closing a requisition is not a status change. It is an event that ends the
process of every person still inside it, and if the implementation only touches
the requisition row, those people are not ended — they are **stranded**.

The stranded state is precise and worth naming, because it is the single most
common candidate-experience failure in this area. The candidate sits in an
active stage: screened, scheduled, interviewed, awaiting a decision. They were
never rejected, so no decline was ever generated; they cannot advance, because
nothing is advancing; and no queue will ever surface them, because every
operational view filters to live roles. They wait, follow up once or twice, and
then correctly conclude they were ghosted. From the organisation's side nothing
appears to have gone wrong: the role closed cleanly and the dashboard is tidy.

This is the exact failure
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
forbids. The role was cancelled, the budget was pulled, someone else was hired
— all of these are the organisation's circumstances, and none of them entitle
it to end a person's process by silence.

## The close is a cascade

Design closing as one operation with three effects, in this order:

1. **Enumerate everyone still in a non-terminal stage on this requisition.**
   This is the step that gets omitted, and it must not be a report a human is
   asked to run afterwards.
2. **Move each of them to a terminal outcome, attributed to the close.** The
   outcome's cause is *the requisition closed* — a fact about the role, not a
   judgement about the person. Store the cause; downstream copy depends on it.
3. **Queue the communication that terminal outcome implies.** Queue, not
   assume: the message is a separate deliverable with its own owner and its own
   failure modes, and a close that marks people rejected without emitting
   anything has produced silence with better bookkeeping.

**Atomicity matters.** If the requisition flips closed and the cascade runs
later — a nightly job, a background task, a follow-up click — then the window
between them is exactly the stranded state, and any failure in that window
makes it permanent. The requisition's close and the pipeline's termination
belong in one transaction; the *communication* may be asynchronous, but the
state change may not.

**The cascade must be scoped exactly as the status write is.** If the close
writes the requisition's status by identity but the withdrawal is filtered — by
team, tenant, owner, or any other partition — then a mismatch between the two
scopes withdraws *nobody* while reporting a successful close. This is the worst
failure in the family, because it is silent stranding that passes its own
tests: the role goes closed, the response says it worked, and an entire team's
candidates stay in flight on a retired role.

**Attribution travels with it.** Who closed the role, when, and why is what
lets anyone answer the candidate who asks —
[every decision names its actor](../../_laws.md#every-decision-names-its-actor).
A cascade whose terminal outcomes trace to nothing but a system actor leaves
every downstream conversation unanswerable. Emit a per-person event, not just a
status flip: the event is what the candidate's own timeline renders, and a
status change with no event produces a timeline that skips the moment their
process ended.

## The terminal outcome must be its own kind

The outcome the cascade writes is not "rejected". It is a distinct terminal
kind that **nothing else in the system ever writes**, and that distinctness pays
for itself three times over:

- **Honesty.** A person withdrawn by a close was not passed over. Filing them
  as rejected writes a judgement that was never made, and every downstream
  surface will then explain it as one.
- **Reversibility.** Because only the close writes it, the reopen can select
  exactly the entries this close withdrew — and nothing else. A candidate a
  human rejected, or who declined, or who was moved elsewhere, carries a
  different kind and is deliberately left where they are. **A reopen must never
  undo a human's merit decision.**
- **Reuse.** Downstream re-engagement — surfacing strong past candidates for a
  new role — needs to know these people were never turned down. A distinct kind
  makes them findable; a generic rejection buries them with people who were
  actually declined.

Two mechanical corollaries. The cascade touches the *outcome* only and leaves
the person's stage alone, so restoring the outcome returns each of them to
exactly where they stood before the close. And people already at a terminal
stage in the good sense — someone hired out of this very requisition — are not
swept up by it; the cascade's target is the still-in-flight, not the merely
non-final.

## Reporting the cascade honestly

"Nobody was in flight" and "the withdrawal step itself failed" are different
facts, and rendering both as *closed, zero withdrawn* — or as nothing at all —
is the same honest-null error that afflicts uningested roles. The first is a
successful close of an empty pipeline and should be confirmed as such; the
second means the requisition is closed and its people are **not**, which is the
stranded state arriving through the back door and needs to be visible and
actionable.

This matters most where the close commits before the cascade runs. If the two
cannot be made one transaction, the failure of the second half must be a
first-class, surfaced outcome rather than a logged error — because the role now
reads as closed to every operational view, and nothing else will ever bring
those people to anyone's attention.

## What it must read as to the candidate

The wording belongs to the status-transparency sibling, and its settled answer
is the right one: a closed requisition reads to the candidate as **not
selected**, *without implying anything about their merit* — because nothing
about their merit was decided. The role ended; that is the whole fact.

What this technique owes that boundary is what it *stores*: the distinct
terminal kind, which is what stops a downstream surface explaining a closure as
a decline on the merits, and no more of the internal circumstance than the
consequence — *the budget was pulled*, *there was an internal candidate*, *the
manager left* are the requisition's politics, not the candidate's business.

Where the record is ambiguous about whether someone was still in flight, resolve
it in their favour and tell them —
[uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate).
A redundant "this role has closed" to someone already declined is a small
irritation; a missing one is a person waiting indefinitely.

## Decision rules

- **When closing, count the pipeline first and show the number.** "Closing this
  role will end the process of eleven people" is the single most effective
  correction to a careless close, and it costs one query.
- **When candidates should be preserved rather than terminated** — the role is
  being merged into another, or reposted at a different level — that is a
  **transfer**, an explicit operation with the candidates' knowledge, not a
  silent survival through a close. Silently carrying people across roles moves
  a person into a job they never applied for.
- **When a role is frozen indefinitely, close it.** Leaving it live to avoid
  the cascade is the stranding failure chosen deliberately.
- **When reopening, restore deterministically and up front — never as a side
  effect of re-sourcing.** Re-running the matcher and letting it incidentally
  revive whoever it re-selects leaves everyone else stranded in a terminal
  state with a lying timeline, and records no reopen event at all. Restore by
  the distinct terminal kind, in one transaction, with a per-person event, and
  do it independently of whether sourcing then succeeds.
- **When restoring, guard the write on the kind you expect.** A conditional
  update makes a lost race to a concurrent writer a no-op instead of a double
  restore with a spurious event.
- **When people are restored, telling them is a separate decision.** They were
  informed their process ended; re-engaging them is an outreach act with its own
  consent question, owned elsewhere, and never an automatic consequence of a
  state change.
- **When a close is undone within minutes** (a misclick), the cascade must be
  reversible in the record and the *communication* must be cancellable while
  still queued — which is one more reason to queue it rather than send inline.
- **Never let the pipeline outlive the requisition's counting.** If a role is no
  longer counted as open, its candidates must no longer be counted as active;
  two views of the same reality that disagree is how stranding survives a
  review.

## When not to use this

- **Where closing genuinely means completion for everyone** — every candidate
  already terminal, the hire started — the cascade finds nobody and costs a
  query. Run it anyway; the empty case is the cheap one and the assumption that
  it will be empty is what removes it from the code path.
- **For a candidate withdrawing themselves.** That is their decision on one
  application, not a requisition event, and it must not touch the role's state.
- **As a communication mechanism.** This technique guarantees that a terminal
  state and a queued message exist. Whether the message is honest, humane and
  actually delivered belongs to the rejection and communication siblings.
