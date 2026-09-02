---
layer: technique
type: technique
subject: retry-backoff
technique: circuit-breakers
status: forged
laws:
  - gate-sees-target
  - failure-not-empty-success
shared_with: []
use_when: [deciding whether a dependency is down for everyone, recovery jobs keep lifting cooldowns they should not, denied calls look like failed calls, every candidate in a pool is open at once]
---

# Circuit breakers

Backoff spaces out one caller's attempts against one failing operation. It cannot
express the stronger claim a system eventually earns the evidence for: *this
dependency is down for everyone, and every new attempt — from any caller, for any
operation — is a waste that slows the recovery.* The circuit breaker is the
component that holds that claim. It is an honesty device: the system stops
pretending each call is a fresh question and admits it already knows the answer.

## The state machine

Three states, each with one job:

- **Closed** — normal operation. The breaker observes outcomes and accumulates
  evidence. Trip condition: either *N consecutive failures* (simple, right for
  low-volume dependencies where rates are noise) or *failure rate over a rolling
  window with a minimum-volume floor* (right for high-volume paths — without the
  floor, two failures out of two requests at 4 a.m. reads as a 100% failure rate
  and trips the breaker on nothing).
- **Open** — calls are refused without being attempted, for a cooldown period.
  The refusal must be instant and cheap; that is the entire economic point.
- **Half-open** — the cooldown elapsed, and the breaker admits a *strictly
  bounded* number of probe calls (one is a fine bound). Probe succeeds → closed,
  counters reset. Probe fails → open again, and the cooldown may itself back off
  (a dependency that fails its third consecutive probe deserves a longer wait
  than its first — the ladder logic of backoff-design, applied to cooldowns).

The half-open bound is load-bearing. If cooldown expiry re-admits *all* waiting
traffic, the "probe" is a stampede, the sick dependency is knocked back down, and
the breaker has automated the thundering herd it existed to prevent. Recovery is
probed deliberately, by a budgeted trickle, and the herd stays behind the breaker
until a probe actually succeeds.

## What counts as evidence

The breaker must observe the thing it gates (law: gate-sees-target) — actual call
outcomes against the actual dependency, not a proxy like a health endpoint that
can be green while real calls time out. And not every failure is evidence of
ill-health: the classification layer (see error-classification-for-retry) decides
what feeds the breaker. Transient and unknown failures count; *permanent* failures
do not — one caller's malformed request must not lock every other caller out of a
healthy dependency; *rate-limited* responses are their own lane — the dependency
is alive and stating its own schedule, and tripping the breaker on top of it turns
a stated wait into an unstated one.

## Scope: per-dependency, plus a stated precedence for anything coarser

A breaker's scope is a failure-domain hypothesis: everything behind one breaker is
believed to fail together. The default scope is **per dependency** (per provider,
per endpoint, per account — whatever unit actually fails as one). One global
breaker over unrelated dependencies punishes all for one; per-request-type
breakers under one dependency mostly just multiply state without adding signal.

Layered scopes are legitimate — a per-dependency breaker under a global "the whole
egress path is broken" breaker — but the moment two breakers can both speak, their
**precedence must be a documented contract**, not an accident of check order:

- **Deny wins.** A call proceeds only if every applicable breaker admits it.
- **Attribution is specific.** The refusal names *which* breaker denied it; "a
  breaker said no" is not actionable, and an operator resetting the wrong breaker
  will conclude resets don't work.
- **Probes are scoped to their own breaker.** A global half-open probe's outcome
  feeds the global breaker only; letting it also count against per-dependency
  breakers double-charges one failure to two ledgers and makes recovery order
  dependent on bookkeeping.

## One breaker per candidate: the verdict as a selection input

The precedence rules above describe *several breakers over one call*, where the
question is "may this call proceed?" and deny wins. There is a second composition
with a different rule. When a call has **interchangeable candidates** — a failover
list, a weighted pool, a set of equivalent replicas — each candidate carries its
own breaker, and a breaker's verdict stops being an admission decision and becomes
an input to "which candidate should carry this?". The output is not admit-or-deny;
it is a **filter over the candidate set**, applied before the selection strategy
runs.

The filter has one rule that is never obvious in advance and always discovered
during an incident:

- **Prune open candidates from the set — unless pruning would empty it.** With at
  least one closed candidate present, the open ones are removed and the strategy
  chooses among the survivors. With *every* candidate open, the filter does not
  apply: the strategy runs over the full set and the call is attempted.

**All open is not no candidates.** A breaker's evidence is a health hypothesis, not
a permission, and a hypothesis that indicts every candidate simultaneously is the
case where it is least likely to be exactly right and most expensive to obey.
Refusing on it converts a partial outage into a total one; worse, it removes the
only thing that could ever revise it, because the traffic that closes a breaker is
traffic that was allowed through it. An outage-wide open state must degrade to
**trying**, not to **refusing**.

The rejected alternative is to spell all-open as a denial and stop with an
exhausted-candidates outcome. That is the right answer for a *different* filter,
and the two are worth separating explicitly because in code they are the same
operation — remove members from a list, then pick one. A set narrowed by
**permission** (only these candidates may serve this class of traffic) fails
closed: proceeding anyway is the exact breach the rule existed to prevent, so empty
means refuse, loudly. A set narrowed by **health** fails open: proceeding anyway is
the probe. Every filter over a candidate set states which of the two it is; one
that cannot say is treated as permission, because being wrong in that direction
costs a refused call and being wrong in the other costs the guarantee.

Two riders on the degenerate case:

- **The attempt made under all-open is not an ordinary attempt.** It is a
  deliberate override of every breaker in the set, and it is recorded as one. An
  operator watching traffic climb against a dependency their dashboard shows as
  open needs the line that says the empty-set rule fired, not a contradiction.
- **Pruning must not renumber identity.** Candidates are commonly addressed by
  position, and removing one shifts every position after it. If a candidate's
  identity in logs, telemetry and breaker bookkeeping is its index in the list,
  then the moment a breaker prunes a sibling it silently re-points every downstream
  record — and the next verdict is filed against the wrong member, which is how a
  healthy candidate inherits a sick one's streak. Carry the pre-filter identity
  through the filter.

The boundary between the two compositions is worth stating once: *deny wins*
governs breakers stacked over one call; the empty-set rule governs one breaker per
candidate across a set. They never contradict, because they answer different
questions — but read either into the other and the failure only shows under load.
Deny-wins applied to a candidate set refuses the whole fan-out the moment its last
member trips; the empty-set rule applied to layered breakers admits a call that
every applicable breaker refused.

## Provenance decides who may lift it early

Not every open breaker was opened by the same kind of knowledge, and the
difference governs who is allowed to close it. Three provenances recur, in
increasing authority:

- **Heuristic** — this system inferred ill-health from a streak or a rate. It is
  a hypothesis about the dependency, and a probe is precisely the experiment
  that tests it.
- **Escalated** — a ladder step, imposed because the previous cooldown was
  proven insufficient. Probing it early discards the evidence that produced the
  escalation.
- **Stated** — the dependency itself named a window. There is nothing to probe:
  the authority that would answer the probe has already answered, and a probe
  before its window is a request it will refuse, charged against the very
  allowance it is protecting.

Two rules follow, and both are cheap to state and expensive to discover:

- **Only a heuristic open is probeable.** A recovery job that clears cooldowns
  on a schedule must be able to tell which ones it may touch, which means the
  provenance is stored with the open, not inferred later from its duration.
- **Never shorten a stronger open.** A new heuristic trip landing on top of an
  existing longer one must leave it alone. Overwriting is doubly wrong: it
  shortens a wait that something better-informed imposed, and it replaces a
  non-probeable provenance with a probeable one, so the next recovery pass
  cheerfully lifts a window the dependency stated.

## Scope must match the evidence, in both directions

A breaker's scope is a hypothesis (above), but so is each piece of evidence, and
the two must agree. The failure mode is asymmetric and both halves are real:

- **Evidence gathered across a set must open across that set.** A failure streak
  counted across every credential reaching one dependency, but then applied to
  whichever credential happened to fail last, leaves every sibling serving the
  same sick dependency until each independently re-earns the streak — the
  breaker trips N times for one outage and protects nothing in the meantime.
- **Evidence that implicates only one member must not open the set.** A failure
  that is deterministic in the request or in one member — a schema the
  dependency will reject identically every time, a capability one endpoint
  lacks — says nothing about the others, and opening across them removes healthy
  capacity to punish a defect they do not share.

State, for every evidence class, the scope it implicates. A class that cannot
say defaults to the narrowest, because a too-narrow open costs one more failed
attempt and a too-wide one costs the capacity that would have served the call.

## The open breaker must be loud

A breaker denial is a policy decision, not a dependency failure, and it must be
spelled differently from both success and failure (law: failure-not-empty-success).
Three distinguishable outcomes leave the resilience layer: *succeeded*, *failed —
the dependency answered badly*, and *denied — never attempted, breaker X, open
since T, cooldown until T′*. Collapsing denied into failed sends engineers
debugging a dependency that was never called; collapsing it into a quiet nothing
produces the worst outage shape there is: the system looks idle while the breaker
silently refuses everything (retry-observability owns the surfacing).

## Decision rules

- **Breaker state outlives the process or the trip evidence re-accumulates from
  zero after every restart** — during exactly the kind of incident that causes
  restarts. Persist state with a freshness bound: rehydrate recent state, discard
  stale (a breaker opened yesterday says nothing about now; see durable-retries
  for the durability discipline).
- **Manual override is part of the design.** An operator can force-open (planned
  maintenance) and force-close-with-reset (known-fixed). Without the lever, the
  incident channel becomes "restart the whole process to reset one breaker."
- **The breaker and the ladder compose; the breaker wins.** An open breaker
  preempts any scheduled retry attempt — the attempt is denied, and (policy
  choice, stated) the denial either re-schedules without consuming ladder budget
  or counts against it. Deciding this ad hoc per call site is how one outage
  exhausts every budget in the system.
- **Successes offset evidence one-for-one; they do not purge it.** In a
  rate-over-window breaker, letting a single success clear the whole failure
  window means one lucky call through a struggling dependency erases the
  accumulated case for tripping — and under a cascading failure there is always
  an occasional lucky call. Decrement, don't reset; only demonstrated stability
  (the same minimum-stability window backoff-design uses for ladder resets)
  earns a clean slate.
- **Trip thresholds are data, not code.** The first incident will prove the
  threshold wrong for exactly one dependency; changing a number must not require
  a deploy.
