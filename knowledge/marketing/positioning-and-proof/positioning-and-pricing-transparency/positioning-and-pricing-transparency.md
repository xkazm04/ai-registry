---
layer: golden-path
type: golden-path
subject: positioning-and-pricing-transparency
status: forged
use_when: [writing or reviewing a value case against named incumbents, deciding what a landing page may claim about channel support, publishing a pricing page before billing exists, auditing a positioning document for undated competitor facts or a stale lead claim]
techniques:
  - killer-triad-with-copy-difficulty
  - ships-today-vs-claim-separation
  - state-support-level-not-parity
  - lead-claim-currency
  - competitor-facts-sourced-and-dated
  - documented-intent-pricing-tiers
---

# Positioning and pricing transparency

A buyer who has seen the pitch five times gives a new product two or three
minutes. In that window they want four things legible without a form: what it
is, whether it works, what it costs, and what to do next. Every survey of
business software buyers for the past several years has put hidden pricing at
the top of the complaint list - a 2025 review-marketplace study put "no
transparent pricing" as the single most-requested fix, and found that only a
few percent of vendor profiles on that marketplace listed a price at all. The
gap between what buyers ask for and what vendors publish is the opportunity
this subject describes, and the honest way to close it is harder than it looks:
a value case that survives a sceptical reading, a support claim that says its
level rather than implying parity, and a price that is published as intent
before a single invoice has gone out.

This subject owns **what the business claims about itself and its rivals, and
how a price is stated before it is charged.** It does not own how a claimed
figure is evidenced - the demo badge, the real-versus-illustrative branch, the
inventory of proof that does not exist - that is `honest-proof-and-illustrative-data`.
It does not own how a money page is composed - hero order, the count of visible
proofs, the single call to action - that is `money-page-conversion-craft`. And
the contract that keeps a generative model from inventing a competitor's number
belongs to `grounded-marketing-generation`. What is here is the content of the
claim: which three things to say, why an incumbent cannot say them, where the
line between shipped and promised sits, and how a tier is published as a
documented intention rather than a fake checkout.

## A claim a buyer can check is worth ten a buyer must believe

The naive value proposition is a list of adjectives with an "AI-powered" in
front. The buyer has a pattern-matcher for it and it fires in the first
sentence. The principal's alternative is a **value case**: a small set of
claims - three is the convention, chosen because a reader holds three and a
sales conversation can rehearse three - each of which names the incumbent it
is made against and carries a stated reason that incumbent cannot copy it.

The "cannot copy" clause is the load-bearing part, and it must be structural.
"They have not built it yet" is not a reason; it is a roadmap gap that closes
in a quarter. The strategy literature calls the durable form counter-positioning:
the newcomer adopts a model the incumbent will not mimic because mimicry would
damage the business it already has. A vendor priced for agencies cannot go free
without cannibalising its subscription base. A tool built around one country's
dominant ad platform cannot serve a second national platform without rewriting
assumptions for a market that does not move its revenue. A recommendation
engine cannot honestly claim its output is conditioned on the customer's live
data unless it also owns the data spine, and owning the spine is a
re-architecture rather than a feature. Each of those is a reason a buyer can
reason about, and the difference between a moat and a feature is precisely that
the buyer can see why the moat holds.

The failure mode is the claim that is merely true. "We support two ad
platforms" is true, checkable and copyable in a sprint. It belongs in the
feature grid, not in the triad. The triad is reserved for claims whose
copy-difficulty is a property of the incumbent's business, not of its backlog.

## Ships today and the claim are two sentences, never one

Every value case drifts toward the future tense, because the future is where
the product is best. The discipline that stops the drift is a strict
separation, per claim, between **what ships today** and **the claim itself**.
The claim may be about the workspace treating a second channel as first-class;
the ships-today line says, in the plainest available words, that the channel
gets copy-limit checks and keyword suggestions and does not yet sync live
data. A buyer who reads both and buys has bought the product that exists.

The separation has a corollary the practitioner learns from the first sales
call that goes wrong: **a claim that leans on an unverified integration is not
sales-safe.** If a client library has never been run against a live account,
the claim it supports is documented in the value case with a caveat that
names the verification as a pre-launch must, and until that is done the claim
is not rehearsed in a conversation where money is on the table. The caveat
lives next to the claim, in the same document, because a caveat in a separate
engineering note is a caveat nobody selling reads. This is
[never invent proof](../../_laws.md#never-invent-proof) applied to a
capability rather than a number: an integration that has not been exercised
is a proof the business has not got.

## State the level; never imply parity

A logo wall of four platforms says "we work with all of these" and the reader
supplies "equally". If one is a live-data connector, one gets copy checks, and
two are publishing surfaces, the wall has lied by layout. The alternative is
a pill per channel that carries its support level as a word beside the name -
"live sync", "ad-copy checks", "publishing" - so the page states the tier and
the reader never infers parity that was not claimed.

The rule generalises past channels. Any list of things a product "works with",
"integrates", "supports" or "covers" is a list of support levels in disguise,
and the honest surface names the level per item. The convention this subject
adopts is that the level vocabulary is short - three or four words the whole
site reuses - so that a reader who learns it on the hero recognises it on the
pricing page and in the FAQ. A proof line on the same surface obeys the same
rule: it states only what is true today, and a commitment ("self-hostable",
"open source") that does not yet work is stated as a commitment with a status
chip, never as a proof line, because a proof line is read as present tense.

## The lead claim must be current, or the page is a period piece

Positioning moves. The thing a product does first for a stranger changes when
the product learns what strangers actually want, and a landing page built
around last quarter's lead claim does not become slightly wrong - it becomes a
period piece, a snapshot of a product that no longer exists in that shape. The
subject's test is blunt: **can this page state the current lead claim in its
first screen?** If not, it is not a candidate for iteration; it is retired,
however much work went into it.

The same test disposes of a whole class of variants. A page nobody linked to
has no audience and no measurement, so it cannot become current by accident.
A variant built from a library of other people's patterns, without the owner's
own references, is a period piece on arrival. Retirement is a recommendation
awaiting a yes under
[a gate before money and copy](../../_laws.md#a-gate-before-money-and-copy),
made the day the lead claim moves, not when someone notices the page.

## A competitor fact is sourced and dated, or it is absent

The value case names incumbents. It says what they charge, what they support
and who they sell to. Every one of those is a claim about a third party's
current state, and third parties change their pricing pages without telling
you. The rule is [never invent proof](../../_laws.md#never-invent-proof) in
its competitive form: a competitor fact carries a source and a snapshot date,
or it is not written. "Priced for agencies, in the hundreds per month" with no
citation and no date reads authoritatively for exactly as long as it takes a
buyer to open the incumbent's pricing page on their second tab.

Three grades of competitor statement exist, and the honest document knows
which it is using. A **sourced, dated fact** - a price, a feature, a market -
with its origin and the day it was read. A **characterisation** - "their output
is a recommendation list, not the asset" - which is the author's reading and
is labelled as such. And an **absence** - the business does not know what the
incumbent does about a thing - which is left absent, not filled with a
plausible guess, under
[not measured is not zero](../../_laws.md#not-measured-is-not-zero). The
document also carries a refresh cadence for the dated facts, because a date
with no re-read plan is a date that will be three years old when a prospect
reads it. In a product where a model generates comparative copy, the same
grades apply structurally: a competitor a scan suggested is a suggestion until
a person confirms it, and only confirmed entries reach a prompt.

## Pricing before billing: documented intent

The hardest surface in the subject is the pricing page of a product that
cannot yet be bought. The two naive answers both fail. Hide the page, and the
buyer who ranks pricing transparency first leaves. Publish tiers with a
"contact us" or a mail link where the button should be, and the buyer
concludes the product cannot be bought - which is what a user-acceptance run
against a sceptical buyer persona recorded, in so many words, as a purchase-
intent killer.

The honest answer is **documented intent**: the tier table is published, the
paid tiers are marked as coming with a stated condition, no fake checkout or
mail link stands where a purchase would be, and the one actionable tier - the
free one - leads straight into the product. Four rules hold it together.

- The **free tier carries the whole flow.** Its feature list is the product's
  actual first path for a stranger, not a crippled preview, because a free tier
  that cannot demonstrate the value case is a demo with a price of zero.
- **Every number on the page is a claim about the metering.** Limits and
  prices arrive through placeholders filled from the plan catalogue, and a
  test rejects a typed digit. The derivation mechanism belongs to
  `honest-proof-and-illustrative-data`; the rule here is that a pricing page
  may not quote a limit the product does not enforce.
- **Anchors are labelled as illustrative until validated.** A price set by
  reasoning ("about five dollars a month, converted") is a hypothesis. The
  willingness-to-pay corridor comes from asking buyers, and the standard
  price-sensitivity survey applies to one clearly defined offer at a time, so
  a tier table needs a reading per tier or a trade-off method across them.
  Until then the anchor is convention and the page's copy may say so.
- **The revisit trigger is tied to activation, not a date.** "We re-price
  after N organically activated projects" - people who connected an account
  and came back - is observable; "we re-price in Q3" fires whether or not
  anything was learned. N is convention - a low double-digit figure is the
  practitioner's habit for a product with no prior customers - and is
  labelled as such.

One disclosure rule gets copied wrong often enough to state here. When a
tier's headline is "unlimited via your own key" and the listed cap is only the
fallback the business funds when the key is missing, reading the listed number
as the plan's cap under-sells the plan and hiding it over-sells it. Both are
lies of framing; the honest surface states the number and its role in one
sentence.

## Failure modes of the naive reading

- **The backlog moat.** "Hard to copy" justified by the competitor not having
  built it yet.
- **The tense collapse.** A claim and its ships-today line merged into one
  sentence, so the reader cannot tell which half is shipped.
- **The logo wall.** Four names, one implied level; and its cousin, the proof
  line that is a commitment - "self-hostable" in the present tense while a
  production build still needs a hosted database.
- **The undated incumbent.** A rival's price quoted from memory, no source, no
  snapshot day, no refresh plan.
- **The mail link where the button goes.** A paid tier whose call to action is
  an address, telling the buyer the product is a portfolio piece.
- **The untested word.** Positioning copy no buyer persona has read out loud;
  the value case may be sound and the words still fail the two-minute test,
  and nothing but a person-test finds that.

## Seams with neighbouring disciplines

The badge beside a demo number, the real-versus-illustrative branch, the
indexability of a proof page, the derivation of claims from code and the
inventory of evidence that does not exist belong to
`honest-proof-and-illustrative-data`; this subject decides what is claimed and
consumes those mechanisms for how it is evidenced. Page composition - what is
above the fold, how many proofs, one call to action - belongs to
`money-page-conversion-craft`. The generation contract that stops a model
inventing a rival's figure is `grounded-marketing-generation`; this subject
supplies the rule that only a confirmed competitor may ground a prompt. Whether
a no-budget channel should lead the product is `zero-budget-channel-planning`'s
question; this subject insists only that whatever leads is stated first and
stated currently.
