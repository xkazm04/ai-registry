---
layer: golden-path
type: golden-path
subject: search-intent-classification
status: forged
use_when: [deciding which page type a keyword gets, reviewing a keyword map whose intents came from a tool or a word list, splitting a mixed results page between a money page and an article, deciding what to do with a high-volume term a money page cannot win]
techniques:
  - serp-count-verdict-not-tool-label
  - mixed-serp-money-page-wins
  - err-toward-transactional
  - local-and-comparison-as-own-intents
  - buyer-diyer-peer-test
  - route-losers-to-linking-content
---

# Search intent classification

This subject owns one decision: **what kind of page a query deserves** - a money
page, an article, a local page, a comparison page, or nothing - and how that
decision is made. It is made from what the engine already ranks for the query, not
from the words in the phrase and not from the label a keyword tool attached to it.
Everything downstream of the decision belongs elsewhere. Whether the volume number
next to the query means anything is `keyword-metric-reliability`. Which queries
share a page and how the winning pages link to each other is
`site-architecture-and-topic-clusters`. How a local page is built without becoming a
doorway is `local-page-doorway-prevention`. What an AI answer box does to the clicks
an informational page would have earned is `answer-engine-visibility`. What the
money page says once it has been chosen is `money-page-conversion-craft`. This
subject hands each of those a query with a verdict and a reason attached, and stops.

## The phrase cannot tell you, and the people who invented the taxonomy said so

The three-way split every tool still uses - informational, navigational,
transactional - comes from a 2002 paper that studied a search engine's log and
survey responses. The same paper says outright that there is no assumption the
intent can be inferred with any certainty from the query itself. That caveat is
the founding sentence of the subject and the one most often lost.

The measured consequence arrived six years later. A 2008 study built an automatic
classifier from query features - modifier words, query length, the presence of
URL fragments - and ran it over 1.5 million logged queries. Checked against 400
hand-coded queries it was 74% accurate, and the errors were not symmetric: about
82% of them were transactional or navigational queries the classifier had called
informational. The uncorrected log read 81% informational; the authors' own
corrected estimate was closer to 65%, with transactional roughly doubling from 9%
to 20%. **A word-list classifier does not merely make mistakes. It makes one
mistake, in one direction: it sees an article where there is a purchase.** That
direction has never been shown to reverse, and it is the reason this subject
reads every phrase-based label as biased rather than as noisy.

The bias is structural, not a matter of a bad list. A marker list can only ever
name the words that flag a buying or a local query; every query that carries no
marker falls through to the default, and the default is informational because
that is the largest bucket. "Plumber", "wedding photographer", "accountant for a
small business" carry no marker and are all money queries. The commercial phrases
that matter most are exactly the short, marker-free ones.

## The results page is the verdict

The engine has already decided what the query means. Its decision is published,
ten results at a time, and it is the only observation available that is not a
guess. So the procedure is: search the query, in the target country and language,
and classify each organic result by **what the page is**, not what it is about. A
guide, a how-to, a forum thread, a video, a question-and-answer page is an
informational result. A service page, a product page, a pricing page, a booking
page, a business homepage is a transactional one. A comparison, a best-of, a
review, a roundup is a comparison result. Then count, and write the count down.
"Seven of ten are cost guides and forum threads" can be checked next quarter by
anyone. "Informational" cannot.

The threshold placed on that count is a convention. Six of ten, or any other
number, has no documented source anywhere - not in any vendor's method, not in
the engine's own rater guidelines - and every published method uses
unquantified language instead. The rater guidelines describe a *dominant*
interpretation (what most users mean), a *common* one (what many or some mean),
and *minor* ones, and note plainly that not every query has a dominant
interpretation. A count is still the right instrument, because it forces a
countable observation in place of a feeling, but it is labelled as an internal
consistency rule wherever it appears. This is the law
[the results page is the verdict](../../_laws.md#the-results-page-is-the-verdict)
and its corollary
[label convention as convention](../../_laws.md#label-convention-as-convention)
applied to the same sentence.

A tool's intent label is a hint that is wrong often enough to be dangerous.
Some vendors derive their label from the results page only; others mix result
features with word markers and a brand flag, and so inherit the measured
modifier bias. Neither is the verdict. When a tool's label and the counted page
disagree, the page wins and the disagreement is recorded, because the list of
queries the tool got wrong is usually short and usually the expensive ones.

## The taxonomy a practitioner actually uses

Three of the useful categories are not in the academic three. The engine's own
rater taxonomy is a different four - know, do, website, visit-in-person - and
the last of those is the reason **local** is an intent of its own rather than a
transactional query with a place name attached. A near-me or in-city query is
won by local presence - a verified business profile, a map placement, a page for
that locality - and a generic service page does not win it however well it
converts. Routing a local query to the national money page is a wrong verdict
even when the count says "transactional".

**Comparison** - best-of, versus, alternative, review, price-of - is an industry
addition with no academic origin, and it is kept because it changes the page
that wins. A comparison query is answered by a comparison page or by an article
built to convert, with the money page linked from every section. It is not
answered by a service page, and it is not an ordinary article: it is the
highest-value article a business can write, because the reader is one step from
choosing. A classifier that folds "best", "versus", "review" and "comparison"
into informational has thrown that step away.

**Navigational** - someone typing a brand - is a verdict of *nothing to build*
unless the brand is the business's own. Someone else's brand name is a cut, not
an opportunity, and a page built to catch it is the subject's most embarrassing
failure.

The results page also carries evidence that is not a result. Ads running is a
strong commercial signal, because advertisers bid where money is. A map pack is
local intent specifically. A featured answer or a people-also-ask block leans
informational. Shopping results say transactional but crowded by paid, so the
organic room is thin and the verdict says so rather than mapping a page that
cannot rank. A video pack says the page competes with video whether it has any
or not.

## Mixed pages, and which way a tie breaks

A split page - five service pages and five guides - means the engine is serving
two audiences and has not committed. Three rules resolve it. Read what the engine
put first: the top three positions carry far more of the engine's judgement than
positions eight to ten, so a page whose top three are service pages is
transactional whatever the tail says. When it is genuinely even, the money page
wins the term and the article links to it - never both against the same primary,
because two pages of one site aimed at one query split its links and its
signals. And the map says "mixed" out loud, because a mixed term is a page that
needs watching.

The tie-break direction is not arbitrary. Every measured source of error in this
subject runs toward informational, so a coin-flip call breaks toward the money
page. Erring toward transactional does not mean labelling everything
transactional; it means that when the count does not decide, the known bias
decides, and the reason is written on the block.

## Who is typing this

Volume says how many. It never says who, and three different people type the
same phrase. The **buyer** wants to hire someone and is the only one a money page
can convert. The **do-it-yourselfer** wants to do it alone, reads, and never
calls. The **peer** - a competitor, an agency researching the niche - is worth
nothing, ever. The test is run on every root before the page is planned, and it
is where the `[service] for [audience]` trap lives: "bookkeeping for
restaurants" names the right audience, which is why it feels like a buyer term,
but that phrasing is how a guide is titled, the results fill with how-to content,
and the searchers are mostly the second and third kinds. The buying signal is a
noun - services, company, agency, consultant, firm - or a place, or a verb of
hiring, not the audience.

The consequence for choosing a root is that **the root is the highest-volume
term that also passes the intent check, both, not either.** A guide-shaped term
at three times the volume of a "services" term is the worse root for a service
page, because ranking first for the guide earns readers and ranking first for
the services term earns calls. When the smaller term is chosen, the block says
why in one clause, so the choice reads as a decision rather than a mistake.

## Losers are routed, never deleted

An informational term that lost the money-page slot is not junk. It is the top
of the funnel, and it is usually a genuinely good article that links down to the
page that won. Deleting it loses the demand; leaving it silently on the money
page produces a page that sells to a reader who came to learn, and converts
neither. So every verdict carries a destination: the winner gets the page type
the count chose, and the loser gets the linking content that feeds it. What that
linking structure looks like belongs to `site-architecture-and-topic-clusters`;
this subject only guarantees that no term leaves the map without an address.

## The verdict has a date

Intent drifts. A keyword-tool vendor's study of 37,000 keywords over fifteen
months found the dominant intent had changed for about one query in six, that
core updates moved 10-13% at a time, and that 39-51% of those moves later
reverted - so a verdict is a reading of the page on a day, and a knee-jerk
rewrite after a shift is as risky as ignoring it. The practitioner records the
count and its date, re-reads mapped queries after a core update, and treats a
term whose page has changed shape twice as mixed until it settles. The rule is
convention; the drift it protects against is measured.

## Failure modes of the naive reading

- **The label taken as the verdict.** A tool's intent column pasted into the map
  without a search. It is wrong on the expensive terms.
- **The word-list default.** A classifier whose fall-through is "informational"
  quietly relabels every short money query as an article.
- **The comparison fold.** "Best", "versus", "review" counted as informational,
  so the highest-value articles are written as ordinary guides or not at all.
- **The national page for the local query.** A near-me term routed to the
  service page because the count said "transactional".
- **Both pages on one term.** A money page and an article built against the
  same primary because the page was mixed and nobody chose.
- **The audience mistaken for the buyer.** A `[service] for [audience]` term
  taken as a root because its volume was largest.
- **The deleted loser.** A high-volume informational term cut for wrong intent
  and never routed anywhere.
- **The undated verdict.** A count from two core updates ago defended as
  current.
- **The convention quoted as a standard.** "Six of ten" cited to a client as
  best practice.

## Seams with neighbouring subjects

Volume, difficulty and the trust each deserves are `keyword-metric-reliability`;
this subject uses volume only to rank candidates that already passed intent.
Cluster membership, hub-and-spoke shape and where a routed loser links from are
`site-architecture-and-topic-clusters`; the verdict here says a term is
informational-and-routed, not where it sits. The local page a local verdict
demands is `local-page-doorway-prevention`; the profile it needs is
`business-profile-and-citations`. The click loss an answer box inflicts on
informational verdicts is `answer-engine-visibility`, which is why an
informational verdict here is a routing decision rather than a traffic forecast.
The comparison page's structure is `content-brief-and-article-composition`; the
money page's proof and form are `money-page-conversion-craft`.
