---
layer: technique
type: technique
subject: knowledge-registry
technique: consumer-overlays
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
---

# Consumer overlays

The first tool to read a registry writes its configuration as though it were the
repository's own definition — mode, policies, telemetry destination, owners — and
at the time that is not wrong, because there is no difference between *what the
repository is* and *how the only consumer treats it*.

The second consumer creates the difference, and it arrives as a question with no
good answer inside the existing file: is `mode` a property of the repository, or
of how one tool indexes it? Both readings are defensible, which is the signal
that two facts are sharing one field.

## The resolution is separation, not negotiation

Do not merge the two tools' needs into one schema, and do not fork the file. Split
it by *whose fact it is*:

- **A neutral declaration at the root** — what the repository IS: its lanes,
  their specifications, their gates, the guarantees a reader may assume.
- **A per-consumer overlay beside it** — how ONE consumer treats it: indexing
  mode, telemetry destination, its own policy vocabulary, its own owners.

Neither rewrites the other. A reader that knows only one of them still works. A
third consumer costs one file rather than a schema negotiation with the first
two.

## Why not just rename the first consumer's file

Because the first consumer is deployed and reading it. Renaming is a coordinated
change across repositories owned by different people; adding a neutral file
beside it is not. The overlay keeps its name and its contents; what changes is
that it stops being read as the repository's self-description — a change in
meaning that costs nothing at the byte level and is worth stating explicitly in
both files, so the next reader does not re-derive it.

## What goes in which

The test is the same one that separates shared from local knowledge: **would this
still be true for a consumer that has never existed?**

| Root declaration | Consumer overlay |
| --- | --- |
| Which lanes exist, and where | Which lanes this consumer indexes |
| Which document specifies a lane | This consumer's role per lane — reader, writer |
| Which check gates a lane | This consumer's policies and vocabularies |
| Guarantees about content | Where this consumer sends its telemetry |
| Who owns merges | This consumer's notion of ownership |

A field that describes a *relationship* between one tool and the registry is an
overlay field, even when it looks universal.

## Declare the role, especially "reader"

The most useful thing an overlay can state is what its consumer does NOT do. A
consumer that only indexes a lane should say so, because the alternative — silence
— reads as unknown, and the next person wiring up a write path has no way to tell
whether they would be adding a second writer to something that already has one.

Keep the declaration consistent with the rest of the file. If an overlay declares
itself a reader of a lane, a neighbouring field asserting that it publishes into
that lane is a contradiction one line apart, and the two will be believed by
different readers.

## Keep the scaffolder and the reference in step

If the registry can be created by a tool, that tool writes an initial copy of both
files — and it is easy to update the reference registry by hand while leaving the
generator emitting the old shape. Every registry created afterwards then ships an
overlay that never mentions the newest lane, and nobody notices because the
reference copy is the one people read.

Round-trip the pair: generate, parse, compare. It is a small test and it is the
only thing standing between a hand-edited reference and a generator that has
quietly diverged from it.

## Parse conservatively

An overlay is read by code that may be older than the file. Two rules keep that
safe:

- **Drop what you do not recognize; never coerce it.** Reading an unknown role as
  the nearest known one can invert the single fact the field exists to state.
- **Absence must mean something defensible.** When a field is missing, fall back
  to what the consumer actually does, not to a permissive default — an old
  overlay should describe its consumer truthfully, not optimistically.
