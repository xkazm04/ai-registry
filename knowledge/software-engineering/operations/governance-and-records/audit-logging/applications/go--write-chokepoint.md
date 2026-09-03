---
layer: application
type: application
subject: audit-logging
technique: write-chokepoint
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# A secrets server's audit broker: one door, a sink set, and who may add a sink

OpenBao (a Go secrets-management server, commit `6b5f82e1`) is the
fail-closed ledger the technique's amendments describe: the responses it
serves are the secrets, so the door sits in the request path and refuses
the request when the sink set cannot take the record. This application
records where the tree confirms the door, the sink set, and the
host-privilege rule, and where it goes beyond the standard.

## The door is in the request pipeline, before execution

The sink contract states the placement in its own doc comment
(`internal/audit/audit.go:18-20`): `LogRequest` "is done after the
request is authorized but before the request is executed", and
`LogResponse` (`:24-25`) "after the request is processed but before the
response is sent". The core honours both. The request record is written
after the token check and display-name attachment, and a failed write
appends `ErrInternalError` and returns before routing
(`internal/vault/request_handling.go:1404-1415`); the response record
is written after the handler and a failure returns `ErrInternalError`
instead of the response (`:1230-1233`). A request refused at the auth
step is audited too, on the error path (`:1393-1395`), and there the
audit failure is logged but not escalated — the request is already
failing. That is placement rung 1 from the technique: coverage is a
property of `handleRequest`, not of the handlers it dispatches to.

## "At least one sink" is the invariant, evaluated twice

The broker's `LogRequest` (`internal/vault/audit_broker.go:101-169`) and
`LogResponse` (`:172-234`) are the same loop: iterate the configured
backends, apply the per-backend header transform, log, and set
`anyLogged` on any success (`:145-163`, `:210-228`). The error is raised
only when no backend logged *and* at least one is configured
(`:165-167`, `:230-232`) — so a deployment with zero sinks passes, which
is the tree's deviation from the amendment's "absence is loud"; the
product documents the fail-closed contract as "OpenBao will not respond
to requests when no enabled audit devices can record them"
(`website/content/docs/audit/index.mdx:141`), and leaves the zero-device
case to operator discipline. Each loop also guards against a panic in a
backend (`:120-123`) and counts a failure metric (`:126-130`), so the
degraded-sink signal the amendment asks for exists as a gauge rather than
a durable counter.

The same doc page draws the blocking distinction the amendment carries
as an upward lesson (`audit/index.mdx:143-149`): a non-blocking failure
on one device is survived when another writes, and a blocking device
"will hang until the blocking is resolved". The socket backend is the
medium that can block, and it carries the deadline: `write_timeout`
defaults to two seconds (`internal/builtin/audit/socket/backend.go:41-48`),
is set on the connection before every write (`:219-222`), and a failed
write reconnects once and retries once (`:151-160`).

## Rejections are audited, opt-in

The rate-limit middleware audits a quota rejection through the broker
when the quota configuration enables it
(`internal/http/util.go:209-223`): the rejection builds an
unauthenticated logical request and logs it with the quota error as
`OuterErr`. Two deviations from the standard are visible in those lines:
the audit of rejections is a configuration flag rather than the default,
and a failure to record the rejection is a warning, not a refusal —
defensible, since the request was already refused, but a probe the
trail may not see.

## Uniform sink options, medium-specific specialisation

The file (`internal/builtin/audit/file/backend.go`) and socket
(`socket/backend.go`) backends parse the same option set —
`hmac_accessor` (`file:62`, `socket:64`), `log_raw` (`file:72`,
`socket:74`), `elide_list_responses` (`file:81`, `socket:83`),
`prefix` (`file:134`, `socket:106`) — into one shared
`audit.FormatterConfig` (`formatter.go:23-51`), so every sink formats
the same record. Each specialises only where the medium demands. The
file backend takes a `mode`, refuses any mode that is not a regular
file (`file:110-112`), and strips executable bits with the advisory
named in the comment (`file:114-117`); the socket backend takes an
address, a socket type and the write deadline (`socket:31-48`). Each
backend holds its own salt, created lazily from its own storage view
(`file:176-196`), which is what makes the hash per-sink.

## A host path is a host privilege

The RFC that moved device creation into the configuration file states
the boundary in one sentence: writing to arbitrary files and sockets
are "operations usually reserved for system-level operators, not
API-level administrators"
(`website/content/community/rfcs/config-audit-devices.mdx`, Problem
Statement), after two advisories showed "any API-driven audit device
creation is unsafe". The tree realises it as a type distinction:
API-created entries carry table type `audit` and config-created ones
`audit-config` (`internal/vault/audit.go:39-50`), the comment noting
that a mismatch "will fail" startup. Reconciliation on start and reload
(`audit.go:691-726`) creates a device missing from storage, refuses a
config device whose path an API device already holds (`:697-699`),
refuses any modification to an existing config device (`:701-703`), and
disables a config device removed from the file while never touching an
API one (`:712-715`, `:722-725`). The API's disable handler refuses a
configuration-managed device outright
(`internal/vault/logical_system.go:3085-3087`), and API creation itself
sits behind `unsafe_allow_api_audit_creation`, default false
(`changelog/1634.txt`). Standby nodes only warn on a mismatch
(`audit.go:717-719`, `:732-735`), because storage on a standby may lag
the active node's reconciliation — a detail the technique does not need
but a reader adopting the pattern on a replicated ledger will.
