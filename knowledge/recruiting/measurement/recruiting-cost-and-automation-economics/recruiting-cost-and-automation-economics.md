---
layer: golden-path
type: golden-path
subject: recruiting-cost-and-automation-economics
status: forged
use_when: [computing cost per hire, publishing an hours-saved or time-saved claim, building an automation ROI surface, defending a money figure to a finance team, deciding whether a cost metric may ship at all]
techniques:
  - per-action-manual-minute-estimates
  - an-organisation-owned-manual-baseline
  - date-every-derived-money-figure
  - never-sum-two-currencies
  - an-uncapped-ratio-as-a-denominator-alarm
  - a-human-click-is-not-saved-labour
---

# Recruiting cost and automation economics

There are two money questions in hiring and they are almost never asked
apart. **What did this hire cost?** is an accounting question with a
defensible answer that nobody enjoys assembling. **Did the automation pay for
itself?** is a counterfactual question with no defensible answer at all
unless someone deliberately constructs one, in the open, and signs their name
to it. Most products answer the second by quietly borrowing the confidence of
the first, and the result is a dashboard whose money figures are indefensible
in exactly the meeting they were built for.

This subject owns the hiring economics: what a hire costs, whether the
tooling that supported it earned its keep, and the honesty rules that a claim
about either must survive. It does not own the metering underneath. Counting
tokens, keeping a price book, attributing inference spend to a request, and
converting model usage into a currency amount are the general practice of a
neighbouring discipline — model-spend observability — and this subject
consumes its output as an input. Where those two meet, the seam is clean: the
observability side answers *what did this computation cost*; this side
answers *what may be said about that number in front of a hiring team*.

## Every cost figure lives on a confidence ladder

The single most useful thing a practitioner can do to a cost surface is sort
its inputs by how they were obtained. Four rungs, in descending order:

1. **Invoiced.** An agency fee, an assessment licence, a background-check
   charge, a job-advertising spend. A number somebody paid, with a date and a
   currency printed on it.
2. **Metered.** Computation consumed and priced against a rate card. Precise
   to more decimal places than it deserves, and precise only in the sense
   that the arithmetic is reproducible — the *attribution* of that
   computation to a hire is a modelling choice, not a measurement. A metered
   total also has a failure mode of its own: rows the price book did not
   cover contribute nothing, so a partially-priced ledger sums to a small,
   confident number and an unpriced ledger sums to zero. **Zero cost and no
   price are different facts**, and a metered figure that cannot report how
   many of its rows were unpriced is not reportable at all.
3. **Derived.** Anything divided: cost per hire, cost per application, cost
   per interview. Inherits every weakness of its numerator and every
   ambiguity of its denominator, and adds one of its own — the two are almost
   never on the same clock.
4. **Assumed.** Recruiter hours per hire, minutes per screening action, the
   loaded hourly rate those minutes are valued at. These are estimates, and
   the estimate does not become a measurement by being multiplied by
   something precise.

The failure mode is not that rung four exists. It is that rung four gets
rendered in the same typeface as rung one. An hours-saved figure printed as
`47.3` reads, to every human eye, as a measurement — because a decimal point
is a claim about resolution. It was in fact one hundred and forty-two
recorded actions multiplied by a twenty-minute guess, and the guess was made
once, by one person, and never revisited. **An assumption wearing a decimal
point is the characteristic dishonesty of this subject.**

## Cost per hire is a denominator problem

The canonical formula — internal costs plus external costs, divided by hires
in the period — is arithmetically trivial and operationally a minefield, and
every landmine is in the denominator.

- **The clocks do not match.** Spend accrues when it is incurred; a hire
  lands when someone signs. A quarter with heavy advertising and no
  completions divides a large numerator by a small denominator and reports a
  catastrophic cost per hire that describes nothing except the shape of the
  calendar. Either cohort the spend to the hires it produced, or state
  plainly that the figure is a period ratio and not a per-hire cost.
- **A windowed denominator under an unwindowed numerator is not an
  approximation.** Where spend is stored as one lifetime figure and the view
  is a rolling window, the ratio inflates by roughly the ratio of lifetime to
  window — worst for the longest-standing customers, who are the ones most
  likely to quote it. The correct handling is to withhold the figure in
  windowed views until spend is recorded per period, not to shrink the
  numerator by a guess.
- **The numerator and denominator must be scoped to the same population.**
  A cost meter that cannot be attributed to a single team, divided by that
  team's hires, produces a per-hire figure that is only honest when the team
  is the whole account. Where the scope of the two halves genuinely differs,
  suppress the ratio and show the two figures with their scopes stated.
  This is the same defect as a clock mismatch, one axis over.
- **The composition changes the number more than performance does.** One
  agency-sourced executive hire can move a blended cost per hire further than
  a year of process improvement. A blended figure without a composition
  breakdown is not wrong, it is uninformative, and it will be read as a
  performance signal.
- **Zero hires is not zero cost and is not an error.** It is a division that
  must refuse. The vocabulary for refusing is a neighbouring subject's —
  small-sample honesty in hiring analytics owns the minimums and the three
  states a figure may occupy, and honest measurement presentation owns how a
  refusal renders. This subject's contribution is only to insist that a money
  metric is subject to those rules exactly like a conversion rate, and that
  finance-shaped numbers are, in practice, the ones teams most often exempt.

Which candidates count, on which cohort basis, over which window — those are
funnel-metric definitions and they belong to the funnel subject. Take them
from there rather than redefining "a hire" locally; two money figures that
disagree usually disagree about the denominator, not the money.

## Every hours-saved claim is a counterfactual

This is the load-bearing sentence of the whole subject, and it should be said
out loud in any room where such a figure is displayed.

A saving is a statement about a world that did not happen. "This saved you
nine hours" means: *had this system not acted, a person would have spent nine
hours doing the equivalent work.* Nothing in the record can confirm that. The
record holds what the system did. It does not hold what the human would have
done instead, how long they would have taken, whether they would have done it
at all, or whether they would have done something different and better.

Three claims hide inside every hours-saved number, and each can be wrong
independently:

1. **The action would have happened.** Volume created *because* it is cheap is
   not volume displaced from a human. If an assistant screens four hundred
   applications where a human team would have read the first eighty and closed
   the requisition, three hundred and twenty of those actions saved nobody
   anything.
2. **A human would have taken that long.** The per-action minute estimate. It
   is an assumption, and it is the one that carries the entire magnitude of
   the result.
3. **The human is now doing something else.** Saved time is only money if it
   was reallocated. A recruiter who saves nine hours and spends nine hours
   waiting on hiring managers has produced a capacity figure, not a cost
   saving. Present hours as hours; converting them to currency asserts the
   reallocation, and that assertion needs an owner.

The craft is not to avoid counterfactuals — a product that cannot say what it
is worth will be cancelled by someone who does not share that scruple. The
craft is to **make the assumption visible, owned and adjustable rather than
hiding it in a constant.** A number a customer can see the inputs of, argue
with, and change is a number they will defend to their own finance team. A
number that arrives whole is one they will quietly stop quoting the first
time it looks wrong.

## Refusals are the strongest part of a cost surface

Two habits separate a credible economics surface from a vendor deck.

**Exclude deliberately, and say what you excluded.** Not every automated
action displaces human labour, and a saving model that counts all of them is
inflating on purpose whether or not anyone intended it. Actions that merely
record state, that fire on a schedule, that a human never performed in the
first place, or that a human still has to check afterwards do not belong in
the numerator. A published exclusion list is the single most persuasive
artefact in this subject: it is proof that somebody tried to make the number
smaller, which is the only evidence a buyer has that nobody tried to make it
bigger.

**Refuse a metric whose denominator cannot be defended.** The instinct on a
cost surface is to ship the number you can compute and caveat it. The correct
move, more often than teams believe, is to ship nothing. A per-decision cost
that can only see one slice of the compute involved will be read as the whole
cost of that decision — the caveat does not survive the screenshot. If the
join that would make the denominator complete is missing, the metric is not
"approximate", it is *mislabelled*, and a mislabelled money figure is worse
than an absent one because it anchors every subsequent negotiation.

The same instinct governs the comparison nobody has: **a percentage
improvement versus "before" requires a before.** Almost no team has a
measured pre-tool baseline, and the industry practice of synthesising one —
from a published average, from a plausible-sounding assumption, from the
worst month on record — is precisely what has made vendor efficiency metrics
untrustworthy as a class. Where no baseline was measured, the honest output
is the absolute figure and no delta at all. Presenting an absent comparison
is the rendering subject's craft; deciding that the comparison does not exist
is this one's.

## Money figures rot, and they rot silently

A conversion rate computed last quarter is a historical fact about last
quarter. A currency amount computed last quarter is a *stale* fact about
today, and nothing in it announces the difference. Rate cards change. Agency
terms change. Advertising prices move seasonally. A blended cost figure is
only as current as its stalest input, and the blend hides which input that
is — averaging is a laundering operation for staleness.

So: date every derived money figure, at the granularity of its worst
component, and prefer a visibly old number to a freshly-computed one built on
inputs of unknown age. And never add two amounts denominated in different
currencies, whatever the intermediate representation makes possible. A sum
across currencies is not an approximation of the right answer; it is a
different quantity with no meaning, and it is the class of bug that survives
review because the arithmetic is obviously correct.

## Ratios against a baseline are instruments, not just outputs

When a saving is expressed as a share of some manual baseline, the result is
usually presented as a headline and treated as an output. It is more valuable
as an alarm. A saving that exceeds its own baseline is not a triumph, it is a
proof that the denominator is wrong — and the standard engineering reflex,
clamping the value to a maximum, destroys exactly the reading that would have
revealed it. **Do not cap a diagnostic ratio.** This generalises well beyond
hiring: any bounded-looking quantity whose bound is a modelling assumption
rather than a law should be allowed to breach, loudly, because the breach is
the only cheap signal that the model is broken.

The baseline itself must belong to the organisation using it. A published
research figure for manual hours per hire is a defensible starting point and
an indefensible ending one — it is a mid-point across industries, company
sizes and hiring mixes, and the team reading it knows their own split of
sourcing and screening hours differs from the average. Quoting the average at
them destroys the claim's credibility on first contact, and credibility on a
money claim is spent once. Ship the research figure as a labelled, cited,
editable default; treat the first customer who changes it as the feature
working.

And check that "editable" is true of the *product*, not merely of the
computation. A parameter that accepts an override no call site passes is
documentation, not configurability, and the figure is still measured against
a constant the customer cannot contest. The mirror-image defect is a stored
input that divides into a published number but appears on no screen:
uncorrectable input, permanently wrong output. **Every input to a money claim
must be reachable from the surface that publishes the claim.**

## What must never be in the numerator

Demonstration data, seeded examples, simulated rows and test workspaces are
not noise in a cost metric — they are fabricated evidence for a money claim,
and once averaged they are indistinguishable from the real thing. Exclude them
at the query, structurally, not by a flag someone remembers to pass: if the
exclusion is optional anywhere, it is absent somewhere.

Two further boundaries. Cross-organisation cost comparison — "your cost per
hire versus your peers" — carries privacy obligations that are a separate
discipline's; peer benchmarking under k-anonymity owns them, and a cost
figure is one of the easiest to re-identify from. And salary, bands and
market pay belong to compensation banding and market honesty; a hire's
compensation is not a recruiting cost, and blending them produces a number
that is neither.

## The naive reading, stated plainly

The naive reading is that this subject is arithmetic with a currency symbol on
it. The principal reading is that almost every number here is a **modelled**
number, that modelling is legitimate, and that the discipline consists
entirely of keeping the model visible at the point of use: which figures were
paid, which metered, which assumed, when each was true, in what currency, over
what denominator, and what a human still had to do afterwards. A cost surface
that can answer those six questions about every figure it prints will survive
contact with a finance team. One that cannot will be believed once.
