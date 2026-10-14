---
layer: application
type: application
subject: depth-ordered-layered-art
technique: measured-draw-order
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@20.10
---

# Node: a geometry audit that measures draw order and refuses stand-in shapes

The tree is the isometric-figure toolkit at github.com/wheresryan22/anatomy, read at commit
e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f. The version witness is its README, which states the
supported runtime as "Node 20.10 or later" (anchored below) and has no package manifest: the kit
uses only Node's built-in modules. Every figure is a build script that writes standalone pages;
`kit/audit.mjs` is the geometry audit the build can end with. This document covers the order
solver and the coverage check, which are the two halves of the first and fourth techniques, and
says what the audit cannot see.

## The order is measured, then solved

`overlapsOf` (anchored below) rasterises each item's recorded shapes, finds item pairs whose
screen footprints intersect, and measures which surface is nearer over the overlap, per state.
Items with no recorded shapes are filtered out before any of that
(`item.shapes && item.shapes.length`, line 609). The result is pairs with a front-area per
side, not a centre distance.

`orderKeys` (anchored below) turns the pairs into rules. A pair where both sides are in
front over at least the threshold area is not a rule: it is pushed to the `cycles` list and
skipped (anchored below, `cycles.push(pair);`). Every other pair gives one rule with a weight
(the winning area) and a `need` that includes the motion lift of both items. The loop at lines
685 to 722 raises a key only as far as a rule requires, walks back from the last item that moved
to find the loop when it does not settle, and drops the rule with the least weight in that loop,
recording it in `dropped`. The return value (line 723) keeps three results apart: `rules`
count, `cycles`, `dropped`. A dropped rule and a cycle are different findings and the audit's
fix table separates them: a leftover wrong pair means "a rule was dropped from a loop, so look
for the interlocked pair in that loop", and a cycle means "change the geometry"
 (anchored below).

The reference page states the doctrine in one bullet: "Dense figures settle their keys from
geometry." (anchored below). It gives the case it was built for, "The first Raptor's
hand-set keys left 190 pairs drawn the wrong way round assembled and 133 apart; measured keys
took both to zero." The mirror bullet records why not to tune by eye: the hand-set keys "looked
right at 1x and had 323 depth-order problems" (anchored below).

## The audit's own documented run, as documented in the source

These figures are the toolkit's own and were not re-run for this document. The sample output in
the reference shows the audit's closing lines for its largest example: `depth order: 0 problems`,
`through in mid-flight: 0 pairs`, `stand-in shapes: 0 items whose recorded shape covers too
little of what it draws`, and a summary of "478 items", "1119 depth states", "4292 order rules"
 (anchored below). The same page says the audit "prints `audit passed` or `audit
failed: n problems` and exits non-zero on any failure" and counts every line except two lists
meant to be read, `in passing` and `free ends apart` (anchored below). The 1119 states
are explained in the motion reference: replayed spring frames, reversals either side of every
stagger boundary and the prefix states (anchored below). That is the second
technique's territory and is only cited here.

## What the coverage check settles, and what it cannot

The coverage check, anchored below at its definition, is the toolkit's answer to the stand-in problem. Its
signature, `export function coverage(items, P, { least = 0.6, pad = 1, allow = [] } = {})`,
carries the three decisions a reader needs: the 0.6 threshold, a pad of one drawing unit on both
boxes, and an `allow` excuse list matched by name. The measure is
`areaOf(meetBox(grow(drawn), grow(shapes))) / areaOf(grow(drawn))` (line 1568): the area of the
intersection of two boxes over the drawn box. `if (share < least) out.push` (line 1569)
collects failures, sorted worst first.

Two properties of that code are limits and are written down here, not smoothed over. Both were
checked on 2026-10-14 by the director with a synthetic probe over this function, not by this
document's reading of it.

1. **The threshold is a share of box area, not a measure of shape fidelity.** A slab drawn in
   full with its true shape recorded passed. The same drawing with a 2 x 2 x 1 box recorded
   failed, at a share of 0.002. Recorded shapes scaled to 0.7 of each dimension failed, at a
   share of 0.515, and scaled to 0.8 they passed. A shape undersized by about a fifth on each
   axis therefore passes this check. It catches a stand-in; it does not catch an inaccurate
   shape.
2. **An item whose shapes list is empty is skipped by this check.** The loop's guard at line
   1563 includes `!item.shapes || !item.shapes.length`. The case is not lost: a separate report
   line, `items with no shape` (anchored below), counts them and the audit treats it as a
   failure. Coverage alone would pass a drawing that recorded nothing.

The toolkit's own record of why the check exists is in the craft reference: "Stand-in shapes."
 (anchored below) is the bullet that tells the story of a builder who recorded a thin disc
at the tip of each of five overlapping rod copies and a sliver for a sunk rod, so that "The
audit passed and said nothing about either rod". It states the repair, "Record the true shape of
what you draw; the audit's stand-in check fails an item whose recorded shapes cover less than
60% of its drawing." The fix table says to excuse an item only "when its drawing really reaches
past its body, and only after looking at it" (anchored below).

## Deviations kept as deviations

- **The audit is the gate and the author of the record is the same person.** The coverage check
  narrows this but, per the probe above, a record at 80% scale per axis is accepted. The
  standard stays: the order measurement is evidence about the recorded shapes, and the close-up
  look is the step that catches an inaccurate record.
- **The closing sentence of the audit section is the toolkit's own statement of its limit.**
  "A zero audit is necessary, not sufficient: it can't see a seam, a staircase or a texture that
  stops, and it only checks what you recorded." (anchored below). That sentence is the
  reason the line-end check exists; see the second application.
- **The documented audit run reproduces.** Run on 2026-10-14 against the pinned commit, the
  toolkit's audit command on its largest example ended `audit passed` with every failing line at 0
  and `free ends apart` at 35, and the summary line read 478 items, 1119 depth states, 4292 order
  rules and 1707703 overlaps (the reference page documents 1707702; the commit has moved by one
  overlap since the page was written). It took 318.5 s on this machine against the documented
  151.9 s. The page the build writes carries the same 478 sort keys as the committed page, to two
  decimals.

## The audit settles for you, so it cannot see a missing settle

A falsifier chosen because it could have refuted the technique's value: remove the one call in
the build that settles the keys (anchored below, `A.settle(R, P);` in the build script), leave
everything else, and see what the audit says. Run on 2026-10-14, both arms on the same commit.

- **The audit still passes.** `depth order: 0 problems`, `audit passed`, exit 0, with the settle
  call gone. The cause is one line: the audit reads `R.settled ?? settle(R, P)` (anchored
  below), so when the build did not settle, the audit settles first, and `settle` writes the
  solved keys onto the items (anchored below, `item.key = solved.keys[index]`). What it then
  checks is its own solution.
- **The page written before the audit is not that solution.** Without the call, 271 of the 478
  keys the build writes into the page differ from the settled build's, by up to 3.86 units. The
  audit runs after the page is written (the audit call is the last line of the build), so it
  never sees the keys the page carries.
- **Measured directly, those keys are wrong.** A depth-order check on the keys the build had
  before settling, over the same 1119 states, found 18549 wrong-order entries (one entry per pair
  per state, so many entries share a pair), 35 of them at rest or apart, and no interlocks. The
  settled keys have 0. This is a measured A and B on the source: target, wrong-order entries,
  35 at rest and 18549 over all states down to 0; floor, the audit's other lines, unchanged at 0.

The reading for a reader of the technique: the audit proves the order is achievable, and the
settled build proves it was achieved. Only the second is a statement about the page. The two
come apart exactly when the settle step is missing, forgotten or ordered after the page is
serialised. A gate that repairs its input before checking it cannot fail on the absence of the
repair.

## Anchors

Root-relative, at the pinned commit.

- kit/audit.mjs:607 "export function overlapsOf(items, P"
- kit/audit.mjs:609 "item.shapes && item.shapes.length"
- kit/audit.mjs:657 "export function orderKeys(items, overlaps"
- kit/audit.mjs:666 "cycles.push(pair);"
- kit/audit.mjs:723 "return { keys, rules: rules.length, cycles, dropped };"
- kit/audit.mjs:1559 "export function coverage(items, P, { least = 0.6"
- kit/audit.mjs:1563 "!item.shapes || !item.shapes.length || matches(allow, item.name)"
- kit/audit.mjs:1568 "areaOf(meetBox(grow(drawn), grow(shapes)))"
- kit/audit.mjs:1569 "if (share < least) out.push"
- kit/audit.mjs:1803 "items with no shape:"
- kit/audit.mjs:1874 "item.key = solved.keys[index]"
- kit/audit.mjs:1882 "R.settled ?? settle(R, P)"
- examples/raptor-engine/build.mjs:879 "A.settle(R, P);"
- examples/raptor-engine/build.mjs:883 "data-k="
- references/craft.md:45 "Stand-in shapes."
- references/craft.md:47 "had 323 depth-order problems"
- references/verify.md:111 "exits non-zero on any failure"
- references/verify.md:129 "so the audit checks a sliver"
- references/verify.md:132 "a rule was dropped from a loop"
- references/verify.md:133 "each in front of the other somewhere"
- references/motion.md:122 "Settle the static keys from the motion"
- README.md:9 "Node 20.10 or later"
