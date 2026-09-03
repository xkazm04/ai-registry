---
layer: technique
type: technique
subject: dynamic-secret-lifecycle
technique: ttl-ladder-derivation
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [computing how long a new lease lasts from a request and several defaults, answering a renewal request with more or less time than asked, a caller reports getting different lifetimes from different endpoints, deciding whether a capped request should warn or fail]
---

# TTL ladder derivation

A lease's lifetime is the answer to a question with at least seven inputs, and
the technique is the one function that answers it. The rule: **the effective
lifetime is chosen by a stated ladder — period, then the requested
increment, then the backend's default, then the system's default — and capped
by the smallest of the mount's maximum, the role's maximum and any explicit
maximum; a capped request says so with a warning; and a renewal that would
carry the lease past its maximum is refused.**

## Why a ladder and not a clamp

The naive implementation takes the number the caller sent, falls back to a
default if it is missing, and clamps to a configured maximum. It is wrong in
three ways that surface as three separate bug reports. It ignores the
periodic case, where a credential is meant to renew to a fixed period
regardless of what the caller asks, so a periodic credential renewed with an
explicit increment gets the increment and stops being periodic. It has one
maximum where there are three — the mount the credential was issued through,
the role it was issued under, and an explicit ceiling on the request or the
backend — and whichever one the implementer remembered is the only one
enforced, so a role that tightens its maximum below the mount's is silently
ignored. And it clamps silently, so a caller that asked for a day and got an
hour discovers the difference when the credential stops working, with no
signal in the response that would have told it to renew.

The ladder replaces all three with one derivation, stated once, and applied
in both places a lifetime is computed: creation and renewal. A ladder that
exists in two copies — one in the create path, one in the renew path —
drifts the first time someone adds a rung
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)),
and the symptom is a credential whose renewal produces a different lifetime
than its creation did under identical inputs.

## The ladder

The rungs, in the order they are consulted, and the first that applies wins:

A **period** on the credential or the role means the lifetime is the period
on every renewal, and the caller's increment is ignored. Periodic credentials
exist for long-running processes that must never lose access as long as they
keep renewing; the period is the operator's decision and the caller does not
get a vote. The period is still subject to the cap: a period larger than the
effective maximum is trimmed to it with a warning, because a role must not
be able to grant more per renewal than its mount allows by declaring a
period instead of a lifetime.

The **requested increment** is what the caller asked for, when there is no
period and the caller sent one.

The **backend default** is the issuing backend's configured lifetime, when the
caller sent nothing. It is per backend because a database user and a
certificate have different sensible defaults and one system-wide number serves
neither.

The **system default** is the last rung, reached when nothing above it is
set; it exists so that a lifetime is always a number and never an "unlimited"
that nobody chose
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud) is the
neighbouring law, and the ladder is its application to lifetimes: the default
is bounded, and unbounded must be an explicit choice with a name).

The chosen rung then meets the **cap**, which is the minimum of every ceiling
that applies: the mount's maximum, the role's maximum, and an explicit maximum
carried by the backend or the request. Minimum, not "the most specific",
because ceilings compose as constraints — a role may not grant more than its
mount allows, and a mount may not grant more than the system allows — and the
only composition of constraints that honours all of them is the smallest.

## The two rules at the cap

**Capping warns.** When the chosen rung exceeds the cap, the lease gets the
cap and the response carries a warning naming the requested value, the
granted value and which ceiling applied. The warning is the signal the caller
needs to renew earlier than it planned, and its absence is the silent clamp
above. A warning is not an error: the caller asked for more than it may have,
was given what it may have, and can proceed.

**Renewal past the maximum is refused.** A renewal asks for more time on an
existing lease, and the ladder answers it as it answered creation — except
that the cap is now measured from the lease's *creation*, not from now. A
lease with a one-day maximum, renewed hourly with a one-hour increment, does
not live forever; it lives one day, and the renewal that would carry it past
that instant is refused with an error, not trimmed to the remaining minutes
and returned as success. The refusal is what tells the caller that the
credential is ending and a new one must be issued; a trimmed renewal that
succeeds with twelve minutes granted teaches the caller nothing and it learns
at the thirteenth. The periodic case is the exception by design, with one
qualification: a period's renewals are not measured from creation against
the mount's or the role's maximum, because never ending is the period's
purpose and the operator who set it chose that — but an *explicit* maximum
placed on the credential still bounds a periodic lease from its creation,
because an explicit maximum is the operator saying "this one ends", and the
more specific statement wins over the period's general one.

## Record the derivation

The lifetime is a derived value and the lease stores what it was derived
from ([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)):
the rung that applied, the ceiling that capped it if one did, and the
creation instant the maximum is measured from. An issuer that stores only the
resulting expiry cannot answer "why does this lease end then", cannot detect a
misconfigured ceiling after the fact, and cannot re-derive the lifetime at
renewal without re-reading configuration that may have changed under it — and
whether the renewal should use the role's *current* maximum or the maximum at
creation is a decision the issuer states, not one it discovers.

## The decision rules

When a request carries an increment and the credential has a period, grant
the period and ignore the increment without a warning, because periodic is
the operator's contract and the caller's number is not a request the contract
recognises.

When a request carries an increment above the cap, grant the cap and warn.

When a renewal's granted lifetime would end after creation plus the maximum,
refuse; when it would end before, grant it, and warn if the increment was
capped by the remaining window rather than by a ceiling — the warning's
reason is different and the caller's response to it is different.

When a ceiling is changed on a role or a mount, existing leases keep the
derivation they recorded until their next renewal, which recomputes under the
new ceiling; a lease is never shortened in place by a configuration edit,
because a caller that was told an hour and loses it at minute twenty was lied
to by the issuer.

## When not to apply it

A self-revoking artifact whose lifetime is a validity window rather than a
lease ([lease-vs-native-tracking](./lease-vs-native-tracking.md)) is shaped
by an issuance policy, not by this ladder — the ceilings there are the
authority's own validity and the role's bound on it, there is no renewal, and
the request-to-ceiling derivation belongs to the policy that shapes the
artifact.
