---
layer: golden-path
type: golden-path
subject: federated-benchmark-sharing
status: forged
use_when: [publishing evaluation results outside the organization that produced them, building or operating a shared model leaderboard fed by many installations, designing what an opt-in telemetry digest may contain, deciding which fields of a benchmark result are safe to share, a contribution is published as a proposed change and a retry duplicated it, deciding what happens to a measurement when the operator declines to share it]
techniques:
  - aggregate-only-digests
  - k-anonymity-cases-and-sources
  - fixed-task-vocabulary
  - cost-bucketing-side-channels
  - bounded-contributor-influence
  - hub-ingest-plausibility-gates
  - content-addressed-contribution
  - capture-locally-publish-separately
  - strict-ingestion-lenient-consumption
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
(see [aggregate-only-digests](./techniques/aggregate-only-digests.md)). The only
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
  contributor can widen it ([fixed-task-vocabulary](./techniques/fixed-task-vocabulary.md)).
- **Continuous channels** — cost is the canonical one. An unbounded
  continuous number derived from one organization's exact pricing, provider
  mix and prompt lengths is unique in practice even when every categorical
  field is coarse. It must be bucketed before it leaves, and re-bucketed at
  the hub ([cost-bucketing-side-channels](./techniques/cost-bucketing-side-channels.md)).
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
([k-anonymity-cases-and-sources](./techniques/k-anonymity-cases-and-sources.md)).
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
  one ([hub-ingest-plausibility-gates](./techniques/hub-ingest-plausibility-gates.md)).
  Bounded scores, by contrast, are clamped — an overshoot on a `[0,1]` scale
  is a rounding artifact, not a lie.
- At merge, **single-source influence is bounded**: the largest share of a
  row's weight any one contributor may hold is capped, so a contributor can
  lead a row but never own it, and the realized share is published on the row
  ([bounded-contributor-influence](./techniques/bounded-contributor-influence.md)).
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

## The mechanics of contributing, which decide whether any of this runs

Everything above governs *what* may leave a contributor and *what* the hub may
believe. A federation also has to survive the plain mechanics of the
contribution act, and three of them are load-bearing enough that getting them
wrong empties the network before any privacy or capture question is reached.

The mechanics differ by transport. Where contributions arrive as **proposed
changes to a shared store** rather than as posts to an endpoint, publishing is
several steps against a system the contributor does not own, with no transaction
around them — so a partial failure followed by the contributor's natural retry
duplicates the result, and one honest contributor's bad network day inflates
their weight through the door the ingest gates are not watching. Deriving each
contribution's path from its own content removes the whole class: a retry
recomputes the same path, concurrent contributors cannot collide, and a
contributor's second submission extends their first rather than opening a rival
one. The same section settles a governance question that arrives with it —
**the checks are the contract and the generated naming convention is only a
convention**, so a hand-assembled contribution that passes the gates is as good
as a tool-generated one, and a bug in the tool never becomes the specification.
[content-addressed-contribution](./techniques/content-addressed-contribution.md)
owns both.

Consent's *timing* is the second, and the obvious implementation of an opt-in
destroys what it gates: if the run asks before writing anything, a decline
discards a measurement the contributor paid for, a network failure loses one
that had already succeeded, and saying no costs the operator their own data —
the precise pressure an opt-in exists not to apply. Capture must therefore land
in a local store unconditionally, with publication a separate operation reading
it, so declining discards nothing, a backlog can be sent later in one piece, and
the payload disclosure this subject demands is constructible at all.
[capture-locally-publish-separately](./techniques/capture-locally-publish-separately.md)
owns the split, and the ordering rule that keeps the contributor-side
treatments on the way *out* rather than on the way into the store.

The third is a posture, and it is the one place where this subject's "both ends
re-apply everything" symmetry does not hold. Admission has two ends; a
federation whose pooled data is later compiled into an artifact has a **third**
stage, and there the strictness must invert — not because the data deserves more
trust, but because the party who pays for a refusal has changed. At ingestion the
contributor is standing there and can fix it; at consumption they are long gone
and a hard failure breaks the artifact for every downstream user who submitted
nothing. Refuse where the author is standing; skip, warn and continue where only
bystanders are — and read any entry that passed the first and failed the second
as a gate defect rather than as bad luck.
[strict-ingestion-lenient-consumption](./techniques/strict-ingestion-lenient-consumption.md)
owns that asymmetry and the validation-scope decision that sits beside it.

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
