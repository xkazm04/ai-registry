---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: rule-ordering-adjacency-and-form
stack: process
verified_on: 2026-09-26
applied: simulation
ab_verdict: better
---

# The persona block: ordering, condensation, and the rule that was measured and not shipped

The interviewer brief is assembled from shared constants in
`app/_lib/student-interview.ts`. Every brief builder — the generic student brief,
the case-grounded brief, the debrief brief, and the directed brief the server
drives turn by turn — composes the same `personaLines` block, so a wording change
lands once. The offline eval no longer carries a copy: since 2026-09-23 it reads
rendered briefs from a committed snapshot (`pipeline/jobfit/eval/interview_briefs.json`),
held to the TypeScript builders by `app/_lib/voice/interview-brief-snapshot.test.ts`.

## The order is the artifact

`personaLines` (`student-interview.ts:196-205`) emits, in this order:

1. the role/warmth line,
2. `PERSONA_ONE_QUESTION` (`:161`),
3. `...PERSONA_CRAFT_RULES` (`:190`),
4. `PERSONA_GENDER_GRAMMAR` (`:155`),
5. `PERSONA_LANGUAGE_DETECT` (`:157-158`),
6. the self-introduction instruction.

The doctrine is stated as a comment above the function (`:192-195`): gender-grammar
and the language lock "stay **ADJACENT and LAST** in the shared persona block of
every builder — the harness showed language drift precisely on the turns the
craft rules create when prose separated the lock from the end of the block."

That is adjacency, with the end chosen by measurement on this engine — the
standard's position rule as it should be applied: the tree did not assume the end
was strong, it saw drift when the lock was separated from it and fixed that. Note
the parenthetical in the comment — gender-grammar "carries Czech example tokens"
— which is the example-as-attractor hazard the standard warns about, here
accepted deliberately and placed *inside* the guarded block rather than loose in
the brief.

The directed brief added on 2026-09-18 (`app/_lib/voice/director-brief.ts`) keeps
the persona block untouched and cites this subject in its header (`:17-24`): every
rule it adds is written as a constraint on content, and "a new rule should displace
an old one" is quoted at `:229-233`. Its most important contribution to position is
not in the brief at all: when the interviewer tries to mark a topic covered without
a quote the record holds, the refusal comes back as the tool result
(`voice/director.ts:717`) — text that arrives immediately before the next turn,
every time. That is the carrier the standard now names as the one that does not
recede.

## Condensation was half the fix

`PERSONA_CRAFT_RULES` (`:190`) is an array holding exactly one element,
`PERSONA_CRAFT_CONDENSED` (`:175-176`) — one paragraph carrying narrowing, claim
verification, coverage-not-count, the rambling-candidate handling, and the
closing read-back. The comment above it (`:164-174`) records why the array has one
element: the "initial one-constant-per-rule form made hostile English candidates
drift the agent into Czech on the acknowledge-and-redirect turns the rules
themselves create", and the form that held was "(a) condensing to one paragraph
and (b) requiring the P4 follow-up to be asked PLAINLY, with no acknowledgement or
preamble".

The measured numbers behind it are in
`docs/_archive/interview-improvement-inputs.md:137-161`: the one-constant-per-rule
form scored quality 4.16 but reliability 84% — 4 of 25 language-consistency
failures, all on acknowledge-and-redirect turns, against a pre-rules baseline
passing 4/4. After the two changes, `adversarial_hostile` passed 4/4. Those are
n = 4 and n = 25 on one engine; they are the evidence for this tree's form, and
the reason the standard now reports condensation as a runtime observation rather
than a law.

**The watch-item discipline is in the same document (`:154-156`) and should be
copied into any brief practice:** one later `adversarial_silent` re-run drifted
once, so hostile/minimal language-consistency is a watch item for the next full
sweep rather than proven-stable.

## The rule that is defined and unshipped — and no longer synchronised to anything

`PERSONA_HOSTILITY` (`student-interview.ts:183-184`) is the standard's canonical
example made real. The behaviour is unarguably correct — one brief neutral
acknowledgement, redirect to the question, do not over-apologise, do not
negotiate the premise. It is not in `PERSONA_CRAFT_RULES`, and the comment above
it (`:177-182`) says why: a harness ablation on 2026-07-13 showed any
hostility-specific rule — five wording variants, including this one with explicit
bilingual examples — made the agent drift to Czech on a hostile English candidate
most runs.

Defined, not deleted; off by construction (excluded by not being in the shipped
array); history inline. Those three still hold.

## Deviations

- **The sync claim is stale.** The comment still says the rule is "Kept defined +
  Python-synced". Commit b49819944 (2026-09-23) removed the Python port, and
  `pipeline/jobfit/tests/test_interview_eval.py:511-516` now asserts that no
  `PERSONA_` constant remains in the eval source. The snapshot that replaced it
  holds rendered briefs only, so the unshipped rule now lives in one place and is
  referenced by no test. The sync obligation itself is met by construction — one
  composer, many consumers — so the defect is the comment, not the architecture.
- **The optimiser appends after the guarded block.**
  `pipeline/jobfit/eval/interview_optimize.py:139-152` builds a candidate brief as
  the rendered brief plus the accepted rules appended at the end — after
  `CLOSING` and after the language lock. Every rule the optimiser proposes is
  therefore measured in the one position this tree's own harness showed breaks the
  lock, and a rule accepted that way would be accepted in a position the shipped
  brief does not use.
- **A measured block was changed without re-running its gate.** Commit 82bf6fc4b
  (2026-09-17) replaces `PERSONA_LANGUAGE_DETECT` in place for candidates who chose
  a language at apply (`app/_lib/interview-run.ts:131-147`); the position is
  preserved, and the replacement drops "this rule outranks every other
  instruction". The commit's own evidence is compositional ("2 of 2 … briefs …
  do not contain … outranks every other instruction"). The standard no longer
  treats a rank sentence as a lever — but the lock's measured 4/4 was measured
  *with* it, so the German and French locks are an unmeasured wording until the
  language gate runs on them.

## Applied

Simulation, 2026-09-26, three real cases from the tree at a7340185d, under the old
rule (A: the hard block goes last, the text nearest generation wins, and it should
state its own rank) and the corrected one (B: out of the middle with the end found
by measurement; re-state at the turn; rank text is not a lever, but removing it
from a measured block is a change).

1. The optimiser's append. A: defect — the lock is no longer last. B: defect —
   the tree measured that separating the lock from the end drifts, and the
   optimiser's candidates are scored in that position. Agree.
2. The preferred-locale lock without its rank clause. A: a weakened constraint;
   restore the clause. B: not a weakening the literature recognises, and restoring
   it on doctrine repeats the untested move in the other direction; run the
   language gate on the de/fr locks. A's action is right only if the clause was a
   lever on this engine; B's is right either way.
3. The coverage refusal returned as a tool result. A has nothing to say about it —
   it is not in the brief. B identifies it as the strongest position the tree
   controls and the right carrier for the narrowing instruction it holds.

B agrees with A once and is better twice. Falsifier: a language-gate run on the
preferred-locale briefs that drifts where the rank-clause brief holds, which would
make the rank sentence a measured lever on this engine and case 2 a tie.
