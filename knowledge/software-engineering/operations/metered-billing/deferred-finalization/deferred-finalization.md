---
layer: golden-path
type: golden-path
subject: deferred-finalization
status: forged
use_when: [designing a derived artifact that later becomes an official record, deciding how long to wait before a computed total is authoritative, correcting a number that has already been issued, a late input arrives for a period that is already closed]
techniques:
  - recomputable-draft
  - finalization-freezes-the-inputs
  - void-then-regenerate
  - correction-window-is-the-grace-period
---

# Deferred finalization

Some artifacts a system produces are not merely stored, they are **issued**.
An invoice, a payslip, a statement of account, a regulatory filing, a
certificate of completion, a published price list: at some moment each stops
being the system's current opinion and starts being a claim the organization
has made to somebody outside it. Before that moment the artifact can change
freely and nobody is misled. After it, changing the artifact is not an edit,
it is a **restatement** — and restatement has a cost that is paid in
credibility, in reconciliation work, and sometimes in regulatory exposure.

Deferred finalization is the discipline of putting a **deliberate, sized
window** between the moment the system believes it knows the answer and the
moment that answer becomes a record. A system that computes a total and makes
it authoritative in the same breath has thrown away its only cheap correction
mechanism: it has no way to absorb a late input except by issuing a second
document about the same subject, which is the most expensive operation in the
whole domain. Billing is the worked case throughout this subject, because
metered billing has the hardest version of the problem — the inputs arrive
from other people's systems, they arrive late, and the output is money — but
the shape is the same anywhere a derived artifact becomes an official record.

## The pre-final artifact is a view; the final one is a record

Everything else here follows from one sentence: **before finalization the
artifact is a projection of its inputs, and after finalization it is a
projection of nothing.**

While it is pre-final, the artifact holds no independent truth. Its lines,
its quantities, its subtotals and its total are all re-derivable, and the
correct response to an input changing is to derive them again. The join to
the live rate table, the live tax configuration, the live customer record is
not a leak — *the join is the entire point*, because the artifact's job at
that stage is to say what the answer would be if the period ended now.

At finalization that relationship inverts. The artifact stops asking the
world what it should say and starts asserting what it says. From that instant
a join to anything mutable is a defect with a very long fuse: the rate table
is edited two years later for a reason that has nothing to do with this
customer, and a document that was correct when issued now renders differently
than the copy the customer downloaded, than the copy the auditor holds, and
than the number that was reported. Nothing failed, nothing logged, and
nobody can say when it changed.

## A draft here is not somebody's edit buffer

This is the load-bearing distinction of the subject and the naive reading
that must be defeated, because the word "draft" carries a document editor's
meaning into a place where that meaning is exactly wrong.

A document draft is a **human's working copy**: the human is the author, the
buffer holds their uncommitted intent, and the system's job is to preserve
their keystrokes faithfully until they commit. A pre-final billing document
is the opposite in all three respects. It is **server-derived** — no human
authored it. It is **recomputed on a schedule**, wholesale, from inputs that
belong to other subsystems. And the user's influence on it is **indirect**:
they cannot change the artifact, they can only change the inputs and wait for
the next recomputation.

Conflating the two produces a specific and recurring failure. Someone reads
"draft" as "editable", ships an affordance that writes a corrected amount
onto a pre-final line, and one of two things happens. Either the next
scheduled recomputation silently discards the edit — the user's correction
vanishes with no error, because the recomputation is a total replacement and
does not know that one line was special — or, worse, the edit is defended by
switching that artifact out of recomputation, and the system now holds a
"draft" that has quietly stopped tracking its inputs while still being
labeled as though it tracks them. The second failure is worse because it is
invisible: the artifact looks live and is stale.

The correct affordance for "this number is wrong" during the window is
therefore never an edit box on the artifact. It is a correction to an
**input** — a corrected usage record, an adjusted subscription, an applied
credit — after which the artifact recomputes and agrees. The mechanics of
that recomputation, and the invariants a recomputable artifact must hold, are
the [recomputable-draft](./techniques/recomputable-draft.md) technique.

## What this subject does not own

The neighbours matter here more than usual, because three of them own halves
of mechanisms this subject composes.

- **Document draft editing** — the buffer, dirty-state derivation, debounced
  saves and exit guards for a human revising a persisted entity — is the
  [draft-editing](../../../ui-surfaces/input-and-editing/draft-editing/draft-editing.md)
  subject, and it is *not* this. The discriminator is one question: **who
  computes the content?** If a person authors it and the system persists their
  keystrokes, that is a draft buffer and everything in that subject applies.
  If the system derives it and a person can only move its inputs, it is a
  recomputable pre-final artifact and almost nothing in that subject applies —
  dirtiness is meaningless (there is no baseline a human diverged from), a
  save is meaningless (there is nothing uncommitted), and an exit guard is
  meaningless (nothing is lost by leaving). Sharing a word costs teams months.
- **Durable history and restore** belong to
  [versioning-snapshots](../../governance-and-records/versioning-snapshots/versioning-snapshots.md).
  That subject owns snapshotting an entity's content so it can be inspected
  and returned to. This one owns a different thing that also involves copying
  state: the freeze at finalization is not a snapshot taken *of* a record, it
  is the record *becoming* self-contained. There is no restore, because there
  is no going back — the forward-only supersession described below is what a
  correction looks like here, and it is closer to that subject's
  forward-only restore doctrine than to any edit.
- **The trail's believability** — append-only shape, one write door,
  retention, tamper evidence — belongs to
  [audit-logging](../../governance-and-records/audit-logging/audit-logging.md).
  This subject *depends* on that trail more literally than most: the
  supersession record here is not documentation of a correction, it is the
  mechanism that permits one. What the trail must be able to survive is owned
  there; what this subject writes into it is owned here.
- **Whether the entity exists** — archive, delete, cascade, blast radius — is
  [entity-lifecycle](../../governance-and-records/entity-lifecycle/entity-lifecycle.md).
  Voiding is not deleting and not archiving: a voided record still exists,
  still renders, still appears in the trail, and is still discoverable by
  everyone who saw it. What changes is only whether it *counts*. A team that
  implements void as a soft delete has built the wrong thing, and will find
  out when someone asks for the history of a corrected period.
- **What the numbers on the artifact mean** — how usage is aggregated over a
  period, how a price applies to a quantity, where a period boundary falls,
  how a mid-period change is prorated — belongs to the sibling subjects of
  this subcategory. This subject is deliberately indifferent to the
  arithmetic. It owns *when the arithmetic stops being provisional*.

## Finalization freezes the derivation, not just the total

The commonest under-implementation of this subject is a finalization step
that copies the amounts and nothing else. Amounts are the easy half. What
must freeze is **everything the amounts were derived from and everything the
document renders**: the unit rates and the price identifiers they came from,
the quantities and the aggregation window that produced them, the tax rates
and the jurisdiction determination that selected them, the currency and — if
the organization reports in a different one — the conversion rate and the
date it was taken from, the payer's legal name and address as they stood that
day, the plan or contract version in force, and the document's own issued
identifier.

The test is mechanical and worth running as an actual test: **change every
mutable thing the document ever read — rename the customer, edit the rate,
retire the price, move the tax rate, change the reporting currency — then
re-render the document. If a single character differs, it did not freeze.**

Two clauses of the freeze get missed even by teams that get the rest right.
The first is that freezing applies to the *financial content*, not to the
record's whole row: payment status, collection state, delivery attempts and
dispute flags continue to move after finalization, and they must, because
they describe what happened to the document rather than what it says. A team
that models finalization as "the row is now immutable" cannot record a
payment. The second is that the **document's public identifier is minted at
finalization, not at creation** — a pre-final artifact that burns a number
from a sequence somebody outside will audit creates a gap every time a
recomputation decides the artifact should not exist, and an unexplained gap
in an issued sequence is a finding in its own right. Both clauses, and the
enumeration of the derivation context, are the
[finalization-freezes-the-inputs](./techniques/finalization-freezes-the-inputs.md)
technique.

## After the freeze there are exactly two moves

Once a record is issued, the number in it cannot change. That is not a
technical limitation to be engineered around; it is the property that made
the record worth issuing. So a system that must nevertheless produce a
different number has exactly two legitimate moves, and it should be able to
name which one it is making:

1. **Supersede.** The issued record was wrong as issued — wrong period, wrong
   payer, wrong rates, computed before an input that should have been in it.
   It is **voided with a reason** and a **replacement is generated**, with a
   recorded link in both directions. The original does not disappear; it stops
   counting.
2. **Compensate.** The issued record was correct as issued, and something
   changed afterwards — a refund, a goodwill adjustment, a negotiated credit,
   a genuinely late input arriving after the window closed. The original
   stands, untouched and still counting, and a **second document of the
   opposite sign** — a credit note, an adjustment line on the next period —
   carries the difference.

What is not on the list is editing the record in place, and no amount of
audit logging around such an edit rehabilitates it: a log entry beside a
mutated total tells you a change happened, while the two legitimate moves
leave both numbers standing and let anyone reconstruct why they differ.

The mechanism that makes supersession structurally safe is the most
transferable idea in this subject, and it is worth stating away from
invoices. Systems like this carry a **uniqueness constraint** that exists to
prevent the worst defect in the domain — at most one document per subject per
period, so a customer cannot be billed twice for the same month. A naive
correction hits that constraint and the naive fix is to weaken it, which
removes the guarantee to buy the correction. The disciplined form instead
makes the constraint **partial over the status the correction has to write**:
at most one *counting* document per subject per period, where "counting"
excludes anything that has been voided and superseded. The constraint is not
loosened at all — it is simply pointed at the right predicate — and the
consequence is that **the audit link is load-bearing rather than
decorative**. The system physically cannot produce a second document for a
period without first recording why the first one stopped counting. Nobody has
to remember to write the supersession record; it is the only key that opens
the door. The chain semantics, the void-versus-compensate decision rule, and
the constraint's exact shape are the
[void-then-regenerate](./techniques/void-then-regenerate.md) technique.

## The length of the window is a business decision, and it is measured

The window between period end and finalization has a name in billing — the
grace period — and it is routinely implemented as a constant somebody picked.
It is not a technical constant. It is an answer to a measurable question:
**how late does our data arrive?**

Both directions cost real money, which is what makes it a decision rather
than a preference. A window shorter than the tail of the input arrival
distribution converts ordinary lateness into supersessions and credit notes —
customer-visible, support-generating, and expensive to reconcile. A window
longer than it needs to be delays every payment by exactly its length, which
is working capital, and it delivers the customer a bill for a period they
have half forgotten. The correct length is derived from the **observed
lateness distribution of the inputs** — the gap between when a usage event
happened and when it reached the system — read at a chosen percentile, stated
beside the setting, and re-measured when the pipeline changes. Different
payers legitimately get different windows, because they have different
pipelines; a per-tenant setting is not over-engineering here, it is the
recognition that the number is a property of somebody's ingestion path rather
than of your scheduler.

The instrument that makes it a measurement rather than a guess is a **count
of inputs that arrived after their period closed**. That counter is the
feedback signal for the window's length, and a system without it is choosing
the window by feel forever. Sizing, the per-tenant argument, the interaction
with payment terms, and the catch-up behaviour a finalization schedule owes
after downtime are the
[correction-window-is-the-grace-period](./techniques/correction-window-is-the-grace-period.md)
technique.

## The window closes, and that is the honest limit

The hardest thing to accept about this pattern, and the thing most
implementations quietly lie about: **after the window closes, a late input
has no path back into the record.** It cannot be absorbed, because absorbing
it would mean recomputing a document that is no longer a view. Every refresh
path in a correctly built system stops at the finalized boundary, and that is
not an oversight to be fixed — it is the pattern working.

What follows is a design obligation rather than a defect. Late inputs still
arrive, so the system must have a **defined destination** for them, chosen
deliberately: carried into the next period as an adjustment, or issued
immediately as a compensating document, or — for inputs small enough that
either of those costs more than the amount — discarded against a stated
threshold and counted. Any of those three is defensible. What is not
defensible is the fourth option a system falls into by not deciding: the late
input is dropped by whichever code path met it first, nobody counts it, and
the organization believes it billed for usage it did not bill for.

And there is a fifth option that looks like generosity and is the worst of
all: reopening the closed record to absorb the late input. That silently
restates history. Somebody's already-reconciled month changes underneath
them, the copy they hold no longer matches the copy you hold, and the system
has taught everyone downstream that your issued documents are not stable —
which costs more than any single correction it was trying to save.

## What this subject refuses

- **Making a computed number authoritative at the moment it is computed**,
  when its inputs can still arrive. That is not simplicity; it is trading a
  cheap recomputation for an expensive restatement, permanently.
- **An edit affordance on a recomputable artifact.** Either the recomputation
  overwrites the human, or the human's edit stops the recomputation. There is
  no third outcome.
- **A finalized document that still joins to a live table** for any character
  it renders.
- **Editing an issued record in place**, with or without a log line beside it.
- **Weakening a uniqueness constraint to permit a correction.** Point it at
  the counting predicate instead; the correction then requires the audit
  record by construction.
- **Void implemented as a delete or an archive.** A voided record still
  exists, still renders, and still explains itself to everyone who saw it.
- **A grace period chosen by feel**, with no measurement of input lateness
  behind it and no count of arrivals that missed it.
- **Reopening a closed period** to absorb a late input. The input is a new
  document, not a correction.
- **A pre-final total presented, exported, or reported as though it were
  final.** Provisional is a property of the number and must travel with it.

## The techniques

- [recomputable-draft](./techniques/recomputable-draft.md) — the pre-final
  artifact as a total re-derivation from current inputs: replacement rather
  than patch, the computation watermark, the no-hand-edit rule, and what must
  never treat a provisional total as a receivable.
- [finalization-freezes-the-inputs](./techniques/finalization-freezes-the-inputs.md)
  — enumerating and copying the whole derivation context, the re-render test,
  the identifier minted at issue, and the lifecycle metadata that keeps moving
  afterwards.
- [void-then-regenerate](./techniques/void-then-regenerate.md) — supersession
  as the only in-kind correction: the bidirectional link, the uniqueness
  constraint made partial over the counting predicate, chain semantics, and
  the void-versus-compensate decision.
- [correction-window-is-the-grace-period](./techniques/correction-window-is-the-grace-period.md)
  — sizing the window from the measured lateness of the inputs, per-payer
  configuration, the late-arrival counter, and the defined destination for
  what arrives after the close.
