---
layer: technique
type: technique
subject: generated-mesh-acceptance
technique: defect-code-taxonomy-not-prose
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [consumers are regex-matching verdict text, designing a gate's output contract, routing a rejection to a remedy]
---

# Defect codes, not prose

Every finding a gate emits carries a **stable machine code** naming its defect class,
alongside the human sentence. The sentence is for display and is allowed to change freely;
the code is the contract and changes only with deliberation. Nothing downstream may branch
on the sentence.

## The failure this prevents

Without codes, every consumer that needs to know *which kind* of defect a mesh has ends up
parsing the reason string. In practice that means blanking out digits so the counts do not
break the match, comparing only the first line, and shipping two or three corrections
after live traffic reveals the cases the matcher confuses. The comparison silently starts
returning wrong answers the moment someone rewords a message or a number's formatting
changes — and nothing fails loudly, because a string match that misses just returns
"different defect".

The deeper problem is authority. A prose message is written for a person; making it also
carry the routing decision gives one artifact two owners with opposite pressures. Someone
improves the wording for readability and breaks a router they have never heard of.

## Choose the boundaries by remedy, not by measurement

A taxonomy is not a neutral enumeration of everything you can measure. The right question
for each candidate code is: **does anything downstream do something different because of
it?** If two codes always route to the same action, they are one code. If one code
sometimes routes one way and sometimes another, it is two.

For a geometry gate the remedy partition is the natural one, and it comes out roughly:

- **Resolved by the finishing stage** — density, budget overrun, too many substantial
  parts. The join-and-decimate pass exists to satisfy exactly these.
- **Worth paying for another generation roll** — an empty result, a degenerate bounding
  box. These are bad draws; a fresh roll genuinely can come back different.
- **Resolved by neither** — debris, and anything else the pipeline has no automatic answer
  for. These need a different input, a different approach, or a person.

That partition is the whole reason the codes exist. Publish it as data — explicit lists of
which codes each remedy resolves — and derive the routing advice from it rather than
writing the advice out by hand per case.

Two disciplines keep the partition honest:

- **Membership must be measured, not assumed.** A defect class belongs in the
  finish-resolves list only if a finishing pass has been observed to resolve it. Debris is
  the trap: it looks like something a cleanup pass would sweep, and decimation
  demonstrably multiplies it. Listing it would let a routed finishing pass claim a cure it
  does not deliver.
- **Re-rolling is a purchase.** Recorded across four independent rolls of one prompt: zero
  out of a hundred on every roll, with debris and part counts in the same bands every time.
  Those defects are determined by the stage, not by the draw, and re-rolling them buys
  nothing but the bill. Only the bad-draw classes belong in the re-roll list.

## Procedure

1. **Define the code set as a closed enumeration**, one per defect class, kebab-case,
   named for the property rather than the fix (`floaters`, not `needs-cleanup`).
2. **Attach a code and a severity to every finding at the point it is created.** Never
   post-process prose into codes later; that reintroduces the parser you were removing.
3. **Keep the display list byte-identical** to the finding sentences, in the same order, so
   the compatibility surface and the structured surface cannot disagree.
4. **Publish the remedy lists as exported data** next to the enumeration, so a consumer can
   ask "would finishing fix this?" without re-implementing the answer.
5. **Derive every caveat and routing sentence from the actual codes present**, never from a
   blanket claim about the gate. A caveat that names a mechanism the verdict does not
   contain is worse than no caveat.

## Decision rules

- **When a code would never change anyone's behaviour, merge it.** A taxonomy grows by
  need, not by completeness.
- **When the card shape is reused by a gate whose defects have no place in this taxonomy,
  leave the code field genuinely absent** rather than inventing values. An image critic's
  free-text observations are not mesh defect classes, and a fabricated code is worse than a
  missing one — it is precision that is not there. Make the field optional in the shared
  shape and make it mandatory in the return type of the geometry scorer, so a geometry
  verdict can never arrive without one while a borrowed envelope can.
- **When a code is retired, keep it readable and stop emitting it.** Stored verdicts
  outlive the enumeration.
- **When someone asks for a free-text "category" field**, refuse. That is the prose
  problem with an extra step.

## When not to use this

- **For the human explanation itself.** Codes do not replace the sentence; a number-bearing
  message is what makes a rejection actionable for a person, and it must stay.
- **When there is genuinely one defect class.** A single-check gate needs a boolean, not a
  taxonomy.
- **As a stable public identifier across organisations.** These codes are your pipeline's
  vocabulary; treat cross-organisation mapping as a separate translation layer.
