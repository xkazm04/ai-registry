---
layer: application
type: application
subject: interview-story-portfolio
technique: portfolio-assignment-before-per-question-pick
stack: process
status: forged
verified_on: 2026-10-14
---

# A prompt-only interview coach: the seven-step portfolio protocol

Pinned at commit `634a8dd8` of a candidate-side interview-coaching skill. It is a set of
markdown instructions to a model with no runtime, so no version file witnesses a stack and
`verified_against` is omitted. What this realization cannot do: every rule is enforced by
prose to a model. Nothing checks that a matrix was produced, that a conflict was detected,
or that a downgrade was flagged; a run that skipped step three would look the same as one
that did it. The citations below show what the protocol asks for.

Anchors are root-relative to that tree.

## What conforms

- **The whole set is mapped at once, as a matrix.** The reference replaces per-question
  matching: references/story-mapping-engine.md:39 "7-step process replacing question-by-question mapping".
  Step one lists every viable story for every question:
  references/story-mapping-engine.md:42 "identify ALL stories that could work".
- **Collisions are named.** references/story-mapping-engine.md:57 "A conflict exists when two or more questions have the same story as their highest-fit option."
- **The loser cascades, and the downgrade is flagged with a bridge.**
  references/story-mapping-engine.md:63 "Cascade to the next-best story for the losing question."
  and references/story-mapping-engine.md:64 "Flag significant downgrades" with the bridging
  guidance field in the same line.
- **Reuse is the last resort and carries a reason.**
  references/story-mapping-engine.md:67 "No story should appear more than once in the final mapping unless no alternative exists."
  The following lines require a stated reason and a different angle for each use.
- **Tie-break goes to the constrained question.**
  references/story-mapping-engine.md:62 "assign to the question where the story's strength matters most" (the harder question or the one with fewer alternatives), which is the
  most-constrained-first idea the technique makes primary.

## Deviation: the first conflict rule is highest fit, not largest loss

references/story-mapping-engine.md:61 "Assign the story to the question where it has the highest fit level." is the rule the
technique argues against. It gives the wrong plan when the question that fits the story
best also has a strong alternative and the other question has none: the second question
ends with a gap. The protocol only reaches the better rule through its tie-break at line
62. The standard stays: contested stories go to the question that loses most if denied.

## Upward lessons

- The output schema reports portfolio health as counts (unique stories used, conflicts
  resolved with the resolution named, strength warnings), which is the short report the
  technique asks for: references/story-mapping-engine.md:127 "### Portfolio Health".
- Strength warnings are attached to the final mapping, pointing at stories worth improving
  before the interview because they appear in the plan:
  references/story-mapping-engine.md:137 "### Strength Warnings".

## Not covered

The protocol has no stated or inferred marker on predicted questions, so a guessed
question and a recruiter-stated one weigh the same in a conflict. It also does not say how
to keep a backup per question beyond the output table's backup column
(references/story-mapping-engine.md:120 "| Question | Primary Story | Fit | Backup Story | Fit | Notes |").
