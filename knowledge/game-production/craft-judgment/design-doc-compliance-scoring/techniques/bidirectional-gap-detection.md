---
layer: technique
type: technique
subject: design-doc-compliance-scoring
technique: bidirectional-gap-detection
status: forged
laws: [unmeasured-is-not-a-pass, compiling-is-not-wiring]
shared_with: []
use_when: [cross-checking a design document against an implementation, a document that has drifted out of date, classifying findings for triage]
---

# Bidirectional gap detection

## The concern

A cross-check between a design and an implementation can disagree in two directions, and
they mean opposite things. Almost every implementation reports only one — the design item
with nothing behind it — because that is the direction that feels like a defect. The other
direction, implementation with nothing in the design behind it, is filed as good news or not
filed at all.

That asymmetry is the mechanism by which a design document becomes fiction. Code accretes,
the document never learns, and after two quarters the document describes a product that no
longer exists — while the compliance score, which only ever looked one way, has been rising
the whole time.

## Three directions

**Design-ahead.** The document claims something the implementation does not have, or has
only partly, or has at a quality below the stated bar. The remedy is build work, and the
owner is whoever owns the implementation. Sub-forms worth separating, because they carry
different severity and different effort:

- claimed done but the evidence says absent — a contradiction between two authorities, and
  the loudest thing a cross-check can find;
- specified whole, found partial — real non-conformance that is frequently silent, because
  a partial verdict quietly takes partial credit and generates no finding at all unless you
  emit one deliberately;
- present but below the declared quality bar — conformance in structure, failure in craft.

**Code-ahead.** The implementation has something the document does not track, or has
completed an item the document still shows pending. The remedy is a documentation edit and
the owner is whoever owns the document. Usually cheap, usually informational — and it is
the direction that, left unreported, lets drift compound invisibly. Report it even when it
is trivial; the *count* is the signal, not any single item.

**Unmeasured.** Neither side is ahead, because nothing was ever evaluated. This is the
direction that gets folded away, and folding it into design-ahead is a specific false claim:
it asserts the implementation is behind, which nobody knows. Keep it as its own direction,
with its own remedy — go and look — and keep it out of any penalty term, since coverage
already reports it.

## Procedure

For each design item, after resolving its implementation artifacts:

1. If the item is marked complete and any mapped artifact is absent → **design-ahead**,
   major or above, and state how many of how many artifacts are missing.
2. If the item is not marked complete and **every** mapped artifact is done → **code-ahead**,
   informational. Require *every* one: a single artifact done out of six is an item in
   progress, not a box someone forgot to tick, and reporting it as bookkeeping is how a
   half-built item gets closed.
3. If a mapped artifact is present but below the declared quality bar → **design-ahead**,
   severity scaled by how far below.
4. If a mapped artifact is present but only partially implemented → **design-ahead**, minor.
   Emit this even though partial credit already prices it; the finding exists to be seen.
5. If the item resolves to nothing evaluable → **unmeasured**, one aggregate finding for the
   area rather than one per item.

Every finding states both sides in the reader's language — what the design says, what the
evidence says — and names the provenance of the relation it was derived from, so a finding
built on a guessed mapping announces itself as one.

## Direction governs severity, and severity governs triage

Severity assigned without direction produces a triage list where "tick this box" ranks
alongside "this subsystem does not exist". Bind them: code-ahead findings default to
informational and near-zero penalty weight, because a code-ahead item is bookkeeping rather
than non-conformance; design-ahead findings carry the weight of the thing that is missing.

The resulting triage split is also an ownership split, which is the practical payoff: the
code-ahead list is a batch of document edits somebody can clear in an afternoon, and the
design-ahead list is the actual work. Presenting them in one undifferentiated column
guarantees the cheap items are done first and the metric improves without anything being
built — the exact behaviour the split prevents.

## What the reverse direction cannot see

Be honest about the limit. Code-ahead detection only sees implementation that appears in the
artifact registry the cross-check reads. Work that exists in the product but was never
declared as an artifact is invisible in both directions — the document does not claim it and
the check does not see it. That blind spot is real, it does not shrink by itself, and it is
the reason artifact discovery and the document cross-check are separate jobs. State the
registry's own coverage alongside the findings rather than letting a quiet report imply a
clean one.

## When not to use this

- **Generated documents** that are derived from the implementation. There the reverse
  direction is structurally impossible and reporting it is noise; the risk moves entirely to
  whether the generator ran.
- **Forward-looking design sections** explicitly marked as future work — those must be
  excluded from design-ahead findings by a declared marker, not by heuristics on wording, or
  the report fills with findings about work nobody has started on purpose.
- **Exploratory prototypes**, where code-ahead is the normal state and reporting it produces
  a list nobody will ever act on. Turn the direction on when the document becomes a contract.
