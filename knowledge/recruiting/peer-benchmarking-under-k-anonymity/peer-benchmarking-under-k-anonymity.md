---
layer: golden-path
type: golden-path
subject: peer-benchmarking-under-k-anonymity
status: forged
use_when: [designing a cross-organisation hiring benchmark, setting a floor for a peer comparison, deciding whether a market figure may be shown, auditing a comparison for re-identification or gaming]
techniques:
  - minimum-contributors-and-minimum-rows
  - exclude-yourself-from-the-peer-aggregate
  - aggregates-only-never-a-row
  - normalise-each-contributor-to-its-own-process
  - all-time-basis-and-why-a-window-biases
  - withhold-the-rate-report-the-contributor-count
---

# Peer benchmarking under k-anonymity

Every hiring team eventually asks the same question: *is this normal?* Nineteen
days to fill a role, a 41% offer-acceptance rate, four hundred applications per
opening — none of those numbers mean anything alone. They mean something only
against other organisations doing the same work. So a benchmark gets built: pool
what many teams have, aggregate it, show each team where it sits.

That single feature is the most dangerous read in a multi-tenant hiring product,
and it is dangerous twice over. It is the one query deliberately crossing the
tenant boundary that every other query in the system exists to enforce — so it
carries a **re-identification** risk, in which a comparison meant to be anonymous
tells a participant something specific about a named competitor. And it is a
number people are measured on, so it carries a **gaming** risk, in which the
comparison changes the behaviour it claims to observe until it is measuring
compliance with itself.

The naive reading treats this as an aggregation problem — group by, average,
threshold, ship. The principal reading is that a peer benchmark is a **privacy
release protocol that happens to output a statistic**, and that both of its
adversaries are ordinary people acting rationally: a founder curious about the
competitor down the street, and a hiring manager whose bonus depends on a
number they can move without doing any hiring differently.

The whole discipline reduces to five commitments. Publish aggregates and never
rows. Require enough contributors *and* enough rows. Exclude the reader from the
aggregate they read. Compare performance rather than vocabulary. And when the
floor is not met, say that clearly instead of showing something quieter.

## The floor does double duty, and the two duties want different numbers

A benchmark threshold is asked to answer two entirely separate questions that
happen to be expressed in the same unit:

- **Is this figure stable?** At what sample size does one outlier stop moving
  the number past the point where a reader would act differently? This is a
  statistical question, and the sibling discipline of small-sample honesty owns
  it in full: a minimum per claim, justified where the arithmetic lives, with a
  defined behaviour below the floor.
- **Is a contributor unidentifiable?** At what group size can no participant —
  including a participant who knows their own data exactly, and who may know a
  competitor's headcount, funding stage and job postings from public sources —
  work out which rows belong to whom? This is an anonymity question, and it is
  not a question about sample size at all. It is a question about **how many
  distinct organisations stand behind the number**.

These are different questions and they yield different numbers, so the binding
constraint is **whichever is larger, always**. A figure over four hundred
applications from two organisations is statistically excellent and privately
catastrophic. A figure over eleven organisations contributing three rows each is
anonymous and statistically meaningless. Both floors are enforced, both are
stated, and neither may be relaxed because the other is comfortable.

This is the seam with small-sample honesty worth stating out loud: that
discipline's floors protect the *reader* from a number that will mislead them.
The floors here protect a *third party who is not in the room* — the other
contributors — and they protect them against an adversary rather than against
noise. A statistical floor can be argued down with a better estimator. An
anonymity floor cannot be argued down at all, because the thing it is defending
against is not uncertainty; it is a person doing arithmetic on purpose.

Hence the two-dimensional floor: a minimum number of contributing organisations
*and* a minimum number of underlying observations, checked independently, both
required. One number cannot serve both, and a system that enforces only the row
count has enforced only the easier half.

## The differencing attack is the whole threat model

If a benchmark were released once, to nobody, the floors would be enough.
Benchmarks are not released that way. They are recomputed continuously, shown to
every participant, and each participant knows one contributor's data perfectly —
their own. That combination is what turns a safe-looking aggregate into a leak.

Three shapes recur:

- **Self-inclusion.** If the "peer average" includes the reader, the reader can
  subtract their own known figures from the published mean. With a small number
  of contributors this recovers the others directly; with two, it recovers the
  other exactly. The defence is structural and cheap: compute every peer
  aggregate over everyone *except* the reader, and let the floor apply to what
  remains after the exclusion, not before it.
- **Longitudinal differencing.** A benchmark recomputed as contributors join and
  leave leaks by subtraction across time. If the pool went from eight
  organisations to nine and the mean moved, the ninth organisation's figure is
  recoverable to a useful precision. Publishing the contributor count — which
  honesty demands — hands the attacker exactly the term they need. The
  mitigations are to move slowly (recompute on a coarse cadence rather than
  live), to keep the floor comfortably above the minimum so single-member
  changes are proportionally small, and to accept that a pool hovering at
  exactly the floor is the risky regime and should be treated as withheld.
- **Slicing.** Every filter a reader applies — role family, seniority, region,
  company size — narrows the pool, and the floors must be evaluated **after**
  every filter, on the actual cohort behind the actual number on screen. A
  benchmark that gates the global figure and lets a four-facet drill-down render
  freely has moved the disclosure one click deeper, where nobody audits it. This
  is the same lesson small-sample honesty teaches about gated headlines with
  open drill-downs, with a worse consequence than a misleading number. The
  corollary is a design rule, not just a check: over a floored aggregate, a
  narrowing control usually does not narrow the figure, it deletes it — so a
  filter offered above a benchmark it cannot honour is a promise the data
  cannot keep, and is better not offered.

The intuition to carry: **the aggregate is not the release. The sequence of
aggregates is the release**, and it must be safe as a sequence.

## Aggregates only — enforced at the read, not the render

The rule that no cross-organisation read may return an individual record is not
a presentation choice, and it does not survive being implemented as one. A
filtered display over a query that fetched rows is one logging statement, one
debug endpoint, one export button and one careless refactor away from being a
disclosure. The read itself must be incapable of producing a row: it returns
counts, sums, means and quantiles, and there is no code path in which a
cross-organisation identifier and a cross-organisation measurement travel
together.

Two corollaries follow that teams routinely miss. First, **a quantile is a
row in disguise** when the pool is small — a maximum, a minimum, or an extreme
percentile over eight contributors names an organisation to anyone who can
guess which one is extreme, and the guess is usually easy. Prefer central
statistics; if a spread must be shown, show interquartile width rather than
endpoints, and raise the floor. Second, **an exact count is a fingerprint**.
Free-text fields, exact salary figures and precise dates carry far more
identifying information than their contributors expect; bucket them before they
enter the pool, never after.

Consent and lawful basis for a candidate's data entering any shared pool belong
to the candidate-data discipline, not here; what this subject adds is that
aggregation is not anonymisation, and a pool assembled from consented records
still needs every floor in this document.

## Compare performance, not vocabulary

One organisation's "screening" is another's "phone screen" is another's "HM
review". If a benchmark buckets rows by the label attached to them, it compares
naming conventions across companies and reports the result as a performance
difference. The number it produces is real arithmetic over meaningless groups,
which is the most persuasive kind of wrong.

The fix is to normalise each contributor's rows against **that contributor's own
process definition** before any cross-organisation arithmetic happens — its own
stage ordering, its own definition of which stages are pre-offer, its own
terminal states. What travels into the pool is a position on a shared abstract
axis (how far through *its own* funnel a candidate reached), never a raw label.
[Meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label)
is precisely this: the string is local, and only the structure is comparable.

The same discipline applies to units. A cost-per-hire benchmark that sums
figures denominated in different currencies produces a number with no
interpretation whatsoever, and it will look plausible — currencies within an
order of magnitude of each other yield totals that pass every sanity check a
reviewer applies. Convert on a stated basis, or partition the benchmark by
currency and let each partition meet the floors on its own. Never add them. The
identical rule covers hours versus days, gross versus net compensation, and
calendar versus business days: a benchmark's most common silent defect is a
mixed denominator, not a small sample.

## The basis is part of the number, and a window biases

Every cross-organisation figure states what population it was computed over,
across how many contributors, on what time basis
([a claim carries its sample and its basis](../_laws.md#a-claim-carries-its-sample-and-its-basis)).
The time basis deserves its own paragraph because the intuitive choice is wrong
in a specific, one-directional way.

The instinct is to benchmark "the last ninety days" — recent, relevant, comparable.
But a duration metric computed over a window includes only the processes that
*finished inside the window*, and slow processes are exactly the ones that do
not finish. A ninety-day window on time-to-hire is structurally incapable of
containing a hundred-and-twenty-day hire. The published benchmark is therefore
biased **low**, every time, by an amount that grows with how tight the window is
— and every team measured against it is comparing their honest all-time figure
against a number from which the hard roles have been silently removed. Teams
then conclude they are slow when they are average, and tighten a process that
was never the problem.

An all-time basis over completed processes has its own weakness — it mixes eras,
so a market shift takes a long time to appear — but that weakness is *disclosed
by stating the basis*, and it is symmetric rather than directional. A survivorship
bias is neither. When a window is genuinely required, window by **process start**
and admit only cohorts old enough to have completed (the accrual horizon the
small-sample discipline names), rather than windowing by completion date.

## Benchmarks change behaviour, so pick metrics that cannot be moved without hiring

A benchmark is not a passive observation. The moment a team is compared against
peers on a number, that number becomes a target, and any metric a team can move
by editing its own records rather than by hiring differently *will* be moved —
not usually by fraud, but by a hundred locally reasonable decisions.

The canonical example is time-to-fill measured from requisition open date. A
requisition that has been open a long time can be closed and reopened, and the
clock restarts; nobody involved thinks of this as cheating, and the recruiting
system will record it as a clean, fast fill. Any metric anchored on a
**mutable, unilaterally controlled record** has this defect: requisition state,
manually set stage dates, a "sourced" flag toggled at will, a rejection reason
chosen from a dropdown by the person the metric judges.

The design rules that follow:

- **Anchor durations on candidate-side events**, which the measured team does
  not solely control — first application received, first interview scheduled,
  offer issued, offer signed — rather than on requisition lifecycle states.
- **Prefer metrics with a natural denominator** the team cannot inflate.
  Acceptance rate is harder to game than fill time, because the denominator is
  offers actually made and the numerator is a candidate's decision.
- **Benchmark on distributions, not just means**, so that a team that improves
  its average by dropping hard roles shows a changed shape rather than a better
  score.
- **State the definition next to the figure.** Half the divergence between two
  organisations' "time to hire" is definitional, and a definitional gap that is
  visible gets argued about; one that is invisible gets acted on.

Which metric counts what, and on which cohort basis, is the funnel-metrics
discipline's territory — take those definitions from it rather than reinventing
them. What belongs here is the selection criterion: among metrics that are
equally well defined, a benchmark chooses the one whose inputs its participants
cannot unilaterally rewrite.

## A withheld benchmark is a verdict, not a blank

When a cohort does not clear its floors, the honest output is not an empty
panel, a dash, or a quietly widened cohort. It is a statement that the
comparison exists and is not yet sayable, carrying the one number that is safe
to publish: **how many contributors are in the pool**, against how many are
needed. That single change converts a dead end into a progress bar, and it is
the difference between a team concluding the feature is broken and a team
understanding that the pool is young.

Two disciplines meet here. From small-sample honesty: an unmeasurable figure is
a distinct state from a measured one and must never be folded into a summary as
though it were a pass. From this subject: the *reason* for the refusal may itself
be sensitive — "withheld because only two organisations contribute" is
informative, and in a small market it may be enough to identify them. Report the
contributor count against its floor, not the identities, the regions, or the
filters that produced the thin cohort.

And the floor never moves for a specific customer. The customer who cannot clear
it is the exact case the floor was written for
([absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence)).

## A market band reads only from the shared corpus

The same craft recurs wherever a product tells an organisation what "the market"
looks like — most visibly in compensation. A market band must be computed from a
shared corpus that excludes the reader's own records. If a team's own postings
feed the band that team is then measured against, the band drifts toward
whatever that team already does; a large contributor eventually benchmarks
against itself, sees agreement, and calls it validation. Worse, the loop is
exploitable: a participant can move the market it will be judged by, at no cost,
by changing what it publishes.

What the band means, how ranges are set and how honestly they are communicated
belong to the compensation-banding discipline. What belongs here is the
structural rule — self-exclusion is not merely a privacy control, it is what
keeps a benchmark an *external* reference — and the observation that a minimum
cohort size serves both duties at once: below it the band is neither meaningful
nor anonymous.

## Failure modes of the naive reading

- **The row that escaped.** A cross-tenant query that returns records and a
  presentation layer that aggregates them. Correct on screen, one export away
  from a breach.
- **The self-inclusive average.** The reader is inside the peer aggregate, so
  subtraction recovers the rest. Fatal at two contributors, weak at five,
  tolerable only far above the floor — and there is no reason to tolerate it at
  all.
- **The single threshold.** One minimum enforcing sample size and standing in
  for anonymity, or vice versa. Whichever duty it was chosen for, it is serving
  the other one badly.
- **The gated headline with an open slice.** Floors evaluated on the whole pool
  rather than on the cohort behind the number actually rendered.
- **The vocabulary benchmark.** Rows bucketed by label across organisations,
  reporting naming differences as performance differences.
- **The mixed denominator.** Currencies, units or definitions summed together
  into a figure that no conversion can recover.
- **The windowed duration.** A recent-window benchmark biased low by the slow
  cases that could not finish inside it, making everyone measured against it
  look slow.
- **The gameable anchor.** A benchmark on a metric its participants can move by
  editing a record, which they will, until the benchmark measures editing.
- **The quiet blank.** A withheld comparison rendered as an empty state, so the
  team reads "broken" rather than "not yet" and stops looking.

## The techniques

- [minimum-contributors-and-minimum-rows](techniques/minimum-contributors-and-minimum-rows.md)
  — the two-dimensional floor, why one number cannot serve both duties, and how
  to size each.
- [exclude-yourself-from-the-peer-aggregate](techniques/exclude-yourself-from-the-peer-aggregate.md)
  — the differencing attack and the structural defence, including where the
  floor is checked relative to the exclusion.
- [aggregates-only-never-a-row](techniques/aggregates-only-never-a-row.md)
  — making the cross-organisation read structurally incapable of emitting a
  record, and the statistics that are rows in disguise.
- [normalise-each-contributor-to-its-own-process](techniques/normalise-each-contributor-to-its-own-process.md)
  — judging every row against its own organisation's process axis so the
  benchmark compares performance rather than naming conventions.
- [all-time-basis-and-why-a-window-biases](techniques/all-time-basis-and-why-a-window-biases.md)
  — the survivorship argument against windowed duration benchmarks, and the
  correct way to window when you must.
- [withhold-the-rate-report-the-contributor-count](techniques/withhold-the-rate-report-the-contributor-count.md)
  — the refusal that carries a progress bar, and what the refusal itself may
  disclose.
