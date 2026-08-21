---
layer: golden-path
type: golden-path
subject: presenting-a-score-to-a-recruiter
status: forged
use_when: [rendering a match score on a candidate screen, a total and its breakdown disagree, deciding what to show when scoring did not run, letting a recruiter re-weight a score]
techniques:
  - one-canonical-score-with-provenance
  - component-sum-is-authoritative
  - score-bands-locked-across-surfaces
  - absent-score-is-its-own-tier
  - surface-the-assumptions-behind-the-number
  - knockout-reason-categorised-at-birth
---

# Presenting a score to a recruiter

A match score is not an output. It is a **decision surface**: the place where
everything the system inferred about one person collapses into a figure a
human will act on within about four seconds. Parsing, normalization, rubric
design and weighting are all invisible at that moment. Whatever the model
computed, what the recruiter *decides* is a function of what the screen said.

This makes presentation a fairness concern, not a design concern. A number
about a person carries an obligation that a number about a server does not:
the person it describes may be advanced or rejected on it, may never see it,
and cannot correct it. The presentation layer is the only place left where
that number can be made **challengeable** — where a recruiter can look at it
and form a justified opinion about whether to believe it.

Four obligations follow, and they are the whole subject:

1. **One authoritative number.** For a given person against a given role,
   exactly one figure is *the* score, and it is reachable by exactly one path.
2. **Verifiable by eye.** The total must equal what a viewer gets by adding up
   the parts shown beside it. Not approximately. Exactly.
3. **Assumptions on the surface.** Every gap the scorer filled in to produce
   the number is visible next to the number, in the recruiter's line of sight.
4. **No number where none is warranted.** Absence of a score is a state that
   renders as itself, and a categorical disqualification is not a low score.

Everything below is those four obligations under pressure.

## What a score is, and the three neighbouring things it is not

A score is a **compression of one rubric applied to one person's evidence
against one role**. That sentence has four bindings, and a rendered score that
drops any of them is a floating number: the rubric (and its version), the
evidence set it read, the person, the role. A score shown without them cannot
be defended, re-derived, or superseded — only believed or disbelieved.

It is *not* a probability of success in the job. Nothing in a screening
pipeline measures that, and every UI affordance that implies it (a percentage
sign, a "confidence" caption, a gauge that fills toward "certain") is
borrowing authority the measurement does not have.

It is *not a rank*. A score is an absolute reading about one person;
comparison across candidates has its own rules — tie handling at cutoffs,
cohort composition, what a shortlist may claim — and those belong to
comparative shortlist evaluation, not here. The seam is sharp: this subject
governs what one person's card says; the moment two cards are placed side by
side and one is called better, you have crossed into that neighbour.

It is *not a label*. Whether a component reading is a measurement, an
inference, or a refusal to answer — and what grammar each is allowed to
render in — is owned by inference labelling and refusal. This subject assumes
that grammar exists and consumes it; it does not restate it. Likewise,
aggregate analytics over many scores — distributions, funnel rates, cohort
comparisons — belong to honest measurement presentation. **This subject owns
one person's number on one screen.**

## Failure mode: the number that is not the number

The most common defect is not a wrong score; it is *three* scores. Real
pipelines mint a candidate's fit figure in more than one place: a cheap
heuristic at intake so a list can sort immediately, a full rubric run when the
deep analysis completes, a recomputation when a recruiter adjusts weights,
sometimes a figure imported with the record from elsewhere. Each lands in its
own field. Each surface then picks whichever field it happened to know about.

The result is a candidate who reads 82 on the pipeline board, 74 on their
profile, and 79 in the exported report — and no one can say which is wrong,
because none of them is. They are three honest answers to three different
questions that were never distinguished at the point of display.

The fix is not to delete producers; multiple producers are legitimate and
often necessary. The fix is a **single reconciliation point** with a declared
precedence order, one accessor every surface must go through, and provenance
travelling with the number: which producer, which rubric version, when, and
whether the run was degraded.

The harder half of the fix is deciding what does *not* enter the
reconciliation. Some of those competing figures are not rival answers to the
same question — a fit check recomputed at offer-drafting time to price a
salary is a different concept from the screening score, and folding it into
the canonical value destroys both. The rule is: **reconcile rival answers,
label different questions.** A number that answers a different question gets
its own caption and its own place on the card, never the bare word "match".
See one-canonical-score-with-provenance.

## Failure mode: the total that does not add up

A recruiter shown a headline figure above a set of labelled bars does
arithmetic. Not deliberately — visually, and fast. If the bars read roughly
20, 18, 22 and 14, the eye lands near 74, and a headline reading 82 is not
perceived as a rounding artifact. It is perceived as **two different stories
with no signal which is right**, and the trust cost is not local to that
screen. Once a recruiter has caught the report contradicting itself once, they
discount every figure it shows thereafter, including the correct ones.

The discipline is to make the invariant definitional rather than aspirational:
**the total is the sum of its parts, because that is the figure the viewer
adds up by eye.** Where a total arrives from one path (a model's own headline
number, a cached figure) and the components from another, the paths *will*
diverge — on a bad generation, on a partial run, on a schema change. The
policy on divergence is to recompute and pin the display to the component sum,
loudly enough that someone fixes the producer. Never to render both. Never to
quietly hide the breakdown so the contradiction stops being visible: hiding
the parts does not make the total right, it only makes it unfalsifiable.

Two details decide whether that check actually runs. It must fire **on load,
once per scored record**, not on the render of whichever panel happens to show
the breakdown — an invariant that only holds when a collapsed tab is open is
not an invariant. And the breakdown should arrive **render-ready** from the
side that owns the rubric, already expressed on one scale, so the surface does
no arithmetic of its own: client-side recomposition is where the second,
divergent version of the total is born. See component-sum-is-authoritative.

## Failure mode: the band that moves between surfaces

Numbers are read through their bands. "78" means nothing to a recruiter until
the interface says *strong*, colours it, and places it against a legend. Bands
are therefore load-bearing, and they are the single most duplicated thing in a
scoring UI: a cutoff table in the card component, another in the report
renderer, another in the analysis pipeline that writes the summary sentence,
another in the export.

They drift. Someone tunes one, ships, and now a candidate reads *mid* on the
board and *weak* in the emailed report. To the recruiter this is not a styling
bug; it is the system disagreeing with itself about a person.

Four rules make bands survive: one table is the source for every consumer
(colour, legend, histogram floors, prose adjective, export); cutoffs are
**locale-independent** while labels are localized, so translating an interface
cannot move a threshold; and where a second runtime genuinely cannot import
the first's table, the mirror is asserted by a test that fails when they
diverge, not maintained by intention. And every *filter floor* the interface offers is
derived from a band boundary rather than chosen by feel: a "show me at least
70" control on a scale whose strong band starts at 72 keeps rows the grid
renders as not-strong, so the filter and the colours disagree in front of the
recruiter. The band vocabulary is also **closed** — five or so tiers, named
once — because an open vocabulary is a label, and meaning does not live in a
label. See score-bands-locked-across-surfaces.

## Failure mode: zero standing in for nothing

When scoring has not run, failed, timed out, or been refused, the record holds
no score. The path of least resistance is a numeric default, and every numeric
default lies in a specific direction. Zero ranks an unmeasured person *worst*
and, in any pipeline with a floor, auto-rejects them on a number nobody
computed. A neutral 50 is worse in a subtler way: it is indistinguishable from
a measured 50, so the unmeasured person is silently laundered into the
measured population.

Absence is a **tier**, not a value: its own visual treatment, its own sort
position (grouped, never interleaved by an imputed value), excluded from every
denominator and average, and — critically — ineligible for automated adverse
routing. A blocked candidate is not a bad candidate. The same rule reaches
inside the breakdown: a competency the assessment never reached is a null
cell, not a zero bar, and a row of null cells must not average to a low score.
See absent-score-is-its-own-tier.

Two adjacent unit hazards belong to the same instinct. First, a fraction and a
percentage are different domains: a confidence emitted as 85 where 0.85 was
expected renders as a wildly wrong figure on a hiring screen with nothing to
signal it is wrong, so any formatter that accepts both must guard the domain
and refuse rather than guess. Second, an axis that autoscales to the data
flatters twice over. Where components have different ceilings, raw values are
not comparable across bars at all, so each is drawn as a fraction of its own
ceiling; and where the axis is left to autoscale, a weak candidate's tallest
component fills the frame and reads as *maxed out*, while the axis floats
per candidate so no two cards can be compared by eye. Pin the axis, normalize
against fixed ceilings that sum to the whole, and carry the raw value and its
ceiling into the tooltip so normalizing never hides the true figure.

## Failure mode: the assumption nobody saw

Any scorer working from real candidate evidence imputes. Seniority inferred
from dates; a degree assumed equivalent; a tenure gap read as continuous
employment; a skill credited from an adjacent one. These imputations are the
difference between a 60 and an 80, and they are exactly what a recruiter is
qualified to overrule — *if they can see them*.

So imputations are captured at the moment they are made, typed (what was
missing, what was assumed in its place, which way it moved the score), and
rendered beside the number rather than buried in an appendix. The phrasing
matters as much as the presence: an assumption is stated as **absence of
evidence, not a fail**. "No public repository was found" invites a recruiter
to reject; "we could not observe code artifacts, so this dimension rests on
the résumé alone" invites them to ask. The first sentence is a claim about the
candidate that no one made.

The same channel carries the assumptions that cut the *other* way — a skill
observed live rather than self-reported, a gate skipped rather than failed —
so it reads as the basis of the number rather than as a list of strikes. And
where the evidence is thin, the honest render is not a point but an
**interval**: a score band with the human reasons for its width named beside
it ("three skills on file, so this reading is wide"). A recruiter who is told
why a number is uncertain treats it correctly; a recruiter given a bare point
estimate cannot. See surface-the-assumptions-behind-the-number.

The strongest form of this obligation is a **re-weighting surface**: let the
recruiter move the dimension weights and watch the score move. It converts a
verdict into a model they can interrogate — and it demonstrates, better than
any caption, that the number is a choice about priorities rather than a
measurement of worth. Its rules are unforgiving, because a control that lies
is worse than no control: weights renormalize server-side to a fixed total and
the sliders re-anchor to the **renormalized** vector rather than to where the
recruiter's finger stopped, or every drag will drift; the dirty comparison
that decides whether "reset" is offered is done in whole displayed units, or a
floating-point residue leaves the control permanently claiming unsaved
changes; the sliders are **bounded** per dimension rather than free, so no one
can zero out a dimension the role genuinely requires and call the result a
match; and the re-weighted figure is a *view*, provenanced as such, never
overwriting the canonical score.

## Failure mode: the knockout re-derived from prose

A categorical disqualification — no work authorization, a licence the role
legally requires, a location constraint the role cannot accommodate — is not a
low score. It is a different kind of object, and expressing it *as* a low
score is a category error with two victims: the recruiter, who sees a 31 and
assumes weak rather than ineligible, and the candidate, who is ranked against
people they were never in competition with.

The recurring implementation defect is to let the scorer write the knockout as
a sentence and re-derive its category later by matching keywords in that
sentence. That derivation runs on prose that a model wrote, in one language,
in one phrasing, and it breaks silently on the next generation. Categorise at
birth: the producer emits a category from a closed vocabulary alongside its
human sentence, and every downstream consumer reads the category. Prose is for
the reader; the category is for the machine.

One further rule keeps knockouts honest: **a gate may only rest on a
requirement the role actually asserted.** Requisition intake fills blanks with
policy defaults — a work mode, a location norm, a seniority floor nobody typed
— and a default is a phantom the role never stated. Phantoms may inform
ranking; they may never bar a person. Where the candidate's side is the
unknown one, the gate is *skipped*, not failed. See
knockout-reason-categorised-at-birth.

## What a rendered score may never do on its own

Two limits sit above all the craft above.

**A score never executes an adverse outcome.** It may rank, sort, surface,
flag and recommend. The advance, the hold and the rejection are a person's,
and the surface must be built so that the person is making a decision rather
than confirming one — which means the challengeable material (assumptions,
component breakdown, absent tiers, knockout category) is present *at the
moment of the click*, not one navigation away.

**A degraded run is presented as degraded, never frozen as authoritative.**
When the scoring path falls back — a model unavailable, a partial evidence
set, a truncated document — the process continues, and the provenance is
truthfully downgraded on the surface. The failure to avoid is the one where a
fallback figure is written into the canonical field with full-confidence
styling and outlives the outage that produced it.

## The shape of a defensible score card

Pulled together, a card a principal practitioner would sign off on shows: one
figure, sourced from one accessor, stamped with its rubric version and its
producer, and carrying an interval where the evidence is thin; a component
breakdown whose contributions sum to that figure exactly and whose axes are
pinned to real ceilings; a band label drawn from the single band table and
matching every other surface; assumptions and unmeasured
dimensions displayed as their own states rather than as values; a knockout,
where one exists, shown as a category above the number rather than expressed
through it; and a weighting control that is honest about being a view.

None of this makes the underlying score better. It makes it **arguable** —
and an arguable score is the only kind a human is genuinely deciding with.
