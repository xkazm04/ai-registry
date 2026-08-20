---
layer: application
type: application
subject: conversational-assessment-validation
technique: guardrail-ablation-self-test
stack: node
status: forged
---

# A measured, rejected guardrail kept live in the brief module

`app/_lib/student-interview.ts` is the shared policy module that assembles the
interviewer brief. At line 174 it exports `PERSONA_HOSTILITY` — a rule that was
written, measured five ways, and **deliberately not shipped**. The comment above
it is the ablation result, kept in the codebase rather than in a change history:

> ⚠ NOT SHIPPED (not in `PERSONA_CRAFT_RULES`): harness ablation (2026-07-13)
> showed any hostility-specific rule — five wording variants, including this one
> with explicit bilingual examples — makes the agent drift to Czech on a hostile
> ENGLISH candidate most runs, breaking the language-consistency reliability
> gate (baseline without the rule passes consistently). Kept defined +
> Python-synced so a future wording can be re-tested without re-deriving the
> history.

Every element of the technique is present:

- **Three arms.** The rule in five wordings, versus the baseline without it. The
  baseline is the reference and it *passes consistently* — which is the finding
  that settles the decision.
- **Measured on the reliability axis, not the target behaviour.** The rule aimed
  at hostility; the damage appeared in `language_consistency`, a different
  invariant entirely, on English conversations. A run restricted to the targeted
  behaviour would have shown the rule working.
- **The negative result kept live.** The constant is exported, not deleted. It
  is excluded by absence from `PERSONA_CRAFT_RULES` (line ~181,
  `export const PERSONA_CRAFT_RULES: string[] = [PERSONA_CRAFT_CONDENSED];`),
  not by removal, so the next author meets the warning at the point of
  temptation.
- **Synchronised across runtimes.** The same text is mirrored in
  `pipeline/jobfit/eval/interview_eval.py` (line ~117, with the same explanation),
  so the harness can re-test a new wording without re-deriving anything.

## The acceptance half of the same experiment

`PERSONA_CRAFT_CONDENSED` (line ~168) is the rule set that *did* ship, and its
comment records why it shipped in this form and no other:

> Harness-validated form (2026-07-13, runs/perfect-p4p7 + targeted re-runs): the
> initial one-constant-per-rule form made hostile English candidates drift the
> agent into Czech on the acknowledge-and-redirect turns the rules themselves
> create (language-consistency is a hard reliability gate; the pre-rules
> baseline passes 4/4). The form that held (hostile 4/4) was (a) condensing to
> one paragraph and (b) requiring the P4 follow-up to be asked PLAINLY, with no
> acknowledgement or preamble — the Czech-politeness attractor („Rozumím, …“)
> has no landing token when the turn must start with the question.

Two ablation findings, one rejection and one acceptance, from the same
experiment — and the mechanism named explicitly. The shipped text carries the
constraint that produced the pass: *"ask that follow-up plainly and directly,
with no acknowledgement or preamble before it."*

A third result from the same programme is recorded as an ordering note above
`personaLines`: the gender-grammar line and the language lock *"stay ADJACENT
and LAST in the shared persona block of every builder — the harness showed
language drift precisely on the turns the craft rules create when prose
separated the lock from the end of the block."* Position was measured, not
assumed; the neighbouring practice on interviewer brief authoring owns that rule,
and this harness is where its evidence came from.

## Deviations

- The ablation evidence lives in code comments and a dated archive rather than
  in a structured record with per-arm numbers. `hostile 4/4` and
  `baseline passes 4/4` are four-conversation arms — enough to act on given the
  effect size, well below what would support a claim about the general rate. The
  standard is that each arm carries its conversation count wherever the result
  is cited; here the counts survive only as a fraction inside prose.
- The five rejected wordings are not all preserved — one representative variant
  is kept. The standard is that every measured wording is retained with its
  result, since the next author's instinct may be precisely one of the four that
  are gone.
