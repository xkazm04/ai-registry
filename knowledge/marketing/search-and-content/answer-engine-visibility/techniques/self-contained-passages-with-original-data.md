---
layer: technique
type: technique
subject: answer-engine-visibility
technique: self-contained-passages-with-original-data
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled, label-convention-as-convention]
shared_with: []
use_when: [deciding what content a business should publish to be cited, briefing a page that needs a citable passage, grading a draft for liftability, choosing between a generic guide and a data page]
---

# Self-contained passages with original data

A page is cited for a passage, not for its whole, and the passage that gets
cited is one that stands alone and contains something the engine could not have
got elsewhere: the business's own prices, its job counts, its measured results,
a quoted customer or expert with attribution, a table of its own numbers. The
technique has two halves - the passage shape, which is structure, and the
original data, which is substance - and the second is where the leverage is.

## Why substance outranks structure

The only controlled experiment in the field, the 2023 academic paper that
named it, tested content interventions against a generative engine: adding
statistics, quotations and cited sources raised visibility in responses by up
to about 40%; keyword stuffing did nothing or hurt. Every large-sample vendor
study since has found the same shape by correlation - tables, explicit
statistics, sourced claims and attributed quotes each associated with roughly a
quarter more citations - and every one of them names original data and
proprietary research as the highest-leverage content type across engines. A
generic "what is" guide competes with every other generic guide for the same
passage slot; a page that says what the business charged for 1,400 jobs since
2011 competes with nobody.

## Procedure

1. **Inventory what the business alone knows.** Prices and price ranges by
   job type; counts (jobs, years, units installed, clients served); measured
   before-and-afters; response and turnaround times actually achieved;
   customer quotes with names or attributable roles; photographs and
   screenshots from real work. Each item is either supplied by the business or
   it does not exist on the page. This inventory is the proof inventory the
   positioning subjects maintain; this technique draws from it and adds
   nothing to it.
2. **Build passages around items, not topics.** One passage per fact cluster:
   a pricing passage, a track-record passage, a method passage with a quote.
   Each opens by naming its subject, states the fact with unit and date, and
   closes without depending on the next passage. Convention from the fan-out
   mechanics: 130-170 words for a spoke section, since retrievers work on
   chunks of roughly one to three hundred words and a passage that spans a
   chunk boundary is split.
3. **Put numbers in real tables when there are three or more of them.** A
   comparison, a price list, a spec sheet. Real table markup, not aligned
   prose, because the engine parses structure and a table is the one shape
   that survives lifting with its labels intact.
4. **Cite the source of every number that is not the business's own.** A
   statistic with its original source lifts citation odds in the vendor
   studies and, more to the point, lets the engine attribute correctly; an
   unsourced number is the engine's to discard.
5. **Write units, dates and currencies explicitly.** "CZK 4,800 in 2026", not
   "around five thousand". Vague claims cannot be quoted and cannot be checked.
6. **Prefer the ranked list where the topic is genuinely a list.** Listicle-
   shaped pages take the majority of citations in multi-engine samples (vendor
   figure, unstated sample). This is a format decision made on the results
   page - if the top results are lists, the topic is a list - not a reason to
   turn a service page into "top 7 reasons".
7. **Serve a machine-readable twin where the platform allows.** The same
   article at an alternate address as plain text with the same passages,
   declared as an alternate of the page. Cheap, and it removes the question of
   whether the crawler rendered the page.

## Decision rules

- When the business has no original data on a topic, do not write the page
  for citation, because the passage would be generic and generic passages lose
  the slot to whoever has the number; write it only if the sibling technique
  gives it another job.
- When a number must be estimated, label it as an estimate in the passage
  itself and never as a measurement, because a provenance label sits beside
  the number, not in a footer, and an engine lifts the sentence without the
  footer.
- When a generator is drafting the passage, hand it only the inventory's facts
  and give it a schema that cannot carry a number the inventory lacks, because
  an instruction not to invent does not satisfy the law and a fabricated
  statistic is the exact shape an engine most readily lifts.
- When a page has strong original data but is buried in a long guide, move the
  data passage into the first third of the page, because the direction of the
  "citations come from early in the document" finding is safe even though its
  fraction is a vendor number.

## What is convention here

The 130-170-word passage and the "three or more numbers means a table" rule are
practitioner conventions built on documented retrieval mechanics; the exact
chunk sizes are the engines' to change. The percentage lifts for tables,
statistics, sourcing and quotes are vendor correlations on samples the reader
did not choose; the controlled +40% is from one 2023 experiment on one engine
and is quoted as such. The listicle share is a vendor count. The
"median cited page is over a year old" finding is a vendor measurement and its
lesson - substance beats recency stunts - is robust because it agrees with the
dominant engine's documentation that a date-only change does nothing.

## When NOT to use

- To manufacture "original data". A survey of the business's own staff dressed
  as research, a number rounded up to sound better, a quote a customer did not
  say. The leverage of the technique is exactly why the fabrication is
  tempting and exactly why it is forbidden.
- On pages whose job is the sale. A money page carries a proof line and a
  price; it is not a data essay, and turning it into one buries the one action
  it exists for.
- To justify length. A 3,000-word page with no clean passage boundaries loses
  to a tight 150-word passage; the technique produces bounded passages, not
  longer pages.
