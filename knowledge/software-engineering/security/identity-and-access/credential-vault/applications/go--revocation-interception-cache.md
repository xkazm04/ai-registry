---
layer: application
type: application
subject: credential-vault
technique: revocation-interception-cache
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The agent lease cache in OpenBao (Go, source tree)

Reconciled against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (`go.mod`: `go 1.27.0`). The
cache is `LeaseCache` in
`internal/command/agentproxyshared/cache/lease_cache.go`, its in-memory
index is `cachememdb`, its persistence is a BoltDB file under
`cache/cacheboltdb/bolt.go`, and the token distribution it sits beside is
`SinkServer` in `agentproxyshared/sink/sink.go`.

## Five indexes, and one more

`cachememdb/index.go:80-98` declares the indexes: `id`, `lease`,
`request_path`, `token`, `token_accessor`, `token_parent`, `lease_token`. The
technique's five are all present; the tree splits "token" into the token
that *is* the entry (`token`) and the token that *fetched* a lease
(`lease_token`), so a token's leases and a token's children are separate
prefix lookups. On insertion (`lease_cache.go:365-395`) a lease entry records
its lease id and the fetching token; an auth entry records the new token,
its accessor, and — when the new token is not an orphan — its parent, with
its renewal context *derived from the parent's context* (`:389-391`) so a
parent cancellation cascades. A child whose parent the agent does not manage
is passed through and not cached (`:381-385`). Confirmed, and the pass-through
rule was folded into the technique.

## Each verb evicts through its index, after the issuer's 204

`handleRevocationRequest` (`:747-935`) fast-paths on anything but a
`204 No Content` (`:750-752`) — eviction happens on the issuer's confirmed
revocation, never on the request. Then per path: `revoke` and `revoke-self`
clear by token (`:757-791`), `revoke-accessor` by accessor (`:793-813`),
`revoke` of a lease by lease id (`:868-889`), and `revoke-force` /
`revoke-prefix` by lease prefix (`:891-927`) — filtered so that only leases
in the *revoking token's* namespace are evicted (`:905`, `:924`).
`revoke-orphan` (`:815-866`) is the verb that shows the model: it cancels the
watchers of the token's own leases (`:831-836`), closes the token's own
watcher without cancelling its context so that it "will not affect the child
tokens" (`:849-851`), and clears `TokenParent` on every child (`:855-865`).
Detach, not evict. This was an upward lesson; the technique's verb list now
carries it.

`handleCacheClear` (`:630-745`) is the eviction primitive behind the API's
cache-clear endpoint and the revocation hooks: by request path prefix, by
token, by accessor, by lease, or `all` — which cancels the base context every
watcher descends from and flushes the persistent store (`:716-740`).

**Deviation.** Lease revocation reads `lease_id` from the request body only;
the tree's own `TODO` at `:869` asks whether a lease present in the URL
should also count. A revocation issued in that form passes through
unintercepted.

## Eviction is the watcher's exit, and shutdown is not eviction

`startRenewing` (`:462-474`) defers the eviction of its own index; the
deferred function first checks `c.shuttingDown` and logs "not evicting index
from cache during shutdown" (`:464-468`) before returning, and evicts
otherwise. Every eviction verb above works by cancelling a watcher's context
or closing its done channel, so there is exactly one eviction path — the
watcher returning — and shutdown is the one return that does not take it.
Confirmed to the letter.

## Restore order by construction

`bolt.go:42-49` documents the lease bucket: keys are auto-incrementing and
stored in byte order, "this means when we iterate through this bucket during
restore, we will always restore parent tokens before their children". A
`lookup` bucket maps the cache's own ids to the auto-increment keys so
deletes can address an entry by id (`:50-54`). `Restore` (`:994-1010`)
processes the token bucket first and the lease bucket second;
`restoreLeaseRenewCtx` (`:1067-1116`) looks up the parent for both lease
entries (`:1089-1095`) and non-orphan auth entries (`:1102-1111`) and returns
an error — the entry is dropped — when the parent is absent. Confirmed; the
tokens-before-leases class order was an upward nuance the technique now
states.

## Latest-token supersession at the sinks

`SinkServer.Run` (`sink.go:71-166`) keeps one `latestToken`; `writeSink`
returns without writing when the token it was handed is not the latest
(`:74-76`); a newly arrived token drains every queued write (`:118-126`)
before replacing latest and re-queuing all sinks (`:128-133`); a failed write
retries after a 1-3 second jittered backoff (`:151-161`). The auth handler
side of the same rule: `Run` stops the previous watcher before creating one
for a new token (`auth.go:455-457`). Confirmed.

## The blind spot

Nothing in the cache observes a revocation that goes to the issuer directly,
and nothing in the tree claims otherwise; the interception is a request
filter on the proxy's own path. The entry's watcher, refused on its next
renewal, is the eventual eviction. Confirmed as a stated limitation.

## Reconciliation summary

Confirmed: indexes by token, accessor, lease, parent and request path (plus
the fetching token); eviction per verb on the issuer's 204; eviction by
watcher exit with shutdown excluded; auto-increment keys yielding
parents-before-children on restore, orphans dropped; latest-token
supersession at every sink. Upward lessons: orphan-revocation detaches
rather than evicts; prefix revocation is tenant-scoped; children of
unmanaged parents are not cached; tokens restore as a class before leases.
Deviation: lease revocation by URL is not intercepted.
