---
layer: technique
type: technique
subject: honest-proof-and-illustrative-data
technique: binary-provenance-no-blending
status: forged
laws: [provenance-is-binary-and-labelled, not-measured-is-not-zero]
shared_with: []
use_when: [building a surface that can show either synced or sample data, substituting a real series into a template built on a sample, reviewing a page whose banner does not depend on its data]
---

# Binary provenance, no blending

A surface that can render either a client's real synced series or a disclosed
sample series decides which, once, per request, from the live state of the sync
- and then renders entirely from that branch. The provenance is one bit. The
article, the tiles, the structured data, the banner and the index flag are all
functions of that bit. Nothing on the page is real and sample at once.

The rule exists because blending is the convenient default. A sample dataset is
a complete spine - daily series, channel mix, per-day channel shares, an event
calendar, a narrative - and a real sync substantiates only some of it, usually
just the daily rows. The lazy substitution drops real rows into the sample spine
and ships a page whose totals are the client's and whose channel table is
fiction. No reader can tell which cell to trust, and the model that later
summarises the page cannot either.

## Procedure

1. **Decide the bit from the sync, not from the account.** A linked account with
   no synced rows is not live. The liveness rule - actually synced rows in the
   window, not a connection - belongs to the reporting subject; this surface
   calls it and does not re-derive it.
2. **Decide per request.** No cached "this page is live" flag. A cleared sync,
   a revoked connection or an expired window reverts the page to the sample
   branch on the next request, and the banner and index flag revert with it.
3. **On the real branch, carry only what the sync substantiates.** The daily
   series and its metadata come from the rows; the sample spine's channel mix,
   channel-daily shares and event calendar are dropped, not inherited. A
   forward-looking target may be retained, because a target is a plan and not a
   result, and a plan on real history is honest.
4. **On the sample branch, carry the sample's own provenance everywhere.** The
   article's generated text, its FAQ, its perex and the plain-text twin served
   to answer engines are built with the same illustrative provenance the page
   chrome discloses, so the body does not self-certify demo numbers as real
   while the banner calls them a sample. A twin with no banner is only honest if
   its text carries the provenance itself.
5. **Refuse the substitution when the surface cannot render the real series
   honestly.** A series in a currency the surface does not format stays on the
   sample branch; relabelling a foreign-currency series into the local currency
   symbol on a public page is the exact dishonesty the branch exists to prevent.
6. **Degrade to the sample, never to a blank or a blend.** A store hiccup on the
   real branch falls back to the disclosed sample view, which is honest, rather
   than to a half-populated page, which is not.
7. **Drop the disclosure on the real branch.** The banner is rendered only when
   the bit is sample. A caveat on a client's own synced series tells them their
   results are fiction.

## What "the same shape" buys and costs

The two branches share one snapshot shape and one article builder, so a client's
page looks the same before and after their first sync; that is the point of the
sample. The cost is the temptation to share more than the shape. The discipline
is a single function that takes a dataset and a provenance label and returns the
view, called once per branch with a dataset built entirely for that branch; a
view constructed by patching fields of the other branch's dataset is a blend by
construction.

## Decision rules

- When a real series is available and renderable, take the real branch wholly,
  because a half-real page is less honest than a fully disclosed sample.
- When the real series lacks something the sample spine had, render that thing
  as absent - an empty channel list, no event calendar - because
  [not measured is not zero](../../../_laws.md#not-measured-is-not-zero) and the
  sample's channel mix is not a measurement of this client.
- When the real branch is taken, the disclosure is removed on that surface,
  because a disclosure on real data is the opposite lie.
- When any surface that derives from the view (share card, structured data,
  twin, FAQ) is built, it reads the same bit, because a page whose banner says
  sample and whose dataset node says measured has blended in its markup.
- When the sync state changes, the next request changes the branch; if a deploy
  or a manual flag is needed to switch, the bit was cached and the page will lie
  in the interval.

## When NOT to use

- **Surfaces with no sample branch.** A client report that has never rendered a
  sample has nothing to blend; it needs the reporting subject's liveness rule and
  per-metric badge, not a branch.
- **Surfaces with no real branch.** A public homepage proof band on a fictional
  client is sample-only; the badge technique applies and no bit is needed.
- **Mixed-provenance surfaces by design.** A planning surface that shows a
  proposed link next to a measured one is honest when every leg says where it
  came from - a seed, a generation, the user - and empty legs stay empty. That is
  per-leg labelling, a different discipline; it is not a licence to blend a
  performance series.

## Footing

The one-bit rule and the per-request decision are practitioner convention with
a stated mechanism. The currency refusal is a consequence of the no-summing-
across-currencies invariant, not a separate measurement.
