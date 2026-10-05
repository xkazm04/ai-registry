# Medium package: The Token Tax

Paste-ready copy of `../post.md` for the Medium editor. Nothing here is sent to Medium; publishing is a human act.

1. Render the figure PNGs first (below): `story.html` names them, but they are not stored in the registry.
2. Open `story.html` in a desktop browser (it has no scripts and fetches nothing).
3. Select all, copy, and paste into a new Medium story. The first line becomes the title; set the italic line under it as the subtitle.
4. Medium does not keep pasted local images. For each figure, place the cursor on its caption and upload the matching PNG from `figures/` (`01-` to `12-`, in reading order), then move the caption under the image.
5. Code blocks arrive as plain code blocks: Medium has no syntax highlighting, so check that both Python blocks kept their indentation.
6. Citations stay as `[n]` and resolve to the numbered Sources list at the end of the story.
7. Add the tags from `tags.txt` (five, the Medium maximum).
8. Before publishing, compare the draft against `../post.html` (the reference rendering, with the interactive token viewer for Figure 4).

## The figure PNGs

The registry is text-only. Each figure is canonical as `../figures/NN-<name>.svg`; the PNG Medium needs is a derived render of it, regenerated when needed and never committed. `story.html` refers to each one by name as `figures/NN-<name>.png`, so the renders go in a `figures/` folder beside `story.html`, under the SVG's name with `.png` in place of `.svg`.

Render each SVG to PNG at 2x with any headless browser. Every SVG here is 1000 px wide and carries its own height on its root `<svg>` element; open it at that size with a device scale factor of 2 and screenshot it, which yields a 2000 px wide PNG. With Chrome, Chromium or Edge, from this directory:

```sh
mkdir -p figures
chrome --headless --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1000,412 \
  --screenshot=figures/01-one-word-four-vocabularies.png \
  ../figures/01-one-word-four-vocabularies.svg
```

Repeat for `02-` to `12-`, taking the height from each SVG's `height` attribute. The same works from Playwright or Puppeteer: a 1000-wide viewport at the SVG's height, `deviceScaleFactor: 2`, then a screenshot. Check the twelve renders against the SVGs before pasting, then delete them or leave them untracked.
