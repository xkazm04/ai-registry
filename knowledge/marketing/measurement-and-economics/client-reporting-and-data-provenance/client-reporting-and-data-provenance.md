---
layer: golden-path
type: golden-path
subject: client-reporting-and-data-provenance
status: forged
use_when: [assembling a periodic client-facing marketing report, choosing which tiles a report shows for a given business, grounding a model that will narrate a month of marketing results, deciding whether a report may say "live" or must say "illustrative", rendering a lower-is-better metric or a multi-currency account to a client]
techniques:
  - tile-presets-by-business-type
  - live-means-synced-rows
  - stale-caveat-travels-into-the-narrative
  - lower-is-better-inverts-verdict-not-number
  - never-sum-across-currencies
  - plain-language-gloss-and-white-label
---

# Client reporting and data provenance

A client report is the one marketing surface where the reader is not a marketer. The
owner of a Czech e-shop, a dental clinic, a regional plumber opens it once a month,
reads the top four numbers and the first paragraph, and decides in that minute whether
the agency earned its fee. Every other measurement surface in this bundle is read by
somebody who can tell a linked account from a synced one; this one is read by somebody
who cannot, and who will repeat what it says to their accountant and their next agency.

This subject owns **the assembly of that report: which numbers it shows, what each
number is allowed to say about where it came from and how fresh it is, and what the
narrative around the numbers may claim**. It does not own whether a delta is real -
the equal windows, the weekday balance, the significance tier and the muted arrow
belong to `period-comparison-significance`, and a report consumes that verdict rather
than recomputing it. It does not own what a cost-to-revenue ratio means economically
or where break-even sits - `profit-on-ad-spend-economics` owns that. It does not own
the month-end projection (`goal-pacing-and-forecast`), the cause of a bad month
(`performance-root-cause-diagnosis`), or whether the month's results were caused by
the agency at all (`attribution-and-incrementality`). And it does not own the
business's public surfaces: the rule that a public page shows either the business's
own synced data or disclosed illustrative data, never a blend, is the law of
`honest-proof-and-illustrative-data`; this subject applies the same binary to the
private report a client receives, where the failure modes are different because the
reader trusts the sender.

## The report is a claim about provenance before it is a claim about performance

The naive reading treats a client report as a rendering problem: fetch the metrics,
lay out the tiles, write a paragraph. A principal practitioner treats it as a set of
three questions every number must answer before it is allowed on the page:

1. **Whose number is it?** The business's own, synced from its accounts - or an
   illustrative figure placed there so an unconnected workspace has something to
   show. There is no third state. A number that is partly one and partly the other
   is illustrative, and the report says so beside the number, not in a footer
   ([provenance is binary and labelled](../../_laws.md#provenance-is-binary-and-labelled)).
2. **How old is it?** Synced yesterday, synced last week, never synced. A report that
   cannot answer this per tile cannot be trusted on any tile, because the reader has
   no way to tell a current figure from a fossil.
3. **What may be said about it?** A measured revenue figure supports "revenue was";
   a platform-reported conversion count supports "the platform attributed"; a
   month against a stale comparison window supports nothing in the trend tense.

The order matters because a wrong answer upstream poisons everything downstream: an
illustrative tile read as the client's produces a narrative congratulating them on a
month that never happened; a stale sync rendered as current produces the wrong tense;
an unanswered "what may be said" produces the most common client-report failure of
all - a confident sentence about causation over a descriptive read.

## Which numbers: the business model chooses the tiles

There is no universal set of top-line marketing metrics. An e-shop lives on revenue,
orders, average order value and the cost-to-revenue ratio. A lead-generation business
has no revenue in its ad accounts at all; it lives on leads, cost per lead and the
share that qualified. A local service business lives on calls, direction requests and
profile views, and its "conversions" are a phone that rang. An app lives on installs,
cost per install and whether anyone came back on day seven. Showing an e-shop's tile
set to a plumber renders four tiles that are zero, blank or meaningless, and the
plumber concludes that marketing did nothing.

The practitioner's move is a **preset per business type**: a named, ordered tile list
chosen once when the workspace declares what kind of business it is, with the
declared type as the switch and an override for the cases the preset gets wrong. The
preset also fixes the *direction* of each tile - revenue up is good, cost per lead up
is bad - so that every downstream verdict reads the same direction table rather than
guessing from the metric's name. A tile whose metric the business has no source for
is dropped from the preset's output, never rendered at zero
([not measured is not zero](../../_laws.md#not-measured-is-not-zero)).

## "Live" is a statement about rows, not about accounts

The single most reproduced provenance error in this domain is a green "live" badge that
means "an account is linked". Linking is a credential; it proves the agency was
granted access. It does not prove a single row has arrived, that the rows cover the
report period, or that the last sync succeeded. A workspace with a linked account and
a failed first sync is, for reporting purposes, an *unconnected* workspace, and a badge
that says otherwise is a fabricated provenance claim.

"Live" therefore has an operational definition: **rows for this metric, from this
source, were synced, and the period the report covers falls inside the rows that
arrived.** Anything short of that is one of the labelled lesser states - linked but
never synced, synced but not for this period, illustrative. The states are typed at
the data layer and rendered from the type; a badge computed from "is there a token"
will be wrong on exactly the workspaces where it matters.

The same definition decides two things that are not badges: whether an automated
diagnosis may run at all - illustrative data is never diagnosed as if it were the
client's - and whether a public surface may be indexed, because illustrative numbers
under a real business's name are a proof claim to anyone who lands on them.

## Freshness is a property of the tile and of the sentence

A report is generated at a moment; its data was synced at an earlier moment; the
period it describes ended at a third. The report has to carry the gap. The
practitioner's convention is two thresholds: an age past which the report *should*
have resynced before rendering, and an age past which it must *say* the data is stale.
The numbers are convention - a resync after most of a day and a stale label after a
week is common practice, not documented platform behaviour - and a technique that
adopts them says so
([label convention as convention](../../_laws.md#label-convention-as-convention)).

What is not convention is where the caveat goes. A stale label on the tile and a
present-tense narrative under it is a contradiction the reader resolves in favour of
the prose. The caveat has to **travel into the narrative**: the generator that writes
"revenue was up this month" is handed the freshness state as context and is required
to write "as of the last sync on the third" when the state is stale. A report where
the tile and the sentence disagree about the age of the data has two authors and no
editor.

## The verdict inverts; the number never does

Half the metrics on a marketing report are lower-is-better: cost per click, cost per
lead, cost per acquisition, the cost-to-revenue ratio. When one of them rises by
twelve percent the arrow is red and the verdict is "worse", and the number the client
sees is still +12 % - because that is what happened. The tempting shortcut is to
negate the delta so that "good" is always positive and the colour logic stays simple.
It produces a report where cost per lead is shown as -12 % in green while the client's
invoice went up, and it produces a second, quieter lie: a derived figure such as net
profit change gets "inverted" from a ratio move rather than recomputed from revenue
minus cost, and disagrees with the revenue and cost tiles beside it.

The rule is [one target, one threshold](../../_laws.md#one-target-one-threshold) read
from the report's side: the direction table the preset declared drives the colour and
the word, the arithmetic drives the number, and a derived money figure is recomputed
from its components, never inferred from the sign of a ratio.

## Money adds within a currency and nowhere else

A Czech account on a second national ad platform bills in crowns; the same client's
account on the dominant platform may bill in euros; a marketplace feed reports in a
third. Spend, revenue and their ratio are sums, and a sum across currencies is not a
number. The report either scopes money to one currency - the primary one, labelled as
the scope - or shows one row per currency and refuses the total. It never converts
silently, because a converted total at an unstated rate on an unstated date is a
figure the client cannot reconcile with any invoice. Ratios blended across sources
(click-through, cost per click) are blended only when every contributing row carried
both the numerator and the denominator, because a row with clicks but no impressions
dragged into a blended click-through rate is a fabricated denominator. The law is
[not measured is not zero](../../_laws.md#not-measured-is-not-zero) applied to
money: the missing pair is absent, not zero, and an absent addend refuses the sum.

## What the narrative may claim

The paragraph under the tiles is where reports go wrong in ways no tile can catch.
Three disciplines hold it honest, and each defers to another subject for its footing:

- **A trend word needs a move that cleared its band.** Whether the month's delta is
  real is `period-comparison-significance`'s verdict; the report's own rule is
  narrower and is a convention it labels: below a small relative dead-band the
  narrative says "flat", and it does not reach for "grew" or "fell" because the sign
  happened to be positive.
- **A comparison window that was truncated is not a baseline.** A sync capped at
  some number of days, split into "this window" and "the prior window" of equal
  length, produces a prior window that is shorter than it claims whenever the
  history is short. A trend word over that pair narrates a fabricated baseline;
  the truncation flag travels with the snapshot and silences the trend sentence.
- **Year-over-year needs two years.** A narrative that compares to "the same month
  last year" needs the prior year's month to exist in the synced rows. Without close
  to two full years of history the sentence is not written, and no partial-year
  proxy is substituted; a day-count floor short-circuits the obvious cases, and the
  truncation flag is the real guard.
- **Advice is scored on its own metric, and only advice that was given.** A recap may
  say what happened to the cost per lead after the agency recommended pausing a
  campaign, because that recommendation exists in a ledger with its metric and its
  date. It may not claim credit for a rise in revenue it never advised on, and it may
  not score a recommendation that was issued against illustrative data.

Every claim in the narrative is a claim about the client's numbers, so
[never invent proof](../../_laws.md#never-invent-proof) governs it structurally: the
generator receives pre-computed figures and the names of the entities it may mention,
and a validator drops anything it names that was not in the request.

## The report speaks in the agency's voice, and in plain language

A white-label report carries the agency's name, logo, colours and contact details,
resolved per field from the report's own overrides, then the agency profile, then an
explicit empty slot. **It never falls back to the vendor's name** - the name of the
platform the agency used to build the report - because a client who receives a
report signed by a company they have never heard of concludes the agency outsourced
their account, and because a vendor name on a client surface is a proof claim the
vendor never made. An unset field is blank, not defaulted.

And the report glosses. "ROAS 4.2" means nothing to a plumber; "for every crown spent
on ads, 4.20 crowns of revenue came back" does. The gloss sits beside the number, is
generated from the number rather than typed by hand, and uses the client's currency
and the metric's plain meaning. A ratio that has no plain reading for this business -
a return on ad spend for a lead-generation client with no revenue in the account - is
not glossed, it is not shown.

## Failure modes of the naive reading

- **The linked-account badge.** "Live" computed from a credential; wrong on every
  workspace whose first sync failed, which are the ones looked at most closely.
- **The universal tile set.** A plumber's report with a revenue tile at zero.
- **The tile knows, the sentence forgets.** Stale label on the number, present tense
  in the prose.
- **The negated delta.** Cost per lead at -12 % in green; net profit "inverted" from
  a ratio rather than recomputed.
- **The silent conversion, and the blended ratio with a missing pair.** Two
  currencies summed at a rate nobody wrote down; a click-through rate over rows half
  of which never reported impressions.
- **The vendor's name on the client's report.** A default nobody overrode.
- **The recap that takes credit.** Advice never given, or advice scored against
  illustrative data, narrated as a result.

One seam deserves a last word because it is the one a report crosses most often:
`grounded-marketing-generation` owns the craft of a generator that may name only what
it was given; this subject supplies the provenance, freshness and advice-ledger
context that generator must receive, and checks the output for the caveat it was
handed.
