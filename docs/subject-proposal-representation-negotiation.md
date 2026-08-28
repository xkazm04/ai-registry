# Subject proposal — `representation-negotiation`

**Status:** PROPOSED 2026-08-28. Not yet forged.
**Bundle:** `software-engineering`
**Category:** `integration` (flat — no subcategories)
**Resolved path:** `knowledge/software-engineering/integration/representation-negotiation/`
**Raised by:** `/intake`, 2026-08-28, from
[`librarian/sources/2026-08-28-acceptmarkdown-reference.md`](../librarian/sources/2026-08-28-acceptmarkdown-reference.md)
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## Why this is `XL` and not three techniques

Because the corpus has **nothing here at all**, and the gap is not an opinion
that is missing — it is a layer.

Greps across all eight bundles (3,389 concept documents) for `content
negotiation`, `Accept header`, `Vary`, `406 Not Acceptable`, `text/markdown`,
`rel="alternate"`, `q-value` and `llms.txt` return **zero hits**. The
150-subject `software-engineering` bundle models the client's own memory cache
(`client-fetch-cache`), the consumption of somebody else's markup
(`web-scraping`), the shape of a documentation corpus (`docs-content-model`)
and the addressing of a running interface for an agent
(`agent-addressable-ui`) — and nowhere does it model **what a server hands out
when the requester is not a browser**.

That absence has become load-bearing rather than merely tidy-looking. A
growing share of a public surface's traffic is machine traffic, and the
question of what those clients get — the same document painted for a person, a
second representation, or a refusal — is now a design decision with cache
semantics, media-type semantics, drift semantics and a discovery story. The
six proposed techniques below each carry their own decision rule and their own
failure; folding them into a neighbouring subject would either bloat that
subject past its stated job or scatter one concern across four homes.

The honest counter-argument, which the drafter should weigh rather than
inherit: much of this is *plain HTTP*, decades old, and a registry could
reasonably say "read the specification". The reason to write it anyway is that
the standard states the mechanism and refuses to state the policy — it
enumerates proactive negotiation's four disadvantages and then leaves the
choice open — and the policy is exactly what a principal-quality
implementation has to decide and almost always decides by accident.

## Placement, verified against the authority

`taxonomy.json` is the authority, not a directory count. `integration` is
**flat** — it holds eight bare subjects and no subcategories — so a flat add
is legal and no subcategory is required:

`cicd-monitoring`, `connector-catalog`, `embedded-preview`,
`import-normalization`, `markdown-vault`, `sql-console`,
`templates-scaffolding`, `web-scraping` — **eight against a cap of ten**. A
ninth is legal and requires no restructuring. Do not create a subcategory; the
taxonomy's hysteresis rule subdivides only when a category goes *over* the cap.

Link depths, stated so they are not derived wrongly (verified against
`web-scraping/techniques/scrape-scheduling.md`, which resolves
`../../../backend-platform/...`):

- from `representation-negotiation/representation-negotiation.md` → `../../_laws.md`
- from `representation-negotiation/techniques/<t>.md` → `../../../_laws.md`
- to the sibling subject: `../web-scraping/web-scraping.md`
- to another category, e.g.
  `../../ui-surfaces/published-surfaces/docs-content-model/docs-content-model.md`

### Override me if you disagree, and say why

`integration` is chosen because this subject's whole content is the boundary
between this system and clients it did not write, and because it puts the
**producing** side directly beside `web-scraping`, the consuming side, which
is where a reader who needs one will be standing. Two alternatives were
considered and rejected as worse, not as wrong:

- **`ui-surfaces/published-surfaces`** (5 subjects: `docs-content-model`,
  `long-form-reading-surface`, `lazy-section-addressability`,
  `authoring-block-vocabulary`, `public-claim-provenance`). Attractive because
  `docs-content-model` is the natural collaborator — see the boundary section
  below. Rejected because every subject in that category is about what a
  *reader* navigates; opening `long-form-reading-surface` confirms it in its
  first sentence ("a document the reader navigates *inside*"). Cache keys and
  media-type parameters are not a reading surface.
- **`llm-agent/runtime-and-io`** (8 subjects — at cap; a ninth is illegal
  there without restructuring, which alone settles it). Thematically it has a
  claim: `agent-addressable-ui` makes a *running interface* addressable to an
  agent. But that subject is explicit that it is a build-time source-location
  problem ("Addressability is not a search problem. It is a **discard**
  problem"), and half of this subject's readers are serving HTTP with no agent
  anywhere in the picture.

If the drafter concludes the subject is really two — a serving subject and a
consuming subject — say so and argue it rather than silently splitting.

## Proposed techniques

Six, each with the decision rule it must carry. Every one of these arrived at
Phase 3 of the intake run as a standalone candidate; they are folded in here
rather than banked separately because each is a stage of one pipeline.

### 1. `proactive-vs-reactive-selection`

**The discriminator, and the thing the source that raised this got wrong.**
The standard defines two patterns and they are not interchangeable:
*proactive* (the client states a preference on the request, the server
selects) and *reactive* (the server publishes a list of alternates, the client
fetches the one it wants from its own address). A second address per
representation, advertised by a link relation, is **reactive** negotiation —
and the source files both under its proactive heading, a conflation worth
naming because it hides the actual trade.

The rule must be decidable. The standard itself says proactive negotiation
"limits the reusability of responses for shared caching", and lists reactive
as advantageous "generally when public caches are used to distribute server
load". So the discriminator is **who owns the cache between you and the
client**: one address with a varying body multiplies every shared cache entry
by the number of client classes; distinct addresses do not, at the cost of a
second round trip and a discovery problem. Carry the standard's other three
named disadvantages of proactive negotiation too — an enumeration written by
the standard is the cheapest structure this technique can borrow.

### 2. `vary-is-the-cache-key`

Not documentation, not a courtesy header: the standard's own words are that it
**expands the cache key** required to match a new request against a stored
entry. Omit it on a negotiated cacheable response and a shared cache serves
one client class's representation to another — the failure is silent, it
happens downstream of your logs, and it is bidirectional (a machine gets the
human document, a person gets the machine one).

Three things this technique must not simplify away:

- an intermediary **MUST NOT** generate the wildcard value, though an origin may;
- the standard explicitly permits **eliding** the header when the origin
  judges the variance less significant than the header's caching cost — so
  this is a priced trade, not an absolute, and a technique that presents it as
  unconditional is wrong in the direction that gets ignored;
- the header is also a *signal to the client* that negotiation happened at
  all, which is the only in-band evidence that the variation was deliberate.

### 3. `response-type-over-request-intent`

The client-side rule, and the one with the widest blast radius outside this
subject: **a requester may never infer what it received from what it asked
for.** The standard is unambiguous that a client "cannot rely on proactive
negotiation preferences being consistently honored" — an origin may honour an
unsatisfiable preference with a refusal status, or simply disregard it and
answer as though nothing had been negotiated. Even the explicit "refuse rather
than substitute" construction carries the standard's own note that clients
"still need to be able to handle a different response".

So the declared type of the *response* is the only evidence, and a pipeline
that branches on its own request is converting *unknown* into a definite
value — cite `unknown-is-not-a-value`.

The server half of the same coin belongs here rather than in its own
technique: **the refusal status is a policy choice, not a correctness
requirement.** The standard permits either. Serving the human representation
as a default is legitimate and is usually right for a public surface;
refusing is right when a wrong-format body would be silently mis-parsed
downstream. The technique states the trade and the tell — does the caller have
a fallback that *is not* a mis-parse? — and must not repeat the received
wisdom that a refusal is simply "the right response". That claim is a
source's, not the standard's.

### 4. `representation-parameters-are-load-bearing`

The registered media type in play here **requires** a character-set parameter
and defines no default; and it carries an optional variant hint whose
recipient is under no obligation to honour it. Both matter operationally:
dialects of this format are, in the registration's own words, "designed to be
broadly compatible with humans... but not necessarily with each other", and
they degrade in the direction of *silently losing structure* — a table becomes
prose, and prose parses fine.

The rule: emit the required parameter, emit the variant when you know it, and
on the receiving side treat an unlabelled body as a dialect nobody agreed on.
This ties directly to technique 3 — it is the same failure one layer down,
where the type was stated but under-specified rather than absent.

### 5. `projection-not-conversion`

**The producer's structural decision, and the one that decides whether the
second representation is an asset or a liability.** There are two ways to have
one: render both representations from a single content model, or convert the
rendered human document into the machine one. They look identical in a
response and they are different systems.

A converted representation is a **derived value** — cite
`derivation-names-recomputation` — whose recomputation path is "convert
today's rendered output", so it inherits every property of that output,
including navigation chrome, consent banners, and the next redesign. A
projection from a shared source cannot drift, because there is nothing to
drift from.

State the cost honestly: conversion needs no change at the origin and is
therefore what most surfaces will actually deploy, and for a corpus whose
human rendering is already a thin projection of structured content the
difference narrows to nearly nothing. The technique's job is to make the
choice visible and say what each buys — not to forbid the cheap one.

### 6. `advertise-the-alternate`

Discovery, which reactive negotiation cannot work without and proactive
negotiation still benefits from. The standard's link relation for an alternate
representation carries a type attribute, so one response header — or one
head-request — tells a client what else exists without fetching or parsing
anything. Beside it sits the emerging convention of a **published machine
inventory of the whole surface**: a well-known text file enumerating the
addresses a machine reader should start from.

The technique must resist treating that inventory as settled. It is a
convention, it has no registry behind it, and the honest framing is the one
`web-scraping` already uses about published crawl preferences: publishing your
own is cheap, relying on somebody else's is not. Boundary: the *content model*
that makes such an inventory derivable rather than hand-typed is
`docs-content-model`'s problem, not this subject's.

## Boundaries this subject must NOT absorb

- **`integration/web-scraping`** — the consuming mirror, and the boundary is
  already written from that side. This run landed
  `negotiated-representation-probe` there: a scraper's decision rule for
  classifying what a probe returned (authored / derived / ignored) and what
  may be relaxed in each case. **State the boundary from this side too, in
  prose, and do not duplicate the probe.** That technique is about deciding
  whether to build extraction rules; this subject is about deciding what to
  serve.
- **`client-architecture/client-fetch-cache`** — owns the client's own memory
  cache, and `cache-key-discipline` within it. This subject owns the *shared,
  intermediary* cache key, which is a different actor with a different
  failure. Name the seam; do not restate the client-side technique.
- **`ui-surfaces/published-surfaces/docs-content-model`** — owns the typed
  three-layer catalog and its bijection. Technique 5 leans on exactly that
  shape (one body module, many projections) and must cite it as the enabling
  content model without absorbing any of its invariants. There is a live
  amendment candidate on that side — its catalog names a "machine-readable
  site inventory" among the projections a catalog affords, but models no
  *representation* axis, so every consumer gets the same body. **Do not write
  that amendment from here**; it is recorded in the subject note and belongs
  to the owning subject.
- **`backend-platform/resilience/rate-limiting`** and politeness generally —
  this subject is not about how much traffic machine clients may send.
- **`security/authorization`** — who may read a resource is unchanged by which
  representation of it they get.

## The application, and why it is worth writing

One realization is already available and dated, which is where the
`dates-application` half of this proposal comes from. A large edge provider
ships managed conversion of exactly this kind, and its own documentation
publishes a worked response: the required media-type parameter present, the
cache header present and correct, and two custom headers reporting the token
count of the converted body against the original — **725 against 12,345 on one
documentation page**, roughly a seventeen-fold reduction, in a document last
updated 2026-07-13. It states its own limits plainly too: it converts from one
input format only, and refuses origin responses above 2 MB.

That is a real measurement of the *payoff* term nobody in this subject can
otherwise size. It is also a vendor's own number about its own product, so it
is an existence proof and not a distribution, and the application must say so
in those words. Vendor names are allowed downstairs and nowhere else — keep
them out of all six techniques and out of the golden path.

Report the structural fact, because that is what an application is for: that
provider's realization is the **conversion** arm of technique 5 and not the
projection arm, by construction — it fetches the origin's rendered document
and converts it per request at the edge, with the origin unchanged. So the
most widely deployed instance of this subject is the one that structurally
cannot make the drift guarantee, and a reader copying it should know that is
what they are buying.

## Open questions the drafter must decide, not discover

1. **Is the golden path's thesis "serve a second representation", or "decide
   what non-browser clients get"?** The second is broader and admits the
   legitimate answer *nothing different*, which the first quietly excludes.
   This proposal leans to the second; argue if you disagree.
2. **Does technique 3 belong here at all, or is it a client concern wanting a
   home in the consuming subject?** It is placed here because the server
   policy and the client rule are one trade seen from two ends, but a drafter
   who splits them must say where the other half went.
3. **Does technique 6 survive the strip test in its inventory half?** A
   well-known filename is arguably a proper noun. If it does not, the
   convention belongs in an application and the technique keeps only the
   standardised link relation.
4. **Is six too many?** Techniques 2 and 3 could plausibly merge under "what
   the response must state"; 4 and 5 could not. Merging is acceptable,
   splitting further is not.
5. **What is this subject's own honesty law**, in the shape `web-scraping`
   has one? A candidate: *a representation nobody requested must not be
   indistinguishable from one that was* — but a better one may fall out of the
   drafting, and this is the drafter's call, not the proposal's.

## What this proposal deliberately does not contain

A law. Nothing here has converged across runs — this is the first source in
the ledger to touch the HTTP representation layer at all, and `_laws.md` is
the most cross-cutting thing in the registry. If a second independent source
reaches the same rule, that is the moment. Not before.
