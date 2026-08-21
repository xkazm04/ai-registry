---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: aggregate-only-digests
status: forged
laws: [aggregates-leave-identity-behind, never-present-absence-as-an-answer]
shared_with: []
use_when: [defining the wire format for cross-organization result sharing, deciding which internal tables a contribution pipeline may read, versioning a shared digest schema]
---

# Aggregate-only digests

The strongest privacy property is the one that cannot be violated by a bug.
An aggregate-only digest achieves that by construction: the contribution
pipeline is *fed* from pre-aggregated run scorecards — per-run means, counts,
percentiles — and is structurally unable to read the event store that holds
prompts, responses and per-call metadata. There is no redaction step, because
redaction is a filter that can be skipped, misconfigured, or bypassed by a
new field someone adds next quarter. The privacy review of a redacting
pipeline is "check every field, every release"; the privacy review of an
aggregate-only pipeline is "confirm it still doesn't import the raw store".

## What a digest row contains

One row per `(provider, model, task category)` bucket, carrying only:

- **Public model identity** — provider and model name, the things the
  leaderboard exists to compare. These are the only names on the wire.
- **Aggregate measures** — mean quality and pass rate on bounded scales,
  bucketed mean cost, latency percentiles pooled across runs.
- **Evidence shape** — case count, run count, and the between-run variance of
  quality, so the merge can weight and interval the row honestly.
- **Trust metadata from closed vocabularies** — judge family, rigor facets,
  coverage tags. Never free text.

Plus one envelope: a contributor id (for deduplication and source counting),
a schema version, a generation timestamp, and the consent scope disclosure
(projects included / excluded as counts).

## Decision rules

- **Aggregate at the source, not the hub.** The contributor computes its own
  buckets and applies its own floors before anything leaves. The hub is
  another party; it must never be in possession of anything finer than what
  it publishes. "We'll aggregate server-side" concentrates exactly the data
  the design exists to never centralize.
- **When a measure cannot be computed, ship its absence.** A single-run
  bucket has no between-run variance — the field is null, not zero. A zero
  variance is a claim of perfect agreement; a null is an admission, and the
  merge downstream treats the two entirely differently (a fabricated zero
  would tighten a confidence interval it has no right to tighten).
- **Every schema change is additive and defaulted.** A digest network has
  contributors on every version simultaneously, forever. New fields must
  deserialize as absent/unknown on old payloads, and the hub must state the
  oldest version it accepts. A required new field orphans the installed
  base; the row count of the leaderboard is the network's entire value, so
  orphaning contributors is self-harm.
- **Identifying inputs are consumed locally, only consequences ship.** If a
  local detail (an internal dataset version, a config hash) informs a
  published fact, publish the fact ("all runs sat on one pin") and destroy
  the detail. The test: could a reader correlate two digests from the same
  contributor using this field alone? If yes, it stays home.

## What this technique does not buy

Aggregation removes raw content; it does not remove identity. A one-row
digest for a task category nobody else runs is attributable regardless of
how aggregate its numbers are; a distinctive continuous value survives any
amount of averaging. Aggregate-only is the *foundation* the floors, the
closed vocabularies and the side-channel bucketing stand on — shipping it
alone and calling the result anonymous is the classic failure. Published
practice in statistical disclosure control is blunt on this: cell
suppression and coarsening are needed *on top of* aggregation, not instead
of it.

## When not to use it

Inside one trust boundary. A team's own evaluation dashboard should read the
raw events — case-level drill-down is the whole value of internal tooling,
and imposing digest constraints internally destroys debuggability for no
privacy gain. This technique starts at the organizational boundary and not
one step before.
