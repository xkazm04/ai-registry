---
layer: technique
type: technique
subject: playtest-signal-to-defect
technique: observation-before-interpretation
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [designing a session report schema, a tester report arrived as a list of proposed fixes, prompting an automated agent to report on its own play]
---

# Observation before interpretation

The concern: **what a session record stores, and in which field.** A report is two different
kinds of statement wearing one paragraph — what happened, and why somebody thinks it happened —
and the second one contaminates the first irreversibly if they are allowed to share a field.

## What each field is

An **observation** is a statement about events that a recording of the session could in
principle confirm. It is timestamped, it is in the past tense, it names what the player did and
what the game showed, and it contains no causal connective. "At 4:10 she entered the north
corridor, turned around at the dead end, re-entered the room she had just left, and repeated
that loop three times over ninety seconds" is an observation.

An **interpretation** is any statement about cause, intent, or remedy. "The map is confusing",
"the corridor needs a landmark", "she did not understand the objective" are all interpretations,
including the ones that are correct. An interpretation is attributed to whoever produced it —
the tester, the moderator, the agent, the triager — because its value depends entirely on whose
it is, and an unattributed interpretation is indistinguishable from a fact by the time it
reaches somebody with a schedule.

The distinction is not "objective versus subjective". **An internal state, reported as
experienced and timestamped, is an observation**: "I was bored from about minute six" is data
about a player at a moment and the most valuable data in the session. "I was bored because the
enemies repeat" is an interpretation with an observation buried in it, and the buried half is
what you want.

## The procedure, with a human tester

**1. Record the play before you speak to them.** Questions during play change the play. Asking
"how does that work?" makes a player reason about a mechanic in a way they never would alone,
and the session you were measuring is over.

**2. Note events, not conclusions, while watching.** The note that survives triage is the one
that says what happened and when. A note that says "confusing area" is a memory aid for the
notetaker and nothing to anyone else four days later.

**3. Debrief afterwards, and ask what they were trying to do — never what they would change.**
"What were you going for there?" recovers intent, which is an observation about the player's
model of the game. "What would you change?" recovers a design proposal from somebody who has
played the game once, and the act of asking replaces the memory of the experience with the
memory of the answer.

**4. Take the proposed fix when it comes anyway, and put it in the interpretation field.** It is
real evidence about what the game appears to afford. Suppressing it costs goodwill and teaches
testers to volunteer less; filing it as an observation costs a sprint.

## The procedure, with an automated tester

An agent playing the build breaks this rule by default rather than by accident. Asked what
happened, a language model answers with why: causal narration is its default output shape.
Anything a person can hold as a habit must therefore be enforced here as structure.

**Use two requests, not one prompt with two sections.** The first asks only for the event
timeline, in the shape defined above, and is validated against that shape. The second — issued
separately, with the observation already fixed and quoted back — asks for the theory. One
request that produces both will produce an observation *written to support the theory*, because
the theory was already in the context when the events were written. This is the machine version
of a tester rationalising, and it is stronger, not weaker, than the human one.

**Reject an observation that argues.** A cheap mechanical validator — no causal connectives, no
modal verbs, every entry carrying a timestamp — catches most contamination and, more usefully,
teaches the generating prompt what shape is wanted. A report that fails the check goes back for
a rewrite; it is not silently repaired downstream, because repairing it means somebody guessing
which half was the observation.

**Keep the interpretation off the routing path.** The field exists, it is read deliberately by a
human, and no automated step that assigns an owner is given it. A producer's account of why its
own session went badly is an input to a verdict, never the verdict.

## Decision rules

- **When a report contains only interpretation, its state is `interpretation only` and it is not
  routable.** Do not discard it and do not guess the observation behind it: return it, or mark
  it as an unobserved lead. An absent observation renders as absent, never as a weak one.
- **When an observation and an interpretation conflict, the observation wins and the conflict is
  recorded.** A tester who says the boss killed them instantly, on a recording showing a
  forty-second fight, has told you something real about perceived time — which is a finding, and
  a different one from the one they filed.
- **When the tester is the designer, the rule tightens rather than relaxes.** An author testing
  their own work has the strongest available theory and the weakest available distance from it.
  Their observations are as good as anyone's; their interpretations are the most contaminating
  in the building because nobody argues with them.
- **When you cannot afford the two-field discipline everywhere, apply it to the observation
  only.** One well-formed observation field with everything else in free text beats a rich
  schema nobody fills.

## When not to use it

- **Not for preference and taste studies.** When the question is which of two art directions,
  two control schemes or two names people prefer, the opinion *is* the measurement and demoting
  it to an interpretation field discards the study.
- **Not for a directed probe with a stated hypothesis.** A designer running a targeted check —
  "does anyone find the second lever without the hint?" — has already fixed the observation they
  are collecting; the protocol collapses to a single yes/no per session and the ceremony adds
  nothing.
- **Not as a reason to refuse a report.** The rule governs where things are stored, not who is
  allowed to speak. A queue that rejects reports for being badly phrased will receive fewer
  reports, and the signal it loses is the signal it existed to catch.
