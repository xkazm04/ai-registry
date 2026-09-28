---
layer: technique
type: technique
subject: client-fetch-cache
technique: sibling-entry-warmth
status: forged
laws: [unknown-is-not-a-value, count-carries-predicate]
shared_with: []
applied: code
ab_verdict: better
use_when: [a detail view opens from a list whose rows already carry part of the detail, a dependent read waits for a field the list row already holds, a detail paints a spinner for a title the user just clicked on, a borrowed list row renders zero for a count it never carried, a lookup of the list row names the list's own filter or page size, a route is warm when clicked through and cold on a shared link or a reload]
---

# Sibling entry warmth

The golden path names three moments when warmth is made: after the first
fetch, before the user commits, after the critical paint. All three are
moments in time. A fourth source is a place. **Another entry already in the
cache often holds part of what this read will return.** The list row the user
just clicked carries the detail's title, and the summary's foreign key is the
key of the read that comes after the detail. Borrowing from that entry is
warmth nobody has to schedule. It is also the warmth most often built wrong,
because the entry lent is not the entry wanted.

## Two different gifts

- **Paint.** The fields the summary carries can paint at once, and the detail
  fills in behind them. This saves a spinner.
- **Address.** A coordinate in the summary, such as an owner id, a category or
  a parent id, is the key of a *dependent* read. Without the borrow, that read
  cannot start until the detail returns the coordinate. With the key seeded
  from the summary, the dependent read leaves in parallel with the detail. A
  chain of reads, each keyed by a field of the one before, costs one round trip
  per link, and every coordinate the summary already holds takes one link out
  of the critical path. This is the larger gift and the less visible one. A
  spinner is visible in review and a waterfall is not.

## A summary is not the entity

The borrowed entry is a different shape: a projection chosen for a listing.
Three obligations follow from that.

- **What the summary lacks is unknown, not empty.** A count, a completion
  ratio or an average computed over a collection the summary never carried
  renders as zero, confidently, in the frame before the real value arrives
  ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). The
  number has lost its predicate ("0 items *in the summary*", which is no
  statement about the list), and it travels as a claim about the list
  ([count-carries-predicate](../../../_laws.md#count-carries-predicate)). The
  laundering point is the conversion from summary type to detail type. **If
  the borrow needs a cast, the cast marks the fields that will lie.** Keep the
  borrowed value typed as what it is, and derive only from fields it actually
  has.
- **It is a placeholder, not the answer.** The borrow must not suppress the
  detail read, and it must not be written into the detail entry as that entry's
  value unless the summary's own age travels with it. Anything that *acts* on
  data must wait for the detail rather than fire on "data is present". That
  covers effects, navigation, and above all permission or capability flags. A
  flag absent from the summary and defaulted to "allowed" gives two entry paths
  two different answers about what the user may do. When the carrier is a
  persisted store rather than the cache, the borrowed copy also has no
  lifetime, so the substitute outlives the session that made it.
- **The status layer is told.** "Partial, borrowed from a listing" is a
  different state from fresh and from stale-refreshing. Only the content region
  is provisional, and only the fields the summary did not carry. What the
  surface shows for it is
  [async-ui-states](../../../ui-surfaces/feedback-and-style/async-ui-states/async-ui-states.md)'
  problem. This subject's job is to report the state honestly.

## The cost: the lender's address becomes the borrower's contract

The literal form reads the summary by the listing's own key. The borrower then
has to know the listing's coordinates: its owner, its filter, its page size.
Those coordinates belong to a different surface, and they become part of the
borrower's addressing contract without anyone deciding it. When the listing
changes its parameters, the lookup misses. When the entity is held by a
different listing of the same family, the lookup also misses. Either way it
misses **silently**: no error appears, only a spinner that used to be absent.

- **Find the summary by the entity's identity across the key family, not by
  the lender's key.** Scan the family's listing entries for the entity's id,
  take the most recently updated hit, and read only entries whose shape is a
  listing. Another entity's detail under the same prefix is not a summary of
  this one, and neither is an aggregate bundle.
- **The cold path is the real path for some users.** On a deep link, a reload,
  a shared URL or any route entered from somewhere other than the listing, the
  summary is absent by construction. Developers test by clicking through and see
  the warm path. First-time visitors get the cold one. Build and test the two as
  twins: the cold path must be correct and acceptable on its own, because the
  borrow is an optimization, never the design. Count which path fired, so that a
  borrow that stopped hitting shows up somewhere.
- **Count the ways in before building the borrow.** A route that is entered
  only from shared links has no lender. A route whose detail is consumed by an
  action rather than a paint (a redirect shim, an auto-opening dialog) gains
  almost nothing from a warm paint, and it risks acting on the placeholder.

## Decision rules

- Treat a sibling entry as a fourth source of warmth. Use it for paint, and
  above all to seed the keys of dependent reads so they leave in parallel with
  the detail.
- Keep the borrowed value typed as a summary. Fields it lacks, and anything
  derived from them, stay unknown until the detail lands, and are never zero.
- The borrow is a placeholder. It never suppresses the detail read, never feeds
  actions or permission checks, and is written into the detail entry only if
  its age goes with it.
- Find the summary by entity id across the key family, freshest first and
  listings only. Never find it by the key of the listing it came from.
- Test the warm path and its cold twin (deep link, reload, empty cache)
  together, and record which path fired.
- Before building the borrow, list the ways the route is entered. With no
  lender on the common entries, there is nothing to borrow.
