---
layer: technique
type: technique
subject: structured-interview-scorecards
technique: rubric-versioning-at-write-time
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [revising a live rubric, an old scorecard renders an axis as off-rubric, comparing candidates scored months apart]
---

# Rubric versioning at write time

A rating means something only in relation to the scale that produced it. So the
scale identity is part of the rating, written at the moment the rating is written
— not derived later from a date, not looked up from whatever rubric is current
when someone opens the record.

## The failure, precisely

A rubric is revised: an anchor is sharpened, a competency renamed, an axis
retired, a population split off onto its own model. Nothing about the old
scorecards changed — but everything that *reads* them now reads them against the
new scale. Three symptoms, all of which look like data corruption and are
actually an unstated dependency:

- **Retroactive off-rubric.** A competency retired in March renders as "not in
  the rubric" on a January scorecard that was scored perfectly correctly. The
  record now accuses its own author of a mistake nobody made.
- **Silent re-meaning.** An anchor rewritten to raise the bar turns every
  historical rating at that level into a stronger claim than the rater made. No
  field changed; the claim did.
- **Uncomparable comparison.** A shortlist averages ratings taken on two
  different scales and produces a number with no referent.

[A verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)
is the whole content: the verdict binds to the exact content *and the exact
rubric* that produced it.

## The mechanism

Stamp, at write time, an identity of the scale in force. Two properties matter
more than the format:

- **It covers the substance, not the label.** A version number a human increments
  is forgotten exactly when it matters — the quiet anchor edit nobody thought was
  a version bump. A hash over the actual axis set and anchor text changes when the
  instrument changes, because the instrument *is* the text
  ([meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label)).
- **It is written by the writer, not resolved by the reader.** Storing "scored
  under the current rubric" and resolving *current* at read time is the bug with
  extra steps.

The stamp has two parts and they do different jobs. The **identity** — a compact
content hash over the resolved axis list, including every description and every
anchor paragraph — answers "were these two scorecards scored on the same scale?",
and it must advance on a reworded anchor, not only on an added or removed axis.
The **shape** — the list of competency keys actually scored against — is what
lets a reader re-evaluate the old scorecard without reconstructing the whole
rubric, and it is the minimum needed to decide, correctly, which of its ratings
were on-rubric at the time.

Where two runtimes write scorecards, the identity has to be computed identically
in both. A canonical delimiter-joined serialization over the same field order,
hashed with an algorithm both languages implement exactly, is more robust than
agreeing on how each runtime's structured-data encoder orders and escapes its
output — and the agreement should be pinned by a test in each language against
the same literal, so drift fails a build rather than silently splitting one
rubric into two versions.

What the stamp buys at read time:

1. **Render against own rubric.** A scorecard displays the axes and anchors it
   was scored under. An axis absent from today's rubric is shown as scored under a
   superseded scale, not as an error.
2. **Superseded is a label, not a deletion.** A rating whose rubric no longer
   exists still stands as a record of what a rater concluded; it is marked
   superseded and never silently reinterpreted, and it is never dropped, because
   dropping it is the optimistic lie.
3. **Comparison is scoped.** Candidates are comparable within a scale and not
   across one. A view spanning versions groups by version and says so.

## Off-rubric ratings are stated, never blanked

When a rating exists on an axis the current rubric does not contain, the two
tempting responses are both wrong. Hiding it removes a real thing a rater
concluded about a real candidate. Rendering it as a normal current-rubric axis
claims the current instrument produced it. The third option is the correct one:
show it, label it as off-rubric for the version in view, and exclude it from any
aggregate that claims to be computed on the current scale. Stating the anomaly
costs one line and preserves both the record and the arithmetic.

A near neighbour of this bug is worth naming because it is silent in exactly the
same way: when a scorecard's whole *scale* is unrecognised — a legacy value, a
model-drifted string, a retired population model — the axis join matches nothing
and the record renders as a name and a verdict above an empty body. That is
visually indistinguishable from a candidate who was never scored, at the surface
where the hire decision is made. An unrecognised scale is a stated condition, not
an empty table.

## Backfill honestly

Records written before a versioning scheme existed cannot be assigned a version
they never had. The honest default is the scale that *did* exist at the time:
where a second scoring model was introduced later, pre-existing rows belong to
the original model, because the newer one could not have produced them. This is
not a guess dressed as data — it is a deduction from the introduction date, and
it should be recorded as a default rather than presented as a stamp.

Retro-classifying old records into a model that postdates them is the inverse
error and it is worse, because it produces confident, wrong provenance that
nothing downstream can detect.

## Coercion at the boundary

Version stamping runs alongside the read-side validation that a stored verdict is
one of the values the vocabulary allows. A malformed, unrecognised or
externally-injected verdict is coerced to *hold* — never to advance, never to
reject — for the same reason a rating is bound to its rubric: a value the
instrument cannot account for is not a result the instrument produced.

## Migration discipline

- **Additive changes still change the hash**, and should. Adding an axis means
  scorecards written before it did not observe it, which is a coverage fact (see
  unassessed-competency-handling), not a zero.
- **Never edit anchors in place on a live rubric without a version bump.** The
  edit that "just clarifies wording" is the one that silently re-means a
  quarter's ratings.
- **Announce the cut point.** Everyone consuming ratings — dashboards, shortlists,
  fairness metrics — needs to know that a series has two segments, because a step
  change at a rubric boundary is an instrument artifact and will otherwise be read
  as a change in candidate quality.

## When not to use this

- **Do not version a scale that is still being drafted.** Pre-launch churn does
  not need a stamp per edit; version from the first real rating.
- **Do not use a version stamp as a substitute for keeping the anchor text.** A
  hash identifies a rubric; it does not reconstruct it. The text of every version
  that ever scored a candidate has to remain retrievable, or the stamp points at
  nothing.
- **Do not let versioning imply comparability.** Two versions being recorded does
  not make ratings across them poolable; the stamp exists to prevent that pooling,
  not to license it.
