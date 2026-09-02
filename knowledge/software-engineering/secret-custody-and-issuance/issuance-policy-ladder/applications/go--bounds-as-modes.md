---
layer: application
type: application
subject: issuance-policy-ladder
technique: bounds-as-modes
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Bounds as modes in OpenBao's PKI and SSH engines

OpenBao (commit `6b5f82e1`) carries the validity ladder for X.509 leaves in
one function and the SSH certificate ladder in another, and the two disagree
on the explicit-ask rule in a way that makes the standard's point for it.
Paths are relative to the tree root.

## The four modes, on `not_after`

`internal/builtin/logical/pki/cert_util.go:1760-1875`, `getCertificateNotAfter`,
is the single ladder for a leaf's `NotAfter`. The role's `not_after_bound`
field is switched at lines 1775-1789 into exactly the technique's modes:
`permit` (nothing to do), `forbid` (sets `forbidBound`), `ttl-limited` (sets
`ttlLimitedBound`), and any other string is parsed as an RFC 3339 timestamp
and sets `timestampBound`. The same shape exists for `not_before_bound` on
the role write path, `internal/builtin/logical/pki/path_roles.go:1320-1331`,
with values `permit`, `duration`, `forbid` and an error for anything else.

Forbid refuses rather than clamps: lines 1791-1801 - if the request carried
`not_after` and the bound is `forbid`, the response is a user error
`not_after_bound is set to forbid. not_after cannot be provided.` This
confirms the technique's rule that a requester who sends a value under
forbid is told, not silently ignored. Timestamp mode is checked last, at
lines 1866-1871, after every duration rung has run, so a role pinned to a
quarter-end refuses a request that any earlier rung would have permitted.

## The ladder, stated once

Lines 1808-1829 are the composition: the request's `ttl`, else the role's
`TTL`, else the system default lease TTL; `maxTTL` from the role, else the
system maximum; then `ttl > maxTTL` clamps with a warning appended to the
response - `TTL ... is longer than permitted maxTTL ..., so maxTTL is being
used`. Every issuing path (`issue`, `sign`, `sign-verbatim`, the CEL paths)
reaches this function through `generateCreationBundle`
(`cert_util.go:1284`) and none carries a second copy of the rungs.

**Deviation on the explicit ask.** The PKI ladder clamps an explicit `ttl`
above `maxTTL` with a warning, not a refusal. The SSH engine's ladder,
`internal/builtin/logical/ssh/path_issue_sign.go:431-462` (`calculateTTL`),
does what the technique states as the standard: it records whether the
request specified `ttl` (`specifiedTTL`, line 436) and at lines 453-460 clamps
only when the value came from defaults - "Don't error if they were using
system defaults, only error if they specifically chose a bad TTL" - and
returns `ttl is larger than maximum allowed` otherwise. Two engines in one
tree, one applying refuse-on-explicit and one applying clamp-with-warning;
the technique admits the second as the tolerable variant and names the first
as the standard. Neither clamps silently, which is the line the technique
draws.

## The issuer's own limit is declared per issuer

Lines 1831-1864 are the last rung. When a signing bundle is present and the
computed `notAfter` is past `caSign.Certificate.NotAfter`, the behaviour is
switched on `caSign.LeafNotAfterBehavior` - a property of the *issuer*, not
of the role or the request - into three cases: `PermitNotAfterBehavior`
("Explicitly do nothing"), `TruncateNotAfterBehavior` (clamp to the CA's
`NotAfter`, but first refuse if that date is already in the past - "cannot
satisfy request, as NotAfter date ... is in the past"), and
`ErrNotAfterBehavior` falling through to the default, a user error naming
both the requested `notAfter` and the CA's expiry. This is the technique's
permit / truncate / error triple, declared once on the issuer, and the
tree's `permit` case is the reason the standard was widened from two
behaviours to three during reconciliation: the tree offers issuing past the
CA's expiry as a deliberate configured choice, which is consistent with RFC
5280's obligation (maintain revocation status through the leaf's expiry)
and not with the draft's original claim that it was indefensible.

## A verbatim role carries bounds only

`internal/builtin/logical/pki/ca_util.go:272-312`, `buildSignVerbatimRole`,
constructs the constraint set for unconstrained signing as literals
(`AllowAnyName: true`, `KeyType: "any"`, every allowlist `"*"`) and then, at
lines 299-312, copies from the optionally named role exactly `TTL`,
`MaxTTL`, `GenerateLease`, `NotBeforeDuration` and `NoStore` - the bound and
directive fields - and nothing that constrains a name. The bounds ladder
above still runs over the result. This confirms the "bounds-only role on the
verbatim door" paragraph of the verbatim technique, and is the reason that
paragraph exists.
