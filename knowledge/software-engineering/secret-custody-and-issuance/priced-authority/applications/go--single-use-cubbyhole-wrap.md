---
layer: application
type: application
subject: priced-authority
technique: single-use-cubbyhole-wrap
status: forged
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
---

# Response wrapping and control groups in OpenBao (Go, source tree)

Written against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (`go 1.27.0` in `go.mod:12`).
Response wrapping is this technique; control groups are
[approver-not-requester](../techniques/approver-not-requester.md) built on
top of it, and the tree keeps them in adjacent files, so both are
recorded here.

## The wrap token, confirmed

`internal/vault/wrapping.go:85-340` (`wrapInCubbyhole`) creates the token:
a `logical.TokenEntry` with `Path: req.Path`, `Policies:
[]string{"response-wrapping"}`, `NumUses: 1`, `TTL` and `ExplicitMaxTTL`
both set to the requested wrap TTL, and `InternalMeta: extraData`
(`:139-148`); `c.CreateToken(ctx, &te, true)` at `:151` persists it - the
`true` is `persistToken`, so a wrap token is never a batch token. The
response's wrap info then carries the token, its accessor, the creation
time and, unless this is a rewrap, the creation path (`:175-180`). The
response is written into the token's cubbyhole with its creation path,
time and TTL (`:300-310`); if that write fails, the token is revoked as an
orphan before the error returns (`:313`, `:318`), and the token is
registered with the expiration manager with `persist == true` (`:334`),
revoked again on failure (`:336`).

Two creation details the technique now carries came from this function.
`:130-133`: "the first part (performed in this functions) happens before
auditing so that `resp.WrapInfo.Token` can contain the HMAC'd wrapping
token ID in the audit logs, so that it can be determined from the audit
logs whether the token was ever actually used". And `:86-112`: a list
operation with no keys and no warnings returns `ErrUnsupportedPath`
rather than a wrap, "This prevents unwrapping only to find empty data".

## Unsigned, and the lookup

`website/content/docs/concepts/response-wrapping.mdx:68-79` is the
rejected design and its reason: "If you are being attacked and pointed to
the wrong OpenBao server, the same attacker could trivially give you the
wrong signing public key ... we rely on the fact that the token itself is
not carrying authoritative data and do not sign it." The lookup is
unauthenticated by declaration: `wrapping/lookup` is in the system
backend's `Unauthenticated` path list at
`internal/vault/logical_system.go:91`, with the route at
`logical_system_paths.go:4144`. The documented validation procedure
(`response-wrapping.mdx:140-170`) is the technique's: alert if no token
arrives, look it up, check the creation path exactly ("simply checking for
a prefix of `secret/` is not enough"), unwrap, alert on failure.

**Deviation, narrow and declared.** The tree does hold an ECDSA P-521
wrapping key (`wrapping.go:68-75`) and a `jwt` wrap format that signs the
token (`:199`), forced into the root namespace and commented as "only
used for replication and plugin setup" (`:117-121`). `wrapping/pubkey` is
unauthenticated beside `wrapping/lookup` (`logical_system.go:92`). The
standard holds for the customer-facing path; the signed variant is an
internal channel whose recipient already trusts a server address, which
is exactly the precondition under which the docs say a signature adds
"little extra protection".

## Control groups: the parked request

`internal/vault/request_handling.go:1131-1161` parks the request when a
control-group policy applies: the original request is protobuf-encoded
and stored as `extraData["request"]`, the requesting entity as
`"request_entity"`, the policy's control-group block as
`"control_group"`, and all three become the wrap token's `InternalMeta`
via `wrapInCubbyhole`. `needsApproval` (`:1257-1270`) decides deferral,
and `:1454-1458` sets the wrap TTL from the control group's TTL, so the
parked request and its approval window expire together.

The approver acts on the accessor. `internal/vault/control_group.go:315-383`
(`handleControlGroupRequest`) resolves an accessor to the wrap token and
returns the request's operation, path, data, entity and the approvals so
far - never the token ID (the help text at `:24-25` says so).
`handleControlGroupAuthorize` (`:385-465`) resolves the accessor, fetches
the *approver's* entity and groups, and calls `addAuthorization`
(`:239-313`), which under the token's write lock enforces the two
identity rules: `if !cg.SelfAuthorizationAllowed && originalEntity.ID ==
approver.EntityID { return fmt.Errorf("token owner cannot be approver") }`
(`:282-284`) and `if auth.EntityID == approver.EntityID { return
fmt.Errorf("approver has already authorized") }` (`:287-290`). Each
approval is recorded with a timestamp, and `validateControlGroup`
(`:194-236`) counts only approvals younger than the group TTL (`:219`).

**Deviation, declared.** `SelfAuthorizationAllowed` is a policy switch
(`control-groups.mdx`, `self_authorization = false` in the example). It
defaults off; the technique requires that any such switch be off by
default and loud when on, and the tree's default meets that.

## Execution at collection

The draft ran the operation when the last approval landed. The tree runs
it at unwrap: `request_handling.go:906-946` validates the wrapping token,
and if the entry carries a deferred request, re-checks the control group
(`:931`) and, when satisfied, executes the parked request on the active
node through `handleCancelableRequest` (`:938-946`) with
`ForwardedFrom = forwardedFromDeferral` so `needsApproval` does not defer
it a second time (`:1260`). `validateWrappingToken` (`wrapping.go:347-474`,
the control-group check at `:461-474`) refuses the unwrap outright while
the control group is unsatisfied. The
technique now states execution at collection as the rule, with the
delegated-authority neighbour's "capture at enqueue, check at execute" as
the reason.

## Anchors not held

Every dispatched anchor held: `wrapping.go:130-133` is the
audit-before-response comment and `control_group.go:281-290` is the pair
of identity refusals. The remaining lines above were located in this
pass.
