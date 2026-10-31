---
layer: application
type: application
subject: standards-layered-runtime
technique: baseline-plus-extension-tuple
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# One standard registrar, two implementations: the polyfill was the second door

The stack version comes from the tree's own `.nvmrc`, which pins `22` and is the file
CI reads (`.github/workflows/ci.yml` uses `node-version-file: .nvmrc`). The tree is
xkazm04/personas, a public desktop app, at `52b5af77db` before the change and
`cca476b278` after it. The seam is the page half of its browser bridge,
`src-tauri/src/browser_bridge/webview/inject.js`: a script the app injects into every
page it drives, before the page's own scripts run. Its first job, in its own header,
is that it "polyfills `document.modelContext` when the browser has none". That is the
WebMCP registry, through which a page offers tools to an agent.

## Where the technique's shape is in this tree

This is a standards-layered runtime on a small scale. The runtime installs a standard's
API into a guest context it does not control, and programs it has never seen add
extensions through that API.

- **The baseline is unconditional, and the embedder picks which baseline.**
  `src-tauri/src/browser_bridge/webview/inject.js:52` "const registry = native || polyfill();" A page always gets a
  `document.modelContext`. When the browser ships one, the page gets the native
  registry. Otherwise it gets the polyfill, which `src-tauri/src/browser_bridge/webview/inject.js:312` "value: created, configurable: true, writable: false" defines as
  non-writable on `document`. The bridge records the choice it made
  (`src-tauri/src/browser_bridge/webview/inject.js:53` "const transport = native ?", `webmcp-native` or `webmcp-polyfill`) on every `list` answer.
- **Extensions enter through one registrar.** Every page tool arrives through
  `registerTool`. The relay never reads tools from anywhere else.
- **The late door is the only door.** The current draft (WebMCP Draft Community Group
  Report, 27 October 2026, fetched in this run) has no batch registration.
  `registerTool` takes one tool at a time, with an optional `AbortSignal` that
  unregisters it, so a tool's lifetime can follow the page's UI state.

The seam was **chosen to falsify** the technique's central law,
[one-validation-door](../../../../_laws.md#one-validation-door). This tree has one
registrar *signature* with two *implementations* behind it. The polyfill exists only for
builds that lack the native one. A caught outcome would have been the two
implementations accepting and refusing the same registrations, so that a signature is
enough to make one door. They did not.

## A and B

**Arm A** is the polyfill at `52b5af77db`. Its `registerTool` returned nothing,
threw a synchronous `TypeError` for a missing name or `execute`, and accepted the rest.
A tool under a name that was already taken was silently put in place of the first one.

**Arm B** is the same method rewritten to follow the draft's "registerTool(tool,
options) method steps" in their order. It returns a promise. That promise rejects with
`InvalidStateError` for a taken name (checked again after schema serialization, which
can run page script), for a name outside 1-128 of `[A-Za-z0-9_.-]` (`src-tauri/src/browser_bridge/webview/inject.js:227` "const TOOL_NAME = /^[A-Za-z0-9_.-]{1,128}$/;"),
and for an empty description. It rejects with `TypeError` for a missing required member
or a schema that does not serialize, and with the signal's abort reason when the signal
is already aborted (`src-tauri/src/browser_bridge/webview/inject.js:292` "if (signal && signal.aborted) throw signal.reason;").

**Instrument.** One vitest file, `src/test/webmcp-polyfill.test.ts`, evaluates the
shipped `inject.js` in jsdom and records how each call ends from the point of view of a
page awaiting it: `resolved`, `rejected:<name>`, `threw:<name>` or `not-a-promise`.
Both arms ran the same 11 cases.

| | A | B |
| --- | --- | --- |
| registration outcomes matching the draft's steps (target, 10 cases) | 0/10 | 10/10 |
| how A diverged | 8 `not-a-promise`, 2 synchronous `TypeError` | none |
| taken name: first script's tool kept | no, replaced | yes, second refused |
| floor: valid tools listed sorted, one `toolchange` per change, abort unregisters | held | held |

The floor also covers the relay: it reads the registry through `listTools`, and that
method is unchanged. eslint and `tsc --noEmit` were clean. The project's pre-commit
(gitleaks, eslint) and pre-push gates passed on the pushed commit.

## What the tree's shape says

The law the technique cites is stated over registrars: one registrar with one
signature, so the set of things that can register can be listed. This tree shows that
one signature is not enough. A baseline that is installed conditionally, a native
implementation or a fallback, has as many registrars as implementations. They make one
door only if they refuse the same things. The fallback is the one nobody runs against
the standard's own tests. It runs only on builds without the native registry, so its
divergence surfaces as a page that works in one build and misbehaves in another. The
worst case was not a crash. A second script could take over a tool by registering under
its name. The policy layer gates tools *by name*, so that becomes a quiet
change of what a gated name runs.

The rule that follows, for any runtime that polyfills a standard's registration API:
**the fallback registrar's refusals are part of the baseline.** Test them against the
standard's algorithm, not against the runtime's own idea of what a valid extension
looks like.

## What this realization cannot do

The polyfill still implements only registration and listing. It has no `getTools` or
`executeTool`, which the draft also places on `ModelContext`. Those two are not wired:
the relay reads `listTools`, and calls a tool's `execute` directly. Its `unregisterTool`
is non-standard. It is kept because the abort path uses it, and a page that calls it
gets behaviour native would not give. The conformance cases are written from the draft,
not run against a native implementation, so "matches native" means "matches the
draft's steps". `exposedTo` origins and permission-policy checks are not modelled.
