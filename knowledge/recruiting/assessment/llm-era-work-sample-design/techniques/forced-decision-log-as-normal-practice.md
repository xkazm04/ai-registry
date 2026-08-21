---
layer: technique
type: technique
subject: llm-era-work-sample-design
technique: forced-decision-log-as-normal-practice
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [asking a candidate to document their reasoning, seeding a debrief with claims to interrogate, deciding how to frame a process artifact without turning it into a writing test]
---

# Forced decision log as normal practice

Ask for a short log of the decisions taken during the exercise — what was
chosen, what was rejected, and why. Ask for it as **ordinary engineering
practice**: the note a colleague leaves for whoever picks this up next. Never
as an integrity measure, never as a graded deliverable, never as proof of
anything.

The framing is not politeness. It determines what the artifact is. Framed as
normal practice, the log is a *prompt* that makes the candidate's own forks
visible to them, and a set of specific claims the debrief can interrogate.
Framed as a test — "so we can verify your work is your own" — it becomes a
persuasive writing task, and persuasive writing is the single thing a capable
model does most reliably. You will have replaced a signal with its most easily
forged substitute, and told the candidate exactly what to forge.

## What the log is worth, precisely

**Evidence of engagement, never proof of authorship.** A log is as generatable
as the code it accompanies. Its value is entirely downstream: it commits the
candidate to a stated position, at a stated point in the work, that they must
later defend live. A defended log is strong evidence. An undefended log is
paper.

This is a direct application of
[inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference):
the document yields hypotheses about the person, the conversation yields
evidence, and only a demonstration yields proof. A scorecard that treats a
well-written log as demonstrated judgment has promoted a hypothesis two grades
without anything happening in between.

## Procedure

1. **Ask for it in the same breath as the rest of the deliverables**, with the
   same tone. One line: "as you go, keep a short note of decisions you made and
   why — the kind of note you would leave a teammate."
2. **Bound it.** Three to six entries, a few sentences each. An unbounded ask
   produces either nothing or an essay, and both are worse than a bounded ask.
3. **Prescribe the shape, not the content.** Three fields: what was decided,
   the alternative that was rejected, and **what they would have asked the
   team** if they could. The second field is what separates a decision log from
   a changelog; the third is the highest-yield one in the whole artifact,
   because it surfaces the forks the candidate noticed but could not resolve —
   which is precisely the behaviour the covert probes are trying to observe, and
   it is also honest about the fact that at work they would have asked.
4. **Ship the template inside the starting materials.** A log file already
   present, with its three headings, makes keeping it feel like part of the
   working environment rather than an extra deliverable. A log requested only in
   the brief is the one thing candidates drop under time pressure — and the
   people who drop it are not the weak ones, they are the ones who ran long.
5. **Say assistance is fine and expected.** The log records decisions, not
   keystrokes. Suggesting otherwise pushes candidates into concealment and
   makes the artifact less honest, not more.
6. **Do not score it as a document.** No rubric line for writing quality,
   completeness or format. Score what it lets you ask about.
7. **Mine it before the debrief.** Pick the two or three entries that touch
   planted probes, and the one that contradicts what the work actually does —
   contradictions between a log and an artifact are the highest-yield debrief
   openings available.

## Decision rules

- **When the log is polished and the debrief is empty, the log counts for
  nothing.** Record that outcome plainly: the reasoning could not be
  substantiated live. Say what the record holds
  ([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)) —
  "could not explain the trade-off when asked" is a defensible note; "used
  automated assistance" is a claim nobody established.
- **When the log is thin and the debrief is strong, the debrief wins.** Some
  strong practitioners document badly under time pressure. The log is an
  instrument, not a competency being assessed — unless the role's own brief
  lists written communication as a requirement, in which case it was already on
  the must-have list and is scored openly as itself.
- **When no log is submitted, treat it as not measured, and ask the same
  questions live.** A missing log is not a failed one.
- **When a log entry names a decision the artifact does not contain, ask about
  it before concluding anything.** The commonest innocent explanation is that
  the candidate ran out of time, and the second commonest is that they changed
  their mind and did not update the note.
- **Never present the log to a decision-maker as evidence of authorship.** It
  is not, and a scorecard that implies otherwise will not survive being
  questioned.

## When not to use it

- **Where it would be the only process artifact and the exercise has no
  debrief.** Then it is unverifiable by construction, and asking for it costs
  candidate time to produce a document nobody can read for signal. Either add
  the debrief or drop the ask.
- **Where the log request has been marked as an anti-cheating control** by
  policy or by a disclosure obligation elsewhere in the process. Once the
  candidate knows it is a control, the framing is already lost; adjust
  expectations rather than pretending otherwise, and lean harder on the live
  conversation.
- **Very short exercises**, where three decisions of any weight simply did not
  occur.

## The adjacent surface this technique does not own

Session-level process evidence — keystroke or paste patterns, comparison
against a baseline sample, embedded canaries — is a different instrument with
different ethics, and it lives in the neighbouring subject on assistance
detection and fairness. A decision log is not a covert instrument and must
never be presented as one. Anything the candidate is not told about is that
subject's problem, subject to that subject's disclosure rules.
