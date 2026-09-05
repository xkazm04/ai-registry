---
layer: technique
type: technique
subject: client-state
technique: async-race-guards
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary]
shared_with: []
use_when: [stale responses overwriting fresher answers, duplicate flights for identical questions, failed rollback erasing concurrent mutation]
---

# Async race guards

Responses arrive in an order the client did not choose. The user types
"ab", then "abc"; the second query is cheaper and returns first; the first
returns second and overwrites the better answer with the worse one. Nothing
exotic is required — one slow response and one fast one — and every
request-shaped interaction in the product is exposed: search-as-you-type,
filter changes, tab switches, detail loads on selection change, refreshes
racing user-triggered fetches.

No store design prevents this. The store applies whatever it is handed;
correctness is decided at the **write site**, by guards that decide whether
a completed response still has the right to write. Three guards cover the
territory; a mature client uses all three, each where it fits.

## Latest-wins tokens

The standing guard for *replaceable* requests — those where a newer request
supersedes an older one for the same slot (the search box, the detail
panel, the current page).

Mechanism: the slot holds a token identifying its most recent request. Each
dispatch mints a fresh token and stores it **synchronously, before the
request leaves** — the gap between "dispatched" and "recorded" is exactly
where a race slips in. Each completion (success *and* failure paths alike)
compares the token it captured at dispatch against the slot's current
token; on mismatch it is **inert, not an error** — stale responses are the
normal behavior of asynchronous delivery, expected on every rapid
interaction, and a guard that logs them as failures teaches everyone to
ignore the log.

Token discipline follows
[identity-survives-reuse](../../../_laws.md#identity-survives-reuse): a
monotonic counter or opaque unique value per slot, never a timestamp
(collides under rapid dispatch, precisely when the guard matters) and never
the request *arguments* (the user can legitimately return to a previous
argument; the guard must distinguish attempts, not questions).

Scope the token by slot: one token per independently-updating target, keyed
exactly like the status machine it protects
([status-fsms](./status-fsms.md)). A single global token turns every fetch
into a canceller of every other.

Centralize the mint/compare pair in one small shared utility rather than
letting each fetch site hand-roll its own counter — the comparison
direction ("am I still current?") only needs to be gotten right once, and a
hand-rolled ninth copy is where it gets inverted
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary),
applied to a guard instead of an enum).

A paged list has **two** write paths into one slot, and the guard is
routinely installed on only one of them. Replace — a fresh first page from
a refresh, a filter change, a re-sort — is the obvious one. Append — the
load-more that adds to what is already there — is the one that gets
forgotten, because it reads as additive rather than as an overwrite. It is
not additive: it computed its offset, cursor or page number *against the
state a concurrent refresh has since replaced*, so its rows land on top of
a list they were never enumerated against, duplicating some entries and
skipping others, and the result is stable enough to look like a server
bug. The append path therefore mints and checks its token from the **same
slot sequence** as the replace path — one sequence per list, whichever
path dispatches — so a refresh landing mid-load-more makes the append
inert, and the next load-more starts from the list that now exists.

Cancellation is the complement, not the alternative: aborting the
superseded request on dispatch of its successor saves bandwidth and server
work, but abort is advisory — the response may already be in flight, and an
aborted request still resolves its bookkeeping. **The token check remains
the guarantee; cancellation is an optimization layered on it.**

A debounce or a throttle is **not a member of this family**, and the
mistake of counting it as one recurs in codebases that otherwise know
better. A timer bounds how often requests *leave*; it says nothing about
the order responses *land*. Two dispatches that clear the timer — a pause
between keystrokes, a retry that bypasses the throttle, two changes
outside the window — are back to the bare race, with the added hazard
that the code now *reads* as guarded, so review passes it and the guard
is never added. The tell is a debounced fetch whose completion writes
unconditionally: the timer prevented the spam and left the overwrite.
Rate-bounding and write-arbitration are different properties; a mature
fetch path frequently needs both, and neither substitutes for the other.

## In-flight deduplication keyed by argument

The guard for *shareable* requests — those where concurrent callers want
the same answer (three widgets mounting at once, each asking for the same
collection).

Mechanism: a registry of in-flight requests keyed by request identity. A
caller finding its key present joins the existing flight instead of
starting another; the entry is removed when the flight settles — success
**or failure**, and removal-on-failure is the half that gets forgotten: a
dedup map that only clears on success caches the failure forever, and every
subsequent caller joins a flight that already lost.

The key must include **every argument that changes the answer** — the
resource, the filter, the page, the scope, the identity on whose behalf the
request runs. An under-specified key is the worse failure mode of the two:
it silently serves one question's answer to a different question, and
unlike a race it does so deterministically. When in doubt, over-specify;
the cost is a duplicate request, not a wrong answer.

The key is also **canonical**, not merely complete. Two callers asking
the same question with the arguments in a different property order, or
with an absent field spelled as an explicit undefined, must land on one
key, or identical flights are never shared and the registry quietly
degrades to no dedup at all. Derive the key through one deterministic
serialization in which keyed structures compare order-independently
while positional ones keep their order significant — the position of an
argument in a list changes the question, the order of named fields does
not — and let no call site build a key string by hand.

Dedup entries name their reaper (settlement removes them), and the registry
is bounded by construction — it holds only in-flight work. An entry that
can outlive its flight (a promise that never settles) needs a timeout, or
the key wedges permanently: every future caller joins a flight that will
never land.

## Guarding the mutation path

Reads race reads; mutations race everything. Two additional rules where
writes are involved:

- **A mutation is not superseded by a newer mutation** the way a read is —
  both writes happened in the world, and both completions carry information
  (at minimum, whether they succeeded). Latest-wins applies to *displaying*
  results, not to *acknowledging* mutations: route each completion to its
  own operation's lifecycle (its keyed status machine), never to "the
  current" one.
- **Optimistic updates need an undo ledger keyed by attempt.** Applying the
  expected result immediately and reconciling on completion is fine — but
  the rollback on failure must undo *that attempt's* delta, not "reset the
  entity", or a concurrent successful mutation's result is destroyed by an
  unrelated failure's rollback.

The ledger is the entry point rather than the whole discipline: serializing
attempts per entity so a snapshot is always of settled state, and checking
before reverting that what the attempt wrote still holds, are the
[optimistic-write-path](./optimistic-write-path.md) technique.

## Where each guard lives

Guards belong in the **data operation layer** — the functions that dispatch
requests and commit results — not in view code. A view-level guard protects
one call site and evaporates when the view unmounts mid-flight; an
operation-level guard protects every caller, including ones not written
yet. This is also the boundary where the streaming case takes over: when
the thing racing is not one response but a *stream of events*, the same
identity discipline extends into per-event gating and consumer-side
generation counters — that elaboration is
[run-attribution](../../../llm-agent/runtime-and-io/streaming-output/techniques/run-attribution.md),
and the two techniques should agree on what mints identity.
