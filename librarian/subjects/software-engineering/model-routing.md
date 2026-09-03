---
subject: model-routing
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# model-routing

Touched by [[2026-09-03-awesome-langchain]]. Gained `failover-path-liveness`. The
paired amendment landed next door in `optional-dependency-degradation`.

## What the gap actually was

An **asymmetry**, not an absence, and the reference that produced it was a thin
abandoned demo whose own failure taxonomy is poorer than the corpus's. Reading it forced
the question: the subject decides *when* to fail over — the horizon that detects, the
floors a substitute must clear, the policy that governs — and every bit of that
describes a mechanism nobody has watched run, because a failover path executes only when
something else is broken.

The corpus already owns fault injection twice: in the test-input subject as a recovery
instrument, and as a *retirement* instrument via withholding. It has never owned it as a
**production liveness** instrument. Exploration is the de facto substitute and fails in
two specific ways — it is defined to suspend when the healthy candidate pool is thin, so
it withdraws exactly during the incident it would have prepared for; and it exercises a
*destination* rather than the transition, entering the detect-attribute-exclude-redraw
chain only at the last step.

## What three projects said

`better` in all three. One declares 90 named fallback sites, lint-enforced so a silent
catch is impossible, all 90 exceptional, against 5 liveness assertions — 5.6%, and its
one env flag touching a safety net *disables* the gate rather than exercising it. One
has three of its last fifteen engine commits fixing substitute paths with no counter
added, so a fourth is invisible today. One had already written the technique's core
claim into a doc comment — both counters stay zero when the fabric is off, because
nothing is being substituted — a two-sighting corroboration; and its failover ladder
turned out to have **zero production callers**, hardened by five commits including a
silent data-corruption fix, on a branch no shipped configuration can take.

## Open

No tree examined can inject a fault: provider endpoints are hard-coded literals with no
base-URL override. That one override is the cheapest instrument in the fleet and would
unblock this technique in two projects at once.
