---
layer: application
type: application
subject: remediation-roadmaps
technique: invitational-framing
stack: process
status: forged
verified_on: 2026-09-30
---

# Invitational framing as a prompt contract (Ascent)

Ascent's roadmap entries are written by an LLM against a prompt, with a
deterministic catalog as fallback. The framing rules therefore live in two
places that must agree: the instruction block in
`src/lib/scoring/prompt.ts` (the "transition COMPANION" block), and the catalog
templates in `src/lib/scoring/recommendations.ts`.

## The rule, stated to the model verbatim

The `prompt.ts` block, unchanged in substance:

> IMPORTANT — Ascent is a transition COMPANION, not a boss. The roadmap
> surfaces *gaps in the level of trust* (how much the team can trust AI in
> its workflow) as things to EXPLORE, never as orders. For each entry:
> "title" names the gap as an observation (e.g. "Agent guidance is thin —
> agents have little to go on"), NOT an imperative ("Add a CLAUDE.md").
> "rationale" explains why the gap matters for AI-driven development.
> "explore" is 2-3 invitational questions that help the team discover the gap
> themselves (open questions, not steps).

Three things are worth extracting from this as craft. First, the stance is
named as a *role* ("companion, not a boss") before any rule is given — the
rules then read as consequences rather than as arbitrary style constraints,
which is why they survive paraphrase. Second, the rule is taught by a
minimal contrasting pair, one allowed title and one forbidden one for the
same finding. Third, the item's action slot is `explore` — open questions,
explicitly *"not steps"* — the strongest form of the technique.

## The contradiction rule

The same block adds the checkable constraint that the technique names:

> The "title" must state the gap ACCURATELY and must not contradict its own
> "rationale" (e.g. do not title an item "tests run in CI but don't gate"
> when the rationale notes CI never runs the tests at all).

This is a factual-consistency requirement, not a tone one, and it is stated
with the failing example rather than in the abstract — the shape that
actually changes generated output.

## The catalog holds the same voice

The fallback templates are written to the identical contract. Their header
comment states it: *"Each entry frames a gap in
the level of trust... never an order. Phrasing stays invitational."* The
titles are observations throughout — "Agent guidance is thin: agents have
little to go on here", "Little gates what reaches main: trust rests on who
reviewed", "Conventions held by habit, not enforced by tooling" — and each
`explore` array holds open questions ("If an agent proposed a change
tomorrow, what would catch a regression before it merged?").

This matters more than a fallback usually does: because the catalog is the
demo path *and* the empty-response path, a divergence in voice would surface
as a tonal shift the reader experiences as the product changing character.
Holding one voice across the generated and deterministic paths is what makes
the framing a property of the artifact rather than of the model.

## Where the two paths meet

`buildDimensionFollowUps` synthesizes coverage
items and must choose wording without a model in the loop. It takes the
scan's own recorded gap when there is one, and the catalog title otherwise,
with the comment stating the invariant: *"The scan's own finding, if it made
one; the catalog's framing otherwise. Either way an OBSERVATION, never an
imperative — the same voice the prompt requires of the model."* One voice,
two producers, one rule.

## Deviations against the technique's standard

- **Enforcement: closed.** The earlier read recorded the constraints as stated but
  not enforced. `lintRoadmapFraming` now runs in `buildDimensionFollowUps`, the one
  funnel both the model's entries and the synthesized ones pass through. Three
  rules: `imperative-title` (first word only, against a fixed opener set),
  `supervisory-tone` (six phrase patterns, in title and rationale), and
  `title-contradicts-rationale` (a gap-claiming title beside a rationale that says
  the thing is already handled). It is deliberately a deterministic lint rather than
  a second model, seeded with the catalog as positive fixtures, and it records
  violations to the console while the entry ships unchanged: rejecting would send an
  evidence-grounded item to the fallback template, and rewriting would put words in
  the model's mouth. The residue: the record is a log line, not a stored field, so
  nothing yet counts drift per run.
- **The decline path is present but thin (re-checked 2026-09-30: no reason field
  found in `src`).** `PersistedRecommendation` carries
  a `dismissed` status, so declining is a first-class state, but nothing
  captures a *reason* — the feedback the technique identifies as the most
  valuable output of the roadmap, and the only signal that can tell a
  mis-scoped catalog entry from a well-scoped one the team simply cannot act
  on this quarter.
