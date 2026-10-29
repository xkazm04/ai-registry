---
layer: application
type: application
subject: sprite-and-atlas-production
technique: state-roster-costing-for-generated-characters
stack: process
status: forged
verified_on: 2026-10-29
applied: experiment
ab_verdict: better
---

# One painted opponent costed against the duel's states and the day's cast

mage-arena (public, github.com/xkazm04/mage-arena) built its opponent as a generated painted card: rig poses,
painted keys, video-generated in-betweens, mattes and a chalk pass, packed into atlas pages. Its four clips
judged well. A builder then audited every state the rules ask of the opponent, and every other character in
the session, and costed the route against them. Read at `0dc4a18` on 2026-10-29.

## What the tree records

docs/archive/graphics-push-2026-10/notes/SPRITE-COVERAGE.md:11 "The route covers Brennic's look well, but **today it covers four of the roughly eighteen states the duel asks of him, and"
docs/archive/graphics-push-2026-10/notes/SPRITE-COVERAGE.md:84 "**~1-1.5 h per clip**. The ~14 missing Brennic clips are 2-3 days of generation alone, before Lio or anyone else."
docs/archive/graphics-push-2026-10/notes/SPRITE-COVERAGE.md:86 "**Page budget for Brennic's full set** (the table's Brennic rows at 24 fps, right-side moves as mirrored cards): ~550 cells."

## What the costing found

- 4 of about 18 states were covered.
- Each clip cost about 1 to 1.5 hours including retries.
- About 550 cells for one character: 3 pages at 256 px, or 6 to 9 at the cell size its real distance needed.
- Every other character in the session was still to do, and orbiting creatures need facings.

The verdict was "feasible for one showcase opponent, not for the cast". Wiring the states into the rules
took half a day and left the simulation untouched.

## Verdict: better

The costing turned "the clips look good" into a schedule and memory figure for the whole cast, and that
figure fed the decision to stop.

## Deviation

The audit came after the route was chosen and polished for several rounds. The return condition: cost the
roster before choosing a character route.
