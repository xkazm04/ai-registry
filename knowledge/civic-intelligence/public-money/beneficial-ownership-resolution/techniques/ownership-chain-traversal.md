---
layer: technique
type: technique
subject: beneficial-ownership-resolution
technique: ownership-chain-traversal
status: forged
laws: [every-cap-ships-its-population, lead-not-finding]
shared_with: []
use_when:
  - a person's exposure may run through holding companies
  - deciding whether an entity is publicly or privately owned
---

# Ownership-chain traversal

A graph that relates only people to companies misses the structures that
matter most. Concentrated economic power is organized vertically: a person
owns a holding entity, the holding entity owns the operating firms, and the
operating firms sign the contracts. The register itself carries the missing
layer — entity-to-entity shareholder records, identifier-keyed and dated,
sitting in the same officer-and-members structures as the natural-person
entries. Traversal is the technique of walking those records into an
explicit company-to-company graph without overclaiming what the walk proves.

## The edge, defined strictly

An ownership edge is admitted only when it can carry, in full:

- **both endpoints as validated registry identifiers** — an edge to a
  name-only parent is a lead, not an edge;
- **a validity interval** from the record's own dates, because stakes end,
  and an undated ownership graph collapses decades of history into a false
  present;
- **a source citation** to the specific register record or archive file the
  stake was read from.

Distinguish the legal-entity member records from the natural-person member
records at the read layer — they answer different questions (chain hops
versus direct human ownership) and conflating them corrupts both. And read
*all* the member collections the payload offers; the multi-array lesson
from officer-record reading applies identically here, since a stake listed
in the second array is invisible to a one-array read.

## Direction, purpose, and the two walks

The same records support two different walks with different verdicts:

- **Downward from a person's known entities** (what does the holding own?)
  builds *exposure breadth* — the set of operating firms reachable from the
  person. Its output is a candidate set for money analysis, never a money
  number by itself.
- **Upward from an operating entity** (who owns this supplier?) answers
  *classification* — in particular, whether an entity is publicly owned.
  Public ownership cannot be read off a name or legal form: publicly owned
  holdings wear ordinary private legal forms, and the walk to a state or
  municipal owner is the only reliable test. The upward walk resolves
  against a verified allowlist of public owners, sends every unresolved
  case to "unknown" rather than "private", and treats current stakes
  (no end date, or end after the as-of date) differently from lapsed ones.

## Scope honesty: the cap ships with the chain

Registry chains are expensive to walk — each hop can require resolving and
fetching another entity's record, sometimes from bulk archives measured in
hundreds of megabytes. Real traversals are therefore bounded: a depth
limit, a fetch budget, a priority subset (chains from ownership-class ties
first, since a stewardship seat on a public body structurally has no
private chain worth walking). Bounding is fine; hiding the bound is not.
Every traversal result declares what was walked and what was *not
attempted* — "outside this run's fetch budget, scope-bounded" is a recorded
outcome per skipped entity, never a silent drop — because a chain search
that says "no parent found" when it means "did not look" manufactures a
clean bill of health.

## The machine surfaces chains; humans assert exposure

The traversal's output is structure: dated, sourced edges. What the
structure *means* — "this official's exposure to public money runs through
this holding" — is an inference about a person, and the machine never draws
it. The chain is attached as evidence, ranked for review, and narrated by a
human who can weigh stake sizes, control versus ownership, and timing.
This division is not modesty; percent-of-shares arithmetic across hops is
genuinely treacherous (control can exist without majority, and joint
arrangements break multiplication), and the published ownership-data
standards keep "ownership" and "control" as separate interest types for
exactly this reason.

## When not to use it

Do not walk chains for entities whose class makes the walk meaningless —
public bodies' governance layers are mandate, not enrichment, and walking
them wastes the fetch budget the private chains need. Do not extend the
walk across registers with incompatible identifier namespaces by name
matching — a cross-border hop without a shared identifier scheme is a lead
for manual work. And do not let a traversal create person-to-company edges
as a side effect: new natural persons discovered mid-chain are candidates
for the name-to-identifier and officer-record disciplines, not free edges.
