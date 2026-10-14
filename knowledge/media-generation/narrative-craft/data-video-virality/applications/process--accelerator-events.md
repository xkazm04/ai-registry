---
layer: application
type: application
subject: data-video-virality
technique: accelerator-events
stack: process
status: draft
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Accelerator events as a beats gate on the case-idea validator

The same data-video studio (`StatReel`) already asked every proposed case
for dated "beats", the turns of the story that become on-screen callouts.
Two validators carry the rule, one in the server and a mirror in the board
seat's self-check, and both counted only entries: at least four beats with
an `at` and a `what`. The brief said "spread over the span", and the code
did not check it.

## What A and B were

- **A, as found:** four named beats pass whatever their dates. Constructed
  cases through the real validator, timeline 1990-2020:

| Case | A | B |
|---|---|---|
| four beats dated before the start, one inside | accepted | rejected: only 1 falls inside the span |
| six beats all within three years of the start | accepted | rejected: cover under half the span |
| twenty beats | accepted | rejected: keep the 15 that explain the largest moves |
| five or four beats spread over the span | accepted | accepted |
| beats labelled by round, no year | accepted | accepted (cannot be judged) |

- **B:** beats before the timeline's start are intro material and do not
  count toward the minimum; dated beats must cover at least half the
  timeline; at most fifteen. Both validators changed identically, two
  tests added to each, the brief's sentence updated.

## Reading

The seam was chosen to falsify the claim that the tree already enforces
the technique. It partly did (minimum count, dated, tied to a span in
prose) and the three structural halves of the procedure (inside the
animated span, spread, capped) were prose only.

Floor held: every existing fixture and the full suite stayed green, and
both well-formed shapes in the table above still pass. Not enforced:
steps 4 and 6 (a visible effect per event, dates checked against a source)
need a field the case schema does not carry.

## Deviations kept deliberately

- The studio's minimum is four, the technique's decision rule says five.
  Raising it would reject every previously accepted four-beat case, which
  is the owner's call; recorded here, not changed.
- The 50% coverage threshold and the unparsed-label leniency are this
  project's choices, not measured against its approved cases (the live
  idea table was not reachable from the clone).
