---
layer: application
type: application
subject: silver-medalist-rediscovery
technique: person-level-consent-collapse
stack: node
verified_on: 2026-08-20
---

# Collapsing per-entry consent to a person (Node)

The defect this code exists to fix is the standard's canonical one, recorded in
the header of `resolveCandidateConsent` (`app/_lib/rediscovery-relevance.ts:21-45`):

> Consent + anonymization are stored per pipeline ENTRY (candidate×job), but a
> rediscovery "Reach out" re-contacts a PERSON under a DIFFERENT role, minting a
> fresh entry whose consent columns are blank. Reading that fresh entry alone
> reports "none" (contactable) even when the same person's ORIGINAL consent
> expired or they were anonymized/erased — silently defeating the suppression
> gate.

## The collapse, clause by clause

`resolveCandidateConsent` (`rediscovery-relevance.ts:46-69`) reduces a list of
per-entry `ConsentSnapshot`s to one:

1. **Anonymisation is terminal** (`:51-52`): `snaps.find((s) => s.anonymizedAt)`
   short-circuits and returns an anonymised snapshot regardless of any live
   grant elsewhere — "If ANY of the person's entries was anonymized, the person
   is anonymized — it wins over everything."
2. **Grants union to the most permissive window** (`:54-68`): an open-ended
   grant (given, no expiry) wins outright; otherwise the *latest* expiry across
   grants is taken, "so the person only reads as 'expired' once EVERY grant has
   lapsed." A renewal on a newer role restores contactability.
3. **No grant anywhere resolves to `none`** (`:55`) — "recruiter-sourced, never
   applied" — which is the standard's distinction between a lapsed grant and a
   grant that never existed, preserved rather than merged.

The function is pure and `now`-free by design (`:44-45`), with expiry judged
downstream by `consentStatus`/`outreachSuppression`, so the collapse is testable
under the strip-types runner. The tests in
`app/_lib/rediscovery-consent-gate.test.ts` name each clause, including the
original bug (`:46-62`): a blank fresh entry alone returns `null` from
`outreachSuppressionReason`, and the collapsed pair returns `"consent_expired"`.

## The gate, and its fail-closed posture

`candidateOutreachSuppression` (`app/_lib/rediscovery-alert-store.ts:220-259`)
is the gate. It folds the outreach entry's own snapshot in with every snapshot
the candidate identity owns (`candidateConsentSnapshots`), collapses them, and
passes the result to `outreachSuppressionReason` (`app/_lib/consent.ts:88-100`),
which suppresses on `anonymized` and `consent_expired`.

The upward lesson the standard now carries verbatim is the `catch` (`:250-258`):

> FAIL CLOSED: if the consent state cannot be read (DB error), suppress — a
> missed send is recoverable, a consent-violating send is not.

The failure is logged with the candidate id before returning `"consent_expired"`,
so a suppression caused by an outage is distinguishable from a real one — the
standard's "every exclusion is logged with its cause".

`outreachSuppressionReason`'s own header (`app/_lib/consent.ts:88-93`) names
rediscovery as the reason the gate exists: "Rediscovery re-contacts
previously-rejected people, so an ANONYMIZED candidate (PII scrubbed, terminal)
or one whose processing consent has EXPIRED must be suppressed." The consent
lifecycle it reads — `consentStatus`, the expiry sweep `anonymizeExpiredConsents`,
and the read-time PII gate `consentWithholdsPii` (`consent.ts:64-74`) — belongs
to the consent-and-retention subject; rediscovery is its consumer.

## Where the repo is short of the standard

- There is **no prohibition axis independent of expiry and anonymisation**. The
  system has no explicit do-not-contact or opt-out flag, so the standard's
  "prohibitions dominate" clause is realized only through anonymisation. A
  person who asks to stop being contacted but does not request erasure has no
  representation, and the most-permissive grant rule would not honour one if it
  existed on another entry.
- The collapse assumes **`candidateId` is the identity**. There is no fuzzy
  identity resolution and therefore no "uncertain match resolves toward
  suppression" rule; a person who applied twice under different emails and
  received two candidate ids collapses as two people.
- `outreachSuppressionReason` treats `none` as contactable unconditionally
  (`consent.ts:99`), which is right for a recruiter-sourced first touch but
  means a *rediscovery* target whose grants were never recorded is not
  suppressed by consent state alone.
