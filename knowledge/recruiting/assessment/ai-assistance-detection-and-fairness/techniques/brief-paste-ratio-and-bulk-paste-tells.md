---
layer: technique
type: technique
subject: ai-assistance-detection-and-fairness
technique: brief-paste-ratio-and-bulk-paste-tells
status: forged
laws: [inference-must-look-like-inference, absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [capturing what a candidate submitted to a model, deciding what a large paste event may be read as, writing the fairness contract for prompt capture]
---

# Brief paste ratio and bulk-paste tells

One-shot delegation has an observable shape that has nothing to do with style:
the brief goes in essentially verbatim, and a large artifact comes back
essentially verbatim, with very little in between. Two cheap measurements
capture it — how much of the brief appears inside what the candidate submitted
to a model, and whether the artifact arrived in a few large pastes rather than
accreting.

Both are weak signals. Their value is that they are weak in a *different
direction* from the artifact-anchored instruments, and that they are not
stylometric: a non-native writer's prose does not raise a paste ratio.

## The fairness contract for prompt capture

Before capturing anything, write the contract down and show it to the candidate.
It has four clauses, and every one of them has been violated by somebody
building this:

1. **Only what the candidate submitted.** Their prompts, their pasted context.
   Never the model's replies used as a style sample, never the content of other
   windows, never the clipboard at large.
2. **Only with knowledge and consent**, stated at the point of capture in plain
   words, and with a stated path to complete the assessment without it.
3. **Only as supporting evidence.** Nothing captured here may alone move a
   candidate across a decision boundary.
4. **Never as a proxy for tool use itself.** A high paste ratio is evidence of
   *delegation shape*, not of assistance; a candidate who pasted the brief in
   order to ask one clarifying question is not a delegator.

Capture must also be non-blocking. If the capture path is unavailable — locked
machine, blocked network, a candidate who declined — the assessment proceeds
and the signal records as *no signal*
([a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

## Brief paste ratio, computed as containment

Do not use a symmetric similarity score. The question is not "how alike are the
brief and the prompt", it is "how much of the brief is *inside* the prompt" —
which is a containment measure: break both texts into overlapping short word
sequences and compute the fraction of the brief's sequences that appear in the
candidate's submitted text.

Containment is the right shape for three reasons. It is insensitive to
reordering, so a candidate who pasted the brief in pieces still scores high. It
is not diluted by the candidate's own additions, so somebody who pasted the
brief *and* wrote three paragraphs of their own thinking is measured on the
paste, not penalised for the thinking. And it is directional, which stops the
number from being read as a style match.

Short overlapping sequences of four to six words work well; single words match
everywhere and long ones break on trivial edits. Normalise whitespace and case;
do nothing else — aggressive normalisation starts turning containment into
paraphrase detection, which is where the uneven error rates live.

## Bulk-paste tells

The second measurement is the arrival shape of the artifact: the size
distribution of insertion events. A submission that accreted has many small
insertions and a long tail; a submission that arrived has a handful of very
large ones and little else. Useful, reportable facts:

- the count of single insertions above a large-size threshold;
- the fraction of the final artifact that arrived in those insertions;
- whether large insertions were subsequently edited at all — the strongest
  variant of the tell is a large block that arrives and is never touched again.

That last one carries most of the information. Pasting a large block and then
working it over is exactly what a professional does. Pasting it and shipping it
is the behaviour in question, and it is worth saying that the behaviour of
interest is *unreviewed* bulk, not bulk.

## What these numbers may and may not be read as

May: "the brief appears near-verbatim in what was submitted to a model, and
most of the artifact arrived in three insertions that were not subsequently
edited." That is a description of the record.

May not: "this candidate delegated the work", "this candidate did not write
this", or any probability attached to either. State the observation, mark it as
an inference where you interpret it, and hand it to a human
([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).

The absence of the tells is the more dangerous reading. Low paste ratio and no
bulk pastes are compatible with heavy assistance — a candidate typing what a
model dictates, working in a tool that streams edits, or simply retyping. A
clean paste profile is *not detected*, never *verified authentic*
([absence of evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
Publishing it as a green tick creates a bypass that costs one habit to learn.

## The false positives you must know about

- **Assistive technology.** Dictation, text expansion, and screen-reader
  workflows produce insertion patterns that look like bulk paste. This is a
  disability-discrimination hazard, and it is the reason bulk-paste tells may
  never trigger an outcome on their own.
- **Legitimate template reuse.** Candidates paste their own boilerplate, their
  own prior work, licensed snippets and generated scaffolding. All look
  identical to delegation at the event level.
- **Working elsewhere.** Any candidate who drafts in another environment and
  pastes the result in produces one enormous insertion and no history. This is
  common, ordinary, and indistinguishable from the behaviour of interest.

Given that list, the honest posture is that these signals *raise questions for
a human to ask*, and their entire value is realised in the authorship
conversation.

## When not to use it

- **When you cannot obtain consent**, or when local rules make monitoring of
  this kind unlawful for candidates. Drop the signal; the other instruments
  carry the subject.
- **When the case is small enough that one paste is the whole artifact.**
- **When you would be tempted to threshold it.** If the organisation cannot
  resist turning a ratio into a rule, do not compute the ratio.
