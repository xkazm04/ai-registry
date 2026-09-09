---
layer: golden-path
type: golden-path
subject: zero-budget-channel-planning
status: forged
use_when: [ranking the free places a business with a website can be found, generating or reviewing a channel plan for a business with no ad account, deciding whether a measured click may change a channel's rank, designing an onboarding path for a business type that cannot spend]
techniques:
  - channel-family-taxonomy-by-lifecycle-kind
  - fit-effort-quick-win-rule
  - grounding-precedence-catalog-over-scan
  - measured-clicks-beside-not-inside-fit
  - keyword-to-channel-visibility-plan
  - free-channels-lead-onboarding
---

# Zero-budget channel planning

A business has a website and no media budget. It can still be found in a dozen
places that cost nothing to enter: a business-profile listing on the dominant map
and search surface, a national directory, a price-comparison marketplace with a
free tier, an industry portal, a review platform, a handful of communities where
its customers already talk, its own blog and newsletter, organic posts on a social
network, a guest article or a podcast slot, and a reciprocal arrangement with a
non-competing business next door. The subject is the craft of turning that list
into a plan: which of those places fit *this* business, how much work each takes,
what the first concrete action is, what "done" means for each, and what may be
said about them once the business has actually shown up there.

This subject owns the **ranked plan across free channels** and its lifecycle. It
does not own the depth of any one channel: `business-profile-and-citations` owns
the business-profile listing and the citation layer in depth; `local-visibility-
and-reputation` owns map-pack ranking and reviews; `search-intent-classification`
owns what a query means. When this plan says "claim the profile" or "aim this
query at the blog", the how of the profile and the reading of the query live in
those subjects. What lives here is the ordering, the grounding that feeds it, the
join between queries and the channels that can carry them, and the discipline
that keeps a measured click from quietly rewriting a strategic score.

## What a principal practitioner holds true

**A free channel is free to enter, not free to run.** Registration on a directory
is an afternoon; a community is a standing commitment that never closes; owned
content is the most expensive free channel there is, paid in hours rather than
currency. A plan that ranks by fit alone hides this. Every channel therefore
carries two numbers of different kinds - a fit score, which is a prediction about
audience match, and an effort level, which is a statement about the work - and the
plan reads them together. The quick win is the intersection, not the top of either
column.

**Channels come in families, and families have shapes.** Directories and
marketplaces are *listings*: a bounded task with a completion state. Communities
and organic social are *conversational*: an ongoing presence whose cost is
attention and whose risk is being read as spam. Blog, newsletter and video are
*content*: won by publishing something that targets a query. PR and partnerships
are *outreach*: won by a pitch someone else accepts. Seven or so families fold
into four kinds, and the kind decides the lifecycle - a listing can be marked done;
a community never is; a content channel continues by producing the next piece. A
plan that gives every channel the same checkbox is wrong about three of the four.

**The plan is grounded before it is generated.** The channel plan is the first
surface a new business sees, often before it has typed anything but a URL. What
the plan may know about the business comes from two sources with a strict
precedence: the business's own curated catalog - offerings, categories, service
localities, competitors it confirmed - wins wherever it says anything, and a
website scan fills the gaps it leaves. Facts are handed to the generating model as
facts, so anything that is not a fact about this business must not reach it: a
sample catalog grounds nothing, a placeholder row the product wrote for the
business to fill in grounds nothing, and a competitor the scan guessed grounds
nothing until the owner keeps it. This is [never invent
proof](../../_laws.md#never-invent-proof) applied at the input rather than the
output, and the incident behind it is precise: a plan once told a service business
to write an article about "sample service A", because the starter row the product
had written for it was saved in the same store as real rows and read as one.

**Fit is a prediction and stays one.** The fit score is produced from context -
by a curated seed per business type or by a model reading the grounding. It is
never checked by anything at the moment it is produced. When the business later
puts a measured link into a listing or a post and people click it, the plan has a
second, different kind of number: an observation. The observation is rendered
beside the prediction, in its own column, never blended into it. A blend would let
one week of clicks rewrite advice the reader treats as strategy, and afterwards
neither number could be trusted. Nothing measured is nothing shown -
[not measured is not zero](../../_laws.md#not-measured-is-not-zero) - so a channel
with a minted link and no clicks looks exactly as it did before the link existed.

**A query can only be aimed at a channel that carries writing.** A directory
entry is not a piece of content; pairing a keyword with "register on the national
directory" is advice the data does not support. Target queries are dealt onto
communities, social and owned content only, and listings and outreach are worked
by their first action. Where a brief already names the query it was written for,
channel and content are joined by that fact rather than by guess.

**The free plan comes first for businesses that cannot spend.** A pre-launch
software product, a content site and a lead-generation site typically have no ad
account and no catalog; for them free channels are not one route among several,
they are the only route to a first visitor. An onboarding checklist whose blocking
item is "connect an ad account" and whose skippable last item is the free plan has
inverted its own product. The ordering is a default worth stating as reversible,
because the evidence for it is usability findings rather than telemetry.

## The load-bearing distinctions

**Fit versus effort versus measured.** Three numbers, three footings. Fit is a
prediction (convention-weighted; the weights in any seed or prompt are asserted,
not calibrated, and the plan says so). Effort is a categorical statement about
work. Measured clicks are an observation over a window. They are never summed,
never averaged, and never let one overwrite another. The order of the plan is by
fit; the quick-win rule reads fit and effort together; measured clicks inform a
regeneration and are shown beside the row, but do not re-sort a queue of things
the business has not started - a measured channel jumping the queue would starve
exactly the channels that have not been tried.

**Stage versus readiness.** A channel's stage - identified, planned, live, paused,
done - stores the business's *intent*. Whether the channel is actually ready (a
voice trained, an inbox connected, a first action taken) is *derived* from the
state of the other modules at read time and never stored. Persisting readiness
lets the signpost disagree with reality; deriving it means the next step is always
computed from what is true now. Editing a live channel's settings does not demote
it: intent survives an edit, and a newly opened gap surfaces as the derived next
step instead.

**Grounding versus fill.** The seeded plan carries placeholders for the brand, the
category and the locality so that a business with an empty catalog does not read
"your business" everywhere. That fill is disclosed on screen as a sample plan. The
grounding that reaches the model is not disclosed and is asserted as fact, so it
obeys the stricter rule: a sample catalog may fill the seeded plan's placeholders
and still ground nothing in the prompt.

**Unavailable versus none.** A failed read of the competitor set is not "the
business has no competitors". Regenerating a plan on a failed read silently drops
grounding the last plan had, so the failure is surfaced before the owner
overwrites a grounded plan with an un-grounded one; a business that genuinely has
no curated competitors is owed no warning at all.

## Where the numbers come from

Most of this subject's thresholds are conventions, and the plan says so wherever
they appear, per [label convention as convention](../../_laws.md#label-convention-as-convention).
Six to nine channels per plan, two to four first actions per channel, a quick win
at low effort and fit at or above seventy, a cadence cap of one to fourteen posts a
week on a conversational channel, three rows in a weekly plan - each is a habit
that keeps the artifact actionable, not a measured optimum. Surveys of small
businesses tend to report five to eight channels in use among those that describe
themselves as succeeding, which is consistent with the convention and does not
prove it.

Two published inputs bear on the *ordering* of families. A 2026 practitioner survey
of forty-seven local-search experts weighting 187 factors put citation signals near
seven percent of map-pack influence, behind links at roughly twice that - which is
an argument for treating directories as a low-effort floor rather than a strategy.
The same survey put three citation-shaped factors among the top five for
visibility in AI answer engines: presence on curated "best of" lists, prominence on
industry-relevant domains, and unstructured mentions in press and association
pages. That is the current case for outreach and industry portals sitting higher
in a plan than their click counts alone would justify. Organic reach of a
business page on the largest social network is widely repeated as under three
percent of followers; the figure is industry folklore rather than platform
documentation, and the plan treats organic social as a conversational channel with
a cadence cap, not as a broadcast medium.

Community norms are the one place the plan carries an anti-spam rule as a rule. A
nine-to-one ratio of contribution to promotion is the practitioner convention on
discussion forums, and a 2026 check of forty-nine founder-frequented communities
found roughly two in five banning self-promotion outright and another fifth
permitting it only under that ratio. Group rules are set by each community's own
moderators, so the plan's first action on any conversational channel is "read the
rules", and the cadence cap is a ceiling set by the business, never a target.

## Failure modes of the naive reading

- **Fit-only ranking.** Owned content sits at the top on fit and is the most
  expensive channel on the list; the quick win was three rows down.
- **One checkbox for every channel.** A community marked "done"; a directory
  listing that never closes; a content channel with no next piece.
- **The zero badge.** "0 clicks" beside a curated score reads as a verdict on the
  channel. Absent data is rendered absent.
- **Blended fit.** A measured channel's score nudged up by clicks, so the reader
  can no longer tell prediction from observation and the regeneration reasons
  from a contaminated number.
- **Grounding on the sample.** A model told the business sells what the demo
  catalog sells, or that a placeholder row is a product.
- **A keyword on a listing.** "Register on the directory, targeting 'plumber
  near me'" - a query dealt to a channel that cannot carry a page.
- **The free plan last and optional.** The one thing a business with no budget can
  do on day one, hidden behind the one thing it cannot.
- **The permanent redirect.** A short link that browsers cache after the first hop,
  so the counter freezes at one per visitor and the destination can never change.
- **The unfurler's click.** A link pasted into a chat tool fetched by the tool's
  preview bot and counted as the channel's first visitor.

## Seams

`business-profile-and-citations` owns the profile listing's fields, verification,
categories, posts and the citation layer; this plan ranks the profile as a channel
and hands off. `local-visibility-and-reputation` owns map-pack rank, service-area
coverage and reviews; a "collect reviews" first action here is a pointer there.
`search-intent-classification` owns what a target query means; this plan only
decides which channel a query may be dealt to. Owned-content production and the
brief that names its primary keyword belong to the content-production subjects;
what is joined here is the brief's declared keyword, not the brief. Cadence
enforcement across social posting belongs to `channel-native-social-and-repurposing`;
the cap a channel wizard records is an intent handed to that enforcement, not a
second enforcer.
