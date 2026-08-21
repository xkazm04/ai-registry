---
layer: golden-path
type: golden-path
subject: judge-contract-design
status: forged
use_when: [designing a rubric for a model judge, hardening a judge prompt against candidate text, mixing mechanical checks with judged dimensions, deciding what a judge verdict must disclose]
techniques:
  - weighted-anchored-dimensions
  - gating-floors
  - deterministic-dimension-kinds
  - mixed-rubric-honesty
  - nonce-fenced-candidate-isolation
  - bias-counterbalancing-instructions
---

# Judge contract design

A judge contract is the stored, versioned object that defines how a model
judge scores a candidate: the dimensions, their weights and anchors, the
floors that gate a pass, which dimensions are opinions and which are
mechanical checks, and the prompt discipline under which the judge reads
attacker-influenced text. It is a *contract* in the strict sense — created
once, referenced by identity, and never reinterpreted per call. A rubric
passed as an ad-hoc string on every request is not a contract; it is a mood,
and two runs "against the same rubric" that were actually against two
paraphrases of it cannot be compared, trended, or defended.

The boundary with the builder side is sharp and worth stating. The
builder-side evaluation harness owns *running* the tests — datasets,
execution, scheduling. The builder-side structured-output discipline owns
*getting parseable output* out of a model — schemas, repair re-asks, parse
strategies. This subject owns neither. It owns the grading contract object
itself: what a defensible scoring definition looks like, why it must be
immutable and versioned, why a mechanical check is never narrated to the
judge, why cross-sample agreement is a statement about sampled judgments
only, and why every byte of candidate text in the judge's context is
untrusted by construction. The contract is what makes the harness's numbers
mean something next quarter.

## The contract is stored, versioned, and immutable in effect

Verdicts outlive the conversation that produced them. A score written today
will be read in three months by someone deciding whether quality regressed
— and that comparison is only valid if both scores were produced under the
*identical* scoring definition. So the rubric is a first-class stored
object with an identity, and verdicts reference that identity. Editing a
rubric in place silently restates history: every old verdict now claims to
measure something it did not. The professional posture is the accounting
one — a changed scoring definition is a *new version*, old verdicts keep
pointing at the version that scored them, and any cross-version comparison
announces itself as one. A scoring definition that can change under its own
verdicts is not a measurement system, per the same discipline that forbids
re-pricing history after the fact.

## Dimensions, not a vibe

The unit of the contract is the **dimension**: a stable key, a description
of what it measures, a relative weight, and — this is the part naive
rubrics omit — **anchored levels**: explicit descriptions of what 1.0, 0.5
and 0 look like (weighted-anchored-dimensions). A single holistic "rate
this 1–10" collapses every quality axis into one number the judge invents a
private meaning for; anchors are what make two samples of the same judge,
or the same judge across a model upgrade, score against the same yardstick.
The overall is the weighted mean over dimensions. Weights encode the
product's actual priorities — correctness usually dominates — and they are
part of the versioned contract, not a reader-side knob.

A weighted mean has a structural blind spot: a candidate can fail the one
thing that matters and average its way to a pass on charm. The contract
therefore carries **floors** (gating-floors): a dimension may declare a
minimum below which the case fails *regardless* of the overall. Pass is a
conjunction — overall at or above threshold AND no floor hit — never a
weighted average alone. A floor is the contract's way of saying "this
dimension is not tradeable."

## Not every dimension deserves an opinion

Some of what a rubric wants to check is mechanically decidable: the output
equals a target, matches a pattern, parses as structured data, contains a
required value, lands within a numeric tolerance. Asking a model to judge
these is worse than wasteful — it converts a reproducible fact into a
sampled opinion with nonzero error. The contract therefore types each
dimension with a **kind** (deterministic-dimension-kinds): the default kind
is judged by the model; every other kind is a local check at zero tokens
and zero cost whose verdict flows through the *same* weighting, floors,
threshold and aggregation. One pipeline, two sources of score.

Mixing the two is where honesty is won or lost (mixed-rubric-honesty), and
the rules are exact. A mechanical dimension is **never narrated to the
judge** — it appears in neither the prompt nor the response schema — so the
model cannot re-score, and thereby double-count, a check the engine already
decided. Cross-sample **agreement is a sampled-judgment-only statement**:
a mechanical check is exactly reproducible, so folding it into agreement
would drag every rubric toward perfect agreement and hide the judge's real
instability; agreement, parse counts and parse failures cover the sampled
dimensions alone, while the overall covers every dimension. Mechanical
verdicts are **auditable** — each records why it passed or failed in plain
language. Operator errors are **loud**: a pattern-check with no pattern is
a hard configuration error naming the dimension, never a candidate
silently scored zero. And a rubric that is all-mechanical makes **no model
call at all** — zero samples, null cost, and a determinism stamp that says
so, because claiming a model scored it would be a lie.

## The judge's input is hostile by construction

Everything else in the contract assumes the judge read what you meant it to
read. That assumption fails first. The candidate text — and often the input
that produced it — is authored by the very system under evaluation, which
makes the judge prompt an interpolation of attacker-influenced content into
an instruction channel. With fixed section markers, a candidate can close
its own section, open a fake verdict section, and dictate the score of the
tool whose entire premise is a trustworthy score.

The contract's answer is structural, not exhortative
(nonce-fenced-candidate-isolation): every untrusted block is wrapped in
delimiters carrying a fresh per-call unguessable nonce; a preamble declares
that only nonce-tagged boundaries are authoritative and everything inside
them is data, never instruction; any content line that *imitates* a
boundary is neutralized visibly rather than passed through; and the fact
that something tried rides the verdict as an injection-suspected flag, so a
run report can say "this case tried to talk to the judge." Isolation
without the flag hides an attack that deserves to be an alert; the flag
without isolation is an alarm on an open door. And the fence's writ runs
only to the boundary: a payload that persuades from inside its block,
imitating no marker, passes unflagged — fencing is the floor of judge
hardening, and its complement is the neighboring calibration discipline's
hostile fixtures.

The remaining hostility is the judge's own psychology. Model judges carry
measured, replicated biases: they reward length, they prefer the first (or
a fixed) position in a pairwise comparison, they favor outputs styled like
their own. The contract counters these *in the prompt text itself*
(bias-counterbalancing-instructions) — penalize unnecessary length, judge
content not style, ignore which system produced the answer, treat ordering
as meaningless — and pairs the anti-position instruction with mechanical
counterbalancing (swapped orderings, rotated batch positions) so residual
bias surfaces as measurable disagreement instead of hiding as a constant.
An instruction alone is mitigation; instruction plus counterbalanced
structure is measurement.

## Failure modes this standard exists to prevent

- **The paraphrased rubric** — scoring definitions passed as strings,
  drifting per call site; trend lines over incomparable verdicts.
- **The silently edited contract** — a rubric updated in place, restating
  every historical verdict without anyone deciding to.
- **The charming failure** — no floors, so a fluent candidate averages past
  a fatal correctness error.
- **The double-counted check** — a mechanical dimension narrated to the
  judge, scored twice, disagreeing with itself.
- **The flattered agreement** — deterministic dimensions folded into
  agreement, reporting a stable judge that is actually erratic.
- **The dictated verdict** — candidate text forging section boundaries and
  writing its own score, with no flag that it happened.
- **The verbosity tax** — an uncounterbalanced judge quietly training the
  whole product toward longer, first-listed, self-styled outputs.

## The techniques

- [weighted-anchored-dimensions](./techniques/weighted-anchored-dimensions.md)
  — dimensions with stable keys, weights and anchored levels; the versioned
  scoring definition.
- [gating-floors](./techniques/gating-floors.md) — per-dimension minimums
  that fail the case regardless of the weighted overall.
- [deterministic-dimension-kinds](./techniques/deterministic-dimension-kinds.md)
  — typing dimensions as judged or mechanical; local checks in the same
  weighting pipeline at zero cost.
- [mixed-rubric-honesty](./techniques/mixed-rubric-honesty.md) — the rules
  that keep a mixed rubric honest: never narrated, never double-counted,
  agreement over sampled judgments only, loud operator errors.
- [nonce-fenced-candidate-isolation](./techniques/nonce-fenced-candidate-isolation.md)
  — per-call unguessable delimiters, boundary-imitation neutralization, and
  the injection-suspected signal.
- [bias-counterbalancing-instructions](./techniques/bias-counterbalancing-instructions.md)
  — countering verbosity, position and self-preference bias in the prompt
  contract, paired with structural counterbalancing.
