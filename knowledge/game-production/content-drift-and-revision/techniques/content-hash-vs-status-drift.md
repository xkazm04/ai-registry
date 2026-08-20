---
layer: technique
type: technique
subject: content-drift-and-revision
technique: content-hash-vs-status-drift
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity]
shared_with: []
use_when: [comparing two observations of the same production line, a green dashboard may be describing content that has since changed, deciding what counts as content for change detection]
---

# Content-hash drift versus status drift

Report two independent answers when comparing a production line against an earlier
observation of itself: **did the standing verdict move**, and **did the content move**.
They are different events with different consequences, and a system that only tracks the
first is blind to the second — which is the more dangerous one, because it leaves a
trusted signal asserting something that is no longer true.

## The two events

**Status drift**: the verdict, state or grade attached to a step changed. Visible by
construction, because status is what every dashboard renders. Causes are ordinary — a
re-judgment, a rubric change, a manual acceptance.

**Content drift**: the fingerprint of the content changed while the status did not. Not
visible anywhere unless it is specifically computed. Causes are a regeneration, a
restore, a bulk edit, or a migration. The consequence is that a standing verdict is now
evidence about a payload that no longer exists —
[a verdict is bound to its content](../../_laws.md#a-verdict-is-bound-to-its-content)
seen from the content side rather than the verdict side.

The four quadrants are all meaningful. Neither moved: quiet, no report. Status only:
routine, report as a status change. Content only: **escalate** — this is the quadrant the
technique exists for. Both: an ordinary produce-then-judge cycle, and the only quadrant
that explains itself.

## The procedure

1. **Take a baseline observation**: for every step of every entity, its status and a
   fingerprint of its content, captured at a stated time.
2. **Fingerprint by projection.** One named function maps the stored record to the object
   that *is* the content. Everything else is bookkeeping and is excluded.
3. **Serialize deterministically** — keys sorted at every depth, arrays in order, absent
   keys dropped — then digest. Two records differing only in key order must fingerprint
   identically or the detector reports drift nobody caused. Where the artifact references
   external assets, the reference manifest is part of the content and is order-normalized
   too: a reordered manifest is not a change, an added or removed reference is.
4. **Compare both dimensions independently** and emit a classification per step, never a
   single boolean. Collapsing them into "changed" destroys the distinction the whole
   technique is about.
5. **Route by quadrant.** Content-only drift under a passing verdict is the one that
   interrupts someone; the others are recorded.

## A second, independent oracle: the archive

A fingerprint comparison needs a baseline someone remembered to capture. A bounded
revision archive that stores a version only when content genuinely differed gives you a
change record that needed no foresight — *n* versions archived since a moment is proof
the content moved, and how many times.

Use both, and keep their epistemic strengths straight. The archive **proves change** but
cannot prove absence: nothing archived also covers a status-only write and a re-produce
that happened to yield identical content, so such a row reports *written*, not
*unchanged*. The fingerprint **proves sameness** at two points in time but says nothing
about what happened between them — three regenerations that returned to the original
payload fingerprint as clean. Together they answer both halves; either alone answers one
and quietly implies the other.

## The exclusion rule

What is excluded is anything the pipeline writes about the artifact rather than as part
of it: provenance stamps, produce logs, retry and re-roll records, cached derived
renderings, the free-text direction that steered the generation, and timestamps. The
test is not "is this useful" but **"would a reader's judgment of this artifact differ if
this key changed"**. If not, it is bookkeeping.

There must be **exactly one** exclusion rule, in one place, called by every path that
computes or compares a fingerprint. This is
[one authority per quantity](../../_laws.md#one-authority-per-quantity) applied to a
derived value, and the reason it is stated as a law rather than a preference is that a
second implementation does not fail loudly — it produces a fingerprint that disagrees
with the first, and neither side can see the disagreement. The classic shape is a field
stamped by one write path and absent on another: every artifact from the second path
reads as drifted forever, and nobody investigates because "it always says that".

The incident worth carrying is that a second rule does not merely blind one consumer — it
makes two consumers of the same fingerprint **contradict each other**. A drift comparator
carrying its own extra strip saw no divergence for the same pair of artifacts on which a
verdict-standing check saw a mismatch. A real failure was therefore presented as
"re-produced since", and the repair action offered to the operator could not correct it,
because the surface offering the repair believed there was nothing to repair. Two rules
produce a system that argues with itself and has no tiebreaker.

Changing the exclusion set or the serialization invalidates every stored fingerprint.
Version the scheme, prefix stored fingerprints with the scheme identifier, and refuse to
compare across schemes — reporting the comparison as unavailable with a reason. A
cross-scheme comparison reports the entire corpus as drifted on a deploy date, which is
how a detector gets switched off permanently.

## Decision rules

- **When only one dimension can be afforded, compute content — not status.** Status is
  recoverable from the record at any time; a content fingerprint is only meaningful
  against a baseline you must have captured earlier.
- **When drift is reported for an artifact nobody touched, suspect the exclusion set
  before suspecting the data.** A volatile key inside the projection is far more common
  than an unexplained write.
- **When there is no baseline, refuse — do not report everything as changed.** A missing
  or unparseable baseline moment is not "since the beginning of time"; a full-corpus drift
  report generated from a defaulted baseline is indistinguishable from a real catastrophe
  and will be believed once, then never again.
- **When a step has no content yet, it has no fingerprint** — record absence, not a
  digest over an empty object. A digest of nothing is indistinguishable from a real
  binding to content nobody read.
- **When the drift report is used to trigger re-judgment, do not auto-clear the standing
  verdict.** Mark it as speaking about the past and leave it visible; an invisible gap
  reads as "never judged", which is a different and softer claim.
- **When comparing across a schema migration**, expect and label a corpus-wide content
  drift rather than suppressing it. A migration genuinely did change every artifact's
  serialized content; the honest report is loud and one-time.

## When not to use this

- **When the artifact has no stable serialization** — a live session, a running scene, a
  stream — content fingerprinting is not available. Bind the comparison to an input
  specification or a build identifier and be explicit that it is coarser.
- **When change *tolerance* is the requirement** — a cosmetic reformat should not count
  — do not soften the digest with fuzzy comparison, which has no defensible threshold.
  Widen the exclusion set and bump the scheme.
- **When the question is "is this verdict still valid right now"** rather than "what
  moved between two observations", that is the verdict-standing concern of the
  quality-verdict layer, not this one. This technique compares two points in time; that
  one classifies a single record against itself.
