---
layer: application
type: application
subject: eval-harness
technique: treatment-election-rate
stack: node
verified_on: 2026-09-04
verified_against: node@22
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A report that measures election, and a lab that cannot

## Witness one: the published rate

A local-first code-search tool's paired report ends with a table headed *Tool
behavior* carrying two rows: treatment trials that used the tool, `300 / 300
(100.00%)`, and total calls, `989` — about 3.3 per trial. The report's own
prose says why it is there: *"Since agents decide when and how to use it,
results vary by model and run."*

That line converts every efficiency figure above it from an ambiguous
statement into an attributable one. A 37% token reduction over an arm that
elected the tool in every trial is a claim about retrieval. The same
reduction over an arm that elected it in a tenth would have been a claim
about a tool description. Witnessed at commit `7d73ca1`, `node >= 22`.

## Witness two: the tree that collapses zero-election into no-record

A desktop agent lab scores each sample's tool usage with an LLM judge and
stores the calls the agent actually made. At
`src-tauri/engine/src/test_runner/scoring.rs` the storage decision is:

```rust
let tool_calls_json = if output.tool_calls.is_empty() {
    None
} else {
    Some(personas_db::models::Json(output.tool_calls.clone()))
};
```

An agent that ran and called nothing is stored identically to a sample with
no recorded call channel. The election rate is therefore not recoverable from
the stored results at all: the one state the technique says must be counted
is the one state the schema erases, and it erases it into `NULL` — an
[unknown](../../../../_laws.md#unknown-is-not-a-value) standing in for an
observed zero.

## The structural fact this tree supplies

The interesting part is that the same file already solved the adjacent
problem, one case over. Where a scenario supplies mock tools, the agent is
instructed not to call real ones, so the real-call channel is empty **by
construction** — and the code recognises this explicitly, nulling the
tool-accuracy score with a comment naming the degeneracy: *"its real-tool-call
channel is empty by construction and `tool_accuracy` measured as
expected-vs-actual real calls is degenerate."* The composite renormalises over
the remaining two metrics and the rollup flags `partial_coverage` rather than
auto-failing the cell.

So the team had already seen that an empty tool channel makes a tool score
meaningless — and handled it for the case where the harness caused the
emptiness, not for the case where the agent chose it. In the second case the
judge still returns a low tool-accuracy number, the composite still absorbs
it, and the cell reads as a variant that used its tools badly rather than one
that did not reach for them. That asymmetry was not designed; it fell out of
which emptiness had an obvious cause, and it is better evidence for the
technique than a tree that had never considered the question.

## Three cases walked under both policies

Drawn from the tree's own scenario shapes rather than invented.

**A scenario with `expected_tool_sequence` and an agent that answers from its
own knowledge.** Policy A: `tool_calls_actual` is `NULL`, the judge scores
tool accuracy low, the cell reads "used tools poorly", and the remedy a
reader reaches for is a better tool description in the persona prompt — which
happens to be right, by luck, for the wrong reason. Policy B: the row shows
zero elections, the cell is flagged the way the sandbox case already is, and
the remedy is named rather than guessed. Falsifier: if the judge's rationale
already distinguishes these, policy A loses nothing; the stored rationale JSON
does carry a `tool_accuracy` field, so this is checkable and I did not run it.

**A sandbox scenario with mock tools.** Both policies agree — the existing
carve-out handles it. Policy B would additionally record the zero as
observed rather than absent, making the two empty-channel causes
distinguishable in the data instead of only in the code path.

**A variant comparison where one version's persona prompt stopped naming its
tools.** Policy A: the version's composite drops, and the drop is attributed
to the model or the prompt's quality. Policy B: the election rate drops to
near zero while output quality holds, which points at the prompt's tool
section immediately. This is the case the technique exists for, and it is the
one the current schema cannot express.

## Verdict and the instrument that would settle it

`unmeasurable`, and the instrument is named: the lab has no stored quantity
for elections, so no comparison can be run until `tool_calls_actual`
distinguishes an observed empty list from an absent record. That is a
one-line change to the snippet above plus a migration-free read adjustment
downstream, and it is the precondition for any election-rate reporting here —
not a finding about whether the technique helps, which remains untested in
this tree.

Return condition: when `tool_calls_actual` stores `Some([])` for a completed
run that called nothing, re-run this as an experiment over an existing lab run
and count how many low-tool-accuracy cells are actually zero-election cells.
