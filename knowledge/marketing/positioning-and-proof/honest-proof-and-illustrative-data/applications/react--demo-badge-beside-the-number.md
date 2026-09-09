---
layer: application
type: application
subject: honest-proof-and-illustrative-data
technique: demo-badge-beside-the-number
stack: react
status: forged
verified_on: 2026-09-09
verified_against: react@19
---

# React: the homepage proof band and its demo badge

Workspace `systedo-case` at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08). The homepage proof band is a server component,
`src/components/brand/landing/LandingProof.tsx` (85 lines), and it realizes two
techniques of this subject in one file: the figures are the product's own
computation, and the illustrative label is a badge in the header row rather than
a footer.

## The structural fact

The four tiles are not typed. `LandingProof.tsx:41-47` calls
`buildSnapshot("90d")` - the same snapshot builder the authenticated dashboard
uses - and formats `snap.current.roas`, `snap.current.pno` against
`snap.goalPno`, `snap.current.revenue` and `snap.delta.revenue` through the
product's own `fmtMultiple`, `fmtPct`, `fmtCZKCompact` and `fmtSignedPct`
(`LandingProof.tsx:6`). The window is stated in the headline copy
(`proofHeadline`, lines 16 and 27: "On the demo account, last 90 days") and
passed to the builder as `"90d"`, so the claim and the computation cannot
disagree. The positioning document `PRODUCT.md:139-141` names this as the first
item of evidence on hand: "the homepage proof band shows the exact figures the
dashboard computes".

The badge is placed before the figures, at eyebrow weight. `LandingProof.tsx:54-63`
renders the section eyebrow ("Proof") and, in the same flex row, a bordered pill
carrying `proofDemoBadge` - "Ukázková data: fiktivní klient" / "Demo data:
fictional client" (lines 17 and 28). The inline comment at lines 58-59 states the
rule as the author held it: "Unmissable demo-data label: the numbers below belong
to a fictional client, and that must never read as fine print." The pill is
`text-[11px] font-bold uppercase tracking-[0.14em]` against an eyebrow of
`text-[12px] font-semibold uppercase tracking-[0.18em]` - one point smaller,
one weight heavier, bordered where the eyebrow is not. That is the convention of
"weight at least equal to the section label" met by contrast rather than by
size.

The supporting note names the fiction and denies the testimonial reading.
`proofNote` (lines 18-19, 29-30) reads "The same numbers the dashboard renders
for {client} ({domain}), a fictional demo client. Not real customer results.",
with `{client}` and `{domain}` filled from `snap.client` (line 69) - so even the
fictional client's name is read from the dataset, not typed. The comment at
lines 37-40 records the reason: "labeled demo data, not a customer testimonial
(there are no real customers to quote)", which is the absent-evidence
inventory of `PRODUCT.md:146-149` applied to one band.

## What the workspace confirms and where it stops

Confirmed: badge in the figure's viewport, before the headline; badge wording
that states what the data is rather than hedging; a note that says whose numbers
and that they are not a customer's; both localized as authored copy; figures and
client identity from one computation. The section order in
`src/components/brand/BrandLanding.tsx` places this band third - claim,
walkthrough, then proof - so a reader meets the badge before any figure on the
page.

Confirmed by the share surface as well: `src/app/opengraph-image.tsx:64-66`
bakes "ukázková data: {client} ({domain}), fiktivní klient" into the card image
between the title and the three statistics (lines 18-23, 69-88), because the card
travels without the page. The image is built from `performance.daily.slice(-365)`
rather than from `buildSnapshot`, which the file's header (lines 1-6) accepts as
a build-time render of the same dataset - the "static share surface" exception
of the live-computation technique, taken knowingly.

Deviation: the demo dashboard itself, the second place the same figures appear,
is out of this file's scope, and the reviewer of this band cannot see from here
whether the dashboard's own illustrative label meets the same placement rule.
The technique asks for one label per surface; this component proves it for the
band and the card only.

Upward lesson taken into the technique: the badge was placed by contrast (bold,
bordered) rather than by being larger than the eyebrow. The technique's
placement rule now says "weight at least equal", which contrast satisfies, rather
than "at least as large", which this band would fail.
