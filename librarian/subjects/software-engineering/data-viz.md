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
