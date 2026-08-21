---
layer: golden-path
type: golden-path
subject: early-career-potential-assessment
status: forged
use_when: [scoring a candidate with no professional tenure, designing a graduate or internship funnel, judging a career changer whose experience is in another field, deciding what replaces years-of-experience in a match score]
techniques:
  - readiness-rubric-replacing-years
  - shipped-artifact-as-primary-evidence
  - transferable-meta-skill-credit
  - domain-distance-grading
  - symmetric-discount-across-populations
  - explainable-potential-breakdown
---

# Early-career potential assessment

Every scoring system a hiring team builds is, underneath, a machine for converting a
career into a number. Point it at someone who has not had a career yet — a final-year
student, a bootcamp graduate, a nurse retraining into data work, a parent returning
after eight years out — and the machine does one of two dishonest things. It computes
zero, because the field it reads is empty. Or a human overrides it with warmth
("enormous potential") and the candidate advances on a feeling nobody can defend when
someone else with the same profile is rejected.

This subject is the third option: **score readiness and trajectory with the same rigour
you would score tenure, using different inputs.** Not a softer bar — a differently
sourced one. The claim that makes the whole discipline work is that years of experience
were never the thing you wanted. They were a cheap proxy for depth, for reliability
under real constraints, for having seen a system survive contact with users. When the
proxy is unavailable, the correct move is not to substitute zero; it is to go and
measure the things the proxy was standing in for, directly and more expensively.

## Why the empty field is not a low score

A candidate with no employment history has an *unmeasured* tenure, not a tenure of
zero. The distinction is the whole subject. Coercing "not applicable" to a numeric
floor ranks an unmeasured person last and then, downstream, auto-rejects them on a
number nobody computed — the classic shape of
[absence of evidence treated as evidence](../../_laws.md#absence-of-evidence-is-not-evidence).
A years-of-experience dimension must therefore be *replaced* for this population, not
scored badly for it: the dimension is swapped out for a readiness rubric that has real
inputs, and the resulting score is comparable in range and meaning to the score an
experienced candidate gets on the dimension it replaced.

That last clause is the part teams skip. If the replacement tops out at 60 while the
dimension it replaces tops out at 100, you have not built a fair alternative, you have
built a ceiling, and every early-career candidate in a mixed pool loses to every
mediocre experienced one before anyone reads anything.

The same rule has a second half: **thin evidence widens the uncertainty band, it does
not lower the score.** Someone you know little about is not a weak candidate but an
imprecisely known one. Show a wide band with named reasons beside a decent midpoint. A
system that converts thin evidence into a low point estimate has decided that
not-knowing means not-good — the imputed zero again, one layer up.

## Transform the comparison, not the candidate — then generate the signal

The temptation, once you accept that early-career files score badly, is to fix the file:
rewrite the summary in senior language, inflate a course into a project. Refusing that is
the foundation. **You never rewrite a candidate's data to sound experienced; you change
what is compared and how much each piece of evidence is trusted.** Inflated data cannot
survive the interview it earned, and the inflation is invisible to the recruiter acting
on it, whereas a changed *comparison* — different dimensions, honest evidence discounts,
roles filtered to ones they can actually get — leaves a true file in a fair frame. The
slogan worth putting on the wall is *different rubric, same bar*.

Changing the comparison is only half of it. For an experienced candidate the process is
extract and verify; for someone with no record there is nothing to extract, and no
cleverness finds signal in a document that contains none. The early-career process is
**elicit and observe** — a designed work sample, a case-grounded conversation, a
walkthrough of their own project *generates* the evidence the file could never supply.
The structural consequence is the most equalizing move available: directly observed
capability should sit at the *top* of the evidence hierarchy, at or above
employment-demonstrated evidence, because a thing you watched someone do under your own
conditions is the best-grounded claim there is. Nobody can acquire history, but anyone
can be observed — and where the hierarchy offers no path to full trust that avoids
tenure, this population is capped no matter how good the rubric is. Eliciting signal
costs more per candidate than reading a document; it is worth it because cheap screening
of noise is not actually cheap. Designing the instruments belongs to the assessment
subjects; this subject owns only the claim that here, generated evidence is a primary
input rather than a confirmation step.

## The four things worth measuring instead

Readiness is not one quantity, and averaging it into a single vibe destroys the
information that makes it defensible. Four dimensions do the work, and they are
deliberately chosen so that a person with no employer can max out every one:

- **Depth** — how far into *anything* this person has gone. One subject taken to real
  difficulty predicts more than six taken to introduction, and depth is the one thing a
  short life cannot fake: going deep costs time nobody can shortcut.
- **Velocity** — accumulation relative to time *available*, never time elapsed since
  birth. Two years in with four substantial projects is movement; eight years in with
  the same four is not. This is what makes a career legible as a trajectory rather than
  a snapshot, and what keeps late starters and career changers competitive.
- **Foundation** — systematic grounding: coursework, certification, a structured
  programme, the fundamentals that make the next thing learnable. Cheapest to verify and
  weakest on its own, which is exactly why it is *one* weighted input and never a gate.
  Grade the programme's relevance, not the grades: transcript averages are noisy across
  institutions, weak as predictors, and a documented bias vector. Evidence of doing
  beats evidence of grading, and leaving grades out is a stated trade-off.
- **Initiative** — what was done when nobody assigned it: self-started projects,
  contributions, competitions, communities, teaching. The most circumstance-dependent
  dimension, since unpaid time is unequally distributed, so it carries the smallest
  weight and never functions as a threshold.

Initiative carries a guardrail that generalizes to the whole rubric: **credit what the
evidence shows, never the fact of having had access to it.** Landing an internship is
not itself a merit — access tracks family, city and network at least as much as
capability; what the internship *demonstrates* is the merit. A scheme that rewards
presence rather than substance is a privilege multiplier labelled initiative.

The weights are a published, arguable, versioned choice, not an emergent property of
whatever a model felt. Depth leads; velocity and foundation follow; initiative trails.
Anyone should be able to read them and disagree out loud — that is what makes the rubric
an instrument rather than an opinion.

## Artifacts outrank descriptions

The single most useful thing an early-career candidate can hand you is something they
made: a thesis, a working project, a portfolio, a shipped tool, a published analysis. It
outranks every self-description because it is the only item in the file produced under
real constraints and examinable rather than merely believable.

The consequence for intake design is the one most graduate funnels get backwards. The
completeness prompt should tell the candidate in plain words that the project or thesis
is their strongest evidence, and weight it accordingly — roughly double any other item.
A funnel that nags for a longer summary and treats the artifact as optional metadata is
instructing the applicant to invest in the weakest signal available. Ask for the artifact
first, weight it heaviest, and read it: an artifact you weight but never open is a bluff
the honest candidates lose.

What an artifact is *worth* relative to a claim, a reference or a demonstration is the
provenance-weighting subject's ladder; this subject owns only the population-specific
consequence, that for a person with no employment record the artifact is not supporting
material, it is the primary exhibit.

## A prior life is evidence, not a blank

Career changers arrive with years of real work in the wrong field, and naive scoring
discards all of it because the domain does not match. That throws away capability
demonstrated in a paying job, under supervision, with consequences — the strongest
evidentiary conditions anywhere in a candidate file.

The craft is to credit the *meta-skill* rather than the domain skill. A teacher has
mentored, explained hard things to unwilling audiences, and held a room under time
pressure. A nurse has worked precisely under stress, handed off safely, and triaged.
These are not consolation prizes; they are competencies the role actually requires,
evidenced at professional grade, and they enter the score at the tier their provenance
earns — the same tier anybody else's professional demonstration earns.

Two disciplines keep it honest. The prior-role to meta-skill mapping is an explicit,
reviewable table, never a model's free association about what a job "is like" — free
association encodes occupational stereotype, and does it differently in each language
the prompt happens to run in. And the credit is bounded by how far the prior domain
sits from the target, graded coarsely, because fine-grained semantic distance is a
number you do not have the data to compute.

## The fairness spine: every discount applies to everybody

This is the failure this subject exists to prevent, and it is worth stating as a rule
before anything else in a scoring review is discussed.

**Any penalty for weak evidence must apply identically to every population, or it must
not exist.**

The incident shape recurs everywhere and is almost never noticed, because it looks like
care. A team decides unevidenced claims should be discounted. Sensible. Someone then
observes that experienced candidates have long histories where evidencing every claim is
impractical, and waives the discount for them. Also sensible, alone. The composition is
indefensible: the same unevidenced claim is now penalised for the person least able to
evidence anything and forgiven for the person most able to. The discount lands
exclusively on students, career changers and returners — populations whose evidence is
thin for structural reasons, not deceptive ones.

The rule generalizes. Confidence floors, staleness penalties, minimum-artifact
requirements, "must show progression" heuristics: each is legitimate in itself and each
becomes an adverse-impact machine the moment it is scoped to one population. If a rule
is right, it is right for the senior candidate too; if it would be unbearable for them,
it was never a fair rule but a filter with a rationale attached. Where a rule genuinely
cannot apply to one population,
[uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)
— drop the penalty for everyone rather than extend it.

## Performing well is corroboration, not identity

Early-career funnels often attach an assessment and let its result reclassify the
person. It must not. Doing well on a graduate exercise *corroborates* that graduate
routing was appropriate; it does not prove identity, and it must never push confidence in
a population label as high as the candidate's own statement of where they are in their
career. Keep the increment modest and hard-capped below what a self-declaration reaches:
the exercise was designed for the population it is being used to confirm, which makes the
inference circular, and a person's account of their own situation beats a test score as
evidence about it.

The converse matters more. A weak performance is evidence about the exercise and the day,
never a demotion of identity, and must not reroute anyone into a harsher rubric.
Classification decides which rubric applies; results are scored within it. Feeding results
back into classification builds a system where doing badly gets you graded on a scale
that assumes you should have done better.

## Read the requirement from the other side too

Half of early-career fairness lives in the role, not the candidate. Advertisements can
be graded for how reachable they are by someone with no tenure — entry-eligibility
signals, how many "must have" requirements are learnable on the job, whether a stated
years figure was ever justified. Four rules keep the lens honest:

- Friendliness signals are **additive and capped** at a small fraction of the total, so
  no accumulation of welcoming language lifts a senior-only advertisement into a
  student's results. Luring someone into a role they cannot get is worse than showing
  them fewer roles.
- The **learnable-must ratio** — the share of hard requirements a newcomer could acquire
  in the first months — is the lens's most useful number: it proxies whether the team
  intends to train at all.
- **Ineligibility is a clean exclusion with a reason, not a low score.** A reason is
  information a candidate can act on; last place on a scale that never applied to them
  is only discouragement.
- **Restate an experience-worded requirement in the currency this population can pay
  in.** "Three or more years of X" and "demonstrated foundation in X" name one need in
  two evidence systems, and only the second is satisfiable through a project. Do it in
  the *reading* of the requirement — never by editing the employer's text, and never by
  inventing entry-friendliness the posting never stated
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

## Failure modes this standard exists to prevent

- **The zero that nobody computed** — an empty tenure field coerced to a number, then
  ranked and rejected on; and **the capped alternative**, a replacement rubric that
  cannot reach full range, so the population it serves loses structurally.
- **Potential-washing** — warm, unfalsifiable language substituting for a breakdown; it
  advances the articulate and cannot defend itself, because no two decisions used the
  same standard.
- **The asymmetric discount** — an evidence penalty scoped to the population least able
  to satisfy it.
- **Free-associated transfer** — a model guessing what a prior occupation implies,
  producing stereotype-shaped credit that varies by language; and **false precision on
  domain distance**, a two-decimal similarity standing in for a judgment nobody has data
  for ([inference dressed as measurement](../../_laws.md#inference-must-look-like-inference)).
- **Result-driven reclassification** — assessment outcomes rewriting the population
  label, making the rubric a function of the score it was meant to produce.
- **The unopened artifact** — a project weighted as strongest evidence and never read,
  rewarding having a link rather than having built something.
- **Rewarding access as merit** — weighting the fact of an internship rather than what
  it demonstrated.
- **Silent interleaving** — dropping early-career candidates into a tenure-flavoured
  ranked list where they sink by construction, and calling it equal treatment.
- **The capped ladder** — an evidence hierarchy whose top rung requires employment, so
  no amount of demonstrated capability reaches full trust.

## Where this subject ends

Deciding *which* rubric a candidate belongs under — the classification, its confidence,
what happens when a career does not parse — is candidate archetype routing's territory;
this subject begins after that decision and owns what is measured in place of tenure.
What a piece of evidence is worth by virtue of where it came from is the
provenance-weighting subject's ladder, consumed here rather than redefined. Whether a
role should have demanded a degree or five years at all is requirement-side work. The
dimension naming is shared: this subject decides what the potential dimension contains,
the routing subject decides it is called potential for this population.

## The techniques

- [readiness-rubric-replacing-years](./techniques/readiness-rubric-replacing-years.md) —
  the weighted depth/velocity/foundation/initiative instrument that occupies the slot
  tenure held, at full range.
- [shipped-artifact-as-primary-evidence](./techniques/shipped-artifact-as-primary-evidence.md)
  — making the made thing the primary exhibit, in intake, in weighting, and in review.
- [transferable-meta-skill-credit](./techniques/transferable-meta-skill-credit.md) —
  crediting prior-life competence at its real provenance tier through an explicit,
  reviewable map.
- [domain-distance-grading](./techniques/domain-distance-grading.md) — coarse honest
  bands instead of a semantic similarity nobody has the data to compute.
- [symmetric-discount-across-populations](./techniques/symmetric-discount-across-populations.md)
  — the audit that every penalty applies to everyone, and what to do when it cannot.
- [explainable-potential-breakdown](./techniques/explainable-potential-breakdown.md) —
  the per-dimension account a candidate and a recruiter can both read, argue with, and
  defend.
