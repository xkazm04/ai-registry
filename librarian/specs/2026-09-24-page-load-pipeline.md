# XL spec — `page-load-pipeline`

- **Run:** `intake-browsers-anim` (escalated E4), picked by the operator on 2026-09-24:
  "forge the topic of page loading mechanism so we can gather knowledge and
  optimization techniques there and plan distribution to all consumed web apps".
- **Source that surfaced the gap:** `web:addyo.substack.com/p/how-modern-browsers-work`
  (second-hand explainer relaying the browser vendor's own documentation). It
  **originates** this subject and authorizes nothing in it: every technique is
  corroborated from primary documents (specifications, the browser vendors' own
  performance documentation) fetched by the drafter, or from connected trees.
- **Status:** EXECUTED 2026-09-24 (one forge worker; director reviewed the diff: gate green, purity clean, use_when 8/8, anchors 30/30)
- **Why XL:** four source candidates and the operator's request share one home and
  one pipeline, *what the browser can do before, during and after the first render
  of a document*. Resource discovery, render blocking, priority, fonts, script
  cost, layout stability and measurement are stages of that pipeline. No subject in
  the corpus owns any of those stages. `research-map` returned only slug neighbours
  (`render-mount-pipeline`, `client-fetch-cache`, `quality-gates`). The run read each
  of them: none states the forces of a page load.

## Placement (verified against the authority, not against a count)

`knowledge/software-engineering/taxonomy.json` (`layout: "nested"`) is the
authority. `client-architecture` is a **flat category holding 9 subjects**
(`client-fetch-cache, client-state, i18n, ipc-contract, realtime-events,
hash-pinned-translation-pipeline, demo-data-plane, native-shell-integration,
render-mount-pipeline`). `MAX_CHILD_DIRS` is 10, so one more fits and the category
is then **full**. A later subject here will require a subdivision (E2).

- Resulting path: `knowledge/software-engineering/client-architecture/page-load-pipeline/`.
- Link depth from a technique to `_laws.md`: `../../../_laws.md` (identical to
  `render-mount-pipeline/techniques/*`). Golden path to `_laws.md`: `../../_laws.md`.
- Append `page-load-pipeline` to the category's `subjects` array in
  `taxonomy.json`. Append, do not reorder.

## The boundary this subject must state, and must NOT absorb

- **`render-mount-pipeline`** owns code deciding which elements exist
  (virtualization, mount/recycle). This subject owns what the *browser* fetches and
  paints for a document before and while code runs. A virtualized list's mount cost is
  theirs; the script that ships the virtualizer is this subject's.
- **`client-fetch-cache`** owns application data fetching and caching after the
  app runs. This subject owns document subresources (styles, scripts, fonts, images)
  and the navigation itself. HTTP caching of static assets belongs here. The query cache does not.
- **`ui-surfaces/published-surfaces/lazy-section-addressability`** owns anchors and
  addresses for deferred sections. Deferring the *load* of a section is this
  subject's; keeping its address reachable is theirs. Link, do not restate.
- **`ui-surfaces/feedback-and-style/motion/performance-discipline`** owns the frame
  budget of running animations. Load-time main-thread cost and responsiveness to
  input belong here.
- **`ui-surfaces/feedback-and-style/adaptive-fidelity-tiers`** owns choosing a
  quality tier for a device. This subject may cite it for "ship less to weak
  devices" and must not restate the tier model.
- **`engineering-process/.../build-economics`** owns build *time* and CI cost.
  Shipped bytes and their cost to the reader belong here.
- **`engineering-process/standards-and-gates/metric-gates`** owns how a metric
  becomes a gate. T7 cites it for the budget gate and owns only which load metrics
  to gate and where they are measured.

## Proposed techniques

Seven. Each carries `use_when` and a decision-rules section. The drafter may merge,
split or rename with a stated reason. Override this brief where the primaries or
the trees disagree, and say why.

### T1 — `discoverable-critical-resources`

**Decision rule:** a resource the first render needs must be discoverable from the
served markup, because the browser's look-ahead scanner reads markup and nothing
else. Anything created by script, referenced only from a stylesheet, or behind a
lazy attribute is discovered late by construction. Late discovery is fixed by
moving the reference into markup, or by a declared preload when it cannot move.
Must contain the enumerated blind spots (script-inserted elements, CSS
backgrounds, fonts referenced from CSS, the lazily loaded above-the-fold image,
client-rendered shells), and the cost of over-preloading (preloads compete with
everything else).

### T2 — `render-blocking-budget`

**Decision rule:** stylesheets block rendering and classic scripts block parsing.
Every blocking resource on the critical path is a budget line with a named reason,
and the rest are deferred, async or module. Covers critical CSS vs whole-stylesheet
blocking, third-party tags, and the rule that "async" and "defer" differ in
*ordering*, not only in blocking.

### T3 — `priority-is-declared-not-hoped`

**Decision rule:** the browser guesses priority from type and position. Where the
guess is wrong for this page (the largest above-the-fold image, a late-found hero
font), declare it with priority hints, preconnect or preload, and demote
everything else. Must state the anti-patterns: preloading everything, lazy-loading
the largest contentful element, preconnecting to origins the page never uses.

### T4 — `font-loading-discipline`

**Decision rule:** a web font is a render-blocking resource whose failure mode is
either invisible text or a layout shift, and the page chooses which. Covers
display strategy, subsetting, self-hosting vs third-party font hosts, metric-matched
fallbacks to remove the swap shift, and the count of families and weights as a
budget.

### T5 — `script-cost-is-main-thread-time`

**Decision rule:** shipped script costs download, then parse and compile, then
execute and hydrate, all on the main thread the reader's input needs. Measure it as
main-thread time on a weak device, not as bytes. Covers code splitting by route and
by interaction, server-rendered components that ship no script, deferring
below-the-fold sections, breaking long tasks, and why hydration of a large tree
fails responsiveness even when the page looks ready.

### T6 — `layout-stability-by-reservation`

**Decision rule:** anything that arrives after first paint must arrive into space
already reserved for it: intrinsic dimensions or aspect ratio on media, reserved
slots for late content, no insertion above content the reader is already looking at.
Transform-based animation does not shift layout, and animating layout properties
does.

### T7 — `field-measured-load-budget`

**Decision rule:** the load metrics that matter (largest contentful paint,
interaction responsiveness, cumulative layout shift) are judged at the 75th
percentile of *real* visits. Lab runs are for diagnosis and for a pre-merge budget
gate, never for the verdict. Covers what to gate before merge (bytes per route,
blocking resources, a lab score floor with its variance), what only the field can
answer, and the rule that a budget without a named owner decays. Cite
`count-carries-predicate` (a metric without its percentile and population misleads)
and `gate-sees-target` if their anchors apply. Verify both exist in `_laws.md`.

### Open questions the drafter decides

1. Navigation reuse (back/forward cache eligibility, prefetch and prerender on
   hover or by rule): an eighth technique, or a section of T5/T7? Decide from the
   primaries' weight and the trees.
2. Images (responsive sources, modern formats, dimensions): part of T1/T3/T6 or
   their own technique? The corpus has no image-delivery subject. Prefer placing it
   where the decision rule is sharpest.
3. Is the desktop-webview case (a packaged app loading local assets) a boundary
   the golden path must state? One fleet project is such a shell. Its forces are
   script cost and blocking, not network.

## Connected trees (read-only reconciliation)

Resolve with `loadFleet()`. Web apps on Next.js 16: `personas-web`, `kp`,
`ascent`, `goat`, `politicas`; desktop webview: `personas`. For reconciliation,
open **personas-web** (it has a bundle budget file, a lazy-mount gate for below-fold
sections and ssr-disabled lazy chunks) and **one** of kp/ascent. Write applications
only for what you read, `verified_against` from a lockfile witness. Do not edit any
project. The distribution plan is the director's job after this subject lands.

## Primaries (the drafter's web budget, ~8 fetches)

The browser vendors' own performance documentation on: the preload scanner; render-blocking
resources; fetch priority; font best practices; the three core load metrics and their
thresholds; optimizing long tasks and responsiveness; back/forward cache. The HTML
specification for script loading attributes and `link rel` preload/modulepreload.
Prefer the vendor/standard page over any commentary.

## Execution record

Eight techniques (the spec proposed seven), two applications (personas-web,
ascent; `next@16.3.3`, lockfile witness). Worker overrides, all accepted on review:

- **Preload lives in T1 only.** The vendor's priority documentation says hints do not
  aid discovery; T3 owns priority hints and connection warm-up.
- **A web font is not render-blocking.** It blocks *text* for its block period; its
  stylesheet is what blocks rendering. T4 is written that way.
- **"Self-host fonts" dropped as a rule.** The primary reports third-party-hosted
  fonts often render faster; the rule became "keep the font's CSS off a foreign
  origin on the critical path".
- **Yield on a time budget regardless of pending input.** Checking for pending input
  before yielding is no longer advised by the primary.

Open questions decided: navigation reuse is its own technique (`navigation-reuse`);
images are split across T1 (discovery), T3 (priority, bytes) and T6 (dimensions);
the desktop-webview case is a boundary paragraph pointing at `startup-phasing`.
`client-architecture` is now at the 10-subject cap.
