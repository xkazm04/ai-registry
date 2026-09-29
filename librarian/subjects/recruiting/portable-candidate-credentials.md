---
subject: portable-candidate-credentials
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# portable-candidate-credentials

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
