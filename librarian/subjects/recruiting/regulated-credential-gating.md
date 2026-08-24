---
subject: regulated-credential-gating
domain: recruiting
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# regulated-credential-gating

First touch: [[2026-08-23-8]], external reconcile against
`CMS/NPPES-NPI-Registry` (Read API v2.1 + the monthly deactivation file,
snapshot 2026-08-10; terms read and summarized first). Gained
`data--required-but-missing-as-a-blocking-gate` - the corpus's first class-C
(public record) application. HINT REFUTED, binding retained: the
determinate-vs-inconclusive split is real in the world and ABSENT from the
instrument - six queries spanning five distinct situations (checksum-invalid,
deactivated x2, never-assigned, zero-result name, alias-off) returned one
byte-identical 31-byte answer, verified from raw responses by digest.
12 single queries, no sweep; every raw response saved to scratch.

## The sharpest sightings

- The register disclaims the thing a gate wants: issuance does not validate
  licensure, and the licence field beside the authority-issued identifier is
  SELF-REPORTED (live garbage witnessed: a licence value of "=========").
  Verification tier belongs to the FIELD, not the source.
- The register has no currency column at all (no key matching
  expir/valid/renew/deactiv across 226 records); deactivation lives only in
  a monthly file - and that file quantifies the shelf life of a cached
  "found active": ~99 departures/day.
- Errors arrive at HTTP 200, and the error vocabulary covers length and
  character class only - a checksum-invalid identifier never reaches it.

## Convergence (director placed)

- LANDED in cycle N2-a ([[2026-08-23-9]]): the family rule is placed - a
  verification-query section and a lead-not-evidence decision rule in
  required-but-missing-as-a-blocking-gate. Original sighting record follows.
- SEARCH DEFAULTS THAT MANUFACTURE CANDIDATES, sighting 1 of 2 IN THE SAME
  WAVE: use_first_name_alias defaults True - "Bob Smith" returns 26
  providers (23 ROBERT, 3 BOBBY, none named Bob); alias-off returns 0. The
  second sighting is ESCO's rank-1-as-resolution ([[2026-08-23-8]]).
  Placement-ready at the next cycle.
- Law-confirming: absence-of-evidence-is-not-evidence gains a public-register
  witness (the register cannot tell absence from malformation).

## Technique-edit candidates (single-sighted, banked)

- credential-cue-catalog-per-role-family: carry a per-register ANSWER MAP
  (which real-world states the register can and cannot express) beside each
  catalog entry.
- expiry-scoped-to-regulated-credentials-only: "the register has no expiry
  field" is a distinct case from "the document's date is ambiguous"; only
  the second is named.
- Cache-validity of a verification result, priced from the revocation
  stream - no technique owns it.

## Cross-subject proposals

- grant-funding/nonprofit-verification, transplantable as written: test the
  register's negative vocabulary for byte-identity before designing the
  gate; EIN has no check digit so no local determinacy exists (every miss is
  inconclusive); tier per field; shelf-life from the revocation list.
- civic-intelligence/beneficial-ownership-resolution +
  conflict-of-interest-detection: the alias-default finding transplants
  directly.

## Open leads

- Reactivation unexercised (no documented example found to query).
- Whether basic.status can return non-"A" via the query surface - stated on
  the evidence of 227 records, not exhausted.
