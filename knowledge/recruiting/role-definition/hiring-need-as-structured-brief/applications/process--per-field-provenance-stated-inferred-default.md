---
layer: application
type: application
subject: hiring-need-as-structured-brief
technique: per-field-provenance-stated-inferred-default
stack: process
status: forged
verified_on: 2026-09-29
---

# Provenance in the intake extraction contract (Python prompt pipeline)

The brief schema is Pydantic-authoritative in `pipeline/jobfit/rolebrief.py`;
the trust model is enforced in two different places with two different
instruments — a prompt for the model path, straight-line code for the scripted
path. Re-read on 2026-09-29 against kp `8a44493f7`.

## The three-valued vocabulary, defined at the schema

`BRIEF_PROVENANCE = ("stated", "inferred", "default")`
(`pipeline/jobfit/rolebrief.py:45`), with the header comment carrying the
standard's own definition — *"'default' = a template/taxonomy default filled
the hole"* — and declaring itself **deliberately distinct from
`taxonomy.UI_PROVENANCE`**, the candidate-evidence provenance. Where a hiring
need's value came from is not the same question as how a candidate's claim
was evidenced.

Every entry-level model carries the triple: `BriefRequirement` (`:80`) and
`BriefFacet` (`:95`) each hold `provenance` / `confidence` / `source_turn`,
defaulting to `inferred` at 0.5.

## The spine map, and the incident that forced it

`RoleBrief.spine_provenance` (`rolebrief.py:121-128`) is the standard's
"basis map for scalars" implemented literally. Its comment names the failure
that produced it: without it, *"the schema defaults ('medior',
'software_engineering') were indistinguishable from captured values and
rendered as if the requestor said them"*. The lift bridge
`role_brief_from_spec` (`:297`) sets a spine key only when the source payload
carried that field (`:316`). It has no production caller today.

## The prompt half: `_EXTRACTION_RULES`

`pipeline/jobfit/intake.py:136-175` states the narrow bar verbatim — *"'stated'
ONLY for values the requestor actually said or explicitly confirmed; your own
proposals and readings-between-lines are 'inferred' (with honest confidence
0..1); template assumptions are 'default'"* — and closes the spine loophole:
*"a schema default you never captured stays 'default'"*. A ROUTING paragraph
added since the last reading names the row shape and its `skill` field.

The same contract carries the non-answer rule (*"A skipped or declined
question is never data"*) and the no-forced-enum rule (*"A grade answer
outside junior|medior|senior|lead ('Band 5', 'AfC 6') is NEVER force-mapped
onto the enum"*). Traceability is now numbered: *"transcript lines are
numbered ([N]) — set sourceTurn on every requirement/facet to the [N] of"* the
requestor line (`:172`).

## The coercer is where the contract met the record

A prompt asks and a coercer decides, so the coercer is where a rule the
prompt states can be quietly undone. On 2026-09-29 it undid two:
- **The forced enum, on the model path.** A seniority of "Band 5" fell to
  "medior", and the payload's `stated` basis for seniority went with it. The
  brief then recorded a level the requestor never said. The contract forbids
  exactly this; the coercer did it after the model complied.
- **A fallback grade that gates.** A requirement with a missing or
  off-vocabulary `hardness` was filled with `prerequisite`, the rubric's
  blocking cell.

Both are **fixed in kp `8a44493f7`** (local, not pushed; `rolebrief.py:212-219`
and `:260-278`):
- a missing or unknown hardness falls to `learnable`;
- an off-vocabulary seniority keeps its verbatim value as the `grade_label`
  facet, and the enum reads `default`.

On one payload walked through the real coercer and `derive_role_rubric`,
blocking went from 3 of 3 rows to 1 of 3, the explicitly graded one, and
"Band 5" went from lost to kept. The new tests were red first.

## The scripted half: `_apply_answer`

The keyless path writes the same schema without a model
(`intake.py:897`). Its docstring states the invariant — *"Everything here is
the requestor's literal input → provenance 'stated'"* — and `_stated_facet`
(`:883`) hard-codes `provenance="stated", confidence=0.9`.
- `_SKIP_WORDS` (`:809`) now covers four locales, and a skip returns the
  brief unmodified, so the field stays at `default`.
- The seniority slot is negation-aware (`_level_stated`, `:832`). An answer
  with no enum token, including "not junior", is captured verbatim as a stated
  `grade_label` facet, and the enum is left alone.

With no model available, the brief populates only `stated` and `default`, so a
degraded run is thinner rather than quietly worse. The one inference the
scripted path makes is marked as one: `classify_role_family` writes
`spine_provenance.setdefault("role_family", "inferred")` (`:1360`), which can
never overwrite a stated family.

## Where the basis map is read back

`brief_gap_summary` (`intake.py:267`) tests
`brief.spine_provenance.get("seniority") == "stated"` rather than the enum, so
"what is missing" reads bases, not values. The export flags a defaulted
seniority with a warning glyph (`app/_lib/intake-export.ts:56-61`).

## Where the repo falls short of the standard

- **Nothing that decides reads the basis.** Neither the promote gate nor the
  rubric's blocking cell reads provenance (see the promote-gate
  application). `needTextFromBrief` flattens stated and inferred facets alike
  into the job-description build input. The technique's rule is "when a value
  is displayed anywhere a decision is made, display its basis with it".
- **Drops are silent.** A requirement row with no name field, a facet with no
  `value`, and a spine-map key outside the known spellings are all discarded,
  and nothing counts or logs them.
