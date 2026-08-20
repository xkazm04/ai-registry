---
layer: technique
type: technique
subject: usage-limit-governance
technique: metric-window-threshold-action-model
status: forged
laws: [quality-apparatus-stays-unbudgeted, never-present-absence-as-an-answer]
shared_with: []
use_when: [designing the schema for usage limit rules, choosing what a cap measures and how it reacts, adding a soft-warning tier before enforcement]
---

# The metric × window × threshold × action model

A usage limit is one sentence of policy — "no more than N of M per W, or
else A" — and the technique is factoring that sentence into four orthogonal
parts so that every rule the operator can express is well-formed, every
surface (enforcement, status, alerting) reads the same structure, and adding
a new metric or action never perturbs the others.

## The four parts

- **Metric** — what is summed over the window. The canonical trio is cost,
  calls, and tokens. Cost is the metric operators actually mean, but it is
  also the only one with provenance problems (see
  cost-evidence-and-imputation); calls and tokens are exact by construction
  — a call is a call — and need no evidence structure. Keep the metric an
  enum, not a free-form expression: every metric added is a new accounting
  obligation on the substrate, and an expression language turns that
  obligation invisible.
- **Window** — the rolling look-back the metric is summed over: hour, day,
  month. Rolling, not calendar-aligned: a calendar window resets to zero at
  a boundary and invites the midnight burst; a rolling window drains
  continuously and has no gameable edge. The window also owns the hard-stop
  retry hint: nothing frees capacity until usage ages out, so each window
  publishes its own advisory wait — deliberately far shorter than the window
  itself, because a rolling window drains continuously rather than all at
  once, and polling faster than the hint is pure waste.
- **Threshold** — the number. Validate it where the rule is written: a
  zero, negative, or non-finite threshold makes the usage ratio infinite,
  which means the cap breaches on *any* traffic — a misconfiguration that
  presents as an outage. The validation lives in exactly one pure function
  shared by create and update, so the two doors cannot drift.
- **Action** — the consequence, in three genuinely distinct tiers:
  - **Observe-only**: notifies, never rejects — in any state, including the
    unmeasurable one. This tier is what makes it safe to deploy a new cap
    against unknown traffic before arming it.
  - **Graduated**: sheds a growing share of traffic before the threshold,
    then hard-stops at it (see graduated-throttle-with-deterministic-shed).
  - **Hard stop**: an unambiguous rejection at the threshold with no
    shedding beforehand. A strict cap stays strict; the graduated tier is a
    different contract, not a nicer default for this one.

  Model the tier's two capabilities as explicit predicates — "does this
  action enforce?" and "does it shed?" — rather than scattering `match`
  arms across the enforcement path. New actions then declare their behavior
  in one place.

## The soft-warning tier

Between silence and enforcement there is a fraction-of-threshold at which
the operator wants to *hear* about an approaching cap — a distinct warning
signal with its own cooldown, fired when the usage ratio crosses the
fraction without breaching. Two rules keep it honest: a breached cap is
never also "warning" (it has crossed into enforcement and breach alerting,
and double-signaling one state confuses dedup), and the fraction is
validated as strictly between zero and one.

The warning fraction earns a second job: when the graduated tier needs to
know where its ramp begins, reuse this knob rather than adding another.
The operator has already said where "approaching" starts; a second knob
could contradict the first, and two thresholds that disagree about where
concern begins is a support ticket, not a feature.

## The status object is the lingua franca

Evaluating a rule against a usage snapshot yields a status: current value,
threshold, ratio, breached, warning, shed fraction, scope, evidence. Build
that status in exactly one function and hand it to every consumer — the
admission decision, the read-only status endpoint, the alert path. The
status also carries a stable alert key (project, metric, window, *and
scope*) for cooldown dedup; omitting scope from the key makes a scoped cap
and a project-wide cap on the same metric suppress each other's alerts.

## Count the traffic the cap turns away

An enforced rejection must not be stored as an event — that would corrupt
the usage totals the cap evaluates — but discarding it unrecorded means the
platform goes blind exactly when its limits bite. Keep a rejection ledger
keyed like the alert key (scope included): count, estimated missed cost,
first and last rejection times. If the ledger is in-memory and resets on
restart, the status surface must say so — a disclosed rolling view is
honest; an implied audit log that evaporates is not. Presenting "no
rejections recorded" after a restart as "no rejections happened" is the
absence-as-answer failure in miniature.

## When not to use this model

Do not reach for this machinery to pace a *rate* (N per second against an
instantaneous regulator) — that is rate limiting, with different windows,
different state, and different refusal semantics: the token-bucket and
leaky-bucket family, whose "budget" is a replenishment rate and whose
state is a counter, not a windowed sum. The two disciplines coexist in
practice — a per-minute pacing limit in front of a long-window budget cap
— and the pacing half belongs to a regulator, not to this model; grafting
per-second windows onto this schema buys the worst of both. And never let any rule,
of any tier, evaluate the platform's own scoring traffic: the quality
apparatus is exempt from governance by construction, because a cap that can
throttle the measuring instrument during a traffic spike removes the
measurement at the moment it is most needed.
