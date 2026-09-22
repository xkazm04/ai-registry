# Promotion — carrying a winner into the product without losing it

The contest ends when the owner names a winner. The product does not get the winner then; it gets
a **port** of it, written by someone who looked at the winner and then opened a different codebase.
This file is the step between the two, and it exists because skipping it cost a whole round.

## What went wrong without it (measured, not remembered)

The first promotion of a winner (a document editor, chosen by its owner for *"book wrapping, font
choices, wider width"*) was rebuilt from the product's generic design tokens. Every code gate the
product had passed: typecheck, lint, 24 tests, a 205-rule census, a production build. The owner
opened it and said the quality had *massively degraded*. Measured afterwards against the winner's
computed styles, the port carried **69 deviations across 10 roles**, and **all three** properties
the owner named were among them:

| property the owner chose it for | winner | first port |
|---|---|---|
| book wrapping | a paper surface, a stitched binding edge, a layered shadow, 35/50px padding | none, flat, 0px padding |
| font choices | prose 1rem/1.75, title 1.65rem/700 | prose 0.875rem/1.65, title 1.125rem/600 |
| wider width | a 46rem measure | a `70ch` cap at 14px — 30% narrower |

The author colours were also swapped (law amber → cyan), and a named *interaction* was missing: the
owner had asked for one variant's "row focus on click", and the port selected a whole paragraph
where the winner selected a single bullet. **No gate the product owns looks at a computed style or
drives an interaction.** Nothing in the pipeline could have caught this except a person, and it
cost the owner a review to catch it.

## The procedure

1. **Write the reasons down first, in the owner's words.** Every sentence of the verdict that says
   *why* ("for its book wrapping", "the best row focus on click") becomes one or more **roles**. A
   role the owner did not name is still worth measuring, but the named ones are the pass condition.

2. **Capture the winner's contract.** `roles.json` maps each role to one selector on the winner and
   one on the port, because the two use different markup for the same idea:

   ```json
   { "roles": {
       "page":  { "winner": ".page",       "port": "[data-role=doc-page]" },
       "title": { "winner": ".page-title", "port": "[data-role=doc-title]" },
       "band":  { "winner": ".band-t",     "port": "[data-role=doc-band-title]", "position": true } } }
   ```

   ```
   python <skill>/scripts/style-contract.py capture <winner index.html> roles.json contract.json
   ```

   It records what a reader sees: type (size, weight, line-height, tracking, case, family, colour),
   surface (background, gradient presence, border, radius, shadow presence, padding), rendered
   width, and — for roles marked `"position": true` — where the element sits inside its parent.
   Give the port **stable `data-role` hooks** as you build it; the contract names them.

3. **Build a harness, not a guess.** Render the *real* product component, with the product's *real*
   stylesheet and the contest's *real* data, outside the product shell — served by the product's
   own dev server from a git-ignored folder, so the product's CSS pipeline (utility scanning,
   themes, tokens) is the one being measured. This is only possible if the promoted component takes
   its data and words as props; **design the promotion as a primitive** partly so it can be
   harnessed.

4. **Port the styling in the form the winner expressed it.** If the winner's look is pseudo-elements,
   layered gradients and `color-mix()`, port a stylesheet. Approximating it with the nearest design
   tokens is exactly how the first port lost everything. Route colours through the product's
   tokens so every theme repaints it, and **add the theme overrides the prototype never needed**
   (a dark-only winner still has to work in the product's light themes).

5. **Check until zero.**

   ```
   python <skill>/scripts/style-contract.py check <harness url> roles.json contract.json
   ```

   Every deviation is either **real** (fix the port) or **structural** (the winner's `<p>` *is* the
   clickable block while the port wraps it: fix the *selector* so both sides name the equivalent
   element, and say so). Never widen a tolerance to pass. The instrument exits non-zero on drift.

   **When the owner reviews the port and asks for a change the winner did not have** ("the rail
   titles more dominant", "a wider column on large screens"), record it as an owner-accepted
   override (`"accept": ["fontSize", "color"]` on that role) rather than re-capturing the
   contract. The contract stays the winner; every run lists the accepted departures by property,
   so the review that moved the design stays visible. A breakpoint the owner added is checked by
   running below it (`--width`) against the winner, and above it by a scripted drive.

6. **Drive every named interaction in a browser.** A still frame cannot tell a selected row from a
   row with a caret in it, and the panel scores code, not behaviour. For each borrowing the owner
   named that is an interaction, script it — click, key, result — and assert on the product's own
   output (what the save writes, not what the page shows). Assert that nothing the operator did not
   touch changed.

7. **Look.** `side-by-side.py` takes the winner and the harness at one viewport, at load and after one
   named interaction. The contract proves the numbers; the frames are for the part a number misses.

8. **Check in the live product.** The product's containers impose widths the harness does not — a
   manifest that sat in a 1,400px harness ran in a 597px panel in the app. Read structure and widths
   through the product's automation bridge where it has one. A viewport breakpoint the prototype
   used is often the wrong signal once the component lives in panels of every width: prefer a
   **container query** for layout decisions (show the side rail when the *surface* has room).

9. **When the owner points at an existing product surface as the reference** ("take the style from
   this screen"), extract it into shared components **and migrate that surface onto them**, then
   prove the migration with the same instrument: capture the old render as the contract, check the
   new render against it. Zero deviations is what licenses calling it an extraction.

## Things the instrument has already caught once

- **Framework defaults are not this product's defaults.** One product re-pointed `--radius-xl` to
  16px and `--radius-lg` to 12px, so "the semantic radius that equals `rounded-xl`" was 4px off.
  Measure radii; do not map them from memory of Tailwind.
- **The product's root font size is a user setting.** Compare at the root the winner was judged at
  (a plain browser, 16px), then confirm the port scales in `rem`.
- **Chrome line-height.** The winner's page set none (`normal`); the product's preflight sets 1.5,
  so every tab and closed row was taller.
- **Layout position is not a computed style.** A `<button>` centres its content; a flex column pins
  it to the bottom. Only the `position` probe saw it.
- **Interaction granularity is a design property.** Read the winner's *markup* for what a click
  targets (`<li data-block>` per bullet) — the screenshot does not say.
- **Git, when the product commits through an isolated index:** the shared index is left one commit
  behind, and against the new HEAD it reads as *delete everything you just committed*. Resync your
  own paths (`git reset -q -- <paths>`) immediately after, before any other session commits.
- **The harness must scroll the way the product does.** The app locks `body { overflow: hidden }`
  and scrolls inside panels, so a harness page served with the product's stylesheet could not scroll
  at all, and a scroll-driven behaviour's first drive "passed" vacuously (40 wheel events, scrollY
  0). Give the harness root a panel scroller, and have scroll logic find its scroll parent rather
  than assume the window.
