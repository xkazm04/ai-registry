---
source: web:acceptmarkdown.com/reference
kind: standards index (new class) — a link hub whose children are primary standards
url: https://acceptmarkdown.com/reference
title: "Reference — Markdown content negotiation for AI agents"
author: single-maintainer advocacy site
words: 281 (hub) / ~213 (its own markdown representation) / ~87,000 (the children)
extracted: 11
accepted: 2
declined: 0
leads: 3
already_covered: 0
untriaged: 0
dispatched: 1
---

# acceptmarkdown.com/reference — and its children

Operator handed over `/reference` **and its children references**. That phrasing
turned out to be the whole run: the page itself is 281 words of pure pointers and
`research-ingest` exited **3 (source too thin)**, correctly. Everything mined here
came from the eleven documents it points at.

## The class: a standards index

Not in [`references/source-classes.md`](../../.claude/skills/intake/references/source-classes.md)
yet, and it deserves a row. A **standards index** is a curated link list whose own
body is below the ingest floor by construction and whose children are *primary*
(specifications, registries) rather than commentary.

Three properties, all confirmed here:

- **Expected yield is high, not low** — the opposite of the second-hand survey it
  superficially resembles. A survey relays other people's news and is reliable only
  for *that* the world moved. A standards index points at documents that can
  **authorize a golden path outright**, with no convergence wait and no second
  source. Both are "somebody else's links"; the difference is entirely in what is at
  the far end.
- **The fetch budget necessarily blows** and this is not a run failure. The class
  rule says a lossy pointer's fetch *is* the extraction; here the source is nothing
  *but* pointers, so 6 fetches went on the source's own named children as extraction.
  Corroboration itself cost **zero** — when the children are RFCs, the primary is
  already in hand.
- **The curator's framing is the least reliable thing on the page**, and is worth
  reading adversarially rather than skipping. Both of this hub's framing errors
  (below) were more useful than its correct links, because each named a distinction
  the proposed subject now has to carry.

Practical corrective: **ingest the hub for its link list, then treat the run as a
batch over the children.** Do not judge the source by `--min-words` on the hub — the
floor answers "is anything there at all", and for this class the answer is
structurally no while the yield is structurally high.

## What the hub got wrong, and why both errors paid

1. **It conflates proactive and reactive negotiation.** It files `.md` sibling
   addresses and `Link: rel="alternate"` under a heading citing the *proactive*
   negotiation section. Those are **reactive** negotiation — the standard defines
   both, distinctly, and the choice between them is a real cache trade (proactive
   "limits the reusability of responses for shared caching"; reactive is
   advantageous "generally when public caches are used"). This is the fourth run in
   the ledger where the source located something true and explained it wrongly, and
   the correction became proposed technique 1 rather than a decline.
2. **It asserts a refusal status is "the right response when the client's `Accept`
   header can't be satisfied."** The standard says an origin "can either honor the
   header field by sending a 406 (Not Acceptable) response **or disregard** the
   header field" — the refusal is a policy choice, not a correctness requirement.
   That correction is written into proposed technique 3, explicitly, so the received
   wisdom does not enter the corpus through the back door.
3. **A citation error**, recorded as a class signal and nothing more: it cites
   "RFC 9110 §12.5.1 Proactive Content Negotiation". §12.5.1 is `Accept`; proactive
   negotiation is §12.1. Not registry content. Worth noting only because a standards
   index whose value is its citations mis-citing its own headline entry is exactly
   the failure this class walks into, and it is cheap to check.

## Registry position: a hole, verified three ways

Not a seam. Greps across all eight bundles — 3,389 concept documents — for
`content negotiation`, `Accept header`, `Vary`, `406 Not Acceptable`,
`text/markdown`, `rel="alternate"`, `q-value` and `llms.txt` returned **zero hits**.
`research-map` returned only semantically unrelated slug collisions ("content" in
`content-drift-and-revision`, "header" in `browser-credential-boundary`), which is
the near-empty signature — so the near-empty was checked against the two nearest
real neighbours before anything was written:

- `client-fetch-cache` owns the **client's own memory** cache, not a shared
  intermediary cache key. Different actor, different failure.
- `docs-content-model` models a documentation corpus as a typed catalog and even
  names a "machine-readable site inventory" among its projections — but every
  consumer gets the same body. No representation axis.

The 150-subject `software-engineering` bundle has no HTTP-representation subject at
all. That is a layer, not an opinion, which is what made this `XL`.

## Candidates

### 1. Serve a machine representation at the human address — `dispatched`

`K` / golden-path / doctrine / `XL` / new-subject. Specified, not half-built:
[`docs/subject-proposal-representation-negotiation.md`](../../docs/subject-proposal-representation-negotiation.md).
Six proposed techniques with their decision rules, placement verified against
`taxonomy.json` (`integration` is **flat**, 8 subjects against a cap of 10 — a
flat add is legal, do not create a subcategory), resolved link depths, the two
rejected placements argued, four boundaries it must not absorb, five open questions,
and an explicit instruction to override the brief.

**Candidates 3–7 below are folded into it as its proposed techniques** rather than
banked separately — four fragments in one dispatchable document beat four leads
re-derived one at a time.

### 2. Probe for a negotiated representation before authoring scrape rules — `accepted`

`K` / amendment + new technique / technique / `M` / fills-stack-gap.
Landed: `knowledge/software-engineering/integration/web-scraping/` — new technique
`negotiated-representation-probe`, plus a golden-path correction.

**The enumeration hunt, paying for the eighth consecutive run.** `web-scraping`
states its alternatives ladder twice — "exhaust the alternatives in order: an
official API, a feed, an export, a negotiated data license" in the opening, and a
four-bullet "When to scrape — and when the job is something else" section. Neither
enumeration contains *the same page in another representation, offered by the same
server*, which is the cheapest one on the list to check: one request, no contract,
no key, same address. The acquire stage row had exactly two modes, plain fetch and
a rendering engine, and both begin from the premise that the browser document is
the only thing on offer. Both enumerations and the stage row were corrected.

**The technique is worth more than the gap because the naive reading is wrong**, and
the primaries are what showed it. The enthusiast's claim is "negotiation replaces
scraping". The evidence says that depends entirely on a distinction invisible in the
body: an alternate representation **authored at the origin** is the feed branch and
rules infrastructure is overhead, but one **converted from the same markup on the
fly** — the common managed case — is a *derived value* whose recomputation path is
"convert today's markup", so it inherits the redesign it appeared to protect
against. It relieves the parse stage and buys nothing against the shape-change
adversary. Cited to `derivation-names-recomputation`.

So the technique's real job is closing a trap that only exists once the probe is
run: the probe returns the derived case, the text looks clean, and the pipeline gets
*relaxed* — tripwires loosened, hit-rate baselines abandoned because there are no
selectors left to count. That turns a shape-change detector into a shape-change
blindfold at the exact moment the input looks most trustworthy. The technique's
table makes the middle row explicit: **derived ⇒ shape-change instruments
unchanged, all of them.** Also carries the third answer the standard forces
(`ignored` — the server may disregard the preference, so read the response's
declared type, never your own request; `unknown-is-not-a-value`), the re-probe on
the shape-change alarm (a redesign is a publishing change, and publishing changes
are when owners add machine output), and the scraper's own cache-key collision.

### 3–7. Folded into the dispatch — `accepted, as proposed techniques`

Each reached Phase 3 as a standalone candidate and each is a stage of one pipeline:

| # | Candidate | Becomes | Primary that authorizes it |
| --- | --- | --- | --- |
| 3 | `Vary` is the cache key, not documentation | technique 2 | RFC 9110 §12.5.5 — "Vary expands the cache key"; intermediary MUST NOT send `*`; eliding is explicitly permitted when the caching cost dominates |
| 4 | Never trust that a preference was honoured | technique 3 | §12.1 — a client "cannot rely on proactive negotiation preferences being consistently honored"; §12.4.3 note |
| 5 | Proactive vs reactive: pick by who owns the cache | technique 1 | §12.1 (four named disadvantages) vs §12.2 |
| 6 | A refusal status is optional, not correct-by-default | into technique 3 | §12.4.1 — "can either honor... or disregard the header field" |
| 7 | Media-type parameters are load-bearing | technique 4 | RFC 7763 — `charset` is REQUIRED with no default; `variant` is a hint the recipient may ignore; dialects "not necessarily compatible with each other" |

### 8. Edge conversion measured 12,345 → 725 tokens — `accepted, as the dispatch's application`

`K` / application / dated fact / `S` / dates-application. Named in the proposal as
the application to write once the subject exists. A managed edge offering's own
documentation publishes a worked response carrying the correct required media-type
parameter, the correct cache header, and two custom headers reporting converted
against original token count — **725 against 12,345**, ~17×, document last updated
2026-07-13; converts from one input format only; refuses origin responses above 2 MB.

An existence proof, not a distribution — a vendor's own number about its own
product, and the application must say so in those words.

**The structural fact the application exists to report** is not the ratio. That
offering is, by construction, the **conversion** arm of proposed technique 5 and not
the projection arm: it fetches the origin's rendered document and converts per
request with the origin unchanged. So the most widely deployed instance of this
subject is the one that structurally cannot make the drift guarantee. Nobody
designed that; it falls out of "no origin changes" being the selling point.

## Leads

- **A published machine inventory of a surface** (`llms.txt`, well-known path).
  Observed in-band — the edge provider's own converted pages emit a pointer to one.
  Zero corpus coverage; adjacent to `docs-content-model`'s "machine-readable site
  inventory". Provisionally proposed technique 6 of the dispatch, but it is a
  convention with no registry behind it and open question 3 asks whether it survives
  the strip test at all. **Return when:** a second independent source treats it as
  load-bearing, or a connected project publishes one.
- **`content-signal` response header** declaring permitted AI uses
  (`ai-train=`, `search=`, `ai-input=`). One vendor, unstandardised, adjacent rather
  than central. **Return when:** it appears in a registry or a second implementation
  ships it.
- **`docs-content-model` has no representation axis.** Its three-layer catalog
  (category record / topic record / body module) is exactly the shape proposed
  technique 5 wants — one body, many projections — and it already names a
  machine-readable inventory among the projections a catalog affords. But every
  consumer resolves to the same body, so a second representation has nowhere to
  live. An amendment on that side, deliberately **not** written from the new
  subject. **Return when:** the dispatch is executed and technique 5 exists to cite.

## Declines

None. Every extracted candidate landed, folded into the dispatch, or banked with a
return condition — which is a property of the class, not of the triage. Primary
standards do not produce the half-corroborated middle that generates declines.

## Fetch accounting

**6, all extraction, 0 corroboration.** The hub's markdown representation; RFC 9110;
RFC 7763; RFC 7764; RFC 8288; the edge provider's documentation. Every one is a
child the operator named. This exceeds the nominal 3-fetch corroboration budget and
is stated rather than hidden: for a source that is nothing but pointers, the budget
line to watch is corroboration, and corroboration here cost nothing because the
children *are* the primaries. The IANA registry and the three developer-doc pages
were not fetched — they restate the RFCs that had already been read.

## Housekeeping

`build-index --check` was **stale on arrival**: commit `ccc7798` added a technique to
`software-engineering` without regenerating `index.json`. Pre-existing debt, not this
run's; regenerated and folded into this run's commit. Gate sequence per the standing
note — index before catalog, then both checks.
