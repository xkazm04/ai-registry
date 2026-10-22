---
layer: application
type: application
subject: jurisdiction-modelling
technique: supranational-membership-inheritance
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The inheritance shipped; the level was left as polish

The grant-writing product (Node 24, the version its CI pins) built three of the
technique's four inheritance mechanics and the fourth's onboarding half. The Czech
profile declares `memberOf: ["eu"]`. The profile accessor unions the member's source keys with
each membership's keys at resolution time. The European Union calls are ingested
once under one source key, and a pan-EU organization can pick the EU as its market.
Both the deadline radar and match scoring read the merged key set, so a Czech
organization's dashboard does see the EU corpus. The level distinction, which the
technique calls the whole technique, was missing. The EU profile was typed
`level: "country"`, with a comment saying a dedicated supranational level was
"optional polish". The level and a countries-only market list had been written, but
only on an unmerged work-in-progress commit on a side branch. The default branch
never received them.

## The seam that could falsify it

The tree's own comment is the counter-claim: once `memberOf` carries the
inheritance, typing the body as a country costs nothing. The seam was chosen to
test that. A caught outcome would have been that no main-line output changes when
the EU becomes `supranational`. That would make the level a naming preference
wherever membership is modelled, and the technique's opening would be overstated.

It did not hold. Every reader of the market list and the corpus rollup was
enumerated. Two of them make geographic claims and counted the EU as a country:

- The landing page's live-corpus tile, "N countries covered", counts the corpus's
  per-country buckets. The rollup files the EU calls under their own "EU" bucket.
- The onboarding sentence shown to an organization in a supported market reads
  "Wellspring is live in United States, Czechia, United Kingdom, and European Union".
  It names the union as a fourth place, beside a member that already inherits it.

## A and B

Arm A is the tree at its default-branch head. Arm B types the EU `supranational`,
carries `level` on every market listing, adds the countries-only list beside the
full one, and moves the two claims onto it. The onboarding sentence becomes countries
as places plus "European Union programs". Picker, per-market grant pages, sitemap,
match teaser and the per-country corpus breakdown keep the full list. Those are the
opportunity surfaces the technique says must include the body.

- **Target:** the rendered tile over one seven-source corpus (two US, two UK,
  two Czech, one EU source). The landing component was rendered with its count-up
  stubbed to print its value. A: **4 countries covered**. B: **3**. The sentence
  goes from four places to three countries plus programs.
- **Floor:** picker and sitemap codes are `US, CZ, GB, EU, CA, AU` in both arms.
  The Czech profile still inherits the EU source key. The type check and linter
  are clean, and the full suite passes 3681/3681. Two deadline-reminder tests that
  failed on the head earlier that hour did not reproduce. They look date-dependent
  and are unrelated to this change.

## What the retrofit nearly broke

The tree had exactly one reader that branches on level: research scoping. It was an
if-chain with `country` mapped to national, `region` to regional, and everything
else to local. With the new level added and that function untouched, the type check
passed and every EU research run would have been scoped as municipal. The unmerged
branch had caught this by hand. Arm B makes the dispatch an exhaustive map keyed by
the level type, so the next level fails to compile instead of falling through.
That is the boundary this run added to the technique: introducing the level into a
tree that already dispatches on level needs the dispatch made exhaustive in the same
change.

## What this realization does not do

- The landing coverage band still renders an EU card in the same grid as the
  countries. It is an opportunity descriptor with its own blurb, not a count, so it
  was left. Whether it should be grouped apart is a design call for the owner.
- The coverage band's per-country open count for Czechia counts only Czech-bucket
  calls. It does not count the EU calls a Czech organization is entitled to. The
  technique has no rule for a member's per-market count.
- Programme association is not modelled. The UK profile has no membership. That is
  politically correct, but UK entities are eligible for some EU programmes as an
  associated country, and `memberOf` cannot say "this programme family, not that
  one".
- The rollup still derives the EU bucket from a source-key prefix, not from the
  profile's level. A second supranational body would need both.
