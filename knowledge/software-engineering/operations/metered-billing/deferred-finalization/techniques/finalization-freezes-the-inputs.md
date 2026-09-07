---
layer: technique
type: technique
subject: deferred-finalization
technique: finalization-freezes-the-inputs
status: forged
laws: [record-precedes-effect, identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [implementing the transition that makes a derived artifact official, a document renders differently than the copy that was issued, deciding what a record must store versus look up]
---

# Freezing means the record no longer asks anything

Finalization is the single act that converts a derived artifact into a
record. It is worth being precise about what changes, because the obvious
answer — "a status column moves" — is the smallest part of it and the reason
so many implementations are quietly broken.

**Before: the artifact is a question the system re-asks. After: it is an
answer the system has given.** The mechanical form of that sentence is the
whole technique: after finalization, producing the document's exact rendered
content must require reading nothing that anyone can change.

## Enumerate the derivation context, then copy it

The amounts are the easy part and copying them is not enough, because an
amount alone cannot be explained, defended, or recomputed by anyone
inspecting it later. Every finalized record must carry:

- **the quantities**, and the window they were aggregated over;
- **the unit rates applied**, and the identifier and version of the price
  definition each came from — not a pointer to the current price, the rate
  itself plus enough provenance to say which definition it was;
- **the tax treatment**: the rate, the jurisdiction that was determined, and
  the rule or exemption that selected it. Tax rates change by legislation on
  dates that have nothing to do with your release schedule, and a document
  that re-derives its tax at render time will restate itself on one of those
  dates;
- **the currency**, and where the organization reports in another one, the
  conversion rate together with the date it was taken from — the rate is a
  fact about a moment, and storing the rate without its date makes it
  unverifiable;
- **the counterparty's identifying details as they stood**: legal name,
  address, tax registration. These are the details most likely to be edited
  later for entirely legitimate reasons, and a document that re-renders a
  customer's new address onto last year's record is wrong in a way auditors
  notice;
- **the agreement in force**: the plan, contract or subscription version, and
  the period it covered;
- **the issuing organization's own details**, for exactly the same reason —
  companies move offices and change registrations too.

The design question this poses on every field is the same: *could anyone
change this, ever, for any reason?* If yes, it is copied. The relational
instinct to normalize and join is correct everywhere else in the system and
wrong here, and it is worth saying explicitly in the schema — a comment on
the copied columns stating that they are deliberate denormalization at issue
time, so the next engineer does not helpfully replace them with a join.

## The re-render test

The rule is testable, and this test is worth writing as an actual automated
one because the failure it catches is otherwise invisible for years:

> Finalize a document and capture its rendered output. Then change **every
> mutable thing it ever read** — rename the counterparty, edit their address,
> change the rate, retire the price definition, move the tax rate, change the
> reporting currency, rename the plan. Re-render the document. Compare.
>
> **Any difference is a defect.** Zero differences is the only pass.

A test that changes only one of those inputs is weaker than it looks: teams
usually get the rate right and miss the counterparty's address, or freeze the
tax rate and miss the jurisdiction determination. Change everything at once
and the test tells the truth in one run.

## The public identifier is minted at issue, not at creation

A provisional artifact may hold a temporary internal identifier — it needs
one, to be linked to and recomputed. It must not hold the **document number**
that the outside world will see and that somebody may audit.

The reason is arithmetic on a sequence. Provisional artifacts are created
speculatively, one per open period, and some of them will never be issued: a
subscription is cancelled mid-period, a period turns out to have no billable
activity, a payer is merged into another account. If the sequence number was
taken at creation, each of those leaves a **gap in an issued sequence**, and
in the jurisdictions that care about this a gap is a finding that must be
explained — because a gap is what a suppressed document also looks like.

So the number is assigned in the finalization transaction, in order, and once
assigned it is never reused, never re-issued, and never recycled after a void
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
voided document keeps its number forever; that is precisely how the void
stays explicable, and the sequence's high-water mark is therefore computed
over the issued *and* the voided together — a sequence that skipped voided
documents would re-issue their numbers, which is the fraud case.

Where the sequence must be strictly gapless, its allocation is serialized
within the finalization transaction rather than drawn from a counter that
pre-allocates and may lose values. Expect that serialization to contend: at
period end, many documents finalize at once and all of them want the next
number. Contention is normal there, not exceptional — a failed allocation is
retried with backoff rather than treated as an error, and the retry budget is
sized for the busiest hour of the cycle.

The same argument produces a third outcome for finalization that teams often
miss. A provisional artifact whose period turned out to have nothing billable
should usually be **closed rather than issued**: it reaches a terminal state,
it stops being recomputed, it remains inspectable, and it consumes no number.
Making that a per-payer choice rather than a hard rule is right — some
counterparties want a zero document every period as proof the period was
processed — but the default matters, because "issue an empty document every
cycle" fills the audited sequence with noise that somebody must later explain.

## Freezing applies to the content, not to the row

The clause that a naive implementation gets backwards. "The record is now
immutable" is *almost* right and, taken literally, makes the system unable to
do its job — because a finalized document still has a life:

| Frozen at finalization | Continues to move afterwards |
|---|---|
| Quantities, rates, amounts, totals | Payment and settlement status |
| Tax determination and rates | Collection and dunning state |
| Currency and conversion rate | Delivery attempts, downloads, sends |
| Counterparty and issuer details | Dispute and write-off flags |
| Period, plan and price provenance | Void and supersession links |
| The issued identifier | Links to compensating documents |

The distinction is not "which columns" but **which question**: the frozen set
is *what the document says*, the mutable set is *what happened to the
document*. A field that answers the first question and moves is a restatement
bug; a field that answers the second and is locked is a system that cannot
record a payment.

The practical enforcement is a guard at the one write door for these records
that rejects any update touching the frozen set once the status is final,
rather than relying on each call site. The check belongs in the store or in the
single model that owns the record, because the call site added next quarter
by someone who has not read this document is the one that will try.

## A rendered file is not a frozen record

The most common way a team believes it has frozen a document when it has not:
at finalization it renders the document to a file, stores the file, and sends
it — but the underlying record still joins to the live counterparty, the live
rate, the live tax configuration. The file is immutable; the record is not.

That system now holds **two representations of one document that can
disagree**, and the divergence is silent and one-directional. The
counterparty quotes the file. The support agent, the interface, the export
and the reporting query all read the record. When the payer's registered
address is corrected next year, the file still says the old one — correctly —
and every internal surface says the new one, and the two people looking at
the "same" document are looking at different documents. The bug surfaces at
the worst possible moment, which is a dispute.

A stored rendering is a delivery artifact and a convenience. It is not the
freeze, it does not discharge the obligation to copy the derivation context
onto the record, and a system that relies on it has moved its authoritative
financial content into a file nothing can query. Render *from* the frozen
record; do not let the rendering *be* the frozen record.

## Finalization is an effect boundary, so record before acting

Issuing a document is the trigger for consequences outside the system:
charging a payment method, sending the document to the counterparty,
reporting it to a tax authority, emitting an event that other services act
on. Those effects are not undoable, which makes the ordering rule
non-negotiable
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)): the
finalization — status, frozen values, issued number — is committed **first**,
and only then are the effects triggered, from the committed state.

The consequences of that ordering, all of which must be designed rather than
discovered:

- **Finalization must be idempotent.** The job that finalizes will be retried
  after a timeout, a redeploy, or an operator's re-run. A second attempt on an
  already-final document is a no-op that returns success, not an error and
  certainly not a second freeze with a second number.
- **The effects must be separately retryable**, keyed to the committed
  record. A send that failed does not un-finalize the document; it is a
  pending delivery on a finalized record, visible and retriable.
- **A failure between the commit and the effect must be recoverable from the
  record alone.** After a crash, a document that is final with no delivery
  recorded is a resumable state; a document whose email went out before the
  commit is not.

## The provisional artifact is not the record's history

A tempting shortcut: keep the last provisional computation beside the
finalized record "in case we need to see what changed". It is not history and
it will be mistaken for history. The finalized record's own frozen values are
the account of what was issued; the provisional artifact's job ended when
finalization began, and the only durable fact worth carrying forward from it
is *what the computation saw* — the watermark
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
because that is the one thing the frozen values cannot express and the one
thing an investigator asks for when a late input turns up.

## When not to use this

- **Where the artifact never becomes official.** An internal dashboard's
  computed rollup is allowed to be live forever; freezing it removes its only
  useful property.
- **Where the store already guarantees it.** Append-only ledgers and
  content-addressed records freeze by construction, and re-implementing the
  freeze on top adds a second authority for the same invariant. Copy the
  derivation context in — that part is still required — but do not add a
  status machine the substrate makes redundant.
- **For values that must legitimately track a live source.** A running
  balance, an outstanding amount, a days-overdue figure are *about* the
  document rather than *in* it; they are computed at read time on purpose and
  are not part of the frozen set.
