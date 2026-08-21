---
layer: technique
type: technique
subject: public-procurement-analysis
technique: contract-version-supersession
status: forged
laws: [provenance-or-nothing, deterministic-code-owns-numbers]
shared_with: []
use_when: [counting or summing over a registry corpus, re-ingesting a registry dump, analyzing contract amendments]
---

# Contract version supersession

The concern: a contract registry is append-only about *publications*, not about
*contracts*. Amendments, corrections and re-publications each add a record, and the
registry keeps them all — usually with a validity or supersession marker
distinguishing the current version from the superseded ones. Every count, sum and
join over the corpus must declare which versions it includes, because the two naive
policies both produce wrong analysis: all-versions over-counts, latest-only erases
the amendment story.

## The mechanics

- **Two id sequences.** The contract id is stable across the publication history;
  the version id names one publication and is typically what URLs and cross-links
  use. Model both (see contract-registry-record-model); supersession is a relation
  between version ids *within* one contract id.
- **A validity flag.** Registries mark superseded versions (valid = false or
  equivalent). In one measured national corpus, ignoring the flag inflated counts
  by roughly 8% — and not uniformly: amendments concentrate in large, long-running
  contracts, so the over-count biases exactly the top of any ranking.
- **Amendment linkage.** Records may reference the record they amend or relate to.
  This linkage is the raw material for amendment analysis and must be preserved at
  ingest even when the first consumer only needs latest values.

## Decision rules

1. **Default corpus = current versions only.** Counts, sums, per-firm totals and
   rankings run over the latest valid version of each contract, and the corpus
   states this policy alongside its coverage. When X (a query does not filter on
   validity), do Y (treat its output as unpublishable), because Z (it counts the
   same agreement once per publication event).
2. **Keep the full history; never harvest only the current view.** Superseded
   versions are the *only* evidence of what changed. Store them, marked, rather
   than discarding at ingest — an amendment analysis cannot be run retroactively
   over a latest-only corpus.
3. **Amendment deltas are first-class analysis.** Value grown from award to final,
   duration extended, parties swapped — computed as latest-minus-first per contract
   id, by deterministic code. The award-just-under-a-threshold-then-grown pattern
   (see threshold-proximity-signals) exists only in this delta.
4. **Cite the version, attribute to the contract.** A published claim's permanent
   address is a specific version — that is what a reader can retrieve and what the
   registry's URLs resolve. But the claim's subject is the contract; copy that
   quotes a superseded version's value as "the contract value" without saying so is
   citing accurately and asserting falsely at once. When a claim rests on a
   superseded version, the copy says which version and why.
5. **Supersession can also delete.** Corrections sometimes retract a disclosure
   (values redacted in later versions, records made inaccessible). Re-harvesting
   from current exports is how retractions propagate; a frozen snapshot slowly
   accumulates claims the registry no longer stands behind. Schedule re-harvest,
   and diff it — a value that *disappeared* between versions is itself a lead.

## When not to use

If the source publishes an explicit release-and-record model with amendments already
first-class, adopt its supersession semantics rather than inferring your own from
validity flags. And for corpora where the version dimension is verifiably degenerate
— one version per contract, asserted at ingest — the machinery reduces to that
assertion, which should stay as a loud check: the first amendment to arrive should
break a build, not a ranking.
