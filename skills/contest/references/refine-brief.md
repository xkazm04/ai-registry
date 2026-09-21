# {{title}} - round {{round}}

Your variant was shortlisted by the owner in the previous round. This round is not a new idea:
it is the same variant, pushed as far as it can go. The owner has looked at it in a browser and
said, in their own words, what works and what does not. Their words outrank everything else in
this file, including the first round's panel.

## The idea, as first briefed

{{brief}}

## What you are refining

`variant-{{n}}/` in this directory is your shortlisted variant exactly as the owner saw it, with
its `NOTES.md`. Refine it **in place**: the deliverable is still `variant-{{n}}/index.html`, opening
from disk with no build step, loading the real data from `../data/`.

## The owner's review

{{feedback}}

{{general}}

## What the first round's panel said about this variant

{{panel}}

Treat the panel as a defect list, not as direction. Where the panel and the owner disagree, the
owner is right.

## References

{{references}}

These are other shortlisted variants, with every maker's name removed. Borrow what the owner
praised in them when the review above points there; do not converge on them. Never modify
`reference/` or `data/`.

## The bar for this round

- **Practical first.** The owner will use this to find and read real material. A view that is
  beautiful and slow to read has failed. Body text at 14 px or larger at a 1280 x 800 window;
  nothing the user must read below 12 px; no label truncated mid-word where a shorter label or
  a second line would fit.
- **Levels, not one layer.** Do not fit the whole corpus into one frame at the cost of type
  size. Give each level the space it needs and make moving between levels obvious and smooth.
- **Heavy content gets its own surface.** A technique's rule, triggers, laws and evidence are a
  document, not a sidebar. Give them room.
- **Keep what was praised.** Do not trade away the thing that got this variant shortlisted.
- Everything in the first brief's hard constraints still holds.

## How to work

- You have about {{timeout}} minutes. Spend them on this one variant.
- Decide everything yourself; there is no one to ask.
- When done, add a `## What changed in round {{round}}` section to `variant-{{n}}/NOTES.md`: each
  change, and which sentence of the owner's review it answers. Do not name yourself, your model
  or your vendor anywhere.
- Leave nothing else at the top level.

Your final message is one line per change you made.
