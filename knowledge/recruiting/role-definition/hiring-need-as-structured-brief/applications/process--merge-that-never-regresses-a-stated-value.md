---
layer: application
type: application
subject: hiring-need-as-structured-brief
technique: merge-that-never-regresses-a-stated-value
stack: process
status: forged
verified_on: 2026-09-29
---

# `merge_brief` and the edit path (Python pipeline + TypeScript review surface)

The brief accumulates across three writers: the per-turn extraction that
re-emits the whole brief as JSON, the deterministic slot script, and a human
editing the panel. Two pieces of code hold the merge contract. Re-read on
2026-09-29 against kp `8a44493f7`. About fifty commits touched these files
after the 2026-08-20 reading, and every line citation moved.

## Union, because the model forgets

`merge_brief` (`pipeline/jobfit/intake.py:1406-1477`, with the scalar helper
`_merge_spine_scalar` at `:1375-1403`) sits under a section header that names
its adversary (`:1371`) — *"Brief merge — protects accumulated state from an
LLM that forgets fields"* — and its docstring states the rule
(`:1407-1410`): *"base entries absent from the update are kept"*.

This is the necessary complement to the extraction contract's own instruction
(`intake.py:137-138`: *"Carry over everything already in the current brief —
never drop a field you are not changing"*). The prompt asks; the merge
guarantees.

Entry matching is by stable identity, not prose: requirements collide on
`req.skill.strip().lower()` (`:1446-1448`), facets on `key` (`:1460-1462`) —
never on the human `label`, which the contract tells the model to write in the
dialog's language (`intake.py:166`).

## Monotone trust, stated verbatim

The technique's headline sentence exists in the source as a comment, and the
guard is unchanged (`intake.py:1451-1453`):

```python
# A stated grading never regresses to an inferred one.
if existing.provenance == "stated" and req.provenance != "stated":
    continue
```

The identical guard repeats for facets (`:1464-1465`). Both list merges cap
(`requirements[:24]` at `:1458`, and `facets[:32]` at `:1475`, raised from 20
for the App master intake).

## The sentinel, mostly retired

The 2026-08-20 reading found scalars decided by value equality to the schema
default. `336e9dd70` (2026-08-22) moved them into `_merge_spine_scalar`, which
now consults the basis first (`:1396-1403`):

```python
if update_prov != "default":
    if base_prov == "stated" and update_prov != "stated":
        return base_value
    return update_value
# No provenance on the update ...: fall back to the value sentinel
return update_value if update_value != schema_default else base_value
```

A stated "medior" now merges. The residue is the map-less fallback. The
coercer returns an empty spine map when the model omits it, and then:
- a requestor's "medior" against a stated "lead" is dropped;
- an unattributed "senior" overwrites the stated "lead", and the basis map
  overlay (`:1432`, unconditional) leaves it wearing the `stated` chip;
- an `inferred` update with the same value regresses the map to `inferred`;
- the title has no basis check at all (`:1412-1413`), so an inferred title
  overwrites a stated one.

The rule stands: consult the basis map, never value-equality. The map is not
always present on the wire, which is why a missing map must read as "no
claim" and never as a license.

A related coercion is fixed. An off-vocabulary seniority ("Band 5") was
coerced to "medior" and carried the payload's `stated` basis onto it. kp
`8a44493f7` (local) now drops that basis in `coerce_role_brief` and keeps the
verbatim answer as the `grade_label` facet (`rolebrief.py:260-278`). The TS
edit path still force-maps an off-vocabulary seniority on a PATCH.

## What a save confirms

`withEditProvenance` (`app/_lib/brief-edit.ts:180`) implements the rule: *"only
CHANGED or NEW entries flip ... an edit pass can't launder inferred values
into 'stated'"* (`:171`; the feature doc restates it at
`docs/features/intake/README.md:780-788`). Since `34d5659d9` (2026-09-01) the
server owns provenance: a client claim is honoured *"EXCEPT that it can never
regress a stored `stated`"* (`:89`).

The mirror has drifted. `sanitizeEditedBrief` (`:210`) reads only `skill`
where the Python coercer also reads `label`, `name` and `requirement`, and it
capped facets at 20 against the merge's 32. An App master brief reaches 22
facets, so one save silently dropped the mandate, budget and owner slots.
**Fixed in kp `8a44493f7`** (local): the save keeps `MAX_BRIEF_FACETS = 32`
(`:25`). The test was red first: 20 of 33 kept, then 32.

## Where the repo falls short of the standard

- **A stated reversal overwrites in place.**
  `merged.requirements[by_skill[key]] = req` (`:1454`). A must-have stated at
  turn 3 and regraded nice-to-have at turn 9 leaves one row, from turn 9. The
  technique keeps the superseded entry.
- **A human delete leaves no record.** *"A row absent from the payload was
  DELETED and stays deleted"* (`brief-edit.ts:107`), and no event is written.
- **The edit path matches facets on `(key, label)`** (`:107`). The Python
  merge matches on key alone, which is what the technique asks for, because
  labels are localised.
- **A voice sweep can revert a human edit.** `voice-complete` reads the brief,
  runs extraction for seconds, and then writes
  `brief_json = COALESCE(?, brief_json)` with no version check. An edit
  saved mid-sweep is overwritten. This is read from the code; it was not
  executed.
- **Cross-requestor merging is unmeasurable here.** Every caller of
  `merge_brief` is within one session.

## The freeze

The freeze holds on the server, not only in the interface. A PATCH to a
promoted session gets `INTAKE_FROZEN` (409) (`app/api/intake/[id]/brief/route.ts:36`),
and so do the attachment, dossier, compose, voice-complete and reopen routes.
The store also guards on `status != 'promoted'`. The premise is the
standard's own (`docs/features/intake/README.md:797-800`): *"an edited brief
silently diverging from a published JD would be the dishonest middle
ground"*. Candidates on the role slate are stamped with the rubric version
they were judged against. That is the version binding the technique's
"freezing" section asks for.
