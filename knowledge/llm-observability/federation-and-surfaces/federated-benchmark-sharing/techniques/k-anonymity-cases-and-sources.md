---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: k-anonymity-cases-and-sources
status: forged
laws: [aggregates-leave-identity-behind, never-present-absence-as-an-answer]
shared_with: []
use_when: [choosing anonymity floors for a shared statistic, ordering filters against an anonymity floor, deciding whether a thin bucket is dropped or flagged]
---

# k-anonymity over cases and over sources

One name, two different floors, enforced by two different parties — and a
design that implements only one of them while citing "k-anonymity" in its
privacy story has a hole exactly where auditors will look.

## The case floor (contributor-side)

A bucket is published only when it aggregates at least `k_cases` scored
cases. The threat it addresses is the rare task: an evaluation category only
one organization runs, with a handful of cases, is a fingerprint of that
organization no matter how aggregate its numbers are. Statistical disclosure
practice in regulated domains puts minimum cell sizes between 3 and 30;
pick a default in that range, let the contributor raise it, and clamp it to
at least 1 so a misconfiguration cannot mean "no floor".

Below the floor, the bucket is **dropped**, not flagged — this is the one
place where suppression beats disclosure, because the whole point is that
the thin bucket must not exist on the wire. Contrast the *display* floor
below.

## The source floor (hub-side)

A merged row is published only when at least `k_sources` **distinct
contributors** back it. The threat it addresses is the confident loner: a
single organization's 5,000-case bucket sails through any case floor, but a
row backed by one source is not a collective statistic — it is that
organization's private evaluation results on a public billboard, and every
number on it (its cost band, its task mix, its rigor profile) describes one
identifiable party. The case floor cannot see this; it counts cases, not
sources.

Withheld rows are disclosed **as a count** ("N rows held back below the
contributor floor"), never silently absent. A reader facing a short board
must be able to distinguish "nobody measured this" from "measured, but not
yet by enough parties" — absence is a state to disclose, not a blank to
misread.

## Order against filters: the isolation attack

Every user-facing filter — by task, provider, judge, rigor level — is a
potential deanonymization query: apply filters until only one contributor's
rows survive, and read off their private results. The defense is pure
ordering: **merge first, apply the source floor second, apply every filter
third, compute summary counts last, over what survived.** A filter that runs
before the floor can strip a row down to a lone source and then the floor,
seeing a "row" that still exists, waves it through. This holds for every
filter added later, forever — the review question for any new query
parameter is "does it run after the floor?", and the code should make the
wrong order structurally awkward.

Low-cardinality metadata filters deserve special suspicion. A rigor or
judge-family filter looks harmless (three or four values), but a rare
*combination* of values can isolate a source as effectively as a name. The
mitigations compound: tiny closed vocabularies keep combination cardinality
low, and running after the floor caps the damage of what remains.

## Decision rules

- **Both floors, both parties, re-enforced.** The contributor applies the
  case floor before sending; the hub applies the source floor before
  publishing — and the hub also re-applies contributor-side treatments,
  because what a contributor did to its own numbers is its business and what
  gets published is the hub's.
- **Suppression floors drop; display floors flag.** Distinguish the
  anonymity floors (below them, data must not appear) from the *confidence*
  floor (a row with few total cases is shown with a low-confidence flag).
  Conflating them either hides honest thin data or publishes identifying
  thin data.
- **The floor is not a knob per request.** A reader who can set
  `k_sources=1` on a query has been handed the isolation attack as an API
  parameter. Floors are hub policy, fixed per deployment.
- **Prefer suppression over noise only below the floor.** Noise infusion
  (calibrated perturbation of each statistic) is the field's alternative
  with better bias properties for large tables; for a leaderboard with few,
  high-stakes rows, suppression is legible and defensible. If you add noise,
  disclose it — an unannounced perturbed number is a lie in both directions.

## When not to use it

Within a single organization's internal dashboards, floors are pure
information loss. And for genuinely public data — models evaluated on
published public benchmarks by a party that signs its results — anonymity
floors are the wrong tool; attribution is the feature there, and this
technique exists for the opposite regime.
