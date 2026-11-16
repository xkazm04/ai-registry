---
layer: application
type: application
subject: tenant-scoped-agent-runtime
technique: task-local-tenant-scope
stack: python
status: forged
verified_on: 2026-11-16
refresh_by: 2026-12-28
verified_against: python@3.14
---

# Python — one immutable scope value, and a pool that copies the context because the interpreter will not

The realization is the multiplexing gateway in `NousResearch/hermes-agent`, first
read at commit `0cbc6e37ac9fce50905157805c89fae06da93845`, re-resolved on
2026-09-23 against `9d799e0531c24c7f6015f45ca27e05022c3db81a`, and re-resolved
again on 2026-11-16 against `4162ecf11f611400fa6e5c42d2f360188ce50b39` (HEAD,
2026-11-15; `.python-version` reads `3.14`, `pyproject.toml:15`:
`requires-python = ">=3.11,<3.15"`). One gateway process serves every profile
in the install. Multiplexing is **the default**: an explicit
`gateway.multiplex_profiles: false` is "RETIRED as a topology opt-out"
(`hermes_cli/gateway_multiplex_mode.py:255`) and resolves like an unset key,
and the unset key is a request the boot preflight can refuse — a standalone
launcher, a single-profile install ("only one profile exists (nothing to
multiplex)", `:28`, checked at `:168-172`), a host that cannot migrate, a
secondary that still owns a gateway (`resolve_multiplex_mode`, `:252-285`).
The scope is on the default path of every install with two or more profiles.
The design document is `website/docs/developer-guide/multiplexing-gateway.md`,
whose constraint sentence (`:28-29`) is the technique's own: "profile A's turns
must never observe profile B's state."

## One scope value, built in order and installed once

At the first two reads the scope was two contextvars installed in order —
the home override, then a secret mapping built under it. That shape is gone.
`hermes_scope.py:17-24` states its replacement: the home override, the secret
mapping and the terminal policy "are ONE immutable :class:`ScopeState` in one
context variable, so they cannot drift apart", and a reset "removes its change
and replays the later ones", so "an out-of-order, repeated or stale reset
therefore lands on a state whole binds produce, never one profile's home next
to another's secrets." The variable is `_STATE` (`:229`); `push_state`
(`:284-291`) and `pop_state` (`:298-326`) are the only writers.

The order the technique argues for survives as a **build** order.
`agent/runtime_scope.py:76-145`, `bind_state`, builds the secret mapping under a
temporary home binding (`with push_state(home=home):`, `:124`) — "hydration
reads the profile's ``secrets:`` config through ``get_hermes_home()``, which
would otherwise still name whichever profile is bound now" — then publishes
scope, home, secrets and terminal policy in one `push_state` (`:144-145`);
"Every piece is computed before anything is installed, so a failure leaves
nothing bound" (`:103-104`). The gateway's `_profile_runtime_scope`
(`gateway/run.py:1788-1806`) is now one call to it: "One bind: the runtime
scope first, then home override, secrets ... and the profile's COMPLETE
terminal policy, never ambient TERMINAL_* a prior turn set (first-writer-wins
backend leak; #68559)" (`:1796-1798`).

The legacy setters still exist and still never touch the environment —
`set_hermes_home_override` "Deliberately does not mutate ``os.environ``
(shared by every thread in the process)" (`hermes_constants.py:33`) — but with
a scope bound, a call naming another profile "moves the whole scope (local) or
raises ``ScopeSwitchRefused`` (hosted)" (`:34-36`, implemented by
`legacy_switch`, `agent/runtime_scope.py:198-220`), and "code-health rule
HX016 blocks new direct calls to them" (`:8`). The secret module's docstring
(`agent/secret_scope.py:1-11`) still gives the rejected alternative: each
profile's `.env` keys "**cannot** be unioned into ``os.environ`` (profile A's
keys would leak into profile B's turns and subprocesses)", and the design
document still spells out the subprocess half — "every subprocess spawned with
`env=dict(os.environ)`" (`multiplexing-gateway.md:175`). `load_env_file`
(`agent/secret_scope.py:391-`) is "THE ``.env`` tokenizer", "Dict only — never
touches ``os.environ``" (`:394`), and "returns a fresh dict: callers mutate
what they get back" (`:400`).

## One resolver each, and a second one that must not follow the scope

`get_hermes_home()` (`hermes_constants.py:206-213`) is the single door:
override first, then the env var, then the platform default, by delegating to
`get_process_hermes_home` after the override check (`:213`). Because every
path resolution in the tree already called it, the migration cost is zero at
those call sites — config, `state.db`, skills, memory, SOUL, sessions, kanban,
goals, plugin discovery and MCP startup follow the active profile without
knowing the profile exists (`multiplexing-gateway.md:219-221`).

The named exception is `get_process_hermes_home()` (`:255-264`), "Hermes home
of the running process, ignoring task overrides", for process-level assets.
Two entry points, one implementation of the env/platform fallback — still the
two-resolvers-one-implementation shape. A third appeared since 2026-09-23 and
names a real pressure on it: an embedding host "that serves several profiles
and mirrors the active turn's profile into ``os.environ["HERMES_HOME"]`` for
legacy readers" (`:271-`, `pin_process_hermes_home`) would make the process
resolver follow the turn, so routing decisions read a pinned launch identity
instead (`get_routing_process_hermes_home`, `:294-`; #119242). The environment
write the technique forbids exists in one host, and the tree pays for it with
a third resolver.

## The enumerated seams

`multiplexing-gateway.md:110-113` lists them: secondary adapter startup,
connect and reconnect, the primary platform event handler, inbound
preprocessing, `/model` and session-info resolution, background tasks, and the
agent turn itself. Twenty-four `gateway/run_*.py` modules now enter
`_profile_runtime_scope` (`run_adapters.py`, `run_inbound.py`, `run_turn.py`,
`run_agent_cache.py`, `run_profile_reconcile.py`, `run_heartbeat_restore.py`
and others). `_async_profile_runtime_scope` (`gateway/run.py:1809-1814`) moves
the secret file reads off the event loop with `asyncio.to_thread` before
entering the sync scope.

The default-tenant rule is `load_gateway_config_for_runner` (`:1817-1859`):
under multiplexing the process-level config reload re-enters
`_profile_runtime_scope` for the default root (`:1848-1849`), not
`get_hermes_home()`, "which is the named launcher when a profile-scoped
process started the host. A scope miss must not fall through to that
process's ``os.environ``" (`:1821-1823`). The design document says the same:
"Config reloads run under the default profile's scope" (`:113-115`).

## Propagation into workers, made explicit

`gateway/run.py:1877` and `:1882` are the pattern in one line, once per served
profile inside that profile's scope:

```python
await loop.run_in_executor(None, copy_context().run, discover_mcp_tools)
```

`:256` repeats it for the context-compression bridge with the reason in a
comment — "copy_context carries profile secret scope / HERMES_HOME override
(executors don't propagate ContextVars)" — and `_run_in_executor_with_context`
(`:3958-3962`) is the runner's general form. The daemon pool now wraps every
submission and says why correctly: "Keep each task in its caller's profile
scope, even on a reused worker. Thread-start context cannot track later
submissions from other profiles (#54937). The stdlib worker context manages
initialization, not contextvars." (`tools/daemon_pool.py:26-35`). That is the
reference runtime's behaviour: in CPython 3.14 `submit` queues a callable and
a worker runs it with no per-submission context, and a new thread copies the
starting caller's context only when `sys.flags.thread_inherit_context` is set
(on by default only on free-threaded builds). Measured on 3.12, 3.13 and 3.15
with a one-worker pool and two tenants: a bare submission gave both tenants no
scope with the flag off, and gave the second tenant the **first** tenant's
scope with it on; a per-submission copy gave each its own either way.

The bridge test survives: `tests/gateway/test_profile_isolation_runtime.py:210-230`,
`test_run_async_worker_preserves_override`. The pool test survives too:
`tests/agent/test_secret_scope.py:572-588` — the scope reaches a daemon-pool
worker, and a scoped miss in the worker still returns `None` rather than the
`os.environ` value. **The hazard test is gone**: `test_raw_thread_loses_override`,
which asserted that "A bare thread falls back to the process default", no
longer exists, and its class (`:204-207`) keeps only the bridge test. On a
build that inherits at thread start that assertion fails, so it was a
statement about one build.

## Deviations and notes

- **The pool test's docstring still carries the old explanation.**
  `tests/agent/test_secret_scope.py:564-569` says "Bundled CPython runtime
  builds omit ``ThreadPoolExecutor``'s context propagation" and that the
  wrapper "restores stdlib context semantics". No CPython build propagates per
  submission. The pool's own comment was corrected; the test that locks the
  behaviour in still describes it wrongly.
- **The two resolvers have opposite fail directions.** `get_secret` raises
  `UnscopedSecretError` under multiplexing with no scope
  (`agent/secret_scope.py:266-282`). `get_hermes_home` never raises: it
  returns the process home, and its only warning, `_warn_profile_fallback_once`
  (`hermes_constants.py:175-203`, #18594), is a one-shot stderr line that fires
  when `HERMES_HOME` is unset *and* a non-default sticky profile is active — not
  when an unscoped call happens under multiplexing. Multiplexing being the
  default puts that silent fallback on the default path of every multi-profile
  install. The standard is unchanged.
- **The process-level reload falls back to the unscoped load, at debug level.**
  `load_gateway_config_for_runner` wraps the scoped reload in `except
  Exception` and returns the unscoped `cfg` with `logger.debug("multiplex
  default-scope config reload failed; using unscoped load")`
  (`gateway/run.py:1847-1852`) — the load its own docstring says must not
  happen ("A scope miss must not fall through to that process's
  ``os.environ``", `:1822-1823`). The `set_multiplex_active(True)` call ahead
  of it is swallowed the same way (`:1838-1842`). This is the warn-only
  fallback the 2026-09-23 note expected the default-on mode to promote: a
  fallback that does not say it fired, on the default path.
- **The fail direction is now per scope, not only per process.** With a scope
  bound, a miss returns the default when `serves_routed_profile()` is true and
  reads the environment otherwise (`agent/secret_scope.py:266`); the predicate
  is always true under multiplexing and, without it, true when a scope or
  override names a home other than the process's own (`:81-97`). The launch
  profile keeps its injected credentials by having the frozen launch
  environment copied into its scope when the scope is built
  (`_bind_whole_profile`, `agent/runtime_scope.py:148-163`;
  `multiplexing-gateway.md:359-361`), not by a read-time fall-through.
- **The inventory diverged from the code in the milder direction, still.**
  `multiplexing-gateway.md:375` lists terminal environment as "Global by
  allowlist; tools read it from the process environment", while the terminal
  policy is now one field of the bound scope value. The document also carries
  both stories at once: the "Scope composition" diagram still shows "the same
  two context-local scopes" (`:86-119`), and the "One scope value" subsection
  directly below it (`:121-`) replaces them. The secret scope keeps
  `TERMINAL_` on its global prefix list (`agent/secret_scope.py:231-235`).
- **The global allowlist enforces its split by comment, not by construction.**
  The exceptions are carried in writing — `API_SERVER_KEY` "is a credential:
  NOT here" (`:213-216`), relay auth material "deliberately stay[s]
  profile-scoped" (`:217-225`) — but `_GLOBAL_ENV_PREFIXES` (`:231-235`) admits
  whole prefixes (`HERMES_KANBAN_`, `HERMES_TELEGRAM_`, `TERMINAL_`), and the
  `HERMES_TELEGRAM_` entry is still commented "tuning knobs ... — NOT the
  token". Prefix membership cannot express "adjacent names split".
- **The keyed caches have no production reaper; the loader no longer needs
  one to stay correct.** `_reset_plugin_managers_for_tests`
  (`hermes_cli/plugins.py:849-`) is still the only path that drops the whole
  keyed manager cache (`_plugin_managers_by_home`, `:718`), and it is still
  "Test-only". But a second profile's same-slug plugin no longer shares a
  module name: `_directory_module_name` (`hermes_cli/plugins_loader.py:795-804`)
  gives "the bare ``hermes_plugins.<slug>`` for the first scope that claims it,
  a ``__home_<digest>`` suffix for any other scope". The switch path namespaces
  instead of evicting. The session handle cache (`RecoverableHandleCache`,
  `gateway/session_db_recovery.py:55-`) still names no per-entry eviction,
  only `close_all` (`:161`). Both caches grow with the number of profiles a
  long-lived process has ever served.
- **The legacy single-slot pointer has no retirement date.**
  `hermes_cli/plugins.py:711-713` keeps `_plugin_manager` "so tests that
  monkeypatch ``_plugin_manager`` keep working", and `:833-837` adopts an
  injected manager into the keyed cache. The technique permits the shim and
  requires a stated end; none is written.

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

The 2026-09-17 note recorded that the vendor's structural pass had reduced the
tree's non-test Python source by 34.4%, merged two days after the first read,
and that a re-scan against the merged tree was owed. It was run on 2026-09-23 against `9d799e05` (13,043
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

## Currency - 2026-11-16

Re-resolved against `4162ecf1` (a shallow clone at HEAD, 2026-11-15). Every
anchor above was re-opened and re-pinned. What moved: the two contextvars
became one immutable scope value with replaying resets, and the order the
technique names became a build order inside a single install; the daemon
pool's 3.14 claim was corrected in the pool's own comment (not yet in its
test's docstring); the bare-thread hazard test was deleted; the plugin loader
namespaces a second profile's same-slug plugin instead of sharing the name;
the secret resolver's fail direction became per scope; the pinned launch
identity was added for a host that mirrors the turn into the environment; and
single-profile installs now stay standalone. Not re-run: the gateway itself
and its test suite. The pool and thread behaviour was measured with a
synthetic fixture on 3.12.15, 3.13.16 and 3.15.0 (no 3.14 interpreter on this
machine; the 3.14 source was read instead).

The volatile figures in the 2026-09-23 section were checked against the
vendor's post (nousresearch.com/refactoring-hermes-with-1393-agents, opened
2026-11-16): "It reduced non-test Python source by 34.4%" and "I merged the PR
on September 4th", two days after the first read on 2026-09-02. The section
had said the tree was "refactored by 34.4%"; the post's figure is a
reduction, and the sentence now says so. The six-week window is this
registry's own override, not a vendor figure. `refresh_by` stays an override
on that window (2026-12-28) for the reason given above. The tree moved from
`9d799e05` (re-read 2026-09-23) to `4162ecf1` (2026-11-15) in under eight weeks and replaced the mechanism this
application was written about.
