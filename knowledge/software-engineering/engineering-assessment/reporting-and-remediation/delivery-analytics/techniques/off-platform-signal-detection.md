---
layer: technique
type: technique
subject: delivery-analytics
technique: off-platform-signal-detection
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [a delivery metric reads suspiciously low, deciding whether an absent artifact means an absent practice, choosing between suppressing a metric and crediting it]
---

# Off-platform signal detection

Every metric in this subject reads an artifact stream, and every artifact
stream is a partial record of the behaviour it describes. Teams review in a
room, over a call, or in a chat thread and then merge without touching the
approval control. Teams sign off in a trailer line their host does not model as
a review. Teams pair, so the second pair of eyes was present before the change
existed and left no reviewer record at all.

For a measurement system, an absent artifact and an absent practice are the
same input. Reading it as the practice's absence is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) in
assessment form: the instrument that could not observe the behaviour must not
report the same value as the instrument that observed the behaviour not
happening. And it is [gate-sees-target](../../../../_laws.md#gate-sees-target) too —
the metric was supposed to observe *review*, and it observed *a platform's
record of review*, which are the same thing exactly until they are not.

The discipline is not to guess, and not to soften every low number with a
caveat. It is to go looking for **positive evidence that the behaviour is
happening somewhere else**, and to act only on evidence.

## What positive evidence looks like

Off-platform evidence is a pattern in the artifacts that is *cheap to produce
only if the practice is real*:

- **Sign-off or approval trailers** in change messages — a conventional line
  naming a second party who vouched for the change. Structured, deliberate,
  and hard to produce accidentally.
- **Consistent co-authorship** on a large share of changes — the artifact
  shape pairing produces.
- **Review discussion recorded outside the review object** — a linked thread,
  an issue comment referencing the change with substantive content, a design
  document approval that names the change.
- **A stated, discoverable convention** — the repository's own contribution
  guidance describing where review happens.

None of these is proof. Each is enough to establish that *the metric's
assumption is unsafe for this repository*, which is all the decision requires.

## Two responses, and choosing between them

**Additive credit** — fold the off-platform evidence into the metric as
additional observed instances. Correct only when the evidence is per-change,
high-precision, and semantically equivalent to what the metric counts: a
sign-off trailer naming a second party genuinely is an approving second party,
and treating it as one makes the metric *more* accurate. Credit is additive,
never multiplicative: it adds observed instances to the numerator, it never
scales a rate by a fudge factor, because a scaled rate has no population and
cannot be checked.

**Suppression** — decline to publish the metric for this scope, and publish the
reason instead. Correct when the evidence is repository-level rather than
per-change: it tells you the number is wrong without telling you what the right
number is. A team that reviews in a room produces no per-change evidence at
all, so there is nothing to add; the honest output is "review is not observable
for this repository — its review practice happens outside the artifacts we can
read", and every downstream consumer — score, ranking, recommendation — must
treat the metric as *absent*, not as low.

Suppression beats an asterisk. A number rendered with a footnote is a number
that will be quoted, sorted, averaged, and compared without its footnote,
because the footnote lives in the render layer and the number lives in the
data.

## Procedure

1. **Set a detection bar before looking.** A share of changes carrying the
   evidence, over a minimum population — a single trailer on one change is
   noise. State the bar; it is part of the metric's definition.
2. **Run detection whenever the affected metric is computed**, not only when a
   number looks odd. Detection triggered by surprise is detection biased toward
   confirming whatever the analyst already suspected.
3. **Classify the evidence as per-change or repository-level**, and take the
   corresponding response.
4. **Propagate the suppression as absence, in the type.** A suppressed metric
   must be representable as "not measured" all the way to the render surface;
   if the pipeline can only carry numbers, suppression degrades into zero at
   the first hop, which is the exact failure the technique exists to prevent.
5. **Record that suppression occurred**, so the reason is attached to the scope
   and a later reader is not left wondering why a repository has no row.

## Decision rules

- **When evidence is found on a minority of changes but well above the noise
  bar, credit those changes and disclose the mixed mode.** Half a team using
  trailers is a real observation, not a reason to suppress.
- **When both the platform record and off-platform evidence are absent, do not
  suppress.** Suppression requires positive evidence of the behaviour
  elsewhere. Absent both, the metric is genuinely low and should say so — with
  its sample size.
- **When suppressing a metric that feeds a composite, remove the dimension and
  renormalize rather than scoring it zero.** Composite absence handling is the
  scoring subject's discipline; what this technique owes it is a value that is
  honestly absent rather than a zero wearing a footnote.
- **When a detection rule starts firing on most repositories, audit it before
  trusting it.** Broad detection almost always means the pattern has become too
  loose — a common word, a template line — and a rule that suppresses
  everything has disabled a metric rather than corrected it.

## When not to use this

Do not use off-platform detection to rescue a metric someone dislikes. The
technique exists to prevent false negatives, not to manufacture credit; if the
evidence bar is being relaxed under pressure from a result, the bar was never
real.

Do not apply it to metrics whose subject genuinely cannot occur off-platform.
A merged change either has a batch size or does not exist; there is no
off-platform size. Reserve the technique for behaviours a human can perform
without leaving a machine record: review, approval, sign-off, pairing,
discussion.

Do not treat a stated convention as evidence on its own. Contribution guidance
describes intent; the artifact pattern describes practice, and where they
disagree the artifacts win.
