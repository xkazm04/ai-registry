---
layer: application
type: application
subject: requirement-inflation-control
technique: ninety-day-outcome-as-the-despec-filter
stack: process
status: forged
---

# The de-spec filter inside a prompted intake persona

The realization here is a prompt, not a module: an LLM-driven role-intake
agent whose persona text carries the filter as one numbered rule among eleven,
with a research document upstream of it as the normative source. The
interesting part is the division of labour between the two — the doctrine
lives in prose that a human edits, and the code holds only the enforcement.

## Where it lives

- `docs/development/role-intake-research.md` — the normative source. Its
  header states the contract explicitly: "This doc is the normative source for
  the intake persona in `pipeline/jobfit/intake.py` — change the rules here
  first, then the code." That ordering is what keeps a conversational
  discipline from decaying into whatever the last prompt edit happened to say.
- `pipeline/jobfit/intake.py:60` — `_PERSONA_TECHNIQUE`, the eleven numbered
  rules, injected into both prompt assemblies at `:147` and `:182`.

## The filter as written

`intake.py:77` carries the rule almost exactly as the standard states it:

> "(8) Anchor requirements in outcomes: ask what this person should have
> gotten DONE in the first 90 days, and use it as the filter — a must-have
> that maps to no 90-day outcome is a nice-to-have."

Three properties of that sentence are worth naming, because each is a
deliberate choice the standard argues for.

**DONE is capitalized.** The have-to-do reframe is carried by one word doing
typographic work in a prompt. `role-intake-research.md:120` names the reframe
as a device in its own right alongside the filter, and the persona bank at
`:136` attaches it to the `leaver_template` requestor — the one who "describes
the person who quit, not the role" — whose counter-move column reads
"have→do reframe, outcome questions". The portrait failure and the reframe
that repairs it are paired in the same table.

**It is stated as an implication, not a heuristic.** "is a nice-to-have", not
"should be reviewed". A hedged rule in a prompt produces a model that raises
the question and then accepts whatever the requestor says next, which is
transcription with extra turns.

**It sits after laddering, not instead of it.** Rule 4 (`intake.py:68`)
climbs the label; rule 8 decides whether the construct belongs on the must
line. The two are adjacent in the same prompt and are genuinely different
operations — the seam this subject holds with the intake-conversation
practice, drawn here at the level of two numbered rules.

## The demotion is the requestor's

Rule 4 closes with the stance instruction that makes the filter usable:
"never argue, reflect the trade-off and let them decide." The persona bank
encodes the same expectation as a test: `role-intake-research.md:133`, the
`over_specifier` — "12 must-haves incl. 3 clouds + PhD" — has
"laddering + soft cap + demotion without arguing" in its *what it tests*
column. Demotion-without-arguing is treated as a measurable behaviour of the
agent, not as tone.

The provenance model completes it. Persona rule 11 requires the read-back to
map to the brief with "provenance `stated` only for what the requestor
actually said/confirmed; agent proposals stay `inferred` until confirmed", and
`intake.py:346` (`_stated_facet`) plus `_apply_answer` at `:360` record
`source_turn` for every stated value — the docstring's stated reason being
"defensibility — every stated value traces to the exact turn that produced
it". So a demotion that happened in the session is attributable to the turn it
happened in, and a demotion the agent merely proposed is not laundered into a
requestor decision.

## The evidence the doctrine rests on

`role-intake-research.md:29` grounds the whole subject in the published
figure: 26 million postings, 67% of production-supervisor listings demanding a
degree that only 16% of incumbents held. The same bullet lists the causes —
"many stakeholders adding without removing, specs modeled on the leaver,
aspirational future-role specs" — and the counter-moves: "push back AT intake
(not after shortlists), reframe have→do, bring market data, cap the scorecard
to force rank-ordering". Four causes, four counters, one line each. The
research file grades its own evidence (`[strong]` / `[moderate]` / `[lore]`)
per claim, which is why a directional vendor survey at `:34` sits next to a
26-million-posting analysis without either borrowing the other's authority.

## Deviations from the standard

- **The filter is instructed, never verified.** Nothing downstream checks that
  a captured must-have actually maps to a recorded success criterion. The
  brief has both `success_criteria` and `requirements`, so the check is
  mechanically available — a requirement with no traceable outcome could be
  flagged at read-back time rather than depending on the model having applied
  rule 8 in the moment.
- **The pairing has a field and the fast path leaves it empty.**
  `rolebrief.py:75` defines `BriefRequirement.rationale` exactly as the
  standard wants it — "why THIS role needs it, in the requestor's terms" —
  alongside `provenance`, `confidence` and `source_turn`. But the
  deterministic slot-fill path at `intake.py:377-392` constructs both the
  must-have and the nice-to-have requirements without it, so every requirement
  captured outside the model's own extraction answers "who said this, and in
  which turn" and not "what it was kept for". The schema is right; the cheap
  path does not use it.
- **The no-outcomes finding has no home.** A requestor who cannot state a
  first-quarter outcome is the standard's most valuable output — the moment a
  requisition is correctly withdrawn or split. Here an empty
  `success_criteria` list is simply an empty list, indistinguishable from a
  topic the session did not reach.
