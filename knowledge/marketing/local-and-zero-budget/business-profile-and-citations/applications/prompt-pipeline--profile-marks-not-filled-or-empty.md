---
layer: application
type: application
subject: business-profile-and-citations
technique: profile-marks-not-filled-or-empty
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# Profile marks in a command-driven SEO agent: a setup spec, an audit layer that grades against it, and a limits table that disagrees with both

The open SEO agent (seven commands, reference specs, small Python checkers; commit
`a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06) realises the technique in two
files that are meant to agree: `references/gbp-setup.md`, the spec a `/gbp` run follows
to research a business and emit a paste-ready profile file, and
`.claude/commands/audit.md` Layer 11 (lines 291-326), which grades a live profile
against the numbers the setup spec set. The structural fact the tree proves is the
technique's opening claim - "N of mark, never filled-or-empty" is a reporting shape
that can be written into a pipeline and enforced by a command - and the structural fact
it also proves, less flatteringly, is that a mark stated in three places in one tree
drifts, which is why the technique tells the reader to confirm the marks live.

## The marks as the spec states them

`gbp-setup.md:70-125` is the research step. Categories: find twenty live ones, ten to
use plus ten extras (line 70); "never invent a category. Every one, including the
extras, must exist in the live list" (line 77). Services: "target 70, minimum 30",
glossed at line 94 as "50 to use plus 20 extras". Products: target 30, "20 to use plus
10 extras" (lines 111-113), and line 120 carries the all-six-fields rule verbatim -
"a product tile without a description is a bare name, one without a link is a dead end,
and one without a photo doesn't render as a tile at all - the photo IS the tile". Service
areas: cap at 20 cities, "which is Google's soft limit" (line 85), inside a two-hour
drive.

The oversupply table at lines 208-212 restates the slots - categories 10, services "50
recommended", products "20 recommended" - and lines 214 and 233 supply the guard the
technique's decision rules carry: "Oversupply is not permission to stuff ... If the
honest list is short, hand over a short list and say why."

## The audit grades against those numbers, not against presence

`audit.md:309-316` is the confirmation. The heading says it in the technique's own
words: "The marks, from `references/gbp-setup.md` - grade the profile against these
numbers, not against 'filled or empty'." Then, per field: "Categories: 10 ... Report `N
of 10`" (line 310); "Services: 50 (target 70 with extras, minimum 30). Report `N of
50`" (line 311); "Service areas: 20 ... Report `N of 20`. Location businesses list one
city; say so instead of scoring it" (line 314); "Products: 20 ... every one with all
six fields ... count a product missing any field as not there" (line 315). Line 316
folds the four ratios into the layer score: "The Local layer's 0-100 score is the
average of those four ratios, scaled down by NAP conflicts and the review gap."

Line 313 is the anti-shortcut clause for the services table, dated to a run on 28
August 2026: every service is looked up as `[service] [primary city]` in the confirmed
country database, the page cell is filled only by a real title-or-H1 match, "never
default to /contact, the homepage or the services hub", and "a table where every row
says 'no keyword' and points at one page means the lookup did not run. Do not ship
it." That is the technique's "grade contents, not only counts" step enforced as a
refusal to emit.

## The inconsistency, reported as found

The tree carries three different numbers for the services mark and does not reconcile
them:

- `gbp-setup.md:92-94`: "target 70, minimum 30", i.e. 50 to use plus 20 extras.
- `gbp-setup.md:347`, inside the Services section rules: "Auto-extract 10 to 30
  services from the website."
- `gbp-setup.md:768`, the closing "limits to check against" table: "Services | about
  30, Google soft cap."

The audit at line 311 adopts the first (report N of 50). So a run that follows the
setup spec aims at 50-70, the same spec's own limits table tells the owner the platform
soft-caps at about 30, and the Services rules in between extract 10-30. Nothing in the
tree flags the disagreement, and a reader who consults only the table will judge a
50-service profile as over the cap while the audit scores it 50 of 50. The technique
lands this as a deviation: the platform publishes no services cap, the working target
and floor are practitioner convention, and the only count that is not convention is
"every distinct job the business delivers" - which is why the technique routes the
services number through the delivery test rather than through any of the three
figures. A spec that states a mark in more than one place needs one source of truth
and a checker that reads it; this tree has neither for services.

## The dated half, and what the spec does with it

The setup spec is candid that its numbers move. Line 180: "Google does not publish a
public categories list. Categories, attributes and citation directories are all moving
targets, so Claude must verify them live, never from training data." Line 188: "Service
area policy changes too often to hardcode." Line 368: service descriptions "run to 300
characters ... Google cut this from 1,000 recently, so most advice still online is
wrong. Existing longer descriptions are grandfathered, but the moment one is edited it
must fit 300." That is the technique's first procedure step - confirm the marks live,
record the date - stated as an instruction to the model, and the limits table at
lines 763-778 is the dated snapshot the technique says every such spec should carry
(description 750, service description 300, service name 120, product name 58, product
description 1,000, service areas 20).

## Where the tree falls short of the standard

- The limits table is not read by any checker. `code/` holds similarity, rhythm and
  site-completeness checkers; none parses `gbp-{slug}.md` against the table, so the
  "N of mark" line is produced by the model following prose. The technique's counting
  rule for products - missing any sub-field counts as absent - is an instruction here,
  not a validation.
- The predefined-services weighting (`gbp-setup.md:362`, "moved from the 81st to the
  22nd most impactful local ranking factor in Whitespark's 2026 study ... lift landing
  within 24 to 72 hours") is quoted from a practitioner survey and a practitioner's
  own tests without saying so in the output the owner sees; the technique keeps the
  ordering (predefined first) and labels its footing.
- The photo multiplier at line 475 ("100 or more photos means 520% more phone calls,
  per the BrightLocal study") and the booking lift at line 628 ("25% more leads") are
  vendor claims without a published sample or control, presented as rules. The
  technique recommends photos and a booking link on their own merits and refuses the
  multipliers.
