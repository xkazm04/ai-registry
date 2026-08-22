---
layer: technique
type: technique
subject: aaa-craft-rubric-authoring
technique: checkable-against-the-stored-artifact
status: forged
laws: [grade-against-what-ships-not-on-a-curve, no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [drafting or auditing rubric criteria, an examiner is answering from the brief rather than the artifact, deciding which lens a deliverable class routes to]
---

# Every criterion answerable from the stored artifact alone

A criterion earns its place only if an examiner holding nothing but the persisted
artifact can answer it. Not the brief that requested it, not the prompt that produced
it, not the generator's own report of how it went, not the conversation in which it
was reviewed — the stored thing. This is the constraint that keeps a craft rubric a
measurement of craft rather than a measurement of intentions.

## Why the constraint is this severe

Three failures collapse into one rule.

**A producer's self-report is not evidence.** A generator that emits "high quality,
matches the brief" alongside its output has made a claim, and a rubric that lets that
claim answer a criterion has let the producer grade itself. The claim can be recorded
and labelled as self-reported; it can never be the answer.

**The brief flatters the artifact.** An examiner reading the intent and then the
result grades the pair. Everything the artifact fails to communicate gets supplied by
the brief, and the score reports how good the idea was. The player will never see the
brief.

**Anything not persisted is not re-checkable.** A verdict that depended on transient
context cannot be reproduced, re-examined after a dispute, or re-run under a corrected
rubric. If the evidence is gone, the grade is an anecdote.

## The audit pass

Take each criterion and ask, in order:

1. **What exactly does the examiner look at?** Name the artifact, and the part of it.
   If the answer is a process step rather than a location in a stored thing, the
   criterion is out of scope for a craft lens.
2. **Would two examiners with the same artifact and no other context reach the same
   answer?** If not, either the bar is vague, or the criterion secretly needs the
   brief.
3. **Does the answer survive without the producer's narration?** Strike every phrase
   like "as intended", "appropriate for the requested style", "consistent with the
   plan" — these are all the brief in disguise.
4. **If the required evidence is absent, what does the criterion return?** It must
   return a failure or an explicit not-measured, never a neutral pass. An artifact
   that carries no evidence for a bar has not met the bar.

A criterion that survives all four is checkable. One that fails step 4 is the most
dangerous kind, because it looks fine until the day a producer stops emitting the
evidence and the whole class starts passing.

## Make the artifact carry its own evidence

Often the honest fix is not to weaken the criterion but to require the producer to
persist what the criterion needs — a measured figure with its unit and measurement
basis, a declared budget alongside the delivered count, a stated bound on a runtime
cost. The rule that makes this work: the measurement must be stored *with* the
artifact and travel with it, so the examiner reads one thing. Evidence held somewhere
else is evidence that will be missing on the day it matters.

This also settles a recurring argument about perceptual criteria. A criterion about
how something looks in motion is checkable if — and only if — the motion is captured
and stored as part of the artifact: a strip of sampled frames at declared intervals,
stored beside the clip, is what turns "reads in silhouette at the declared contact
frame" from an aspiration into a check. Judging motion from a single still is not a
stricter reading of the rule, it is a different and wrong criterion. Either capture the
behaviour or drop the bar.

State the evidence base in the lens header, and state its complement. Every lens
should open by naming what it reads — the stored artifact plus its declared
specification and measurements — and what it explicitly does not judge. A header that
says "never against a live session" forecloses, in advance, the argument an examiner
would otherwise settle by imagining one.

## Routing is part of checkability

A criterion is only answerable if it is asked about the right kind of thing. Each
deliverable class routes to exactly one lens, and that map is data the system owns —
not a judgment the examiner makes while scoring. Two rules protect it:

- **Overrides may redirect only among classes of the same shape.** In practice this
  means text-shaped classes may be re-pointed at a different text lens, because the
  artifact really is prose and the only question is which prose standard applies.
  A visual or behavioural class may not be redirected to a text lens.
- **A lens must never be dodgeable by re-labelling.** If renaming a deliverable class
  moves its artifacts to a laxer rubric, there is no floor. Narrow the override
  surface until relabelling buys nothing.

The failure this guards against is not hypothetical and it is not subtle: an examiner
handed a general craft rubric and a piece of technical scaffolding will grade the
scaffolding as a finished piece and return a confident, precise, wildly low number —
a layout schematic marked down for having no colour, a reference sheet of glyphs
marked down for not being a composition. Both artifacts were exactly what they were
asked to be. Nothing in the verdict looks wrong; the rubric was simply answering a
question about a different kind of object.

Repairing such an incident has two rules of its own, both learned the expensive way.
**Enumerate the correction, never pattern it.** Re-route the specific artifacts whose
intent was actually misread, named one by one — because a pattern-shaped fix silently
moves the standing verdicts of everything else it happens to match, and nobody
reviewed those. **And the new sub-rubric is not the lenient one.** A rubric split
after a mis-routing must keep every bar that still applies and be stricter where its
own craft demands more. The sub-class that was wrongly penalised for carrying text now
faces a text-quality bar the original rubric could not even express, because the
original forbade text entirely. If the split reads as relief for the producer, it was
a capitulation, not a correction.

## Decision rules

- **When a criterion needs the brief, move it.** Compliance with a specification is a
  real and separate judgment from craft. Keep them in different instruments so a
  compliant-but-lifeless artifact and a beautiful-but-off-brief one are
  distinguishable.
- **When a criterion needs a measurement the artifact lacks, require the measurement.**
  Change the producer's contract, not the bar.
- **When a sub-class inside a medium has different craft, give it a sub-rubric.** One
  rubric spanning a schematic, an icon sheet, a tiling surface and a finished
  illustration will grade three of them against a standard they were never meant to
  meet.
- **When the artifact is a rendering of something else, judge the rendering.** The
  stored thing is the thing. If the stored thing misrepresents the source, that is a
  pipeline defect to fix upstream, not a licence for the examiner to imagine the
  source.

## When not to use it

This constraint does not apply to instruments that are deliberately about the process:
a stage-gate review of a pipeline, a coverage measure across a project, a compliance
check against a design specification. Those legitimately read the brief, the plan and
the history. The rule is specific to the craft lens — the instrument whose entire
claim is that it grades the thing a player would eventually see, against the standard
of things players already saw.
