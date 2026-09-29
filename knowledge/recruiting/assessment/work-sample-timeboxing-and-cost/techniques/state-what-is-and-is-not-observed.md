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
the maximum. That assumption is unpleasant, and the candidate is owed the answer
because it is their work and their data. Whether it also spoils the measurement
is less established than the practice assumes. The one randomised study found
(48 students, a live whiteboard problem, a person watching and prompting
thinking aloud) saw scored performance roughly halve and stress rise, and its own
authors called the sample too small for firm conclusions. A silent recorder is
not that experiment: a follow-up on recorded unattended sessions found the
missing watcher helped, and reviews of passive electronic monitoring report a
small stress effect and no average performance effect, larger as the task gets
harder. Argue the disclosure from entitlement and from what your own assessors may
later claim, and keep the performance argument for a live observer.

## The contract has three parts

- **What is kept.** The submission and its artifacts; the elapsed time; the
  coarse process events you genuinely record — that a draft was saved, that a
  phase started, that a large block of text arrived at once.
- **What is never captured.** Keystrokes. Screen. Camera. Other windows,
  applications or tabs. Anything on the candidate's machine outside the exercise
  surface. Say each of these that is true; do not say any that is not.
- **What it is used for, and for how long.** Assessment of this application, by
  named humans, retained on a stated schedule. Include what a signal can set in
  motion, not only who reads it: a submission held for a conversation because one
  recorded value crossed a line is a use, and the person cannot weigh a use they
  were not told about.

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
   never" must be impossible in the tooling, not merely disabled. The direction
   that slips is the third one: list the recorder's event kinds from the code,
   lay them beside the disclosure sentence, and require each kind to be named
   there or to be something that is never stored. A sentence written when there
   were three event kinds stays true of those three while the recorder grows a
   fourth. A capability
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
  ([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)).
  The gap between those two sentences is where most unfair assessment lives.
- **When a signal is absent, it is unmeasured — not clean and not damning.** A
  missing draft history means the recorder did not run, or the candidate worked
  elsewhere and pasted once, or nothing happened. Absence of evidence is not
  evidence
  ([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)),
  and a scoring path that treats a null as a negative will quietly punish
  everyone whose network flickered.
- **When a process signal would drive an adverse outcome, a person decides.** No
  candidate is dropped by an automated read of process telemetry
  ([no-adverse-outcome-is-solely-automated](../../../_laws.md#no-adverse-outcome-is-solely-automated));
  the signal opens a question, and the question is answered in a conversation.
- **When a candidate asks what is observed, answer with the same sentences.** A
  disclosure that changes when questioned was never a contract.
- **When the invitation allows a tool, a signal the tool's ordinary output
  produces cannot be a penalty, and the disclosure says what it can do.** "You may
  use any tools, including AI" beside a rule that scores or holds a submission on a
  large paste tells the candidate two things that cannot both be relied on. The
  signal may open a question with a person, and the sentence that says so belongs
  on the same screen as the permission. What a paste size may be read as, and why a
  fixed size threshold is a bad rule, belongs to the assistance-detection
  neighbour; what belongs here is that the candidate was told.
- **When observation would be covert, it does not happen.** Disclosure of the
  data you collect about a candidate is a legal duty in the EU at the time it is
  collected (GDPR Art. 13), several jurisdictions add notice duties for automated
  decision tools (New York City and, for AI video interviews, Illinois now;
  Colorado from 2027), and the EU bans AI that infers emotions in the workplace,
  which the Commission's guidelines read to include recruitment. Check the rule
  that applies to your exercise; these are not a checklist. Where none of them
  applies, do it anyway: covert observation fails on its own terms,
  because it cannot be used in a decision you would have to explain.

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
