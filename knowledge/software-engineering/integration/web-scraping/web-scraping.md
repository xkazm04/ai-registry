---
layer: golden-path
type: golden-path
subject: web-scraping
status: forged
techniques:
  - extraction-rule-dsl
  - llm-assisted-rule-authoring
  - dry-run-preview
  - dedup-and-datasets
  - scrape-scheduling
  - shape-change-detection
  - negotiated-representation-probe
  - soak-mode-and-verdict-replay
---

# Web scraping & extraction rules

Web scraping turns pages published for humans into structured records. The
input is a rendering — markup whose only promise is that a browser can paint
it — and the output is rows in a dataset with named, typed fields. Between
them sits the one artifact this subject is really about: **authored
extraction rules**, the durable statement of *how* this particular page shape
becomes those particular fields.

Scraping is the interface of last resort, and a principal-quality
implementation says so out loud. Before authoring a single rule, exhaust the
alternatives in order: an official API, a feed, an export, a negotiated data
license — and the cheapest one to check, an alternate *representation* of the
very page you were about to scrape, which costs one request to ask for. Each
of those is a *contract* — someone promised the shape, versioned it, and will
hear about it when they break it. A page is not a contract. Its owner may
redesign it tonight, without notice, owing you nothing. Everything distinctive
about scraping engineering follows from that single asymmetry:

1. **Rules break silently, and they break in the shape of plausible
   emptiness.** An API breaks loudly — status codes, schema errors. A
   redesigned page still returns markup and a success status; your selectors
   simply match nothing. The default failure mode of a naive scraper is
   "success, zero records", which is the most expensive lie in automation.
2. **The rules are the asset.** The fetch loop and the parser are commodity;
   the accumulated, tuned, verified rule set for each target is the part that
   took human judgment and is expensive to recreate. It deserves the same
   care as source code: editable form, validation, preview before commit,
   provenance.
3. **You are a guest.** The target site pays for every request you make. Rate
   discipline, identification, and terms awareness are not legal trivia
   bolted on at the end; they are professional obligations that shape the
   scheduler and the fetcher from the first design session.

## When to scrape — and when the job is something else

- **An API or feed exists** — use it, even when it covers only part of the
  need. Scrape only the remainder. Mixed pipelines beat pure-scrape pride.
- **The source pushes** (webhooks, subscriptions) — that is
  [webhook-ingestion](../../backend-platform/resilience/webhook-ingestion/webhook-ingestion.md), a different
  subject with a different honesty problem (delivery, not extraction).
- **The "page" is really a document you control** (uploads, exports,
  attachments) — that is import normalization, not scraping: no politeness
  problem, no shape-change adversary.
- **The server will hand out another representation of the same page** — ask
  before authoring anything. If the publisher *authored* that representation,
  this is the feed branch above and rules infrastructure is overhead. If an
  intermediary merely converted the same markup on the fly, you have bought a
  cheaper parse stage and nothing else — the shape-change adversary is
  untouched, because a derived representation is not a contract. Telling those
  two apart is
  [negotiated-representation-probe](./techniques/negotiated-representation-probe.md),
  and getting it wrong in the optimistic direction is how a detector becomes a
  blindfold.
- **One-off retrieval** — a human copy-paste or a throwaway script beats
  building rule infrastructure. This subject is about *repeated* extraction,
  where rules, datasets, and schedules earn their cost.

## Anatomy of the pipeline

Every serious scraper decomposes into the same stages, and the boundaries
matter because each stage has a different failure story:

| Stage | Job | Fails how |
| --- | --- | --- |
| **Acquire** | fetch the page — after asking what representations exist (plain fetch, or a rendering engine when content is script-assembled) | network errors, blocks, rate limits — *loud* failures; an unhonoured type preference fails *silently* |
| **Parse** | markup → traversable tree | almost never; parsers are forgiving by design, which pushes failure downstream |
| **Extract** | run the authored rules over the tree | *silently* — rules miss and produce nothing |
| **Normalize & validate** | coerce types, trim, canonicalize; reject records missing required fields | validation is the tripwire that converts silent misses into visible failures |
| **Reconcile** | merge the harvest into the dataset by identity — insert, update, tombstone | wrong identity corrupts the dataset invisibly |
| **Observe** | record what the run did, against what was expected | omitted entirely, in most amateur scrapers |

The acquire stage owns two things. The first is asking what it is being given:
a fetch that never states a preferred type has silently decided the answer,
and the type the response *declares* is the only evidence of what arrived — a
server is free to disregard the preference and answer as though none was sent
([negotiated-representation-probe](./techniques/negotiated-representation-probe.md)).
The second is legitimacy mechanics: honoring the site's published
crawl preferences, identifying the client honestly, spacing requests, backing
off on pressure signals (see [rate-limiting](../../backend-platform/resilience/rate-limiting/rate-limiting.md)
for the receiving side of that conversation, and
[retry-backoff](../../backend-platform/resilience/retry-backoff/retry-backoff.md) for retry discipline —
retrying a *block* as if it were an outage is how scrapers get banned).

The extract stage owns this subject's center of gravity: rules as authored,
validated, previewed artifacts — the
[extraction-rule-dsl](./techniques/extraction-rule-dsl.md) technique.

## Rules are data, not code

Extraction logic written as ad-hoc code grows into an unreviewable thicket —
one function per site, patched under time pressure, testable only in
production. The golden path is a **rule DSL**: each rule declares its target
field, its locator (a structural selector, a text pattern, or a pointer into
an embedded data island), its post-processing, and — non-negotiably — its
**failure semantics**: what it means when this rule matches nothing.

Rules-as-data buys the whole rest of the subject. Rules can be edited in a
form, validated at one door, previewed against a live page before saving,
diffed, versioned, generated by a model and reviewed by a human. None of that
is tractable when extraction is code.

The rule set is held in its **flat, editable form** everywhere inside the
system — the form a human edits and a preview executes — and serialized to a
wire or storage encoding only at the edges. Two representations that both
claim to be the rules are a drift race; the editable form is the authority
and the serialization is derived, at the boundary, both directions.

## The honesty law

> **A scrape that got a page-shape change must report extraction collapse —
> never zero-rows-success.**

This is the subject's load-bearing law, and it must be engineered, not
hoped for. "The site redesigned" and "the site genuinely has no listings
today" produce *identical* raw output — an HTTP success and an empty record
set — unless the pipeline carries the instruments to tell them apart:
required-field tripwires, per-rule hit counts compared against baseline,
record-count expectations from history. The
[shape-change-detection](./techniques/shape-change-detection.md) technique is
that instrument panel, and it feeds the response loop: quarantine the suspect
harvest (never reconcile it — a collapsed extraction must not tombstone half
the dataset), alert with the failed rules named, and route into re-authoring.

A freshly built detector is not yet allowed to do any of that. Between "it
judges correctly" and "its verdicts may stop a pipeline" sits a rollout the
detector usually loses — armed on day one and blamed for the first false
quarantine, or left observing forever into a table nobody reads. The
discipline that survives it is to ship judging always-on with the
*consequences* behind one flag, gate the flip on a replay of the verdicts
already recorded rather than a re-judging of history against today's
thresholds, climb a hysteretic ladder whose recovery is earned, and report a
source nobody could judge as unmonitored instead of healthy. That is
[soak-mode-and-verdict-replay](./techniques/soak-mode-and-verdict-replay.md).

## Datasets, not piles

A harvest is not the product; the **dataset** is — the accumulated, deduped,
current picture of the entities the target publishes. That requires an
identity model: which extracted fields key a record, so that scraping the
same page tomorrow *updates* yesterday's records instead of duplicating
them, and an entity's disappearance from the source is recorded as a
tombstone rather than a silent deletion. Identity, reconciliation outcomes
(insert / update / unchanged / stale), and the discipline of never
reconciling a suspect harvest live in
[dedup-and-datasets](./techniques/dedup-and-datasets.md); the general shape of
records-with-lifecycles is [entity-lifecycle](../../operations/governance-and-records/entity-lifecycle/entity-lifecycle.md).

## Repetition without recklessness

Scrapes repeat on a schedule, and the schedule is where politeness and
honesty meet: cadence no faster than the source actually changes (and never
faster than courtesy allows), one harvest in flight per target, failures
escalating to a human instead of hammering a broken or hostile target
forever. The scrape-specific layer is
[scrape-scheduling](./techniques/scrape-scheduling.md); the general machinery —
next-run computation, overlap guards, missed-run semantics — is the
[scheduling](../../backend-platform/work-execution/scheduling/scheduling.md) subject, and a scraper should ride
that machinery rather than reinvent it.

## Authoring with a model in the loop

Writing selectors by hand requires reading markup, and most page shapes are
tedious rather than hard — which makes rule authoring the rare scraping
problem where a language model genuinely helps. The discipline that keeps it
honest: the model reads the **real fetched page**, never its imagination of
one; its proposed rules are **executed against that same page** before anyone
can save them; and adopting them is an explicit **replace-or-merge** decision
by the human who owns the existing rule set. That loop is
[llm-assisted-rule-authoring](./techniques/llm-assisted-rule-authoring.md), and
its commit gate — preview extraction before persisting any rule change,
machine-authored or hand-authored — is
[dry-run-preview](./techniques/dry-run-preview.md).

## Legitimacy posture

Stated once, as obligations rather than tips:

- **Honor the crawl preferences the site publishes.** If you decide a
  specific exclusion does not apply to your access pattern, that is a
  documented human decision with a name on it — not a default.
- **Identify yourself.** A truthful client identity gives the site operator
  a way to reach you before they reach for a ban.
- **Space requests as a guest, not a peer.** Concurrency 1 per host and
  generous delays are the starting posture; anything more aggressive is
  negotiated or at least justified in writing.
- **Read the terms before scheduling, not after the letter arrives.** Terms
  may forbid automated access outright; personal data carries obligations
  that outlive the harvest. "Everyone scrapes" is not a compliance posture.
- **Take only what the pipeline uses.** Fetching what you need is a smaller
  imposition and a smaller liability than mirroring whole sites on spec.
- **The fetcher points inward too.** A scraper that fetches user-supplied
  addresses is a server-side request forgery primitive unless the client
  refuses private and internal address space at connect time. Legitimacy has
  an inbound face: the same discipline that protects the target's network
  must protect your own.

## The techniques

- [extraction-rule-dsl](./techniques/extraction-rule-dsl.md) — rules as
  authored data: locator kinds, declared failure semantics, the flat
  editable form serialized only at the edges.
- [llm-assisted-rule-authoring](./techniques/llm-assisted-rule-authoring.md) —
  the model as rule author: grounded in the real page, verified before save,
  replace-vs-merge as an explicit choice.
- [dry-run-preview](./techniques/dry-run-preview.md) — the commit gate: no
  rule change persists without a preview extraction against the live page,
  through the production engine.
- [dedup-and-datasets](./techniques/dedup-and-datasets.md) — dataset identity:
  key fields, re-scrape reconciliation (insert / update / unchanged /
  tombstone), and why suspect harvests never reconcile.
- [scrape-scheduling](./techniques/scrape-scheduling.md) — repetition with
  restraint: cadence, pause semantics, overlap, failure escalation.
- [shape-change-detection](./techniques/shape-change-detection.md) — the
  instrument panel that converts silent extraction collapse into a loud,
  named, actionable failure.
- [soak-mode-and-verdict-replay](./techniques/soak-mode-and-verdict-replay.md)
  — the detector's rollout: judging always on with consequences behind a flag,
  a rollout gate that replays stored verdicts, an earned-recovery ladder, and
  honest unmonitored states.
