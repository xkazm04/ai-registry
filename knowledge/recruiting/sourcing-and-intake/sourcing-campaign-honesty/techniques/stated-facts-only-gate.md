---
layer: technique
type: technique
subject: sourcing-campaign-honesty
technique: stated-facts-only-gate
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [building the input contract for a copy generator, a generated advertisement contains a claim nobody can source, deciding what part of a role record a marketing prompt may see]
---

# Stated-facts-only gate

The concern: making it **impossible**, not merely forbidden, for generated
recruitment marketing to assert something nobody asserted. The gate is a
construction step that sits between the role record and the generator and
emits a closed set of facts. Its defining property is what it *withholds*.

## Why the gate is the input, not the output

Two placements are possible. Only one can be the control; the other is a
backstop.

An **output check** — generate freely, then verify each claim against the
record — fails on the hardest cases when it is the only control. Verifying a
claim requires knowing what the claim asserts, and marketing prose asserts
things obliquely: "you'll ship to real users in your first week" is a claim
about onboarding, deployment practice and team autonomy simultaneously, and
none of the three is a field. An output verifier comes in two kinds. A
**deterministic** one checks literal values — figures, quoted strings, banned
phrases — which is cheap and exact and misses every implied promise and every
reshaped value. A **model-based** one (an entailment checker, or a second
model as judge) reads the prose, and is a second model to certify: published
results for such checkers are well short of reliable, and their weakest cases
are small edits to true statements, which is what a distorted claim is. Where
the judge is the same machinery as the generator, per [a predictor cannot grade
its own labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels), it
is the last thing that should certify the flourish; a different model family is
the standard mitigation and does not make it a control.

An **input gate** does not have this problem, because it never needs to
understand the prose. It only needs to answer, per candidate fact, *did a
person assert this?* — a question with a determinate answer. The generator
then cannot claim what it was never told, whatever genre pressure it is under.
What the gate cannot do is govern what the generator makes of a fact it was
given; step 8 is the cheap check that covers the literal part of that.

## Procedure

1. **Enumerate the fact slots the copy formats can consume.** This is a fixed,
   short list — title, level, pay, work mode, location, employment type, team
   context, the top responsibilities, the must-have requirements, the process
   shape, the start timing. If a slot is not on the list, no format may use
   it, and no amount of it in the record reaches the generator.
2. **For each slot, resolve to one of three states**: *asserted* (a person or
   an approved decision put it there), *defaulted* (a normalisation or
   template step put it there), or *absent*. Defaulted and absent are treated
   identically downstream; keeping them distinct matters only for the
   diagnostic the recruiter sees.
3. **Emit only the asserted values**, each carrying its scope — which role,
   which site, which entity, as of when. A fact without scope is the borrowed-
   claim failure waiting to happen.
4. **Emit the absences too**, as codes rather than as empty strings, so the
   downstream formats can decide to omit an angle and the recruiter can be
   told why.
5. **Pass nothing else.** Not the internal notes, not the hiring manager's
   commentary, not the pipeline state, not the scoring rubric, not the free
   text of the requisition. Each of those is a plausible source for a fact the
   generator will happily promote into a promise, and none was written to be
   published.
6. **Mark the absences in the payload the generator sees**, explicitly, as
   null-with-a-meaning rather than as omitted keys — *this field is unknown;
   never guess it*. The reasoning is that an omitted key reads to a generator
   as an oversight it should helpfully repair, while a present null that has
   been named as unknown is a fact about the record. That is a design
   hypothesis, not a measurement: no controlled comparison of the two was found
   (2026-09-29), so keep the convention because it costs nothing, and do not
   cite it as evidence.
7. **State the constraint in the instruction as well.** The gate is the
   control; the instruction is the reinforcement. Both, because the two fail
   in uncorrelated ways — the gate cannot stop the genre's euphemisms, and the
   instruction cannot stop the record's phantom fields. The euphemism ban in
   particular must be enumerated **in every language the copy may be written
   in**: a banned-phrase list written in the team's own language does nothing
   to a draft produced in another, and the generator will reach for that
   market's equivalent of "competitive salary" without ever touching a listed
   phrase.
8. **Check the literal class at the output boundary.** The model's reply is
   untrusted input, and part of what can go wrong in it is checkable without
   understanding prose: a figure the fact set does not carry (compare digit
   runs with separators stripped, so "65 000" matches "65000"; allow only the
   figures the instruction itself dictates), a quotation mark or first-person
   voice in the language the copy is written in, and a phrase from the banned
   filler list. Drop the variant that fails; do not repair it. Make the
   instruction's banned list and the boundary's the **same list**, so the two
   cannot drift, and cover every supported language in the boundary even where
   the instruction names fewer. State what the check cannot see next to it —
   a true value bound to the wrong claim, an invented perk with no numeral, a
   range endpoint standing alone — so nobody reads a passing variant as a
   verified one.

## Decision rules

- **Presence is not assertion.** A value being non-null is not evidence
  anybody chose it. Per [absence of evidence is not
  evidence](../../../_laws.md#absence-of-evidence-is-not-evidence), a slot the
  system filled in is an absence dressed as a fact, and the gate resolves it as
  absent. This is the rule the whole technique turns on.
- **Free text is not a fact source.** Prose in the requisition may *contain*
  the pay or the work mode, but it also contains hedges, aspirations and
  internal caveats. If a fact matters enough to advertise, it is captured as a
  fact; the gate does not mine paragraphs for it.
- **Scope travels with the value.** A benefit that exists at one site is not a
  fact about the role at another. When the record cannot express the scope,
  the value does not qualify.
- **Shape travels with the value.** A stated range is a fact as a range. Pass
  it to the generator whole, with its period and its currency, and do not let a
  hook quote one endpoint alone: "up to the top of the band" is a claim about
  the role's pay that the record never made, and the regimes that require pay in
  an advertisement require both ends. The same goes for modality — "may" stays
  "may". The check for this is a rule about the hook, not a scan of the copy,
  which is why the gate step can state it and the boundary step cannot yet
  enforce it.
- **Freshness is part of assertion.** A fact asserted against a requisition
  that has since been re-scoped is stale, and staleness is a form of absence.
  Cheap version: facts are read at generation time from the live record, never
  from a cached campaign brief.
- **The gate is the same one the other publication surfaces use.** If the
  posting editor, the publication check and the campaign generator each decide
  independently whether a role "has a salary", they will disagree within a
  release, and the disagreement always resolves in favour of whichever surface
  is most permissive.
- **Adding a slot requires adding its assertion path.** The way this gate
  decays is that someone wants a new angle, adds the slot, and reads it from
  wherever the value happens to be available — which is usually a derived or
  defaulted field. New slot, new question about who asserted it, or no slot.

## When not to use it

- **Not for internal artifacts.** A briefing document for the hiring team, an
  interview plan, a summary for the manager — these are allowed to reason over
  everything in the record, including notes and inferences, because their
  reader can challenge them and no candidate is relying on them. The gate is
  for copy that leaves the building.
- **Not as a substitute for the language lint.** The gate guarantees that
  every value is real; it says nothing about whether the sentences around
  those values are inclusive, comprehensible or free of coded wording. That is
  the advertisement-language discipline's work, and generated copy needs both.
- **Not where a human author is taking responsibility for a claim.** A named
  employer-brand writer may assert something the record does not hold — that
  is a person putting their name to a statement, which is exactly what the
  record then records. What the gate forbids is the *machine* originating the
  claim. Per [every decision names its
  actor](../../../_laws.md#every-decision-names-its-actor), the difference
  between those two cases is the only thing that makes the first acceptable.
