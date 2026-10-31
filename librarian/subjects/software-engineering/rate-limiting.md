---
domain: software-engineering
subject: rate-limiting
last_touched: 2026-09-03
touched_by: harvest
dry_streak: 0
---

# rate-limiting

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - harvest wave (run 4)

Gained `untrusted-key-derivation` and `unattributable-client-bucketing` (8 -> 10
techniques) and a fifth application, `node--untrusted-key-derivation`. See
[[2026-08-22-4]].

Held deliberately to two techniques rather than three: the subject was already the
second-largest in its subcategory. Both sit *upstream* of `key-design`, which assumes you
have a key. The first is how you obtain one from a request whose every identifying header
the caller wrote - an ordered trust ladder, a platform's forwarding header trusted only
when you are actually running on that platform, and conventional proxy headers honoured
only under an explicit operator opt-in. The second is what to key on when the ladder runs
out, and why the obvious answer is the worst: pooling every unattributable caller into one
bucket makes ordinary traffic exhaust one shared allowance, a denial of service delivered
by the control meant to prevent one.

The discipline that makes the fallback safe is a labelling rule, not a cryptographic one:
call it entropy, not identity, at the site, so no later reader promotes a spoofable value
into a trust decision.

### 2026-08-22 - `/research`, from an external source

Gained `metered-step-selection` (7 -> 8 techniques). Source:
[[2026-08-22-ai-agent-race-exploded]].

`limit-derivation` computed a limit's number and nothing owned its subject - which step
the counter increments on. The corpus's two metering subjects both meter admission or
spend, so the case where producing is cheap and the harm is in distribution had no
answer. The new technique sits *before* derivation, key-design and refusal-contract, all
of which presuppose the step was chosen.

`gate-sees-target` turned out to apply to counters as cleanly as to checks: a limiter on
a proxy step fires exactly when the proxy diverges, and an abuser is the person most
motivated to make it diverge.

## Open leads

- **This subject is now at ten techniques, and nothing enforces a ceiling.** Two
  concurrent waves each respected the observed house maximum of nine in isolation; the
  union is ten. The next structure pass should decide whether nine is a real bar or an
  observation that has been overtaken. Note the ordering that emerged by accident and is
  worth keeping: `metered-step-selection` (which step) -> `untrusted-key-derivation`
  (what identifies the caller) -> `unattributable-client-bucketing` (when nothing does)
  -> `key-design` (what the key composes) -> `limit-derivation` (the number).
- **`usage-limit-governance` (llm-observability) is the sibling case.** It meters spend
  by dimension and has the same blind spot from the other side. Cross-bundle links are
  forbidden, so if that subject ever needs this rule it needs its own copy - check
  whether that is duplication worth paying before writing it.
- **`a predicate's name states its direction, or the negation site decides it`** (proposed
  law, not added). Two sightings, both inside this subject, both in the tree it was
  reconciled against. The worker asked for a third before promotion.

## Standing debt

- **Never swept by `/librarian`.**

## Declines

None.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

`cpp--algorithm-selection` application only (a catch): a desktop chat client's egress
token bucket sized below the provider's published per-connection ceiling on both axes,
with a per-spend refill that makes it the technique's degenerate sliding-window case.
Negative finding: the bucket can never say no - the queue is unbounded and the provider
sends no refusal for the operation, so conservative provisioning is the whole defence.
The tree calls it a leaky bucket; by this subject's vocabulary it is a token bucket with
a queue.

## Architecture review - 2026-10-31

First architecture review (state was pending). Trigger: the subject had never been
judged as a unit, and grew from eight to ten techniques across two concurrent waves.
Intended benefit: the techniques agree with each other about the case where nothing
identifies the caller, and the one composition claim that a reader would use to
choose a family is arithmetically right. Failure if ignored: a reader following
key-design pools every unattributable caller into one burst bucket, the self-inflicted
outage unattributable-client-bucketing exists to prevent; and a reader takes a
continuous token bucket as equivalent to a sliding window and gets seam doubling.
Boundary: this review reads text and public pinned sources; it does not reopen the
five private consumer applications or execute anything.

Findings: algorithm-selection's composition note held only for per-spend refill;
key-design still presented pooling as the correct burst-horizon answer, against the
newer technique; the cpp application called the Twitch join limit per-connection,
which Twitch publishes per user. The node limiter-topology application endorses the
pooled sentinel and owes a deviation line.
<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/rate-limiting",
  "date": "2026-10-31",
  "baseline": "f74433542",
  "digest": "sha256-b2:c1ab95c98c885951",
  "disposition": "clarify",
  "coverage": "All 18 documents read in full. Two public applications checked against their pinned sources (Chatterino 2 fully, OpenBao on load-bearing anchors); four primary references quoted. Not evaluated: the five private consumer applications, any runtime.",
  "counterexamples": [
    "A continuous-refill token bucket of capacity N and refill N per window, spent fully at t=0, admits about 2N within one window; a sliding window of N admits N.",
    "A carrier-scale NAT puts thousands of honest callers in the unattributable class; one pooled burst bucket refuses all of them within seconds.",
    "Twitch limits joins per user, so two connections under one account share one 20-per-10s allowance; a per-connection model would over-permit."
  ],
  "sources": [
    {
      "url": "https://dev.twitch.tv/docs/chat/#rate-limits",
      "result": "Quote: '20 join attempts per 10 seconds per user' and 'All of the above limits are per user, unless otherwise stated.' Supports the cpp application's numbers and its below-ceiling arithmetic (1.44/s against 2/s); refutes its 'per-connection' wording."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/tree/fda51f0d",
      "result": "Read the pinned RatelimitBucket.hpp/.cpp, TwitchIrcServer.hpp/.cpp, IrcMessageHandler.cpp, tests/src/RatelimitBucket.cpp and CMakeLists.txt: budget 18 / cooldown 12500 at :51-52, per-spend single-shot refill at :43-46, unbounded queue_ at hpp:35, VERSION 2.5.5, CMAKE_CXX_STANDARD 23. The header at hpp:200-202 cites the Twitch rate-limit page and does not say per-connection. All cited anchors hold."
    },
    {
      "url": "https://github.com/openbao/openbao/tree/6b5f82e1",
      "result": "Read pinned go.mod:12 (go 1.27.0), quotas.go:121-129 exempt set, :475-479 priority comment, :504-506 'conflicting quota definitions detected', fairshare/jobmanager.go:236-240 'math.Ceil(0.9 * numTotalWorkers / numActiveQueues)', api/response.go:32-34 health-path 429 branch. Supports the go application; remaining anchors not exhaustively rerun, so verified_on unchanged."
    },
    {
      "url": "https://en.wikipedia.org/wiki/Leaky_bucket",
      "result": "Quote: 'The leaky bucket as a meter is exactly equivalent to (a mirror image of) the token bucket algorithm'; the queue version 'imposes conformance rather than checking it'. Supports scoping algorithm-selection's leaky-bucket entry to the queue form."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For",
      "result": "Quote: 'The X-Forwarded-For IP list is searched from the rightmost by that count minus one' and 'Leftmost (untrusted) values must only be used for cases where there is no negative impact from using spoofed values.' Supports untrusted-key-derivation's read-from-the-far-end-with-a-depth rule."
    },
    {
      "url": "https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api",
      "result": "Quote: 'Making a conditional request does not count against your primary rate limit if a 304 response is returned and the request was made while correctly authorized'. Supports limit-derivation's unbilled-revalidation claim and the node application's 'free 304', with the authorization condition."
    },
    {
      "source": "Private consumer applications (node limit-derivation, node limiter-topology, node untrusted-key-derivation, rust storm-hygiene, rust algorithm-selection)",
      "result": "Dated reports retained; private sources not reopened. Verification dates unchanged."
    }
  ],
  "documents": {
    "rate-limiting.md": {
      "disposition": "keep",
      "reason": "Boundaries against admission, budget, exclusivity and retry are distinct and stated; the seven consequences and done-bar match the ten techniques, including the unattributable spread-under-ceiling rule."
    },
    "techniques/algorithm-selection.md": {
      "disposition": "clarify",
      "reason": "The composition note claims a token bucket with capacity equal to its per-window rate is roughly a sliding window; with continuous refill a full bucket spent at once refills within the window, so up to ~2x the allowance per window (arithmetic). Only per-spend refill (the cpp case) is exactly a sliding-window log. Leaky-bucket entry should name the queue form; the meter form is the token bucket's mirror (Wikipedia)."
    },
    "techniques/key-design.md": {
      "disposition": "clarify",
      "reason": "Unknown-key policy presents pooling all unknowns as the strict, correct burst-horizon answer, contradicting unattributable-client-bucketing ('Never pool unattributable callers by default') and golden-path consequence 3. Qualify pooling to a small hostile class and point to spreading under a ceiling."
    },
    "techniques/refusal-contract.md": {
      "disposition": "keep",
      "reason": "Four contract fields, not-before semantics, authority disambiguation and could-not-evaluate path are consistent with limiter-topology and the go application's health-path 429 branch (read at pin)."
    },
    "techniques/untrusted-key-derivation.md": {
      "disposition": "keep",
      "reason": "Ordered ladder with runtime witnesses and far-end chain reading agrees with MDN's trusted-proxy-count rule (quoted)."
    },
    "techniques/unattributable-client-bucketing.md": {
      "disposition": "keep",
      "reason": "Spread-then-cap pair, empty-fingerprint floor and entropy labelling are internally consistent; now matched by key-design."
    },
    "techniques/limiter-topology.md": {
      "disposition": "keep",
      "reason": "One-instance rule, evaluate-all-then-commit, ladder-versus-stack and fail-closed-in-front-of-spend are coherent; the scoped ladder is confirmed by the pinned OpenBao source."
    },
    "techniques/storm-hygiene.md": {
      "disposition": "keep",
      "reason": "Hot refusal branch, per-episode latch with reset and bounded reaper are stated as testable properties; no unstable external claim."
    },
    "techniques/limit-observability.md": {
      "disposition": "keep",
      "reason": "Passive snapshots, demand = admitted + refused, and limit-change events are sound and cross-reference the right techniques."
    },
    "techniques/limit-derivation.md": {
      "disposition": "keep",
      "reason": "Ceiling/floor arithmetic and friction exception are sound; the unbilled-revalidation claim holds for GitHub under authorization (quoted). Optional future nuance: the 304 exemption is conditional on authorization."
    },
    "techniques/metered-step-selection.md": {
      "disposition": "keep",
      "reason": "Production/egress/amplification split, divergence and false-positive checks are coherent and correctly ordered before derivation."
    },
    "applications/cpp--algorithm-selection.md": {
      "disposition": "clarify",
      "reason": "Pinned source holds at every cited anchor, but Twitch publishes the join limit per user, not per connection, and the tree's header does not say per-connection."
    },
    "applications/go--limiter-topology.md": {
      "disposition": "keep",
      "reason": "Load-bearing anchors (go.mod, exempt set, priority ladder, conflict error, fair-share cap, health 429) re-read at 6b5f82e1 and hold; not every anchor rerun, so verified_on unchanged."
    },
    "applications/node--limit-derivation.md": {
      "disposition": "reverify",
      "reason": "Clear worked example with honest deviations; private source not reopened. Note it carries no verified_against."
    },
    "applications/node--limiter-topology.md": {
      "disposition": "clarify",
      "reason": "Presents the single pooled 'unknown' burst bucket approvingly; under unattributable-client-bucketing (forged two days later) that is correct only for a small hostile class. Needs a deviation line, owed until the repo's unattributable traffic shape is known; private source not reopened."
    },
    "applications/node--untrusted-key-derivation.md": {
      "disposition": "reverify",
      "reason": "Ladder, platform gate, negative tests and the inverted waitlist polarity are well evidenced in the account; private source not reopened."
    },
    "applications/rust--storm-hygiene.md": {
      "disposition": "reverify",
      "reason": "Latch-with-reset and amortized reaper account is consistent with the technique and names its own gap; private source not reopened."
    },
    "applications/rust--algorithm-selection.md": {
      "disposition": "reverify",
      "reason": "Two-family account and policy-as-parameter deviation consistent with the golden path; private source not reopened."
    }
  }
}
```

Applied the same day: the three clarify items in algorithm-selection, key-design and
the cpp application, each confirmed by arithmetic, an internal contradiction, or a
primary source opened this run. The node limiter-topology deviation stays owed.
<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/rate-limiting",
  "date": "2026-10-31",
  "baseline": "f74433542",
  "digest": "sha256-b2:7d87d7638ebf7b54",
  "disposition": "clarify",
  "coverage": "All 18 documents read in full. Two public applications checked against their pinned sources (Chatterino 2 fully, OpenBao on load-bearing anchors); four primary references quoted. Not evaluated: the five private consumer applications, any runtime. Second record: three clarify items applied after the first record; remaining owed item unchanged.",
  "counterexamples": [
    "A continuous-refill token bucket of capacity N and refill N per window, spent fully at t=0, admits about 2N within one window; a sliding window of N admits N.",
    "A carrier-scale NAT puts thousands of honest callers in the unattributable class; one pooled burst bucket refuses all of them within seconds.",
    "Twitch limits joins per user, so two connections under one account share one 20-per-10s allowance; a per-connection model would over-permit."
  ],
  "sources": [
    {
      "url": "https://dev.twitch.tv/docs/chat/#rate-limits",
      "result": "Quote: '20 join attempts per 10 seconds per user' and 'All of the above limits are per user, unless otherwise stated.' Supports the cpp application's numbers and its below-ceiling arithmetic (1.44/s against 2/s); refutes its 'per-connection' wording."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/tree/fda51f0d",
      "result": "Read the pinned RatelimitBucket.hpp/.cpp, TwitchIrcServer.hpp/.cpp, IrcMessageHandler.cpp, tests/src/RatelimitBucket.cpp and CMakeLists.txt: budget 18 / cooldown 12500 at :51-52, per-spend single-shot refill at :43-46, unbounded queue_ at hpp:35, VERSION 2.5.5, CMAKE_CXX_STANDARD 23. The header at hpp:200-202 cites the Twitch rate-limit page and does not say per-connection. All cited anchors hold."
    },
    {
      "url": "https://github.com/openbao/openbao/tree/6b5f82e1",
      "result": "Read pinned go.mod:12 (go 1.27.0), quotas.go:121-129 exempt set, :475-479 priority comment, :504-506 'conflicting quota definitions detected', fairshare/jobmanager.go:236-240 'math.Ceil(0.9 * numTotalWorkers / numActiveQueues)', api/response.go:32-34 health-path 429 branch. Supports the go application; remaining anchors not exhaustively rerun, so verified_on unchanged."
    },
    {
      "url": "https://en.wikipedia.org/wiki/Leaky_bucket",
      "result": "Quote: 'The leaky bucket as a meter is exactly equivalent to (a mirror image of) the token bucket algorithm'; the queue version 'imposes conformance rather than checking it'. Supports scoping algorithm-selection's leaky-bucket entry to the queue form."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For",
      "result": "Quote: 'The X-Forwarded-For IP list is searched from the rightmost by that count minus one' and 'Leftmost (untrusted) values must only be used for cases where there is no negative impact from using spoofed values.' Supports untrusted-key-derivation's read-from-the-far-end-with-a-depth rule."
    },
    {
      "url": "https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api",
      "result": "Quote: 'Making a conditional request does not count against your primary rate limit if a 304 response is returned and the request was made while correctly authorized'. Supports limit-derivation's unbilled-revalidation claim and the node application's 'free 304', with the authorization condition."
    },
    {
      "source": "Private consumer applications (node limit-derivation, node limiter-topology, node untrusted-key-derivation, rust storm-hygiene, rust algorithm-selection)",
      "result": "Dated reports retained; private sources not reopened. Verification dates unchanged."
    }
  ],
  "documents": {
    "rate-limiting.md": {
      "disposition": "keep",
      "reason": "Boundaries against admission, budget, exclusivity and retry are distinct and stated; the seven consequences and done-bar match the ten techniques, including the unattributable spread-under-ceiling rule."
    },
    "techniques/algorithm-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: composition note now says only per-spend refill makes capacity-equals-allowance a sliding-window log, continuous refill admits up to about twice the allowance per window; leaky-bucket entry scoped to the queue form, meter form named as the token bucket's mirror."
    },
    "techniques/key-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: unknown-key pooling qualified to a small, mostly hostile class with a pointer to unattributable-client-bucketing; horizon paragraph and decision rule no longer present pooling as the unconditional burst-horizon answer."
    },
    "techniques/refusal-contract.md": {
      "disposition": "keep",
      "reason": "Four contract fields, not-before semantics, authority disambiguation and could-not-evaluate path are consistent with limiter-topology and the go application's health-path 429 branch (read at pin)."
    },
    "techniques/untrusted-key-derivation.md": {
      "disposition": "keep",
      "reason": "Ordered ladder with runtime witnesses and far-end chain reading agrees with MDN's trusted-proxy-count rule (quoted)."
    },
    "techniques/unattributable-client-bucketing.md": {
      "disposition": "keep",
      "reason": "Spread-then-cap pair, empty-fingerprint floor and entropy labelling are internally consistent; now matched by key-design."
    },
    "techniques/limiter-topology.md": {
      "disposition": "keep",
      "reason": "One-instance rule, evaluate-all-then-commit, ladder-versus-stack and fail-closed-in-front-of-spend are coherent; the scoped ladder is confirmed by the pinned OpenBao source."
    },
    "techniques/storm-hygiene.md": {
      "disposition": "keep",
      "reason": "Hot refusal branch, per-episode latch with reset and bounded reaper are stated as testable properties; no unstable external claim."
    },
    "techniques/limit-observability.md": {
      "disposition": "keep",
      "reason": "Passive snapshots, demand = admitted + refused, and limit-change events are sound and cross-reference the right techniques."
    },
    "techniques/limit-derivation.md": {
      "disposition": "keep",
      "reason": "Ceiling/floor arithmetic and friction exception are sound; the unbilled-revalidation claim holds for GitHub under authorization (quoted). Optional future nuance: the 304 exemption is conditional on authorization."
    },
    "techniques/metered-step-selection.md": {
      "disposition": "keep",
      "reason": "Production/egress/amplification split, divergence and false-positive checks are coherent and correctly ordered before derivation."
    },
    "applications/cpp--algorithm-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'per-connection join limit' corrected to the provider's published 'twenty join attempts per ten seconds per user'; every cited anchor re-read at fda51f0d, verified_on moved to 2026-10-31."
    },
    "applications/go--limiter-topology.md": {
      "disposition": "keep",
      "reason": "Load-bearing anchors (go.mod, exempt set, priority ladder, conflict error, fair-share cap, health 429) re-read at 6b5f82e1 and hold; not every anchor rerun, so verified_on unchanged."
    },
    "applications/node--limit-derivation.md": {
      "disposition": "reverify",
      "reason": "Clear worked example with honest deviations; private source not reopened. Note it carries no verified_against."
    },
    "applications/node--limiter-topology.md": {
      "disposition": "clarify",
      "reason": "Presents the single pooled 'unknown' burst bucket approvingly; under unattributable-client-bucketing (forged two days later) that is correct only for a small hostile class. Needs a deviation line, owed until the repo's unattributable traffic shape is known; private source not reopened."
    },
    "applications/node--untrusted-key-derivation.md": {
      "disposition": "reverify",
      "reason": "Ladder, platform gate, negative tests and the inverted waitlist polarity are well evidenced in the account; private source not reopened."
    },
    "applications/rust--storm-hygiene.md": {
      "disposition": "reverify",
      "reason": "Latch-with-reset and amortized reaper account is consistent with the technique and names its own gap; private source not reopened."
    },
    "applications/rust--algorithm-selection.md": {
      "disposition": "reverify",
      "reason": "Two-family account and policy-as-parameter deviation consistent with the golden path; private source not reopened."
    }
  }
}
```

This record follows re-verification of applications: the two rust applications were re-anchored against personas@22260d77 and now keep; the node limiter-topology deviation stays owed.
<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/rate-limiting",
  "date": "2026-10-31",
  "baseline": "4940dba1b",
  "digest": "sha256-b2:3a45d2c7aedd1adf",
  "disposition": "clarify",
  "coverage": "All 18 documents considered; the two applications changed since the previous record (rust algorithm-selection, rust storm-hygiene) re-read in full. Re-verification re-anchored their line citations against personas@22260d77 and moved verified_on to 2026-10-31; no finding changed. Other documents unchanged since the previous record and carry its dispositions. Not evaluated: the three remaining private applications, any runtime.",
  "counterexamples": [
    "A continuous-refill token bucket of capacity N and refill N per window, spent fully at t=0, admits about 2N within one window; a sliding window of N admits N.",
    "A carrier-scale NAT puts thousands of honest callers in the unattributable class; one pooled burst bucket refuses all of them within seconds.",
    "Twitch limits joins per user, so two connections under one account share one 20-per-10s allowance; a per-connection model would over-permit."
  ],
  "sources": [
    {
      "url": "https://dev.twitch.tv/docs/chat/#rate-limits",
      "result": "Quote: '20 join attempts per 10 seconds per user' and 'All of the above limits are per user, unless otherwise stated.' Supports the cpp application's numbers and its below-ceiling arithmetic (1.44/s against 2/s); refutes its 'per-connection' wording."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/tree/fda51f0d",
      "result": "Read the pinned RatelimitBucket.hpp/.cpp, TwitchIrcServer.hpp/.cpp, IrcMessageHandler.cpp, tests/src/RatelimitBucket.cpp and CMakeLists.txt: budget 18 / cooldown 12500 at :51-52, per-spend single-shot refill at :43-46, unbounded queue_ at hpp:35, VERSION 2.5.5, CMAKE_CXX_STANDARD 23. The header at hpp:200-202 cites the Twitch rate-limit page and does not say per-connection. All cited anchors hold."
    },
    {
      "url": "https://github.com/openbao/openbao/tree/6b5f82e1",
      "result": "Read pinned go.mod:12 (go 1.27.0), quotas.go:121-129 exempt set, :475-479 priority comment, :504-506 'conflicting quota definitions detected', fairshare/jobmanager.go:236-240 'math.Ceil(0.9 * numTotalWorkers / numActiveQueues)', api/response.go:32-34 health-path 429 branch. Supports the go application; remaining anchors not exhaustively rerun, so verified_on unchanged."
    },
    {
      "url": "https://en.wikipedia.org/wiki/Leaky_bucket",
      "result": "Quote: 'The leaky bucket as a meter is exactly equivalent to (a mirror image of) the token bucket algorithm'; the queue version 'imposes conformance rather than checking it'. Supports scoping algorithm-selection's leaky-bucket entry to the queue form."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For",
      "result": "Quote: 'The X-Forwarded-For IP list is searched from the rightmost by that count minus one' and 'Leftmost (untrusted) values must only be used for cases where there is no negative impact from using spoofed values.' Supports untrusted-key-derivation's read-from-the-far-end-with-a-depth rule."
    },
    {
      "url": "https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api",
      "result": "Quote: 'Making a conditional request does not count against your primary rate limit if a 304 response is returned and the request was made while correctly authorized'. Supports limit-derivation's unbilled-revalidation claim and the node application's 'free 304', with the authorization condition."
    },
    {
      "source": "Private consumer applications (node limit-derivation, node limiter-topology, node untrusted-key-derivation)",
      "result": "Dated reports retained; private sources not reopened. Verification dates unchanged."
    },
    {
      "source": "Private consumer applications re-verified (rust storm-hygiene, rust algorithm-selection)",
      "result": "Re-checked against personas@22260d77 by the re-verification pass; cited anchors re-pointed, verified_on 2026-10-31, no verdict reversed."
    }
  ],
  "documents": {
    "rate-limiting.md": {
      "disposition": "keep",
      "reason": "Boundaries against admission, budget, exclusivity and retry are distinct and stated; the seven consequences and done-bar match the ten techniques, including the unattributable spread-under-ceiling rule."
    },
    "techniques/algorithm-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: composition note now says only per-spend refill makes capacity-equals-allowance a sliding-window log, continuous refill admits up to about twice the allowance per window; leaky-bucket entry scoped to the queue form, meter form named as the token bucket's mirror."
    },
    "techniques/key-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: unknown-key pooling qualified to a small, mostly hostile class with a pointer to unattributable-client-bucketing; horizon paragraph and decision rule no longer present pooling as the unconditional burst-horizon answer."
    },
    "techniques/refusal-contract.md": {
      "disposition": "keep",
      "reason": "Four contract fields, not-before semantics, authority disambiguation and could-not-evaluate path are consistent with limiter-topology and the go application's health-path 429 branch (read at pin)."
    },
    "techniques/untrusted-key-derivation.md": {
      "disposition": "keep",
      "reason": "Ordered ladder with runtime witnesses and far-end chain reading agrees with MDN's trusted-proxy-count rule (quoted)."
    },
    "techniques/unattributable-client-bucketing.md": {
      "disposition": "keep",
      "reason": "Spread-then-cap pair, empty-fingerprint floor and entropy labelling are internally consistent; now matched by key-design."
    },
    "techniques/limiter-topology.md": {
      "disposition": "keep",
      "reason": "One-instance rule, evaluate-all-then-commit, ladder-versus-stack and fail-closed-in-front-of-spend are coherent; the scoped ladder is confirmed by the pinned OpenBao source."
    },
    "techniques/storm-hygiene.md": {
      "disposition": "keep",
      "reason": "Hot refusal branch, per-episode latch with reset and bounded reaper are stated as testable properties; no unstable external claim."
    },
    "techniques/limit-observability.md": {
      "disposition": "keep",
      "reason": "Passive snapshots, demand = admitted + refused, and limit-change events are sound and cross-reference the right techniques."
    },
    "techniques/limit-derivation.md": {
      "disposition": "keep",
      "reason": "Ceiling/floor arithmetic and friction exception are sound; the unbilled-revalidation claim holds for GitHub under authorization (quoted). Optional future nuance: the 304 exemption is conditional on authorization."
    },
    "techniques/metered-step-selection.md": {
      "disposition": "keep",
      "reason": "Production/egress/amplification split, divergence and false-positive checks are coherent and correctly ordered before derivation."
    },
    "applications/cpp--algorithm-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'per-connection join limit' corrected to the provider's published 'twenty join attempts per ten seconds per user'; every cited anchor re-read at fda51f0d, verified_on moved to 2026-10-31."
    },
    "applications/go--limiter-topology.md": {
      "disposition": "keep",
      "reason": "Load-bearing anchors (go.mod, exempt set, priority ladder, conflict error, fair-share cap, health 429) re-read at 6b5f82e1 and hold; not every anchor rerun, so verified_on unchanged."
    },
    "applications/node--limit-derivation.md": {
      "disposition": "reverify",
      "reason": "Clear worked example with honest deviations; private source not reopened. Note it carries no verified_against."
    },
    "applications/node--limiter-topology.md": {
      "disposition": "clarify",
      "reason": "Presents the single pooled 'unknown' burst bucket approvingly; under unattributable-client-bucketing (forged two days later) that is correct only for a small hostile class. Needs a deviation line, owed until the repo's unattributable traffic shape is known; private source not reopened."
    },
    "applications/node--untrusted-key-derivation.md": {
      "disposition": "reverify",
      "reason": "Ladder, platform gate, negative tests and the inverted waitlist polarity are well evidenced in the account; private source not reopened."
    },
    "applications/rust--storm-hygiene.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against personas@22260d77: egress sweep, LRU eviction and named-constant anchors re-pointed (:252-261, :301-313, :184-192); latch-with-reset and amortized reaper account unchanged."
    },
    "applications/rust--algorithm-selection.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against personas@22260d77: TokenBucket, refill, retry-after, registry cap, live-capacity-change and metadata-parse anchors re-pointed (e.g. :194-234, :229-231, :268), tier_usage path made repo-relative; two-family account and both deviations unchanged."
    }
  }
}
```
