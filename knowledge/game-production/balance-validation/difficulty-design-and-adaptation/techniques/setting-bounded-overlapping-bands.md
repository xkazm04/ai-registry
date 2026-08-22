---
layer: technique
type: technique
subject: difficulty-design-and-adaptation
technique: setting-bounded-overlapping-bands
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [combining a difficulty setting with live adjustment, an adaptive system is overriding the player's chosen setting, deciding how far a difficulty system may drift, difficulty settings feel like disjoint games]
---

# Setting-bounded overlapping bands

The named concern: get live adjustment's responsiveness without taking authority away from
the player's declared preference, by grading performance onto one shared scale, letting the
chosen setting lock a *band* on that scale rather than a point, and overlapping the bands
across settings.

A disambiguation first, because the vocabulary collides with a neighbour. These bands are a
**control** structure: a bounded region a live difficulty value is allowed to move within
during play. They are not the verdict bands of a balance readout, which classify a measured
outcome after the fact and imply an action for a designer. One bounds a controller; the
other names a finding. Keeping the two vocabularies apart matters, because a report that
borrows the controller's words reads as though the tool is driving the game.

## The three moves

**One scale.** Live performance is graded onto a single bounded scale — say zero to one —
shared by every difficulty setting in the game. One scale is what makes two players
comparable at all, and it is the precondition for the third move. The grade carries its
unit, its window and its basis: graded over what, across how much play, normalised against
which reference. Two grades computed over different windows disagree about whether a player
is struggling and neither is wrong.

**A band, not a point.** The chosen setting does not pin the live value; it locks a floor
and a ceiling around a declared starting position, with margin. A middle setting starts
mid-scale and may drift down or up within stated limits. The starting position is what the
player asked for; the margin is the system's licence to respond.

**Overlap.** Adjacent settings' bands intersect. The top of an easier setting's band
reaches into the region an adjacent harder setting occupies, and the bottom of a harder
setting's band reaches down into the easier one.

## The overlap is the load-bearing move

It is also the move most implementations omit, because disjoint tiers look tidier.

With overlap, a player doing well on an easier setting can meet the same live difficulty as
a player struggling on a harder one. That is the correct outcome, and stating it plainly is
what makes the design defensible: at that moment those two players *are* the same
difficulty problem, and there is no reason for the game to treat them differently because
of a menu choice made hours ago.

Without overlap the settings are stacked, disjoint tiers, and the adaptation is cosmetic —
it moves the value within a slice too narrow for the movement to mean anything, and the
whole system reduces to the setting it started from. A team that has built adaptation and
then partitioned the scale has paid for a controller and shipped a multiplier.

The overlap also reframes what a difficulty setting *is*, which is the honest version: not
a rank, not a promise of a fixed experience, but a statement of **where in the range the
player expects to sit**. That is a preference a player can hold truthfully. "I am a
tier-three player" is not.

## What the construction guarantees

Three properties, and they are worth naming because each is a common failure elsewhere:

- **The declaration is never overridden.** The band cannot be left. A player who chose a
  hard setting never has an easy game handed to them for failing, which is the single most
  resented behaviour of an unbounded adaptive system.
- **The adaptation is real.** Inside the band the value responds to how play is actually
  going, which is what the fourth term — the one nobody can set — needs.
- **Players stay commensurable.** One scale underneath every setting means a difficulty
  observation from one player's session can be compared with another's, and with the
  encounter targets the balance work was tuned against.

## One authority over the live value

A game with a chosen setting, a live grade and per-encounter tuning has three systems
holding an opinion about the same quantity. If two of them apply a multiplier to the same
term, the result is a product nobody authored and nobody can read back — the same defect as
a balance harness that pre-bakes a coefficient the resolution kernel also applies, and it
is just as silent.

Exactly one component owns the live difficulty value
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)). The setting
supplies the band. The grader supplies a proposal. Per-encounter authoring supplies an
offset or an exemption. All three are named, ordered inputs; the owner produces one value,
and everything that consumes difficulty reads it from there.

The companion rule concerns what the value is applied *to*. A single scalar that scales
health, damage, count and aggression together guarantees the two opposite duration failures
can never be fixed independently, because sponginess is a health problem and unfairness is
a damage problem. The live value is a vector over the authored terms, or the tuning pass
that fixes one complaint creates the other.

## Procedure

1. **Define the scale** — bounded, with its unit, window and basis stated once and shared.
2. **Define each setting's band** as a starting position plus a floor and a ceiling, and
   write the numbers where both the design documentation and the implementation read them
   from the same place.
3. **Set the overlap deliberately.** State how far each band reaches into its neighbours; a
   defensible starting point is enough overlap that a strong player on one setting reaches
   the starting position of the next, and no more.
4. **Handle cold start.** Before the grade has enough evidence, the value sits at the
   declared starting position and the grade reports *ungraded* — never a middling score
   standing in for an absent one
   ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
5. **Rate-limit the movement.** Bound how far the value may travel per unit of play so that
   no player can produce a legible cause and effect from a single encounter.
6. **Adjust between encounters, never inside one**, so the player's own damage numbers stay
   honest while a fight is running.
7. **Emit the value with its inputs** for debugging and for tuning review: the setting, the
   band, the grade, the applied offset, and the resulting value.

## Decision rules

- When the grade would push the value outside the band, clamp and record the clamp. A
  persistent clamp against a ceiling is a finding — the player is in the wrong band and
  should be invited to move, which is a prompt, not an automatic change.
- When the player changes setting mid-play, carry the grade and re-derive the value inside
  the new band. Resetting the grade throws away the only estimate of the term you cannot
  set.
- When a build changes what good performance looks like, invalidate stored grades rather
  than carrying them into the new content.
- When band boundaries move, treat historical difficulty observations as computed under the
  old boundaries and label them so; silently re-banding history invents a trend.
- When only one setting exists, do not build this. A single band with no neighbour to
  overlap is a rate-limited adaptive system, which is a simpler thing with a simpler name.

## When not to use this

- **Where the challenge is the shared subject of play.** A game whose proposition is a
  fixed, common, non-negotiable difficulty loses that proposition to a bounded controller
  as surely as to an unbounded one.
- **Where performance cannot be graded honestly.** If the available signals cannot
  distinguish a struggling player from a cautious one, the scale is noise and the
  controller amplifies it. Ship the settings without the adaptation.
- **On a scale with fewer than three settings.** Overlap needs neighbours to be meaningful,
  and with two settings the overlap either swallows the distinction or does nothing.
- **As a way to avoid choosing band boundaries.** The margin is a design decision with a
  number attached; a band defined as "some drift" is an unspecified system wearing the
  vocabulary of a specified one.
