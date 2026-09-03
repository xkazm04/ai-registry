---
layer: application
type: application
subject: untrusted-extension-host
technique: per-callback-failure-policy
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@22.16
---

# A correct default, a race that is honest about itself, and two rejection channels

`emdash-cms/emdash` at `7a5d9c1838f6afc5649b7bc0940eacf920b40dab` lets plugins
register callbacks at named content lifecycle points from either isolation
tier. The version witness is the workspace root's `package.json:60-62`
(`"engines": { "node": ">=22.16" }`); the hook dispatcher is plain server-side
code with no platform bindings, so Node 22 is the runtime the citations were
resolved against.

This is the technique's closest realization in the tree, and it is right about
the two things hosts usually get wrong.

## The policy is per registration, and the default is correctness

A hook registration is an object, not a function
(`docs/src/content/docs/plugins/creating-plugins/hooks.mdx:58-65`), and it
carries `priority`, `timeout`, `dependencies`, `errorPolicy`, `exclusive` and
`handler`. `errorPolicy` is `"abort" | "continue"` and its default is
**`"abort"`** — the correctness-safe side, per registration rather than per
plugin, exactly as the technique requires. The doc's guidance at `:68` reads the
right way round: use `"continue"` for non-critical hooks like notifications,
`"abort"` when the hook's result is essential.

Enforcement is uniform because it is one line repeated at every pipeline, in
`packages/core/src/plugins/hooks.ts`:

```ts
if (hook.errorPolicy === "abort") {
    throw error;
}
```

— at `:534`, `:575`, `:622`, `:663`, `:704`, `:808`, `:852`, `:965`, `:1055`.
Nine pipelines, one rule. The result object pushed just above it
(`:527-533`) carries `success`, `error`, `pluginId` and `duration`, so a
`"continue"` failure is *recorded and attributed* rather than dropped — a
plugin's failure never becomes an anonymous one.

## The timeout is a race, and the tree does not pretend otherwise

`executeWithTimeout` (`hooks.ts:376-386`) is the technique's central claim
implemented literally:

```ts
const timeoutPromise = new Promise<T>((_, reject) =>
    (timer = setTimeout(() => reject(new Error(`Hook timeout after ${timeout}ms`)), timeout)),
);
try {
    return await Promise.race([fn(), timeoutPromise]);
} finally {
    clearTimeout(timer!);
}
```

`Promise.race` bounds the **wait**. The rejected branch resolves the host's
await; `fn()` keeps running, keeps holding its isolate, and can still complete.
The tree's documentation is honest about the layering at
`hooks.mdx:395-397`: the configured `timeout` is enforced at the host's runner
level, and the sandbox runner "may also enforce its own resource limits (CPU,
subrequests, wall-clock) that can terminate a hook before its `timeout` fires."
That is the correct statement of who can actually stop the work — and, read
against this subject's runner application, it is also the reminder that on a
runner enforcing wall time only, the outer bound is another `Promise.race` and
nothing is terminated at all.

Two deviations from the technique's rules, recorded as deviations rather than
softening the standard:

- **The author sets the timeout and may widen it.** The default is 5000 ms and
  the docs' own example raises it to 30000 (`hooks.mdx:385-393`). Since the
  wall-time ceiling is also 30 s, an author can set a blocking hook's wait to
  the entire ceiling, which is a 30-second stall on every save the hook
  participates in. The technique's rule — author configuration narrows, never
  widens — is not implemented here.
- **No reaper is named for the abandoned execution.** Nothing in
  `executeWithTimeout` cancels, terminates, or refuses the late result of the
  raced call; `SandboxedPluginInstance.terminate()` exists
  (`sandbox/types.ts:130`) but is not reached from the timeout path. A hook that
  times out on a save leaves an execution running against an operation that has
  already been decided.

## Refusal is a value, in two shapes for two tiers

The tree implements the structured rejection envelope and it is the strongest
part of this area.

For the isolated tier, `packages/core/src/plugins/sandbox/hook-result.ts`
defines a wire envelope with all four properties the technique asks for:

- **Versioned** — `SANDBOX_HOOK_RESULT_VERSION = 1` (`:2`), checked exactly
  (`:38`).
- **Bounded** — `MAX_SANDBOX_SAVE_REJECTION_REASON_LENGTH = 500` (`:5`),
  enforced after trimming at `:47`, and the docs tell authors the admin renders
  the value as text and not to put markup in it (`hooks.mdx:141,169`).
- **Closed** — `inspectSandboxHookResult` (`:32-51`) accepts only
  `__emdashSandboxHookResult === true`, `version === 1`, an object `error` whose
  `code` is exactly `SAVE_REJECTED` and whose `reason` is a string. Anything
  else in the shape is not read.
- **Collapsing** — the return type is a three-way
  `{ kind: "value" } | { kind: "malformed" } | { kind: "error"; error }`
  (`:22-25`). A value that carries the marker but fails any check is
  `malformed`, and the documented consequence (`hooks.mdx:141`) is that "empty,
  overlong, malformed, and unknown error results fail the save with a generic
  hook error" — never success, never a repair.

For the host tier the same verdict travels as an exception subclass,
`ContentSaveRejectedError` (`packages/core/src/plugins/save-rejection.ts:8-10`),
converted by the runtime into the same `SAVE_REJECTED` API error while "any
other exception ... cancels the save with a generic error that hides the
exception message". Two tiers, two carriers, one verdict reaching the caller as
a distinct value — [verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)
implemented on both sides of the isolation split.

The upward lesson this file taught the technique is the detection rule
underneath it (`save-rejection.ts:12-20`):

```ts
export function isContentSaveRejection(error: unknown): error is ContentSaveRejectedError {
    if (error instanceof ContentSaveRejectedError) return true;
    return error instanceof Error && error.name === "ContentSaveRejectedError";
}
```

The comment gives the incident: a bundler can duplicate the module across
server-render chunks, and an `instanceof` against the wrong copy of the class
"would misreport a rejection as a plugin crash." A refusal that is a *type* is
only as durable as type identity across the packaging boundary it crosses —
which is precisely the boundary an extension host has. Carry a stable name
alongside the prototype, and test the discriminator, not the class.
