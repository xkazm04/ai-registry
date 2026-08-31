---
layer: golden-path
type: golden-path
subject: reference-parity-gating
status: forged
use_when: [deciding whether a generated artifact is the thing it was supposed to reproduce, designing a gate that scores against a reference rather than against a health rubric, a parity score is high and the artifact is visibly wrong, the reference itself turns out to be defective, a producer is tuning to the metric instead of to the target]
techniques:
  - dual-anchor-scoring
  - register-once-from-the-invariant
  - no-average-hides-a-failure
  - findings-carry-the-correction
  - instrument-blindness-register
  - defect-cap-bounded-to-its-reach
---

# Reference parity gating

A health gate asks whether an artifact is well-formed. This one asks a harder question:
**is it the thing it was supposed to be?** A generated asset can be watertight, correctly
wound, inside its budget, at the right world scale, and still be the wrong object. Parity
gating is the tier that measures the artifact against a reference it is meant to
reproduce, and produces a number that means *how far off, and where*.

The distinction is not academic, because the two tiers fail in opposite directions. A
health gate that is wrong rejects good work — it fails a correct assembled asset for
having many components, and the operators learn to ignore it. A parity gate that is wrong
does something worse: it *accepts*. It emits a high score for an artifact nobody would
accept on sight, and because the number is quantitative and the pipeline is automated,
that score travels downstream as evidence. Everything in this subject exists because a
parity score is the single most credible-looking wrong answer a content pipeline can
produce.

The subject is asset-neutral by construction. The worked measurements below come from
gating procedurally rebuilt vehicle geometry against reference models, because that is
where the discipline has been paid for in full — but the anchors, the registration rule,
the statistic choice, the work-order contract, the blindness register and the waiver rule
transplant unchanged to any artifact with a reference: a texture against a source plate, a
motion clip against captured performance, a re-rendered shot against an approved frame.

## The producer must never hand the gate a number

Start here, because every other discipline is downstream of it. Both artifacts — the
reference and the candidate — go through the **identical** measurement pipeline, and
nothing is self-reported. The candidate scores only by actually matching measured
reference geometry through the same masks, the same tracing, the same normalisation.

The moment the producer supplies any input to its own score, the gate stops measuring
parity and starts measuring the producer's opinion of its parity. This is
[no gate self-certifies](../../_laws.md#no-gate-self-certifies) applied to a comparison
rather than to a check, and the comparison case is the easier one to get wrong, because a
"measured" number feels like it has already satisfied the law. It has not. Ask which side
of the comparison produced each input, and if any of them came from the thing being
graded, the number is an assertion wearing a decimal point.

The same rule governs the record. The score ledger is written by the tool and by nothing
else; a hand-edited row is a program violation rather than a correction, because the only
property that makes the ledger worth reading is that no producer could reach it.

## One anchor is gameable — the gate needs two that constrain each other

A parity gate with a single authority can always be satisfied by matching the authority
rather than the truth, and the reference is exactly the authority most likely to be
subtly wrong. References are stylised, mis-scaled, fused, posed for a purpose other than
yours; a candidate that faithfully reproduces a defective reference is *worse* than one
that misses it, because it inherits the defect and carries a passing score.

The corrective is structural. Score against **two authorities that measure different
quantities and constrain each other**: the reference's traced silhouette, and the
published specification the real object is known to satisfy. A candidate that matches a
defective reference — a sunken body, a fused and elevated turret — still fails the
dimension rows. A candidate that hits every published dimension but does not track the
reference's profile fails the curve rows. **The two cannot be satisfied together without
being actually right**, and that property, not either number alone, is what the gate is
for.

This is not a violation of [one authority per quantity](../../_laws.md#one-authority-per-quantity)
but an application of it, and the distinction is worth stating because a reviewer will
raise it. Two authorities answering *the same* question with two models is the failure
that law names. Here each quantity keeps exactly one owner: published dimensions own
scale, the reference silhouette owns profile. They are independent measurements of
different properties whose *conjunction* is hard to fake — which is the only kind of
redundancy that adds information rather than ambiguity. The procedure, the scoring split
and the trap of adding a third correlated anchor are
[dual-anchor-scoring](./techniques/dual-anchor-scoring.md).

## Register once, from the part that cannot move

Any comparison between two artifacts needs a frame, and choosing that frame is a decision
with more consequences than it appears to have. Two rules carry nearly all of the value.

**Compensate for as little as possible.** A registration that normalises translation,
rotation and scale before comparing will report that a half-size, listing candidate
matches beautifully, because it corrected away exactly the errors it was supposed to
find. Translation-only registration is ruthless about scale and pose for the same reason
it is uncomfortable: it refuses to fix the candidate's problems before grading them.

**Derive the frame once, from the region the defect cannot reach, and reuse it.** Compute
the alignment from the invariant part — a body silhouette that excludes the long
protruding component whose length is itself under test — then reuse that alignment
unchanged for every dependent row. Register each row independently and a displaced
component simply re-centres itself: a part sitting 40 cm out of position, or floating
above its seat, self-registers the error away and scores clean. Registering once from the
invariant makes displacement *visible as displacement*, which is the whole point.

The cost is real and must be paid consciously: the more the registration refuses to
compensate, the more classes of defect it becomes blind to. Translation-only registration
cannot see a mirrored artifact at all — a body assembled backwards keeps its silhouette,
overlaps the reference well enough to score in the seventies, and is caught only by a
human looking at it. That is not an argument for a richer registration; it is the first
entry in the blindness register below. See
[register-once-from-the-invariant](./techniques/register-once-from-the-invariant.md).

## Every summary statistic is chosen for what it cannot hide

A parity gate compresses thousands of per-column deviations into a handful of numbers, and
each compression is an opportunity to hide a failure. Choose every one of them
adversarially — assume a producer is optimising against the number rather than the target,
because eventually one will be.

Three choices carry the weight. **The minimum is the headline**: a gate that averages
across views, components or assets lets a strong region pay for a broken one, and the
broken one is the finding. **A high percentile beats the maximum**: a raw worst-case is
gamed by a single aliased sample, while a p95 cannot be gamed by hiding a defective region
under a small fraction of the measurements. **Coverage is counted in both directions**:
count the reference positions the candidate misses *and* the candidate positions the
reference lacks, so that excess geometry is exactly as visible as missing geometry.

There is an honest exception, and it is instructive rather than embarrassing. Cross-section
rows use a trimmed mean with the two worst slices dropped, because a single legitimate
overhang would otherwise mask every other slice — while a *systematic* width error, which
is what the row exists to catch, still fails. The rule is not "never soften a statistic";
it is that every softening names the defect class it is deliberately admitting.

The reverse failure is subtler and costs more time. A score that is **floored** carries no
gradient: when a candidate is far enough off that the dominant term saturates, the headline
reads zero before a fix and zero after it, and a real improvement looks like a no-op. A
correction was once reverted on exactly that evidence, and re-adjudicating it by the
component terms showed the change had collapsed one-sided coverage from 5.29 to 1.12 and
trued the frame. **Judge a saturated score by its terms, never by its headline.** All of
this is [no-average-hides-a-failure](./techniques/no-average-hides-a-failure.md).

## The score is not the product — the work order is

A gate that emits a number tells a producer that it failed. A gate that emits *where* and
*by how much* tells it what to do, and the difference decides whether the loop converges.

Every scored row carries its worst offenders as located, signed deviations: the position
along the axis, the reference value, the candidate value, and the error in real units.
That row reads as an instruction — *at this station your lower front is 0.58 m too deep* —
and a producer can act on it without a human translating the score into a task. The
aggregate exists for sorting and for dashboards; it is derived from the findings, never
the other way round.

Two consequences follow. First, **there is no iteration cap, because the gate defines
done**: when the findings are the work order, "keep going until every component clears the
bar" is a terminating procedure rather than an open-ended grind, and capping iterations
would substitute a budget decision for a quality one. Second, the bar is set by the target
and not by the current population. A gate whose threshold is calibrated to what the line
produces today is a description of today, and the strongest artifact in a fleet sitting
far below the bar is the gate working — see
[grade against what ships, not on a curve](../../_laws.md#grade-against-what-ships-not-on-a-curve).
The contract for the row payload is
[findings-carry-the-correction](./techniques/findings-carry-the-correction.md).

## Every rig is blind to something, and the blindness is structural

This is the section that distinguishes a mature parity gate from a new one, and it is the
one most teams never write.

A measurement rig has a configuration — how it renders, what it projects, what it
compensates for, what it culls — and that configuration determines a set of defect classes
the rig **cannot ever see, at any threshold**. These are not false negatives to be tuned
away. They are consequences of the geometry of the measurement, and the only correct
response is to enumerate them and assign each one a *different* witness.

Four worked instances, each of which shipped a defect at a passing score:

- **Culling mismatch.** The measurement masks render double-sided; the consuming runtime
  and the visual critic render single-sided. A mirrored construction loop handed builders
  the opposite winding, so every face pointed inward — an entire side of an object was
  invisible in the product while the parity rows read above 90. Flood-based tools are
  blind to the same class, because a reversed surface reads as open background rather
  than as a hole. Only a rendered view is a witness.
- **Registration blindness.** Translation-only alignment cannot see a mirrored assembly,
  as above. A mirror re-scoring check catches asymmetric silhouettes and provably does not
  catch near-symmetric ones.
- **Projection blindness.** Cross-section cameras clip a thin slab, so a long, thin,
  axis-aligned component presents only its end caps and vanishes at every mid-span slice —
  silently depressing width rows while the silhouette views see it correctly. The rig is
  measuring correctly; the authoring is at fault, and segmenting the component recovered a
  cross-section row from 54.2 to 76.1 with no other change.
- **Silhouette blindness.** An orthographic mask cannot see hollowness at all. Open shells,
  unclosed backs and floating panels are invisible to every silhouette row and obvious in a
  shaded overhead or perspective view.

A fifth is worth naming because it inverts the intuition: **invisible geometry still
measures.** Bounding-box computation, framing, hashing and probes all see meshes flagged
not-visible, so a hidden kit parked at an unused pose silently widened every frame that
was supposed to exclude it.

The discipline is to keep this list as a first-class artifact of the gate, each entry
naming the class, why the rig cannot see it, and which witness does. The corollary is the
rule that closes the whole subject: **a parity score alone never certifies an artifact.**
[structural proof is necessary and never sufficient](../../_laws.md#structural-proof-is-never-sufficient)
is usually read as a statement about well-formedness; a parity number is structural proof
too, and a mandatory human or critic pass over rendered output is the rung above it. See
[instrument-blindness-register](./techniques/instrument-blindness-register.md).

## When the reference itself is wrong

Sooner or later a component is capped not by the candidate but by a defect in the
reference — a fused assembly, a part modelled short, a body posed for storage rather than
for use. The naive responses are both wrong: grinding against an unreachable target burns
the line, and waiving the component wholesale converts one defect into a blanket
exemption.

The rule is that **a waiver is bounded to exactly the rows the defect can reach, and the
bound is provable from the measurement's own structure.** Because alignment is derived
from the invariant region, a reference whose protruding component is modelled short caps
*only* the whole-object rows — body, sub-assembly, cross-section and dimension rows all
remain fully satisfiable, and a waiver claiming any of them is invalid on its face. A
waiver never covers the specification anchor, because no reference defect can excuse a
published dimension.

Two disciplines make waivers survivable. Repairs to a reference are append-only recipes
over pristine committed bytes, proven byte-idempotent, never flat-assigned over a live
recipe — a stale duplicate once double-transformed a reference and the recovery came from
the untouched original. And **a repair that re-frames the reference retires every
conclusion measured against the old pose**, including waivers granted under it: a
long-standing "modelled short" cap dissolved entirely when a census showed the assembly
had merely been posed off-station, and one rigid translation seated it. That is
[a verdict is bound to the content it judged](../../_laws.md#a-verdict-is-bound-to-its-content)
reaching backwards through a waiver. See
[defect-cap-bounded-to-its-reach](./techniques/defect-cap-bounded-to-its-reach.md).

## What this subject deliberately does not own

- **Whether the artifact is well-formed enough to import at all.** Watertightness, winding,
  degenerate faces, component shattering and face budgets are the health tier, and it runs
  first and cheaper.
- **Whether the artifact is any good.** Craft rubrics, aesthetic verdicts and the critic
  that judges rendered output are a separate concern; this subject hands that tier a
  registered, measured artifact and stops.
- **Storing and ageing the resulting verdict.** Content binding, staleness and rubric
  supersession are their own subject; what belongs here is only that a re-measured artifact
  invalidates its prior parity rows.
- **What to do about a failing artifact economically** — repair, re-roll, or escalate.
- **Setting the specification.** This gate consumes published targets; it does not decide
  them.

## The failure modes of the naive reading

- **Believing a single anchor.** The reference is the authority most likely to be wrong,
  and a gate with one anchor rewards reproducing its defects.
- **Registering every row independently.** Displacement disappears into the frame, and the
  gate reports that a part out of position is in position.
- **Compensating for rotation and scale.** The registration corrects away the two error
  classes cheapest to detect.
- **Averaging.** One broken view under three good ones is the finding, and the mean deletes
  it.
- **Reading a floored score as a flat result.** A saturated headline hides real movement;
  the terms do not.
- **Emitting a score without locations.** The producer is told it failed and not what to
  change, and the loop stops converging.
- **Treating a blind spot as a tuning problem.** No threshold recovers a defect class the
  rig's configuration cannot represent; only a different witness does.
- **Granting a waiver by component name.** A defect caps the rows it can physically reach
  and no others, and a waiver over the specification anchor is never valid.
- **Certifying on the number alone.** A high parity score on a backwards artifact is the
  canonical outcome, and it has happened.
