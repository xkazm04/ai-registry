---
layer: technique
type: technique
subject: credential-vault
technique: renew-at-two-thirds-with-grace
status: forged
laws: [creation-names-reaper, failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [writing the loop that keeps one leased secret alive against an issuer that answers renewals, deciding when a renewal loop should stop renewing and hand off to re-acquisition, a fleet of consumers renews in lockstep, choosing between retrying a failed renewal and giving up]
---

# Renew at two thirds, with grace

[token-refresh-lifecycle](./token-refresh-lifecycle.md) owns the thresholds
— how far ahead of expiry to refresh, the floors and ceilings, the resume
sweep, refresh storms and single-flight, and the classification of a failed
refresh; this technique owns the arithmetic of **one consumer's renewal loop
for one leased secret**, and the seam is that the lifecycle decides *whether
and what kind*, while this loop decides *when to sleep, when to stop, and
what to do with the answer*. The distinction earns a technique because the
loop is where a correct threshold policy is most often implemented wrongly:
the lease shrinks under the loop, the loop sleeps through its own window, or
it renews until the last second and hands re-acquisition nothing to work
with.

The setting is a lease: a secret with a duration, an issuer that extends the
duration on request and may grant less than asked, and a hard end after which
the secret is dead and only a fresh acquisition helps.

## The grace is derived from the smaller quantity

Before the loop sleeps it computes a **grace window** — the slice of lease it
refuses to spend sleeping — from the *smaller* of the lease the issuer
actually granted and the increment the consumer asked for. The smaller
quantity is the one the loop can rely on: an issuer that grants less than
asked is telling the consumer that its own ceiling is binding, and a grace
derived from the request plans against a lease the consumer does not hold.

The grace is jittered, uniformly within ten to twenty percent of that
quantity — the loop sleeps through eighty to ninety percent of the lease and
no more. The jitter is not decoration. A fleet of consumers issued
same-duration leases at the same moment will otherwise renew at the same
moment forever, and the issuer sees the fleet as one periodic spike sized to
the fleet. Randomness here is for spreading, not for secrecy, and the loop
should say so where it draws it.

## Sleep two thirds of what remains, plus a third of the grace

The sleep between renewals is:

> **two thirds of the remaining lease, plus one third of the grace**

Two thirds leaves a third of the lease for the renewal itself and for the
retries a transient failure will need; the added third of the grace keeps the
sleep from collapsing toward zero as the remaining lease approaches the
grace, so a short lease still gets a real interval rather than a busy loop.
Remaining lease is computed from the secret's *age* — the time since it was
issued, which a response reports and which a cached response may report as
older than the response's arrival — and never from the moment the loop
received it. A loop that trusts "duration" without subtracting age plans
against a lease that was already partly spent when it arrived.

After every successful renewal the loop recomputes the sleep from the
issuer's answer, and re-derives the grace **only while the lease is still
extending** — while each renewal returns at least as much as the last. A
lease approaching the issuer's maximum shrinks with each renewal, and a loop
that computed its interval once on entry sleeps past a lease that has since
been cut short; but a loop that re-derives the grace from every shrinking
answer shrinks the grace toward nothing exactly as the lease dies, and
hands re-acquisition no budget at the moment it is needed. Once the issuer
stops extending, the maximum has been reached, and the grace computed from
the last full lease is the one to spend.

## Stop when the next sleep would land inside the grace

The loop's exit test is stated twice, deliberately: it stops renewing when
the remaining lease is already within the grace, **or** when the remaining
lease minus the next sleep would be within the grace. The second clause is
the one people omit. A lease of four seconds with a grace of three passes the
first test — one second of margin — and sleeps two and two-thirds seconds,
straight through the window, waking with a dead secret. The look-ahead makes
the grace a floor the loop never sleeps below.

Stopping is **not an error and not a renewal**. The loop exits into
re-acquisition with the grace as the budget: the consumer logs in again, or
asks the vault for a fresh credential, while the old one is still valid for
the grace's duration. That budget is the whole reason the grace exists — a
loop that renews until the issuer refuses hands re-acquisition zero seconds
of overlap, and every consumer of the old secret fails during the re-login.
The loop names its own exit at start
([creation-names-reaper](../../../_laws.md#creation-names-reaper)): a
done-signal with a reason, distinguishable as *grace reached* versus *renewal
failed* versus *stopped by the owner*
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)),
because the caller's next move differs for each and a loop that ends the same
way for all three has thrown that information away.

A lease the issuer reports as non-renewable takes the same loop: no renewal
is attempted, the sleep and the exit test run as written, and the loop exits
into re-acquisition at the grace. One loop, no branch — the non-renewable
case is the renewable case with every renewal declined in advance.

## Wrap and renew are exclusive

A consumer configured to hand its credential onward inside a single-use
envelope for another recipient does not hold the credential in a form it can
renew; it holds the envelope. Wrapping and renewing are therefore exclusive,
and the exclusivity is a **configuration-time refusal**: a consumer asked to
both wrap and renew is misconfigured, and the loop refuses to start rather
than starting and failing on its first renewal with a permission error that
reads like the issuer's fault. When the secret is wrapped, disable renewal;
when renewal is required, do not wrap; state the pair in the configuration's
validation, because a runtime discovery of it looks like an outage.

## Retry versus fatal is a parameter of the backoff

A failed renewal is retried with exponential backoff, and the backoff carries
a budget: its maximum elapsed time is the remaining lease, because a retry
that outlives the lease is retrying for a secret that is already gone. When
the budget is exhausted the loop exits into re-acquisition, exactly as it
does at the grace.

The backoff's interval is also the loop's sleep while it is failing: the
interval the backoff computes is the interval the loop waits, and a loop that
asks the backoff for its next interval only to decide whether to give up,
then sleeps zero, has a retry loop that hammers the issuer at full speed
until the lease runs out — the exact storm the backoff was configured to
prevent, with the configuration still in place and never consulted.

The consequence is that *fatal* is not a code branch. A failure the lifecycle
classifies as definitive — the grant is revoked, the secret is gone — is a
backoff with **zero budget**: the classification arrives as a typed verdict
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)),
and the loop consumes it by setting the backoff's budget, not by branching
into a second exit path with its own bookkeeping. The naive shape grows a
branch per failure string, each site deciding for itself what "permission
denied" means, and the loop ends up with three exits that log differently
and clean up differently. One backoff, whose parameters the verdict sets, is
the loop; the verdict is the lifecycle's.

## When not to use it

A secret with no issuer clock — a static key, a long-lived grant that only
re-acquisition replaces — has no lease to sleep against and belongs to the
lifecycle's threshold and resume rules directly. A wrapped credential is
excluded by construction. And a renewal loop is a per-secret object: a
consumer holding many leases runs many loops, each with its own grace and
jitter, and the storm control across them is the lifecycle's single-flight,
not a shared timer.
