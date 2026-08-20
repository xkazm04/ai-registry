---
layer: technique
type: technique
subject: remediation-handoff
technique: handoff-tenancy-and-idempotence
status: forged
laws: [one-validation-door, identity-survives-reuse]
shared_with: []
use_when:
  - writing the endpoint that records a batch as claimed
  - a handoff can be re-sent, retried, or replayed from a stale selection
---

# Handoff tenancy and idempotence

Generating the artifact is a pure, read-only act. **Recording that a batch was
handed off is a write**, and it is the only write in this subject that a user
triggers directly — which makes it the subject's attack surface and its main
source of duplicate state. The write is small: mark these identifiers as
claimed, note who and when. Everything interesting is in what it refuses.

## Tenancy: authorize the container, then every identifier

The request names a set of identifiers. Identifiers are opaque, which means
the caller may be guessing, replaying a colleague's request, or holding a
stale selection from a workspace they have since lost access to. Two checks
are required and neither substitutes for the other:

1. **Authorize the container** the caller claims to act in — the workspace,
   organization, or project — through the same authorization helper every
   other route in that area uses.
2. **Verify that every identifier belongs to that container**, resolved
   through the *same* ownership lookup the per-item routes use, so the
   ownership rule has exactly one implementation
   ([one-validation-door](../../_laws.md#one-validation-door)). An ownership
   predicate implemented twice is an ownership predicate that will disagree
   with itself the first time someone adds a nesting level.

The refusal shape matters as much as the check. **A foreign identifier fails
the whole request**, with no per-identifier detail — never "we processed four
of five". A partial success is an oracle: a caller can binary-search which
identifiers exist in someone else's tenant by observing which batches
succeed. Refuse wholesale and say only that one or more items do not belong.

Two further refusals belong at this door. A **shared or public demonstration
container** must be refused outright: tracking work implies ownership of the
findings, and a shared sandbox has none. And the batch must be **bounded** —
a hard cap of a few dozen identifiers — both because the cap is the batch
shape you designed for and because an unbounded list of ownership lookups is
a denial-of-service primitive handed to any authenticated user.

## Idempotence: the second send must be harmless

Users regenerate the artifact. They double-click. Their client retries on a
timeout. The same batch will arrive twice, and the second arrival must change
nothing observable:

- **An item already claimed is left alone** — no status write, and crucially
  no second timeline entry. Duplicate history entries are the visible symptom
  of a non-idempotent handoff, and they destroy the item timeline's value as
  an explanation of how the item moved.
- **An item already closed is not reopened.** A batch containing a resolved
  or dismissed item is a stale selection, not an instruction to revive it.
  Skip it — and *report* which identifiers were skipped and in what state, so
  the client can refresh rather than silently disagree with the server.
- **Only open items transition.** The transition set is exactly one edge:
  open becomes claimed. Everything else is a no-op with a report.

The response is therefore not a bare acknowledgement but a small reconcilable
result: what was marked, what was skipped and why. That report is what lets a
client that has been holding a selection for ten minutes correct itself
without a full reload.

## The claim is a record, not a lock

Nothing of yours is blocked by a claim. It does not reserve the item, does
not prevent a second operator from handing off the same finding, and does not
expire on its own — expiry comes from the codebase, through the closing
rules. Resist the pull toward locking semantics: a lock needs an owner, a
timeout, a reaper and a release path, and buys you nothing, because the work
it would protect happens in a process you neither start nor observe.

Do include the claimed items in a regenerated artifact rather than filtering
them out. An operator regenerating a prompt for work already in flight wants
the same document, and re-marking them is the no-op above.

## Identity at the boundary

Identifiers crossing this boundary are persisted identities, minted once and
never reused ([identity-survives-reuse](../../_laws.md#identity-survives-reuse)).
Never accept a positional selector — "items 3 through 7 of the current view" —
because the view is a projection of a list that regenerates, and the rows
under those positions will have changed by the time the request lands. The
same identity is what the marker names on the way back, so a boundary that
accepts anything else has already broken the loop's other half.

## Decision rules

- **When any identifier fails the ownership check, return a single
  whole-request refusal** and touch nothing.
- **When the batch exceeds the cap, refuse with the cap stated**, rather than
  truncating — a truncated claim disagrees with the artifact the user is
  about to paste.
- **When an item is already claimed, skip it silently in the data and report
  it in the response**; do not write a second history entry.
- **When an item is closed, skip and report it**; never reopen implicitly.
- **When the write partially fails on infrastructure, report per identifier**
  what landed, because the artifact has already been generated and the user
  will act on it either way.

## When not to use this

- **When there is no multi-tenancy and no shared ledger** — a single-user
  local tool can record a claim as a local state change, though the
  idempotence rules still apply the moment a retry is possible.
- **When the claim is the gate itself.** If a machine action waits on this
  write, it is an approval, not a handoff, and the human-gate subject's
  semantics govern.
- **When handoff is fully automated** — a scheduler dispatching batches with
  no user in the loop. Then the tenancy check is a service identity question
  and the interesting risk moves to the dispatcher's own scoping.
