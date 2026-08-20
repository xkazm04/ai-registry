---
layer: technique
type: technique
subject: peer-benchmarking
technique: corpus-tenancy-boundary
status: forged
laws: [one-validation-door, count-carries-predicate]
shared_with: []
use_when: [a query reads rows belonging to other tenants, building a public-facing comparison surface, adding an operator view spanning many tenants]
---

# Corpus tenancy boundary

A peer benchmark is the one feature whose whole purpose is to read across the
isolation boundary the rest of the system exists to hold. That makes it a
**structurally privileged path**, and privileged paths do not get to inherit
their safety from surrounding habit. This technique is the set of invariants
that path carries.

## Membership is a policy, enforced per row

Who is in the corpus is a decision with a stated basis — an opt-in setting, a
publication flag, a contractual peer group, a shared parent organization —
and that decision is **enforced in the query that builds the corpus**, on
every row, every time. The failure shape is inheritance by location: rows
were loaded from a source that "is public", so the code treats the whole set
as public and filters nothing. Sources acquire exceptions. A register built
from a source of mostly-publishable records will, on the day one record is
marked private, publish it — because the guard was placed at the loader and
the loader's assumption expired.

Two rules follow:

- **Filter per row at the point of corpus assembly**, using the row's own
  membership field. Never from a set-level assumption about provenance.
- **Route every corpus-building read through one door**
  ([one-validation-door](../../_laws.md#one-validation-door)). A single
  function that takes the membership policy and returns the comparable
  population is auditable; six queries each remembering to add the same
  predicate is a leak with a date on it. When a new surface needs the corpus,
  it should be structurally unable to assemble one without passing the door.

Two refinements that only appear once a leak has happened:

- **Re-assert the predicate on every hop.** A two-step read — find the
  eligible identifiers, then fetch those records by key — must repeat the
  membership check on the second query and again at the mapping step. "It
  came back from the eligible query" is not proof of eligibility; the row's
  own flag is the proof, and the flag can have changed, or the row can have
  been written under an assumption that expired. The strongest form is a
  single mapping function that every row passes through and that returns
  nothing for an ineligible row, so no future caller can route around it.
- **The tenancy filter is deliberately asymmetric, and that is not a
  contradiction.** [Comparability filters](comparability-filters.md) apply to
  both sides; the membership filter applies only to the corpus. A tenant is
  always entitled to its own data regardless of whether it publishes it. The
  two filters live in the same query and obey opposite symmetry rules, so
  each should say in one line which it is — otherwise the next maintainer
  "fixes" the asymmetry and either leaks the corpus or blinds the subject to
  its own private records.

Membership also has a **withdrawal** path. Opt-in that cannot be revoked is
not consent, and revocation must take effect on the next computation, not on
the next full rebuild — which means positions that quote a cached corpus
carry the same expiry obligation as any other stored derivation.

## Distribution crosses; rows do not

What the subject receives from the corpus is a **shape**: a position, a
median, a band, a count above the floor. What it must never receive is
anything that identifies a contributor — names, identifiers, timestamps
precise enough to correlate, free text, a sorted list of peer values (an
ordered list of n values with a known n is a table of other customers'
scores), or a "nearest peer" affordance.

Practical consequences:

- Return the computed statistic from the boundary, not the array it was
  computed from. If the peer values reach the presentation layer at all, they
  will eventually be logged, exported, or inspected in a payload.
- Derived fields can re-identify. "Your closest peer scores 4 points above
  you" plus a public participant list is a lookup. Ask of every peer-derived
  field whether it narrows the set, not merely whether it contains a name.
- The corpus size is itself sensitive at the low end — see the disclosure
  rule in [cohort-minimum-size](cohort-minimum-size.md).

## The cross-tenant read is bounded

A comparison query issued by one tenant reads a set whose size is governed by
*everyone else*. Left unbounded, its cost and memory grow with the whole
estate: the smallest tenant's dashboard becomes the most expensive query in
the system, and one benchmark request can pull the entire corpus into a
single process. Bound it — a cap on how many peer records are materialized,
applied in the same query as the membership and comparability predicates so
the budget is spent on rows that will actually be used.

The bound is also a sampling decision (see the selection-bias discussion in
the golden path): whatever ordering fills the cap becomes the corpus. Choose
that ordering deliberately, and let the cap reach the reader through the
basis. A capped corpus is a defensible corpus; a capped corpus presented as
the full field is not.

## Operator rollups are a different capability

An operator viewing many tenants at once — a portfolio, a fleet-of-fleets,
an aggregate across an entire estate — is a legitimate and useful surface.
It is also a *different authorization question* from peer benchmarking, and
conflating the two is how a benchmarking query becomes an unlogged
cross-tenant data export.

Keep them separate by construction:

- **Different entry points, different authorization.** A peer comparison
  authorizes the subject to learn its position. A portfolio view authorizes a
  named principal to see enumerated tenants. Neither should be reachable by
  passing a different argument to the other.
- **The rollup enumerates its scope.** Which tenants it spans is an explicit,
  audited input — never "all rows the connection can see". A cross-tenant
  aggregate whose scope is implicit will silently widen the day a join
  changes.
- **The rollup states the unit it aggregated** — tenants, projects, items —
  because a fleet-of-fleets total is exactly the place where units get mixed
  ([count-carries-predicate](../../_laws.md#count-carries-predicate)), and
  because a rollup's own numbers are usually the ones quoted upward.

## Decision rules

- **When a query reads rows outside the caller's tenancy, it names its
  membership predicate in the same expression.** No exceptions for "internal
  only" surfaces; internal surfaces get screenshotted.
- **When a surface is public, its corpus is assembled from a publication flag
  checked per row,** and the check lives at assembly, not at load.
- **When a peer statistic is computed, discard the inputs at the boundary.**
- **When an operator rollup is added, give it its own door, its own explicit
  tenant scope, and its own audit record.**

## When not to use this

- **Single-tenant comparison** — teams inside one organization, or an
  organization against its own past. There is no tenancy boundary; the
  governing constraints are the ethics of measuring identifiable groups and
  people, not isolation.
- **Fully public corpora** where every contributing record is already
  published under its own name. The isolation invariants relax, but
  membership-per-row does not: "public" is still a per-record property, and
  it is the property most likely to change after the fact.

## Smells

- A corpus query with no membership predicate, justified by where the data
  came from.
- The same cross-tenant predicate written out in several places.
- Peer values present in a response payload that renders only one number.
- A benchmark endpoint that returns more the higher your role is — a sign the
  peer path and the operator path are the same path.
- An opt-out setting with no code path that removes existing contributions.
