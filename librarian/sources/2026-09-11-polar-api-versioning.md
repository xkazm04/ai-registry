---
source: web:polar.sh/docs/api-reference/versioning
kind: vendor primary documentation (normative reference page, the publisher's own rules for its own contract)
url: https://polar.sh/docs/api-reference/versioning
title: API Versioning - Polar
author: vendor (Polar)
words: 711
extracted: 7
accepted: 2
declined: 0
leads: 2
already_covered: 1
untriaged: 2
dispatched: 0
applied: 3
shipped: 2
run_id: intake-polar-versioning-0911
siblings: 0
rescan_when: the next quarterly release lands (first week of October 2026) and a fleet deployment logs its first "provider API contract version changed" line; or a fleet import path gains a dated contract selector, which is what turns the resolved-graph split into a live defect; or 8 weeks elapse (2026-11-06)
---

# Polar API versioning — what it changes here

**Operator framing:** a newsletter carried a versioning tag update; adjust the
billing knowledge, assess the impact on projects using this provider, and update
API calls if needed.

**Class and expected yield.** Vendor primary documentation — the publisher's own
normative rules for its own contract. Highest corroboration tier, so it can
authorize a technique alone; but 711 words of reference prose over a mechanism
the field has had for a decade, so the expected yield was stated before triage as
**low in content, high in currency and application**. That is what it returned.
One fetch of three was spent usefully; two were spent failing to establish the
live version table and are recorded as a miss below.

**Board:** 0 siblings live at claim, 0 at commit.

## The source's rules, as stated

Dated contracts (`YYYY-MM`) governing requests, responses, webhook payloads and
SDK types. Three live at a time — Current, Deprecated, Next — rotating in the
first week of January, April, July and October; each supported about nine
months. Current and Deprecated are **frozen to additive change too**: a new
optional field goes to Next. Requests pin with a `Polar-Version` header;
omitting it means Current, and an unknown or removed version is a `404`, not a
fallback. Webhook endpoints version **independently**, set at endpoint creation
via `api_version`, and an event keeps the version it was created under, so a
redelivery reproduces its original contract. SDKs carry the contract in the
**import path**, separate from the package version.

## The fleet impact, which is the run's real finding

Instrument: per-project `git grep` across the twelve fleet trees, filtered from
the word "polar" (124 raw hits in one tree alone, mostly "polarity") to the
vendor itself. Asserted against a control term first, and the raw counts were
read rather than trusted — three of the twelve raw hits were the wrong "polar".

Three real consumers, and **none of them named a contract version anywhere**:

| Project | Role | Pinned? | Exposure |
| --- | --- | --- | --- |
| kp | raw REST client + webhook consumer + endpoint registrar | no, at 4 boundaries | requests and payloads both follow Current |
| ascent | SDK client + framework webhook adapter | no, root import, no `api_version` | same, plus a split resolved graph |
| tracklight | pure webhook consumer, makes no API calls | cannot pin — has no request | contract chosen in *other repositories* |

The structural fact worth keeping is tracklight's, and nobody designed it.
`RevenueEvent` carries `fx_book_version` — provenance for the rate book the
operator maintains — and has **no field for the provider's contract version**.
Provenance discipline was applied thoroughly and stopped precisely at the
boundary of what the operator controls. That asymmetry is the corpus's own
asymmetry standing in code: the golden path versioned the FX book and never the
contract.

The second structural fact is ascent's. The provider pins contracts by **import
path**, and ascent reaches the client two ways — directly, and through the
framework adapter, which writes its own specifier. Declared: one revision.
Resolved: two revisions across three copies. Ascent can pin its own reference
and cannot reach the adapter's.

## Triage

Expected yield stated above. Upper-layer rows scored under the v2.5 gate;
currency and application rows admitted under the corroboration table
(a primary fetched in-run, and trees actually opened).

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Contract version is provenance | llmo/billing-revenue-normalization | new-technique | real gap | 3/0/2 | **accept** |
| 2 | K | amendment | M | A versioned address binds strangers | se/dependency-declaration `logical-name-or-address` | new-technique (boundary) | partial → real gap | 3/0/2 | **accept** |
| 3 | K | amendment | M | Additive is unsafe for generated clients | se/repo-manifest-standard `semver-additive-evolution` | corrects-claim | partial | 2/1/2 | **untriaged** |
| 4 | X | application | M | Pin and record in kp | — | fills-stack-gap | real gap | — | accept (opened tree) |
| 5 | X | application | M | Resolved-graph split in ascent | — | fills-stack-gap | real gap | — | accept (opened tree) |
| 6 | X | application | S | The asymmetry in tracklight | — | fills-stack-gap | real gap | — | accept (opened tree) |
| 7 | K | currency | S | Finite 9-month support window | llmo/billing-revenue-normalization | resets-clock | — | — | accept (corroboration table) |

`auto=2/1/0`, `fp=0`.

**Row 1 — accepted.** The subject is thorough from stage two of its own stated
pipeline onward (authenticate, identify, normalize, persist) and never asks under
which contract version the payload was serialized. Its closing enumeration is an
auditor's question answered "entirely from the records themselves", listing
provider, business object, currency, magnitude, kind, and the rate-book version —
a completeness claim with a hole. Two independent spellings of the concept
("webhook" ∩ "api version"; "date-based / calendar versioning") returned **zero**
across all 458 subjects, and the home subject was read in full rather than mapped.

**Row 2 — promoted by its promoting question.** The technique's discriminator is
purview, and it already models divergent bindings and "an address into somebody
else's internals". What it assumes, in the sentence "an address here is a
constraint being expressed — this reference is not yours to rebind", is that the
constrained party is the one who wrote the reference. A publisher encoding a
contract version in the address propagates the constraint to transitive consumers
who never wrote it and cannot satisfy it. The file's own rule survives, so the
shape is an amendment rather than a competing technique.

**Row 3 — untriaged, and the gate did real work here.** The source's rule that
even a new optional field is breaking within a frozen version genuinely inverts
`semver-additive-evolution`'s "a new optional field → minor". The discriminator is
the reader population: the corpus technique's additive rule rests on must-ignore
readers, and `must-ignore-unknown` already qualifies that for *restrictive* fields
("only the roster of readers is" an answer). A **generated typed client** is a
third case its two-way split does not contain — an additive descriptive field that
does not degrade gracefully, because the reader's type surface is derived rather
than written. Real, but the home is contested between two techniques and the
subject is a *repo manifest*, whose readers are surveyable where this publisher's
are not. Banked with anchors: `semver-additive-evolution` lines 33-40 (the additive
list), `must-ignore-unknown` "The one case where ignoring INVERTS the author's
intent". Return condition: a second source showing a publisher freezing a stable
contract against generated clients.

**Untriaged, row 8.** "A removed version returns 404 rather than degrading" — a
fail-closed decision on an unknown contract selector. Folded into row 1's
"Absent is not current" section as a decision rule rather than banked separately,
so it is recorded here only to stop a later run re-deriving it as its own finding.

**Already covered (1).** Independent versioning of the webhook stream from the
request stream, so redelivery is stable, is the design decision the source is
proudest of — and this subject's "The delivery is not the event" already owns the
general rule that a redelivery must reproduce its original fact. The source adds
the version dimension, which row 1 carries; the redelivery invariant itself is a
catch.

## Landed

- **Technique** `contract-version-is-provenance` in
  `llm-observability/economics-and-governance/billing-revenue-normalization`,
  wired both ways, with the golden path extended additively (the enumeration
  gained the missing clause rather than being rewritten).
- **Amendment** to `logical-name-or-address` in
  `software-engineering/engineering-process/codebase-stewardship/dependency-declaration`
  — "When the address encodes a version, the constraint lands on strangers".
- **Three applications**: `node--contract-version-is-provenance` (kp, code,
  better), `rust--contract-version-is-provenance` (tracklight, structural-only,
  unmeasurable), `node--logical-name-or-address` (ascent, experiment, better).

## Shipped

Two project commits, neither pushed.

- **kp `4d373026`** on `main` — `POLAR_API_VERSION` sends `Polar-Version` through
  one header builder across all three outbound calls; the version the provider
  reports is recorded and logged on change; the normalized event carries the
  contract the delivery declared. Paired against the pre-change code with the
  same test file: 0/7 → 7/7, 67/67 billing tests, typecheck green. Plus
  `d17c1c73` for the applied row.
- **ascent `05e98064`** on its active branch — `scripts/check-contract-duplication.mjs`,
  a paired declaration-vs-resolved report with a control family. Plus `f0faaa4b`.

**The pin itself was deliberately not made.** No value was safe to choose: an
unknown or removed version is a 404 on every billing call rather than a
degradation, and the run could not establish the live version table (see below).
Recording the observed version is the prerequisite, and it is what shipped.

## Leads

- **The live version table was not established, and this is the run's own miss.**
  Two of three fetches went to it. The changelog page returned no version
  information at all; the API reference introduction showed `2026-04` in its SDK
  import examples while the versioning page's own example uses `2026-10`. The
  lifecycle implies Current ≈ `2026-07` at this date, but that is arithmetic, not
  an observation, and pinning on arithmetic is exactly the guess this run refused
  to make. **Return condition:** the first `[billing:polar] provider API contract
  version observed: …` line from any fleet deployment — the change shipped today
  is what produces it.
- **The installed SDK does not expose the documented pinning form.** ascent's
  `@polar-sh/sdk@0.48.1` declares exports `.`, `./package.json`, `./*.js`, `./*`
  and contains no dated subdirectory, so the documented `@polar-sh/sdk/2026-10`
  import resolves to nothing at the version actually installed. Either the dated
  clients arrive in a later package release or the doc is ahead of the SDK.
  **Return condition:** a `@polar-sh/sdk` release whose exports map carries a
  dated subpath.

## Method notes

- **The seam hunt was the second source again**, for the fourth consecutive run.
  The source states a mechanism; tracklight's `fx_book_version`-without-a-contract-version
  is what made it a technique rather than a restatement, and ascent's three copies
  are what promoted row 2. Neither is in the document.
- **The falsifying seam paid, and the pre-check mattered.** For kp the tempting
  arm was "does the header get sent" — a confirmation. The arm that could refuse
  the change was the control: *unpinned must be byte-identical to before*. A
  caught outcome there would have meant the retrofit moves every live
  deployment's contract on deploy, which would have blocked the ship and owed
  the technique a boundary. It held, and the change is safe for a reason that is
  now written down.
- **The gate's threshold did work.** Row 3 is a real finding that did not clear
  +2 on a contested home, and banking it cost nothing.
