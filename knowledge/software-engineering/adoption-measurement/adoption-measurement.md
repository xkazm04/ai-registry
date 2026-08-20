---
layer: golden-path
type: golden-path
subject: adoption-measurement
status: forged
use_when: [reporting whether a practice or standard has been taken up, building an enablement or rollout dashboard, a seat count or install count is about to be called adoption, pairing before-and-after evidence around a rollout]
techniques:
  - attribution-provenance-tiers
  - adoption-distribution-bands
  - dormancy-verdicts
  - before-after-outcome-pairing
  - mentor-learner-pairing
  - adoption-vs-outcome-separation
---

# Adoption measurement

Adoption measurement answers a question that funds programs and ends them:
**has this practice, tool or standard actually been taken up by the teams it
was meant for — and by how many of them, how deeply, and still?** It is the
instrument behind every enablement program, every internal platform's
justification, every "we rolled out the new review standard" claim that
someone will eventually be asked to prove.

It is also the measurement discipline most reliably corrupted by its own
audience. The number has a sponsor. Somebody paid for the rollout, staffed
the enablement, and stood up in a review to say it was working; that person
is usually also the person who commissions the dashboard. Nowhere else in
engineering measurement is the reader's preferred answer so obvious in
advance, and nowhere else is the raw material so easy to bend toward it —
because almost every convenient adoption signal is a proxy standing at some
distance from the behaviour anyone cares about, and every one of those
distances shortens the number's honesty without changing how it renders.

Two properties define the discipline.

- **You are measuring other people's behaviour, not your own product's.**
  Instrumenting the surfaces of a product you build and ship is the
  [usage-analytics](../usage-analytics/usage-analytics.md) subject: you own
  the code, you place the events, and the subject of measurement is the
  product. Here the subject is *another team's working practice*, observed
  mostly at second hand through artifacts they produced for other reasons —
  a commit, a template instantiation, a download, a checklist filled in. You
  did not place those signals; you inherited them, and half of them mean
  something adjacent to what you want them to mean. That gap is the entire
  honesty burden of this subject, and it does not exist in product
  telemetry.
- **Adoption is never evidence of benefit.** The number says a practice
  spread. It says nothing about whether spreading it helped. Every serious
  failure of this discipline is the same move made with different arithmetic:
  a true uptake number laundered into a causal claim about delivery, quality
  or cost. Keeping the two ledgers separate is not editorial caution — it is
  the structural rule that lets the adoption number stay honest, because a
  number that is never asked to prove value is never under pressure to
  inflate.

## Every signal carries the story of how it was obtained

Adoption signals arrive in tiers of fidelity, and the tiers are not
interchangeable. At the top sits an **observed act**: a specific actor
did a specific thing to a specific artifact at a known time, recorded
because it happened. Below that sits an **allocation**: a real aggregate
divided among candidates by a rule — a team-level total spread over its
members, an organization-wide contract apportioned by headcount. Below that
sits a **declaration**: a roster, a seat assignment, an install, a survey
answer. All three render as a number with the same font.

The rule is that the tier travels with the number, at every hop, into every
report — the same discipline the wider corpus states as
`count-carries-predicate`, applied to the one domain where the predicate is
most often the whole finding. A team is not "80% adopted"; it is "80%
adopted, allocated from a contract-level total, no per-person act observed".
The second sentence changes the decision the reader makes and the first one
hides it.

There is a fourth tier, and the correct treatment of it is the sharpest rule
in this subject: **a tier that fabricates plausible numbers has no honest
form and must be removed, not degraded**. When a signal source cannot be
obtained, the tempting design is to keep the pipeline shape and fill it with
an estimate — a modelled figure, a default rate, an industry benchmark
apportioned to your population. Such a value is worse than the missing one
in the exact way that matters: it is indistinguishable from measurement, it
survives every downstream hop, and no consumer can tell it apart later.
Hiding it behind a caveat, a lock icon, or a greyed-out state does not
help — those are presentation, and the value is still in the pipe for
anything that reads the data rather than the screen. Delete the tier. Show
the gap. The grading scheme, the propagation rules, and the deletion
doctrine are [attribution-provenance-tiers](techniques/attribution-provenance-tiers.md).

## Adoption has a shape, and the mean destroys it

"Sixty per cent adopted" is the least useful true sentence in the discipline,
because at least three organizations produce it and they need opposite
interventions. One has most teams using the practice lightly. One has a third
of teams using it constantly and the rest not at all. One has a single
enthusiast team whose volume drags the average up over a flat field. The
first needs depth; the second needs spread; the third needs to stop
celebrating.

So the reported unit is a **distribution over bands**, not a rate: how many
of the eligible population sit in each of untouched / tried / routine /
embedded, plus where the mass concentrates. Two orthogonal readings come out
of that shape — *spread* (what fraction of the eligible population has
crossed the first threshold at all) and *depth* (how far the ones who
crossed it have gone) — and confusing them is how enablement programs spend
a year pushing the wrong lever. The denominator is a design decision, not a
lookup: eligibility must be defined and stated, because a practice that
applies to eleven of ninety teams is at 100% when nine of eleven adopt it,
not 10%. Band cutoffs, eligibility, and the shape readings are
[adoption-distribution-bands](techniques/adoption-distribution-bands.md).

## Not every recorded touch is a use

The most common silent inflation is machine activity counted as human
adoption. Environments synchronize. Caches warm. A scheduled job pulls the
whole catalogue nightly so it can be searched offline. A template is
materialized into a scaffold nobody opened. Every one of those writes a
record that looks exactly like a person deciding to use the thing, and a
counter that does not distinguish them will report a practice as thriving in
an organization where no human has touched it since the launch demo.

The standard is a stated definition of a real use — deliberate, actor-
attributed, distinct from any background or automated pathway — enforced at
the point of recording rather than filtered later at report time, and a
**dormancy verdict** that is a first-class named state rather than the
absence of recent rows. Dormancy also needs an age guard: a thing published
last week has no usage history, and "never used" and "used and abandoned"
are different findings that must not share a label — the corpus's
`failure-not-empty-success` law in its measurement form. The most expensive
version of this failure is two counters that measure disjoint activity
feeding one screen, so an artifact can display a healthy total alongside a
dormant verdict and be internally correct in both halves; that is a
vocabulary defect, not a display bug. Verdict states, the guard, and the
single-definition rule are [dormancy-verdicts](techniques/dormancy-verdicts.md).

## Before and after are a pair or they are nothing

The one place adoption measurement is allowed to reach toward outcomes is a
**paired observation around an adoption instant**: the same subject, the
same instrument, one reading before uptake and one after. The pairing is
what gives the comparison any meaning at all, and the pairing is exactly
what is usually missing — the practice was adopted before anyone thought to
measure, or it was adopted last Tuesday and nothing has been re-measured
yet.

The rule that follows is absolute and worth stating in its own sentence:
**when one half of a pair is missing, say so in a named status; never
substitute a plausible value for it.** No back-filling a "before" from a
cohort average, no imputing an "after" from a trend, no quietly comparing
against the population mean and calling it a delta. A library of paired
findings where some pairs are invented is not a slightly degraded library —
it is a generator of confident falsehoods, and the invented pairs are the
ones that will be quoted, because they are the ones that show movement.

And when a pair *is* complete and the delta *is* real, it is still
correlation. Adopters self-select; the teams that pick up a new practice
first are systematically the teams already inclined to improve, already
better resourced, already measured on a good week. A within-subject
before/after pairing removes some of that and nothing removes all of it.
Pair statuses, the instrument-identity requirement, and the honest phrasing
of a delta are [before-after-outcome-pairing](techniques/before-after-outcome-pairing.md).

## The distribution is useful because it points at people who can help

An adoption distribution's highest-value output is not the headline rate; it
is the fact that it locates, in the same population, teams that have gone
deep and teams that have not started. That is an enablement pairing — a
mentor and a learner, matched on the same practice — and it is the one
action an adoption number can justify with no causal claim attached, because
it proposes a conversation rather than asserting an effect.

It is also the moment this subject touches identifiable humans, and it
therefore has one hard boundary: **every rule about whether a person may be
named, ranked, or shown to a manager belongs to
[people-analytics-ethics](../people-analytics-ethics/people-analytics-ethics.md)
and is not restated here.** That subject owns the population floors, the
framing test, the producer-side suppression, and the split between a
person's own view and their organization's view of them; this subject
defers to it wholly and treats its verdicts as preconditions. What belongs
here is only the matching logic itself — eligibility on both sides, and a
minimum competence gap below which a pairing is noise dressed as advice.
That logic is [mentor-learner-pairing](techniques/mentor-learner-pairing.md).

## Two ledgers, one wall

The final discipline is the one the whole subject exists to protect. Adoption
metrics and outcome metrics are computed, stored, reported and *governed*
separately, and no automated path converts one into the other. The pressure
against this is constant and comes from good people: the program is real, the
uptake is real, the delivery numbers did move, and joining them into one
sentence is the difference between a renewed budget and a cancelled one.

The rules are structural. Adoption never enters an outcome composite as a
dimension — a scoring instrument that mixes them produces a number that goes
up when a practice spreads whether or not anything improved, which is the
definition of a metric that can be gamed by the party being measured. Outcome
deltas are reported beside adoption, never as a function of it. And any
sentence of the form "adoption of X drove Y" is a claim requiring a design
this instrument does not have — a comparison group, a pre-registered
question, protection against the confound that adopters were already ahead.
Where the corpus needs a rate to feed a gate, the gate reads the adoption
ledger for uptake questions only. The separation rules, the phrasings that
survive review, and the escalation path when someone genuinely needs a causal
answer are [adoption-vs-outcome-separation](techniques/adoption-vs-outcome-separation.md).

## Where this subject ends

The library the practices themselves live in — how a practice is proposed,
curated, versioned, and made discoverable — is the
[knowledge-registry](../knowledge-registry/knowledge-registry.md) subject.
This subject reads that library's contents as a population of things to be
adopted and reports on the reading; it does not own the writing. The general
honesty rules for any computed number — sample floors, noise bands,
unmeasurable-versus-zero — are
[measurement-honesty](../measurement-honesty/measurement-honesty.md), and are
assumed rather than repeated here.

## The failure modes of the naive reading

- **Seats as adoption.** A licence assigned is a purchase, not a behaviour.
  Utilisation audits routinely find a large minority of paid seats with no
  activity at all, so a seat-derived rate is an upper bound on a population
  that may be a fraction of it — and it must be labelled as the declared-tier
  signal it is.
- **Activation theatre.** Counting the first touch and never the second. A
  cohort that all tried the practice once during the launch week and never
  returned produces an excellent adoption chart and no adoption.
- **Self-report as fact.** Survey answers about one's own use are a
  legitimate signal about *perception*, and a poor one about *behaviour*;
  they belong in the declared tier and must never be merged into observed
  counts.
- **The moving denominator.** Recomputing eligibility each period so the
  rate rises when the population shrinks. State the denominator, version it,
  and show it beside the rate.
- **Adoption as a target.** The moment uptake becomes the number someone is
  graded on, the cheapest path to it is a mandate, and mandated use produces
  exactly the recorded events the instrument counts and none of the practice
  it was proxying for.

## The techniques

- [attribution-provenance-tiers](techniques/attribution-provenance-tiers.md) —
  grading each adoption signal as observed, allocated or declared; carrying
  the tier with the number; deleting a fabricating tier rather than hiding it.
- [adoption-distribution-bands](techniques/adoption-distribution-bands.md) —
  reporting a banded distribution over a stated eligible population, and
  reading spread against depth instead of a mean.
- [dormancy-verdicts](techniques/dormancy-verdicts.md) — one definition of a
  real use, background activity excluded at the source, dormancy as a named
  state with an age guard.
- [before-after-outcome-pairing](techniques/before-after-outcome-pairing.md) —
  paired readings around an adoption instant, named statuses for a missing
  half, and never inventing the other side.
- [mentor-learner-pairing](techniques/mentor-learner-pairing.md) — turning a
  distribution into enablement matches, with eligibility on both sides and a
  minimum gap, under the people-ethics subject's floors.
- [adoption-vs-outcome-separation](techniques/adoption-vs-outcome-separation.md)
  — two ledgers with no automated bridge, and the rules for what may be said
  when both are on the same page.
