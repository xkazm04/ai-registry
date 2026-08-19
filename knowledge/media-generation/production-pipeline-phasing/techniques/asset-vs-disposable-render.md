---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: asset-vs-disposable-render
status: forged
laws: [cost-per-usable-output, edit-do-not-regenerate]
shared_with: []
use_when: [deciding what pipeline output to persist, choosing render fidelity for trials versus finals, designing deletion for projects that own generated media]
---

# Asset vs disposable render

Everything a generation pipeline produces is one of two things: a **durable
asset** — pipeline memory, anchored by a human decision — or a **disposable
render** — machine output that exists to be judged and then discarded. The
classification decides storage, fidelity, deletion, and rework policy, and
misclassifying in either direction is expensive: hoarded disposables consume
quota and attention forever; regenerated assets silently void every review
computed against them.

## The classification rule

**An artifact becomes an asset at the moment of human commitment, and not
before.** The approved script version, the picked frame, the locked style
contract, the research notebook with its graded facts, the cut's edit
decisions — assets. The nine candidate images the pick was made from, the
draft narration takes, the trial renders at probe fidelity — disposables,
including the eight losers of a comparison the instant the winner is chosen.

Useful discriminating questions, in order of strength:

1. **Did a person decide something about it?** Selection, approval, an edit
   note — any of these mints an asset. Machine confidence scores do not.
2. **Would regenerating it void a review?** If yes, it is an asset under
   [edit-do-not-regenerate](../../_laws.md#edit-do-not-regenerate): answer
   feedback with the smallest edit, never a fresh generation, because a
   regenerated artifact invalidates every gate verdict computed against the
   version it replaced — even when it is "better".
3. **Is it cheaper to remake than to keep?** Disposables usually are; the
   cost of remaking includes the prompt and settings, so a disposable's
   *recipe* may itself be a small asset even when its pixels are not.

## Fidelity follows classification

Disposables are probes; probes are rendered at the lowest fidelity that
still supports the judgment being made — a fraction of final resolution for
visual comparison, a short excerpt for a voice audition. Only the promoted
winner is re-rendered at delivery quality. This is the practical arm of
[cost-per-usable-output](../../_laws.md#cost-per-usable-output): the
denominator is usable outputs, and trials are never usable outputs, so every
unit of fidelity spent on them raises the price of the real one. A pipeline
with a single global quality setting has decided to pay winner prices for
every loser and should at minimum know it has.

## Storage policy per class

- **Assets**: persisted, owned by a project record, migrated forward when
  the pipeline's shape changes, and *versioned* — the review trail refers to
  a specific version, so supersession must be explicit, never in-place.
- **Disposables**: bounded. Keep them only while the comparison is open;
  cap the retained count; treat their storage as a working buffer, not an
  archive. Generated media is heavy — a single composed sequence can be
  megabytes of encoded payload — and a store that keeps every trial has
  chosen its quota failure date without writing it down.

## Deletion: everything owned, in one transaction, counted first

Asset ownership implies deletion responsibility, and this is where the
classification earns its keep operationally:

- **Deleting a project deletes everything it owns, atomically.** The classic
  leak: the project row is removed, but the per-phase records it owned —
  scripts, frames, the heavy composed output — stay behind, orphaned:
  unlistable, uncounted, undeletable, and still consuming the quota your
  storage warnings exist to protect. Delete across all stores in one
  transaction, so a partial delete cannot commit; a project row without its
  contents, or contents without their row, are both worse than either whole
  outcome.
- **Count before you destroy, without loading.** A confirmation dialog
  should say what the deletion will take — how many records, which phases —
  derived from keys or an index alone, never by reading the payloads:
  asking "how much would I destroy" must not be the operation that loads
  megabytes of media. And the delete itself should *return* what it took,
  so the surface reports what actually happened rather than what was
  assumed.

## When not to use this

Do not apply asset ceremony to configuration and code — templates, prompts,
style definitions live in ordinary version control, not in the pipeline's
asset store. And do not let the disposable label reach anything a person has
annotated: the moment a "trial" carries a human note, it has been decided
about, and it crosses the boundary whether the schema noticed or not. The
boundary follows the decisions, and the schema's job is to keep up.
