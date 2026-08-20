---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: praise-and-verdict-suppression
stack: process
---

# The closing constant: an enumerated praise ban

`CLOSING` in `app/_lib/student-interview.ts:206` is appended to every brief
builder — the generic student brief (`:231`), the case-grounded brief (`:291`),
and their voice equivalents. It is one sentence and it is the clearest instance
in the repo of the standard's claim that the praise ban is the harder half:

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
decision" — one clause, done. It is the easy half and it is written like the easy
half.

**The praise ban is enumerated, not stated as a principle.** Five forbidden
tokens are named. The standard argues that a general instruction to avoid
evaluative language is not operationalizable, and the specific list here shows
why: `“the right instinct”` and `“on the right track”` are not superlatives and
would survive a ban written only against adjectives. They praise the candidate's
*thinking*, which the clause calls out explicitly ("or tell the candidate their
thinking, instinct, or approach is right") before giving the examples.

**Warmth is enumerated too.** `“thank you”`, `“understood”`, `“tell me more”` —
receipt, not quality — with the contrast stated in the sentence itself: "stay
warm by showing interest … not by approving." This is the pairing the standard
calls for; a brief carrying only the prohibitions produces the interrogation
failure mode, and this repo pays a lot of attention elsewhere to not producing it
(see `NON_NEGOTIABLES`, `:203`).

**The closing exit is behavioural, not evaluative.** "Invite the candidate's
questions, thank them, and say a human recruiter will review the conversation."
The candidate leaves with a process fact and no outcome signal, which is the only
closing available to a conversation that graded nothing along the way. It also
names the human actor, which is what makes the eventual decision attributable.

## The adjacent no-reveal rules

The case-grounded builder carries the companion rule the standard groups with
verdict suppression, at `student-interview.ts:289`:

> "The scenario's probes and hints are scripted for comparability — NEVER reveal
> that, and never imply the candidate is being tested on a specific trap. Phases
> about their own background stay personal; phases about the scenario stay on the
> shared material."

Note that the rationale given to the interviewer is *comparability*, not secrecy —
the probes are scripted so that every candidate on the role meets the same
substance. That framing matters, because it separates this rule from any question
of disclosure: the candidate is told they are in an interview with an automated
interviewer (the introduction instruction at `:199` requires it) and that the
call is transcribed for a human recruiter. What is withheld is the item's
internals, which is the standard's exact boundary.

The type comment on `caseGroundedInterviewerInstructions` (`:275`) states it once
more at the level of the whole builder: "The case mechanics (which probes are
scripted, what they reveal) are for the agent only — never disclosed."

## Where the standard is not fully realized

The closing rule governs what the interviewer *says*. It does not, on its own,
constrain what a downstream surface shows the candidate about the same
conversation — that consistency is the concern of the transparency and
explanation subjects, not the brief. The brief's contribution is that it produces
a transcript with no in-conversation verdict for a later surface to contradict.

Compliance is also unenforced at runtime: `CLOSING` is asserted to be *present*
in every composed brief (`pipeline/jobfit/tests/test_interview_eval.py:601`
checks `"Do not give feedback, scores"` appears in each), which is a
composition test, not a behaviour test. Whether the interviewer actually avoided
the five tokens is a transcript-level property, and proving it belongs to the
validation subject.
