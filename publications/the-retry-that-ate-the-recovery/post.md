# The retry that ate the recovery

*Classification, jitter, budgets and the five ways a retry stops, read against what resilience libraries ship in October 2026*

2026-10-14

At about 10:45 PDT on 2025-06-12, a policy change carrying unintended blank fields entered the regional Spanner tables that hold policies for Google Cloud's Service Control. It replicated globally within seconds, hit a null pointer, and put the Service Control binaries into a crash loop in every region. [[1]](#src-1)

> **The report's own finding.** In the larger regions, restarting Service Control tasks overloaded the underlying Spanner table, and Service Control "did not have the appropriate randomized exponential backoff implemented to avoid this". [[1]](#src-1)

Disabling the faulty serving path took under 40 minutes. Full resolution took far longer: up to about 2 hours 40 minutes in one of the larger regions, where engineers throttled task creation by hand and routed traffic to multi-regional databases to take load off the infrastructure underneath. [[1]](#src-1)

![Timeline of 2025-06-12 in US/Pacific: policy change at 10:45, global replication in seconds, 503s from 10:51, faulty path disabled within 40 minutes, smaller regions first, dashboard closed 18:18, with a band for one large region at up to 2 h 40 min.](figures/01-opening-timeline.svg)

*Time to full resolution, not the trigger, is where the day went: the faulty path was off within 40 minutes, and one large region needed up to about 2 h 40 min measured from the start. An earlier mini report on the same page gives 10:49 to 13:49. [[1]](#src-1)*

This post walks the failure lane, from classifying an error to naming the state a stopped retry stopped in, against what shipping systems default to in October 2026. No measurement here is first-hand: every number is published work, cited with its date, and with the read date where the page carries none, and arithmetic on those numbers is labelled as derived.

1. [Retry traffic as the sustaining effect](#sustaining)
2. [Replay safety first, then the class](#classification)
3. [What jitter buys, and which defaults omit it](#jitter)
4. [The bound is a ratio, at one layer](#budget)
5. [The breaker default that decides when it probes](#probe)
6. [Partial failure, and where ejection helps](#partial)
7. [Server-stated delays and unfinished fields](#stated-delay)
8. [Durable retry as a schedule](#durable)
9. [Five terminal states, one telemetry signal](#stopping)
10. [Spacing without a bound is half the control](#close)

- Read a retry configuration against the shipped defaults of resilience4j 2.4.0, Polly 8.8.0, gRPC and the AWS 2026 behaviour, and say which error class each site treats.
- Pair a per-call-site attempt cap with a ratio bound and the positional rule, and state the amplification factor the pair buys.
- Name, for every retry loop, which terminal state a stopped attempt reached, and whether the telemetry in place can express it.

## <a id="sustaining"></a>Retry traffic is the sustaining effect that outlives its trigger

That shape of failure has a name and a literature. The framework is Bronson, Aghayev, Charapko and Zhu's, from HotOS 2021. [[34]](#src-34) An OSDI '22 study extends it, examines 22 metastable failures in depth across 11 organizations from public incident reports, and reports **at least 4 of 15 major AWS outages in the preceding decade as metastable**. [[24]](#src-24)

> **Metastable failure, as the literature states it.** A system in a vulnerable state, a trigger that causes temporary overload, then a sustaining effect that keeps the system degraded after the trigger is gone. The OSDI study extends that model with two kinds of trigger and two kinds of amplification mechanism, with retry traffic as an instance. [[34]](#src-34), [[24]](#src-24)

**Retry traffic feeds the overload that produced it**, which is why removing the trigger leaves the system degraded. Every caller that times out adds work to a dependency already short of capacity, and the work arrives in proportion to how badly that dependency is doing. The loop turns positive precisely when capacity is impaired, which is why adding retries lowers the everyday error rate while converting small outages into internal retry storms. [[35]](#src-35)

![Diagram of a metastable failure: vulnerable state leads to trigger, trigger leads to overload, and overload and a box labelled retries and requeues feed each other in a loop. A dashed arrow marks the trigger as gone while a box to the right reads still degraded.](figures/02-sustaining-effect.svg)

*Retries and requeued work feed the overload that produced them, so removing the cause leaves the system degraded. Illustration of the published model. [[34]](#src-34), [[24]](#src-24)*

AWS's summary of the October 2025 DynamoDB disruption shows the same shape. On 2025-10-19 a DNS Enactor, delayed while retrying its update across endpoints, applied a much older plan over a newer one; clean-up then deleted that older plan, removing every IP address for the regional endpoint. Downstream, DWFM "had entered a state of congestive collapse and was unable to make forward progress in recovering droplet leases", with work queued to reattempt the droplet lease, until engineers throttled incoming work at 04:14 PDT. **The summary names retries and queued reattempts and nowhere states their spacing**; the published remediation rate limits incoming work by queue size. [[28]](#src-28)

> **Inference.** The two incidents are one model with two sustaining effects: task restarts against a Spanner table in June, queued lease reattempts against a lease manager in October. The sources describe each incident and the model separately; the mapping reasons from [[1]](#src-1), [[24]](#src-24) and [[28]](#src-28).

## <a id="classification"></a>Replay safety gates the retry, and the failure's class decides the rest

**Before any classifier runs, one question decides whether a retry is permitted**: can the request be applied twice without a second effect. RFC 9110 says an idempotent method may be repeated automatically when a communication failure arrives before the client can read the response, and that a client should not automatically retry a non-idempotent one unless it has some means to know that the request semantics are actually idempotent regardless of the method, or some means to detect that the original request was never applied; a proxy MUST NOT retry one at all. [[17]](#src-17) Those two alternatives carry the working distinction. A connection refused before any byte left the client is a known non-execution, retryable whatever the method. A timeout after the request was sent is ambiguous: retryable where the semantics are idempotent, and safe for a non-idempotent method only behind a replay-safety key such as EC2's token-based idempotency on `RunInstances`. [[2]](#src-2)

With replay safety settled, the class decides the rest. **A loop that catches every exception and sleeps treats four failures as one**: a rejected credential, which never heals by repetition; a rate limit, which heals when the limiter says so; a connection reset, which heals at once; and a crashed dependency, which heals on no schedule the caller can compute. Classification belongs where the structured response still exists, because an error reaching the loop as a bare string has lost the field the decision needed.

![Pipeline diagram: a response enters a decision shaped error code known, which routes directly to transient with a 50 millisecond base, to throttling with a 1000 millisecond base, or to non-retryable. Only unlisted codes fall through to a second decision on HTTP status, where 500, 502, 503 and 504 are transient. Annotations show 400 RequestTimeout going to transient, 400 ValidationException to non-retryable and a 5XX with a throttling code to throttling.](figures/03-classification-gate.svg)

*The code is read before the status, which is why an HTTP 400 can be retried and an HTTP 5XX can be a throttling case. Illustration of the documented order. [[6]](#src-6)*

The 2026 AWS SDK retry behaviour, which requires opting in with `AWS_NEW_RETRIES_2026` until it becomes the default in November 2026, [[7]](#src-7) **reads the error code first and the HTTP status second**, inverting the habit of switching on status. An HTTP 400 carrying `RequestTimeout` is retried, an HTTP 400 carrying `ValidationException` is returned at once, and an HTTP 5XX carrying one of the 14 documented throttling codes is throttling rather than transient. The status fallback is narrow: any 500, 502, 503 or 504 without a recognized code is transient, and the throttling class has no status fallback at all. [[6]](#src-6)

| Class | Evidence | Contract | How a shipped system spells it |
|---|---|---|---|
| Transient | timeout, reset, or 500, 502, 503 or 504 with no known code | jittered backoff, bounded attempts | AWS SDK: 50 ms base, 14 tokens per retry [[6]](#src-6) |
| Rate-limited (throttling) | one of the documented limiter codes | return at the stated time, plus jitter | AWS SDK: 1,000 ms base, 5 tokens per retry [[6]](#src-6) |
| Permanent | validation rejection, bad input, not found | never retry; surface at once | Temporal: a non-retryable failure type [[31]](#src-31) |
| Unknown (this post's fourth lane) | a code or status the taxonomy omits | at most one further attempt, only where a repeat is replay-safe, counted apart | gRPC is the conservative end: a code that is neither retryable nor non-fatal, such as `INVALID_ARGUMENT`, neither retries nor spends the bucket [[5]](#src-5) |

*The four classes, the evidence that assigns each and the contract it carries. The transient retry costs more quota than the throttling retry on purpose: a 500 or a connection failure often indicates a service-wide problem, while throttling signals that the service needs more time. [[6]](#src-6), [[5]](#src-5), [[31]](#src-31)*

> **Inference.** The fourth class extends the vendor's three: the AWS reference documents transient, throttling and non-retryable only. [[6]](#src-6) The June report states the restarts and the missing randomized backoff and names no classifier, no budget and no restart tuning, so what that code did with each class of error is not on the record. [[1]](#src-1)

> **Inference.** A timeout set below the dependency's latency under load returns no error from the dependency at all, and it expires on every caller's clock at once, which manufactures the correlated wave the next section is about. [[3]](#src-3), [[6]](#src-6)

gRPC puts the same discipline in the service owner's hands. Its retry design recommends listing in `retryableStatusCodes` only codes indicating the server did not process the request, and errors such as `INVALID_ARGUMENT` do not decrement the throttling token count, so **one malformed payload cannot spend a budget meant for a sick dependency**. [[5]](#src-5)

```python
def classify(error):
    # the SDK matches on error code first, then falls back to HTTP status
    if error.code in THROTTLING_CODES:    # 14 codes, no status fallback
        return "throttling"               # base 1_000 ms, 5 tokens
    if error.code in TRANSIENT_CODES:     # RequestTimeout, InternalError, I/O
        return "transient"                # base 50 ms, 14 tokens
    if error.code in PERMANENT_CODES:
        return "permanent"                # ValidationException, HTTP 400
    if error.status in (500, 502, 503, 504):
        return "transient"                # the documented status fallback
    return "unknown"                      # this post's lane: counted apart
```

The boundary itself is not clean, and the vendor says so: eventual consistency blurs the classification boundary, because a client error can become a success once state propagates. [[2]](#src-2) That is the argument for an explicit unknown lane. **A taxonomy whose default branch files novel failures as permanent drops recoverable work**; one that files them as transient hammers a dead endpoint.

## <a id="jitter"></a>Jitter does the work backoff alone does not, and the defaults still omit it

Backoff is usually explained as politeness. The 2015 simulation that popularized it describes herd control instead. With no backoff, completion time grew linearly with contention while total work grew as the square of the number of clients in that simulated contention model, under a network delay with a 10 ms mean and 4 ms variance; capped exponential backoff alone reduced client work only slightly. **Adding jitter at 100 contending clients cut the number of calls by more than half** against an un-jittered capped ladder, and improved completion time as well. [[3]](#src-3)

![Three lanes on one delay axis showing where the first, second and third retry can land. Capped exponential with no jitter puts every client at a single instant per attempt. Full jitter, random zero to one times the window, spreads attempts across widening windows from a 50 millisecond base to a 20 second cap. A gRPC policy multiplies each window by random 0.8 to 1.2 outside the cap, giving narrow bands.](figures/04-jitter-ladders.svg)

*The randomization, not the doubling, is what breaks the synchronized wave: an un-jittered ladder gives every caller the same instant to return. [[3]](#src-3), [[5]](#src-5), [[6]](#src-6)*

**Which variant matters less than whether one is present.** Full and equal jitter made roughly the same number of calls and decorrelated jitter more, and no variant changed the squared growth of total work in that model. [[3]](#src-3) The production formulas are small. A configured gRPC retry policy multiplies every computed delay by `random(0.8, 1.2)` outside the cap, so `maxBackoff` is a pre-jitter ceiling and a realized delay can land slightly above it; the multiplication is unconditional, and only a server pushback replaces the computed delay. [[5]](#src-5) The 2026 AWS SDK computes `random(0, 1) x min(20,000 ms, base x 2^retry)`, full jitter under a 20-second cap. [[6]](#src-6)

| System | Attempts | Delay shape | Jitter by default | Cap |
|---|---|---|---|---|
| resilience4j 2.4.0 [[12]](#src-12), [[13]](#src-13) | 3 attempts | constant 500 ms | no; `ofRandomized()` is opt-in | none set |
| Polly 8.8.0 [[15]](#src-15), [[16]](#src-16) | 3 retries | constant 2 s | no; `UseJitter` is false | `MaxDelay` null |
| gRPC, a configured A6 policy [[5]](#src-5) | `maxAttempts` from the service config, capped at 5 (a channel argument raises the cap) | exponential | yes, x `random(0.8, 1.2)` | `maxBackoff`, before jitter |
| AWS SDK, 2026 behaviour (opt-in until 2026-11) [[6]](#src-6), [[7]](#src-7) | 3 (4 for DynamoDB) | exponential, full jitter | yes | 20 s |

*Shipped retry defaults on the read date, 2026-10-14. Two widely used libraries default to a constant delay with randomization off, while both protocol-level implementations randomize every delay; gRPC retries only where a service config supplies a policy, though transparent retries of RPCs that never left the client need no policy at all. [[5]](#src-5), [[6]](#src-6), [[7]](#src-7), [[12]](#src-12), [[13]](#src-13), [[15]](#src-15), [[16]](#src-16)*

What the field ships is further from the documentation than the documentation suggests. A preprint dated 2026-08-26 surveyed 200 open-source Python microservice projects and detected explicit retry logic in 11.5 percent, with its authors estimating true prevalence near 41 percent after auditing their own false negatives. Among the projects where it was detected, 60.9 percent carried at least one configuration with no backoff, and **exactly 1 of 113 manually verified production configurations randomized its delay**. [[27]](#src-27) Service Control is the same gap outside a library: the correction Google published for it is an audit for randomized exponential backoff. [[1]](#src-1)

> **Assumption.** Jitter is the cheapest control in this post, because it adds no mode, no shared state and no new failure path, only a multiplication inside a delay that already exists. The sources measure what jitter does [[3]](#src-3) and what libraries default to [[12]](#src-12), [[15]](#src-15); ranking it first by cost is this post's bet.

## <a id="budget"></a>Amplification is bounded by a ratio, and only at the layer above the failure

**A per-call-site attempt cap bounds a call site; amplification is a property of the composition.** In a five-deep stack of service calls, the Builders' Library puts the load a struggling database at the bottom sees at 243 times normal, which makes it unlikely ever to recover, and recommends retrying at a single point in the stack for low-cost operations. [[2]](#src-2) The page writes three retries at each layer and its own walk-through counts three tries then nine, so the multiplier is three attempts per layer: 3 to the fifth.

![Left: a stack of five layers where three attempts at each multiply to 3, 9, 27, 81 and 243 times, with the bottom box reading database sees 243x. Right: one client at one layer, with a bar at just under 3x of its own request rate for three attempts with no budget, and a bar at about 1.1x once retries are held under 10 percent of its requests.](figures/05-amplification-funnel.svg)

*Three attempts per layer compound to 243x across five layers, while a 10 percent retry budget holds one client's own traffic to about 1.1x at one layer. Separate published scenarios, which do not compose. [[2]](#src-2), [[4]](#src-4)*

Google's SRE book reaches the bound from the traffic side. A per-request limit of three attempts alone pushes a client's attempted traffic to just under 3 times its request rate in the worst case, where a datacenter accepts few requests and rejects most; adding a rule that retries continue only while they stay under 10 percent of that client's requests reduces the growth of its own traffic to about 1.1 times. The companion rule is positional: **retry only at the layer immediately above the one rejecting**. The same chapter puts a bound on the other side of the call as well, client-side adaptive throttling, where a client begins rejecting its own requests locally once they reach twice the accepts it has seen over the last two minutes. [[4]](#src-4)

> **Derived.** A ratio composes better than a count but does not vanish: five layers each holding their own traffic to 1.1 times give 1.1 to the fifth, about 1.6 times, against 3 to the fifth, 243. The 1.1 figure bounds one client at one layer [[4]](#src-4); the exponentiation is this post's, and it is why the positional rule exists.

**Shipped implementations state that bound in three accounting units**, each scoped below the stack: retries in flight as a concurrency, retries as a share of a caller's own traffic, and a health-token balance that a failure spends and a success refills. Not one of the four below counts across a fleet.

| Bound | Accounting unit | Scope | Default |
|---|---|---|---|
| gRPC retry throttling [[5]](#src-5) | token balance: minus 1 per failure, plus `tokenRatio` per success | one channel, per server name | `maxTokens` up to 1000; stops at half the ceiling |
| AWS SDK retry quota [[6]](#src-6) | token balance: 14 tokens per transient retry, 5 per throttling | one SDK client instance, not shared across hosts | 500 tokens; drains above roughly 22 or 32 percent sustained failures at the default 3 attempts |
| Envoy retry budget [[8]](#src-8) | concurrency: share of active plus pending requests | one proxy's upstream cluster | 20 percent, with a floor of 3 concurrent retries |
| Client retry budget [[4]](#src-4) | share of traffic: retries against the client's own requests | one client's traffic at one layer | 10 percent, about 1.1x growth |

*Four bounds, their accounting unit and their scope. None is global: a token balance protects one client's view of one dependency, a concurrency bound one proxy's cluster, a share one caller's own traffic. [[4]](#src-4), [[5]](#src-5), [[6]](#src-6), [[8]](#src-8)*

> **Inference.** A retry quota is spent only by retries: a first-try success restores a token, a first attempt costs none, and the balance is typically scoped to one SDK client instance rather than shared across processes or hosts. [[6]](#src-6) So a fleet of restarting processes, each making first attempts against a fresh balance, spends no retry budget at all, which is why June's loop was ended by engineers throttling task creation rather than by any retry policy. [[1]](#src-1)

> **Inference.** A usable budget is three quantities: the attempts still allowed, the delay the next attempt would wait, and the time left on the caller's deadline. gRPC states the hard part, that the call deadline applies across all attempts and the RPC then fails "regardless of how many attempts were configured or attempted", whatever a server advised. [[5]](#src-5) Naming the three together is this post's rule; A6 is silent on a deadline expiring mid-backoff.

**The counter-evidence is strong enough to move the default.** Brooker's simulation of one failing service with 100 Poisson clients found three retries the most robust option and the most expensive, costing four times the work at a 100 percent failure rate, while a bucket that starts full depletes too slowly and a 0.1-token deposit per success behaves like about 0.1 retries when unhealthy, a scheme he calls "not modal in the same way". [[26]](#src-26) A 2026 preprint pushes further: in its hardest scenario, retrying measured worse than not retrying.

| Policy | Success rate | Amplification |
|---|---|---|
| No retries | 55.4 percent | 1.00 |
| Standard retry: exponential 100, 200 and 400 ms, with jitter | 41.5 percent | 1.34 |
| Standard retry with a breaker over it, tripping at 50 percent, open 30 s | 55.3 percent | 1.00 |
| Adaptive retry budgeting from 0.2 of base load | 54.9 percent | 1.01 |

*A naive policy lost 14 points of success rate and the two bounded policies recovered nearly all of it. Every row is 100 trials on one 5-tier linear chain at 50 percent utilization, with an idealized network and independently injected failures. [[39]](#src-39)*

## <a id="probe"></a>A breaker's most consequential default decides when it probes

A circuit breaker turns accumulated evidence into a stated position: this dependency is believed dead, and it will be probed deliberately rather than pestered continuously. Resilience4j's breaker holds three normal states, CLOSED, OPEN and HALF_OPEN, plus METRICS_ONLY, DISABLED and FORCED_OPEN, the last of which always rejects calls. [[11]](#src-11) **Hystrix, the library that made the pattern famous, is in maintenance mode at 1.5.18** and points new internal projects at resilience4j; separately, it describes Netflix's own shift toward adaptive implementations such as adaptive concurrency limits. [[32]](#src-32)

![State machine with CLOSED, OPEN and HALF OPEN. Closed to open is labelled resilience4j 50 percent of 100 calls and Polly 10 percent of 100 calls in 30 seconds. Open to half open is labelled resilience4j 60 seconds on a call and Polly 5 seconds on Execute, annotated no background timer. Half open to closed is labelled resilience4j 10 permitted calls whose rates are evaluated and Polly a probe on Execute. A grey row lists the resilience4j special states METRICS_ONLY, DISABLED and FORCED_OPEN.](figures/06-breaker-states.svg)

*Both libraries wait for a caller to supply the probe: the clock makes an open breaker eligible for half-open, and an arriving call makes the transition happen. [[11]](#src-11), [[14]](#src-14)*

**The defaults decide more than the design does.** Resilience4j ships a count-based sliding window of 100 calls, a `failureRateThreshold` of 50 percent, a `minimumNumberOfCalls` of 100 before that rate is evaluated at all, a `waitDurationInOpenState` of 60,000 ms, and 10 permitted calls in half-open whose failure and slow-call rates are then evaluated against the same thresholds. [[11]](#src-11) Polly breaks on a `FailureRatio` of 0.1 over a `MinimumThroughput` of 100 executions inside a 30-second sampling window, breaks for 5 seconds, and ignores the ratio when that throughput is not reached. [[14]](#src-14)

> **Two different windows.** Polly cannot open below 100 executions inside a 30-second sampling window; resilience4j opens only after 100 recorded calls, however long they take to arrive. [[11]](#src-11), [[14]](#src-14)

The non-obvious default is the exit from OPEN. Resilience4j's `automaticTransitionFromOpenToHalfOpenEnabled` is false, so **an open breaker moves to half-open only when a call is attempted**, not on a timer. [[11]](#src-11) Polly runs no background timer at all and documents the consequence: an application that calls `Execute` only when the circuit is closed never reaches HalfOpen, and so never probes. [[14]](#src-14)

> **Derived.** Resilience4j's documented wait in OPEN is a fixed 60,000 ms with no randomization of it, and half-open permits 10 calls. [[11]](#src-11) Instances whose breakers opened within the same second therefore become eligible on one clock, so the probe wave is 10 calls times the number of instances, with none of the spreading the jitter section asks of a retry ladder.

> **Inference.** On a dependency quieter than either window both defaults sit close to inert, and a caller that routes around an open circuit never supplies the probe that would close it. The same inertia is why a breaker fits June badly: a restarting Service Control task needs its first call to Spanner to succeed. [[1]](#src-1), [[11]](#src-11), [[14]](#src-14)

## <a id="partial"></a>Partial failure breaks the breaker's premise, and ejection helps only where the host is the failing unit

In sharded or cell-based systems failure is partial: **a breaker that trips on one overloaded shard's failures also hurts customers of the healthy shards**, and a breaker that does not trip does nothing useful. Underneath sits an epistemic limit. A client cannot reliably predict whether a specific call with specific parameters will succeed, and should not need to know the server's internals to decide. [[25]](#src-25)

| Kind | What the argument grants | What it asks for |
|---|---|---|
| Benefit | failing early instead of spending resources on calls that will fail | a prediction about a specific call, which a client cannot make reliably |
| Benefit | progressive degradation, dropping optional features whose service is down | a feature the product can run without |
| Three fixes | sharding-aware clients, per-key-range overload signals, statistical inference | server internals, a new server signal, or a per-client sample that trips at around half the expected rate [[26]](#src-26) |

*The two benefits a breaker still earns under partial failure, and the three fixes proposed for it, each with what it asks of someone. [[25]](#src-25), [[26]](#src-26)*

**Statistics is also where a breaker misreads its own evidence.** In the 100-client model it "starts tripping a little early: around half the expected rate", because each client samples failures independently; across runs splitting the same traffic over 10, 100 and 1,000 clients it trips too early, approaching the performance of no retries at all. [[26]](#src-26)

![Step chart of Envoy ejection time against consecutive ejections of one host: 30 seconds, 60, 90 and so on in 30 second steps, flattening at a dashed maximum of 300 seconds. A dotted descending path marks one step down per 10 second interval while the host stays healthy. A band across the top reads never more than 10 percent of hosts ejected, and a box notes that panic mode still routes to ejected hosts.](figures/07-ejection-decay.svg)

*Ejection escalates per host and unwinds on a clock, which is the part a fleet-wide trip cannot do: the penalty is proportional to one host's record and bounded to a tenth of the fleet. [[9]](#src-9), [[10]](#src-10)*

Envoy's outlier detection is the narrower instrument. Its defaults eject a host after 5 consecutive 5xx responses, check every 10 s, eject for a base of 30 s, never eject more than 10 percent of hosts, and cap ejection at 300 s; [[9]](#src-9) ejection time is that base multiplied by the host's consecutive ejections, falling one step per interval while the host stays healthy. [[10]](#src-10) The precondition is routing: **ejection helps only while the balancer has somewhere else to send the request** and the fleet has capacity to absorb it. Envoy's panic threshold names where that stops, at 50 percent of healthy hosts by default, below which it stops using health status and balances across all hosts, to "avoid a situation in which host failures cascade throughout the cluster as load increases". [[36]](#src-36)

> **Derived.** A host that has reached the 300-second cap needs about 300 / 30 x 10 s, roughly 100 seconds of health, to decay back to the 30-second base, since the multiplier drops one step per 10-second interval. The formula and the defaults are Envoy's [[9]](#src-9), [[10]](#src-10); the arithmetic is this post's.

Where the failing unit is not a host, ejection removes nothing: a shard or key range that every host fronts fails through all of them, which is the case Brooker's objection is about, [[25]](#src-25) and the case June presented, a Spanner table every Service Control task shared. [[1]](#src-1) The Builders' Library argues against the modal instrument on principle, holding that breakers add modal behaviour that is hard to test and can significantly lengthen recovery, with a token bucket as the lower-risk alternative. [[2]](#src-2) The position the evidence earns is narrower than either side. In the preprint's single five-tier topology a breaker layered over the retry policy recovered almost the whole loss and matched adaptive budgeting, [[39]](#src-39) while the objection that defeats breakers concerns sharded systems that topology does not model, so what decides the instrument is **whether the breaker's scope matches the population that is actually failing**.

## <a id="stated-delay"></a>The dependency's stated delay bounds the local ladder, where there is one

When a dependency states when to come back, that time bounds what the caller computed, and the oldest form of the signal is the thinnest. RFC 9110 defines `Retry-After` as an HTTP-date or delay-seconds, sent "to indicate how long the user agent ought to wait", and section 10.2.3 gives the field a meaning in two cases only: on a 503 it states how long the service expects to be unavailable, and on a 3xx it states the minimum time the user agent is asked to wait before reissuing. 429 is not mentioned in that section. [[17]](#src-17) The status code that most needs it was defined elsewhere: RFC 6585 says a 429 response MAY include `Retry-After`, so **a rate-limited client has no guarantee of being told when to return**. [[18]](#src-18)

```http
Retry-After: 120
Retry-After: Wed, 14 Oct 2026 19:00:00 GMT
```

The draft meant to close that gap is careful about clocks. The IETF RateLimit header fields define a `RateLimit` field whose `r` parameter is the remaining quota and whose `t` parameter is the effective window in seconds, an integer rather than a timestamp, which avoids clock-sync problems, alongside a `RateLimit-Policy` field whose parameters clients MAY ignore. Where both appear, `Retry-After` MUST take precedence, and **the specification mandates no retry or backoff algorithm**. [[19]](#src-19)

| Signal | What it carries | Standards status | What the client is told | Who jitters |
|---|---|---|---|---|
| `Retry-After` on 503 [[17]](#src-17) | HTTP-date or delay-seconds | RFC 9110, 2022-06 | how long the service expects to be unavailable; no client rule | unstated |
| `Retry-After` on 429 [[18]](#src-18) | the same grammar, if sent | RFC 6585, 2012-04, MAY include | nothing guaranteed; the field may be absent | unstated |
| `RateLimit` `r` and `t` [[19]](#src-19) | remaining quota, window in seconds | Internet-Draft 11, expires 2026-11-24 [[20]](#src-20) | quota state; no algorithm mandated, and `Retry-After` wins | server, per the draft |
| `grpc-retry-pushback-ms` [[5]](#src-5) | exact delay in ms; negative means stop | gRFC A6, 2024-08-23 | retry after exactly that, then reset the ladder | server |
| `x-amz-retry-after` [[6]](#src-6) | delay in milliseconds | vendor header | clamp between the computed backoff and backoff plus 5,000 ms | server; the SDK adds none |

*Five ways a dependency can state its own delay, and what each tells the client. Only two sit in published RFCs and the broadest of the five is a draft; of the two vendor signals, gRPC's pushback binds the client to an exact delay while the AWS header only clamps the delay the client computed. [[5]](#src-5), [[6]](#src-6), [[17]](#src-17), [[18]](#src-18), [[19]](#src-19), [[20]](#src-20)*

The draft also names the failure a stated time creates. Delay-seconds rather than a timestamp mitigates the risk related to thundering herd, and the security considerations warn that **many throttled clients would otherwise return at the same moment**, with jitter on the effective window as the mitigation. Its client advice fits one line: a positive remaining quota guarantees nothing, and advertised windows beyond ten minutes deserve their own threshold. [[19]](#src-19)

```http
HTTP/1.1 429 Too Many Requests
RateLimit: "default";r=0;t=12
RateLimit-Policy: "default";q=100;w=60
Retry-After: 12
```

**Two of the three fields a careful client would want are unfinished.** The RateLimit fields are an active Internet-Draft at revision 11 of 2026-05-23, IESG state "I-D Exists", expiring 2026-11-24. [[20]](#src-20) The `Idempotency-Key` header draft, whose abstract offers fault tolerance for non-idempotent methods such as POST and PATCH, reached revision 07 on 2025-10-15 and is now Expired. [[21]](#src-21) The delay signal is standardized, the quota signal is a draft with a month left on it, and the replay-safety signal has expired. No such channel existed in June, where the signal in that path was a process exit, which carries no schedule. [[1]](#src-1)

## <a id="durable"></a>Durable retry is a schedule, and the restart ladder is its loudest instance

**A retry that must survive the process is a scheduled item**: a persisted next-attempt time and an attempt count, compared against a clock. Temporal makes that the default for Activities, with a 1 second initial interval, a coefficient of 2.0, a maximum interval of 100 times the initial and unlimited attempts, while Workflow Executions carry no retry policy at all and Workflow Tasks back off outside the policy up to 10 minutes. [[31]](#src-31)

![Two restart ladders on one ten minute axis. The kubelet default, 10 seconds doubling to a 300 second cap, places 5 restarts in ten minutes and resets only after 10 minutes healthy. The alpha proposal, 1 second initial with a 60 second cap, places 14 restarts in the same window and costs about 10 times more pod state transition requests at peak in the KEP's model.](figures/08-crashloop-ladder.svg)

*Derived: 5 restarts against 14 in the first ten minutes, from the cumulative ladders (10, 30, 70, 150 and 310 s against 1, 3, 7, 15, 31, 63 s and then every 60 s), counted from the first crash and excluding container start time. The 10x request figure is the KEP's model, the QPS figures below its measured benchmark. [[22]](#src-22), [[23]](#src-23)*

The kubelet's CrashLoopBackOff ladder is the same machinery with a louder argument around it. It grows exponentially from 10 s through 20 s and 40 s, is capped at five minutes, and resets only after a container has run 10 minutes, twice the maximum, without problems. The cost of the fast end is measured: a benchmark of 110 instantly crashing single-container pods on one node saw `/pods` API traffic peak near the kubelet's roughly 5 QPS client limit before settling around 2 QPS, with container runtime CPU about 10 times higher and kubelet and API server CPU each about twice. The counter-argument sits in the same document: exponential decay mainly protects against unrecoverable failures, and **frequent restarts can starve the kubelet and in extreme cases crash nodes**. [[22]](#src-22)

```yaml
# KubeletConfiguration, kubelet.config.k8s.io/v1beta1
crashLoopBackOff:
  maxContainerRestartPeriod: 60s      # minimum 1s, maximum 300s
featureGates:
  KubeletCrashLoopBackOffMax: true    # beta and on by default since 1.35
```

**What shipped is two features rather than one proposal**: the configurable per-node maximum is beta and on by default since 1.35, while the cluster-wide cut to a 1 s initial and 60 s maximum delay is alpha and off by default since 1.33. [[40]](#src-40) The field is `crashLoopBackOff.maxContainerRestartPeriod`, documented with a minimum of 1 second and a maximum of 300 seconds, [[37]](#src-37) and zero was ruled invalid on evidence: a 0 second maximum raised API server QPS up to 30 times in a stress test. [[23]](#src-23)

> **Inference.** Service Control's crash loop is this machinery one level up: binaries restarting against a shared database rather than against a node's kubelet, where the restart rate was the load. The report records the restarts and the missing randomized backoff, not the ladder they ran on. [[1]](#src-1), [[22]](#src-22)

## <a id="stopping"></a>Stopping is a first-class outcome, and the HTTP conventions can barely name it

Retry machinery is judged by how it stops, and five endings are distinguishable in design. They describe one logical operation, the call the caller asked for, rather than a single attempt, and they cover the endings the retry loop itself produces; a caller that cancels ends the call from outside the loop. Succeeding after N attempts is one of them, and N still matters, because **a dependency needing three attempts per call is degraded even when every call eventually lands**.

> **Inference.** The five-state set is this post's framework, reasoned from the sources rather than measured: each state appears in some system's behaviour [[5]](#src-5), [[6]](#src-6), [[8]](#src-8), [[31]](#src-31), but no source enumerates them and no convention names them. The budget they are measured against is the pair named earlier: attempts still allowed, and time left on the caller's deadline.

```python
# the five ways one logical operation stops, named so it can be recorded
TERMINAL = ("succeeded_after_n",   # N attempts, and N is itself a signal
            "exhausted",           # the attempt allowance ran out
            "over_budget",         # next delay or deadline, whichever ends it
            "reclassified",        # permanence arrived, or a server said stop
            "denied_by_breaker")   # policy refused this attempt
```

Against those five, OpenTelemetry's HTTP conventions offer one signal. The span conventions define `http.request.resend_count`, stable, as "the ordinal number of request resending attempt (for any reason, including redirects)", recommended if and only if the request was retried and counted regardless of cause. [[29]](#src-29) **The HTTP metrics conventions carry nothing**: searching them for "resend", "retry" and "attempt" on 2026-10-14 returns no match, and the page does not say whether `http.client.request.duration` includes time spent on retries. [[30]](#src-30) The gap belongs to those conventions rather than to telemetry at large: gRPC measures per attempt as well as per call, and adds four per-call retry instruments including `grpc.client.call.retries`, all experimental and off by default. [[38]](#src-38)

| Terminal state | Evidence that produces it | What exists today |
|---|---|---|
| Succeeded after N attempts | a later attempt returned success | `http.request.resend_count`, counted for any resend [[29]](#src-29) |
| Exhausted | the attempt allowance ran out | no standard signal; in SQS, a dead-letter queue after `maxReceiveCount` receives [[33]](#src-33) |
| Over budget | the next delay, or the caller's deadline, ends it first | no standard signal; gRPC fails the call once the deadline passes [[5]](#src-5) |
| Reclassified | an attempt returned evidence of permanence, or the server stated a refusal to retry | no standard signal; Temporal records a non-retryable type [[31]](#src-31), and a negative `grpc-retry-pushback-ms` means stop [[5]](#src-5) |
| Denied by a breaker | policy refused this attempt, whatever earlier ones reached | the breaker's state; under an Envoy retry budget, capacity is not in stats [[8]](#src-8) |

*The five terminal states against what a standard HTTP pipeline can record today. One signal counts attempts, nothing standard names an ending, and the counter cannot separate a retry from a redirect. [[5]](#src-5), [[8]](#src-8), [[29]](#src-29), [[31]](#src-31), [[33]](#src-33)*

> **Derived.** With no standard signal for an ending, the nearest available amplification figure is arithmetic on the counter that does exist: per logical call, the largest `http.request.resend_count` plus one is the attempt count, and the mean of that across calls is the retry amplification factor the preprint defines. [[27]](#src-27), [[29]](#src-29) Because the counter also counts redirects and authorization challenges, the figure runs high wherever those occur.

**Durable engines do better and still hide the middle of the ladder**: Temporal keeps Activity attempts out of Event History until the Activity ends, [[31]](#src-31) and Envoy stops tracking remaining retry capacity in stats once a budget replaces the count. [[8]](#src-8) June's loop reached none of the five states, because the restarts ended when engineers throttled task creation by hand. [[1]](#src-1)

## <a id="close"></a>Spacing without a bound is half the control

The report's own account of 2025-06-12 is the argument in one clause: restarting Service Control tasks overloaded the underlying Spanner table, and "Service Control did not have the appropriate randomized exponential backoff implemented to avoid this", with full resolution in one of the larger regions taking up to about 2 hours 40 minutes from the start. [[1]](#src-1) **The gap between a bounded and an unbounded policy is orders of magnitude, not percent**: three attempts at each of five layers put 243 times the load on the database at the bottom, while a 10 percent per-client budget holds one client's own traffic to about 1.1 times at one layer. [[2]](#src-2), [[4]](#src-4) Exactly 1 of 113 verified production retry configurations randomized its delay, [[27]](#src-27) and two widely used libraries still default to a constant delay with randomization off. [[12]](#src-12), [[15]](#src-15)

| Control | What it bounds | A shipped default | Where it fails |
|---|---|---|---|
| Bounded attempts (a cap on tries per call) | work at one call site | 3 attempts (resilience4j, AWS SDK) | says nothing about the stack: 243x across five layers [[2]](#src-2) |
| Jittered delay (randomized spacing) | correlation between callers | off in resilience4j and Polly; on in gRPC and in the AWS 2026 behaviour, opt-in until November 2026 [[7]](#src-7) | cuts realized calls by more than half at 100 clients, but the squared growth of total work with contention is unchanged in that model [[3]](#src-3) |
| Client retry budget (retries as a share of a caller's own traffic) | one client's amplification at one layer | 10 percent per client, about 1.1x growth [[4]](#src-4) | needs per-client accounting a call site does not have |
| Token bucket (a balance spent per retry, refilled per success) | sustained retry rate per client or channel | 500 tokens, 14 per transient retry; gRPC stops retrying once the bucket falls to half its ceiling [[5]](#src-5), [[6]](#src-6) | a bucket that starts full drains too slowly, and first attempts spend nothing [[6]](#src-6), [[26]](#src-26) |
| Circuit breaker (a stated position that a dependency is down) | calls to a dependency believed dead | 50 percent of 100 calls, 60 s open (resilience4j) [[11]](#src-11) | partial failure: trips on one shard and punishes callers of healthy ones [[25]](#src-25); strong where its scope matches the failing population [[39]](#src-39) |
| Per-host ejection (removing one bad host from load balancing) | blast radius, to one host | 5 consecutive 5xx, 30 s base, max 10 percent of hosts [[9]](#src-9) | panic mode, Envoy routing to all hosts once fewer than half are healthy, still routes to ejected ones [[10]](#src-10), and a shared shard is not a host |
| Server-stated delay (the dependency names the wait) | when the client returns | `Retry-After`, `grpc-retry-pushback-ms`, `x-amz-retry-after` | a 429 MAY carry no `Retry-After` [[18]](#src-18); the RateLimit fields are unfinished [[19]](#src-19) |
| Admission control where work enters (a cap on work accepted) | the work the failing system takes in | no library default: task creation throttled [[1]](#src-1), work rate limited by queue size [[28]](#src-28), adaptive throttling, a client rejecting locally at twice the accepts it saw [[4]](#src-4) | refuses work a caller still needs, and only a point that sees every caller can apply it |

*The eight controls this post compared, each with a shipped default and the case it does not cover. Nothing here is new; every number was established above. [[1]](#src-1), [[2]](#src-2), [[3]](#src-3), [[4]](#src-4), [[5]](#src-5), [[6]](#src-6), [[7]](#src-7), [[9]](#src-9), [[10]](#src-10), [[11]](#src-11), [[18]](#src-18), [[19]](#src-19), [[25]](#src-25), [[26]](#src-26), [[28]](#src-28), [[39]](#src-39)*

Both incidents ended where the work enters rather than where it is retried: task creation throttled by hand in June, [[1]](#src-1) incoming work throttled in October and then rate limited by the size of the waiting queue in the published remediation. [[28]](#src-28) Of the seven forward-looking items Google published, the one belonging to this subject is a commitment to audit its systems for randomized exponential backoff. [[1]](#src-1) **Client spacing and client bounds shorten a storm; a bound where the work enters is what ends it.**

1. List every retry site and write two things beside it: whether a repeat is safe to apply twice, and which of the four classes it treats. A site with no class treats all four alike. [[6]](#src-6), [[17]](#src-17)
2. Turn jitter on where the library ships it off: `IntervalFunction.ofRandomized()` in resilience4j 2.4.0, `UseJitter` true in Polly 8.8.0. Neither adds a mode or shared state. [[12]](#src-12), [[15]](#src-15)
3. Keep the per-site cap and add what it cannot give: a ratio on retries as a share of a caller's traffic, about 1.1 times at 10 percent, and retries only at the layer above the rejecting one. [[4]](#src-4)
4. Name which terminal state each loop's stopped attempt reaches, then check what records it. The HTTP conventions offer a resend counter and no ending, and the mean of the largest resend count plus one is the nearest amplification figure. [[29]](#src-29), [[30]](#src-30)

The uncomfortable part of the evidence is that retrying can be the worse choice: in the preprint's hardest scenario a naive policy measured 41.5 percent success against 55.4 percent with no retries, on one simulated five-tier chain whose authors list a single topology among their limits. [[27]](#src-27), [[39]](#src-39) That is not an argument for removing retries, but for what the Service Control report asked for in one clause: **a system-level audit of how every lane in the failure path spaces, counts and stops its attempts**.

## Sources

1. <a id="src-1"></a>Google Cloud, "Google Cloud Service Health incident ow5i3PPK96RduMcb1SsW: multiple GCP products returned 503 errors (full Incident Report)", 2025-06-13, read 2026-10-14. https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW
2. <a id="src-2"></a>Amazon Web Services, "Timeouts, retries, and backoff with jitter" (Amazon Builders' Library), 2026-06-15, read 2026-10-14. https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter
3. <a id="src-3"></a>Marc Brooker, "Exponential Backoff And Jitter", AWS Architecture Blog, 2015-03-04 (updated 2023-05). https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
4. <a id="src-4"></a>Google, "Site Reliability Engineering, chapter 21: Handling Overload", 2016. https://sre.google/sre-book/handling-overload/
5. <a id="src-5"></a>gRPC (grpc/proposal), "gRFC A6: gRPC Retry Design", last updated 2024-08-23, re-read 2026-10-14. https://github.com/grpc/proposal/blob/master/A6-client-retries.md
6. <a id="src-6"></a>Amazon Web Services, "Retry behavior" (AWS SDKs and Tools Reference Guide), read 2026-10-14. https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html
7. <a id="src-7"></a>Matthew Miller, "Announcing updated retry behavior for AWS SDKs and Tools", AWS Developer Tools Blog, 2026-05-20. https://aws.amazon.com/blogs/developer/announcing-updated-retry-behavior-for-aws-sdks-and-tools/
8. <a id="src-8"></a>Envoy Proxy, "Circuit breakers" (v3 API reference, build 1.41.0-dev-35ef06), read 2026-10-14. https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/cluster/v3/circuit_breaker.proto
9. <a id="src-9"></a>Envoy Proxy, "Outlier detection" (v3 API reference, build 1.41.0-dev-35ef06), read 2026-10-14. https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/cluster/v3/outlier_detection.proto
10. <a id="src-10"></a>Envoy Proxy, "Outlier detection" (architecture overview), read 2026-10-14. https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier
11. <a id="src-11"></a>Resilience4j, "Getting started with resilience4j-circuitbreaker", read 2026-10-14. https://resilience4j.readme.io/docs/circuitbreaker
12. <a id="src-12"></a>Resilience4j, "Getting started with resilience4j-retry", read 2026-10-14. https://resilience4j.readme.io/docs/retry
13. <a id="src-13"></a>GitHub, "Releases, resilience4j/resilience4j" (v2.4.0 latest), read 2026-10-14. https://github.com/resilience4j/resilience4j/releases
14. <a id="src-14"></a>Polly, "Circuit breaker resilience strategy", read 2026-10-14. https://www.pollydocs.org/strategies/circuit-breaker
15. <a id="src-15"></a>Polly, "Retry resilience strategy", read 2026-10-14. https://www.pollydocs.org/strategies/retry
16. <a id="src-16"></a>GitHub, "Releases, App-vNext/Polly" (8.8.0 latest), read 2026-10-14. https://github.com/App-vNext/Polly/releases
17. <a id="src-17"></a>IETF (RFC Editor), "RFC 9110: HTTP Semantics", sections 9.2.2 (Idempotent Methods) and 10.2.3 (Retry-After), 2022-06, read 2026-10-14. https://www.rfc-editor.org/rfc/rfc9110.html
18. <a id="src-18"></a>IETF (RFC Editor), "RFC 6585: Additional HTTP Status Codes", section 4 (429 Too Many Requests), 2012-04. https://www.rfc-editor.org/rfc/rfc6585.html
19. <a id="src-19"></a>IETF HTTPAPI Working Group, "RateLimit header fields for HTTP, draft-ietf-httpapi-ratelimit-headers-11", 2026-05-23. https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.html
20. <a id="src-20"></a>IETF, "draft-ietf-httpapi-ratelimit-headers" (Datatracker document page), revision 11 of 2026-05-23, read 2026-10-14. https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
21. <a id="src-21"></a>IETF, "draft-ietf-httpapi-idempotency-key-header" (Datatracker document page), revision 07 of 2025-10-15, read 2026-10-14. https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
22. <a id="src-22"></a>Kubernetes (SIG Node), "KEP-4603: Tune CrashLoopBackOff", 2025-10-29. https://www.kubernetes.dev/resources/keps/4603/
23. <a id="src-23"></a>Kubernetes (SIG Node), "KEP-5593: Configure the max CrashLoopBackOff delay", 2025-10. https://www.k8s.dev/resources/keps/5593/
24. <a id="src-24"></a>USENIX, "Metastable Failures in the Wild" (OSDI '22), 2022-07, abstract re-read 2026-10-14. https://www.usenix.org/conference/osdi22/presentation/huang-lexiang
25. <a id="src-25"></a>Marc Brooker, "Will circuit breakers solve my problems?", Marc's Blog, 2022-02-16. https://www.brooker.co.za/blog/2022/02/16/circuit-breakers.html
26. <a id="src-26"></a>Marc Brooker, "Fixing retries with token buckets and circuit breakers", Marc's Blog, 2022-02-28, re-read 2026-10-14. https://brooker.co.za/blog/2022/02/28/retries.html
27. <a id="src-27"></a>Rishabh Mehan and Jasmit Kaur Saluja, "Retry Amplification in Distributed Systems: A Systematic Analysis of Retry Policies and Their Role in Cascading Failures" (abstract page), arXiv, 2026-08-26. https://arxiv.org/abs/2608.25403
28. <a id="src-28"></a>Amazon Web Services, "Summary of the Amazon DynamoDB Service Disruption in Northern Virginia (US-EAST-1)", 2025-10, re-read 2026-10-14. https://aws.amazon.com/message/101925/
29. <a id="src-29"></a>OpenTelemetry, "Semantic conventions for HTTP spans" (links to specification v1.59.0), read 2026-10-14. https://opentelemetry.io/docs/specs/semconv/http/http-spans/
30. <a id="src-30"></a>OpenTelemetry, "Semantic conventions for HTTP metrics", read 2026-10-14. https://opentelemetry.io/docs/specs/semconv/http/http-metrics/
31. <a id="src-31"></a>Temporal, "Retry Policies" (Temporal documentation), read 2026-10-14. https://docs.temporal.io/encyclopedia/retry-policies
32. <a id="src-32"></a>GitHub / Netflix, "Netflix/Hystrix" (repository README), read 2026-10-14. https://github.com/Netflix/Hystrix
33. <a id="src-33"></a>Amazon Web Services, "Using dead-letter queues in Amazon SQS", read 2026-10-14. https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html
34. <a id="src-34"></a>Nathan Bronson, Abutalib Aghayev, Aleksey Charapko and Timothy Zhu, "Metastable failures in distributed systems", HotOS 2021, ACM, pages 221 to 227, doi:10.1145/3458336.3465286, 2021-06-01; bibliographic record read 2026-10-14. https://pure.psu.edu/en/publications/metastable-failures-in-distributed-systems/
35. <a id="src-35"></a>Marc Brooker, "Metastability and Distributed Systems", Marc's Blog, 2021-05-24, read 2026-10-14. https://brooker.co.za/blog/2021/05/24/metastable/
36. <a id="src-36"></a>Envoy Proxy, "Panic threshold" (architecture overview, load balancing), read 2026-10-14. https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/panic_threshold
37. <a id="src-37"></a>Kubernetes, "Kubelet Configuration (v1beta1) API reference", CrashLoopBackOffConfig, read 2026-10-14. https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/
38. <a id="src-38"></a>gRPC, "OpenTelemetry Metrics" (gRPC documentation), read 2026-10-14. https://grpc.io/docs/guides/opentelemetry-metrics/
39. <a id="src-39"></a>Rishabh Mehan and Jasmit Kaur Saluja, "Retry Amplification in Distributed Systems" (full text, v1), arXiv, 2026-08-26, read 2026-10-14. https://arxiv.org/html/2608.25403v1
40. <a id="src-40"></a>Kubernetes, "Feature Gates" (reference), read 2026-10-14. https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/
