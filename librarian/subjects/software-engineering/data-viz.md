---
subject: data-viz
domain: software-engineering
last_touched: 2026-09-01
touched_by: librarian-inbox-writer
dry_streak: 0
---

# data-viz

First touch: [[2026-08-23-2]], external reconcile against `vega/vega-lite`
@ `4c03edb` (6.4.3). Gained `node--scale-and-axis-design` (uncovered);
single-stack debt cleared. A third hint fate entered the vocabulary:
encoding-vocabulary was PASSED OVER - the compiler owns ~20% of that
technique, and binding would have documented a fraction. Negative claims
verified by capturing the logger; numerics from runtime output.

## Open leads (banked, convergence rule applies)

- Share-resolution is a PER-CHANNEL question, not per-scale: concat wants
  independent position but shared color - "which channels are shared" is the
  finer knob.
- Tick count as a pixel-density expression (ceil(height/40)) - the
  transplantable form of "three to five", surviving responsive layout.
- "Never thin nominal labels - there is no way to infer what the missing
  labels are": quotable, belongs beside the tick guidance.
- Make the honest default UNCONDITIONAL where dishonesty is never legitimate
  (bar/area zero bypassing config) - a second structural pattern beside
  required-domain-input.
- Deviation leads: silently truncated bar charts (explicit domain =
  unappealable authority, zero warnings); a type mismatch silently
  manufacturing a dual axis; the zero/nice asymmetry handing Vega two
  contradictory statements.

## Cross-subject proposals

- mark.invalid policy modes (filter / break-paths / show /
  break-paths-show-domains) -> empty-and-degraded-chart-states, the
  strongest remaining uncovered technique here; same pin reusable.
- The palette half of encoding-vocabulary wants a design-system charting
  layer, not a compiler - target note for a future wave.

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

One lead (personas), re-homed from llm-observability. Landed as an amendment to
`encoding-vocabulary` rather than a new technique: the redundant non-hue channel is itself
an encoding painted in the referencing mark's coordinate space, so per-element rotation
rotates the tile and two textures collapse while the legend keeps both; pin the encoding to
something the mark's transform cannot reach; the grayscale audit does not catch a vocabulary
that dies under rotation. Application `react--encoding-vocabulary` at personas `b6dcf28aa`
(fix `d371c3423`, counter-rotated pattern transform, regression tests). Owed: a cross-link
from llm-observability `glyph-encoded-business-thresholds`.

## Architecture review - 2026-10-31

First architecture review. All 13 documents read in full. The golden path and the six
techniques hold: no claim in them was refuted, and the SVG paint-server claim behind the
2026-09-01 encoding-vocabulary amendment was confirmed against the SVG 2 specification.
The Vega-Lite application was re-read against its pinned commit and every load-bearing
line citation checked; two descriptions are narrower than the source. The consumer
applications that carry no commit pin have drifted: the consumer tree no longer contains
the chart shell and viewport-deferral modules the chart-loading application describes,
and the metric-identity application still describes a resolver edge that its own sibling
application (empty-and-degraded, `applied: code`) changed. The banked open leads above
(per-channel share resolution, pixel-density tick counts, unconditional honest defaults,
`mark.invalid` modes) remain leads, not owed edits. Still owed from 2026-09-01, outside
this subject: the cross-link from llm-observability `glyph-encoded-business-thresholds`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/data-viz",
  "date": "2026-10-31",
  "baseline": "a1e825611",
  "digest": "sha256-b2:0a15845e9dc44963",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full (golden path, six techniques, six applications). Primary checks: Vega-Lite source at the pinned commit (five files), SVG 2 paint servers chapter, and the current consumer tree for the unpinned React applications. No software was executed.",
  "counterexamples": [
    "A heterogeneous metric matrix legitimately normalizes per row; the micro-visualizations technique already scopes the shared-scale mandate to same-metric cells.",
    "A Vega-Lite concat legitimately keeps theta/radius independent as well as x/y, so 'independent for position' is wider than the x/y reading.",
    "A refactor can fix the forked-sparkline defect at one cited site (the KPI tile now reads a shared scale module) while the sibling site keeps the sample-anchored floor, so a dated census goes stale in both directions.",
    "A length-encoded glyph at value zero renders nothing; without a track it is indistinguishable from unmeasured, which the empty-states technique names explicitly."
  ],
  "sources": [
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/scale/properties.ts",
      "result": "zero(): custom domain returns false unless it straddles zero ('if the domain includes zero, make zero remain true'); isBarOrArea && !hasSecondaryRangeChannel returns true before scaleConfig.zero. Confirms application sections 1-2."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/resolve.ts",
      "result": "defaultScaleResolve: facet shared except theta; layer shared; concat independent for 'isXorY(channel) || isXorYOffset(channel) || isPolarPositionChannel(channel)'. Application omits the polar channels."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/axis/properties.ts",
      "result": "defaultTickCount returns {signal: `ceil(${size.signal}/40)`} (binned: /10); size is the axis length, not height specifically. Month/hours/day/quarter return undefined. Confirms section 5 with one wording correction."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/scale/parse.ts",
      "result": "Conflicting layer scale types set resolve.scale[channel] = 'independent' and delete the merge entry, no log.warn on that branch. Confirms section 4."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/scale.ts",
      "result": "defaultScaleConfig zero: true at :481. Confirms section 1."
    },
    {
      "url": "https://www.w3.org/TR/SVG2/pservers.html",
      "result": "userSpaceOnUse: 'the user coordinate system for the element referencing the pattern element via a fill or stroke property ... and then applying the transform specified by attribute patternTransform'; gradients: 'When the object's bounding box is not square, the gradient normal ... may render non-perpendicular'. Confirms the encoding-vocabulary amendment and its gradient corollary."
    },
    {
      "source": "Consumer tree (personas) at current HEAD, read not run",
      "result": "resolveMetricPercent returns number | null; RechartsWrapper LazyChart still defaults fallback = null; dimPatterns patternTransform counter-rotation present; MetricChart.tsx and the sub_usage viewport LazyChart.tsx absent; KpiTile now reads a shared sparklineScale module; kpiMath sparklinePoints still sample-anchored; directorScore moved to companions/overseer."
    }
  ],
  "documents": {
    "data-viz.md": {
      "disposition": "keep",
      "reason": "Scope (chart vs table vs tile vs micro-viz), the self-carried-scale test, five honesty rules and accessibility posture are consistent with every technique; no claim refuted."
    },
    "techniques/metric-identity.md": {
      "disposition": "keep",
      "reason": "Contract members including measured resolution, registered variants carrying the whole contract, provenance surviving merges, and parity gates over shared fixtures are coherent and grounded in the applications."
    },
    "techniques/scale-and-axis-design.md": {
      "disposition": "keep",
      "reason": "Decision procedure, sample-anchored floor, required-domain door plus census of bypasses, zero-baseline rules, time-axis rules hold; the Vega-Lite reconcile confirms the defaults. Banked leads (pixel-density ticks, per-channel resolution) are additions, not corrections."
    },
    "techniques/chart-loading-economics.md": {
      "disposition": "keep",
      "reason": "Lazy engine, shared placeholder, required loading affordances, fail-open visibility gate, per-chart boundary with telemetry are internally consistent; no unstable external claim."
    },
    "techniques/micro-visualizations.md": {
      "disposition": "keep",
      "reason": "Shared-scale mandate correctly scoped to same-metric cells, denominator families named, threshold rule only when the threshold is real; consistent with scale and empty-state techniques."
    },
    "techniques/encoding-vocabulary.md": {
      "disposition": "keep",
      "reason": "Pattern tiles resolve in the referencing element's user space and patternTransform applies independently, gradient shear under non-square objectBoundingBox: both confirmed in SVG 2."
    },
    "techniques/empty-and-degraded-chart-states.md": {
      "disposition": "keep",
      "reason": "Four facts, gaps vs zero carried by the value type, structural-minimum degradation and the track rule for length encodings are coherent; the React application supplies the evidence."
    },
    "applications/node--scale-and-axis-design.md": {
      "disposition": "clarify",
      "reason": "Pinned source confirms every cited line, but section 3 says concat is independent for x/y and x/y-offset only (source also includes polar position channels) and section 5 writes the tick signal as ceil(height/40) where the source divides the axis size (width on x)."
    },
    "applications/react--chart-loading-economics.md": {
      "disposition": "reverify",
      "reason": "No commit pin; at the consumer's current HEAD MetricChart.tsx and the sub_usage viewport-deferral LazyChart.tsx no longer exist, so the canonical-panel, name-collision and census sections cannot be confirmed. Needs a re-census pinned to a commit. The fallback = null default it criticises is still present."
    },
    "applications/react--empty-and-degraded-chart-states.md": {
      "disposition": "keep",
      "reason": "Pinned at bf2a1e249; the consumer's current resolver matches the B arm (number | null with a doc comment). Limits section is honest."
    },
    "applications/react--encoding-vocabulary.md": {
      "disposition": "keep",
      "reason": "Pinned at b6dcf28aa; counter-rotation still present in the current tree; mechanism confirmed by SVG 2; limits stated."
    },
    "applications/react--scale-and-axis-design.md": {
      "disposition": "keep",
      "reason": "Pinned at the ascent tree 62c252dd; the required-door projection, the data-derived zero-anchored ceilings, the NaN-to-floor deviation and the two bypassing glyphs are stated with their limits (source-read only, bypass count a floor). Consistent with the amended scale technique; consumer tree not re-read this run."
    },
    "applications/react--metric-identity.md": {
      "disposition": "clarify",
      "reason": "Two internal inconsistencies: it cites 'the counter-example the golden path's frontmatter carries' (the golden path frontmatter carries none), and it describes resolveMetricPercent returning 0 without noting the sibling empty-and-degraded application changed that edge to null. Also unpinned and drifted (KpiTile now uses a shared scale module; directorScore moved), which is reverify work beyond this clarify."
    }
  }
}
```

### Re-record after apply - 2026-10-31

The two applications marked clarify were edited minimally. The node application's edits come from the pinned source opened this run; the metric-identity edits fix an internal misattribution and cross-reference a sibling application. What remains is reverify work on the two unpinned React applications.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/data-viz",
  "date": "2026-10-31",
  "baseline": "602b39448",
  "digest": "sha256-b2:2dc4332b7867572a",
  "disposition": "reverify",
  "coverage": "All 13 documents read in full (golden path, six techniques, six applications). Primary checks: Vega-Lite source at the pinned commit (five files), SVG 2 paint servers chapter, and the current consumer tree for the unpinned React applications. No software was executed. Second record after applying the two confident clarify edits; remaining owed work is reverify on the two unpinned React applications.",
  "counterexamples": [
    "A heterogeneous metric matrix legitimately normalizes per row; the micro-visualizations technique already scopes the shared-scale mandate to same-metric cells.",
    "A Vega-Lite concat legitimately keeps theta/radius independent as well as x/y, so 'independent for position' is wider than the x/y reading.",
    "A refactor can fix the forked-sparkline defect at one cited site (the KPI tile now reads a shared scale module) while the sibling site keeps the sample-anchored floor, so a dated census goes stale in both directions.",
    "A length-encoded glyph at value zero renders nothing; without a track it is indistinguishable from unmeasured, which the empty-states technique names explicitly."
  ],
  "sources": [
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/scale/properties.ts",
      "result": "zero(): custom domain returns false unless it straddles zero ('if the domain includes zero, make zero remain true'); isBarOrArea && !hasSecondaryRangeChannel returns true before scaleConfig.zero. Confirms application sections 1-2."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/resolve.ts",
      "result": "defaultScaleResolve: facet shared except theta; layer shared; concat independent for 'isXorY(channel) || isXorYOffset(channel) || isPolarPositionChannel(channel)'. Application omits the polar channels."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/axis/properties.ts",
      "result": "defaultTickCount returns {signal: `ceil(${size.signal}/40)`} (binned: /10); size is the axis length, not height specifically. Month/hours/day/quarter return undefined. Confirms section 5 with one wording correction."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/compile/scale/parse.ts",
      "result": "Conflicting layer scale types set resolve.scale[channel] = 'independent' and delete the merge entry, no log.warn on that branch. Confirms section 4."
    },
    {
      "url": "https://github.com/vega/vega-lite/blob/4c03edb/src/scale.ts",
      "result": "defaultScaleConfig zero: true at :481. Confirms section 1."
    },
    {
      "url": "https://www.w3.org/TR/SVG2/pservers.html",
      "result": "userSpaceOnUse: 'the user coordinate system for the element referencing the pattern element via a fill or stroke property ... and then applying the transform specified by attribute patternTransform'; gradients: 'When the object's bounding box is not square, the gradient normal ... may render non-perpendicular'. Confirms the encoding-vocabulary amendment and its gradient corollary."
    },
    {
      "source": "Consumer tree (personas) at current HEAD, read not run",
      "result": "resolveMetricPercent returns number | null; RechartsWrapper LazyChart still defaults fallback = null; dimPatterns patternTransform counter-rotation present; MetricChart.tsx and the sub_usage viewport LazyChart.tsx absent; KpiTile now reads a shared sparklineScale module; kpiMath sparklinePoints still sample-anchored; directorScore moved to companions/overseer."
    }
  ],
  "documents": {
    "data-viz.md": {
      "disposition": "keep",
      "reason": "Scope (chart vs table vs tile vs micro-viz), the self-carried-scale test, five honesty rules and accessibility posture are consistent with every technique; no claim refuted."
    },
    "techniques/metric-identity.md": {
      "disposition": "keep",
      "reason": "Contract members including measured resolution, registered variants carrying the whole contract, provenance surviving merges, and parity gates over shared fixtures are coherent and grounded in the applications."
    },
    "techniques/scale-and-axis-design.md": {
      "disposition": "keep",
      "reason": "Decision procedure, sample-anchored floor, required-domain door plus census of bypasses, zero-baseline rules, time-axis rules hold; the Vega-Lite reconcile confirms the defaults. Banked leads (pixel-density ticks, per-channel resolution) are additions, not corrections."
    },
    "techniques/chart-loading-economics.md": {
      "disposition": "keep",
      "reason": "Lazy engine, shared placeholder, required loading affordances, fail-open visibility gate, per-chart boundary with telemetry are internally consistent; no unstable external claim."
    },
    "techniques/micro-visualizations.md": {
      "disposition": "keep",
      "reason": "Shared-scale mandate correctly scoped to same-metric cells, denominator families named, threshold rule only when the threshold is real; consistent with scale and empty-state techniques."
    },
    "techniques/encoding-vocabulary.md": {
      "disposition": "keep",
      "reason": "Pattern tiles resolve in the referencing element's user space and patternTransform applies independently, gradient shear under non-square objectBoundingBox: both confirmed in SVG 2."
    },
    "techniques/empty-and-degraded-chart-states.md": {
      "disposition": "keep",
      "reason": "Four facts, gaps vs zero carried by the value type, structural-minimum degradation and the track rule for length encodings are coherent; the React application supplies the evidence."
    },
    "applications/node--scale-and-axis-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: concat independence now names the polar position channels; tick signal written ceil(size/40) with the axis length stated, per the pinned source. verified_on left at 2026-08-23 (no runtime re-run)."
    },
    "applications/react--chart-loading-economics.md": {
      "disposition": "reverify",
      "reason": "No commit pin; at the consumer's current HEAD MetricChart.tsx and the sub_usage viewport-deferral LazyChart.tsx no longer exist, so the canonical-panel, name-collision and census sections cannot be confirmed. Needs a re-census pinned to a commit. The fallback = null default it criticises is still present."
    },
    "applications/react--empty-and-degraded-chart-states.md": {
      "disposition": "keep",
      "reason": "Pinned at bf2a1e249; the consumer's current resolver matches the B arm (number | null with a doc comment). Limits section is honest."
    },
    "applications/react--encoding-vocabulary.md": {
      "disposition": "keep",
      "reason": "Pinned at b6dcf28aa; counter-rotation still present in the current tree; mechanism confirmed by SVG 2; limits stated."
    },
    "applications/react--scale-and-axis-design.md": {
      "disposition": "keep",
      "reason": "Pinned at the ascent tree 62c252dd; the required-door projection, the data-derived zero-anchored ceilings, the NaN-to-floor deviation and the two bypassing glyphs are stated with their limits (source-read only, bypass count a floor). Consistent with the amended scale technique; consumer tree not re-read this run."
    },
    "applications/react--metric-identity.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: dropped the false 'golden path's frontmatter' attribution; noted the resolver edge since widened to number | null by the sibling application. Still owed: unpinned and drifted (KpiTile now reads a shared sparklineScale module, directorScore moved to companions/overseer, kpiMath sparklinePoints still sample-anchored); the forked-sparkline and mirror sections need a re-read pinned to a commit."
    }
  }
}
```
