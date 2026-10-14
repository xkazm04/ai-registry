---
layer: application
type: application
subject: breach-alerting-and-attribution
technique: notification-channel-security
stack: typescript
status: forged
applied: code
ab_verdict: better
refresh_by: 2027-01-14
verified_on: 2026-10-14
---

# Delivery-time sink vetting in a tenant-configured alert dispatcher

A multi-tenant repository-quality service lets an org admin configure one
alert sink: an https webhook (chat-compatible) or an email address. The
save path already applied the "vet where you send" bar through a shared guard:
https only, no inline credentials, private, loopback, link-local, CGNAT and
internal hostnames refused, one guard shared with another outbound surface so
two hand-rolled copies could not drift.

## What the technique found

The technique asks for the check "at configuration time and re-checked at
delivery time", and for redirects to stay inside the vetting boundary. The
dispatcher did neither. The stored URL went straight to a bare fetch with the
runtime's default redirect-follow, so two paths reached the platform's own
egress unvetted: a row saved before the guard tightened (or edited out of
band), and a vetted public host answering with a redirect to an internal
address. The seam was chosen to falsify "the channel is already hardened",
because the save-time guard made that look true.

## The change

At dispatch, the org-supplied sink is re-run through the public-https guard and
a failure is a dead-end (false, logged, nothing fetched); the operator's own
global sink is exempt because it is not tenant input. The fetch uses manual
redirect handling, so a 3xx comes back as a non-ok response and reads as a
failed dispatch. No body is read or logged, which already met the bounded-trust
rule, and the eight-second timeout already existed.

## Reading

Target: stored private and plaintext sinks fetched, A 3 of 3, B 0 of 3; a 3xx
followed by default, B refused. Two new tests fail on the old source and pass
on the new. Floor: 170 tests across the alert, door, org-alerts and digest
suites green, type check and lint green through the repository's gates.

Not done, and owed: the delivery is unsigned. The sink is chat-compatible
incoming-webhook shaped, which carries no verification header, so signing
needs a channel type that can check one; the URL itself is the bearer
credential, which the technique's decision rules name as the weak position. A
hostname that resolves to a private address (rebinding) is still caught only
by resolve-and-pin at the fetch site, which the shared guard states it does not
do. Return: when a signed-receiver channel type is added, or when delivery
moves behind a resolving egress proxy.
