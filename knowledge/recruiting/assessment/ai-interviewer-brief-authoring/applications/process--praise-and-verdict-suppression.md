---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: praise-and-verdict-suppression
stack: process
verified_on: 2026-09-26
applied: experiment
ab_verdict: better
---

# The closing constant: an enumerated praise ban, and the checks that do not read it

`CLOSING` in `app/_lib/student-interview.ts:210-211` is appended to every brief
builder — the generic student brief (`:249`) and the case-grounded brief (`:324`),
with the directed brief's protocol inserted before it. The same clause is also kept
by hand in four other places: `noJudgementClose` in `app/_lib/interview-run.ts:153-160`,
`app/_lib/voice/candidate-brief.ts:269`, `app/_lib/voice/index.ts:76` and
`scripts/setup-eleven-agent.mjs:105`. It is one sentence and it is the clearest
instance in the repo of the standard's claim that the praise ban is the harder
half:

```
"Do not give feedback, scores, or any hiring decision, and never praise or judge
the quality of an answer or tell the candidate their thinking, instinct, or
approach is right (avoid “great”, “impressive”, “exactly right”, “the right
instinct”, “on the right track”) — stay warm by showing interest and inviting
them to continue (“thank you”, “understood”, “tell me more”), not by approving.
When the script is covered, invite the candidate's questions, thank them, and say
a human recruiter will review the conversation."
```

Read against the standard, four things are being done at once.

**The verdict ban is the short clause.** "No feedback, scores, or any hiring
decision" — one clause, done.

**The praise ban is enumerated, not stated as a principle.** Five forbidden
tokens are named, and two of them — `“the right instinct”`, `“on the right
track”` — praise the candidate's *thinking*, which the clause calls out before
giving the examples. They would survive a ban written only against adjectives.

**Warmth is enumerated too.** `“thank you”`, `“understood”`, `“tell me more”` —
receipt, not quality — with the contrast stated in the sentence itself. The
clause does not say the receipt tokens must be used evenly; the standard now
does.

**The closing exit is behavioural, not evaluative.** Invite questions, thank,
name the human who reviews. The candidate leaves with a process fact and no
outcome signal.

## The adjacent no-reveal rules

The case-grounded builder carries the companion rule at `student-interview.ts:321`:

> "The scenario's probes and hints are scripted for comparability — NEVER reveal
> that, and never imply the candidate is being tested on a specific trap. …"

The rationale given to the interviewer is *comparability*, not secrecy; the
introduction instruction (`:203`) has the interviewer say it is automated and
that the call is transcribed for a human recruiter. The type comment on
`caseGroundedInterviewerInstructions` (`:297-300`) restates the boundary for the
whole builder.

## How compliance is checked

The 2026-08-20 version of this application said compliance was asserted only by a
composition test. That was wrong then: a transcript-level count has existed since
2026-07-07.

- **Composition.** `pipeline/jobfit/tests/test_interview_eval.py:524-529` asserts
  every rendered brief carries "Do not give feedback, scores".
- **A broad count.** `_PRAISE_RE` in `pipeline/jobfit/eval/interview_eval.py:501-514`
  scans interviewer turns and reports an `evaluative_praise` metric — by its own
  comment a noise-free count to trend, "NOT hard 100% gates".
- **A narrow gate.** Since 2026-09-18 the simulator runs `noPraise`
  (`app/_lib/interview-sim/detectors.ts:375-379`) as an always-on invariant over
  `PRAISE_FORMS` (`app/_lib/interview-sim/lexicon.ts:250-275`), deliberately
  narrow — declarative praise only — with its known misses written down beside it
  so nobody loosens it. A broad `PRAISE_TREND` counter sits next to it.

## Applied: the checks against the brief's own list and the fixtures that pass

Experiment, 2026-09-26, keyless, product code unchanged: the tree's three praise
detectors — the narrow gate, the broad trend counter and the Python count — run
through kp's own module loader against the interviewer turns of its committed
golden transcripts (`pipeline/jobfit/eval/interview_golden.json`, hand-written "to
satisfy every invariant" for the CI reliability path). Positive controls held: "That's
a great answer." and "Exactly right." are caught by the gate.

- **Against the brief's own list:** "on the right track" — named in `CLOSING` —
  is caught by the trend counter and missed by the gate.
- **Against the passing fixtures:** 8 interviewer turns, 4 of which open with an
  evaluative or quality-bearing token — "Nice." after the first answer,
  "Great —", "That's clear, thank you.", "That's a thoughtful reflection, thank
  you." All three detectors flag 0 of 4. The last praises the candidate's
  thinking, which `CLOSING` forbids in words.

Under the old reading (A: vocabulary lists — forbidden and permitted tokens), two
of the four are defects: "Great" is named, and "a thoughtful reflection" is praise
of thinking. Under the corrected one (B: the permitted list is safe only when it is
not rationed), the transcript's pattern is read too: in `swe_senior_strong` an
opener follows the first answer ("Nice.") and the last, and nothing follows the
second — three of four found. The fourth, the closing "That's clear, thank you",
is ambiguous under both. Better, n = 8 turns, 2 transcripts. Falsifier: a corpus in
which acknowledgements are already uniform, where B adds nothing to A.

## Deviations

- **The fixtures that define passing contain the defect.** Both golden
  transcripts carry praise the brief forbids, and the CI reliability path treats
  them as clean.
- **The gate does not test the brief's own list.** One of the five tokens
  `CLOSING` names is outside the gate, and single-word openers are outside it by
  design. The standard's position: keep the gate narrow if it must be a gate, but
  run the brief's own list as a counted metric and use it as the positive control.
- **Five hand-kept copies of one clause.** A wording change to `CLOSING` has four
  other places to land. Tests assert that several of them carry the opening words
  (`app/_lib/voice/candidate-brief.test.ts:242`, `test_interview_eval.py:436`); none
  asserts that the five agree past them, which is where the praise list lives.
