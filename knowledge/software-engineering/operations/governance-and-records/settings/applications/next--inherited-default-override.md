---
layer: application
type: application
subject: settings
technique: inherited-default-override
stack: next
status: forged
verified_on: 2026-08-31
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# The inherited default resolved where its source is invisible

A connected project serves an embeddable widget rendered by a server route. Its
configuration arrives as request parameters and carries a four-value appearance
setting — two explicit values, a custom-palette value, and an `auto` value whose
documented meaning is *follow the viewer*. That is an inherited default in the
technique's exact sense: absent-of-a-choice is a subscription to a source the
application does not own.

The route resolves it server-side. Two independent call sites — the request
handler and a shared theme resolver used elsewhere — reduce `auto` to the dark
preset before any markup is emitted. One of them carries the confession in a
comment: *default to dark for auto (could check prefers-color-scheme on
client)*. Somebody saw the whole problem, wrote it down, and shipped the
constant.

## Why this is the technique's failure and not a defaulting choice

The distinction matters, because "pick a default for an unresolvable setting" is
ordinarily fine. It is not fine here, and the reason is the one the technique
names: **the resolution ran at a point that could not see the source.** A server
rendering a widget for an unknown future viewer has no access to that viewer's
environment. Resolving `auto` there does not choose a default; it **erases the
subscription**, converting "follow the viewer" into "dark, for everyone,
forever" — [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
at the boundary where an optional meets a non-optional, exactly as that law
predicts.

The repair the technique implies is not a different constant. It is to **decline
to resolve**: emit the derivation rather than its result, and let it be computed
where its inputs exist. The route already emits an inline style block, so this
costs no new mechanism.

## The paired comparison

The change shipped, so both arms are real code rather than transcriptions: arm A
is the resolution function recovered from the commit before the change, arm B is
the one now in the tree, each extracted from its own revision of the source file
and executed. The measurable is the one the setting exists to serve: **does a
viewer receive the palette their environment asks for?**

The harness asserted itself before reporting — the two explicit appearance
values must render identically in both arms (they do, byte for byte), and an
explicitly pinned value must not move when the viewer's preference changes (it
does not). Both assertions are regression checks as much as instrument checks:
had either failed, the change would have been a regression and the numbers below
meaningless.

| Viewer environment | Arm A | Arm B |
| --- | --- | --- |
| prefers light | dark palette — **wrong** | light palette — correct |
| prefers dark | dark palette — correct | dark palette — correct |
| **served correctly** | **1 / 2** | **2 / 2** |

n=2 environments × 1 configuration, both arms on the same instrument. Arm A is
not wrong at random: it is correct for exactly the half of the audience whose
preference happens to match the hardcoded constant, which is why a defect like
this survives review by anyone whose own environment is dark.

## The structural fact

The tree confirms the technique from a direction nobody designed. The
configuration's *model* is right — four states, including a distinct value
meaning "follow the source" — so the vocabulary never lost the subscription. It
was lost at the **resolution point**, twice, in two files, by two different
paths, and the second one documented the gap in a comment rather than closing
it. The setting's shape and the setting's semantics were maintained by different
hands, and only the shape survived the trip to the renderer.

That is evidence for the technique's central claim in its strongest available
form: preserving the three-state *model* is not the hard part and does not
protect anything on its own. The rule has to bind at the point of resolution,
because that is the only place the subscription can be spent.

## What shipped, and the seam that deliberately did not

The repair is small because the palette already travels as custom properties:
`auto` now emits the light palette as the base and a viewer-preference block
that redefines the same six properties. No new mechanism, one file. The
project's type-check carried the same 29 pre-existing errors before and after
the change with none in this file, and its linter is clean on it.

One of the two resolution points was **deliberately left broken**, and the
reason is worth recording because it is a boundary the technique implies but
does not state. The shared theme resolver carries the identical defect, and
changing it the same way would be a regression rather than a fix: its consumers
render a single resolved palette with no viewer-preference block, so returning
the light preset there would make them light-only. **Deferring a resolution is
only correct if the consumer can perform it.** A resolution point may hand the
derivation onward only when something downstream can see the inputs; where it
cannot, the honest sequence is to change the consumers first. One seam repaired
on that test, one seam failing it and left alone.

## What this realization cannot do

The repair moves resolution to the viewer, which means the emitted document
carries both palettes and grows by one palette's worth of declarations. Where an
embed is size-budgeted, that is a real cost and the technique does not price it.
It also cannot help a consumer that renders the widget into a context with no
environment preference to read at all; there, `auto` genuinely has no source,
and the honest move is for the embedding surface to pass an explicit value
rather than for the renderer to invent one.
