---
layer: application
type: application
subject: grant-source-landscape
technique: dedup-records-who-carried-it
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A corroboration count that read adapters as witnesses

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `861f80c` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `dc69f17` and its ledger row is `8fb9bb8`,
both on the project's `main`.

## The tree had the rule half-honoured

The technique says the carrier set is publishers, not adapters. The ingest layer's reconcile
step counted corroboration as the number of distinct adapter keys in a cluster, so a nightly bulk
extract and a live search interface onto the same federal clearinghouse would have read as two
witnesses. The fix is a declared map from adapter key to publisher, a count over publishers, and
the carrier list exposed beside the source list.

The seam was chosen to falsify the claim that the republisher rule is already honoured upstream.
It partly was: the mirroring path keeps the original source key on mirrored rows. But the bulk
extract adapter writes the clearinghouse's own name into the row, while the reconcile step priced
a distinct extract key that no production row carries. The double count was therefore latent,
not live, and the declaration that finally fixed it would have been dead code if it had been
keyed on the adapter name alone. That produced the decision rule the technique gained: key the
declared upstream on what stored rows carry.

## The paired proof

Target, corroboration over a cluster holding the extract and the API: A 2, B 1. Over extract,
API and a curated entry: A 3, B 2. Floor, an unrelated cluster of the API and a curated entry:
2 in both arms, 202 ingest tests green, type check and lint clean. Verdict `better`.

## Not measured, and where it would show

The reconcile-over-corpus entry point has no production caller, so no surface displays
corroboration yet, carriers live in memory, and the upsert still overwrites. Nothing about real
overlap in the store was measured. Return when a read path calls the corpus reconcile: check that
no adapter pair onto one upstream is missing from the map, and persist the carrier set at upsert
only once overlap actually lands in the store.
