---
layer: application
type: application
subject: authorization
technique: machine-credential-consumption
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Machine-credential consumption in OpenBao's AppRole, userpass and cert auth methods

OpenBao (commit `6b5f82e1`, `go 1.27.0` per `go.mod:12`) ships three
built-in credential backends that between them exercise every clause of the
technique: AppRole (`internal/builtin/credential/approle/`) for the
secret-id and accessor model, userpass for the fake-hash timing defence, and
cert for renewal bound to certificate bytes. Every line below was re-read at
the pinned commit.

## Keyed hash as address, accessor as name

`validation.go:68-76` states the rule in the type's own comment: "SecretIDs
should never be stored in plaintext anywhere in the backend. SecretIDHMAC
will be used as an index." `createHMAC` (`validation.go:112-124`) is an
HMAC-SHA256 under the role's own `HMACKey`, hex-encoded, and it refuses
inputs over `maxHmacInputLength = 4096` (`:108`) — the length bound the
technique asks for. The storage address is
`<prefix><HMAC(role name)>/<HMAC(secret id)>` (`validation.go:172`), so even
the role component of the path is keyed.

The accessor is a random UUID (`validation.go:360-364`), and its reverse
index (`secretIDAccessorStorageEntry`, `:72-76`) stores nothing but the
HMAC. `registerSecretIDEntry` writes it **before** the credential record —
"Before storing the SecretID, store its accessor" (`:294-301`) — under the
same read-then-upgrade-then-re-read pattern the login path uses (`:253-279`),
so two concurrent registrations of one secret cannot both succeed. The
accessor-keyed entries are additionally salted (`:338`, `:376`) so an
accessor is not a plaintext index either. Confirmed on every point.

## The orphan is deleted and refused

`path_login.go:207-238`: when the secret-id record exists but its accessor
entry does not, the handler upgrades the lock, re-reads both, and on a
confirmed orphan deletes the record (`:232-236`) and returns the uniform
error. The technique's contrapositive of "index before record", exactly.

## Use counting under the upgraded lock; the last use deletes and succeeds

`path_login.go:240-321`. The `case 0` branch (`:241-273`) is the read-only
path — zero means *no limit set*, which is the schema ambiguity the
technique warns about, resolved here by deletion rather than by a second
sentinel. The `default` branch switches the lock (`:281-283`), re-reads
("Lock switching may change the data. Refresh the contents.", `:285-292`),
and on `SecretIDNumUses == 1` deletes the accessor first and then the record
"but do not fail the validation request" (`:294-306`); otherwise it
decrements and persists (`:308-320`). Confirmed, including the ordering
inside the delete.

One deviation lives in that branch: the not-found response after the
re-read is `"invalid secret_id %q"` with the presented secret interpolated
(`path_login.go:291`). The sibling exits at `:204`, `:224` and `:237` say
`"invalid role or secret ID"` and echo nothing. A secret reflected into an
error body reaches the audit log's response side and any proxy between; the
standard is that the message names neither half, and never the value.

## Child bounds as a subset, at issuance and at login

`path_role.go:3420` and `:3439` run `verifyCIDRRoleSecretIDSubset`
(`validation.go:80-106`) at secret-id creation for both the secret-id CIDRs
and the token-bound CIDRs, and `:3443-3467` refuse — "rather than implicitly
overriding" — a `num_uses` or `ttl` wider than the role's. That is the
refuse-not-clamp rule stated in the tree's own comment.

At login the subset check runs again for the secret-id CIDRs
(`path_login.go:250`, `:325`) before the source address is tested against
them (`:257-273`, `:332-347`), and the role's own CIDRs are tested
independently afterwards (`:353-367`). A request with no connection
information is an internal error, `"failed to get connection information"`
(`:258-260`, `:333-335`, `:354-356`), not a merits denial — confirmed. The
one partial: the *token*-bound CIDRs on the secret id are re-proved a subset
only at issuance; at login they replace the role's outright
(`:370-376`). The subset relation proved at issuance is what makes the
override safe, and it is not re-checked when the role's token CIDRs later
tighten — a deviation on the "re-proved at login" half for that one bound.

## Renewal re-reads the role

Userpass (`userpass/path_login.go:152-172`) and cert
(`cert/path_login.go:206-285`) both refuse renewal when the entity is gone
(`nil, nil` at `:158-161` and `:221-224`, which the framework's
`handleAuthRenew` passes through as no renewed auth,
`sdk/framework/backend.go:613-619`) and when
`policyutil.EquivalentPolicies` finds the token's policies differ from the
entity's current ones (`:163-165`, `:226-228`) — "policies have changed,
not renewing". Both then re-read TTL, max TTL and period from the entity.

Cert goes further, as the technique requires: with binding enabled, renewal
re-runs `verifyCredentials` against the *original* cert entry's name
(`:240-254`), then base64-decodes the certificate bytes stored at login and
compares them to the renewing connection's leaf with
`subtle.ConstantTimeCompare` (`:265-277`) — "A renewed certificate does not
match and thus will be rejected." Confirmed.

AppRole's renewal (`approle/path_login.go:414-438`) re-reads the role and
refuses if it no longer exists (`:424-431`), and re-applies the role's TTLs
(`:433-437`), but does **not** compare the token's policies to the role's
current policies. A policy change on an AppRole role therefore survives
renewal until the token's max TTL. Deviation, recorded against the standard
the tree's own sibling backends meet.

## One error, one time, and the counted signal

`userpass/path_login.go:24` mints `dummyHash` once at package init with
`bcrypt.DefaultCost`; `:89-103` substitutes it whenever the user is absent
or errored — "so as not to have a timing leak" — and the comparison at
`:107` runs either way. The response is `"invalid username or password"` on
every exit (`:94`, `:111`, `:113`, `:120`). Confirmed on both dimensions.

The split between what the caller sees and what the server counts is
explicit: on a mismatch the handler returns the uniform response with
`logical.ErrInvalidCredentials` only when the user exists (`:108-113`,
"only existing user's failed login information is stored in storage for
optimization"), and the core increments the lockout counter solely on that
typed error (`internal/vault/request_handling.go:1800-1808`), while the
HTTP layer maps it to a plain 400 (`sdk/logical/response_util.go:139-140`).
The technique's last rule was written from the draft and confirmed here;
the tree's reason for the split — storage growth from failures against
unknown names — is the upward lesson the draft lacked and now carries.

AppRole is less uniform than userpass. The unknown-role exit at
`path_login.go:154` returns before any HMAC is computed, while an unknown
secret id pays the HMAC and the storage read first; the HMAC is cheap and
the exit shape is identical, so the leak is the storage round trip, not the
hash. And the typed `ErrInvalidCredentials` accompanies the missing-record
exit at `:204` but not the orphan exits at `:224` and `:237`, so an orphaned
secret id is refused without counting toward lockout. Both are deviations
from "one time" and "one typed signal", small in exposure, recorded here
because the standard is the sibling backend's behaviour in the same tree.

Cert's failure messages (`cert/path_login.go:346-348`, `:383-386`) append
the accumulated verification errors, including OCSP failures, to the
response. That names the reason a chain failed, which the technique
confines to the audit trail; a deviation, and a deliberate one — the
comment at `:323-330` explains the multierror is kept "so if we reach a
failure later, we can give additional context."
