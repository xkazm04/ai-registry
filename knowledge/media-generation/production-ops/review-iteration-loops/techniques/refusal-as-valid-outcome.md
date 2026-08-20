---
layer: technique
type: technique
subject: review-iteration-loops
technique: refusal-as-valid-outcome
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [a creator note asks for something the rules or evidence forbid, designing the output schema of a revision engine, two notes contradict each other]
---

# Refusal as a valid outcome

A revision engine that can only say yes will eventually say yes to something
that breaks the work. The fix is structural: the engine's output schema has
**refusals as a first-class field**, sibling to the edits, and the craft
treats a well-reasoned refusal as better work than a badly-satisfied note.
"A note is a request, not an instruction" is the operating sentence; the
refusal channel is what makes it true rather than aspirational.

## What must be refusable

The refusal grounds are enumerable, and enumerating them is most of the
design:

- **Unsupported material.** A note asking for a fact, figure, or causal
  claim the evidence base cannot support is refused — with a statement of
  what research would be needed, so the refusal is actionable. The engine
  may not supply the figure from memory; a revision pass is not a research
  pass.
- **Required material.** Formats can mandate elements — the strongest
  counter-argument, a disclosure, a correction. A note asking to cut a
  mandatory element is refused with the reason it is mandatory.
- **Descoped material.** Weight for something the creator took out of scope
  is refused and routed back to the scoping surface
  ([scope-vs-preference-signals](./scope-vs-preference-signals.md)).
- **Binding hedges.** Where an open unknown constrains what may be claimed
  ("moves with", not "because of"), a note asking to sharpen the claim past
  the hedge is refused — the hedge binds until the unknown is resolved.
- **Structural breakage.** A note whose satisfaction would leave an
  assertion standing where an argument was — cutting all the evidence under
  a turn while keeping the turn — is refused unless the note-giver also
  takes the turn.

## The three output disciplines

Refusal alone is not enough; two neighbouring silences also need voices.

1. **Every refusal carries the note it answers and a why written for its
   author.** "Refused: rule 3" is a log line; "the counter-argument is
   mandatory in this format because a factual piece without one reads as
   advocacy" is a deliverable.
2. **Explicitly unchanged is a verdict.** Renders (or sections) the engine
   considered and left alone are listed by id. Without this,
   untouched-because-fine and untouched-because-forgotten are the same
   absence, and the creator must re-review everything to tell them apart —
   which forfeits the entire economy of the edit plan. This is the review
   loop's local instance of the wider law that a system may not let silence
   impersonate a checked pass.
3. **Conflicts are surfaced with a named winner.** When two notes on one
   target cannot both hold, the engine records which was applied, which
   lost, and why. The destructive note's effect is visible in the output;
   the dropped note's non-effect is invisible — which is exactly why the
   loser, not the winner, is what must be announced. A silently-dropped
   note teaches the creator that notes vanish, and that lesson poisons
   trust in every note that *was* applied.

## Refuse before apply — the ordering rule

A plan that violates a rule is **refused before the result is computed,
never applied and flagged afterwards**. The ordering is the whole difference
between a guard and a complaint: a post-apply flag ships the damage with an
apology attached, leaves the creator to undo it, and — worse — leaves every
derived number already recomputed from the violating state. Where a single
plan mixes valid and violating edits, the violating portion is refused
wholesale rather than partially applied; a half-applied plan is a version
nobody designed.

The same ordering applies across engines: when the transform behind a
review surface is swapped (a mock for a model, one model for another), the
refusal rules are shared code both paths run through, not prose both
prompts paraphrase. Two engines that each reimplement the rules will drift,
and the drift surfaces as the same note being refused by one pen and
honored by the other.

## When NOT to use it

Refusal is for notes that *cannot* be honored, not notes that are merely
hard, ambiguous, or expensive. An ambiguous note gets a literal reading or
a clarifying question, not a refusal; an expensive note gets an honest
plan with the cost declared. An engine that learns to refuse whatever is
inconvenient has converted its integrity mechanism into a laziness
mechanism — the refusal rate deserves the same review scrutiny as the
edits.
