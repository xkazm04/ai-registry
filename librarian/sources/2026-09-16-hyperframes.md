---
source: github:heygen-com/hyperframes@3704863d
kind: repository
class: vendor repository (a deterministic HTML-to-video render engine, design-deep)
url: https://github.com/heygen-com/hyperframes
title: "HyperFrames - Write HTML. Render video. Built for agents."
author: heygen-com
words: 2520 landing / ~203,320 in-tree markdown (1,088 doc files, 203 release notes)
extracted: 15
accepted: 1
declined: 0
untriaged: 4
leads: 3
already_covered: 5
applied: 2
shipped: 1
dispatched: 0
run_id: intake-hyperframes-0916
siblings: 4
rescan_when: "the FrameAdapter interface leaves experimental v0 (docs/concepts/frame-adapters.mdx carries an explicit pre-v1 warning), or a lint rule lands that flags an implicit-start writer with no relative operator - the gap this run's fleet seam demonstrated; or 10 weeks elapse (2026-11-25)"
---

# HyperFrames: the compile step has a contract, and sequential preview is the one path that cannot check it

Operator constrained routing to `media-generation`. Expected yield for a
vendor repository: its docs' rules page and its client's types — catches, a
mechanism or two, no subject. That is roughly what happened, with the landing
coming from the tree's static analyzer rather than from anything the README
says.

**Siblings at claim: 4** (`intake-yt-JEnO3a87RwQ` holding
`marketing/.../zero-budget-channel-planning`; `intake-executor-0916`;
`intake-squid-0916`; `mwd-web-0916`). None held `media-generation`. The bundle
moved under this run mid-flight — two applications appeared in
`media-generation` between Phase 1 and Phase 7, from the
`live-system-demo-film` sibling — which is the Phase 4 warning behaving
exactly as documented.

## What was swept

Cloned at `3704863d`. The landing page is 2,520 words; the tree carries
~203,320 words of markdown. `DESIGN.md` is a **brand style guide**, not an
architecture document — a useful reminder that the sweep order is by yield
density, not by filename promise. The density was in `docs/concepts/`
(determinism, frame adapters, compositions, variables), `docs/deploy/` (the
per-platform refusals), and above all `packages/lint/` (~18,700 lines), the
composition analyzer that *implements* the rules the docs merely name.

Read for reusable engineering as well as claims: the analyzer's rule
comments are the densest first-party material in the tree, because each one
argues its own exemptions.

## Design record

One system: the deterministic render pipeline.

| # | Decision | corpus |
| --- | --- | --- |
| D1 | Render by seeking an integer frame index, never by playing; fps/size/variables locked before frame 0 | `video-assembly` owns compile-from-source but treats the compile as a black box — **NONE** for the compile's own contract |
| D2 | The determinism obligation is published as an extension interface (`FrameAdapter`), not kept as a house rule | partial — `engine-host-contract` models host/guest contracts generically |
| D3 | Order-dependent authoring is caught **statically**, because running it sequentially is the path that hides it | **NONE** |
| D4 | One invariant (chunk-boundary reproducibility), three enforcement layers — composition, runtime backend, encoder — each refusing what only it can see | **NONE** |
| D5 | One rule engine serves CLI, render gate and a browser entry with zero `node:` builtins | partial — `quality-gates` |
| D6 | A container pins the platform out of the input set | catch |

**Routing count: 3 NONE in one system (D1, D3, D4), and all three share one
`HOME IF NEW` — `media-generation/production-ops/video-assembly`, which
already exists.** Per 2.2 that is a technique cluster inside an existing
subject, not a forge handoff. No handoff dispatched; the count is recorded
rather than inferred. D1 and D4 were folded into the landed technique rather
than split, because neither carries a decision rule the other does not imply.

## Triage

Only upper-layer rows are scored; currency and leads run under the
corroboration table.

| # | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | technique | M | Composition state must come from the frame index | `production-ops/video-assembly` | new-technique | real gap | **3/0/2** | **accept** |
| 2 | design | S | Frame-adapter contract as published extension point | `engine-host-contract` | none | likely catch | 1/2/1 | untriaged |
| 3 | design | S | One rule engine, three consumers, browser-safe entry | `quality-gates` | none | likely catch | 1/1/1 | untriaged |
| 4 | claim | S | Hostile codecs transcoded to proxies across preview/render/archive | `platform-format-adaptation` | none | partial | 1/2/1 | untriaged |
| 5 | claim | S | SVG draw-on measurement pitfalls | — | none | thin | 1/2/1 | untriaged |
| 6 | amendment | S | The corpus's order-independence rule denies too much | `encounter-balance-simulation` (game-production) | corrects-claim | real gap | — | **lead** (out of declared domain) |

Row 1: `auto=1/0/0`, `fp=0`. GAIN 2 (new technique in a subject outside the
scan's top 15) **+1 convergence** — the corpus reached the same root rule
independently in `per-cell-seed-derivation-for-order-independence`, from a
different domain and without this source. RISK 0: the director opened the
tree *and* measured the claim rather than accepting the analyzer's comment.
COST M. Appends beside `cut-compiled-from-source` without falsifying any of
its sentences, so no rewrite penalty.

## What was measured, not believed

The source asserts that cold workers diverge on relative tween bases. That
was tested rather than quoted, at the timeline-library layer, headless, no
browser:

- **Second writer + relative value**: sequential walk vs two workers splitting
  at the midpoint → **45 of 90 frames differed**, seam step 26.67 against a
  normal 1.67.
- **Explicit endpoints**: 0 of 90.
- **Single writer + relative value (control)**: 0 of 90 — *the control held*,
  which is what earns the discriminator. Had it diverged the technique would
  have had to ban relative values outright.

A first attempt returned identical numbers on every arm. That was not a tie —
the ESM import hoisted above the DOM shims, so the animation engine never
ran. Caught by the `paired-ab-tie-means-nothing-ran` rule; the corrected
harness varied as expected.

## Phase 6b: render proof not run, and why

The home generates pictures, so the render-proof trigger fires on its face.
It was not run, deliberately. That phase exists because automated instruments
in these bundles are calibrated for *consistent* while the question is
*better*, so a human must triage blind. Here the question is neither taste nor
quality — it is **identical or divergent**, which is exactly what an automated
instrument settles and an eye cannot. The frame-level comparison above is the
render proof in the only form the finding admits; there is no model, no seed
and nothing for an operator to prefer. Recorded rather than skipped silently.

## Landed

- **Technique** `video-assembly/seek-stable-composition-authoring` — every
  value a frame shows must be derivable from the frame index; the hazard is a
  **second writer with an implicit start**, not a relative value; enforce at
  the layer that can see the violation.
- Golden-path bullet in `video-assembly` naming the entry-path obligation.
- **Application** `node--` against the source tree (experiment, better,
  ab-paired; 8 of 8 anchors held against the clone).
- **Application** `react--` against the fleet seam (code, better, ab-paired).

## Shipped

`systedo-case@b95a43a4` — the rank-climb demo's Replay inherited its own
in-flight reset, so the counters travelled **33%** of the rank climb and
**40%** of the visibility climb a first run travelled. Explicit endpoint on
the replay path restores 100% of both; all arms still settle on the shipped
figures (the declared floor). Typecheck and lint green, 17 insertions / 5
deletions, not pushed.

**The seam widened the source's rule.** The analyzer looks for a relative
operator with a second writer. This seam has a second writer and *no relative
operator anywhere* — it animates to an absolute target from the current
value, which is implicit in exactly the same way. A checker written to the
source's rule would pass this file. The technique states the general form
(declare both ends) rather than the source's syntactic form.

## Catches

- Compile-from-source as an authoring doctrine — `cut-compiled-from-source`
  says it better, and says why.
- Container-pinned reproducible environments.
- Gate-blocks-render as a pattern — `quality-gates`.
- Deterministic drawing for checkable content — the `checkability-routes-the-pixel` law.
- Edit-the-source-and-recompile — the `edit-do-not-regenerate` law.

## Leads

- **The corpus's order-independence rule denies too much.**
  `encounter-balance-simulation/per-cell-seed-derivation-for-order-independence`
  closes with "When the evaluation is deterministic. No draws, no seeds,
  nothing to derive." This run's measurement is a counterexample: no
  randomness anywhere, and still order-dependent under parallel entry, because
  the order-dependent state is *captured at init* rather than drawn. The
  general rule is larger than the seed rule. **Out of this run's declared
  domain (game-production), so banked rather than landed.** Return condition:
  a run with game-production in scope, or a second sighting from another
  source. Inverting amendment, expect a rewrite penalty.
- **A checker for implicit-start writers with no relative operator.** The gap
  the fleet seam demonstrated. Return condition: a lint rule that flags it, in
  this source or elsewhere — that is also this note's `rescan_when`.
- **Media proxying of hostile codecs** across preview, render and archive with
  an opt-out. Return condition: a connected project accepts user-supplied
  video.

## Untriaged

Rows 2-5 above, with anchors, nobody verified them. The frame-adapter
contract (`docs/concepts/frame-adapters.mdx`) is the most likely to promote
if a fleet project grows a pluggable animation host.

## Instrument notes

- `check-anchors` parsed 8 anchors as `unquoted` on the first pass: markdown
  line-wrapping had split every `path:line "quote"` pair, and the grammar
  excludes newlines. Reflowed, 8 of 8 held. The failure reads as a clean
  "existence only" sheet, not as an error.
- The editor wrote the fleet file with CRLF into an LF tree: a 15-line change
  committed as **383 insertions / 371 deletions**. Caught from the diffstat,
  normalized, amended to 17/5. Line endings are worth checking on any
  cross-repo commit, because the gate stays green either way.
