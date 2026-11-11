---
layer: application
type: application
subject: codebase-scanning
technique: sensor-pipeline
stack: node
verified_against: node@24
verified_on: 2026-11-10
applied: code
ab_verdict: better
---

# Isolation sits on the task: two fan-outs in a civic data service

The service's CI workflow pins `node-version: 24`, which is the witness for the
stack line. Its server loaders already gather the way the technique asks: each
layer catches at its own edge, returns a degraded value with an `ok` flag, and
reports through one shared recorder, and a composition that finds every layer
down returns null and says so instead of rendering an empty page. Fifteen
fan-outs compose such loaders with an all-or-nothing combinator, and that is
correct, because none of their branches can reject. Of 59 fan-outs, 57 were
correctly all-or-nothing: required render inputs, same-store reads that compose
one derived view, or branches already isolated inside. Two were not.

## The two seams

- **A bounded harvest pool** fans one HTTP read per town-year over a few
  workers that drain a shared queue. A terminal refusal (a 404 for one town's
  year) throws out of one worker, and the combinator rejects the whole batch,
  losing every year already read. The module's own header promises that a
  partial batch is disclosed and never passed off as complete; in fact the
  module could not produce a partial batch at all.
- **A catalog context read** fans four reads: the slice (required), and the
  corpus, the rubric and the sibling scroll (optional, and already read
  through optional chaining). The read helper turns non-2xx, empty and
  non-JSON responses into null - the project had fixed that class twice, one
  response shape at a time - but a transport rejection still escaped and cost
  the slice and the corpus along with the siblings.

## Three arms, one probe

The probe pins both directions: one failed branch keeps its siblings and is
named, and a run where nothing could be read still fails.

| | as-is | settle-all at the combinator | boundary on the task |
|---|---|---|---|
| one of six town-years fails: five kept, failure named | batch lost | kept, not named | yes |
| first job fails at width 1: queue behind it fetched | batch lost | 3 of 4 never attempted | yes |
| every job fails: still an error | yes | empty towns, success | yes |
| optional catalog read rejects: slice + corpus kept, read named | context lost | yes | yes |
| required read rejects: still an error, not "unknown" | yes | null | yes |

The settle-all form, applied where the combinator sits, is the wrong repair
for a pool. The branches it settles are workers, not tasks. A worker that
throws simply ends, so the jobs queued behind it are never fetched and the
batch reads as complete; when every worker dies on its first job, the batch is
empty and reports success. The repair that held puts the catch on each job,
records `failed: year -> reason` beside the years that were read, and throws
only when none was read. At the catalog read the settle-all form is right,
provided the required branch rethrows: null there means "the catalog does not
know this slice", and an unreachable catalog is not that.

## Floor and controls

The existing suites for both modules (26 tests) held on every arm: as-is 28 of
31 with the probe, settle-all 27 of 31, boundary on the task 31 of 31. A
deliberate break of the success path in the repaired arm turned one test in
each suite red, so the floor can see a regression. The project's lint and full
typecheck were not run against this branch, and the change is not yet on the
project's active branch.
