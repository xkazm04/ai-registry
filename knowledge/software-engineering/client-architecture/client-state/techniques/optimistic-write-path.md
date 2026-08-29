---
layer: technique
type: technique
subject: client-state
technique: optimistic-write-path
status: forged
laws: [identity-survives-reuse, failure-not-empty-success, one-validation-door]
shared_with: []
use_when: [painting a mutation before the authority agrees, two rapid actions on one entity corrupt each other's rollback, a failed write resurrects a value the authority already contradicted]
---

# Optimistic write path

An optimistic update is a promise the client makes on the authority's
behalf: it paints the expected result before the authority has agreed to
it, and undertakes to make the screen honest again if the authority
disagrees. The payoff is real — the distance between an interface that
answers in a frame and one that answers in a round trip is the distance
between a tool and a form. The debt is that the client now holds a value
nothing has confirmed, and this technique is about how that value is
retired: committed when the authority agrees, withdrawn when it does
not, and — the half the naive recipe gets wrong — withdrawn **only if it
is still the value on screen**.

## The naive recipe and the two operations that break it

Snapshot the entity, patch it with the expected result, dispatch the
request, and on failure write the snapshot back. Four steps, correct in a
demonstration, and wrong under two operations every real interface
performs.

**Two rapid actions on the same entity.** The user toggles a row and
toggles it again before the first request lands. Attempt A snapshots the
settled value and paints its own; attempt B, dispatched a moment later,
snapshots *A's unconfirmed paint* and paints on top of it. Now A fails:
its rollback restores the pre-A value and discards B's paint while B is
still in flight. Or B fails first: its rollback restores A's optimistic
value — a value the authority never agreed to, and, if A also fails,
never will. A snapshot only means anything when it is the **settled**
state, and under overlap it is not.

**A refetch landing between the patch and the failure.** The list
revalidates — a focus return, an invalidation event, a scheduled floor —
and commits the authority's current truth over the optimistic value.
Then the mutation fails and unconditionally writes its snapshot back,
resurrecting a value the authority has just contradicted. The rollback
wins over the fresher fact for no better reason than that it was written
to be unconditional.

Both are one defect seen from two sides: **an unconditional rollback
assumes it is the only writer**, and in a client with concurrent
mutations and background revalidation it never is. The two fixes below
address the two sides, and neither substitutes for the other.

A third measure, standard practice in mature cache layers, narrows the
second window without closing it: **cancel or pause the entity's
in-flight revalidations at paint time**, so a refetch already in the air
cannot land on top of the optimistic value mid-attempt. It is worth
doing — the common "my optimistic update didn't stick" report is exactly
a pre-paint refetch resolving after the paint — but it is a mitigation,
not the guarantee: a revalidation dispatched *after* the paint (an
invalidation event, a focus return) still lands, which is why the
conditional revert below remains load-bearing even where cancellation
is wired.

## Serialize per entity: the mutation mutex

At most one in-flight mutation per entity identity; a second attempt
waits for the first to settle. Then snapshot N is, by construction, the
settled state of N−1, and overlapping snapshots stop existing rather
than being detected after the fact.

- **Keyed by durable entity identity, never global.** A global lock makes
  the whole interface feel like a queue for a conflict that is per
  entity; keys are the entity's minted identity, not a row index or a
  display name
  ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)).
- **The whole attempt is inside the critical section** — snapshot, paint,
  request, settle. Splitting the paint out to keep the interface
  responsive reintroduces exactly the overlapping snapshot the mutex
  exists to prevent.
- **The second action waits; it is not dropped.** A discarded toggle
  reads as a broken control and the user presses it again. Where a
  later action genuinely supersedes an earlier one (a last-write-wins
  field edit), coalescing to the latest pending intent is legitimate —
  but that is a decision taken per operation kind, with the reason
  recorded, not a default.
- **Waiting on a predecessor is not inheriting its failure.** The
  successor waits for the previous attempt to *settle*, and a
  predecessor that failed must not fail the successor: each attempt
  surfaces its own outcome to its own caller. A queue that propagates
  rejections downstream turns one failed write into a run of failures
  on unrelated intents, and the user sees a cascade where one thing
  went wrong.
- **Release the slot only if you still own it.** The slot holds the
  identity of its current holder, and a settling attempt clears it only
  when the holder is still itself. Without that check an abandoned or
  superseded holder clears the slot out from under its successor, and
  two mutations proceed concurrently in precisely the case the mutex
  was built for.
- **The holder names its reaper.** A slot whose holder never settles
  wedges that entity permanently. Bound the wait; on expiry reclaim the
  slot, and let the abandoned attempt discover on settlement that it no
  longer owns anything and stay inert. An identity eviction clears the
  whole register at once, which is the second and more common way a
  settling attempt finds itself unowned — and the reason the ownership
  check is not optional even where nothing ever times out.

## Revert by compare-and-swap, never unconditionally

**Revert only while the exact field set you wrote still holds.** Before
writing a snapshot back, compare the entity's current values *on the
fields this attempt patched* against the values this attempt painted.
Equal: nothing has overwritten the optimistic value, and the revert is
the correction it was meant to be. Different: a later commit, a refetch,
or a subsequent mutation has already written a newer truth, and the
revert is **dropped**.

The comparison is over the written field set and nothing else, in both
directions. Comparing the whole entity is too strict — any unrelated
field a refetch refreshed makes the predicate fail, and the attempt then
declines to undo a value it genuinely owns. Comparing identity alone is
too loose, and reverts over the newer fact. So each attempt records what
it wrote, and its revert carries that record: the undo ledger keyed by
attempt that [async-race-guards](./async-race-guards.md) prescribes,
with the compare-and-swap check added at the moment of use.

Two limits of the predicate have to be stated, because the obvious
implementation walks into both:

- **Compare by value, not by reference.** A patch carrying a structure —
  a nested configuration, a list of labels — is usually stored as the
  very object the attempt was handed, so an identity comparison is
  trivially true and the guard does nothing; and after a refetch, which
  rebuilds every object, the same comparison is false even where the
  value is unchanged, so a legitimate revert is silently skipped and the
  unconfirmed value stays on screen. Compare the written fields
  structurally, to the depth the patch reaches.
- **Equal values are not proof of ownership.** A refetch that
  independently lands the same value the attempt painted satisfies the
  predicate, and the revert then overwrites an authority-confirmed value
  with a pre-edit snapshot. Where that matters, the entity carries a
  **write stamp** — a counter bumped by every write to it, captured at
  paint time and compared at revert time — so the predicate asks *has
  anything written this entity since I did?* instead of *does it still
  look like what I wrote?*. Value comparison is the cheap
  approximation; the stamp is the exact answer, and the choice between
  them is made per entity kind, on how expensive a wrong revert is.

**An entity that is gone is also a newer truth.** When the record has
left the store between the paint and the failure — a refetch dropped it,
an identity eviction wiped it — the revert is dropped rather than
reinserted. Writing a snapshot back into a store that no longer lists
the record resurrects something the authority has stopped acknowledging,
and it will survive until the next full refetch.

A dropped revert is normal and not an error — the same discipline as a
stale response being inert rather than logged as a fault. It is not,
however, silence about the *outcome*: the mutation still failed, and the
failure still belongs on that operation's own keyed status machine
([status-fsms](./status-fsms.md)) so the user learns the change did not
take. Losing the revert must never mean losing the failure — and this is
the case where it most often does, because the row the failure would
have been shown on is exactly the one that disappeared. A field that
quietly reverts to empty is indistinguishable from a field that was
always empty unless the failure travels beside it
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## Commit is a write, not an assumption

On success the authority's response is the truth, and it replaces the
optimistic guess rather than being presumed equal to it. The fields the
authority assigns — minted identifiers, timestamps, normalized text,
derived counters, computed permissions — exist only in that response,
and an optimistic paint that already *looks* right is exactly the state
that hides a divergence until some later refetch exposes it as an
unexplainable change. Commit under the same keying rule as revert: an
attempt commits its own entity's row, never "the current" one. A write
path that serializes and reverts correctly but never writes the response
back is two thirds built — it holds an unconfirmed value until something
else happens to refetch, and that divergence is the quiet one, because
nothing on screen looks wrong yet.

Every one of these writes — paint, commit, revert — goes through the
slice operation that owns the entity, not through a caller reaching into
the store, because the mutex, the ledger and the predicate are only
enforceable where the writers are enumerable
([one-validation-door](../../../_laws.md#one-validation-door)).

## Keep derived projections stable across a settled write

An optimistic patch touches one entity, but a store usually also
maintains projections over the collection — an ordering of identities, a
grouped index, a count. Rebuilding those unconditionally on every commit
hands every subscriber a fresh reference for a result that did not
change, and the re-render lands on the very interaction the optimistic
paint existed to make instant. Rebuild a projection only when it
actually differs: same members in the same order returns the previous
reference, so a commit or a same-order refetch costs nothing to everyone
subscribed to the ordering rather than to the entity.

## When not to write optimistically

The technique is not free and it is not universal. Pay the round trip
instead when:

- **the authority's answer is not predictable** — server-side validation,
  quota checks, conflict resolution, anything where "what the user asked
  for" and "what will be stored" can differ in content rather than only
  in success;
- **the failure is not correctable by the user** — an optimistic paint
  that reverts with an explanation nobody can act on is a worse
  experience than a two-second wait;
- **the operation is irreversible outside the client** — sending,
  charging, publishing, deleting shared work. Painting success for
  something the world may not have done is a different category of lie;
- **the round trip is already imperceptible**, which is more often than
  it feels; measure before adding a second writer to the store.

The honest default: optimistic writes are for frequent, low-stakes,
self-evident mutations — toggles, reorders, renames, marking as read.
Everything else takes the round trip and shows a busy affordance.
