---
layer: golden-path
type: golden-path
subject: keyword-metric-reliability
status: forged
use_when: [reading a keyword export before building a map, deciding what a volume or difficulty number may be used for, setting or defending a difficulty ceiling, scoring keyword ideas from more than one data provider]
techniques:
  - volume-as-order-of-magnitude
  - difficulty-is-a-link-count
  - authority-ceiling-blogs-not-money-pages
  - serp-age-and-topical-proximity
  - local-terms-rank-by-revenue-not-volume
  - unknown-metric-sinks-never-flatters
---

# Keyword metric reliability

A keyword export has four numeric columns - volume, difficulty, competition, and
somewhere near them a site-level authority score - and every one of them is read as if
it were a measurement of the thing its name suggests. None of them is. Volume is a
bucketed, family-aggregated, country-level average that an ad platform publishes for
advertisers. Difficulty is, in every vendor's formula, mostly a count of the links
pointing at the ten pages currently ranking. Competition is advertiser density in an
auction, not organic contestability. Authority is one vendor's model of a domain's link
profile, scaled 0-100 and comparable to nothing outside that vendor.

This subject owns **how far to trust each of those numbers, what each actually
measures, which thresholds built on them are convention, and what predicts a page's
chance to rank better than they do.** It does not own the reading of intent off the
results page (`search-intent-classification`), the grouping of keywords into pages and
hubs (`site-architecture-and-topic-clusters`), the reweighting of a map for AI answer
boxes (`answer-engine-visibility`), the definition of revenue per job
(`profit-on-ad-spend-economics`), or the forecasting of traffic and leads from a map
(`goal-pacing-and-forecast`). Those subjects consume the verdicts made here: a number
that this subject says is ordinal arrives in their formulas as a rank, never as a
quantity.

## What each number measures

**Volume** is the ad platform's estimate of monthly searches for a *family* of close
variants, averaged over twelve months, rounded to a bucket, for one country. A published
audit of 101,897 keywords carrying platform volumes found 1,462 distinct values - about
seventy keywords sharing every value - and a median calibrated figure of roughly half
the reported one; a keyword-data vendor's own accuracy claim against a site's console
impressions is about 60%. A second study of 33,377 ranking terms over sixteen months
found the platform over-reporting aggregate impressions by 163% while under-reporting
63% of individual keywords by more than 20%: the error runs both ways, so no scalar
correction rescues it. What survives all of that is the ordering. "This term is roughly
ten times the size of that one" holds; "this term gets 2,400 a month" does not, and
"this page will bring 2,400 visits" is a fabrication dressed as a plan.

**Difficulty** is a 0-100 score whose formula differs by vendor and whose scale is the
only thing the vendors share. One computes it purely from referring domains to the top
ten; another publishes weights in which median referring domains and median authority of
the ranking pages make up about 58% of the score, with link ratios, volume and result
features filling the rest; a third averages its own page- and domain-authority metrics
across the ten results. The same keyword reads 46 in one tool and 72 in another. Read
difficulty as "how many links do the pages I would have to displace carry", and never
carry a number - or a threshold set on one - across tools.

**Competition**, where a keyword export comes from an ad platform, is the density of
advertisers bidding on the term. It is the paid market's verdict on commercial value,
which makes it a useful intent hint and a useless organic-ease signal: a term with no
advertisers can have ten unassailable organic results, and a term every advertiser
wants can have an organic top ten of thin directory pages. A scoring formula that reads
ad competition as organic ease has changed the question without saying so.

**Authority** is a vendor's link-profile model of a domain. It is not a ranking factor
of any engine - the engines' own representatives have said so on the record - and it is
not on the same basis as difficulty even inside the same vendor's product. Subtracting
one from the other is a habit, not arithmetic. The habit is kept because it stops a new
site burning a quarter on terms it cannot win; the technique that keeps it labels it as
the convention it is.

## Ordinal, not cardinal

The single load-bearing distinction in this subject is between a number that orders
and a number that quantifies. Every metric above orders reasonably well within one
tool, one country and one pull. None quantifies. The failure modes of the naive reading
all come from treating an ordinal as a cardinal:

- **Summing the family.** The platform reports the family total onto each member, so
  adding "plumber" and "plumbers" counts the same demand twice. A cluster's "total
  volume" is at best the largest member's figure, and even that is a bucket.
- **Forecasting from one keyword.** The page at position one ranks in the top ten for
  hundreds of other queries - a median around four hundred in a published study of
  ranking pages, close to a thousand on average. Traffic estimates come from what the
  currently ranking page earns across everything it ranks for, labelled as an estimate,
  never from one term's bucket.
- **Feeding a bucket into a weighted score.** A formula such as "60% normalized volume
  plus 40% inverse competition" treats the bucket as a quantity: the head term with the
  largest figure sets the denominator and every term under a hundred contributes
  nearly nothing, so the score reproduces the volume column's ordering with an ease
  tie-breaker and calls it opportunity. If a composite score must exist, feed it ranks
  or logarithms, and say which.
- **Comparing across pulls.** A threshold set on last quarter's difficulty in one tool
  does not survive a vendor's formula change, let alone a switch of tool. Re-baseline
  the ceiling when either changes; a difficulty history is only meaningful inside one
  vendor's methodology window.

## Where the numbers fail hardest: local demand

City-level demand sits in exactly the band where bucketing destroys the signal. Two
services in the same town with genuinely different demand both report ten a month, or
zero, and a volume sort of local terms is a sort of rounding noise. The corrective is to
stop sorting: build the full service-by-city grid, rank it by revenue per job, and let
volume break ties only. Forty searches a month for an emergency term can out-earn four
thousand informational visits, and the ordering that captures this comes from the
business, not the export. The volume floor convention - a hundred a month before a page
is worth building - is the convention this case exists to override, and an override
is stated with its reason, never slipped through silently.

## What predicts ranking better than difficulty

Two signals, both read off the live results page and both measured in published work,
outperform any difficulty score for a site that is not yet established.

**The age of the current top ten.** Across 1.3 million queries in one national market,
72.9% of top-ten pages were more than three years old and the average page at position
one was about five years old; only 1.74% of pages published in a year reached the top
ten within that year, down from 5.7% in the same vendor's 2017 study. A results page
with no entrant under a year old is telling you something difficulty cannot: the
incumbents are not being displaced. A results page with a page published this year in
the top five is an opening, whatever the difficulty column says.

**Topical proximity.** A study across a dozen sites of time-to-first-click found that
pages on topics the domain already ranked for reached their first click materially
faster - on the order of 35-40% within three weeks against about 20% for unrelated
topics. A keyword adjacent to existing coverage beats an isolated higher-volume one,
and the check is a query against the site's own search-performance console for
neighbouring terms, not a vendor's "topical authority" figure, which no engine has
published and no vendor measures.

Both signals are read per root, on the actual results page. That is the results-page
law applied to reliability: the tool's number is a hint, the page is the verdict.

## Provenance and the unknown

Keyword ideas increasingly arrive from more than one provider - a dominant ad platform,
a second national one, a synthetic sample for a workspace with no connection yet. Two
rules govern the merge. First, **a real record beats a synthetic one regardless of the
synthetic's volume**: a sample generator that scales head terms to thousands would
otherwise discard a second provider's real ten. Second, **a metric the provider did not
report is defaulted so that the row sinks in every derived ranking, never so that it
floats**: unknown competition is mid, not low; missing cost per click yields no
efficiency figure rather than an infinite one; missing volume is a small floor, not a
headline. This is the not-measured-is-not-zero law applied where a null cannot be
carried - and the default is checked in *each* score it feeds, because a value that
sinks a row in one sort (zero cost, last in efficiency) can flatter it in another (zero
competition, full ease points).

## How a principal practitioner holds the export

They pull the right country's database and say on screen which one. They treat the
volume column as a sort key and never speak a volume to a client as a forecast. They
read difficulty as a link count and check the two better predictors on every root. They
keep the difficulty ceiling for blog posts as a hard gate and refuse to apply it to
pages for services the business actually sells, building the rankable variant beneath
the unrankable hub instead. They rank local terms by what a job is worth. They label
every threshold they use - the ceiling ladder, the hundred-a-month floor, the family
double-count rule - as convention or as measurement, and they quarantine what a
threshold cuts, grouped by when it becomes useful, because a wrong cut is invisible
forever and a quarantined term gets a second look when the authority score climbs.

## Failure modes of the naive reading

- **The wrong country's database.** Every number on the map is for a market the
  business does not serve; the map looks perfect and is worthless.
- **National volume presented as addressable demand.** A one-city business shown a
  country figure.
- **The forecast from a bucket.** "This page will bring N visits."
- **The cross-tool threshold.** A ceiling set on one vendor's difficulty applied to
  another's, or kept across a formula change.
- **Ad competition read as organic ease.** The paid market's crowding fed into an
  organic opportunity score.
- **The convention defended as a law.** "Difficulty must be thirty below authority" cited
  as best practice rather than as a guardrail that no study supports.
- **The unknown that floats.** A missing metric defaulted to the value that ranks the
  row first.
- **The silent cut.** A term below the floor dropped without a reason and without a
  quarantine, so nobody learns it converted.

## Seams

Intent is read on the results page and belongs to `search-intent-classification`; this
subject supplies only the caution that an ad-platform competition value is a paid-intent
hint. Cluster membership and the hub-spoke geometry belong to
`site-architecture-and-topic-clusters`, which consumes the "rankable variant under the
hub" verdict made here. The reweighting of informational terms for AI answer boxes is
`answer-engine-visibility`; revenue per job is defined in
`profit-on-ad-spend-economics` and only used here as a sort key. Whether a keyword map's
numbers may appear in a client report at all, and with what label, is
`client-reporting-and-data-provenance`.
