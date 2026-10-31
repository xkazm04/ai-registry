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

## Architecture review - 2026-10-31

First architecture review, against `d78820846`. All 14 documents were read in full.
The six techniques and the golden path hold; one technique overstates a platform
default. The 2026-09-26 lead "the ELK interactive-mode wording came from a search
excerpt" is cleared: the ELK option reference, fetched this run, says semi-interactive
crossing minimization "Derives the desired order from positions specified by the
'org.eclipse.elk.position' layout option", which is the "ordering hints" reading the
technique landed. Every application is `reverify`. The two personas applications
cite a camera and shell that the personas tree itself now records as retired: a
comment in the curator galaxy engine names "the retired Mastermind canvas camera,
`useCanvasCamera.ts`, deleted 2026-09-25 and recoverable from git history", and
neither `CanvasShell.tsx` nor `useCanvasCamera.ts` exists at personas HEAD. The
2026-09-26 note said those citations were re-checked against the current tree on
that day; that is now history and the citations need repinning as the
pattern-graph ones were. The same galaxy engine draws on demand into a canvas with
no frame loop at rest, which looks like the "immediate-mode graph surface" return
condition banked on 2026-09-26; not judged here. The two kp applications hold in
substance at kp `6edf5d7` with line drift (the measure fallback moved from `:19` to
`:21`, the absolute-edge-point assertion from `:112-121` to `:114-122`); their
experiments were not re-run. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/canvas-graph",
  "date": "2026-10-31",
  "baseline": "d78820846",
  "digest": "sha256-b2:98dcec8d04236b95",
  "disposition": "clarify",
  "coverage": "All 14 current documents read in full. Six primary sources fetched for the platform, spec and library claims the techniques lean on. The kp renderer was reopened at 6edf5d7 and the personas tree at 22260d77 for spot checks of the applications' citations; neither experiment was re-run, the Ascent tree and the state-machine editor tree were not reachable, and no verification date was refreshed.",
  "counterexamples": [
    "A non-passive wheel listener attached to the canvas element itself can cancel the default without any opt-out, because the passive-by-default intervention covers only the window, the document, its root element and body; the canvas still loses if it relies on a framework's root-delegated wheel handler, which React registers passive.",
    "A force engine with a fixed-seed generator and a deterministic initial placement repeats exactly across runs and still re-places most nodes when one node is added.",
    "A layered engine with model-order preservation enabled keeps declaration order only where it costs no extra crossings, so reordering can still move boxes on a dense diagram.",
    "A read-only diagram whose drawing is hidden from assistive technology and mirrored by a roving list keeps one tab stop, while the widely used node-editor defaults give every node and every edge one."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
      "result": "passive 'defaults to false - except that it defaults to true for wheel, mousewheel, touchstart, and touchmove events on Window, Document, Document.documentElement, and Document.body'; 'For other events and targets, the default is false.' Refutes the technique's unscoped 'Platforms treat wheel listeners as passive by default'."
    },
    {
      "url": "https://github.com/facebook/react/pull/19654",
      "result": "Found by search, not opened: React 17 keeps onTouchStart, onTouchMove and onWheel passive at the root container, so preventDefault in onWheel stays ineffective. Supports naming the framework layer, which the personas application already records."
    },
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/",
      "result": "generic is among the 'Roles which cannot be named (Name prohibited)'; 'Authors MUST NOT use the aria-label or aria-labelledby attributes to name the element.' Supports canvas-accessibility's role-that-can-carry-a-name rule."
    },
    {
      "url": "https://reactflow.dev/api-reference/react-flow",
      "result": "nodesFocusable and edgesFocusable both default true ('focus between nodes can be cycled with the Tab key'); onlyRenderVisibleElements defaults false. Supports the per-node-and-per-edge tab-stop default and the 2026-09-26 culling-off-by-default note."
    },
    {
      "url": "https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-semiInteractive.html",
      "result": "'Preserves the order of nodes within a layer...'; 'Derives the desired order from positions specified by the org.eclipse.elk.position layout option.' Supports 'ordering hints' and clears the 2026-09-26 lead. The considerModelOrder.strategy page: 'Preserves the order of nodes and edges in the model file if this does not lead to additional edge crossings', supporting the order-is-input section."
    },
    {
      "url": "https://github.com/kieler/elkjs",
      "result": "'Web Workers are supported out of the box'; workerUrl defaults to undefined, and the examples without it run with no worker. Supports 'worker execution is opt-in'."
    },
    {
      "url": "https://d3js.org/d3-force/simulation",
      "result": "randomSource 'defaults to a fixed-seed linear congruential generator'; unset positions start 'in a phyllotaxis arrangement, so chosen to ensure a deterministic, uniform distribution'. Supports graph-layout's fixed-seed condition."
    },
    {
      "source": "Consumer trees reopened read-only",
      "result": "kp 6edf5d7: ORTHOGONAL routing, the sized edge label, section start/bend/end points, orient=auto markers, the ceiling guard during render, the keyed async result and the nested-ceiling test all hold, with small line drift. personas 22260d77: CanvasShell.tsx and useCanvasCamera.ts are absent and an in-tree comment dates the camera's deletion 2026-09-25."
    }
  ],
  "documents": {
    "canvas-graph.md": {
      "disposition": "keep",
      "reason": "The renderer stage's retired/kept split, the single coordinate authority, the two rendering regimes and the budget summary agree with the techniques after the 2026-09-26 flips; the relative links resolve."
    },
    "techniques/viewport-transform.md": {
      "disposition": "clarify",
      "reason": "'Platforms treat wheel listeners as passive by default' is true only for the window, the document, its root element and body (MDN); a listener on the canvas element defaults to non-passive. Scope the default and name the root-delegating framework case, which is the trap the personas application actually hit."
    },
    "techniques/render-budget.md": {
      "disposition": "keep",
      "reason": "The retained-mode scope, the stepped-zoom exception and the rest-cost rung are internally consistent; the culling-off-by-default library fact is correctly kept out of the rung as a non-argument."
    },
    "techniques/graph-layout.md": {
      "disposition": "keep",
      "reason": "Anchoring native only to force layouts, ELK positions as ordering hints, model-order preservation, fixed-seed force engines and opt-in worker execution all match primary sources fetched this run."
    },
    "techniques/edge-management.md": {
      "disposition": "keep",
      "reason": "The editor-versus-generated-diagram split on routing and the shared-origin rule for engine output are sound and witnessed by the kp application."
    },
    "techniques/direct-manipulation.md": {
      "disposition": "keep",
      "reason": "Capture timing, the screen-space threshold, origin-plus-converted-delta and provisional gestures are consistent; the 10 px at half zoom = 20 world units example is correct."
    },
    "techniques/canvas-accessibility.md": {
      "disposition": "keep",
      "reason": "The named-role requirement matches ARIA 1.2's naming prohibition on generic, and the per-node-and-per-edge tab-stop default matches React Flow's documented defaults."
    },
    "applications/react--canvas-accessibility.md": {
      "disposition": "reverify",
      "reason": "Ascent tree not reachable this run; the 2026-09-20 citations were not reopened."
    },
    "applications/react--direct-manipulation.md": {
      "disposition": "reverify",
      "reason": "The paired tests live in an unnamed private tree that was not reopened or re-run; 'better' rests on three constructed tests and states its own unmeasured limits."
    },
    "applications/react--edge-management.md": {
      "disposition": "reverify",
      "reason": "Substance holds at kp 6edf5d7 (orthogonal routing, sized labels, routed sections drawn as returned, orient=auto, absolute edge points); the test citation drifted to :114-122 and the 16-of-189 measurement was not re-run."
    },
    "applications/react--graph-layout--kp.md": {
      "disposition": "reverify",
      "reason": "Substance holds at kp 6edf5d7 (system font stack, 6.7 per-character fallback now at measure.ts:21, ceiling guard during render, keyed result and cancel); the order experiment was not re-run and not every line range was rechecked."
    },
    "applications/react--graph-layout.md": {
      "disposition": "reverify",
      "reason": "Ascent tree not reachable this run; the phyllotaxis, appended-ring and q3 citations were not reopened."
    },
    "applications/react--render-budget.md": {
      "disposition": "reverify",
      "reason": "CanvasShell.tsx is absent at personas HEAD and an in-tree comment dates the Mastermind camera's deletion 2026-09-25. The citations need repinning to the last commit at their path and labelling as history; the clone here is shallow, so that commit was not found."
    },
    "applications/react--viewport-transform.md": {
      "disposition": "reverify",
      "reason": "Both cameras it cites are now retired: the pattern-graph one was already pinned as history, and the Mastermind useCanvasCamera.ts was deleted 2026-09-25 per the personas tree. 'Only the Mastermind camera is current' is no longer true; repin needed."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the one clarify item the earlier 2026-10-31 record named. The MDN
addEventListener page supports the scoped default. Applications were not touched
and keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/canvas-graph",
  "date": "2026-10-31",
  "baseline": "d78820846",
  "digest": "sha256-b2:d8a325ffab442310",
  "disposition": "reverify",
  "coverage": "All 14 current documents decided. The one clarify item owed by the earlier 2026-10-31 record (viewport-transform, the passive-listener default) was applied from the MDN page fetched this run and the edited paragraph re-read. Other documents are byte-unchanged and keep their dispositions. No consumer experiment was re-run and no verification date was refreshed.",
  "counterexamples": [
    "A non-passive wheel listener attached to the canvas element itself can cancel the default without any opt-out, because the passive-by-default intervention covers only the window, the document, its root element and body; the canvas still loses if it relies on a framework's root-delegated wheel handler, which React registers passive.",
    "A force engine with a fixed-seed generator and a deterministic initial placement repeats exactly across runs and still re-places most nodes when one node is added.",
    "A layered engine with model-order preservation enabled keeps declaration order only where it costs no extra crossings, so reordering can still move boxes on a dense diagram.",
    "A read-only diagram whose drawing is hidden from assistive technology and mirrored by a roving list keeps one tab stop, while the widely used node-editor defaults give every node and every edge one."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
      "result": "passive 'defaults to false - except that it defaults to true for wheel, mousewheel, touchstart, and touchmove events on Window, Document, Document.documentElement, and Document.body'; 'For other events and targets, the default is false.' Refutes the technique's unscoped 'Platforms treat wheel listeners as passive by default'."
    },
    {
      "url": "https://github.com/facebook/react/pull/19654",
      "result": "Found by search, not opened: React 17 keeps onTouchStart, onTouchMove and onWheel passive at the root container, so preventDefault in onWheel stays ineffective. Supports naming the framework layer, which the personas application already records."
    },
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/",
      "result": "generic is among the 'Roles which cannot be named (Name prohibited)'; 'Authors MUST NOT use the aria-label or aria-labelledby attributes to name the element.' Supports canvas-accessibility's role-that-can-carry-a-name rule."
    },
    {
      "url": "https://reactflow.dev/api-reference/react-flow",
      "result": "nodesFocusable and edgesFocusable both default true ('focus between nodes can be cycled with the Tab key'); onlyRenderVisibleElements defaults false. Supports the per-node-and-per-edge tab-stop default and the 2026-09-26 culling-off-by-default note."
    },
    {
      "url": "https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-crossingMinimization-semiInteractive.html",
      "result": "'Preserves the order of nodes within a layer...'; 'Derives the desired order from positions specified by the org.eclipse.elk.position layout option.' Supports 'ordering hints' and clears the 2026-09-26 lead. The considerModelOrder.strategy page: 'Preserves the order of nodes and edges in the model file if this does not lead to additional edge crossings', supporting the order-is-input section."
    },
    {
      "url": "https://github.com/kieler/elkjs",
      "result": "'Web Workers are supported out of the box'; workerUrl defaults to undefined, and the examples without it run with no worker. Supports 'worker execution is opt-in'."
    },
    {
      "url": "https://d3js.org/d3-force/simulation",
      "result": "randomSource 'defaults to a fixed-seed linear congruential generator'; unset positions start 'in a phyllotaxis arrangement, so chosen to ensure a deterministic, uniform distribution'. Supports graph-layout's fixed-seed condition."
    },
    {
      "source": "Consumer trees reopened read-only",
      "result": "kp 6edf5d7: ORTHOGONAL routing, the sized edge label, section start/bend/end points, orient=auto markers, the ceiling guard during render, the keyed async result and the nested-ceiling test all hold, with small line drift. personas 22260d77: CanvasShell.tsx and useCanvasCamera.ts are absent and an in-tree comment dates the camera's deletion 2026-09-25."
    }
  ],
  "documents": {
    "canvas-graph.md": {
      "disposition": "keep",
      "reason": "The renderer stage's retired/kept split, the single coordinate authority, the two rendering regimes and the budget summary agree with the techniques after the 2026-09-26 flips; the relative links resolve."
    },
    "techniques/viewport-transform.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Platforms treat wheel listeners as passive by default' now scopes the default to the window, the document and its root and body elements, names the root-delegating framework whose wheel listener may be passive too, and puts the non-passive listener on the canvas element."
    },
    "techniques/render-budget.md": {
      "disposition": "keep",
      "reason": "The retained-mode scope, the stepped-zoom exception and the rest-cost rung are internally consistent; the culling-off-by-default library fact is correctly kept out of the rung as a non-argument."
    },
    "techniques/graph-layout.md": {
      "disposition": "keep",
      "reason": "Anchoring native only to force layouts, ELK positions as ordering hints, model-order preservation, fixed-seed force engines and opt-in worker execution all match primary sources fetched this run."
    },
    "techniques/edge-management.md": {
      "disposition": "keep",
      "reason": "The editor-versus-generated-diagram split on routing and the shared-origin rule for engine output are sound and witnessed by the kp application."
    },
    "techniques/direct-manipulation.md": {
      "disposition": "keep",
      "reason": "Capture timing, the screen-space threshold, origin-plus-converted-delta and provisional gestures are consistent; the 10 px at half zoom = 20 world units example is correct."
    },
    "techniques/canvas-accessibility.md": {
      "disposition": "keep",
      "reason": "The named-role requirement matches ARIA 1.2's naming prohibition on generic, and the per-node-and-per-edge tab-stop default matches React Flow's documented defaults."
    },
    "applications/react--canvas-accessibility.md": {
      "disposition": "reverify",
      "reason": "Ascent tree not reachable this run; the 2026-09-20 citations were not reopened."
    },
    "applications/react--direct-manipulation.md": {
      "disposition": "reverify",
      "reason": "The paired tests live in an unnamed private tree that was not reopened or re-run; 'better' rests on three constructed tests and states its own unmeasured limits."
    },
    "applications/react--edge-management.md": {
      "disposition": "reverify",
      "reason": "Substance holds at kp 6edf5d7 (orthogonal routing, sized labels, routed sections drawn as returned, orient=auto, absolute edge points); the test citation drifted to :114-122 and the 16-of-189 measurement was not re-run."
    },
    "applications/react--graph-layout--kp.md": {
      "disposition": "reverify",
      "reason": "Substance holds at kp 6edf5d7 (system font stack, 6.7 per-character fallback now at measure.ts:21, ceiling guard during render, keyed result and cancel); the order experiment was not re-run and not every line range was rechecked."
    },
    "applications/react--graph-layout.md": {
      "disposition": "reverify",
      "reason": "Ascent tree not reachable this run; the phyllotaxis, appended-ring and q3 citations were not reopened."
    },
    "applications/react--render-budget.md": {
      "disposition": "reverify",
      "reason": "CanvasShell.tsx is absent at personas HEAD and an in-tree comment dates the Mastermind camera's deletion 2026-09-25. The citations need repinning to the last commit at their path and labelling as history; the clone here is shallow, so that commit was not found."
    },
    "applications/react--viewport-transform.md": {
      "disposition": "reverify",
      "reason": "Both cameras it cites are now retired: the pattern-graph one was already pinned as history, and the Mastermind useCanvasCamera.ts was deleted 2026-09-25 per the personas tree. 'Only the Mastermind camera is current' is no longer true; repin needed."
    }
  }
}
```
