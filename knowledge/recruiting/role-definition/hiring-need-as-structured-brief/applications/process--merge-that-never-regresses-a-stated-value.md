---
layer: application
type: application
subject: hiring-need-as-structured-brief
technique: merge-that-never-regresses-a-stated-value
stack: process
status: forged
verified_on: 2026-08-20
---

# `merge_brief` and the edit path (Python pipeline + TypeScript review surface)

The brief accumulates across three writers: the per-turn extraction that
re-emits the whole brief as JSON, the deterministic slot script, and a human
editing the panel. Two pieces of code hold the merge contract.

## Union, because the model forgets

`merge_brief` (`pipeline/jobfit/intake.py:606-663`) sits under a section header
that names its adversary — *"Brief merge — protects accumulated state from an
LLM that forgets fields"* — and its docstring states the rule the standard
asks for: *"an update can revise or add, but silently DROPPING something the
requestor already stated must not lose it — base entries absent from the update
are kept"*.

This is the necessary complement to the extraction contract's own instruction
(`intake.py:107-108`: *"Carry over everything already in the current brief —
never drop a field you are not changing"*). The prompt asks; the merge
guarantees. Where a rule matters, the repo states it in both instruments —
prompt for compliance, code for the invariant.

Entry matching is by stable identity, not prose: requirements collide on
`skill.strip().lower()` (`:638`), facets on `key` (`:653`) — never on the
human `label`, which `_EXTRACTION_RULES` explicitly instructs the model to
write *in the dialog's language* (`intake.py:131`) and would therefore match by
accident across locales.

## Monotone trust, stated verbatim

The technique's headline sentence exists in the source as a comment
(`intake.py:641-644`):

```python
# A stated grading never regresses to an inferred one.
if existing.provenance == "stated" and req.provenance != "stated":
    continue
```

The identical guard repeats for facets (`:655-657`). Note the shape: it
protects the **whole entry**, grading included — a requirement a human moved
off `must_have` is not re-promoted by the next pass reading the same forceful
sentence. Spine bases merge by dictionary overlay (`:632`), and a missing key
reads as `default` by the schema's own note (`rolebrief.py:121-122`).

Both list merges cap (`requirements[:24]`, `facets[:20]` — `:649`, `:662`): the
cap is a reviewability budget, since the brief's whole purpose is a record a
requestor inspects.

## The one deviation: default-as-sentinel

Scalars use *equality to the schema default* as the test for "the update says
nothing" — `if update.seniority and update.seniority != "medior"` (`:619-622`),
and the same for `role_family != "software_engineering"`. A requestor who
genuinely states *medior* produces an update the merge declines to apply. The
`spine_provenance` overlay one line later carries the truthful basis, so the
information is not lost — but the scalar itself is decided by a value test that
cannot distinguish a stated default from an unfilled one. The standard's rule
stands: consult the basis map, never value-equality. The map is already there.

## What a save confirms

The human path is `withEditProvenance` (`app/_lib/brief-edit.ts`), and it
implements the standard's rule exactly: *"A typed edit is `stated` by
definition — but only CHANGED or NEW entries flip … untouched entries keep
their provenance/confidence/`sourceTurn`, so an edit pass can't launder
inferred values into 'stated'"*
(`docs/features/intake/README.md:196-207`). The server clamps shape at the
trust boundary with `sanitizeEditedBrief` mirroring the Python coercion, and
the transcript is never touched by an edit — so source pointers keep resolving
to what was actually said.

## The freeze

`docs/features/intake/README.md:209-214`: a `complete` session can be re-opened
(a system turn is appended *"so the transcript honestly records the gap"*), but
**promoted sessions stay frozen** — edit is hidden with a note, because *"an
edited brief silently diverging from a published JD would be the dishonest
middle ground"*. That is the standard's freeze, argued from the same premise:
the record a decision was made against may not move under it.
