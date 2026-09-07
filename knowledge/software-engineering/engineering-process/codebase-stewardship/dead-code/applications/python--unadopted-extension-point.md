---
layer: application
type: application
subject: dead-code
technique: unadopted-extension-point
stack: python
status: forged
verified_on: 2026-09-06
verified_against: python@3.10
applied: simulation
ab_verdict: better
---

# A provider-adapter surface where 11 of 17 methods had no caller, and the plan to wire them was overturned by the column that decides

The version witness is the tree's own pin: `src/praisonai-agents/pyproject.toml:10`
declares `requires-python = ">=3.10"`, and line 7 pins the package at `1.7.4`. Read
at commit `54244695b`, shallow clone, tree unmodified.

## The population

A multi-agent SDK's LLM layer declares a provider-adapter base class as its
documented extension point for per-provider behaviour. An AST census over the
package, measured by the tree's own maintainers and recorded in
`src/praisonai-agents/docs/local-model-layer/00-ground-truth.md` §3, found:

- `DefaultAdapter` declares **17** methods; **11 have zero call sites** anywhere
  in the package.
- The caller — `llm/llm.py`, 7,160 lines — carries **145 references** to one
  provider's name, hand-dispatching the same concerns inline.
- The protocol the adapter is described as implementing,
  `LLMProviderAdapterProtocol`, declares **16** members: it omits
  `get_streaming_adapter`, so that method is unreachable through the interface
  type regardless of its call count.

Nothing was failing. The suite was green, the extension point was documented, and
the behaviour lived in the caller.

## The two predicate details, both present here

The technique's warning that the count is only usable with its predicate is
visible in this tree twice, in both directions:

- **Receiver restriction.** The census restricts attribute calls to the receiver
  names that denote an adapter (`_provider_adapter`, `adapter`,
  `provider_adapter`). Without it, an unrelated `OpenAIClient.format_tools`
  would have counted as a call site for `DefaultAdapter.format_tools` and
  certified a dead method as live.
- **Self-correction on the count.** An earlier draft of the same document said
  **18** methods; the eighteenth was a module-level function, not a method. The
  document records the correction rather than editing it away.

## The wire-or-delete split, and the reversal

The tree's decision table (`06-adapter-revival.md` §1) resolves all 20 items:
**4 leave, 1 leave-and-hand-off, 12 delete, 3 wire.** The distribution is the
technique's claim measured:

| Class | Count | Example |
| --- | --- | --- |
| inline equivalent, signature fits → **wire** | 3 | a tool-result formatter whose default branch was inlined three times across the sync, async and streaming paths |
| inline equivalent, shape differs → **delete** | 6 | a tool formatter whose inline version passes tools through unwrapped while the adapter wraps them — wiring changes what one provider receives |
| no inline equivalent anywhere → **delete** | 6 | a cache-control injector with no implementation on any adapter, whose real behaviour needs a budget and a history index its flat signature cannot carry |

The reversal is the artifact that makes this application worth writing. The
ledger's own README first instructed an agent to *"wire the twelve dead adapter
methods."* The measured table inverted it: 12 delete, 3 wire. The document states
why in the technique's own terms — six of the deletions have no inline equivalent,
so an agent following the original instruction would have invented an
implementation "with no test that could ever have failed."

Two of the deletions carry the shape-mismatch tell precisely: a
`get_max_iteration_threshold` returning `10` whose inline constant is `1`, so
wiring it raises the threshold for every provider that was not the motivating
one; and a `parse_tool_calls` typed `Dict[str, Any]` that cannot express the
response object one of its four inline sites actually receives, so adoption
requires changing the signature — inventing API.

## The module that only the extension point reached

`llm/streaming_protocol.py` is 387 lines with four adapter classes and three
public functions. Its **only production importer** is the dead
`get_streaming_adapter` method. Deleting that method makes the whole module
unreachable — and the ledger explicitly refuses to fold it into the same change:
"Deleting a 387-line module is not 'one adapter method'; it needs its own risk
assessment." That is the technique's second-candidate rule, arrived at
independently.

## A/B and verdict

**A** — the plan as originally written: wire all twelve dead methods.
**B** — the plan after the inline-equivalent column: delete twelve, wire three.

Simulation over three concrete items from this tree, walked under both policies:

1. `inject_cache_control` — A produces an invented flat `messages -> messages`
   implementation; the tree states the real behaviour needs a four-breakpoint
   budget and a history index, so the invented version is wrong and no existing
   test constrains it. B deletes it. **B better.**
2. `get_max_iteration_threshold` — A wires a method returning `10` over an inline
   constant of `1`, silently changing iteration behaviour for every non-motivating
   provider. B deletes it as a duplicate. **B better.**
3. `handle_empty_response_with_tools` — A and B agree: the inline predicate
   matches the signature exactly in two paths. **Tie**, and it is the case that
   shows A is not uniformly wrong, only unguided.

Verdict **better**: 2 of 3 cases diverge and B is right in both; the third is a
tie by construction. What would falsify it: an item where the adapter's shape
differs from the inline code and the *adapter's* shape is the intended one — then
"delete on mismatch" would remove the correct design. The tree's own guard against
that is the justification column, which forces the mismatch to be stated rather
than assumed, and none of its six mismatch rows survives that statement.

## What this tree does not show

It does not show the outcome. Every work order here has an open PR and none has
landed; the decision table is a plan measured against the tree, not a merged
result. So this application confirms the technique's **decision rule** and the
population it applies to, and cannot yet confirm that the deletions were safe.
The instrument that would close it is the tree's own
`test_no_dead_name_is_actually_live` running green after the wiring steps.
