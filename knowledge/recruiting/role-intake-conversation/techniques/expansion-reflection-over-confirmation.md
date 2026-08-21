---
layer: technique
type: technique
subject: role-intake-conversation
technique: expansion-reflection-over-confirmation
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [a kickoff feels agreeable but thin, drafting intake question scripts, the requestor gives short answers]
---

# Expansion reflection, not confirmation

A reflection is the interviewer's restatement of what the requestor just
said. It is the highest-yield move in intake — in a well-run session there
are roughly **two reflections for every new question**, and the reflections
produce more novel content than the questions do. It is also the move that
most reliably destroys a session, because two restatements that look
identical on a transcript do opposite things.

- **Confirmation-shaped:** "So you want a senior data engineer with pipeline
  experience — is that right?" The available answers are *yes* and *no*. The
  requestor says yes, because the summary is not wrong, and the session
  advances with zero new information and a raised sense of progress on both
  sides.
- **Expansion-shaped:** "Pipeline experience — say more about what breaks
  today when nobody has it." The available answers are unbounded. The
  requestor supplies the mechanism, and the mechanism is what the brief
  actually needs.

The failure is not that confirmation is inaccurate. It is that **agreement is
not information**, and a session made of agreements produces a brief whose
every line the requestor endorses and none of which they authored.

## The procedure

1. **Reflect the requestor's own words, unparaphrased.** "Scrappy" stays
   "scrappy" until it has been unpacked. Translating it into "adaptable"
   discards the handle: their word points at a tacit construct they have not
   articulated, and once you substitute your synonym, the construct is gone
   and both of you now believe you agree.
2. **Reflect slightly incomplete.** A reflection that lands *just short* of a
   full summary invites completion. "So the hard part is the handoff to the
   clinical team..." trailing into silence outperforms a closed, complete,
   well-formed summary — which invites only assent.
3. **Reflect the loaded fragment, not the whole turn.** Choose the word or
   clause carrying the most unexamined weight — the qualifier, the
   comparative, the emotional adjective — and reflect that alone. Summarizing
   the entire answer averages away the interesting part.
4. **Let the silence work.** The pause after a reflection is where the
   expansion happens. Filling it with the next question converts an expansion
   reflection into a confirmation one.
5. **Follow with a question only when two consecutive reflections have
   stopped producing new content.** That is the signal the vein is exhausted.

## Decision rules

- **When you need to confirm — because you are about to write something down
  as a must-have, or you are closing the session — confirm explicitly and
  say that you are.** Confirmation is a legitimate move; it is only a defect
  when it is *disguised* as elicitation. "I want to read back the four things
  I have as must-haves and have you correct me" is honest confirmation and
  belongs at closure. The closing read-back is one structured summary plus
  **one** open invitation — "what did I get wrong or miss?" — and it occupies
  its own turn with the session still open. A summary that invites a
  correction and ends the session in the same breath has invited nothing.
- **When the requestor answers a reflection with "yes, exactly" and nothing
  more, the reflection was confirmation-shaped.** Repair immediately with an
  open follow-up on the same fragment rather than moving on. Two of these in
  a row is a session going hollow.
- **When you must paraphrase because their phrasing is genuinely ambiguous,
  mark the paraphrase as yours.** "The words I'd use are X — does that match
  what you mean, or is it off?" An interviewer's wording that enters the
  record indistinguishable from the requestor's violates
  [inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference):
  the brief is later read as the manager's specification, and any line
  actually authored by the interviewer will be defended by people who believe
  the manager wrote it.
- **Never reflect something they did not say.** Adding a plausible clause
  ("...and obviously it needs to be someone who can handle the on-call
  rotation") is not a reflection, it is a proposal, and it will be
  agreed with. Per
  [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds),
  the reflection may hold only what the conversation actually produced; a
  requirement introduced through an interviewer's reflection is
  indistinguishable, in the finished brief, from one the business needed.
- **When a reflection is contradicted, take the contradiction, not the
  correction.** "No, not senior — well, senior in judgment, junior in cost"
  is the most valuable turn in the session and belongs to the dig-site
  technique, not to a tidy re-reflection.

## The stall repair, and its constraint

When an open question and two reflections have all stalled, and only then, a
**this-or-that contrast** is permitted: two concrete alternatives offered as
a way to make the abstract choice tangible. Seniority is the canonical case —
requestors who cannot answer "what level?" can almost always react to "someone
who has run this before and will tell *you* how it should work, or someone
who executes a plan you set — and neither is a fine answer, as is some of
each."

Two constraints make this a repair rather than a leading question. It is
**offered only after the open route failed**, and it is **framed as
disposable** — explicitly stating that rejecting both options is a valid and
useful answer. A contrast without the disposal clause is a forced choice
between two things the interviewer invented, and whichever the requestor
picks will be recorded as their requirement.

## When not to use it

- **With a requestor who is already over-specifying.** Reflection amplifies
  whatever it touches; reflecting the eleventh must-have will get you a
  twelfth. Switch to laddering and to the ranking move instead.
- **Under a hard turn budget with core slots unfilled.** Reflections cost
  turns. When four questions remain and the ninety-day outcome and the
  compensation band are both unasked, spend the turns on the questions and
  accept a shallower brief — with the shallowness recorded.
- **In writing, mechanically.** An asynchronous intake cannot use silence,
  and a written reflection with no follow-up question reads as an incomplete
  message rather than an invitation. In text, pair the reflection with one
  explicit open prompt.
