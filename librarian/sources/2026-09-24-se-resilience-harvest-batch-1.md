---
source: batch
kind: harvest-batch (6 sources, one domain, parallel miners, AUTO mode)
domain: software-engineering
mined_on: 2026-09-24
queue_rows: [SEC-004, SEC-033, SEC-034, SEC-044, SEC-045, SEC-046]
parked_same_pass: []
harvest_skill: 0.5.2
miners: 7 lanes for 6 rows (cap 5 + top-up; SEC-033 re-dispatched once on a second fetch route); proposals only; single-writer landing
fetches: 16 (SEC-033 3 + 2 on the retry, SEC-004 3, SEC-034 3, SEC-044 3, SEC-045 2, SEC-046 3)
extracted: 92
accepted: 0
specs_banked: 8 (consolidated from 17 miner content rows)
already_covered: 42
declined: 0
leads: 16
untriaged: 15
dispatched: 0
applied: 0
shipped: 0
run_id: hv-auto-0924
siblings: 1 (hygiene run, fleet-wide, disjoint from these subjects)
---

# software-engineering resilience harvest batch 1: nothing owned the dependency that was configured and went down

Six queued rows from `software-engineering / core`, admitted against live needles:
`error-handling` (20 attention points, 5 consumer deviations), `retry-backoff` (4 points,
1 deviation), and the coverage-gaps line on third-party degradation, whose refill note
says runtime degradation of a *configured* dependency has no owning subject. Rows aimed
at subjects scoring 0 (migrations, audit-logging, published-surfaces) were left queued.
Parked none.

**Mode: auto, nobody present.** Catches, currency and leads land. Content for an existing
subject and every new subject is banked as a spec in
[`harvest/specs.md` section 4](../harvest/specs.md) for the next attended pass, and nothing
is auto-declined. So `accepted: 0` is the mode working as designed, not a dry batch.

Expected yield, said before mining: mostly catches, because the target subjects are mature
(9 to 11 techniques each) and Brooker's personal archive was mined on 2026-08-31. Also a
few currency citations, leads, and one to two content rows, which bank. That held with
two corrections. **Currency was 0, not "a few":** no technique in these subjects carries an
external citation or a `verified_on` a 2019 to 2022 source could move, so there was no
clock to reset. **Content was larger than expected:** the gap line was real and three
sources from two publishers converged on it.

A source ORIGINATES a finding. It never AUTHORIZES one.

## The finding

**The gap is confirmed from the corpus side, in the corpus's own words.**
`optional-dependency-degradation` says, under what it owns: "If the dependency is
configured and the call failed, that is error handling." But `error-handling` owns only the
failure's shape, and `circuit-breakers` stops at "degrade to trying". Nothing says what the
product does while a configured dependency is down.

- AWS Well-Architected REL05 (SEC-044) supplies the posture per failure mode and the
  consistency-or-availability discriminator.
- Google BSRS ch.8 (SEC-045) supplies criticality-ranked degradation, three reliability
  tiers, and the rule that the caller chooses the failover.
- Gabrielson (SEC-033) supplies the boundary: **dropping a soft output is degradation;
  rebuilding the same output another way is a fallback.** For a configured critical
  dependency, harden the primary or let the caller retry.

Dedupe by author: SEC-033, SEC-034 and SEC-044 are one publisher (Amazon), SEC-045 is
Google. So the convergence is two independent voices, not four. Banked as a new-subject
spec (specs.md 4a).

**The second convergence: no technique requires a timeout to exist.** The corpus classifies
a timeout, retries it and trips a breaker on it. But only the IPC wrapper (`call-wrapping`)
said every outbound call must *have* one. Two independent publishers state that rule and
disagree usefully about where the number comes from:

- Brooker (SEC-004): derive it from the downstream latency percentile that matches an
  acceptable false-timeout rate.
- de Water (SEC-046): cap it at what the waiting user will tolerate. Start at 1 s connect
  and 5 s read, then tune down from monitoring.

The technique should carry both constraints (specs.md 4b). It also closes lead 5 of
[[2026-08-31-brooker-blog]] (nothing owned the deadline *on* an attempt), but that is a
same-author second sighting and adds no independent support.

## Banked as specs (auto mode; see specs.md section 4)

| spec | shape | target | from |
| --- | --- | --- | --- |
| 4a | new subject | `backend-platform/resilience/` (slug for the forge: configured-dependency degradation) | SEC-044 r1-3, SEC-045 r1, SEC-033 r1-3 |
| 4b | new technique | `retry-backoff` (explicit per-attempt timeouts) | SEC-004 r1-4 and r18, SEC-046 r1-2, SEC-044 BP05 title |
| 4c | amendment | `retry-backoff/circuit-breakers` (a breaker is a mode; operator provenance) | SEC-004 r5, SEC-045 r2, SEC-046 r5 |
| 4d | amendment | `retry-backoff/error-classification-for-retry` (propagation window) | SEC-004 r6 |
| 4e | amendment | `retry-backoff/storm-control` (the failure mode does no more work than the normal mode) | SEC-034 r4, SEC-033 r4-5 |
| 4f | amendment | `retry-backoff/retry-observability` (latency per outcome, never blended) | SEC-046 r3 |
| 4g | new technique | `scale-investment-timing` (provision for the lost domain) | SEC-034 r1-2, SEC-033 r11-12 |
| 4h | amendment | `model-routing/failover-path-liveness` (continuous-exercise instruments; steady traffic is a capacity alarm) | SEC-045 r3-4, SEC-033 r6 |

## Per source

### SEC-004 - Brooker, "Timeouts, retries, and backoff with jitter" (Amazon Builders' Library, 2019)

- **Class:** first-party practitioner account, hybrid. A house-practice essay half, plus a
  first-person operating half (a 20 ms timeout that fired only after deploys).
- **Fetch route:** the URL redirects to a client-rendered builder.aws.com shell. The
  readable copy is the Builders' Library PDF on d1.awsstatic.com. 2326 words.
- **21 extracted:** 3 banked (4b, 4c, 4d), 10 caught, 2 leads, 3 untriaged.
- **Caught:**
  - single-layer retry and 243x amplification (`storm-control`, which already says 27x)
  - cap vs exhaustion, and jitter on every scheduled delay (`backoff-design`)
  - ambiguous-timeout idempotency (`error-classification-for-retry`, `durable-retries`)
  - identity-seeded jitter and round-number clustering (`scheduling/next-run-computation`)
  - "retries are selfish" (the retry-backoff golden path)
- **Tier conflict, recorded and not voted on:** the 2019 text says an empty retry bucket
  degrades to a fixed rate. The SDK tree pinned in `node--storm-control` refuses. The tree
  wins.
- **Contradiction found for 4d:** `error-handling/taxonomy-design` lists not-found as
  permanent with no condition. Eventual consistency makes it transient for a bounded
  window after the caller's own write.
- The consumer deviation ("refusal classification erased at the caller boundary"): the
  source is silent. `storm-control` already owns that rule.

### SEC-033 - Gabrielson, "Avoiding fallback in distributed systems" (Amazon Builders' Library, 2019)

- **Class:** first-party practitioner account. It includes Amazon's own ~2001 outage: every
  cache failed at once, the fallback sent every web server straight to a shared database,
  and that locked up the site and every fulfillment center.
- **Fetch route:** the first lane got **0 words**, because builder.aws.com serves a
  JavaScript page shell. The re-dispatched lane read the PDF (3086 words) on its first
  call.
- **13 extracted:** 3 banked (the 4a boundary, 4e, 4h), 6 caught, 2 leads, 3 untriaged.
- **Recall-based candidates, rechecked against the text:**
  - "keep the fallback exercised": confirmed and refined into an instrument that *removes*
    the switch-over (4h).
  - "retries are not fallback": **refuted as worded**. The article says retries can
    *become* a rarely exercised mode, which is why it alarms on the retry rate. That is
    covered by `retry-observability`.
- **Caught:**
  - untested fallback code (`failover-path-liveness`, `fallback-retirement-condition`)
  - a correlated trigger cannot be injected singly (`storm-control`, "test the storm")
  - error logging as fallback load (`storm-control` warn-once latching)
  - pre-allocation and push-ahead data (folded into 4g)

### SEC-034 - Weiss and Furr, "Static stability using Availability Zones" (Amazon Builders' Library)

- **Class:** first-party practitioner account, hybrid with vendor prescriptive guidance.
- **Fetch route:** served directly, with no redirect. The lane also read Well-Architected
  REL11-BP05, a higher tier from the same vendor. About 3800 words.
- **10 extracted:** 2 banked (4g, 4e), 2 caught, 2 leads, 2 untriaged.
- **The half that sounds new was already here:** "the data plane keeps running on the last
  state the control plane gave it" is `last-value-degradation` plus
  `control-plane-off-the-data-path`, stated better (age bounds, provenance).
- **What was missing is the capacity half,** which `scale-investment-timing` had explicitly
  deferred to "different evidence" nobody owned. With N domains, the per-domain ceiling is
  (N-1)/N: 3 domains means +50% capacity and each domain at about 66%.

### SEC-044 - AWS Well-Architected Reliability Pillar REL05 (hub + BP01 + BP07)

- **Class:** vendor documentation. The queue guessed vendor repository, but there is no
  repository. It is primary tier and checklist-shaped, densest in its anti-pattern bullets.
  About 2000 words.
- **14 extracted:** 3 banked (all in 4a: failure-mode posture; emergency levers with a
  deactivation criterion as well as an activation one; the config-store outage ladder),
  7 caught, 1 lead, 1 untriaged. Its two other leads (client timeouts, static stability)
  were answered inside this batch by SEC-004/046 and SEC-034.
- **A primary source misnamed the breaker state:** BP01 says a timing-out dependency makes
  the breaker switch "to a closed state where no additional call are made". Closed is
  normal traffic. `circuit-breakers` has it right. Tier decides who may authorize a rule,
  not whether the wording is correct.
- **Caught:**
  - failed refresh keeps state (`swr-design`, `last-value-degradation`)
  - partial results and per-item batch outcomes (`capability-honest-refusal`,
    `durable-retries`)
  - telemetry sink down (`best-effort-with-accounting`)
  - tested degraded path (`failover-path-liveness`)
  - breaker (`circuit-breakers`)
  - BP02-04 at title level (`rate-limiting`, `storm-control`, `depth-bounds-and-shed`)

### SEC-045 - Google, Building Secure and Reliable Systems ch.8 "Design for Resilience" (2020, free text)

- **Class:** first-party practitioner account, hybrid: a doctrine half, an operating half
  (Google's own systems), and a security half. 14528 words.
- **16 extracted:** 4 banked (4a, plus the 4c provenance rule and the two 4h amendments),
  8 caught, 4 leads. The security and deployment halves are untriaged, with anchors (below).
- **Caught:**
  - per-resource fail open or closed (the `rate-limiting` golden path;
    `authorization/failure-direction`)
  - shedding by class (`depth-bounds-and-shed`)
  - reporting shed levels (`limit-observability`)
  - retry amplification (`storm-control`)
  - cached, not blank (`swr-design`)
  - automation caps (`strategy-selection`, `blast-radius-bounds`)
  - unused alternates rot (`failover-path-liveness`)
  - restart coupling (`health-checks`)

### SEC-046 - de Water, "10 Tips for Building Resilient Payment Systems" (Shopify, 2022-07-28)

- **Class:** first-party practitioner account, shaped as a listicle. Its operating half is
  first-party (1 s / 5 s timeouts, a breaker keyed on host + port + merchant country, a
  stub gateway for load tests). Its relay half repeats the SRE book and queueing theory.
  2958 words.
- **Corroboration fetched in-lane:** Go's net/http docs ("A Timeout of zero means no
  timeout") and the SRE book's monitoring chapter ("a slow error is even worse than a fast
  error").
- **18 extracted:** 2 banked (4b, 4f), 9 caught, 4 leads, 3 untriaged.
- **Correction to the queue row:** breakers are keyed finer than "per endpoint". Semian
  liveness (v0.28.4) was not verified; nothing in the corpus cites it.
- **Caught:**
  - breaker skips the expected timeout, and breaker scope finer than the address
    (`circuit-breakers`)
  - Little's Law (`wait-telemetry`)
  - queue wait past the client timeout (the `admission-queue` golden path)
  - declines are not errors (`capability-honest-refusal`)
  - idempotency key minted once, and its window (`idempotency-by-design`)

## Leads (each with its return condition)

| lead | from | return when |
| --- | --- | --- |
| aggregated metrics hide first-second-of-the-minute alignment spikes | SEC-004 | a platform-observability or capacity subject touches metric resolution; recheck by 2026-12-24 |
| decorrelated jitter (companion post "Exponential Backoff and Jitter", 2015, a simulation primary) | SEC-004 | a lane has a fetch budget for that post, via the PDF route; it can authorize a `backoff-design` amendment on its own |
| domain affinity: ((N-1)/N)^k vs (N-1)/N | SEC-034 | a fleet project calls service-to-service across 2+ failure domains, or a partitioning subject is founded; by 2026-12-24 |
| deploy one failure domain at a time | SEC-034 | a fleet project deploys to more than one replica set or region; by 2026-12-24 |
| saga compensation | SEC-044 | a fleet multi-service write, or a first-party account; recheck 2026-12-01 |
| throttle by delaying toward the deadline | SEC-045 | SEC-035 (load shedding) is mined, or by 2026-12-24 |
| shed only on a self-generated signal, never on a spoofable external one | SEC-045 | spec 4a is forged |
| a two-axis automated-change budget that only a person refills | SEC-045 | spec 4a is forged; then `self-healing/strategy-selection` |
| a fallback at least as secure as the primary (DoS-forced downgrade) | SEC-045 | a fleet project adds an auth or crypto fallback |
| always-on hedging as constant work (delayed hedging is the opposite) | SEC-033 | a second source ("The Tail at Scale"); home `retry-backoff` |
| failing fast needs shared fate with whoever sees the failure | SEC-033 | spec 4a is forged (home: error-handling or 4a) |
| queues grow from about 70-80% utilization | SEC-046 | `admission-queue` is next deepened; by 2026-12-24 |
| ULID over UUIDv4 keys: -50% INSERT time in one system | SEC-046 | with the Brooker uuidv7 backlog item, or a data-layer primary-key subject |
| reconciliation mismatches as typed anomaly records | SEC-046 | a fleet project integrates an external ledger of record |
| a stub dependency that mimics production latency for load tests | SEC-046 | a perf-harness subject is next touched |
| **instrument:** builder.aws.com is a JavaScript shell; `research-ingest` exits 3 ("too thin") on it and names every such page `aws-builder-center` | SEC-033 | fix before SEC-035 is batched: the ingest should report a fetch failure, not a thin source. Until then use the PDF route `d1.awsstatic.com/builderslibrary/pdfs/<slug>.pdf`, which worked for 2 of 2 slugs this pass |

## Untriaged (nobody verified these; not declined)

- SEC-004: retrying at the top layer wastes completed downstream work; jitter customer-triggered tasks the customer cannot see; jitter before the first request.
- SEC-033: `failover-path-liveness` uses "failover path" and "fallback route" as synonyms, which the article's definitions separate. Also always-on vs delayed hedging, and the airport-whiteboard example.
- SEC-034: cross-domain replication of hard state as DR only (not mapped against `sync-replication`); the stateless precondition of active-active.
- SEC-044: buffer writes durably while a single-writer primary is down and serve reads from replicas (BP01 step 5; not mapped against `read-serving-replicas` or `delivery-guarantees`). BP02-06 bodies were never read.
- SEC-045 security half: layered sandboxes each assuming the previous one fails (`security/extension-trust`); role, location and time separation with per-location certificates and roots of trust (`secret-custody-and-issuance`, `authorization`); measure key-rotation latency plus verified loss of access (`dynamic-secret-lifecycle`).
- SEC-045 deployment half: two failure domains with one as canary; different versions per domain; parallel candidate fixes; per-application quotas on global changes (`deployment-contract`). Also the oversubscription release drill.
- SEC-046: a correlation id carried into job parameters and SQL comments; investigate a rise in *expected* declines; step recovery under the idempotency key.

## Not evaluated

- No A/B evaluation: auto mode landed no content, so there is nothing to evaluate. The specs owe evaluations when they land.
- Semian v0.28.4 liveness; Node's `timeout` event not aborting the request; Go's `DefaultTransport` dial and TLS bounds. The last two are training data, to check before 4b cites them.
- `review-coverage` subject decisions: no subject was touched.
