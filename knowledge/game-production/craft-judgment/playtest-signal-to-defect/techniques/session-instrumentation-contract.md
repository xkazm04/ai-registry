---
layer: technique
type: technique
subject: playtest-signal-to-defect
technique: session-instrumentation-contract
status: forged
laws: [an-instrument-proves-it-had-input, a-number-carries-its-unit-and-basis, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [standing up playtesting for the first time, findings cannot be reproduced or aged, an automated agent is about to start filing session reports]
---

# Session instrumentation contract

The concern: **what a session must record for a report about it to be actionable at all.** This
is the only technique in the subject that cannot be applied after the fact. Everything else
operates on a report; this one operates on the session, and a session that has already happened
cannot be instrumented retroactively. Skipping it does not produce weaker findings — it produces
rumours, and no downstream triage recovers what nobody wrote down.

## The four required records

**1. Build identity.** Which exact build was played, derived from the artifact rather than typed
by a person. Without it a finding cannot be aged, cannot be closed, and cannot be confirmed
fixed, because nobody can say whether what changed was the game or the tester. Derivation
matters: a field somebody fills in by hand is wrong on the day it matters most, which is the day
two builds were on the machine.

**2. World identity.** The scenario, level or content the session ran, the seed or saved state
it started from, the difficulty, and every option in force that the game lets a player change.
This is what makes a finding minimizable: minimization means holding things fixed and varying
one, and you cannot hold fixed what you never recorded.

**3. State at the moment.** Measured quantities sampled over the session at a stated rate —
position, resources, health, inventory, active effects, whatever the game's own systems consider
their state. Sampled, not remembered. A number in a report that came from a person's memory
carries no unit and no basis and cannot be compared with the same number from any other session.

**4. The input timeline.** Every input with a timestamp, on a clock shared with the state
samples and with any capture. This is what separates an input the player made from one they
meant to make — the missed dodge that was pressed four frames late is a completely different
defect from the dodge that was never pressed, and only the timeline tells them apart.

## The fifth record: what the session set out to cover

The four above make a report actionable. A fifth makes *absence* readable, and it is the one
nobody adds until it has cost them: **the session declares its scope before it runs** — which
areas, systems or categories it intended to exercise. Without that declaration, a finding that
did not appear in a session is uninterpretable: it may have been fixed, or the session may never
have gone near it, and nothing in the record distinguishes those. With it, absence inside the
declared scope is weak evidence of a fix and absence outside it is no evidence at all.

The declaration must use **the same vocabulary the findings are classified in**. A project that
declares coverage in one partition and routes findings in another cannot join them, and the join
is the entire point: two vocabularies for one partition mean the project has neither, and the
scoping rule silently degrades to a guess.

## The two cheap additions that pay for themselves

**A marker channel.** One control the tester can hit that stamps *that, right there* onto the
timeline with no words attached. It is the highest-yield instrument in the whole discipline
because it timestamps without interpreting: it captures the moment while the moment is happening
and defers every question about what it meant to somebody who can look at the recording. For an
automated tester the equivalent is a marker emitted whenever its own confidence about what it
should do next drops — the machine's version of "wait, what?".

**A capture bound to the same clock.** A recording of what was on screen, referenced by the
session record rather than embedded in it. Without a shared clock a recording is a video nobody
can index; with one, every observation in the report is a seek.

## Rules

- **The report references the session; it does not contain it.** A finding carries a session
  identifier and a timestamp range, and the evidence stays in the session store. Copying evidence
  into findings guarantees the copies disagree with each other and with the recording.
- **A session record with no inputs is an instrument failure, loudly.** Zero recorded events and
  a quiet player produce the same file, and the difference is the difference between a finding
  and a broken hook. State the size of what was captured — number of inputs, duration, number of
  state samples — beside every report derived from it, and treat an empty capture as a failure of
  the harness rather than a session in which nothing happened.
- **A finding with no session is labelled as an anecdote and never enters a frequency
  denominator.** Hallway reports, memories from last week and things somebody's friend mentioned
  are legitimate leads and illegitimate statistics. Keep them; keep them out of the rates.
- **The contract binds the finding to the build the way a verdict binds to content.** When the
  build moves, the finding is evidence about the past until somebody re-observes it. The
  neighbouring verdict-integrity discipline owns the standings and the read-time classification;
  this technique's only job is making sure the binding exists at write time.
- **Record the tester class.** Human or machine, first-time or veteran, which persona or route
  an agent was running. Every frequency computed later needs to be stratifiable by it, because
  "three of five sessions" means something different when four of the five were the same agent
  running the same route.
- **Retention is stated, not incidental.** Captures are large and get deleted by whoever runs out
  of space first. Decide how long a session's evidence outlives its findings, and make it longer
  than the longest defect lifetime you actually observe, or you will systematically lose the
  evidence for exactly the defects that were hardest to fix.

## Grading your own contract

The contract is met or not met per session, and the rate is worth watching. A pipeline where
sixty percent of sessions are missing world identity has a tooling defect, not a discipline
problem, and the honest report of it is the count of sessions that met the contract beside the
count of sessions that happened — never a quality figure computed over the ones that happened to
be complete.

## When not to use it

- **Not at full fidelity for a moderated session with a designer in the room.** The floor there
  is build identity plus timestamped notes on a shared clock; state sampling and input timelines
  are for sessions nobody is watching, which is where the fidelity has to come from somewhere
  else.
- **Not without consent and a stated retention policy when the tester is a person.** Session
  capture is a recording of somebody playing, and the contract that makes it useful is the same
  one that makes it sensitive. This is a hard precondition, not a step.
- **Not as a reason to delay testing.** A session with only build identity and a notebook is
  worth vastly more than a session that did not happen because the instrumentation was not ready.
  Ship the floor, then raise it.
