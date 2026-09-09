---
layer: technique
type: technique
subject: client-reporting-and-data-provenance
technique: live-means-synced-rows
status: forged
laws: [provenance-is-binary-and-labelled, not-measured-is-not-zero]
shared_with: []
use_when: [deciding what a "live" badge on a report means, a workspace has a linked account and no data, choosing whether a report page may be indexed or diagnosed]
---

# Live means synced rows

A client report shows a badge beside its numbers: *live*, or *illustrative*. The badge
is the single most important provenance claim on the page, and the most common way to
get it wrong is to compute it from the wrong fact. An account being *linked* - a
credential granted, a token stored - is not evidence that any data exists. The report
is live when **rows were synced from the source, the sync succeeded, and the report
period lies inside the rows that arrived.** Nothing less earns the badge.

## The states

Four states, typed at the data layer, rendered from the type:

- **Illustrative.** The workspace has no synced source for this metric and the
  figure shown is disclosed sample data placed so the layout has something to show.
  Labelled beside the number
  ([provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)).
- **Linked, never synced.** A credential exists; no rows have ever arrived - the
  first sync has not run, or ran and failed. For reporting purposes this is the
  illustrative state with a different message: "connected, awaiting first sync".
  It is never rendered as live.
- **Synced, not for this period.** Rows exist but the report period falls outside
  them - a source connected mid-month, a sync that stopped three weeks ago. The
  metric is absent for this period, rendered as "no data for this period", not zero
  ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- **Live.** Rows cover the period. The badge is earned, and the *illustrative*
  disclosure is dropped, because a caveat on real data is the opposite lie.

A report is live as a whole only when every tile on it is live. A report with three
live tiles and one illustrative tile is an illustrative report: the reader will not
audit tiles one by one, and the narrative that is generated over the mixed set would
have to switch tense mid-paragraph.

## Procedure

1. **Record, per source and per metric, the last successful sync and the date range
   the rows cover.** A sync log that records only "last attempted" cannot distinguish
   the linked-never-synced state from live.
2. **Derive the state from the rows, not from the credential.** The check is: does a
   successful sync exist, and does its coverage include the period. A token is not an
   input to this check. The same predicate is the shape guard on the stored rows: a
   blob that parses but lacks its rows or its sync metadata - a partial write, a hand
   edit, a schema drift - is *not live*, and degrades to the illustrative state
   rather than throwing on the first tile. Malformed is a provenance state, not an
   exception.
3. **Compute the page-level state as the minimum over tiles.** Live only if all
   tiles are live; otherwise the page carries the weakest tile's label.
4. **Let the state gate three downstream decisions**, not only the badge:
   - whether the narrative generator may write in the client's-data register;
   - whether an automated diagnosis or recommendation may run at all - illustrative
     data is never diagnosed as if it were the client's, and a recommendation issued
     against it is never scored later as an account win;
   - whether the shared report page may be indexed by a search engine. A page of
     illustrative numbers under a real business's name is a proof claim to whoever
     lands on it; it carries a no-index directive until it is live.
5. **Test the linked-never-synced case explicitly.** It is the state a workspace
   spends its first day in and the one most implementations never render.

## Decision rules

- When a source is linked and the first sync has failed, render "connected, awaiting
  data" and keep the illustrative label on the tiles, because a failed sync has
  produced no rows and the reader must not be told otherwise.
- When a source was live and the last successful sync is older than the report
  period's end, the tile is *synced, not for this period* - the report says the data
  stops on the date it stops, and the freshness caveat travels into the narrative.
- When a mixed page must ship - one platform synced, another not - render per-tile
  labels and set the page badge to the weaker state; never promote the page to live on
  a majority of tiles.
- When a client asks for the illustrative label to be removed "because it looks bad",
  the answer is to connect the source, never to relabel. The label is the report's
  only defence against being read as a track record.
- When one predicate decides liveness, every surface reads it - the report badge,
  the narrative's register, the settings page's "connected" label, the public
  surface's indexability. Two predicates (one on the token, one on the rows) is
  how a settings page says "live" while the report says "illustrative".
- When the state changes from illustrative to live, the sample rows are dropped, not
  merged, and any recommendation, baseline or ledger entry computed against the
  sample is retired rather than carried forward as a prior.

## Convention, stated as such

The four-state vocabulary is practitioner convention; platforms do not define it.
What is not convention is the operational definition of live - rows covering the
period - because the alternatives (linked, or recently attempted) are demonstrably
wrong on the workspaces where the badge matters.

## When not to use this

Do not apply the page-level minimum to an operator's dashboard, where the marketer
needs to see the one synced platform beside the two pending ones and act on it. The
minimum rule is for the client page, where the reader reads the badge once.

Do not confuse *synced, not for this period* with a genuine zero. A source that is
live and reported no conversions in the period has a measured zero, rendered as zero;
the state described here is the absence of rows, not the presence of an empty count.

Do not use the live state as a substitute for freshness. Live says the rows cover the
period; it does not say when they last arrived. A period that ended a month ago can
be fully covered by rows synced a month ago, and the report is live and stale at
once. Freshness has its own technique and its own caveat.
