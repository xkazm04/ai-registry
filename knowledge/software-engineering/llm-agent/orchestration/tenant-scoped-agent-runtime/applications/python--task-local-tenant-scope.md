---
layer: application
type: application
subject: tenant-scoped-agent-runtime
technique: task-local-tenant-scope
stack: python
status: forged
verified_on: 2026-09-23
refresh_by: 2026-11-05
verified_against: python@3.12
---

# Python — two contextvars, one composed scope, and a pool that copies the context because the interpreter will not

The realization is the multiplexing gateway in `NousResearch/hermes-agent`, first
read at commit `0cbc6e37ac9fce50905157805c89fae06da93845` and re-resolved on
2026-09-23 against `9d799e0531c24c7f6015f45ca27e05022c3db81a` (HEAD;
`pyproject.toml:15`: `requires-python = ">=3.11,<3.14"`). One gateway process
serves every profile in the install. At the first read that was an opt-in
flag; it is now **the default** — `gateway.multiplex_profiles` defaults to
`true`, and an explicit `false` is "RETIRED as a topology opt-out", warned
about and resolved like an unset key (`hermes_cli/gateway_multiplex_mode.py:161-191`);
only a real blocker (an s6 container, a secondary that still owns a gateway, a
duplicate bot credential) keeps a boot standalone. The technique's stakes rose
with that change: the scope is now on the default path, not behind a flag. The
design rationale moved with the root `docs/` tree to
`website/docs/developer-guide/multiplexing-gateway.md`, whose constraint
sentence (`:28-29`) is the technique's own: "profile A's turns must never
observe profile B's state."

## The two contextvars, installed in order

`hermes_constants.py:19-20` declares the home override —
`_HERMES_HOME_OVERRIDE: ContextVar[str | object]` with an `_UNSET` sentinel
rather than `None`, so "no override" and "override set to nothing" stay
distinguishable. `set_hermes_home_override` (`:28-34`) returns the `Token`;
`reset_hermes_home_override` (`:37-39`) restores it. The docstring states the
rule the technique argues for: it "Deliberately does not mutate ``os.environ``
(shared by every thread in the process)" (`:31`).

`agent/secret_scope.py:53` is the second variable, `_SECRET_SCOPE`, holding a
mapping rather than a path. The module docstring (`:1-11`) gives the rejected
alternative: each profile's `.env` keys "**cannot** be unioned into
``os.environ`` (profile A's keys would leak into profile B's turns and
subprocesses)"; the design document spells out the subprocess half — "every
subprocess spawned with `env=dict(os.environ)`" (`multiplexing-gateway.md:124-125`).

The composition is `gateway/run.py:1805-1836`, `_profile_runtime_scope`. Order is
visible in the code and matches the technique: `set_hermes_home_override` at
`:1816` first, then the secret mapping is *built under it* — `:1820` calls
`_load_profile_secret_scope`, which at `:1790-1802` installs the home override,
hydrates and builds, and resets in a `finally` — and only then `set_secret_scope`
at `:1824`. Both unwind in the `finally` at `:1833-1835`, secrets before home.
`build_profile_secret_scope` (`agent/secret_scope.py:319-336`) returns a fresh
dict, and `load_env_file` (`:279-`) is now "THE ``.env`` tokenizer" every reader
parses through — "Dict only — never touches ``os.environ``" (`:282`) — and
"Always returns a fresh dict: callers mutate what they get back".

## One resolver each, and a second one that must not follow the scope

`get_hermes_home()` (`hermes_constants.py:109-116`) is the single door: override
first, then the env var, then the platform default. Because every path
resolution in the tree already called it, the migration cost is zero at those
call sites — config, `state.db`, skills, memory, SOUL, sessions, kanban, goals,
plugin discovery and MCP startup follow the active profile without knowing the
profile exists (`multiplexing-gateway.md:166-175`).

The named exception the technique requires is `get_process_hermes_home()`
(`:158-165`), "Hermes home of the running process, ignoring task overrides",
for process-level assets that must stay visible while a request is scoped to
another profile. The shape changed since the first read and stayed correct:
the private `_hermes_home_from_env` helper both resolvers shared is gone, and
`get_hermes_home` now *delegates* to `get_process_hermes_home` after the
override check (`:116`). One implementation of the env/platform fallback, two
entry points that differ only in whether the scope is consulted — still the
two-resolvers-one-implementation shape, not a boolean argument.

## The enumerated seams

`multiplexing-gateway.md:110-115` lists them: secondary adapter startup,
connect and reconnect, the primary platform event handler, inbound
preprocessing, `/model` and session-info resolution, background tasks, and the
agent turn itself. The wrappers no longer live in one file; after the split
they are spread across `gateway/run.py` and the `gateway/run_*.py` modules
(`run_adapters.py`, `run_inbound.py`, `run_agent_cache.py`,
`run_profile_reconcile.py`, `run_heartbeat_restore.py` and others each enter
`_profile_runtime_scope`), and `_async_profile_runtime_scope`
(`gateway/run.py:1838-1843`) moves the file reads off the event loop with
`asyncio.to_thread` before entering the sync scope.

The default-tenant rule is `load_gateway_config_for_runner` (`:1846-1872`):
under multiplexing the process-level config reload re-enters
`_profile_runtime_scope(Path(home))` for the default profile (`:1866`),
because "unscoped ``_getenv`` falls to ``os.environ``, which often lacks a
token living only under ``profiles/<name>/.env``" (`:1850-1852`). Process work
runs under a chosen scope, not under none.

There is a **third** seam the design document does not carry in its scope
diagram: `:1826-1830` installs `tools.terminal_scope.install_and_reset_profile_terminal_scope`
around the yield — "Install the routed profile's COMPLETE terminal policy,
never ambient TERMINAL_* a prior turn set" — because otherwise "terminal_tool
reads the process-global TERMINAL_* vars a previous profile's turn may have
pinned (first-writer-wins backend leak; #68559)". That is the technique's
race-shaped row, found and closed.

## Propagation into workers, made explicit

`gateway/run.py:1894` and `:1899` are the pattern in one line, now once per
served profile inside that profile's scope:

```python
await loop.run_in_executor(None, copy_context().run, discover_mcp_tools)
```

`:253-256` repeats it for the context-compression bridge with the reason in a
comment — "copy_context carries profile secret scope / HERMES_HOME override
(executors don't propagate ContextVars)" — and `_run_in_executor_with_context`
(`:4301-4305`) is the runner's general form. The daemon-pool source still
claims (`tools/daemon_pool.py:27-31` at HEAD) that stdlib ThreadPoolExecutor
propagates context per submission "from 3.14" and that the extra copy is then a
no-op. That claim is incorrect: CPython 3.14.0 submits callable/argument tuples
and reuses worker threads without capturing a new Context per submission.
Thread-start inheritance depends on the build flag and is a different
operation. The source's explicit copy_context wrapper remains useful, but its
explanation that the extra copy becomes a no-op is unsupported.

Both proof tests exist; the isolation suite moved under `tests/gateway/`.
`tests/gateway/test_profile_isolation_runtime.py:208-224`,
`test_raw_thread_loses_override`, asserts the hazard: "A bare thread falls back
to the process default — this is WHY the fix primitive is needed. (Asserted as
the hazard, not the desired state.)" `:227-246` asserts the async bridge keeps
it. `tests/agent/test_secret_scope.py:364-380` covers the pool: the scope
reaches the worker, and a scoped miss in the worker still returns `None`
rather than the `os.environ` value.

## Deviations and notes

- **The two resolvers have opposite fail directions.** `get_secret` raises
  `UnscopedSecretError` under multiplexing with no scope
  (`agent/secret_scope.py:165-175`). `get_hermes_home` never raises: it returns
  the process home, and its only warning, `_warn_profile_fallback_once`
  (`hermes_constants.py:81-106`, #18594), is a one-shot stderr line that fires
  when `HERMES_HOME` is unset *and* a non-default sticky profile is active — not
  when an unscoped call happens under multiplexing. The first read quoted the
  reason for not raising ("would brick 30+ module-level callers that import this
  at load time"); that comment is no longer in the tree, and the behaviour it
  justified is unchanged. An unscoped home resolution under multiplexing is
  therefore a silent-or-warned fallback with cross-profile read risk of config,
  skills, memory and the session store — the exact failure the credential path
  refuses to allow. The import-time constraint is real; the standard is
  unchanged.
- **The inventory diverged from the code in the milder direction.**
  `multiplexing-gateway.md:306` still lists terminal environment as
  "Global by allowlist; tools read it from the process environment", while
  `gateway/run.py:1826-1830` scopes it per turn. The row was not removed in the
  change that closed it. The secret scope keeps `TERMINAL_` on its global
  prefix list (`agent/secret_scope.py:130-134`), which is consistent with the
  row and not with the terminal scope — two mechanisms describe one name
  family differently.
- **The global allowlist enforces its split by comment, not by construction.**
  `agent/secret_scope.py:98-134` carries the correct exceptions in writing —
  `API_SERVER_KEY` deliberately absent (`:113-115`), relay auth material
  deliberately absent (`:119-123`) — but `_GLOBAL_ENV_PREFIXES` (`:130-134`)
  admits whole prefixes (`HERMES_KANBAN_`, `HERMES_TELEGRAM_`, `TERMINAL_`),
  so a future credential-bearing name under one of them joins the global side
  automatically. The `HERMES_TELEGRAM_` entry is commented "tuning knobs … —
  NOT the token", which is the split held by a comment. Prefix membership
  cannot express "adjacent names split".
- **The keyed caches have no production reaper.**
  `hermes_cli/plugins.py:1610-1631` (`_reset_plugin_managers_for_tests`) is the
  only path that drops the whole keyed manager cache (`_plugin_managers_by_home`,
  `:1562`) and purges submodules, and it is explicitly "Test-only". The
  per-resolved-path session handle cache (`gateway/run.py:3705-3710`, now a
  `RecoverableHandleCache`, `gateway/session_db_recovery.py:46-131`) heals failed
  opens but still names no per-entry eviction — only `close_all` at shutdown.
  Both grow with the number of profiles a long-lived process has ever served.
- **The legacy single-slot pointer has no retirement date.**
  `hermes_cli/plugins.py:1555-1557` keeps `_plugin_manager` "so tests that
  monkeypatch ``_plugin_manager`` keep working", and `:1596-1600` adopts an
  injected manager into the keyed cache. The technique permits the shim and
  requires a stated end; none is written. The first read also checked
  `docs/ADR.md:38-62`; that file was deleted with the root `docs/` tree on
  2026-09-13 and has no successor in `website/docs/developer-guide/`.

## Architecture source check - 2026-09-09

Read the pinned daemon-pool source, CPython 3.14.0 worker submission/dispatch and
the official context/thread documentation. Context copies preserve bindings;
mutable values referenced by them are not deep-copied. Python 3.14 Thread has a
context parameter with build-dependent inheritance defaults; this does not make
every pooled submission capture its caller. asyncio.to_thread explicitly propagates
context and is a different bridge.

A local Python 3.12.1 fixture reused one worker for two synthetic tenants: bare
submission had no scope, fresh per-submission copies saw each tenant, and the
worker returned to its original context. A second assertion showed a dictionary
mutation inside a copied context visible to the parent. These are primitive-level
checks, not a rerun of Hermes or verification of its listed call sites. The
historical verified_on and verified_against fields remain unchanged.

Sources: [pinned daemon pool](https://github.com/NousResearch/hermes-agent/blob/0cbc6e37ac9fce50905157805c89fae06da93845/tools/daemon_pool.py),
[CPython 3.14.0 pool](https://github.com/python/cpython/blob/v3.14.0/Lib/concurrent/futures/thread.py),
[context semantics](https://docs.python.org/3.14/library/contextvars.html),
[thread inheritance](https://docs.python.org/3.14/library/threading.html#threading.Thread),
[to_thread](https://docs.python.org/3.14/library/asyncio-task.html#asyncio.to_thread),
[module cache semantics](https://docs.python.org/3.14/reference/import.html#the-module-cache).


## Currency - 2026-09-23

The 2026-09-17 note recorded that the tree had been refactored by 34.4% of its
non-test source two days after the first read, and that a re-scan against the
merged tree was owed. It was run on 2026-09-23 against `9d799e05` (13,043
commits past the first pin): every claim above re-resolved and the anchors were
re-pinned. What moved: multiplexing became the default (explicit opt-out
retired); the design document and the proof tests moved (`website/docs/...`,
`tests/gateway/`); the shared `_hermes_home_from_env` helper became direct
delegation; the "brick 30+ callers" comment is gone while the non-raising
behaviour it explained is not; `docs/ADR.md` was deleted without a successor.
The daemon-pool 3.14 claim is still in the source and still unsupported.
`refresh_by` is kept as an override, on the original six-week window: the
claims are line-anchored in a tree that moves by hundreds of commits a day, far
faster than the Python stack clock assumes.
