---
layer: application
type: application
subject: read-serving-replicas
technique: client-carried-index
stack: go
status: forged
verified_on: 2026-09-26
verified_against: go@1.27
---

# The client-carried index in OpenBao, as shipped

How OpenBao (Go, `go 1.27.0`) realizes
[client-carried-index](../techniques/client-carried-index.md). This application
was first written on 2026-09-02 from the design record, when the server side was
not in the tree. The middleware landed on 2026-09-09 in commit
`c2fb6b42016d2f3bf6a07968c7b159a148929a44` ("Support index headers for consistency
in server, api", #3839). Citations are against
`a87e8099310da4c1ca7e812ec97d9700efbc967b` (2026-09-24), where none of the files
below has changed since that commit. Paths are relative to the tree root. The
design is `website/content/community/rfcs/index-headers.mdx`. The operator
documentation is `website/content/docs/concepts/consistency.mdx`.

## 1. The index and the three behaviours

On a standby that serves reads, every logical response carries `X-Vault-Index`
(`internal/http/logical.go:405-407`, `internal/http/index.go:18-41`). The value is
base64 of `{cluster, value}` (`api/index.go`, `IndexValue`). The value is the
node's applied storage index, and the cluster is the cluster's ID. A client
echoes the header. The request header `X-Vault-Inconsistent` selects the
behaviour (`internal/http/index.go:45-73`):

- **`fail`** is the default. It answers **429 Too Many Requests with
  `Retry-After: 1`** (`:205-207`). The RFC had specified 412, and the shipped
  code chose a status that generic HTTP retry layers already back off on. "The
  OpenBao Go API will automatically retry 412s and 429s" (`consistency.mdx:104`;
  `api/client.go:1871-1885` adds 412 to the standard policy).
- **`forward-active-node`** forwards the whole request to the leader
  (`:199-202`).
- **`await-state`** holds the request up to the listener's
  `consistency_max_index_wait`, floored at 25 ms (`:178-190`). It then falls
  back to a second header value or to the listener's
  `consistency_fallback_behavior`, which defaults to `fail` (`:75-78`). The RFC
  had proposed `forward-active-node` as that default.

The operator documentation keeps the system's honest name for all this,
"Eventual consistency", and says a client that always talks to the same
read-enabled standby "may not get read-after-write semantics"
(`consistency.mdx:6,42-47`).

## 2. What "seen" means: the invalidated index, enforced at the check

`HaveSeenStorageIndex` (`internal/vault/storage_index.go:97-125`) is the check
the technique insists on. The node's applied index must be at or past the
request's, **and** no invalidation job for an index at or below the request's
may still be outstanding. The commit message states the reason: the invalidation
manager is "fully asynchronous", so that applying the log is not blocked by
invalidation, and "we do want index headers to block on invalidation over those
indices being completed." `AwaitStorageIndex` waits on the same condition through
`AwaitInvalidated` (`:169-200,202-213`).

The header *advertises* the applied index. It does not advertise a drained
index. What makes that safe is that every node checks outstanding invalidations
before it honours an index. Monotonic reads and read-your-writes hold because
the gate sits on the check. The advertised number can run ahead of what the
answering node's caches reflected, so the index labels the log position, not
the freshness of the answer. The evict-not-update-on-commit technique now
states both placements.

## 3. Details the technique now carries

- **The index names its cluster.** A request whose index was minted by another
  cluster is treated as carrying no index (`internal/http/index.go:96-102`). The
  commit also made `ClusterID()` answer on standbys, so the comparison can run
  there. Without this, a node could wait for, or refuse, an index its log will
  never reach.
- **No index is a listener decision too.** A request with neither header is
  served locally unless the listener sets `consistency_missing_header_forward`.
  With it set, the request is forwarded to the leader, "giv[ing] strict
  consistency to legacy clients while allowing clients aware of eventually
  consistency to scale horizontally" (commit message; `index.go:138-160`;
  `consistency.mdx:142-151`). A client that sends either header opts into local
  handling.
- **A credential carries its own birth index.** Server-side consistent tokens
  now embed the storage index at which the token was written. That field was
  always zero before the commit (`internal/vault/tokens/token.proto`, field 50;
  `token_store.go`, `GenerateSSCTokenID`). A node that has not reached that index
  answers **412 Precondition Failed**, "SSCT token referenced a newer index than
  present locally" (`internal/vault/request_handling.go:2779-2791`), and does not answer
  "invalid token". The index is fixed at minting, so the RFC's objection that
  "tokens are not updatable" does not apply to it. The feature ships disabled by
  default, as of "limited utility" (`consistency.mdx:153-162`).
- **The client keeps the last index, not the greatest.**
  `simpleStorageIndexTracker.set` overwrites under a mutex (`api/index.go:93-114`).
  One `api.Client` shared by concurrent goroutines can therefore regress its
  index when an older response lands last.

## 4. Where it departs from the technique

- **A check that errors counts as seen.** `handleIndexForward` sets
  `seen = true` on an error from `HaveSeenStorageIndex`: "this ensures most
  distributed load across the cluster if the system is down" (`index.go:168-173`).
  The request is then served locally with no evidence the node is current. The
  await path does not do this, because its errors return not-seen
  (`storage_index.go:202-213`).
- **The documented client example does not enable what it describes.**
  `consistency.mdx:177-180` sets `DefaultStrongConsistency` on `cfg` and then
  constructs the client from a fresh `api.DefaultConfig()`.
