---
layer: application
type: application
subject: portable-candidate-credentials
technique: unverifiable-before-tampered-never-accuse
stack: spec
status: forged
verified_on: 2026-09-29
source: 1EdTech/open-badges@3.0
---

# A published key is only as durable as the URL it lives at

## The pin

1EdTech, *Open Badges v3.0*, section 8 on keys, read as fetched text on 2026-09-29; the section
numbering is that edition's. Open Badges is a credential format for learning and skills
records, the nearest published standard to a candidate-held assessment record. It is used here
as a witness for one claim, not as a template.

## What the standard says about finding the key

Its proof formats "require the verifier to 'dereference' the public key from a URI.
Dereferencing means using the URI to get the public key in JWK format. This specification
allows the use of an HTTP URL (e.g. https://1edtech.org/keys/1) or a DID URL (e.g.
did:key:123), but only requires HTTP URL support."

## What transfers

- **"Verifiable offline, after the issuer is gone" is not a property of the signature scheme.**
  It is a property of where the key lives. An asymmetric signature whose key is fetched from
  the issuer's own address is checkable by a stranger without an account, and it stops being
  checkable the day that address stops answering. The golden path's claim that only an
  asymmetric scheme lets a third party check without the issuer therefore needs its second
  half: the key must be obtainable without the issuer (embedded in the credential, as the
  did:key form allows, pinned by the verifier, or archived by a party the issuer does not
  control).
- **The failure is an unverifiable, not a tampered.** A verifier that cannot reach the key
  has not found a mismatch; it has not been able to check. This is the technique's central
  rule applied to key discovery, and it is the cause most likely to fire at scale, because a
  domain lapse or a site move takes every credential's key at once.
- **Retired is not compromised.** Nothing in the section read addresses a key that has leaked
  rather than rotated. The technique's rule to keep every retired key loadable holds for
  retirement only; a leaked key needs a recorded cutoff, and credentials sealed under it after
  that date resolve to unverifiable. That is reasoning from the rule's own purpose, not a
  reading of this standard, and it is written into the technique as such.

## What was not evaluated

One section of one format's specification, read; no verifier was run and no deployment was
observed. Whether any real Open Badges verifier caches keys past an issuer's disappearance
was not measured. A transparency-log design (the IETF supply-chain integrity work, RFC 9943)
gives the issuer no role in the lookup at all; a research lane read only its scope lines, so it
is banked as a lead and not a claim.
