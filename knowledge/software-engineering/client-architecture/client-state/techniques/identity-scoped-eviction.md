---
layer: technique
type: technique
subject: client-state
technique: identity-scoped-eviction
status: forged
laws: [one-validation-door, creation-names-reaper, identity-survives-reuse]
shared_with: []
use_when: [the signed-in user changes and caches must not survive it, deciding whether a transition counts as an identity flip, one account sees another's rows after a switch]
---

# Identity-scoped eviction

Every cache a client holds carries an invisible key nobody wrote down:
*the identity it was fetched on behalf of*. The list is that user's
records, the preferences are that user's preferences, the derived counts
summarize that user's data.
[invalidation-strategy](./invalidation-strategy.md) treats a cache as
wrong when the authority changed underneath it. This technique treats a
cache as wrong when **the person it belongs to changed** — an axis with
no timer, no change event from the authority, and no gradual staleness.
At the instant identity flips, every user-scoped entry in the process is
not stale but *illegitimate*, and the cost of serving one is not a wrong
number: it is one account's data on another account's screen.

## One owner, called from an enumerated list of triggers

**One owner.** A single named routine wipes every user-scoped cache, and
every identity transition calls it. The arrangement that grows on its own
instead — each store subscribing to an identity-changed signal and
clearing itself — distributes the obligation across as many modules as
there are caches, and leaves no place a reader can look to answer "what
gets cleared?". The number of caches only goes up; the number that
remembered to subscribe does not
([one-validation-door](../../../_laws.md#one-validation-door), applied to
a teardown instead of a write).

Where that routine lives is load-bearing. It belongs below both the
identity layer and the caches, so that it may import every store it
clears while none of them import it. Put it inside the identity store and
that store acquires a dependency on every feature in the application; the
import cycle which follows is usually resolved by somebody quietly
deleting a clear.

**An enumerated trigger list.** The flips are written down, at the owner,
as a list — because "identity changed" is not one event, and inferring it
from a credential comparison misses several:

- a deliberate sign-out;
- entering or leaving a demonstration, sample-data or impersonation
  mode, which is an identity flip although no credential changed;
- credential expiry — the session ended and the user did nothing;
- revocation from elsewhere — an administrator, a password change, a
  device removed;
- a sign-out in another tab of the same profile, which changes identity
  here with no local action to observe;
- switching accounts directly, the dangerous one, because there is no
  signed-out moment in between for anything else to notice.

And one deliberate exclusion, recorded *as* an exclusion: **a plain
credential refresh is not an identity flip.** The bearer credential
changes; the user does not. Evicting on refresh converts routine
background maintenance into a periodic cache stampede and a flash of
empty screens on a cadence nobody will connect back to the refresh
interval. A trigger list is only useful if it also says what is not on
it, with the reason attached — a maintainer who adds refresh because "it
is the safe direction" is exactly the event the note is written for.

**Every trigger names its edge.** A trigger written as *an identifier
changing* is silently ambiguous until the list says which edge of the
change fires it. Where the identifier is a lifecycle handle that is absent
between operations — empty while idle, populated while one runs — the
tempting edge is the one where it becomes populated, and it is the wrong
one: an operation carries state assembled before it started, so a reset on
the opening edge erases exactly what the operation just took custody of,
and the erasure is invisible because the screen is already in transition.
Key such a reset on the **return to empty** instead, the edge where the
operation has settled and the state it carried is genuinely spent. Write
the edge down beside the event, because a maintainer reading "resets when
the run identifier changes" cannot recover which of the two transitions
was meant, and will pick whichever one their next bug argues for.

Identity itself is compared by durable identifier, never by display name
or address: those change without the person changing, and a reclaimed
handle stays equal while pointing at somebody else
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)).

## Wipe everything; do not be clever about the key shape

The obvious optimization is to clear only the entries whose keys look
user-scoped, and it should be refused, because the two failure directions
are not comparable. Over-wiping costs refetches: the next screen is
slower once, at a moment the user already expects an interruption.
Under-wiping costs a cross-account disclosure — and under-wiping is what
a key-shape predicate produces, because a cache added later with a shape
the predicate does not recognize is simply not evicted. Nothing fails,
no test notices, and the defect surfaces when two accounts share one
machine.

So the default is total: every user-scoped store returns to its initial
state, and the genuinely identity-independent ones — a theme, a language,
a "you have seen this once" flag — are the enumerated exception rather
than the rule. **Write the asymmetry down at the wipe site.** Clearing
everything reads as laziness to the next engineer, and without the reason
in front of them they will narrow it.

Every cache names its reaper, and for a user-scoped cache this routine is
that reaper
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). It
gives a new store's review a single answerable question — *is this
user-scoped, and if so where is its line in the eviction owner?* — which
is the only mechanism that keeps the list complete as the application
grows.

## Persisted preferences cross the boundary too

This is the half that is forgotten in every implementation: in-memory
caches die with the process, so the state that actually survives a
sign-out is precisely the persisted state. A saved filter set, the last
opened workspace, a column layout naming fields of another account's
schema, a "recently viewed" list of identities the next user cannot even
open — all written under the previous identity, all rehydrating under the
next one, all invisible to a wipe that only walks in-memory stores.

Reset the persisted stores through the same owner, and clear the stored
payload rather than only the live copy, or the next launch faithfully
restores what the eviction removed. Where a preference genuinely should
survive an account switch on a shared machine, that is a per-store
decision taken once and listed at the owner beside the refresh exclusion
— not an accident of which stores happened to be persisted.

## The local wipe does not depend on the network

Signing out usually also tells the authority to invalidate the session.
That call can fail — offline, timed out, an authority that is down — and
the local eviction must happen anyway: in the settlement path that runs
on both outcomes, with an explicit forced branch for the failure case. A
sign-out that leaves local caches intact because a request failed is the
worst outcome available here, since the user has been told they are
signed out, the screen agrees, and the data is still resident and still
rendered by the next thing that reads it. Remote invalidation is
best-effort; local eviction is the guarantee.

## Involuntary loss is spelled differently from a deliberate exit

The eviction is identical either way; the narration is not. A user who
signed out asked for this and expects the entry screen. A user whose
session expired or was revoked asked for nothing, and treating the two
identically produces the familiar report of being "randomly logged out" —
which is not a complaint about the eviction but about the absence of an
explanation and of a route back to what they were doing. So the identity
layer computes the *reason* for the transition and carries it through, so
the surface can say which of the two happened and offer the matching way
back.

## The session that names the identity is itself untrusted

A cached session read at startup decides who this process believes it is,
and it comes out of the same untrusted storage as everything else. It is
therefore validated for shape *and* for expiry before it is allowed to
name a user, under
[rehydration-narrowing](./rehydration-narrowing.md)'s rules — an expired
session adopted because it merely parsed produces a process that believes
in an identity the authority already retired, fetches on its behalf, and
evicts nothing when the truth finally arrives. The rehydration path and
the eviction path meet exactly here, and a client that gets one of them
right and the other wrong has neither.
