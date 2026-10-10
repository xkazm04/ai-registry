---
layer: application
type: application
subject: beneficial-ownership-resolution
technique: name-to-identifier-discipline
stack: node
status: forged
verified_on: 2026-10-10
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: catching the next junk-name attractor before the write

The politicas money ingest links sitting MPs to companies. Its source,
Hlídač státu, attributes an MP to a company by free-text name only, in the
private-role events of a person record. The ingest resolves each name to an
IČO through ARES. The stack is Node 24, witnessed by the CI pin in
`.github/workflows/ci.yml` (`node-version: 24`).

## What the tree already did

Most of the technique was already in place, because the tree is where it was
first observed. `lib/analysis/money-feed.ts` builds every link through an
injected `IcoResolver`, so names become identifiers in exactly one place.
`pickExactIco` accepts an IČO only when exactly one ARES candidate's
normalized name equals the query's. A recall-stripped query widens the
search, and the exact pick keeps precision. Every emitted link is
`pending_review`, and officer corroboration only annotates provenance. The
OSVČ incident (an occupation label exact-matched a micro-party registered
under that literal name, 49 of 245 ties) left two fixes behind. One is a
one-entry `GENERIC_NAME_BLACKLIST` at the resolver. The other is a purge
script gated on the `false_edge_suspected` annotation rather than on the
destination.

Two parts of the technique had no code:

- **The attractor rule.** Nothing counted how many distinct people resolved
  to one entity. The blacklist names only the token already seen, so the next
  occupation label or placeholder would be welded the same way. Nothing could
  see it, because `scripts/data-analysis/kg-money-ingest.ts` resolved and
  wrote one target at a time.
- **Counting the drop.** An unresolved name was dropped, but only an
  exception was printed. A plain no-match left no trace, so a run's coverage
  could be read only against what it linked.

## A and B, on the recorded population

The seam was chosen to falsify the technique. The attractor rule can go wrong
by quarantining legitimate shared boards, because MPs do sit on the same
company boards. The payload written before the purge,
`docs/data-analysis/case-money/payloads/batch-002-ares-vr-reconciliation.json`,
holds 245 `linked_to` ties across 73 MPs and 181 IČOs. Both arms ran over it
with the OSVČ token treated as unseen, as it was when the incident happened.

- **Target**: false edges flagged before the write. Arm A, the blacklist
  alone, flags 0 of 49. Arm B, a fan-in over distinct persons per IČO, flags
  49 of 49.
- **Floor**: legitimate ties held back. B holds back 0 of 196 at the default
  threshold of 5. The fan-in histogram is 166 entities at 1, 12 at 2, 2 at 3,
  and one at 49. Any threshold from 4 to 49 gives the same answer. At 3, B
  would also hold two regional bodies whose ties the officer register
  confirms. Those MPs come from one region and share its boards.

Proof status: `ab-paired`, n=1 population. The arms are pinned as a unit test
that replays the payload.

## What shipped

Commit `dd4183b` is on politicas local `master` and is not pushed, because
master is diverged from origin. The ingest now resolves every target before
writing any. `junkNameAttractors` counts distinct persons per IČO over this
run's links plus the `linked_to` ties already stored, so a `--persons` run
also sees an attractor the graph already holds. Links to any IČO at
`--attractor-min` are held back and printed. The run ends with the number of
dropped private-role events and the names they were filed under. Unit tests
and `tsc --noEmit` are green.

## What the tree's shape says

The tree's own corroboration data refutes the obvious companion signal.
"Officer register could not confirm" looks like a second discriminator, since
all 49 junk ties carry it. But so do two legitimate fan-in-2 entities: the
public health insurer and the public broadcaster. Both are public-law bodies
outside the commercial register. An unconfirmed identity is a property of the
register's coverage, not of the tie.

The fan-in rule also covers one class only. The tree's other wrong-entity
case, a live company resolved in place of a dissolved namesake, reached
fan-in 2. No threshold that spares legitimate boards can see it. That class
belongs to the namesake and archive techniques, not to the attractor rule.

## What this realization cannot do

The detector needs a population. On a first single-person run with an empty
graph it sees nothing. It was not run live against Hlídač or ARES. The
measurement is a replay of a stored payload, and the next full-chamber sweep
is the first live reading.

## Return condition

Re-read when a full-chamber ingest runs with the detector. Its held-back list
and drop count are the live arm this replay stands in for.
