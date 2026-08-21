---
layer: golden-path
type: golden-path
subject: peer-benchmarking
status: forged
use_when: [ranking a tenant against other tenants, adding a percentile or "top N%" claim, designing a cross-tenant comparison corpus, deciding whether a peer comparison may be shown at all]
techniques:
  - comparability-filters
  - cohort-minimum-size
  - population-vs-scalar-ranking
  - corpus-tenancy-boundary
  - basis-disclosure
---

# Peer benchmarking

A peer benchmark is a sentence of the form **"you are here, relative to
them."** It is the most persuasive number a product can show — a lone score
invites "compared to what?", and a position answers it — and it is also the
most fragile, because the position is not measured. It is *manufactured* by
placing one measurement inside a set of other measurements, and every
property of that set is a design decision made by whoever assembled it. The
score was measured; the rank was constructed. The entire subject is the
discipline of constructing it so it survives the one question that matters:
**what, exactly, am I above?**

That question has teeth because peer positions get repeated. A score is
quoted with hedges; a percentile is quoted flat — in a board deck, a
procurement questionnaire, a renewal negotiation — travelling further than
its caveats and outliving the corpus that produced it. So the standard is not
"is the arithmetic right"; the arithmetic is trivial. The standard is:
**would this position still be defensible if the reader saw the corpus?** If
seeing the corpus would change the reader's mind about the number, the number
is not honest yet — and the fix is never to hide the corpus.

Neighbouring subjects own the pieces adjacent to this one, and the seams
matter:

- **[Diff & comparison](../../../ui-surfaces/data-display/diff-comparison/diff-comparison.md)** compares
  *two artifacts* and reports where they differ. Here there is no second
  artifact — there is a *population*, and the output is a position within
  it, not a difference from a counterpart. The tell: "how does mine differ
  from theirs?" is a diff; "how many of them am I above?" is here.
- **[Metrics & rollups](../../../backend-platform/platform-observability/metrics-rollups/metrics-rollups.md)** owns
  aggregation mechanics — bucketing, windows, stored folds, composition. A
  peer benchmark *consumes* aggregates that subject produces; it does not
  re-litigate how a mean is computed, only whether two means may be placed
  on the same axis.
- **[`measurement-honesty`](../measurement-honesty/measurement-honesty.md)** owns sample floors as a general obligation
  across all measurement, and the vocabulary for "we cannot say yet." This
  subject owns the narrower, sharper question: **comparability** — whether
  two numbers were produced by the same instrument at all, before any
  question of how many of them there are.
- **[`people-analytics-ethics`](../people-analytics-ethics/people-analytics-ethics.md)** owns what may be measured about, and named
  about, individual humans. Everything here concerns organizational units;
  the moment a cohort is small enough that a position identifies a person,
  that subject's rules bind and this one's do not override them.

## A percentile is a claim about the instrument, not just the numbers

The naive reading of a percentile is arithmetic: sort the corpus, find the
position, divide. That reading is what produces the field's most common
defect, which is not a rounding error but a **category error** — comparing
numbers that were never comparable.

Two measurements belong on the same axis only if they were produced *the
same way*. Same instrument, same version of the instrument, same unit, same
window, same population definition. When any of those differ, the position
computed from them is not a weaker claim; it is a different claim wearing
the costume of the intended one. A score produced by a fallback path (a
degraded analyzer, a cached heuristic, a cheaper model, a deterministic
stand-in used when the real engine was unavailable) is a number from a
*different scoring function*, and the fact that it lands in the same numeric
range is precisely why nobody notices. A score produced under a previous
version of the rubric is a number from a **retired instrument**: unless
something re-bases historical values when the rubric changes — and almost
nothing does, because re-basing means re-running the original inputs — old
rows are frozen measurements from a scale that no longer exists.

The decision rule that follows is uncomfortable and non-negotiable: **rows
of unknown provenance are excluded, not included.** Absence of a recorded
engine or rubric version is not evidence of comparability; it is absence of
evidence, and in a ranking, unlabelled rows do not sit neutrally — they
shift the position of every ranked tenant. The mechanics of which rows may
enter, and the symmetry obligation that comes with them, are the
[comparability-filters](./techniques/comparability-filters.md) technique.

The symmetry obligation deserves its own line here because it is the error
that survives the first fix: **the filter applies to both sides.** Cleaning
the corpus while leaving the subject's own number unfiltered is the same
category error, mirrored — the subject is now measured by one instrument and
ranked against another. It reads as rigor and is not.

## A corpus too small cannot carry a position

Percentiles derived from tiny corpora are not noisy — they are *confidently
wrong*. With four peers, the possible outputs are roughly 0%, 25%, 50%, 75%,
100%, and the top of that ladder renders as **"you beat 100% of your
peers"**: maximally strong language backed by a set small enough that one
new joiner could move it two rungs. Nonparametric position estimates need
substantial n before their confidence interval narrows to anything a reader
would recognize as a rank; extreme positions need more still, because the
tails are exactly where a handful of observations must stand in for a
distribution. There is no clever estimator that rescues n=4. The only honest
move at the bottom of the ladder is **refusal**: no position, an explicit
statement of why, and — critically — no leak of the corpus size that made
refusal necessary.

Choosing that floor, defending it, and refusing above it are the
[cohort-minimum-size](./techniques/cohort-minimum-size.md) technique. It
carries a second, independent argument that lands on the same threshold from
the other direction: a cross-tenant corpus is data about *other customers*,
and small cohorts leak. When the corpus is three organizations and one of
them can identify the other two, a "position" is a disclosure. Privacy
practice and statistical practice agree on a floor here for different
reasons, which is a good sign for the floor and a reason to set it by the
stricter of the two.

## Match the unit on both sides of the comparison

The subtlest defect in the subject is a **unit mismatch**: ranking a scalar
against a population of a different kind. It happens because both sides are
"scores" and both are numbers, so the type system consents.

The canonical shape: a tenant's *average* is ranked against the distribution
of *individual items* across all tenants. The two are not the same
population. An average is a shrunk quantity — averaging pulls toward the
centre — so an average compared against raw items lands nearer the middle
than it should, and does so *systematically*, for every tenant, in the same
direction. Strong performers are understated; weak performers are
flattered; nobody sees an error, because the error has no outliers. The
whole surface reads plausibly and is uniformly wrong.

The rule: **rank like against like.** A tenant mean belongs among other
tenant means; an item score belongs among other item scores; a median
belongs among medians. Whichever level the claim is made at, both sides live
at that level, and the aggregation from raw rows to peer units happens
*before* the ranking, not accidentally on one side of it. This, and the
related shrinkage and tie-handling questions, are the
[population-vs-scalar-ranking](./techniques/population-vs-scalar-ranking.md)
technique.

## A sharper cohort is a smaller cohort

Beyond "everyone else", most benchmarks want a **peer group**: organizations
alike in the ways that plausibly affect the metric — size, sector, technology
mix, workload shape. The instinct is right. A position against similar
organizations answers a question a position against the whole field does not,
and readers ask for it immediately.

But every narrowing dimension divides the corpus, and the floor does not
move. A peer group defined by three attributes is usually a peer group of
four, which the previous section already disqualified. The resolution is
structural rather than clever: **offer the broad position and the narrow one
as separate, separately-labelled claims, each with its own corpus size, each
suppressed independently** — and give the subject with no clear segment no
cohort comparison at all, rather than assigning it to the nearest one to
avoid an empty tile.

## The corpus has a tenancy boundary, and it is load-bearing

Every peer benchmark reads across an isolation boundary that the rest of the
system spends its life enforcing. That makes benchmarking queries a
structurally privileged path, and privileged paths need explicit invariants
rather than inherited habits:

- **Membership is a policy, not a leftover.** Who is in the corpus is
  decided — an opt-in pool, a public register, a contractual peer set — and
  the decision is enforced per row at query time, not assumed from where the
  data was loaded from.
- **Nothing identifying crosses.** The corpus contributes *distribution*,
  never rows. Names, identifiers, and any field narrow enough to re-identify
  stay on their side; what comes back is a position and an aggregate shape.
- **Aggregation across tenants is not the same operation as aggregation
  within one.** A fleet-of-fleets rollup — one operator viewing many
  tenants — is a legitimate but *distinct* capability with its own
  authorization, and it must not be the accidental byproduct of a
  benchmarking query.

These invariants, and the failure mode where a public-facing surface is
computed from a corpus that quietly includes private rows, are the
[corpus-tenancy-boundary](./techniques/corpus-tenancy-boundary.md) technique.

## Selection bias is a property of the corpus, and it does not average out

Every real peer corpus is self-selected. Organizations that opt into
measurement, that finish onboarding, that run the analysis often enough to
have recent data, differ systematically from those that do not — and they
differ *on the thing being measured*. A corpus of the engaged is a corpus of
the above-average, which means a mid-pack position in it is a better
absolute position than it sounds, and a bottom position is worse news than
it looks. More data does not fix this: a larger self-selected sample is a
more precise estimate of the wrong population.

Engineering choices add their own selection on top of the behavioural one. A
cross-tenant corpus is rarely the whole population by the time it is ranked
against: it is bounded — a cap on how many peer records one comparison may
read, protecting the system from a query whose cost grows with the whole
estate rather than with the tenant asking. That cap is correct engineering
*and* a sampling rule, because whatever ordering fills it defines the corpus:
a recency-ordered cap yields a corpus of the recently active. **Treat the
corpus as a sample and say so** — bound it deliberately, choose the ordering
knowing what it selects for, and let the bound appear in the basis rather
than presenting a capped slice as "the field".

There is no purely technical remedy for the behavioural half — reweighting
requires knowing the true population, which is exactly what is unavailable.
The remedy is **naming it**. The corpus is described in the words that make
its composition visible: who is in it, why they are in it, and what the
position therefore does and does not mean.

## The basis ships with the number

The closing discipline, and the one that makes the rest auditable: **no
position travels without its basis.** The basis is the set of facts a reader
needs to re-derive the claim — corpus size, what defined membership, the
instrument and version both sides were filtered to, the window, the unit
being ranked. This is
[count-carries-predicate](../../../_laws.md#count-carries-predicate) applied to a
rank: "top 10%" is not a finding; "top 10%, among 47 organizations measured
by rubric v4 in the trailing 90 days, ranked on organizational means" is.

The obligation binds the *travelling* forms hardest — exports, summary
emails, briefing paragraphs, anything that quotes the number away from the
surface that computed it. A basis rendered only as a tooltip on a chart is a
basis that does not survive a screenshot. And the negative case has its own
rule: when a position is suppressed for any reason above, the surface says
*why it was suppressed*, not *what the corpus was* — "not enough comparable
peers to place you yet" discloses a policy, while "only 3 peers" discloses
other customers. Both forms are the
[basis-disclosure](./techniques/basis-disclosure.md) technique.

## What this subject refuses

- **Ranking against unlabelled rows.** No recorded instrument and version,
  no entry into the corpus — on either side.
- **A filter applied to one side.** Cleaning the corpus while leaving the
  subject's own number unfiltered.
- **A position from a corpus below the floor.** No estimator, no "directional
  indicator", no greyed-out-but-still-rendered number.
- **A scalar ranked against a population of a different unit.** Means against
  means, or nothing.
- **Corpus size quoted as the reason for a refusal.** Say the policy; never
  count the neighbours out loud.
- **A percentile with no basis attached to it.** Especially in the forms that
  travel: exports, digests, generated prose.

## The techniques

- [comparability-filters](./techniques/comparability-filters.md) — which
  measurements may share an axis: instrument identity, rubric version,
  window and unit alignment, unknown-provenance exclusion, and the
  both-sides symmetry rule.
- [cohort-minimum-size](./techniques/cohort-minimum-size.md) — the corpus floor
  below which no position is produced, why it is a named constant per
  surface, and how refusal is spelled.
- [population-vs-scalar-ranking](./techniques/population-vs-scalar-ranking.md)
  — matching the unit on both sides: aggregate before ranking, means among
  means, shrinkage and ties.
- [corpus-tenancy-boundary](./techniques/corpus-tenancy-boundary.md) — the
  isolation invariants of a cross-tenant corpus: per-row membership
  enforcement, distribution-not-rows, and separating operator rollups from
  peer comparison.
- [basis-disclosure](./techniques/basis-disclosure.md) — shipping corpus size,
  membership rule, instrument version, window and unit alongside every
  position, and what a suppression is allowed to say.
