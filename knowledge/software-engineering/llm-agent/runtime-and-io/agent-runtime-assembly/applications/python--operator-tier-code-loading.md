---
layer: application
type: application
subject: agent-runtime-assembly
technique: operator-tier-code-loading
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Operator-tier code loading in the deer-flow gateway

How deer-flow (commit `08b27aef`, read from its own clone) loads third-party
Python extensions into a FastAPI gateway process: which file may name code,
what a load failure does, how a contributed middleware fails, and why the
fail-open decision is made by the *origin* of a cancellation. Paths are
under `backend/`; `extensions/AGENTS.md` is
`packages/harness/deerflow/extensions/AGENTS.md`.

## Two configuration files, two trust tiers

The guide's opening paragraph is the technique's tier rule verbatim:
extensions "can expose an `install(registry, config)` function and be
loaded, in deterministic order, from the startup-only top-level `plugins:`
list in `config.yaml`. Keep this list out of `extensions_config.json`: the
latter is writable through Gateway APIs, while importing Python entry points
is an operator-controlled code execution boundary"
(`extensions/AGENTS.md:3-7`). The second file is genuinely service-writable
— `PUT`/`PATCH /api/mcp/config` and skill updates write it at runtime, so
the production compose mounts it read-write "while `config.yaml` stays `:ro`"
(`backend/AGENTS.md:23`). `create_app()` reads the code-naming list from the
startup config alone: `configured_plugins = get_app_config().plugins`
(`app/gateway/app.py:766`), typed as `list[ExtensionSpec]` on `AppConfig`
(`packages/harness/deerflow/config/app_config.py:204-207`). The
service-writable model has no such field; there is nothing to ignore
because the key cannot be expressed there.

The guide also names the substitute-for-the-boundary trap in the adjacent
MCP surface: the stdio launch allowlist "is defense in depth, not a trust
boundary ... the fix for that is not a bigger denylist"
(`packages/harness/deerflow/mcp/AGENTS.md:35`) — the same stance the
technique takes toward refusing contribution kinds rather than enumerating
what they may do.

## Deterministic order; fatal only when `required`

Load order is the declared list order (`extensions/AGENTS.md:3-4`). A plugin
"marked `required: true` fails Gateway construction when it cannot load;
optional plugins fail open with attributed diagnostics"
(`extensions/AGENTS.md:7-8`). The loader raises `ExtensionLoadError` on a
required spec at each failure point — import failure, non-callable entry
point, uninspectable or invalid API marker
(`packages/harness/deerflow/extensions/loader.py:192-218`) — and swallows the
same failures into diagnostics otherwise. `create_app()` treats the raise as
part of "the startup contract. Booting without it would silently change
configured behaviour" (`app/gateway/app.py:772-775`), and separately refuses
to report a *configuration* failure as an extension failure, because doing so
"would silently drop a `required: true` extension instead of failing the
boot" (`app.py:759-762`).

The default is opt-in for exactly the reason the technique gives: `required:
true` "turns any later load failure — a broken wheel, a missing native
library, a deleted snapshot — into a Gateway startup abort recoverable only
through shell access, so it is an explicit `install --required` opt-in rather
than the managed default" (`extensions/AGENTS.md:25-28`).

## Installation as a transaction, validated before the installer executes

`ExtensionManager` "owns the package/config transaction"
(`extensions/AGENTS.md:20`): a controlled `uv add`, the dependency group and
lock update, one packaging entry point discovered, one managed `plugins:`
record inserted (`:20-25`). Validation precedes execution: "Install
validates the selected config file before running any uv command, because
`uv add`/`uv sync` execute the package's build backend: a config this manager
could never write to must fail before that code runs, not afterwards through
rollback" (`:32-35`). Environment overrides that could redirect the project,
interpreter or TLS validation are discarded, and uv is pinned with a
four-location test (`:48-55`, `:121-128`). Local installs are snapshots,
never editable links (`:62`); the lock is audited after every mutation for
references the image build cannot reproduce, failing the whole transaction
(`:82-88`); and "production container startup never resolves or installs an
extension from the network" (`:113-115`).

Two upward lessons the technique took from this transaction. The rollback
"is deliberately not blanket: when recovery detects a concurrent external
edit to the dependency files or the config it preserves that edit and raises
instead" (`:39-42`). And the operator's management wrappers "bootstrap the
checkout environment without the extension group ... so a broken or
disappeared extension source cannot trigger project validation before the
operator can list, disable, or remove it" (`:132-136`).

## Isolation, and fail-open decided by origin

Contributed middlewares are wrapped by `IsolatedMiddleware`: "extension
failures emit diagnostics and fail open without repeating a downstream
model/tool side effect. The wrapper mirrors lifecycle hooks, tools,
transformers, and state schema implemented by the inner middleware"
(`extensions/AGENTS.md:193-196`; the wrapper builds a cached subclass
defining exactly the inner's hooks, `extensions/isolation.py:132-161`).

The wrapper's own docstring carries the qualification that became a rule in
the technique: "All first-version contributions are observational, hence
fail-open. A future intercepting (decision-making) contribution would need to
fail closed and must opt out of this wrapper explicitly"
(`extensions/isolation.py:22-24`).

The origin rule is stated and implemented. "Fail-open is decided by the
*origin* of a failure, not by its base class, because `CancelledError`
reaches a contributor's `except` for two unrelated reasons. Only a genuine
cancellation of the host task increments `asyncio.Task.cancelling()`, so
`_notify_each` propagates on that and contains everything else: a
contributor that lets a `CancelledError` escape — an extension implementing
an internal timeout with cancellation, say — must not skip its successors,
and must not reach the worker's deferred-interrupt path, which would end an
otherwise successful run as cancelled" (`extensions/AGENTS.md:225-232`).
`_host_is_cancelling()` reads `task.cancelling() > 0` on the current task
(`extensions/notify.py:50-67`) and is consulted at both notification sites
(`notify.py:90, 161`). Gateway-lifetime services get the same treatment: "A
service-originated `CancelledError` fails open, while a new cancellation of
the host task still propagates through the exit stack" (`AGENTS.md:280-282`).

## The snapshot, and the closed contract

Each run "resolves the immutable loaded-extension snapshot once and binds
that same object through task-store allocation, hooks, and synchronous agent
construction, so a concurrent singleton replacement cannot mix two extension
generations" (`extensions/AGENTS.md:205-208`). Contribution kinds are closed
in both directions: "Any future contribution kind must be added to the
public contract and host runtime in the same slice; never accept a
registration method that the current host silently ignores" (`:345-347`).
Contributed lifespans, mounts and socket routes are refused outright
(`:293-300`).

## Reconciliation summary

Confirmed: code-naming keys only in the startup file, unrepresentable in the
service-writable one; deterministic declared order; `required` opt-in with
the shell-access argument; validate-before-installer, discarded environment
overrides, pinned installer, snapshot-not-link, lock audit, no network
resolution at production startup; isolation with attributed diagnostics and
no repeated side effects; fail-open by `Task.cancelling()`, not exception
class; refusal of lifespans, mounts and socket routes. Upward lessons taken
into the technique: fail-open is for observational hooks and an intercepting
hook must opt out and fail closed; non-blanket rollback that preserves a
concurrent edit; the management tool bootstraps without the extension group;
one immutable snapshot per run; never accept a registration the host
ignores. Deviations: none against the standard as written. Not present by
scope: a runtime test that a code-naming key written through the API is
ignored — the tree makes the case unrepresentable rather than tested.
