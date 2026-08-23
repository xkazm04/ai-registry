---
layer: application
type: application
subject: data-viz
technique: scale-and-axis-design
stack: node
verified_on: 2026-08-23
---

# Scale and axis design in the Vega-Lite compiler (Node)

How the canonical grammar-of-graphics compiler decides a chart's scale when the
author did not. Citations are against `vega-lite` 6.4.3, `vega/vega-lite` commit
`4c03edb` (2026-08-14). This is a reconciliation against an external,
world-class tree — not the consumer repo the sibling applications cite — so the pin
lives here in prose rather than in `verified_against`. Claims marked *(runnable)* were
produced by compiling a spec with the published 6.4.3 package, not read off the source.

## 1. Zero is the default floor for every continuous position scale

`defaultScaleConfig.zero = true` (`src/scale.ts:481`), and `zero()`
(`src/compile/scale/properties.ts:418-482`) falls through to it for any
non-binned quantitative x/y (`:478`). *(runnable)* compiling one two-point spec as
`bar`, `area`, `line`, and `point` yields `{"type":"linear","zero":true,"nice":true}`
on the y scale in all four cases. The technique's "where the library's own default
is already zero-anchored, the rule inverts into *do not touch the domain except to
widen it*" is the factory setting here — and it covers lines and dots, not just bars.

Length marks get a stronger guarantee: `isBarOrArea(type) && !hasSecondaryRangeChannel`
returns `true` unconditionally rather than deferring to config (`:474-476`), so a bar
without an explicit `x2`/`y2` keeps its baseline even if a theme turns
`config.scale.zero` off. The exception is the mark's *dimension* axis —
`bar`/`area`/`line`/`trail` return `false` on the channel along their orient
(`:468-472`) — correctly, since zero is a claim about magnitude and that axis
carries none.

`nice()` (`:262-280`) returns `true` for x/y and `undefined` elsewhere — round
tick boundaries on the axes a reader actually decodes, nowhere else. It
withdraws the moment the author says something specific: a binned field, an
array `domain`, or a non-null `domainMin`/`domainMax` (`:271-275`). Time and UTC
scales opt out too, since nicing a temporal domain is a bucketing decision.

## 2. Deviation: custom domains are honored, including the forbidden ones

`zero()` opens by checking for an author-supplied domain and returning `false`
if there is one — unless the interval straddles zero, in which case zero
"remains true" (`:429-443`), handing `[-5, 100]` its baseline back instead of a
redundant override. But the clause is unguarded for length encodings:
*(runnable)* `mark: "bar"` with `scale: {domain: [90, 100]}` compiles to
`{"domain":[90,100],"zero":false}` and emits **no warning** — a truncated bar
chart, which the technique names as having no legitimate form, produced silently
through the sanctioned door. The compiler spends warnings freely one function
away (§4), so the silence is a decision: an explicit domain is the author's
authority. The standard stays — and a product on this engine has to lint
`scale.domain` on bar and area marks itself.

## 3. Shared vs independent is declared per composition operator

The technique's "will the reader compare this chart with anything else?" is
answered structurally in `defaultScaleResolve()` (`src/compile/resolve.ts:6-16`):

- **layer** → `shared`, always. Overlaid marks are the strongest comparison
  claim there is, so no channel escapes.
- **facet** → `shared` for every channel but `theta`. Small multiples get the
  fixed common scale the technique demands by default, not by discipline.
  *(runnable)* a faceted line chart emits exactly two scales, `x` and `y`.
- **concat** → `independent` for x/y and x/y-offset, `shared` for the rest. Worth
  stealing: concatenated panels are usually *different metrics* sharing a page, so
  position must not be unioned, while color must still mean one thing across the
  figure. *(runnable)* an `hconcat` of two identical charts emits `concat_0_x`,
  `concat_0_y`, `concat_1_x`, `concat_1_y` — no top-level x or y.

Under `shared`, child domains are unioned rather than recomputed:
`parseNonUnitScaleDomain()` (`src/compile/scale/domain.ts:103-143`) folds every
child's `domains` together and `mergeDomains()` (`:556`) collapses duplicates.
Per-panel sorts that cannot survive the union are dropped *with* a warning
(`domainSortDropped`, `:630`; `MORE_THAN_ONE_SORT`, `:599`) — the cost of a
shared scale, stated out loud.

## 4. Deviation: the shared→independent downgrade fabricates a dual axis

When two layers want one channel at incompatible scale types,
`parseNonUnitScaleCore()` flips resolution to `independent` and drops the merge
entry (`src/compile/scale/parse.ts:105-110`) — with no `log.warn` on that
branch. Downstream `parseLayerAxes()` sees two independent axes on one channel
and **moves the second to the opposite side** via `OPPOSITE_ORIENT`
(`src/compile/axis/parse.ts:78-86`).

*(runnable)* layering a quantitative `line` over a nominal `bar` on `y` compiles
to `layer_0_y:linear` and `layer_1_y:band` with axes at `left`, `left`, `right`
— and zero warnings. "Dual axes: almost never" is reached here as the
*automatic* outcome of a type mismatch the author may not know they wrote. The
engine is fluent in the idiom: `:96-102` suppresses gridlines on every axis
after the first "for dual-axis chart" — the technique's gridline discipline,
applied to a construction the technique says should barely exist.

## 5. Tick density is a function of pixels, not a constant

`defaultTickCount()` (`src/compile/axis/properties.ts:293-323`) emits the Vega signal
`ceil(height/40)` for continuous non-log scales — one tick per 40 pixels, so "three to
five per axis" becomes a density that survives resize rather than a number that stops
holding. Binned axes get `ceil(size/10)` to stay under `maxbins`; log and discrete
scales get no count; month/hours/day/quarter time units return `undefined` so Vega
ticks on calendar boundaries.

`defaultTickMinStep()` (`:325-340`) makes "round numbers in the data's unit"
mechanical: format `d` pins the step to `1` (no 2.5 on a count axis), a `timeUnit`
pins it to that unit's duration. `defaultGrid()` (`:121-123`) turns gridlines on
only for continuous, unbinned field scales, and `defaultLabelOverlap()`
(`:278-287`) thins overlapping labels for quantitative and temporal axes but never
for nominal — "there is no way to infer what the missing labels are," the same
honest refusal the empty-states technique asks for.

## Reconciliation summary

Confirmed: zero as the default floor for continuous position scales, hardened for
length marks; nice domains on position channels only, self-suppressing under a stated
bound; shared-by-default scales for layer and facet with domain union; independent
position scales for concat; pixel-density tick counts; unit-aware minimum tick steps;
grid and label-overlap defaults keyed to scale type; and a working warning vocabulary
elsewhere — unsupported explicit scale types (`src/compile/scale/type.ts:42-53`), `zero`
on a log scale (`src/scale.ts:837-850`, message `src/log/message.ts:329`), independent
scale under a shared guide (`src/compile/resolve.ts:22-26`).
Deviations: an explicit `scale.domain` yields a truncated bar chart with no
warning; an incompatible layer scale type silently downgrades to independent and
auto-places a second axis opposite, manufacturing a dual-axis chart nobody asked
for. Not present by scope: the partial trailing bucket, timezone choice for daily
boundaries, and stable-scale-across-refresh policy — this compiler sees one spec
at a time and knows nothing of a previous render or of "now", so those land on
whatever generates the spec.
