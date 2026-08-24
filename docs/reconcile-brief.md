# The external-reconcile lane

The lane that earns a subject its second source. A worker takes ONE subject and ONE
world-class counterpart the subject did not come from, reads the counterpart against
the technique layer, and writes one application that cites what it found - confirming
the technique, sharpening it, or refuting the hint it was sent with. Sightings that
recur across counterparts become technique edits at two and law candidates at four.

This brief is written after the lane ran eight times against software-engineering
(2026-08-20 to 2026-08-23: 29 subjects, 13 technique edits, 3 laws, 2 upstream-
reportable bugs) from director prompts alone. The first half records the contract as
practiced, because every rule in it was paid for. The second half extends it to the six
bundles whose world-class counterpart is not always a repository.

## The contract, as practiced

**One subject, one counterpart, one application.** A worker owns one subject folder,
resolves its path from `knowledge/<bundle>/index.json`, and writes exactly one
`applications/<stack>--<technique>.md`. Cross-subject findings come back as proposals
in the worker's report; the director places them. Nothing is written outside the folder.

**Evidence first; the hint is a starting point.** The director sends a hint - "this tree
probably realizes technique X in module Y". The worker's job is to find out, and three
fates are legitimate: **confirmed** (the hint held, possibly with sub-claims sharpened),
**refuted** (the tree does something else, and the application documents that), and
**passed over** (the tree owns a fraction of the technique and binding would document
the fraction - the honest fraction is a lead, not a document).

**The pin is in prose; the citation is re-checked.** An external application carries
`verified_on` (the day the citations were resolved) and NO `verified_against` (that
field witnesses a consumer's runtime, not a foreign tree). The counterpart's name,
version and commit are stated in the body. Every cited line is re-opened before the
document ships: the lane measured about one wrong citation per ten on first draft, and
a fabricated line number is worse than a missing one.

**Executed evidence over read evidence.** Where a claim is runnable - a guard fires, a
ceiling resets, two calls race - the worker runs it and reports what happened, with the
harness named. A negative claim ("the tree has no metric here") is grep-scoped: the
command and its empty result are the evidence.

**The ceiling is 130 lines.** Past it the director trims, stopping where the next cut
would remove a finding.

**Scratch is namespaced per worker.** Two workers once collided on a generic script
name and one ran the other's; `<scratch>/worker-<subject>/` since.

**Vault notes append; they never regenerate.** A close-out once rewrote a sibling lane's
subject note. The subject note under `librarian/subjects/<bundle>/<slug>.md` gains a
dated paragraph, its open leads and its cross-subject proposals; the run note records
what landed, what was refuted, what converged and what was declined.

**Counterparts are named canonically** (`owner/repo` at `commit`, with the released
version where one is visible), and graded on the watchlist as reputed until a scan or a
worker measures them.

**The director reviews diffs, not reports.** Purity grep over any upper-layer edit, every
new application read against the technique it claims, numbers checked for their n and
date. This is what sets the ceiling near eight subjects per sitting, and the lane keeps
the ceiling rather than the throughput.

## Why six bundles need an extension

The 48 remaining single-stack subjects outside software-engineering (recruiting 14,
grant-funding 12, civic-intelligence 8, llm-observability 6, media-generation 6,
game-production 2) are, like the first 29, single-SOURCE: one forged repository's way.
The stack field was a proxy for that. Their `process` applications are not "no code" -
they cite Python pipelines and prompt pairs in the forged repos - so the application
layer works unchanged. What differs is where the world-class counterpart lives. Four
classes, in decreasing order of how much of the existing contract survives:

| class | the counterpart is | examples of the kind | contract survives |
| --- | --- | --- | --- |
| **A - repository** | a public tree | an observability platform, a civic-data scraper, a fairness toolkit, an image-generation pipeline | whole |
| **B - specification** | a published standard with a conformance artifact (schema, validator, reference implementation, or a prescribed procedure) | a beneficial-ownership data standard, a telemetry semantic convention, a selection-rate guideline, a credential interchange schema, a provenance spec for generated media | whole, with the pin and the execution redefined |
| **C - public record** | a dataset or register with a version and a query surface | a charity register, a legislature's vote archive, published bias-audit tables, grant-award data | whole, with the pin and the execution redefined, and the finding is about the technique's NUMBERS |
| **D - craft canon** | practitioner doctrine with no conformance artifact | narrative structure, rubric authoring, voice and tone | none - the lane does not run; see below |

## The evidence standard per class

**Pin.** Class A: `owner/repo` @ commit, version. Class B: publisher, document, edition or
version, section, URL, retrieval date, and a digest of the fetched document where the
format allows one. Class C: publisher, dataset, release or snapshot date, the exact query
(API call or filter), retrieval date, and the row count the query returned.

**Citation.** Class A: path and line, re-opened. Class B: section number, with the
clause paraphrased; quotation is limited to a short identifying phrase, never a passage -
a standard is copyrighted text and the application teaches the rule, not the prose.
Class C: the query and the rows that carry the claim, with n.

**Executed evidence.** Class A: run the claim. Class B: run the standard's own
conformance artifact against a fixture - a validator over a document the technique
says is well-formed and one it says is not, a reference implementation over a case, or
the prescribed procedure worked by hand over a published table with the arithmetic
shown. A standard with no artifact and no procedure is class D wearing a cover. Class C:
the query run today, its result, and the comparison the technique's number implies
("the technique's cohort floor is 30; of 412 published audit cohorts, 61 fall below it").

**Purity, unchanged.** The upper two layers still carry no product, company, agency or
standards-body name and no document title. A technique says "the regulator's published
selection-rate threshold" or "the interchange standard's identifier field"; the
application names the regulator, the standard and the section. The gate's denylist is a
floor; the test is whether an unrelated team could adopt the technique as written.

**Numbers carry their measurement**, and a class-C finding is nothing else. It never
launders upward: a published table's ratio is evidence about one population on one date,
and the technique keeps its rule.

## Instrument changes the extension needs

Three, all small, none retroactive.

1. **Two declarable stacks, `spec` and `data`.** An application realized by a
   specification clause or by a public record has no runtime; `process` would say
   "pipeline" and be wrong. The gate already lets a bundle declare extra stacks in
   its `index.md` `stacks:`; each bundle declares the ones it uses when its first such
   application lands, not before. `verified_against` is omitted, as for every external
   application.
2. **`source:` on lane applications.** Optional frontmatter, the canonical counterpart
   name (`owner/repo`, or `publisher/document@edition`, or `publisher/dataset@date`).
   The lane writes it on every application it produces from now on, including
   software-engineering. When enough carry it, the scan measures distinct SOURCES per
   subject and single-stack retires as the proxy it always was. No backfill.
3. **Accepted debts in the subject note.** A class-D subject will score single-stack
   forever, and two points of permanent noise on a flat board is exactly what the
   sweep's "dry is a result" rule exists to prevent. The subject vault note may carry
   `accepted: [single-stack]` with a dated reason; the scan reads the note already
   (`dry_streak`) and suppresses the accepted clause. The decline is written down once
   and stops being re-proposed every run.

## The consult path, designed alongside

The reflection of [2026-08-23-4](../librarian/runs/2026-08-23-4.md) measured a bundle
that was reconciled and never consulted, and it is worth nothing. So this lane does not
run on a bundle whose consult path is unknown:

- **recruiting** is consumed by `kp` (1 consult, 1 deviation witnessed);
  **game-production** by `pof` (1 consult); **llm-observability** by `personas`;
  **media-generation** by `systedo-case`. Four bundles have a consumer whose agent
  guide now carries the registry rules file and a subject map - the consult baseline is
  3 consults and 4 deviations on 2026-08-23, and the next sweep reads whether it moved.
- **civic-intelligence** and **grant-funding** have no consumer on the authoring
  device - and the operator has since confirmed consumers EXIST on other devices
  (correction of 2026-08-24; this brief first read the absence as absence).
  `librarian/projects.md` maps one machine's checkouts, so a missing row there is
  absence of a local checkout, not of a consumer. What remains true: no signals
  contributor witnesses these bundles yet, so their demand is unknown-not-zero until
  the consuming devices report. The lane may run on them; the run note says whose
  demand it is serving and that it is not yet witnessed.
- The `use_when` phrases in these bundles are already written as decision moments
  ("deciding whether a registry's negative answer should block an applicant",
  "reviewing a derived clip before publish", "red verdicts appear on runs nothing
  changed") - the routing layer does not need rewriting for non-code decisions. What
  the consult skill's description says applies: the moment is writing a rubric, a
  scorecard, a proposal section, a script, a budget line - not only designing code.

## Worker contract deltas for classes B and C

- **Fetch, do not clone.** Documents and datasets are retrieved, not checked out; the
  retrieval date is part of the pin and the worker keeps the fetched artifact in its
  scratch namespace for the director's spot-check.
- **Official artifacts only for execution.** The validator or reference implementation
  the publisher ships, at a pinned version. A third-party reimplementation is class A
  evidence about that reimplementation, not class B evidence about the standard.
- **Rate limits and terms are read first.** A register's API terms can forbid bulk
  retrieval; a worker that scrapes around them has produced evidence the registry
  cannot publish.
- **Hint fates gain a fourth:** **not conformance-testable** - the standard exists, the
  technique maps to it, and there is no artifact or procedure to execute. Recorded as a
  lead, and the subject is a class-D candidate for the accepted-debt note.
- **Everything else holds**: one subject, evidence first, citations re-opened, 130
  lines, namespaced scratch, append-only vault, director diff review.

## The 48, classified

Candidate counterparts are graded **reputed** until a worker measures one; this sitting
did not verify them and says so. A subject listed under D goes to `/deepen`'s research
lane or to an accepted-debt note - never to this lane.

**llm-observability (6, all `rust`)** - class A throughout; the consumer is connected.
Counterparts of the kind: an open-source tracing platform for LLM applications, an
OpenTelemetry-based instrumentation library, a telemetry semantic convention for
generative AI (class B, with a schema). Subjects: trace-rollup-and-attribution,
production-trace-scoring, quality-regression-gating, cross-provider-benchmark-
operations, federated-benchmark-sharing, margin-and-unit-economics.

**recruiting (14)** - mixed, the consumer is connected and has consulted.
- Class B: assessment-instrument-validation (a professional society's validation
  principles and the regulator's uniform guidelines - procedure class); bulk-adverse-
  action-governance (consumer-reporting adverse-action notice requirements);
  candidate-consent-and-retention (a data-protection regulator's recruitment guidance);
  portable-hiring-records (an HR data-interchange standard with a schema; a verifiable-
  credentials data model); regulated-credential-gating (licensing registers - also C);
  recruiting-funnel-metrics (a human-capital reporting standard's metric definitions).
- Class A: skill-adjacency-and-normalization (a public skills taxonomy with a published
  graph - A/C), silver-medalist-rediscovery and hiring-policy-defaults-and-tiering (an
  open-source applicant-tracking system - weak; may resolve to D).
- Class C: recruiter-anchored-model-evaluation and cv-authenticity-screening (published
  bias-audit tables under a municipal automated-hiring law).
- Class D: role-intake-conversation, early-career-potential-assessment.

**civic-intelligence (8, all `node`)** - the richest class B/C ground, no consumer.
beneficial-ownership-resolution (a beneficial-ownership data standard with a validator -
B; a sanctions/PEP dataset - C); conflict-of-interest-detection (the same dataset, C);
parliamentary-data-modeling and legislative-change-tracking (an open legislative-data
schema and the scrapers that feed it - A/B); roll-call-vote-analysis (a legislature's
published vote archive - C, and the open scrapers - A); state-budget-analysis (an open
fiscal-data standard with a validator - B); civic-source-adapters and civic-knowledge-
graphs (the open scraper frameworks - A).

**grant-funding (12)** - class C heavy, no consumer. nonprofit-verification (the tax
authority's exempt-organization register and a charity regulator's register API - C);
funder-intelligence-index and grant-source-landscape (foundation filings data - C);
submission-filing and funder-format-blueprints (a federal grants system's system-to-
system specification and an agency's application guide - B); grant-taxonomy-design
(a published philanthropy classification and an aid-transparency sector codelist - B);
jurisdiction-modelling (B/C); organizational-grant-readiness, proposal-quality-review,
evidence-grounded-claims, proposal-narrative-structure, coalition-and-portfolio-strategy
(D, or weak B via an agency's review criteria).

**media-generation (6)** - production-pipeline-phasing and visual-style-locking (an
open node-based generation pipeline and a diffusion library - A); platform-format-
adaptation (the platforms' published format specifications - B, procedure-only; and a
content-provenance standard with a reference implementation - B); creator-voice-and-
tone, narrative-engine-selection, short-form-narrative-structure (D).

**game-production (2)** - difficulty-design-and-adaptation (open-source strategy games
with documented difficulty systems - weak A); aaa-craft-rubric-authoring (D).

## Order of waves, and why

1. **llm-observability first.** Class A only, so the proven contract runs unchanged on
   new trees; six subjects fit one wave; a consumer is connected. If this wave's yield
   looks like the software-engineering waves, the lane generalizes across domains with
   no instrument change - that is the cheapest fact to buy first.
2. **recruiting second.** The consumer has consulted and recorded deviations; class B
   dominates, so this is the wave that proves the specification evidence standard - a
   validator run, a procedure worked over a published table - on a bundle whose value
   is already witnessed. Four subjects, not fourteen: the B-class ones with an
   executable artifact.
3. **civic-intelligence third, as the class B/C instrument pilot**, because its
   validators are the best in the corpus. Its consumers live on other devices
   (see above); the wave notes that its demand is real but unwitnessed until a
   signals contributor reports from one of them.
4. **grant-funding** after civic proves class C.
5. **media-generation and game-production**: the class-A subjects ride in any wave with
   a free slot; the class-D residue gets accepted-debt notes, not workers.

## What this sitting did not do

It dispatched nothing and verified no candidate; every counterpart above is reputed.
The instrument changes are specified, not built - `spec`/`data` declarations land with
the first application that needs them, `source:` with the next wave, accepted-debt
reading in the scan before the first class-D note is written. The first wave is a
decision for the operator, because a worker costs what a worker costs.
