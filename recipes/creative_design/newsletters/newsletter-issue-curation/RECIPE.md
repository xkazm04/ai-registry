---
name: newsletter-issue-curation
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/newsletters
---

# Newsletter issue curation and delivery

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A newsletter assembled from whatever the feeds produced is a link dump, and
the reader already had the feeds. Subscribers stop opening it long before anyone
notices, and the number that used to say so has stopped meaning what it did, because
mail clients now load images on the reader's behalf whether or not the message was ever
read.

**Input.** The sources the adopter follows, the record of what past issues already
covered, the editorial corrections reviewers have made before, and what the readers are
actually working on.

**Core action.** Judge which items are worth a subscriber's attention and cut the rest,
group what belongs together, and write commentary that could not have been written
without reading the item, saying why it matters to the reader's own work.

**Output.** One edited issue that repeats no claim a past issue made, that names how
much was considered and how much was cut, that passes a human read, and that reaches the
subscriber list with any dead source named.

## Activities

1. Pull from the followed sources and note which produced nothing *(observe)*
2. Drop what past issues already covered, matching on the claim rather than on the link
*(act)*
3. Judge what is genuinely worth a reader's attention, and record how much was cut
*(decide)*
4. Group into sections and write commentary that says why each item matters to this
reader *(act)*
5. Put the assembled issue in front of a person before it sends *(deliver)*
6. Deliver to the subscriber list and record what actually went out *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Each issue is the result of a cut, and reads as edited work rather than as the feed
the reader already has.**

- How much was considered and how much was included are both recorded, so a ratio
  drifting towards one is visible as curation having stopped.
- Every item carries a line that could not have been written without reading it. A
  restated headline is not commentary.
- No item repeats a claim a past issue already made, matched on the claim rather than
  the link, because one story arrives from five sources under five headlines.
- Every issue passes a human read before it sends.

**A source that has stopped working is noticed, rather than silently producing nothing
forever.**

- A source failing repeatedly is named in the issue rather than quietly contributing
  zero items.
- The number of items considered is recorded even when few were included, so a quiet
  week is distinguishable from a broken scan.
- A thin period ships a short issue rather than padding to a target count, and a period
  with nothing worth reading sends nothing at all.

**Whether an issue landed is judged on signals that survived the last few years, not on
the one that did not.**

- The issue is judged on replies, unsubscribes and what readers followed, rather than on
  opens.
- An open count, where it is shown at all, is treated as an inflated upper bound rather
  than as a fact about a reader, because clients preload remote images on the reader's
  behalf.
- The list's standing with the mailbox providers is checked as part of delivery, since
  an issue that starts arriving in spam is not recovered by editing it better.

## Guidance

The cut is the work. A reader already has the feed, so what earns the send is what you
left out, and a run that includes almost everything it saw has stopped curating whether
or not the issue reads well. Every line of commentary should be one you could not have
written without reading the item. Do not judge the issue by opens: clients now preload
images on the reader's behalf, so an open is an upper bound. Watch replies and
unsubscribes.

## Where this is worth adopting

- A newsletter that began as a real edit and has quietly become a list of links, whose
  author cannot say which issue it happened in.
- An operator whose open rate held steady for two years and now measures nothing,
  leaving them with no way at all to tell whether the thing is read.
- A team whose weekly send is a commitment rather than a judgment, so it goes out on a
  slow week too, and readers have learned that skipping it costs nothing.
- A curator following thirty sources, four of which stopped publishing months ago and
  contribute nothing to every issue without anybody noticing.
- A newsletter approaching the volume at which the large mailbox providers apply their
  bulk sender rules, where the first spam complaint spike is far easier to prevent than
  to recover from.

## Connector types

`web_scraping`, `email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[firecrawl](examples/firecrawl.md) for `web_scraping`, [resend](examples/resend.md) for
`email`.

## Recommended trigger

`self_paced`. Sources publish at their own rates and an issue is worth sending when
there is enough worth reading. A fixed cadence is a promise the adopter makes to
subscribers on the charter, not an obligation on the craft, and a recipe that owes a
clock an issue every week will eventually pad one.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which sources the adopter follows and which they have given up on, since a stale
  source list is worse than a short one and its failures are invisible by construction.
- What the adopter's readers are working on, because relevance here is entirely a
  function of that and nothing in the sources themselves supplies it.
- Who the subscriber list is and where it is held, since delivery is the one step in
  this recipe that cannot be undone.
- The editorial voice the commentary should carry, which reviewers will otherwise
  correct issue after issue without it ever being written down.
- What the adopter is willing to treat as evidence that an issue landed, given that the
  number most newsletters were built around no longer measures reading.

## Dependencies

- a subscriber list the chosen email connector is actually able to send to, as a list
  rather than as many individual messages
- sender authentication in place for the sending domain, and a working one click
  unsubscribe in the message, which the large mailbox providers require of bulk senders
  before deliverability becomes an editing problem at all
