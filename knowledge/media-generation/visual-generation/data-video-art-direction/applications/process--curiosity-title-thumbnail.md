---
layer: application
type: application
subject: data-video-art-direction
technique: curiosity-title-thumbnail
stack: process
status: draft
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# A reveal denylist that held "dominates" and not "dominated"

A data-video studio already enforces the technique at its generation gate: the
title is one line of at most 42 characters, the hook must end with a question mark,
neither may name the final leader or an alias, and a denylist of outcome words is
matched as whole words. The seam was chosen to falsify "no superlatives or outcome
words in titles": does a whole-word list actually hold the rule, or only the
spellings it lists?

## A and B

- **A (as it was):** the list held `wins`, `dominates`, `overtakes`, `beats`,
  `champion`, `record` and five more. `dominated`, `dominant`, `overtook`,
  `unbeaten`, `undefeated`, `crowned` and `never lost` all passed rule 4, so
  "The unbeaten leader" or "Who dominated the box?" shipped as a hook.
- **B (the rule applied):** the past and adjective forms of the list's own verbs plus
  the three phrases that state the outcome ("never lost" is the technique's own
  example). Mirrored in the prompt's rules document, which a test ties to the gate.

## Result

Paired per-word test: seven new words fail against the old list and pass with the
new one. Floor: 379 schema, prompt and generation tests green. Shipped
stat-reel d13a0ce on origin main.

Deliberately not added: `winning`, `winner`, `win`. An existing test pins
"the winning shape" as legitimate, and "who will win?" is the question form the hook
is meant to be.

Not measured: how often a generated hook actually used one of these forms before
the change (no corpus of rejected hooks is kept), and the thumbnail rules (equal
tiles, winner not first), which the studio does not render as a still.
Return: a log of rejected hooks by code, to see which outcome words models reach for.
