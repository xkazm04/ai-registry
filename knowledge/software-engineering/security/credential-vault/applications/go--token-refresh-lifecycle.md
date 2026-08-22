---
layer: application
type: application
subject: credential-vault
technique: token-refresh-lifecycle
stack: go
verified_on: 2026-08-22
---

# Token refresh lifecycle in HashiCorp Vault (Go)

How the canonical secrets-management server realizes the refresh lifecycle, from both
seats at once. Citations are against `hashicorp/vault` commit `c3d7264` (2026-08-21),
version file `2.2.0-beta1`; a reconciliation against an external tree, so the pin
lives in prose rather than in `verified_against`.

The **server** is the authority: `ExpirationManager` (`vault/expiration.go`) owns
every lease's clock, answers renewals, revokes on expiry. The **client** is the
holder: `LifetimeWatcher` (`api/lifetime_watcher.go`) keeps one secret alive. The
asymmetry maps cleanly — login credential as grant, service token or dynamic-secret
lease as proof, watcher as refresh loop.

## Refresh ahead, from a band the lease itself sets

`calculateGrace` (`api/lifetime_watcher.go:411-428`) derives the refresh-ahead margin
as a *fraction of the proof's own lifetime* rather than a constant: `jitterMax = 0.1 ×
min(leaseDuration, increment)`, grace uniform in `[jitterMax, 2×jitterMax)` — 10–20%
of the lease, which the comment at `:425-426` states as "allow 80-90% of that to
elapse". It is recomputed on every renewal while the lease is still extending
(`:399-401`), so a lease whose server-side max TTL begins truncating renewals tracks
that shrinking reality. Jitter is deliberate and documented: the RNG is `math/rand`,
not `crypto/rand`, with a comment (`:155-161`) naming the reason — it only staggers
renewals across a fleet. Sleep between renewals is `2/3 × remaining + 1/3 × grace`
(`:405`), carrying that jitter into the wait, and the exit test is doubled: the
watcher returns when `remaining ≤ grace` *or* `remaining − sleepDuration ≤ grace`
(`:378`) — the look-ahead that stops a short-lived token sleeping *through* its own
window (4s/3s example, `:372-377`).

Skew is a *measured* quantity here, not a guessed buffer: the watcher anchors at
issuance — `initialTime = time.Now().Add(-r.secret.Age)` (`:274`, repeated after each
renewal at `:347`) — and `remainingLease` (`:436-443`) subtracts the response's age
from the reported duration, clamped at zero. Its doc comment (`:430-435`) names the
failure: a cached response reports its lease from *issuance*, so trusting it directly
overestimates the remaining lifetime.

## One threshold authority

`framework.CalculateTTL` (`sdk/framework/lease.go:36`) is the single function
resolving a lease duration, and every seat calls it: registration
(`vault/request_handling.go:1602`) and renewal (`vault/expiration.go:1358`). It folds
mount default and max, backend TTL and max, explicit max and caller increment into one
answer, caps to the most restrictive (`:49-55`), and *warns* when it caps rather than
truncating silently (`:67-69`). Renewability is likewise single —
`leaseEntry.renewable()` (`vault/expiration.go:3049-3080`) returns a *reasoned* error
per case (not-found, irrevocable, non-expiring, batch, expired,
backend-marked-non-renewable) — so "why won't this renew" is answered once, for every
caller, with no second copy of the arithmetic.

## Single-flight, with the locking discipline written down

Renewal takes a per-lease mutex before loading the entry (`Renew:1301-1304`, via
`lockForLeaseID:1996-2000`), and the comment block at `:1982-1995` states the rules —
*lock lease → load entry → modify entry and pending map → unlock* — with a note on why
the lock cannot live *in* the entry (which can change between load and acquire). It
names its reaper — `deleteLockForLease` runs whenever `loadEntry` returns nil
(`:2270-2271`) and in `revokeCommon` — so the map does not grow one mutex per dead
lease. `processRestore` (`:862-880`) is the double-check in canonical form: test
`restoreLoaded`, take the lock, test again, load. The mutex is in-process, which
matches the sharing scope only because lease mutation is funnelled to the one node
running the expiration manager (built per unseal, `vault/core.go:2937`; standbys
forward writes). A second writer would make it theater, exactly as the technique
warns.

## Persist before use, on issuance and on renewal

On renewal the new expiry reaches storage (`persistEntry`, `vault/expiration.go:1401`)
**before** `updatePending` re-arms the revocation timer (`:1416`) and before the
response carrying the extended lease reaches the caller. On issuance, `Register`
(`:1564-1724`) takes the same mutex "so persistEntry and updatePending are atomic"
(`:1682-1688`), persists the entry (`:1691`) and its token secondary index (`:1706`)
before `updatePending` (`:1712`) and before the lease ID is attached to the response
(`:1720-1723`) — so no crash yields a proof the client holds and the server has
forgotten.

## Expiry: a real failure taxonomy, and a terminal state

- **Definitive** — `errIsUnrecoverable` (`vault/expiration.go:217-227`) matches
  `ErrUnrecoverable`, `ErrUnsupportedOperation`, `ErrUnsupportedPath`,
  `ErrInvalidRequest`. No retry.
- **Transient** — everything else retries to `maxRevokeAttempts = 6` (`:55`) with
  jittered exponential backoff: `(1 << attempt) × revokeRetryBase` (base 10s, `:58`)
  randomized across ±50% (`revokeExponentialBackoff:332-338`).
- **Terminal** — exhausting the budget or an unrecoverable error marks the lease
  **irrevocable** (`OnFailure:285-315` → `markLeaseIrrevocable`): a persisted,
  first-class state (`leaseEntry.RevokeErr`, `isIrrevocable:3097-3099`) with its own
  map, counters, and list endpoint (`listIrrevocableLeases:2947`). "Route the human,
  stop the cadence" made queryable rather than logged — such a lease refuses renewal
  by name (`:3055-3056`).

A daily sweep re-attempts them (`setupExpiration:456-465` →
`attemptIrrevocableLeasesRevoke:999-1045`), paced by a 10ms sleep per lease
(`:1038-1040`), force-deleting only after an operator-configured age *and* an explicit
flag; `maxLeaseThreshold = 256000` (`:67`) warns once the population crosses it
(`:2657-2661`).

## Deviations

- **Client-side refresh failure is not classified.** `doRenewWithOptions` treats every
  renewal error alike — one exponential backoff (initial 10s, multiplier 2, max
  interval 5m, `MaxElapsedTime` = remaining lease, `:319-330`) under the default
  `RenewBehaviorIgnoreErrors`. A revoked token and a network blip both retry until the
  original lease would have expired. The one exception is a string match,
  `strings.Contains(err.Error(), "permission denied")` (`:301`), demoting the secret
  to non-renewable. The server has the taxonomy; the client — where "surface *dead,
  re-acquire* promptly" bites — has a substring check. The standard stays; the
  deviation is the finding.
- **Failed lease registration orphans a live credential.** When `registerFunc` fails
  after a secret engine already minted a dynamic credential,
  `vault/request_handling.go:1617-1622` logs, appends `ErrInternalError`, and returns
  with no compensating revoke — the credential lives upstream with no lease to reap
  it. The asymmetry sits in the same file: the token path *does* clean up, calling
  `tokenStore.revokeOrphan` on registration failure (`:1703-1705`) and on
  policy-lookup failure (`:1668`). "Retire the failed acquisition too" is honored for
  tokens, skipped for secrets.

## Not present by scope

Vault is the *issuing authority*, so two rules invert. **Rotating-grant persistence**
— the response-is-the-only-copy hazard — has no analogue: Vault mints the proof, so a
lost renewal response costs a round trip, not a credential. And Vault *is* the
provider of the expiry, so **never fabricate provider facts** lands on its clients;
the watcher honors it, never inventing a duration and falling back to
`fallbackLeaseDuration` from the last provider-issued value
(`api/lifetime_watcher.go:288`).

## Reconciliation summary

Confirmed: refresh-ahead as a jittered fraction of lifetime, recomputed as the lease
changes; a look-ahead exit that will not sleep through the window; skew as measured
cache age; one TTL authority and one renewability predicate; per-lease single-flight
with a written locking discipline and a reaped lock map; double-checked load on
restore; persist-before-use on issuance and renewal; a full retry taxonomy with
jittered backoff and a persisted, queryable terminal state. Deviations: the client
watcher collapses definitive rejection into transient retry behind a substring match;
a failed lease registration orphans an already-minted upstream credential where the
token path cleans up.
