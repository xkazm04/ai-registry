---
layer: technique
type: technique
subject: agent-memory
technique: lane-reconciliation
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [a stored memory is never returned by recall, memory lives in a record plus one or more search indexes, deciding whether a store's indexes still agree with its record]
---

# Lane reconciliation

Every other technique in this subject governs *what belongs in the store*. This
one governs something none of them can see: whether the item that belongs there
is still reachable through the doors the agent actually uses.

A memory store is almost never one store. There is a **record** — the row that
owns identity, provenance, lifecycle state — and there are one or more
**retrieval lanes** built over it: a vector index, a keyword index, a graph edge
table, a cached projection. The write fans out. The backends are different
engines, so no shared transaction exists to make the fan-out atomic, and the
usual answer — write the record first, then the lanes — makes the failure quiet
rather than rare: the record commits, a lane write fails or is interrupted, and
the item is now a perfect memory that nothing can find.

That item passes every quality bar this subject imposes. It has provenance, so
[memory-governance](./memory-governance.md) is satisfied. It is live and
in-window, so [coverage-instrumentation](./coverage-instrumentation.md) counts
it as covered — coverage joins the *record*, which is exactly where the item
still exists. It is not stale, so [decay-and-forgetting](./decay-and-forgetting.md)
leaves it alone; not redundant, so [rollup-compaction](./rollup-compaction.md)
never looks at it. Every instrument reports health. Recall returns nothing, and
no component is wrong when read alone.

## The record declares its lanes, or divergence is unreadable

The reconciliation cannot begin with "every item should be in every lane",
because that is false in any store worth building. Graded admission is already
standard practice here: a low-confidence extraction, or a writer whose output is
trusted as a record but not as a belief, is deliberately admitted to the cheap
lexical lane and kept out of the semantic one. An item missing from the semantic
lane is therefore either a half-failed write or a policy working correctly, and
**nothing in the lane itself can tell you which**.

So the record carries its intended lane membership as declared state — a field
the write path sets, not a value inferred from where the item turned up. This is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
in its plainest form: the lanes are derived from the record, and a derived value
that cannot say what it was derived *from* has no arbiter when it disagrees.
With the declaration in place, reconciliation is set algebra between what the
record claims and what each lane holds, and every divergence has a name.

## The two directions are not the same defect

Comparing declaration against reality yields findings in both directions, and
collapsing them into one "inconsistency" count destroys the distinction that
matters operationally:

- **Absent where declared present.** The record says the item is in the lane;
  the lane does not hold it. This is the silent one. Nothing errors, nothing is
  stale, and the item is simply gone from that door.
- **Present where declared absent.** The lane holds an entry the record does not
  claim — an orphan from a half-completed delete, or an item whose policy
  demoted it out of the lane while the lane entry stayed. This surfaces as an
  unattributable hit: recall returns something the record cannot explain.

Absence degrades recall; presence pollutes it. They want different thresholds
and different urgency, and a single total lets churn in the second class hide
five findings of the first.

## Severity is decided by whether the lane has a floor under it

The sharper question is what an absence actually costs, and the answer is not a
property of the memory system — it is a property of the lane:

- A lane that is an **accelerator** over a scannable record — an id-to-location
  map, a cached projection, any index whose readers fall back to walking the
  record when the lookup misses — turns divergence into a latency defect. The
  item is still reachable. The cost is that a documented constant-time path
  quietly became a linear one, and nothing reports the demotion.
- A lane that is the **only door** — semantic retrieval over a store far too
  large to scan, where "search everything" is not an available fallback — turns
  divergence into data loss. The item is not slow to find. It is unfindable, and
  it stays unfindable until something reconciles.

Classify each lane once, at design time, and let that classification set the
severity floor. A handful of absences in an only-door lane is a real finding at
a small absolute count; the same number in an accelerator is noise until it is a
large fraction of the store. Getting this backwards produces the two standard
failures: a permanently red tile nobody reads, or a green one over a store that
has been quietly shedding memories for a month.

The classification is also the thing to re-examine when a lane's readers change,
because it is a claim about *callers*, not about the index. An accelerator whose
last fallback-carrying reader is refactored away has silently become an only
door, and the severity model still says noise.

## An absence claim requires an exhaustive enumeration

Reconciliation's severe class is an assertion that something is *not there*, and
that assertion is only available from a complete scan of the lane. Under a
budget — a point cap, a time limit, a paginated enumeration that ran out — the
honest output for the absence class is **not computed**, never zero.

This is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at
the point where it is easiest to violate, because zero is the natural
accumulator value and a truncated loop exits with it already in hand. The
not-computed marker must also be excluded from every total the report carries,
or the run publishes a smaller finding count *because* it looked less hard —
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) failing in
the direction that flatters. The general form of this rule, for any check that
reports more than one class of finding, belongs to
[three-state-outcomes](../../../../operations/service-operations/health-checks/techniques/three-state-outcomes.md).

The structural discipline that enforces it: keep the comparison *outside* the
enumeration's error handling. A set difference computed over a partially
enumerated lane is not a weaker finding, it is a fabricated one, and the only
reliable way never to compute it is to make it unreachable unless the
enumeration ran to completion.

## A lane that cannot be read is not a lane that is empty

When a backend is unreachable, the reconciliation reports that it could not
determine the answer. It does not report divergence. An outage rendered as
corruption is the worse of the two available lies, because the remedy for
corruption is repair — and repair against a lane that was merely offline
rewrites live data on the strength of a measurement that never happened.

The flattering direction has its own trap: an **empty record table is not a
healthy fast path.** The instinct is to return early — no records, nothing to
check — and it is wrong exactly when it matters most. A record store that was
wiped, rolled back, or restored from an older snapshot while the lanes kept
their contents is the most severe divergence the system can reach, and it
presents as zero records. The early return converts total loss of the arbiter
into a clean bill of health. Let the empty case fall through the normal
comparison, where it correctly reports every lane entry as an orphan.

## Reconciliation reads; repair is a separate authority

The check is read-only, and the separation is not fastidiousness. A reconciler
that repairs as it walks is deciding, item by item, which of two disagreeing
stores is right — the highest-stakes judgment in the subsystem — using whichever
one it happened to enumerate first, with no operator in the loop and no record
of the verdict.

Repair is its own pass, reading the reconciler's output, and it inherits the
subject's standing rules: re-derive the lane entry from the record rather than
deleting the record to match the lane
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)), decline
to touch any item the reconciler marked not-computed, and hold an **age floor**
so a write still in flight is never mistaken for a write that failed. That last
one is why the two passes must be separate at all: at any instant a correctly
functioning fan-out has items mid-flight, and a reconciler with delete authority
and no age floor is a race condition with a schedule.

## A derived lane is stale by construction, not by failure

The divergences this technique is built for are **accidents**: a fan-out that
half-succeeded, a writer that errored after one lane and before the next. The
premise is that agreement is the steady state and disagreement is an event.

A lane that is *compiled in a batch over the store* inverts that. An access
structure built by a periodic pass — a navigable index, a clustered summary
tree, any derived surface a consumer reads instead of the record — disagrees
with the record in its **normal operation**, and nothing has failed: an item
consolidated since the last compile is absent from every branch and therefore
invisible through its only door, and an item forgotten since leaves a row
pointing at nothing. Both are correct behavior of both halves.

Two consequences, and the first is the one this subject already half-states.
Its forgetting rule warns that a deletion must know what it orphans, and names
one direction — an episode that grounds a live belief. Deletion also orphans
**derived structures**, and where the derived structure is the consumer's only
route to the store, an orphaned row is worse than a dangling belief because it
is followed rather than read.

Second, such a lane needs a stated recompilation trigger, and the trigger
doctrine this subject already holds transfers unchanged: **accumulated input,
not the clock** — the clock as a floor and a staleness release, never as the
trigger. A compiled lane with no stated trigger is not eventually consistent,
it is consistent as of a date nobody recorded. Say what a read gets during a
recompile, too; "the old structure" and "an error" are both defensible and
"whichever finishes first" is not.

## When not to use it

A store with exactly one backend has nothing to reconcile, and adding the
instrument there is cost without a question. The moment a second lane appears —
the first keyword index beside the vector index, the first cache in front of the
record — the obligation arrives with it, and the usual sequence is that the lane
ships in an afternoon and the reconciler is written a year later, after the
first unexplained recall failure.

Nor does reconciliation say anything about *quality*: it reports that the lanes
agree with the record, never that the record is worth agreeing with. A perfectly
consistent store full of confabulations reconciles clean.
