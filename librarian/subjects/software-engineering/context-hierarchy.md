# context-hierarchy

**Path:** `knowledge/software-engineering/llm-agent/prompt-and-context/context-hierarchy/`
**Created:** 2026-09-02 by `/intake` run `intake-openviking-0902` under the 2.0.0
mechanical XL trigger (three `design` candidates with one home), forged in-session by one
worker from [`docs/subject-proposal-context-hierarchy.md`](../../../docs/subject-proposal-context-hierarchy.md).

## Shape at creation

Four techniques - `per-node-summary-tiers`, `seeded-descent-retrieval`,
`digest-gated-upward-refresh`, `stable-sampling-for-wide-nodes` - and one application
(`python--seeded-descent-retrieval`, against the source tree). Single-source: every
mechanism comes from one vendor repository plus one paper (RAPTOR) and its issue tracker.
That is the subject's standing debt.

## Boundaries it states

Owns the tree as an *interface* - tiered summaries per node, descent from seeded nodes,
what reaches a parent when a child changes. Does not own storage/consolidation/decay
(`agent-memory`), lanes/fusion/budgets over the candidates a descent yields (`retrieval`),
or the compiled-lane staleness doctrine (`lane-reconciliation`, cited not restated). Its
reason to exist is the scope condition of `agent-memory`'s shape hedge (golden path lines
77-89): a shape the consumer can survey is a different object from one an index queries.

## Owed

- **Second source.** A first-party account of a summary tree in production other than
  the forging source; the RAPTOR tracker is the only staleness account so far.
- **A measurement of score propagation and of a dominance ratio.** The source defaults
  the first off and declares the second without applying it. The registry's own task
  (`docs/tasks/2026-09-02-context-hierarchy-descent.md`, branch `intake-openviking-0902`)
  carries the labeled set that would measure both.
- **A fleet application.** No managed project holds a summarised tree today; the
  registry itself is the first candidate and the task row says how.

## Sightings

- 2026-09-02 (`intake-openviking-0902`): created. The source's concept docs describe
  the pre-policy bubbling as current; its code implements the policy. Recorded in the
  spec's EXECUTED line and in the technique as the wrong first draft.
