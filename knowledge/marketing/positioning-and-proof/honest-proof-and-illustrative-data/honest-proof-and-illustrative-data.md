---
layer: golden-path
type: golden-path
subject: honest-proof-and-illustrative-data
status: forged
use_when: [building a proof band or share card for a product with no customer results yet, deciding whether a page with demo numbers may be indexed, rendering a surface that can show either a client's synced data or a sample, writing marketing copy that quotes a limit or a price or a feature count]
techniques:
  - proof-from-live-computation
  - demo-badge-beside-the-number
  - binary-provenance-no-blending
  - indexability-follows-provenance
  - absent-evidence-inventory
  - claims-derived-from-product-code
---

# Honest proof and illustrative data

A marketing surface wants a number. A buyer who is deciding in two or three
minutes wants to see what the product does, quantified, before they read a
sentence of positioning; a page with no figure on it reads as a portfolio piece
rather than a product. And most products, for most of their early life, have no
customer result to quote. The honest ways out of that bind are the whole of this
subject: show figures the product actually computes, on data that is openly
fictional, labelled where the eye lands; keep the fictional and the real in two
branches that never touch; let search engines find the real branch and never the
fictional one; keep a written list of the evidence you do not have; and derive
every claim that can be derived from the code that ships, so the copy cannot
drift from the product.

This subject owns **how a quantified outcome is shown when it is not yet earned,
and how a surface tells real from illustrative.** It does not own the generation
contract that keeps a model from inventing a figure - that is
`grounded-marketing-generation`. It does not own the client's own performance
report and its liveness rule - that is `client-reporting-and-data-provenance`,
which decides what "synced" means; this subject consumes that decision. It does
not own the claims themselves - which incumbents to name, what a tier costs,
what support level a channel gets - that is `positioning-and-pricing-transparency`.
What is here is the seam between a claim and its evidence: the badge, the branch,
the index flag, the inventory and the derivation.

## The four states of a marketing number

Every figure a marketing surface can show sits in exactly one of four states, and
the surface's job is to make the state legible without the reader working for it.

- **Earned.** A customer's real outcome, with the customer's consent to show it,
  and with what a typical customer gets stated alongside it. The rarest state,
  and the only one that counts as proof in the advertising-law sense.
- **Computed on illustrative data.** The product's own arithmetic, run on a
  fictional dataset that is disclosed as fictional beside the figure. This is not
  proof of results. It is proof of *computation* - that the product produces this
  kind of output from this kind of input - and it is honest exactly as long as it
  is framed that way and no further.
- **Derived from the product.** A count, a limit, a price, a feature list read
  out of the code that enforces it. Not an outcome at all, but a fact about what
  ships, and true by construction if the derivation is real.
- **Absent.** Testimonials nobody gave, logos of advertisers who never signed,
  press that never ran, uptime nobody measured. The state that exists to be
  named so it is never quietly promoted into one of the other three.

The naive reading collapses the middle two into the first. A proof band that
says "Portfolio ROAS 4.2x" over demo data, with "sample data" in a footer, has
made an earned-results claim it cannot substantiate, and the footer does not
undo it. The US consumer-protection regulator's revised endorsement guides
(2023) report its own testing: a "results not typical" line beside a testimonial
did not measurably change what readers took the ad to promise, and a disclosure
that does not alter the net impression is decoration. That finding is the
empirical spine of this subject: the label determines what the number *means*,
so it has to be where the number is.

## Illustrative data is a demonstration, not a testimonial

The honest framing of a fictional client's numbers is never "here is what our
customers get" with a caveat; it is "here is what the product computes, for a
client we made up, and the dashboard shows the same figures". Three things
follow, and they are the difference between an honest demo and a fabricated
case study.

First, the figures are **computed live by the product**, never typed. A proof
band that calls the same snapshot builder the dashboard calls, on the same
fixture, cannot disagree with the demo a visitor opens a minute later, and it
moves the day the product moves. A typed number is a snapshot of a past build
and a promise nobody is keeping ([never invent proof](../../_laws.md#never-invent-proof)
applies to the author as much as to a model).

Second, the fictional dataset is **internally consistent** - value is
conversions times order value, cost is revenue times the cost ratio, channel
breakdowns are shares of one daily series - so every surface that reads it
agrees with every other. A demo whose tiles contradict its table teaches the
reader that the product cannot add, the one impression a demo exists to prevent.

Third, the illustrative label sits **beside the number, at the weight of the
section label, in the same viewport**, and it names the fiction plainly - "demo
data: fictional client" - rather than hedging it. The technique on the badge
carries the placement rules; the point here is that a label in a footer, a
tooltip, a smaller grey line, or an opening confession paragraph is not a label.
It is either fine print, which readers skip, or an apology, which readers
believe.

## Provenance is binary and decided per request

A surface that can show either a client's synced series or a sample series must
be entirely one or entirely the other, per request, from the live state of the
sync ([provenance is binary and labelled](../../_laws.md#provenance-is-binary-and-labelled)).
Blending - a real daily series under a sample channel mix, a real total beside a
sample trend, a sample forecast on real history - is the failure this rule
exists to stop, because the reader cannot tell which cell to trust, and neither
can the model that later summarises the page.

The consequences run deeper than the banner. When the real branch is taken, only
what the sync substantiates rides under the real claim: a sample spine's channel
shares, event calendar and narrative are dropped, not carried. A forward-looking
target may survive, because a target is a plan and not a result. A series in a
currency the surface cannot render stays on the sample branch rather than being
relabelled into the surface's currency - a relabelled series on a public page is
the exact lie the branch exists to prevent
([not measured is not zero](../../_laws.md#not-measured-is-not-zero) forbids the
currency blend for the same reason).

And the disclosure is **dropped on the real branch**. A caveat on a client's own
synced data - "illustrative sample, not real results" - is the opposite lie: it
tells a reader that earned proof is fiction. Provenance is one bit, and the
banner is a function of that bit, not a fixed piece of chrome.

## Indexability follows provenance

A page that carries illustrative figures is never indexed. A search engine that
indexes a demo performance page has turned a demonstration into
search-findable proof of results, attributed to a brand, with no reader ever
having seen the banner that made it honest. The rule is therefore mechanical:
the index flag is computed from the same provenance bit as the banner, per
request, so a cleared sync reverts a page to noindex on the next crawl rather
than leaving stale real-branch indexing over a sample.

Page kinds differ by purpose before they differ by data. A local service landing
page carries the business's own service, price and locality - nothing
illustrative - and exists to rank, so it indexes unconditionally. An experiment
arm exists to be measured and dies when the test ends, so it is noindex whatever
it shows. A performance page is the one kind whose indexability depends on its
data, and it indexes only when its provenance bit is real. The technique carries
the mechanics, chief among them that noindex is a directive the crawler must be
able to read, so a robots block on the same page defeats it.

The share card is the corner case teams miss: a preview image travels without
the page, so if the card shows figures, the card bakes the label into the image.

## The inventory of what you do not have

Honesty about evidence is a written artefact, not a disposition. A product's
positioning document lists, in one place, the evidence that exists and is
renderable (a computable case-study dataset, a working product behind sign-in, a
design system, a key visual) and the evidence that is **absent and never to be
fabricated** (customer testimonials, named customers, real advertisers' logos,
press, pricing case results, uptime and scale claims). The second list is the
important one. It is read by every person and every model that writes a page,
and it converts "we have no testimonials" from a thing everyone knows into a
thing no draft can accidentally violate.

The inventory also disciplines the *shape* of the surface. No customers means no
logo wall - channel-support pills stating the support level per channel instead;
no testimonial band - a proof band of computed figures with a badge; no "trusted
by" line - a walkthrough that demonstrates rather than asserts. Each absent item
is replaced by a different band, not by a plausible stand-in.

There is an inverse failure a well-meaning team walks straight into:
**announcing the absence**. A page that opens with "we have not published a
result for your industry yet, and we will not borrow someone else's" is not
honest, it is self-sabotage - it plants a gap no reader arrived knowing about
before the first sentence of value. The inventory is for the authors; the page
shows what is true and strong, labels what is illustrative beside the figure,
and says nothing about the rest. A related trap is disclosing the *product's*
status on a money page as if it were a data disclosure: a pricing page that
tells every visitor it is a case study with no payment gateway kills purchase
intent for the tiers that are real. Status belongs in the tier chip and the CTA
state, not in a banner.

## Claims derived from product code

The last leg is the one that stops the copy rotting. A price, a daily limit, a
plan name, a feature count, the vendors a bring-your-own-key tier accepts, the
number of channels a free plan curates, the bounds a production prompt enforces
("six to nine channels, two to four first actions") - each of these is a claim
about a specific piece of shipping code, and the honest way to make it is to read
it from that code at render time. Numbers enter copy only through placeholders
filled from the source of truth; a unit test fails when a number is typed into
the copy instead; a feature grid is the module registry filtered and sorted; an
FAQ answer that quotes the free price reads the pricing catalogue, so a stale
answer breaks the build instead of shipping.

The distinction to hold is that **derivation guarantees currency, not
truthfulness**. A derived limit is exactly as honest as the metering that
enforces it. What derivation buys is that the page and the product cannot
disagree, and that a claim which used to be true cannot outlive the code that
made it true. Which claims to make is the positioning subject's; this subject
only insists that once made, they are read rather than retyped.

## Failure modes of the naive reading

- **The footer disclaimer.** A demo figure labelled somewhere the eye does not go.
  Measured to be ineffective, and the reader who later learns the truth feels
  deceived, which is worse than the number's absence.
- **The blended series.** Real totals over a sample channel mix, because the
  sample spine was convenient. The page is now half-true, and no cell says which
  half.
- **The caveat on the real branch.** Copy-pasted chrome that tells a client
  their own results are fiction.
- **The indexed demo.** A performance page for a fictional client ranking for
  the brand name plus "results".
- **The typed number.** A limit or price in copy, in two locales, that the
  metering stopped enforcing a release ago.
- **The confession, and the status banner.** An opening paragraph listing what
  the business lacks, or a product-readiness disclaimer on the money page, each
  mistaken for honesty.
- **The relabelled currency.** A foreign-currency series rendered in the local
  currency symbol on an indexable page.

## Seams with neighbouring subjects

The generation contract - schemas that cannot carry a number, validators that
drop entities not in the request - is `grounded-marketing-generation`'s; this
subject assumes generated copy arrives without invented figures. The report's
liveness rule and per-metric source badge are
`client-reporting-and-data-provenance`'s; the provenance bit this subject
branches on is that subject's output. Which claims to make, what a tier costs
and how support levels are stated are `positioning-and-pricing-transparency`'s.
The markup of a proof page - an article node with a dataset node listing the
variables measured - is `on-page-and-metadata-craft`'s; what this subject adds
is that the markup carries the same provenance the chrome does, so a page never
self-certifies demo numbers in its structured data while disclosing them in its
banner.
