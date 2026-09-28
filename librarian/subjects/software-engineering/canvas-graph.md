---
subject: canvas-graph
domain: software-engineering
last_touched: 2026-09-26
dry_streak: 0
---

# canvas-graph

First subject note, written by `/deepen` run dp-cg-0926. The Curator lane dispatched
this single-subject run on the scan finding "single stack (react)". Registry HEAD at
dispatch was 55c6bce2, but the primary checkout's main was 84 commits behind origin. The
run therefore worked from origin/main in a detached worktree and rebased once before
landing. The consumer trees were read at kp 148e6c8b9 and personas 900b8f0b4.

## 2026-09-26 - a second tree, six claims conditioned, a retired camera repinned

**The finding that ranked it cannot be cleared from this fleet.** Every canvas surface in
the eleven trees is React-hosted, and the two Rust trees draw none: tracklight and pumper
match no canvas or zoom vocabulary, checked against a known positive in personas. Scan
points stayed at 5 through the landing. "single stack (react)" is the fleet's truth rather
than a content gap, and this note clears "never swept". **Return condition:** a non-React
canvas or node-graph surface enters a fleet tree (a Rust UI, or a 2D or GPU canvas
renderer).

**Depth rung:** L3 empirical. Two experiments ran over kp's own parse and layout code on
its 15 committed diagrams, with the harness outside the tree and product code unchanged.
The personas applications were re-verified line by line against HEAD.

**Lanes:**
- Counter-evidence (web, unconstrained).
- Training-data-only (blind).
- kp tree read plus experiments.
- personas citation re-verification (a subagent reading only).

**Landed** in 236c05f3 (content) and 450bc1da (generated):
- NEW `react--graph-layout--kp` and `react--edge-management`, from kp's PlantUML
  renderer. It is a read-only renderer on elkjs 0.12, the renderer stage the golden path
  describes. `react--edge-management` is the technique's first application.
- **Flipped (three lanes):** layered determinism holds for the same *order*, not just
  the same graph. On kp, reruns moved 0 of 198 boxes. Reversed declarations moved boxes
  in 14 of 15 diagrams, and reversed edges moved boxes in 7.
- **Flipped (two lanes plus a measurement):** "routing is a last resort" is an editor
  rule. In a generated diagram the engine's routes are the geometry. Straight segments
  would cross a foreign node on 16 of 189 edges; the routed edges cross none.
- **New graph-layout section (tree plus training lane):** what an engine-driven layout
  reads besides the graph. That is sizes with their font, order, a ceiling or a worker,
  and an async result keyed to its input.
- **Flipped (counter lane plus the file contradicting itself, witnessed by personas):**
  rung 1 said nodes must not know the transform, and rung 4 needs the zoom. Nodes never
  see the pan and may read a stepped zoom. Personas ships exactly this: `zq`, about 6%
  log steps, around 12 renders per zoom doubling.
- **Conditions:**
  - The render ladder is retained-mode (counter plus training lanes).
  - The per-frame commit protects subscription isolation and is not a substitute for it
    (counter lane, from the leading editor's source).
  - Fixed anchors are native only to force layouts (counter lane).
  - "Nondeterministic unless seeded" was wrong for force engines that ship a fixed seed
    (counter lane, vendor docs).
  - The accessible region needs a role that can carry a name, and a 2D or GPU canvas
    cannot use roving focus (counter lane, spec).
- **Re-verified:** both 2026-08-18 personas applications cited a pattern-graph camera
  that moved on 2026-08-19 (8dca190821) and was deleted on 2026-08-23 (7d179e52bf).
  Those citations are pinned to `8dca190821~1` and labelled as history. Twelve
  CanvasShell line ranges had drifted after the 2026-09-18 jump-palette commit and are
  corrected. One quote had never been verbatim and is fixed. Both files gain
  `verified_against: react@19.2`.

**Applied** (six `applied.md` rows):
- two experiment rows, better (kp);
- one simulation row, not-better (kp already sizes with a system face, so the new text
  changes nothing there);
- one simulation row, better (personas stepped zoom);
- two unapplied, with return conditions (per-event viewport store; immediate-mode graph
  surface).

**Impact** (map at registry 450bc1da):
- personas: 1 stale verdict, `vault-dependency-graph` (deviation, judged against revision
  4). The map was NOT rebuilt: personas' `.ai/registry-map.json` carries another
  session's uncommitted rewrite. This is its `/conform --stale` queue.
- kp: 0 stale. The rebuilt map now joins canvas-graph on 2 contexts (`puml-diagram`,
  `architecture-diagrams-explorer`), where before kp held no pair and was a "candidate".
  Committed as a51862b1c, not pushed (local main carries 31 other unpushed commits).
- politicas 3 contexts, goat 1, athena-everywhere 1: all `unknown`, 0 stale. Rebuilt and
  committed (9a5244d, 4d33ac2, 3846b3e), not pushed, because each local branch carries
  other sessions' unpushed commits.

**Declined:**
- Softening rung 2's "cull to the viewport" because the leading editor ships culling off
  by default. A library default is not evidence against a rung that measurement already
  gates.
- SVG export rules from the training lane (inline computed styles, fonts, `currentColor`,
  background). The home is ambiguous (data-viz or an export subject), and only one tree
  witnesses them (kp resolves `var()` fills and sets a background). Banked below.

**Leads (with return conditions):**
- kp `puml-diagram`, canvas-accessibility deviation candidates. The interactive funnel
  puts one tab stop on each of its ~15 clickable steps. The inert diagrams expose only a
  titled `img` with no list twin. Return: `/conform` on kp.
- personas declares `@xyflow/react` 12 and imports it nowhere; only a vendor-chunk entry
  names it. This is a dead-dependency lead for hygiene, not for this subject.
- SVG export as a clause. Return: a second tree exports generated diagrams.
- The ELK interactive-mode wording came from a search excerpt, not a fetched page. It was
  landed softly, as "ordering hints". Return: the next pass fetches the ELK option
  reference.

| subject | rung | last-pass yield | demand after | dry |
| --- | --- | --- | --- | --- |
| canvas-graph | L3 | 2 applications, 2 re-verified, 4 flips, 5 conditions, 0 techniques | personas 1 stale; kp newly joined (2 contexts); 10 unjudged contexts across 5 projects | 0 |
