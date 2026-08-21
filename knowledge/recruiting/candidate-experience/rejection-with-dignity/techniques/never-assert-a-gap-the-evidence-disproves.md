---
layer: technique
type: technique
subject: rejection-with-dignity
technique: never-assert-a-gap-the-evidence-disproves
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [writing feedback lines into a decline, reviewing generated rejection copy, auditing a rejection template for fill-the-slot defects]
---

# Never assert a gap the evidence disproves

Every feedback line in a decline is a claim about a person. This technique is
the check each one must survive before it ships: **does the candidate's own
recorded evidence contradict it?** If it does, the line is deleted. There is no
softening, no hedging, no "you may wish to further develop" version — the
sentence is wrong and it goes.

This is the single highest-damage defect in rejection copy. Telling a candidate
with a decade of a skill to build experience in it, advising them to obtain a
certification their profile lists, or suggesting they gain exposure to the
technology their portfolio is entirely made of does four things at once: it is
false, it proves nobody read the application, it turns a defensible decision
into documentary evidence of a non-review, and it lands on the exact
achievement the person was proudest of.

## Where the defect comes from

Never from malice, always from structure. Three generators produce it
reliably:

- **The mandatory slot.** A template with a "constructive feedback" field that
  must be non-empty forces invention whenever the record holds nothing. The
  fill-the-slot instinct is the root cause; the fix is that empty is a valid,
  shippable output.
- **Symmetry bias in generation.** Asked to explain a rejection, a language
  model will produce a deficiency, because rejections in its training data have
  deficiencies. Given a strong profile and no recorded gap, it will locate a
  plausible one rather than return nothing.
- **Partial context.** Feedback generated from the requirement list alone, or
  from a truncated profile, cannot see the evidence that refutes it. A
  requirement marked unmet by a matcher that never read the portfolio section
  becomes a confident sentence about a gap the person does not have.

The third is the one to instrument, because it is measurable: run the letters
for a batch of real candidates and ask whether each body could be sent to a
different candidate unchanged. When it could, the fact base is starved and the
next thing the generator does is fill the space with something plausible.

The third case is also an
[absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
violation: "the parser did not find it" became "the candidate lacks it". Unmet
in the extraction is not the same state as absent in the person, and only the
first is ever true of a document.

## The procedure

1. **Assemble the refutation set** before generating or approving any feedback:
   the candidate's recorded skills, highlights, credentials, titles held, and
   the explicit strengths already noted in the assessment. This is the same
   evidence the decision saw — no more, so the check cannot be stricter than
   the record.
2. **Test each candidate feedback line** against it. A line asserting absence,
   deficiency, or a recommendation to acquire something is contradicted if the
   refutation set contains that thing, a normalised equivalent of it, or a
   stronger form of it.
3. **Delete on contradiction.** Never rewrite into a weaker claim — a hedged
   false statement is still false and now also evasive.
4. **Do not backfill.** A deleted line does not license generating a
   replacement; the output simply gets shorter, possibly to zero.
5. **Prefer the strength you can prove.** One acknowledged real strength, drawn
   from the same recorded evidence, is worth more than three generic
   improvement suggestions and cannot be contradicted by definition.

## Decision rules

- When the profile shows a strong match and nothing mandatory is missing, do
  **not** name a gap. State the comparative truth — another candidate matched
  more closely — and stop.
- When a gap is real but the candidate's evidence is ambiguous about it, say
  nothing rather than assert it. The asymmetry is decisive: a suppressed true
  gap costs the candidate one piece of advice they could have got elsewhere; an
  asserted false gap costs your credibility and, when it becomes a complaint,
  your defensibility.
- Never advise adding something the profile already shows, in any form —
  including "consider highlighting" phrasing, which reads as the same failure
  to a person who did highlight it.
- Never imply that a demonstration you never asked for was missing. If the
  process gave the person no opportunity to show something, its absence is
  yours, not theirs.
- Advice must be actionable within the candidate's control. "More years of
  experience" and "a different career background" are not feedback, they are
  restatements of an immutable state, and the second edges into protected
  territory.

## When not to use this

- **In the internal record.** The audit trail keeps the real, unfiltered
  assessment including gaps the candidate might dispute; this technique governs
  outbound prose only. Scrubbing the internal record to match the letter
  destroys the evidence that makes the decision defensible.
- **In a solicited, paid debrief.** Where the candidate completed a substantial
  assessment and asked for detail, the conversation may cover observed
  weaknesses in that work — because there the evidence *is* the work you saw.
  Even then, no claim survives that the artifact itself refutes.
- **Where the "gap" is a stated hard requirement.** A missing legally required
  credential is not feedback about the person's development, it is a fact about
  eligibility, and it is named under the decisive-reason technique instead.
