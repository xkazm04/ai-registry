---
layer: technique
type: technique
subject: generated-asset-world-scale
technique: unit-convention-at-the-engine-edge
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [wiring an import path between an interchange format and an engine, an asset came in a hundred times too large or lying on its side, someone added a magic constant next to an import call]
---

# Unit convention at the engine edge

## The concern

Interchange formats and real-time engines disagree about two things at once, and both
disagreements produce an asset that looks *plausible* and is wrong by a fixed factor.

- **Unit.** One family of formats declares its unit as the metre. Another family is
  conventionally authored in centimetres, and some engines use centimetres as their world
  unit. A two-metre character crossing the wrong boundary becomes two hundred units tall
  or two hundredths of one.
- **Axis.** Formats and engines differ on which axis is up and which is forward, and on
  handedness. A wrong up-axis lays the asset on its side; a wrong forward-axis makes every
  character face the wrong way, which is discovered much later, in an animation.

Both errors are *round*. That is what makes them tractable — a factor of a hundred is a
unit bug, an arbitrary factor is a size bug — and it is also what makes them survive: a
hundredfold error is so obvious that someone compensates for it locally, and the
compensation then hides the next one.

## Procedure

1. **Write down the convention of every participant** — each interchange format the
   pipeline reads or writes, each engine it targets, each modelling package in the loop:
   unit, up-axis, forward-axis, handedness. Four facts each. This table is short, and
   almost nobody has it.
2. **Implement the conversion as one named edge per direction.** A function whose name
   says what it converts between, not a constant multiplied in at a call site. There should
   be exactly one place in the codebase that knows the number.
3. **Test the edge with a known object.** Author a cube of a stated size, push it through
   the edge, and assert the size and orientation that come out. This is the cheapest test
   in the pipeline and it catches every regression in it.
4. **Extend the round trip to a representative asset and a kit piece.** A cube proves the
   arithmetic; a real asset proves the exporter settings, which is where the drift
   actually lives.
5. **Keep unit conversion and size correction as separate factors** all the way through,
   even where they end up multiplied together. They have different sources — one is a
   property of the boundary, one is a property of the asset — and merging them makes both
   undiagnosable.

## Decision rules

- **When output arrives in the correct unit but the wrong size, do not touch the unit
  conversion.** This is the common case for generative output: the declared unit is right,
  the number is meaningless. Applying a unit correction on top of a correct unit produces
  a hundredfold error and a team-wide compensating constant.
- **When a factor of exactly a hundred appears anywhere near an import path, treat it as a
  diagnosis, not a fix.** Something is being converted twice or not at all.
- **When two import paths disagree, the second one is wrong, not "different".** One
  authority per boundary; a second path that works by having its own constant will drift.
- **When an exporter offers a unit-application option, decide once and write it into the
  export preset**, so the convention is not a per-artist habit.
- **When axis and unit are both suspect, fix axis first.** Orientation errors change which
  axis is the longest extent, so a size measurement taken before the axis is settled may be
  measuring the wrong dimension entirely.

## Why the constant must not be sprinkled

The characteristic decay is this: someone writes the factor inline at an import call
because it is one number. A second import path appears and copies it. A third path is
written by someone who read the format docs and does the conversion the other way, and
compensates with a second constant to make the result look right. Now three call sites
encode two mutually inconsistent theories of the boundary and nothing in the system can
say which is correct — the disagreement is invisible until an asset crosses two paths.

An explicit, tested edge collapses that to one number with one test and one owner. The
cost is a function; the saving is every future argument about which pipeline is right.

## When not to use it

- **Inside a single-format, single-engine pipeline with no modelling package in the
  loop.** There is no boundary to convert at; adding an edge invents a degree of freedom.
- **For per-asset scale correction.** That is a different quantity with a different source
  (see import-scale-derivation) and it does not belong in the boundary edge, however
  tempting it is to fold them.
- **As a place to correct a badly authored asset.** An asset exported at the wrong size
  should be re-exported. Absorbing its error into the shared boundary makes every other
  asset wrong.
