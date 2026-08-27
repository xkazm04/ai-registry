---
layer: technique
type: technique
subject: docs-sync
technique: earned-verification-state
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, derivation-names-recomputation]
shared_with: []
use_when: [a review date advanced on a run that checked nothing, deciding what a freshness stamp on a document is allowed to mean, a rot finding was triaged away and the document still reads as current, one document is current in one paragraph and two quarters stale in another]
---

# Earned verification state

Every other technique in this subject governs what an *instrument* may claim:
what the scan reports, what the gate exits, what the denominator carries. The
document itself also makes a claim about its own freshness — the review date,
the checked-against version, the last-verified stamp — and that claim is the
one nobody gates. It is also the one the machinery depends on:
[cross-repo-drift-detection](./cross-repo-drift-detection.md) asks the other
repository what changed *since this date*, so a date that advanced without a
recheck does not merely mislead a reader. It moves the detector's horizon past
the very changes it existed to find, permanently and silently, and the detector
keeps reporting clean because it is now asking about a window in which nothing
happened.

The seam is easy to miss because both neighbours look like they own it.
[docs-content-model](../../../../ui-surfaces/published-surfaces/docs-content-model/docs-content-model.md)
owns the *shape* of the honest-metadata fields; this subject owns the *queries*
over them. Neither owns **the rule for when the field may be written**, and
that is the rule the query's correctness rests on.

## The stamp is earned by a recheck, never by a clean run

A freshness stamp advances only when a recheck actually ran over a non-empty
population and completed. Three failures all present as a clean run and none of
them earns the stamp:

- **the preflight passed** — the cheap deterministic pass found no changed
  evidence, so no deep verification was scheduled. That is a statement about
  the evidence, not about the claims, and it is exactly
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
  arriving through the artifact rather than through the report;
- **the population was empty** — the document declared no coupling, so nothing
  could be checked. An empty verification is not a passing one; the honest
  outcome is the *unverifiable* rung
  ([doc-rot-detection](./doc-rot-detection.md)), written onto the document
  rather than swallowed;
- **the run was interrupted** — half the claims were rechecked and the stamp
  advanced anyway, which is worse than not advancing it, because the unchecked
  half is now covered by a date that says otherwise.

The rule reads as one sentence and it is worth writing into the tool that
stamps: **the thing that advances the date is the completed recheck, not the
run that contained it.** Stamping on run completion is the defect; stamping on
verification completion is the design.

## Uncertainty lives on the artifact, not only in the finding stream

The rot scan produces findings, and findings enter a lifecycle — verified,
deduplicated, triaged — which is correct for a scan and insufficient here,
because that lifecycle has a *dismiss* transition. A stale finding that is
triaged away leaves a document that reads exactly as current as one nobody ever
questioned. Next scan re-derives the finding, someone dismisses it again, and
the document's own metadata never records that its freshness has been in
dispute for a year.

So the uncertainty is written **onto the document**, and it is durable: it
survives runs, it is not recomputed from scratch each scan, and it clears only
when a recheck resolves it. This is
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
applied to a corpus rather than to an agent — a belief that cannot be read by
the next process cannot be governed by it. The practical form is small: the
document (or a sidecar beside it) carries, per claim, the evidence it rests on
and the revision of that evidence observed when the claim was last affirmed. A
mismatch between the recorded revision and the current one *is* the stale mark;
no separate status field is stored, and therefore no status field can drift out
of agreement with the evidence it describes
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
— the recorded revision is the recomputation path).

## Stale is suspended belief, and it has three resolutions

The scan's *stale* rung is defined as actionable, which quietly implies the
claim is wrong and the work is a rewrite. Most of the time it is neither. The
evidence moved; whether the claim moved with it is unknown until someone looks
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) — and
the laundering point is the moment a tool renders "the source changed" as "the
document is wrong"). Three resolutions, and a vocabulary that offers two forces
the common case into the wrong one:

- **reaffirm** — the claim still holds against the moved evidence. Refresh the
  recorded revision; change no prose. This is the majority outcome and it must
  be cheap, or the discipline is abandoned within a quarter;
- **correct** — the claim no longer holds. The prose and the evidence binding
  change together, as a dated event
  ([dated-corrections](./dated-corrections.md));
- **retract** — the claim should not have been made at all. Also an event, also
  dated, and never expressed as an absence.

Collapsing reaffirm into correct is what makes claim-level tracking feel
expensive; it is the difference between confirming a line and rewriting a page.

## Bind at the proposition, not at the document

A stamp on a whole document is only as honest as its stalest sentence, and it
has two failure modes with no middle setting: treat the document as stale when
any coupled source moves, and every typo fix flags a page nobody needs to
reread; treat it as fresh while any part is defensible, and a rewritten
subsystem hides behind nine accurate paragraphs.

Binding at the **proposition** — the individual material claim, with its own
evidence pointer and its own recorded revision — dissolves the choice. A source
change flags the three claims that rest on it and leaves the other forty alone,
which is what makes the reaffirm path cheap enough to actually run and what
keeps the flagged set small enough that a reader trusts it. The cost is real
and worth stating plainly: something must extract the claims and keep the
bindings honest as prose is edited, which is affordable when the corpus is
maintained by a machine and rarely affordable when it is maintained by hand.
Document-level stamping remains the correct choice for a hand-written corpus;
what is not correct is stamping at document level and *reporting* as though the
granularity were finer.

## What the stamp must record to be re-evaluable

A stamp that records only *when* is a dead end: nothing can re-derive whether
it still holds, so its only possible decay rule is an age threshold, which is a
guess about the world dressed as a measurement. A re-evaluable stamp records
three things — **what was verified, against which evidence, at which revision
of it** — and only the third makes the check repeatable without a human. The
date is for readers. The revision is for the machine, and it is the field most
implementations omit.
