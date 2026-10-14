---
layer: application
type: application
subject: civic-knowledge-graphs
technique: civic-entity-ontology
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: the closed vocabulary and its refusal inbox

How a TypeScript/Node civic-graph project (Czech accountability app *politicas*,
PGlite store) holds its ontology, and where the "gate's rejections are the
ritual's trigger" rule found a gap.

## What already conformed

The enforceable form is one module: `KG_NODE_KINDS` (eleven kinds) and
`KG_EDGE_RELS` in `lib/analysis/kg-verdict.ts`, imported by the verdict schema
and validator, the batch applier, the promote step, the catalog-sync script,
and the UI label tables. A parity test fails when a UI catalog misses a kind,
so the "one definition, one import" and "enum enforces, catalog explains" halves
were in place, with a human-facing catalog (`docs/data-analysis/graph-schema.md`)
carrying per-kind population, pass and caveats.

## The seam chosen to falsify it

`scripts/case-loops/apply-batch.ts` refuses a batch that asserts a kind or
relation outside the enum. The question: when it refuses, does the refusal
become the amendment ritual's input? It did not. The gate threw on the first
class of violation (node kinds, then rels, never both), only a string survived,
and the failure report was overwritten by the next run. A source adapter had
already proposed a `notice` kind and two relations this way; the proposal lived
in a source comment and a hand-written handoff note. A CAUGHT result would
have taught that the ritual's inbox is discipline rather than structure.

## B: a typed refusal and an append-only ledger

`collectVocabRefusals(batch)` returns every refused assertion (gate, asserted
value, producing batch, endpoints, endpoint kinds the batch declares).
`VocabRefusalError` carries them; the CLI writes them into the failure report
and appends them to `docs/data-analysis/vocab-refusals.jsonl`. Refusal
behaviour and messages are unchanged, nothing is written to the store, and the
rows are never read as data. No catch-all kind was added.

## Verdict

Target: refused assertions retrievable as typed records (A: 0 of 2 in a batch
with one bad kind and one bad relation, since the gate stopped at the kind and
kept a string; B: 2 of 2 with endpoints and the dependent endpoint kind).
Floor: the existing refusal tests, the 4,157-test suite, tsc, eslint and the
pre-push gate all held. The technique held; the gap was in its implementation
by omission, and the decision rule this application supports is that a gate
which refuses should report every refusal in a run, not the first.
Not measured: how often real batches are refused (the ledger starts empty), and
the mid-project amendment ritual itself, which no batch triggered this run.
