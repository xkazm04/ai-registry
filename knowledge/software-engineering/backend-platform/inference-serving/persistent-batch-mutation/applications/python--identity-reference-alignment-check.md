---
layer: application
type: application
subject: persistent-batch-mutation
technique: identity-reference-alignment-check
stack: python
status: forged
verified_on: 2026-09-27
verified_against: python@3.12
applied: experiment
ab_verdict: better
---

# vLLM's randomized logits-processor harness, and the consumer it could not see

vLLM's V1 engine tests its logits processors with the harness this technique
describes, and the same tree shipped an alignment bug in a consumer the
harness covered. Both halves are instructive. Citations are to vLLM commit
`73859fec5865700c5b2021b22890cb3b2005f66e` (main as read on 2026-09-27);
the PR is cited by number.

## The harness as built

`tests/v1/logits_processors/test_correctness.py` has all three parts.

- **A producer that uses the real construction rules.**
  `_generate_fake_step_update` (`:727-861`) draws a random number of arrivals
  and departures per step, turns as many departures as possible into
  replacing adds with `pop_removed()`, appends the rest of the arrivals past
  the end, closes the remaining holes with one-way moves from the highest
  occupied seat into the lowest hole, then appends random non-overlapping
  swaps "to simulate arbitrary batch ordering in the kernel backend". It
  builds the record with the engine's own `BatchUpdateBuilder`, so the record
  it emits is the record the engine would emit.
- **An identity shadow updated in the same breath.** `persistent_batch` is a
  plain list of `LogitsProcsRequestParams`, one object per request, and every
  branch of the generator writes it directly
  (`persistent_batch[add_remove_idx] = add_req_params`,
  `persistent_batch[first_empty_index] = persistent_batch[last_nonempty_index]`,
  the swap). The record is never interpreted to update it.
- **A per-step comparison with distinct values.** `test_logitsprocs`
  (`:913` onward) runs steps until the workload drains, applies each record
  to the processors, and `_assert_valid` (`:864`) checks every seat's output
  row against the request sitting there, using that request's own
  `workload_index` logits — so a swapped entry is compared against the wrong
  request's numbers and fails.

## The consumer it could not see

Main carries a record consumer that is not a logits processor: the
thinking-budget holder, `ThinkingBudgetStateHolder.sync_batch`
(`vllm/v1/sample/thinking_budget_state.py:83-112`), with its own move loop.
vLLM PR #49613 (merged 2026-08-15) fixed "a production bug in
`ThinkingBudgetStateHolder.sync_batch` where swapping a budgeted request with
an unbudgeted batch slot leaves stale thinking-budget state at the empty
index"; the PR's statement of the effect is that "forcing of end-of-thinking
tokens could therefore apply to the wrong request in mixed
`thinking_token_budget` / normal batches". Its test is two hand-built
records (`tests/v1/sample/test_thinking_budget_state.py`).

The randomized harness does include this consumer, and it is shaped so
that it could not have caught the bug:

- `_get_test_cases` (`:709-724`) isolates it: "Isolate thinking-budget
  handling from other processors to avoid cross-talk", producing the case
  `[[thinking_id]]` — every request in that run has a budget. The defect needs
  a swap between a budgeted and an unbudgeted seat, which that population
  never contains.
- `_thinking_budget_validate` (`:568` onward) asserts that a budgeted seat
  **has** correct state. Nothing asserts that an unbudgeted seat has none,
  which is the only observation the leak produces.

Both are the technique's "what the comparison must assert" section, met in
the field.

## The experiment

A harness over the same inputs, product code unchanged. The subject is vLLM's
real sparse applier, `process_dict_updates`, extracted by `ast` from
`vllm/v1/sample/logits_processor/builtin.py` at the commit above and executed
unmodified as the baseline; each mutant is a one-line source edit of it. A
consumer's state is the member's identity, so the expected entry map is
exact.

- **Arm A, worked examples:** the two before/after examples from
  `docs/design/logits_processors.md` (`:430-515`), run over **every** subset
  of members enabling the consumer (32 and 64 subsets).
- **Arm B, identity reference:** a port of the generator above (replace-first,
  append, close-up, random swaps), 20 seeds x 300-request workloads, 30% of
  members enabling the consumer, exact entry-map equality after every step.
- **Arm B, presence-only:** the same generator, checking only that enabled
  seats hold the right entry — the shape of the thinking-budget validator.

| mutant | A | B exact | B presence-only |
| --- | --- | --- | --- |
| baseline (real function) | pass | pass | pass |
| M1 replacing add by a non-enabling member does not evict | caught | caught | missed |
| M2 one-way move keeps its source entry (the #49613 class) | caught | caught | missed |
| M3 swap applied as one-way | caught | caught | caught |
| M4 one-way applied as swap | missed | missed | missed |
| M5 removes skipped when the record also has adds | missed | caught | missed |
| M6 move list applied in reverse | missed | caught | caught |
| C0 control: removes after adds (permitted) | pass | pass | pass |

Worked examples: 3 of 6. Identity reference: 5 of 6. Presence-only: 2 of 6.
M5 is a multi-step defect, and M6 slips through because the first example's
two moves touch disjoint seats and commute. M4 is missed by every arm
because it cannot be observed under this producer: vLLM only one-way-moves
into seats a remove already vacated, so for a consumer that clears on remove
the exchange carries nothing back. That result conditioned the technique's
one-way-versus-swap rule. The control passing in every arm confirms that
adds-before-removes, which the real applier does, is a permitted
reordering.

**Verdict: better.** The prediction was that the identity reference catches
strictly more seeded defects than the worked examples. It would have been
falsified if arm A had matched arm B. n is seven variants and one run per
arm, with no noise source, so the table is exact rather than statistical.

## Not measured

Whether the harness, extended to a mixed thinking-budget population with an
absence assertion, catches the pre-#49613 `sync_batch`. The experiment's M2
is the same defect in the shared applier, not a replay of the holder itself,
which needs the full engine test environment.
