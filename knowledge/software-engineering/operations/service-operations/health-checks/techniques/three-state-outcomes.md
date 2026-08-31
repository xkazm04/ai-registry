---
layer: technique
type: technique
subject: health-checks
technique: three-state-outcomes
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding what a check reports when it could not run, the board goes red when only the prober broke, splitting cannot-probe-now from cannot-probe-ever]
---

# Three-state outcomes

A check that can only say "yes" or "no" is forced to lie whenever the honest
answer is "I couldn't find out" — and in real environments that answer is
frequent, because the checker lives in the same fallible world as the
checked: networks drop, tools go missing, permissions get revoked from the
prober itself, deadlines expire. The foundational move of the whole
discipline is to make the third answer a **first-class verdict**:

- **verified** — the check completed and observed the dependency working;
- **failed** — the check completed and observed the dependency not working;
- **unverifiable** — the check did not complete; no claim about the
  dependency is being made at all.

## The two collapses, and why each is worse than the truth

The third state exists because both ways of eliminating it fail, in opposite
directions ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):

- **Unverifiable → failed.** Every probe hiccup becomes a red. The board
  turns red when the *checker's* environment degrades — offline, sleeping,
  rate-limited — while the dependencies themselves are fine. Operators
  recalibrate within days: red now means "probably noise". That
  recalibration is permanent, and it is the death of the diagnostic, because
  the one red that mattered arrives into a room trained to ignore red. Worse,
  if failures feed a ledger or a breaker, a transient probe outage is
  *recorded as dependency failure*, and the false record outlives the outage.
- **Unverifiable → verified** (or its stealth form: keep rendering the last
  green with no further comment). Now a dead dependency wears a live
  checkmark. Nothing looks wrong until the moment of need — which is
  precisely the moment the check existed to move the discovery *away from*.

The truth — "could not determine, because X, as of T" — is less comfortable
than either lie and more useful than both: it tells the operator the *checker*
needs attention, without indicting or absolving the checked.

## Distinct types, not a status string with three values

The three verdicts deserve distinct *structure*, not just distinct labels,
because each carries different payload:

- **verified** carries the observation (what was exercised, what it
  answered) and the timestamp that starts its staleness clock;
- **failed** carries the classified failure and its remediation — a failed
  verdict without a remedy is half a verdict (see
  [remediation-affordances](./remediation-affordances.md));
- **unverifiable** carries the *reason the check could not run* — which is a
  fact about the probe, not the dependency, and routes to a different fixer
  (the environment, the prober's own configuration).

Model them as a closed sum — one authoritative definition every consumer
derives from ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the renderer, the rollup, the scheduler, the gate. A consumer that
hand-copies the vocabulary is a blank badge waiting for the fourth member.

Beware the retrofit trap. Three-state verdicts are usually introduced *over*
an existing boolean, and the boolean is kept for compatibility — typically
mapping unverifiable to "success" so old gates don't start blocking on
checks that never ran. That mapping is defensible for gating and poisonous
for **counting**: any tally aggregated on the legacy boolean silently folds
"never probed" into "passed", and a population that was never checked at
all reports as fully verified — the exact lie the third state was built to
kill, reintroduced through the back door of a summary. The rule: once the
typed state exists, every counter, rollup, and badge aggregates on it;
the boolean survives only as a gating shim with its collapse documented at
its definition.

## Render semantics differ per state

- **verified** renders green *with its age*. An old green is rendered as an
  old green, not as green.
- **failed** renders red with the reason and the remedy adjacent — never a
  bare red.
- **unverifiable** renders as its own visual state — muted, "unknown",
  question-marked — never green, never red, and never invisible. Hiding the
  unverifiable row is the render-layer version of the collapse.

## Retry semantics differ per state

- **verified** re-runs on its normal cadence or on invalidating events;
  nothing about a green demands urgency.
- **failed** re-runs with backoff — a confirmed red rarely changes in
  seconds, and hammering a failed dependency helps nobody (see
  [check-scheduling](./check-scheduling.md)).
- **unverifiable** retries on the *probe obstacle's* schedule: when the
  network returns, when the tool is installed, when permission is granted —
  eagerly on those events, with backoff otherwise.

## A check with several finding classes needs the third state per class

The three verdicts above are stated per *check*, which is the right granularity
when a check answers one question. A check that sweeps a population and reports
several **classes** of finding — a consistency scan, a lint pass, a compliance
sweep — has a second axis, and the collapse reappears on it in a form the
per-check verdict cannot see: the check completed, the dependency was reachable,
the overall verdict is honest, and *one class* was never actually computed.

The usual cause is a budget. An enumeration hits a page cap or a deadline, and
any class whose finding is an **absence** — something present in one place and
missing from another — becomes unprovable from the partial set, because absence
cannot be concluded from a scan that stopped early. The class still has to
report something, and its accumulator is already holding zero.

Zero is the wrong answer, and it is wrong in the specific way
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) names: it
converts *this was not looked for* into *this was looked for and was clean*.
Worse than the per-check collapse, in one respect — a whole check reporting
green at least invites the question of when it last ran, whereas a class
reporting zero inside a green check is invisible even to a careful reader.

Three obligations follow, and the third is the one usually missed:

- **Carry a not-computed marker per class**, distinct from zero, with the reason
  (budget exhausted, input unavailable, precondition unmet).
- **Exclude it from every total.** A report that sums its classes must clamp the
  marker out rather than let a sentinel value arithmetic its way into the
  headline. A run that looked less hard must not publish a smaller finding count
  for having done so.
- **Exclude it from every threshold.** A not-computed class contributes nothing
  toward the count that trips the overall verdict — it neither raises nor
  suppresses it. Treating the marker as zero here is how a truncated scan
  reports a clean board precisely on the runs where the population grew past the
  budget, which is to say on the runs where the finding was most likely.

The overall verdict then carries the same qualification a stale green carries:
verified *as to these classes*, undetermined as to those.

## Cannot-determine-now versus cannot-determine-ever

Unverifiable itself splits along a line worth modeling. **Cannot probe now**
is transient: the obstacle will pass, the state carries staleness, retry is
meaningful. **Cannot probe ever** is structural: this dependency offers no
safe way to be checked from here — no read-only interaction exists, or
checking it requires a capability the product deliberately does not hold.
The structural case is a permanent property of the check, not a degradation:
it renders as a calm, explicit "not verifiable from here", it never accrues a
staleness warning (staleness implies a refresh could exist), and it is
excluded from retry scheduling entirely. Merging the two teaches operators to
ignore staleness on the transient ones — the structural rows cry wolf on its
behalf.

The credential specialization of this exact split — where "cannot probe
ever" means a provider that offers no side-effect-free way to exercise a
secret — is developed in the vault subject's
[health-probing](../../../../security/credential-vault/techniques/health-probing.md), whose
three-state table is this technique applied to one domain.
