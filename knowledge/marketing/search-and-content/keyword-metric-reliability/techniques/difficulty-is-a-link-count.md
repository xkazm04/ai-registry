---
layer: technique
type: technique
subject: keyword-metric-reliability
technique: difficulty-is-a-link-count
status: forged
laws: [the-results-page-is-the-verdict, label-convention-as-convention]
shared_with: []
use_when: [reading a difficulty column, a threshold is being carried from one tool to another, a difficulty score and the live results page disagree]
---

# Difficulty is a link count

Every vendor's keyword difficulty is a 0-100 number whose formula rests mostly on the
links pointing at the pages that currently rank. Read it as "how many referring domains
do the ten pages I would have to displace carry", and its behaviour stops being
mysterious: it is high where incumbents are well linked, low where they are not, and
silent about everything else that decides a ranking.

## How the scores are built

- One major vendor computes difficulty purely from referring domains to the top ten, and
  publishes the mapping: around 56 referring domains at a score of 40, around 249 at 60.
- A second publishes weights in which median referring domains (about 41%) and median
  authority of the ranking pages (about 17%) make up roughly 58% of the score; link
  ratios, volume and result features fill the remainder. The same vendor now sells a
  "personal" variant calibrated to the querying domain, which is an admission that the
  base score answers "how strong are the incumbents", not "can this site rank".
- A third averages its own page- and domain-authority metrics across the ten results,
  weighting the higher positions more.

The scales agree; nothing else does. A published comparison put one keyword at 46 in
one tool and 72 in another; practitioners routinely see 23 against 58. A score is
meaningful inside one vendor's formula for the period that formula stands, and nowhere
else.

## What the score cannot see

Because the score is a link count with decoration, it is blind to the things that most
often decide whether a new page ranks: whether the incumbents match the intent
(a results page of thin directory listings scores high on links and is soft), whether
the results page is old or churning, whether the querying domain already ranks for the
neighbourhood, whether a result feature takes the click before position one, and
whether the incumbents are brands the engine will not displace at any link count. Two of
those - age and proximity - are measured predictors and have their own technique.

## Procedure

1. **Name the vendor in the header** of any map that carries a difficulty column, and
   the pull date. A number without its vendor is not a difficulty score.
2. **Translate to links once.** Where the vendor publishes its mapping, write the
   referring-domain equivalent beside the ceiling ("40, about 56 referring domains") so
   the reader sees what the number asks of them.
3. **Read the weakest incumbent.** For any root that matters, open the results page and
   find the top-ten page with the fewest referring domains. That page's link count is
   the honest entry price; the vendor's median hides it.
4. **Confirm on the page.** A high score with an intent-mismatched top ten is an
   opening; a low score with ten brand results is a wall. The results page is the
   verdict, the score is the hint
   ([the results page is the verdict](../../../_laws.md#the-results-page-is-the-verdict)).
5. **Re-baseline on any change.** When the tool changes or the vendor announces a
   formula update, every threshold set on the old score is re-derived; do not compare
   this quarter's scores with last quarter's across that boundary.

## Decision rules

- When a threshold was set in one tool, never apply it to another tool's score, because
  the formulas share a scale and nothing else; re-set the threshold on the new tool's
  distribution for the same site.
- When difficulty and the live results page disagree, the page wins and the
  disagreement is recorded on the map, because the score cannot see intent, age or
  proximity.
- When a difficulty score is quoted to a client, quote its vendor with it and say what
  it counts; a bare "difficulty 65" presented as a property of the keyword is a
  convention passed off as a measurement
  ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
- When the site has no vendor authority score to compare against, skip the ceiling
  arithmetic and use the weakest incumbent's referring-domain count directly as the
  gate; it is the same information without the dimensional confusion.

## When not to use this

Do not read an ad platform's *competition* column as a difficulty score. It measures
advertiser density in the auction and says nothing about organic links; the two are
routinely mistaken for each other in tools that merge paid and organic exports. Do not
discard difficulty altogether: inside one vendor and one pull it orders well enough to
triage a thousand terms in an hour, which is the job it is fit for. And do not use a
difficulty score on branded or navigational queries, where the incumbent is the brand
and no link count describes the contest.
