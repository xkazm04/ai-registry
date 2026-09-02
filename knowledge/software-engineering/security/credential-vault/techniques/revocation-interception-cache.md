---
layer: technique
type: technique
subject: credential-vault
technique: revocation-interception-cache
status: forged
laws: [gate-sees-target, creation-names-reaper, identity-survives-reuse]
shared_with: []
stage: multi-service
use_when: [a local proxy caches leased secrets so consumers need not authenticate to the issuer each time, a revoked secret keeps being served from a cache, deciding what a persisted secret cache restores after restart and in what order, a re-login supersedes a token that sinks and consumers still hold]
---

# Revocation interception cache

A vault that fronts an issuer for local consumers — a sidecar, a host agent,
a proxy that authenticates once and hands out leased secrets on request —
becomes a **second custody** of every secret it caches. The issuer holds the
lease and its clock; the cache holds a copy. The cache's one obligation is to
forget each copy **exactly when the issuer does**: not earlier, because
evicting a live lease forces consumers back through login for nothing, and
not later, because a cache that serves a revoked secret has converted the
issuer's revocation into a suggestion. Everything below follows from that
sentence.

The cache acts *by* the consumer that asked, not *as* itself: entries are
keyed to the token that fetched them and served only to requests carrying
that token, so the cache never upgrades a weak caller into the strong
authority it happens to hold. The entitlement model for who may act for whom
is delegated authority's, and this technique consumes it; what it owns is the
custody of the cached copies.

## Index every entry five ways

A revocation arrives in one of several vocabularies, and the cache must evict
correctly in all of them. So every cached entry is indexed at insertion by
**the token that fetched it, that token's accessor, the lease id of the
secret, the parent token, and the request path** — and each revocation verb
the cache sees pass through it evicts by the matching index:

- revoking a token evicts everything fetched with it, and the subtree beneath
  it — leases obtained with the token, child tokens and their leases — walked
  through the parent index;
- revoking by accessor resolves the accessor to the token and evicts the same
  subtree;
- revoking a lease evicts that one entry;
- revoking a prefix evicts every entry whose lease lies under it, within the
  revoking caller's own tenant — a prefix is a namespace-relative name, and a
  tenant's revocation must not reach another tenant's entries that happen
  to share a path;
- revoking a tree of tokens evicts by parent, recursively;
- revoking a token *while orphaning its children* stops that token's
  watcher and its own leases, and **detaches** the children — clears their
  parent reference so a later revocation of the dead parent cannot reach
  them — rather than evicting them, because the issuer has kept them alive
  and the cache must agree.

The last verb is the one that shows the indexes are a model of the issuer's
tree and not merely a way to find entries: the same revocation that kills a
subtree in one vocabulary keeps it alive in another, and the cache's
answer differs only because its parent index does.

The naive cache has one index, the request path, and evicts on the path being
revoked. The other four verbs leave entries alive: an operator revokes by
accessor from an audit finding, the issuer forgets the token, and the cache
keeps serving the lease it fetched with that token for the rest of the
lease's duration. Evict on **the issuer's confirmation**, after forwarding
the revocation and observing success
([gate-sees-target](../../../_laws.md#gate-sees-target)): a revocation the
issuer refused has not happened, and a cache that evicted on the request
rather than the answer has forgotten a secret the issuer still holds live.

## Entries are reaped by their watcher, not by shutdown

Each cached entry that carries a lease runs a renewal loop, and **the loop's
exit is the entry's eviction**
([creation-names-reaper](../../../_laws.md#creation-names-reaper)): when the
loop stops because the lease is within its grace, or because renewal failed
and its backoff is exhausted, the entry leaves the cache, and the next
request for it takes the slow path through the issuer. The watcher is the
reaper the entry named at creation; there is no sweeper.

Shutdown is **not** eviction. When the cache process stops, its leases are
still live at the issuer; evicting on shutdown would make every restart a
mass re-login, which is both a storm and a change the issuer never asked for.
A persisted cache keeps its entries across restart and resumes their
watchers; an in-memory cache loses them by the nature of the medium and that
loss is a cost of the medium, not a design. When a renewal fails with the
issuer's definitive refusal, the watcher exits and the entry is gone; when
the process exits, nothing about the leases has changed and nothing is
forgotten.

## Persisted entries restore parents before children by construction

A persisted cache is a tree flattened into a store, and it must be restored
in an order that lets the indexes rebuild: a lease's entry names its parent
token, and inserting the lease before its parent exists leaves an entry no
revocation can reach through the parent index. The correct order is not
computed at restore time; it is **guaranteed by the keys**. Entries are
stored under monotonically increasing keys assigned at insertion, and a child
is always inserted after the token that fetched it, so iterating the store in
key order re-establishes every parent before every child. A restored entry
whose parent is absent is an orphan — its parent was evicted while the child
was somehow kept — and it is dropped, not adopted, because an entry with no
parent has no revocation path. The same rule applies at insertion: a
credential minted with a parent the cache does not manage is passed through
to the caller and **not cached**, since the cache could never learn of the
parent's revocation. Tokens are restored as a class before leases, because a
lease's watcher is derived from the context of the token that fetched it,
and a lease restored before any token exists has nothing to derive from.

Identity here is the auto-increment key, not the request path or the token
value ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)):
paths repeat across tokens, tokens are re-issued after re-login, and a store
keyed by either one overwrites an entry with a newer one that has a different
parent and a different lease, breaking the tree silently.

## Every consumer compares against the latest token

The cache authenticates to the issuer itself, and re-authenticates when its
own token cannot be renewed. Each re-login produces a new token, and the old
one is stale from that moment — but the old one is still held: by the sinks
that write the token to files or endpoints for consumers, by the renewal
watcher that was extending it, by in-flight requests that carried it.

The rule is that **every sink and every consumer compares the token it holds
against the latest, and drops stale work**. A sink that was asked to write
token N and, on waking, finds the latest is N+1 discards the write rather
than delivering a token the issuer may already have revoked. A watcher for N
whose exit races the login of N+1 is ignored rather than triggering a second
login. The naive shape lets each holder act on what it holds, and the visible
symptom is a consumer file that flips between two tokens as two writers race,
one of them writing a credential that stopped working a second ago.

The old token is revoked at the issuer as part of the supersession, where
the cache is permitted to; where it is not, it is allowed to expire and the
cache's entries fetched with it are evicted by the token index as if it had
been revoked, because from the consumers' seat it has been.

## The blind spot is stated, not hidden

A revocation issued **directly to the issuer**, bypassing the cache, is not
seen by it. The cache learns of that revocation only when the entry's watcher
next renews and is refused — so the window during which a directly-revoked
secret is still served is bounded by the renewal interval, which is bounded
by the lease. Say so, in the documentation and in the design: the cache
promises consistency with the issuer *for revocations that pass through it*,
and eventual consistency bounded by the renewal cadence for the rest. A cache
that claims to mirror the issuer's revocation state without this caveat will
be trusted for a property it does not have, and the discovery is an incident
report in which a revoked credential was still working an hour later. Where
the window is unacceptable, shorten the lease; the cache cannot see what does
not pass through it, and no amount of indexing changes that.

## When not to use it

A consumer that talks to the issuer directly, holding its own lease and its
own renewal loop, needs no cache and gains only a second custody by adding
one. A cache of secrets that carry no lease — static values with no issuer
clock — has nothing to intercept and reduces to the vault's ordinary storage
under encryption-at-rest. And at the scale of one process on one host, the
indexes above are bookkeeping for a tree of one; the technique starts paying
when several consumers share one authenticated intermediary and a revocation
in one vocabulary must reach entries created in another.
