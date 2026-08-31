---
layer: technique
type: technique
subject: machine-authored-documentation
technique: evidence-without-verdict
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, absent-guard-is-loud]
shared_with: []
use_when: [building a tool that helps a human review generated output, an automated check is about to emit a pass field for a judgment it cannot make, a screenshot harness reports green, deciding what a capture run should return when its capture tool is missing]
---

# The instrument gathers the evidence; it does not render the verdict

Human review is the expensive gate, so every team building a generator
eventually builds something to help with it: a harness that opens the artifact,
measures it, captures it, and hands back a receipt. That tool then reaches a
fork which decides whether the human gate survives the year.

It can report **what it measured** — this document did not overflow at four
widths, here are four images, review pending.

Or it can report **a verdict** — passed.

The second is fatal, and the reason is not that the measurement is unsound. The
measurement is usually excellent. It is fatal because the automatable subset is
the *cheap* part of the judgment, and once a field named `passed` sits in the
receipt, every consumer downstream reads it as the whole judgment. The
dashboard aggregates it. The pipeline gates on it. Six weeks later the summary
line says the artifacts were reviewed, and nobody has looked at one since the
tool shipped.

## What is measurable and what is not

The split is stable enough to state as a rule. An instrument can decide
**containment and capture**: does the rendered document fit its viewport at
each declared width, did every capture succeed, does the artifact's digest
match the one under review. Those are predicates with answers.

An instrument cannot decide **composition**: whether two labels that do not
overlap are nonetheless confusing, whether the arrangement communicates the
thing the document is for, whether a diagram that fits is also balanced or has
collapsed into a strip with a conspicuous empty band beneath it. Those are the
defects that survive a fully passing deterministic gate, and they are the
entire reason the third gate exists.

An instrument that reports `passed` has silently redefined the second list as
empty.

## The pending receipt

So the receipt's review field is a constant, and the constant is `pending`:

- The instrument reports its measurements with their predicates — the widths
  checked, the containment result at each, the capture count, the artifact
  digest and byte count it bound itself to.
- The review field reads `pending`, always, on every successful run. Not
  `passed`, not `true`, not absent. **Absent is worse than wrong here**,
  because a missing field is filled in by whoever consumes it, and they will
  fill it in optimistically
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- The images are named as *evidence for an inspection*, in the receipt's own
  words. The sentence costs one line and is the thing a future reader needs.

The exit code follows the same discipline and carries three states rather than
two: zero when the measurements passed, one when a measurement or capture
failed, and a distinct third when the capture tool itself was unavailable —
in which case the receipt's status is `skipped`, not a pass and not a failure
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Two states here collapse "I looked and it was fine" into "I could not look",
which is the single most consequential collapse in the whole subject.

## Stale evidence is deleted, not left standing

The clause that is always forgotten, and the one that turns a good receipt into
a lying one. When a capture run fails or is skipped, the images from the
*previous* successful run are still sitting beside the artifact. A reviewer
opens the directory, sees four screenshots and a contact sheet, and reviews
them. They are evidence for a document that no longer exists.

So a failed or skipped capture **removes its stale sidecars** rather than
presenting prior evidence as current. This is the same shape as
[stale-artifact-on-failed-write](./stale-artifact-on-failed-write.md) — a
failure path leaving a previous success in place where something downstream
will read it — arriving through the evidence directory instead of the output
path, and it wants the same reflex: after a failure, ask what the previous
success left behind.

## Binding evidence to the artifact it describes

Evidence that does not name what it is evidence *of* migrates. The receipt
records the artifact's digest and byte count, and a reviewer or a later
consumer can check that the thing they are looking at is the thing that was
measured. Without the binding, a re-render between capture and review — a
routine, well-intentioned re-render — silently decouples the images from the
document, and nothing anywhere reports it.

The instrument also **never modifies the artifact it inspects**. An inspector
that re-renders in order to measure is measuring its own output rather than
the delivered one, which is the proxy failure the gate doctrine exists to
prevent.

## The pairing with the gate that may not certify itself

This technique is the constructive form of a rule the corpus already carries as
a law in an adjacent domain: no gate self-certifies. Here the gate is a human
judgment and the instrument is its helper, and the rule survives translation
exactly: **the helper may narrow what the human must look at; it may never
report that the human looked.** Every automation of this gate is legitimate up
to that line and worthless past it, because past it the gate has been removed
and replaced by a claim that it ran.

## Decision rules

- **When throughput makes full review impossible**, use the instrument to
  *rank* — surface the artifacts whose measurements are marginal — and let the
  composite say `accepted (2 of 3 gates)` for the rest. Ranking is a real use
  of a measurement; certification is not.
- **When a perceptual defect turns out to be mechanically detectable**, promote
  it into the deterministic gate and out of the review, and say so. The review
  gate should shrink over time; what it must never do is disappear by
  redefinition.
- **When the review does happen**, the receipt's field is written by the
  reviewer with their identity, not by the instrument. An identity-free pass is
  indistinguishable from an unattempted one within a week.
- **When the instrument cannot run at all**, that is information worth
  printing. A capture stage that silently no-ops in an environment without the
  capture tool teaches everyone that the stage is optional.

## When not to use this

Not where the judgment genuinely is mechanical. If every defect class a
document can carry is expressible as a predicate, then the check *is* the
verdict and inventing a human gate for it is ceremony. The technique binds
where a real residue of judgment exists — which, for any document a person is
meant to read, it does.
