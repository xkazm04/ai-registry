---
name: brand-visual-asset-production
version: 0.2.0
status: seed
domain: creative_design
path: creative_design/visual-assets
---

# On brand visual asset production

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Surfaces ship with placeholder or stock visuals because making something that
belongs to this specific product is slower than shipping without it. When work does get
made, whether it is on brand is settled by whoever is in the room, so the answer changes
and the drift is only visible once six surfaces have each drifted a little in a
different direction.

**Input.** The written design brief, the surface that needs art and the size it will
actually be seen at, the brand's declared colors and type, and the accumulated record of
which phrasings produced approved work and which were turned down.

**Core action.** Compose the work from the brief rather than from scratch, then decide
whether it is on brand by checking the properties that can be checked instead of by
forming an impression, and iterate a bounded number of times rather than indefinitely.

**Output.** An asset that traces to the brief, in the format and size the surface needs,
delivered where the project can use it, carrying the checks it passed and any deliberate
departure from the brief, after a person has seen it.

## Activities

1. Read the brief, the surface it is for, and the size the asset will really be seen at
*(observe)*
2. Compose the request from the brief and from what has been approved before *(decide)*
3. Generate the asset *(act)*
4. Check it against the properties that can be checked, and iterate a bounded number of
times *(decide)*
5. Deliver in the format the surface needs, with the checks and any departure stated,
for a human decision *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Surfaces that would otherwise ship with placeholder or generic visuals carry work that
belongs to this product.**

- Every delivered asset traces to the brief, and a departure from it is stated as a
  decision rather than left to be noticed later.
- The asset arrives in the format the surface actually consumes: an icon set as vector,
  a hero within the aspect ratio and the weight budget the page has.
- Nothing is delivered without a person seeing it, and they are shown it at the size it
  will be seen at rather than full bleed.

**On brand is a set of checks that passed, not an impression somebody formed.**

- Dimensions, aspect ratio, palette against the declared brand colors, contrast behind
  any text, and legibility at the smallest size the surface renders are checked every
  time and reported with the asset.
- Any text rendered inside the image is read back and compared against what it was meant
  to say, because a generator producing near words is the most common way an asset ships
  wrong.
- A model's overall score is not one of the checks. Where a model is used it answers one
  closed question at a time, so two runs can be compared.
- An asset a person turns down after it passed every check is treated as a finding about
  the check list rather than about the asset, and the property they objected to is added
  as a check wherever it can be decided, because a rejection that leaves the list
  unchanged will be reproduced by the next run at exactly the same pass rate.

## Guidance

On brand has to be a list of checks or it is a feeling that changes with whoever is in
the room. Dimensions, aspect ratio, palette against the declared colors, contrast behind
any text and legibility at the size the surface really renders are all decidable, and
between them they catch most of what gets sent back. Read any text in the image back to
yourself, because generators produce near words. When the work cannot reach the bar, ask
for a reference rather than generating again.

## Where this is worth adopting

- A product whose landing page and six feature sections are still on stock photography,
  where each section looks like it belongs to a different company and nobody can say
  which one is the right one.
- A team with no designer, where a placeholder shipped eight months ago is still in
  production because replacing it was never anybody's job and nothing surfaces it.
- A brand with a documented palette and type scale that nothing actually checks, so
  assets drift one at a time and the drift is only visible in aggregate, long after the
  decision that started it.
- A launch needing fourteen assets across five sizes inside a week, where the failures
  that cost the most are a wrong aspect ratio and a raster icon rather than anything to
  do with taste.
- A team that once shipped a generated image with a misspelled word rendered into it,
  and now reviews everything by hand at a cost that has quietly become larger than the
  work.

## Connector types

`development`, `image_generation`, `vision`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `development`,
[gemini-vision](examples/gemini-vision.md) for `vision`,
[leonardo-ai](examples/leonardo-ai.md) for `image_generation`.

## Recommended trigger

`self_paced`. There are two honest sources of work here and neither is a clock: a
request that has arrived, and a surface still carrying a placeholder that nobody has
noticed. Act on a request immediately, and go looking on the seat's own initiative when
the queue is clear. A surface that genuinely does not need art is a finding worth
recording rather than a gap to fill.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which project surfaces are in scope, because an unbounded remit here produces work
  nobody asked for and a review load that stops the recipe being used.
- The brand's declared colors, type and any clear space rules, because these are what
  turn on brand from an opinion into a check, and without them the checking half of this
  recipe does not exist.
- What kinds of asset the adopter needs most, which shapes what the seat gets good at
  over time and which per type checks are worth running.
- How assets should reach the project, since a file in a folder and a committed change
  are different levels of trust and imply different review before delivery.

## Dependencies

None.
