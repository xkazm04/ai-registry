---
source: github:wheresryan22/anatomy
kind: repository
url: https://github.com/wheresryan22/anatomy
title: "Anatomy: an agent skill for isometric SVG figures with its own geometry audit"
author: wheresryan22
words: 3166 landing page; about 79000 in references, kit audit and docs; 5293 SKILL.md
extracted: 10
accepted: 5
declined: 0
leads: 3
already_covered: 2
untriaged: 3
dispatched: 1
applied: 1
shipped: 0
run_id: anatomy-1014
siblings: 7
---

# A two-week-old drawing toolkit whose real content is how it proves a picture

**Class:** first-party practitioner repository (a skill plus its own kit), single author,
public for four days at the pinned commit `e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f` (depth 1,
about 160 files, deleted by name). Operator focus: media-generation and game-development.
Expected yield: practitioner failure modes, concentrated in the reference documents and the audit
code; the README and the skill front matter are the advertisement. That is where it was.
Fetches by the director: 0 of 3 (the forge worker spent its own 4). Siblings live at claim: 7;
none held this bundle path.

**Honest focus result.** Nothing here lands in `media-generation`: the bundle is about model-made
media, and this tree draws figures from code. One subject lands in `game-production` because
layered draw order is an isometric-game problem in the same words. Said plainly, the focus asked
for two domains and the source supports one.

**Sweep (in this order).** SKILL.md, CHANGELOG, then `references/craft.md` (anti-patterns, painter's
order), `references/verify.md` (line check, audit table, review checklist), `references/webgl.md`
(sections 7 and 8), `references/motion.md` (depth re-sorting), then `kit/audit.mjs` (the settle,
order-key and coverage functions) and `examples/raptor-engine/build.mjs`. README last.

## Design record

System: the figure toolkit (one system; count per system below).

```
decision:  order layered parts from measured geometry, not hand-set keys; an interlocked pair is fixed by cutting geometry
forces:    past a few dozen overlapping parts hand-set biases fight each other; one screenshot is the only check
buys:      a depth order that holds in every overlap, plus a named list of pairs no order can fix
rejects:   "tuning a painter's key ... until one screenshot looks right" (craft.md anti-patterns)
where:     kit/audit.mjs:657 "export function orderKeys(items, overlaps"; kit/audit.mjs:666 "cycles.push(pair);"; references/craft.md:194 "Dense figures settle their keys from geometry."
stage:     the order of layers before draw
corpus:    NONE (nearest: sprite-and-atlas-production, which owns the finished sprite) ; HOME IF NEW: game-production/asset-production/surface-and-imagery
```

```
decision:  the audit measures that its own record covers what is drawn
forces:    the audit's input is written by the author it gates; a builder recorded slivers to quiet it
buys:      a pass that is about the parts, not about stand-ins
rejects:   trusting recorded shapes
where:     kit/audit.mjs:1559 "export function coverage(items, P, { least = 0.6"; references/craft.md:45 "Stand-in shapes."
stage:     before any other check
corpus:    PARTIAL (generated-mesh-acceptance/unmeasured-is-not-pass makes an absent measurement visible; this is a measurement of a stand-in) ; HOME IF NEW: same
```

```
decision:  a second instrument checks what the first cannot see (stroke ends in markup)
forces:    the geometry audit never sees markup; seams and ticks that stop mid-face read as broken at zoom
buys:      two blind spots that do not overlap
rejects:   one zero as proof ("A zero audit is necessary, not sufficient")
where:     references/verify.md:75 "must end within 1 viewBox px"; references/verify.md:137 "A zero audit is necessary, not sufficient"
stage:     acceptance of a finished drawing
corpus:    NONE ; HOME IF NEW: same
```

```
decision:  order is checked across the replayed motion, probed at stagger boundaries
forces:    parts move on their own timing; rest poses are right and the middle is wrong
buys:      no wrong pair in any state a viewer can reach
where:     references/motion.md:122 "Settle the static keys from the motion"; references/motion.md:132 "Check the paths a viewer can make"
corpus:    NONE ; HOME IF NEW: same
```

```
decision:  one pure model drives every number, readout and motion (SKILL.md "Truth first")
corpus:    covered: game-production law one-authority-per-quantity
```

```
decision:  real-time effect values ride envelopes with attack and decay; fades only fall; hue has its own slower envelope
where:     references/webgl.md:227 "Colour gets its own slow envelope."; references/webgl.md:231 "Brightness during a fade-out only falls."
corpus:    NONE ; HOME IF NEW: a second subject (effect transitions), different from the first four
```

**Routing count.** Per system, NONE or PARTIAL entries sharing one home: four (draw order, record
coverage, line-end check, motion sampling) share `surface-and-imagery`. Cluster clause fired
(three or more with one home-if-new). The effect-envelope entry has a different home and stands
alone (one). Decision: handoff of the cluster, executed in-session as one forge, not a repository
handoff. `--no-handoff` not passed.

## Triage

Rules: rows targeting the upper layers run Phase 5's score; leads run under the corroboration
table. V1 checked: `surface-and-imagery` held 4 of 10.

| # | Row | Lane | Shape | Eff | Prior art | G/R/C | Outcome |
|---|---|---|---|---|---|---|---|
| 1 | Draw order from measured geometry, interlock means cut | K | technique | XL cluster | none | E4 | landed (subject, techniques 1-3) |
| 2 | The record must cover the drawing | K | technique | M | partial (unmeasured-is-not-pass) | 3/1/2 | landed; boundary stated both ways |
| 3 | Line ends and a gate's blind spot | K | technique | M | none | 3/1/2 | landed (technique 6 folded in) |
| 4 | Order across reachable poses | K | technique | M | none | 3/1/2 | landed |
| 5 | Split wrapping parts | K | technique | M | none | 3/0/2 | landed |
| 6 | Effect envelopes, only-falls fades | K | technique | L | none | 2/2/3 | lead |
| 7 | Ink solved for paper (invert the compositing) | K | technique | M | tokens only (light-and-dark-rendering) | 2/2/2 | lead |
| 8 | Verifier false-greens catalog | K | amendment | S | unmeasured-is-not-pass | 1/2/1 | untriaged |
| 9 | Truth-first single model | K | - | - | law one-authority-per-quantity | - | already covered |
| 10 | Motion: still when offscreen and under reduced motion | K | - | - | ui-surfaces motion | - | already covered |

`auto=5/0/1 fp=0` (row 1 escalated E4 and executed under the in-session forge rule).

## Leads (with return conditions)

- **Effect envelopes** (row 6). Anchors above plus `references/webgl.md:218` "Nothing pops". A
  slowed contact sheet and a per-frame ink log are the source's verification. Home if new:
  `game-production/asset-production/surface-and-imagery` or `motion-and-audio`. Return: a second
  independent source on real-time effect transitions, or a managed project that ships an effect.
- **Ink solved for paper** (row 7). `references/webgl.md:292` "Design the colour the paper should show" and `references/webgl.md:294` "vec4 inkFor(vec3 seen,float cover)".
  The corpus owns per-scheme colour tokens, not additive-versus-subtractive compositing. Return:
  a second source, or a managed project drawing glows on a light page.
- **A gallery that rebuilds submitted source under a pinned toolkit fingerprint** (not scored:
  software-engineering, out of focus). `CHANGELOG.md:30` "records the kit fingerprint". Return: a
  second artifact-gallery source.
- **Size-tier estimate was often far longer than the build** (method lesson, lane S):
  `CHANGELOG.md:13` "no longer quotes a time". Noted for forge and intake effort tiers; no change made.

## Untriaged (nobody verified these; not declined)

- Verifier false-greens: a sweep over an empty pose list passes, a misspelled action passes, a browser
  error page reads as clean (`CHANGELOG.md:52` "rejects unknown actions"; `CHANGELOG.md:56` "instead of reporting a clean browser error"; `CHANGELOG.md:57` "empty pose lists"). Candidate boundary case under
  `unmeasured-is-not-pass` (the gate's input is empty). Needs corroboration beyond one changelog.
- Concept-to-object mapping as the explanation ("The object is the explanation", SKILL.md):
  reconsider against `media-generation/visual-generation/data-video-art-direction` before any claim.
- 3D mode ordering by separating planes and an orbit audit: beta in the source, one example.

## Render proof

Not render-bound: nothing here changes what a generative model is told, and the landing is a
verification and ordering discipline whose claims were measured on the source's own audit.
Phase 6b not run. Said here so it is a decision, not an omission.

## Apply (Phase 7.5)

No managed project draws a layered 2.5D scene; the only game project is a 3D tool and a grep
for draw-order and renderOrder vocabulary found no authored-order seam. So the subject is
`unapplied` against the fleet, with one `experiment` on the **source tree** (not a managed
project) chosen to falsify the technique's value:

- Baseline: the source's own audit on its largest example reproduced (`audit passed`, 478 items,
  1119 states, 4292 rules, 1707703 overlaps against 1707702 documented, 318.5 s against 151.9 s).
- Falsifier arm: remove the settle call. `--audit` still ends `audit passed`; 271 of 478 written
  keys differ (max shift 3.86 units); a direct depth check on the unsettled keys finds 18549 wrong
  entries over 1119 states, 35 at rest or apart, 0 interlocks; settled 0. The seam could have
  killed the technique (if unsettled keys were fine) and did not; it also found that the audit
  hides a missing settle, which landed as a decision rule.
- Synthetic probe on the coverage check: sliver recorded fails at 0.002, 0.7 scale fails at
  0.515, 0.8 scale passes, an empty record is skipped by it.

Directions pass (7.6): `directions=0/0`; no project's scope admits layered-art forces. Decision
gate (7.7): no proposals waiting across the fleet (checked in each project's tracked `.ai/directions`).

## Corroboration

Worker budget 4: SVG 2 painter's model (read); two secondary pages (painter's algorithm, BSP) read;
the 1980 paper page returned 403; the 1972 paper never fetched. The cycle rule rests on secondary
summaries plus the source's own measurement; the solver and its 190/133/323 figures are code and
prose from one author.

rescan_when: a release or tag lands in the source repository; or 8 weeks elapse (2026-12-09)
