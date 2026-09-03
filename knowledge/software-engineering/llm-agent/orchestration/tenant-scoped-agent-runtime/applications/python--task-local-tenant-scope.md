---
layer: application
type: application
subject: tenant-scoped-agent-runtime
technique: task-local-tenant-scope
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Python — two contextvars, one composed scope, and a pool that copies the context because the interpreter will not

The realization is the multiplexing gateway in `NousResearch/hermes-agent` at
commit `0cbc6e37ac9fce50905157805c89fae06da93845` (`pyproject.toml:15`:
`requires-python = ">=3.11,<3.14"`). One gateway process serves every profile in
the install behind an opt-in flag, and the design rationale is
`docs/design/multiplexing-gateway.md`, whose constraint sentence (`:19-22`) is the
technique's own: "profile A's turns must never observe profile B's state."

## The two contextvars, installed in order

`hermes_constants.py:17-19` declares the home override —
`_HERMES_HOME_OVERRIDE: ContextVar[str | object]` with an `_UNSET` sentinel
rather than `None`, so "no override" and "override set to nothing" stay
distinguishable. `set_hermes_home_override` (`:30-37`) returns the `Token`;
`reset_hermes_home_override` (`:40-42`) restores it. The docstring states the
rule the technique argues for: "It deliberately does not mutate ``os.environ``
because that is shared by every thread in the process."

`agent/secret_scope.py:56-58` is the second variable, `_SECRET_SCOPE`, holding a
mapping rather than a path. The module docstring (`:1-22`) gives the rejected
alternative in one sentence: unioning every profile's `.env` into `os.environ`
"would leak profile A's keys to profile B's turns, and to every subprocess
spawned with ``env=dict(os.environ)``."

The composition is `gateway/run.py:2611-2664`, `_profile_runtime_scope`. Order is
visible in the code and matches the technique: `set_hermes_home_override` at
`:2641` first, then the secret mapping is *built under it* — `:2645` calls
`_load_profile_secret_scope`, which at `:2603-2608` installs the home override,
hydrates and builds, and resets in a `finally` — and only then `set_secret_scope`
at `:2651`. Both unwind in the `finally` at `:2662-2664`, secrets before home.
`build_profile_secret_scope` (`agent/secret_scope.py:289-310`) returns a fresh
dict, and `load_env_file` (`:243-286`) parses the file "WITHOUT touching
``os.environ``" — "that isolation is the whole point" (`:252`).

## One resolver each, and a second one that must not follow the scope

`get_hermes_home()` (`hermes_constants.py:114-139`) is the single door: override
first (`:132-134`), then the env var, then the platform default. Because every
path resolution in the tree already called it, the migration cost is zero at
those call sites — config, `state.db`, skills, memory, sessions and plugin
discovery follow the active profile without knowing the profile exists
(`docs/design/multiplexing-gateway.md:109-118`).

The named exception the technique requires is `get_process_hermes_home()`
(`:154-170`), which "never follows the context-local override" and resolves only
the process env var. Both delegate to one private helper, `_hermes_home_from_env`
(`:62-74`), whose docstring says why — "Shared by :func:`get_hermes_home` and
:func:`get_process_hermes_home` so the two never drift." That is the
two-resolvers-one-implementation shape, not a boolean argument.

## The enumerated seams

`docs/design/multiplexing-gateway.md:61-66` lists them, and `gateway/run.py`
carries the wrappers: secondary adapter startup and the profile-scoped handler
install (`:17243`, `:17342`, `:17426`, `:17526`), the primary platform event
handler and reconnect (`:17804`, `:17868`, `:17906`, `:17918`), inbound
preprocessing (`:20910-20920`), background tasks (`:25411-25421`), the agent turn
(`:31116-31136`), and `_async_profile_runtime_scope` (`:2667-2672`) which moves
the file reads off the event loop with `asyncio.to_thread` before entering the
sync scope.

The default-tenant rule is `load_gateway_config_for_runner` (`:2675-2707`): under
multiplexing the process-level config reload re-enters
`_profile_runtime_scope(Path(home))` for the default profile, because the
unscoped load "falls through to ``os.environ``, which often has no
``TELEGRAM_BOT_TOKEN`` once the token lives only under
``profiles/<name>/.env``" (`:2685-2687`). Process work runs under a chosen
scope, not under none.

There is a **third** seam the design document does not carry in its scope
diagram: `:2652-2659` installs `tools.terminal_scope.install_and_reset_profile_terminal_scope`
around the yield, because without it "terminal_tool reads the process-global
TERMINAL_* vars a previous profile's turn may have pinned (first-writer-wins
backend leak)". That is the technique's race-shaped row, found and closed.

## Propagation into workers, made explicit

`gateway/run.py:2730` is the pattern in one line:

```python
await loop.run_in_executor(None, copy_context().run, discover_mcp_tools)
```

and `:394-399` repeats it for the context-compression bridge with the reason in a
comment — "The default executor does not propagate ContextVars on the Python
runtimes Hermes currently ships." `tools/daemon_pool.py:19-32` states the version dependency the technique
generalises: stdlib `ThreadPoolExecutor` "only does this from Python 3.14; on the
3.11-3.13 runtimes Hermes ships, a bare pool worker starts with an EMPTY Context
and silently drops contextvar-based state (profile secret scope, HERMES_HOME
override) — under the multiplexed gateway a credential read in such a worker
fails closed with ``UnscopedSecretError``." `submit` (`:49-60`) copies
unconditionally, noting that "on 3.14+ the inner ``ctx.run`` re-applies the same
immutable context and is a no-op" — the wrapper-not-call-site placement the
technique asks for.

Both proof tests exist. `tests/test_profile_isolation_runtime.py:121-137`,
`test_raw_thread_loses_override`, asserts the hazard: "A bare thread falls back
to the process default — this is WHY the fix primitive is needed. (Asserted as
the hazard, not the desired state.)" `:140-159` asserts the bridge keeps it.
`tests/agent/test_secret_scope.py:364-380` covers the pool: the scope reaches the
worker, and a scoped miss in the worker still returns `None` rather than the
`os.environ` value.

## Deviations and notes

- **The two resolvers have opposite fail directions.** `get_secret` raises
  `UnscopedSecretError` under multiplexing with no scope
  (`agent/secret_scope.py:192-200`). `get_hermes_home` never raises: it emits a
  one-shot stderr warning (`hermes_constants.py:77-111`) and returns the process
  default, explicitly because raising "would brick 30+ module-level callers that
  import this at load time" (`:126-127`). An unscoped home resolution under
  multiplexing is therefore a *silent* cross-profile read of config, skills,
  memory and the session store — the exact failure the credential path refuses to
  allow. The import-time constraint is real; the standard is unchanged.
- **The inventory diverged from the code in the milder direction.**
  `docs/design/multiplexing-gateway.md:188` still lists terminal environment as
  "Global by allowlist; tools read it from the process environment", while
  `gateway/run.py:2652-2659` scopes it per turn. The row was not removed in the
  change that closed it.
- **The global allowlist enforces its split by comment, not by construction.**
  `agent/secret_scope.py:98-134` carries the correct exceptions in writing —
  `API_SERVER_KEY` deliberately absent (`:111-114`), relay auth material
  deliberately absent (`:124-128`) — but `_GLOBAL_ENV_PREFIXES` (`:135-139`)
  admits a whole platform prefix, so a future credential-bearing name under that
  prefix joins the global side automatically. Prefix membership cannot express
  "adjacent names split".
- **The keyed caches have no production reaper.**
  `hermes_cli/plugins.py:6255-6274` (`_reset_plugin_managers_for_tests`) is the
  only path that drops the whole keyed manager cache and purges submodules, and
  it is explicitly test-only (`:6258-6260`). The per-resolved-path session handle
  cache (`gateway/run.py:7999-8015`) likewise names no eviction. Both grow with
  the number of profiles a long-lived process has ever served.
- **The legacy single-slot pointer has no retirement date.**
  `hermes_cli/plugins.py:6151-6155` keeps `_plugin_manager` for monkeypatching
  callers, and `:6234-6244` adopts an injected manager into the keyed cache. The
  technique permits the shim and requires a stated end; none is written here or
  in `docs/ADR.md:38-62`.
