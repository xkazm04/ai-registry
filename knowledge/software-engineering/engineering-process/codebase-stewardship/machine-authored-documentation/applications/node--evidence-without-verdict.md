---
layer: application
type: application
subject: machine-authored-documentation
technique: evidence-without-verdict
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Five ways to return "no finding", and only one of them means the contrast was fine

A design-quality detector ships inside an agent skill in the `politicas`
repository. Its visual engine answers one question per candidate element: does
this text clear its contrast threshold against what is actually rendered behind
it? The method is a pixel diff — screenshot the region, make the text
transparent, screenshot again, treat the changed pixels as glyph coverage and
compute the ratio distribution over them. It is a good instrument, and it is
measuring something no static check can see, which is exactly why its report is
trusted.

`verified_against` is `node@24` on the evidence of `.github/workflows/ci.yml:36`
and `.github/workflows/sentinel.yml:51`, both `node-version: 24`. There is no
`engines` field and no `.nvmrc`, so 24 is the only version the tree attests.

## The seam

`captureVisualContrastCandidate` in
`.claude/skills/impeccable/scripts/detector/engines/visual/screenshot-contrast.mjs`
returns a finding or `null`. It reaches `null` from five places:

| Line | Condition | What actually happened |
| --- | --- | --- |
| 110 | `if (!clip) return null` | the candidate has no usable clip rectangle — **not measured** |
| 150 | `if (!applied) return null` | the selector matched nothing, or threw — **not measured** |
| 174 | `if (!metrics …)` | canvas context, decode, or dimensions failed — **not measured** |
| 174 | `… \|\| glyphPixels < 8` | fewer than eight pixels changed; nothing to judge — **not measured** |
| 176 | `if (measuredRatio >= threshold) return null` | measured, and it passed — **clean** |

The caller collapses them further. In
`engines/browser/detect-url.mjs:153-155`:

```js
const finding = await captureVisualContrastCandidate(page, candidate, viewport);
return finding ? [finding] : [];
```

Four not-measured outcomes and one genuine pass become the same empty array, and
the empty arrays are concatenated into the findings list that becomes the
report. A run in which every selector went stale after a refactor produces
exactly the output of a run in which every element passed.

This is the corpus's
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
and the denominator discipline of
[checked-vs-skipped-denominators](../../docs-sync/techniques/checked-vs-skipped-denominators.md)
arriving together, and — as that technique predicts — **nothing here is
broken.** Every one of the five returns is a branch its author correctly
anticipated. The lie is manufactured one level up, where they are summed.

## The A/B

No live browser arm was runnable: `puppeteer` is not installed in the tree and
the engine is browser-only, so a real-page run was out of reach this session.
The measurable was therefore chosen at the return contract rather than at the
detection rate: **how many of the engine's real outcomes can its caller tell
apart?**

Arm A is a byte copy of the shipped module. Arm B is that file with the five
no-finding returns replaced by a three-state outcome —
`finding` / `checked-clean` / `skipped(reason)` — and nothing else changed.
Both arms ran under one harness, over one path-coverage input set of six cases
(one per reachable outcome), with the caller's `finding ? [finding] : []`
collapse reproduced verbatim. The harness stubs the page object only; both arms
execute the shipped branch logic.

| Predicate | Arm A | Arm B |
| --- | --- | --- |
| distinct outcomes a caller can branch on, of 6 | **2** | **6** |
| not-measured cases indistinguishable from a clean measurement, of 4 | **4** | **0** |
| findings emitted (must not change) | 1 | 1 |

Verdict `better`, and the third row is the one that makes it safe: the
amendment changes what the engine can *say* and not what it *detects*.

The harness itself repaid the discipline it was testing. Its first version
mis-numbered the stubbed `evaluate` calls — the cleanup sits in a `finally` that
runs before the compare, so it is call two, not call three — and the compare was
silently starved of its metrics. Every case fell into the
`capture-compare-failed` branch and arm A reported a uniform `null`, which is
precisely the reading the technique says is unavailable to a caller. A
two-state return could not have shown the harness its own bug; arm B's reasons
did, on the first run.

## The structural fact

The stronger evidence is not the seam but the shape of the report it feeds, and
nobody designed it.

`detector/findings.mjs` is eighteen lines and mints exactly one record:
`{ antipattern, name, description, severity, category, file, line, snippet }`,
plus an `advisory` flag. **There is no skipped record type**, and a grep for
`skipped`, `notChecked`, `denominator` or `checked` across `detector/cli/main.mjs`
and `detector/detect-antipatterns.mjs` returns nothing.

So the conflation at the seam is not a local oversight that a careful author
would have avoided. The report has no vocabulary in which a not-measured
candidate could be expressed, which means every engine feeding it must
eventually discard that information no matter how carefully it was tracked
upstream. The engines contain 39 `return null` / `return []` sites across 2,796
lines in five files; whatever proportion of them are precondition failures, all
of them arrive at a report that can only represent findings.

**A denominator cannot be added at a call site.** It has to exist in the record
type first, which is why the proposed change is three edits and not one: the
three-state return, a skipped record in `findings.mjs`, and a checked/skipped
pair on the report headline.

## What this realization cannot do

- **It cannot report a rate.** The A/B measures the expressiveness of the
  return contract over a path-coverage set, not the frequency of skips on a
  real page. How often a selector actually goes stale in this tree is unknown
  and unmeasured, and the six cases are one per branch rather than a sample.
- **It cannot see the other four engines.** The regex, static-HTML and
  cascade engines hold 31 of the 39 sites and were not classified; the count is
  a bound on where the pattern could be, not a finding about them.
- **It cannot claim the pixel method is correct.** The threshold, the
  eight-pixel glyph floor and the p10 percentile are the instrument's own
  calibration, and this application takes them as given.

## State of the change

Proposed, not applied. The cross-repo lane was not confirmed by the operator on
this run, and no live-page arm was runnable, so the tree carries only a record
in `.ai/applied.jsonl` naming the seam, the measurement and the proposed edit.
It returns when the operator confirms the lane, or when a browser dependency
lands and the detection-rate arm becomes runnable.
