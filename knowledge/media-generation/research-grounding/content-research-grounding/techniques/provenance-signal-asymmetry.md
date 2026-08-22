---
layer: technique
type: technique
subject: content-research-grounding
technique: provenance-signal-asymmetry
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [judging whether a source was machine-written, grading research pulled from the open web, deciding what a provenance detector's result licenses you to claim, handling machine-provenance marks on your own published output]
---

# Provenance signal asymmetry

Machine-generated text, images and audio increasingly carry provenance
marks — statistical signatures woven into word choice, signed metadata
attached to a file, acoustic fingerprints in a waveform. Detectors for them
are becoming ordinary infrastructure, and a factual production will meet them
from both directions: judging whether a *source* was machine-written, and
handling marks on its *own* output.

The property that governs every use of them is one sentence:

> **A positive detection is evidence. A negative detection is not.**

The two results have different epistemic weight, they are not two values of
one boolean, and treating them as one is the mistake that turns a useful
instrument into a laundering machine.

## Why the asymmetry is structural, not a maturity problem

It does not go away as detectors improve, because it follows from how the
marks work.

A statistical text mark is a bias in the choices a generator makes among
near-equivalent continuations. Detecting it means finding that bias in the
text you hold. The signal therefore **dilutes with every subsequent
operation**: a paraphrase, a human edit pass, a translation, a heavy trim.
A short passage may never have carried enough tokens to hold a detectable
signal at all. Producers say so themselves — a detected mark is described as a
signal that content was processed by a given system rather than as a
conclusion, and the absence of one is described as carrying no implication
about whether the content was machine-generated.

Metadata provenance fails differently and just as asymmetrically: a signed
manifest travelling with a file is strong evidence when present, and trivially
removed. Stripping it is one operation and leaves no trace.

And the two mechanisms often coexist on one producer's output — a statistical
mark on text, signed metadata on images — with different survival properties,
so "we checked provenance" is not a single act.

## What each result licenses

| Result | What it supports | What it does not |
| --- | --- | --- |
| **Detected** | This content was probably produced or processed by that system. Strong, and worth recording. | That the whole artifact is machine-made. A marked paragraph in a hand-written piece marks the piece. |
| **Not detected** | Nothing about origin. Only: no mark of *this kind*, from *this producer*, survived into *this excerpt*. | That it is human-written. That it is unmarked. That other producers' marks are absent. |
| **Not checked** | Nothing. | Anything — and it must be recorded as its own state, never merged into "not detected". |

The third row is [unmeasured is not pass](../../../_laws.md#unmeasured-is-not-pass)
applied to origin. A pipeline that checked nothing and a pipeline that checked
and found nothing produce the same downstream text unless the vocabulary keeps
them apart, and the vocabulary is therefore three-valued at minimum.

## Grading a source: an absent mark moves nothing

The
[evidence-grading-ladder](./evidence-grading-ladder.md) grades a source on what
it is and where it came from. Provenance detection composes with that ladder in
one direction only.

- **Detected** is a downgrade, and how far depends on the claim. For a primary
  observation it is close to disqualifying; for a secondary summary of a
  primary source it is a prompt to reach the primary rather than a reason to
  discard.
- **Not detected** is **not** an upgrade. It moves the source exactly nowhere,
  and a pipeline that promotes an unmarked source has built a system where
  laundering — paraphrasing machine text once — is the cheapest way to reach
  the top of the ladder.

The rule survives the arms race, which is its main virtue. Rewriting tools that
strip marks make negatives even weaker; they cannot make a positive weaker, so
a design that only acts on positives degrades gracefully as the ecosystem gets
adversarial.

**Provenance is never the only test.** It is one input to a grade that is
mostly about what the source *says* and whether the claim resolves to something
checkable. A machine-written page citing a public record is more useful than a
human-written page citing nothing.

## The corpus is contaminated and the date is the better filter

The stronger practical guard is not detection at all. A research corpus drawn
from the open web now contains a large and growing proportion of machine-
authored material, most of it unmarked because it predates marking or was
produced by systems that do not mark.

So the durable defences are the ones that do not depend on a detector:
publication date relative to when generation became cheap; whether the source
is a **primary record** — a filing, a dataset, a transcript, an instrument
reading — rather than prose about one; and whether the claim resolves to
something you can check independently. That last is
[output never outruns evidence](../../../_laws.md#output-never-outruns-evidence)
doing its usual work: a claim that cannot be traced to a checkable fact does
not earn a place on screen, regardless of what wrote it.

## Your own output, and the mirror

The same asymmetry read from the production side:

- Assume marks are present on anything a generator produced for you, in text
  and in media, whether or not you can see them.
- **Do not build a workflow whose purpose is stripping them.** Beyond the
  ethics, it is a load-bearing dependency on an adversarial technique that
  the next model version breaks.
- A mark on part of a production does not make the production machine-made,
  and the honest disclosure is about what was generated and how it was used —
  which is a claim about your process, not about a detector's output.
- Editing dilutes text marks as a side effect. That is a fact about the
  instrument, not an achievement, and it changes nothing about what you owe
  an audience.

The audience-facing version is simply this subject's standing rule in another
costume: say what you know, at the strength you know it. A negative detection
is not knowledge.
