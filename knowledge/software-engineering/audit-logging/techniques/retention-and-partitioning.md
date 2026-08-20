---
layer: technique
type: technique
subject: audit-logging
technique: retention-and-partitioning
status: forged
laws: [creation-names-reaper, count-carries-predicate]
shared_with: []
---

# Retention and partitioning

An audit trail without retention policy grows until something else — the
disk, query latency, a privacy complaint — imposes one at the worst
possible moment. An audit trail with one *global* policy averages
incompatible obligations: security events a reviewer needs for a year and
routine operational events nobody reads after a week either both cost a
year of storage or both vanish in a week. This technique is the pair of
decisions that prevents both failures: **each ledger states its own
horizon, and the horizon is enforced by the same path that inserts
records.**

## Retention is enforced at insert

The reaper for audit records is not a scheduled cleanup job someone
configures later; it is part of the insert path
([creation-names-reaper](../../_laws.md#creation-names-reaper) applied
literally — the door that admits record N retires the records beyond the
horizon, so admission and expiry are one code path that cannot drift
apart). The properties this buys:

- **The bound is an invariant, not a trend.** The ledger's size is
  maintained continuously; there is no window in which a burst outruns a
  nightly job, and no failure mode in which the cleanup job silently
  stops running while inserts continue (a scheduled reaper that dies
  produces no error — only growth, noticed at the disk-full incident).
- **The policy is discoverable where writers look.** A contributor
  reading the door reads the horizon; policy-in-code at the chokepoint
  beats policy-in-a-runbook every time someone new asks "how long do we
  keep these?"

Horizons come in two shapes and mature ledgers usually state both: an
**age bound** (records older than D are retired — the shape compliance
obligations use) and a **count bound** per ledger or per key (at most K
records — the shape that hard-caps storage and query cost against a
runaway writer). A count bound *scoped per key* — per credential, per
actor, per entity — has a property worth naming: a noisy entity trims
only its own history, and cannot evict the quiet entity's evidence.
Enforcing the trim inside the insert keeps its cost amortized and small
(the trim condition is checked on the code path that changed the
answer).

## The ledger's own horizon has a floor, and refuses below it

The moment a horizon is **configurable**, someone types the number, and
this is the one configuration field in a product that converts a typo into
irreversible loss on a schedule with no human present. A window meant as
ninety days entered as nine does not degrade the system; the next
scheduled trim carries it out faithfully and takes the trail with it. For
a product whose output is evidence, that is not lost storage — it is the
destruction of the customer's ability to prove what happened, including
what happened during the incident that is about to be investigated.

So each ledger declares a **minimum** below which a configured window is
**refused, not clamped**. Refusal is the whole point: clamping upward
leaves the dangerous number stored, tells nobody, and waits. Refusal skips
that tenant, raises the refusal into the run's result, and the run reports
degraded rather than green. The keep-everything setting is never floored —
unbounded is the safe direction. A deliberately short window remains
possible only through an operator opt-in set out of band, so the person
who typed the number is not also the person waiving the check on it. The
mechanics of refusal, previews and operator opt-ins belong to
[data-retention](../../data-retention/data-retention.md); what belongs
here is the rule that the audit ledger is the population that most needs
the floor, and the one whose loss cannot be reconstructed from anything
else.

## The trim records itself, on the far side of the cut

A retention pass over an audit ledger is itself an auditable act, and it
has an ordering trap that only this ledger has: **write the trim's own
record after the deletion, never before**, or the record documenting the
cut falls inside the cut and is removed by it. The same ordering governs a
requested erasure of the trail — the record of the erasure is written
last, and is what remains of the trail afterwards.

Two disciplines complete it. If the self-record cannot be written, the run
is **degraded, not successful**: deletes applied with no surviving trace is
precisely the outcome that must page someone, and a run that returns green
having lost its own evidence has told its most consequential lie. And the
self-record is written **only when something was actually removed** — a
configured policy with nothing currently expired would otherwise stamp an
all-zero entry every tick forever, and a trail buried in records of
nothing happening is a trail nobody can read.

Trimming coexists with append-only because retirement is not repair:
whole records beyond a stated horizon leave by policy, which is a
different act — visible, uniform, content-blind — from editing or
deleting a record *because of what it says*. The door exposes the
horizon-trim; it still exposes no targeted delete. Where the ledger is
hash-chained, trims land on checkpoint boundaries (see
[append-only-design](append-only-design.md)).

## Partition by obligation, not by convenience

Ledgers are separated **by domain**, where a domain is defined by its
retention obligation and its reader: security-relevant actions,
credential lifecycle events, configuration changes, operational
housekeeping. The forcing argument is that a single pooled ledger makes
every retention decision a compromise: the longest obligation sets the
storage bill for all domains, or the cheapest domain's horizon quietly
truncates the one that mattered. Separate ledgers give each domain its
own horizon, its own volume budget, its own access rules for readers (a
support role that may read operational events has no business in the
security ledger), and independent failure — one domain's runaway writer
fills its own cap.

The counterweight is real and gets stated: partitioning multiplies doors
(each ledger has one — the chokepoint discipline applies per ledger),
and incident reconstruction often needs a **cross-ledger timeline**. So
partitioned records share a common core schema (actor, action, subject,
time, outcome, origin) and correlation handles, so a reader can merge
ledgers by time and correlate by handle without the ledgers sharing
storage. Partition storage and policy; standardize shape.

## Tagging keeps aggregates honest

Within a ledger, records carry an **origin tag** — which subsystem
emitted them — as a first-class field from day one. The failure this
prevents is subtle and recurrent: a dashboard counts "administrative
actions this week," a new subsystem starts writing to the same ledger,
and the count silently absorbs events its predicate never meant
([count-carries-predicate](../../_laws.md#count-carries-predicate) — a
count whose population can grow without its predicate changing is a
number drifting away from its own meaning). With origin tags, every
aggregate filters explicitly, new origins are visible as new tag values
the moment they appear, and retention can even differ *within* a ledger
by origin where obligations demand it without splitting storage.

Origin tags come from a controlled vocabulary with one authority — the
tag is an enum the door validates, not a free string each writer
invents, or the tag set fragments into synonyms and the aggregates it
was meant to protect miscount anyway.

## Deletion requests meet the immutable ledger

Privacy-driven erasure and append-only retention collide head-on, and
the resolution belongs in the design, not in the crisis: the ledger
holds **identifiers, not personal attributes** (see
[write-path-sanitization](write-path-sanitization.md)), so erasure of a
person resolves to erasing the mutable record the identifier points at —
the trail keeps "actor 7f3 deleted project 12" while "actor 7f3" ceases
to resolve to a person. Where regulation demands more, the horizon
itself is the argument: a stated, enforced, short-as-obligations-allow
retention window is the difference between "we keep it as long as the
law requires" and "we keep it forever," and only the first survives a
privacy review.

Erasing the trail itself is a **separate, explicitly requested scope**,
never a consequence of erasing the data the trail describes. The default
for an erasure request is: the subject's data goes, the ledger's
identifier-only records stay. Destroying the trail is a second ask, gated
harder than the first, because the first removes a customer's data and the
second removes the evidence about what was done to it — including the
evidence of the erasure request. Bundling the two behind one action means
an operator aiming at the data destroys the accountability record with it
and discovers this at the audit, not at the click. The targeted-erasure
machinery itself — the inventory of stores, the proof-without-content
record, backup carve-outs — belongs to
[data-retention](../../data-retention/data-retention.md).
