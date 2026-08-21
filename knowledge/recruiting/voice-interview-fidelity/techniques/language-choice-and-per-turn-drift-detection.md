---
layer: technique
type: technique
subject: voice-interview-fidelity
technique: language-choice-and-per-turn-drift-detection
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [a spoken interview runs in a multilingual market, the interviewer switched language mid-conversation, code-switching or loanwords are triggering false alarms]
---

# Lock the interview language to the candidate's choice, and detect drift per turn

The candidate establishes the interview language in the opening turns; the
interviewer holds it for the rest of the conversation. Drift is detected one turn
at a time, only after a language is established, and a turn carrying markers of
both languages is scored **indeterminate** rather than as a violation.

## The concern

Language drift is a fidelity failure before it is an etiquette failure. A
recogniser configured for one language and fed another does not produce errors; it
produces **fluent hallucinated text** — well-formed sentences that were never
spoken. That output passes every readability check and every plausibility check a
downstream model can apply, and it is unrecoverable, because nothing in the
artifact signals that it is fiction.

Drift also imposes an unfair load on the candidate. Being addressed in a second
language after choosing a first mid-interview costs comprehension and composure at
the worst possible moment, and the cost falls only on candidates who are not
majority-language speakers — the same population the recognition channel is
already failing hardest.

Naive drift detection then creates a third problem of its own. Counting foreign
tokens per conversation flags every normal bilingual behaviour: technical
vocabulary is very often English inside an otherwise non-English answer, greetings
and thanks cross languages freely, and a candidate may open bilingually before
settling. A detector that fires on these teaches the team to ignore it, and — far
worse — invites the flag to be read as something about the candidate.

## The procedure

1. **Establish the language explicitly and early**, from the candidate's own
   first substantive turns or a stated preference, and record the choice.
2. **Exempt the opener.** Before a language is established there is nothing to
   drift from. Greetings are the most bilingual turns in any conversation and
   flagging them is pure noise.
3. **Score per turn, not per conversation.** A conversation-level ratio hides
   which turn broke and cannot tell a single switched interviewer turn from a
   candidate who code-switches throughout.
4. **Use markers from both languages, and require asymmetry.** A turn is
   *in-language* when its markers are dominantly the expected language,
   *drifted* when dominantly the other, and **indeterminate** when both are
   strongly present. Indeterminate is a real third state, not a rounding of the
   other two, and it is what keeps a bilingual greeting or a code-switched
   technology name from raising a false flag
   ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
5. **Exclude the domain lexicon from the marker set.** Technology names, tool
   names and qualifications are not evidence of language. Counting them guarantees
   that every technical answer looks drifted.
6. **Report indeterminate at the conversation level too.** When the candidate
   never produced a turn with a confident language signal — the minimal-answer
   case, a very short call — there is no established language to have been held,
   and the verdict is *indeterminate*, not *locked*. Reporting a clean lock over a
   conversation where nothing was locked onto is a false reassurance, and it is
   the case where hallucinated text is most likely.
7. **Set the language in the recogniser's configuration, not only in the
   interviewer's instructions.** This is the failure that most often survives a
   review: the candidate's language is captured correctly at the front door and
   then never forwarded into the speech configuration, so the recogniser runs on
   its account-level default and only the prompt text fights it — which, over a
   spoken channel, it loses more often than not. Prompt-level language rules are a
   supplement to configuration, never a substitute, and a test that exercises only
   the text path cannot see this class of bug at all.
8. **Attribute the finding to the interviewer.** A drift flag is a defect report
   on the system's own turns. Code-switching by a candidate is normal bilingual
   behaviour and is never a scoreable event, never a note on a scorecard, never a
   reason to end a call.

## Decision rules

- **When the interviewer drifts, correct the interviewer and keep the interview.**
  Ending or re-running a conversation because the system misbehaved makes the
  candidate pay for the defect
  ([a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When the candidate switches languages, follow if the interviewer can do so
  well, and otherwise continue in the established language without comment.**
  Either way it is not a finding.
- **When drift is detected mid-interview, treat the affected turns as
  low-fidelity** and check them for hallucinated content before any of their
  material reaches a rating.
- **When more than a small fraction of turns drift, the interview's fidelity is
  suspect as a whole**, and the remedy path applies — the transcript may contain
  fluent text nobody spoke.
- **Never surface a language flag to a recruiter as a candidate attribute.** The
  moment it appears next to a candidate's name it becomes a proxy for national
  origin, whatever the label says.

## When not to use it

- **Single-language markets with a single-language pool**, where the detector adds
  a failure mode and catches nothing. Even there, keep the exemption logic if you
  keep the detector at all.
- **Deliberately bilingual assessments**, where switching is the exercise — a role
  requiring interpretation or cross-market support. The drift concept does not
  apply; the language behaviour is the competency and is scored openly against
  anchors.
- **As a language-proficiency measure.** It detects which language a turn is in.
  It says nothing about how well the speaker uses it, and repurposing it that way
  reintroduces exactly the manner-based judgment this subject forbids.
