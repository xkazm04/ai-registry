---
layer: application
type: application
subject: role-intake-conversation
technique: laddering-a-hard-requirement
stack: process
status: forged
---

# Laddering in a persona prompt, and the incident that added "record first"

The ladder lives in `pipeline/jobfit/intake.py` as rule 4 of the eleven-rule
`_PERSONA_TECHNIQUE` doctrine (`:60-87`), a numbered, ordered instruction
block whose source of truth is the graded literature review at
`docs/development/role-intake-research.md:83` ("change the rules here first,
then the code").

## The rule as written

> "(4) Ladder every hard requirement once: what goes wrong today without it,
> and what it protects. A requirement that survives laddering is a must-have;
> one that doesn't gets gently demoted to nice-to-have — never argue, reflect
> the trade-off and let them decide."

Three parts of the standard are present verbatim: **once** (not zero, not
repeatedly), the two-rung climb from label to consequence to what it
protects, and — the part most implementations omit — **the requestor makes
the demotion**. "Never argue, reflect the trade-off and let them decide"
routes the outcome through the person who owns it rather than through the
interviewer.

The ladder does not stand alone. Rule 8 supplies the filter it feeds — "a
must-have that maps to no 90-day outcome is a nice-to-have" — and rule 9 the
cap: "when must-haves exceed six, ask the requestor to rank the top three
rather than accepting the list." Rule 3 protects the ladder's raw material:
"reuse the requestor's exact words until they have unpacked them — if they
say 'firefighter type', keep saying 'firefighter', do not translate it into
your own vocabulary." Rule 1 (one question per turn) and rule 11 (a few
sentences of reflection plus one question) keep the climb from becoming an
interrogation.

## The incident: a laddered condition with nowhere to land

`_EXTRACTION_RULES` (`:105-141`) carries the scar, cited inline as
`UAT L2-NEW-2`: "live sessions filed hard conditions as facet prose and left
`requirements[]` empty, which starved the brief the requestor inspects and
blocked the promote gate." The extraction contract had offered two homes for
the same fact and ranked neither — an open-vocabulary `dealbreaker_context`
facet sat in the suggested vocabulary while `requirements` was described only
as a *grading* rule — so every hard condition was filed as narrative and the
structured brief the requestor actually reads came back empty of the things
they had called non-negotiable.

The fix is the routing rule at `:117-124`, and it is why this technique now
says *record first, then climb*:

> "a named skill, tool, technology, certification, licence, registration,
> language or qualification that the requestor calls required, hard,
> non-negotiable or a dealbreaker MUST become its OWN `requirements[]` row
> (kind `must_have`, provenance `stated`, `sourceTurn` set) — one row per
> named condition, the moment it is said; do not wait for the read-back or
> for a 90-day outcome to justify it."

And the ladder's authority is explicitly bounded at `:125-126`: "Grading may
still demote a laddered condition to nice_to_have; it never deletes the row."
Facets are demoted to carrying only "the STORY behind a condition" — the
narrative may accompany the row, never replace it.

## Labels the vocabulary cannot hold

The same block encodes the standard's rule against coercing a requestor's
term into the tool's closed vocabulary (`:133-136`): a grade answer outside
`junior|medior|senior|lead` — "Band 5", "AfC 6" — "is NEVER force-mapped onto
the enum — leave seniority as it is and store the requestor's verbatim
grading as a stated `grade_label` facet instead." A public-sector pay grade
is a label from another system; force-mapping it would produce a brief wrong
in a way no reader could see.

The complementary rule at `:132-133` closes the other half: "A skipped or
declined question is never data — record nothing for it (no facet whose value
is the skip word."

## Traceability under the ladder

Every laddered outcome is turn-cited. `render_transcript` (`:226-237`)
numbers transcript lines absolutely, with the comment naming the finding that
forced it ("UAT drain §2.2: 'source_turn has no writer anywhere'"), and
`:137-141` requires `sourceTurn` on every requirement and facet, "null only
when a value genuinely has no single source line." That is what makes a
laddered requirement defensible three months later: the construct, its
grading, and the exact turn the requestor said it.

**Deviations.** The ladder is prompt-instructed only — nothing verifies that
a stated hard requirement was actually laddered before it was graded, and the
deterministic keyless script (`:293-339`) has no ladder at all: it collects
musts and nices as two list questions and grades them by which question was
answered. The keyless floor also stores a non-enum grade as a plain facet
without the dedicated `grade_label`
(`docs/product/uat-insights/2026-08-10-intake-triptych.md:37`). The
requestor-persona bank that would exercise laddering against an over-specifier
(`docs/development/role-intake-research.md:123-141`) is specified but not
built. The standard stands: laddering unverified is laddering hoped for.
