---
layer: application
type: application
subject: persistent-batch-mutation
technique: typed-ordered-mutation-protocol
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# The batch-update record in vLLM's logits-processor interface

vLLM's V1 engine keeps a **persistent batch** of running requests and lets
pluggable *logits processors* hold per-request state beside it. The mutation
protocol between the two is `BatchUpdate`, specified in
`docs/design/logits_processors.md` and implemented in
`vllm/v1/sample/logits_processor/`. All citations below are pinned to commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`.

**Currency caveat, stated by the source itself.** The document opens with an
admonition (`docs/design/logits_processors.md:3-5`) that "some logits
processors design changes are still in progress and the API may change in the
near future". Treat the specific names and signatures here as a snapshot; the
protocol *shape* is what transfers, and the shape is what the technique
describes.

## The record

`vllm/v1/sample/logits_processor/interface.py:37-57`:

```python
@dataclass(frozen=True)
class BatchUpdate:
    batch_size: int  # Current num reqs in batch
    removed: Sequence[RemovedRequest]   # int
    moved: Sequence[MovedRequest]       # (int, int, MoveDirectionality)
    added: Sequence[AddedRequest]       # (int, SamplingParams, list[int], list[int])
```

Three lists and a scalar, exactly as the technique describes. Two details are
worth pointing at directly:

- **The field order is not the processing order.** The dataclass declares
  `removed, moved, added`; the specification
  (`docs/design/logits_processors.md:420`) mandates processing as **removes,
  adds, moves**. This is precisely the trap the technique names — an
  implementer who reads the type and not the prose gets a different final
  arrangement, and nothing in the type system objects. Every in-tree processor
  gets it right because it was written against the document.
- **`MoveDirectionality`** (`interface.py:17-31`) is the one-bit flag
  distinguishing `UNIDIRECTIONAL` from `SWAP`, carried explicitly rather than
  inferred from occupancy.

The index-time rule is stated in the document in the exact words the technique
recommends (`docs/design/logits_processors.md:422-424`): "the index argument
for Add operations refers to the index *at the time the Add occurred*, i.e.
before any Move operations", with the worked case — added at 5, then swapped
to 3, recorded as 5.

## The producer's construction order

`docs/design/logits_processors.md:394-416` specifies how the model runner
builds the record, and it is the source of the technique's claim that
replacement is the common path rather than an edge case:

1. identify finished requests; 2. identify new requests;
3. **use Adds to replace finished requests**, lowest replaced index first;
4. if there are more new than finished, extend with Adds at
   `current_max_batch_index + 1`; if fewer, `Remove` the leftovers, then
   condense with unidirectional moves and shrink;
5. apply the attention backend's reordering swaps.

Step 3 is why the steady state is nearly free: when arrivals and departures
balance, the entire record is a short `added` list, with no removes and no
condensation moves at all.

## The two worked examples

`docs/design/logits_processors.md:430-515` carries two before/after examples,
and they are the densest teaching material in the document.

**Fewer arrivals than departures.** Batch `[A,B,C,D]`, new `E`, finished `A`
and `C`:

```text
1. Add E at index 0        -> [E,B,C,D]   # A discarded by replacement
2. Remove at index 2       -> [E,B,x,D]   # C removed, hole at 2
3. Unidirectional 3 -> 2   -> [E,B,D] x   # condense; batch_size 4 -> 3
4. Swap 0 <-> 1            -> [B,E,D]     # backend reorder
```

yielding `added=[(0, E's params, E's prompt ref, E's output ref)]`,
`removed=[2]`, `moved=[(3,2,UNIDIRECTIONAL),(0,1,SWAP)]`.

Read this against the technique's rules and every one of them is load-bearing
at once. `A` ends without appearing in `removed` — a consumer that drops state
only on removes has just leaked `A`. The add's index is 0, which is also where
`E` ends up here, but after step 4 `E` is at index 1 — the record still says 0.
And the two moves must be applied in order: the condensing move creates the
arrangement that the swap's indices are stated against.

**More arrivals than departures.** Batch `[A,B,C,D]`, new `E,F`, finished `C`:
`E` replaces `C` at index 2, `F` extends at index 4, then a swap. `removed` is
empty and there are no condensing moves — the document notes explicitly
(`:506`) that "batch condensation is skipped because there are no empty slots
left behind by Remove operations".

## A consumer: the sparse applier

`vllm/v1/sample/logits_processor/builtin.py:374-414` is the shared applier the
technique's last decision rule asks for — one implementation of the index
arithmetic, reused by every sparse processor:

```python
def process_dict_updates(req_entries, batch_update, new_state):
    if not batch_update:
        return False
    for index, params, prompt_tok_ids, output_tok_ids in batch_update.added:
        if (state := new_state(params, prompt_tok_ids, output_tok_ids)) is not None:
            req_entries[index] = state
        elif req_entries.pop(index, None) is not None:
            ...
    if req_entries:
        for index in batch_update.removed:
            req_entries.pop(index, None)
        for a_index, b_index, direct in batch_update.moved:
            a_entry = req_entries.pop(a_index, None)
            b_entry = req_entries.pop(b_index, None)
            if a_entry is not None:
                req_entries[b_index] = a_entry
            if b_entry is not None and direct == MoveDirectionality.SWAP:
                req_entries[a_index] = b_entry
```

Both discard paths are here and both are easy to miss on a first reading. The
`elif req_entries.pop(index, None)` branch is the **replacing add**: a new
request that does not enable this processor still has to evict whatever the
previous occupant of that index left behind. And the move loop pops *both*
ends before writing, so a unidirectional move leaves `a_index` empty (the
`SWAP` branch is what puts it back), which is the difference the technique
insists the flag must carry.

The dense counterpart, min-p (`builtin.py:54-101`), does the same arithmetic
over a preallocated CPU tensor and then reslices the device tensor to
`batch_update.batch_size` (`:95-101`) — the scalar from the record used exactly
once, to size the view.

## Where the tree confirms the technique, and where it is thinner

- **Confirmed:** the typed record instead of a diff; the mandated processing
  order stated in prose; the index-at-time-of-add rule with a worked example;
  the directionality flag; replacement-by-add as the primary refill path; the
  discard obligation stated for both spellings (`:535` — "discards information
  about finished requests (i.e. requests which are replaced by an Add or which
  are subject to a Remove)"); references to the growing output list carried in
  the add (`:321`).
- **Thinner than the standard:** `batch_size` is documented as "the size of the
  persistent batch at the beginning of the engine step" (`:390`) while the
  field comment reads "Current num reqs in batch" (`interface.py:40`) and the
  builder is called with the post-condensation size
  (`state.py:119-127`). Both readings are defensible from the text and they
  differ by the number of departures. The technique's rule — a size carried
  with a set of operations must name the moment it is evaluated — is written
  from this.
- **Thinner than the standard:** the processing order is enforced only by
  prose. Nothing in `BatchUpdate` prevents a consumer from iterating the fields
  in declaration order, which is the wrong order. A record type that exposed
  the operations as one ordered stream, or an applier that consumers were
  required to drive, would make the order unmissable; the tree relies on
  documentation plus a shared helper that happens to be correct.
