---
layer: application
type: application
subject: sql-console
technique: result-fidelity
stack: next
status: forged
verified_on: 2026-09-01
verified_against: next@16
---

# Next — clearing the outcome slot, and the one panel that forgot

A fleet-conformance application has no SQL console, but it is full of the
console's hardest shape problem: panels that run something, render the
answer in place, and can be run again. Its handling of
[result-fidelity](../techniques/result-fidelity.md)'s stale-success-plus-error
transition is unusually legible, because the repo does the right thing in
about a dozen places by one idiom and gets it wrong in exactly one — and the
wrong one sits next to a correct sibling.

Paths are repo-relative to the application root; line numbers are at HEAD
`a57f272c`.

## The error branch that nulls the rows

`src/features/standing/passports/controls/useControlMatrix.ts` is the closest
thing here to a result surface with an honest shape contract, and it states
it in the file header (`:6-9`):

> `null` rows mean the matrix is UNAVAILABLE (no database, or the org is
> unknown) and `[]` means the org has genuinely reported nothing yet. Folding
> them together would tell an operator their fleet has no controls when the
> truth is that nothing was asked.

That is the zero-rows-versus-error row of the shape table, spelled in the
type: `rows: ControlMatrixRowView[] | null` (`:15`) separates *settled empty*
from *unavailable* structurally, so no renderer can blur them by accident.
Both failure paths then clear the previous rows alongside setting the error —
the non-`ok` branch at `:36-42` and the network `catch` at `:45-49` each do
`setError(...)` **and** `setRows(null)`. The comment at `:37-38` argues the
inverse of the amendment ("a silent empty grid here reads as *no controls*,
which is a statement about the fleet rather than about the request that
failed") and lands in the same place: an error and a grid must never both
speak about the same run.

## The house idiom: clear at the top, not in the catch

Most re-runnable panels here never need an error-branch clear, because the
run handler nulls the outcome slot before the request goes out. Same
guarantee, cheaper to get right:

- `src/features/shared/practices/PlaybookApplyBatch.tsx:76-101` —
  `setRunning(true); setError(null); setResults(null); setSummary(null);`
  before the rollout.
- `src/features/shared/memory/MemoryReflectPanel.tsx:49-60` —
  `setError(null); setNotice(null); setResult(null); setApplied([]);` before
  proposing. Its header (`:12-14`) states the adjacent rule outright: *an
  empty result is explained, never just blank.*
- `src/features/standing/repositories/RepoRescanButton.tsx:41-43` —
  `setRunning(true); setOutcome(null);` on every rescan; this is the literal
  re-run-in-place button.
- `src/components/org/shared/RepoDimensionModal.tsx:69-88`,
  `src/features/shared/practices/PracticeApply.tsx:43-45`,
  `RegistryPracticeApply.tsx:42-44`,
  `src/features/shared/memory/useMemoryLibrary.ts:94-99` — same shape.

Two files go further and make the fourth shape *unrepresentable* rather than
merely avoided, by folding result and error into one union:
`src/features/standing/governance/VerifyLedgerButton.tsx:11` declares
`type Result = { chainOk … } | { error: string }` with a single
`Result | null` slot (`:16`), so the catch at `:41` — `setResult({ error:
"Could not reach the verifier." })` — physically overwrites the prior
verification rather than sitting beside them.
`src/features/admin/integrations/ClaudeCodeSetup.tsx:65-88` uses the same
shape. This is the strongest form of the amendment available to a client:
the executor cannot emit stale-success-plus-error because the state has no
room for both.

`src/features/shared/registry/useRegistryMutation.ts` is the one shared
client path behind five different buttons, and it is the analogue of a
console's single executor. `run()` does `setPending(action); setOutcome(null);
setError(null);` (`:69-71`) before every fetch, and both failure branches
(`:80-81`, `:87-88`) set *only* `error`. Its comment at `:62-64` is the only
place in the repo that names why this matters, and it names it exactly:

> being an OUTCOME line, it read like a result the click produced.

## The counter-example, one directory over

`src/features/shared/memory/MemoryRecallPanel.tsx` is a re-runnable result
surface — a Recall button re-fires with a new budget, namespace and kind
(`:54-85`) — and `result` is cleared nowhere. Not at the top of `recall()`,
which clears only `error` (`:59-60`); not in the `catch`, which sets only
`error` (`:75-79`). The render puts the full ranked output — packed count,
budget meter, the memory list, the *ranked but left out* group and the *not
recallable* group — behind `{result && …}` at `:142-186`, and the error line
at `:188`, immediately underneath. So a failed re-run leaves the previous
recall's tables on screen with the new failure printed below them, and the
counts read as this run's answer.

The panel is not careless — `:78-80` carries a precise comment about a
superseded run's `finally` landing after the new run's `setRunning(true)`,
the same race its sibling `MemoryReflectPanel.tsx:61-63` guards. The team had
already reasoned about one stale-run hazard on this exact file and missed the
other, which is the argument for the state-shape fix over the discipline fix:
`MemoryReflectPanel.tsx:52` gets it right by habit, and habit is what failed
here.

## What the console should take

The correct move is `useControlMatrix`'s type plus `VerifyLedgerButton`'s
union: separate *settled empty* from *unavailable* in the type so the shape
table cannot be blurred, and give the outcome one slot so a run's error
cannot coexist with a prior run's rows. `useRegistryMutation`'s clear-on-entry
is the portable minimum when the state cannot be unioned.
