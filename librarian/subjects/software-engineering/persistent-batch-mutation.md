---
subject: persistent-batch-mutation
domain: software-engineering
last_touched: 2026-09-27
touched_by: deepen
dry_streak: 0
---

# persistent-batch-mutation

First touch: [[2026-09-03-vllm]]. NEW subject, 3 techniques, 2 applications.
Second touch: `/deepen` dp-pbm-0927 (2026-09-27), dispatched on the structural
finding "3 techniques (design floor is 4)". Now 4 techniques, 4 applications.

## What the gap actually was

A long-lived batch whose membership AND ORDER change every step, shared by several
stateful extensions holding parallel per-slot state. `admission-queue` owns the
admit/hold/refuse verdict and `concurrency-guards` owns exclusion over keys; neither
models telling N extensions what changed so all of them reconstruct the identical state.

The discriminating question the golden path now carries: does one item's transition
relocate another item's storage? If yes, a per-item state machine is the wrong model.

## 2026-09-27 pass

**The missing fourth technique was the defence, not another rule.** Every rule in the
subject is one a careless implementer breaks with no symptom, and nothing said how to make
that loud. `identity-reference-alignment-check` converged from three independent places:
the engine's own randomized logits-processor harness (read in the tree), a blind
training-data lane that named model-based testing against an identity-keyed reference
without a lookup, and cross-domain primary sources (a slot map's quickcheck against a hash
map, stateful-testing docs, a deterministic simulator's state checker). Measured, not
asserted: over the engine's real sparse applier with six seeded defects, the published
worked examples caught 3, the identity reference 5, a presence-only validator 2. The field
incident is upstream PR #49613: a hand-rolled consumer's asymmetric swap left stale state
and shipped past a harness that covered that consumer, because the harness isolated it in
an all-enabled population and asserted presence only.

**The first pass carried a phantom.** The application quoted the record's fields as
`removed, moved, added` and built the "declaration order is not processing order" warning
on it. At the pinned commit the fields were already `removed, added, moved` with the order
stated in the structure's comment: the tree does exactly what the technique recommends.
The rule stands; the evidence was wrong, and the golden-path failure bullet was softened
to "only if the structure says so". Likely source of the misreading: the builder passes
the fields by keyword in `removed, moved, added` order.

**The published example cannot test what it was cited for.** Its two moves touch disjoint
seats and commute; a consumer applying the move list backwards passes it. The technique's
worked-example rule now asks for moves that do not commute.

**"Still open" from the first pass, resolved.** The first note said a member can leave
three ways. The experiment says two for a live member: remove and replacing add. A
well-formed producer one-way-moves only into seats a remove in the same record already
vacated, so the move overwrites residue, not a member. The seeded "one-way applied as an
exchange" defect was unobservable in every arm. The flag's load-bearing job is permission
to vacate the source; "write the destination, never vacate the source" is the collapse
that is always a bug. An unfinished earlier pass (2026-09-26, never committed) had been
pushing the "three ways" reading further; it was left untouched and is superseded by this
measurement.

**Conditions from a second engine.** One engine keeps state aligned with keep-positions +
append, no moves, no replacing adds: a second complete vocabulary, simpler, order
preserving, paid for with a full copy per membership change. Remove/add/move is the answer
for fixed-capacity in-place arrays, not the only complete one; the no-housekeeping-callback
rule survived in both trees. The same engine re-evaluates "is anyone using me" on filter and
merge, never per step; the startup rule now names itself as mode-level, and the
population-level skip is placed on the mutation record.

**Declined:** "handing extensions the new batch is always the failure" as refuted. The
second engine hands over the batch, but its per-row state is either regathered by kept
positions or re-derived from the request each step. That is already the technique's
when-not-to-use, and one sentence was added there. Generation stamps landed as the runtime
half of the new technique, not as a technique of their own: the one engine that uses them
does so in its slot pool, a layer below this subject.

**Still open:** the `batch_size` deviation stands on main. The document says "at the
beginning of the engine step" and the model runner passes the live post-condensation
count. The API-may-change admonition is still on the document.

## Impact

None. `build-registry-map --dry-run` shows zero fleet pairs for this subject in all 13
maps (grep with a positive control agrees), so no verdict went stale. The maps were not
regenerated: the staleness they carry belongs to other landings.

## Leads banked

- Replay the pre-#49613 holder through the engine's randomized harness with a mixed
  population and an absence assertion. It needs the engine's test environment. Return
  when an engine test environment is available locally.
- The producer's own parallel arrays are hand-copied in its close-up function under a
  "convert these" TODO. Watch for the upstream conversion; it would be a second
  application of "one shared applier".
- Other engines (TensorRT-LLM, llama.cpp) were only glanced at. llama.cpp rebuilds its
  batch every step and keeps per-slot state on the slot object, so it has no membership
  protocol, which is this subject's when-not-to-use. Return if a third protocol shape
  turns up.
