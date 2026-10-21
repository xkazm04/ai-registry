---
subject: candidate-consent-and-retention
domain: recruiting
last_touched: 2026-10-21
dry_streak: 0
---

# candidate-consent-and-retention

First note. Forged from kp in the 2026-08-20 recruiting drain, with three node
applications. The attention scan ranked it "single stack (node)". The run was
justified by an event, not the scan: kp's 2026-10-18 `/conform` verdict marked
`consent-erasure-privacy` a **deviation** against the current digest.

## State

6 techniques, 5 applications: node x3 and python x2, all read at kp `efa2089f1`
or `47fd18d35` on 2026-10-21, except the two untouched node applications
(`read-time-gate`, 2026-09-20; `retention-ttl`, 2026-08-20). Depth: L2 for the
applications, and L1 to L2 for the upper layers. Regulator figures in those
layers now come from opened pages, not from the forge.

## 2026-10-21 - /deepen, single-stack dispatch (Curator)

- **The deviation is kp's, not the subject's.** The verdict says three things.
  `consent.ts:68` treats a granted consent with no expiry as open-ended
  `active`. There is no withdrawal state. The legal-claims carve-out has no
  end date. The techniques already cover all three: the backstop clock for a
  missing expiry, withdrawn as a withholding state, and "an entry with no end
  date is not a carve-out". No upper-layer change was owed. Fixing the null
  expiry would anonymise legacy rows on the next sweep. That is an
  irreversible data change on a live store, so it was not made unattended.
  Banked below.
- **Second stack: python, from kp's engine.** Two applications. The job-keyed
  interview kit takes no candidate by signature. The metering ledger's reason
  column is reduced to a closed vocabulary at the write. Opt-in prompt
  captures hold a whole CV in request-id files outside the scrub, the
  tenancy-manifest test and the receipt.
- **Condition added, technique level** (one-transaction-scrub): a store the
  scrub cannot key into must be unable to receive the person, or be bounded,
  inventoried and named in the receipt. Three in-tree instances (two python,
  one TypeScript write door) and the blind lane reached it independently.
  Also added: make the inventory executable, and concurrent re-requests (two
  erasure doors racing produced a double consent event in kp).
- **Condition added** (retention-ttl): an unreadable setting resolves to the
  shipped default window, never to unbounded and never to zero. Sources: the
  blind lane, kp's `consent.ts` (malformed falls back to 365 days), and kp's
  `logger.py` going the opposite way. The probe found `inf` passing as a TTL
  that sweeps nothing. Fixed in kp `47fd18d35`, red first, pushed through the
  full gate.
- **Counter-evidence, opened and quoted** (the web lane, then re-fetched raw
  here):
  - The "six to twelve months" specific-role band was not a regulator figure.
    The ICO storage-limitation page says not beyond "the statutory period in
    which a claim arising from the recruitment process may be brought". The
    CNIL recruitment guide says "Jusqu'à trois mois" active, then an archive of
    "Jusqu'à cinq ans à compter de la date de décision d'embauche". The guide
    was read from its Wayback copy because cnil.fr served an error page. Now
    two tiers in the golden path and the technique.
  - The pool basis was qualified. CNIL accepts "l'intérêt légitime de
    l'employeur" with express notice and a simple objection. The 2-year pool
    cap is confirmed.
  - Withdrawal: Art. 7(3) says "at any time" and is not retroactive. The text
    no longer says "immediately".
  - Pseudonymised data was qualified by C-413/23 P para 86 (opened on the
    Publications Office; it interprets Regulation 2018/1725).
  - The legal-obligation ground added to the carve-out: Art. 17(3)(b), and AI
    Act Art. 26(6) logs "at least six months". The Commission's AI Omnibus page
    says "High-risk AI systems in Annex III : Rules apply starting 2 December
    2027".
  - Confirmed and left untouched: the pool's 12-24 months, the derive-and-round-up
    disclosure, read-time over sweep, and the anonymisation reserve.
  - Not confirmed: any Czech ÚOOÚ figure, current ICO recruitment-specific
    guidance, and the EDPB pseudonymisation guidelines beyond the January 2025
    consultation draft.
- **Node scrub application re-verified** at `efa2089f1`. Anchors had moved by
  about 1,100 lines. New in the tree: a race guard, a `cv_hash` scrub, an
  address-keyed outbox scrub, post-commit external deletes and a test-pinned
  `ERASURE_EXEMPT`. One new deviation: the receipt does not wait for the
  external deletes. kp's compliance README still cites `pipeline.ts:1332-1335`.

## Impact

kp only, 2 contexts (`consent-erasure-privacy`, `gdpr-data-erasure-page`).
1 stale verdict on this subject: the `consent-erasure-privacy` deviation, judged
against `3c9042dc4cd9f910`. That is kp's `/conform --stale` queue for this
subject. The kp map was rebuilt in full from a clean worktree at `47fd18d35`:
1,626 pairs, 46 stale verdicts fleet-wide on kp, the other 45 under other
subjects.

## Banked

- **kp null-expiry backstop.** Treat `givenAt` set with `expiresAt` absent as
  `givenAt + TTL`, per the read-time technique's backstop. Return: a `/conform`
  on `consent-erasure-privacy` with the operator's call on legacy rows (a
  dry-run count of the rows it would anonymise first).
- **kp receipt enumeration and replay.** `{ erased: true }` and a replay 404
  have been standing deviations since 2026-08-20. Return: when `/data` is next
  touched.
- **kp prompt captures in the receipt.** If `KP_LOG_PROMPTS` is ever on in a
  deployment that serves `/data`, the receipt overclaims. Return: an operator
  decision on defaulting a TTL (deferred 2026-09-22).
- **Czech figures.** kp is Czech-first and no ÚOOÚ source was found. Return: a
  run with a Czech-language source lane.
