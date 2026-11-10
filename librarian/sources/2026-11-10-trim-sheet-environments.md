---
source: youtube
kind: video
url: "youtube:qD7CXW771_U"
title: "Trim-sheet environments, /shift cluster of 1 video"
author: "On Mars 3D (1 channel, first sighting)"
words: 3433
extracted: 15
accepted: 0
declined: 0
leads: 5
already_covered: 4
untriaged: 5
currency: 0
dispatched: 0
applied: 1
shipped: 0
run_id: shift-trim-sheet-environments
siblings: 2
fetches: 0
---

# Trim-sheet environments, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `trim-sheet-environments`, board run
`shift-trim-sheet-environments`. The question: when does a piece get a trim sheet, an atlas or a
tiling material, and how are its UVs planned? One video, read from cached captions only. Nothing on
screen was watched. No fetch, no GPU, no render, no download. Phase 7.7: gate=skipped.

The class is hybrid: a second-hand review of published breakdowns of shipped games (about three
quarters of the runtime), with a short first-party demo of the mechanics in a modelling tool and a
course pitch. One voice, so there is no convergence. **The corpus has no trim sheet:** an uncapped
grep of `knowledge/` for the concept nouns finds nothing, and the lander's map re-run after tonight's
sibling landings (`generated-mesh-to-moving-asset`, `agent-built-3d-loop`) still returns no owner.
Three subjects border it: `tiling-texture-acceptance` (textures that tile on both axes, and density),
`sprite-and-atlas-production` (packed regions, and a When-NOT that calls tiling-versus-atlas "the
sharpest practical line") and `mesh-finishing-for-engine-readiness` (the unique unwrap, the shared
atlas from a re-pack). A trim strip tiles on one axis and is packed on the other, which is the line
those three draw and nobody owns.

## What landed

- **Nothing in `knowledge/`.** No row clears +3. The trim-sheet technique and its routing rule sit
  at 2/0/2 and stay untriaged with their anchors (one voice, no top-15 subject).
- **A lead refinement in the 11-10 agent-built-3d-loop note** (S4): the layout acceptance it
  proposes branches on the recorded unwrap intent, because a trim or tiling layout fails coverage
  and overlap by design. That source is the opposite case, so S4's return condition does not fire.
- **One apply in pof, on a branch** (§ Applied). The landed `texel-density-and-uv-tiling` step 2,
  "derive the repeat count, never dial it", applied as arc-length U at the parametric linear-prop
  generator. Not merged, not pushed: the lander was told to bank it for the supervisor.

## Triage

Scores per Phase 5 (GAIN/RISK/COST); accept needs G-R >= 3 and G >= C. Upper-layer rows ran under
the score, leads under the corroboration table. TDC = training-data convergence.

| # | Claim (stripped) | Anchor | Corroboration | Read | G/R/C | Outcome | Target |
|---|---|---|---|---|---|---|---|
| T1 | A trim sheet is one texture set of strips, each tiling along one axis; geometry is cut to select a strip, and density is set by scaling UVs along the tiling axis | [00:02:06]-[00:04:43], [00:05:59]-[00:06:24] | TDC; corpus absence confirmed | real gap | 2/0/2 | **untriaged** (G-R 2) | new technique in `tiling-texture-acceptance` (slug if new: `trim-sheet-one-axis-tiling`) |
| T2 | Route each surface by its repeat axes: both axes, a tiling material; one axis with structured detail, a trim strip; a unique element shared across pieces, an atlas region; a hero piece seen close, its own map | [00:04:16], [00:06:24]-[00:07:15], [00:15:55]-[00:16:20] | TDC; the [00:15:55] quote relays a studio blog, not a second voice | real gap | folds into T1 | **untriaged**, T1's decision rule | as T1 |
| T3 | A hybrid page holds trim strips and atlas regions together | [00:06:24]-[00:07:15], [00:10:39]-[00:11:37] | TDC | real gap (boundary) | 1/0/1 | **untriaged** | append to `atlas-packing-and-bleed-margins` § When NOT |
| T4 | A tiling or trim layout cannot stay inside 0-1, and looks messy by design | [00:08:35]-[00:09:02] | source plus `wrap-around-edge-diff` § When NOT (intent is recorded) | real gap in a banked lead | lead | **lead refinement**, filed in the 11-10 S4 lead | `2026-11-10-agent-built-3d-loop.md` § Leads |
| T5 | Read texel density with a checker; a large object and a trim piece carry different px/cm | [00:05:08]-[00:05:59] | n=1, numbers narrated | likely catch | - | **covered** | `texel-density-and-uv-tiling` (declare, derive, check achieved). The figures are one build's |
| T6 | Plan the trim before building it: where used, what tiles, what is unique | [00:08:09]-[00:08:35], [00:09:59]-[00:10:39] | TDC | partial | 1/2/1 | **untriaged**, T1's procedure step 1 | - |
| T7 | Many materials on one texture set: one material, fewer draws | [00:04:16]-[00:04:43], [00:09:02], [00:11:10] | corpus | likely catch | - | **covered** | `pack-existing-vs-smart-unwrap`; `materialise-on-import` rule 6; `render-submission-economy` |
| T8 | Break up visible tiling with decals, vertex blending, floaters, RGB-packed masks | [00:00:50], [00:11:53]-[00:12:29], [00:13:20]-[00:13:47] | TDC | partial | 1/2/1 | **untriaged** | `texel-density-and-uv-tiling` states "solve it with variation" and lists no mechanism |
| T9 | Vertex blending needs vertices: a flat wall carries a minimum face count to be paintable | [00:14:13]-[00:14:40] | n=1 | thin | 1/2/1 | **untriaged** | `asset-class-poly-budgeting` budgets are ceilings; this is a floor |
| T10 | Several trim sheets on one asset, each reused across the level | [00:12:55]-[00:13:20] | corpus | likely catch | - | **covered** | `sampler-hard-and-soft-caps`; T7 |
| T11 | A trim can be authored as a node graph or by sculpt-and-bake | [00:02:34]-[00:02:59] | corpus | likely catch | - | **covered** | `tiling-texture-acceptance` § Two roads to a normal map |
| T12 | Blockout is used in parallel by other disciplines | [00:15:30] | - | outside the theme | - | nothing | - |
| X1 | pof's parametric linear props (rope, cable, chain, wire) wrote OBJs with no texture coordinates; the only texture plan was a unique map sized by length, which grades a 10 m rope `starved` | pof tree, read at local `ccbe02aea` and remote `169621faa` | code read in a tree | real gap | apply | **applied** (`code`, `better`, on a branch) | `texel-density-and-uv-tiling` step 2 |
| X2 | pof's density grade names two ceiling remedies (split into a kit, or a seamless tiling material) and omits the trim strip | pof tree | code read | partial | - | **lead** | - |
| X3 | pof's kit atlas plan charges an elongated constant-section member its extent squared; such members belong on a trim strip first | pof tree | code read | real gap, no live defect | - | **lead** | - |

`auto=0/5/0 fp=0`. No miner accept existed, so none could die at the lander's read. The lander did
not raise T1: the X1 apply is a landed technique applied at a seam, not a second reader of the
one-axis rule, so it is not convergence for T1.

### T1+T2 working wording, for whoever lands it

- **Concern.** Structured detail (a moulding, a plank edge, a panel line, a rope's twist) repeats
  along one axis and is unique across the other. A tiling material turns it into wallpaper; a unique
  bake sized from extent starves once the extent passes the map ceiling. A trim strip spans its
  page's full width, so wrap addressing tiles it along U, and its height in V maps the cross-section
  once.
- **Routing rule.** As T2, recorded as intent at authoring time the way `wrap-around-edge-diff`
  records the intent to tile.
- **UVs.** U in world units: repeat = length x target density / strip pixel width. That is
  `texel-density-and-uv-tiling` step 2 on one axis. V stays inside the strip's band. U leaves 0-1 by
  design.
- **Acceptance.** Edge check on U only, per strip (`wrap-around-edge-diff` step 6 already judges one
  axis). Margins between strips on V only (T3). Achieved density per strip from U scale.
- **Boundaries.** Packing unique islands (`mesh-finishing`), sprite pages (`sprite-and-atlas`),
  sampler count per material (`shader-budget-authoring`).

### T3 working wording (append, no standing sentence made false)

`atlas-packing-and-bleed-margins` § When NOT says tiling textures get their own unpadded page and are
never packed with sprites. That stays true for textures that tile on both axes. On a trim page: U is
unpadded and wrap-addressed because every strip spans the page; V is packed, so gutters between
strips are derived as the technique derives them (filter reach x the deepest mip's reduction); the
mip depth is floored by the shortest strip's height; atlas regions on the same page take two-axis
margins and are never U-tiled.

## Applied (Phase 7.5)

- **Technique.** `texel-density-and-uv-tiling` (landed), Procedure 2 (derive the repeat) and 4
  (check the achieved density).
- **Seam.** pof's parametric linear-prop generator and its OBJ writer, reached from the project's
  linear-prop route, so a production consumer. Chosen to falsify: if a unique map sized by length
  held the target at real rope lengths, the derivation would buy nothing here.
- **Change.** Branch `backlog/trim-arc-length-u` from the remote tip `169621faa`, two commits
  (`11adb87a2`, `04a24b69b`), about 130 lines with tests. U = arc length x target px/m / strip
  width; V wraps the circumference once with a seam column held in UV space only, so positions and
  the watertight and winding tests are untouched; faces written `v/vt`; each end cap gets a disk
  whose UV-to-world area ratio equals the body's.
- **Measure, same inputs both arms (`ab-paired`, CPU only).** Straight rope, 16 segments x 6 sides.
  Target: achieved density along the length. Floor: the existing linear-prop tests.

  | Rope | vt lines A -> B | A: unique map sized by length | B: achieved from the OBJ's own UVs |
  |---|---|---|---|
  | 1 m (control) | 0 -> 131 | 1024 px, 1024 px/m, matches | 1024 px/m |
  | 10 m | 0 -> 131 | 4096 px (ceiling), 410 px/m, starved 0.4x | 1024 px/m |
  | 25 m | 0 -> 131 | 4096 px, 164 px/m, starved 0.16x | 1024 px/m |

  Floor held: linear-prop, its routing and its route tests 45/45, lint clean on both files, type
  check 0 errors. pof's full suite did not run (build width 0).
- **Caught in-run.** The first commit mapped each cap onto the ring's edge column: zero UV area,
  which pof's own stretch grade counts as degenerate and grades `poor`. The second commit fixed it,
  and a new test reads the grade's own per-face measure (no zero, nothing off the median by 2x).
- **Verdict.** `better`. Not merged and not pushed, by the landing's instruction; the supervisor
  decides. No application document yet: `verified_against` would name an unmerged branch. **Return
  when** the branch merges, then write `node--texel-density-and-uv-tiling` in
  `tiling-texture-acceptance`.
- **Sighted half.** Not run. A Blender proof (one procedural strip, 10 m rope, arm A a unique 4096
  map stretched once, arm B arc-length U, 1 m control) is the miner's proposal, `render.use` = the pof
  linear-prop route. The numbers stand without it; the look does not.

## Leads (5, each with a return condition)

1. **T1+T2, the trim-sheet technique and its routing rule.** Return when a second voice (another
   channel, or a primary such as engine documentation or a production breakdown read first-hand)
   states the one-axis rule.
2. **T3, the margin boundary on hybrid pages.** Return with T1; they share a reader.
3. **X2, the trim route in pof's density-grade ceiling remedy.** One string. Return when T1 lands, so
   the wording cites a corpus rule.
4. **X3, elongated members on a trim strip before kit atlas planning.** pof's kit atlas planner has
   no production consumer yet, and its baking mode is specced, not built. Return when it gains one.
5. **T4, S4's intent branch.** Filed inside the S4 lead text of
   [the 11-10 agent-built-3d-loop note](2026-11-10-agent-built-3d-loop.md). Done; it stays a lead
   there.

## Replication

Nothing to remake from the source: its finished work is other studios' shipped art and other
artists' portfolio pieces, and the creator's own demo is a generic striped plane no project would
use. The one proposal is the X1 render above, on our stack. Not proposed: a trim-sheet wall proof,
because no wired project has modular environment pieces open. **Return when** one does.

## Against the operator's routes

Weapons TRELLIS, monsters bake, props parametric: **no amendment.** X1 sits inside the
parametric-props route and makes it more complete. The video says nothing about weapons or monsters.

## Not extracted

Names of artists, studios and games; art-blog quotes beyond the one routing sentence; the resource
list at [00:16:57]; the course pitch; on-screen numbers beyond what the captions narrate; a remark on
art styles with nothing to act on.
