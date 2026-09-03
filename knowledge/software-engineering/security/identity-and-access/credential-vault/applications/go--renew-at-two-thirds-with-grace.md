---
layer: application
type: application
subject: credential-vault
technique: renew-at-two-thirds-with-grace
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The lifetime watcher and the agent's auth handler in OpenBao (Go, source tree)

Reconciled against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (`go.mod`: `go 1.27.0`). The
consumer's loop is `api.LifetimeWatcher` (`api/lifetime_watcher.go`); the
consumer that runs it for its own login token is the agent's `AuthHandler`
(`internal/command/agentproxyshared/auth/auth.go`). The registry already
holds a reconciliation of the upstream project's watcher under
`token-refresh-lifecycle` (`go--token-refresh-lifecycle.md`, 2026-08-22);
this one is against the fork at the pinned commit, and two of its findings
differ from that reading.

## Grace from the smaller quantity, jittered

`calculateGrace` (`api/lifetime_watcher.go:393-410`) takes the minimum of the
lease duration and the requested increment when the increment is positive
(`:394-397`), sets `jitterMax = 0.1 × that` and draws the grace uniformly in
`[jitterMax, 2 × jitterMax)` (`:404-409`); the comment states the intent —
"allow 80-90% of that to elapse, so the remaining amount is the grace
period". The RNG is seeded from the wall clock (`auth.go:101`), a spreading
device and not a secret. Confirmed.

## Two thirds plus a third of the grace; recompute only while extending

`calculateSleepDuration` (`:376-388`) returns `2/3 × remaining + 1/3 ×
grace` (`:385-387`). It re-derives the grace only when the remaining lease
is *longer* than the prior one (`:381-383`), and the comment says why: "once
it stops extending, we've hit the max and need to rely on the grace
duration". This is the tree's upward lesson to the draft, which had the loop
re-derive the grace after every renewal; the technique now carries the
freeze-at-maximum rule.

## The look-ahead exit

The loop returns when `remainingLeaseDuration <= r.grace ||
remainingLeaseDuration - sleepDuration <= r.grace` (`:355-362`), with the
four-second-lease, three-second-grace example in the comment. A stop from
the owner also returns nil (`:366-371`), and a renewal is announced on a
non-blocking channel (`:322-325`). The exit *reason* is partially typed: a
successful exit at grace and an owner stop both return nil, a renewal that
failed under the strict behavior returns the error, and non-renewable under
the strict behavior returns `errLifetimeWatcherNotRenewable` (`:263-267`,
`:328-331`).
The agent treats every done-channel value alike — log the error if any, then
re-authenticate (`auth.go:490-496`) — so the distinction the technique asks
for exists at the watcher and is not consumed by its caller.

Non-renewable leases take the same loop with renewal skipped and the
expiry left where it was (`:290-294`): "just keep the same expiration so we
exit when it's reauthentication time". Confirmed.

## Wrap and renew are exclusive

When the auth method is configured with a wrap TTL, the handler sends the
wrapped token to the sinks "and pausing" (`auth.go:349-368`): no lifetime
watcher is created and the loop blocks until shutdown or new credentials.
The exclusivity is refused at configuration time: `use_auto_auth_token`
with a wrapping auth method is an error
(`internal/command/agent/config/config.go:304-308`), wrapping on the method
requires exactly one sink and forbids wrapping on that sink too
(`:942-949`), and the documentation says the wrapped form "does not allow
the auto-auth to keep the token renewed or automatically reauthenticate"
(`website/content/docs/agent-and-proxy/autoauth/index.mdx:143-146`).
Confirmed as configuration-time refusal.

## Retry versus fatal as a parameter

The agent's `backoff` helper (`auth.go:116-130`) returns false without
sleeping when `exitOnErr` is set and otherwise sleeps the current interval
and advances it; every failure site in `Run` calls it and `continue`s or
returns on its answer (`:208-214`, `:255-261`, and a dozen more). `next`
doubles the interval, caps it, and trims a random 0-25% (`:537-543`);
`reset` runs on every success (`:359`, `:452`). The retry-versus-fatal
decision is one boolean on the backoff struct, read in one place. Confirmed.

The watcher's own backoff is configured at `:307-316` (initial interval,
5-minute cap, multiplier 2, default randomization) and is cleared on the
first successful renewal (`:319`).

## Deviations

- **The error-mode sleep is zero.** In the sleep selection (`:346-350`), the
  backoff branch calls `errorBackoff.NextBackOff()` only inside the
  condition that decides whether to give up, and never assigns the result to
  `sleepDuration`. As read, a failing renewal loops with a zero timer until
  the remaining lease goes negative, and the configured interval is never
  slept. This is the failure the technique now names — a backoff consulted
  for its verdict and not for its interval — and it should be confirmed by a
  test with a failing renew function before it is filed; the reading is
  structural.
- **Age is not subtracted.** `initialTime` is `time.Now()` at loop entry
  (`:270`) and after each renewal (`:334`); nothing in the file reads a
  secret age. A response that spent time in a cache or in transit is
  treated as issued on arrival, so the remaining lease is overstated by that
  delay. The upstream reconciliation cited an age correction at this point;
  the fork at this commit does not carry one. The standard stays.
- **Client-side failure is still not classified.** The default behavior
  ignores renewal errors and retries; the strict behavior exits on any
  error. Neither branches on a typed verdict, and the technique's
  zero-budget fatal case has no expression here. The same finding was
  recorded against the upstream tree.

## Reconciliation summary

Confirmed: grace from the smaller of lease and increment, 10-20% jittered;
sleep of two thirds of remaining plus a third of grace; the doubled exit
test; non-renewable through the same loop; wrap and renew exclusive at
configuration time; retry-versus-fatal as one boolean on the backoff. Upward
lesson: the grace is re-derived only while the lease is still extending.
Deviations: the error-mode retry never sleeps its computed interval; the
remaining lease ignores response age; exit reasons are typed at the watcher
and collapsed by its caller.
