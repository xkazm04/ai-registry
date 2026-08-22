---
layer: application
type: application
subject: visual-script-to-code-transpilation
technique: event-override-signature-resolution
stack: node
status: forged
verified_on: 2026-08-20
---

# Event override resolution in a Blueprint → C++ transpiler suite

A production-tools app (`pof`) ships a Blueprint-to-C++ transpiler as a pure library
under `src/lib/`, behind the `/api/blueprint-transpiler` route: `blueprint-parser.ts`
(export → semantic tree), `blueprint-cpp-codegen.ts` (tree → header + source),
`cpp-semantic-parser.ts` (C++ → tree), `blueprint-semantic-diff.ts` (reconciliation),
and `blueprint-jargon.ts` / `blueprint-glossary.ts` / `blueprint-explainer.ts` (the
two-layer explanation). Everything is kept free of React and I/O so it is unit-testable
outside the HTTP route.

## The resolver

`resolveEventOverride(eventName, isComponent)` in
`src/lib/blueprint-cpp-codegen.ts:76-91` is the technique in twenty lines:

```ts
switch (eventName.replace(/^Receive/, '')) {
  case 'BeginPlay': return { name: 'BeginPlay', params: '', args: '' };
  case 'Tick':
    return isComponent
      ? { name: 'TickComponent',
          params: 'float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction',
          args: 'DeltaTime, TickType, ThisTickFunction' }
      : { name: 'Tick', params: 'float DeltaTime', args: 'DeltaTime' };
  case 'EndPlay': return { name: 'EndPlay', params: 'const EEndPlayReason::Type EndPlayReason', args: 'EndPlayReason' };
  default: return null;
}
```

Four things land here that the technique names:

- **Label normalisation.** UE names the Blueprint-side node `ReceiveBeginPlay`; the C++
  override is `BeginPlay`. The prefix strip happens once, at the head of the switch.
- **Owner-kind branching.** `Tick` is `Tick(float)` on an `AActor` and
  `TickComponent(float, ELevelTick, FActorComponentTickFunction*)` on a
  `UActorComponent`. Same node label, different signature, decided by `isComponent`.
- **One signature for both passes.** The `EventOverride` record carries `name`, `params`
  and `args`; `overrideDeclaration` (`:96`) and `overrideDefinitionSignature` (`:100`)
  are two renderings of it, and `args` exists so the definition can emit the `Super::`
  call (`:357`).
- **Fail closed.** `default: return null`, and the caller emits
  `// TODO: Override for <name>` plus a warning (`:292-294`) rather than a guessed
  method.

## The enablement site — an upward lesson

`src/lib/blueprint-cpp-codegen.ts:344-348`:

```ts
// A UActorComponent has no PrimaryActorTick — its tick function is
// PrimaryComponentTick, and naming the wrong one is a compile error.
const tickField = isComponent ? 'PrimaryComponentTick' : 'PrimaryActorTick';
```

Owner-kind resolution does not stop at the method. The flag that decides whether the
callback is invoked at all lives on a differently-named field per owner kind. The same
file also validates the class-name prefix against the resolved parent (`:173-179`) —
`A` for actors, `U` for objects — and reports a mismatch as `severity: 'error'`,
because the engine's header tool rejects it before the compiler sees it.

## Dedupe with a receipt

`:273-280`: when two nodes resolve to one override (`BeginPlay` and `ReceiveBeginPlay`
both present in an export), the second is skipped and a warning is pushed carrying
`nodeId: ev.id` — "this node's logic was not emitted". The residue is bound to the
graph node, which is what lets `blueprint-explainer.ts` narrate it back to a designer.

## Deviation, not lowered

The table covers three engine events. Everything else — overlap, damage, input,
possession — falls to `default` and becomes a TODO. That is the honest coverage
boundary the technique asks for, but it is a small one, and the standard remains a
table keyed by `(event, owner kind)` with an ancestry walk. The current resolver has no
ancestry walk at all: `isComponent` is a boolean, not a resolved type chain, so a
specialised component subclass is indistinguishable from its base.

The review side (`src/lib/evaluator/module-eval-prompts.ts`) consumes the same
vocabulary when it grades an engine subsystem — the seam only; the four-pass review
doctrine is a separate subject.
