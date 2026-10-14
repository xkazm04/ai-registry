---
layer: application
type: application
subject: proposal-narrative-structure
technique: funder-dollars-unlock-close
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: unmeasurable
proof: structural-only
---

# A one-line instruction to close on the unlock, and what the recorded closes did with it

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `47d77b6` and its ledger row is `317a44e`,
both on the project's `main`.

## The tree carried the technique as a clause, in one genre of four

The narrative prompt is genre-specific: a foundation form, a federal review-rubric form, an
advocacy theory-of-change form and an arts form. Only the foundation form said anything about the
close, and it said it in one line: finish with what this funder's dollars unlock specifically.
The other three forms said nothing, so a federal, advocacy or arts draft closed wherever the model
chose to stop. The technique's own boundary cases map onto exactly those gaps: a rubric has no
free-form close, advocacy changes the currency of the unlock, and an arts close is made of the
work itself.

## What was measured, and what was not

The project keeps a recorded quality-gate run: 23 narrative closing sentences across three
passes of the same scenarios, produced under the foundation one-liner. Arm A is those closes.

- **Concrete increment named** (a figure, a bracketed placeholder or a countable unit in the final
  sentence): 4 of 23.
- **Generic-impact language** (a final sentence built from "moves beyond", "ensures",
  "long-term", "bridges"): 17 of 23.

So the one-line version of the technique does not produce its product. The instruction was
present and the model still closed on an abstraction, which is the finding: naming the three
questions (additionality, sizing, timing) is what the technique adds over its own headline.

Arm B, the new clause, was not run. The run had no live model key, and the project's harness
replays recorded outputs but does not execute offline. The verdict is therefore `unmeasurable`,
and the structural fact stands on its own: the prompt now states the clause in each genre's own
terms, a new test fails against the old prompt, and the full suite and the type check are clean.

## What changed

A shared close clause asks for the concrete increment the grant makes possible, in the
population's terms, why now, sized to the amount range, or in units when the range is
unspecified; and, when the grant only sustains operations, what stops or shrinks without it. The
federal form moves the unlock inside its approach and capacity sections, in the same components
the budget will itemize. The advocacy form states it in strategy and change terms, explicitly not
in units of service. The arts form states it in the work's own terms. The anti-fabrication
placeholder rule is kept in every genre, because the close is where a generator is most tempted
to supply a satisfying number.

## What this realization cannot do

It cannot say the clause works: the share of closes that name an increment under B is unknown, and
the clause could make invented increments more likely, with the placeholder rule the only brake.
It does not check the close against the budget's own lines, which the technique calls the
strongest form. And it does not touch the post-award report prompt, where the technique says the
close is accountability and not a new ask.

## Return condition

When the harness can run live, rerun the narrative scenarios and read three numbers: the share of
closes naming a concrete increment (A is 4 of 23), the count of figures with no placeholder
around them, and the word-band gate.
