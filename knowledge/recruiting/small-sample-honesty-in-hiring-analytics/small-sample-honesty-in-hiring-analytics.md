---
layer: golden-path
type: golden-path
subject: small-sample-honesty-in-hiring-analytics
status: forged
use_when: [deciding whether a hiring figure may be published, designing a metric that can refuse, reviewing a dashboard that never says "cannot say", setting a minimum sample for a hiring claim]
techniques:
  - a-named-minimum-per-claim
  - not-measurable-versus-zero
  - thin-but-real-as-a-labelled-state
  - insufficient-sample-is-not-a-pass
  - gate-each-cohort-not-only-the-headline
  - state-the-accrual-horizon
---

# Small-sample honesty in hiring analytics

A company that hires twenty people a year produces twenty hire outcomes a
year. Split those across four departments, three seniority levels and two
sources and the largest cell holds three. Every technique consumer analytics
takes for granted — a conversion rate you can trust to a percentage point, a
week-over-week trend, a segment comparison, a significance test — assumes a
denominator that a hiring team will not reach in the lifetime of the
requisition, and in many cases will never reach at all.

This is the whole point of the subject, and it is the point most dashboards
miss. **Small sample is not an edge case in hiring analytics; it is the normal
operating condition of the entire domain.** A funnel dashboard built for an
e-commerce checkout degrades gracefully into hiring because most of its cells
fall below the threshold at which its own arithmetic means anything — and it
degrades silently, because nothing in the arithmetic complains. Two hires out
of three offers renders as 67%, in the same font, the same colour and the same
confident sentence as 67% computed over four thousand.

The discipline here is not "handle the empty state". It is: **for every claim
the product is willing to make, name in advance the minimum evidence that
claim requires, and build a distinct, first-class rendering for the case where
the evidence is not there.** A metric that cannot say *I cannot tell you* is
not a measurement instrument. It is a decoration that happens to be computed.

This subject owns the decision of **what may be claimed**. What each metric
counts, on which cohort basis, is the funnel-metrics discipline's — cite it
rather than restating it. How a state is coloured, worded and laid out once
decided belongs to the honest-presentation discipline. Validating whether a
score predicts anything belongs to score calibration; the fairness test itself
belongs to adverse-impact analysis; floors for comparing candidates against
each other belong to comparative shortlist evaluation. Each of those has a
minimum, and each minimum is different — that difference is the interesting
part, and it is handled here.

## The three states, and why two are not enough

The instinct is binary: either you have data or you have an empty state. That
collapses two genuinely different situations that call for genuinely different
behaviour, and it produces the single worst outcome in the subject — a
plausible number that nobody flagged.

The honest vocabulary has three states:

- **Measured.** The claim clears its named minimum. Render the number, with
  its basis and its count.
- **Thin but real.** There is genuine data, more than none, and less than the
  minimum. The observations exist and are worth showing to a human who will
  read them as anecdote — but the figure derived from them may not drive a
  decision, may not enter a headline, and may not be compared to anything.
- **Not measurable.** There is no basis at all, or the basis is structurally
  incapable of supporting the claim (a comparison with one thing in it; a
  reliability curve where every candidate had the same outcome). Render a
  refusal that names what is missing.

Collapsing *thin* into *measured* produces false confidence. Collapsing *thin*
into *not measurable* throws away the only signal a young team has, and teaches
recruiters that the analytics never work, which is how a product's measurement
surface dies. Both collapses are common; the second one is the one teams reach
for after the first one embarrasses them.

The states must be **typed**, not encoded in the value. A metric that returns
zero when it means *unknown* has made a specific, false, expensive claim: zero
adverse impact, zero time in stage, zero hires forecast. This is
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence)
in its most literal form, and it is the failure that a typed state exists to
prevent.

*Not measurable* also covers the case a size-based reading misses entirely: the
**degenerate cohort**, where there are plenty of observations and they are all
the same. A cohort in which every candidate advanced has no variation to
discriminate, so no measure of discrimination exists — and the honest verdict is
*cannot tell you*, not *weak*. Small hiring cohorts are degenerate far more often
than large consumer ones, which is why this case has to be designed for rather
than discovered. The related trap is the universal yardstick: a quality bar set
against an even-odds baseline is the wrong bar for a cohort that advances most
of its candidates, and comparing against it can render a genuinely worse-than-
guessing result as a comfortable margin. The reference has to be the cohort's
own base rate, computed from the same small sample and refused when that sample
cannot support it.

## Every metric carries its basis, always — not only when thin

The temptation is to attach a sample count only to the figures that fall short,
so the interface stays clean when things are healthy. This is exactly backwards.
If the basis appears only on weak figures, its presence becomes a badge of
shame, and the first product instinct is to suppress it. Worse: a reader who
sees no basis cannot distinguish "computed over four hundred" from "the field
was never populated".

Make the basis mandatory on every metric, healthy or not:
[a claim carries its sample and its basis](../_laws.md#a-claim-carries-its-sample-and-its-basis).
The basis states what population was counted, over what window, and how many
observations stand behind the figure. It is not a caveat under the chart. It is
part of the number, and a figure without it is not publishable at any sample
size.

The organizational payoff is larger than the analytical one. Once every number
carries its count, a leadership conversation about "our 67% offer acceptance"
resolves in one glance instead of a week of reconciliation, and the pressure to
quote thin figures externally dies on its own, because everyone in the room can
see the three.

The mechanism that makes this hold under commercial pressure is a **single
publishability bit** over the whole set: true only when every headline metric is
fully measured, accompanied by the plain-language list of reasons it is false.
Per-metric labels are read by analysts; the one bit is what the person about to
put the figures in front of a customer actually checks, and the reason list is
what turns "you cannot publish this" into "you can publish this in six more
hires". A page with nine honest labels and no aggregate bit still gets quoted
selectively.

## A minimum is a per-claim decision, not a global constant

The single most common design error after the binary state is one threshold
applied to everything — a `MIN_SAMPLE` constant in a shared module, imported
everywhere. Different claims need wildly different minimums because they are
asking different questions of the same data:

- A **headline rate** needs enough that one outlier cannot move it by tens of
  percent. On a percentage, that is roughly the reciprocal of the resolution
  you intend to display.
- A **bottleneck flag** — "candidates wait nine days here" — needs enough that
  the flag is about the stage rather than about one person's holiday. Its
  minimum is justified behaviourally: below it, the flag misdirects the
  recruiter's next hour of work.
- A **selection-rate ratio** needs enough in *each* group for a proportion to
  be stable, and the floor is a statistical one, not a product one.
- A **reliability curve** needs enough resolved outcomes to have anything to
  plot against, and enough variation among them that a curve can exist.
- A **comparison** needs at least two things to compare, which is a floor of a
  completely different kind — structural, not statistical.
- A **regime signal** — a capacity ratio, a load figure — needs enough activity
  that the phenomenon exists at all. Below it, the honest reading is not "an
  unstable measurement" but "a quiet quarter", and no amount of extra data about
  a quiet quarter turns it into a capacity reading.

The minimum is therefore stated at the claim, with its reasoning, in the same
place as the arithmetic. Two different questions asked of the same cohort take
two different floors, and a reviewer who sees a single shared constant should
read it as a sign that nobody asked what each claim actually needs. And a floor
is counted in the unit that actually carries the claim: a time-saved figure
rests on the assisted actions performed, not on the hires that happened to
close, and gating it on the wrong unit withholds a well-evidenced number while
publishing a thin one.

## Thin data is the normal case, so it must be designed for, not tolerated

Hold two facts together. First: below its minimum, a figure may not drive a
decision. Second: a team with six hires still needs to run. The resolution is
not to lower the minimum. It is to change what is shown.

Under the floor, shift from **rates to raw observations**. "Three of the last
four offers were accepted" is honest, legible, and immune to the criticism that
75% invites — nobody reads four data points as a percentage when you show them
as four data points. "Two candidates have sat at technical review for over a
week, here they are" is more actionable than any dwell-time average computed
over two candidates, and it degrades correctly: at four hundred candidates the
list becomes useless and the average becomes meaningful, which is precisely the
right crossover.

This is why the *thin* state is a labelled state rather than a suppression. It
carries a different presentation grammar — no percentage, no trend arrow, no
comparison, no colour that implies a verdict — and it carries the underlying
observations instead. The label is what stops it from being read as measured;
the observations are what stop it from being useless.

## Refusal is a verdict, and it is never a pass

The most dangerous small-sample failure is not the overconfident number. It is
the silent all-clear. A fairness check that skips a group because the cohort is
too small, and reports no finding, has produced the same output as a check that
ran and found nothing wrong — and the two mean opposite things. One says *we
looked and it is fine*. The other says *we could not look*.

The rule is absolute and it is the subject's sharpest edge: **too small to
assess is a distinct verdict from assessed and clean.** They render
differently, they are stored differently, they trigger different follow-up, and
no aggregation may fold one into the other. A summary that counts "checks
passed" and includes the skipped ones is a compliance artifact that lies.

The same shape recurs away from fairness. An unrun check is not a passed check.
An unmeasured competency is not a met competency. A model that could not
determine something has not found no concern. Each of these is
[inference dressed as measurement](../_laws.md#inference-must-look-like-inference)
in reverse — a non-measurement dressed as a measurement — and each is caught by
the same discipline: type the refusal, and forbid the aggregator from summing
across types.

Where a refusal has an adverse consequence for a person, it resolves toward
them: [uncertainty resolves toward the candidate](../_laws.md#uncertainty-resolves-toward-the-candidate).
A gate that cannot evaluate does not reject; it holds.

## Gate every cell, not only the headline

A headline computed over two hundred candidates passes its minimum. The
breakdown underneath it — by department, by source, by seniority, by month —
splits those two hundred into cells of eight, four, one and zero, and every one
of those cells is rendered in the same grammar as the headline that earned its
way there. The reader's eye goes to the extremes, and the extremes are exactly
the cells with one observation.

Gating must therefore be applied at the level at which the claim is *read*, not
the level at which it is computed. Each series point, each segment row, each
group in a comparison carries its own basis and its own state. A dashboard that
gates the top-line figure and lets the drill-down render freely has moved the
dishonesty one click deeper, where it is harder to notice and more likely to be
believed — because a reader who saw the headline flagged as measured has already
extended trust to the page.

The corollary for time series: a per-period figure needs a per-period minimum.
Weekly cells for a hiring team almost never clear one, which is a finding about
the granularity, not about the metric. Widen the bucket until the cells clear
their floor, or show counts rather than rates. Do not draw a line through
points that individually refuse.

## Time is a sample dimension

The last quiet failure is temporal. A rate computed on a cohort that has not
finished happening yet is not thin, it is *immature* — a lower bound that will
keep rising after publication with no change in anyone's behaviour. The
funnel-metrics discipline owns the cohort mechanics; what belongs here is that
**maturity is part of the minimum**, and it needs its own statement.

Every claim over a cohort names how long that cohort needs before its outcome
rate stabilizes — the accrual horizon — and refuses, or labels itself as
preliminary, until the horizon has passed. The horizon is derived from the
process it measures: an offer-acceptance rate matures in days, an
application-to-hire rate in a median cycle time, a quality-of-hire or early
attrition signal in months. Stating it also gives the honest answer to the
question that thin data always provokes — *when will this be reliable?* — which
converts a refusal from a dead end into a plan, and is the difference between a
team that trusts the instrument and a team that routes around it.

## Failure modes of the naive reading

- **The percentage on two.** A rate rendered at full precision over a
  denominator small enough to enumerate. The decimal point is the tell: it
  claims a resolution the sample cannot carry.
- **The zero that means unknown.** An unmeasured quantity coerced to a number,
  usually the one that ranks a person worst or clears a gate silently.
- **The shared threshold.** One constant gating six different claims, chosen
  for the first claim written and never revisited for the other five.
- **The gated headline with an open drill-down.** Honest at the top, unguarded
  everywhere the reader actually looks.
- **The skipped check counted as clean.** The compliance failure, and the only
  one on this list that can end up in front of a regulator.
- **The lowered floor.** A minimum reduced because a customer's data did not
  clear it. The floor exists precisely for that customer; moving it converts an
  honest refusal into a dishonest number and takes the standard down with it.
- **The permanent refusal.** A metric that refuses correctly but never says
  what would change it, so the team concludes the analytics are broken rather
  than that the sample is young.

## Seams with neighbouring disciplines

What a metric counts, on which cohort basis, over which window, belongs to the
funnel-metrics discipline; this subject takes those definitions as given and
decides only whether the resulting figure may be claimed. How a state is
coloured, worded, ordered and laid out — and the rule that no colour or verdict
exists without a target someone actually set — belongs to the
honest-presentation discipline: it renders the three states this subject
decides. Whether a score predicts anything, and the coupling that stops a
predictor grading its own labels, belongs to score calibration; the minimum
number of resolved outcomes before a curve may be drawn is stated here and
consumed there. The fairness test itself — which ratio, which groups, which
regulatory reading — belongs to adverse-impact analysis; what this subject
contributes is that its "too small to assess" is a verdict of its own. Floors
for comparing candidates against one another belong to comparative shortlist
evaluation, and the important lesson from that seam is that a comparison floor
and a statistical floor are different numbers answering different questions and
must not be unified. Telemetry volume, sampling of traces and instrumentation
cost are an observability concern and are governed there.
