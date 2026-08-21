---
layer: technique
type: technique
subject: work-sample-timeboxing-and-cost
technique: state-what-is-and-is-not-observed
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence, no-adverse-outcome-is-solely-automated]
use_when: [writing the candidate-facing terms of a timed exercise, an assessment surface records process events, a candidate asks what is being monitored]
shared_with: []
---

# State what is and is not observed

Before the clock starts, the candidate is told — in plain words, on the screen
they are about to work in, not in a linked policy document — what the exercise
records and, stated positively, what it never records. The negative half is the
part that matters. "We do not record your keystrokes or your screen" answers the
question people are actually holding, and no amount of accurate description of
what you *do* collect answers it.

This is an obligation of the timed-exercise setting specifically. Someone working
alone against a clock, inside your tooling, has no way to know where the
observation stops, and the default assumption in the absence of a statement is
the maximum. That assumption is both unpleasant and corrosive to the
measurement: a candidate who believes they are being watched keystroke by
keystroke performs rather than works, and performance is precisely the thing the
exercise was designed to see past.

## The contract has three parts

- **What is kept.** The submission and its artifacts; the elapsed time; the
  coarse process events you genuinely record — that a draft was saved, that a
  phase started, that a large block of text arrived at once.
- **What is never captured.** Keystrokes. Screen. Camera. Other windows,
  applications or tabs. Anything on the candidate's machine outside the exercise
  surface. Say each of these that is true; do not say any that is not.
- **What it is used for, and for how long.** Assessment of this application, by
  named humans, retained on a stated schedule.

## Procedure

1. **Write it before the exercise starts, and place it where the candidate is
   already looking** — the same screen as the start button. A disclosure the
   candidate can only find by leaving the flow is a disclosure most of them will
   never read, which makes it a legal artifact rather than an honest one.
2. **Write it in candidate vocabulary, in short sentences.** Two or three lines.
   The failure mode of an accurate disclosure is length: a paragraph of process
   description reads as evasion regardless of its content.
3. **Verify the contract against the implementation, both directions.** Every
   "we record" must correspond to something actually recorded, and every "we
   never" must be impossible in the tooling, not merely disabled. A capability
   present and unused is a promise you are one configuration change from
   breaking, and the candidate cannot audit the difference.
4. **Re-verify when the surface changes.** Adding an embedded helper, a
   screen-share, a new editor component, or a third-party widget is a change to
   the observation contract even when nobody thought of it that way. Make the
   contract a required review item for any change to the assessment surface.
5. **Keep the interpretation separate from the disclosure.** What the recorded
   events *mean* — whether a large paste is evidence of anything — is a judgment
   made later, by a person, and is the assistance-detection neighbour's subject.
   The disclosure states existence, never inference.

## Decision rules

- **When you cannot state an observation plainly, do not collect it.** The
  discomfort of writing it down is a reliable detector of collection you would
  not defend.
- **When a process signal is used in an assessment, the assessment may say only
  what the signal holds.** "Three large blocks of text arrived in the first ten
  minutes" is in the record; "the candidate did not write this" is not
  ([say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)).
  The gap between those two sentences is where most unfair assessment lives.
- **When a signal is absent, it is unmeasured — not clean and not damning.** A
  missing draft history means the recorder did not run, or the candidate worked
  elsewhere and pasted once, or nothing happened. Absence of evidence is not
  evidence
  ([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)),
  and a scoring path that treats a null as a negative will quietly punish
  everyone whose network flickered.
- **When a process signal would drive an adverse outcome, a person decides.** No
  candidate is dropped by an automated read of process telemetry
  ([no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated));
  the signal opens a question, and the question is answered in a conversation.
- **When a candidate asks what is observed, answer with the same sentences.** A
  disclosure that changes when questioned was never a contract.
- **When observation would be covert, it does not happen.** Undisclosed
  monitoring in an assessment is unlawful in many jurisdictions, indefensible in
  all of them, and it fails on its own terms because it cannot be used in a
  decision you would have to explain.

## When not to use it

There is no version of a timed, observed exercise where the contract is
optional. It scales down rather than off: an exercise that records nothing but
the submission still says so — "nothing about how you work is recorded; we see
only what you send us" is a two-line contract and it is the strongest one
available. A live interviewer-present exercise substitutes a spoken version at
the start of the session, including whether it is being recorded and whether the
recording is transcribed.

## What it protects

Three things at once, which is why it earns its place in a subject about cost.
It removes the surveillance tax the candidate would otherwise pay in anxiety and
performance. It bounds what your own assessors may later claim, because a verdict
cannot rest on something you told the candidate you never captured. And it makes
the exercise defensible: an assessment that can state exactly what it saw is one
you can explain to the candidate, to a regulator, and to yourself.
