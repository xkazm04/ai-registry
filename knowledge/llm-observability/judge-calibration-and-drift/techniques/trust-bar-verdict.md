---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: trust-bar-verdict
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, never-present-absence-as-an-answer]
shared_with: []
use_when: [deciding what judge scores are allowed to drive, wiring calibration results into gates and dashboards, a judge or rubric changed and someone asks if old trust still holds]
---

# Trust-bar verdict

The concern: turn a calibration measurement into an explicit, scoped,
machine-readable state — **trusted** or **untrusted** — and make every
downstream consumer of judge scores behave differently depending on it. The
verdict is the firewall between "we measured agreement" and "we act on
scores"; without it, calibration is a report nobody is obligated to obey.

## The verdict

One rule, pre-committed: the judge is trusted when its chance-corrected
agreement clears a fixed bar (kappa ≥ bar, with 0.6 the field-common floor
and 0.8 strong). The bar is chosen once, before results are seen, and is
not a knob tuned per run — a trust bar that moves to wherever this month's
kappa landed is the instrument grading itself. Record the bar and the
binarization threshold *inside* the verdict, because the same judge can be
trusted at one pass threshold and untrusted at another.

The verdict has three states, not two:

- **Trusted** — kappa measured, bar cleared. Scores are measurements.
- **Untrusted** — kappa measured, bar missed. Scores are leads.
- **Uncalibrated** — no measurement exists for this scope. Behaves exactly
  like untrusted, but is disclosed as its own state: "we never checked" and
  "we checked and it failed" are different facts, and a consumer deciding
  whether to fund a calibration pass needs to know which one it is holding.
  Absence of calibration is never presented as implicit trust.

## What each state licenses

The point of the verdict is that consequences are categorical:

| Capability | Trusted | Untrusted / uncalibrated |
|---|---|---|
| Fail a release or gate a deploy | yes | never |
| Feed customer-visible quality numbers as fact | yes | never |
| Trip automated quality alerts | yes | only as "needs human review" |
| Prioritize a human review queue | yes | yes — this is what leads are for |
| Close an investigation ("quality is fine") | yes | never — a lead cannot close a question |

The untrusted column is not punishment; it is a useful mode. An untrusted
judge still ranks — its scores concentrate human attention on the worst 5%
of traces far better than random sampling. The discipline is that its
output changes *what a human looks at*, never *what the system asserts*.

## Scope: trust does not transfer

A verdict is earned by a specific tuple — judge model, rubric, pass
threshold, golden set version — and is void outside it:

- **New judge model** (including a provider-side silent update you detect
  by drift): starts uncalibrated.
- **Rubric edit**, even a wording pass: the instrument changed; recalibrate
  before the verdict carries over.
- **Judging-method change** (batching, sampling strategy): measure the
  paired difference on the same set before extending trust; a method that
  flips pass/fail decisions on known items is a different instrument.
- **Threshold move**: kappa is computed *at* a threshold; a moved bar means
  a new kappa.

Practically this means the verdict is keyed per judge identity, and a
system with three judge models holds three independent trust states — one
of which degrading says nothing about the others.

## Making the verdict operational

The verdict must live where machines can act on it, not in a report:

- **A field on every calibration record** ("pass" = trusted), so history
  shows when trust was lost and regained.
- **An exit contract for schedulers**: a calibration cycle that ends
  untrusted exits with a distinct non-zero code, so a cron job, CI step, or
  orchestrator fails loudly without parsing output. Reserve the code —
  "untrusted" must be distinguishable from "the run itself errored",
  because one means *stop trusting scores* and the other means *fix the
  pipeline*.
- **Provenance on scores**: every judge verdict records which judge
  produced it, so when trust is revoked you can identify exactly which
  historical scores were minted under a since-degraded instrument — and
  demote them to leads retroactively in interpretation, without rewriting
  the records themselves.

## When not to use this

Do not extend the trusted/untrusted machinery to human review outcomes —
human labels *are* the ground truth axis here, and wrapping them in the
same verdict inverts the calibration relationship. And resist inventing
intermediate trust grades ("mostly trusted") — every consumer will round
them to whichever binary serves it, and the firewall property is lost. If
the binary feels too coarse, the correct refinement is per-scope verdicts
(per rubric, per domain slice), not a fuzzier scale.
