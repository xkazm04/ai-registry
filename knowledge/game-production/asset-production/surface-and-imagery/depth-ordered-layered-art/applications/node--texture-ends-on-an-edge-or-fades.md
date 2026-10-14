---
layer: application
type: application
subject: depth-ordered-layered-art
technique: texture-ends-on-an-edge-or-fades
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@20.10
---

# Node: a line-end check that drives a headless browser and prints every floating end

The tree is the isometric-figure toolkit at github.com/wheresryan22/anatomy, read at commit
e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f. The version witness is its README, "Node 20.10 or
later" (anchored below); there is no package manifest. The line-end check is the second instrument
of the pair: the geometry audit never reads markup, and this check never reads geometry.

## The predicate, as a rule and as code

The reference states the rule in one paragraph. Every open subpath of every texture line "must
end within 1 viewBox px of another stroke, a dot or an outline, or under a fill painted after
it" (anchored below). A short straight mark, up to 7 px, needs one end rooted within 2
px, and both ends floating fails. The kit's own outlines, creases, bevels and tube edges are not
checked, and neither are ends a fade ramp ends. An end that is meant to stop is marked free with
`lineSvg(d, { free: true })`, or `"start"` or `"end"`, and the reference says to "use it for
nothing else".

The code carries the same numbers as defaults in one function signature:
`function lineEnds({ select = null, tolerance = 1, root: rootSlack = 2, mark = 7, least = 0.3,
cover = 0.5, show = false } = {})` (anchored below). Tolerance 1 is the "within 1"; root
2 is the rooted-end slack of the short mark; mark 7 is the tick length. The classes the check
skips are listed as a literal, `["iso-edge", "iso-bevel", "iso-crease", "tb-edge"]`
 (anchored below), which are the kit's own edges. The wrapper that launches it
 (anchored below) repeats the rule in its own usage text and ends: "Exits 1 if any
end floats; --out writes the card with each one ringed."

## What it prints

The documented output is a count and a row per floating end, in card pixels, with the start of
its path so it can be found in the build (anchored below): `line ends: 3 of 1148
ends on 295 lines float`, then each offender with its class, its distance from anything, its
position, its length and `d`. The first number pair, ends floating of ends examined on lines
examined, is the instrument stating the size of what it looked at beside its verdict. The
reference says to run it on both themes and in every pose the figure rests in, and to fix every
line until it prints 0.

## The fix table and the owner's quote

The table in references/verify.md (lines 77 to 85) is the technique's fix table nearly verbatim:
a seam inset from a box's corners wraps the corners with a purpose-built seam helper; ribs end
on their seams; ticks hang from a ruler strip; vents are closed slots; a line that runs under a
part is drawn before the part, full length; rule lines on a label plate are free. The
craft reference records where the rule came from. Bullet "Textures that stop" quotes the owner,
who zoomed in on a figure and found rows of dots that stopped dead mid-surface: "we'd rather
fade them out at the end than an instant stop" (anchored below). A later bullet says the
same fault "came back on a later figure's boxes, where no curved-surface rule reached it"
 (anchored below): a weld seam inset 6 units from each rounded corner, a manifold face
line inset 4, ticks floating on a bare bedplate with no ruler under them, ribs that stopped 2
units short of their seams. The point of the second bullet is that a rule written for curved
surfaces did not transfer to flat ones until a check enforced it.

## The two instruments, and what each states it cannot see

The geometry audit's own text says what it cannot: "A zero audit is necessary, not sufficient: it
can't see a seam, a staircase or a texture that stops, and it only checks what you recorded. A
stand-in shape that silences it is a bug, which is why it fails one. Run the line check, then
look." (anchored below). The line check's header names the other half: it "checks the
drawing itself" and says in its first sentence that the audit "sees recorded shapes, never line
markup" (anchored below). A report that quotes one zero must say which domain that zero
covers. The documented sequence ends with a person: run the audit, run the line check on both
themes, look at close-ups.

## Boundaries of this check

- **A free mark is a statement, not a pass.** The audit prints its free ends in a separate
  "not failing" list (anchored below, `free ends apart (marked free, not failing)`),
  so the choices remain visible.
- **The check runs in a browser.** Its driver is `scripts/drive.mjs` over headless Chrome, which
  `scripts/lines.mjs` spawns. It is a Node program that needs an installed browser, so unlike
  the geometry audit it is not dependency-free, and a run where the browser cannot start is an
  unmeasured result, not a clean one.
- **It was not re-run for this document.** The anchors above resolve the code and the
  documented output; no run of the line check is reported here.

## Anchors

Root-relative, at the pinned commit.

- README.md:9 "Node 20.10 or later"
- references/verify.md:64 "The audit sees recorded shapes, never line markup"
- references/verify.md:72 "line ends: 3 of 1148 ends on 295 lines float"
- references/verify.md:107 "free ends apart (marked free, not failing)"
- references/craft.md:42 "Textures that stop."
- references/craft.md:44 "where no curved-surface rule reached it"
- scripts/line-ends.mjs:1 "function lineEnds({ select = null, tolerance = 1, root: rootSlack = 2, mark = 7"
- scripts/line-ends.mjs:8 "iso-bevel"
- scripts/lines.mjs:15 "Exits 1 if any end floats"
- scripts/lines.mjs:30 "drive.mjs"
