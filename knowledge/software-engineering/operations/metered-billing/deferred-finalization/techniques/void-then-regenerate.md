---
layer: technique
type: technique
subject: deferred-finalization
technique: void-then-regenerate
status: forged
laws: [deletion-is-not-repair, gate-sees-target, record-precedes-effect]
shared_with: []
use_when: [an already-issued record has to be corrected, a uniqueness constraint blocks a legitimate re-issue, deciding between voiding a document and issuing a credit]
---

# Supersession, and the constraint that makes it mandatory

A record that has been issued cannot be edited. To produce a different
number for the same subject and the same period, the system **voids the
original and generates a replacement**, and the two are linked. That much is
common knowledge. The part that decides whether the mechanism actually holds
is smaller and rarely stated:

> **The uniqueness constraint that forbids a second document is released by
> the supersession record, and by nothing else.**

That single design choice converts the audit trail from documentation into
machinery, and it is the most transferable idea here — it applies anywhere a
correctness constraint would otherwise forbid a legitimate correction.

## The constraint is made partial, not weakened

Systems in this shape carry a uniqueness constraint that prevents the worst
defect in the domain: **at most one document per subject per period**. It is
what stops a customer being billed twice for the same month when a job is
re-run, a queue redelivers, or an operator clicks twice.

The first correction request collides with it, and the reflex is to drop the
constraint or soften it to a warning. That trades a permanent guarantee for a
one-off convenience, and the double-billing incident arrives about a year
later from a completely unrelated retry.

The disciplined form changes the constraint's **predicate**, not its
strength:

- Naive: *at most one document exists per (subject, period).*
- Correct: *at most one **counting** document exists per (subject, period)*,
  where counting excludes every document that has been voided and superseded.

Expressed in a store, that is a partial unique index whose predicate reads
the supersession status — enforced by the store rather than by application
code, because the constraint's whole value is that it holds against the code
path nobody remembered. The constraint is not loosened at all: the invariant
"one live document per period" is still absolute. What changed is that the
system now has a legal way to move a document out of the counting set, and
that way is **writing the record of why**.

The consequence is worth stating as the design goal rather than as a
side effect: **it is not possible to generate a replacement without first
recording the supersession.** Nobody has to remember; the constraint refuses
the insert otherwise. A trail that only *describes* corrections rots, because
descriptions are optional under deadline. A trail that *permits* them cannot.

**Introducing the constraint onto a live table is its own small discipline.**
The predicate that makes corrections possible is usually added long after the
table exists, and the existing rows will contain violations — from the era
before anyone thought about it, from incidents, from a correction path that
was previously an in-place edit. The pragmatic move is to add a clause
restricting the index to rows created after a stated date, so the invariant
binds everything new without demanding a data cleanup first. Two conditions
make that honest rather than a fudge: the date is written where the predicate
is, and everyone knows that **rows below the line are unprotected**. It is a
real weakening, bounded and visible, and vastly better than the alternative
teams reach for, which is enforcing the constraint in application code and
believing it holds.

Note also what the naive constraint gets wrong even before corrections
appear: keyed on existence, it fails to distinguish a live document from a
voided one, so it is
[gating a proxy](../../../../_laws.md#gate-sees-target) for the thing anyone
actually cares about. The corrected predicate is not an accommodation for
corrections; it is the constraint finally observing its target.

## The void is a state and a story, not a deletion

Voiding must never remove the row, and must never be modelled as the archive
or soft-delete the entity-lifecycle machinery provides
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)). A
voided document:

- **still exists and still renders**, with its original number and its
  original frozen values intact — the counterparty holds a copy, and a
  document that cannot be re-rendered on request is a document you cannot
  explain;
- **is visibly marked void wherever it appears**, in the interface, in
  exports, and in the rendered artifact itself;
- **carries the reason, the actor and the time** of the void, and the reason
  is drawn from a defined vocabulary rather than free text, because somebody
  will eventually want to count corrections by cause;
- **names its replacement**, and is named by it. Both edges are stored. One
  direction always turns out to be the one you need, and which one it is
  depends on whether you arrived from the old document or the new one.

The number is never reused and never re-issued. A void is a permanent hole in
the counting set that stays fully legible; that legibility is the entire
reason for preferring supersession to an in-place edit.

## Void, or compensate?

The decision rule, and it is a rule rather than a judgment call in most
cases:

**Void and regenerate when the document was wrong as issued** — wrong payer,
wrong period, wrong rates, a quantity computed before an input that belonged
in it, a tax determination that was incorrect at the time. The claim the
document made was never true, so replacing it is telling the truth.

**Compensate with an opposite-signed document when the document was right as
issued and the world changed afterwards** — a refund, a negotiated credit, a
service failure remedied later, an input that genuinely arrived after the
period closed. The claim was true when made; erasing it would misrepresent
history.

Three constraints override the rule and force compensation regardless:

1. **The document has been settled.** A paid document that is voided leaves
   money attached to nothing. Compensate, and let the credit be applied or
   refunded.
2. **The document has been reported externally** — filed with a tax
   authority, delivered into a counterparty's accounts payable, included in a
   closed accounting period. What has left the building is corrected by the
   receiving system's own supersession mechanism, or by a compensating
   document, and never by quietly replacing the original.
3. **The correction is small enough that its handling costs more than it.**
   State the threshold, carry the amount to the next period, and count what
   was carried.

The strongest signal that a team has this wrong is a void path with no
settlement check on it.

## Chains, and exactly one current member

A replacement can itself be wrong, so supersession forms a chain, and the
chain has to answer two questions cleanly at any depth: *which member counts
now?* and *how did we get here?*

- **The chain is walkable in both directions** from any member, via the
  stored edges.
- **Exactly one member is current**, and that fact is derivable — the
  constraint above enforces it rather than a convention enforcing it.
- **The replacement carries its own fresh identifier** and its own frozen
  derivation context, computed at the moment of regeneration. It is a new
  record in every respect except the link.
- **Reason codes accumulate along the chain.** A subject whose documents have
  been superseded three times is telling you something about an input
  pipeline, and that signal only exists if each void recorded a cause.
- **Cycles are impossible by construction** — a replacement always points
  backwards to an already-existing document. If a data model permits a cycle,
  the edges are being written by two different code paths and one of them is
  wrong.

## Regeneration derives again; a human correction becomes an input

The replacement is produced the same way the original was: from current
inputs, through the same computation, with a new freeze. Copying the original
and editing the wrong line reproduces every other stale value it contained,
which matters most in exactly the case that prompted the correction — the
inputs moved.

There is a second, legitimate mode that looks like copying and must not be
allowed to become it. Sometimes the correction is **a human's**: an operator
knows the quantity on one line is wrong, or the description is, and no input
can express it. The replacement then starts from the original's lines rather
than from a re-aggregation — but three rules keep it inside the discipline:

- **The operator's change is stored as its own record** — an adjustment
  entity attached to the replacement, carrying the corrected value, its
  author and the line it applies to — and the replacement's line is derived
  from that record. The adjustment is an *input to the new document*, not an
  edit to it, which is what makes the delta between the two documents
  queryable rather than archaeological.
- **Everything downstream of the changed value is recomputed**, never copied:
  taxes, discounts, applied credits and every total. A copied line with a
  copied tax amount is the single most common defect in this path, because
  the tax was right for the old quantity.
- **Each carried-over line names the line it came from.** Supersession at the
  document level is not enough to answer "what actually changed"; the line
  edge is what turns two documents into a diff.

Two rules keep either mode honest:

- **Record the void before generating the replacement**
  ([record-precedes-effect](../../../../_laws.md#record-precedes-effect)), in
  one transaction where the store permits it. The reverse order leaves a
  window in which two counting documents exist for one period, which is the
  exact state the constraint exists to forbid — and if it is enforced, the
  reverse order simply fails, which is the better outcome.
- **Effects already fired are compensated explicitly, not implicitly.** A
  void does not un-send an email, un-charge a card, or un-report a filing.
  Each of those has its own compensating act, and each is recorded. A
  correction that assumes voiding rewinds the outside world is the second
  incident of the same day.

## When not to use this

- **Before the artifact is final.** During the correction window the answer
  is a recomputation, and voiding a provisional artifact to rebuild it is
  ceremony that produces a void record with nothing to explain.
- **Where the substrate is already append-only** and correction has a native
  form — a reversing entry in a ledger, a tombstone in an event log. Use the
  substrate's mechanism rather than layering a second supersession model over
  it; two mechanisms mean two answers to "which one counts".
- **For content that is not a claim to anyone.** An internal report
  regenerated nightly does not need supersession — it needs to be regenerated
  nightly.
