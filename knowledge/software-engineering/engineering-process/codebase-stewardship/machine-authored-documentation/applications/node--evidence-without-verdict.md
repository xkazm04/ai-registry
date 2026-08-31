---
layer: application
type: application
subject: machine-authored-documentation
technique: evidence-without-verdict
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: code
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

The measurable, named first: **how many contrast candidates a reader of the
report can tell were never measured.**

Arm A is the shipped code before the change. Arm B is the same code with three
edits. Both arms run the real exported `runVisualContrastFallback` over one
identical stubbed page — only the browser driver is stubbed, never the
detector — with a fixture of eight candidates: the browser arm resolves three
(one failing) and hands five to the pixel arm, where two measure and three
cannot. Every "cannot" is a branch that exists in the shipped code.

| Predicate | Arm A | Arm B |
| --- | --- | --- |
| real findings emitted (must not change) | 2 | 2 |
| real findings byte-identical between arms | — | yes |
| unmeasured candidates visible to a reader | **0** | **3** |
| coverage reported | none possible | `measured on 5 of 8 candidates, 3 unresolved (1 no usable clip rect, 1 stale or invalid selector, 1 too few glyph pixels to sample)` |

Ground truth for the fixture is 5 measured of 8, with those exact three reasons,
so arm B's line is correct and not merely present. The second row is the safety
property: **the change alters what the detector can say, not what it detects.**
Confirmed through the real formatter — the failure count stays at 1 and exit
codes are untouched, because the coverage note is an advisory item.

The three edits, in the project's own vocabulary rather than an invented one:

1. `captureVisualContrastCandidate` returns
   `{ status: 'pass' | 'fail' | 'unresolved', reason }`. This is not new
   vocabulary — the browser-side analyzer has spoken `pass`/`fail`/`unresolved`
   plus a reason all along. **The words existed one layer up and were being
   dropped as they crossed the boundary into the pixel fallback**, which is a
   more interesting defect than an absent vocabulary and a much cheaper fix.
2. A `contrast-coverage` rule in the registry, marked `advisory: true` — the
   class the project already uses for "detected and reported, never counted as a
   failure". Riding the findings array is what keeps the denominator in the same
   object as the numerator, with no signature change anywhere.
3. `runVisualContrastFallback` tallies both arms and emits one coverage note,
   including on the `--no-pixel` early return, and prints the unresolved count
   even when it is zero.

## Three structural facts, and the third arrived during the commit

The stronger evidence is not the seam but the shape of the report it feeds, and
nobody designed any of this.

**One: the report had no vocabulary for a skip.** `detector/findings.mjs` is
eighteen lines and mints exactly one record —
`{ antipattern, name, description, severity, category, file, line, snippet }`
plus an `advisory` flag. A grep for `skipped`, `notChecked`, `denominator` or
`checked` across the CLI and entrypoint returned nothing. So the conflation at
the seam was not a local oversight a careful author would have avoided: every
engine feeding this report had to discard that information however carefully it
was tracked upstream. **A denominator cannot be added at a call site** — it has
to exist in the record type first, which is why the fix is three edits and not
one.

**Two: the vocabulary already existed, one layer up.** The browser-side
`analyzeVisualContrastCandidate` returns `status: 'unresolved'` with reasons as
specific as `stale selector`, `missing element`, `hidden element`,
`unreadable text color`, `text outside viewport`, `not enough readable samples`.
Its caller used that status only to build a set of already-resolved selectors
and dropped the rest. The information was not missing from the system; it died
at a module boundary, which is the same failure the corpus law
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
describes for classifications generally.

**Three: this repository implements the denominator discipline exemplarily —
in a different gate.** Committing the change ran the project's own `doc-sync`
hook, which reports:

```
0 drifted of 35 checked, 0 skipped (unresolvable 0, precondition-absent 0,
instrument-absent 0, record-incomplete 0) — over 35 unit(s) considered
```

Four named skip classes, printed at zero, with an explicitly informational
coverage block that says of itself that it "cannot fail a build" and that "an
informational number that has been rising for months is itself a finding about
the project." That is the corpus technique this one cites, implemented better
than the corpus states it — **in the same repository whose contrast detector
had no denominator at all.** The asymmetry is the finding: a discipline is not
adopted by a codebase, it is adopted by a gate, and the gate next door does not
inherit it.

The fourth observation is about this change's own commit, and it is the defect
demonstrating itself. The pre-commit hook ran `eslint-staged` for 77 seconds and
passed. It passed by not looking: `eslint.config.mjs` ignores
`.claude/skills/**` as vendored agent tooling, and `ALL_TEST_GLOBS` reaches
`lib/`, `features/`, `scripts/` and `packages/*/src/` only. Run directly, eslint
says `File ignored because of a matching ignore pattern` and exits 0. **A green
that means "did not look", indistinguishable from a green that means "looked and
it was clean"** — the exact shape being repaired, one level up, in the gate
doing the repairing. It also means the paired proof is the only verification
this change has, which makes it load-bearing rather than decorative.

## What this realization cannot do

- **It cannot report a rate.** The fixture is one candidate per reachable
  branch, not a sample of a real page, so it proves the denominator is correct
  and says nothing about how often selectors actually go stale here. `puppeteer`
  is absent from the tree, so no live-page arm was run. That is the measurement
  the change makes *possible* and does not itself supply — the first real scan
  after this lands is the one that produces it.
- **It cannot claim the pixel method is correct.** The threshold, the
  eight-pixel glyph floor and the p10 percentile are the instrument's own
  calibration, and this application takes them as given. A denominator over a
  miscalibrated measurement is an honest count of a wrong thing.
- **It cannot survive a suppressed advisory channel**, and it cannot see the
  other four engines — both carried below as open work rather than as
  limitations of the evidence.

## State of the change

**Applied and committed** to the project's default branch as
`detector(contrast): report the denominator — measured, unresolved, and why`
(3 files, +92/-9). Not pushed — the operator pushes after reading the diff.

Two things it does not close:

- `--no-advisory` still suppresses the coverage line, so the denominator can be
  switched off while the numerator keeps printing. The corpus technique wants
  the two inseparable; the project's advisory class was the right existing home
  and this is the price of using it rather than inventing a fourth channel.
- The other four engines hold 31 of the detector's 39 `return null` / `return []`
  sites and were not touched.
