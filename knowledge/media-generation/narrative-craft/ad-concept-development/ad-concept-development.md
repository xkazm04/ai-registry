---
layer: golden-path
type: golden-path
subject: ad-concept-development
status: forged
use_when: [deciding what a short persuasive spot is about before any frame or prompt exists, diagnosing a generated ad that is consistent and well made but forgettable, using a language model to generate or judge ad ideas, building a spot against an explicit scoring rubric or client brief]
techniques:
  - agency-preserving-premise
  - creativity-template-mechanisms
  - divergence-against-the-median
  - rubric-as-spine
  - llm-seat-assignment
---

# Ad concept development

A short persuasive spot (fifteen to sixty seconds that sell a product, a brand or a
promise) is decided before production begins. The **concept** is one sentence that
names what happens, why it surprises, and why the product is the reason it happens.
Everything downstream (shot design, prompts, identity locking, grading, the cut)
serves that sentence. Production cannot raise a spot above it. This subject owns that
sentence, and the work of finding one that is not everyone's first idea.

The rest of this bundle is built for **control**: holding a face across thirty
generations, keeping a style stable, mapping references to roles, grading outputs
against a rubric. That machinery does what it promises, and it turns a median idea
into a median film. A team can apply every control discipline correctly and still
ship a spot that is consistent in every frame and remembered by nobody. That is the
failure this subject exists to prevent, and the control subjects can't see it,
because by their measures nothing failed.

## Three attractors pull a spot toward the median

**The idea attractor.** The first premise most people reach for a product category is
the one most people reach for, and that is the convention a viewer has already
learned to skip. Industry testing in 2026 found generated ads drifting toward category
convention more than human-made ones: they chose storytelling less often and fell
back on familiar demonstrations. The same work found convention-breaking ads more
than a fifth likelier to earn brand attention. Recognisable premises fill the
category: the product as magic, the stalled creator rescued, the inspiration montage
across several cities. Each was fresh once. Each now reads as an ad before it reads
as a story.

**The ideation attractor.** A language model asked for ideas returns the centre of
its distribution, and several lines of research agree on what that costs:

- Model-assisted individuals produce ideas rated better, while the group's ideas
  become more alike.
- Separate users of one model produce ideas that are measurably less distinct from
  each other. In one brainstorming study, several participants independently gave
  the same invented product the same name.
- In a 2025 study of open-ended prompts across many models, different vendors'
  models converged on each other's answers.

So switching to a stronger model does not escape the attractor. Only a procedure
does ([divergence-against-the-median](./techniques/divergence-against-the-median.md)).

**The execution attractor.** Image and video models have a default look: warm
practical light against cool shadow, shallow focus with soft bokeh, centred subjects,
glossy finish, and glowing particles for anything magical. Asking for "cinematic" or
"premium" produces it. The frame-level counter belongs to the prompt subjects. The
concept-level counter is here. A premise that needs "magic happens" will be rendered
in the default magic, so choose a premise whose central image the model has no
default for.

## What a principal practitioner holds true

- **The product amplifies the person. It does not replace them.** In the most
  consistently punished pattern in recent technology advertising, the product
  performs the human's creative or emotional act for them. Spots built on that
  premise have been pulled and apologised for. In 2026 testing of the largest annual
  ad event, technology-themed spots averaged well below the field, and the
  best-scoring exception treated the technology as a catalyst rather than the
  protagonist. See
  [agency-preserving-premise](./techniques/agency-preserving-premise.md).
- **Surprise has a mechanism, and you pick it first.** A peer-reviewed 1999 study of
  200 award-winning print ads found six recurring templates (among them inversion,
  extreme consequence, absurd alternative and extreme effort) behind most winners,
  and behind almost none of a matched set of non-winners. Teaching people the
  templates improved their ads. Choosing the mechanism before the content is the
  fastest exit from the idea attractor. See
  [creativity-template-mechanisms](./techniques/creativity-template-mechanisms.md).
- **Comedy, absurdity and self-awareness travel. Sincere uplift in imitation live
  action does not.** Generated spots that drew praise in 2025 and 2026 escalated an
  absurd premise, made the generator's own output the joke, or chose a stylised
  world. Spots that drew contempt aimed for heartfelt realism, and the viewer noticed
  what was missing. This is a pattern across public reception, not a controlled
  finding. Treat it as a strong prior and not a law.
- **When someone states the scoring, the heaviest criterion is the spine.** A
  contest, a pitch or a client brief often states its criteria and their weights. The
  concept is built around the heaviest one, not decorated with it afterwards. See
  [rubric-as-spine](./techniques/rubric-as-spine.md).
- **The model takes some seats and not others.** Makers of the most-praised generated
  ads describe the language model as a translator (script to shot list to per-engine
  prompts), a reviser of failed prompts and, at most, a brainstorm partner. The
  concept and the taste stay human. No maker-primary source found in 2026 credits a
  model as creative director of widely praised work. See
  [llm-seat-assignment](./techniques/llm-seat-assignment.md).

## The memorability heuristics, and their grade

One practitioner school of effectiveness research sorts ad features into those that
build memory and those that erode it.

- **Build memory:** characters with defined relationships, a sense of time and place,
  an unfolding story, dialogue, and music the story is built on.
- **Erode it:** abstraction, montage, rhythmic repetition with no story, voiceover
  explaining, and text on screen.

In that school's analyses, spots weighted toward the first set are remembered and
attributed more often. The list is useful as a diagnostic. A concept that is four
parallel vignettes with no relationship and no place is on the wrong side of almost
every line. Its framing as a split between brain hemispheres is contested as
neuroscience, so cite it as a practitioner heuristic and never as mechanism.

A second caveat applies to all effectiveness literature cited here. It measures
long-run brand effects on consumers at scale. A contest panel or a client review is
a one-shot judgement by a few people with their own agenda, often including how much
of their toolkit the spot shows off. Where the rubric states that agenda, the rubric
wins (see [rubric-as-spine](./techniques/rubric-as-spine.md)).

## The order of work

1. **Read the brief as a scoring function.** List what is judged, with weights if
   they are given and inferred weights if not, and name the heaviest criterion.
2. **Write the agency line.** Say in one sentence what the person still does and
   what the product changes about it. A premise that cannot be written that way is
   rejected before ideation, not after.
3. **Diverge on mechanisms, not scenes.** Generate premises under each template
   mechanism, with the obvious ideas listed and banned first. Take quantity, cluster,
   and discard the biggest cluster.
4. **Judge against resemblance as well as quality.** For each surviving premise,
   ask which existing ads it most resembles. A premise that resembles a famous ad
   fails even if it is well executed.
5. **Develop three, pick one, and lock it in a sentence.** Only then do style frames,
   shot lists and prompts begin. From here the control subjects take over.

## Failure modes of the naive reading

- **Starting at the prompt.** The team's first artefact is a shot prompt or a style
  block, so the premise is whatever the first prompt implied. Every downstream
  discipline then locks in an idea nobody chose.
- **Mistaking consistency for quality.** Identity and style held perfectly across
  the spot read as success on every control metric. Nobody measured whether anyone
  would remember it, because nothing in the pipeline could.
- **The magic product.** The product's power is rendered as light, sparkle or
  particles doing the work. Viewers have been trained to read that convention as
  "something special" without knowing what. It is the model's default effect, and it
  takes the human out of the story.
- **The montage of equals.** Several protagonists in several places, each given the
  same beat, so none has a relationship, a place or a story. The structure reads as
  ambition and plays as a list.
- **The score as wallpaper.** Music is commissioned after the picture to "carry
  emotion". When the brief weights sound, or when the spot needs a recall hook, the
  sonic idea has to be the concept or part of it.
- **Asking the model for "a creative ad idea".** One request returns the centre of
  the distribution, phrased with confidence. The phrasing is good and the idea is
  everyone's.
- **Letting the model judge.** Model judges and reward models match aggregate
  preference and miss individual taste. They will rank the most familiar premise as
  the safest, which is the opposite of the job.

## Where this subject ends

Once the concept sentence is locked, structure inside the spot belongs to the
narrative subjects. Frame language belongs to cinematic language and frame
direction. The look, its exploration and the default-look attractor at frame level
belong to image prompt composition and visual style locking. How a cue is written
belongs to music prompt composition. This subject decides what the spot is, and
hands over.

The laws this subject leans on are in [the bundle's laws](../../_laws.md), chiefly
that an unmeasured quality is not a pass. A concept that has not been tested for
resemblance has not been tested.
