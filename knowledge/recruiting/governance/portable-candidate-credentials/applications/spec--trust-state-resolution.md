---
layer: application
type: application
subject: portable-candidate-credentials
technique: trust-state-resolution
stack: spec
status: forged
verified_on: 2026-09-29
source: W3C/vc-bitstring-status-list@1.0
---

# Revocation a stranger can check without telling the issuer which credential

## The pin

World Wide Web Consortium, *Bitstring Status List v1.0*, W3C Recommendation of 15 May 2025
(`https://www.w3.org/TR/vc-bitstring-status-list/`), fetched in full and read on 2026-09-29;
section numbers are that edition's. The clauses below were read verbatim from the fetched
text, not from a search summary. A status list is not a hiring credential, but it is the
standard's answer to this subject's two demands that pull against each other: the
**revoked** state (an issuer's withdrawal must be visible) and the rule that a verification
surface must not report back who checked which credential.

## What the standard does with the tension

The revoked state needs a lookup, and a per-credential lookup is a beacon: the issuer's server
learns each time a particular credential is presented. The specification's remedy is to pool
the status of many credentials into one list that the verifier fetches whole, so the issuer
sees a request for the list and not for the credential. Two clauses bound how far that
protection goes, and both bear on a hiring product:

- **§6.1 (non-normative): the protection is a function of the population.** The minimum list
  length is 131,072 entries (16 KB uncompressed), "enough to give holders an adequate amount of
  group privacy if the number of verifiable credentials issued is large enough. However, if the
  number of issued verifiable credentials is a small population, the ability to correlate an
  individual increases because the number of allocated slots in the bitstring is small." The
  same section adds that correlating the request with, for example, where it came from
  narrows it further.
- **§6.6 (non-normative): the protection is a courtesy between parties who intend it.** It
  "can be circumvented by malicious issuers and verifiers" and its benefits are realised only
  when they "intend to avoid tracking". A malicious issuer can defeat it by minting a unique
  status list per credential, or a distinct key per credential, which restores a one-to-one
  mapping.

## What transfers to a hiring credential

- **The promise has to be sized to the issuer.** An employer that has issued a few hundred
  credentials cannot honestly claim herd privacy from a list that short: the crowd is the
  population, and it is small. The standard's own text is the reason to say "we do not log which
  credential was checked" (a policy) rather than "your lookup is private" (a property).
- **A per-credential status URL is the shape to avoid**, and it is the shape a hosted check
  has by construction. Under a symmetric scheme the issuer's server sees every lookup no matter
  what the page promises; the group-privacy design is only reachable on the asymmetric,
  offline-verifiable path the golden path already separates out.
- **Do not read this clause as a reason to hide revocation.** The status list exists so that
  the revoked state can be shown; the privacy work is in how it is fetched, not in whether
  a withdrawn credential is admitted to be withdrawn.

## What was not evaluated

This is a reading of one specification, not a measurement of any deployment. Nothing here was
run against a real status list, and the small-population point is the standard's own
non-normative warning, not a finding of ours. It is not yet corroborated by a second
independent source, which is why it lives here and not in the golden path as a rule.
