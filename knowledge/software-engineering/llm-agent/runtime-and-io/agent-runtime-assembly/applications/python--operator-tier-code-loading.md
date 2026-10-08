---
layer: application
type: application
subject: agent-runtime-assembly
technique: operator-tier-code-loading
stack: python
status: forged
verified_on: 2026-10-06
verified_against: python@3.12
---

# Operator-tier code loading in the deer-flow gateway

How deer-flow (commit `08b27aef`, read from its own clone; re-verified at
`53df22bd` on 2026-10-06, every line number below is the newer commit's) loads third-party
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
(`backend/AGENTS.md:26`). `create_app()` reads the code-naming list from the
startup config alone: `configured_plugins = get_app_config().plugins`
(`app/gateway/app.py:1138`), typed as `list[ExtensionSpec]` on `AppConfig`
(`packages/harness/deerflow/config/app_config.py:244-247`). The
service-writable model has no `plugins` field, so that key cannot be
expressed there. It is not the only code-naming key, though - see the
deviation below.

The guide also names the substitute-for-the-boundary trap in the adjacent
MCP surface: the stdio launch allowlist "is defense in depth, not a trust
boundary ... the fix for that is not a bigger denylist"
(`packages/harness/deerflow/mcp/AGENTS.md:64`) — the same stance the
technique takes toward refusing contribution kinds rather than enumerating
what they may do.

## Deterministic order; fatal only when `required`

Load order is the declared list order (`extensions/AGENTS.md:3-4`). A plugin
"marked `required: true` fails Gateway construction when it cannot load;
optional plugins fail open with attributed diagnostics"
(`extensions/AGENTS.md:7-8`). The loader raises `ExtensionLoadError` on a
required spec at each failure point — import failure, non-callable entry
point, uninspectable or invalid API marker
(`packages/harness/deerflow/extensions/loader.py:194-220`) — and swallows the
same failures into diagnostics otherwise. `create_app()` treats the raise as
part of "the startup contract. Booting without it would silently change
configured behaviour" (`app/gateway/app.py:1144-1147`), and separately refuses
to report a *configuration* failure as an extension failure, because doing so
"would silently drop a `required: true` extension instead of failing the
boot" (`app.py:1131-1134`).

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
four-location test (`:52-59`, `:129-136`). Local installs are snapshots,
never editable links (`:70`); the lock is audited after every mutation for
references the image build cannot reproduce, failing the whole transaction
(`:90-96`); and "production container startup never resolves or installs an
extension from the network" (`:121-123`).

Two upward lessons the technique took from this transaction. The rollback
"is deliberately not blanket: when recovery detects a concurrent external
edit to the dependency files or the config it preserves that edit and raises
instead" (`:39-42`). And the operator's management wrappers "bootstrap the
checkout environment without the extension group ... so a broken or
disappeared extension source cannot trigger project validation before the
operator can list, disable, or remove it" (`:140-144`).

## Isolation, and fail-open decided by origin

Contributed middlewares are wrapped by `IsolatedMiddleware`: "extension
failures emit diagnostics and fail open without repeating a downstream
model/tool side effect. The wrapper mirrors lifecycle hooks, tools,
transformers, and state schema implemented by the inner middleware"
(`extensions/AGENTS.md:202-205`; the wrapper builds a cached subclass
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
otherwise successful run as cancelled" (`extensions/AGENTS.md:234-241`).
`_host_is_cancelling()` reads `task.cancelling() > 0` on the current task
(`extensions/notify.py:52-69`) and is consulted at both notification sites
(`notify.py:92, 163`). Gateway-lifetime services get the same treatment: "A
service-originated `CancelledError` fails open, while a new cancellation of
the host task still propagates through the exit stack" (`extensions/AGENTS.md:344-346`).

## The snapshot, and the closed contract

Each run "resolves the immutable loaded-extension snapshot once and binds
that same object through task-store allocation, hooks, and synchronous agent
construction, so a concurrent singleton replacement cannot mix two extension
generations" (`extensions/AGENTS.md:214-217`). Contribution kinds are closed
in both directions: "Any future contribution kind must be added to the
public contract and host runtime in the same slice; never accept a
registration method that the current host silently ignores" (`:409-411`).
Contributed lifespans, mounts and socket routes are refused outright
(`:357-364`).

## Deviation: a second code-naming key lives in the service-writable file

The first version of this application said the service-writable model had
no code-naming field. That was wrong at `08b27aef` as well as at `53df22bd`,
and the claim is withdrawn. `ExtensionsConfig` - the model behind
`extensions_config.json` - carries `middlewares`, a list of
`module.path:ClassName` entries (since the re-verification also
`{class, kwargs}` objects) "loaded into the lead-agent and subagent
middleware chains" (`packages/harness/deerflow/config/extensions_config.py:394-405`;
`list[str]` at `08b27aef`, `:310-316`). The middleware guide is candid about
what guards it: "Trusted operator config only: paths instantiate arbitrary
code. Gateway skill/MCP toggles preserve it in raw JSON; adding an API write
path requires explicit trust-boundary review"
(`packages/harness/deerflow/agents/middlewares/AGENTS.md:125`). So the tier
rule holds for `plugins:` by construction and for `extensions.middlewares`
only by convention: no API handler writes the key, but anything that can
write the file - the same file the production compose mounts read-write - can
name code. The standard stays: a code-naming key belongs only in the file the
service cannot write, and a convention plus a review rule is the weaker form
of that boundary.

## Reconciliation summary

Confirmed: the plugin list only in the startup file, unrepresentable in the
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
ignores. Deviation (recorded 2026-10-06, present at both commits):
`extensions.middlewares` names code from the service-writable file, guarded
by the absence of an API write path rather than by the file's type. Not
present by scope: a runtime test that a code-naming key written to the
service-writable file is ignored.
