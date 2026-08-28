---
domain: software-engineering
subject: web-scraping
last_touched: 2026-08-28
touched_by: intake
dry_streak: 0
---

# web-scraping

First note. Touched 2026-08-28 by `/intake` from
[[../../sources/2026-08-28-acceptmarkdown-reference]]: one new technique
(`negotiated-representation-probe`, now 8) and a golden-path correction in three
places.

## The finding was an enumeration miss, stated twice in the same file

The subject declares its alternatives ladder in its opening — "exhaust the
alternatives in order: an official API, a feed, an export, a negotiated data
license" — and again as a four-bullet section, "When to scrape — and when the job
is something else". Neither contained **the same page in another representation,
offered by the same server**, which is the cheapest entry on that list to check:
one request, no contract to negotiate, no key to obtain, the same address. The
pipeline table's acquire row had exactly two modes, plain fetch and a rendering
engine, both proceeding from the premise that the document painted for a browser
is the only thing the server will hand out. That premise is a default, not a
finding, and the protocol has carried the means to test it for decades.

Reusable form, and the eighth consecutive run the enumeration hunt has paid:
**when a subject states the same enumeration twice, the omission is load-bearing
rather than an oversight** — the author reached for the list from two directions
and got the same set both times, which means the gap is in the model, not in the
typing.

## The naive reading is wrong, and that is what made the technique

"Negotiation replaces scraping" is the enthusiast's claim and it is only sometimes
true. The distinction that decides it is invisible in the response body: an
alternate representation **authored at the origin** is genuinely the feed branch of
the ladder, and rules infrastructure is overhead. One **converted from the same
markup on the fly** — the common managed case, and the one a reader is most likely
to meet — is a derived value whose recomputation path is "convert today's markup".
It inherits the redesign it appeared to protect against. It relieves the parse
stage and buys nothing whatever against the shape-change adversary.

So the technique's real job is closing a trap that only exists *after* the probe is
run: the probe returns the derived case, the extracted text looks clean, and the
pipeline gets relaxed — required-field tripwires loosened, hit-rate baselines
abandoned because there are no selectors left to count. That converts the
subject's own shape-change detector into a shape-change blindfold, at precisely
the moment the input format looks most trustworthy. The technique's table exists
to make one row unmissable: **derived ⇒ every shape-change instrument unchanged.**

The subject's honesty law survives into the converted case verbatim. An extraction
that yields nothing from a converted document is still indistinguishable from a
page that genuinely lists nothing.

## Boundary, written from this side; the other side is proposed

The producing mirror of this subject does not exist yet. It is dispatched as
[[../../../docs/subject-proposal-representation-negotiation]] →
`integration/representation-negotiation`, deliberately placed beside this subject
so a reader who needs one is standing next to the other.

The boundary, so a later run does not re-litigate it: **this subject owns whether
to build extraction rules; that subject owns what to serve.** The probe landed
here because its consumer is a scraper author deciding what to build, and the
proposal carries an explicit instruction not to duplicate it. If the drafter over
there writes a producer-side counterpart ("if you serve a derived representation,
say so"), that is a different technique with a different reader, and both notes
should say so.

## Third answer worth keeping in view

The probe has three outcomes, not two, and the third is the standard's doing: the
server may simply **disregard** a stated type preference and answer as though none
had been sent. So the acquire stage must read the response's declared type and
never its own request — `unknown-is-not-a-value` applies to a fetch that assumes
it got what it asked for. This is the same rule the proposed sibling subject will
carry from the serving side; when it lands, check the two statements agree.
