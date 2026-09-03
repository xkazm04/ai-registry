---
layer: application
type: application
subject: issuance-policy-ladder
technique: require-one-constraint
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Require one constraint across OpenBao's role writers

OpenBao (commit `6b5f82e1`) applies the definition-time count in two auth
engines and the issue-time count in the SSH secrets engine, and the same
files carry the tree's answers to the two neighbouring techniques - the
wildcard-forbid precedence and the floating issuer reference - so they are
recorded here rather than in applications of their own. Paths are relative
to the tree root.

## Definition-time count

`internal/builtin/credential/approle/path_role.go:1448-1465`,
`validateRoleConstraints`, is the rule verbatim: a switch over
`BindSecretID`, `BoundCIDRList`, `SecretIDBoundCIDRs` and `TokenBoundCIDRs`
whose default arm returns `at least one constraint should be enabled on the
role`. It runs on the merged entry, so an update that clears the last
constraint is refused the same way as a creation with none.

`internal/builtin/credential/jwt/path_role.go:699-709` does the same for
the JWT role type over `BoundAudiences`, `TokenBoundCIDRs`, `BoundSubject`
and `BoundClaims` (`must have at least one bound constraint when
creating/updating a role`, line 707), and lines 699-701 carve out the OIDC role type
with the comment "OIDC verification will enforce that the audience match the
configured client_id" - the technique's second exception, an axis whose
values are validated by a stronger mechanism downstream, and it is stated
next to the check. The audience helper at
`internal/builtin/credential/jwt/claims.go:109-123` additionally defines a
`strict` mode in which an audience present in the token with no audiences
bound to the role is itself an error; at this commit that flag is exercised
only by the helper's tests, so it is recorded as the helper's declared
semantics, not as a login-path guarantee.

## Issue-time count on the artifact

`internal/builtin/logical/ssh/path_issue_sign.go:233-256` is where the
draft learned that the count must run twice. With no principals parsed from
the request, the engine refuses unless the role set `allow_empty_principals`
or its allowed set is the literal `*`: "refusing to issue unsafe,
globally-valid certificate with no principals specified". The role field's
description at `internal/builtin/logical/ssh/path_roles.go:398-410` says
what such a certificate means ("any domain a host claims to be will be
trusted") and ends "It is recommend to leave this disabled." The two other
arms confirm the empty-means-nothing rule: a request naming principals
against a role with an empty allowed set is `role is not configured to allow
any principals`, and only the explicit `*` admits any.

## Neighbouring techniques confirmed in the same files

**Explicit forbid beats allow-any.** `internal/builtin/logical/pki/cert_util.go:446-460`:
a requested name containing a wildcard is rejected when
`AllowWildcardCertificates` is explicitly false, with the comment "if
AllowWildcardCertificates is explicitly forbidden, it takes precedence over
AllowAnyName". The field is a `*bool`, and the nil check on line 457 is the
tri-state the technique requires - the tree distinguishes "never set" from
"set to false", and the role writer at `path_roles.go:1223` migrates the
unset case. The fail-fast on a required part is `cert_util.go:1296-1299`:
`require_cn` with no common name in the request or CSR errors before any
name matching. The SSH engine also shows the adjacent-fields hazard the
technique names: `path_roles.go:250-264` documents `allowed_critical_options`
as "To allow any critical options, set this to an empty string" directly
above `allowed_extensions` as "An empty list means that no extension
overrides are allowed ... explicitly specify '*' to allow any". Both
documented, opposite defaults, one screen apart.

**Float references resolve at use.** `path_roles.go:1362-1385` is the rule
with its rationale in the comment: "we never resolve the reference (to an
issuerId) at role creation time; instead, resolve it at use time. This
allows values such as `default` or other user-assigned names to 'float' and
change over time." The definition-time check resolves once and, on
`IssuerRefNotFound`, adds a warning naming the reference (two spellings, one
for `default` and one for a named issuer) and still stores the role. The
use-time resolution is `path_issue_sign.go:625-641`: `issuerName :=
role.Issuer` and `fetchCaSigningBundle`, whose failure is the request's
error. The same comment block records the path-supplied reference the
technique describes - the `issuer/:ref/{sign,issue}/:role` path "allows
users with access to those paths to manually choose their issuer".

**Verbatim as a separate privilege.** The verbatim path is registered at
`path_issue_sign.go:441-472` as its own pattern (`sign-verbatim`, optional
role suffix) with its own help text at lines 540-546: "a very privileged
operation and should be extremely restricted in terms of who is allowed to
use it". The request-must-say-so rule is `path_issue_sign.go:556-573`: a
role with `key_type = "any"` refuses an issue request that does not carry
`key_type` explicitly. Lines 574-583 record a **deviation** from the bounds
technique's forbid-refuses rule in the small: when the role fixes a key type
and the request supplies one anyway, the request's value is ignored with a
warning rather than refused. The standard stays; the warning keeps it out
of the silent-clamp failure class.
