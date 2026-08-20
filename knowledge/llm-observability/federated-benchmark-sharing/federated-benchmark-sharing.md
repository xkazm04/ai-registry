---
layer: golden-path
type: golden-path
subject: federated-benchmark-sharing
status: forged
use_when: [publishing evaluation results outside the organization that produced them, building or operating a shared model leaderboard fed by many installations, designing what an opt-in telemetry digest may contain, deciding which fields of a benchmark result are safe to share]
techniques:
  - aggregate-only-digests
  - k-anonymity-cases-and-sources
  - fixed-task-vocabulary
  - cost-bucketing-side-channels
  - bounded-contributor-influence
  - hub-ingest-plausibility-gates
---

# Federated benchmark sharing

Every organization that evaluates language models on its own tasks sits on the
most valuable evidence in the field: real quality, real cost, real latency, on
real work — not vendor benchmarks. Federated benchmark sharing is the practice
of pooling that evidence across organizations into a shared leaderboard while
holding two guarantees simultaneously: **nobody can be re-identified** from
what was published, and **nobody can capture** the ranking that results. The
two guarantees are not the same problem wearing two hats. Privacy is about
what an honest contribution reveals; capture is about what a dishonest
contribution can do. A design that solves only one fails in production,
because the same wire format carries both risks, and the mitigations
interlock — the field that protects privacy (an aggregate count) is exactly
the field an attacker inflates to own a row.

## What actually leaves the building

The unit of contribution is a **digest**: a set of rows keyed by
`(provider, model, task category)`, each carrying aggregate quality, pass
rate, bucketed cost, latency percentiles, a case count, a run count, and a
between-run variance. Nothing else. No prompts, no responses, no project
identifiers, no customer data, no free-form names — the digest is built from
run scorecards that never contained raw text in the first place, so the
privacy property is structural, not a redaction step that can be forgotten
(see [aggregate-only-digests](techniques/aggregate-only-digests.md)). The only
identities on the wire are *public* ones: the model's, and a contributor id
whose sole job is deduplication and source counting at the hub.

The principal's discipline here is to treat every candidate field as a
channel and ask what it discloses, not what it was meant for. Three channel
classes recur:

- **Free-text channels** — a benchmark name, a dataset label, a rubric title.
  Any string a contributor typed is a fingerprint. The cure is closed
  vocabularies: names are classified into a fixed, small set of task
  categories before publication, and every enum on the wire (determinism
  levels, coverage tags, judge families) is canon-clamped at ingest so no
  contributor can widen it ([fixed-task-vocabulary](techniques/fixed-task-vocabulary.md)).
- **Continuous channels** — cost is the canonical one. An unbounded
  continuous number derived from one organization's exact pricing, provider
  mix and prompt lengths is unique in practice even when every categorical
  field is coarse. It must be bucketed before it leaves, and re-bucketed at
  the hub ([cost-bucketing-side-channels](techniques/cost-bucketing-side-channels.md)).
- **Combination channels** — fields that are individually coarse but jointly
  identifying. A rare rigor combination, a filter that isolates one source's
  rows, an internal version integer that means nothing to a reader but is a
  sharp per-contributor tag. These are killed by keeping vocabularies tiny,
  by consuming identifying inputs locally and publishing only their
  consequence (the version integer becomes "all runs sat on one pin: yes/no"),
  and by ordering the pipeline so no filter runs before the anonymity floor.

## The floors, and what each one buys

k-anonymity applies twice, and confusing the two floors is the most common
design error in the space
([k-anonymity-cases-and-sources](techniques/k-anonymity-cases-and-sources.md)).
A **case floor** (published health-statistics practice puts minimum cell
sizes anywhere from 3 to 30; pick one and hold it) is enforced by the
contributor: a bucket aggregating fewer cases than the floor is *dropped*,
because a rare task with three cases fingerprints the one organization that
runs it. A **source floor** is enforced by the hub: a merged row backed by
fewer than k distinct contributors is withheld, because a 5,000-case row from
one source is not "the collective" — it is that organization's private
evaluation results on a public billboard. The case floor does not anonymize
across contributors and the source floor does not protect thin buckets; both
are needed, at different ends of the wire.

Pipeline order is load-bearing: **merge → source floor → user filters →
counts over what survived**. Every filter the reader can apply — task,
provider, judge family, rigor level — is a potential isolation attack: filter
until one contributor's rows remain, and the floor you applied before
filtering meant nothing. Run every filter after the floor, and compute the
response's summary counts over the filtered set so the headline never
disagrees with the rows shown. Rows withheld by the floor are *disclosed as a
count*, never silently absent — an empty board must be legible as "held back",
not read as "nobody measured this".

## The capture threat

A leaderboard that weights by evidence volume hands itself to whoever claims
the most evidence. Case-weighting is correct — 10,000 real cases should beat
10 — but taking a self-reported count at face value makes the count itself
the attack surface. The defense is layered, and neither layer substitutes for
the other:

- At ingest, **plausibility gates reject** counts and costs outside what a
  benchmark could produce — more runs than cases, non-finite numbers,
  absurd magnitudes. Reject, don't clamp: a count is the weight the merge
  will trust, and clamping a fabricated number launders it into a credible
  one ([hub-ingest-plausibility-gates](techniques/hub-ingest-plausibility-gates.md)).
  Bounded scores, by contrast, are clamped — an overshoot on a `[0,1]` scale
  is a rounding artifact, not a lie.
- At merge, **single-source influence is bounded**: the largest share of a
  row's weight any one contributor may hold is capped, so a contributor can
  lead a row but never own it, and the realized share is published on the row
  ([bounded-contributor-influence](techniques/bounded-contributor-influence.md)).
  This is the same family as trimmed-mean and winsorized robust aggregation
  in the federated-learning literature, applied to weights rather than
  gradients.

## Merged numbers must confess what they are

A point estimate that averages a 5-case bucket with a 50,000-case one is
misleading without saying so. The merged row carries its own honesty
apparatus: an approximate confidence interval when enough of the weight
carries known variance — and an explicit "insufficient variance data" absence
when it doesn't, never a fabricated interval; a between-source spread so
disagreement among contributors is visible even when no interval could be
formed; a low-confidence flag on thin rows (shown, not hidden); and
conservative folding for rigor claims — a merged row's reproducibility claim
is its weakest source's, and a claim resting on silence degrades to "mixed"
rather than being inferred. Ranking stays by the point estimate; uncertainty
annotates, it never reorders — a board whose ordering depends on modeling
choices invites tuning them.

## Consent is an act, not an inheritance

Contribution is opt-in **per project**, never inherited from an
installation-level switch. An organization is not one privacy posture: an
NDA'd engagement sits in the same database as a dozen internal projects, and
a global opt-in ships it by accident. The digest disclosed to the operator
before sending states its own scope — how many projects were included and how
many were excluded — so consent is auditable, not assumed. Silence excludes;
only an explicit flag includes.

## The boundary with cost metering

Builder-side cost metering computes spend precisely for the operator's own
books — there, precision is the entire point, and a rounded cost is a defect.
In this subject the same number is a **privacy hazard**: an unbounded
continuous fingerprint that must be coarsened before it crosses the
organizational boundary. The two postures are not in tension, because they
apply on opposite sides of one line: exact inside, bucketed outside. A team
that reuses its internal cost pipeline for the shared digest without the
boundary treatment has not saved effort; it has published its pricing
contract.

## Failure modes of the naive reading

- **"We only send aggregates, so we're safe."** Aggregation without floors,
  vocabulary closure and side-channel bucketing is a fingerprint with extra
  steps. One row, one rare task name, one exact cost — any of them undoes the
  averaging.
- **"k-anonymity on cases covers it."** It covers nothing across sources.
  The single-source row is the leak the case floor cannot see.
- **"Sanitize at the hub."** The contributor must also protect itself —
  bucketing and the case floor run before the payload leaves — because the
  hub is another party, and because a compromised or merely buggy hub must
  not be holding raw fingerprints. Symmetrically, the hub re-applies every
  treatment, because what a contributor did to its own numbers is its
  business; what gets published is the hub's responsibility.
- **"Trust the counts; contributors are peers."** Peers include the
  compromised, the buggy, and the motivated. Every self-reported number is
  either bounded, clamped, rejected, or disclosed — never simply believed.
- **"Old contributors can re-send under the new schema."** They won't. Every
  schema addition is additive and defaulted, and an old-format contribution
  merges with its missing fields as *unknown* — absence disclosed, never
  imputed — or the network effect dies at the first version bump.
