---
layer: application
type: application
subject: ipc-contract
technique: call-wrapping
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Call wrapping in the React/TypeScript frontend

The repo's chokepoint is `invokeWithTimeout` at `src/lib/tauriInvoke.ts:367` —
every frontend→Rust IPC call passes through it. The ban on the raw primitive
is mechanical: `eslint.config.js` `no-restricted-imports` at `"error"` forbids
importing `invoke` from `@tauri-apps/api/core`, and it holds — exactly one
production call site of the raw API exists, and it is the wrapper's own core
at `tauriInvoke.ts:558`.

## The timeout ladder

Resolution is one line (`tauriInvoke.ts:395`):

```ts
const resolvedTimeout = explicitTimeout ?? BLOCKING_MUTATION_TIMEOUTS[cmd] ?? DEFAULT_TIMEOUT_MS;
```

Three tiers, exactly the standard's shape: explicit caller override wins,
then the **central per-operation table**, then the default (`DEFAULT_TIMEOUT_MS
= 90_000`, `:39`). `BLOCKING_MUTATION_TIMEOUTS` (`:71`) is the "blocking
mutation" class made concrete — a 30-minute ceiling (`LONG_MUTATION_TIMEOUT_MS`,
`:55`) for commands like `system_ops_run_now` that run a mutation inline with
no backend dedup, where each entry's comment states *why waiting beats timing
out*: "a post-timeout retry would start a SECOND scan." The table's own
doc-comment (`:57-70`) records the admission rule (blocks + mutates + can
exceed 90s) and the counter-example — `execute_persona` stays off the list
because it has server-side idempotency-key dedup, so a post-timeout retry is
already safe.

The standard's "watch the override ratio" warning is live here: the sibling
legacy sweep measured **52 ad-hoc call-site `timeoutMs` overrides against 3
central table entries** — the reusable mechanism used 3 times, the per-site
one 52 times, mostly clustered in the long-running API files. The mechanism is
right; the adoption is backwards.

> Re-checked 2026-10-31 at personas@22260d77: the central table has grown
> past three entries (`system_ops_run_now`, `remote_command_approve`,
> `project_tracking_run_now`, `lab_improve_prompt` and a GitLab deploy entry
> among them, from `:71`), each still carrying its why-waiting-beats-a-retry
> comment. The 52-against-3 ratio is the sweep's measurement and is not
> re-counted here.

## Outcome-unknown, spelled out at the point of failure

`InvokeTimeoutError` (`tauriInvoke.ts:134-155`) is the at-least-once hazard as
a first-class type: a readonly field literally named `backendMayStillBeRunning
= true`, and a message that tells the caller the backend "was NOT cancelled and
may still be running to completion; do not blindly retry a mutating command
(it could execute twice)". The timeout rejection path (`:565-584`) carries a
second copy of the reasoning as a comment. Tauri `invoke` has no cancellation,
so this is precisely the standard's "timeout is the caller giving up, not the
work stopping."

## Dedup — and the line the code itself draws

Two maps, two different guarantees, both inside the wrapper:

- `inflightByKey` (`:162`) — caller-supplied `idempotencyKey` folds *concurrent*
  duplicates into one pending promise, evicted on settle (`:434-439`).
- `inflightAutoDedup` (`:174`) — automatic fan-in for read-only commands
  (prefix-classified `list_`/`get_`/`fetch_`, `:161`), keyed by
  `cmd + stableStringify(args)`, held 250ms after settle, rejections evicted
  immediately so retries pass through. Every hand-out is `structuredClone`d
  (`:416-427`, `:467-473`) so one caller's in-place mutation cannot corrupt
  the shared cached value.

> Re-checked 2026-10-31 at personas@22260d77: eligibility is no longer
> prefix-classified. `isDedupEligible` (`:223`) matches `list`/`get`/`fetch`
> as a whole `_`-delimited segment anywhere in the name (`READ_VERB_RE`,
> `:206`) and refuses any name carrying a mutation verb segment
> (`MUTATION_VERBS`, `:191-195`). Its comment records that ~264 read commands
> named with the verb as an infix (`dev_tools_list_kpis`, `companion_get_x`)
> had silently bypassed the prefix-only contract. The near-side read dedup the
> finding describes held; its reach widened.

The code states the standard's "near-side dedup is not idempotency" rule in
its own comments (`:44-50`, `:570-580`): the key dedup "only collapses
CONCURRENT calls; a post-timeout retry is a brand-new call with no dedup" —
which is exactly why the retry-safe command (`execute_persona`) relies on
*server-side* key dedup instead.

## Policy that accreted at the chokepoint — the argument for having one

Everything else that lives in the wrapper because the wrapper exists:
`undefined`→`null` coercion so optional Rust params deserialize as `None`
(`coerceArgs`, `:281`, with class instances kept opaque to protect their
custom IPC serialization); IPC metrics recording on every settle (`:596-611`);
a breadcrumb per user-initiated call (`:554`); stampede detection above 50
concurrent in-flight calls (`:508-525`); session-token injection with a
one-shot anchored auth-failure retry (`:618-627`). None of these could have
been retrofitted across a thousand raw call sites.

## The adjacent boundary-absence door

`safeInvoke` (`src/lib/utils/tauri/safeInvoke.ts:73`) is the separated
"registration gap" category: it returns a fallback **only** when the error
matches Tauri's canonical `Command "<name>" not found` shape via an anchored
regex (`:20`), rethrowing everything else. Its header documents the
historical failure the anchoring fixed — a sibling copy used
`msg.includes("not found")` and silently swallowed genuine domain not-found
errors as "command missing", rendering empty-list UIs over real failures. The
wrapper taxonomy (refused / timed out / not registered) is therefore split
across two functions here rather than one, but the categories stay distinct,
which is what the standard actually requires.

## Two more doors, one of them the wrong shape (re-read 2026-08-29)

`src/lib/network/p2pCapability.ts:54-61` is the environment-sensing case the
standard describes, done structurally: a timeout is `indeterminate` (never
latched), an `AppError`-shaped rejection means the handler ran (`supported`),
and any *unstructured* rejection means it did not (`unsupported`). Its header
(`:1-37`) is the incident report for the substring version it replaced —
`"not found"` latched a whole tab off for the session on a legitimate
`NotFound("No pairing request pending…")`. What it does not do is separate
Tauri's unregistered-command string from its capability-denied string; for a
feature probe that is acceptable, and the file says so.

The wrapper's own auth retry is the anti-pattern in miniature:
`isIpcAuthFailure` (`tauriInvoke.ts:639-652`) decides a one-shot retry by
probing for `"IPC authentication failed"` in the message or the stringified
payload, because the Rust guard that emits that rejection hand-builds
`{ error, kind: "Forbidden" }` outside the envelope's vocabulary — see
[rust--error-shape-mapping](./rust--error-shape-mapping.md) for the emitter.
The chokepoint is right; the classification inside it is prose.
Resolved 2026-08-29 (personas commit `75cee6315`): the guard now rejects
via `AppError` and `isIpcAuthFailure` branches on `kind`, not the message
substring — the paragraph above is kept as the dated specimen. Re-checked
2026-10-31 at personas@22260d77: still so — `isIpcAuthFailure` requires
`kind === "forbidden"` plus the guard's message on an object rejection, and
keeps a substring fallback only for a transport that stringifies the payload.
