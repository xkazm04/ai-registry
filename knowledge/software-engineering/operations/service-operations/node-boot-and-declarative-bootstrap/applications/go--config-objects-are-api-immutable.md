---
layer: application
type: application
subject: node-boot-and-declarative-bootstrap
technique: config-objects-are-api-immutable
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Config-born audit devices and plugins: a second table type, and a trust split at the digest

Two CVEs made OpenBao move audit devices into the configuration file (RFC
`website/content/community/rfcs/config-audit-devices.mdx`: after them "it became apparent
that *any* API-driven audit device creation is unsafe", because file and socket devices
"allow writing to arbitrary files … operations usually reserved for system-level operators,
not API-level administrators"). The implementation in `internal/vault/audit.go` is
[config-objects-are-api-immutable](../techniques/config-objects-are-api-immutable.md); the
declarative plugin catalog and the seal-provider plugins are
[seal-before-storage-plugins](../techniques/seal-before-storage-plugins.md).

## The distinct record type

`audit.go:38-50` declares two table types: `auditTableType = "audit"` for entries "created by
the deprecated sys/audit API" and `configAuditTableType = "audit-config"` for entries
"created by configuration and not just in-storage". The comment on the second states the
reconciliation contract: "having a mismatched configuration entry means that audit devices
will be removed and/or server startup will fail if the audit device configuration changes."
`server.Config.Audits` (`internal/command/server/config.go:135-138`) carries the same rule
from the other side: "Updates cannot occur, only additions or deletions, but can be modified
through SIGHUP on a running server."

The API door is closed by default, not merely guarded: `sys/audit` enable refuses with
"cannot enable audit device via API; use declarative, config-based audit device management
instead" unless `unsafe_allow_api_audit_creation` is set
(`internal/vault/logical_system.go:3034-3036`, `config.go:126`). The flag's name is the
loudness — the technique's argument that creating a host-acting device is a host privilege,
enforced by making the API path an opt-in labelled unsafe.

## Reconciliation at start and reload, per kind

The reconcile loop (`audit.go:670-728`) resolves each declared device exactly as the technique
lists. Declared and absent from the table: `addAuditFromConfig` creates it with
`Table: configAuditTableType` (`:692`, `:731-749`). Declared and present as an *API-born*
entry: startup fails — "audit device in configuration … was already created by API; remove
the API audit device before attempting to create a duplicate configuration-based version"
(`:697-699`). Declared and present as config-born but different: `validateAuditFromConfig`
(`:752-790`) compares type, description, locality and every option in both directions and
fails with "modifications to audit devices are not allowed" naming the field and both values
(`:701-703`). Present as config-born but no longer declared: "disabling removed audit
device" (`:722-725`). Present as API-born and undeclared: left alone (`:713-715`).

The tree chose *refuse* over *update* for a changed option, which is why the technique's
resolution is now stated per kind rather than as an unconditional update — an upward lesson.
On a standby the same loop runs and only warns, with the false-positive caveat verbatim:
"this may be a false-positive depending on data replication state" (`:718`, `:733`); the
replica-warns rule in the technique was taken from here. The reload hook is
`core.ReloadAuditLogs()` on SIGHUP (`internal/command/server.go:1527`), and the RFC lists
the two hooks the change needed: "The standard unseal strategy now updates audit devices
based on the configuration" and "The reload handlers triggered on SIGHUP".

## Plugins: declared before storage, digest by registration path

Seal configuration itself sits in plaintext by necessity — `internal/vault/seal.go:26-40`:
"stored in plaintext, since we must be able to read it even with the Vault sealed", and the
recovery config "stored in plaintext so that we can perform auto-unseal". The
`auto-unseal-plugins` RFC extends the same line to the seal's providers: KMS plugins "can
only be registered declaratively via the server configuration file and will not be
accessible over `sys/plugin/*` APIs except for read-only information", are downloaded
"*before* unsealing", and are "not registered into storage upon unseal". The boot confirms
it: `downloadOCIPlugins` and `kmsplugin.NewCatalog` at `server.go:1037-1042` precede
`setupStorage` at `:1065`.

The trust split at the digest is in `PluginConfig.Validate`
(`internal/command/server/config.go:405-408`): "sha256sum may be omitted unless OCI images
are used, where they are required as cache sentinels" — required there for content
addressing of the cache, not for integrity, a nuance the RFC `plugin-improvements.mdx`
spells out at length: config-file and API registration "follow different threat models, the
former must make an effort to defend against arbitrary remote code execution on the server's
underlying host, the latter assumes that such privileges were already granted to the author
of the config"; the pre-exec check "is fundamentally subject to a Time-of-Check-Time-of-Use
problem"; and "we do not seek to defend against manipulation of OCI cache entries". The
catalog enforces the API side: `setInternal` (`internal/vault/plugin_catalog.go:1150`)
carries a `declarative bool`, and OCI registrations require a digest of at least eight hex
characters ("valid sha256 must be provided when registering OCI plugins", `:1165-1168`)
with the binary confined to the plugin directory or its cache (`:1169-1177`). Declared
plugins are registered by `registerDeclarativePlugins` (`:307`), which on a standby warns
"plugin out of date in storage versus standby node configuration" and does not write
(`:352-355`) — the same replica rule as the audit table.

One deviation: the technique asks that a declared component loaded *without* a digest be
logged as such at load, so the absence is visible. No such log line exists in
`plugin_catalog.go`, `server.go` or `config.go` at this commit; the omission is silent. The
standard stays.
