---
layer: technique
type: technique
subject: bounded-enumeration
technique: filter-after-return-under-limit
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [hiding keys a caller may not read from a listing, a listing exposes the existence of resources the caller cannot access, a filtered page comes back empty before the collection ends, deciding where in the request pipeline a result filter runs]
---

# Filter after return, under a limit

A listing discloses existence. A caller who may list a prefix but may read
only some of its children learns, from the names alone, that the others are
there — and names carry meaning: a tenant's identifier, a customer's
hostname, a secret's purpose. The remedy is to filter the page to the keys
the caller may access, and the remedy has a cost that makes it admissible
only in one configuration. This technique states the configuration and the
one client-side rule that filtering changes.

## The cost, and why the limit is what pays it

Accessibility of a key is an authorization question, and answering it is an
evaluation of the caller's merged policies against that key's path — the
same work the gate does for a request, done once per key returned. A
filtered page therefore costs the page size times one evaluation. On an
unbounded list that product is unbounded, and it is unbounded in a
particularly bad way: the caller with the *least* access causes the most
evaluations that yield nothing, so the operation is cheapest for the
privileged and most expensive for the caller the filter exists to
constrain. Filtering an unbounded list is a denial-of-service primitive
handed to the lowest-trust caller.

Under a limit the product is bounded, and it is bounded by a number the
policy can set per path (see deny-absorbs-and-lowest-limit-wins), so the
operator who enables filtering on a path also chooses, through the ceiling,
how many evaluations one request may cause. The rule is therefore
conditional in both directions: filtering is admissible only on paths where
a limit is enforced, and the limit's ceiling on a filtered path is derived
as an evaluation budget, not only as a memory budget. Filtering on a path
whose limit is clamped rather than required is admissible — the clamp
bounds the page — but the interaction with legacy callers compounds:
their listing is now both truncated and filtered, and they know about
neither.

## Filter the returned page, not the store's scan

"Accessible" needs a definition before it can be evaluated, and the
definition follows the key's shape: a key that ends in the separator is a
subtree, and it is visible when the caller could list it; a key that does
not is a leaf, and it is visible when the caller could read it. The filter
simulates that one operation per key against the caller's merged policies
and keeps the key when the simulated request would be allowed. Because the
listing path and the readable path are not always the same prefix — a
collection listed under one route whose entries are read under another —
the mapping from a returned key to the path whose accessibility decides it
is stated by the policy author, per path, as a template; the filter is
therefore opt-in exactly where the template is present, and a path with no
template is not filtered.

The filter runs after the store has returned the page and before the
response leaves — a post-processor over the handler's result, not a
predicate pushed into the seek. Two reasons, and both are about where the
gate looks. Pushing the predicate into the store's scan makes the store
evaluate policy, which is a second authorization door
([gate-sees-target](../../../../_laws.md#gate-sees-target) in its other
form: the gate must be the one that sees the target, and there must be one
gate). And a scan that skips inaccessible keys to fill the page runs for as
long as it takes to find `limit` accessible ones, which on a prefix where
the caller can see almost nothing is a full scan — the unbounded cost
returning through a different door. The store returns `limit` keys; the
filter removes the inaccessible ones; the caller receives fewer. The cost
is bounded by the limit because the store never looked past it.

The filter is opt-in per path and off by default, and the default is stated
where the operator can see it, because a filter that is on everywhere
doubles the cost of every listing for the callers who can see everything.
Where the filter is off, the contract says the listing discloses existence;
where it is on, the contract says what the next section says.

## An empty filtered page is not the end

Here is the rule that filtering changes, and the reason this technique
exists as a named concern rather than a paragraph. In an unfiltered
listing, an empty page means the collection is exhausted: the store sought
past `after` and found nothing. In a filtered listing, an empty page means
the store found `limit` keys and the caller may see none of them; the
collection continues, and the next page may be full of accessible keys.
The client's termination rule — stop on empty — is now wrong, and a
client that keeps it terminates early, believing it has seen everything
it may see. The two empties are different outcomes and the response must
spell them differently
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
applied to pages: "nothing visible here" is not "nothing here").

Three designs are honest and one is not. **The response carries the last
key examined**, as a distinct field, and the client resumes from it — but
that field is exactly the leak after-plus-limit-not-cursor forbids: it
names a key the caller may not see. **The response carries a count of keys
withheld**, or a boolean "the store had more", so the client knows to
resume — from where? From the last key it *received*, which on an empty
page it does not have. **The server fills the page itself**: when the
filtered page is empty and the store had more, the handler seeks again
internally from the last examined key, which never leaves the server, and
repeats until a visible key is found or a bounded number of re-entries is
spent — a number the policy sets beside the ceiling, because each re-entry
is another page of evaluations and the bound is what keeps the filter
admissible. The third design is the one that keeps the client's loop
unchanged, and its cost is that one external request now causes several
internal pages, which the audit trail and the request quota see as one
request; that is the right accounting, and it is stated. The honest
position, and the one the contract states, is that a filtered listing is
resumed from the last *visible* key received on any prior page; that an
empty filtered page under a design without server-side fill is a signal to
request again with a larger limit or to accept that the visible keys
beyond this point are reachable only by a caller with broader access; and
that the widening in the naive design — a `next` cursor computed from the
last examined key — is the one thing the endpoint does not do. The naming matters: an engineer will propose the cursor within a
week of the first support ticket, and the proposal is a disclosure of every
key the filter hid, one page at a time.

That leaves a real gap, and it is stated rather than hidden: a caller whose
accessible keys are sparse under a prefix cannot reach them through a
filtered page whose limit is smaller than the gap. The remedies are the
operator's — raise the ceiling on that path, or restructure the key space
so that the caller's keys share a prefix the caller may list unfiltered —
and the contract says which remedy applies rather than letting the client
discover that "empty" meant three different things.

## Decision rules

When a listing would disclose names the caller may not read, filter the
returned page to accessible keys, but only on paths where a limit is
enforced, because the filter's cost is the page size times one policy
evaluation and only the limit bounds it.

When implementing the filter, run it over the page the store returned and
never inside the seek, because a scan that skips inaccessible keys to fill
the page is unbounded on exactly the caller it constrains.

When a filtered page comes back empty, do not treat it as the end of the
collection, because the store found keys and the caller may see none of
them; the contract states how the client resumes.

When asked to add a `next` cursor to a filtered listing, refuse and name
the leak, because the cursor is computed from a key the filter withheld.

When enabling the filter on a path, re-derive that path's ceiling as an
evaluation budget, because the memory-derived page may be far more
evaluations than the authorization layer can afford per request.
