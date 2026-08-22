---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: checkable-against-the-stored-artifact
stack: process
status: forged
verified_on: 2026-08-20
---

# Lens routing, and the sub-rubric split that followed a confident wrong verdict

## Routing as data, with a stated anti-gaming rule

`src/lib/craft/lens-map.ts:1` in the `pof` ARPG production tool maps eight deliverable
classes (`text-config`, `graph-data`, `ue-runtime`, `2d-art`, `3d-mesh`, `animation`,
`audio`, `vfx-particles`) to ten lens ids, with a completeness test that fails the build
if a class is unmapped. Catalog-level overrides refine the routing — a dialogue catalog's
text goes to the `dialogue` lens, a quest or codex catalog's text to `narrative`, cutscene
audio to `voiceover` rather than `audio` — and the module header states the constraint the
technique names:

> Catalog overrides refine the TEXT-shaped classes only: a dialogue catalog's text is
> gauged by the dialogue lens, not the systems lens — but its 2D icons stay with the
> 2d-art lens. Overrides never apply to media classes, so a lens can never be dodged by
> re-labelling.

`TEXT_CLASSES` is `['text-config', 'graph-data']`, and `lensForStep` only consults the
catalog override sets when the deliverable is in that list. `production-process` is
deliberately unreachable from `lensForStep` — it is a per-catalog lens applied to the
pipeline as a whole, never to a step, which keeps the process instrument out of the craft
instrument.

## Every lens states its evidence base in its own header

Each lens opens by naming what it reads and what it refuses to imagine.
`src/lib/craft/lenses/game-systems-code.md:9`: "Every criterion is checkable against the
text/config artifact stored in the DB (balance tables, specs, state graphs, generated
code), never against a live playtest." `src/lib/craft/lenses/audio.md:11`: checkable
against "a stored audio file plus its spec/metadata (measured LUFS, declared layer
structure, file budgets) — never against a live in-game mixing session."

The animation lens shows what the rule costs and what it buys. Its criteria are written to
be answerable from a stored *filmstrip* — sampled frames at declared intervals — rather
than from playback: the silhouette criterion is "checkable via filmstrip: blacked-out or
squinted frames of the declared key poses should still communicate the action", and one of
its five disqualifiers is "spec claims phases/curves the stored clip does not actually
contain — caps at A1 (fabricated metadata)". That last one is the technique's step-4 rule
in the corpus: absent evidence for a declared bar fails, it does not pass neutrally.

## The incident: a rubric applied to the wrong artifact class

`src/lib/judge/dimensions.ts:15` documents the failure the technique exists to prevent, in
the repo's own words. Four catalogs were routed to a `ui-glyph` sub-rubric whose
cleanliness bar reads "no text, no grid; exactly one glyph". Two steps inside those
catalogs produce multi-element output *by design*, and the judge condemned both for being
exactly what they were asked to be:

- `hud-elements::Wireframe` scored **10/100**, finding: "it is a hairline
  wireframe/annotation diagram … with two callout labels" — labelled callouts being the
  deliverable of a wireframe.
- `input-schemes::Input Glyphs` scored **18/100** for being "a 6x5 contact sheet of ~30
  marks" — a glyph *set* being the deliverable; the step's label is plural.

Neither verdict was wrong about the pixels. Both were answering a question about a
different kind of object.

## The repair, and why its shape matters

Two new sub-rubric classes were added — `ui-sheet` and `ui-diagram` — and the routing
correction was made as `UI_SHEET_STEPS` and `UI_DIAGRAM_STEPS`, sets of explicit
`catalogId::step` pairs at `src/lib/judge/dimensions.ts:34`. The comment states both rules
this application exists to show:

> These are explicit `catalogId::step` pairs, never a pattern: the routing must only
> change for steps whose intent was actually mis-read, so no other step's standing verdict
> moves.

and

> The escape is NOT leniency — both new rubrics keep a cleanliness bar, and it is stricter
> about text than `ui-glyph` can be, because a sheet/diagram that legitimately CARRIES
> text must have that text be real, correctly-spelled words (the same Input Glyphs sheet
> also carried a garbled header reading "NUW HCUOR", which stays a defect under
> `ui-sheet`).

The garbled header is the detail that proves the split was a correction rather than a
capitulation: the same artifact that was wrongly condemned for being a sheet is still
condemned for the thing that was actually wrong with it, under a bar the original rubric
could not express.

## Deviation

The `ui-glyph` sub-rubric was itself introduced this way — the earlier calibration note at
`src/lib/judge/dimensions.ts:11` records that "a clean flat vector glyph is shippable
without painterly rendering, which the generic `2d-art` bar wrongly penalized". The class
list has now split three times under incident pressure. The standard in the technique is
to derive sub-classes from the craft at authoring time, during the pilot, rather than to
discover them from confident wrong verdicts in production.
