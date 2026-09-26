---
layer: technique
type: technique
subject: role-intake-conversation
technique: expansion-reflection-over-confirmation
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [a kickoff feels agreeable but thin, drafting intake question scripts, the requestor gives short answers, configuring end-of-turn detection or choice cards for an intake agent]
---

# Expansion reflection, not confirmation

A reflection is the interviewer's restatement of what the requestor just
said. It is intake's default move, and the reason is not a ratio. The
often-quoted **two reflections for every question** is motivational
interviewing's proficiency benchmark, which its own coding manual says rests
on expert opinion; tested against the outcome it is meant to serve — clients'
own change language — the ratio showed no association (Magill et al., 2018),
and sequential studies find open questions and complex reflections both move
a conversation. The case for reflection here is narrower and better
supported: a confirmation-shaped probe harvests assent. Respondents asked to
confirm an interviewer's summary say yes far more often than an independent
coder agrees with them (Barari et al., 2025, a survey-methods preprint), and
automated interviewers restate readily while under-probing the answer that
deserved a follow-up. The reflection that matters is the one that cannot be
answered with *yes*. It is also the move that most reliably destroys a
session, because two restatements that look identical on a transcript do
opposite things.

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
  [inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference):
  the brief is later read as the manager's specification, and any line
  actually authored by the interviewer will be defended by people who believe
  the manager wrote it.
- **Never reflect something they did not say.** Adding a plausible clause
  ("...and obviously it needs to be someone who can handle the on-call
  rotation") is not a reflection, it is a proposal, and it will be
  agreed with. Per
  [say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds),
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

A third constraint lives in the record. **A pick is the requestor adopting
the interviewer's wording, not stating their own.** Record it as chosen from
an offer, with the offered set kept beside it, so the brief can still say
whose words they were — per
[inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference),
and per the golden path's rule that an interviewer-supplied requirement stays
a proposal until the requestor adopts it *in their own words*. A card
interface that turns a click into a transcript line indistinguishable from
typing has erased exactly the distinction the disposal clause protects: the
offer disappears, and the interviewer's label reads as the requestor's
requirement.

## In a voice channel, the pause is a parameter

"Let the silence work" is a behaviour in a room and a setting in a voice
agent. An end-of-turn detector that closes the requestor's turn after a few
hundred milliseconds of silence takes exactly the pause this technique
protects. A hedging requestor — "honestly, not sure — we think we need
someone for the data side" — is cut at the dash, the agent answers half a
thought, and the second half arrives as the answer to the *next* question
and is filed there. The same people who pause to think before answering an
interview question pause while composing a role.

- **End the turn on a finished thought, not on a silence threshold** — a
  semantic end-of-turn detector at its least eager setting, or a silence
  window long enough for a thinking pause. Turn-taking in ordinary talk is
  fast; a requestor composing a role is not in ordinary talk.
- **Where the transport still answers per segment, treat a segment that
  arrives after the next question as a possible continuation**, not as that
  question's answer — merge it, or ask.
- **The opposite failure is a silence both sides wait through.** The repair
  is an idle prompt that re-invites the last thought ("take your time — you
  were saying..."), never the next scripted question.
- **The closing read-back waits in voice too.** A spoken read-back that ends
  the call in the same utterance cannot receive the correction it invited,
  and speech after it is that correction, not noise after a close.

## When not to use it

- **With a requestor who is already over-specifying.** Reflection amplifies
  whatever it touches; reflecting the eleventh must-have will get you a
  twelfth. Switch to laddering and to the ranking move instead.
- **Under a hard turn budget with core slots unfilled.** Reflections cost
  turns. When four questions remain and the ninety-day outcome and the
  compensation band are both unasked, spend the turns on the questions and
  accept a shallower brief — with the shallowness recorded.
- **In writing, mechanically.** A written intake cannot use silence,
  and a written reflection with no follow-up question reads as an incomplete
  message rather than an invitation. In text, pair the reflection with one
  explicit open prompt.
