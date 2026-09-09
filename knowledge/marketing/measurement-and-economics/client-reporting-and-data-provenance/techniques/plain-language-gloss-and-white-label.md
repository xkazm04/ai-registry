---
layer: technique
type: technique
subject: client-reporting-and-data-provenance
technique: plain-language-gloss-and-white-label
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled]
shared_with: []
use_when: [rendering a shared client report page, resolving whose name and logo a report carries, a client asks what a ratio on their report means]
---

# Plain-language gloss and white label

The client report is read by the business owner, and it is signed by the agency. Two
things follow that a marketer building the report for themselves would not think of.
Every ratio needs a sentence a non-marketer can repeat; and every identity field -
name, logo, colours, contact - is the agency's, resolved by a fixed order, and **never
the vendor's**, the platform the agency used to make the report.

## The gloss

An acronym on a client report is a number the client cannot use. "ROAS 4.2" and "PNO
24 %" are correct and empty; the owner of a bakery does not know that they are the
same fact from two sides, or that one of them is what her accountant calls the
marketing cost share. The gloss is a generated sentence beside the number, in the
client's currency and the metric's plain meaning:

- return on ad spend 4.2 → "for every 1 CZK spent on ads, 4.20 CZK of revenue came
  back";
- cost-to-revenue ratio 24 % → "ads cost 24 haléřů of every crown of revenue";
- cost per lead 448 CZK → "each enquiry cost 448 CZK in ad spend";
- click-through rate 3.1 % → "31 of every 1,000 people who saw the ad clicked it".

Rules for the gloss:

1. **Generated from the number**, never typed by hand, so it cannot drift from the
   tile. A hand-written gloss is a second number on the page.
2. **In the client's currency and locale**, with the currency word the client uses,
   not a code - "crowns", not "CZK", in prose; the code on the tile.
3. **Names what the number is not.** A return-on-ad-spend gloss says "revenue", not
   "profit", because the reader will hear profit unless told otherwise; the economic
   reading is `profit-on-ad-spend-economics`'s and the gloss does not pretend to it.
4. **Absent when the metric has no plain reading for this business.** A return on
   ad spend for a lead-generation client, whose account carries no revenue, is not
   glossed - it is not shown, per the tile preset.
5. **Verb from provenance.** A platform-reported conversion count is glossed as
   "the platform attributed 31 orders to these ads", not "these ads produced 31
   orders"; the gloss carries the descriptive verb because the reader will repeat it.

## The white label

A white-label report is one the client believes their agency made, because their
agency did. The identity is resolved **per field**, in a fixed order:

1. the report's own override (this client, this report);
2. the agency's profile (name, logo, colours, reply-to);
3. an explicit empty slot.

There is no fourth step. The vendor's name, logo or domain is never a fallback for any
field, for two reasons. A client who receives a report signed by a company they have
never contracted concludes their agency outsourced the account. And a vendor name on
a client surface is a proof claim - "made by X" - that the vendor did not make and the
agency did not authorise; in the sense of
[never invent proof](../../../_laws.md#never-invent-proof), it is an invented
credential. An unset logo is no logo; an unset name is the agency's name; an unset
agency is a report that does not ship.

The same order governs the sender of any email that carries the report, the domain
the shared link lives on where the agency has one, and the "powered by" line, which
exists only if the agency chose to include it.

## The shared page

The report is shared as a link with a token, and the link is forwarded. Three
properties of that page belong here:

- **Not indexed.** The page carries a no-index directive always, live or not: it is a
  private surface for one reader, and a real business's numbers under a tokenised
  URL are not for a search engine's cache. (The public-surface indexability rule -
  index only when live - is `honest-proof-and-illustrative-data`'s and applies to
  microsites, not to this page.)
- **Labelled.** The live-or-illustrative badge sits at the top beside the business
  name, so a forwarded link opens on the provenance claim
  ([provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)).
- **Self-contained.** The page renders without the agency's session: the reader has
  no login and the page cannot depend on one for its identity or its numbers.

## Decision rules

- When an identity field is unset at every level, render nothing in that slot; never
  substitute the vendor's value, a placeholder brand, or a generic "your agency".
- When the gloss and the tile could disagree - a rounded tile and an unrounded gloss -
  round once, upstream, and render both from the rounded value.
- When a metric is platform-reported, the gloss uses "attributed"; when it is synced
  from the client's own order system, the gloss may say "orders".
- When a client's locale formats numbers differently from the agency's, the report
  formats for the client, because the report is theirs.
- When a shared link is opened after the agency's contract has ended, the page still
  renders under the agency identity it was generated with, or is revoked; it never
  re-resolves to the vendor.

## When not to use this

Do not gloss the operator's dashboard. The marketer knows what the ratio means, and a
sentence beside every number on an operating surface is noise that hides the table.

Do not gloss a number into a claim the number does not support. "Ads brought in 4.2
times what they cost" is a gloss; "ads made you money" is an economic verdict that
needs a margin, and the gloss stops at the ratio.

Do not white-label away the data source. The report is the agency's; the numbers are
the platforms', and a footnote saying which platforms the rows came from is provenance,
not vendor branding - it stays.
