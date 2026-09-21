# {{title}}

You are one participant in a design contest. Other seats are answering the same brief right
now; a blind panel will score every variant, and one will win. You compete on the quality of
what you leave in this directory and on nothing else.

## The idea

{{brief}}

## What you must deliver

Exactly **{{variants}} variants**, each a genuinely different answer to the idea - a different
metaphor, a different information architecture, a different bet on what the user needs first.
Three skins of one idea will lose to one strong idea and two honest alternatives.

```
variant-1/index.html     variant-1/NOTES.md
variant-2/index.html     variant-2/NOTES.md
variant-3/index.html     variant-3/NOTES.md
```

- `index.html` opens directly from disk (`file://`), with no build step and no server. Inline
  your CSS and JS, or keep them in files beside it. Libraries only from a public CDN
  (jsdelivr, cdnjs, unpkg) and only when they earn their weight; a variant that also works
  offline is worth more than one that does not.
- {{data_line}}
- `NOTES.md` per variant, under 300 words, with these headings: `# <Concept name>`,
  `## Philosophy` (the one idea this variant bets on), `## How it stays readable at scale`,
  `## The wow moment`, `## Known limits`. Write for a judge who has not seen the other variants.
- Do not name yourself, your model, or your vendor anywhere in the files. The panel is blind
  and a leak is redacted before judging.
- Leave nothing else at the top level. No scratch files, no build output, no notes outside
  the variant directories.

## The bar

The panel scores each variant 1 to 10 on seven dimensions, equally weighted:

| Dimension | What a 10 looks like |
|---|---|
| wow | the first three seconds make a stranger lean in; ambition in the visual language, not decoration |
| clarity | the whole dataset is present and the screen still reads; density is designed, not endured |
| wayfinding | at every level the user knows where they are, what is above, what is below, how to get back, how to find one thing |
| interaction | motion and feedback carry meaning; hover, focus, select, expand, zoom all answer the user |
| craft | it works on first load, at any window size, with no broken state; performance is felt, not promised |
| concept | the metaphor fits the material and would not be the obvious first idea |
| utility | the owner would open this tomorrow to do the real task: body text is comfortable to read, heavy content has room, the practical path is the short one |

A variant that does not load scores nothing. Half of the ambition delivered beats all of it
promised in a comment.

{{patterns_section}}

## How to work

- You have about {{timeout}} minutes of wall clock. Budget it: the third variant must exist
  and open. Write the notes last, from what you actually built.
- Decide everything yourself; there is no one to ask. Record a consequential decision in the
  variant's `NOTES.md` under `## Known limits`.
- Read `data/SCHEMA.md` first when it exists. Load the real data; a prototype on fake data is
  scored as if it were empty.
- Test what you can without a browser: the file exists, the script parses, the data path
  resolves relative to `index.html`.

When all variants and notes are in place, stop. Your final message is one line per variant:
its concept name and the one sentence that sells it.
