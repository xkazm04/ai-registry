---
layer: application
type: application
subject: bounded-enumeration
technique: filter-after-return-under-limit
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# `list_scan_response_keys_filter_path` in OpenBao: a post-processor, opt-in per path, with the empty page unresolved

OpenBao at `6b5f82e1` filters LIST and SCAN responses to accessible keys
through a template the policy author writes, evaluated once per returned
key after the plugin has answered. The design record is RFC
`website/content/community/rfcs/filtering-list.mdx`; the code is
`internal/vault/request_handling_list_filtering.go`. The tree confirms the
technique's admissibility argument, its placement, and its definition of
"accessible"; it leaves the empty filtered page where the technique says
it is — stated, with the `next` cursor rejected by name.

## Admissible only under a limit

The RFC's User-facing Description states the cost and the condition in one
sentence: filtering "is relatively expensive, requiring a policy check for
every response key, so should likely be combined with
`required_parameters=limit` on list operations to prevent having to
evaluate thousands or potentially millions ... of policy checks". The
Security Implications section adds the default: "because this is a
breaking change and incurs some non-trivial performance impact, this
cannot be done by default". Both are the technique's rule. What the tree
does not do is *enforce* the pairing — a policy may set the filter template
without a ceiling — which is a deviation from "admissible only on paths
where a limit is enforced": the guard is optional, and
absent-guard-is-loud says an optional guard is an absent one. The standard
stays; an operator who enables the filter without a ceiling has built the
low-trust denial-of-service the technique describes.

## Filter the returned page, after the handler

`internal/vault/request_handling_list_filtering.go:17-29` runs only for
`ListOperation` and `ScanOperation` and only when the authorization result
carried a filter template (`auth.ResponseKeysFilterPath`, set from the ACL
at `internal/vault/request_handling.go:542` and populated by
`internal/vault/policy/acl.go:663-668`). Lines 31-74 refuse to filter a
response that is not the plain `keys` / `key_info` shape — a secret or
auth payload on a filtered list is an internal error, not a silently
unfiltered response — which is the right failure direction. Lines 83-123
are the per-key loop: the template renders the check path from the request
path and the key (line 84); a key ending in `/` is checked as a `List`
operation and any other as a `Read` (lines 92-95), the two-way definition
of "accessible" the technique adopted from this tree; and
`performPolicyChecks` re-evaluates the caller's ACL against the simulated
request (lines 114-117) without a storage access and, the RFC notes,
without decrementing the token's use count. Keys the check allows survive
(line 121); `key_info` is pruned to the survivors (lines 127-135). The
store was asked for `limit` keys and never more; the filter costs at most
`limit` evaluations.

Two gaps the RFC names under Downsides and the code marks at line 97
("no required parameter or wrap handling is currently supported"): a
policy that requires wrapping or a required parameter on the entry path
denies the simulated request, so an entry the caller *could* read with
those parameters is hidden from the listing. That is a false negative in
the caller's disfavor — safe, and worth recording as a deviation from the
technique's "visible when the caller could read it".

## The empty filtered page, and the cursor refused

The RFC's Unresolved Questions section is the technique's closing
argument in the tree's own words. Its example: a caller who may read only
`2024` under a prefix of four-digit keys calls `after=1000&limit=100`, the
plugin returns a hundred keys, the filter returns none, and "this would
look to the client like they should finish iteration ... instead of
having to increment their `after` value". A `next` parameter is rejected
because the caller "gains information about present-but-inaccessible
keys" — the leak after-plus-limit-not-cursor forbids, named by the tree
before the standard named it. The tree's preferred remedy, unimplemented
at this commit, is the technique's third honest design: iterate the list
handler internally until at least one entry survives, under a policy-set
re-entry limit, without re-auditing or re-counting each internal page. At
`6b5f82e1` the code returns the empty page as is (line 125 assigns the
filtered slice regardless of length), so a client on a filtered path with
sparse access terminates early unless it knows to raise the limit. The
contract paragraph the technique requires is in the RFC and not yet in the
API documentation for the affected endpoints — a documentation deviation,
recorded.
