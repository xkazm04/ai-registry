---
layer: application
type: application
subject: native-document-format
technique: format-is-the-engines-input
stack: next
verified_on: 2026-10-14
verified_against: next@16.3.3
applied: simulation
ab_verdict: unmeasurable
proof: thought-simulation
---

# One engine fed by its own artifact, two engines with no document to feed

A game-development tool plans procedural levels in a browser wizard whose model
is a private spec of seven inputs. Three downstream engines can turn that spec
into a level, and the tree already handles each one differently, which makes it
a clean place to ask where the technique's rule holds and where its escape
clause applies. The version witness is the tree's own `next` pin, `16.3.3`. No
code was changed: the seam was chosen to falsify "this tool arrived at a private
format by default", and the finding is that it did not.

## Case 1: the replay artifact (policy B already in force)

The grid export writes the wizard's own preview grid as a versioned file whose
field list is the contract the Unreal-side replay script reads
(`src/lib/level-design/procgen-grid-export.ts:105 "export const PROCGEN_GRID_EXPORT_FIELDS = ["`).
A test compares the exported key list with the list the script requires, so a
rename fails the build (`src/__tests__/lib/level-design/procgen-grid-export.test.ts:56 "expect(Object.keys(artifact)).toEqual([...PROCGEN_GRID_EXPORT_FIELDS]);"`).
The script refuses a version it does not know, and the file carries which spec
fields were consumed and which were ignored. The artifact the user saves is the
artifact the consumer reads: there is no second translation step to drift.
Policy A (a private save plus an export translator) would add a stage; the tree
has no such stage for this engine. Prediction under A: a field added to the
editor model but not to the translator would silently vanish, and the pinned
field-list test is exactly what makes that impossible under B. Falsifier: a
rename of an exported field that passes the field-list test.

## Case 2: the dungeon generator (the escape clause)

The in-engine generator takes a room count and a seed. The wizard's spec is
projected onto those two numbers, and the other inputs are listed by name and
value as dropped (`src/lib/level-design/procgen-spec.ts:266 "export function ueDungeonParamsFromSpec(spec: ProcgenSpec): UeDungeonParams {"`).
The technique's rule is to extend the consumer's format, but this consumer has no
document format: its input is two integers. The escape clause says the private
format wins and the translator is honest work, and the tree writes the
translator the honest way: every lossy step is printed and the parity line says
the two engines will not produce the same layout. Policy B is not constructible
here. Prediction: forcing the spec into the generator's input would change
nothing, because there is no region in two integers to be ignorable. Falsifier:
the generator gaining a data-asset input; then the grid artifact of case 1
becomes its natural document and the projection can be retired.

## Case 3: the freehand codegen path

The third engine is a prompt to a language model, and its "format" is whatever
the model writes. The spec rides in the prompt as text. There is no consumer
document to extend and no ignorable region to declare; the technique has no
seam. Policy A and B are the same here.

## Verdict

Held, with no change owed: one engine already satisfies the rule and is pinned
by a test, and two have no consumer format, which is the stated escape. Target
(an editor/consumer divergence class removed) and floor (existing level-design
tests unchanged) were both untouched, so the verdict is `unmeasurable` and not
`better`: nothing moved. The instrument that would make it measurable is one run
of the replay script inside the engine editor, which the tree records as never
observed.

## What this does not establish

It does not show the technique helps a project that is at policy A, because this
tree has none. The only project seam with a private save plus an export step in
this fleet is the other editor in the same tool, whose documents are markdown
read by prompts rather than by an engine, so the rule's trigger ("another
program consumes the artifact") is not met there either.
