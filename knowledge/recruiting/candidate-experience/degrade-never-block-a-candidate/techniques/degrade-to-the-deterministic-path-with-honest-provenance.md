---
layer: technique
type: technique
subject: degrade-never-block-a-candidate
technique: degrade-to-the-deterministic-path-with-honest-provenance
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, inference-must-look-like-inference]
use_when: [a model call fails or is unaffordable mid-pipeline, designing the fallback for a candidate-facing step, deciding whether a step has a real floor]
---

# Degrade to the deterministic path with honest provenance

## The concern

Two different events — *the provider is down* and *this account has spent its
allowance* — have identical requirements at the moment they happen: the pipeline must
keep moving, the output must remain truthful, and nobody downstream may mistake what
they are holding.

Teams usually build these as two paths, at two different times, with two different
levels of care. The outage path gets a circuit breaker and a hurried fallback; the
quota path gets an exception. Neither is exercised often enough to be trusted, and
the day both fire at once is the day a whole cohort of candidates goes through code
nobody has read.

The technique collapses them: **one degraded route, shared by every reason the model
layer is unavailable, which is the product's normal floor rather than an emergency
branch.**

## Designing the floor before the garnish

The floor is what the system does with no model at all: the structured record, the
declared requirements, deterministic templates, explicit thresholds, and the
candidate's own submitted answers. It must be complete enough to stand alone, because
it will.

The model layer's job is then correctly scoped as *garnish*: a more specific
rationale, a warmer phrasing, a sharper summary. Garnish improves how a result reads.
It does not decide anything the floor could not decide.

The test that separates the two, applied per step: **if the model's contribution
disappeared, would this step produce a different outcome, or only a plainer one?**

- *Only plainer* — the model is garnish. Degrade freely; the candidate is unaffected.
- *A different outcome* — the model is a dependency in disguise. Degrading it silently
  changes a decision, which is the exact failure this subject prohibits. That step
  does not degrade; it holds for a human. The hold verdict, its routing and its audit
  are owned by the automated-screening-fairness sibling; the obligation here is to
  know which of your steps are which and to have written it down.

Most teams discover that a step they classified as garnish was a dependency, because
its output was quietly feeding a threshold.

## The procedure

1. **Route quota exhaustion through the same code as provider failure.** One entry
   point, one fallback implementation, one set of tests. The reasons differ only in
   what gets recorded.
2. **Keep the route warm.** Because free-tier and unentitled accounts take it every
   day, the deterministic path is continuously exercised in production rather than
   discovered during an incident. If your plan structure does not naturally exercise
   it, exercise it deliberately on a sample of traffic.
3. **Tag the output at the moment of production.** The provenance vocabulary and its
   rules belong to the inference-labelling sibling — use it, do not re-derive it. What
   this technique adds is the *reason dimension* beside the grade: outage, allowance
   exhausted, validation failure, deliberate cheap-path policy. The grade tells a
   reader how much to trust it; the reason tells an operator what to fix and when to
   recompute.
4. **Make the degraded output visibly plainer.** A deterministic template that reads
   exactly like a full analysis has laundered itself through style alone. Let the
   floor look like the floor — shorter, more structural, obviously templated. This is
   [inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)
   applied to the fallback: the grammar carries the grade.
5. **Read the asking tenant's state, not a default one.** The degrade switch must
   consult the billing and availability state of the account whose candidate is being
   processed. A shared switch that resolves against a default account silently runs
   one customer's pipeline on another customer's quota — and the candidates who pay
   for it belong to neither.
6. **Never hard-fail a read mid-pipeline.** A per-candidate enrichment that throws
   when the model is unavailable takes the whole batch with it. Reads degrade; they
   do not raise.
7. **Emit the degradation as an operational event, per run and per cohort.** One
   degraded candidate is noise. Four hundred in one window is a fairness incident that
   needs a recompute, and you cannot detect it from per-record tags alone.
8. **Plan the return.** A degraded result is provisional by definition; the recovery
   path must be able to find those records and recompute them. That means the reason
   and the timestamp are queryable, not buried in a text field.

## Decision rules

- **When the model layer is unavailable for any reason, take the deterministic path
  and declare it** — never stall a candidate-initiated step waiting for recovery
  ([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When the deterministic floor cannot honestly support the step, hold for a human
  rather than inventing a weaker verdict.** An explicit pending state is a better
  artefact than a confident guess from a keyword matcher.
- **When the degraded result would be adverse to the candidate, it may not be
  executed unattended.** Degraded instruments produce holds and reviews, never
  rejections.
- **When part of a composite output came from the floor and part from the model, the
  whole output takes the weaker grade** if the degraded part carries the conclusion.
  Partial-credit provenance is how laundering returns through the back door.
- **When the provider recovers, prefer recomputation over reuse** for anything still
  in flight, and keep the earlier degraded record rather than overwriting it.

## When not to use it

- **Where the deterministic path would be a different instrument rather than a
  plainer one.** Substituting a keyword match for a semantic reading is not
  degradation; it is a second, uncalibrated assessment method quietly entering the
  process. If the floor cannot be described as "the same judgment, expressed more
  plainly", it is not a floor.
- **Where the operator explicitly chose the cheap path as policy.** That is an
  instrument choice, recorded as such, not a degradation — though it still owes the
  reader a truthful label.
- **On creation actions.** These refuse; see the hard-gate technique. Degrading a
  creation manufactures a half-artefact.
- **On a step with no model in it at all.** A purely deterministic step has one grade
  of output, and provenance ceremony there is noise.
