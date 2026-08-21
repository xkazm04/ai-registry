---
layer: application
type: application
subject: quality-verdict-integrity
technique: condemn-vs-elevate-asymmetry
stack: node
status: forged
verified_on: 2026-08-20
---

# The condemning-provenance set in PoF's acceptance bridge

PoF's acceptance layer merges shape checkers, a server drain overlay and stored
judge verdicts into one status per step. The asymmetry lives in three files:
`src/lib/catalog/acceptance/judgeBridge.ts`, `src/lib/catalog/acceptance/types.ts`
and `src/lib/judge/verdictStanding.ts`.

## The set, exported so nobody re-implements it

`src/lib/catalog/acceptance/judgeBridge.ts:129`:

```ts
export const CONDEMNING_PROVENANCE: ReadonlySet<VerdictProvenance> = new Set<VerdictProvenance>(['current', 'unknown']);
```

Two of the four standings condemn; only `current` elevates. The export comment
gives the reason it is a shared constant rather than an inline check: "any
surface that reports 'current quality' must count exactly the verdicts
acceptance believes: the Evaluator's Verdicts tab used to average every stored
row, including superseded-rubric and stale-bound ones, and so reported a fail
count the acceptance layer itself did not hold." Two dashboards, two truths, one
missing predicate.

`src/lib/judge/verdictStanding.ts:34` is the other side of that fix:

```ts
export function isStanding(p: VerdictProvenance): boolean {
  return CONDEMNING_PROVENANCE.has(p);
}
```

The module header states the retention rule in one line: "Superseded / stale rows
are EVIDENCE and stay visible — they are just not counted as current quality.
This module is the one place that draws that line." `judge_verdicts` itself stays
append-only; the filter is applied on read.

## Attaching a verdict that is not applied

`src/lib/catalog/acceptance/types.ts` defines `JudgeAttribution` and says why it
exists:

> The judge verdict behind (or NOT behind) a result — attached by
> `bridgeJudgeVerdict` whenever a failing verdict exists for the step,
> INCLUDING when it was not applied. That inclusion is the point: a verdict that
> judged content the step no longer holds is reported as `stale` rather than
> silently dropped, so "unjudged since the re-produce" can never be read as
> "judged and passed".

Its `note: string` field is documented as "plain-language statement of what this
verdict does and does not prove here", and `bridgeJudgeVerdict`
(`judgeBridge.ts:143`) writes four distinct notes:

- applied at `current` — "Judged the content currently on record."
- applied at `unknown` — "This verdict cannot be confirmed against the current
  content — {reason}. It is still applied, and still needs a re-judge." The
  reason comes from `unverifiedReason` (`judgeBridge.ts:115`), which distinguishes
  "it records no content binding" from "its content binding was recorded under
  hash scheme v1, superseded by v2" — so a scheme migration never reads as an era
  of negligence.
- not applied, `stale` — "A judge FAIL is on record but it judged content this
  step no longer holds (re-produced since). Not applied — this step is UNJUDGED,
  not judged-and-passed."
- not applied, `superseded` — "…needs a re-judge under the current rubric."

## Only a shape-pass is downgraded

```ts
if (binding && result.status === 'pass') { … status: 'fail' … }
```

A gate deferral (L3/L4) or an already failing/pending result is left exactly as
the checker found it, and the verdict is attached as attribution only. The bridge
also filters by judge class first — a verdict from a different judge class never
speaks for the step, while `judge === 'human'` always may.

## Rendering the standing

`verdictStanding.ts:44` carries `VERDICT_STANDING_CHIP`, shared with the lab's
`ProvenanceStrip` "so the two surfaces speak ONE language (glyph + word, never
hue alone — WCAG 1.4.1)", and `VERDICT_STANDING_NOTE` gives each standing a
one-line meaning. `current` is the only chip at level `ok`. The provenance is
computed **server-side** — only the server holds the artifact rows the hash is
compared against — and sent additively, "so a client can render the standing
without re-deriving — or fabricating — it".

## The deviation

`VERDICT_STANDING_NOTE.unknown` reads "Its content binding cannot be confirmed.
Still applied, and counted." Counting an `unknown` verdict toward a reported
quality *average* is a step beyond condemning on it: the score it contributes is
a number about content nobody can confirm it read. The technique's standard is
that only `current` contributes to a quality figure, while `unknown` condemns
without counting as measured. PoF's own law — unmeasured is not a pass — points
the same way. The standard stays where it is.
