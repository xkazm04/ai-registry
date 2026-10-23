---
layer: application
type: application
subject: nonprofit-verification
technique: registry-adapter-contract
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The contract held to the verdict and broke at the badge

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-22 at `67b0062` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `7b4e4c5` and its ledger row is `48c030d`,
both on the project's `main`.

## What was already built

Almost all of the contract is in the tree. Every adapter builds its result through one
constructor that derives the convenience flag from the outcome. Declared-but-unbuilt sources get a
uniform not-implemented adapter with an implemented flag of false. One subject carries both the
identifier and the claimed name, so the id-based charity lookups and the name-based screens share
a single fan-out. The fan-out has no per-source branch and settles each source on its own, so one
throwing adapter degrades to an inconclusive result for that source only. There is also a
declarative adapter factory, where a new registry is configured by an endpoint, an extractor and a
status classifier.

Because of that, the seam was chosen to falsify the technique's own health test: adding the next
registry touches one adapter, one profile declaration, and *zero lines of display code*. If that
test held as well, the application would have been a bookmark. A caught outcome would show the
contract stops at the result and leaks back in at the presentation layer, and that is what it
showed.

## The leak

The verification summary already gave every source the human label its jurisdiction profile
declares. Two surfaces show which sources passed: the pre-commit badge on the results screen and
the "Verified ·" provenance chip on the identity fields. Both threw that label away, kept only
the source key, and named the key again from a hand-maintained table. The two tables were
identical copies, and both listed only the five adapters built so far. Every other source
declared on a profile (the two remaining Czech registries, the three British ones, and the
supranational participant register) would have shown its raw key the day its adapter was built,
which a configured adapter makes cheap. The built sources also showed a different name in the chip
than in the per-source rows on the same screen.

## What changed

The verdict carries the passing sources' profile labels beside their keys. The draft merge reads
the labels from the summary. Both tables are deleted. A registry added from now on gets its badge
text from the one declaration the technique already asks for.

## The paired proof

Arm A is the tree at `67b0062`. Arm B is the change. The population is every source that any of
the four jurisdiction profiles declares, 11 in total. Each one is passed alone, as the only
passing source, through the project's real draft merge, with the summary labelled the same way
the onboarding verification action labels it.

- **Target: chips that show a raw source key.** A 6 of 11, B 0 of 11.
- **Second target: the chip agrees with the profile label shown in the per-source rows.** A 1 of
  11, B 11 of 11.
- **Floor:** the type check and the linter are clean, and the suite passes 3,673 of 3,675. The two
  failing deadline-reminder tests already fail on `HEAD`. The new tests fail on A.

## What this realization cannot do

The change makes visible copy longer. Built sources now show their full profile labels ("IRS
Publication 78" rather than "IRS Pub 78"). Where a shorter chip is wanted, the fix is a short
label on the profile declaration, not a new table in the UI. Two lists are still kept in sync by
hand, and this change does not touch them. The identity form keeps a client-side list of which
sources get their own Verify control, and a comment explains why: the server registry pulls in
the network adapters and cannot go into the browser bundle. The match-certificate stub has its own
source vocabulary. The first list is the same leak in a different form, and its fix is a
client-safe list of built sources. The live verdict path was not exercised against a real
registry. The replay drives the merge and the verdict projection, not the network.
