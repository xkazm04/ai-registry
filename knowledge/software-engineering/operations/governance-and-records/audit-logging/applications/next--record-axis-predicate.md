---
layer: application
type: application
subject: audit-logging
technique: record-axis-predicate
stack: next
verified_on: 2026-09-05
verified_against: next@16.3.1
applied: simulation
ab_verdict: better
proof: structural-only
---

# An as-of lens over provenance receipts, and the three absences it refuses to merge

A civic-intelligence site publishes a provenance receipt for every claim in
its graph and lets a reader ask for the receipt *as it stood on a day*
(`?k=YYYY-MM-DD`). The rule for what that means lives in one pure module,
`features/shared/provenance/asOfLens.ts`, read by both surfaces that render
receipts — the module comment says that is the point: two surfaces, one
rule, no drift about what a valid day is or which instant it names. The
store answers `asOfNode(ref, at)` / `asOfEdge(ref, at)` against its
history indexes; the loader (`getReceiptData.ts`) composes no clock clause
of its own. The witness is `package.json` (`next` 16.3.1); the tree was
read at its working copy on 2026-09-05.

This is the technique's shape arrived at independently of the technique's
source, in a different language over a different store, and it carried
three rules the source did not. They are now the technique's "three
absences" section, and this document is where they came from.

## The lens

`ReceiptAsOf` is a closed union of six states: `live` (nobody asked),
`refused` (the parameter was not an ISO day — today's receipt is shown and
*labelled* today's, with the rejected text echoed), `beforeEpoch` (the day
predates the oldest recorded time the store carries, because the bitemporal
migration stamped every pre-existing row with one instant), `absentThen`
(records were kept that day; this claim was not among them),
`notReplayable` (this family of derived figures is computed through
ownership loaders, not from the graph's history, so the question was legal
and cannot be answered), and `at` (the receipt shown *is* the version that
held that day). One predicate, `showsHistoricalVersion`, returns true for
`at` alone; every other state renders today's record with a banner keyed by
state, and the test named "each non-live state has its own key — three
different 'we don't have it' must not sound the same" pins that no two
states share a sentence.

`parseAsOfDay` refuses rather than corrects: it checks the day exists
(`2026-02-31` passes the pattern and is rejected by the round-trip), and the
comment names the thing it will not do — silently move to March 3rd, or
show today while implying then. `asOfInstant` resolves a day to its last
millisecond, with the test "a day is read to its END — the last version
valid that day".

## The simulation (three real cases, A against B)

A is the technique as first written from its source tree: a read takes a
moment and returns rows held at that moment — present or absent. B is the
technique with the three-absences section. The cases are the tree's own
states, each of which exists because a reader hit it.

1. **A day before the epoch.** The store's history begins at one migration
   instant. Under A the predicate returns no rows at any earlier T, and the
   surface reports the claim as absent that day — a confident statement about
   a period the store has no record of. Under B the state is `beforeEpoch`,
   the epoch is shown, and no historical version is claimed. B is right; A
   asserts a fact the store does not hold. Falsifier: a store whose history
   is complete from its first row would make the two agree.
2. **A derived figure asked as of a day.** Money and ranking pages are
   computed through loaders over ownership, not read from the graph's
   history. Under A there is no row to return, so the surface would say
   "nothing that day"; under B the state is `notReplayable` and the reader
   sees that the answer cannot be computed, which is a different sentence.
   Falsifier: replayable loaders for that family, after which the state
   disappears and A and B agree.
3. **A malformed day.** `k=2026-9-1` under A would be parsed by whatever the
   platform's date constructor does with it, and the surface would show a
   record under a date the reader did not ask for; under B it is refused and
   today's record is labelled as today's. Falsifier: none — this one is the
   law, not a boundary.

Verdict: **better** for B on all three, and each case is a state the tree
already renders, so the simulation is a reading of shipped behaviour, not a
prediction. Nothing in the tree changed; the technique did.

## The structural fact

The tree confirms the technique's central claim from the far side: the
rule is composed in one pure module *because* two surfaces read it, and the
module comment states that as the reason. The loader imports the lens and
calls the store's history index by ref, "never through the second neighbour
query and never through the whole-relation listing" — the read path is
named so a future read cannot compose its own clock by accident.

What it does not have is the technique's write-side boundary, because it
has no interactive writes against history: receipts are derived from a
graph whose corrections arrive by pipeline, and there is no "confirm as of
March" to guard against.

## What this realization cannot do

- The lens covers **receipts**, one address at a time. The graph's own
  browse surfaces are not rewound; the family that is not replayable is
  named rather than hidden, which is the honest state and still a gap.
- The **epoch** is the store's, not the claim's: a claim first recorded
  after the epoch but before the asked day correctly returns `absentThen`,
  but a claim whose pre-epoch history was collapsed into one stamp cannot
  say when it first appeared. The tree's `beforeEpoch` state names the
  limit; it does not narrow it.
- There is no **both-directions test** against the store's history index
  in this module; the lens tests cover parsing, the instant, and the state
  vocabulary. The predicate itself lives in the store's `asOfNode` /
  `asOfEdge`, which this run did not open.
