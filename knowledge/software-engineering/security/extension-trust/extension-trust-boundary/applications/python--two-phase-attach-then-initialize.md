---
layer: application
type: application
subject: extension-trust-boundary
technique: two-phase-attach-then-initialize
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# A two-hook protocol for routes that exist before the engine

Read against `github:vllm-project/vllm` at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. The protocol is nine lines
(`vllm/plugins/endpoint_plugins/interface.py:43-70`, quoted in
`docs/design/endpoint_plugins.md:13-23`):

```python
class EndpointPlugin(Protocol):
    name: str
    required_tasks: tuple[SupportedTask, ...] | None

    def attach_router(self, app: FastAPI) -> None: ...

    async def init_state(
        self, engine_client: EngineClient | None, state: State, args: Namespace
    ) -> None: ...
```

Every element of the technique is visible in that signature, including the
one that matters most: `engine_client` is `EngineClient | None`, and the
optionality is not defensive typing.

## Why two hooks

`docs/design/endpoint_plugins.md:32` states the constraint in one sentence —
"Routes are registered before the engine exists" — and `:34-37` assigns the
phases to their host call sites:

| phase | called from | `engine_client` | work |
| --- | --- | --- | --- |
| A. route registration | `build_app()` | no | `attach_router(app)`; do not touch the engine |
| B. state init | `init_app_state()` | usually, `None` on the CPU-only render server | build a handler holding the client, store it on `state` |

The phases communicate through the application state object, which *is* the
state passed to phase B (`:39`), so an object stored in B is readable by a
handler registered in A via the request's application state at request time.
`attach_router`'s own docstring
(`vllm/plugins/endpoint_plugins/interface.py:63-69`) fixes the ordering that
makes shadowing possible: called "once during `build_app()` **after** all core
routers have been attached".

## The backend-less deployment is a named case with two permitted answers

The CPU-only render server has no engine client at all
(`docs/design/endpoint_plugins.md:41-50`). It still runs **both** phases for any
eligible plugin; phase B simply receives `None`. The contract then gives the
author exactly the two answers the technique demands, and no third:

- exclude `render` from `required_tasks`, so the loader never loads the plugin
  there — the declarative answer, evaluated by the host at
  `vllm/plugins/__init__.py:142-153`;
- accept being loaded and check for `None`, returning an error response rather
  than dereferencing a client that does not exist (`:48`).

The in-repo example takes the second and answers `503`
(`tests/plugins/vllm_add_dummy_endpoint_plugin`, cited at
`docs/design/endpoint_plugins.md:50`), and the end-to-end test drives a real
request through it:
`tests/plugins_tests/test_endpoint_plugins.py:181-209` builds the app for the
`render` task, asserts the route is attached, calls phase B with `None`,
asserts the captured client is `None`, and then asserts the live request
returns `503`. The not-ready outcome is verified over the wire, not asserted on
an internal flag.

`required_tasks` being a field rather than a convention is what makes the first
answer enforceable: `docs/design/endpoint_plugins.md:108` — "`required_tasks`
must intersect the server's supported tasks unless it is `None`. Use this to
keep a plugin from attaching routes on a server that can't service them."

## The failure a test is named after

`tests/plugins_tests/test_endpoint_plugins.py:166-179`,
`test_init_state_is_noop_without_phase_a`, carries its own reason:

> `init_app_state` callers that never ran `build_app` (e.g. `run_batch.py`,
> which builds a bare `State()`) must not crash just because
> `state.endpoint_plugins` was never set.

Phase B runs where phase A never did, in a host entry point that has nothing to
do with extensions. The test allowlists a plugin, calls phase B against a bare
state object, and asserts the plugin's field was **not** set — the initializer
did nothing, quietly and correctly.

Its complement is `:156-163`, `test_attach_is_noop_when_nothing_discovered`:
with the allowlist unset, phase A still writes `app.state.endpoint_plugins ==
[]`. An empty list, not an absent attribute — which is precisely what lets
phase B distinguish "phase A ran and found none" from "phase A never ran" and
treat only the second as a no-op.

## Compatibility, stated where authors will look

`docs/design/endpoint_plugins.md:134-136` names the supported surface and
excludes the rest: the protocol, the web-framework application object and the
engine client are supported; the internals of the in-tree serving handler
classes are "not a stable public contract yet. Treat them as use-at-your-own
risk." A two-phase contract whose phase-B object is unstable is worth saying
out loud, because phase B is exactly where an author is tempted to reach into
one.
