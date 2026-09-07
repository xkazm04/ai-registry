---
layer: application
type: application
subject: test-harness
technique: derived-selection-must-be-measured
stack: python
status: forged
verified_on: 2026-09-06
verified_against: python@3.10
applied: simulation
ab_verdict: better
---

# Seven integration tests deselected by a rule nobody wrote, and an audit that fixed the wrong clause

The version witness is the tree's own pin: `src/praisonai-agents/pyproject.toml:10`
declares `requires-python = ">=3.10"`. Read at commit `54244695b`; the measurements
below are the tree's own, recorded in
`src/praisonai-agents/docs/local-model-layer/04-test-gating.md` against
`origin/main` at `2591aa405` with a clean worktree.

## The three-step composition, in this tree

1. **Content-derived tagging.** `tests/_pytest_plugins/test_gating.py:153-166`
   scans the **entire file** for provider name patterns
   (`'provider_ollama': re.compile(r'\b(ollama)\b', re.IGNORECASE)` at line 28)
   and applies the resulting tags to every collected item in it (lines 213-230).
2. **Tag implication.** Lines 235-238: *"Add network marker if any provider
   marker is present."*
3. **Pipeline exclusion.** Every CI marker expression contains `not network`;
   lines 262-267 convert the marker into a runtime skip.

Composed over `tests/integration/test_base_url_api_base_fix.py`: one occurrence of
a provider's name inside a single test tags **all seven** items in the file. A
marker-dump confirms every item carries the identical set
`['integration', 'network', 'provider_ollama', 'provider_openai', 'skip']` —
including the six that never mention that provider.

Result: `collected 7 items / 7 deselected / 0 selected`. Green, for the life of
the arrangement.

## The counterfactual that overturned the audit

An audit of the same tree named the visible clause: four CI expressions carry
`not provider_ollama`, so that clause must be excluding the file. The tree's own
reproduction R2 removes it and re-runs:

```
still 7 deselected / 0 selected
```

`not network` deselects them on its own. **Removing `not provider_ollama` from
the pipelines would have changed nothing** — a fix that would have been written,
reviewed and merged with no effect. The correction is stated in the work order
as the reason it "touches no YAML at all": the cause is in the derivation, so the
repair is marker-side.

This is the technique's central rule measured on a live tree: a clause consistent
with the observed zero is not the cause until removing it moves the count.

## What the zero was hiding

Selection failure is not cosmetic here. Executing the file directly
(`-o addopts=""`, network allowed, fake key) gives **4 failed, 3 passed** — all
four failing with the same `'str' object has no attribute 'choices'`, and the
three that pass being the three that never call the response path. The suite had
been protecting a broken file from ever reporting.

Three further findings in the same tree, all downstream of the same design:

- **The positive selector over-selects 4×.** Selecting *on* the derived tag
  returns 32 tests across five files, of which 7 concern that provider — so the
  tag is unusable as a lane definition, which the ledger records as a hard
  prerequisite ordering between two work orders.
- **The exemption is the visible symptom.** The plugin exempts `tests/unit/**`
  from derived tagging (line 215, `if item.fspath and test_type != 'unit'`),
  which is why a unit file naming the same provider runs in CI while the
  integration file does not — the asymmetry a maintainer notices first.
- **A separate file makes a real billed call when forced to run**, because its
  mock patches a function the code no longer routes through (verified in-tree:
  401 from a live endpoint). Derived gating had been the only thing preventing it.

## A/B and verdict

**A** — the audit's fix: edit the four CI expressions to drop the provider clause.
**B** — the technique's discipline: measure the selection, then fix the binding
constraint.

Walked over the tree's own reproductions:

1. R2 (remove the suspected clause) — A ships and the count stays `0 selected`.
   B detects this before writing the fix. **B better.**
2. R3 (dump the assigned tags) — A never runs it. B runs it and finds the
   file-level tagging in one command, which is the actual root cause.
   **B better.**
3. R5 (positive selection returns 32) — A does not look, and a follow-on live
   lane built on the tag would have run five unrelated files against a real
   service. B measures the selector before building the lane. **B better.**

Verdict **better** on three of three, and the strongest of them is R2, because
under A the wrong fix is indistinguishable from the right one at review time —
both are small, both are plausible, and only the count says which.

What would falsify it: a tree where the suspected clause *is* the binding
constraint, making the counterfactual pure overhead. That costs one command; the
tree shows the case where skipping it costs a merged no-op.

## What this realization cannot do

There is no floor check here. Nothing in this harness fails a lane that selects
zero — the finding was reached by a human running `--collect-only` by hand
against one suspected file. So this tree confirms the diagnostic half of the
technique and demonstrates, by omission, the preventive half: the arrangement
survived precisely because no lane declares what it must select.
