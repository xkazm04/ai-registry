---
layer: application
type: application
subject: data-video-virality
technique: recognizable-cast
stack: process
status: draft
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Peak cast as a universality gate on the case-idea validator

The data-video studio (`StatReel`) asks every proposed case to be "universal:
a viewer outside the domain gets it in five seconds". That was one prose line
in the case brief. The case schema carried no cast, so nothing could score
universality from the cast, which is what the technique says to do.

## What A and B were

- **A, as found:** universality is a sentence the proposing loop asserts. A
  case whose peak cast is two obscure names out of three passes the real
  validator, as does any cast value (the field did not exist).
- **B:** an optional `cast` of `{name, known}` entries (the entities on screen
  at the peak; `known` = a general viewer in the target market names it
  without a caption). When supplied: 2 to 10 entities (the studio's entity
  range) and at least half known, else the case fails with a reframe hint.
  Absent cast passes, so size and record ladders, where the object is the
  draw, are untouched. Mirrored in the server validator and the board seat
  check; persisted in a nullable `cast_json` column; the brief asks for it.

| Case | A | B |
|---|---|---|
| cast of 3, two known | accepted | accepted |
| cast of 3, one known | accepted | rejected: only 1 of 3 recognised |
| cast of one entity, or eleven | accepted | rejected: 2-10 entities |
| no cast | accepted | accepted (scale is the draw) |

## Reading

The seam was chosen to falsify "universality is already checked". It was not:
the only trace was a prose criterion. The `known` flag is the proposer's own
claim, so B makes the claim explicit and auditable by the owner at the gate
(a case rejected for a thin cast is visible), it does not measure recognition.

Floor held: 1634 server and studio tests, the board harness (41) and tsc
stayed green; existing cases without a cast are unaffected.

## Deviations kept deliberately

- The technique's "niche cast is acceptable for an owned audience" has no
  field: the case schema carries no target-audience, so a niche case either
  reframes or omits the cast. Owner's call whether an audience field is worth it.
- The 0.5 known-share threshold is this project's choice, not measured against
  its accepted F1 cases (the live idea table was not reachable from the clone).
