---
layer: application
type: application
subject: fleet-orchestration
technique: completion-claim-verification
stack: python
verified_on: 2026-09-02
verified_against: python@3.12
---

# The three-layer verifier the technique was forged from (deer-flow subagents)

Verified against the deer-flow source tree at commit `08b27aef` (2026-09-02); every line cited below was opened in that clone.

The technique was written against this tree and applied first to a fleet
project; this is the application against the source itself, which the
registry did not write at the time. The whole design lives in two paragraphs
of one module guide (`backend/packages/harness/deerflow/subagents/AGENTS.md:11-12`),
the second of them roughly 4,800 words.

## Layer one: receipts and the report contract

`report_contract.py` appends a framework-owned section to every subagent's
system message requiring `[rN tool_name]` citations for action claims,
verifiable handles for deliverables, and explicit failure reporting
(`subagents/AGENTS.md:11`). The citation example is derived from the same
`format_citation` / `receipt_id` the verifier uses, so prompt text cannot
drift from the check. The receipt middleware is the outermost tool wrapper
(`agents/middlewares/AGENTS.md:70`) for the reason the technique gives:
guards inside it can short-circuit a call with their own result, and an inner
receipt layer would gap the ledger on exactly those results. Snapshot
validation accepts a strictly consecutive range of original ids rather than
requiring the first, so a citation still resolves after summarization drops
and renumbers earlier messages.

## Layer two: decidable leaves, parent-side

`acceptance_checks.py` runs on the task tool's completed branch, offloaded to
a thread and failure-isolated (`subagents/AGENTS.md:12`). Decidable leaves are
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
the clean-looking run executed in" (`subagents/AGENTS.md:12`). The exit
status is parsed from the runtime's own `Exit Code: N` marker, which the
output truncation always preserves inside its budget.

## The boundaries the tree pins, and the technique inherits

A test class named for them (`TestKnownBoundaries`) keeps three accepted
limits from being re-raised: a bare criterion executable trusts path and
filesystem spelling; runner semantics are trusted; evidence is bounded and
truncation degrades rather than proves. The technique's closing section is
these three, stated for any runtime.

## What this realization cannot do

It verifies execution, not correctness - the guide defers claim correctness
to a judge layer and to re-execution in a fresh environment, neither of which
existed at this commit. And it is an agent-harness verifier: a fleet whose
workers are observed as terminal text has no receipt substrate for layer one
and can only run layer two, which is the shape the fleet-side application of
this technique found.
