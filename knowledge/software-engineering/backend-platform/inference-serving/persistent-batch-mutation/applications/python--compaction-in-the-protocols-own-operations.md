---
layer: application
type: application
subject: persistent-batch-mutation
technique: compaction-in-the-protocols-own-operations
stack: python
status: forged
verified_on: 2026-09-27
verified_against: python@3.12
---

# Two inference engines, two complete vocabularies for closing holes

Two open-source LLM serving engines keep a batch of running requests alive
across decode steps and have to close the holes finished requests leave. They
chose different vocabularies. Both are complete, and neither has a
housekeeping callback, which is the technique's rule surviving a real
counter-design. What differs is the cost, and the layout that makes each one
right. Citations: vLLM at commit `73859fec5865700c5b2021b22890cb3b2005f66e`,
SGLang at commit `b252aceffecd1e313cb5a03d3cbf56c99fc8c9ce`, both read on
2026-09-27.

## vLLM: close-up as one-way moves in the ordinary move list

`InputBatch.condense` (`vllm/v1/worker/gpu_input_batch.py:700-831`) is the
technique's construction, line for line. It walks the removed seats lowest
first and the occupied seats highest first. For each pair it moves the
occupant down, records `(last_req_index, empty_index,
MoveDirectionality.UNIDIRECTIONAL)` in the same `moved` list that later
receives the attention backend's reordering swaps (`:662`), and stops when
the lowest hole is above the highest occupant. Logits processors never see a
"condense" instruction; they apply the move list, and the document says the
batch size shrinks as a stated side effect
(`docs/design/logits_processors.md:414`, "Shrink the batch").

The cost is visible in the same function. The producer's own parallel arrays
are not consumers of the record. `condense` copies each one by hand —
temperature, top-p, top-k, three penalties, accepted-token counts,
generators, the allowed-token mask, bad-words — under a comment reading
`# TODO convert these to LogitsProcessors` (`:815`). Every array added there
is one more hand-written copy of the arithmetic the record exists to state
once. The technique's "a consumer that implements move gets compaction for
free" holds only for code that consumes the record.

## SGLang: close-up as an order-preserving gather

SGLang has no move operation. `ScheduleBatch.filter_batch`
(`python/sglang/srt/managers/schedule_batch.py:3647-3734`) computes the
positions to keep in ascending order:

```python
keep_indices = [
    i
    for i in range(len(self.reqs))
    if not self.reqs[i].finished()
    and self.reqs[i] not in chunked_req_to_exclude
]
```

(`:3658-3663`). It returns early when no request left (`:3673`), filters its own
request list (`:3687`), and hands the same kept positions to every consumer
(`self.sampling_info.filter_batch(keep_indices, keep_indices_device)`,
`:3729`). Consumers apply it as a gather:
`setattr(self, item, value[keep_indices_device])` for the per-request
sampling tensors (`python/sglang/srt/sampling/sampling_batch_info.py:415-430`),
and `self.frequency_penalties = self.frequency_penalties[keep_indices]` in a
penalizer (`sampling/penaltylib/frequency_penalty.py:49-50`). Arrivals are a
second batch appended with `merge_batch` (`schedule_batch.py:3736`), which
consumers apply as `torch.cat` (`frequency_penalty.py:55-59`).

So the vocabulary is two operations, *keep these positions* and *append that
batch*. A departed request is simply not kept, so there is no replacing add
and no second spelling of "gone" for a consumer to miss. Survivors keep their
relative order. The price is that every consumer copies all of its per-row
state on every membership change — a row per request, and vocabulary-wide
rows for the penalizers — where vLLM's moves touch only the members above the
new boundary.

It is not free of ordering contracts either. Merge must run against the
pre-merge request list: "Penalizer orchestrator must be merged before
Batch.reqs is merged" (`schedule_batch.py:3739-3741`), because a penalizer
switching on during the merge sizes its state from the current requests. The
technique's claim that a complete vocabulary needs no housekeeping callback
holds; the claim that it needs no ordering rule does not, in either tree.

## What the pair teaches

- The rule "housekeeping expressible in the operation set" survives: neither
  tree has a compaction hook. SGLang's override points,
  `adjusted_filter_batch` and `adjusted_merge_batch`
  (`sampling_batch_info.py:282-291`), are extension hooks *on* the two
  operations, not a third operation.
- The move-based construction is the answer for a fixed-capacity array that
  wants to avoid copying survivors. It is not the only complete answer. The
  gather is simpler for every consumer and is the better default when state
  is cheap to regather.
- Neither choice protects the producer's own parallel arrays unless they
  consume the same instruction. vLLM's TODO is the finding.
