---
domain: software-engineering
subject: priced-authority
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# priced-authority

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-pa-0926)

Dispatched by the Curator lane on "single stack (go)". There were three
lanes:
- a read of kp's `app/_lib/auth/` at `797102a9c`, the one joined tree that
  issues authority;
- counter-evidence on seven claims, against OpenBao raw source at the pinned
  commit and at main `a87e8099` (2026-09-24), RFC 7009 and OWASP;
- a blind training-data lane.

**Counter-evidence.**
- Refuted as levers: barrier-key rotation (the keyring keeps old keys, so
  batch tokens survive) and "disable the auth method" (no check found).
- Refuted as descriptions of the reference:
  - wrap tokens have a parent (they are orphans);
  - the inline token is persisted and then revoked (it is never persisted);
  - a marked token's lookup names the state (it returns not-found);
  - a startup rescan finds marked records (the expiration entry carries
    recovery).
- Conditioned:
  - a self-describing token is as revocable as the live state checked per
    use;
  - a denylist fails in the opposite direction to a ledger;
  - the parent index is a child token's price, and a login's third write is
    its expiration entry;
  - the signed wrap format is still selectable by header;
  - "identity" is the identity record, and unmerged records self-approve;
  - the collector is whoever holds the wrap;
  - an orphan's leases are revocable one by one;
  - the class prefix binds from the second class on.
- Deviation, read from code and not reproduced: the in-memory revocation
  shadow is cleared under `entry.ID` after being claimed on `saltedID`, so
  one failed marker write makes every later revoke of that token a silent
  success until restart. This retracts the Go application's "No deviation".
  It was not reported upstream from this run.

**Convergence.** Three lanes independently reached "the operator session
must not be stateless", "a denylist fails open", and "identity-only re-read
revokes by principal, never by device". Together they placed the golden-path
rewrite of the "exactly as revocable as the list" paragraph. No new
technique: every convergence was a condition.

**Tree read (kp).**
- Every session is never persisted.
- Renewal is a mint.
- The epoch counter exists because `KP_SECRET` also seals stored keys, so
  the key cannot be the break-glass lever.
- The capability read re-reads the account. The signed-in gate did not,
  and 67 of 162 route files that call it have no other gate.
- Probe first (red on the disabled assertion), then the fix: kp
  `460e805b`, 41/41, tsc clean.
- The operator session is identity-less and revocable only by epoch.
- An unmerged branch adds a per-principal denylist that fails open by
  design.

**Landed** (ada3e95f, generated fc47c546):
- `applications/next--never-persisted-token-class.md`: `verified_on:
  2026-09-26`, `verified_against: next@16`, `applied: code`,
  `ab_verdict: better`;
- conditions in the golden path and all six techniques;
- three Go applications re-checked and re-dated 2026-09-26, with anchor
  offsets to main recorded.

**Declined:**
- The Personas `commands-credentials` join. It is the holder's side of a
  credential (OAuth and CLI capture), which the boundary gives to the
  credential vault. It is a boundary join, not a seam.
- A fix on kp's unmerged revocation branch (fail-open, `iat` as the device
  id). That branch has an owner and has not landed.

## Impact

- kp: 2 contexts (auth-session-rbac, login-flow), 0 stale verdicts
  (unjudged). The map is rebuilt and committed locally at `0d1dd7af0`, not
  pushed, because kp main has diverged from origin.
- personas: 1 context (commands-credentials, a boundary join), 0 stale
  verdicts. The map is committed locally at `322133f59`, not pushed,
  because personas master has diverged.

## Saturation

L3: primary source at two commits, one real tree, one code A/B. Clocks: all
four applications were verified 2026-09-26. Dry streak 0. Next pass:
- the operator-session row when kp's revocation branch lands (simulate a
  store outage against a revoked cookie);
- a third stack when a fleet project wraps responses or parks a request for
  second-party approval;
- re-anchor the Go applications if OpenBao's `token_store.go` moves again.
