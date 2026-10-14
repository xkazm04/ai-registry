---
layer: application
type: application
subject: acceptance-verdict-spine
technique: gate-check-dependency-map
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# React realization - the Items Test Gate dependency map, and the vacuous check

Same repo (`pof`). The map is already data (`GATE_CHECK_DEPS`), the evaluation is
one function shared by the badge, the checklist and the log line, and the resolver is
injected as a function. The technique held on all of that. The seam chosen to falsify
it was the one the technique states as a rule and the code did not enforce.

## What the seam showed

The decision rule says a check with no dependencies is not a check. `deriveGateChecks`
looked up `GATE_CHECK_DEPS[name] ?? []` and looped over the result. An empty list
left zero blockers, and zero blockers meant `ok: true`. A fifth named check added to the
gate list without a map entry, or a renamed key, passed vacuously and printed success.
This is the same empty-conjunction defect found in the sibling combinator.

## A and B

- A: the function as it was. A new test removing one map entry and resolving every
  sibling as pass reported that check `ok: true`. The test fails on old code.
- B: a check with no declared dependency carries an `unmapped` blocker, so it is
  neither ok nor deferred and the gate reports failure. Tests also pin that every named
  check has at least one dependency and that each names a real step.

Target: the vacuous check blocks. Floor: the 164 layout-lab test files (1083 tests),
`tsc --noEmit` and eslint on the touched files stay green.

## Coverage, read from the map

Five of thirteen steps are in no check: Concept Brief (upstream of all), Test Gate
(the gate), UE Packaging (downstream), and SFX and Tooltip / Compare, which are ungated
with no stated reason. That is the technique's "intentional or a hole" question; it is
now a pinned list so a new unit cannot slip past unseen, and whether SFX should gate is
left to a human.

## What was not measured

The bespoke gate component is no longer routed (the registry owns the Test Gate), so
the live badge does not read this function today. The fix protects the pure function
and its unrouted view, not a path the operator sees.
