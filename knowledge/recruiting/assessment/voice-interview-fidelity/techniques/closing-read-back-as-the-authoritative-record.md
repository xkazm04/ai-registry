---
layer: technique
type: technique
subject: voice-interview-fidelity
technique: closing-read-back-as-the-authoritative-record
status: forged
laws: [say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged, inference-must-look-like-inference]
shared_with: []
use_when: [wiring a spoken transcript into a scorecard, a candidate corrected a term late in an interview, deciding which occurrence of a technology name wins]
---

# Treat the closing read-back as the authoritative record

Where a closing read-back happened, the candidate's confirmations and corrections
in those turns are the **authoritative** version of every particular they cover.
They override earlier occurrences of the same term anywhere in the transcript,
regardless of how many times the earlier form appeared. Every consumer of the
transcript is told this explicitly.

The read-back's placement, wording and conversational manner belong to the
interviewer brief. This technique is about what the rest of the system does with
it — which is where read-backs are usually lost.

## The concern

A read-back that is merely *present* in the transcript changes nothing. Anything
reading the conversation as flat text sees a term appear six times in the body and
once, differently, at the end. Frequency wins, or the model resolves the conflict
by silently picking one, or it hedges into a sentence that asserts both. Meanwhile
the six earlier occurrences are not independent corroboration: a responsive
interviewer echoes what it heard, so a single mishearing reproduces itself through
the interviewer's own turns and manufactures its own support.

Privileging the read-back is therefore not a tie-break preference. It is the
correction of a systematic bias in the evidence, and it has to be stated as a rule
because the default resolution is wrong in a predictable direction.

## The three outcomes, kept distinct

A read-back produces three states and a record that collapses them is unusable.

- **Confirmed** — the candidate affirmed the term. It may be asserted as
  something they said.
- **Corrected** — the candidate replaced it. Keep **both** forms: the *heard*
  form, because that is what every earlier turn contains and is the only way to
  reconcile the body of the transcript, and the *meant* form, which is what is
  true. A record holding only the correction leaves the earlier occurrences
  looking like contradictory evidence.
- **Unconfirmed** — the term appeared earlier and never reached the read-back. It
  is reportable *as unconfirmed*, never asserted as a skill
  ([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).

Precedence across the buckets must be written down and must be the same everywhere:
a corrected term beats a confirmed one beats an unconfirmed one, and a term that
appears in two buckets is resolved by that order rather than by whichever
structure the reader consulted first. Undocumented precedence produces two
consumers that disagree about the same interview.

## The fourth state: no read-back at all

When the closing turns contain no read-back — the call dropped, the budget ran
out, the interviewer skipped it — the correct value is **empty**. Not a
reconstruction, not a best-effort list assembled from the body of the transcript,
not an inference from what seems to have been discussed.

This is the rule most often violated by a well-meaning synthesis step, which
treats an empty field as a gap to be filled. A manufactured read-back is a
fabricated statement attributed to the candidate; it is the single worst artifact
this whole subject can produce, because it launders unverified recognition output
into the one field the system marks as verified.
[Say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)
is not advice here, it is the whole rule. Write it into the synthesis instructions
in those terms: *if no read-back occurred, the field is null; never invent it.*

## Decision rules

- **When an earlier turn and the read-back disagree, the read-back wins** — always,
  and no matter the count of earlier occurrences.
- **When a correction changes the meaning of an earlier answer, carry the
  correction into how that answer is read**, not merely into the term list. If the
  candidate corrects the system they built to a different one, the story attached
  to the old name now belongs to the new one.
- **When a term is unconfirmed and the rubric needs it, the competency is
  unassessed rather than low.** A verdict is bound to what it judged
  ([a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged));
  a verdict on a term that may not have been said is bound to nothing.
- **When the candidate corrects a term the interviewer never actually misheard,
  accept the correction anyway.** The candidate is the authority on their own
  claims, and arguing the point in the record is not a fight worth having.
- **Surface the read-back to the human reader**, not only to the scoring step. A
  recruiter reading "confirmed: three of five particulars; two never verified"
  calibrates their trust correctly. A recruiter reading a clean skill list does
  not.

## When not to use it

- **Text interviews.** The candidate's own writing is already authoritative; a
  read-back there confirms interpretation, not transcription, and carries no
  override privilege over the candidate's literal words.
- **Particulars the read-back never covered.** The override applies to what was
  read back. It confers nothing on the rest of the transcript, and treating a
  read-back as a blanket certificate of transcript quality is a misuse.
- **Judgments.** A read-back covers particulars — names, tools, numbers, scopes.
  If a closing turn contains an evaluative summary, it is not a read-back, it is a
  verdict delivered to the candidate, and it should be treated as a brief defect
  rather than as authoritative evidence.
