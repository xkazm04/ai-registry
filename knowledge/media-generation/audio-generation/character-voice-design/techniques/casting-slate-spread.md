---
layer: technique
type: technique
subject: character-voice-design
technique: casting-slate-spread
status: forged
laws: [cost-per-usable-output, style-is-restated-not-remembered]
shared_with: []
use_when: [planning how many designed voice candidates to generate and how they should differ, running a second casting round around a shortlist, a casting round produced candidates that all sound alike]
---

# Casting slate spread

A slate is the set of candidates one casting round generates. Its value is the
information a listener gets from it, and that information comes from controlled
differences. Ten candidates that differ at random teach nothing except which one
happened to be loudest; ten that each move along a named axis tell the listener
where the character lives.

## Design the first slate

1. **One canonical candidate.** The vocal brief's timbre column, composed
   straight into a description. It is the control.
2. **Axis variants.** Each further candidate is the canonical description with
   one axis moved: the register lower or brighter, the age older or younger, the
   warmth cooler, the texture rougher or smoother, the energy higher or more
   measured. The axes come from the brief; each variant is labelled with the axis
   it moves.
3. **One or two register-led variants.** A candidate built around one
   register the character must own (the tactical voice, the tender voice, the
   voice at the edge of the arc), to learn whether a voice that is best at the
   hardest register still holds the working one.
4. **Hold everything else constant.** Same design text, same seed, same
   prompt-adherence setting, same read parameters for the audition lines. The
   description is the only thing that changes, restated in full each time.

Eight to ten candidates is a workable first slate: wide enough to cover two or
three axes in both directions, small enough to hear the whole board in one
sitting.

## Narrow by rounds

- **Round one finds the region.** The listener picks one to three candidates
  and stars individual takes, with a sentence on why where possible.
- **Round two varies around the picks.** New descriptions are the picked
  descriptions with smaller moves along the axes the picks disagreed on, plus a
  blend of two picks when the listener liked a quality from each. Picked voices
  stay on the board unchanged as anchors.
- **A round ends at a decision, not at perfection.** When two candidates are
  indistinguishable to the owner on the hardest line, the round has converged;
  further rounds spend money without moving the choice.

## The board is the listening-board instrument

The slate is heard on the board the generated-speech acceptance subject defines:
grouped by line, one clip at a time, every take reachable. Casting adds three
things on top of that instrument. A **play-across** control per line plays every
candidate's read of that line back to back, because comparison within one line
is the decisive listening act. A **pick and star** record per candidate and per
take is exported as text into the next round's brief. And the **effect toggle**
from the finishing layer lets the owner hear each candidate clean and treated
without generating anything twice.

## Economics

Count cost per usable candidate, not per render
([cost per usable output](../../../_laws.md#cost-per-usable-output)). A designed
slate that converges in two rounds is cheaper than an undesigned one that needs
five. Designed voices kept for auditioning usually occupy library slots, which
are finite: save the slate, cast, then delete the voices that lost, keeping their
descriptions and seeds so any of them can be regenerated later.

## When not to use it

When the brief is fixed by someone else (a licensed voice, a brand voice already
specified to the decimal), there is nothing to spread; the round is an acceptance
pass, not a casting one.
