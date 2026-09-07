---
name: original-2d-art-curation
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/visual-assets
---

# Original 2D art generation and curation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A generated art library grows into noise unless somebody decides what stays.
An agent that never learns from those decisions keeps producing the same rejected work,
and a library nobody has curated is four hundred images from which the owner can name
six they would actually use.

**Input.** The subject matter and mood the curator wants explored, the history of what
has already been made, the images themselves and not only the concepts behind them, and
the reasons past work was turned down.

**Core action.** Conceive a direction that has not been tried, generate work in it, and
present every piece for an explicit keep or discard rather than assuming taste or
quietly picking a favourite first.

**Output.** A growing body of kept work, each piece recorded with the model version,
settings and human decisions that produced it, and a set of directions the curator has
ruled out.

## Activities

1. Read what has already been made, what was turned down, and the reasons given
*(observe)*
2. Settle on a direction that is not a restatement, or conclude there is none worth
trying *(decide)*
3. Generate the work at the settled direction and settings *(act)*
4. Present every variation for an explicit keep or discard decision *(deliver)*
5. Write each decision, its reason and what produced the piece where the next run reads
it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**There is a growing body of generated work the curator actually wanted, and its
direction moves with their taste.**

- Every variation is presented for an explicit keep or discard, including the ones the
  agent liked least, because pre-selecting a favourite hides the range the curator is
  judging.
- A discard leaves a reason that names a property of the work rather than a feeling
  about it, since only the first kind can steer the next run.
- A reason that has been given three times stops showing up in later work.
- A run that finds no untried direction records that it looked and produced nothing,
  instead of generating a near duplicate so that the run has an output.

**A kept piece can still be accounted for months later, after the model behind it has
changed.**

- The model and its version are recorded with the piece, not only the prompt and the
  seed, because the same prompt against an updated model no longer returns the same
  image.
- The human contribution is recorded alongside the output: the direction that was set,
  the selection that was made, and anything changed afterwards.
- Deduplication is done against the kept images and not only against the concept text,
  so two different prompts that landed on the same picture are caught.

## Guidance

The accountability is the direction over time, not any single image. A run that produces
one piece worth keeping beats four near duplicates, and a run that finds nothing untried
should say so and stop rather than restate. A rejection is only usable if it names a
property of the work: the pose repeats, the palette is muddy. Feelings cannot steer a
generator. Deduplicate against the kept images, not only against the concepts, because
two different prompts land in the same picture.

## Where this is worth adopting

- A designer building a personal library who has four hundred generated images and can
  name six they would actually put in front of a client, with no idea which decision
  separated them.
- A studio putting generated art into shipped work, where months later somebody has to
  answer who made this and how, and the provider has since replaced the model that made
  it.
- A curator whose taste is real but has never been written down, who has turned down the
  same thing eleven times without the agent noticing that it is one objection rather
  than eleven.
- A team whose review queue has become a backlog, where generating more work is actively
  making the problem worse and the useful run is the one that does not generate.
- A brand exploring a visual direction it has not committed to, where the ruled out
  directions are worth as much as the kept pieces and nothing today is recording them.

## Connector types

`image_generation`, `storage`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[leonardo-ai](examples/leonardo-ai.md) for `image_generation`,
[higgsfield](examples/higgsfield.md) for `image_generation`.

## Recommended trigger

`self_paced`. Act when there is a direction worth exploring that has not been tried, and
pause when recent work is going unreviewed, since generating into a full review queue
helps nobody. A daily schedule would be a delivery habit rather than an obligation, and
it would guarantee output on days when the honest answer is that there is nothing new to
try.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The subject matter and mood the adopter wants explored, in their own words rather than
  from a menu, because a style label picked from a list produces work that belongs to
  nobody.
- How much say the adopter wants over each piece, because that decides whether this is a
  curated feed or a supervised commission, and it changes what an unreviewed queue
  means.
- Where kept work should live and in what form, since a gallery, a project folder and a
  design system imply different formats, different naming and different handling.
- What the kept work will be used for, because a library that will appear in shipped or
  commercial work needs the human contribution recorded from the first piece rather than
  reconstructed later.

## Dependencies

None.
