---
layer: golden-path
type: golden-path
subject: motion-quality-gating
status: forged
use_when: [deciding whether generated or authored motion is good enough to ship, building a machine critic that judges movement, setting responsiveness budgets for a genre, reconciling an animation manifest against what is really on disk]
techniques:
  - absolute-not-curved-judgment
  - six-dimension-motion-rubric
  - filmstrip-sampling-discipline
  - genre-response-latency-norms
  - montage-budget-and-root-motion-lint
  - asset-reality-ledger
---

# Motion quality gating

A motion gate answers one question — does this movement ship — and it is the hardest
gate in content production to build honestly, because the thing being judged does not
exist in any single frame. A still is a pose. Animation is the relationship between
poses over time, and every instrument available for judging it either looks at stills
or looks at a compressed summary of stills. The gate is therefore two artifacts, not
one: a ruler that says what good motion is, and a sampling discipline that decides
what the ruler is allowed to see. Teams build the first and inherit the second by
accident, and then wonder why their scores are noise.

This subject is machine judgment of movement destined for a character in a real-time
product: the dimensions a critic must score, the sampling that makes scoring possible,
the responsiveness budget the genre holds the motion to, the structural lint that
catches a clip which is beautiful and unusable, and the reconciliation between what a
project believes it has and what is actually on disk.

## Three questions, and they do not average

A motion gate that produces one number is answering three separable questions and
hiding which one failed.

**Craft.** Does the movement read as animation a professional would ship — weight,
timing, anticipation, settle. This is a perceptual judgment and only a perceptual
instrument can make it.

**Responsiveness.** Does the clip fit the latency budget its action class is held to
in this genre. This is a temporal measurement against a published norm and has nothing
to do with whether the motion is beautiful. A gorgeous attack windup that delays the
first meaningful frame past its budget is a defect in a fast game and correct in a
slow one.

**Integrity.** Is the clip structurally correct — does it carry root motion where its
category requires it, does it sit inside its memory allowance, does the file it names
actually exist and hold real data.

These three fail independently and their fixes are performed by different people. A
clip can score at the top of the craft ruler and be unusable because it has no root
motion; a structurally perfect clip can be lifeless. Averaging a perceptual score with
a structural check produces a number whose unit nobody can name, and the first time it
lands in the middle band the team will read it as "adequate" when it means "excellent
craft, broken rig". Report the three side by side, and let each carry its own verdict
and its own basis.

## Absolute, or it measures nothing

The standard is what actually ships in this genre today, not the batch on the bench.
Three refusals follow from that and each of them has to be stated explicitly to a
machine critic, because the default behaviour of every rater — human and model — is to
violate all three.

Do not grade on a curve; do not assume the input was competent; do not judge the
artifact relative to itself. A gate that ranks rather than scores ships the least bad
thing every single time, and "consistent within its own style" is entirely compatible
with being uniformly amateur.

The load-bearing consequence is that correctness is the floor and not a grade. A
motion that plays, loops, does not pop, and communicates nothing — the generic
placeholder every generator produces on its first pass — is a low score, not a middling
one. If your gate cannot say that out loud it will fill the shipping build with
motion that is technically fine and dramatically dead. The general method of authoring
such a ladder is a separate craft, with its own rules about anchoring levels and
sourcing criteria; what belongs here is the motion instrument itself and the specific
refusals it must carry in its own instructions.

## Define every dimension by what is visible, not by its name

A motion rubric that lists *weight, timing, follow-through* and stops has shipped a
vocabulary test. Every rater already knows the words and each supplies a different
meaning, so the resulting scores measure rater identity. The fix is to define each
dimension as a visible contrast between two states an examiner can point at in the
sampled frames: weight is *acceleration into the impact* versus *uniform floating*,
timing is *slow-in and slow-out spacing* versus *metronomic even spacing*. That is a
question about the artifact. "Rate the weight" is a question about the rater.

The published animation principles are the right source for the dimensions — the
audience is unconsciously calibrated to them — but they are principles for *authoring*,
and converting each into a checkable observation is work the rubric author does once and
everyone else inherits.

## The sampling is part of the instrument

Given a perceptual model that reads images, you show it a strip of frames laid out in
order and ask it to judge motion from the spacing. That works, and it works only if
the strip is an honest sample. Three properties are load-bearing and each fails
silently when broken: one naming family only, or two clips interleave into a chimera
nobody animated; numeric ordering rather than lexical, or time reorders itself; and an
even subsample that keeps the first and last frames, or you lose the start pose and
the settle — the two moments the rubric asks about most.

Nothing downstream can detect any of these. The critic will produce a confident,
well-argued score of a sequence that never existed. Treat the sampler as the lens of
the instrument: version it, state the frame count and the layout alongside every score,
and re-score when it changes, because a score computed on eight frames and a score
computed on twenty are not comparable quantities.

## A genre norm describes the genre, never your project

Response-latency budgets — how long after input before the motion produces its
meaningful frame — are the sharpest numbers in this subject and the easiest to abuse.
They belong to the genre: they are what comparable shipped products hold themselves to,
derived from published craft writing and observation of the market, and they are stable
across projects because player perception is stable.

So label them as what they are. A table of norms is a rubric, not a measurement of your
build. The moment it is presented next to project data without that label, someone reads
it as an audit result and reports that the game meets its latency targets, which nobody
measured. Say "this is the standard the genre is held to" in the artifact itself, in
words, adjacent to the numbers. Self-labelling is not documentation politeness; it is
the only thing standing between a rubric and a fabricated measurement.

The same discipline governs the classifier that maps a clip to an action class. When
the name and metadata do not identify what a clip is, report it as unclassified. Do not
fall back to the most common class, because the fallback is invisible in the output and
turns an unknown into a confident wrong budget.

## Never manufacture a number to complete a report

The strongest habit in this subject is negative. When a timing is not available —
the blend duration is not recorded, the input pipeline's contribution is not
instrumented, the clip length is unknown — the honest output is nothing. Not an
industry-typical default, not a plausible constant, not a mean of the values you do
have. Each of those manufactures a quantity that then travels with the authority of a
measurement, and the person who reads it three weeks later has no way to tell it apart
from a real one.

The characteristic version of this failure is a latency figure assembled from one real
number and two invented ones. It looks like a measurement, it has a unit, it moves when
the real term moves, and it is fiction. Deleting the invented terms usually means the
function now returns nothing for most inputs — and that is the correct behaviour, not a
regression. A report with a visible hole is repairable. A report with a filled hole is
not, because nobody knows there is one.

The positive form of the same habit is cheap and worth adopting everywhere: every
derived number carries a plain-language statement of which read values produced it and
where they were read from. That one string separates a measurement from a design
contract from an estimate, at a glance, forever — and its absence is what lets a
constant computed at load time from sample data display a confident, specific figure
and a verdict word about a project it has never read.

## What the project believes against what is on disk

Every content pipeline drifts from its own manifest, and motion drifts fastest because
clips are referenced from several layers at once — a state machine, a composed montage,
a gameplay ability, a data table. Reconciliation needs four views, not two, and the
gap that matters sits between the middle pair.

What the project *references* is the union of every clip name any system asks for. What
*exists* is what a walk of the content tree finds. What is *valid* is the subset of
those that hold real data rather than a stub — this is where a byte-size floor earns
its place, because a placeholder written by a failed export is a file, has the right
name, opens, and animates nothing. What *falls back at runtime* is the set the engine
quietly substitutes a default for, which is the only view that describes what a player
actually sees.

Existence checks pass on hollow assets. Compile and load checks pass on hollow assets.
Only a content-aware validity view catches them, and only a runtime view catches the
silent substitution. The reverse gap — an asset that exists and nothing references — is
worth reporting too, because an orphan is usually the shadow of a rename whose real
reference now points at nothing. This reconciliation generalises past motion to every
asset class, and it is worth building once as a general ledger.

## Seams with neighbouring craft

Grading a generated clip as a finished piece of footage — is the shot well composed, is
the style consistent, does it read as a film — is generic generative-media craft and
belongs to a different concern. The seam here is motion that must drive a character
under player input at a stated responsiveness budget: the same clip can be a beautiful
piece of footage and worthless as a locomotion cycle.

Upstream of the critic there is a pre-gate on whether generated footage is even
extractable as motion at all, and its rules are specific: fused or merged feet are
disqualifying because foot contact is what root motion is derived from, while
indistinct hands are survivable because fingers do not drive the character's trajectory.
The equivalent gate for still images entering a geometry generator is a sibling concern
with its own disqualifiers; the shape of the argument is shared, the disqualifiers are
not transferable, and each must be derived from what its own downstream stage actually
depends on.

Downstream, whether a mesh can be bound to a reference skeleton and retargeted at all is
a finishing concern, not a motion-quality one. And the integrity of the verdict itself —
binding a score to the exact content it judged, so that a changed clip does not inherit
its predecessor's pass — is a general discipline this subject depends on and does not own.

## What the naive gate gets wrong

- **It ranks instead of scoring**, and therefore always ships something.
- **It scores the summary, not the motion**, because nobody wrote down what the critic
  was shown, so a sampler change silently rewrites history.
- **It reports one number**, so a rig defect and a craft defect are indistinguishable.
- **It treats a norm table as an audit**, and the project inherits a passing latency
  grade nobody measured.
- **It checks existence and calls it validity**, and ships a build full of files that
  open and hold nothing.
- **It fills gaps with defaults** so the report looks complete, which converts a known
  unknown into an unknown unknown.
