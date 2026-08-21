---
layer: golden-path
type: golden-path
subject: maturity-ladders
status: forged
use_when: [designing a capability ladder, naming maturity rungs, changing an existing ladder, comparing assessments across time]
techniques:
  - band-design
  - rung-criteria
  - present-vs-enforced
  - ordinal-first-comparability
  - ladder-versioning
  - migrate-on-read
---

# Maturity ladders

A maturity ladder is an **ordered vocabulary of named capability states**, each
defined by criteria that an assessor can affirm or deny about a subject. Its
product is not a measurement but a *word*: this project is `curated`, that team
is `governed`, this pipeline is at `T2`. The word is the durable artifact. It
outlives the scoring code that computed it, it survives being written down in a
report a year ago, and it is the thing two people actually argue about — which
is exactly why it must be defined well enough to lose an argument against.

The naive reading is that a ladder is a presentation layer over a score: compute
a percentage, cut it into five slices, name the slices. That reading gets the
dependency backwards and produces the most common defect in the field — a ladder
whose rungs mean whatever the current rubric happens to make them mean, and
therefore mean nothing across time. **A ladder can exist with no rubric at all,
and the best ones often do**: a rung defined by a cascade of predicates
("artifacts exist" → "artifacts are current" → "a gate fails when they are not")
needs no weights, no normalization, and no arithmetic. When a ladder *is* derived
from a continuous signal, that derivation is a convenience placed on top of the
ordinal, never the source of its meaning.

The neighbouring subjects draw the seams. Criteria combined with weights into a
cardinal, comparable number — the composite score, its normalization, its
coverage honesty, its ranked gaps — belong to the
[scoring rubrics](../../../operations/service-operations/scoring-rubrics/scoring-rubrics.md) subject; here we assume
a score may exist and concern ourselves only with the ordinal that a reader
carries away. How stored assessments are kept as a history — snapshot
granularity, retention, point-in-time reads — belongs to
[versioning & snapshots](../../../operations/governance-and-records/versioning-snapshots/versioning-snapshots.md); this
subject owns only the narrow question of what happens to a *stored rung* when the
ladder that produced it changes underneath it. And the portable per-project
capability fingerprint that bundles several ladders into one shareable artifact
is the [`readiness-passports`](../readiness-passports/readiness-passports.md) subject: it is a consumer of ladders, and its
packaging concerns are not ours.

## A rung is an assertion, not a bucket

Every rung makes a claim about the world that could be falsified by a single
observation. If you cannot state, for each rung, the one thing you could see
that would deny it, you have written a mood, not a criterion. "Processes are
well-defined" is a mood. "A written definition exists, is dated within the
current release cycle, and is referenced by name from the change process" is
three deniable claims. This is the whole of
[rung-criteria](./techniques/rung-criteria.md), and it is where ladders are made
or lost, because everything downstream — comparability, migration, the
credibility of the number — inherits the precision of these sentences.

The usual predecessor of a ladder is a boolean, and the upgrade from one to the
other is the clearest demonstration of what rungs buy. "Has documentation: true"
collapses a stale one-line file and a maintained, cross-referenced library into
one value, so it cannot distinguish the two subjects and — worse — **cannot show
movement**. A subject that spends a quarter turning the stale file into the
library sees no change in its assessment, which is the fastest way to teach
people that the assessment is not worth improving. Rungs exist so that effort has
somewhere to register.

Two structural properties follow, and both are commonly violated:

**Rungs are cumulative.** Rung *n* asserts everything rung *n-1* asserts, plus
something more. A ladder whose rungs describe *different styles* rather than
*increasing capability* is a taxonomy wearing a ladder's clothes; the tell is
that you can be at rung 3 without satisfying rung 2, at which point the order is
decorative and every comparison built on it is arithmetic over a nominal scale.
Cumulativity is what licenses the single most useful operation a ladder
supports: reading a subject's rung and knowing, without re-reading the evidence,
everything below it that is also true.

**Rungs are few, and the count is derived from decisions, not aesthetics.** The
industrial convention converged on five rungs — an absent floor, an ad-hoc
state, a defined state, a measured state, an optimizing state — and five recurs
because it is roughly the number of *distinct actions* a capability owner can
take. Use as many rungs as there are materially different next moves, and no
more. Four is common and honest for artifact ladders (absent, ad-hoc, curated,
governed). Seven is almost always two rungs of false precision, and the cost is
paid in assessor disagreement at every boundary you invented.

## The line between present and enforced

The distinction that carries more weight than any other in capability assessment
is between **a thing existing** and **a thing being enforced**. A policy file in
a repository is present. A policy that fails a build when violated is enforced.
These are not adjacent shades of the same rung; they are usually the largest
single gap in the ladder, because everything between them — the drift, the stale
document, the convention everyone has quietly stopped following — is invisible
to any assessment that only checks for existence.

Naive ladders check existence because existence is cheap to detect, and so they
systematically overstate. The discipline of
[present-vs-enforced](./techniques/present-vs-enforced.md) is to make the
enforcement question a *separate axis or a separate rung with its own evidence
class*, and to require, for the enforced rung, evidence that the mechanism can
actually fail — a gate that observes the real target rather than a proxy
([gate-sees-target](../../../_laws.md#gate-sees-target) is the law underneath this, and a
configuration that has never once denied anything is not evidence that everything
passed). The corollary honesty rule: **when the evidence is arguable, score the
lower rung.** A ladder that resolves ambiguity upward will be inflated within two
assessment cycles, because ambiguity is not randomly distributed — it clusters
exactly where the subject wants a better answer.

Related, and worth stating separately: a *posture* threshold may legitimately sit
stricter than the rung floor. It is coherent and often correct to report a high
rung with a cautious posture — "capable, but not yet trusted to run unattended" —
because the rung answers *what exists* and the posture answers *what we are
willing to permit*. Collapsing the two loses the ability to say the most useful
sentence in the whole assessment.

## The ordinal is the durable unit

If a ladder is derived from a score, there is a permanent temptation to store the
score and re-derive the rung on read. Resist it. The rung is the stable, portable,
human-legible fact; the score is a function of a rubric that will change. Store
the ordinal, store the ladder version that produced it, and treat any derived
percentage as display.

The arithmetic consequences are strict and routinely ignored. Rung labels map to
integers for ordering only; the spacing between them is unknown and almost
certainly unequal — the distance from "ad-hoc" to "defined" is not the distance
from "measured" to "optimizing". Therefore: **never average rungs**. A mean of
3.4 across a portfolio looks authoritative and corresponds to nothing; it also
invites subtraction ("we improved by 0.3") over a scale that does not support
it. Report distributions, medians, modes, and counts-at-or-above-a-rung; those
are the operations an ordinal scale licenses. Every such count travels with its
predicate ([count-carries-predicate](../../../_laws.md#count-carries-predicate)): "11 of
40 at `governed` or above, under ladder v3" is a finding; "average maturity 2.7"
is not. The rules, including what comparability requires *across subjects* (one
authoritative rung vocabulary, not per-team dialects) and *across time*, are
[ordinal-first-comparability](./techniques/ordinal-first-comparability.md).

## Bands are policy, and edges flap

Where the ladder does sit on top of a continuous signal, the placement of band
edges is a policy decision with the same standing as a weight vector: someone
owns it, it has a rationale, and changing it re-labels everyone.
[band-design](./techniques/band-design.md) covers the two failures that follow.
The first is decorative equal-width banding (0-20-40-60-80), which encodes the
belief that capability is uniformly distributed and is essentially never true;
edges are placed where the *population* and the *decisions* have joints, then
frozen. The second is **flapping**: a subject sitting at an edge oscillates
between two rung names across runs on noise alone, and because the rung is a
word, each oscillation reads as a real event to whoever receives it. The fix is
hysteresis — require a margin to move up and a larger drop to move down, or
require two consecutive observations before announcing a change. Announcements
are the thing being stabilized, not the underlying computation.

## A ladder is a versioned contract

The moment a rung is written down — in a report, a database row, a shared
document — the ladder becomes an interface, and it acquires the obligation every
interface has: a version, and a story for what happens to old values. What counts
as a **rung-moving change** is a judgment that must be made deliberately rather
than discovered later: adding or renaming a rung, altering any criterion,
changing a band edge, tightening an evidence requirement, changing the
cumulativity of a predicate. Cosmetic changes — a tagline, a colour, a
description reworded without changing what it asserts — do not move rungs. That
line, once drawn, is enforced structurally: fold the ladder version into any
cache key so a bump invalidates every derived result atomically, and pin the
criteria with a test whose failure forces the version-bump decision into the same
change as the criteria edit, rather than leaving it to a reviewer's memory. See
[ladder-versioning](./techniques/ladder-versioning.md).

Stored ordinals from older versions then need a defined read path. The durable
pattern is [migrate-on-read](./techniques/migrate-on-read.md): stored values keep
their original version stamp, and a mapping is applied when they are read, so no
backfill is required, no history is rewritten, and a subject whose old rung has
no honest equivalent under the new ladder surfaces as *unmappable* rather than
being silently coerced to a neighbour. An unknown version must read as unknown,
never as rung zero — the difference between "we could not interpret this" and
"this was absent" is the difference between a gap and a verdict
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## The failure modes worth naming

- **Level inflation.** Ladders are political the moment anyone is measured by
  one. Without deniable criteria and a bias-to-the-lower-rung rule, the observed
  distribution drifts upward while the underlying capability does not. The
  diagnostic is cheap: if no subject has ever been *demoted* by a re-assessment,
  the ladder is not measuring.
- **Ladder-as-checklist.** Rung criteria collapse into a list of artifacts to
  produce, and subjects produce the artifacts. This is the enforcement gap made
  into a business model. The counter is that upper rungs must require evidence of
  *operation* (the gate fired, the review happened, the metric moved), which
  cannot be produced by creating a file.
- **Rungs redefined in place.** The most damaging change is the invisible one:
  criteria edited without a version bump, after which every stored rung is a
  claim about a definition that no longer exists, and trend lines splice two
  incompatible scales into one confident slope.
- **The ladder with no floor.** If the bottom rung is "beginning" rather than
  "absent", there is nowhere to put a subject that genuinely has nothing, and
  the ladder's most common true answer becomes unsayable.
- **Per-team dialects.** Two teams each with a sensible five-rung ladder and no
  shared definition produce numbers that compare and meanings that do not.
  Comparability is a property of the vocabulary being singular
  ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)), not of
  the ladders being the same length.

## What good looks like, compressed

- Every rung names an observation that would deny it, and an assessor with the
  criteria alone reaches the same rung as the author.
- Rungs are cumulative, the bottom rung is absence, and the rung count equals the
  number of materially different next actions.
- Existence and enforcement are never the same rung, and the enforced rung
  requires evidence that the mechanism can fail.
- Ambiguity resolves downward, by written rule, not by assessor temperament.
- The stored value is the rung plus the ladder version; any percentage is
  display, and no report averages rungs.
- Band edges, where they exist, carry an owner and a rationale, and rung
  *announcements* are hysteretic even when the computation is not.
- A criteria edit cannot merge without a version decision, and old stored rungs
  are mapped on read — with `unmappable` as a permitted outcome.

## The techniques

- [band-design](./techniques/band-design.md) — placing and freezing band edges over
  a continuous signal, and the hysteresis that keeps rung announcements from
  flapping.
- [rung-criteria](./techniques/rung-criteria.md) — writing a rung so two assessors
  agree: deniable predicates, evidence classes, cumulativity, granularity.
- [present-vs-enforced](./techniques/present-vs-enforced.md) — the existence /
  operation / enforcement axis, its evidence requirements, and the
  score-the-lower-rung rule.
- [ordinal-first-comparability](./techniques/ordinal-first-comparability.md) — the
  ordinal as the stored unit, the arithmetic it forbids, and what comparability
  across subjects and across time actually requires.
- [ladder-versioning](./techniques/ladder-versioning.md) — what counts as a
  rung-moving change, and the structural devices that force the bump decision.
- [migrate-on-read](./techniques/migrate-on-read.md) — mapping stored ordinals
  forward at read time, lossy directions, and honest unmappability.
