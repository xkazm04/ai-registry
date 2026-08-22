---
layer: application
type: application
subject: acceptance-verdict-spine
technique: three-layer-merge-order
stack: node
status: forged
verified_on: 2026-08-20
---

# Node realization — the one acceptance truth for a step

A content-pipeline app (`C:\Users\kazda\kiro\pof`, a Next.js/TypeScript lab over an
Unreal item/monster/ability catalog) implements the merge as a single pure function.

## The spine

`src/lib/catalog/acceptance/resolveStepAcceptance.ts:38` — `resolveStepAcceptance()`.
Its own header states the order and the reason it exists:

> 1. the step's own **Checker**; 2. the **server drain overlay** — a real L3/L4 gate
> outcome supersedes a local `deferred`; 3. the **judge bridge** — a current-rubric,
> matching-class judge FAIL bound to the content on record condemns a shape-pass; a
> verdict about content the step no longer holds is reported as `stale`, never applied.

The body is four lines: overlay, short-circuit if no verdicts, resolve the audited
judge class from `getStepFact`, bridge. Nothing re-grades; the caller supplies the
verdicts it read (the lab from `/api/judge-verdicts`, the server from `listVerdicts`).

## The directional guard

`serverVerdictOverlay` (same file, line 22) is the whole "may only act where it knows
more" rule in six lines:

```ts
if (local.status !== 'deferred') return local;
const s = persisted?.status;
if (s !== 'pass' && s !== 'fail') return local;
```

Then it *destructures the local reason out* so a stale "nothing has run this yet"
cannot survive beside a concrete server outcome. The comment names the justification:
"a pure Checker can only ever say `deferred` for an unrun runtime/visual gate, while
the drain runner has actually run it… the server never silently overrides a checker
that could decide for itself."

## Why it is one function — the incident

The same header records the divergence that forced consolidation: two derivations both
claimed to be the truth. The step banner (`useStepAcceptance`) applied all three
layers; the rail, matrix, step-coach, global-coach and entity rollup
(`deriveEntityArtifacts`) applied only one or two. Result: **a judge-failed step showed
a green rail dot next to its own red banner**, and the headless `/status` report
(bridging via `src/lib/catalog/headless.ts`) sided with the banner against the rail.
Every consumer now funnels through this function — `globalCoachModel.ts:256`,
`hooks/useEntityArtifacts.ts:204`, `steps/shared/useStepAcceptance.ts:64`,
`labCheckerContext.ts:79` — "so they cannot disagree by construction."

`verdictsForStep()` (line 84) is shared for the same reason at one level down: the
`(entity, step)` filter cannot drift between the banner and the rail because there is
only one of it.

## Purity across two runtimes

The function is side-effect free and takes its verdicts as arguments precisely because
the browser lab and the headless server build a `CheckerContext` from different stores.
`labCheckerContext.ts:136` re-exports `serverVerdictOverlay` rather than reimplementing
it, so the server-importable path shares the guard.

## Confirmed, deviation, upward lesson

- **Confirmed.** Fixed order, cheapest-first, later layer acts only where it knows more.
- **Confirmed.** Merge is pure and never re-grades.
- **Upward lesson.** The repo's overlay *drops the superseded reason* by destructuring
  it out. The expert draft had the status rule but not the reason rule; a deferred
  reason displayed beside a concrete server outcome is actively misleading, and that
  detail is now in the technique's decision rules.
- **Upward lesson.** Making the judge class *audited* (`getStepFact(catalogId, step)
  ?.judge`) rather than passed in ad hoc means a verdict from the wrong class of judge
  cannot be applied at all.
