---
layer: technique
type: technique
subject: production-coverage-measurement
technique: engine-credibility-classes
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [deciding whether an unattended pass needs an independent gate, classifying what produced each item, an unrecognised producer is defaulting to a trusted grade]
---

# Producer credibility classes

How much an automated producer's own passing check is worth depends on **what kind of
producer it is**. Declare the class per item, publish one sentence per class stating what
a low-tier pass from it does and does not prove, and let the class — never a guess —
decide whether the pass stands alone or needs an independent gate.

## The classes

A working set, each with the sentence that must render beside it:

- **Model-authored text** — a model wrote it, and text quality scales with the model.
  Credible without a gate; provable only by a judge.
- **Derivational code** — code that computes the artifact or its verdict from inputs
  *outside its own source*, and is graded against something real. A pass is earned.
- **Hand-typed constants** — values a person typed into the pipeline definition. Nothing
  computed them, and every check grading them re-reads the same literals, so a pass proves
  the author is self-consistent, not that the values are right. Needs a judge or a runtime
  gate.
- **Human selection** — a person chose this from real candidates. A judgment act with an
  artifact under it, so the choice carries their taste. Credible without a gate.
- **Generative imagery / geometry / audio** — pixels, a mesh or a waveform exist, but
  nothing has looked at or listened to them. Professional quality needs a perceptual gate.
- **Runtime claim** — credible only once the gate has actually run; a declared gate is not
  a passed one.
- **External tool** — the output is real, but nothing in this pipeline has graded its
  quality.
- **Unaudited** — nobody has identified what produces this. It has earned no credibility.

## The axis that actually separates them

The instinct is to sort by *who or what did the work*: machines here, humans there. That
axis does not predict anything. A person choosing among real candidates and a person
typing a balance number are both human work, and only the first has an artifact under it.

The real axis is **falsifiability from outside**: could anything beyond the artifact's own
source have made the check fail? Derivational code rebuilding a result from sibling
artifacts and grading it against real state can fail against reality. A producer that
returns literals, checked by a rule written against those literals, cannot. Sort the
classes by that question and the trusted set falls out on its own.

**The byte-identity probe.** When you cannot tell which side a producer is on, run it for
two genuinely different entities and compare the outputs. If they are byte-identical —
or differ only by an interpolated name — nothing is being computed, and the class is
hand-typed constants regardless of what the code looks like. This probe is cheap, is
mechanical, and reliably finds whole populations of steps that have been reading as
derivational for months.

## Procedure

1. **Enumerate the classes** and write the one-sentence note for each. The note renders
   beside the class everywhere the class appears; a class without a published note will be
   interpreted by every reader differently.
2. **Declare the trusted set explicitly** — the classes whose low-tier pass stands without
   a gate — behind a single predicate. No caller restates the membership.
3. **Resolve each item's class**, in precedence order: an audited fact naming the real
   producer, then the item's own declaration, then a heuristic.
4. **Map the resolved producer name to a class through an explicit table**, and map
   anything unrecognised to unaudited.
5. **Grade**: a pass from a trusted class reads reviewed; a pass from any other class
   reads drafted, awaiting a gate.
6. **State the demotion.** When the class costs an item a rung, the reason must say so.

## Decision rules

- **When a producer is unrecognised, it earns nothing.** Never fall back to a trusted
  class. The canonical incident is a lookup that defaulted every unrecognised producer to
  the highest-credibility class: every unaudited item then looked exactly like one
  genuinely produced by the best producer in the stack, and the blast radius included
  audited producers whose recorded spelling had drifted from the table. Requiring a
  deliberate table entry for each new producer *is* the mechanism.
- **When adding a class, ask what a pass from it could not catch.** If the answer is
  "nothing the class below already misses", it is not a new class.
- **When one recorded name carries two meanings, split it before it grades anything.** The
  recurring case is a single "code" label covering both derivational code and literal-
  returning bodies. One of those has earned trust and the other has not.
- **When a class's pass is credible but its quality is not, say both.** Credible-without-
  a-gate is a statement about the pass, not about the craft. It sets readiness, never the
  craft level.
- **When a note and the trusted set disagree, the note is the bug or the set is.** They
  are two statements of one rule and must be edited together.

## When not to use it

- **To decide whether one artifact is good.** This classifies producers, not outputs. An
  item from a trusted class can still be poor work, and the craft axis is where that
  shows.
- **Where every item comes from one producer.** With a single class the mechanism costs a
  column and buys nothing; revisit when the second producer arrives.
- **As a permission system.** These classes describe evidential worth, not who may run
  what. Overloading them with authorization makes both harder to change.
