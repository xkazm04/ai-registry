---
layer: golden-path
type: golden-path
subject: adverse-impact-and-proxy-neutrality
status: forged
use_when: [running a selection-rate fairness analysis, deciding what a demographic-blind system may claim about its fairness, designing a name or proxy perturbation test, reviewing a fairness claim before it ships]
techniques:
  - selection-rate-ratio-testing
  - reference-group-selection
  - minimum-cohort-before-a-ratio-is-asserted
  - too-small-to-assess-as-a-distinct-verdict
  - name-and-proxy-neutrality-perturbation-testing
  - cohort-shield-is-not-a-protected-class-test
---

# Adverse impact and proxy neutrality

Two questions live in this subject and they are constantly confused, at real
cost. The first is **outcome** — of the people who passed through a gate, did
the groups the law protects pass at comparably different rates? The second is
**function** — does the machinery that produced those outcomes behave
differently when only a person's name, or a feature standing in for their
group, is changed? The first is a statistical claim about a population and
requires demographic data you may not have. The second is a determinism claim
about a system and requires no demographic data at all.

They are not substitutes. A screen can be perfectly invariant to every name
you perturb and still produce a badly skewed selection rate, because the
disparity rode in on a postcode, a school, a certification, a career gap or
the phrasing of a language requirement. A screen can also pass a selection-rate
ratio in a quarter where the applicant mix happened to be favourable while a
name still moves the score. The principal position is that a fairness claim
must state **which of the two it is**, and a platform that holds no demographic
data must be loud that it can only ever make the second.

## The selection-rate ratio, and its honest ceiling

The mechanic is simple and worth stating precisely. For a defined gate,
compute each group's selection rate as those selected divided by those
considered. Pick a reference group. Divide each other group's rate by the
reference rate. A ratio below four-fifths — 0.80 — is the long-standing
screen: a rate less than four-fifths of the highest group's rate is generally
regarded as evidence of adverse impact, and a higher ratio generally is not.
The rule is roughly fifty years old, predates every system in this bundle, and
is the closest thing the domain has to a common language.

What a principal practitioner also holds true is everything the rule is not.

- **It is a screen, not a verdict.** It flags a pattern worth explaining. It
  does not establish liability, and passing it does not establish innocence:
  smaller differences can still constitute adverse impact where they are
  significant in both statistical and practical terms.
- **It is unstable at small N and blunt at large N.** With twenty applicants
  per group, one person moving flips the ratio across the threshold; the
  difference is not statistically significant and a difference that is not
  significant does not establish adverse impact. With a hundred thousand, a
  ratio comfortably above 0.80 can still hide a disparity that is significant
  and consequential. The ratio needs a significance companion in both
  directions, and a shortfall count — *how many additional selections would
  bring this group to parity* — because a "failing" ratio whose shortfall
  rounds to less than one person is noise wearing a red badge.
- **It measures a gate, not a process.** Compute it per stage. A funnel that
  looks balanced end to end can hide a screen that rejects sharply and a later
  stage that partly compensates; the compensating stage is not a defence for
  the screen, and the aggregate hides exactly the gate you would need to fix.
- **It cannot grade the thing that caused it.** Where the score under
  examination is what produced the rejections, measuring its impact on
  post-screen outcomes is circular — see the law that a predictor cannot grade
  its own labels, and the calibration subject that owns holdout design.

## Jurisdiction: one number, many duties

A widely-repeated mistake is to treat 0.80 as a global compliance threshold and
hard-code it everywhere. It is not. Very few jurisdictions **codify** a numeric
selection-rate ratio with a published audit obligation attached; one
well-known municipal regime does, requiring an independent audit that publishes
selection rates and impact ratios by sex and race/ethnicity, with a small
allowance for excluding negligibly-sized categories from the computation.
Most jurisdictions instead codify *duties* — non-discrimination, transparency to
the candidate, human oversight, an impact assessment, a right to explanation —
and codify **no number at all**. And in the jurisdiction where the four-fifths
screen originated, the enforcement posture has softened in recent years without
the underlying prohibition changing, so private claims remain fully live.

Three rules follow, and they are the ones that survive a jurisdictional review.

1. **A jurisdiction's threshold field is nullable, and null is the common
   value.** Where a regime has not codified a ratio, the correct stored value
   is nothing — not 0.80 "as a sensible default". Inventing a threshold a
   legislature declined to set manufactures a compliance claim, and a
   manufactured claim is worse than an absent one because someone will act on
   it.
2. **Build to the standard, not to the enforcement weather.** A relaxed
   enforcement posture is not a change in what is lawful, and it can reverse
   inside a product cycle. The analysis you would want in a deposition is the
   analysis you run.
3. **Where a jurisdiction codifies no ratio, the ratio is still worth
   computing — as an internal diagnostic, labelled as one.** Present it as
   "our own screen flagged this", never as "this fails the jurisdiction's
   test".

## What a system that holds no demographic data may claim

Many hiring systems deliberately never collect race, sex, ethnicity, age or
disability. This is a defensible design: it satisfies data minimisation, it
makes direct use of a protected attribute structurally impossible, and it
removes an attractive breach target. Take the design seriously enough to accept
what it costs.

A system that holds no demographic data **cannot compute a selection-rate ratio
over its own candidates.** Not "does not currently"; cannot. There is no
denominator. Every honest consequence follows from that one sentence:

- The right artifact is a **ready primitive, not a monitor** — a correct,
  tested computation an employer feeds their own data into, where that data was
  separately and voluntarily self-identified, kept isolated from the deciding
  record, and never joined back onto the candidate profile the recruiter sees.
- The system's own fairness claim narrows to what it can actually measure:
  **invariance of the function**, established by perturbation. "Changing only
  the name does not change one byte of the output" is a strong, checkable,
  falsifiable claim. "We are fair" is not.
- No surface — dashboard, sales page, audit export, model card — may render the
  uncomputed ratio as reassurance. A metric that was never computed has a
  state, and that state is not green.
- Inferring the missing attributes to fill the gap is the worst available
  option. A name-to-ethnicity or name-to-sex classifier turns a system that
  held no protected data into one that holds *guessed* protected data, at
  meaningful error rates, attached to hiring outcomes. Where an employer needs
  the analysis, the data comes from the candidate's own voluntary declaration or
  it does not come.

## Proxies: unawareness is not neutrality

Removing the protected attribute from the inputs does not remove it from the
data. The attribute is redundantly encoded across features that look
individually legitimate — the name itself, a postcode, a school, a first
language, a military or national-service marker, a gap in employment, a
grammatically gender-marking surname form, the phrasing of a hobby. A model
free to use those features can reconstruct the attribute it was never given.
This is why "we don't collect it" answers the direct-discrimination question
and answers the disparate-impact question not at all.

Proxy work is therefore two disciplines running together. **Perturbation
testing** establishes that the function is invariant across a set of inputs
chosen for the discrimination axes that specific labour market actually has —
not a generic list borrowed from elsewhere. And **feature justification**
requires that any feature strongly associated with a protected group earns its
place by being genuinely job-related and consistent with business necessity,
argued in writing before deploy, not discovered in a post-hoc audit. A
requirement nobody can justify is a requirement to drop, whatever the ratio
says — and requirement inflation is where most of these features enter, which
is a neighbouring subject's territory.

The perturbation discipline has one rule that people try to soften and must
not: **exact equality, not a tolerance.** If the same résumé under two names
produces scores differing by 0.4 of a point, the correct reading is not "within
tolerance", it is *the name reached the score*. Any non-zero delta is the bug.
The only sanctioned exception is a single display carrier — one field that
exists to echo the person's name back for a human reader — which is normalised
before comparison and appears nowhere else in the scored payload. One carrier,
declared, or none.

## Cohorts are not classes

Systems routinely route candidates into cohorts that are not protected classes:
career-changer, returner after a long absence, self-taught, non-linear path,
early-career. Shielding those cohorts from automated rejection is good craft —
it protects exactly the profiles a pattern-matching screen handles worst.

It is not a protected-class test, and the distance must be stated in the code,
in the interface, and in every report that mentions it. A cohort is inferred
from the candidate's own documented career; a protected class is a legal
category the system does not hold. Passing a cohort-balance check licenses no
fairness claim whatsoever, and a report that puts the two side by side invites
precisely the substitution that gets an employer sued. Two further disciplines
belong to the shield: it must never be tuned toward a protected characteristic
(a "returned from caregiving leave" cohort is close enough that inferring and
storing it can itself be the harm), and an unclassifiable candidate is shielded
rather than defaulted into the unshielded class, because uncertainty resolves
toward the candidate.

## Where the analysis lives in the process

Fairness analysis that only exists on a dashboard is analysis nobody runs.
The load-bearing placements are: before a scoring change ships; at every change
to a threshold or a cutoff, since moving a cutoff is a fairness event even when
the model is untouched; on a fixed cadence with the applicant window and the
scoring version stamped onto the result; and — the one that catches real
incidents — **at the moment of bulk automated action**, as a re-check on the
exact set about to be rejected, computed there rather than trusted from an
earlier run. Defence in depth exists because the earlier run was over a
different cohort.

The bulk re-check has a discipline of its own. It re-derives the fairness gate
from the record it holds rather than trusting the upstream decision, so an
upstream regression cannot ship an unfair rejection through a layer that was
only forwarding. Where that re-check mirrors an upstream threshold, the mirror
is a **backstop ceiling** pinned by a test on both sides — a copy that drifts
below the original starts refusing legitimate actions, and a copy that drifts
above stops catching anything. And a refused action is downgraded to a hold
with an alert, never silently dropped: a candidate quietly removed from a
rejection batch and from every queue is worse off than one who was rejected.

Every such result carries its sample, its gate, its window, its reference
group and the version of the scoring function it judged, because a fairness
verdict is bound to what it judged and a re-scored population is a new
question. The operational telemetry that makes those runs observable —
tracing, cost, evaluation harnesses — belongs to the observability neighbour;
what belongs here is the judgment about people that the numbers are standing
in for.

## The failure modes, named

- **Green on nothing.** A ratio computed over eleven people, rendered as a
  pass. The most common failure in this subject and the reason "too small to
  assess" is a distinct verdict.
- **Reference shopping.** Recomputing against a different reference group until
  the number clears, which is the fairness equivalent of hunting for a
  favourable p-value. Fix the rule before you see the data.
- **Name-only neutrality.** A clean perturbation suite over names, published as
  proof of fairness, while the postcode feature does the whole job.
- **The shield as the test.** Cohort coverage reported where a protected-class
  analysis was asked for.
- **The default threshold.** One jurisdiction's number applied to a
  jurisdiction that codified none, and then cited back as compliance.
- **The dropped row.** A malformed input line skipped in silence, removing the
  group that would have been the reference and flipping every verdict on the
  page. Under a data-chosen reference, input hygiene is fairness logic.
- **Green theatre.** An invariance suite passing because nothing was scored,
  because the baseline was a missing field rather than a name, or because the
  fixture stopped carrying the token the probe was looking for.
- **Inference to fill the gap.** Guessing the attribute you deliberately never
  collected, and thereby collecting it.
