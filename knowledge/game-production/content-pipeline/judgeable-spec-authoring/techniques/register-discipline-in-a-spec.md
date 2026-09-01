---
layer: technique
type: technique
subject: judgeable-spec-authoring
technique: register-discipline-in-a-spec
status: forged
laws: [unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [a spec scores just below the shippable bar with rising sub-scores, a grader cites tone or voice, sweeping artifacts an agent has just rewritten, content quality is high and the score will not move]
---

# Register discipline in a spec

The named concern: **prose inside a deliverable that is addressed to a reviewer rather
than to an implementer.** It is the ceiling defect — the thing most often holding a
technically sound spec a few points under the bar — and it is close to invisible to the
author who wrote it.

## The signature

The diagnostic is a score that will not move while the content sub-scores climb. In a
measured corpus one artifact sat pinned at 89 across three revisions while its
completeness went 90 → 92 → 94 and its specificity reached 95. Nothing was wrong with
the content. Tone was the entire gap.

The corroborating evidence is what makes this worth trusting. Across one campaign, four
independent authors measured it separately: one artifact scored 81 on voice and 92 after
a sweep that removed nothing else; one crossed the bar on a pass consisting of **76
phrase replacements with no fact changed**; one moved 81 → 90 on a pass whose main work
was deleting argument.

## The four families

Authors reliably recognise the first and miss the rest.

- **Revision narration** — "previously", "formerly", "no longer", "this used to say",
  "corrected from", "new in this pass". Overwhelmingly introduced *by the repair
  itself*: an agent fixing a defect narrates the fix into the deliverable.
- **Justification** — "deliberately", "by design", "on purpose", "which is the point",
  "note that", "it is worth noting", "as required by", "this satisfies".
- **Conceding and pre-empting** — any clause whose job is to prove the artifact is not
  contradicting a sibling, or that an absence is acceptable. Usually the longest and
  most fluent prose in the file.
- **Meta-commentary about the artifact** — "this manifest does not", "a lead would cut",
  "a shipping document would". The artifact discussing itself instead of its subject.

## Sweep it mechanically

**Hand-reading does not find these.** In two independent catalogs a careful manual pass
was followed by a regex sweep that found **23 and 28 further instances**; in one case a
single argumentative paragraph had been duplicated across five sibling steps, so one
defect was costing five artifacts at once.

Build a sweeper of roughly fifty tells across the four families that prints the field
path and the offending fragment, and **run it over the stored artifacts** rather than
over local drafts — the stored copy is what gets graded, and a re-apply can reintroduce
what a local edit removed.

## The rewrite rule

Deletion is the default, but not the only move. **If a rationale is load-bearing, state
it as a design constraint in the artifact's own voice** — *the floor applies after the
multiply because an integer grant cannot carry a fractional remainder* — rather than as
a note to whoever is reading. The information survives; the address changes.

The budget freed is real and worth spending: the artifact that moved 81 → 90 did so on a
pass that deleted argument and used the recovered space for genuinely missing fields.

## The related anti-pattern: defending a disputed claim

When a finding disputes a claim, the instinct is to prove the claim. This reliably lowers
the score. One author added a paragraph demonstrating that two competing weightings
agreed to 0.03% and watched the number fall, the reviewer naming *the artifact defending
itself in front of the reader*.

The move that works is to **split the claim by evidentiary status**: state the settled
parts flat as measurements, and label the unsettled part as pending with its model fixed
and a numeric threshold that would settle it. Same honesty, no argument, and the pending
item stays falsifiable — which is what
[unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass) asks of an author
rather than of a dashboard.

## Decision rules

- **When a sentence's job is to persuade a reader, cut it or convert it to a
  constraint.** A spec states.
- **When you have just rewritten an artifact, sweep it before applying.** The repair is
  the single largest source of this defect.
- **When a limit exists, state it in one clause.** An artifact that states its limits in
  one clause scores above one that argues them in a paragraph, and both score above one
  that hides them.
- **When a rationale explains a real decision an implementer would otherwise get wrong,
  keep it — in the implementer's voice.**

## When NOT to use this

- **Do not strip prose aimed at the player or the end user.** Flavour text, greetings and
  interface strings are the deliverable, not commentary on it; a sweep that flattens them
  destroys content. Distinguish the audience, not the tone.
- **Do not delete a stated limitation to make the artifact read more confidently.** That
  converts a register problem into a dishonesty problem, which is worse and which the
  grader also catches.
- **Do not let a sweep silently change facts.** Register edits should be provably
  fact-preserving; if a replacement alters a number or a name, it is not a register edit.
