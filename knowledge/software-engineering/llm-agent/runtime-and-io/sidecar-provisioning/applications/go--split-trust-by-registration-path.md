---
layer: application
type: application
subject: sidecar-provisioning
technique: split-trust-by-registration-path
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Split trust by registration path in OpenBao's plugin catalog

OpenBao has exactly the two plugin doors the technique describes: `plugin`
stanzas in the server's HCL configuration, registered as *declarative*
plugins at unseal, and `sys/plugins/catalog`, the API door. Two RFCs argue
the split and `internal/vault/plugin_catalog.go` enforces it. Paths are
relative to the tree root at commit `6b5f82e1`.

## The configuration author is host-level

The `plugin-improvements` RFC
(`website/content/community/rfcs/plugin-improvements.mdx:35-58`) makes the
technique's argument in the tree's own words: a mandatory `sha256sum` in
config "is more of a chore for operators than a security feature", because
nothing checks the digest of the server binary itself, because "it is not
typical to re-validate that an artifact _still_ matches the trusted digest
... each time it is put to use" (`:44-47`), because the pre-execution check
is "fundamentally subject to a Time-of-Check-Time-of-Use problem" (`:49-52`),
and because protecting against malicious plugins on the host "is explicitly
not included in OpenBao's security model" (`:53-54`). The decision follows at
`:99-101`: `sha256sum` "becomes optional on non-OCI plugins" in config and
"remains required when registering plugins via the plugin catalog API". That
is the split, stated as a rule, with the digest kept available for operators
who want it (`:273-277`).

The upward lesson the tree taught the draft is the OCI exception. When the
plugin was *fetched* by the server from an image rather than placed by the
operator, the digest is required on both doors — `setInternal` refuses an
OCI registration without one (`internal/vault/plugin_catalog.go:1165-1166`),
and the earlier `config-plugins` RFC frames that check as download-time
integrity (`website/content/community/rfcs/config-plugins.mdx:186-189`). The
digest follows the crossing, not the door.

Declarative registration runs at unseal through `registerDeclarativePlugins`
(`:307-359`) and passes `declarative: true` into the same `setInternal`
(`:359`); the API's `Set` passes `false` (`:1131-1146`). A config stanza that
names a plugin the API already registered is refused outright: "conflicts
with existing non-declarative plugin; do not specify existing plugins in the
server configuration" (`:335-336`) — one name, one door.

## The API caller executes from one directory, never a symlink

`setInternal` (`:1150-1177`) resolves the command through
`filepath.EvalSymlinks` (`:1154`), takes the absolute directory of the
resolved target, and refuses anything outside the configured plugin
directory with "cannot execute files outside of configured plugin directory"
(`:1173`, `:1177`). For OCI plugins the permitted location is the per-plugin
digest-prefixed cache directory beneath it (`:1167-1174`). The comment calls
it a "best effort check" — the honesty the technique asks for, since an
adversary who can write to that directory is already the host.

## Errors cross through a sanitizer that keeps the status code

`DatabaseErrorSanitizerMiddleware` (`sdk/database/dbplugin/v5/middleware.go:248-258`)
wraps every database plugin call, and `sanitize` (`:298-330`) is the
technique's sanitizer: it takes the secrets from a `secretsFn` the host
supplies (`:318`), replaces each in the message, and where the error is a
gRPC status it rebuilds the status with the same code and the replaced
message (`:325-327`) so the caller's branch on the code survives. One class
is flattened rather than redacted: any URL parse error becomes "unable to
parse connection url" (`:304-305`), because a parse error embeds the whole
connection string and no known-secret list can be trusted to cover it —
a deliberate, narrow loss of detail where the alternative is a leak.

## The sudo decision never crosses

`dynamic_system_view.go` keeps `SudoPrivilege` on a host-side
`extendedSystemView` interface with the comment "SudoPrivilege won't work
over the plugin system so we keep it here instead of in sdk/logical to avoid
exposing to plugins" (`internal/vault/dynamic_system_view.go:39-41`). The
plugin SDK's `SystemView` carries no such method; a plugin declares root
paths in its `SpecialPaths` and the core evaluates the privilege before the
request reaches it. The split is enforced by the interface boundary, not by
convention.
