---
subject: quality-regression-gating
domain: llm-observability
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# quality-regression-gating

First touch: [[2026-08-23-6]], external reconcile against
`promptfoo/promptfoo` @ `679e7ec` (0.122.0). Gained
`node--unverified-vs-regressed-exit-states` (uncovered); single-stack debt
cleared. Hint confirmed. Executed evidence: five exit-code cases through the
real decision function via the tree's own vitest harness.

## The sharpest sightings

- The tree COMPUTES the unverified discriminator (findTargetErrorStatus) and
  spends it on the console banner while the exit code ignores it - rule 3
  violated with the fix already in a local variable.
- The green hole: zero verified cases -> passRate NaN -> NaN < 100 false ->
  exit 0. Upstream-reportable; reachable via --filter-failing
  warn-and-proceed.
- Both gate constants are env-remappable per invocation - fixed-alpha
  discipline applied to the verdict vocabulary itself; the vendor's own agent
  skill zeroes the exit code and rebuilds the gate outside the tool.

## Technique-edit candidates (single-sighted, banked)

- "Gating is opt-in per invocation" should admit a second split: a flag OR a
  distinct entry point, visible in the invocation (cli-vs-sdk sighted).
- New rule: when the verdict is COMPUTED rather than looked up, enumerate the
  degenerate inputs (no cases, zero denominator) as unverified explicitly - a
  NaN comparison silently takes the pass branch. Possible second sighting
  beside the rust partial-run application; director's call whether it counts.
- fixed-alpha-discipline: extend the discipline to the verdict vocabulary
  (remappable exit codes mean no contract at all).
- partial-run-never-green: promptfoo hard-fails truncation as regressed and
  its own tooling neutralized the exit code - the field witness that
  technique's decision rule predicts.

## Open leads

- Two contradicting official CI recipes ship in-repo (a jq line omitting
  errors from the denominator vs the newer skill reading s.errors).
- Docs advertise a nonexistent --fail-on-error flag; small upstream doc fix.
- --resume incomplete-run semantics untraced.
