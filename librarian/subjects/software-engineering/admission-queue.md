---
subject: admission-queue
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# admission-queue

First touch: [[2026-08-22-4]], external reconcile against
`kubernetes/apiserver` @ `80186b5` (k8s 1.38 dev line; staging mirror). Gained
`go--priority-and-fairness` — second stack; single-stack debt cleared. Hint
confirmed; the worker's re-check caught itself fabricating an illustrative
numeric, which is the pass at its best.

## Open leads (banked, convergence rule applies)

- Share-based isolation with a floor as a first-class alternative to aging —
  "runs later, never never" without reordering.
- Anti-windup: a non-empty but under-consuming origin must not accumulate
  scheduling credit.
- Occupancy measured in work (seat-seconds), not entries.
- When the fairest-next item cannot be admitted, skip it — or fairness becomes
  head-of-line blocking (deviation observed, instrumented, unrepaired).
- The per-origin starvation instrument must exist in metrics, not only in a
  debug dump; say how to answer the cardinality objection.

## Cross-subject proposals

- The seat abstraction (multi-slot holds, final seat count, latency tail) →
  subprocess-lifecycle/concurrency-and-slots.
- Smoothed-demand bounded fair-share redistribution on a fixed period →
  rate-limiting.
- The reason-labelled rejection counter as an exemplary verdict vocabulary →
  admission-vocabulary (note: the inverse of the wave-1 finding where a
  refusal enum was erased at the boundary — same family, opposite outcome).

## Applied to the technique layer

- 2026-08-22-6: **vocabulary erasure in transit** (verdict-survives-the-boundary family) applied to `admission-vocabulary` ([[2026-08-22-6]]).
- 2026-08-22-8: `admission-vocabulary` now cites the promoted `verdict-survives-boundary` law ([[2026-08-22-8]]).

## 2026-08-31 — the step trigger, from a systems-database source ([[../../sources/2026-08-31-tigerbeetle]])

`self-paced-intake` landed (6 -> 7 techniques, 2 -> 3 applications). It sits **first** in
the technique list on purpose: it owns the stage before the rest of the subject, which
opens at "requests arrive faster, or lumpier, than the system can execute them" and
never asked whether an arrival should cause a step at all. A per-arrival consumer has no
rate to state, and every bound this subject offers is written against a rate — so the
missing stage was load-bearing for the whole subject rather than an addition beside it.

Corroborated by **cross-run convergence**, at zero fetches: the prior day's Headlong run
landed `engagement-paced-cadence` on `cost-metering` from an agent microharness, and
TIGER_STYLE states the same root for a database ("don't do things directly in reaction
to external events; your program should run at its own pace"). The two are written as
neighbours in both directions — that one paces a loop with *no* external work and must
not bill for idling, this one paces a loop that *does* and must not let arrivals set its
rate. **A third independent sighting would make the root a law**; the lead is banked in
the source note.

Applied same-run to `personas` as a simulation, verdict `better`, proof `structural-only`.
The structural fact: four long-lived consumers, three policies, no rule — and the split
does not track any of the technique's three exemptions. Return condition is an
instrument, not a judgment: the tree counts records dropped when the drain falls behind
but does not emit drain size, so the falsifying measurement (a batch-size distribution
dominated by 1) cannot currently be taken.

## 2026-08-31 - /intake omniroute

Two techniques and one correction from `github:diegosouzapw/OmniRoute` @ `b7a0c54`, an
OSS LLM gateway. **Both techniques land against something this subject already said**,
which is why they are worth more than additions would have been.

- **`resource-denominated-bounds`** contradicts `depth-bounds-and-shed`'s instruction to
  size the depth bound "under the pessimistic case where every entry is maximal". Right
  arithmetic, wrong unit: pessimistic *count* sizing is exactly what produced the source's
  default cap of 1 and its 503s under ordinary coding-agent load. Denominate in the
  resource, charge each item its real cost, derive the ceiling from the host's own limits,
  and refuse at the door an arrival larger than the whole budget. Closes with the three
  cases where a count is still honest.
- **`speculative-work-admission`** fills a stage the subject never had: the three-verdict
  contract assumes a caller who benefits from *queued*, and for redundant work that verdict
  is the worst one available. Probe non-blocking, skip, release on admit, no wait knob.
  Distinct from `depth-bounds-and-shed`'s fan-out backpressure rule, which is producer-side;
  this is the gate side.
- **`priority-and-fairness` amendment**: the per-origin cap assumed origins are attested and
  never said so. Where the key is caller-minted, per-origin capacity is a multiplier — the
  source shipped it and removed it in #10110. Capacity bounds globally; identity orders the
  line.

Applied same-run to `goat`: `speculative-work-admission` **code / better, shipped**
(`58453a3`) after an A/B on the real prefetch queue across three network tiers — 3g went
52 dispatches/18 useful to 30/30 with zero waste, 4g is a no-op. The arm that *failed* is
the reusable part: skipping every source served 0/6 high-intent prefetches, so the
technique gained a boundary section stating that the arrival's class must be readable by
the gate rather than inferred from load, and that below saturation the rule buys nothing.
`resource-denominated-bounds` came back **unmeasurable** on the same tree with its
instrument named (per-source response size).

## Open leads (banked, with return conditions)

- **Advisory-then-blocking as a gate rollout discipline** — the source ships new gates
  advisory with a named calibration window and a retained artifact before they block.
  Adjacent to `quality-gates/gate-laddering`; return if a second source shows the retained
  calibration artifact, which is the part gate-laddering does not carry.

### 2026-08-31 - `/intake`, from a single-author blog archive

Gained `queue-cardinality` (9 -> 10 techniques) plus amendments inside
`priority-and-fairness` and `wait-telemetry`. Source: [[2026-08-31-brooker-blog]].

**The subject was thorough from stage two onward and owned nothing at stage
zero.** Every one of the nine techniques governed policy *inside* one line - the
verdict vocabulary, the depth bound, the ordering, the host gate, the drain. The
definite article in "the queue" had never been examined. Two lanes of one run
converged on it from different directions (precommitment and head-of-line
blocking; stateless hash bucketing), and the decisive evidence was neither of
them: **this subject's own APF application document had recorded the mechanism
fifteen months earlier** - hands dealt from 64-128 queues, a rotating offset to
de-bias overlapping hands, head-of-line blocking with its metric name and the
note that the repair does not exist. The material was written at the application
layer and never lifted, which is why `research-map "fair queuing"` returned
nothing corpus-wide: applications are not what it ranks.

**The rejection was worth more than the technique.** Applied to a job runner
with twenty non-interchangeable work kinds over four permits, splitting the line
was **4.3x worse** and improved nothing, because over a month the queue was
non-empty 1,610s of which *zero* held more than one kind. That produced the
technique's coexistence test: the cost claim holds in the steady state and fails
under class-clustered arrivals, which is the common shape. The alternative arm
was already built and shipped disabled - a disabled feature acting as a control.

`priority-and-fairness` was corrected on a sentence landed the same morning:
"takes nothing from anyone else" is true of occupancy and false of throughput
share. The A/B put the attacker at 99.0% share under *both* policies and honest
throughput at 1/min under the correct one - so the global bound protects the
resource and abandons the user, and only an attested key restores their slice.

`wait-telemetry` gained the sizing identity (its objective section enumerated
"three ways" and the fourth is that wait times arrival rate is the concurrency
you must hold) and the caller-versus-entry gap. Measured on real rows: 3.6x, with
no starvation anywhere, and the shipped concurrency constant derived to two
decimals. The two additions turned out to be one error at two timescales.

### 2026-08-31 - `/intake`, from a client-side pacing library

`depth-bounds-and-shed` gained a section, `gate-sees-target` and one `use_when`
entry. Source: [[2026-08-31-tkdodo-pacer]]. Technique count unchanged - this was
the cheaper move and the right one, because the material belonged inside a
technique that had already named the policy.

**The finding came from the denial hunt, and the denial was in the sibling
file.** `priority-and-fairness` says "Priority orders the wait; it does not skip
the gate" and forwards its single exception - reject-by-class shed - to
`depth-bounds-and-shed`, which duly lists it among three canonical policies. The
forward pointer resolved; what it resolved *to* was a menu. Both files described
reject-by-class as something a designer selects and neither said what makes it
implementable: **the gate has to evaluate class before depth**, and the natural
code shape does the reverse for a good reason, because the capacity test is a
length comparison available immediately while the class must be derived from the
arrival. So the priority function reaches only the insertion sort, and the shed
policy is refuse-newest - selected by nobody and indistinguishable in
configuration from the policy the designer believes they chose. That is
`gate-sees-target` at the admission gate: the check that refuses agrees with the
intended policy everywhere except the arrival the policy existed for.

The amendment is this technique's own mechanical test, turned one level up. It
already asked whether you can walk from the declared bound to the line that
refuses because of it; it now asks the same of the declared priority.

**Both the source and the consuming project had the defect, and neither test
suite could have seen it.** The source's two packages carry 8 priority tests and
7 capacity tests each and zero that construct both; the project carries 34 tests
and zero that construct a queue which is bounded *and* prioritized. The policy
lives only in the intersection, which is why the amendment ends by naming the one
case that has to exist rather than the rule to believe.

Applied to `personas`, **code / better**, not shipped. This subject's own evidence
overlay had recorded the project as "bounded depth with refuse-newest shed",
filed as a chosen policy - and it was an inherited one, which is the small
correction that overlay now owes. Arm A 33 passed/1 failed, arm B 34/0 on the
same binary. The durable half is the effort split: the comparison was four lines
and revoking the displaced promise was the rest of the change, which is the
concrete instance of the amendment's claim that sorting makes the easy half look
like the whole job. Ship blocked on `environment` - the change crosses a crate
boundary and the caller crate does not build on this checkout for unrelated
pre-existing reasons.

**Open lead (return condition attached).** Displacement here arbitrates one
origin's own line, because the bound is per-origin. A single shared bound across
origins turns displacement into a fairness decision rather than a priority one,
and this run did not answer it. Return when a second tree carries a global
bounded queue with mixed classes across origins - that is the shape where
`priority-and-fairness` and `depth-bounds-and-shed` genuinely have to be read
together rather than in sequence.

## 2026-09-03 - `/intake` lightrag (run `intake-lightrag-0902`, intake 2.2.0, Opus workers)

`resource-denominated-bounds` gained "The door sits below the body reader": a content-length bound enforced after the body was read has already paid the transfer it exists to avoid; the position in the transport stack the technique treated as given.

## 2026-09-04 - `/intake` fluxer (run `fluxer`, intake 2.3.2, five Opus design readers)

Source: a 1.35M-line polyglot real-time chat platform, read as a system. Routing
count 47 design decisions / 6 systems, no system clearing three against a NEW
home - so no forge, and this subject took the technique triple instead.

**+3 techniques, +1 amendment, +5 applications** (2 python against a fleet peer,
2 erlang and 1 rust source-tree, plus a second witness appended to the existing
`rust--admission-vocabulary`).

- `zero-depth-admission` - the missing **stage zero**. This golden path
  explicitly surfaces two assumptions before it starts (the step trigger, then
  the definite article in "the queue") and never surfaces the third: whether
  there is a line at all. Found by the enumeration hunt on a subject that is
  thorough from stage two onward.
- `remediation-derived-bounds` - a bound whose breach triggers a destructive
  remediation elsewhere is derived from that threshold, not configured beside
  it. Instantiates `limits-are-derived` at the one seam where inversion is
  unrecoverable.
- `refusal-without-release` - refusals correlated by a server-side cause;
  releasing the caller is the synchronizing event.
- `admission-vocabulary` amended: two arms is correct where there is no waiting
  room. The technique's "exactly one of three verdicts" presumes somewhere to
  put a waiting request; an unreachable arm is not a collapsed one. The useful
  half is where such designs really fail - dropping `queued` is free, dropping
  the refusal's *reason* is the original outage by another road, and the source
  tree does exactly that (`{"error": "overloaded"}`, both hops, no taxonomy).

**The apply step refuted the technique it tested, and that is the row worth
reading.** A fleet peer with the opposite bound (a queue capped at 32, admitting
non-blocking, autoscaling on its own depth) ran a paired experiment on its real
admission path: zero depth **halved** useful throughput at the shipped
configuration (24 completed vs 41). Sweeping the one variable the technique's
original rule ignored found the crossover: below ~5 service times of caller
patience zero depth wins decisively (at ratio 1 the queue admitted 88 of 90 and
served 2); above ~10 the queue wins. `depth-bounds-and-shed`'s existing
wait-time-honesty formula predicts that crossover exactly, and the peer ships
32 against a formula answer of 30.

So the technique's proposed *structural* selector - "the caller is synchronous
and already holds a deadline" - was a strictly worse instrument than the
arithmetic this subject already had: it is true in every row of the sweep while
the correct answer flips. It was rewritten to the ratio before landing rather
than shipped and amended, and the application records the refutation.

**A second correction, caught the same way.** The `remediation-derived-bounds`
closing section first claimed that a limiter clipping a controller's input puts
the replica ceiling out of reach. Wrong: a controller that re-evaluates
converges geometrically, so the clip sets the *gain per interval* and therefore
the convergence time, not the range. Corrected before commit.

**Open, for the next run.** The peer computes at admission that a deadline-
bearing arrival cannot be served in time and admits it anyway, degrading quality
if allowed and recording the miss if not. That is `resource-denominated-bounds`'s
unsatisfiable arrival with time as the denominating resource - the corpus owns
the rule, the tree applies it to the quality decision and not the admission
decision. Not tested here: this run's callers passed no deadline, so the arms
would have been a different experiment. Return with deadline-bearing traffic.

