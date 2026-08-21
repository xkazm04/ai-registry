---
layer: application
type: application
subject: candidate-archetype-routing
technique: one-registry-shared-across-runtimes
stack: node
status: forged
verified_on: 2026-08-20
---

# One file, two languages, and a load-time weight check

This repo is a TypeScript app with a spawned Python analysis pipeline. Both need the
archetype taxonomy, and both read the *same file*: `pipeline/jobfit/archetypes.json`. The
TypeScript side imports it directly (`app/_lib/archetypes.ts:13`,
`import archetypeRegistry from "@/pipeline/jobfit/archetypes.json"`); the Python side
loads it as a leaf module with stdlib only (`pipeline/jobfit/registry.py:22`). There is
no generated intermediate and no shared library — one file, two readers.

## The artifact states its own reason for existing

`archetypes.json:2` is a `_comment` key that is the registry's manifesto, and it is worth
quoting because it is the cheapest control in the system:

> "SINGLE SOURCE OF TRUTH for the candidate-archetype taxonomy, read by BOTH Python
> (`pipeline/jobfit/registry.py`) and TypeScript (`app/_lib/archetypes.ts`). Because both
> sides read THIS file, the TS<->Python desync that the fairness gate feared is
> structurally impossible. Adding an archetype here (with a known `scoringModel` +
> checklist checks + detection signals) extends the system end-to-end without code
> changes. `fairnessProtected` is compliance-critical: it shields an archetype from
> AUTOMATED rejection."

The header of `app/_lib/archetypes.ts:1-11` names what the arrangement replaced: labels
that had been copied into two type modules, and "the protected set copied into
screen-wave / group-eval-run / comms-dispatch". Three independent copies of the shielded
set, in a system where a divergence between any two produces no error at all.

## Every consumer derives, none declares

`app/_lib/archetypes.ts:26-47` builds all four TypeScript views by filtering the imported
array — display labels, badge labels, the fairness-protected set, and the early-career
(potential-scored) set. `registry.py:71-76` does the identical thing on the Python side:

```python
def early_career_archetypes() -> tuple[str, ...]:
    return tuple(a["id"] for a in _ARCHETYPES if a["scoringModel"] == "early_career")

def fairness_protected_archetypes() -> frozenset[str]:
    return frozenset(a["id"] for a in _ARCHETYPES if a.get("fairnessProtected"))
```

Note that the two flags are kept separate: `fairnessProtected` (may this class be
auto-rejected) and `scoringModel` (which rubric runs). They happen to coincide today —
`student` and `career_switcher` are both — and the registry still declares them
independently, so a future archetype can be potential-scored without being shielded, or
shielded without being potential-scored.

The single source is pinned by a test that **scans the sources**, not just the behaviour:
`pipeline/jobfit/tests/test_early_career_single_source.py` asserts every consumer module
derives its set from the registry and greps the Python sources so a hand-written tuple
cannot be reintroduced — in any bracket form, after a bug where a set literal slipped past
a check that covered only `()` and `[]`.

## The weight-sum check, and the incident behind it

`registry.py:29-57` is the standard's highest-value validation, implemented as an
import-time invariant with the incident recorded in the comment:

```python
# The headline score is a weighted average `100 * (w.skills*skills + w.career*career
# + w.personal*personal)` — it is only an *average* when the weights sum to 1.0. The
# archetypes.json comment states "must sum to 1.0" but nothing enforced it, so a
# one-digit typo in a hand-edited archetype (e.g. summing to 0.9) silently rescaled
# every score/tier/shortlist for that archetype with no error — each value still looked
# plausible in [0,100]. Fail fast at import ...
```

`_validate_archetype_weights` checks both the exact key set and `abs(total - 1.0) > 1e-6`,
raising a `RuntimeError` that names the archetype and the actual sum. It runs at module
scope (`registry.py:57`), before any accessor exists — so a bad vector cannot reach a
candidate. This is the standard's rule verbatim: a load-time check, not a unit test,
because a test protects the values in the repository and the check protects whatever the
running process was handed.

`test_registry.py` extends the same idea to the rest of the file: valid weights, a known
`scoringModel`, checklist `check` ids that exist in `pipeline/jobfit/profile.py`'s
`CHECKS`, and detection rules referencing only known signals and known archetype ids.

## Retire, don't trap

`registry.py:79-86` implements the archival contract and documents why the reader is
written the way it is:

```python
def archived_ids() -> frozenset[str]:
    """Ids of RETIRED (archived) archetypes. The recruiter UI adds an ``archived``
    flag to a custom archetype to hide it from the pickers, but the entry STAYS in
    the registry so a profile routed to it still routes and scores. This reader only
    tolerates the additive flag (``.get`` — absent on active archetypes); nothing in
    this module excludes archived archetypes from routing/scoring, which is exactly
    the "retire, don't trap" contract — a retired archetype keeps working."""
```

The load-bearing detail is the negative one: no other function in the module filters on
`archived`. Retirement removes a class from the pickers and from nothing else.

## Which archetypes are self-declarable is a registry decision

`app/_lib/apply.ts:43-49` builds the candidate-facing self-declaration options by
filtering on the presence of an `applyLabel`, so the taxonomy and the intake question are
two different lists derived from one file. Each archetype carries four labels for four
audiences (`label`, `badge`, `pythonLabel`, `applyLabel`), all in the entry.

`apply.ts:70-74` closes the extension hazard the standard warns about: `LANED_ARCHETYPES`
names the ids with a tailored question lane, and the comment states the fallthrough —
"Any OTHER archetype — bau, a skipped question, or a future registry addition without a
lane — falls through to the default 'most relevant experience' question, so a new
archetype can never silently get an empty intake."

## Where this falls short of the standard

- **The TypeScript side does not validate on load.** The weight-sum and structural checks
  exist only in Python (`registry.py:57`) and in the Python test suite. The app imports
  the file directly and would happily run on a vector that does not sum to one — it
  currently reads only labels and flags, so nothing breaks today, but the standard's rule
  is that each runtime enforces the shared definition rather than trusting another
  runtime to have done it.
- **The archival flag has no writer under test.** `archived_ids()` reads a flag the
  recruiter UI is said to add; no archetype in the file carries it, so the "keeps
  working" contract is asserted by the reader's structure and by a docstring rather than
  by a test that routes a candidate into an archived class.
