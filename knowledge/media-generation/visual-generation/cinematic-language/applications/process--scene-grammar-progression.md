---
layer: application
type: application
subject: cinematic-language
technique: scene-grammar-progression
status: forged
stack: process
applied: code
ab_verdict: better
verified_on: 2026-10-14
refresh_by: 2027-04-14
---

# Where a scene's grammar was checked by eye - a shot-list lint, October 2026

A media studio keeps one demonstration scene built from the corpus's own rules: a
genre contract, a restated place, identity references, and a five-shot list in
coverage order (master, two over-the-shoulder shots, an insert, a close-up), each
shot stating which way its figures face on screen. The technique's decision rule
says to check that list top to bottom for axis, eyeline and progression violations
before any generation is spent. In that tree the check was a person reading the
list; nothing executed it, and generation runs for hours on one card.

## What was read

Each shot is a tuple of id, brief, identity references, and the one function it
serves. Reading the briefs against the technique's procedure: the master, both
over-the-shoulder shots and the insert held up. The closing close-up carried an
identity reference, so a face is in frame, and stated where the man looks ("eyes
down on his own hand") but not which side of the screen he faces. That is the
exact brief an isolated generation is free to flip, and the technique names it
(state gaze direction in every brief). Nothing in the tree would have caught it.

## What was changed

A small stdlib-only checker runs four rules over the list: the first shot is a wide
establishing shot unless its function declares disorientation; every shot that
carries an identity reference states a screen direction; shots with a single
identity reference agree on screen-left or screen-right across the scene unless
declared as a crossing; consecutive shots of the same size class on the same
references are refused as a stutter cut. The scene builder runs it before it
touches the card and refuses a list that fails. The close-up now says which side
of the screen the man faces, and the gate's selftest pins the shipped list clean
and each rule firing on a mutated copy.

## Result

Shots breaking the grammar before the card is touched: 1 of 5 without the check
(the close-up), 0 of 5 with it; the four rules each fire on a mutated list. The
floor held: the project's python selftest passes (47 cases).

Not measured: whether the stated direction changes the rendered close-up. That is
a render effect read from images, and the card was not run. The lint proves the
brief is complete; it does not prove the picture obeys it. Return condition: render
the close-up with and without the direction clause at one seed and count how often
the man's facing matches the axis across several seeds.

## What a team should take from it

A grammar rule that lives only as advice is checked when someone remembers. The
rules that are lexical (a direction word present, a side consistent, a size changed)
can run as a list check that costs nothing and refuses before generation is spent,
leaving the pictorial rules to the eye.
