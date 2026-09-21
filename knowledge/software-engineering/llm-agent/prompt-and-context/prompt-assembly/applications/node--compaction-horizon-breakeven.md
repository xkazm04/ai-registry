---
layer: application
type: application
subject: prompt-assembly
technique: compaction-horizon-breakeven
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@22
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A plan-boundary compaction gated by break-even against a trajectory-estimated horizon

SoL-Pi, NVIDIA's open-source efficiency extension for the Pi coding agent, read at
commit `2b791687` (2026-09-15). The version witness is `package.json:54 "22.19.0"`,
the engines floor; the extension is developed against `package.json:46 "0.85.1"` of
the Pi coding-agent package. Paths are relative to the repo root; every anchor below
was verified against the clone with `scripts/check-anchors.mjs`. The mechanism is
`src/sol-pi/extensions/online-context-compact/`.

## The decision

The rule is one function,
`src/sol-pi/extensions/online-context-compact/economics.ts:122 "export function decideCompaction"`.
Saving is `archiveTokens - memoTokens`; the premium is `cacheWriteReadRatio - 1`; the
break-even is `src/sol-pi/extensions/online-context-compact/economics.ts:152 "const breakevenRequests ="`
divided into the write tokens times that premium. The outcome is
`src/sol-pi/extensions/online-context-compact/economics.ts:196 "const compact = compressible && (windowProtection || economic);"`,
where `src/sol-pi/extensions/online-context-compact/economics.ts:170 "const windowProtection ="`
fires inside a reserve of
`src/sol-pi/extensions/online-context-compact/economics.ts:17 "windowReserveTokens: 16_384"`.

The horizon is
`src/sol-pi/extensions/online-context-compact/economics.ts:70 "export function estimateRemainingRequests"`:
the mean of one request count per completed plan step, recorded by
`src/sol-pi/extensions/online-context-compact/state.ts:161 "export function recordBoundary"`,
times the boundaries still pending, plus one. Below three samples the mean is halved,
`src/sol-pi/extensions/online-context-compact/economics.ts:85 "lowerBound *= SMALL_SAMPLE_SCALE"`,
and the estimate is capped by
`src/sol-pi/extensions/online-context-compact/economics.ts:98 "const windowRequestUpperBound ="`,
the requests the window still admits at the observed growth per request.

The three asymmetries are constants:
`src/sol-pi/extensions/online-context-compact/economics.ts:18 "firstCompactionRequestScale: 2"`,
`src/sol-pi/extensions/online-context-compact/economics.ts:19 "subsequentCompactionMargin: 1.5"`,
and carried debt through
`src/sol-pi/extensions/online-context-compact/economics.ts:156 "const combinedBreakevenRequests ="`,
repaid per request out of the saving in
`src/sol-pi/extensions/online-context-compact/state.ts:147 "export function recordProviderRequest"`.
Every decision carries one of nine closed reasons,
`src/sol-pi/extensions/online-context-compact/economics.ts:22 "export type CompactionReason"`,
including `src/sol-pi/extensions/online-context-compact/economics.ts:28 "horizon_unavailable"`
for the missing-input case.

The trigger is semantic: the plan tool registered at
`src/sol-pi/extensions/online-context-compact/tools.ts:48 "export function registerOnlineTools"`
replaces the whole plan on every call, and only a transition into `completed` is a
boundary, `src/sol-pi/extensions/online-context-compact/plan.ts:62 "completedSteps.push(step)"`.
The ratio is configuration, fixed for the session,
`docs/configuration.md:63 "not recomputed when the model changes"`; the default `12.5`
mirrors one provider's cache write/read prices, `agents-install.md:98 "checked on 2026-08-21"`.

## What the tree could not have been built to prove, and proves anyway

The extension cannot read the harness's retained-tail setting through the public
extension surface, so it assumes the harness default,
`docs/compatibility.md:40 "default of 20,000 tokens"`, as
`src/sol-pi/extensions/online-context-compact/extension.ts:35 "export const DEFAULT_KEEP_RECENT_TOKENS = 20_000;"`.
The one number the break-even is most sensitive to — what gets rewritten — is the one
the policy has to guess. A programmatic factory takes an explicit override; the shipped
configuration does not expose it.

## A/B: the rule replayed over real sessions

Arm A is threshold compaction as one coding-agent harness performed it in 166 real
sessions on this fleet's registry checkout (top-level sessions with at least five
requests; a compaction is a drop of more than 40% in prompt size between consecutive
requests). Arm B is the break-even gate above with an ex-post horizon oracle, and
again with the source's small-sample estimator. Same inputs, same instrument.

| | compactions | repaid | break-even (requests) | remaining after |
| --- | --- | --- | --- | --- |
| A: at the threshold | 8 | 8 | median 0.9, max 2.2 | median 214, min 34 |
| B: gate, ratio 12.5 | declines 0 of 8 | — | — | — |
| B: gate, ratio 3 | declines 0 of 8 | — | — | — |

Verdict `not-better` for the seam tested: on a window near a million tokens every
threshold compaction saves roughly nine hundred thousand tokens per request and repays
on the next one, so the gate changes no decision. The technique carries this as its
boundary — it governs early, boundary-triggered compaction, and no fleet project has
such a trigger. Return condition: a fleet harness that compacts at plan boundaries,
where the saving is one step's worth and the arithmetic can decline.
