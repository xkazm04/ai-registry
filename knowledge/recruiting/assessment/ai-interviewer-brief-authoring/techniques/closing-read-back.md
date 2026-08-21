---
layer: technique
type: technique
subject: ai-interviewer-brief-authoring
technique: closing-read-back
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [writing the closing turns of an interviewer brief, the transcript comes from speech recognition, proper nouns and technology names must survive into a scorecard]
---

# Close with a read-back

Near the end of the conversation, before the wrap-up, the interviewer states back
the concrete particulars it believes it heard — the technologies, tools, systems,
scopes and numbers the candidate named — and asks the candidate to confirm or
correct them. The candidate's answer to that turn becomes the authoritative
version of those particulars for everything downstream.

## Why the record needs it

Two failures converge on the same remedy.

**The transcript is not what was said.** Where the conversation is spoken, every
proper noun passes through a recogniser that has no idea what a technology name
is. Framework names collapse into ordinary words, product names become
homophones, and the corruption is worst on exactly the terms a scorecard most
wants: the specific, low-frequency ones. A faithfully quoted transcript can
faithfully quote a mishearing, and a near-verbatim evidence discipline will then
carry it into a rating, an explanation, and eventually into something a candidate
reads about themselves. Worse, the interviewer typically echoes the corrupted
term back, so the corruption gains a second occurrence and starts to look
corroborated. The read-back is the only cheap place to catch it, because it is
the only place the person who actually knows the right word is still in the
room.

The reason this cannot be handled upstream by a quality threshold is that the
damage is not proportional to the error rate. A single substituted noun in an
otherwise excellent transcript moves the aggregate accuracy by almost nothing and
changes the candidate's entire skill profile — one named tool becomes a different
tool, and the scorecard rates a person who does not exist. Any budget expressed
as an overall recognition error rate will pass that transcript. The particulars
need their own verification step, and the read-back is it. The signal-processing side of this — recogniser vocabulary
biasing, language locking, audio quality — belongs to voice fidelity; the
read-back is the conversational remedy and belongs to the brief.

**The interviewer's understanding is untested.** Even on a clean text channel,
what the interviewer *took* from an answer is an inference. Confirmed by the
candidate, it becomes something the record holds
([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds));
unconfirmed, it stays an inference and must be carried as one
([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).
The read-back converts a whole class of interviewer inferences into candidate
statements at the cost of a single turn, which is the best exchange rate in the
entire brief.

## How to write it

- **Read back particulars, not judgments.** A list of named things and quantities.
  Never "so you're strongest at back-end work" — that is a verdict wearing a
  read-back's clothes, and it collides with the verdict ban.
- **Place it before the wrap-up, not as the wrap-up.** It needs a turn where the
  candidate can still correct at length. Merged into "any questions for us?" it
  gets a polite "yes, that's right" and measures nothing.
- **Make correction the expected response, not the exceptional one.** "Let me
  check I have these right — correct me where I'm off" invites the correction. "I
  heard X, Y and Z, is that correct?" invites agreement, and candidates agree with
  interviewers.
- **A correction supersedes everything earlier in the transcript.** State this in
  the brief and state it again wherever the transcript is consumed: the corrected
  form wins over any earlier occurrence, including more numerous earlier
  occurrences. A misrecognised term appearing six times does not outvote one
  explicit correction.
- **Keep it short and bounded.** Five to eight items. A read-back that recites the
  whole conversation is a summary, and summaries are where verdicts hide.

## Decision rules

- **When the candidate corrects a term, ask nothing further about it unless the
  correction changes the meaning of an earlier answer.** The read-back is a
  verification turn, not a new probe, and re-opening a topic there costs the
  closing its calm.
- **When a particular was never clearly heard, name the uncertainty rather than
  guessing a plausible term.** "There was one tool I didn't catch — what was it?"
  is honest; guessing puts a fabricated term in the candidate's mouth and they
  will often agree with it out of politeness.
- **When the conversation produced no concrete particulars at all, that is a
  finding.** Do not manufacture a read-back list. An interview that named nothing
  specific has told you something about the answers.
- **Numbers get read back with their basis.** "Around forty people over two years"
  rather than "forty people" — the basis is the part that was most likely
  mangled and is the part a claim needs.

## When not to use it

- **Very short screening conversations** where nothing beyond scheduling facts was
  discussed. A read-back there is ceremony.
- **Conversations conducted entirely in writing by the candidate**, where the
  candidate's own text is already authoritative and no recognition step exists.
  The interviewer's *interpretation* may still be worth confirming, but the
  transcription rationale does not apply.
- **When the closing turn budget is genuinely exhausted.** Prefer dropping the
  read-back over cutting the candidate's own questions; but note the transcript as
  unconfirmed, so downstream consumers know the particulars carry recognition
  risk.

## The downstream contract

A read-back is only worth writing if something consumes it. Whatever synthesises
the transcript into a scorecard must be told, explicitly, that a confirmation or
correction in the closing turns overrides earlier occurrences of the same term.
Without that clause the read-back happens, sits in the transcript, and is
outvoted by frequency — which is the failure that makes teams conclude read-backs
do not work.
