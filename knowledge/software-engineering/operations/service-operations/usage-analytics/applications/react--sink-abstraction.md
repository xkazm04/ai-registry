---
layer: application
type: application
subject: usage-analytics
technique: sink-abstraction
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# Sink abstraction — letting the compiler name everyone who took the wrong door

*Verified against the project tree at `bf2a1e249`.*

The [sink-abstraction](../techniques/sink-abstraction.md) technique names one
failure precisely: *the analytics layer's own public surface re-exporting the
raw destination helpers next to the safe interface, so the natural import is
the unswitchable door.* This is that case, and the A/B is the technique's own
prescribed mechanism — withholding the dangerous export — used first as a
measuring instrument and then as the fix.

## The seam

The seam itself is well drawn. `src/lib/analytics/sink.ts:70-118` is one
contract (`feature` / `interaction` / `session` / `conversion`), a real null
sink for opt-out, one composition point, and a live consent switch:

```ts
export function applyTelemetrySink(enabled: boolean): void {
  setAnalyticsSink(enabled ? sentrySink : noopSink);
}
```

Then, at the bottom of the layer's public surface, `src/lib/analytics/index.ts:162`:

```ts
export { trackFeature, trackInteraction } from '../sentry';
```

Two raw destination helpers, re-exported from the module that talks to Sentry
directly, sitting beside the switched interface and reachable by the shortest
import in the codebase: `import { trackInteraction } from '@/lib/analytics'`.

## A and B

**A** is that line. **B** deletes it and gives the surface its own doors:

```ts
export function trackInteraction(category: string, action: string, label?: string): void {
  getAnalyticsSink().interaction({ category, action, label });
}
```

with the same signature the raw helper had, so call sites do not change.

## What was read, and what it said

The measurement came in two passes. First, withhold the export and run
`tsc --noEmit` — the compiler enumerates the population that took the
unswitchable door, which no grep can do reliably across re-export chains:

```
src/features/agents/sub_executions/detail/ExecutionDetail.tsx(24,10): error TS2305 …
src/features/teams/sub_teamMemory/useTeamMemories.ts(5,10): error TS2305 …
src/features/vault/shared/vector/tabs/ExtractTab.tsx(7,10): error TS2305 …
src/features/vault/shared/vector/tabs/SearchTab.tsx(10,10): error TS2305 …
```

Four product files, roughly twenty call sites, every one of them emitting
outside the consent switch while looking correct. `trackFeature` produced no
errors at all — nobody had ever imported it through the analytics surface.

Second, the behavioural read. A case added to `src/lib/analytics/sink.test.ts`
sets a capturing sink, calls the surface's `trackInteraction`, and asserts the
event arrived; then sets the null sink and asserts nothing more arrives. Under
A that test fails (the raw helper never consults the sink); under B it passes,
`tsc --noEmit` is clean, and the analytics and affected feature suites are
green. Verdict: **better** — the same call sites, unchanged, moved inside the
consent switch.

## The structural fact

Enumerating the callers of the contract's optional half is the check that pays
here. The sink interface declares four methods. `feature`, `session` and
`conversion` are reached only through `getAnalyticsSink()` — the layer's own
code drives them (`index.ts:38`, `:43`, `:49`, `activation.ts:127`). Under A,
`interaction` had **three** call sites in the whole product
(`PersonaCoreModal.tsx:67`, `ModelABCompare.tsx:86` and `:149`,
`ModelSelector.tsx:195` — one team's deliberate choice, with a comment at
`PersonaCoreModal.tsx:64` explaining that it routes through the sink so the
user's toggle is honoured), against four files and ~20 call sites taking the
raw door, plus five more files importing `trackInteraction` straight from
`@/lib/sentry`.

So the one method on the contract that product code was meant to call was the
one method product code almost never called. Nobody designed that; it fell out
of having two doors with one being shorter to type. The comment at
`PersonaCoreModal.tsx:64` is the proof that the convention existed and was
understood — and it was still the minority path, which is exactly the
technique's argument that a convention asking callers not to use the dangerous
export is not a mechanism.

## What this realization cannot do or prove

- It proves the *natural* bypass is closed, not that the layer has one door.
  Five files still import `trackInteraction` from `@/lib/sentry`
  (`useOnboardingState.ts:15`, `MemoryConflictReview.tsx:16`,
  `ChatTab.tsx:13`, `workflowParser.ts:25`, `workflowPipeline.ts:15`), and the
  compiler cannot name them,
  because that module legitimately owns the symbol. Closing that requires
  withholding the export at its source, which is a larger change than this
  A/B priced.
- It measures reachability, not delivery. Nothing here shows that events now
  reach a destination correctly, only that they now pass through the switch.
  The technique's development-sink rule remains unapplied in this tree — there
  is still no sink a developer can watch, so the emit paths stay unfalsifiable
  in the only environment anyone runs.
- The verdict rests on a typechecker and a unit test, both of which see
  *shape*. Neither can see whether a user who has telemetry off actually stops
  producing Sentry traffic in a shipped build; that would need the loss and
  delivery accounting the technique asks for, which this tree does not emit.
