---
name: content-feed-intake-for-curation
version: 0.2.0
status: seed
domain: general_professional
path: general_professional/knowledge-curation
---

# Content feed intake for curation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A sweep that reprocesses what it has already seen, or that empties a flooding
feed into curation, costs more in quota and attention than the new items are worth. The
reprocessing is rarely a bug in the loop: the same article reaches the sweep at three
addresses, two of them carrying tracking parameters, and a run keyed on the link treats
all three as new. Meanwhile the feed that has produced nothing worth keeping for six
months is swept every time, because nobody ever counted.

**Input.** The configured feeds, the identities of items already processed, the age and
volume limits, and the yield each feed has produced in earlier sweeps.

**Core action.** Derive an identity for each item that the source controls rather than
one the address supplies, share the run's capacity out across feeds instead of filling
it in arrival order, and hand curation a bounded set together with an account of what
was dropped and why.

**Output.** A bounded set of genuinely new and recent items handed to curation with the
identity each was keyed on, plus a per-feed record of what came in and what got through,
including the feeds that produced nothing and the ones that could not be reached.

## Activities

1. Sweep each configured feed, recording whether it answered at all *(observe)*
2. Derive a stable identity per item, preferring the source's own identifier over its
address *(decide)*
3. Drop what has been processed before, under that identity *(decide)*
4. Drop items past the age this feed's material stays worth curating *(decide)*
5. Keep the newest within each feed's share of the run rather than the newest overall
*(act)*
6. Hand the survivors to curation with the identity each was keyed on *(deliver)*
7. Record per-feed yield, including the feeds that produced nothing and the ones that
failed *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Curation sees an item once, and the identity that guarantees it is one the source
controls.**

- Items are keyed on the identifier the feed supplies, with the address used only when
  there is none, and the run records which of the two was used.
- An address is normalized before it is ever used as a key, so tracking parameters and a
  syndicated copy do not read as separate items.
- An item that could only be keyed on its own content is marked as weakly keyed, because
  that key will eventually let a duplicate through and a reader should know which items
  are exposed to it.

**A feed that floods gets its share of the run and no more.**

- The per-run cap is shared across feeds rather than filled in arrival order, so a feed
  publishing fifty items cannot starve the rest.
- Within a feed's share the newest items win and the run says that this is what
  happened, because newest-first is the wrong tie-break for reference material and the
  adopter has to be able to see it applying.
- Everything dropped is accounted for by reason, whether seen before, too old, or past
  the cap, so a limit that is set wrong shows up as a number rather than as a quiet
  week.
- An item the curator retrieves from what was dropped is recorded against the reason
  that dropped it, so a feed collecting retrievals under too old has that feed's age
  limit put in question rather than each retrieval being handled on its own.

**A feed that never produces anything worth keeping is retired rather than swept
forever.**

- Per-feed yield is recorded every run, and a zero is written as a zero.
- A feed that has yielded nothing across an agreed run of sweeps is surfaced for
  retirement with that count attached.
- A feed that could not be read is recorded as unreachable and never as a zero, because
  the two lead to opposite decisions and only one of them is the feed's fault.
- A feed added too recently to have produced a normal yet is held as untested rather
  than counted toward retirement, since a new source and a dead one are
  indistinguishable over a short window.

## Guidance

Key items on the identifier the feed gives you and treat the address as a fallback,
because the same article reaches you at three of them and two carry tracking. Share the
run's capacity across feeds rather than filling it in order, or the loudest feed becomes
the only one. Judge nothing here about worth: that is curation's work. Do keep the yield
per feed, including the zeros, because a feed that never produces is pure cost and only
the count will show it.

## Where this is worth adopting

- Somebody who subscribed to thirty sources over two years and has never removed one,
  where the useful output is not the articles but the list of eleven feeds that have
  contributed nothing since spring.
- A curation habit that keeps producing duplicate pages for the same article, where the
  cause is not the curator's judgment but a sweep keyed on an address that three
  publishers each serve differently.
- A pipeline whose curation step costs real money per item, so an unbounded batch is a
  bill rather than an inconvenience and the cap has to hold even in the week a
  conference publishes forty pieces in a day.
- A mix of a fast news feed and a slow reference feed, where a single age limit throws
  away the reference material that was still worth reading and a single global cap lets
  the news feed take the whole run.
- An operator who suspects a feed has been quietly broken for weeks, and needs a run
  that distinguishes a source with nothing to say from a source that stopped answering.

## Connector types

`knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`self_paced`. Feeds fill at their own rate and a fixed hour is a habit rather than a
property of them. Act when enough new material has plausibly accumulated to be worth a
pass, and skip the pass entirely when it has not. Skipping is only safe because the
yield record still shows the gap, so a run that did not happen is distinguishable from a
run that found nothing.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which feeds are in scope and what each is for, because a feed added once and never
  examined is pure cost and the yield record only becomes useful once somebody says what
  a given feed was supposed to produce.
- How stale an item may be and still be worth curating, per feed rather than globally,
  because the answer for a news source and a reference source differ by an order of
  magnitude and one number serves neither.
- How many sweeps of nothing should pass before a feed is proposed for retirement,
  because a seasonal source and a dead one look identical over a short window.
- Where the record of processed identities lives, because it is the only thing standing
  between curation and reprocessing everything, and it has to outlive any single run.

## Dependencies

None.
