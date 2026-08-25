---
layer: application
type: application
subject: agent-instruction-files
technique: instruction-freshness
stack: claude-code
verified_on: 2026-08-24
verified_against: claude-code@2
---

# Freshness practice and its failures, read across the fleet (Claude Code)

Read on 2026-08-24 across the six fleet projects. The fleet is both the
technique's best exhibit and its cautionary tale — often in the same
file.

## The practice working: dated, predicated, self-correcting

personas' `.claude/CLAUDE.md` runs the technique's claim-form at scale:
rules carry "Measured/Corrected YYYY-MM-DD" blocks, corrections preserve
what was wrong ("an earlier revision named a utility pair that does not
exist"), and its own doctrine says re-measure before citing. A
path-existence audit across all six projects found **43/43 cited paths
resolve** — path rot is near zero, and ascent's "zero .tsx over 300 LOC"
claim re-verified true. Where the fleet rots is exactly where the
technique predicts: counts and enforcement states, not paths.

## The failures, each mapping to a checklist line

- **Drifted counts:** personas-web claims "9 specs under e2e/" — 11
  exist; personas' census cites "201 regex rules" — 204 on disk (its
  dated predicate makes this drift *detectable*, which is the point).
- **Dead rule:** personas-web's out-of-scope list still forbids editing
  `.claude/commands/goal-analysis-*.md` — no such files exist. A rule
  constraining work on nothing, still charging the dilution tax.
- **Phantom gate (the high-stakes one):** personas' doc-sync section
  describes a three-check Stop hook as the enforcement mechanism; its
  own embedded 2026-08-17 measurement records the hook has fired 0 times
  in 2,367 edits (transcript-walk bug, deliberately deferred). The file
  at least *says so* — the honest form of a standing-unenforced rule —
  but ~9KB of always-loaded text still narrates enforcement that does
  not operate.
- **Stale warning about staleness:** personas has three context-map
  counts simultaneously on disk — the root block says 208 contexts/16
  groups, the vibeman block warns the committed map is 236/12 while the
  app DB holds 49/8 and asserts the root reports the DB numbers, which
  it no longer does. A freshness warning is itself a dated claim; this
  one was not re-dated and now misleads with the authority of a caveat.
  (Also the machine-owned-regions violation: two generators, one
  artifact.)

## Post-sync addendum (same day)

The sync wave of 2026-08-24 closed four of the five findings: the dead
goal-analysis rule and the spec count (personas-web af7950a — the count
was removed rather than re-pinned, the stronger move), the census count
re-measured 201→204 with date and method inline (personas d5fe056a4),
and the stale warning-about-staleness resolved by removing the
superseded machine-owned block whole — hand-editing inside the fence was
correctly refused. The phantom-gate finding closed the honest way, not
the enforcing way: the doc-sync section now opens "this rule stands
unenforced — honor-system", keeping the 0/2,367 measurement; the hook
repair remains deliberately deferred (operator-workflow decision,
tracked in the repo's deferred-fixes ledger).

## Tooling exists for the mechanical half

The audit's paths-and-commands line is gate-able today: agents-lint
(github.com/giacomo/agents-lint) and agentlint.app lint instruction
files for dead paths, dead npm scripts and stale patterns. None of the
six projects runs one; given 43/43 paths resolved, the fleet's exposure
is the un-gateable half — counts, enforcement claims, and warnings —
which is where its five real staleness findings all sit.
