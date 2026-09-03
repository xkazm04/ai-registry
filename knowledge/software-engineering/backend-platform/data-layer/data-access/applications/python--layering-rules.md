---
layer: application
type: application
subject: data-access
technique: layering-rules
stack: python
verified_on: 2026-09-02
verified_against: python@3.12
---

# A publishable agent harness under an unpublished gateway, with the direction gated in CI (deer-flow)

Verified against the deer-flow source tree at commit `08b27aef` (2026-09-02); every line cited below was opened in that clone.

The technique's two boundary properties appear one layer up from where the
corpus wrote them: not a data layer under application logic, but a framework
package (`backend/packages/harness/deerflow`, published as `deerflow-harness`)
under an application (`backend/app/`, the FastAPI gateway and the IM
channels), with a third, dependency-free contract package
(`backend/packages/extension-api`) below both.

## The rule, stated where it can be read and gated where it can be enforced

`backend/AGENTS.md:179` states the rule in the technique's own shape - "App
imports deerflow, but deerflow never imports app" - and names the gate on the
same line: `tests/test_harness_boundary.py` runs in CI. The guide then shows
the forbidden direction as a code example labelled `FORBIDDEN - enforced by
test_harness_boundary.py` (`backend/AGENTS.md:194`), so a contributor reads
the rule and the failure it produces in one screen.

## The forces are the technique's

- **The most trusted layer must load alone.** The embedded client
  (`DeerFlowClient`, described in
  `backend/packages/harness/deerflow/AGENTS.md`) runs every capability
  in-process with no web framework dependency; a harness that imported the
  app could not be embedded, and could not be tested without the app's
  fixtures.
- **Importing the framework must stay cheap.** The package roots expose
  heavy entry points lazily (`backend/AGENTS.md:198-206`), because the
  graph server resolves factories from the module dictionary and an eager
  import tree would pay the whole runtime's start-up on every lookup.
- **Upward signals are hooks, not imports.** The memory subsystem must stay
  vendorable and may not import the extension API, so it reports through a
  host callback (`extensions/AGENTS.md`, the memory-callbacks paragraph) -
  the technique's rule that a lower layer signals upward through an injected
  hook rather than an upward import.

## What the tree adds

The layer boundary is also a **conformance** boundary. Every dict-returning
client method is parsed through the gateway's response model in a test
(`backend/packages/harness/deerflow/AGENTS.md`, the conformance-tests
paragraph), so the two layers cannot drift in the direction the import rule
does not cover: the harness may not depend on the app, but its outputs must
still match what the app promises to callers. The import gate protects the
dependency direction; the conformance test protects the contract that runs
the other way.

## What this realization cannot do

The gate is an import-graph test, not a runtime check: a dynamic import
string or a reflection call that names the app package would pass it. The
tree accepts that, and its lazy-root convention makes such strings rare and
reviewable.
