---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: rule-ordering-adjacency-and-form
stack: process
---

# The persona block: ordering, condensation, and the rule that was measured and not shipped

The interviewer brief is assembled from shared constants in
`app/_lib/student-interview.ts` and ported byte-for-byte into
`pipeline/jobfit/eval/interview_eval.py`. Every brief builder — the generic
student brief, the case-grounded brief, the debrief brief, and the
candidate-safe voice brief — composes the same `personaLines` block, so a
wording change lands once.

## The order is the artifact

`personaLines` (`student-interview.ts:192`) emits, in this order:

1. the role/warmth line,
2. `PERSONA_ONE_QUESTION` (`:157`),
3. `...PERSONA_CRAFT_RULES` (`:186`),
4. `PERSONA_GENDER_GRAMMAR` (`:151`),
5. `PERSONA_LANGUAGE_DETECT` (`:153`),
6. the self-introduction instruction.

The doctrine is stated as a comment above the function (`:188`): gender-grammar
and the language lock "stay **ADJACENT and LAST** in the shared persona block of
every builder — the harness showed language drift precisely on the turns the
craft rules create when prose separated the lock from the end of the block."

That is adjacency and lastness exactly as the standard states them, with the
causal chain measured rather than assumed: the craft rules create the unusual
turns, the unusual turns are where the consistency constraint breaks, so the
constraint goes nearest the point of generation. Note the parenthetical in the
comment — gender-grammar "carries Czech example tokens" — which is the
example-as-attractor hazard the standard warns about, here accepted deliberately
and placed *inside* the guarded block rather than loose in the brief.

The language lock also does the two things the standard asks a hard constraint to
do beyond being positioned: it declares its own rank ("this rule outranks every
other instruction in this brief") and its own cadence ("Before EVERY turn you
produce, check which language the candidate's last message was in").

## Condensation was half the fix

`PERSONA_CRAFT_RULES` (`:186`) is an array holding exactly one element,
`PERSONA_CRAFT_CONDENSED` (`:171`) — one paragraph carrying narrowing, claim
verification, coverage-not-count, the rambling-candidate handling, and the
closing read-back. The comment above it records why the array has one element:
the "initial one-constant-per-rule form made hostile English candidates drift the
agent into Czech on the acknowledge-and-redirect turns the rules themselves
create", and the form that held was "(a) condensing to one paragraph and (b)
requiring the follow-up to be asked PLAINLY, with no acknowledgement or preamble".

(b) is the landing-token mechanism, named in the repo in one line: "the
Czech-politeness attractor („Rozumím, …“) has no landing token when the turn must
start with the question." The clause that implements it is inside the condensed
paragraph — "ask that follow-up plainly and directly, with no acknowledgement or
preamble before it."

The measured numbers behind it are in
`docs/_archive/interview-improvement-inputs.md:140-160`: the one-constant-per-rule
form scored quality 4.16 but reliability 84% — 4 of 25 language-consistency
failures, all on acknowledge-and-redirect turns, against a pre-rules baseline
passing 4/4. After the two changes, `adversarial_hostile` passed 4/4.

**The watch-item discipline is in the same paragraph and should be copied
verbatim into any brief practice:** "one later `adversarial_silent` re-run drifted
once, so treat hostile/minimal language-consistency as a watch item for the next
full sweep rather than proven-stable."

## The rule that is defined, unshipped, and synchronised

`PERSONA_HOSTILITY` (`student-interview.ts:179`) is the standard's canonical
example made real. The behaviour is unarguably correct — one brief neutral
acknowledgement, redirect to the question, do not over-apologise, do not
negotiate the premise. It is not in `PERSONA_CRAFT_RULES`, and the comment above
it (`:174`) says why:

> ⚠ NOT SHIPPED … harness ablation (2026-07-13) showed any hostility-specific
> rule — five wording variants, including this one with explicit bilingual
> examples — makes the agent drift to Czech on a hostile ENGLISH candidate most
> runs, breaking the language-consistency reliability gate (baseline without the
> rule passes consistently). Kept defined + Python-synced so a future wording can
> be re-tested without re-deriving the history.

Every element of the standard's "right move" is present:

- **Defined, not deleted.** The constant exists with its full last-tested wording,
  so a retry starts from the measured baseline rather than from a fresh guess.
- **Off by construction, not by convention.** It is excluded by not being in the
  shipped array — there is no flag to forget to set, and the exclusion is
  visible at the one place the array is defined.
- **Synchronised across runtimes.** `interview_eval.py:120` carries the identical
  string, and `pipeline/jobfit/tests/test_interview_eval.py:584` asserts
  byte-equality of all seven persona constants against the source file —
  *including the unshipped one*, with the test's own comment explaining that "P7
  is not shipped … but the constant stays synced so a future retry starts from
  the last-tested wording." That test is what stops the two runtimes becoming two
  different interviews.
- **The history travels with the rule.** Five variants tried, which forms, what
  broke, and against what baseline — all inline, so the next author cannot
  re-derive it innocently.

The generalised lesson is recorded at
`docs/_archive/interview-improvement-inputs.md:160`: "rules that create new 'meta'
turns (acknowledge, redirect, read back) are language-drift hazards on this
engine; prefer rule forms whose output must start with content."

Two notes on transplanting it. First, the repo scopes the lesson to "this engine",
which is the right scope — position and form effects are runtime properties, and
labelling them as such is what lets the rule be retried later rather than
becoming permanent folklore. Second, the read-back is named in that list of
hazards and is nonetheless shipped: it is a meta turn that was judged worth its
cost, placed at the close where the remaining turn budget is small. A hazard
class is a reason to measure, not a prohibition.
