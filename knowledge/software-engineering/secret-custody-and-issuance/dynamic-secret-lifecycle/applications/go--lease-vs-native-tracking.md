---
layer: application
type: application
subject: dynamic-secret-lifecycle
technique: lease-vs-native-tracking
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Certificates tracked natively, leased on opt-in, tidied past expiry (Go, source tree)

Written against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`, whose PKI secrets engine is
the canonical self-revoking-artifact case. The tree confirms the technique's
default, states its cost in the role's own help text, adds the store-nothing
mode the technique now carries, and realises the revocation and tidy rules
of [idempotent-revoke-and-give-up](../techniques/idempotent-revoke-and-give-up.md)
in the same engine, so those are recorded here rather than in a fourth
application.

## The default and its stated cost

`internal/builtin/logical/pki/path_roles.go:370-381` defines
`generate_lease` with default `false` and the reason in the help text:
"large amount of leases adversely affect the startup time". Writing a role
with it enabled returns a warning at `path_roles.go:1251-1254` - "it is
encouraged to disable generate_lease and rely on PKI's native capabilities
... this option can cause instance-wide issues with large numbers of issued
certificates" - which is the technique's rule that the opt-in's price is
stated next to the switch. `path_roles.go:1033-1040` upgrades pre-existing
roles that predate the field to `generate_lease = true`, preserving the
older behaviour for old roles only; new roles get the lease-less default.

## Issuance: native record always, lease on opt-in

`internal/builtin/logical/pki/path_issue_sign.go:729-745`: when the role's
`GenerateLease` is false the response carries no `Secret` and therefore
registers no lease; when true, the response is built from the `pki` secret
type with the serial in internal data and the lease TTL set to
`time.Until(NotAfter)` - the artifact's own expiry, since the technique's
point is that a lease on a certificate can only ever end when the
certificate does. Regardless of the lease decision, `path_issue_sign.go:755-765`
stores the certificate under `certs/<serial>` unless the role sets
`no_store`, which is native tracking keyed by identity. The forwarding
check at `path_issue_sign.go:618-620` forwards a read-serving replica to
the leader only when the role stores, so the store-nothing mode is the one
case where issuance has no ledger obligation at all.

`path_roles.go:383-391` and `1244-1250` are the store-nothing mode: the
help text says such certificates "cannot be enumerated or revoked", and
`no_store = true` forces `generate_lease = false` with a warning when both
were set. That mode and its contradiction rule are the paragraph the
technique gained from this file.

`internal/builtin/logical/pki/secret_certs.go:77-79` stops leasing
certificate-authority certificates even when the role would - "New CAs going
forward aren't issued leases" - an artifact whose revocation has its own
endpoint and must never ride an ordinary lease's expiry.

## The lease's revoke gives up on an absent target

`secret_certs.go:63-68` is the technique's name: when the lease's revoke
callback cannot find the certificate in `certs/`, it logs "treating as
success" and returns nil - "Just give up and let the lease get deleted".
`internal/builtin/logical/pki/crl_util.go:529-541` returns the existing
revocation record when the serial is already revoked, so a second revoke is
idempotent and reports the original time. `crl_util.go:545-549` refuses to
add an already-expired certificate to the CRL, with a two-second grace
"because leases are stored with a second granularity", returning success
with a warning unless `AllowExpiredCertRevocation` is set - the mirror rule
the idempotent-revoke technique took from this line.

## Local first, publish best effort - with one narrowing

`crl_util.go:568-583`: the revocation entry is written under `revoked/`,
and the comment states the ordering rule - "From here on out, the
certificate has been revoked locally. Any other persistence issues might
still err, but any other failure messages should be added as warnings". The
CRL rebuild that follows (585-602) attaches its warnings to the response.
The narrowing: when auto-rebuild is off and the rebuild itself errors,
lines 590-597 return the error rather than a warning, so the response says
failure although the local record is written. The standard's rule - never
fail the revoke on publication - is wider than the tree's; recorded as a
deviation, with the note that the tree's own comment states the standard.

## Tidy: past expiry plus buffer, in pages, keeping the key

`internal/builtin/logical/pki/path_tidy.go:1198-1210` removes a revoked
certificate's `revoked/` and `certs/` entries only when
`time.Since(NotAfter)` exceeds the revoked safety buffer, with the comment
that `revoked/` builds the CRL and `certs/` serves lookup; the default
buffer is 72 hours (`path_tidy.go:120`), overridable per run and refused
below one second (755-756, 1737-1742). The walk is paged through
`logical.HandleListPage` (1240; 1060 for the certificate store) with a
configured page size (default 1000, line 124), which is the technique's
bounded, resumable sweep.

`path_tidy.go:1325-1362` removes an expired issuer only past an issuer
safety buffer whose default is a year (121), logs the certificate and key id
before doing so, and "explicitly persist[s] the key" (1334-1337) so the
revocation artifacts it signed remain verifiable; the issuer that is
currently the default is skipped with a warning even when expired
(1347-1352). Both are the rules the idempotent-revoke technique's cleanup
section carries, the second an upward lesson from this file.
