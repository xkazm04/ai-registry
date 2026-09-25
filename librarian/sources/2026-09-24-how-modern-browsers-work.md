---
source: web:addyo.substack.com/p/how-modern-browsers-work
kind: second-hand practitioner explainer (relays browser-vendor documentation) + operator dispatch (golden path for model-authored explainer animations)
url: https://addyo.substack.com/p/how-modern-browsers-work
title: "How modern browsers work"
author: Addy Osmani
words: 12570
extracted: 12
accepted: 2
declined: 0
leads: 3
already_covered: 5
untriaged: 2
dispatched: 0
applied: 2
shipped: 2
run_id: intake-browsers-anim
siblings: 0
---

# How modern browsers work

Mined 2026-09-24. Zero siblings live on the board. The operator asked two things:
whether the article itself changes the registry, and what the golden path is for
having the model author short animated explainers in several art styles. The
second half is an **operator dispatch**, so it spent its own research budget (one
worker, 11 web calls), separate from the article's corroboration budget (0 of 3
spent).

## Class and expected yield

A **second-hand practitioner explainer**: a survey of browser internals that
relays the vendor's own documentation series and a free book, with a practical
takeaways list at the end. Reliable for *that* the platform works this way. It
is not reliable for anything the corpus does not already assume, and parts of it
are stale or hedged in its own words ("Not sure if they isolate cross-origin
iframes yet"; an "experimental" transition API that has since shipped).
**Expected yield, stated before the table: low content, high catches.** It held:
5 catches, 2 landings, and both landings came from the article's *illustrations*
and the operator's question, not from its prose.

**The container check.** The ingest returned 12,570 words of prose, which is the
real article. The illustrations the operator remembered as "animated
walkthroughs" are static: 11 commissioned images (riso-style two-colour stage
drawings, a title card, and one loading **filmstrip** showing three pages at
2%...100%). The page embeds no video, GIF or animation. That turned out to be the
finding. The filmstrip draws a process as a row of stills, and the stage drawings
come in before/after pairs. Neither depends on motion, which is the half the
corpus did not have.

## Declared focus, and whether it applied

SCORECARD's focus: hunt impossibility claims, ask what a gate does not assert,
declare the floor before the fix, and check whether the source is the control.
**The floor rule applied and was used.** Both fleet fixes declared a floor
before they were written: the no-preference arm must keep animating. Both floors
held. The impossibility hunt did not bite on this subject. The enumeration hunt
did: `content-bearing-degradation` says "the split is the whole technique" and
resolves content-bearing gestures to their end state, and a process gesture has
no frame that holds its content.

## Triage (v2.5 scored gate)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Rule | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | S | Animate only compositor-friendly properties | motion/performance-discipline | none | likely catch | - | - | **already covered** (the technique says it better, with the escape for size changes) |
| 2 | K | technique | S | Batch DOM reads and writes to avoid layout thrash | motion/performance-discipline ("one shared frame engine", phase-separated reads and writes) | none | likely catch | - | - | **already covered** |
| 3 | K | technique | L | Declare critical resources in markup; the scanner cannot see script-inserted ones | NONE: no subject owns page-load resource discovery or the critical path (`render-mount-pipeline` is code-driven mounting, not loading) | new-subject | real gap | - | E4 | **escalated** (XL: a page-load subject). Lead below |
| 4 | K | technique | S | Break up long main-thread tasks; move work to a worker | not verified | new-technique? | thin | - | - | untriaged |
| 5 | K | currency | S | HTTP/2-3 multiplexing ends the per-host connection limit | none | none | thin | - | - | nothing (no corpus claim rests on it) |
| 6 | K | lead | S | Script engine tiers and compile hints (17 of 20 pages, ~630 ms less foreground compile) | none | none | thin | - | lead | **lead** |
| 7 | K | currency | S | Import maps are cross-engine | none | none | thin | - | - | nothing |
| 8 | K | currency | S | Document transition API "experimental" | motion/reduced-motion-mechanics (already treats snapshot transitions as shipped) | none | likely catch | - | - | **already covered**; the source is the stale side |
| 9 | K | technique | S | Cooperate with process isolation (sandbox, noopener) | security (unverified home) | ? | thin | - | - | untriaged |
| 10 | K | technique | M | Motion carries the mechanism: timing as a claim, beat list as single source, styles as skins, degraded forms | narrative-scroll-surface (illustration-carries-the-claim is the static twin; scroll-bound-progression owns *when*) | new-technique | real gap | 3/1/2 | score | **accept** |
| 11 | K | amendment | S | When no single frame explains (content-bearing-degradation) | motion/content-bearing-degradation, "Freeze on the most explanatory frame" | corrects-claim | real gap | 2/0/1 | score | **accept** |
| 12 | T | script | S | Seek-and-capture export for deterministic animations | none | none | partial | - | - | folded into #10 (a derived form of the beat list); the instrument stays a run artifact |

GAIN/RISK notes. **#10**: GAIN 2 (new technique) +1 convergence (the source's
filmstrip, the research worker's independent synthesis "a static end-state loses
exactly what a process animation teaches", and training-data convergence on small
multiples). RISK 0 (the director opened both neighbours and the target golden
path), +1 home contested between `motion` (the vocabulary) and
`narrative-scroll-surface` (explanatory pages). Home chosen by stated job:
`motion` explicitly declines choreography, and the golden path of
`narrative-scroll-surface` already owns what an explanatory illustration must
prove. **#11**: an append, not a rewrite. The file's sentences stay true because
the three degraded forms are still "resolved states"; the section adds the case
where no frame is explanatory. `auto=2/2/1 fp=0`.

## Render proof and the five examples

The operator's second request was five examples in different art styles. They
were built as the technique's own test. One seven-beat storyboard of the
article's preload-scanner paragraph, played as a pure function of time, feeds
five **skins**: risograph sketch (director), blueprint schematic, Bauhaus poster,
paper cut-out, pixel terminal (four parallel model workers, one each, from one
contract and the riso reference). Every skin rendered all seven beats with 0
missing roles and 0 page errors. **Three of four workers independently reported
the same contract defect**: 13-14-unit monospace cannot fit the 38-character line
in the 288-unit panel. The contract stated a size and a box, not a
characters-per-width budget. Two more defects were reported once each: labels on
a moving element need its full travel range, and the rule "no filter on moving
classes" did not say whether opacity-only motion counts. Those findings are
written into the technique as the "budgets in the units the style works in"
condition.

Frame-exact video came from the same function: seek to i/30 s, capture,
encode. 546 frames per style at 1280x720. Parallel capture over the browser's
protocol took 53 s for all five, against a projected ~45 min for the first,
serial element-screenshot attempt. The showcase is an Artifact
(https://claude.ai/artifact/193KS1czoNRNk9NZZs2k92), **offered to the operator
for triage. No verdict is recorded on the operator's behalf.** This is not a
render-bound bundle under Phase 6b, so the landing does not wait on it.

## Apply (Phase 7.5) - the seam hunt was the second source

Seam chosen **to falsify**. The corpus's strongest fleet explainer page with a
*process* animation is `personas-web`'s `/how` event-bus section, a loop showing
tools sending to a hub. A caught outcome would show the technique's degraded
forms were wrong or unnecessary there. Measured with reduced-motion emulation in
a browser harness against the dev server:

- **The swarm (technique #10)**. Arm A: 10 of 10 nodes still animating under
  reduce. It animates in the vector format's own animation elements, which the
  site's stylesheet reset cannot reach. That is the `reduced-motion-mechanics`
  engine-inventory rule, caught live. Arm B: 0 of 10 animating, 10 of 10
  visible, each connector drawn with a direction mark (degraded form 3). Floor:
  no-preference 10 of 10 still animate. `better`, ab-paired.
- **Every route (amendment #11's parent technique)**. The repaired swarm's still
  capture came back blank. The page-transition wrapper around *every route* sat
  at opacity 0 for reduced-motion visitors, 4 of 4 routes. Cause: the server
  renders the opening variant, and the reduction branch removed the animation
  target. This is exactly `content-bearing-degradation`'s fourth failure shape,
  reached by a path its list does not name: **the reduction branch itself
  removed the lift**. Arm B: settled 1 on 4 of 4. Floor: the enter transition
  still plays. `better`, ab-paired.

Both shipped as pathspec commits on personas-web `main` (`f0b9816`, `11601e0`),
not pushed. Gates: type check clean outside generated dev types, lint clean on
the touched files, unit suite 239 of 239.

## Leads

- **Page-load resource discovery (XL, escalated E4).** No subject owns what the
  browser can find before scripts run: the preload scanner, render-blocking
  resources, resource priority, and script-inserted resources that load late. The
  article's own practical list points at it, and so does the explainer built in
  this run. **Return condition:** the operator accepts a forge of a page-load
  subject (candidate home: `software-engineering/client-architecture/`, which has
  room at 9 subjects), or a fleet project measures a late-discovered critical
  resource.
- **Script compile hints.** A vendor measurement relayed second-hand: 17 of 20
  pages improved, ~630 ms less foreground parse and compile. **Return
  condition:** a fleet project profiles startup parse and compile cost.
- **An animation library's no-code-builder licence clause** (research worker,
  vendor licence text): the library is free for commercial use except in tools
  that let users build animations without code. **Return condition:** a fleet
  project plans a user-facing animation builder on it.

## Catches worth keeping

The accessibility standard's own "understanding" documents frame reduced motion
as *removing* motion and say nothing about what a process animation's
alternative must still convey (research worker, standard tier). The corpus's new
technique takes a position the standard does not. That is a stated stance, not
a citation.

## Untriaged (nobody verified these)

- #4 Long main-thread tasks: break them up, move work off the main thread. Source
  anchor: "long tasks will block the main thread. Break up long operations".
- #9 Cooperate with process isolation: "use iframe sandbox or rel=noopener when
  appropriate".
