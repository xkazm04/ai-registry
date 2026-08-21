---
layer: technique
type: technique
subject: quality-verdict-integrity
technique: content-hash-binding
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity]
shared_with: []
use_when: [storing an automated verdict for later reuse, deciding whether a cached evaluation still applies, changing what a fingerprint covers]
---

# Content-hash binding

Stamp every recorded verdict with a fingerprint of the exact payload the grader
read, so that at any later moment the fingerprint can be recomputed over what is
on record and the two compared. The comparison is what turns a stored score from
an assertion into a checkable claim.

## The procedure

1. **Define the judged payload by projection.** One named function takes the
   stored record and returns the object a consumer would receive: the artifact
   and nothing else. This function is the sole definition of "the content".
2. **Serialize deterministically.** Keys sorted at every depth, arrays in order,
   absent-valued keys dropped. Two records that differ only in key order must
   fingerprint identically, or the layer produces mismatches nobody caused.
3. **Digest, and prefix the digest with the scheme identifier** — for example
   `v2-<digest>`. The prefix is not decoration; it is the only thing that makes
   the next step possible.
4. **Stamp at write time.** The fingerprint is computed by the party recording
   the verdict, from the same payload it handed the grader — not reconstructed
   afterwards from a different read.
5. **Compare at read time**, recomputing over what is on record now, and hand
   the result to the standing classifier rather than to a boolean.

The digest need not be cryptographic. Nothing here defends against an adversary;
it detects accidental change. A fast non-cryptographic digest that runs
identically on every side of the system is worth more than a strong one that is
only available on one of them — and "available on both sides" is a hard
requirement, because an authoring surface must be able to compare a local draft
against a recorded verdict without a round trip.

## The exclusion rule, and why it is singular

The payload projection excludes **bookkeeping keys**: anything the pipeline
writes for its own purposes rather than as part of the artifact. Typical
offenders are provenance stamps, retry or re-roll logs, cached derived
renderings, and the generation instruction itself.

The rule that matters more than the list: **there is exactly one exclusion
rule**, in one place, used by every path that computes or compares a
fingerprint — the write path, the read-time classifier, the batch grader's reuse
check, and any authoring-surface drift comparator. This is
[one authority per quantity](../../../_laws.md#one-authority-per-quantity) applied
to a derived value. Two implementations that "do the same thing" will diverge,
and the divergence is invisible from either side.

The canonical incident is worth stating in full because it has two polarities.
A field stamped by the persistence layer on write, but absent on locally
produced content, made the two sides of the comparison structurally unable to
agree: verdicts recorded against persisted records were compared against locally
built payloads that never carried the stamp, so *every* locally produced piece
of content classified as changed and quietly stopped being condemned. The same
asymmetry ran the other way for a headless path that wrote records *without* the
stamp — those agreed, by accident. One codebase, one field, both failure
directions at once, no failing test. Excluding the stamp on both sides fixed
both, because then every path fingerprints the produced content and nothing else.

## Decision rules

- **When a key can change without the artifact changing, exclude it.** The test
  is not "is it useful metadata" but "would a grader's opinion be different if
  this changed". If not, it is bookkeeping.
- **When a key's exclusion is added or removed, bump the scheme.** Any change to
  the exclusion set or the serialization makes previously stamped fingerprints
  incomparable. Bumping is cheap; comparing across schemes silently reports
  every standing verdict as judging content it never judged.
- **When a stored fingerprint's scheme prefix is not the scheme in force, do not
  compare it.** Report it as unprovable with a stated reason; never treat a
  cross-scheme mismatch as a real mismatch.
- **When no fingerprint can be produced, record none.** Do not default. A digest
  over an empty record is a valid-looking binding to content nobody read, and
  once one exists in the store, nothing downstream can tell it from a real one.
- **When a bulky sub-record is excluded, ensure the load-bearing part of it is
  represented elsewhere in the payload.** A re-roll log may be excluded while
  the *selected* candidate is projected to the payload's top level — the
  selection is what the artifact is, the log is history.

## Failure signatures

- Every verdict in the store reads as bound to changed content: a volatile key
  is inside the digest, or the two sides disagree about the exclusion set.
- Verdicts on one production path stay current while an equivalent path's all
  read as changed: a one-sided stamp.
- A fingerprint exists for content that was never graded: a defaulted digest.
- Mismatches that spike on a deploy date rather than on content edits: a
  serialization change without a scheme bump.

## When not to use this

- **When the verdict is about something with no stable serialization** — a live
  session, a running scene, a stream — a content fingerprint is not available.
  Bind to whatever *is* stable (an input specification, a build identifier) and
  be explicit that the binding is coarser, rather than fingerprinting something
  that changes every frame.
- **When the artifact is a large binary and the grader read a derivative of it**
  (a thumbnail, a transcript, a still), fingerprint what the grader actually
  read, and record separately which derivation produced it. Fingerprinting the
  source binary implies a binding the verdict does not have.
- **When change detection is the goal but change *tolerance* is required** — a
  cosmetic reformat should not retire a verdict — do not soften the digest.
  Widen the exclusion set so the cosmetic field is out of the payload, and bump
  the scheme. A fuzzy comparison has no defensible threshold.
