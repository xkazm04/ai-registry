---
layer: application
type: application
subject: pre-publish-fillability-forecast
technique: counterfactual-gate-loosening
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# When every single lever reads zero: the joint pass and the pair fallback

The coach's two lever lists, `looseGates` (eligibility, by removing one gate) and
`looseMustHaves` (qualified, by demoting one skill), both answer "what does this
one requirement cost". Both go quiet on a pool that a *combination* of requirements
empties, and both were run against the real scorer on 2026-09-29 to see how quiet.

## Arm A, the code before: two pools, two silences

**Gates.** One job requiring German and a bachelor's degree.

- Five candidates, every one failing both gates: `eligible 0`, `looseGates []`.
  No lever on the pool the two gates jointly empty.
- One candidate passing, one failing only language, one only education, three
  failing both: `looseGates` = language +1, education +1; a variant with both
  gates removed restores 5. The single deltas add up to 2 against a joint effect
  of 5.

**Skills.** A job with five must-haves (python, kafka, kubernetes, terraform,
docker), promising bar 55, candidates holding python and terraform. Baseline
score 49. Demoting kafka alone: 52. Kubernetes alone: 52. Docker alone: 50. None
reaches the bar, so every `qualifiedDelta` is 0 and the panel's
"nothing here moves the pool" verdict is what a recruiter gets; demoting kafka
*and* kubernetes scores 57 and qualifies all of them. The pool is not far; it is
two requirements away, and each is worth a few points.

The `python`-and-terraform pool also showed why the obvious cheap bound is wrong:
demoting **all five** must-haves scores 49, the same as the baseline, because
demoting a must-have a candidate *holds* removes the credit they had for it. A
demote-everything pass is not monotone and cannot stand in for the pair search.

## Arm B, the change

Kp `d790fdf67` (gates) and `fb942a9af` (skills), both through the existing
`_eligible` and `_qualified` helpers with a mutated copy of the job:

- **Gates**: one extra pass with every levered gate removed; `jointLoosen`
  `{eligibleDelta, soleBlockerSum, gates}` is added to the payload only when the
  joint restoration exceeds the sum of the singles. It is a separate row, names no
  single gate as the culprit, and is absent when the gates block disjoint people
  (pinned by a test).
- **Skills**: only when *no* single demotion moves anyone, the pairs among the
  must-haves some eligible candidate lacks (capped at 8 skills, 28 passes) are run
  and those that move anyone come back as `jointDemote`, best first. When one
  single lever moves someone, the pairs are not run (pinned by a test).

Arm B on the pools above: gates, `jointLoosen` = 5 against a sole sum of 0 for the
all-masked pool and 5 against 2 for the mixed pool; skills, `jointDemote` leads with
`kafka` + `kubernetes` at +3. The winnability suite (27 tests, of which 9 new across
the three commits) and `ruff check` pass; the wider jobfit suite has two failures
that do not touch this module (an import failure in `test_llm_availability_reasons`
and the pipeline-stage vocabulary sync test, neither importing `winnability`).

Verdict `better` at the pipeline level, `code` mode, three real cases per lever
executed. Not measured: whether a recruiter reads the joint row differently from
the empty table; nothing renders it (see deviations).

## Deviations

- **No surface.** `jointLoosen` and `jointDemote` are on the wire and in the types;
  `derivePatterns` neither reads them nor emits a row, so the panel still shows an
  empty ledger, or "no patterns", for the fully-masked pool. This is the gap to
  close for the change to reach a recruiter; the return condition is a ledger row
  kind for a joint finding that carries `editable: false` (there is no single
  requirement to stage).
- **The joint gate row lists every levered gate.** Which pair is the culprit is not
  computed, by design (the technique refuses subset search on gates), so a job with
  three gates gets one joint row naming all three.
