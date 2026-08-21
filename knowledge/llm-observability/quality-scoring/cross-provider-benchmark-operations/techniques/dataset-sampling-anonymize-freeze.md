---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: dataset-sampling-anonymize-freeze
status: forged
laws: [no-retroactive-restatement, estimation-announces-itself]
shared_with: []
use_when: [building an eval dataset from production traffic, deciding whether two runs are comparable, PII must not leak into stored benchmark cases]
---

# Dataset sampling → anonymize → freeze

Benchmark cases sampled from real traffic measure the product; hand-written
cases measure the author. But raw production traffic cannot be stored in a
dataset as-is — it carries identifying content, it skews toward whatever the
last deploy did, and it keeps changing. The pipeline is a fixed order:
**sample, anonymize, review, freeze** — and each stage exists because skipping
it produces a specific, known corruption.

## Sampling

Sample from the stored event stream with declared filters — project, time
window, model, outcome, tag — and a declared strategy:

- **recent** for "what the product does now";
- **random** over a window for an unbiased slice;
- **stratified** to balance across models and outcomes, so the dataset is
  not 90% the happy path of the dominant model;
- **errors-only** when the benchmark's purpose is probing a failure class.

Deduplicate near-identical inputs before storing — production traffic
repeats itself, and twenty copies of one question is one case wearing twenty
weights. Record the source event identifier on each item so a surprising
case can be traced back to the traffic that produced it.

## Anonymization

Scrub input, output, and context *before* the item is stored — the original
text never enters the dataset, so there is nothing to leak later. Two layers:

1. **A deterministic pass, always**: pattern-matched detection of emails,
   phone numbers, payment card numbers (with checksum validation), account
   identifiers, network addresses, secrets and keys — each replaced with a
   *typed* placeholder rather than deleted, so the case still reads as a
   coherent task ("contact <EMAIL> about the refund" still tests the model).
2. **A model-assisted pass, optionally**: an LLM scrub for what patterns
   cannot see — names, organizations, locations, free-text identifiers —
   instructed to preserve meaning. It costs per item; that cost belongs to
   the quality apparatus, not to product spend.

Each item records *how* it was anonymized — method and placeholder count —
so an auditor can distinguish "clean by inspection" from "clean by scrub",
and the disclosure travels with the data rather than living in a runbook.

## Freeze

A dataset under construction is mutable; a dataset under measurement is not.
Freezing makes the case set immutable and stamps a version, and from that
moment two runs citing the same frozen version are a comparison. Field
practice across evaluation programs converges on the same rule: golden sets
are frozen per evaluation cycle, updated only through a governed versioning
step with a change log — because an unfrozen set silently converts every
model-regression signal into "someone edited the cases".

Two subtleties that separate a working freeze from a decorative one:

- **Pin content, not just identity.** A run that records only a dataset
  *reference* can still be scored on different cases than the last run if
  the set mutated between them. Record the frozen flag and the version *as
  of run time* on every run, and print a warning when the referenced set is
  not frozen. The run still executes — the policy is disclosure, not
  refusal — but it no longer reads as pinned.
- **A new version is a new baseline.** Comparing a run on v3 to a run on v2
  is comparing two case sets. Version drift downgrades any cross-run claim;
  re-baseline after every version bump, deliberately.

## Decision rules

- **When traffic has shifted enough that the frozen set no longer represents
  it, cut a new version — never edit in place.** The old version stays
  interpretable against every score it ever produced.
- **When a case must be removed** (a scrub failure discovered late, a case
  that became nonsensical), that is also a new version; the removal is a
  change log entry, and prior runs are not restated.
- **When sampling for a regression suite, prefer stratified; for a
  leaderboard, prefer random.** Stratification buys sensitivity on the
  slices you named at the price of no longer estimating the traffic mix.
- **When the model-assisted scrub is unaffordable at dataset size**, run the
  deterministic pass on everything and the model pass on a reviewed sample —
  and record which items got which treatment.

## When not to use it

- Pre-ship evaluation of a system with no production traffic yet has nothing
  to sample; that is the builder-side offline harness's territory, with
  curated cases.
- Do not freeze during active dataset curation — premature freezing produces
  a graveyard of near-identical versions and trains operators to ignore
  version numbers. Freeze when review is done, once.
