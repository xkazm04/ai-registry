---
layer: technique
type: technique
subject: depth-and-audience
technique: four-layer-depth
status: forged
laws: [a-claim-travels-with-its-counter-evidence, depth-by-replacement-not-addition]
shared_with: []
use_when: [planning what a section of a technical article must cover, diagnosing why a correct section reads as flat, briefing a drafting agent to go deeper]
---

# Four-layer depth

The concern: "go deeper" is the most common review note on a technical draft and the least
actionable, because depth has no unit. **A section is deep when it climbs four layers:
the mechanism that produces the behaviour, the consequence in a production system, the
limits of the claim, and what it means.** A flat section stops after describing the
behaviour; a checklist of the four layers turns "go deeper" into four questions a drafter
can answer.

## The layers

| Layer | The question it answers | A flat section instead says |
|---|---|---|
| Mechanism | Which rule produces this behaviour, and why that rule? | That the behaviour exists |
| Production consequence | What changes in a real system because of it: budgets, keys, routing, evaluation, quotas? | That it "can matter" |
| Limits | Where does it not apply, where is it shrinking, what contradicts it? | Nothing, or "results may vary" |
| Philosophy | Who pays, who decided, what responsibility follows for people who build on it? | Nothing, or a closing platitude |

## Procedure

1. For each planned section, write one sentence per layer before drafting. A missing
   sentence is a research task, not a writing task: the mechanism needs a primary source,
   the consequence needs a system the author can describe, the limit needs counter-evidence.
2. Draft the mechanism with enough specificity that it predicts something. "Merge order
   follows corpus frequency, so a script that is rare in the training corpus enters the
   vocabulary late and in small pieces" predicts which languages pay most; "tokenizers
   favour some languages" predicts nothing.
3. Draft the limits as findings, with their sources, alongside the claim they limit
   ([a claim travels with its counter-evidence](../../../_laws.md#a-claim-travels-with-its-counter-evidence)).
   A limit that is only a hedge ("this may not always hold") is not a limit.
4. Give the philosophy layer its own section or paragraph late in the post, after enough
   mechanism and consequence to support it. An opinion the post has earned reads as
   judgment; one it has not reads as editorializing.
5. Fit the four layers into the section's existing length by cutting what flattens it
   ([depth by replacement, not addition](../../../_laws.md#depth-by-replacement-not-addition)).

## Decision rules

- **When a section cannot reach the consequence layer, ask whether it belongs.** Background
  with no consequence is usually a definition that grew.
- **When the limits layer is empty, the research is unfinished.** Every real effect has a
  boundary; not having found it is a fact about the search.
- **Philosophy is stated as a position with its reasons, not as a question left open for
  effect.** "Who pays for this?" followed by nothing is rhetoric; "the cost lands on users
  in the regions least able to pay it, because quotas are denominated in the unit that
  carries the premium" is a position a reader can disagree with.
- **Not every section needs all four layers equally.** The mechanism section is mostly
  mechanism; the closing chapter is mostly consequence and philosophy. The check is that the
  post as a whole climbs all four, and no section stays on the ground floor.

## When not to use it

Tutorials and reference pages, where the reader needs to act and the philosophy layer is
noise. The ladder is for explanatory writing, whose reader came to understand.
