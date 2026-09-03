---
layer: application
type: application
subject: bounded-enumeration
technique: required-limit-breaks-unaware-clients
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# `pagination_limit`, `required_parameters = ["limit"]` and the `max` literal in OpenBao's ACL

OpenBao at `6b5f82e1` enforces page limits inside the ACL evaluator rather
than in the handlers, which is what lets one code path realize both this
technique and deny-absorbs-and-lowest-limit-wins. The design record is RFC
`website/content/community/rfcs/acl-paginated-lists.mdx`; the code is
`internal/vault/policy/acl.go`. This application covers both techniques,
because in the tree they are twenty lines apart and one merge function.

## Required or clamped, chosen per path by the operator

`internal/vault/policy/acl.go:571-637` is the `AllowOperation` branch for
`ListOperation` and `ScanOperation` when the merged permissions carry a
positive `PaginationLimit`. When the request has no `limit` (line 574), the
evaluator scans `RequiredParameters` for `limit` (lines 582-588) and denies
if it is required (line 590); otherwise it writes the ceiling into the
request as the limit (lines 594-600). The comment at lines 575-580 is the
technique's argument verbatim: deny "if limit is a required parameter; this
prevents integrations from silently continuing to work if they were not
expecting to have pagination while also allowing them to continue working
if the operator just wishes to enable pagination for them without
breakage". The policy field itself is `pagination_limit` on a `path`
stanza (`internal/vault/policy/policy.go:175, 658`).

## Zero clamps, negative and over-ceiling refuse — the upward lesson

When a limit *is* supplied under a ceiling, lines 606-636 parse it and
apply three distinct outcomes: a value above the ceiling is denied (line
625), a negative value is denied (line 629), and zero is rewritten to the
ceiling (line 633). The draft had treated zero and an over-ceiling request
alike ("refused or clamped exactly as a request for a million would be");
the tree splits them, and on reflection the split is right — zero states
no number for the server to contradict, while an explicit number above
the ceiling is an intent the policy cannot honor. The technique now
states the three-way rule and credits the distinction.

## The `max` literal, and where it cannot be spelled

Lines 606-622 handle a `limit` that fails integer parsing: the only
accepted string is the literal `max`, which is rewritten to the ceiling
and — the comment at lines 610-614 notes — "works even if the parameter is
required". When there is no ceiling at all (lines 638-660), `max` is
rewritten to `"0"`, the unlimited value, so a pagination-aware client can
loop `after=""&limit=max`, then `after=<last>&limit=max`, "repeating until
none are" returned (lines 639-644), without knowing whether the path is
limited. Two deviations the RFC itself names: the literal collides with any
endpoint whose `limit` legitimately takes the value `max` (Downsides), and
the typed client surface cannot send it — `internal/command/list.go:74-79`
declares `-limit` as an `IntVar`, so the CLI and the SDK's integer
`ListPage` cannot use the literal and need a pagination-aware `ListAll`
that the RFC leaves as future work. The technique's "reserve the word"
rule is met on the server and not yet on the clients.

## Deny absorbs, lowest ceiling wins, silence is excluded

`internal/vault/policy/acl.go:160-178` is the merge across policies for one
path. An existing explicit deny short-circuits everything (`continue`,
line 165); a new explicit deny replaces the capability bitmap with the deny
bit, nils the allowed and denied parameter lists (lines 167-172), and jumps
to `INSERT` — past the pagination merge — so the ceiling is never combined
with a denied set, which is exactly the "deny short-circuits before any
field is combined" rule. Lines 268-273 are the ceiling merge: "Lowest set
pagination limit wins", taking the new value only when it is positive and
either no ceiling was set or the new one is smaller — a policy silent on
the ceiling (value `<= 0`) is excluded from the minimum, as the technique
requires. Lines 181-185 apply the same minimum rule to token lifetimes,
which is the second site for the proposed law that a permission-shaped
number merges to its minimum.

The recursive verb is separate: `ScanCapability = "scan"`
(`internal/vault/policy/policy.go:36, 54, 92`) with its own bit, gated by
the same `AllowOperation` branch, and RFC `scan-operation.mdx` (Rationale)
rejects `recurse=true` on LIST because "allowing `list` ... would allow
recursion, which is not ideal".

## Deviation: the filter template merges by policy order

Lines 275-281 merge the one string-valued enumeration property — the
response-keys filter template — by "first policy which contains [it]
wins". That is the load-order-dependent merge deny-absorbs-and-lowest-limit-
wins names as the failure for ceilings; for a template there is no
minimum to take, but the effective filter now depends on the order
policies are attached to a token. The standard stays: a non-numeric
enumeration property needs a declared combination rule (deny the request
when two policies disagree, or intersect the visible sets), and the RFC's
own text acknowledges the semantics are undefined for more than one
value. Recorded here, not lowered.
