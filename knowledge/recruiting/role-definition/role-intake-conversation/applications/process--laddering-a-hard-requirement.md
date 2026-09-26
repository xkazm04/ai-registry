---
layer: application
type: application
subject: role-intake-conversation
technique: laddering-a-hard-requirement
stack: process
status: forged
verified_on: 2026-09-26
---

# Laddering in a persona prompt, and the incident that added "record first"

The ladder lives in `pipeline/jobfit/intake.py` as rule 4 of the eleven-rule
`_PERSONA_TECHNIQUE` doctrine (`:67-93`), a numbered, ordered instruction
block whose source of truth is the graded literature review at
`docs/development/role-intake-research.md:83`. The module docstring states the
precedence (`:7-8`): change the rules in the research doc first, then the
code. Re-read on 2026-09-26 at one pinned commit of the consumer; the last
behavioural change to the engine was 2026-09-08.

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
sentences of reflection plus one question, `:92`) keep the climb from
becoming an interrogation.

## The incident: a laddered condition with nowhere to land

`_EXTRACTION_RULES` (`:136-175`) carries the scar, cited inline as
`UAT L2-NEW-2`: "live sessions filed hard conditions as facet prose and left
`requirements[]` empty, which starved the brief the requestor inspects and
blocked the promote gate." The extraction contract had offered two homes for
the same fact and ranked neither — an open-vocabulary `dealbreaker_context`
facet sat in the suggested vocabulary while `requirements` was described only
as a *grading* rule — so every hard condition was filed as narrative and the
structured brief the requestor actually reads came back empty of the things
they had called non-negotiable.

The fix is the routing rule at `:145-154`, and it is why this technique says
*record first, then climb*:

> "a named skill, tool, technology, certification, licence, registration,
> language or qualification that the requestor calls required, hard,
> non-negotiable or a dealbreaker MUST become its OWN requirements[] row — one
> row per named condition, the moment it is said; do not wait for the
> read-back or for a 90-day outcome to justify it. A requirements[] row is
> {skill, kind, hardness, weight, rationale, provenance, confidence,
> sourceTurn} and the condition itself goes in `skill` — never `label`,
> `name` or `text`; here that means kind must_have, provenance stated,
> sourceTurn set."

**The rule was followed and the rows still vanished — a second scar.** The
row-shape sentence arrived with a 2026-09-08 fix to the brief coercer: the
model had been emitting correctly graded rows keyed `label` or `name`, and
`coerce_role_brief` discarded every one of them, together with success
criteria sent as objects. The project's 50-role live harness found it —
requirement rows on no live brief before the fix, a median of eight per
brief after it, and the per-dealbreaker capture check passing on 19 of the
34 roles it could measure (`docs/development/testing-and-evaluation.md:662-665`). Record-first is a property of
the whole path from the model to the stored brief, not of the prompt: a rule
the model obeys and a coercer then drops is indistinguishable, in the brief,
from a rule nobody wrote.

The ladder's authority is explicitly bounded at `:160-161`: "Grading may
still demote a laddered condition to nice_to_have; it never deletes the row."
Facets carry only the story behind a condition — the narrative may accompany
the row, never replace it.

## Labels the vocabulary cannot hold

The same block encodes the standard's rule against coercing a requestor's
term into the tool's closed vocabulary (`:168-170`): a grade answer outside
`junior|medior|senior|lead` — "Band 5", "AfC 6" — "is NEVER force-mapped onto
the enum — leave seniority as it is and store the requestor's verbatim
grading as a stated grade_label facet instead." A public-sector pay grade is
a label from another system; force-mapping it would produce a brief wrong in
a way no reader could see. The keyless path does the same (`_apply_answer`,
`:942-956`, with the label localized in four languages), and routes a
negation-only answer such as "not junior" there too rather than recording a
level nobody stated.

The complementary rule at `:166-168` reads: "A skipped or declined question
is never data — record nothing for it (no facet whose value is the skip
word)." It prevents a skip word becoming a value. It does not, on its own,
record the skip — see the deviations.

## Traceability under the ladder

Every laddered outcome is turn-cited. `render_transcript` (`:302-312`)
numbers transcript lines absolutely, with the comment naming the finding that
forced it ("UAT drain §2.2: 'source_turn has no writer anywhere'"), and
`:171-174` requires `sourceTurn` on every requirement and facet, null only
when a value genuinely has no single source line. That is what makes a
laddered requirement defensible three months later: the construct, its
grading, and the exact turn the requestor said it.

## Deviations

- **The ladder is prompt-instructed only.** Nothing verifies that a stated
  hard requirement was laddered before it was graded: outside the prompt
  lines, the word appears in the tree only in a comment.
- **The keyless script has no ladder at all.** It collects musts and nices as
  two list questions (`_Q`, `:597-710`) and splits each answer into rows by
  which question it answered (`:919-934`).
- **The requestor-persona bank exists and does not exercise the ladder.**
  The 2026-08-20 pass recorded it as "specified but not built"; that was
  wrong — `pipeline/jobfit/eval/intake_eval.py` and a twelve-persona bank,
  including an over-specifier, have run since 2026-08-07. Its checks
  (`intake_eval.py:23-51`) are completion, one question per turn, no
  premature end, a grounded read-back, a core brief, shape, role family and
  one row per stated dealbreaker. None checks a ladder, a demotion or the
  six-item cap. Run offline at the pin, the over-specifier persona **passes
  all eight checks with twelve must-have rows** — AWS through PhD and fintech
  — Terraform still a must, and its concession filed as a nice-to-have whose
  text is the sentence "ok fine — Terraform maybe trainable". The promote
  path freezes the role's scoring rubric from that brief. A second harness
  (§4.1 of the research doc, `:143`) plays requestors grounded in real
  postings and says of itself "breadth, not behavior".
- **The 2026-08-20 claim that the keyless floor stored a non-enum grade
  without `grade_label` was also wrong.** It repeated the project's own
  triage note (`docs/product/uat-insights/2026-08-10-intake-triptych.md:40`,
  cited then as `:37`), and the code had written `grade_label` since
  2026-08-07. A note about the code is not the code; this pass read the code.

The standard stands: laddering unverified is laddering hoped for, and an
eval that passes a twelve-must brief has measured that the conversation
completed, not that the requirements were laddered.
