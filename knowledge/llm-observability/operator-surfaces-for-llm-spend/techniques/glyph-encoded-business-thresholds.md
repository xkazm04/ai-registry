---
layer: technique
type: technique
subject: operator-surfaces-for-llm-spend
technique: glyph-encoded-business-thresholds
status: forged
laws: [nullable-never-zero, never-present-absence-as-an-answer]
shared_with: []
use_when:
  - rendering ranked financial or health tables for triage
  - encoding a severity rule that several reports must agree on
---

# Glyph-encoded business thresholds

A triage table works when the operator's eye finds the problem rows before the
brain reads a single number. The technique: **pre-compute the business
judgment per row and render it as a tiny fixed vocabulary of status glyphs in
the leading column — and treat the glyph function as the single authoritative
statement of the business rule.**

## The shape of the rule

A good glyph vocabulary is three states, ordered by urgency, with the rule
stated in the function's own documentation:

- **loss** — the row is negative in absolute terms (margin below zero, limit
  breached). Unconditional; no percentage can soften a negative dollar.
- **warning** — positive but inside a named band: margin under roughly twenty
  percent, a limit at or past eighty percent of threshold. The band is the
  business's early-warning line; tune the number to your cost structure, keep
  the three-state shape. Derive the band from the business's target margin,
  not from intuition — for inference-heavy products the viable target sits
  well above where "thin" sounds alarming, so a twenty-percent line is a
  floor for the warning, not a norm for health.
- **healthy** — everything else. Healthy must be visually quiet; a wall of
  affirmative glyphs is noise that buries the two rows that matter.

Two orthogonal refinements complete the vocabulary. **Signed deltas**: any
column expressing a change under a hypothesis or between periods renders an
explicit leading plus on gains, because "+$13.00" and "$13.00" are different
claims and the sign *is* the finding. A delta gets its own glyph triple
(improves / neutral / worsens) distinct from the level glyphs, since "this
what-if helps" and "this row is healthy" are different judgments. **Absence**:
a row whose ratio could not be computed — cost with no revenue, an unpriced
window — renders an em-dash in the value cell and takes its glyph from the
terms that *were* measured (a negative dollar margin is a loss regardless of
its undefined percentage). Never route an absent value through the threshold
comparison: null read as zero would grade exactly the least-vetted rows, and a
glyph is an answer, which absence is not.

## Procedure

1. Write one pure function per judgment: inputs are the measured terms
   (signed amount, optional ratio), output is the glyph. Document the rule in
   the function ("loss / thin < 20% / healthy") so the code is the policy's
   home.
2. Call it from the shared render layer only. Every report that shows the same
   quantity shows the same glyph for the same data — rollup, trend, drilldown,
   what-if actuals column.
3. Place the glyph at the row's leading edge, fused to the key ("🔴 acme"),
   so it survives copy-paste into chat and the ranking plus glyph tell the
   story even when the numbers are elided.
4. Keep prompts and journey instructions aligned with the vocabulary: an agent
   told to "call out every negative-margin row" should be told it by glyph
   name, so the model keys on the renderer's own signal instead of re-deriving
   the threshold.

## Decision rules

- One threshold, one function. The moment a warning band is re-stated as a
  literal in a second surface, the surfaces will disagree after the first
  tuning. If a query-driven panel must replicate the band, cite the function
  as the source of truth in the query's comment and change them together.
- Glyphs grade rows; they never replace values. The number stays in the row —
  the glyph is an index into it, not a substitute for it.
- Resist vocabulary growth. Five severity levels feel expressive and render
  as mush; if a new distinction genuinely matters, it usually belongs in a
  separate column (a trend arrow beside a level glyph), not a fourth color.
- Choose glyphs that degrade to plain text: rendering must survive terminals,
  logs, and transcripts without a legend. Pair every glyph-driven instruction
  with its meaning at least once per report family.

## When not to use it

Accounting exports and reconciliation feeds carry values only — a severity
glyph in a feed consumed by a spreadsheet is stray data. And do not glyph a
column whose threshold the business has not actually decided; an invented
band rendered confidently becomes policy by accident. Ship the plain number
until the rule exists, then encode the rule.
