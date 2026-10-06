---
layer: application
type: application
subject: fleet-orchestration
technique: completion-claim-verification
stack: python
verified_on: 2026-10-06
verified_against: python@3.12
---

# The three-layer verifier the technique was forged from (deer-flow subagents)

Verified against the deer-flow source tree at commit `08b27aef` (2026-09-02) and re-verified at `53df22bd` (2026-10-06, 740 commits later); every line cited below was re-opened in the newer clone and the line numbers are its own. The verifier paragraph moved from line 12 to line 50 of the guide when the guide gained durable-batch and shutdown sections above it; its wording on scope, provenance and boundaries is unchanged.

The technique was written against this tree and applied first to a fleet
project; this is the application against the source itself, which the
registry did not write at the time. The whole design lives in two paragraphs
of one module guide (`backend/packages/harness/deerflow/subagents/AGENTS.md:49-50`),
the second of them roughly 1,500 words (1,629 at `08b27aef`; the "4,800-word" figure this
application and the first source note carried was never right for this line).

## Layer one: receipts and the report contract

`report_contract.py` appends a framework-owned section to every subagent's
system message requiring `[rN tool_name]` citations for action claims,
verifiable handles for deliverables, and explicit failure reporting
(`subagents/AGENTS.md:49`). The citation example is derived from the same
`format_citation` / `receipt_id` the verifier uses, so prompt text cannot
drift from the check. The receipt middleware is the outermost tool wrapper
(`agents/middlewares/AGENTS.md:86`) for the reason the technique gives:
guards inside it can short-circuit a call with their own result, and an inner
receipt layer would gap the ledger on exactly those results. Snapshot
validation accepts a strictly consecutive range of original ids rather than
requiring the first, so a citation still resolves after summarization drops
and renumbers earlier messages.

## Layer two: decidable leaves, parent-side

`acceptance_checks.py` runs on the task tool's completed branch, offloaded to
a thread and failure-isolated (`subagents/AGENTS.md:50`). Decidable leaves are
`file:<path> exists|non-empty`, `file_written:<path>` and
`tests_passed:<command>`. Every degradation the technique enumerates is
present in the tree's own words: out-of-scope paths "degrade to UNVERIFIED,
never misjudge"; a remote sandbox's `Error:`-prefixed read is "normalized to
a failed check, never evaluated as content", typed by provider so a genuine
file starting with that word on the local sandbox stays valid; a decode error
marks a binary deliverable as existing; reads are byte-bounded with the size
established first; and "any other criterion is UNVERIFIED, never silently
passed".

## Layer three: provenance

Each harvested bash execution carries a `shell_persistent` stamp resolved
from the sandbox state that produced the evidence, never from the parent
runtime; a persistent stamp, an unidentifiable one, or a provider that never
declared its session semantics degrades `tests_passed` to UNVERIFIED,
"because any earlier call in the shared session could have mutated the state
the clean-looking run executed in" (`subagents/AGENTS.md:50`). The exit
status is parsed from the runtime's own `Exit Code: N` marker, which the
sandbox's output truncation preserves inside its budget.

## The fallback the field corrected twice

Truncation was not the only rewrite between the shell and the checker. When
no marker is found, `_bash_evidence_status` returns the tool's meta status -
`if match is None: return meta_status, None`
(`backend/packages/harness/deerflow/subagents/executor.py`, unchanged between
the two commits) - and that status is `success` for any shell call that
returned text, as the function's own docstring says. Two later rewriters
removed the marker and turned that fallback into a false pass. The output
budget replaced a 12-20k-character result with a preview, so "the trailing
`Exit Code: N` was no longer last, `_bash_evidence_status` fell back to
`deerflow_tool_meta` (`success`), and a failed `pytest` whose output still
said `12 passed` could satisfy a `tests_passed` acceptance criterion"
(`CHANGELOG.md:626-632`, #6354). The audit middleware appended its warning
after the marker, with the same result for a failed `sudo pytest -q`
(`CHANGELOG.md:701-706`, #6307). Both were fixed at the rewriter, by
re-appending the marker or inserting before it. The fallback itself still
stands at `53df22bd`, so the next rewriter that forgets the marker reopens the
same hole.

## The boundaries the tree pins, and the technique inherits

A test class named for them (`TestKnownBoundaries`) keeps three accepted
limits from being re-raised: a bare criterion executable trusts path and
filesystem spelling; runner semantics are trusted; evidence is bounded and
truncation degrades rather than proves. The technique's closing section is
these three, stated for any runtime.

## Review boundary - 2026-09-09

These are historical source-guide observations, not a rerun of the verifier. A
fresh-shell stamp does not establish trusted executable bytes, environment or tests;
an absolute executable path does not repair a worker-writable runner. Retained
receipt identifiers must remain stable even when messages are renumbered. Inspect
the implementation and adversarial fixtures before claiming these checks prove
execution or content acceptance under a broader threat model.

## What this realization cannot do

It verifies execution, not correctness - the guide defers claim correctness
to a judge layer and to re-execution in a fresh environment, neither of which
existed at either commit: at `53df22bd` the guide still assigns claim
correctness to "the PR5 judge / RFC §6 re-execution" and the checker's
`unchecked` list is still labelled as that judge's future input. And it is an agent-harness verifier: a fleet whose
workers are observed as terminal text has no receipt substrate for layer one
and can only run layer two, which is the shape the fleet-side application of
this technique found.
