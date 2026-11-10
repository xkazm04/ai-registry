---
subject: cost-metering
domain: software-engineering
last_touched: 2026-11-10
touched_by: intake, deepen
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

## 2026-11-08 - /harvest backlog 2-015 ([[2026-09-15-ai-engineering-coach]], /shift filler)

Amendment to `spend-attribution`: "When the link is joined after the fact". The unit's home guess
was adoption-measurement; the owner is this subject, because the claim is spend credit per work
item, and `spend-attribution` stated "parts sum to the ledger total" with no exception for a
many-to-many join. Re-verified against the source at its pinned commit: precedence is a context
created from the item, then pasted links (several allowed, each linked), then exactly one
referenced item, else nothing. The row's `checked: refuted` was half right: "a session naming two
items gets neither" holds for inferred mentions only. Per-item rows count a shared session fully;
the total is over distinct sessions; linked and priced counts stay separate. Blind-ab, better:
one probe at the registry's run log joined to session transcripts (nested supervisor runs,
parallel sessions on a window-only link). Both arms had spend-attribution, attribution-channels
and attribution-provenance-tiers. The draft arm scored 8 of 8, the baseline 6. The baseline
partitioned shared spend into a separate bucket, so a nested skill's own row lost its cost, and
it forced rows to sum. Controls scored 8 and 0. Weakest point: one draw per arm and a judge from
the arms' own family, so the verdict is provisional.

## 2026-11-10 - /deepen loop (run `filler-deepen-20261110b`, /shift filler)

Dispatched by the librarian scan (44 points, 11 consumer deviations from a 26-day-old installation report; the 2026-11-09 fleet map holds cost-metering deviations in personas 17, gravitone 7, pof 2 - conform work, listed and not chased).

### Round 1 (survey round)

**Not dry.** Volatile facts read against three vendor pricing pages opened today:

- `price-tables` direction split "3-5x" refuted; current pages put output at 4-8x input. Corrected.
- `price-tables` promotional step: "commonly 2x" rests on one live case, and "certain to move" is refuted - one vendor withdrew an announced step and made the introductory rate standard. Now "scheduled", and the alarm asks for a re-read on the day and carries where the replacement rate was published.
- `price-tables` threshold schedules widened: on some models every class steps several-fold past the threshold, cache reads included, and at least one vendor sizes the call with cached tokens counted; request-level lanes (batch, flex, fast, regional uplift) multiply every class and are cross-linked to `llm-observability/.../price-row-variant-encoding`, which owns them (no technique minted).
- `whole-prompt-denominator`: "reasoning tokens are counted inside output" was an absolute; one vendor reports them beside output and bills the sum. Now a named schema convention converted at the door.
- **Rule flip, the 2026-09-04 banked question answered.** An unknown model's ledger row stores a null cost and reads as a counted floor ranked by traffic; the conservative high default survives only in a gate's arithmetic (preflight estimate, and a period ceiling over unpriced units at read time). Converged across the blind lane, an open-source observability tool's documented behaviour (no cost plus a warning, never a default), the sibling `unpriced-span-accounting`, and a second fleet tree that already does it. Golden path, `unit-classes-are-open` and `spend-observability` aligned. Landed as a correction with cross-links, not a technique (the sibling owns the nullable-cost discipline).

Confirmed and left untouched: batch discount, flat-window vendors, cache-write premium, provider-reported cost as the bill, historical rows keep their price. No application `verified_on` moved (no tree citations re-opened); the 90-day figure is a project retention constant, not vendor-set.

Applied: price-tables floor flip `better` (simulation, gravitone and personas: the split is load-bearing because a preflight preview needs a number); whole-prompt-denominator `better` (simulation, gravitone's decoder for the beside-reporting vendor); promo re-read `unapplied`.

Banked: cache-read multiplier is now per model (any later constant "~0.1x" is stale); failed-call billing per failure class (return: a vendor page that states it); prior-turn reasoning billed as input on newer models (return: a fleet ledger reading multi-turn reasoning usage); a dated row that degrades to unpriced past its expiry as the alternative to the test clock (one tree; return: a second). Project-side (conform, not chased): one project stamps unpriced models as zero on the completed row.

### Round 2 (probe round, same run)

**Not dry.** Training-data-first probes over claims round 1 did not touch, web only where a probe doubted. `price-tables` family resolution: "variants within a family usually share pricing" refuted against today's vendor pages - only dated snapshots of one version share a price, successive versions under one family name reprice in either direction; a prefix now spans one version, never a family name, and a family-substring lookup is a named smell. `whole-prompt-denominator` rule 4: the write premium is per provider and per model (one vendor charges none on earlier models), and a cache billed by storage time is a residual class. Two internal contradictions fixed: `spend-observability` still called the unknown-model total an upper bound after round 1's flip (now an unpriced share that prints the total as a floor), and the golden path refused every after-the-fact attribution join that `spend-attribution`'s 2026-11-08 amendment allows (now the one declared exception). Applied: family resolution `better` (simulation, personas: a family-substring resolver books one model 4x under and another 3x over on the ledger, both silent under the old wording, counted misses under the new); write premium `unmeasurable` (no fleet extractor for a no-premium or storage-billed provider). dry_streak stays 0.
