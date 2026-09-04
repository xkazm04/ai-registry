---
subject: cost-metering
domain: software-engineering
last_touched: 2026-09-04
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
