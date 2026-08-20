---
layer: application
type: application
subject: llm-price-book-operations
technique: no-retroactive-repricing
stack: process
status: forged
refresh_by: 2026-11-20
verified_on: 2026-08-20
---

# The book-maintenance runbook in LightTrack (process)

LightTrack operates its price book as a small, explicit maintenance loop, and
the temporal rule sits at the loop's center — written into the product where
cap behavior is explained, not buried in a design doc.

## The loop

1. **Seed once.** `config/pricing.json` seeds the empty `model_prices` table
   at first boot. Its `_meta` block (`config/pricing.json:2-12`) is the
   book-level provenance the standard requires: `currency: USD`, `unit:
   per_million_tokens`, `last_verified: 2026-05-31`, the three provider
   pricing pages as `sources`, and the declared non-coverage caveat verbatim —
   "Some models … have prompt-length-tiered pricing and batch/flex tiers not
   modeled here — the standard, <=200k-prompt rate is used. Verify before
   trusting cost dashboards." If the file is missing or malformed, the
   compiled-in copy takes over and the boot log reports which seed won
   (`crates/api/src/prices.rs:19-48`) — including the incident-grade rationale
   in the source comment: without the fallback, a binary-only install "seeds
   an empty book and prices every event at `null`, silently, which is
   indistinguishable from 'this model is free'". Two build-time tests
   (`prices.rs:54-70`) keep the embedded copy parsing and non-empty.

2. **Correct through the one door.** Price changes go through
   `PUT /v1/prices/:provider/:model` (`prices.rs:93-121`), admin-gated
   (`ensure_can_admin`), with `effective_date` stamped `Utc::now()`
   server-side (`:106`) — the operator supplies rates and an optional
   `source_url`, never the date. Variant rows (tiers, lanes) go through the
   same endpoint with the modifier URL-encoded (`docs/PRICING.md:33-43`). The
   handler then re-reads all rows and swaps the in-memory book behind a write
   lock (`:113-119`), so the correction is live for the next ingested event
   with no restart.

3. **Know what the correction did — and did not do.** The operator-facing
   semantics live in the cap-evaluation response itself: every limits
   evaluation ships `cost_basis` notes (`crates/api/src/limits.rs:250-259`),
   including the technique's caveat verbatim:

   > "There is no repricing of history: an event's `cost_usd` is stamped once
   > at ingest, so correcting a WRONG price-book entry does not restate spend
   > already inside a window. The cap stays wrong until the window rolls.
   > Only *unpriced* traffic self-corrects, because its charge is imputed at
   > evaluation time."

   The two companion notes state the asymmetry's other half: unpriced calls
   are charged against cost caps at the window's mean priced-call cost,
   reported per rule in `cost_evidence`, "never written onto the event"; and
   an enforcing cost cap whose window holds no priced call at all is
   unpriceable and refuses ingest rather than reading absence as zero
   headroom.

## Why this is the technique realized as process

The runbook's answer to "we shipped a wrong rate" is fully determined by the
temporal rule: fix the row now (hot swap makes speed cheap), expect stamped
history to stay put, expect the affected windows to stay wrong until they
roll, and expect any *unpriced* backlog for that model to self-correct on the
next evaluation. Nothing in the flow offers a backfill, and the caveat riding
in the API response means the operator learns the semantics at the moment
they would otherwise be confused by them — disclosure in the payload, not the
manual.

## What the field adds to the caveat (dated, checked 2026-08-20)

The `_meta` non-coverage line is doing more work in 2026 than when it was
transcribed, because provider pricing grew a third axis beyond lane and
length tier — the token-class map (re-verify by the frontmatter date):

- **Anthropic** prices cache *writes* at a premium over base input, tiered by
  cache TTL — 1.25× for the 5-minute tier, 2× for the 1-hour tier — and
  reports the write volume under TTL-specific usage keys; cache reads bill at
  ~0.1×.
- **OpenAI** discounts cached input automatically (roughly 50–90% off
  depending on model), with no write premium and no storage line.
- **Google Gemini's** explicit context caching bills cached tokens at about a
  quarter of the input rate **plus a non-token line: storage per million
  token-hours held** — a charge no token multiplication can produce.

For this runbook the consequence is sharpened by the temporal rule itself:
a book keyed only model×lane×tier under-prices cache-write-heavy and
cache-holding traffic, and because cost is stamped once, every day the
caveat understates that is a day of *permanently* under-stamped history. The
monthly re-verification pass therefore checks the class map and its TTL
tiers, not just headline input/output rates — and the caveat names unmodeled
classes with the same candor it names unmodeled tiers.

## Upward lessons this repo taught the standard

Two moves here were absorbed into the technique layer rather than merely
confirmed by it: (a) the stamped-vs-imputed asymmetry as a *stated principle*
("a measurement, once made, is frozen; an estimate is recomputed") — the repo
had it as behavior plus a caveat string; and (b) shipping the no-restatement
caveat inside the evaluation response itself, which turns a documentation
duty into a payload property.
