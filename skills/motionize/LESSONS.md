# Lessons - motionize

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.1.0 - 2026-09-04 - ai-registry

- **The writer agreement had already broken, and nothing said so.** `emit-glyph.mjs` carries a comment recording that its output shape and `trace-set.mjs`'s once disagreed - the fix was to emit one `TracedGlyph` object instead of a bare array plus a separate `_VIEWBOX` const. `trace-set.mjs` was never updated: it still scraped `/_TMP_VIEWBOX = "([^"]+)"/` out of the emitted module, so `.exec(ts)` returned `null` and every set trace threw a TypeError on `[1]`. A comment that records a fix is not a test that keeps it.
- **The test reads the contract out of the other file rather than restating it.** Copying trace-set's two regexes into the test would have produced a test that agrees with itself while the tool disagrees. Extracting the literals from `trace-set.mjs` source means a scraper that changes is a test that fails - which is what a contract between two writers needs, given neither can import the other (trace-set pulls the vectorizer and svgo; the test tier must run with nothing installed).
- **`import.meta.url === \`file://${process.argv[1]}\`` is false on Windows, always.** A drive path is not a URL path, so the CLI guard never fired there, and the fallback bolted on to compensate - `process.argv[1]?.endsWith("emit-glyph.mjs")` - matches ANY entry point whose name ends in that string. `tests/test_emit-glyph.mjs` does. Importing the pure core ran the CLI, printed a usage line and exited before a single assertion. `pathToFileURL(process.argv[1]).href` compares the two the way the runtime does, on every platform, with no substring guess.
- **What the tests pin is the judgment, not the parse.** Three decisions in `svgToGlyphData` a reader would otherwise re-derive from comments: demote by COLOUR and never by geometry (a full-canvas rect is sometimes the line-work, and demoting on geometry erases every outline in that class of art); surface regions are recolored to `var(--background)` and never dropped (the stacked output needs them to paint over accents and carve the line gaps); paint order is preserved, `delay` drives timing only.

## 1.2.1 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 1.3.1 - 2026-09-22 - personas (council unpaired glyph)

- **An accent that touches same-tone line-work fuses into it.** A small filled teal star sitting on a navy ring came out of the tracer as one navy path at `--color-precision 3` (the setting that kept a dashed orbit to one hex per dash), and at precision 4 the dashes fanned out into twenty near-identical violets instead. Neither setting gives both. Prompt the accent away from line-work (a gap between the star and the ring), or accept the trace and hand-author the accent path afterwards, which is what this run did: a ten-point star appended last with `delay: 1`, so it is also the last thing to draw.
- **Normalise fills to the ART_STYLE accents in the emitted module.** VTracer averages anti-aliased edges into a distinct hex per region; a dashed line yields one hex per dash. Mapping near-violets to one violet and near-navies to one navy before commit is what makes the renderer's light-theme override a short table instead of a list of twenty-five.
