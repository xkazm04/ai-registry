---
layer: technique
type: technique
subject: search-intent-classification
technique: err-toward-transactional
status: forged
laws: [the-results-page-is-the-verdict, label-convention-as-convention]
shared_with: []
use_when: [an intent call is a coin flip, reviewing a classifier or word list that defaults to informational, deciding which way a marker-free short query falls]
---

# Err toward transactional, because the measured error runs the other way

When a call is genuinely close - the count does not decide, the page is mixed
and unordered, the query carries no marker at all - the verdict breaks toward
the money page. This is not optimism about buyers. It is a correction for a bias
that has been measured and has never been measured to reverse.

## The measurement

A 2008 study classified 1.5 million logged queries automatically from query
features - modifier words, length, URL fragments - and checked 400 of them by
hand. Accuracy was 74%. Of the errors, 45.6% were transactional queries the
classifier called informational and 36.9% were navigational queries it called
informational: 82% of all errors in one direction. The raw log read 80.6%
informational; the authors' corrected estimate was about 65%, with transactional
rising from 9% to roughly 20%. A word-based classifier, in other words,
under-counts buyers by about half.

The mechanism is structural, which is why it generalises to every marker list
written since. A list can only name the words that flag a buying or a local
query. A query with no marker falls through to the default, and the default is
informational because it is the largest bucket. The short, unmarked commercial
queries - a trade, a profession, a product category - are exactly the ones a
business most wants, and exactly the ones the default eats.

## Procedure

1. **Identify the close call.** A count within one of the threshold on either
   side; a mixed page whose top three disagree; a query carrying no marker
   word; a tool label the results page half-contradicts.
2. **Ask which way the known bias would push this query.** If a word list
   would have called it informational for lack of a marker, the bias is live
   and the correction applies.
3. **Break the tie toward transactional** - or toward local, if a place or a
   near-me signal is present, or toward comparison if a best-of or versus
   signal is present. The correction is away from informational, not
   necessarily toward a service page.
4. **Write the reason on the block**: "close call, broken toward transactional
   per the error direction". The reader must be able to see that the verdict
   was a corrected coin flip, not a count.
5. **Re-read after the page has been built and ranked**, because a corrected
   coin flip is the verdict most worth checking against real search-console
   queries once there are any.

## Decision rules

- When a classifier's fall-through case is informational, treat every
  marker-free short query it labelled as unverified, because the fall-through
  is the measured bias made into code.
- When a call is close and the query carries a place, break toward local, not
  transactional, because a local query routed to a national page is still a
  wrong verdict.
- When a call is close and the query carries a comparison signal, break toward
  comparison, because folding it into informational loses the highest-value
  article the business can write.
- When erring toward transactional would label a `[service] for [audience]`
  phrase as a money term, run the who-is-typing test first, because that
  phrase is the one place the audience word fools the correction.
- When a genuine count decides the verdict, do not apply this technique,
  because a correction applied on top of an observation is a thumb on the
  scale.

## What this technique is not

It is not a rule that everything is transactional. A page of ten guides is
informational, and erring toward transactional there is not a correction but a
fabrication. The correction applies only where the observation is silent, and it
is labelled as a correction wherever it is applied. The measured number that
justifies it is from a 2008 log of one engine; a practitioner quotes it as the
best available measurement of the direction, not as the size of the bias on
today's engine, and says so.

## When NOT to use

- When the count decides. The observation outranks the prior.
- On brand queries. A navigational query is "nothing to build", and breaking
  it toward a money page creates a page that catches someone else's customers
  looking for someone else.
- When the business has no money page for the term and does not want one. A
  transactional verdict routes to a page; if the page will never exist, the
  honest verdict is "commercial, no owner page - open item".
- As a substitute for the results-page search. The correction is for the
  residue the search leaves undecided, not for the search itself.
