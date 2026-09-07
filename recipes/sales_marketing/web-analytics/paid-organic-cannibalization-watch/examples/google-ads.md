# Google Ads as the `advertising` connector

What was learned mapping this recipe onto Google Ads specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The keyword you bid on is not the term the ad was shown for.** With broad match and
automated bidding, one keyword is matched against a wide set of actual queries, and the
organic position that matters is the position for the query, not for the keyword. Joining
the keyword table to a rank source compares two different things and produces overlap
that does not exist and misses overlap that does. Take the paid side from the search terms
report, not the keyword report, and accept that the join is then query to query.

**The tail is hidden, not empty.** Search terms below a query volume floor are withheld
for privacy, and they can be a large share of spend in a broad matched account. Spend is
reported at the campaign and keyword level but is not attributable to the withheld terms,
so the sum of the analysable terms does not reconcile with the account total. Report the
unanalysable share explicitly, as a proportion of spend rather than a count of terms. A
shortlist that silently covers sixty percent of spend and reads as if it covered all of it
is the failure this recipe exists to avoid.

**There is no brand flag.** No advertising platform supplies one, and the classification
drives the whole reading: near total overlap is the expected condition on a brand term and
an alarming one on a generic term. The token list, including misspellings, product names
and the founder's name if people search it, comes from the adopter at adoption. A term
containing a misspelled brand is still a brand term.

**A pause inside a shared budget is a reallocation, not a holdout.** Automated bidding
moves the freed budget onto the other terms in the same campaign within days, so the
designed test measures the reallocation rather than the pause, and the result is
uninterpretable in either direction. If the recipe's shortlist is going to be tested,
the tested terms need their own campaign and their own budget before the pause, and the
recipe should say so in the test it names.

**Conversions backfill.** Conversion counts for a window keep rising for days after it
closes, so a window read too early understates the paid side and inflates how wasteful the
overlap looks. Read the window only after the conversion window the account is configured
for has fully elapsed, and state which window the reading used.

## What transfers to any advertising connector

- Compare against the term that triggered the ad, never the keyword that was bid on.
- Privacy or volume floors hide part of the tail. Report the hidden share of spend rather
  than treating it as zero.
- Brand versus non brand is a classification the adopter supplies; no platform has it.
- A pause inside a shared budget measures reallocation. Isolate the budget before testing.
- Ask how long conversions take to finish arriving before choosing the window.
