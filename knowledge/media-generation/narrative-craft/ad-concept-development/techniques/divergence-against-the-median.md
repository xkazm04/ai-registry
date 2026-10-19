---
layer: technique
type: technique
subject: ad-concept-development
technique: divergence-against-the-median
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [using a language model to generate concepts, titles, premises or visual ideas, a set of generated ideas that all feel like variations of one, choosing a model or prompt for ideation]
---

# Divergence against the median

## The concern

A language model asked for ideas returns ideas drawn from the centre of its
distribution. Each one is fluent and plausible, and nobody else would miss it. The
evidence is now broad, and it is mostly peer-reviewed:

- **Writers.** In a 2024 experiment with several hundred writers, those given model
  ideas wrote stories rated more creative, with the largest gains for the weakest
  writers. Their stories were measurably more similar to each other than the
  unassisted ones.
- **Brainstorming groups.** A 2025 study across dozens of comparisons found
  model-assisted ideas less diverse in the large majority. In one task, many
  participants independently produced the same named idea.
- **A small study.** In a 2024 study of a few dozen people, users of one model converged on
  each other's ideas and felt less ownership of them.
- **Across vendors.** A 2025 study of tens of thousands of open-ended prompts found
  outputs repeating within one model and **converging across models from different
  vendors**. The reward models and model judges it tested matched aggregate
  preference and missed individual taste.

The consequence for practice is direct. **Switching to a stronger model does not fix
convergence**, and a model judge will not pick the most distinctive idea. Only the
procedure around the model moves the output off the median. One model vendor's
own prompting guidance concedes the default, describing output that converges on
"on-distribution" choices unless the prompt bans the common ones and commits to a
direction.

## Procedure

1. **Front-load the material.** Give the model the brief, the product's single
   claim, the audience, the rubric, and real specifics: true anecdotes, the
   place, the people. Generic input guarantees generic output. Practitioners who
   report good sessions describe front-loading the full story before asking for
   anything.
2. **Name the obvious and ban it.** First ask for the ten most obvious ideas for this
   brief. Then forbid them, and anything close to them, in every later request. The
   model is good at listing its own median. Use that.
3. **Ask for many ideas at once, stated as mutually distinct.** Request a large set of
   one-line premises in a single call, with an explicit instruction that each must
   differ from all the others in mechanism, setting and register. A 2024 preprint
   comparing dozens of prompting strategies found that step-by-step generation of
   explicitly distinct ideas came close to human-group diversity, while a persona
   instruction ("think like a famous founder") barely moved similarity.
4. **Sample the tails explicitly.** A 2025 technique asks the model to return several
   candidates **with a probability for each**, and to include low-probability ones.
   It raised creative-writing diversity by roughly one and a half to two times with
   no training, and more capable models gained more. Ask for the candidates a typical
   response would not include.
5. **Cluster and drop the biggest cluster.** Group the set by underlying idea, not by
   wording. The largest cluster is the median, so delete it and develop from the
   outliers.
6. **Separate generation from judgement.** Judge in a different call, under a
   different instruction, with the rubric stated. Always include **"which existing ads
   does this most resemble?"**. A premise resembling a well-known spot fails even
   when it scores well on everything else.
7. **Run a cliché pass on the survivors.** Professional editors' corrections of model
   prose fall into a small recurring taxonomy: cliché, purple prose, unneeded
   exposition, and similar categories. Run the survivors through it as an editing
   pass, with the clichés of the category listed explicitly.
8. **A human picks.** The judge call ranks and explains. The selection is a person's,
   for the reason the cross-model study gives: model judges track the average, and
   the job is to find what is not average.

## Decision rules

- When ideas from several model calls look different but share a premise, count them
  as one idea. Two skins on one idea are one seat.
- When the brief is narrow (a fixed product, a fixed mechanism), divergence moves to
  the **execution**: setting, character, register. Run the same procedure on those
  axes.
- When the set is small (under about twenty), clustering is noise. Generate more
  before cutting.
- Raise the sampling temperature only on generation calls, never on judging calls,
  and never on prompts that must stay word for word.

## When not to use

- Translation work after the concept is locked, such as shot lists and per-engine
  prompts. There, the median is what you want: faithful, plain, unsurprising.
- Constrained copy with fixed legal or factual content.

## Failure modes

- **One call, one idea.** "Give me a creative ad concept" returns the most probable
  creative ad concept.
- **The persona fix.** "You are an award-winning creative director" changes the
  voice of the answer, not its distribution.
- **Model as judge of novelty.** The judge prefers what it recognises, and familiarity
  is what we were trying to escape.
- **Diversity reported, not measured.** "We generated fifty ideas" without saying
  how many distinct clusters they formed. Fifty phrasings of five ideas is five ideas.
  Report the cluster count.
