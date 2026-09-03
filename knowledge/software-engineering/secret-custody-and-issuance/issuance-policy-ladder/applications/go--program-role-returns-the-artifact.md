---
layer: application
type: application
subject: issuance-policy-ladder
technique: program-role-returns-the-artifact
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# CEL roles in OpenBao's PKI and JWT engines

OpenBao (commit `6b5f82e1`) embeds Google's Common Expression Language
(via `cel-go`) as a separate `cel/` role type in the PKI secrets engine and
the JWT/OIDC auth engine. The RFC that governs both,
`website/content/community/rfcs/cel-best-practices.mdx`, exists because two
in-flight pull requests had divergent semantics - one gave the program full
issuance control, the other let it "select role parameters" - and the RFC
chose the first and rejected the second in so many words: "The alternative
is flipping this around and taking a role-based approach: let CEL select
(and potentially, modify) role attributes ... That would limit it to
strictly an additional-validation position." Tenet 1 states the return
contract: "any output objects should be in the final form; for Certificate
issuance this should be in `x509.Certificate`; for authentication this
should be the `logical.Auth` response format", with the one restriction that
"protocol-enforced validation of objects" stays in Go. Paths below are
relative to the tree root.

## The return contract, PKI side

`internal/builtin/logical/pki/path_issue_sign.go:845-878` evaluates the
program and switches on the result's type: a `*dynamicpb.Message` is
marshalled and unmarshalled into `ValidationOutput` (the finished template
plus issuer reference, key parameters, lease and storage directives); a
`string` becomes `errors.New(v)` - the refusal with a reason; a `bool`
becomes `request denied` - the refusal without one; and the default case is
`unexpected mainProgram result type`, an error naming the program's output
rather than an empty success. This is the technique's four-shape contract
line for line. The RFC for the engine, `rfcs/cel-pki.mdx`, documents the
`ValidationOutput` fields and the `condition ? ValidationOutput : error
string/boolean` idiom.

## The return contract, login side

`internal/builtin/credential/jwt/path_cel_login.go:187-224`,
`runCelProgram`, hands the program `claims`, `now` and `operation` and
switches the result: `false` returns `CEL role '<name>' blocked
authorization with boolean false return`; a `string` returns the message;
anything convertible to `*pb.Auth` is returned as the finished
authorization object; anything else is `returned unexpected type`. One
detail worth recording: a boolean `true` does not fall into the bool case's
early return (only `!v` does) and reaches the final error, so "true" is not
an approval - the program must return the object. The RFC,
`rfcs/cel-jwt.mdx`, states the same three-valued reply.

## Protocol checks outside the program

Before: `path_cel_login.go:144-157` builds the expected-claims set (issuer,
audiences, leeways from the CEL role entry) and calls
`validator.Validate(ctx, token, expected)` - signature and issuer are
verified in Go before the program sees a single claim, exactly as the RFC's
tenet 1 restriction requires. After: `path_cel_login.go:160-174` converts
the returned proto to `logical.Auth` and stamps `InternalData["role"]` and
`["role_type"] = "cel"` regardless of what the program returned, so the
token layer can attribute it.

PKI, after: `path_issue_sign.go:880-936`. The returned template is converted
to `*x509.Certificate`; the returned `IssuerRef` is resolved through the
same `fetchCaSigningBundle` the static path uses; `ttl` and `not_after`
together are still refused; the returned key type and bits are validated by
`certutil.ValidateDefaultOrValueKeyTypeLength`, and on the sign path the
signature length is validated against the *signing* key's type. The comment
at lines 905-908 is the technique's "output copies" paragraph in the tree's
own words: "We use the output copies to ensure they've been validated and
any CEL-created defaults applied, rather than overwriting data.Raw and
potentially using unsanitized values."

## Compiled at definition, against every shape

`internal/builtin/logical/pki/path_cel.go:143-178`, `pathCelRoleCreate`,
parses the program and validates it before storing - and the comment at line
162, "Validate with and without CSR", together with the call
`entry.Program.Validate(b.getCelEvalConfig(true))`, is where the draft
learned that a program must type-check against each input shape it can be
invoked with. (The tree validates with the CSR-bearing environment, which is
the superset; the standard states the rule generally.) The evaluation
environment itself, `path_issue_sign.go:782-810`, declares the fixed input
set - `request`, `now`, `use_csr`, `parsed_csr` - which is the technique's
"a program cannot ask the issuer for something the issuer did not offer".

## What the tree does not yet do

The best-practices RFC's tenet 2 - "usability-focused escape hatches" that
let a program invoke the static role's validators piecewise, or evaluate a
whole role object it built on the fly, with the result returning *to the
program* rather than to Go - is design, not code, at this commit. The
technique treats it as consistent with the contract (the program still
returns the final object) and does not model it further.
