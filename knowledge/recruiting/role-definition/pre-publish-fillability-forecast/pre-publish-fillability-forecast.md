---
layer: golden-path
type: golden-path
subject: pre-publish-fillability-forecast
status: forged
use_when: [a requisition is drafted but not yet published, a recruiter asks whether a role will attract anyone, a published role has produced an empty pipeline and nobody knows which requirement caused it, deciding which single requirement to relax before sourcing starts]
techniques:
  - counterfactual-gate-loosening
  - must-have-demotion-delta
  - eligible-versus-qualified-distinction
  - reuse-the-production-scorer-not-a-model-of-it
  - pay-versus-market-verdict-with-a-currency-guard
  - staged-suggestion-never-auto-applied
---

# Pre-publish fillability forecast

A requisition fails silently. Nobody rejects it, nothing errors, no gate
refuses it — it publishes cleanly, and then for three weeks the pipeline is
empty. The recruiter learns the role was unfillable from the absence of
applicants, which is the slowest and least informative signal the process can
produce: it arrives a month late, it says nothing about *which* of the eleven
stated requirements emptied the funnel, and by then the sourcing spend, the
advertising placement and the hiring manager's expectations have all been
committed against a role that never had candidates.

This subject is the discipline of moving that discovery **before publication**
and giving it **attribution**. The forecast answers two questions, in this
order: against the pool you can actually reach, how many people does this
requisition currently admit — and if that number is too small, which single
requirement is responsible for the largest share of the shortfall. The second
question is the one that matters. "Zero matches" is a fact a recruiter can get
by waiting. "Zero matches, and removing the second-language requirement alone
would surface fourteen people who otherwise clear every bar" is a decision.

## The forecast is a claim about your pool, not about the labour market

The single most important boundary to hold: this instrument measures a
**reachable pool** — past applicants, silver medalists, sourced profiles, a
talent community, whatever the record actually holds — and not the supply of
such people in the world. A role can be genuinely fillable in the market and
score zero here because you have never sourced in that market before. The
inverse is rarer but real: a pool rich in one former employer's alumni will
overstate how ordinary a rare skill is.

So every number the forecast emits carries its base, and the language is
scoped accordingly: not "this role is unfillable" but "of the N people in your
pool, zero clear the current requirements". A forecast that drops the qualifier
gets read as market intelligence, and a recruiter who believes it will decline
a search that was always winnable through sourcing. Where the pool is too small
for a proportion to mean anything, the honest output is an explicit
insufficient-pool verdict rather than a percentage — a suppressed number reads
as good news, which is exactly the wrong reading
([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## One lever at a time, because attribution is the product

The temptation is to solve the optimisation: search the space of requirement
subsets and return the smallest set of relaxations that reaches a target pool
size. Resist it, for three reasons.

**Interpretability.** A recruiter can act on "drop this one line and fourteen
people appear". They cannot act on "relax these four things simultaneously and
the pool reaches thirty" — that is not a conversation they can have with a
hiring manager, because it does not identify a culprit to argue about.

**Deltas do not sum.** Blockers overlap. If the language gate excludes forty
people and the seniority floor excludes forty, dropping both may surface
forty-five, not eighty — most of the excluded were excluded twice. Any
presentation that invites addition is lying by arithmetic. Single-lever deltas
must be labelled as independent counterfactuals, each measured against the same
unmodified baseline, and never stacked in a running total.

**Combinatorics.** Each counterfactual is a full re-scoring pass over the pool.
Single-lever is linear in the requirement count; subsets are exponential, and
the expensive answer is also the less useful one.

The forecast therefore runs one pass per removable constraint, each starting
from the *original* requisition with exactly one thing changed, and reports
each delta against the shared baseline.

## The two levers have different denominators

This is the load-bearing technical distinction of the subject, and getting it
wrong makes every number wrong in a way nobody catches for months.

**Hard gates** — a required work authorization, a licence, a language
threshold, a location or on-site constraint, a minimum education level — are
*filters*. A person either passes or is removed from consideration entirely.
Loosening a hard gate therefore recounts **eligibility**: how many people are
admitted into scoring at all. A positive delta here has a precise meaning that
recruiters intuitively want and rarely get — that gate was the *sole* blocker
for exactly that many people, all of whom would otherwise have reached the
scoring stage.

**Must-have skills** are not gates. They cap the score: missing one costs a
candidate points, it does not evict them. Demoting a must-have to a
nice-to-have therefore cannot change eligibility at all — the same people are
in the pool before and after — and so it must be measured against the
**qualified** count instead: how many people clear the score threshold that
would put them in front of a recruiter.

Compute either delta over the other's denominator and you produce plausible,
stable, wrong numbers: gate loosenings that appear to do nothing (because the
score barely moves), and skill demotions that appear to do nothing (because
eligibility is invariant to them). The techniques
`eligible-versus-qualified-distinction`, `counterfactual-gate-loosening` and
`must-have-demotion-delta` carry the procedure; the golden-path rule is simply
that **each lever names its denominator in the output**, so the recruiter
reading "+14" knows whether those fourteen are people who can now be
*considered* or people who can now be *recommended*.

A third rule follows from this: when a counterfactual changes the comparable
base — a loosening that also shrinks the population over which a rate is
computed, or a lever that only applies to the subset of the pool that has the
relevant field recorded — the disclosure must state the reduced base. Reporting
a rate over a silently different denominator is the way a forecast becomes
indefensible, and the fix is one sentence of prose next to the number, not a
footnote. The same applies to candidates the scoring pass could not read at
all: a malformed or half-extracted profile is *skipped and recorded*, never
silently dropped, and the count of skips travels with the forecast. A pool of
two hundred that yielded a hundred and eighty scores is a forecast over a
hundred and eighty.

## A requirement nobody wrote is not a requirement

The subtlest way a forecast prices fiction is by counterfactualling a
constraint the requisition never asserted. Normalisation layers routinely stamp
defaults onto a parsed job — a work mode, a seniority, a location — so that
downstream code has a value to read. Those stamped values are **phantoms**: the
advertisement said nothing, and a default said something on its behalf.

Two consequences, and the first is the more serious.

A phantom must never act as a hard gate. An advertisement that stated no work
mode, defaulted to on-site, will silently exclude every remote-only candidate
from the pool *before anything is scored* — and the forecast will then report a
small pool and attribute it to whichever real gate happens to rank first. The
filter must know which fields were defaulted and treat them as absent, and the
record of which fields were defaulted has to travel with the requisition for
that to be possible.

And a phantom must never appear as a lever. "Loosen the work-mode requirement,
+22 eligible" recommends editing a line the hiring manager never wrote,
against a constraint they never imposed. The recruiter who acts on it changes
nothing real and loses trust in every other row.

## Reuse the scorer; do not model it

Everything above is only worth reading if the forecast agrees with reality. The
guarantee that it does is architectural, not statistical: **every counterfactual
re-runs the exact scoring path that publication would run**, with a mutated
copy of the requisition as its input. Not a reimplementation, not a simplified
approximation, not a model trained on past scores. The same eligibility filter,
the same weights, the same tie-breaks, the same thresholds.

The reason is that a coach built on a parallel implementation acquires a
capacity nothing else in the process has: the ability to be *confidently wrong
in a direction the recruiter cannot check*. It promises fourteen people; the
role publishes; nine appear; and the recruiter now distrusts every number the
system produces, including the ones that were right. Worse, the divergence is
invisible in testing, because both implementations were written from the same
requirements document and disagree only on the edge cases that matter — an
uncertainty default, a rounding rule, a gate that is skipped when its input is
unknown. `reuse-the-production-scorer-not-a-model-of-it` treats this as the
subject's central design decision rather than an implementation detail, and it
constrains the codebase permanently: the scorer must be callable with a
substituted requisition, which means the requisition must be a value the scorer
takes as an argument rather than something it reads from storage.

That reuse also inherits the scorer's *mercy*. A mature eligibility filter
skips gates it cannot evaluate — an unrecorded language level does not exclude,
an unknown graduation year does not exclude — because
[uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate).
The counterfactual must inherit that behaviour unchanged, and the forecast must
resist the seductive inverse: a coach that treated unknowns as failures would
report far more dramatic gate deltas and would be measuring its own record's
incompleteness rather than the requisition's strictness.

## Pay is a verdict, not a counterfactual

Compensation cannot be levered the way requirements can — you cannot re-score a
pool "with the salary removed" and learn anything, because the pool's own
expectations are mostly unrecorded. Pay enters the forecast as a **verdict**
against a market band: the role is below market when the top of its stated
range sits under the floor of the comparable band. Stating it as top-versus-
floor rather than midpoint-versus-midpoint is deliberate; it makes the verdict
conservative, and it flags only the roles where *no* candidate at market rate
could be paid what the requisition offers.

The verdict has one absolute guard. When the role's currency and the band's
currency differ and no trustworthy conversion is at hand, the verdict is
**silent — unknown, not false**. This distinction is worth stating as a rule
because the naive implementation collapses it: a boolean that defaults to
"not below market" turns an unanswerable question into a clean bill of health,
and the recruiter publishes a role that is forty percent under local market
having been told it was fine. Three states — below, not below, cannot say —
and the third renders as its own sentence
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
Where the band itself comes from, how it is grounded and what makes it
comparable is the neighbouring subject on compensation banding and market
honesty; this subject only consumes a band and renders a verdict from it.

## The output stages; it never applies

A fillability coach is a measurement instrument, and measurement instruments do
not edit the thing they measure. Every recommendation the forecast produces —
drop this gate, demote this must-have, widen this range — arrives as a **staged
suggestion**: visible, attributed to the counterfactual that produced it, and
requiring an explicit human act to enter the requisition. Nothing mutates on
the coach's own authority
([every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor)).

Two reasons, and the second is subtler than the first. The obvious one is that
deciding what a job requires is a human judgment with consequences the forecast
cannot see — an unenforced licence requirement may be a statutory obligation,
and a gate that costs fourteen candidates may be the one that keeps the hire
legal. The forecast may *diagnose* such a gate; it must never propose removing
it, and a coach that ranks purely by delta will propose exactly that unless the
non-negotiable classes are excluded from the suggestion surface.

The subtler reason is about what a suggestion can honestly carry. Some fields
in a requisition are grounded — derived from a scored pool, a computed band, a
cited source — and some are typed by a human. A staged suggestion that writes a
hand-formed number into a field whose whole credibility rests on being grounded
launders authorship: the number arrives wearing a provenance it does not have.
The rule that follows is narrow and worth keeping: **a field only gets an apply
affordance when the suggestion's provenance matches the field's claim**. Where
they differ — the classic case being a compensation range, where the band is
grounded in market data but any specific number a recruiter would enter is not
— the coach shows the verdict and the evidence and stops there, deliberately
offering no one-click apply. That is not a missing feature. It is the feature.

## Where this subject ends

Three seams are worth naming, because each neighbour is a full discipline and
re-teaching it here would produce two half-versions.

The human discipline of **deciding what is genuinely required** — the outcome
filter, the must-have cap, the audit of degree and tenure lines, the refusal to
promote a tool nobody asked for — belongs to requirement-inflation-control.
This subject is its measurement counterpart: inflation control tells a hiring
manager that a requirement is unjustified; the forecast tells them what that
requirement costs. They are strongest together and neither substitutes for the
other, because a cheap unjustified requirement should still be removed and an
expensive justified one should still be kept.

**Where the market band comes from** — its comparability, its sample, its
sources, the honesty rules around publishing it — belongs to the compensation
banding subject. The forecast consumes a band and renders one verdict.

**Mining an existing pool for a role** is also the work of silver-medalist
rediscovery, but the direction is reversed and the difference matters: that
subject starts from a new opening and searches the pool for people worth
re-contacting; this one starts from an unpublished requisition and asks the
pool what the requisition is costing. The same scoring machinery serves both;
the question, the audience and the artefact differ.

## Failure modes of the naive reading

- **Reporting the count without the culprit.** "Three matches" is the symptom.
  Without per-requirement attribution the recruiter's only move is to relax
  everything at once, which is how a serious role becomes a generic one.
- **A parallel scorer.** Covered above; the most expensive mistake available
  here, and the one that is cheapest to make on day one.
- **Stacked deltas.** Presenting independent counterfactuals in a list invites
  mental addition. Say what they are.
- **Market language over a pool measurement.** The forecast's confidence is
  bounded by the pool's coverage and must say so.
- **A silent pay verdict.** Two-state booleans over three-state questions.
- **Auto-application.** A coach that rewrites requisitions is no longer an
  advisor; it is an unaccountable author of hiring criteria, and the first time
  it removes a statutory gate for a good-looking delta, the whole instrument is
  withdrawn.
- **Forecasting a role nobody would run this on.** The instrument only pays for
  itself before publication. Run it after, and it competes with the actual
  pipeline for the recruiter's attention while telling them something the
  pipeline already proved.
