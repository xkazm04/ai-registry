---
layer: technique
type: technique
subject: motion-quality-gating
technique: montage-budget-and-root-motion-lint
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient, a-budget-shapes-the-output]
shared_with: []
use_when: [linting a composed motion asset before it enters a build, a character drifts out of sync with its animation, animation memory grows without explanation]
---

# Montage budget and root-motion lint

A composed motion asset — one or more clips assembled into sections, with markers and
blend times attached — carries structural facts that a perceptual critic will never
notice and a compiler will never object to. It can be four times the size of its peers,
it can drive movement in code while claiming not to move the root, and it can take so
long to blend in that the character feels unresponsive. All three are cheap to detect
and all three ship constantly, because nothing in the normal pipeline asks.

This lint is deliberately structural and deliberately small. It does not judge craft;
it catches the defects that make a well-animated clip unusable.

## Memory outliers against the same-category median

Compare an asset's memory footprint against the median of *its own category*, not
against a global budget. Categories differ legitimately by an order of magnitude — a
long traversal sequence and a short reaction have no business sharing a ceiling — and a
single global number is either useless or a constant source of false alarms.

A workable trigger is roughly one and four fifths times the same-category median.
Above that, an asset is almost always carrying uncompressed keys or an unreduced
keyframe set rather than being genuinely longer, and the remedy — revisit compression
and keyframe reduction — is the same nearly every time. Report the factor, the median
and the category alongside the figure, not just the verdict: without the basis, the
reader cannot tell an outlier from a category with two members.

Two rules keep the comparison honest. **Declare a minimum peer count** — at least two
same-category peers before the rule may fire — because a median over one asset is that
asset, and every new category would flag its own first member. **State the unit.** A
memory figure without its unit and without whether it is on-disk or in-memory is not a
budget, and the two differ by the compression the platform applies.

This is the one place in this subject where a relative comparison is correct, and it is
correct because it is a check for *anomaly*, not a grade of quality. The absolute
standard still governs everything the perceptual ruler touches; peer comparison here
answers a different question — is this one unlike its siblings — and it should never be
allowed to produce a craft verdict.

## Root motion is required by category

Some categories must move the character from the animation rather than from code:
attacks that lunge, locomotion, traversal, dodges. Declare that list explicitly, and
flag any asset in one of those categories that does not carry root motion.

The defect this catches is desynchronisation. When movement comes from code while the
animation is authored as if it were driving, the character's visual position and its
authoritative position diverge — the feet slide, the lunge undershoots, and the
mismatch worsens with latency and with frame-rate variance. It is a structural fact
available at lint time and a subtle, expensive, intermittently reproducible bug in
play. Note also that this is downstream of whether the source footage was trackable at
all: fused feet in a generated reference make foot contact unrecoverable, and foot
contact is what root motion is derived from.

Flag it as a warning rather than a hard failure. Code-driven movement is a legitimate
choice for some designs; what is not legitimate is making it by accident.

## Blend-in time as a responsiveness defect

A blend into a state longer than about half a second reads as unresponsive regardless
of how good the animation underneath it is. It is the cheapest responsiveness defect to
find — the value is authored, sitting in the asset, needing no capture and no runtime —
and it is worth checking on every asset in an interactive category.

Treat it as a distinct finding from the latency norms. A norm is a budget for a whole
input-to-visible interval; this is one authored parameter that can blow that budget by
itself. Where the interval is not measurable, the blend time is still checkable, and a
check you can actually run beats a measurement you keep meaning to take.

## Decision rules

- **Every finding names its rule and carries its numbers.** A message stating the
  value, the comparison basis and the category can be acted on; "memory is high" cannot.
- **Severity is a small ordered set and a clean asset says so explicitly.** An asset
  with no findings must produce an affirmative clean result, not an empty list —
  "linted, nothing found" and "never linted" are different states and an empty list
  reads as both.
- **Refuse to lint what you cannot narrow.** An entity whose required numeric fields
  are absent or the wrong shape yields nothing, not zeros. A missing frame count that
  defaults to zero produces a zero duration, which then flows into every derived figure
  downstream.
- **Derive duration from frame count and rate, and guard the rate.** A zero or absent
  rate makes duration undefined, not zero. Emitting zero here is the single most common
  way an animation report becomes quietly wrong.

## When not to use it

- **As an acceptance gate on its own.** Everything here is structural, and structural
  proof is never sufficient: an asset can pass all three checks and be motionless,
  lifeless, or wrong for its brief. Run it alongside the perceptual ruler, never
  instead of it.
- **On assets outside a category system.** The memory rule needs categories with real
  populations. If categories are ad hoc or mostly singletons, fix the taxonomy first;
  the lint will otherwise produce noise that trains people to ignore it.
- **On imported third-party content you cannot modify.** Findings you cannot act on are
  a standing false-positive cost. Scope the lint to authored content, or mark external
  content as accepted-as-is with the reason recorded.

## The failure this prevents

The characteristic incident is a lunging attack that feels wrong only sometimes. It
looks right in the animation preview, passes the craft review, and desynchronises in
play because movement is coming from code while the clip was authored to move the root.
Reproduction is intermittent, the bug bounces between animation and gameplay for weeks,
and the fact that would have named it in one second — this category requires root
motion and this asset has none — was sitting in the asset's own properties the whole
time.
