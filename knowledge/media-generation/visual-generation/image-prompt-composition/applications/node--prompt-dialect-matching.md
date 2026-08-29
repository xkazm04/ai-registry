---
layer: application
type: application
subject: image-prompt-composition
technique: prompt-dialect-matching
stack: node
status: forged
verified_on: 2026-08-29
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
---

# Node: one compiler, two dialects, and a trial that ran across the boundary

*Verified against the consuming tree at commit `78fe0aa`, 2026-08-29.*

The technique's second procedure step asks for **one style contract, two
renderings** — a structured record the compiler serializes per dialect. In
this tree the contract exists and the compiler is one function with one
output, and the router hands that output to two model classes that read it
differently.

## The seam

`lib/stylePrompt.ts:61-63` compiles the style block, the subject and the
no-text clause into a single string. Its header states the assumption
the ordering encodes: "CLIP-conditioned models see roughly the first 77
tokens and silently drop the rest, so the half that must survive
truncation goes first." That is a caption-class constraint, correctly
applied — to a caption-class model.

`lib/imaging/providers/leonardo.ts:141` ships `req.prompt` verbatim to
one, with a `negative_prompt` field beside it.
`lib/imaging/providers/google.ts:158` hands the same string to an
instruction-following multimodal model, differing only in that its
`buildPrompt` folds the exclusions into prose because that class exposes
no negative channel. `lib/imaging/router.ts:73` re-routes between them
when the preferred vendor refuses.

So the boundary the technique warns about is crossed on the fallback path,
unrendered.

## A and B

**A** — the shipped policy. `compilePrompt(block, subject)`, verbatim to
both targets.

**B** — the same contract serialized twice: for the caption class, a
front-loaded comma-separated concept list; for the brief-reading class, a
purpose line first ("Draw exactly one still frame for an explainer video.
It is a diagram that carries one idea; it will be composited under our own
vector caption layer"), then content, then look, then constraints, then
cardinality.

A harness compiled both from the project's own style preset and its own
compiler, without touching product code.

## What was read

| policy | target | chars | style in head-77 | purpose first | cardinality closed |
|---|---|---|---|---|---|
| A | caption class | 611 | yes | **no** | **no** |
| A | brief class | 876 | yes | **no** | **no** |
| B | caption class | 429 | yes | no | no |
| B | brief class | 1060 | yes | **yes** | **yes** |

Under A the two targets receive the identical prompt body; the 265-byte
delta between them is entirely the exclusion clause, which is negative
*delivery*, not dialect. Neither target is told what the image is for, and
neither is told to return one image — the two properties the technique
names as what a brief-reading model rewards and what it will otherwise
fill in with a plausible invention.

Under B the bodies differ, and the brief target gains both. Notably B does
not trade the caption-class property away: the purpose line is short
enough that the style block still lands inside the first 77 words on the
brief rendering too.

**Verdict: unmeasurable.** The harness reads what reaches each model. It
cannot read whether the pixels improve, and that is the claim worth
having.

**Instrument that would settle it:** `pipeline/build-style-trials.mts`,
re-run dialect-matched. The repo already owns a 6-style × 5-beat grid
scored on *usable* — on-brief AND free of text — and the 60-cell run of it
is what demoted the caption-class provider from default to fallback
(`lib/imaging/router.ts:60-72`: 7/30 usable against 26/30). That trial
compared one dialect's prompt across both classes. The same instrument
with the confound removed — 60 cells per policy, each provider fed its own
dialect — answers this and re-examines that demotion at the same time.

## What this realization cannot do or prove

- **It cannot tell you the demotion was wrong.** A dialect confound
  makes a comparison unsafe; it does not make its loser innocent. The
  measured gap was large and one-directional — the caption-class model
  drew the countable mechanism zero times in six — and dialect matching
  might close some of it, all of it, or none.
- **The dialect classification is by property, not by outcome.** "Purpose
  stated first" and "cardinality closed" are checked with pattern matches
  over the compiled string. They are the technique's stated markers, not
  a measurement that a model attends to them.
- **B's brief rendering is one author's serialization.** The technique
  permits a fielded JSON form as an equally legitimate rendering of the
  same contract; nothing here compares the two, so "the brief dialect" is
  represented by a single sample.
- **It says nothing about the reference-attachment half.** The edit path
  attaches a subject image and up to thirteen style references with no
  role declaration (`lib/imaging/providers/google.ts:188-192`), while the
  generate path's labelling clause sits at `:344-349` and is not applied
  there. That is a different technique's territory and a real gap this
  harness does not touch.
