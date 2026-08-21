---
layer: golden-path
type: golden-path
subject: people-analytics-ethics
status: forged
use_when: [a report would name or rank an individual, adding a per-person view to an engineering dashboard, deciding what a manager may see about one person, a metric is framed as risk or liability]
techniques:
  - naming-population-floor
  - producer-enforced-suppression
  - aggregate-vs-individual-split
  - risk-framing-anonymization
  - contribution-eligibility-floors
  - private-view-separation
---

# People analytics ethics

Engineering measurement is built from artifacts that identifiable humans
produced. Every commit, review, ticket, and deployment carries an author. The
moment a system reads those artifacts it holds, whether or not it displays it,
a per-person dataset — and the distance between an honest engineering report
and a surveillance instrument is a handful of product decisions, most of them
made casually by someone adding a column.

This subject is about those decisions: **which framings may carry a human
name at all, what must be true of the population before anyone is named or
ranked, where the suppression is enforced, and how the view a person gets of
their own data differs from the view their organization gets of them.** It is
not about the metrics themselves — what makes a delivery number sound belongs
to the [`delivery-analytics`](../../reporting-and-remediation/delivery-analytics/delivery-analytics.md) subject, which defers to this one on what may be
said about a person. It is not about proving who did what in a system: the
provenance of actions taken, retained deliberately and read under
investigation, is [audit-logging](../../../operations/governance-and-records/audit-logging/audit-logging.md). It is
not about product telemetry, whose subject is the product rather than the
person and whose scrubbing rules therefore differ in kind, not degree —
that is [usage-analytics](../../../operations/service-operations/usage-analytics/usage-analytics.md).

Two properties define the discipline.

- **A name is a decision, never a default.** Attribution data arrives already
  joined to a person, so displaying it costs nothing and omitting it feels
  like withholding. That asymmetry is the entire trap. Every place a human
  name appears in a report must be the result of someone asking "does the
  name carry decision value the artifact alone cannot carry, and is the
  framing one a name can survive?" — and being able to answer yes twice.
- **The measured person is a party to the measurement, not its object.** The
  people in the dataset are the people who produced it, and they are on the
  premises. They can read what is said about them, they will infer the rules
  from the outputs, and in several jurisdictions they hold representation and
  data-protection rights over the introduction of the instrument itself. A
  measurement system whose design would embarrass its authors if shown to the
  people inside it is already failing, whatever it currently displays.

## The measurement changes the thing measured, and the person knows it

The naive reading of engineering analytics is that it observes an existing
process. It does not: a metric that is visible per person becomes a target for
that person within about one review cycle, and the well-documented result is
behavior optimized for the measure — changesets split to raise counts, review
comments emitted for volume, refactors that delete code avoided because they
score negative. This is not a calibration problem to be fixed with a better
formula; it is a property of measuring individuals with published numbers, and
it applies to whatever replaces the discredited metric next.

The practical consequence is a design rule rather than a warning: **the
population level at which a number is published determines what the number
will become.** Published at the organization or repository level, a
contribution measure stays a description. Published per person and attached to
a name, it becomes a scoreboard, and a scoreboard is a set of instructions.
Teams that want the diagnostic value without the instruction set publish at
the aggregate level and let each person see only their own row — which is the
[aggregate-vs-individual-split](./techniques/aggregate-vs-individual-split.md)
and [private-view-separation](./techniques/private-view-separation.md)
techniques, and is the single highest-leverage decision in this subject.

## Framing decides whether a name is admissible

The same underlying computation can be phrased as a fact about an artifact or
as a claim about a person, and the two are ethically distinct even when they
are arithmetically identical.

Consider a concentration measure: most of a component's changes came from one
author. Phrased about the component — *this area depends on a single
contributor and has no second maintainer* — it carries the whole decision: the
reader must spread knowledge, add a reviewer, write documentation. Phrased
about the person — *this engineer is a key-person risk* — it adds exactly one
capability the first phrasing lacked: the ability to point at someone in a
leadership review as a liability. That capability is not decision value. It
is a hazard the metric was never designed to carry, and the engineer never
consented to.

The rule generalizes: **a risk, deficit, or liability framing is precisely
where a name stops being descriptive and starts being an accusation.** A
credit framing survives a name far better than a blame framing does, and a
system may legitimately be asymmetric — naming people in an attribution table
while refusing to name them in the risk panel beside it, computed from the
same rows. That asymmetry is not inconsistency; it is the policy, and it
should be stated in the code that computes it so the next engineer does not
"fix" it. The test for a proposed naming, and the rewrite procedure when it
fails, is [risk-framing-anonymization](./techniques/risk-framing-anonymization.md).

## Floors before names: population, volume, and recency

Even in an admissible framing, a name may only appear once the population
around it is large enough that being named is not itself the finding. Three
independent floors do this work, and each fails differently when it is
missing:

- **A population floor.** Below some number of distinct people in the cohort,
  any per-person breakdown — and often any breakdown at all — identifies
  everyone in it, including by complement: publish the top three of four and
  the fourth is named by subtraction. Thresholds in the range of five to ten
  distinct people are the common professional practice for reporting on
  identifiable humans, and the honest way to set one is to name the smallest
  group the report is allowed to imply, not to pick the number that keeps the
  current dashboard populated. The mechanics, including the complement and
  residual attacks that defeat a naive threshold, are
  [naming-population-floor](./techniques/naming-population-floor.md).
- **A volume floor.** A person who touched the system twice does not have a
  rate, a trend, or a rank; showing one manufactures a fact out of noise, and
  the person shown is usually the newest or most peripheral member of the
  group — the least able to contest it. Volume and window floors before
  anyone enters a distribution are
  [contribution-eligibility-floors](./techniques/contribution-eligibility-floors.md).
- **A recency floor, applied per source.** This one is learned the hard way.
  When a ranking draws from several sources with different retention or
  refresh horizons, a person who left months ago can stay at the top of it
  indefinitely, carried by whichever source has the longest memory. The
  ranking is arithmetically correct and factually a lie about who is doing
  the work, and it is read as a live statement about a current colleague.
  Guarding recency per source, not just globally, is part of the same
  eligibility technique.

None of these floors is a display preference. Each of them is a claim about
what the underlying number is capable of supporting — a count without its
predicate and its population is not a finding
([law: count carries predicate](../../../_laws.md#count-carries-predicate) applies with
unusual force when the count is a person).

## Suppression belongs to the producer, not to each renderer

The most common structural failure in this subject is placing the floors in
the view layer. It fails for three reasons, and every one of them will occur:

1. **The next renderer forgets.** A second surface — an export, a summary
   panel, a scheduled digest, an interface consumed by an agent — reads the
   same producer and re-implements or omits the rule; and the copies that do
   exist drift apart the moment someone adds the seventh surface.
2. **The payload is the leak.** A name hidden by a rendering condition is
   still in the response body, still in the client's memory, still in
   whatever caches or logs the transport touched. Suppression that leaves the
   data present has suppressed nothing an inspector cannot recover.
3. **The rule becomes unreviewable.** A privacy posture readable in one
   function can be audited in a sitting and shown to a workforce-representation
   body. The same posture spread across a dozen components cannot be described
   accurately by anyone, including its authors.

The standard: **the producer emits data that is already safe to render, and
withholding is expressed in the payload as a distinct, typed state.** The
consumer receives a value, or an explicit "withheld, floor not met" — never a
plausible-looking empty result that a renderer will draw as a zero
([law: failure is not empty success](../../../_laws.md#failure-not-empty-success)). One
door, enumerable writers, one place to read the policy
([law: one validation door](../../../_laws.md#one-validation-door)).

And the withholding is narrow: **suppression removes identities, not
findings.** Totals, shares, distributions, and concentration measures are
computed over the whole population and remain present below every floor — the
fallback is aggregation-only, never "no data". This matters most in the
smallest groups, which carry the strongest concentration findings and would
otherwise have their one important result deleted in the name of protecting a
person it never named. The full contract is
[producer-enforced-suppression](./techniques/producer-enforced-suppression.md).

## Two audiences, two datasets, one of which cannot be built

An organization asking "where is our delivery slow" and a person asking "how
is my week going" want different shapes, and the tempting design — one
per-person dataset, filtered by who is looking — is the surveillance design.
Its filter is an authorization check, and authorization checks are added,
removed, misconfigured, and bypassed by the next feature. Once the per-person
dataset exists, someone will build the roster view over it, and they will be
right that it is only a small change.

The alternative is to make the surveillance-shaped view **unrepresentable
rather than merely unrendered**: the individual's view is computed from a
scope that structurally admits one identity — the viewer's own — so there is
no query shape that yields the roster, no parameter to widen, and nothing for
a future authorization bug to expose. What the organization sees is built by
a different producer from aggregate shapes that never carried names at all.
The two producers may share definitions of what a unit of work is; they must
not share the row set. This split, and the small set of things allowed to
cross between the two views, is
[aggregate-vs-individual-split](./techniques/aggregate-vs-individual-split.md);
the properties the personal view must hold to stay personal are
[private-view-separation](./techniques/private-view-separation.md).

## What the constraint environment actually requires

Treat the legal surface as craft rather than paperwork, because the
requirements are the same ones good design already produces:

- **A stated purpose, and no drift from it.** Data-protection regimes in
  several jurisdictions require that measurement of employees serve a
  specified, proportionate purpose. The engineering translation: each
  per-person field names the decision it supports, and a field no decision
  needs is deleted rather than retained in case it becomes interesting.
- **Consultation before introduction, not after complaint.** Where a
  workforce-representation body exists, introducing a system merely *capable*
  of monitoring performance can require agreement before it runs — intent to
  monitor is not the test. A design describable in one page, floors named and
  per-person surfaces enumerated, passes that conversation; one that cannot be
  described does not, and the delay is the design's fault.
- **Retention that expires, and access on the subject's own terms.**
  Per-person granularity has a short useful life and a long liability tail:
  keep aggregate history, age the identified rows out on a stated schedule
  ([law: creation names reaper](../../../_laws.md#creation-names-reaper)). And
  people hold rights to see what is held about them — a product that already
  gives each person a good private view satisfies that as a feature rather
  than as a request queue.

## The failure modes of the naive reading

- **"It is only visible to managers."** Visibility scope is not the property
  that matters; existence is. A number that exists per person will eventually
  be seen, exported, screenshotted into a review, or inherited by a manager
  who reads it differently than its author intended.
- **"We anonymized it."** Replacing a name with a stable pseudonym in a small
  engineering group anonymizes nothing — the ordering, the areas touched, and
  the volume re-identify immediately. Anonymization in a group of nine is a
  costume.
- **"The floors make the dashboard look empty."** That is the dashboard
  telling the truth about a population too small to support per-person
  claims. Lowering the floor does not add information; it adds confidence.
- **"Ranking is just sorting."** A leaderboard is a rewrite of the incentive
  structure and reads as an evaluation regardless of the caption on it. If a
  ranking must exist, it should be bounded, celebratory rather than
  comparative, and floored so that appearing on it means something.
- **"The individual view and the manager view are the same query."** The most
  expensive sentence in this subject. It is true right up to the moment the
  parameter is widened.

## The techniques

- [naming-population-floor](./techniques/naming-population-floor.md) — the
  distinct-person thresholds that must clear before anyone is named or ranked,
  and the complement and residual attacks that defeat a naive threshold.
- [producer-enforced-suppression](./techniques/producer-enforced-suppression.md)
  — withholding at the source with a typed withheld state, so every renderer
  including the ones not yet written inherits the policy.
- [aggregate-vs-individual-split](./techniques/aggregate-vs-individual-split.md)
  — two producers, two row sets, and the narrow list of things allowed to
  cross between the organization's view and a person's own.
- [risk-framing-anonymization](./techniques/risk-framing-anonymization.md) — the
  test that decides whether a framing may carry a name, and the rewrite from a
  claim about a person to a claim about an artifact.
- [contribution-eligibility-floors](./techniques/contribution-eligibility-floors.md)
  — volume, window, and per-source recency gates before a person enters a
  distribution, ranking, or celebratory list.
- [private-view-separation](./techniques/private-view-separation.md) — making
  the roster view unrepresentable rather than unrendered, and the properties
  that keep a personal view personal.
