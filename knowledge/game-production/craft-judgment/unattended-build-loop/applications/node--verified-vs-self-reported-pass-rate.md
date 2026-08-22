---
layer: application
type: application
subject: unattended-build-loop
technique: verified-vs-self-reported-pass-rate
stack: node
status: forged
verified_on: 2026-08-20
---

# Two numerators and a strict matcher in PoF's harness

## The matcher is the integrity boundary

`src/lib/harness/feature-match.ts:1` states the incident that produced it:

> The old matcher used fuzzy substring `includes`, which mis-matched features
> ("attack" ⊂ "attack combo") and, when nothing matched, force-passed
> everything. This matcher is strict: exact match on a NORMALIZED key (case /
> whitespace / punctuation folded), on either the feature's `name` or its
> `moduleId::name` id. No fuzzy fallback — an unmatched report leaves the plan
> feature untouched (the caller logs it and leaves the feature UNVERIFIED rather
> than silently passing it).

`normalizeFeatureKey` lowercases, replaces every non-alphanumeric run with a
space, and collapses whitespace. `buildFeatureIndex` resolves collisions by a
stated rule — name keys are inserted first, and a feature's id key is only added
if it does not shadow another feature's name key — so an id-form report resolves
without clobbering a differently-named feature. `matchFeature` returns `null`
rather than a best guess.

Both halves of the old behaviour were fatal in an unattended loop, and the
force-pass half was the worse one: it turned an unparseable session report into a
completed plan.

## Two numerators over one denominator

`updatePlanStats` in `src/lib/harness/plan-builder.ts:519` keeps both counts in
one pass:

```ts
for (const a of plan.areas) {
  if (a.status === 'completed-with-gaps') continue;
  for (const f of a.features) {
    if (f.status !== 'pass') continue;
    passing++;
    if (f.verified === true) verified++;
  }
}
```

`passingFeatures` is the executor's self-report; `verifiedFeatures` counts only
features whose area's **required** gate passed for that session. `plan-builder`
then exposes `selfReportedRatePct`, `verifiedRatePct` and `planRatePct(plan,
basis)` — all three over the same `plan.totalFeatures` denominator.

## The basis is a named parameter, defaulting to verified

`passRateBasis` (`'verified' | 'self-reported'`) is a first-class lever on every
control surface: the HTTP `POST /api/harness` body, `pof_harness_status`'s
sibling `pof_harness_start`, and the CLI's `--pass-rate-basis`. The default is
`verified` everywhere, and the doctrine is explicit that the **stop condition
uses the verified rate by default**. The self-reported basis is retained for
legacy counting and must be asked for.

The concrete case this defends: a feature the executor reported as passing, on a
tree whose required gate was `unverifiable` because no UE environment was
configured, stays `verified: false`. The self-reported rate rises; the rate the
loop stops on does not.

## Headline ordering is enforced

`src/lib/harness/run-harness.ts` headlines the **verified** rate — the numerator
the stop condition actually compares — with the executor's self-report shown
second and explicitly labelled. Both rates are surfaced by the status API as
`verifiedPassRate` / `selfReportedPassRate`, and therefore by `pof_harness_status`
to any CLI driving the run. The doctrine notes what this is and is not: "This is
bookkeeping over existing gate evidence — not a new verification mechanism."
