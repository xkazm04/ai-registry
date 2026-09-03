---
layer: technique
type: technique
subject: declarative-resource-lifecycle
technique: deletion-blocked-until-dependents-confirm
status: forged
laws: [record-precedes-effect, creation-names-reaper, absent-guard-is-loud]
shared_with: []
use_when: [a record's removal must wait until something outside its store is cleaned up, a delete event is being used to trigger cleanup, several independent owners hold cleanup obligations on one record, the store has no native hold mechanism and a soft-delete column is the nearest thing available, a record will not die and nobody can say who is holding it]
stage: multi-service
---

# Deletion blocked until dependents confirm

A record that caused something to exist outside its own store must not
disappear before that something is cleaned up. The mechanism is a **marker**:
a named entry the owner writes onto the record, which the store honours by
refusing to complete a removal while any marker remains. A removal request
against a marked record does not remove it — the store stamps the record with
the instant removal was requested and leaves it in place, readable and
enumerable, until the last marker is gone. Each owner watches for that stamp,
performs its own cleanup, and removes **its own** marker; the store removes
the record when the set empties.

The shape is a small state machine over two facts — *is my marker present*
and *has removal been requested* — with four arms and no fifth:

| my marker | removal requested | the act |
|---|---|---|
| absent | no | add the marker, and **do nothing else this pass** |
| present | no | do the work |
| present | yes | clean up; on success, remove the marker; on failure, stop |
| absent | yes | nothing is owed here |

## The marker goes on before the first side effect

The first arm is the one that gets collapsed, and collapsing it is the whole
bug. The tempting version adds the marker and then, in the same pass, does
the work — one round trip saved, one obvious inefficiency avoided. What it
buys is a window in which the side effect exists and nothing on the record
accounts for it: the write that adds the marker can fail, be refused by a
concurrent writer, or land after the process died holding a freshly created
external resource. The record then carries no marker, so removal completes
immediately, and the resource is orphaned with nothing left pointing at it
([record-precedes-effect](../../../../_laws.md#record-precedes-effect) — the
handle is written first, and when it cannot be written the effect does not
happen).

The disciplined form spends the extra pass on purpose: the write that adds
the marker is *itself* a change to the record, so it triggers the next pass,
which sees the marker and does the work. Nothing is applied in the same pass
that claims custody. The rule is worth stating as a rule because it reads as
waste to every reviewer who has not lost a resource this way: **claim custody
in one pass, act in the next.**

## A failed cleanup keeps the marker

The third arm short-circuits. When cleanup fails, the marker stays and the
pass ends; the record stays un-removable and the next pass tries again. The
failure path must not remove the marker — removing it is an assertion that
cleanup finished, and the assertion would be false. This is the entire
guarantee: *if the work was ever started, cleanup must succeed before the
record goes.*

Cleanup must therefore be **re-runnable**, and the bar is higher than
idempotent-on-success. It must tolerate running when the work never ran at
all, or ran halfway, or was cancelled mid-flight — because every point at
which the process can yield is a point at which it can be stopped, including
the ones that look infallible. Write cleanup as *bring this to the absent
state from wherever it is*, never as *undo the steps of the apply path in
reverse*, which is only correct when the apply path completed.

## The guarded compare-and-remove

Markers are a set, but they are often *stored* as an ordered list, and the
list is the hazard. Removing "the marker at position two" is a positional
operation, and between reading the record and writing the removal another
owner may have removed its own marker, shifting yours. The removal then
deletes **somebody else's** marker — releasing a hold whose cleanup has not
run, which is the one outcome the mechanism exists to prevent, produced by
the mechanism itself.

So the removal is a **guarded compare-and-remove**: assert that the position
still holds *your* name, and only then remove it. A failed assertion is not
an error to be logged and swallowed; it is a retry, and the next pass
recomputes the position. The same guard belongs on the *addition*, for the
symmetric reason — a store that does not deduplicate the list will happily
hold your name twice if two of your passes race, and the second copy is a
hold that nothing will ever remove. Assert the list you read is still the
list on the record, then append.

Where the store offers set semantics rather than a list, take them; the guard
is then the store's problem rather than yours. Where it does not, the guard
is not optional, and its absence is invisible until the day two owners are
finishing at the same moment.

## The deadlock, and its two escapes

A marker whose owner is gone blocks removal forever. The owner was
uninstalled, its deployment was deleted before its records were, it was
renamed and the new name does not recognise the old marker, or it is simply
crash-looping. The record is now permanently un-removable, and it looks to
everyone else like a store bug.

This is the mechanism working. It is also an operational state that must be
named where an operator will read it, with exactly two exits and no third:

- **Restore the owner and let it finish.** The only exit that honours the
  contract. It is available more often than it looks — a redeployment of the
  removed component with the same marker name will find its records and drain
  them.
- **An explicit, audited strip.** A human removes the marker, declaring that
  the cleanup will not happen. This is a *recorded abandonment*, not a
  completed removal, and it must be spelled that way wherever removals are
  logged; the external resource it was protecting is now leaked and somebody
  should be told which one.

The third option — a timer that strips markers automatically after some
interval — converts the guarantee into a suggestion, and it does so at
exactly the wrong moment. The intervals that make it feel safe are the
intervals during which slow cleanup is most likely to be doing real work, so
the automation preferentially fires on the honest holder. If you find
yourself sizing that timer, the design question underneath it is whether the
cleanup should have been a hold at all.

## When not to use this

A marker is for dependents **the store cannot reach**: a record in another
system, an external registration, a paid resource, a file. When the
dependents live in the same store and its own declared cascade can remove
them, use the cascade — it is enforced by the store for every writer,
including the ones that never heard of your process, which is strictly
stronger than a hold a process has to honour. Reaching for a marker where a
cascade would do adds a process to the critical path of every removal and
buys nothing.

## The degraded case: a soft-delete column and a reaper

Not every store has a native hold. The nearest general-purpose shape is a
soft-delete column plus a reaper: a removal sets a *removal-requested* stamp
instead of deleting, a marker set is stored beside it as data, and a sweep
removes rows whose marker set is empty. **This is a legitimate realization of
the technique and it is a degraded one**, and the difference is worth being
exact about, because it decides whether the contract binds anybody.

What the native form buys is that the *store* refuses. The hold binds every
writer that can reach the data, including a maintenance script, a migration,
and a person with a console. The degraded form moves the refusal into the
application, which makes it an
[optional guard](../../../../_laws.md#absent-guard-is-loud): the store's own
removal path is still open, and anybody who takes it destroys the record and
every marker on it in one statement, silently.

So the degraded form is sound under one condition and unsound without it:
**the store must have one removal door and the writers through it must be
enumerable.** Under that condition, three things the native form gets free
have to be built:

- **Removal-requested is a state, not an absence.** The stamp is a column
  every read path must honour, or a soft-deleted record keeps appearing in
  listings and the product grows a second meaning for "deleted".
- **The marker set is data, not a boolean.** A single `cleanup_pending` flag
  cannot represent two owners, and the second owner's arrival is what the
  whole technique is for.
- **The reaper is named at the point the stamp is set**
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) —
  what removes the row when the set empties, on what cadence, and what
  happens to a row whose set has not emptied in a month.

State which form you have built. A soft-delete column that a reader mistakes
for a native hold is worse than no hold at all, because the review that would
have caught the direct-delete path has already happened.

## The rejected alternative: handling a removal event

The instinct in an event-driven system is to skip the record entirely: watch
for the removal, and run cleanup when it arrives. It costs no write, adds no
state to the record, needs no guard, and it is what every event-shaped mind
reaches for first.

It fails on one property of the channel it depends on. A change channel is
allowed to be lossy — that is what makes it an optimisation rather than a
source of truth — and every other lost message heals on the next full read,
because the record is still there to be re-read. The removal message is the
single exception: when it is lost, the record it described is gone, so there
is nothing left to re-derive the fact from and no sweep that can notice.
Worse, "no removal happened" and "we missed the removal" are the same
observation, so the failure produces no signal at all — just a slowly growing
population of external resources nobody is paying attention to, discovered on
an invoice.

The marker inverts the dependency: the fact that cleanup is owed is written
on the record, in the store, by the owner, before anything was created. The
channel can drop everything it likes; the next full read finds the stamp and
the marker still sitting there.

## Boundary

The nearest neighbour is
[entity-lifecycle](../../../governance-and-records/entity-lifecycle/entity-lifecycle.md)'s
[orphan-reconciliation](../../../governance-and-records/entity-lifecycle/techniques/orphan-reconciliation.md),
which covers the same failure — a dependent outliving its owner — from the
other side. That technique assumes the record **goes**, and therefore needs a
durable ledger written at the removal door while the identity is still in
scope, plus a sweep from the dependent's side asking whether its owner still
exists. This technique assumes the record **stays** until the owner says
otherwise, so the ledger is the record itself and there is no orphan window
to sweep.

The rule for a reader: if the record may vanish while cleanup is pending, you
need a ledger and a sweep; if it may not, you need a marker. A system that
builds both for the same dependent has two authorities on whether cleanup is
owed, and they disagree the first time one of them is skipped.
