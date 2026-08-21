---
layer: technique
type: technique
subject: engine-pitfall-corpus
technique: known-asset-paths-over-invented-ones
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient]
shared_with: []
use_when: [generated code references resources that do not exist, deciding what identifiers a generator must be handed before it authors anything]
---

# Known identifiers over invented ones

An author asked to reference a resource it does not have does not stop and ask. It
completes: it emits an identifier with the right shape, the right separators and
the right naming convention, entirely fictional. Everything downstream then
behaves well — the code compiles, the reference is correctly typed, the artifact
saves — and resolves to nothing at runtime. This is not a defect to be prompted
away. Completion under a missing fact is what generative authoring *is*, and the
fix is to remove the missing fact.

The cheapest intervention in this whole subject: curate the real set once, and
hand it to the author alongside the pitfalls.

## The record

Each catalogued resource carries:

- **identifier** — the exact string, verbatim, in the form the engine resolves.
  Never a pattern, never a placeholder segment, never an ellipsis. A partially
  real identifier is worse than none: it looks authoritative and still fails.
- **type** — what kind of resource this is, so the author can tell whether it fits
  the slot it is about to fill.
- **description** — one line on what it is *for*, which is what makes selection
  possible when three entries have near-identical names. Include the acquisition
  step where one exists ("no download required — enable the bundled extension"),
  because an identifier the reader cannot obtain is a different kind of dead end.
- **origin** — which package, extension or project area it comes from. This is
  what lets a reader judge whether it will still be there after a dependency
  change, and it is often the thing that explains a lookup failure.
- **domains** — the same soft scope tags the pitfall entries use, so the same
  router serves both.

The instruction that accompanies the block matters as much as the block: state
plainly that these exact identifiers are to be used and that identifiers are not
to be invented. A list presented without that instruction is read as examples.

## Curation

- **Ground-truth every entry against the live system**, once, at the moment it
  enters the catalogue. Anything else is a rumour with a monospace font.
- **Catalogue only what tasks actually need to reference.** The set is a routing
  payload, not an inventory; a full listing of the project is unroutable and
  cannot be kept true.
- **Prefer stable resources.** Something supplied by the platform or a pinned
  dependency has a long shelf life. Something a colleague is actively renaming
  does not belong here yet.
- **Single authority.** These identifiers appear in one catalogue and every
  consumer reads from it. The moment two task families keep their own list, they
  disagree, and the disagreement is invisible until a rename lands on one of them.
  A content task and an engineering task authoring against the same rig must name
  the same string.

## The fallback direction

The router that selects identifiers faces the same unknown-descriptor question as
the pitfall router, and the same asymmetry answers it: **an unrecognised task
should receive the superset, not nothing.** Under-inclusion here does not merely
withhold help — it restores exactly the condition that produces confabulation, and
it does so silently. The tempting design is to default to the empty set on the
grounds that most tasks reference nothing; resist it. Injecting a few dozen lines
of real identifiers into a task that ignores them costs a fraction of one
fabricated reference chased through a build.

Where the set genuinely does not contain what a task needs, the honest resolution
is a declared gap — the author states that the required resource is not in the
catalogue and names it as a dependency to be supplied — never an improvised
identifier. Make that instruction explicit, because the default behaviour under a
gap is invention.

## Verification

An identifier that appears in the catalogue is still only structurally proven.
Two checks are worth automating:

1. **Existence, in the mode the task runs in** — and read the introspection
   technique first, because the obvious existence call is exactly the one that
   returns false negatives for resources supplied by extensions.
2. **Drift** — periodically resolve every catalogued identifier and report the
   ones that no longer load, with their entry. A catalogue that has not been
   revalidated since a platform upgrade is a corpus of plausible-looking fiction
   with better provenance than the model's own.

## When not to use it

Do not catalogue identifiers for resources that generated work should be
*creating* rather than referencing — handing an author a name for a thing it was
asked to produce invites it to reference the old one and skip the work. Do not
catalogue volatile, per-branch or per-developer identifiers; they will be wrong
for most readers most of the time, and one wrong entry costs more trust than ten
right ones earn. And where the platform offers a stable, documented way to
*discover* a resource at run time, prefer discovery to a frozen list — a catalogue
is a workaround for the absence of a reliable lookup, not an improvement on one.
