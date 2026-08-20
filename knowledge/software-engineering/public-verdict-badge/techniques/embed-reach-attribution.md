---
layer: technique
type: technique
subject: public-verdict-badge
technique: embed-reach-attribution
status: forged
laws: [count-carries-predicate, one-validation-door]
shared_with: []
use_when: [counting impressions of an embedded artifact, reporting where a badge is displayed, a referrer-derived metric is about to be published]
---

# Embed reach attribution

Once a badge is embedded, two questions follow immediately — from the product
side ("is this channel worth maintaining?") and from the subject ("how many
people saw my verdict?"). Both want a number, and the number is, in principle,
unrecoverable. This technique is how to produce a useful one anyway without
publishing a lie: as a **declared lower bound over a surface you do not
control, assembled from a signal anyone can forge.**

Note the boundary: internal product measurement — which of your own screens
users live in — is a different discipline with different privacy and coverage
properties. This is measurement of somebody else's page, through a keyhole.

## The tally is a floor, and the floor is declared at its source

Impressions become countable only when they reach your origin, and most of
them never do. Image proxies on the hosting surfaces cache aggressively and
serve many views from one fetch. Browser caches absorb repeat views by the
same reader. Your own cache directives — which you deliberately set long,
because the alternative is an origin incident — are themselves a major
absorber. Aggregators re-serve copies you never see. Every one of these biases
in the same direction: **an observation can happen without producing a record,
and no record can be produced without an observation.** That is a clean lower
bound, which is the strongest form of an admittedly partial number.

Three rules make it honest:

1. **Declare the bound where the number is produced**, not where it is drawn.
   The comment on the query or aggregation that computes the tally states that
   it is a floor and names the absorbing mechanism. A caveat living only in
   the component that renders it survives exactly until the second consumer
   appears — and on a number this quotable, the second consumer is usually a
   sales deck.
2. **Carry the phrasing into the rendered string**: "at least 12,400 views",
   not "12,400 views" with a footnote. The footnote does not survive the
   screenshot, and this is
   [count-carries-predicate](../../_laws.md#count-carries-predicate) applied to
   a number's format rather than its documentation.
3. **Never reconcile the floor against a differently-scoped total.** Comparing
   your tally to a hosting platform's own view count invites a "we are
   undercounting by 90%" conclusion that is not supported: the two count
   different events over different populations. A consistently measured floor
   is sound as a *trend* even where its level is not; say that, and compare it
   only to itself.

The general form of this argument — establishing the direction of a number's
bias before deciding what may be claimed — belongs to
[lower-bound disclosure](../../measurement-honesty/techniques/lower-bound-disclosure.md);
what is specific here is that the absorbing mechanism is *your own cache
policy*, deliberately chosen, and that a second party will quote the result.

## The location signal is forgeable, so it must be capped

The only clue about *where* an impression happened is a referrer header, which
is supplied by the client and is trivially fabricated, omitted, or truncated
to an origin by privacy policy. Treat it as an untrusted hint. Concretely:

- **Never let a header mint unbounded rows.** A scripted caller sending a
  fresh fabricated referrer per request can, against a naive tally, create one
  row per request forever. That is two failures at once: a fabricated
  popularity metric, and a write-amplification vector on a public unauthenticated
  path.
- **Cap distinct attributed sources per subject.** Count the first N distinct
  hosts observed for a subject, then stop creating new source rows while
  continuing to count total impressions. A real subject displays its badge on
  a handful of surfaces; a subject with thousands of distinct referring hosts
  is telling you about an attacker, not an audience.
- **Store the host, never the full address.** The path carries content the
  viewer did not choose to send you, and you have no need for it.
- **The cap lives at the write door**, with every writer passing through it
  ([one-validation-door](../../_laws.md#one-validation-door)). A cap enforced
  in the one endpoint that exists today is a cap absent from the endpoint added
  next quarter, and this particular door is publicly reachable and
  unauthenticated, which is the worst possible place to rely on discipline.
- **Refusing to attribute is a legitimate answer.** Where the header is absent
  or fails validation, count the impression and attribute it to a shared
  bucket. Two buckets earn their keep: one for "no source supplied" and one
  for "supplied but not host-shaped". Past the per-subject cap, further *new*
  hosts fold into the same shared bucket — still counted, no longer
  attributed — while an already-known host is always incremented, since
  bumping an existing row grows nothing. That ordering is what makes the cap
  invisible to real embedders, who concentrate on a handful of surfaces.
- **Tally only the shared-cacheable request shape.** This is the
  counter-intuitive one. A customized request is served un-shared, so *every*
  such request reaches your origin — which makes the customized path a free,
  uncapped write lever: vary a meaningless parameter and a fabricated source
  header on each call. The canonical request shape is both the one real
  embedders use and the one a shared cache actually collapses, so restricting
  the tally to it bounds the write *and* keeps the number an honest floor
  drawn from consistently-cached traffic.

## Recording must not slow or break the artifact

The badge response is on someone else's page load. Tally writes are
best-effort and off the response path: fire-and-forget, batched, or queued. A
failed write loses a row from a number already declared as a floor, which is
by construction acceptable. A failed write that turns into a 500 replaces a
verdict with a broken image on a public page, which is not.

The same reasoning bans synchronous per-request writes on a hot path: a
crawler burst becomes a write storm against your primary store, and the
badge — the cheapest, most-fetched thing you serve — takes the product down.

## What the number may be used for

- **Legitimate:** trend over time for one subject or in aggregate; a coarse
  "this channel is or is not worth maintaining" judgement; showing a subject
  the surfaces their badge appears on, labelled as observed-not-exhaustive.
- **Not legitimate:** billing, public leaderboards, ranking subjects against
  each other, or anything where the differing cache behaviour of two hosting
  surfaces would silently become a difference in the subjects' scores. Two
  equally-viewed badges on differently-cached pages can differ by an order of
  magnitude in what you record.

## Procedure

1. **Decide the bound's direction first** — for impression counting it is
   always a floor — and write it as a comment at the aggregation.
2. **Record host-only attribution**, through one write door, capped per
   subject at a small N distinct sources, with unparseable and over-cap
   sources folded into shared buckets rather than minting rows.
3. **Write off the response path**, best-effort, batched.
4. **Render with the bound in the string** wherever the number appears,
   internally and externally.
5. **Restrict downstream use** by policy: no billing, no cross-subject
   ranking.

## When not to use this

- **Not where an exact count is required.** If a number must be exact —
  contractual, financial, entitlement-bearing — this measurement cannot supply
  it, and no amount of instrumentation will; change the requirement or change
  the delivery mechanism.
- **Not by defeating the cache to improve the count.** The temptation to
  shorten cache lifetimes so more impressions become countable trades a real
  property (the artifact loads fast and your origin survives) for a cosmetic
  improvement in a number that will still be a floor afterwards.
