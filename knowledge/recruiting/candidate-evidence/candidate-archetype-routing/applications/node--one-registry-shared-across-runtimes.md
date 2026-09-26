---
layer: application
type: application
subject: candidate-archetype-routing
technique: one-registry-shared-across-runtimes
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# One file, two languages, and a load-time weight check in both

This repo is a TypeScript app with a spawned Python analysis pipeline. Both need the
archetype taxonomy, and both read the *same file*: `pipeline/jobfit/archetypes.json`. The
TypeScript side imports it directly (`app/_lib/archetypes.ts:21`); the Python side loads
it as a leaf module with stdlib only (`pipeline/jobfit/registry.py:23`). There is no
generated intermediate and no shared library — one file, two readers.

Re-verified 2026-09-26 against main at `cf9a4b81c`. Since the 2026-08-20 reading the
TypeScript side gained load-time validation, and the two flags the reading praised for
staying separate have been deliberately joined on the TypeScript gate.

## The artifact states its own reason for existing

`archetypes.json:2` is a `_comment` key that opens "SINGLE SOURCE OF TRUTH for the
candidate-archetype taxonomy, read by BOTH Python (`pipeline/jobfit/registry.py`) and
TypeScript (`app/_lib/archetypes.ts`)" and ends "`fairnessProtected` is
compliance-critical: it shields an archetype from AUTOMATED rejection." The header of
`app/_lib/archetypes.ts:1-19` names what the arrangement replaced, "the protected set
copied into screen-wave / group-eval-run / comms-dispatch" (5-6). It now also notes that
the static import is the build-time registry, and that server decisions go through a
live reader.

## Every consumer derives, none declares

`app/_lib/archetypes.ts` builds its views by filtering the imported array: labels
(34-36), the shielded set (68), the early-career set (71-73). The separate badge map was
removed on purpose (38-47). `registry.py:109-114` does the same on the Python side:

```python
def early_career_archetypes() -> tuple[str, ...]:
    return tuple(a["id"] for a in _ARCHETYPES if a["scoringModel"] == "early_career")

def fairness_protected_archetypes() -> frozenset[str]:
    return frozenset(a["id"] for a in _ARCHETYPES if a.get("fairnessProtected"))
```

The single source is pinned by a test that **scans the sources**:
`pipeline/jobfit/tests/test_early_career_single_source.py` greps for hand-written tuples
in any bracket form (regex at 50, the incident in the comment at 45-48). A search for
literal shield sets across `app/`, `pipeline/` and `scripts/` finds none. The remaining
`"student"`/`"career_switcher"` literals are intake lanes, copy and seed data.

## The weight-sum check, now in both runtimes

`registry.py:30-58` is the Python invariant, with the incident in the comment ("a
one-digit typo in a hand-edited archetype (e.g. summing to 0.9) silently rescaled every
score/tier/shortlist"). `abs(total - 1.0) > 1e-6` is at 50, and the module-scope call at
58 runs before any accessor exists.

The TypeScript side caught up on 2026-09-04. `app/_lib/archetype-registry.ts:123`
`validateRegistry` runs on every read, with `WEIGHT_SUM_TOLERANCE = 1e-6` at 36. Its
comment gives the reason in the standard's own terms: "Reading was a bare
`JSON.parse(raw) as Registry` — a cast, which asserts nothing at runtime — while Python's
reader validates the identical file at IMPORT ... Validating on READ makes the two
readers agree."

## Retire, don't trap

`registry.py:117-124` `archived_ids()` documents the contract: "nothing in this module
excludes archived archetypes from routing/scoring, which is exactly the 'retire, don't
trap' contract". No function in the module filters on `archived`.

## Which archetypes are self-declarable is a registry decision

`app/_lib/apply.ts:43-49` builds the self-declaration options from entries carrying an
`applyLabel`. `apply.ts:75-79` (`LANED_ARCHETYPES`) states the fallthrough: a future
registry addition without a lane falls "through to the default 'most relevant
experience' question, so a new archetype can never silently get an empty intake".

## Where this falls short of the standard

- **The two flags are no longer independent on the shield.** `archetypes.ts:65-67`
  `shieldsFromAutoReject` returns `def.fairnessProtected === true ||
  def.scoringModel === "early_career"` (2026-09-23). The reason is stated at 60-64:
  Python's policy pass keys its shield on `scoringModel`, so "a TS gate that read the
  flag alone would be looser than the engine it backstops". The effect is that the
  compliance-critical flag the artifact names cannot switch a shield *off*. And
  `registry.fairness_protected_archetypes()` has no production caller, so the flag
  `archetypes.json:2` calls compliance-critical is not what the Python gate reads.
- **The static import is still unvalidated.** `archetypes.ts:21` reads the file directly
  for labels and sets. It does not go through `validateRegistry`.
- **Archival has no routing test.** `pipeline/jobfit/tests/test_registry.py:117-122`
  `test_archived_flag_is_tolerated_and_still_scores` passes a retired entry to the
  weight validator only. It does not route or score a candidate into an archived class,
  so "keeps working" is still asserted by structure and a docstring.
