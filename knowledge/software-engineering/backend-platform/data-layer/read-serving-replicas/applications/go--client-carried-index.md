---
layer: application
type: application
subject: read-serving-replicas
technique: client-carried-index
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The client-carried index in OpenBao: an accepted design, not yet landed

How OpenBao (Go, `go 1.27.0`, commit `6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`)
intends to realize [client-carried-index](../techniques/client-carried-index.md).
**Read the verification line carefully: the design is accepted and the server
side is not in the tree.** `verified_against` names the Go toolchain because the
pieces that *do* exist are Go code; the behaviour the technique describes was
verified against the RFC `website/content/community/rfcs/index-headers.mdx` and
its proof-of-concept branch reference, not against server code at this commit.
A reader who needs the middleware should re-check the tree before citing this
application as implemented.

## 1. What the design says, and where it matches the standard

The RFC's user-facing section is the technique's mechanism almost line for
line. Every response on an indexed backend carries an `X-Vault-Index` header
"expected to be opaque and passed back" as a request header; a request whose
index the node has not reached takes one of three behaviours selected by the
`X-Vault-Inconsistent` request header — missing or `fail` returns HTTP 412 and
the client retries; `forward-active-node` forwards; `await-state` holds the
request until an operator-configured timeout and then falls back to the
listener's `consistency_fallback_behavior`. Two listener parameters carry the
policy: `consistency_missing_header_forward` (default false — legacy clients
without the header are served locally) and `consistency_fallback_behavior`
(default `forward-active-node`). The RFC's rationale section states the
standard's closing sentence as its own: the headers "give the appearance of
strict consistency without the system actually having it."

Three rejections in the RFC are the technique's three arguments. Server-side
consistent tokens are rejected because "tokens are not updatable and only
reflect the index on issuance" and because some backends "use semi-opaque
strings rather than integers" — hence opaque, hence a header. Server-side
waiting on writes is rejected because "the request was successfully processed
but a slow standby node hasn't yet confirmed it." And the index is returned on
every response, not only on writes, "avoiding the need to track which
operations actually involved a write" — the same reason the standard gives for
letting the client replace rather than compare.

The RFC's technical section also states the comparison rule the standard's
evict-not-update technique insists on: "sync here means both that storage is
up-to-date and all invalidations from previous indices have been processed",
to be checked against the pending invalidation queue and the job manager, not
against the storage index alone.

## 2. What exists in the tree

The client's half of the fail behaviour: `api.DefaultRetryPolicy`
(`api/client.go:1797-1810`) retries on HTTP 412, with the comment "which are
returned by Vault when a X-Vault-Index header isn't satisfied." No code in
`api/` reads or sends the header itself at this commit.

The server's index primitives, built for the invalidation stream and reusable
by the middleware: `physical.ReplicationIndexBackend`
(`sdk/physical/physical.go:75-79`, "references are opaque strings and may not
make any sense to the end-consumer") with `AppliedReplicationIndex` and
`GreaterEqualReplicationIndex`, implemented for the log-replicated backend at
`internal/physical/raft/raft.go:1248-1262` (a decimal string of the state
machine's applied index; comparison parses both sides) and for the shared
database backend at `internal/physical/postgresql/index.go:30-39`. The
`indexManager` (`internal/vault/storage_index.go:22-113`) wraps a backend with a
freshness-cached `Get`, an always-refresh `Latest`, and an `Await(ctx, index)`
that polls with exponential backoff capped at one second inside a sixty-second
time box — the await behaviour's server half, currently used only to gate
invalidation dispatch (`internal/vault/grpc_invalidation.go:391-402`).

## 3. What does not exist

No middleware reads `X-Vault-Index` from a request, no response writer sets it,
no listener config parses `consistency_missing_header_forward` or
`consistency_fallback_behavior`, and the invalidation queue does not record the
storage index alongside each key on the log-replicated backend (the
application-level stream does carry an index per message,
`grpc_invalidation.go:350-355`). The technique is therefore written from the
design record and this application records the gap rather than the
confirmation. When the middleware lands, the two checks to make against the
standard are the ones the RFC already names: that the node's position is the
drained-invalidation index and not the log's, and that the await path is
bounded and degrades to a declared fallback.
