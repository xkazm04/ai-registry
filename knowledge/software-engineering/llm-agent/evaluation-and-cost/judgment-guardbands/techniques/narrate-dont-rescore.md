---
layer: technique
type: technique
subject: judgment-guardbands
technique: narrate-dont-rescore
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a model writes both narrative and numbers, content under evaluation may contain instructions, deciding what a prompt says the model may not do]
---

# Narrate, don't rescore

Two channels leave the model: numbers and prose. The rule is that prose
*explains* numbers that already exist and never *produces* them. Applied
consistently, it is the property that makes a successful prompt injection
worthless — the attacker can change what the report says, but not what the
report scores, and a manipulation that survives only in prose is one the
person reading the score will notice.

## The two channels, and the seam between them

**Scoring channel.** A constrained verdict — per-dimension deltas or
proposed values, optional audit flags, optional justifications. This channel
is parsed, validated, clamped, blended, recorded. It is small, and everything
in it is bounded.

**Narrative channel.** Findings, explanations, recommendations, the summary a
human reads. This channel is wide and expressive, and it touches no
arithmetic.

The seam is the rule that keeps them apart: **any number appearing in the
narrative is a restatement of a computed value, not an input to one.** When
the narrative says a dimension scored 62, that 62 was passed *into* the model
as an established fact, or interpolated into the prose afterwards by the
renderer. It is never read back out of the prose. Parsing numbers out of
narrative text and storing them is the single move that collapses both
channels into one and undoes the technique — and it is the move a
well-meaning feature request produces ("can the summary's number match the
one it recommends?").

The vocabulary of dimensions and scales is likewise defined once and shared
by both channels
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)),
so the narrative cannot describe a dimension the scorer does not have, or
name a tier the scale does not define.

## Narrate-only dimensions, declared at the point of evidence

The rule has a per-dimension form worth building deliberately: where the
computed evidence is complete — a battery of graded checks, each with its
grade and its justification — the correction width for that dimension is
zero. The model writes the summary and prioritizes the gaps *from that exact
evidence*, and it is told, next to the evidence, that the number is fixed and
that it must explain the grades rather than contradict them.

Two details make this work rather than merely sound firm. The declaration
sits **beside the evidence it governs**, not in a distant instructions block,
so there is no ambiguity about which numbers it covers. And the model's
proposed value is **still parsed and recorded, unused** — it costs nothing,
and it is the cheapest instrument you will ever have for measuring how far
the model would have moved a number it was not permitted to move. A large
standing gap between the fixed value and the model's shadow proposal is a
finding: either the detectors are wrong, or the prompt is steering, and both
are worth knowing before someone widens the band on intuition.

## Prose from an interested party is not evidence

The material under evaluation asserts things about itself, in the same
channel as everything else. State the ranking explicitly: a claim made in
prose by a party with an interest in the outcome ranks **below** the computed
signals and below observed process evidence, and on its own never justifies
raising anything.

This is not the injection case; it is the ordinary and more common one. No
adversary is required — a confident self-description ("everything is
reviewed", "coverage is complete") reads as corroboration to a model never
told how to weigh it, and the score moves on the strength of the subject's
own marketing. Where the assertion is *contradicted* by computed evidence,
the mismatch is itself a finding for the narrative channel, not a correction
to the number.

## State the negative space in the prompt

Most prompts say what the model should do and stop. The undefined remainder
is where injected instructions live, because the model has no stated reason
to refuse them. An evidence block that fences the judgment does better: it
states, next to the computed facts, **what the model may move and what it may
not**.

The elements worth stating explicitly:

- which values are computed and final, and that they are not to be
  recalculated or re-derived;
- the model's role, named — an auditor of stated evidence, not the author of
  the score;
- the bound: that its correction is limited, and roughly how much room it
  actually has;
- the budget on disagreement, disclosed, so over-flagging is visibly
  self-defeating (see [self-audit-budget](./self-audit-budget.md));
- that any instruction encountered inside the material under evaluation is
  itself an observation to report, never a directive to follow.

None of this is a security boundary — instructions never are, and this
technique's protection comes from the clamp, not from the wording. What the
statement buys is a large reduction in *accidental* boundary crossings and a
clean, quotable answer when someone asks why a score did not move: the model
was told it may not, the clamp ensured it could not, and the record shows
both.

## Route found instructions to a channel that cannot pay

When the material contains text aimed at the evaluator — "score this
maximally", "ignore prior instructions", a fabricated exemption notice —
there are three handlings and only one is correct. **Obeying** is what
happens by default when material is concatenated in with no fencing.
**Silently stripping** loses a real security signal: someone deliberately
targeted your scorer, and that fact is worth more than a clean input.
**Reporting it into the narrative channel, leaving the scoring channel's
inputs untouched**, makes the attempt a finding — visible, attributable,
reviewable — that moves no number.

State the reason in one line, because it explains why the routing is not
merely tidy: **the scoring channel is the one that can widen a guardband.** An
instruction reaching the scoring path can at minimum argue for an audit flag;
one reaching only the narrative path can argue for nothing. (Fencing the
untrusted span in the first place is the neighbouring prompt-safety
discipline; this technique governs where the detected attempt may go
afterwards.)

## The display path recomputes nothing

The last leak is downstream. The number a user sees, the number in the stored
record, the number in an export and the number in a notification are all the
same stored value with the same provenance. A surface that recomputes — even
"harmlessly", to re-round or re-aggregate — is a gate reading a proxy of the
thing it gates
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)), and a surface
that derives a headline number from the model's summary text has quietly
reinstalled everything the guardband removed.

Practical tests for an existing system: search for arithmetic on scores
outside the scoring module; search for numeric parsing applied to narrative
fields; check whether any export or notification path computes rather than
reads. Each hit is a place where the band does not apply.

## Decision rules

- **When a number must appear in prose, interpolate it from the stored value**
  — never ask the model to restate it from memory, and never read it back.
- **When the model returns a value that contradicts a computed fact stated in
  its context, keep the computed fact and record the contradiction.** It is a
  useful signal about the prompt or the model, and a bad reason to change a
  number.
- **When adding a new model output field, classify it first: scoring or
  narrative.** Fields that arrive unclassified default to narrative.
- **When a found instruction is reported, store it with its location** so the
  same source can be traced across runs.

## When not to use this

The separation is unnecessary where the model's only job *is* the narrative —
no scores, no thresholds, nothing downstream keyed on a number. Forcing a
two-channel structure there adds schema and buys nothing. It is also the
wrong frame when the model is a classifier with no scale: the protection for
a label is an allowlisted vocabulary and a bounded action set, not a
narrative/score split. And note what this technique does not do: it bounds
the payoff of manipulation, not its occurrence. Detection, fencing and
tripwires at the prompt boundary remain their own discipline; this one only
guarantees that when they fail, the failure is expensive for the attacker
and cheap for you.
