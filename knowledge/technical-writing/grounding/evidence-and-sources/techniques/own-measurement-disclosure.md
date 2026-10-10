---
layer: technique
type: technique
subject: evidence-and-sources
technique: own-measurement-disclosure
status: forged
laws: [every-number-has-a-source-and-a-date, report-the-topic-not-the-author]
shared_with: []
use_when: [reporting numbers an article measured itself, logging the method behind a measurement, deciding how much method belongs in the page versus the log]
---

# Own measurement disclosure

The concern: a technical post's most valuable numbers are often ones nobody had published:
the author measured them for the post. Presented as bare numbers, they are indistinguishable
from guesses; narrated in the first person ("I ran..."), they turn the post into a lab
diary. **Treat the article's own measurement as a numbered source; state it impersonally
where it first appears; log the commands, versions, inputs and date where a reader can
repeat it.**

## In the page

- **One impersonal sentence at first use**: what was measured, with what tool at what
  version, over what input, on what date. "Counted with a named tokenizer library at its
  version over the parallel test set's 1,012 sentences per language, on the stated date."
  The subject is the measurement, not the author
  ([report the topic, not the author](../../../_laws.md#report-the-topic-not-the-author)).
- **Source [1] in the sources list**: "Measurements for this article", with the run date
  and a pointer to the method
  ([every number has a source and a date](../../../_laws.md#every-number-has-a-source-and-a-date)).
- **Captions cite it** like any other source.

## In the log

Per experiment, enough that another person can rerun it and get the same number:

1. The environment: operating system, language runtime and library versions.
2. The inputs, with where they were downloaded from (the exact URL) and any substitution
   (a mirror used because the canonical copy was gated, and why that is equivalent).
3. The command or the counting rule, stated precisely (what counts as a token, a shard, a
   first appearance).
4. The raw outputs, before any ratio or rounding.
5. The derivations: which raw numbers produced which reported ratios.

## Decision rules

- **When the measurement disagrees with a published figure, report both** and the likely
  reason (corpus, version, method). The disagreement is evidence, not an embarrassment.
- **When a system could not be measured, say so** and why (unpublished internals, a gated
  file), rather than measuring a proxy and presenting it as the system.
- **Report the definition with the number when it is non-obvious.** "Position in the
  vocabulary" means merge rank for one tokenizer family and score order for another; the
  number is meaningless without saying which.
- **When the method cannot be recovered, cut the run, not the headline.** A published
  figure whose test nobody can describe any more is withdrawn together with every other
  number from the same test, or the test is repeated and disclosed. Deleting the striking
  figure and keeping its quieter neighbour leaves the same undisclosed measurement on the
  page, now without the sentence that showed it was one.
- **A number in a title travels without its hedge.** "About five minutes" in the body is
  an honest estimate; "in 5 minutes" in the title, the card and the feed is a claim with
  no qualifier. A figure goes in a title only if it was measured and the body states the run.
- **Do not round in the log.** Round in the page, to the house's significant figures; keep
  the raw counts where the derivation can be checked.
- **Translations or inputs made for the article are disclosed as such.** A test sentence
  translated by the author is an input the reader should know was not drawn from a
  benchmark.

## When not to use it

When the "measurement" is a single interactive trial with no stable input, it is an
example, not a measurement; present it as an example and do not give it a source number
that implies repeatability.
