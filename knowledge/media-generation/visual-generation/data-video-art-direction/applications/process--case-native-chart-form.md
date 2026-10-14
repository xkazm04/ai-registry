---
layer: application
type: application
subject: data-video-art-direction
technique: case-native-chart-form
stack: process
status: draft
verified_on: 2026-10-14
applied: experiment
ab_verdict: better
---

# A generation prompt that asked for a chart form the schema could not carry

A data-video studio runs a headless agent that proposes three visual options per
case. The agent writes strict, schema-validated props for one fixed composition, a
ranked bar race. Its prompt told the agent to vary "palette, chart form, background
treatment". The props schema is strict and carries one colour per entity, a unit
label and an axis; it has no form field and no background field.

## A and B

- **A (as it was):** the prompt names three variation dimensions; two of them (form,
  background) have no field. The agent can only ignore the instruction or invent a
  key, and an invented key is a rejected file and another paid turn. The case's move
  never reached the owner, so a case whose move the bar race hides (a newcomer that
  is a dot, a crossing) looked the same as one it suits.
- **B:** the prompt names only what the props carry, states that the form is fixed,
  keeps one identity colour per entity, and asks each option's rationale (inside the
  existing 80-word cap) for the story's move in one line and whether the ranked form
  shows or hides it at its event moment.

## What was read

The seam was chosen to falsify the technique's reach: the technique says to change
the form when it hides the move, and this tree cannot change form at all. A caught
outcome would have meant the technique does not apply to a one-composition studio.
It held in a narrower shape: the part that is executable is the diagnosis (step 1
and the first decision rule), reported to the owner, not the form switch.

Target: dimensions the prompt asks to vary that the schema cannot carry, A 2 of 3,
B 0. Read with a test that parses the instruction clause against the schema keys;
the two assertions fail on the old prompt and pass on the new one. Floor: type
check, the full unit suite (52 tests in the prompt package, all suites green),
the repo's lint ratchet and script checks unchanged or improved.

Not measured: whether the model's form-fit statements are accurate, or how many
real cases the bar race hides; no live generation run was made. Chart-form choice
itself stays unapplied until a second composition exists.
