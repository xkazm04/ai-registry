---
domain: game-production
subject: judgeable-spec-authoring
last_touched: 2026-09-01
touched_by: external-reconcile
dry_streak: 0
---

# judgeable-spec-authoring

Forged 2026-09-01 (commit `13c9e10`) with no application; first touch the same day by
[[2026-09-01-1]] through the external-reconcile lane. Counterpart: `cucumber/cucumber-js`
@ `c887bc5`, 13.2.1 (class A) - an executable-specification runner where a worked
example is executed against rules by a strict machine reader.

## Landed

- `applications/node--execute-the-rules-against-the-worked-example.md` (130 lines).
  Fate **confirmed**, step 4 sharpened, one scoped limit.

## Sharpest finding

The runner's verdict vocabulary classifies *why the example failed to bind to a rule* -
no rule (undefined, with a generated snippet), two rules (ambiguous, refusing any
most-specific heuristic), rule declared itself unfinished (pending), rule disagreed
(failed) - and strictness is one bit over exactly one of them: pending is the only
verdict a grader lets you configure away. Executed: strict flipped exactly one row of an
eight-row matrix; dry-run exits 0 while reporting undefined and ambiguous scenarios.

## Technique-edit candidates (banked, one sighting)

- `execute-the-rules-against-the-worked-example` step 4 collapses four binding
  outcomes into "decide which is right"; a step 3.5 asking one / none / two is owed.
- Same file, "audit even where no finding points": reachability - an unreferenced rule
  (a wording with zero call sites) survives execution-against-examples indefinitely.
- `enumeration-closure-as-arithmetic`: the strictest reader enforces only closure it can
  count locally (cells vs header); a cross-reference closure (every placeholder has a
  column) passes silently. Add to "when not to use".

## Leads

- `compatibility/` in the clone holds a versioned cross-implementation conformance kit.
  Return: when any subject here needs a class-B-style run rather than a hand fixture.
- Config coupling (`retry` must accompany `retryTagFilter`) is a `one-field-one-question`
  adjacent instance, undeveloped.

## Cross-subject proposals

- `acceptance-verdict-spine`: "exactly one verdict configurable, the rest unconditional"
  is a second-sighting candidate; a third makes it a law conversation.
- `quality-verdict-integrity`: dry-run exit 0 while judging nothing is a runnable
  instance of a green exit that judged nothing.
