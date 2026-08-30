---
domain: software-engineering
subject: diff-comparison
last_touched: 2026-08-30
touched_by: deepen
dry_streak: 0
---

# diff-comparison

First touch: [[2026-08-30-1]], scoped `/deepen` under the librarian sweep. Ranked #6 (43
points) on the corrected worklist; it had read 83 under the double-counted demand.

## The subject refuted its own framing

**"Side-by-side is the review mode" — REFUTED**, and this was the highest-value finding
because the golden path's audience selection rested on it.

The one controlled study located (eye-tracked bug detection, within-subjects, small n)
measured *lower* visual effort in **unified**, less time navigating and more analyzing,
and marginally more defects found there — the opposite direction, though not
significantly so at that sample size. A widely-read practitioner argument reaches a
third conclusion entirely.

The correction does **not** flip the claim, which would repeat the original error in the
other direction. It narrows to what survives: the modes differ in what they make cheap,
and the choice between them is **a remembered reader preference, not an inference from
the task**. A surface that forces a mode on the grounds that it knows the reader's task
is asserting something the literature does not support.

## The boundary verdict (the judgment the dispatch asked for)

The subject spans compute / render / reconcile. It **does** drift — but a split is the
wrong fix and none was made.

- **Reconcile is already clean** — conflict policy and verdict are handed to neighbours.
- **Compute genuinely leaks**, and the golden path's own thesis justifies it: a diff is a
  claim about a pair, and computation choices are in scope because they decide what the
  surface may claim. The subject just **never said so**.
- Landed as a boundary statement with two tests: the near boundary is *could a reader be
  misled by this answer*; the far boundary is *is anything being decided*.

## New technique: `invisible-differences` (7 techniques)

Lane convergence, ranked **#2 by the blind lane and #1 by the web lane** independently.
Differences that occupy no visible extent, or the extent of a character they are not.

Two directions. The benign one: a row marked changed whose sides look identical, which
does not read as "look closer" but as "this surface is broken", generalized instantly to
every other row. **One unexplainable highlight costs more trust than ten missing ones.**
The adversarial one: bidirectional-override reordering and glyph-identical substitution —
catalogued attacks against review surfaces that landed against *every* surface examined
at once, which is the signature of a class defect, not anybody's bug.

Read as `gate-sees-target` with the reader as the gate: **the reader's view and the
executed artifact must not be able to disagree.**

## Other counter-evidence

- **"Hash pre-check short-circuits for free" — REFUTED.** Hashing reads both inputs end
  to end; direct comparison exits at first mismatch. Now a cost-ordered ladder, plus: a
  non-cryptographic checksum answering "no differences" is a wrong answer waiting.
- **Prefix/suffix stripping — nuanced.** Correctness-safe, not minimality- or
  attribution-safe.
- **Move detection — confirmed and sharpened.** It fails in both directions by a number
  somebody picked, and different implementations ship different thresholds, so two
  surfaces disagree on the same pair.
- **Keyed alignment — confirmed, left untouched.** The technique already hedges better
  than its summary did.

## Version witness

Four applications moved from no witness to one (`react@19` three times, `rust@1.97`).
`react--drift-against-declared` came back **fully dry** — every citation resolves, every
recorded defect still present — and is recorded as a dry re-check rather than padded.

## A convention question this run raised

This worker cites WCAG success criteria **inside a technique**, where corpus convention
had kept them in applications (seven of eight prior citations) and one subject golden
path. The Director accepted it: an open standard is a checkable external anchor, not a
product name, and naming the criterion raises transplantability. Flagged because the
[[app-shell]] worker in the same batch read the same rule the opposite way and lost a
`spec--` application to it. Resolved in [[standard]].

## Cross-subject proposals

- **`drift-against-declared` may be in the wrong home** — no rendering content, reads as
  operations/governance in a `data-display` subject. Placement call outstanding.
- **Navigation at scale belongs to `table`**, not here. Both lanes converged, but it is
  the large-list problem and `table` sits next door.
- **`accessibility` has no use-of-color coverage and no linearization guidance.** Two
  items belong there: a two-pane diff has *no correct linear reading order*, so an
  accessible surface must offer unified as a first-class alternate; and standard
  insertion/deletion markup is **not announced by most screen readers by default**.
- Intra-line refinement as a budgeted self-degrading layer; a published comparison
  taxonomy (juxtaposition / superposition / explicit encoding) that would restructure
  `presentation-modes` rather than extend it — too large for a worker.

## Dry

No empirical answer on the right number of context lines (three is a convention, not a
finding). No portable threshold for disabling intra-line refinement. **No accessibility
guidance written specifically for diff UI** — no WCAG technique, no ARIA pattern.
