---
layer: technique
type: technique
subject: judgment-guardbands
technique: judgment-integrity-record
status: forged
laws: [count-carries-predicate, derivation-names-recomputation, identity-survives-reuse]
shared_with: []
use_when: [a model adjustment changed a stored number, tuning a guardband or blend weight, someone appeals a score]
---

# Judgment integrity record

Every score that passed through a guardband carries a compact record of how
it got there. The record is not logging — logs rotate, are sampled, and are
not queryable next quarter when someone asks whether the band should shrink.
It is a field on the score, written at the same moment the score is written,
because a number that travels without the predicate that produced it will be
reused for a claim it does not support
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).

## What the record holds

Per scored dimension, at minimum:

- **the computed value** from the deterministic backbone, before any
  correction;
- **the coverage** the backbone reported for that dimension, including the
  distinct "could not measure" state;
- **the model's proposed value or delta**, as parsed, before clamping;
- **the effective blend weight**, plus the inputs it was derived from, so it
  can be recomputed rather than taken on faith
  ([_laws: derivation-names-recomputation_](../../../../_laws.md#derivation-names-recomputation));
- **whether the band was widened**, and under which audit flag;
- **which dimensions were excluded as unmeasurable**, and whether the audit
  was suppressed for exceeding its budget — "the audit was distrusted this
  run" is a first-class fact, not a warning sentence;
- **whether the clamp bound** — that is, whether the model wanted to move
  further than it was allowed;
- **what was rejected at the trust boundary** — malformed confidences,
  out-of-range values, unparseable fields — and what default replaced them;
- **the published value.**

One subtlety in the widening field, because it is easy to get wrong and
misleading when you do: record the dimensions that were **actually widened**,
intersected with the dimensions that actually reached the blend — not the raw
set the model nominated. A flag naming a dropped detector, an unknown
identifier or a narrate-only dimension widened nothing, and listing it
overstates how much of this score the model was trusted on. The record is
read by people deciding how much to believe a number; it must not inflate the
model's apparent role any more than it may hide it.

And once per score, the identity of the machinery: the backbone's rule
version, the prompt version, the band and base-weight constants in force.
Change any of those and scores from before and after are different series;
the record is what lets a future reader notice that rather than splice them.

The record's key is the score's own identity, minted at creation and stable
across re-runs, re-orderings and retries
([_laws: identity-survives-reuse_](../../../../_laws.md#identity-survives-reuse)).
Keying integrity records by position in a result array, or by a timestamp,
guarantees that the first backfill silently reattaches provenance to the
wrong numbers.

## The questions it exists to answer

The record earns its cost by answering questions that are unanswerable from
the scores alone. Build it for these, not for completeness.

**Is the band the right width?** The clamp-bind rate is the direct measure.
Never binds — the model was never using the room, and the band can be shrunk
for free, which is a pure reduction in worst-case exposure. Binds
constantly — something is systematically wrong, and the record says which
direction, which tells you whether to investigate the detectors or the
prompt. Without the record, both situations look identical from the outside:
plausible scores.

**Where is the backbone weak?** Coverage, aggregated per dimension across
runs, is a prioritized work list for detector improvement. Dimensions where
coverage is chronically thin are dimensions where the model is effectively
scoring alone inside its band, and nobody decided that — the arithmetic did.

**Is the audit channel healthy?** Flag rate, honour rate, over-budget rate,
and which detectors get flagged repeatedly. A recurring honoured flag on one
detector is a bug report that has been filed many times and read never. A
sudden spike after a prompt change is a regression in the channel, not a
sudden improvement in the model's diagnostic ability.

**Did the subject change, or did the judgment?** The question that makes the
record structured data rather than a warnings sentence. Two runs over an
*identical* subject can differ — a widened band on one, an audit suppressed
on the other, a different coverage estimate — and a consumer anchoring a
number needs to attribute that movement correctly. Without the record, every
such difference is reported as a change in the thing being measured, which is
the most damaging kind of wrong a scoring system can be: it sends people to
investigate a subject that did nothing.

**What actually happened to this specific score?** The appeal case. A user
disputes a number; the record reconstructs it exactly — what was measured,
what the model proposed, how much of that landed and why. This is the
difference between an explanation and an apology, and it is the reason the
record is a field rather than a log line: the appeal arrives months later.

## Make integrity visible, at the right altitude

A per-score integrity summary is worth surfacing — not the raw fields, but a
short, honest statement: which dimensions were fully computed, which were
model-adjusted and by how much, which were unmeasured. Two effects follow.
Reviewers calibrate their trust per dimension instead of treating one
composite as uniformly solid. And the presence of the disclosure disciplines
the system's own designers, because a dimension that turns out to be mostly
model-driven becomes embarrassing in a way that a hidden one never does.

Keep the altitude right. Users need "this dimension was adjusted by the
reader, within limits"; operators need the full field set; nobody needs the
raw verdict pasted into a report surface. And the summary is rendered from
the stored record, never recomputed at display time — the record is the
authority, including for its own presentation.

## Decision rules

- **When a score is written, write its record in the same operation.**
  Provenance reconstructed later is provenance invented later.
- **When a constant changes — band, base weight, budget — the record's
  version fields change with it,** and reports crossing the change annotate
  the discontinuity rather than averaging over it.
- **When the clamp-bind rate is zero over a meaningful sample, shrink the
  band.** Free safety.
- **When a value is rejected at the trust boundary, record the rejection,
  not just the substituted default.** Rejections that leave no trace are
  indistinguishable from values that were never sent, and the rate of them
  is an early warning about a model or prompt change.
- **When aggregating scores upward, carry a summary of integrity with the
  aggregate** — a composite built from three fully-computed dimensions and
  four unmeasured ones is not the same object as one built from seven
  computed dimensions, and the aggregate that hides this is the most
  misleading number the system produces.

## When not to use this

Do not build the full record where no model correction exists — a purely
deterministic score's provenance is its rule version, and adding empty
adjustment fields invites a reader to believe adjustments happen. Do not
store the model's full narrative inside the record either; it is large,
unbounded, and belongs with the report, while the record is a small
fixed-shape object meant to be queried in aggregate. And resist growing it
into a general audit log: the moment it accumulates fields nobody queries,
it stops being maintained, and the fields that matter go stale alongside the
ones that never did.
