---
layer: application
type: application
subject: priced-authority
technique: never-persisted-token-class
status: forged
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
---

# Batch tokens and inline authentication in OpenBao (Go, source tree)

Written against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (`go 1.27.0` in `go.mod:12`).
The tree has two members of the never-persisted class: **batch tokens**,
the `b.`-prefixed encrypted entries, and **inline authentication**, the
degenerate member covered by [inline-auth-cannot-lease](../techniques/inline-auth-cannot-lease.md),
whose guard is recorded here too because the tree implements both in the
same request path.

## The construction, confirmed

`internal/vault/token_store.go:1356-1397` is the encrypt-into-the-token
step. On `logical.TokenTypeBatch` the store clears `entry.ID`, copies the
fields it supports into a protobuf `pb.TokenEntry` (parent, policies,
path, meta, display name, creation time, TTL, role, entity, namespace,
type, internal meta, inline policy, bound CIDRs), marshals it, encrypts
it with `ts.batchTokenEncryptor` - which is the barrier itself,
`token_store.go:825` - and sets the token ID to `consts.BatchTokenPrefix`
plus the base64 ciphertext. Nothing is written. The comment on the case
reads "Ensure fields we don't support/care about are nilled, proto
marshal, encrypt, skip persistence". The prefix is the closed vocabulary:
`IsBatchToken` at `token_store.go:1688` and `:1788` routes both `Lookup`
and `lookupInternal` to `lookupBatchToken` before any storage read.

The post-decryption checks are `token_store.go:1752-1779`. `lookupBatchToken`
decrypts (a decryption failure returns `nil, nil` - not a token, not an
error, `:1733-1735`), then compares `CreationTime + TTL` against the clock
(`:1762`), then, if the entry names a parent, looks the parent up and
returns nil when the parent is gone (`:1766-1774`). That last check is the
tree's implementation of "revoked with parent: stops working" from the
token type comparison table in
`website/content/docs/concepts/tokens.mdx:277-289`.

## What the class forfeits, confirmed at the refusal sites

The comparison table (`tokens.mdx:277-289`) is the standard's forfeit list
with one row per capability: no root, no children, no renewal, no manual
revocation, no periodic, no explicit max TTL, no accessor, no cubbyhole.
Each row has a refusal in code: `token_store.go:2838-2839` ("batch tokens
cannot create more tokens"), `:3047-3048` ("cannot be root tokens"),
`:3226-3227` and `:3280-3281` ("cannot be revoked"), `:3433-3434` ("cannot be
renewed"), and `:2929` refuses any batch-incompatible field at creation.

## Where the tree taught the standard: leases are capped, not forbidden

The draft of this technique forbade leases under the class. The tree
does not: `tokens.mdx:298-303` states that "leases created by batch tokens
are constrained to the remaining TTL of the batch tokens and, if the batch
token is not an orphan, are tracked by the parent", and the table's
"Dynamic Secrets Lease Assignment" row reads "Parent (if not orphan)".
The technique now carries that rule as its own - cap at the token's
remaining lifetime, index under the nearest persisted ancestor - and
reserves the outright refusal for inline authentication, which has neither
a clock nor an ancestor. This is an upward lesson, not a deviation.

## Inline authentication: the degenerate member and its guard

`internal/vault/request_handling.go:690-841` is `handleInlineAuth`. It
refuses to layer inline authority over a client token (`:700-702`,
"cannot layer inline authentication with token authentication"), builds a
fresh login request from the headers, runs it through the same
`handleCancelableRequest` the main request will use (`:809`), and on a
failed login returns the auth step's response marked with
`consts.InlineAuthErrorResponseHeader` (`:812-818`) so the caller can tell
which step failed. On success the token entry is attached to the main
request in memory - `req.SetTokenEntry(resp.InlineAuthTokenEntry)`,
`:836` - and the function returns `nil, nil` with the comment "Explicitly
do not return the authentication request". The entry itself is created
with `persistToken == false` through `Core.CreateToken`
(`token_store.go:772`) and attached at `request_handling.go:2181`.

The lease guard is `request_handling.go:1521-1534`: when the main handler
returns a `Secret` that would register a lease and `req.HasInlineAuth` is
set, the core routes a `RevokeRequest` to the backend for the secret it
just produced, fails hard if that revocation errors, and then returns
`errutil.UserError{Err: "requests with inline authentication cannot
generate leases"}`. The gate reads the handler's output, not the path.
The RFC (`website/content/community/rfcs/inline-auth.mdx`) states the
motivation - three writes per standard login, `sys/token/id`,
`sys/token/accessor`, `sys/expire/id/auth/...` - and the accepted cost:
"we count only once in the quota system ... at most, this would allow a
2x request amplification against unauthenticated endpoints". Both are the
technique's numbers, stated with their predicate.

One related forward at `request_handling.go:871-874`: a standby always
forwards a request whose token has a limited use count, because using it
is a write. It belongs to the read-serving-replicas subject and is noted
here only because it is the line the scout anchored as `872`.

## What this realization does not do

Batch tokens cannot be revoked individually and the tree says so at every
refusal site; the only levers are the parent check and the barrier key.
The `ExternalID` / server-side-consistency token wrapper at
`token_store.go:1350-1353` is the read-replica index carried in the token
value, a different subject's mechanism.
