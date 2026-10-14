---
source: github:gatewai-dev/framefields
kind: repository
url: https://github.com/gatewai-dev/framefields
title: A code-first video engine read for its verification ladder, its lint pass and its review notes
author: gatewai-dev
words: 6115
words_in_tree: 21500
extracted: 7
accepted: 3
declined: 0
leads: 1
already_covered: 2
untriaged: 1
dispatched: 0
applied: 1
shipped: 1
run_id: if1014
siblings: 7
fetches: 0
rescan_when: a release lands after 7263a951 (2026-10-14); or 8 weeks elapse (2026-12-09)
---

# A headless GPU video engine whose agent skills are its operating manual

**Class:** vendor repository over a code-first engine (practitioner account in repository
form). The landing page is 6,115 words; in-tree first-party prose swept is about 21,500
words: the four plugin skills (about 9,000), the compositor skill (3,500), the contributor
rules file, the lint module, the schema-drift test, the preview notes store, the change
set. Expected yield per the class: the operating documents and the instrument. Here the
yield was exactly that: three techniques, each backed by a rule in a skill and an
implementation in the tree. Not swept: `packages/webgpu-renderers` shaders, the 59 node
packages, the audio DSP, the renderer service, the examples.

Live siblings at start: 1 (a harvest run on a game-production subject); 7 by the end, none
holding media-generation. Declared focus from the scorecard (apply stage): met, one
code row shipped in a fleet project.

## Design record (the engine and its skills)

Pinned at `7263a951`. Anchors in the landed applications, 13 of 13 held under
`check-anchors`.

- **D1 verification ladder.** decision: verification is a ladder of artifacts ordered by
  cost, with a named defect class per rung. forces: a long GPU render makes a late failure
  expensive and uninformative. buys: a defect is found at the cheapest rung that can see
  it. rejects: render and look. where: the setup skill, the render skill. corpus: NONE
  (the nearest, cut-compiled-from-source, reads source for relations and says nothing about
  artifacts by cost). Landed as `verify-cheapest-artifact-first`.
- **D2 silent defects.** decision: every quiet default is either an error or a coded
  lint finding. forces: a renderer that draws something for any input hides authoring
  errors in the output. buys: errors surface before the render. rejects: watch the output.
  where: the lint module, the fail-fast change set, the contributor rules heading.
  corpus: NONE (seek-stable-composition-authoring covers one instance, order dependence).
  Landed as `silent-defects-get-a-code-or-an-error`.
- **D3 stateful effects.** decision: vision effects read the previous drawn frame, so
  frames must be rendered in order and stills need a warm-up. forces: a detector needs its
  own prior output. corpus: partial (seek-stable covers frame-index purity, not the
  sanctioned exception). Folded into D1 as the cheap-rung boundary rather than landed as an
  amendment.
- **D4 pinned notes.** decision: review feedback is a note pinned on a frame, stored as
  files an agent reads. forces: prose feedback costs a search. corpus: NONE. Landed as
  `pinned-frame-notes`.

**Routing count:** 4 undocumented decisions across one system, all homed to an existing
subject (`video-assembly`). Per the rule: three or more with an existing home is a
technique triple inside that subject. Not a forge job, no handoff.

## Triage

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Verify the cheapest artifact first | production-ops/video-assembly | new-technique | 3/0/2 | accept (landed, 0 fetches, tree read) |
| 2 | K | technique | M | Silent defects get a code or an error | production-ops/video-assembly | new-technique | 4/0/2 | accept (landed; +1 convergence with the HTML-engine lint in an earlier application) |
| 3 | K | technique | M | Pinned frame notes | production-ops/video-assembly | new-technique | 3/0/2 | accept after the promotion read (`notes.ts` opened); training-data convergence only, no second source |
| 4 | K | amendment | S | Stateful effects are the sanctioned exception to frame-index purity | seek-stable-composition-authoring | boundary | 1/0/1 | untriaged (below +2); the content lives in `verify-cheapest-artifact-first` as the cheap-rung boundary |
| 5 | T | catch | - | Documentation example parsed against the schema as a contract test | engineering-process/build-and-release/test-harness; machine-authored-documentation | none | - | already covered |
| 6 | K | catch | - | A generated catalog is never hand-edited | machine-authored-documentation | none | - | already covered |
| 7 | K | lead | - | Per-frame CPU cost table for each model size | - | dated fact | - | lead: a measured table with a shelf life; return when a second engine publishes a comparable measurement |

Render-bound check (Phase 6b): not render-bound. The three techniques gate and review a
deterministic compile; none changes what a generator is told or how a generated output is
accepted. No render proof run.

## Apply (Phase 7.5)

- `silent-defects-get-a-code-or-an-error`: **code, better, ab-paired** in a fleet ad
  renderer. Seam chosen to falsify the third section (could a character cap plus a
  line-count fit still let drawn text escape the safe zone?). It could: 11 of 21 aspect by
  copy cases overflowed and 10 were cut off at the frame edge; with a width-aware fit, 0
  and 0, ordinary copy unchanged. One loop condition and a pixel-reading probe shipped on
  the project's active branch, not pushed. The project's own experiment ledger was not
  read for this seam (no prior test of overlay fit is known), so the base-rate check is
  owed. Application: `next--silent-defects-get-a-code-or-an-error`.
- `verify-cheapest-artifact-first`, `pinned-frame-notes`: **unapplied**. No fleet project
  with a code-composed video render exposes a ladder or a review-note seam that was read
  this run. Return condition: when a connected project grows a render step with a
  contact-sheet or preview rung, or a review surface over a cut.

## Directions not proposed

`directions=n/a`: the design record's decisions are about the engine's own authoring
loop; no fleet project's `scope.does` admits a code-first video engine's forces.
