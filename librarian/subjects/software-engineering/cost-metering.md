---
subject: cost-metering
domain: software-engineering
last_touched: 2026-09-29
touched_by: intake
dry_streak: 0
---

# cost-metering

First touch: [[2026-08-23-2]], external reconcile against
`openmeterio/openmeter` @ `7e57a39`. Gained `go--spend-attribution`
(uncovered); single-stack debt cleared. Hint confirmed; price-tables proven
out-of-scope by grep (rating lives in the billing layer).

## Open leads (banked, convergence rule applies)

- THE AMENDMENT CANDIDATE: attribution axes can resolve at query time from
  stored raw payloads (JSON_VALUE over the event body), applying new axes
  retroactively. The obligation moves from "enumerate the axes" to "emit
  every property you might ever group by, and never truncate the payload" -
  a cheaper, strictly weaker precondition than the technique states.
- Refuse the ambiguous response: reject a query whose result would carry no
  label distinguishing merged groups.
- The uniqueness constraint as the identity mechanism - enforce
  axis-value-to-entity mapping in the store, so double counting is
  impossible rather than discouraged.
- A declared axis floor implemented as a query CLAMP (EventFrom).
- Deviation leads: dedupe off by default with no metrics in the dedupe
  package (absent-guard confirming sighting); missing group-by flattened to
  "" while the read model has the nullable slot the write model refuses
  (unknown-is-not-a-value confirming sighting); a dead uniqueness check
  (seen reallocated inside the loop) - upstream-reportable.

## Cross-subject proposals

- The at-least-once persist-commit-dedupe ordering with its declared
  duplicate-acceptance trade -> a better usage-ledgers exemplar than the
  rust application's log-and-swallow; and the declared stance must come with
  a counted metric.
- "Refuse a labelless aggregate" generalizes beyond money -> metrics-rollups.

## 2026-08-30 - intake ([[2026-08-30-headlong-agent-microharness]])

Gained `engagement-paced-cadence` - the stage upstream of every gate the subject
already had: how often a continuously self-driven loop wakes at all. Reactivity
never throttled; spontaneity descends exponentially with dwell to a settled cap
(never sleeping); wakes classified by output, with the paid-for correction that
a ruminating loop must not score its rumination as work, and the loop's own
outputs never count as engagement. Applied to a managed tree as a simulation,
verdict better: the tree already emits the exact wake-classification predicate
(declared silence vs. briefing) and consumes it only for report-or-absorb -
the cheap-probe second lever is reachable with no scheduler change.

## 2026-09-02 - intake ([[2026-09-02-gemini-3-8-flash]])

`price-tables` gained two boundary cases from a vendor release announcement,
both corroborated in fleet code rather than by the post.

**A published end date is not staleness.** The dated bullet answers "may have
moved without anyone noticing"; a promotional rate with a published expiry is
*certain* to move on a date you already hold, and the two want opposite
handling - a re-check cadence versus an alarm. The fleet supplied the
discriminator by disagreeing with itself, in prose, unprompted, in opposite
directions: one project books the introductory rate because its figure is shown
as current spend, another books the standard rate because its figure feeds
cross-model comparison and a promo rate would flip the ranking back when it
lapses. Both are right, so the rule is **what the number is for**, written next
to it. The mechanism that carries the date is a test that throws on the expiry
with the replacement rate in its message - a clock in the suite rather than a
date dimension in a pure lookup, and that trade is stated. A later model
shipping onto the same promotion inherits the original expiry, so the guard
covers the rows on the schedule, not the row.

**A computed key follows a rename; its value does not.** The strongest finding
of the run and a negative one, found in a tree that had built the guard it
defeats. Rate rows keyed by the constant naming the current model, with a test
asserting every selectable model has a row - a join the repo itself calls
"CHECKED, not conventional". A version bump moved the key automatically, the
assertion stayed green, and the rate underneath still described the previous
model: a tenfold understatement behind a passing test, with no unpriced row and
no warning. **An existence check over a computed key proves a row exists for
the current model, never that the row is that model's**; the two claims are
indistinguishable in the assertion and diverge the moment the constant moves.

Applied `code`, ab-paired, verdict better across two projects: A (move the
constant alone) fails the shipped-defaults guard in one and the pin gate in the
other; B green both sides. Recorded because it is the useful half: A did *not*
fail the completeness test that the computed-key defect lives behind.

New application `node--price-tables`. The subject's open edge is that neither
table can see what actually moved - a successor at the same rate spending more
tokens - which is metering's job, not the table's.

## 2026-09-04 — intake, `unit-classes-are-open`

From a vendor release announcement of an agentic video mode
([[2026-09-04-agentic-video-understanding]]). Landed one technique on the
**unit axis**, which this subject had left undefended while defending the two
axes beside it.

The shape worth remembering, because it is the reason this was a technique and
not an amendment: `price-tables` defends the **model** axis and `usage-ledgers`
defends the **spend-class** axis, both with the same pattern — a lookup that
can miss, and a loud declared behaviour when it does. The **unit** axis has
neither and *cannot use that pattern*: an unknown model is a lookup miss
something can count; an unknown unit class is never looked up, so it fails to
a slightly smaller number instead of to a counter. The golden path already
named the danger ("unit classes a local table cannot see") and spent it only
on "trust the meter" — mentioned in one place, defended in another.

**The corpus was corrected by a consumer here.** `tracklight` stores
`cost_usd = NULL` for an unpriceable call rather than a conservative declared
default, ranks the unpriced pairs by traffic, and tells the operator every
number over the window is a *floor* until priced. That is stronger than
`price-tables`' declared-default rule, because a default invents a number and
a floor states a bound. The new technique carries the tree's version. **A
later pass should ask whether `price-tables` itself should move from
default-plus-counter to null-plus-floor on the model axis too** — this run did
not touch it, because one tree is not convergence.

Gained `rust--unit-classes-are-open` (applied `experiment`, verdict `better`,
proof `ab-paired`: 2,000 tokens reported against 157,000 in the payload).

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923), L144 AMEND + APPLICATION. **Correction** to `budget-enforcement`: "one chokepoint, the client wrapper" holds for a model-call unit; a product-action unit reserves before the first streamed byte, so the door is a gate module every route imports, and a streaming twin of a route is a third path class where enumeration fails.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): personas-web 1, ascent 3.

## 2026-09-29 - intake PilotDeck ([[2026-09-29-pilotdeck-agent-os]], run `in-pd-0929`)

Landed `whole-prompt-denominator`, found live twice in the fleet before it was written: an LLM-cost
service whose three client extractors ignored the convention stated on its own receiving type (the
fixture pinned the bug), and a product's mirror of the same events. Both fixed and paired
(`rust--whole-prompt-denominator`, `node--whole-prompt-denominator--ascent`, code, better); the source
tree's router divides by the uncached remainder and clamps to one (`node--whole-prompt-denominator`,
executed across eight fractions). Residuals kept: cache-write tokens bill at the input rate until a
price book carries a write rate; the OTLP ingest path was not audited. Banked lead: a counterfactual
saving assumes the baseline used the same tokens.

## 2026-10-14 - intake docker-agent ([[2026-10-14-docker-docker-agent]], run `intake-dockeragent-1014`)

Landed three techniques the golden path did not have, all at stages the enumeration of spend paths skipped: `one-pot-across-delegation` (a per-run ceiling belongs to the run; delegated and nested runs charge the parent's tracker, named ceilings are shared pots), `time-ceilings-count-working-time` (a duration ceiling sums work, not attendance; boundary-checked, with a stated overshoot), `housekeeping-calls-obey-the-ceiling` (the summarizer is a spend path; refusal is a skip). Three Go applications against the source tree. **Boundary to review:** `time-ceilings-count-working-time` narrows the interactive "proceed anyway" in `budget-enforcement` for a ceiling the operator declared in their own configuration; the older sentence was bounded, not reversed. Catch: unpriced spend flagged rather than zero is already `price-tables`. Fleet: personas shares one pot by run id for cycles and replays, but its breeding measurement phase has its own ceiling and the generation phase none (simulation, unmeasurable).

## Architecture review - 2026-10-31

First architecture review, against `a2ac51c1c`. All 29 documents read. The
subject is sound; five clarify items are verifiable this run. The golden path
never listed `whole-prompt-denominator`. Two technique claims are stale or too
broad against current vendor documentation: the input/output price split
(now 4x to 8x) and reasoning tokens as always nested in output (one vendor
reports them beside output). The OpenMeter lead banked on 2026-08-23
(query-time axes from a verbatim payload) is confirmed against the pinned
source and becomes a scoped exception to "write time or never". The
price-tables default-versus-floor question raised on 2026-09-04 stays open.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/cost-metering",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:7247db31eb8f3dce",
  "disposition": "clarify",
  "coverage": "All 29 documents read in full (golden path, 13 techniques, 15 applications). Primary sources checked this run: two vendor price pages, one vendor prompt-caching page, one vendor reasoning guide, one vendor thinking guide and usage-metadata reference, docker/docker-agent at f412343dc305 (all quoted anchors), openmeterio/openmeter at 7e57a39 (main anchors). Application arithmetic recomputed. Not evaluated: private consumer trees and any runtime.",
  "counterexamples": [
    "A ledger that stores the raw event body verbatim can attribute history to an axis defined later, so \"write time or never\" holds only for properties never emitted.",
    "One vendor reports thinking tokens beside output tokens and bills them at the output rate, so an extractor that treats reasoning as nested inside output under-counts output there.",
    "A provider that charges nothing for cache writes makes a write premium a per-provider rate, not a universal one.",
    "Current input/output price ratios run 4x to 8x, so a table check expecting 3x to 5x would flag correct rows."
  ],
  "sources": [
    {
      "url": "https://developers.openai.com/api/docs/pricing",
      "result": "Read 2026-10-31: output:input ratios 4x (gpt-4.1 family), 5x-6x (gpt-5.4 to gpt-6), 8x (gpt-5, gpt-5.1, gpt-5.2). Supports 4-8x over 3-5x."
    },
    {
      "url": "https://ai.google.dev/gemini-api/docs/pricing",
      "result": "Read 2026-10-31: Pro tiers carry a 200k threshold with input doubling (1.25 to 2.50; 2.00 to 4.00); \"output prices include thinking tokens\"; Flash 3.6/3.8 at 0.75/3.75 through Dec 31, 2026 and 1.50/7.50 from Jan 1, 2027, matching node--price-tables."
    },
    {
      "url": "https://ai.google.dev/gemini-api/docs/thinking",
      "result": "Read 2026-10-31: example reports total_output_tokens 171 and total_thought_tokens 297 separately; \"response pricing is the sum of output tokens and thinking tokens\". Refutes the universal \"counted inside output\" boundary."
    },
    {
      "url": "https://ai.google.dev/api/generate-content",
      "result": "Read 2026-10-31: promptTokenCount includes cached content; candidatesTokenCount, thoughtsTokenCount and toolUsePromptTokenCount are separate fields."
    },
    {
      "url": "https://developers.openai.com/api/docs/guides/reasoning",
      "result": "Read 2026-10-31: reasoning tokens \"billed as output tokens\"; example nests reasoning_tokens under output_tokens_details with total = input + output."
    },
    {
      "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-caching",
      "result": "Read 2026-10-31: \"Cache write tokens with a 5-minute TTL are 1.25 times the base input tokens price\", 1-hour 2x, reads 0.1x (some models lower); input_tokens are \"tokens after the last cache breakpoint\" and total_input_tokens = cache_read + cache_creation + input. Confirms the remainder convention."
    },
    {
      "url": "https://github.com/docker/docker-agent/tree/f412343dc305",
      "result": "Raw files re-read: every quoted line in the three go applications matches at the cited line numbers; go.mod go 1.27, toolchain go1.27.2."
    },
    {
      "url": "https://github.com/openmeterio/openmeter/tree/7e57a39",
      "result": "Raw files re-read: JSON_VALUE group-by over the data column and the EventFrom clamp in meter_query.go; five-field validation; empty-string default in parse.go; ambiguity refusals; dedupe key and defaults. Supports the spend-attribution clarify."
    }
  ],
  "documents": {
    "cost-metering.md": {
      "disposition": "clarify",
      "reason": "Three changes owed. (1) whole-prompt-denominator is in the frontmatter techniques list but missing from 'The techniques' list and from the prose. (2) 'often by an order of magnitude' for the input/output price split overstates current sheets (4x to 8x). (3) 'attribution axes are captured when the row is written or never' needs the raw-record exception the go application reports: a ledger that keeps the raw call record verbatim can project a property present in it into a new axis at query time."
    },
    "techniques/price-tables.md": {
      "disposition": "clarify",
      "reason": "Two items. (1) 'routinely differing by 3-5x' is stale: current published sheets read 4x to 8x (one vendor 4x/5x/6x/8x by family, another 5x to about 8.3x). (2) Still owed, not applicable here: the unknown-model rule says a declared default is 'exactly one defensible answer', while unit-classes-are-open and rust--unit-classes-are-open argue null-plus-floor is stronger. The 2026-09-04 note banked this as one tree, not convergence; it needs a decision, not a source."
    },
    "techniques/preflight-estimation.md": {
      "disposition": "keep",
      "reason": "Call-class scoping, the declared output assumption and the calibration loop are sound and consistent with price-tables and usage-ledgers."
    },
    "techniques/usage-ledgers.md": {
      "disposition": "keep",
      "reason": "Failure rows, unknown-at-every-hop, one period owner with the window returned, and the two deletion rules are internally consistent and match the rust application."
    },
    "techniques/budget-enforcement.md": {
      "disposition": "keep",
      "reason": "The product-action chokepoint, twin entry points, guard ordering and refund enumeration are sound. The interactive override is narrowed by time-ceilings-count-working-time for operator-declared ceilings; that technique states the narrowing explicitly, so no edit here."
    },
    "techniques/engagement-paced-cadence.md": {
      "disposition": "keep",
      "reason": "Reactivity/spontaneity split, dwell-and-cap schedule, wake classification and failed-wake recording are coherent; single-source intake, stated as such."
    },
    "techniques/reversible-debit-and-settle.md": {
      "disposition": "keep",
      "reason": "Handle, arm/settle ordering, kept-floor arithmetic and the closed-attempt walk are coherent and match the node application clause for clause."
    },
    "techniques/spend-attribution.md": {
      "disposition": "clarify",
      "reason": "'the first million untagged rows are unattributable forever' is too strong. OpenMeter at 7e57a39 (re-read this run) stores the event body verbatim and compiles group-by axes to JSON_VALUE over it at read time, clamped by EventFrom; a property present in the raw record is attributable later. State the exception and the obligation it moves to."
    },
    "techniques/spend-observability.md": {
      "disposition": "keep",
      "reason": "Reading order, anomaly list and self-instrumentation are coherent with the sibling techniques."
    },
    "techniques/unit-classes-are-open.md": {
      "disposition": "keep",
      "reason": "Nest-or-residual and floor propagation are sound. 'close to an order of magnitude' fits the 4x-8x direction split. The tool-use prompt counter one vendor's usage metadata lists separately is a further instance of an open class."
    },
    "techniques/whole-prompt-denominator.md": {
      "disposition": "clarify",
      "reason": "Two items. (1) Boundaries says reasoning tokens are counted inside output by providers, so never added. True for one vendor (usage example: output_tokens 1186 with reasoning_tokens 1024 nested, total = input + output) but not another, whose thinking guide reports thought tokens beside output tokens with total = input + output + thoughts and whose price sheet says output prices include thinking tokens. (2) Rule 4 says 'Providers price a write above a plain input token'; one documents 1.25x (5-minute) and 2x (1-hour) write multipliers, but not every provider bills a write at all."
    },
    "techniques/one-pot-across-delegation.md": {
      "disposition": "keep",
      "reason": "The root-only tracker, walk-up charge, named shared pots and stated non-durability are coherent; the go application confirms each against the source."
    },
    "techniques/time-ceilings-count-working-time.md": {
      "disposition": "keep",
      "reason": "Working-time accumulator, boundary check with stated overshoot, terminal stop for an operator-declared ceiling and saturating counters, all confirmed in the source documentation re-read this run."
    },
    "techniques/housekeeping-calls-obey-the-ceiling.md": {
      "disposition": "keep",
      "reason": "Check-before/charge-after, skip as a named outcome and the nested stop signal as control are coherent and confirmed against the source re-read this run."
    },
    "applications/next--budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Internally consistent product-action chokepoint account; the private tree at aff9991a was not reopened."
    },
    "applications/go--one-pot-across-delegation.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 this run (loop.go:272,277; session_compaction.go:365; budget.go:35,345; budget docs :74,:97-100; go.mod go 1.27)."
    },
    "applications/go--time-ceilings-count-working-time.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 (loop.go:817,981; budget.go:102,216; docs :103,:121,:189)."
    },
    "applications/go--housekeeping-calls-obey-the-ceiling.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 (native_compaction.go:107-109,128; session_compaction.go:128,375; docs :84)."
    },
    "applications/node--whole-prompt-denominator.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: 50/50 stay = 0.75 + 0.075 = 0.825 vs 0.30 (2.75x); break-even 15 - 13.5f = 3 gives f = 0.889; table rows consistent. The tree at ae87280a was not reopened."
    },
    "applications/node--whole-prompt-denominator--ascent.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: input 3e-6, cached 0.3e-6, output 1.5e-5, write premium 1500 x 0.75e-6 = 0.001125; 48.0% / 89.7% / equal-to-rounding all hold. Private tree not reopened."
    },
    "applications/rust--whole-prompt-denominator.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed (0.0052644 / 0.0098364 = -46.5%); the remainder convention matches the vendor prompt-caching docs (total = read + creation + input). Private tree not reopened."
    },
    "applications/rust--unit-classes-are-open.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (2,000 of 157,000 = 98.7% under-report; 88-66 = 22-point spread); vendor release figures and the private tree not reopened."
    },
    "applications/rust--budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Honest hole inventory; private tree cited at line level was not reopened and no runtime witness exists."
    },
    "applications/node--price-tables.md": {
      "disposition": "clarify",
      "reason": "'Three tables in this fleet had to decide ... they did not agree' is followed by two bullets; the third table is never shown. The promotional figures match the vendor price page re-read this run (0.75/3.75 through 2026-12-31, 1.50/7.50 from 2027-01-01). Private trees not reopened, so verified_on stays."
    },
    "applications/node--budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Detailed and self-consistent; the private tree at d74adc8 was not reopened."
    },
    "applications/rust--usage-ledgers.md": {
      "disposition": "reverify",
      "reason": "Clear failure-row and counter-example account; private tree not reopened."
    },
    "applications/node--reversible-debit-and-settle.md": {
      "disposition": "reverify",
      "reason": "kept = floor(7 x 2 / 3) = 4, refund 3, sums to 7 as stated; private tree not reopened."
    },
    "applications/node--engagement-paced-cadence.md": {
      "disposition": "reverify",
      "reason": "Simulation-strength verdict stated as such; private tree not reopened."
    },
    "applications/go--spend-attribution.md": {
      "disposition": "keep",
      "reason": "Re-read at 7e57a39 this run: meter_query.go JSON_VALUE group-by and EventFrom clamp, serializer five-field check, parse.go empty-string default, query_params ambiguity refusals, dedupe key namespace-source-id, sink dedupe defaults false/24h. Sink, customer and adapter anchors not all reopened, so verified_on stays."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the five clarify items the record above names, against `054d74837`, each
from a source opened this run or a verified internal inconsistency. The three
docker-agent applications had every quoted anchor re-read, so their
`verified_on` moved to 2026-10-31. The price-tables default-versus-floor
question stays owed. Private application trees were not reopened and keep
`reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/cost-metering",
  "date": "2026-10-31",
  "baseline": "054d74837",
  "digest": "sha256-b2:91fbaddc26169fa6",
  "disposition": "reverify",
  "coverage": "All 29 documents decided. The five applicable clarify items from the first 2026-10-31 record were applied and the edited passages re-read; other documents are byte-unchanged and keep their dispositions. Still owed: price-tables default-versus-floor decision. Private application trees were not reopened.",
  "counterexamples": [
    "A ledger that stores the raw event body verbatim can attribute history to an axis defined later, so \"write time or never\" holds only for properties never emitted.",
    "One vendor reports thinking tokens beside output tokens and bills them at the output rate, so an extractor that treats reasoning as nested inside output under-counts output there.",
    "A provider that charges nothing for cache writes makes a write premium a per-provider rate, not a universal one.",
    "Current input/output price ratios run 4x to 8x, so a table check expecting 3x to 5x would flag correct rows."
  ],
  "sources": [
    {
      "url": "https://developers.openai.com/api/docs/pricing",
      "result": "Read 2026-10-31: output:input ratios 4x (gpt-4.1 family), 5x-6x (gpt-5.4 to gpt-6), 8x (gpt-5, gpt-5.1, gpt-5.2). Supports 4-8x over 3-5x."
    },
    {
      "url": "https://ai.google.dev/gemini-api/docs/pricing",
      "result": "Read 2026-10-31: Pro tiers carry a 200k threshold with input doubling (1.25 to 2.50; 2.00 to 4.00); \"output prices include thinking tokens\"; Flash 3.6/3.8 at 0.75/3.75 through Dec 31, 2026 and 1.50/7.50 from Jan 1, 2027, matching node--price-tables."
    },
    {
      "url": "https://ai.google.dev/gemini-api/docs/thinking",
      "result": "Read 2026-10-31: example reports total_output_tokens 171 and total_thought_tokens 297 separately; \"response pricing is the sum of output tokens and thinking tokens\". Refutes the universal \"counted inside output\" boundary."
    },
    {
      "url": "https://ai.google.dev/api/generate-content",
      "result": "Read 2026-10-31: promptTokenCount includes cached content; candidatesTokenCount, thoughtsTokenCount and toolUsePromptTokenCount are separate fields."
    },
    {
      "url": "https://developers.openai.com/api/docs/guides/reasoning",
      "result": "Read 2026-10-31: reasoning tokens \"billed as output tokens\"; example nests reasoning_tokens under output_tokens_details with total = input + output."
    },
    {
      "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-caching",
      "result": "Read 2026-10-31: \"Cache write tokens with a 5-minute TTL are 1.25 times the base input tokens price\", 1-hour 2x, reads 0.1x (some models lower); input_tokens are \"tokens after the last cache breakpoint\" and total_input_tokens = cache_read + cache_creation + input. Confirms the remainder convention."
    },
    {
      "url": "https://github.com/docker/docker-agent/tree/f412343dc305",
      "result": "Raw files re-read: every quoted line in the three go applications matches at the cited line numbers; go.mod go 1.27, toolchain go1.27.2."
    },
    {
      "url": "https://github.com/openmeterio/openmeter/tree/7e57a39",
      "result": "Raw files re-read: JSON_VALUE group-by over the data column and the EventFrom clamp in meter_query.go; five-field validation; empty-string default in parse.go; ambiguity refusals; dedupe key and defaults. Supports the spend-attribution clarify."
    }
  ],
  "documents": {
    "cost-metering.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the whole-prompt-denominator entry to 'The techniques'; 'often by an order of magnitude' now reads 'often by close to an order of magnitude'; the attribution paragraph now states the raw-record exception (a property present in a verbatim-kept record can become an axis at query time, so the obligation moves to emitting every property and never truncating)."
    },
    "techniques/price-tables.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: '3-5x' now reads 'by 4-8x on current published price sheets'. Still owed: reconcile 'exactly one defensible answer' (declared default) with the null-plus-floor discipline unit-classes-are-open prefers; needs a second sighting or an operator decision."
    },
    "techniques/preflight-estimation.md": {
      "disposition": "keep",
      "reason": "Call-class scoping, the declared output assumption and the calibration loop are sound and consistent with price-tables and usage-ledgers."
    },
    "techniques/usage-ledgers.md": {
      "disposition": "keep",
      "reason": "Failure rows, unknown-at-every-hop, one period owner with the window returned, and the two deletion rules are internally consistent and match the rust application."
    },
    "techniques/budget-enforcement.md": {
      "disposition": "keep",
      "reason": "The product-action chokepoint, twin entry points, guard ordering and refund enumeration are sound. The interactive override is narrowed by time-ceilings-count-working-time for operator-declared ceilings; that technique states the narrowing explicitly, so no edit here."
    },
    "techniques/engagement-paced-cadence.md": {
      "disposition": "keep",
      "reason": "Reactivity/spontaneity split, dwell-and-cap schedule, wake classification and failed-wake recording are coherent; single-source intake, stated as such."
    },
    "techniques/reversible-debit-and-settle.md": {
      "disposition": "keep",
      "reason": "Handle, arm/settle ordering, kept-floor arithmetic and the closed-attempt walk are coherent and match the node application clause for clause."
    },
    "techniques/spend-attribution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the raw-record exception after 'unattributable forever' (a ledger that keeps the raw record verbatim can project a property present in it into an axis at query time; the obligation becomes emitting every property and never truncating; a property never emitted is still lost)."
    },
    "techniques/spend-observability.md": {
      "disposition": "keep",
      "reason": "Reading order, anomaly list and self-instrumentation are coherent with the sibling techniques."
    },
    "techniques/unit-classes-are-open.md": {
      "disposition": "keep",
      "reason": "Nest-or-residual and floor propagation are sound. 'close to an order of magnitude' fits the 4x-8x direction split. The tool-use prompt counter one vendor's usage metadata lists separately is a further instance of an open class."
    },
    "techniques/whole-prompt-denominator.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the reasoning boundary now says some providers count reasoning inside output (reported, never added) while others report it beside output and bill it at the output rate, so that extractor adds it to output; rule 4 now reads 'A provider that bills a write prices it above a plain input token (1.25x to 2x on one published sheet)'."
    },
    "techniques/one-pot-across-delegation.md": {
      "disposition": "keep",
      "reason": "The root-only tracker, walk-up charge, named shared pots and stated non-durability are coherent; the go application confirms each against the source."
    },
    "techniques/time-ceilings-count-working-time.md": {
      "disposition": "keep",
      "reason": "Working-time accumulator, boundary check with stated overshoot, terminal stop for an operator-declared ceiling and saturating counters, all confirmed in the source documentation re-read this run."
    },
    "techniques/housekeeping-calls-obey-the-ceiling.md": {
      "disposition": "keep",
      "reason": "Check-before/charge-after, skip as a named outcome and the nested stop signal as control are coherent and confirmed against the source re-read this run."
    },
    "applications/next--budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Internally consistent product-action chokepoint account; the private tree at aff9991a was not reopened."
    },
    "applications/go--one-pot-across-delegation.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 this run (loop.go:272,277; session_compaction.go:365; budget.go:35,345; budget docs :74,:97-100; go.mod go 1.27); verified_on moved to 2026-10-31."
    },
    "applications/go--time-ceilings-count-working-time.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 (loop.go:817,981; budget.go:102,216; docs :103,:121,:189); verified_on moved to 2026-10-31."
    },
    "applications/go--housekeeping-calls-obey-the-ceiling.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 (native_compaction.go:107-109,128; session_compaction.go:128,375; docs :84); verified_on moved to 2026-10-31."
    },
    "applications/node--whole-prompt-denominator.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: 50/50 stay = 0.75 + 0.075 = 0.825 vs 0.30 (2.75x); break-even 15 - 13.5f = 3 gives f = 0.889; table rows consistent. The tree at ae87280a was not reopened."
    },
    "applications/node--whole-prompt-denominator--ascent.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: input 3e-6, cached 0.3e-6, output 1.5e-5, write premium 1500 x 0.75e-6 = 0.001125; 48.0% / 89.7% / equal-to-rounding all hold. Private tree not reopened."
    },
    "applications/rust--whole-prompt-denominator.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed (0.0052644 / 0.0098364 = -46.5%); the remainder convention matches the vendor prompt-caching docs (total = read + creation + input). Private tree not reopened."
    },
    "applications/rust--unit-classes-are-open.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (2,000 of 157,000 = 98.7% under-report; 88-66 = 22-point spread); vendor release figures and the private tree not reopened."
    },
    "applications/rust--budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Honest hole inventory; private tree cited at line level was not reopened and no runtime witness exists."
    },
    "applications/node--price-tables.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'they did not agree' now reads 'two of them argue opposite answers' so the sentence matches the two bullets shown. Promotional figures match the vendor price page re-read this run. Private trees not reopened; verified_on unchanged."
    },
    "applications/node--budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Detailed and self-consistent; the private tree at d74adc8 was not reopened."
    },
    "applications/rust--usage-ledgers.md": {
      "disposition": "reverify",
      "reason": "Clear failure-row and counter-example account; private tree not reopened."
    },
    "applications/node--reversible-debit-and-settle.md": {
      "disposition": "reverify",
      "reason": "kept = floor(7 x 2 / 3) = 4, refund 3, sums to 7 as stated; private tree not reopened."
    },
    "applications/node--engagement-paced-cadence.md": {
      "disposition": "reverify",
      "reason": "Simulation-strength verdict stated as such; private tree not reopened."
    },
    "applications/go--spend-attribution.md": {
      "disposition": "keep",
      "reason": "Re-read at 7e57a39 this run: meter_query.go JSON_VALUE group-by and EventFrom clamp, serializer five-field check, parse.go empty-string default, query_params ambiguity refusals, dedupe key namespace-source-id, sink dedupe defaults false/24h. Sink, customer and adapter anchors not all reopened, so verified_on stays."
    }
  }
}
```

## Architecture review - 2026-10-31 (re-verification)

Follows a re-verification pass over the three applications the previous record left `reverify` for want of the gravitone-gcloud and personas trees; both trees were reopened and every citation resolved, so the three move to `keep` with dated re-check notes. The other documents carry their prior dispositions.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/cost-metering",
  "date": "2026-10-31",
  "baseline": "6e9ae5cbb",
  "digest": "sha256-b2:d16c117d0c89a853",
  "disposition": "reverify",
  "coverage": "Re-verification pass only. node--budget-enforcement checked against gravitone-gcloud at the pinned d74adc8 (git show) and at HEAD 3c66e32e; rust--budget-enforcement and rust--usage-ledgers checked against personas HEAD 61029d7ae0 (no pinned commit). Source read, nothing compiled, tested or executed, no live database queried. The other 26 documents were not re-read and carry the previous record's dispositions.",
  "counterexamples": [
    "A per-request gate placed outside the reroute walk stops being once-per-request when a billed failure spends the hold: gravitone now re-reserves before each paid vendor after a billed failure.",
    "A gate that propagates a read error refuses on a DB failure while a sibling gate on the same sum reads the error as $0; the personas attention admission and scheduler gates now disagree in exactly that way."
  ],
  "sources": [
    {
      "source": "gravitone-gcloud at d74adc8 and 3c66e32e: lib/imaging/{budget,router,pricing,errors,api}.ts, lib/spend/select.ts, tests/golden-path/imaging-budget.probe.spec.ts, package.json, .github/workflows/gates.yml",
      "result": "All pinned citations resolve. At HEAD: reserve/settle/release over lib/spend/meter.ts (router.ts:312-313, :328, :409, :466); billed failure re-reserves (router.ts:374-397); refusals counted (meter.ts:346, budget.ts:177-180); per-machine file store by default (select.ts); CI pins node-version 24."
    },
    {
      "source": "personas at 61029d7ae0: src-tauri/src/engine/background/{scheduler,event_bus,tests}.rs, commands/execution/executions.rs, engine/subscription/attention.rs, engine/execution.rs, companion/turn_ledger.rs, db/src/repos/{llm_spend,run_budget,execution/executions}.rs, engine/src/{parser,prompt/cli_args}.rs",
      "result": "background.rs split into a module; all constructs and quotes present at new anchors. Holes unchanged (scheduler unwrap_or(0.0) :889, event bus ungated, one field two units, cost_usd f64, total_input_tokens parser). New fail-closed admission gate at attention.rs:1591-1630."
    }
  ],
  "documents": {
    "cost-metering.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the whole-prompt-denominator entry to 'The techniques'; 'often by an order of magnitude' now reads 'often by close to an order of magnitude'; the attribution paragraph now states the raw-record exception (a property present in a verbatim-kept record can become an axis at query time, so the obligation moves to emitting every property and never truncating)."
    },
    "techniques/price-tables.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: '3-5x' now reads 'by 4-8x on current published price sheets'. Still owed: reconcile 'exactly one defensible answer' (declared default) with the null-plus-floor discipline unit-classes-are-open prefers; needs a second sighting or an operator decision."
    },
    "techniques/preflight-estimation.md": {
      "disposition": "keep",
      "reason": "Call-class scoping, the declared output assumption and the calibration loop are sound and consistent with price-tables and usage-ledgers."
    },
    "techniques/usage-ledgers.md": {
      "disposition": "keep",
      "reason": "Failure rows, unknown-at-every-hop, one period owner with the window returned, and the two deletion rules are internally consistent and match the rust application."
    },
    "techniques/budget-enforcement.md": {
      "disposition": "keep",
      "reason": "The product-action chokepoint, twin entry points, guard ordering and refund enumeration are sound. The interactive override is narrowed by time-ceilings-count-working-time for operator-declared ceilings; that technique states the narrowing explicitly, so no edit here."
    },
    "techniques/engagement-paced-cadence.md": {
      "disposition": "keep",
      "reason": "Reactivity/spontaneity split, dwell-and-cap schedule, wake classification and failed-wake recording are coherent; single-source intake, stated as such."
    },
    "techniques/reversible-debit-and-settle.md": {
      "disposition": "keep",
      "reason": "Handle, arm/settle ordering, kept-floor arithmetic and the closed-attempt walk are coherent and match the node application clause for clause."
    },
    "techniques/spend-attribution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the raw-record exception after 'unattributable forever' (a ledger that keeps the raw record verbatim can project a property present in it into an axis at query time; the obligation becomes emitting every property and never truncating; a property never emitted is still lost)."
    },
    "techniques/spend-observability.md": {
      "disposition": "keep",
      "reason": "Reading order, anomaly list and self-instrumentation are coherent with the sibling techniques."
    },
    "techniques/unit-classes-are-open.md": {
      "disposition": "keep",
      "reason": "Nest-or-residual and floor propagation are sound. 'close to an order of magnitude' fits the 4x-8x direction split. The tool-use prompt counter one vendor's usage metadata lists separately is a further instance of an open class."
    },
    "techniques/whole-prompt-denominator.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the reasoning boundary now says some providers count reasoning inside output (reported, never added) while others report it beside output and bill it at the output rate, so that extractor adds it to output; rule 4 now reads 'A provider that bills a write prices it above a plain input token (1.25x to 2x on one published sheet)'."
    },
    "techniques/one-pot-across-delegation.md": {
      "disposition": "keep",
      "reason": "The root-only tracker, walk-up charge, named shared pots and stated non-durability are coherent; the go application confirms each against the source."
    },
    "techniques/time-ceilings-count-working-time.md": {
      "disposition": "keep",
      "reason": "Working-time accumulator, boundary check with stated overshoot, terminal stop for an operator-declared ceiling and saturating counters, all confirmed in the source documentation re-read this run."
    },
    "techniques/housekeeping-calls-obey-the-ceiling.md": {
      "disposition": "keep",
      "reason": "Check-before/charge-after, skip as a named outcome and the nested stop signal as control are coherent and confirmed against the source re-read this run."
    },
    "applications/next--budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Internally consistent product-action chokepoint account; the private tree at aff9991a was not reopened."
    },
    "applications/go--one-pot-across-delegation.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 this run (loop.go:272,277; session_compaction.go:365; budget.go:35,345; budget docs :74,:97-100; go.mod go 1.27); verified_on moved to 2026-10-31."
    },
    "applications/go--time-ceilings-count-working-time.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 (loop.go:817,981; budget.go:102,216; docs :103,:121,:189); verified_on moved to 2026-10-31."
    },
    "applications/go--housekeeping-calls-obey-the-ceiling.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor re-read at f412343dc305 (native_compaction.go:107-109,128; session_compaction.go:128,375; docs :84); verified_on moved to 2026-10-31."
    },
    "applications/node--whole-prompt-denominator.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: 50/50 stay = 0.75 + 0.075 = 0.825 vs 0.30 (2.75x); break-even 15 - 13.5f = 3 gives f = 0.889; table rows consistent. The tree at ae87280a was not reopened."
    },
    "applications/node--whole-prompt-denominator--ascent.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: input 3e-6, cached 0.3e-6, output 1.5e-5, write premium 1500 x 0.75e-6 = 0.001125; 48.0% / 89.7% / equal-to-rounding all hold. Private tree not reopened."
    },
    "applications/rust--whole-prompt-denominator.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed (0.0052644 / 0.0098364 = -46.5%); the remainder convention matches the vendor prompt-caching docs (total = read + creation + input). Private tree not reopened."
    },
    "applications/rust--unit-classes-are-open.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (2,000 of 157,000 = 98.7% under-report; 88-66 = 22-point spread); vendor release figures and the private tree not reopened."
    },
    "applications/rust--budget-enforcement.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 against personas HEAD: anchors re-pointed after background.rs became a module and cli_args moved to the engine crate; every hole still holds. Dated note adds the attention admission gate (fail-closed, mandate cap folded in) the enumeration omitted. verified_on moved to 2026-10-31."
    },
    "applications/node--price-tables.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'they did not agree' now reads 'two of them argue opposite answers' so the sentence matches the two bullets shown. Promotional figures match the vendor price page re-read this run. Private trees not reopened; verified_on unchanged."
    },
    "applications/node--budget-enforcement.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31: every citation resolves at d74adc8 and the measured results stand; a dated note records the HEAD shape (reserve/settle over a shared kernel, per-vendor re-reservation after a billed failure, refusals now counted, per-machine file store), resolving the uncounted-refusals deviation and partly the per-process one. verified_on moved to 2026-10-31, verified_against node@24 (CI pin)."
    },
    "applications/rust--usage-ledgers.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 against personas HEAD: every construct and quote present, anchors updated in place; counter-examples unchanged. Dated note records result_seen on ExecutionMetrics. verified_on moved to 2026-10-31."
    },
    "applications/node--reversible-debit-and-settle.md": {
      "disposition": "reverify",
      "reason": "kept = floor(7 x 2 / 3) = 4, refund 3, sums to 7 as stated; private tree not reopened."
    },
    "applications/node--engagement-paced-cadence.md": {
      "disposition": "reverify",
      "reason": "Simulation-strength verdict stated as such; private tree not reopened."
    },
    "applications/go--spend-attribution.md": {
      "disposition": "keep",
      "reason": "Re-read at 7e57a39 this run: meter_query.go JSON_VALUE group-by and EventFrom clamp, serializer five-field check, parse.go empty-string default, query_params ambiguity refusals, dedupe key namespace-source-id, sink dedupe defaults false/24h. Sink, customer and adapter anchors not all reopened, so verified_on stays."
    }
  }
}
```
