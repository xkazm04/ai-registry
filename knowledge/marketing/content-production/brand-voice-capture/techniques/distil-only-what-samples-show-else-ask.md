---
layer: technique
type: technique
subject: brand-voice-capture
technique: distil-only-what-samples-show-else-ask
status: forged
laws: [never-invent-proof]
shared_with: []
use_when: [writing or reviewing a voice-distillation prompt, deciding what to do when a business has few or no samples, designing the interview loop that sharpens a voice]
---

# Distil only what samples show; else ask

A voice distillation is an evidential act. It reads real messages the business
sent - and the business's answers to earlier questions - and writes down what
those show. Every claim in the resulting profile traces to a sample or an
answer. What cannot be traced is not filled from the type of business, from a
plausible persona, or from what similar businesses usually do; it becomes a
question put to the owner. The rule is the voice-shaped form of the law that
no proof is invented: a personality is a claim about the business, and an
unsupported one is a fabrication with the same confidence as an observed one.

## Procedure

1. **Gather the evidence in two kinds.** Samples: real outbound messages on
   the surface being trained, digested to a bounded length each, capped in
   count. Answers: the owner's replies to earlier gap questions, kept as
   question-answer pairs. Both are training material; a pasted sample and an
   answered question bank as the same kind of fact so the next round reads
   them alike.
2. **Instruct the distiller to describe only what is visible.** The prompt
   says it in those words, and says what to do when the material is thin:
   admit it in the summary, derive directives cautiously, and lead with
   questions. A distiller that is not told this fills every field.
3. **Return the profile and the next questions in one pass.** Two to four
   specific questions the samples do not answer and that would most sharpen
   the voice - "do you address regular customers formally or informally?",
   "how do you open a message to someone who has never written before?",
   "what would you never write, even if it sounded good?". Not one question
   the samples already answer; asking what was shown reads as not listening.
4. **Carry the current profile forward.** When a profile already exists, it
   is handed to the distiller with the instruction to sharpen rather than
   discard, so each round refines instead of restarting.
5. **Never re-ask an answered question.** The set of answered questions is
   known; the canned starter questions a keyless or failed run falls back to
   are filtered against it before they are shown.

## The no-material branch

With no samples and no answers, the honest output is a summary that says
"nothing was distilled yet", directives derived cautiously from the business
type and clearly marked as a starting point, and the questions. Some
implementations return the starter questions alone. What is never acceptable
is a full, confident profile; the owner reads it, recognises nothing, and
stops trusting the tool before the first real sample is pasted. The fallback
when no model is reachable follows the same rule: an explicit "not distilled",
the previous directives unchanged, and the starter questions - never a canned
profile saved over a real one.

## Decision rules

- When a dimension of the voice is not visible in any sample or answer, ask
  it rather than infer it, because an inferred trait carries the same
  confidence as an observed one and the owner cannot tell them apart.
- When a distiller returns no questions and the voice is not yet mature,
  reject the output and re-prompt, because a cold voice with no open
  questions means the distiller invented rather than asked.
- When a question is already answered, drop it from every fallback list,
  because re-asking is the product not listening.
- When the material is thin, say so in the summary, because a profile that
  hides its own evidence base cannot be reviewed.

## The gap-question loop is the training loop

The interview replaces a separate "generate questions" step and a separate
"simulate answers" step: with a structured output the distillation and the
questions come back together, the owner answers in the editor, the answers
return as material on the next call, and the voice sharpens. Each round costs
the owner a minute. The alternative - a voice guessed from the business type
and corrected by rejections - costs a week of drafts the owner does not send.

## When NOT to use

Do not run a distillation over samples the business did not write: a
competitor's posts, a template library, a previous agency's copy. The voice
that comes out is real but belongs to someone else. Do not distil from a
single sample and present the result as anything but a first pass - the
maturity gate in `voice-maturity-and-retrain-triggers` exists for that. And
do not let the questions substitute for samples indefinitely; an owner who
answers twelve questions and pastes nothing has described how they think they
write, which is not the same evidence.
