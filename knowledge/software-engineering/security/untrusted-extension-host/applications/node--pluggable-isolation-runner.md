---
layer: application
type: application
subject: untrusted-extension-host
technique: pluggable-isolation-runner
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@22.16
---

# One interface, two runners, and a ceiling neither enforces

`emdash-cms/emdash` at `7a5d9c1838f6afc5649b7bc0940eacf920b40dab` ships two
implementations of one isolation-runner interface: a managed-platform runner
that creates a dynamic worker per plugin, and a standalone runner that starts an
open-source worker runtime as a child process on a server. The version witness
is the workspace root's `package.json:60-62` — `"engines": { "node": ">=22.16" }`
— and the standalone runner is the one that exists *because* of that engine, so
Node 22 is the witness the citations below were read at.

This is the technique realized well at the seam and imperfectly at the
declaration, and the gap between those two is the whole lesson.

## The seam is drawn where the technique says to draw it

`SandboxRunner` (`packages/core/src/plugins/sandbox/types.ts:224-262`) has five
methods and not one of them is policy: `isAvailable()`, `isHealthy()`,
`load(manifest, code)`, `setEmailSend(callback)`, `terminateAll()`. The
per-plugin handle it returns, `SandboxedPluginInstance` (`:103-131`), has three:
`invokeHook`, `invokeRoute`, `terminate`.

Everything a second platform would otherwise reimplement stays above the seam
in `packages/core/src/plugins/`: the capability-gated context factory
(`context.ts`), the hook dispatcher and its ordering (`hooks.ts`), the manifest
schema and its parse (`manifest-schema.ts`), the storage query validator
(`storage-query.ts`, `storage-indexes.ts`). The runner never sees a capability
name. It is handed already-authorized wiring — note that `setEmailSend` exists
because the host's email pipeline is constructed *after* the runner and injects
its callback downward (`types.ts:248-254`), which is the dependency direction
the technique requires: policy above, primitive below.

The default is a refusal rather than a fallback. `NoopSandboxRunner`
(`sandbox/noop.ts:36`) returns `false` from `isAvailable()` and throws
`SandboxNotAvailableError` (`:15-25`) from `load()`, and the docs state the
consequence at
`docs/src/content/docs/deployment/plugin-sandbox.mdx:140`: sandboxed plugins are
not loaded, and a new install from the admin fails with the error code
`SANDBOX_NOT_AVAILABLE`. A missing runner does not silently degrade into
running untrusted code unisolated — the behaviour
[absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud) demands, and the
one most hosts get wrong.

## The negative fact: a declared ceiling nobody enforces

`ResourceLimits` (`sandbox/types.ts:19-28`) declares four fields with four
documented defaults:

```ts
cpuMs?: number;         // CPU time per invocation in milliseconds (default: 50ms)
memoryMb?: number;      // Memory limit in MB (default: 128MB)
subrequests?: number;   // Maximum subrequests per invocation (default: 10)
wallTimeMs?: number;    // Wall-clock time limit in milliseconds (default: 30000ms)
```

Both runners resolve all four. The managed runner's `DEFAULT_LIMITS`
(`packages/cloudflare/src/sandbox/runner.ts:43-48`, comment at `:35-42`) sets
`cpuMs: 50, memoryMb: 128, subrequests: 10, wallTimeMs: 30_000`, and `:96-99`
merges caller overrides into every one of them. The standalone runner does the
same at `packages/workerd/src/sandbox/runner.ts:126,144`.

Enforcement is a different set. The managed runner passes exactly two of the
four down (`:283-286`):

```ts
const loaderLimits: WorkerLoaderLimits = {
    cpuMs: this.limits.cpuMs,
    subRequests: this.limits.subrequests,
};
```

`memoryMb` is resolved and never passed anywhere. The comment above
`DEFAULT_LIMITS` (`:35-42`) admits it: "memoryMb is declared for API
compatibility but NOT currently enforced". The standalone runner enforces
*one* of the four — `capnp.ts:54-59` is the tree's own statement of the
asymmetry, headed "KNOWN LIMITATION on resource limits", concluding "The only
limit we enforce on the Node path is `wallTimeMs`". Its wall-time enforcement
is a `Promise.race` in `invokeHook`/`invokeRoute`, which is a bound on the
host's wait, not on the plugin.

So the honest enforcement matrix, which the docs publish at
`plugin-sandbox.mdx:123-128`, is: CPU and subrequests on one runner only,
wall time on both, and **memory on neither** — "Not enforced per plugin" in the
managed column, "Not enforced" in the standalone one. A settings field named
`memoryMb` with a default of 128 is, across this entire tree, a number that
resolves, merges, and does nothing
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value): the
configured value is rendered as a limit when the limit is not known to exist).

## Where the tree publishes the asymmetry, and where it does not

Credit where it is due, because this is the part worth copying. The standalone
runner's constructor warns at `runner.ts:377-393` when a caller supplies any of
the three limits it cannot enforce:

> `[emdash:workerd] cpuMs, memoryMb, and subrequests limits are not enforced by
> standalone workerd. Only wallTimeMs is enforced on the Node path.`

And the deployment documentation carries a per-runner enforcement column at
both `plugin-sandbox.mdx:19` and `:123-128`. A reader who opens either learns
what their deployment actually gets.

What is missing is the same fact where a non-reader would meet it. The warning
is a console line at construction, not a state on any administrative surface;
the runner interface has no method by which a runner declares its supported
ceiling set, so the host cannot validate a configured ceiling against the
selected runner at startup, cannot refuse an unenforceable one, and cannot
render an effective containment set beside an installed plugin. The technique's
rule — make the ceiling *vocabulary* shared and the ceiling *support*
per-runner, then report the effective set — is exactly the missing method, and
the tree has arrived at its data (two prose tables and a `console.warn`) without
arriving at its structure.

Two smaller observations for a reader adopting this design:

- The managed runner's memory story is worse than the standalone runner's in
  one respect: the standalone runner *warns*, and the managed runner does not,
  because on that platform `memoryMb` looks enforced. The docs concede the
  platform's isolate ceiling "applies" but is not per-plugin. A per-plugin
  limit and a per-isolate platform ceiling are different guarantees, and only
  the second one exists.
- `sandbox: false` (`plugin-sandbox.mdx:144-153`) runs sandboxed plugins
  in-process with no isolation and no limits. It is documented as a debugging
  option and it is refused outright on the managed platform (`:153`), which is
  the right treatment for an escape hatch — but it is still a configuration row
  that converts every installed plugin into host-tier code, and a host shipping
  one should make its state as loud on the admin surface as the missing-runner
  case already is.
