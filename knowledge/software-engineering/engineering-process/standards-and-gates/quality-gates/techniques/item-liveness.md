---
layer: technique
type: technique
subject: quality-gates
technique: item-liveness
status: forged
laws: [creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [an item has sat at the same stage for a year, a backlog whose active count nobody believes, deciding what happens to work whose owner left, an entrance criterion that is never re-checked after admission]
---

# Item liveness

[gate-liveness](./gate-liveness.md) asks whether the checker still works,
and answers that a gate green for a year is unverified machinery. The
question has a mirror that pipelines with long-lived items almost never
ask: **is the item still alive?** Both failures have the same shape — the
default reading is the reassuring one, nothing emits a signal when it stops
being true, and the state persists precisely because it is invisible.

An in-flight work item is reported as active. Nothing about it changes when
its owner stops working on it, changes teams, or leaves. The row stays on
the board, the headline count keeps including it, and everyone reading the
board infers that somebody is on it. The inference is wrong for a large and
growing fraction of any long-lived pipeline, and the fraction is
measurable today from data the pipeline already keeps.

## An entrance criterion checked once is a birth certificate

The standard way a pipeline binds ownership is an entrance criterion:
before an item may enter the first real stage, a named owner must commit to
advancing it. This is correct and it is not enough, because it is the one
entrance criterion that **decays continuously after admission**. Test
coverage does not un-write itself. A design document does not become
unwritten. A person's attention ends, and nothing in the item's record
changes when it does.

A public standards pipeline with a decade of history shows the full arc.
Its process requires a named owner to enter the first substantive stage; it
specifies that if the owner becomes unavailable another participant *may
volunteer*; and it states no rule whatsoever for items that stall. In its
own record of abandoned work, **7 of 46 terminated items name owner
departure as the sole cause** — the largest single named cause in the
taxonomy, ahead of every technical objection. Three of those seven were
closed on the same day with an identical reason, which is the signature of
an unscheduled manual sweep: not a policy firing, but somebody eventually
noticing, once, in ten years.

The rule the arc yields: **an entrance criterion that is never re-evaluated
is not a criterion, it is a birth certificate.** Ownership must be a
recurring check with a clock, or the pipeline is silently accumulating work
that nobody has withdrawn and nobody is doing.

## Derive last-touched from the trail you already keep

The corrective sounds expensive — a new field, someone maintaining it,
another thing to fall out of date — and it is not, because a staged
pipeline already records the answer as a side effect of operating. Every
item carries a dated activity trail: review dates, discussion links,
decision entries, the append-only per-item history described in
[audit-logging](../../../../operations/governance-and-records/audit-logging/techniques/decision-records.md).
**Last-touched is computable from data already present**, and computing it
requires nobody to remember anything.

Doing that arithmetic against the same public pipeline's board of 92
in-flight items returns the number the board itself does not show: **30 of
them — one in three — have had no recorded activity for two years or
more**, the quietest since a date nine years earlier. All 92 are listed as
active. The items are not hidden or archived; they are on the same page as
the ones that moved last month, in the same visual weight, counted in the
same total.

This is the practical core of the technique, and it is close to free:
compute an age from the trail, render it on the row, and sort by it. A
board that shows last-touched next to stage stops being able to tell the
comfortable version of its own story.

### The derivation is free only where a per-item trail already exists

The paragraph above was written from a pipeline whose every row carries its
own dated history, and applying it to a second pipeline immediately found
the condition it had assumed away. A **flat status queue** — one row per
item, a status column, and a single collection-level "updated" date in the
header — has no per-item trail at all. Its only temporal fact belongs to
the whole file, so last-touched is not derivable from it at any price, and
an item that has been untouched since admission is byte-identical to one
worked yesterday.

For that shape the technique is not free and must not be sold as free: it
costs a schema change, adding either a per-item touched date written by
whatever moves the item, or a join key back to a ledger that does record
dates per event. Both are small, and the point of naming the cost is that
the cheap version has a precondition — *the pipeline already emits
per-item dated events* — which is worth checking before promising anyone a
free diagnostic. The queue shape is also the one where the missing field
hides longest, because a young queue is indistinguishable from a live one
and stays that way until the first cohort quietly ages out.

## The active count carries no liveness predicate

"92 active items" is a claim about admission, not about work in progress,
and it is read as the second
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
The predicate the number actually carries is *items admitted and not yet
formally withdrawn* — which, in a pipeline whose withdrawal step requires a
departed owner to perform it, is close to a count of everything ever
admitted.

Any number published from a long-lived pipeline states its liveness
predicate or misleads: active *and touched within the window*, versus
admitted-and-not-withdrawn. The two differed by a third in the case above,
and the gap widens monotonically with the pipeline's age, because the
numerator only grows.

## Admission names the reaper

[creation-names-reaper](../../../../_laws.md#creation-names-reaper) is
usually read as a rule about resources — temp files, listeners, worktrees —
and it governs work items with no modification: the question "who removes
this, and when?" must have an answer at admission time, because nobody
re-asks it later. A pipeline that admits items on an owner criterion and
names no reaper has made the same deferred-leakage bargain, with a slower
clock and a more embarrassing failure.

The reaper is a **scheduled sweep with a recorded outcome**, and its
mechanics are what separate it from closing stale tickets:

- **It runs on a clock**, not when the backlog becomes annoying. The
  once-in-ten-years batch is what happens without one, and it is visible
  forever afterward as a cluster of identical same-day terminations.
- **It asks the owner question, not the progress question.** "Is anyone
  still accountable for this?" is answerable; "is this still a good idea?"
  reopens the original debate and is why sweeps stall.
- **Silence resolves to a terminal state, not to another park.** An item
  whose owner cannot be reached moves out of the active set. Leaving it
  parked is the decision to keep lying in the count.
- **The terminal state carries a rationale and a date**, and where the work
  was superseded, a pointer to what replaced it. This is the difference
  between reaping and deleting
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)):
  a reaped item stays readable as information about why it stopped, which
  is what stops the same idea being re-proposed from scratch every few
  years. In the same record, the largest rationale category after owner
  departure is *superseded by* — 11 of 46 entries point at their
  replacement, which makes the graveyard a redirect table rather than a
  tombstone list.
- **The rationale is required.** Where it is optional it is omitted: 6 of
  46 entries in that record carry a bare "withdrawn" with no reason, and
  those are precisely the ones that teach nobody anything.

## The boundary against gate liveness

The two techniques answer different questions and neither substitutes for
the other. A pipeline can have perfectly live gates — every checker
asserted, every one seen red — applied to a set of items two thirds of
which nobody is working on. The gates are working exactly as designed and
the pipeline is still reporting fiction, because the gates measure items
that arrive and say nothing about items that never will.

The complementary question — whether an item that *is* alive has actually
discharged the obligations of the stage it sits at — is
[advancement-evidence-fields](./advancement-evidence-fields.md). Read
together they cover the two ways a long-lived row lies: it claims work that
stopped, and it claims obligations that were waived.
