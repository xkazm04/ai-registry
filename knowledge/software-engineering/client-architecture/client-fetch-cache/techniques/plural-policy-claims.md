---
layer: technique
type: technique
subject: client-fetch-cache
technique: plural-policy-claims
status: forged
laws: [creation-names-reaper, one-authority-per-vocabulary]
shared_with: []
use_when: [two call sites ask for the same key with different cache options, deciding whose TTL wins when one entry has many readers, data vanishes while a view is still showing it, one component's cache settings change another's refetch behaviour]
---

# Plural policy claims

The golden path says a cache declares four policies and that all four are
stated **at the cache's construction site**. That instruction is written for a
cache with one declarant, and the moment a fetch layer keys entries by
argument rather than by call site, it stops being true. Two components asking
the same question share one entry, and each brought its own opinion about how
long the answer is believable and how long it should be kept. The entry now
has a *set* of claims per policy, and nothing in the four-policy discipline
says how a set collapses to a decision.

The failure this produces is not a crash. It is a component whose stated
options are silently overruled by a component it has never heard of — the
list view that asked for a thirty-second lifetime getting a five-minute one
because a widget elsewhere on the page asked for five, or worse, a detail
view's data evicted out from under it because the list that also read that
key unmounted and its shorter eviction claim was the last one written.

**Each policy resolves across claimants with its own quantifier, and the
quantifier is chosen by which direction of error is unrecoverable.** This is
the whole technique. It is not a single conservative rule applied uniformly,
because the policies fail in different directions:

- **Eviction resolves by maximum, and monotonically.** Discarding an entry a
  live claimant still needs destroys data — the reader repaints a ghost for
  something it was showing a moment ago, and the only repair is a refetch that
  may not be possible. The error is unrecoverable, so the entry survives for
  the **longest** claim any claimant has ever made, and the resolved value
  never shrinks when a claimant with a shorter claim arrives. A late claimant
  may extend a lifetime; it may not shorten one.
- **Believability resolves existentially.** If *any* claimant considers the
  entry stale, the entry is stale and a revalidation is owed. Refetching
  something that was still fresh for another reader costs one request; showing
  a reader data it had declared too old costs correctness. The cheap error is
  the recoverable one, so the most demanding claimant sets the floor.
- **Trigger resolves to exactly one claimant.** When a shared signal fires —
  a focus regain, a reconnect — many claimants may want a refetch and exactly
  one refetch should happen. This is not reconciliation at all but
  [in-flight-dedup](./in-flight-dedup.md) wearing a policy's clothes: pick the
  first claimant that wants the work, run its options once, and let the shared
  result reach everyone. Resolving this one by "max" or "any" is a category
  error that produces a refetch storm proportional to the number of readers.
- **Key does not resolve, by construction.** Claimants that disagree about the
  key are not claimants on one entry; they are two entries. This is the
  policy that makes the other three well-posed, and it is why
  [cache-key-discipline](./cache-key-discipline.md) is upstream of all of
  this.

## Attachment suspends the clock; it does not shorten it

The eviction rule above governs the *duration*, and there is a second
mechanism underneath it that is easy to conflate and must not be: while any
claimant is attached, the eviction clock does not run at all. Eviction time is
not "time since the entry was written", it is "time since the **last**
claimant left". An entry with three readers and a thirty-second eviction claim
is not a candidate for removal thirty seconds after it was fetched; it becomes
one thirty seconds after the third reader unmounts.

Collapsing these two into one timer is the bug that makes a busy screen drop
its own data mid-render. Keep them separate: reference counting decides
*whether* the clock runs, the max-claim decides *how long* it runs for once
started, and the entry is reaped only when both agree ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).

## State the resolution rule where the policy is declared

A resolution rule nobody wrote down is folklore that only surfaces as a bug
report from two teams who each believe the other's component is broken. The
discipline mirrors the golden path's own: as the construction site declares
the four policies, the **cache primitive** declares how each collapses across
claimants, once, as the single authority for that vocabulary
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
A reviewer looking at two call sites with different options must be able to
predict which wins without reading the cache's source.

Two consequences worth stating because they are routinely got wrong:

- **A claimant cannot be assumed to be the only one.** Options passed at a
  call site are a *request*, not a setting. Documentation that says "set the
  lifetime here" without saying "and it is reconciled with every other reader
  of this key by maximum" has taught the reader something false.
- **Diverging options on one key are a design smell worth surfacing.** Where
  two call sites genuinely need different lifetimes for the same question,
  they usually want different *keys* — the question is not as identical as the
  key claims. A development-mode warning on divergent claims for one key finds
  under-specified keys cheaply, which is the same defect
  [cache-key-discipline](./cache-key-discipline.md) hunts from the other side.

## Checks

- For each policy, the cache states its across-claimant quantifier at one
  place, and a reviewer can name it without reading callers.
- The eviction resolution is monotonic: a later, shorter claim cannot shorten
  an existing entry's lifetime.
- Reference counting and duration are separate mechanisms; the eviction clock
  starts on last detach, not on write.
- A shared trigger produces one refetch, not one per claimant.
- Divergent claims on a single key are observable in development.
