---
source: web
url: https://github.blog/ai-and-ml/llms/how-to-evaluate-llms-before-production
title: "How to evaluate LLMs before production"
author: Mariko Wakabayashi & Zixiao Chen
kind: first-party-practitioner-account (hybrid: numbered how-to wrapped around one shipped system)
mined_on: 2026-08-27
words: 2716
skill_version: 0.14.0
extracted: 12
picked: 4
accepted: 4
already_covered: 3
declined: 0
leads: 1
untriaged: 4
dispatched: 0
fetches: 0
---

# How to evaluate LLMs before production, 2026-08-27 - four enumerations that were too narrow

A **first-party practitioner account** and structurally two sources in one file.
Sections 1-7 are a generic numbered how-to with a listicle's reliability; the
first-party half is the sentences where the authors say what happened to *their*
system - an offline evaluation of a classifier built to suppress noisy alerts in
a credential-detection workflow, reporting a 95% false-positive reduction inside
a declared recall floor. **Route per half** was the correct reading and it held:
every accepted finding came from a first-party sentence, and every catch came
from a section heading.

The class row predicted the economics exactly. **0 of 3 fetches** - all four
landings corroborated corpus-internally or by training-data convergence, and the
strongest corroboration was already sitting two subjects over in the same bundle.

## The run's shape: four too-narrow enumerations, not four missing opinions

The corpus's eval neighbourhood is among its most mature - `eval-harness` had 8
techniques, and `llm-observability/quality-scoring` carries five subjects on
judges and gating. Nothing here was a hole in the sense of "nobody wrote about
this". All four findings were places where **a document made a claim about its
own completeness and the claim was too broad**:

1. `scenario-design` enumerated five ugly-case regions; the source's failure is
   in none of them.
2. `scenario-design` said captured reality is "representative by construction";
   true of the input, false of the label, and the technique treats them as one
   acquisition.
3. `comparison-modes` said absolute scoring is "the only mode that supports a
   gate (ship if above X)" - the one-metric degenerate case of a real gate.
4. The subject distrusts a green result in two techniques and a golden-path
   section, and had said nothing at all about a red one.

The fourth is the **asymmetry hunt** paying off: not an omission, a lopsidedness.
`unaided-baseline-screening` and `overshoot-and-restore` both exist because a
pass names a case rather than a cause. Nobody had written the mirror sentence.

## Candidates

### 1. Rank eval metrics: objective / constraint / guardrail - ACCEPTED

> "We therefore did not treat precision and recall as equally interchangeable
> metrics." (section 1)

Strip test: survives whole. `safety constraint`, `guardrail metric`,
`one-sided constraint` and `objective metric` all returned **zero corpus-wide**.
`quality-regression-gating` models one score against a baseline with a floor and
a paired drop; it has no model of several metrics with asymmetric roles, and its
composition rule ("regressed if either test fires") governs a family of the same
kind of test, all of which can only block.

Home was contested between `eval-harness` (stage zero: what the eval decides
before it runs) and `quality-regression-gating` (the gate itself). Resolved to
`eval-harness` on the subjects' own boundary statements: gating owns "what
happens **between two runs**", and a metric contract is a pre-registration that
precedes the first run. The boundary is stated in prose inside the new technique
and **not linked** - the two subjects are in different bundles.

Landed **above the source's altitude**, which was the point. The source gives a
three-tier table (primary outcome / safety constraint / operational guardrail);
the durable rule is that its third tier is just more of its second, so the
technique says **exactly one metric is optimized and everything else is a
threshold**. Two halves the source has that most treatments do not: the
threshold is declared before the run and a breach disqualifies regardless of the
primary's gain, and **the constraint is chosen by irreversibility, not
magnitude**. Corroborated by training-data convergence (optimizing vs satisficing
metrics is standard practice reachable without the source in front of you).

-> `eval-harness/techniques/metric-role-contract.md` + a golden-path section.

### 2. Score the designated candidate, not the loudest one - ACCEPTED

> A model may focus on the neighbouring value "because its variable name appears
> more security-relevant, producing a plausible explanation about the wrong
> value." (section 3)

**`distractor` returns ZERO across all 337 subjects.** A concept returning zero
is the finding.

`scenario-design`'s "cover the ugly cases" enumerates degenerate, adversarial,
ambiguity, distribution shift and stress compositions. The source's case is
none of them: **well-formed, in-distribution, unambiguous, single-feature and
non-adversarial**, and the model still evaluates the wrong object because the
context holds a more attention-grabbing neighbour than the designated target.

The mechanism is the part worth keeping: **curating a scenario set removes
distractors as a side effect of tidying it** - trim to what matters, drop the
surroundings as irrelevant, deduplicate near-misses - so the suite ends up
measuring *identify the salient item* when the task is *evaluate the designated
item, which may not be the salient one*.

**Cross-bundle inversion, named not linked.** `recruiting/assessment/llm-era-work-sample-design`
forbids distractors outright: "never one right answer surrounded by distractors",
because a decoy gives a judgment probe an answer key. Both rules are correct and
one question separates them - **is the distractor captured or planted?** Recorded
here so a later run recognises the shape instead of re-litigating it.

-> amendment inside `eval-harness/techniques/scenario-design.md` (sixth region +
the discriminator).

### 3. A captured scenario's label is a workflow outcome - ACCEPTED

> "A dismissed or resolved alert... does not necessarily represent a false
> positive." (section 4)

`scenario-design` defines a scenario as input + context + expected-property
declaration, says captured reality is "representative by construction", and then
never says where the third part comes from for a captured case. It comes from
whatever the product happened to record, and that is a workflow outcome: one
closure can mean the finding was wrong, or right and already handled, or right
and consciously accepted, or never read at all.

**Corroboration was corpus-internal and free.** The same bundle already refuses
this collapse twice - `proactive-nudges/efficacy-feedback` records a waved-away
prompt as "a weak negative... deliberately ambiguous, and the record keeps it
ambiguous rather than guessing", and `remediation-handoff/evidence-based-auto-close`
says a dismissal "must not be collapsed into" a resolution. **The corpus had the
taxonomy where the stakes were visible and a free pass in the eval lane** - a
suite harvesting those records as labels discards exactly the distinction those
two subjects were built to preserve. Cited `unknown-is-not-a-value`: four states
rendered as one definite value.

-> amendment inside `scenario-design.md` (a new section, plus the golden path's
captured-reality sentence qualified to its *inputs*).

### 4. Attribute each eval failure to a layer - ACCEPTED

> "Did this failure come from the model, prompt, input, pipeline, dataset, or
> label?" (section 6)

The **missing stage**. The eval pipeline runs scenarios -> assert/judge ->
compare -> certify -> budget, and `quality-regression-gating` runs run-vs-run.
Nothing owned *the suite is red; which component do I change?* The nearest prior
art is `assertion-vs-judgment`'s "per-criterion verdicts, not one blended score" -
which names **which property** failed, never **which layer caused it**.

Written around the asymmetry rather than the source's list: the subject distrusts
a green result twice over and had never distrusted a red one. The load-bearing
half is that **two of the six owners are not the system** - a label failure and a
dataset failure both go red with no defect present, and the fix for either,
applied to the system, improves the score while moving the system away from
correct. That is the third-state discipline (`failure-not-empty-success`) pushed
one level down from the run to the case. Ordering is a strict funnel, most
upstream first, because the last two owners are the ones teams reach for first.

Also carries the bit the source states and most treatments omit: **a class that
resists all six owners is a product policy nobody has written**, not a model
weakness.

-> `eval-harness/techniques/failure-attribution.md` + a golden-path section.

## Already covered (catches - do not re-propose)

- **Synthetic data supplements, never substitutes for, production-like data.**
  `scenario-design` § "Two sources, opposite failure modes" already says this,
  with a maturity ratio the source does not have.
- **LLM-as-judge as a triage router, not ground truth.** Outclassed:
  `judge-calibration-and-drift/trust-bar-verdict` owns what each trust state
  licenses, `production-trace-scoring` owns sampling policy and double-pay, and
  `judge-contract-design` owns the rubric. The source's five bullets are a subset.
- **Offline evaluation licenses an online experiment, not a production claim.**
  `certification-levels` says it harder: "a candidate certified theoretically has
  been certified against a proxy", with expiry rules the source has no analogue for.

## Untriaged (extracted, reached the table, nobody verified them)

Recorded with anchors so a later run does not re-derive them. **Nobody looked at
these** - this is not a decline.

- **One major variable per experiment; version prompt+model+dataset+config per
  run.** Anchor: section 2, "we evaluated a prompt revision separately from a
  model upgrade". Read at triage: *partial* - `scenario-design` names the
  confound for the *exam* (cache-key scope), not for the *candidate*.
- **A stronger model may need a simpler prompt.** Anchor: "the prompt may be
  carrying complexity that comes from the model itself." Read: *partial* -
  `unaided-baseline-screening` covers "an upgrade makes the suite easier", not
  "an upgrade makes the prompt's instructions redundant". Closest to a real gap
  of the four untriaged.
- **Offline input construction must match production's formatting and
  constraints.** Anchor: section 3's five-item preservation list. Read: *partial*
  against `certification-levels`.
- **95% false-positive reduction inside a declared recall floor.** Anchor:
  section 8. Read: *thin* - n=1, no tree opened, and the number carries no rule
  the metric contract does not already carry better.

## Leads (banked, with return conditions)

- **A gate is a vector, not a threshold.** `comparison-modes` says absolute
  scoring is "the only mode that supports a *gate* (ship if above X)". With
  `metric-role-contract` landed, that sentence is the one-metric degenerate case
  and the technique should probably say so. Not amended this run: the correction
  is small, it touches a forged technique's central claim, and one source is thin
  authority for editing a mode table. **Return** when a second independent source
  gates on a metric vector, or when a connected project's harness is opened and
  found to carry one.

## Cross-repo lane

Not run. The X-lane candidate (does a connected project's eval harness carry a
metric contract?) was offered at triage and the operator picked 1-4 only. No
project tree was opened, so no application document was written and no
`verified_on` was claimed by this run.

## Method notes

- **Class prediction held on all three axes.** Fetch budget unspent (0/3),
  length not a yield proxy (2,716 words -> four landings, outproducing a
  6,958-word roundup), and route-per-half decided every row.
- **The parallel-session hazard fired again.** Another session was live in this
  checkout throughout and landed four techniques, two applications and a
  practices lane mid-run. Content was committed with a pathspec; `index.json`
  and `catalog.json` were regenerated but **deliberately left uncommitted**,
  because a tree-scanning generator cannot be scoped to one session's files and
  committing them would have published the other session's uncommitted work.
