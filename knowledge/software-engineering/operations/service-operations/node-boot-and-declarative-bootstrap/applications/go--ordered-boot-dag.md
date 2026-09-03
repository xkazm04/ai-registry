---
layer: application
type: application
subject: node-boot-and-declarative-bootstrap
technique: ordered-boot-dag
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The boot graph in a secrets server, and the diagnostic that replays most of it

OpenBao's `ServerCommand.Run` (`internal/command/server.go`) is the boot graph written as a
single function, and `operator diagnose` (`internal/command/operator_diagnose.go`) is the
replay. Read together they confirm [ordered-boot-dag](../techniques/ordered-boot-dag.md) on
every rung and show exactly where two lists have started to drift. The reload half of the
same function is the evidence for [reload-partition](../techniques/reload-partition.md).

## The order, rung by rung

Configuration is parsed and logging configured first (`server.go:956-1010`). Then the rung
the technique calls "before storage": OCI plugin images are downloaded
(`downloadOCIPlugins`, `server.go:1037`) and the KMS plugin catalog — the out-of-process
seal providers — is constructed (`kmsplugin.NewCatalog`, `server.go:1042`), both reading only
the configuration and the host, both *before* `setupStorage` at `server.go:1065`. The
`auto-unseal-plugins` RFC states the reason in one sentence: "Auto Seals naturally must
initialize *before* unsealing, following the legacy API/storage-driven plugin lifecycle is
not feasible", and lists "Initializing KMS plugin processes before core is created" as an
implementation step. The tree confirms the draft's rule and extends it with the pre-storage
rung the draft had not named.

Storage opens at `server.go:1065`; the migration-active guard follows at `:1072`. Seals are
constructed from the KMS catalog at `server.go:1106` (`setSeal(c, config, kms, ...)`), the
core config at `:1134`, the HA backend at `:1150`, and `vault.NewCore` at `:1200`. Listeners
are created at `server.go:1245` (`InitListeners`) — before unseal, so a sealed node answers
its status endpoint — and the HTTP servers that *serve* on them only at `:1376`
(`startHttpServers`), after `runUnseal` has been launched as a background goroutine at
`:1333` and after self-initialization at `:1367`. The comment above the unseal goroutine
(`server.go:1327-1331`) is the "retrying step" lesson verbatim: a cluster "configured with
auto-unseal but is uninitialized" waits until "one server initializes the storage backend"
and "this goroutine will pick up the unseal keys". Readiness is announced last, to systemd
(`SdNotifyReady`, `server.go:1411`), after the PID file is written.

## Finalizers deferred at acquisition, including on verify-only

Every seal's `Finalize` is deferred in the loop that receives it (`server.go:1118-1128`), and
the comment at `:1120` says why: "Ensure that the seal finalizer is called, even if using
verify-only". Listener close is deferred through a once-guard immediately after creation
(`defer c.cleanupGuard.Do(listenerCloseFunc)`, `server.go:1270`), and the verify-only return
sits at `server.go:1309` — *after* the bind, *before* the unseal goroutine, retry-join,
self-init and serve. The tree therefore binds on the verify path and relies on the deferred
close; the draft originally said verify-only must stop before the bind, and the tree's
arrangement is the better one, so the technique now admits the bind on the condition that
its release was deferred at the bind. That is an upward lesson.

## The diagnostic: same functions, same order, two gaps

`offlineDiagnostics` (`operator_diagnose.go:193`) builds a `ServerCommand` and calls the
boot's own functions inside spans: `ParseServerConfig` under "Parse Configuration" (`:225`),
`kmsplugin.NewCatalog` under "Check KMS Plugin Catalog" (`:279`), `server.setupStorage`
under "Check Storage" / "Create Storage Backend" (`:288-295`), `setSeal` under "Create Vault
Server Configuration Seals" (`:384`) with the same deferred `Finalize` loop and the same
comment (`:408`), `createCoreConfig`, `initHaBackend`, `determineRedirectAddr`,
`findClusterAddress`, then `vault.CreateCore` under "Check Core Creation" (`:533-538`) —
deliberately `CreateCore` rather than `NewCore`, "without actually calling core.Init" — and
`server.InitListeners` under "Start Listeners" (`:559`) with the listeners closed through
the same once-guard. "Check Autounseal Encryption" (`:598`) round-trips a mock value through
the barrier wrapper and, per its comment at `:597`, "will not call runUnseal". The check
list is the graph, as the technique demands, and steps that cannot run report `Skipped`
with a reason (`:377`, `:477`, `:497`, `:604`).

Two deviations, both of the kind the technique predicts. First, the boot's migration-active
guard at `server.go:1072` carries a `TODO: Use OpenTelemetry to integrate this into Diagnose`
(`:1071`), and `operator_diagnose.go:594` carries `TODO: Diagnose logging configuration`:
two steps that exist in one list and not the other. Second, the diagnostic is not fully
non-fatal — when storage cannot be created it returns from the top-level span
(`operator_diagnose.go:369-371`) and when the core cannot be created it returns again
(`:553-556`), so downstream spans are absent rather than reported as *skipped because
storage failed*. The standard stays: every span present, downstream ones labelled skipped.

## The reload half, as evidence for the partition

On SIGHUP (`server.go:1474-1555`) the node announces `SdNotifyReloading` (`:1478`), re-parses
each config path, and on a parse failure or an empty result jumps straight to
`RUNRELOADFUNCS` (`:1487`, `:1506`), as it does for an unparseable log level (`:1544`). The
functions behind that label (`server.go:2368-2391`) are keyed `listener|` (certificate
reload) and `audit_file|` (sink reopen) — exactly the "safe reload functions that run even
when the file does not parse" the technique requires, confirmed. Between the parse and the
label the reloadable set is applied by hand: `core.SetConfig` (`:1514`), custom response
headers, request-log level, `ReloadAuditLogs` (`:1527`), plugin re-download and
`kms.ReloadConfig` (`:1529-1534`), `SetLogLevel` (`:1546`), and the introspection endpoint
(`:2391`). `SdNotifyReady` closes the bracket (`:1555`).

The deviation is the one the technique names as the naive reading: the partition is
implicit in this handler, not declared on the keys — `server.Config` (`config.go:45-157`)
carries no reload class per field — and `core.SetConfig(config)` replaces the whole
configuration object, so a changed restart-only key (a storage stanza, a cluster address)
is neither applied nor reported as *ignored, restart required*. The reload log says the
reload happened; it does not say what it declined to do.
