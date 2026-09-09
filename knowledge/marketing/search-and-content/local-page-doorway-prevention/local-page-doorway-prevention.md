---
layer: golden-path
type: golden-path
subject: local-page-doorway-prevention
status: forged
use_when: [planning a set of service-by-area pages, a set of city pages is not being indexed, generating local landing pages from a template or a model, deciding whether to rewrite, consolidate or noindex near-duplicate pages]
techniques:
  - funnel-not-city-is-the-doorway-test
  - three-of-four-local-material-gate
  - localize-the-problem-not-the-place
  - boilerplate-strip-then-containment
  - read-the-engines-verdict-via-url-inspection
  - rewrite-before-consolidate
---

# Local page doorway prevention

A service business that works across twenty towns wants twenty pages, one per town,
each ranking for "[service] [town]". Nothing about that wish is illegitimate. What is
illegitimate - and, far more often, merely futile - is producing those twenty pages by
writing one and swapping the town name nineteen times. This subject owns the decision of
**whether a service-by-area page set deserves to exist, page by page, and how to know
when the engine has decided it does not**: the policy history that separates the real
offence from the folklore, the pre-build material gate, the similarity measurement and
where its numbers come from, how to read the engine's own verdict rather than guess at
it, and which of five fixes applies to which situation.

Its neighbours own the rest. Where a city page sits in the tree and how it is linked
from its hub is `site-architecture-and-topic-clusters`. Which "[service] [city]"
queries deserve a page is `keyword-metric-reliability` and
`search-intent-classification`. The page's title, headings and metadata are
`on-page-and-metadata-craft`. The business-profile listing and the map pack are
`business-profile-and-citations` and `local-visibility-and-reputation` - the one thing
said about the pack here is that city pages do not move it. The prohibition on
inventing a local review or address to fill a page is `grounded-marketing-generation`
and `honest-proof-and-illustrative-data`; here it appears only as the reason the
material gate cannot be satisfied by a model.

## The policy, and the three myths built on its old wording

The dominant search engine's public spam policy defines doorway abuse as pages created
to rank for specific, similar queries that lead users to intermediate pages less useful
than the final destination - its first example being pages targeted at specific regions
or cities *that funnel users to one page*. Until March 2015 the same policy listed
"multiple pages with similar content designed to rank for city or state names" as a
doorway example outright. That sentence was deleted in the 2015 rewrite and the funnel
clause took its place. **The funnel became the test; the city targeting stopped being
one.** Most of what practitioners still repeat about city pages quotes the definition
the engine retired.

Two more myths ride on that one. A widely reproduced quotation from an engine
spokesperson about "swapping out the city name and a few pictures" has no primary
source - every trail ends at a blog quoting another blog; the advice is sound, the
attribution fabricated. And the "80% similar is a duplicate" threshold is most
plausibly a leak from article-spinning software configured to emit text "at least 80%
unique"; the spokesperson, asked directly for a duplicate-content percentage in 2022,
answered that there is no number and asked how one would even measure it. An audit
that reports "82% identical, therefore doorway" applies a spinner's setting as policy.

In March 2024 the engine added a second, separate policy: **scaled content abuse** -
many pages generated primarily to manipulate rankings rather than help users, "no
matter how it's created". The two have different tests and a set can fail either, both
or neither. Doorway abuse asks whether pages funnel to one destination more useful than
themselves; two pages qualify, and unique pages can still be doorways. Scaled content
abuse asks whether *many* pages are unoriginal and low-value; volume is definitional,
uniqueness is the whole test, hand-written counts the same as generated. Three hundred
distinct city pages pushing to one contact form are doorways; three hundred
token-swapped pages are scaled content; both at once is the common case.

The rater guidelines the engine publishes are stricter than the policy: their recurring
example of the lowest rating is a page "created automatically by filling in a
template", they add a comparative test - value *compared to other similar pages on the
web on the same topic* - and they instruct raters to judge the website after sampling
several pages, which is how a page-level problem becomes a site-level signal.

## The risk is economic, and overstating it is its own failure

Confirmed doorway penalties are rare, old, and mostly involved cloaking rather than
plain duplicate city pages. The most credible local-search practitioners say plainly
they have never seen a site penalised for city landing pages. A subject that threatens
a penalty to motivate the gate loses the argument the first time a client's competitor
runs forty clones unpunished.

What actually happens is quieter: **the pages never get indexed.** A practitioner's
published account of a 33,620-page templated area site showed roughly 18% indexed -
around 18,000 URLs "crawled - currently not indexed", 8,500 "discovered - currently not
indexed", 700 soft-404s - and after hand-writing 80-120 words of genuinely
region-specific content for the top fifteen regions, indexation rose about 15% over six
weeks. A December 2024 spam-update case study of a 140,000-160,000-page programmatic set
found a 12% top-hundred ranking rate before the update hit. Across the web, a study over
a multi-billion-page index found roughly 96.5% of pages receive no search traffic, and
practitioners reporting on 2026 indexes call 40-60% of a site's URLs in a not-indexed
state unremarkable. The tail risk is real and small: a home-services site with about
3,000 location pages took a "thin content with little or no added value" manual action
in 2023 - no manual action is called "doorway" - with no documented recovery, and
algorithmic suppression has no reconsideration path at all.

So the honest argument is: near-duplicate area pages mostly do not get indexed, they
drag site-wide quality signals when they dominate the URL count, they are the first to
go in a spam sweep, and there is a small tail risk of a domain-wide action nobody has
documented recovering from. Not "you will be penalised". The gate exists because the
pages are wasted work, not because they are dangerous.

## The gate runs before the first word

Catching a clone after it is built means the research, the optimisation and the
linking were all spent on a page that will be held. The material gate is therefore a
pre-build step, and it is answered by the owner, not by the writer and never by a
model: does this area have a real job done there, real local specifics that change
what the service looks like, an FAQ answer that is actually different, and a real
person from there? Three of four and the page is built; fewer and it is *held*, with
one line naming what is missing, so held areas are reported as a group with what each
one needs. The technique `three-of-four-local-material-gate` carries the procedure; the
point here is that **the gate's inputs are proof, and proof is supplied or absent** -
a model asked to write the missing local job will write a plausible one, which is the
fabrication `never-invent-proof` forbids, and which the engine's rater guidelines
describe as the template-filling that earns the lowest rating.

The gate has a companion sentence: for every pair of area pages under one service,
state in one sentence what is genuinely different about each beyond the place name. A
pair that cannot be told apart in a sentence is one page. This is the operational form
of the engine spokesperson's one verified line on the topic, from a 2018 public
question-and-answer session: with no unique information to add beyond a city name, fold
the pages together and make one or a few really strong pages instead.

Volume follows material. The practitioner convention of ten to fifteen area pages is
the number a business can usually build *without* running out of distinct material -
not a ceiling on one with forty real jobs, photos and reviews across forty towns, and
not a target for one that has two. The question is never "how many cities" but "how
many pass the gate". A companion convention caps the service area at roughly two hours'
drive from base; when a keyword map asks for sixty towns, the map is wrong.

## Localizing the problem, not the place

The failure mode is inserting "in [town]" into every heading and calling the result
local. What changes a page is what changes the *service* there: housing stock, permit
rules, a climate quirk, the price band, the problem that town actually has. A 300-page
practitioner study found hyperlocal content roughly doubled the odds of outranking
(+107%), custom photos +84%, inbound links +105%, and an embedded map widget correlated
negatively (-34%) - correlations from one study, labelled so; their direction is the
craft, and `localize-the-problem-not-the-place` turns it into a procedure and a check.

## Measurement, and where every number comes from

Similarity across a templated set is measured, never eyeballed, and the method matters
more than the threshold: extract main content; shingle; drop every shingle that appears
on more than a convention fraction of the set - the site's own boilerplate; then compare
what remains by *containment* as well as resemblance, because a template clone is not a
page that resembles the master but a page *contained in* it. A 2006 study over 1.6
billion pages found both the shingling and the fingerprint methods poor at finding
duplicates *within one site* while good across sites - shared chrome dominates the
within-site comparison - which is the published reason the strip is the
highest-leverage step. `boilerplate-strip-then-containment` carries the procedure.

The thresholds, with provenance: resemblance at or above 0.50 as near-duplicate is the
one published constant, from the 1997 syntactic-clustering paper; containment at or
above 0.80 as a template clone is derived and labelled convention; a 64-bit fingerprint
within Hamming distance three, from a 2007 paper by the dominant engine's own
researchers, is a fingerprint distance and never a "percent similar". The most
actionable number is not a ratio but a count - **how many distinct phrases the page
owns after boilerplate removal** - and a page that owns twelve is a doorway page
whatever its length. Word-count minimums are folklore the engine has disowned; the
unique-phrase count measures what word count was a bad proxy for.

## Reading the verdict instead of guessing it

The debate about whether a set is "too similar" settles empirically. The engine's
search-performance console exposes, per URL, the canonical it *chose* against the one
the page *declared*, and a coverage state. A chosen canonical that is a sibling area
page means the engine has clustered the set as one document and every other member is
out of the index. "Crawled - currently not indexed" is a quality judgment on a page it
read; "discovered - currently not indexed" is a pattern judgment on a page it has not
bothered to fetch. Joined to the similarity matrix - page, chosen canonical, coverage
state, containment against that canonical, unique-phrase count - it is the table that
ends the argument. `read-the-engines-verdict-via-url-inspection` is the procedure; the
law it rests on is that the engine's page is the verdict and a tool's label is a hint.

## Which fix, when

Five situations, five fixes, and the wrong pairing destroys pages that deserved to
live. Clones with no distinct area behind them: consolidate by redirect, because a
canonical or a noindex leaves the crawl waste and the pattern intact. Real distinct
areas under templated copy: rewrite the body, leave the tags, target the unique-phrase
count, because canonicalizing those away deletes legitimate pages. Technical duplicates:
the canonical tag. Pages needed for users with no organic value: noindex with follow.
The engine chose a different canonical: change the content, then realign the signals,
because no tag beats "the page is genuinely a duplicate". `rewrite-before-consolidate`
carries the table and the anti-patterns. Deletion and consolidation are recommendations
awaiting approval, because a deleted URL loses its links permanently, and an audit's fix
pass touches the mechanical layer only - the copy that fixes a doorway is written and
approved by a person.

## What area pages do not do

They do not get a business into the map pack. A controlled practitioner test found map
ranking driven by the profile's verified address, with the service-area setting
affecting only what is displayed; area pages earn organic visibility beneath the pack.
The one exception: the page a business profile *links to* affects that profile's
rankings, and re-pointing that link from a generic homepage to the matching area page
produced marked gains within a month in a documented case. Build area pages for organic
capture and conversion; never sell them as a map-pack lever.

## Failure modes of the naive reading

- **The token swap.** One page, twenty place names, identical sections, an FAQ whose
  answers repeat with the town inserted. Passes every technical audit; never indexes.
- **The percentage verdict.** "81% identical, doorway" from a comparison that never
  stripped the nav and footer. The number is about the template, not the pages.
- **The penalty threat.** A gate justified by a manual action nobody has witnessed,
  abandoned the first time the threat fails to materialise.
- **The word-count fix.** A held page padded to clear a minimum the engine never set -
  the exact behaviour its helpful-content guidance targets.
- **The fabricated material.** A model asked to supply the local job, neighbourhood or
  reviewer the owner did not; a plausible page that is a lie and a template-fill at once.
- **The blanket canonical.** Forty thin but legitimate area pages canonicalized to the
  hub, deleting the set the rewrite would have saved.
- **The tag fight.** Re-declaring a canonical the engine has already overridden instead
  of changing the content that caused the override.
- **The map-pack promise.** Area pages sold as the route into the local pack.

## Seams

The gate's four inputs are proof and belong to the proof disciplines; this subject only
decides that three are the floor. Similarity thresholds are labelled convention wherever
they appear, and the one published constant is cited with its 1997 source every time.
The inspection read is the engine's verdict and outranks every score; the score explains
the verdict, it does not replace it. Where the page lives and how it is linked is
architecture's, including the rule that an orphaned area page is the first doorway tell.
