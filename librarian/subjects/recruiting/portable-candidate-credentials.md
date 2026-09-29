---
subject: portable-candidate-credentials
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# portable-candidate-credentials

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian". Registry HEAD at dispatch 2cfe873e; landed on origin/main 871eb735 (commits 9cf00675 sources, 7089e298 and 4f27b9b5 index, rules and catalog).

## 2026-09-29 - two field failures the golden path predicted but did not order

**Depth rung:** L2 for the tree (kp read at its current head, the three credential test files run, 24/24 and 7/7); L2 for one specification (W3C Bitstring Status List 1.0 fetched and read verbatim). No blind training-data lane and no second counter-evidence lane were run.

**Widened (single-sighted, placed in existing techniques, no new technique):**
- Reissue order: kp's `6010c6b86` (2026-08-21, the day after the applications were verified) revoked the live credential before signing the replacement, so an unreadable key left every shared link reading "revoked". The golden path said "never revoke into nothing" as a decision; it now also binds the order. Placed in the canonical-form technique (3b) and cross-referenced from trust-state resolution.
- Half-done rotation: the active key id defaults to `k1`, so rotating the secret and pinning the old one made every outstanding credential brand "TAMPERED" with the right key in the environment. The pre-comparison "is the key loaded" guard cannot see present-but-wrong-generation. Placed in the unverifiable-before-tampered technique as a step-1 note and a decision rule (tampered needs every candidate for the id to fail).
- Withheld-state copy must be true per state: kp's `summaryUnavailable` block asserted "issued without a scored summary" in three states where it was false. Recorded in the react application.
- A "no beacon" promise needs its limit stated: a hosted symmetric check is always seen by the issuer; a status list gives group privacy only in proportion to the population issued (§6.1) and only between parties who intend it (§6.6). One specification, so it lives as a spec application and one hedged sentence in the golden path, not as a rule.

**Applications re-read (verified_on 2026-09-29, verified_against node@24 / react@19):** every `page.tsx` citation had drifted, since the markup moved to `app/skill/[token]/kit/` (composition kit); all replaced. Three deviations re-checked and still open (one global 730-day window, no supersession register, superseded credentials still show their numbers; confidence as a bare percentage). Two others that were standing still stand: symmetric scheme, dev/open mode legacy mint.

**Verified, left alone:** the six-state resolution order in kp (revoked, unverifiable, tampered, incomplete, stale, verified), numbers only in verified and stale, the CSPRNG access token and its qualified PK fallback, and the `noreferrer` on the methodology link (the page URL is the capability token).

**Not evaluated:** the golden path's symmetric-versus-asymmetric claim against an offline-verification source (key discovery when the issuer no longer exists), a training-data-only lane, whether "superseded" should be a distinct state in kp (the technique table has it; kp folds it into stale). Return condition: a project that ships asymmetric signing, or a second source on status-list privacy.

## Impact
kp's map joins this subject through one context, unjudged, so no verdict is stale. No other project's map joins it. All eleven fleet maps regenerated and committed locally (bundle digest only), not pushed.

## Same-day pass from the diverged local main (merged, not re-run)

This pass was written on a local branch that diverged from origin while origin ran its own passes on the same subject; its content is kept beside origin's rather than replacing it.

First librarian note. `/deepen` was dispatched by the Curator lane on the scan finding "never swept by the librarian" (run dp-pcc-0929b, registry HEAD at dispatch 7e649601). The content pass had already landed that afternoon (a20cc006) after an earlier dispatch (dp-pcc-0929) reported `contended` because the edits sat uncommitted under another session. Nothing was left to research on a subject deepened hours earlier with no clock or event, so this run reviewed the landed diff and did the propagation it owed.

## 2026-09-29 - an offline claim needs a key that outlives the issuer; a leak is not a retirement

**Depth rung:** L2 for the landed claims (specification sources read by the landing run, not re-read here); L3 for the one claim run here, on kp's real store.

**Landed earlier, reviewed here, left as written:** the embedded-pinned-or-archived key condition on "verifiable after the issuer is gone"; revoked-first scoped to the issuer's own record (an unreachable status list is unverifiable, never not-revoked); the digest algorithm and any borrowed canonicalisation inside the form version; the 120-bit floor for the share link; the erasure design lever with an honest unknown; the status vocabulary's missing superseded; three specification applications. The diff reads in the file's own voice and cites its limits.

**Corrected here:** the compromise paragraph in the unverifiable-before-tampered technique offered a cutoff date without saying the instant it is compared against must be one the forger cannot write. kp's test forges a row under a leaked key with a backdated issue time; a cutoff would have passed it, so the store refuses the whole generation. The technique now says so, and the kp application carries the measured A/B (before: `verified` after the operator marks the key compromised; after: `unverifiable`, never `tampered`; n = 1 fixture).

**Applied (kp, no code written this run):** the compromise change already sat in kp (7e6accbc9) with its test and no ledger row; both arms were run in detached worktrees. Two more rows are simulations over the tree as it stands: the share link (new credentials 192-bit and referrer-closed, hardened rows unreachable by internal id, legacy rows still on a time-prefixed id of about 31 bits, count unmeasured) and reissue (the replaced credential and a plain revoke share one `revoked` state, no replaced-by pointer).

**Not evaluated:** whether any legacy skill-profile row exists in a live database; how a holder reads a superseded link; the erasure claim for a holder's own copy (unsettled in every source read); nothing re-fetched from the specification sources.

**Handoffs:** kp's unpushed main carries its own commits, so the map commit there is local.

## Impact

One project joins this subject, kp: one context (`skill-profile-public-page`), state `unknown`, never judged. So 0 stale verdicts and no `/conform --stale` queue from this landing. Yield low-medium for this pass (one correction, three rows), dry_streak 0, depth L2. Clock: none set by this run; return on an event (a kp legacy-row count, a project adopting a status list) or the derived application clocks.
