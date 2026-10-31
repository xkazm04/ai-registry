---
layer: application
type: application
subject: beneficial-ownership-resolution
technique: struck-off-entity-archives
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: simulation
ab_verdict: unmeasurable
---

# Node: a live miss routes to the archive, and every archive state keeps its own name

The politicas money loop corroborates MP-to-company ties against the live
Czech register, and keeps a targeted adapter for the ministry's bulk
export (one file per court, legal form and year). Reading the tree against
the technique found it conformant on the outcome-state, provenance and
personal-data rules; routing an absent identifier on to its dissolution-year
partition is still manual (see the gap below). This row records a conformance
read, not a change.

## What A and B were

A is a pipeline whose only source is the live register: a 404 for a struck-off
company reads as "no such tie". B is the shipped pipeline, which treats the
miss as a routing decision. Three real cases, walked under both.

1. **A company dissolved in 2012.** The live lookup 404s on both endpoints; the
   first two batches recorded a dead end. Under A the tie stays unchecked
   forever. Under B the dissolution-year full export was fetched by the re-point script and the tie is
   re-pointed to the right entity with its role history. Falsified if the
   export had held no record: it did hold one, and the batch note cites the file.
2. **Six ties whose identifier was absent from the resolved export.** Under A
   they would be filed absent. Under B they carry a flag whose copy says the
   entity may have dissolved earlier or the court and form guess is wrong, and
   that the check is not complete. Most were a wrong legal-form guess, which is
   the technique's "scope guess wrong, check incomplete, not negative" state.
3. **Five ties whose partition exceeded the network budget.** Under A a
   timeout is a silent miss. Under B it is a distinct unfinished-check state
   with a retry command.

The licence and personal-data rule also held: birth dates are matching keys
only, compared with the roster and never surfaced, and the licence is logged
before any bulk fetch.

## What it cannot do, and the gap left

The sweep fetches only the current-year full export. An identifier absent from
it is flagged incomplete, but nothing routes it on to the dissolution-year
partition automatically; that step is a manual follow-up (the re-point script
does it for one entity). Where the live basic record is also gone, the scope
key cannot be resolved at all, and the recorded state says the check did not
run. Unmeasured here: how many of the incomplete ties would close if the year
were retried; that needs a network batch over a slow connection.
