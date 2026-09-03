---
layer: application
type: application
subject: sidecar-provisioning
technique: plugin-lazy-load-and-reload
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Plugin lazy load and reload in OpenBao's external plugin backend

OpenBao runs secrets engines, auth methods and database plugins as separate
processes over gRPC through hashicorp/go-plugin, and its
`internal/builtin/plugin/backend.go` wrapper is the technique's three rules
in one file. Paths are relative to the tree root at commit `6b5f82e1`.

## Metadata mode at mount, full load on first request

`Factory` (`internal/builtin/plugin/backend.go:72-73`) dispenses the plugin
with `isMetadataMode` set to `true`, and the resulting wrapper carries a
`loaded bool` (`:117`) that stays false. The mode reaches the plugin as an
environment variable the SDK's run config sets on the child command
(`sdk/helper/pluginutil/run_config.go:60-64`), and the SDK's backend server
records it (`sdk/plugin/backend.go:27`) so the plugin's `Setup` returns type
and special paths without touching its backing service. `Initialize` on the
wrapper is "intentionally a no-op" (`:243-244`) — initialization happens
inside the lazy load, not at mount.

`lazyLoadBackend` (`:166-215`) is the in-flight guard the technique asks for:
a read lock, an upgrade to a write lock when `loaded` is false, and a second
check after the lock swap (`:172-176`) so that concurrent first requests
spawn one process. `startBackend` (`:121-160`) re-dispenses with metadata mode
off, calls `Setup`, and then — while the wrapper is still in metadata mode —
compares the new backend's `Type()` and `SpecialPaths()` against what the
mount was routed with, refusing with `ErrMismatchType` or `ErrMismatchPaths`
(`:141-153`) rather than serving through a plugin whose shape moved.

## Reload on the shutdown class, with a generation marker

The reload trigger is a string comparison against `rpc.ErrShutdown` plus the
SDK's own `ErrPluginShutdown` sentinel (`:191-193`) — the comment notes the
string form is needed because a go-plugin `BasicError` crosses the RPC
boundary without its type, which is the boundary-crossing loss
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
describes, worked around rather than fixed. The wrapper's `canary` (`:114`)
is the generation marker: the request captured it before the call, and only
a request whose canary still equals the wrapper's restarts the process and
mints a new one (`:196-205`); the rest fall through to the single retry
(`:211-214`). The retry is exactly one — a declared policy, as the technique
requires. Because `startBackend` runs the shape check whenever `loaded` is
false, a plugin that died before its first full load is re-verified on the
reload; a plugin that had already loaded is not re-checked on restart. That
is a deviation from the standard, which asks for the re-check at every
restart because the binary can change between the death and the respawn.

Crash containment is stated as the architecture's premise
(`website/content/docs/plugins/plugin-architecture.mdx:8-12`): a crash in a
plugin "cannot crash the entirety of OpenBao". The handshake's honesty clause
is in the SDK verbatim — the `HandshakeConfig` comment says it prevents users
from executing bad plugins or a plugin directory and "is a UX feature, not a
security feature" (`sdk/plugin/serve.go:160-164`).

## The multiplexing key is the runner configuration

`PluginCatalog.externalPlugins` is keyed by `externalPluginsKey`
(`internal/vault/plugin_catalog.go:82-98`), and the comment states the rule
outright: "Only plugins running with identical PluginRunner config can be
multiplexed, so we use the PluginRunner input as the key". The key carries
name, type, version, command, JSON-serialized args and env, the binary's
sha256 and the builtin flag (`:89-98`, `makeExternalPluginsKey` at `:100`).
Two mounts share a process only when every field is equal — the technique's
rule, with the serialization of the non-comparable fields as the one
implementation detail. Sharing is opt-in on the plugin's side: the plugin
must be compiled with `ServeMultiplex`, and once it is there is no host-side
opt-out (`plugin-architecture.mdx:126-139`). The same doc extends the
standard in one direction the technique does not state: one multiplexed
process serves a plugin type across every namespace, so tenant separation
inside the process is the plugin's responsibility, not the host's.
