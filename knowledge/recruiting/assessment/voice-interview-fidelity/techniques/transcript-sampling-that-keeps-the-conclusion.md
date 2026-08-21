---
layer: technique
type: technique
subject: voice-interview-fidelity
technique: transcript-sampling-that-keeps-the-conclusion
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [a transcript exceeds the budget of a synthesis step, a scorecard is missing the closing turns, deciding how to truncate a long conversation]
---

# Sample head plus tail, never a front slice

When a transcript must be shortened to fit a synthesis budget, keep the opening
and a larger closing, drop from the middle, and mark the elision in-band so the
reader knows material is missing. Never take a front slice.

## The concern

Every voice pipeline eventually hits a length limit, and the first fix anyone
writes is to take the first N characters. It is one line, it is obviously safe,
and it destroys the interview.

Interviews are back-loaded. The final minutes carry the read-back and its
corrections, the candidate's strongest self-assessment, their questions, and
whatever the interviewer surfaced last because it mattered most. A front slice
deletes precisely those turns. In a pipeline that has done everything else right —
entity lexicon defined, read-back written into the brief, precedence documented —
a front truncation quietly removes the read-back from the material the scorecard
sees, and the corrupted earlier occurrences are the only version that survives.
The failure is invisible: the scorecard is complete, fluent and confident, and the
one field that would have corrected it is empty for a reason nobody logged.

The opening is not disposable either. It establishes role context, the candidate's
own framing of their background, and the language they chose. Dropping it produces
a scorecard that misreads the whole conversation's frame.

## The procedure

1. **Budget in the units the consumer actually meters**, and measure the real
   transcript distribution before choosing a shape. Many interviews fit whole; the
   sampler should be a no-op for those, and a no-op is worth confirming rather
   than assuming.
2. **Allocate asymmetrically.** The tail gets more than the head — the closing
   material is denser in decision-relevant content. A workable default is roughly
   one-third head to two-thirds tail, tuned by reading real outputs.
3. **Cut on turn boundaries, never mid-utterance.** A half-sentence at a splice
   invites the reader to complete it, and a completed half-sentence is a
   fabrication attributed to a person.
4. **Mark the elision in-band** with an explicit, visible marker that states
   material was omitted and roughly how much. A silent join makes an abrupt topic
   change look like an abrupt candidate.
5. **Never drop the final turns.** If the budget is desperate, take more from the
   middle, then from the head, and only then reconsider whether this consumer
   should be reading a transcript at all.
6. **Propagate the sampling fact.** Anything derived from a sampled transcript
   records that it was sampled and how much was dropped — turns kept, turns
   total, characters discarded
   ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
   Emit that coverage record **only when sampling actually dropped something**, so
   its absence is the honest signal that the whole transcript was read. A coverage
   object present on every scorecard, mostly saying "nothing dropped", trains
   every reader to ignore it.
7. **Apply the same policy at the persistence boundary.** A cap on how much of a
   conversation is stored at all is the same decision one layer earlier, and a
   front-slice there is worse, because no later consumer can recover what was
   never written down. Head, marker, tail — the same shape.

## Decision rules

- **When the interview fits, pass it whole.** Do not sample defensively; every
  elision costs coverage.
- **When the read-back is identifiable, protect it explicitly** rather than
  relying on the tail allocation to capture it. A long closing exchange —
  candidate questions, logistics, thanks — can push the read-back back out of a
  fixed tail window. Anchor on the read-back and expand around it.
- **When a competency was covered only in dropped material, mark it unassessed
  rather than rated.** A rating on material the rater never saw is a claim the
  record does not hold
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
  This is the one case where sampling must be able to *lower coverage*, and a
  sampler that cannot report what it dropped cannot support it.
- **When a human reads the transcript, give them the whole thing.** Sampling
  serves a machine budget. A person reviewing an adverse outcome reads the full
  record.
- **When two consumers need different windows, sample twice rather than settling
  on a compromise window that serves neither.** Sampling is cheap; a scorecard
  built on the wrong two-thirds is not.

## When not to use it

- **Short interviews.** Below the budget, the technique is a no-op and adding a
  marker to a complete transcript is noise.
- **Audit, dispute and defensibility reads.** Anything that has to answer "what
  did this decision rest on" reads the unsampled record; a sampled transcript is
  an input artifact, not the record itself.
- **As a fix for a transcript that is too long because the interview was
  unstructured.** Sampling a rambling ninety-minute conversation makes it
  affordable, not assessable. The remedy there is round design, not truncation.
