---
layer: technique
type: technique
subject: racing-track-authoring-and-lint
technique: mutate-good-track-to-prove-linter
status: forged
laws: [structural-proof-is-never-sufficient, an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a track linter reports green on every shipped circuit and nobody has seen it fail, adding a new lint rule, reporting how many rules are proven]
---

# Mutate a good track to prove the linter

A linter whose every run on shipped content is clean has told you the content is clean **or** that
the linter cannot fail, and the two outputs are identical. The only way to tell them apart is to feed
it content that is wrong on purpose. The technique is to take a known-good track, apply one targeted
defect, and assert that the linter reports that defect and the track is otherwise unchanged.

## The procedure

1. **Start from a track that passes.** The mutant is a copy of a shipped circuit, so its only
   difference from a passing input is the defect. Mutating a track that already fails proves nothing
   about the new defect.
2. **Change one thing.** One mutation per rule: narrow every node, move a gate out of order, bend
   the ribbon into a hairpin, flatten it into a long straight or bend it into continuous curvature,
   drop two grid slots onto one place, push a site off the road, break closure, send a distant
   stretch back across the start. A multi-defect mutant cannot say which rule caught it.
3. **Assert on the specific finding.** The assertion matches the finding for the rule under test, not
   merely a non-empty list. Otherwise a mutant that trips an unrelated rule counts as a pass for the
   wrong reason.
4. **Assert the negative.** The unmutated original produces no findings, in the same test or the same
   file. A linter that rejects everything passes every mutation test.
5. **Keep a ledger of rules and mutants.** List every rule the linter has, and beside each the test
   that exercises it. A rule with no mutant is **unproven**, and the unproven count is reported with the
   verdict.

## Make the mutation realistic

A mutant that is too crude proves little. Setting every width to a tiny number tests that a comparison
exists, not that it is on the right side of the factor of two between half-width and full width.
Better mutants sit **just beyond the boundary** the rule draws: a width a little under the limit
should fail and one a little over should pass. That pair is what catches the doubled unit, the swapped
comparison and the wrong reference car. For a curve rule, build the mutant from the same family of
shapes the designer would author, a hairpin whose radius is a controlled fraction of the minimum, and
not from a degenerate shape that trips three rules at once.

The global overlap rule is the one most likely to be proven wrongly. The crossing mutant has to be a
curve that is **locally smooth everywhere** and crosses itself far along the arc: a figure of eight
built from a handful of far-apart control points works. A mutant with a local kink trips the corner
rule and says nothing about the overlap check. Its twin, a long hairpin whose two legs run close but
not overlapping, should pass and shows the exclusion distance is doing its job.

## Why this is separate from running the linter on the shipped set

Running on the shipped set answers whether the content passes. It does not exercise the rejection
paths, and each rule has exactly one such path. That is the sense in which structural proof is
necessary and never sufficient: the linter exists, parses and passes, and nothing yet says it can
see. A mutant is the next rung up and it is cheap, because the linter is deterministic geometry and a
mutant is a data edit.

The same stance covers what the linter examined. A rule that evaluates over an empty set returns
nothing. Each mutation suite carries a guard that the shipped set is non-empty and that every rule ran
over a non-zero number of segments, so a mis-wired loader that hands the linter zero tracks fails
instead of passing.

## Short-circuiting hides rules

If the linter returns on its first finding, a mutant that trips an earlier rule masks the rule under
test, and the order of the checks decides which mutants work. Either collect all findings, or order
the mutants so each is rejected by exactly its own rule, and note which rules return early so a
reader does not mistake a one-finding report for a complete one.

## What the ledger says about a real linter

A realistic ledger for a linter with eight rules is rarely eight of eight. Rules that were written in
the same sitting as their first mutants are covered; rules added for a pacing worry or a late scale
change often are not. Reporting "five of eight rules seen to fail" is a better artifact than reporting
green, and it is a task list: each unproven rule is one new mutant. This is the
[unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass) rule applied to the instrument.

## Decision rules

When a rule is added, its mutant ships in the same change; a rule without one is merged as unproven
and listed as such. When a threshold is edited, re-run the boundary pair, because a threshold edit is
the way a correct rule becomes a no-op. When a new roster dimension is added, mutate the roster and
not only the track: a car made wider than the road's minimum should make the shipped tracks fail,
which proves the roster is read at check time.

## What was measured, simulated, authored

A mutant's rejection is a measurement of the linter. It says nothing about whether the thresholds are
right; a mutant built to just beat an authored threshold proves the check agrees with the authored
number, and not that the number is wise.

## When not to use this

- **For a rule that is a one-line wrapper over a library check** whose own tests already cover the
  rejection.
- **As a replacement for driving the track.** A track that rejects every mutant can still be dull;
  these tests prove the gate, not the content.
