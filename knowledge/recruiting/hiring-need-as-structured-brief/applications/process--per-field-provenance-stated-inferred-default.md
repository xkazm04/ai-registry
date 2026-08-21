---
layer: application
type: application
subject: hiring-need-as-structured-brief
technique: per-field-provenance-stated-inferred-default
stack: process
status: forged
---

# Provenance in the intake extraction contract (Python prompt pipeline)

The brief schema is Pydantic-authoritative in `pipeline/jobfit/rolebrief.py`;
the trust model is enforced in two different places with two different
instruments — a prompt for the model path, straight-line code for the scripted
path.

## The three-valued vocabulary, defined at the schema

`BRIEF_PROVENANCE = ("stated", "inferred", "default")`
(`pipeline/jobfit/rolebrief.py:41-45`) with the header comment carrying the
standard's own definition — *"'default' = a template/taxonomy default filled
the hole"* — and, notably, declaring itself **deliberately distinct from
`taxonomy.UI_PROVENANCE`**, the candidate-evidence provenance. Two provenance
axes, never merged: where a hiring need's value came from is not the same
question as how a candidate's claim was evidenced.

Every entry-level model carries the triple: `BriefRequirement` and `BriefFacet`
each hold `provenance` / `confidence` / `source_turn` (`:75-99`), defaulting to
`inferred` at 0.5 — a coercion-friendly default that the two writers below
override honestly.

## The spine map, and the incident that forced it

`RoleBrief.spine_provenance` (`rolebrief.py:116-123`) is the standard's "basis
map for scalars" implemented literally, and its comment names the failure that
produced it: without it, *"the schema defaults ('medior', 'software_engineering')
were indistinguishable from captured values and rendered as if the requestor
said them"*. The lift bridge respects it: `role_brief_from_spec` (`:226-259`)
sets a spine key **only when the source payload actually carried that field** —
an absent title leaves `spine["title"]` unset rather than recording a basis for
a value nobody supplied.

## The prompt half: `_EXTRACTION_RULES`

`pipeline/jobfit/intake.py:105-141` is the densest artifact for this subject.
The provenance paragraph states the narrow bar verbatim — *"'stated' ONLY for
values the requestor actually said or explicitly confirmed; your own proposals
and readings-between-lines are 'inferred' (with honest confidence 0..1);
template assumptions are 'default'"* — and then closes the spine loophole
explicitly: *"a schema default you never captured stays 'default'"*.

Three further rules in the same contract are provenance discipline wearing
other clothes:

- **Non-answers.** *"A skipped or declined question is never data — record
  nothing for it (no facet whose value is the skip word)."* The parenthesis is
  the tell: the observed failure was not a fabricated value but a facet whose
  content was the word "skip".
- **No forced enum.** *"A grade answer outside junior|medior|senior|lead
  ('Band 5', 'AfC 6') is NEVER force-mapped onto the enum — leave seniority as
  it is and store the requestor's verbatim grading as a stated `grade_label`
  facet instead."*
- **Traceability as a provenance obligation** — `sourceTurn` on every
  requirement and facet, *"null only when a value genuinely has no single
  source line"*.

## The scripted half: `_apply_answer`

The keyless path writes the same schema without a model
(`intake.py:360-424`). Its docstring states the invariant — *"Everything here
is the requestor's literal input → provenance 'stated'"* — and
`_stated_facet` (`:346-357`) hard-codes `provenance="stated", confidence=0.9`.
Two behaviours match the standard exactly:

- `_SKIP_WORDS` (`:336`) matches skip/none/`-`/`nevím` and returns the brief
  **unmodified** (`:371-372`) — the non-answer leaves the field at `default`.
- The seniority slot scans for an enum token and, failing to find one, falls to
  an `else` branch that captures the answer verbatim as a stated `grade_label`
  facet at `core` importance, leaving the enum untouched (`:392-411`). The
  comment cites the drain item that produced it: *"I told it Band 5 and it
  wrote 'medior'"*.

This path is also the degradation story the standard asks for: with no model
available, the brief populates only `stated` and `default` — the `inferred`
tier simply does not fill, so the run is thinner rather than quietly worse.
The one inference the scripted path does make is marked as one:
`classify_role_family` writes `spine_provenance.setdefault("role_family",
"inferred")` (`intake.py:594-597`) — `setdefault`, so it can never overwrite a
stated family.

## Where the basis map is read back

`brief_gap_summary` (`intake.py:191-210`) builds the CAPTURED/MISSING digest
the voice thread uses to choose its next question, and it tests
`brief.spine_provenance.get("seniority") == "stated"` rather than testing the
enum for a value — the standard's rule that a "what is missing" view must read
bases, not values, because the enum is never empty. The same distinction
surfaces to humans in the export: `app/_lib/intake-export.ts` visibly flags a
defaulted seniority (`docs/features/intake/README.md:225-231`).
