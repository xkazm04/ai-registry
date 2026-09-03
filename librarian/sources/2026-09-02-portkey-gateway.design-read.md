# Intake front half — Portkey AI Gateway

- source: https://github.com/Portkey-AI/gateway
- clone: `C:/t/portkey`, pinned `669825cbe89ee51569918b8f78a9db486fd69dd4`
- run: intake v2.1.1, Phases 2b / 2d / 3 / 4 / 5-promoting, worker for the director
- date: 2026-09-02
- registry read-only; nothing written inside the registry.

---

## 1. Class and expected yield

**Class: vendor repository** (`references/source-classes.md` § Vendor repository) —
a company's own repo for a product whose engine is a hosted service. Confirmed on
three independent tells, not on the org name:

1. The tree carries an **extension seam where the hosted product plugs in**:
   `c.get('preRequestValidator')` (`src/handlers/services/preRequestValidatorService.ts:22`)
   is called but never registered anywhere in the OSS tree — it returns
   `{response, modelPricingConfig}` and is documented in-code as "For virtual key
   budgets". Same for `c.get('handleCircuitBreakerResponse')`
   (`src/handlers/handlerUtils.ts:786`), `c.get('cacheIdentifier')`, and the
   semantic-cache mode the schema accepts and the OSS cache never implements
   (`src/middlewares/cache/index.ts` handles `simple` only).
2. `cookbook/` is 22k words of **integration prose** — the marketing surface with a
   table of contents.
3. The **types of the open client render the closed engine**: `src/types/requestBody.ts`,
   `src/middlewares/requestValidator/schema/config.ts` and `conf.example.json`
   publish the hosted product's whole config data model — strategies, virtual-key
   integrations with rate limits and per-model pricing config, guardrail shorthand —
   for free.

**Expected yield, said before the table:** the class predicts yield lives in
(a) the config schema and the code that reads it, (b) the client types, and
(c) NOT in the README. That prediction held completely. The README (1,923 words in
tree / 1,814 rendered) contributed **zero** findings. Every entry in the design
record below is anchored in `src/`, `plugins/` or `conf.example.json`.

One class-level correction worth banking: the vendor-repository row says the
*"stated production rules"* page in the docs is "usually the densest thing in the
repo." **Here there is no such page** — `docs/` is 486 lines of deployment
recipes and nothing else. When a vendor repo has no rules page, its density moves
entirely into the request-pipeline code and the config validator, and the sweep
order has to be re-ranked accordingly (see §2). Portkey is the first vendor
repository in the ledger where step 1 of the Phase-2b sweep returned nothing.

---

## 2. Sweep log (honest totals)

Swept in Phase 2b order, re-ranked after step 1 came back empty.

| # | Sweep step | What was there | Words / size | Yield |
| --- | --- | --- | --- | --- |
| 1 | **Operating documents** | `CLAUDE.md` (94 lines, an orientation file, no failure modes); `docs/installation-deployments.md` (486 lines, 15+ deployment recipes); `docs/deploy-on-replit.md`; `plugins/Contributing.md`. No ADR, no spec, no design dir, no CHANGELOG. | ~6k words | **thin.** One decision (§3 D10, runtime-portable build target) and the deployment-surface count. |
| 2 | **The instrument and its rules** | `src/middlewares/requestValidator/schema/config.ts` (the zod config schema — the real contract); `src/handlers/handlerUtils.ts` (1,353 lines — `tryTargetsRecursively`, `tryPost`, `recursiveAfterRequestHookHandler`, `constructConfigFromRequestHeaders`); `src/handlers/retryHandler.ts` (220); `src/services/conditionalRouter.ts` (156); `src/middlewares/hooks/index.ts` (556) + `types.ts`; `src/middlewares/cache/index.ts` + `src/handlers/services/cacheService.ts`; `src/middlewares/log/index.ts`; `src/middlewares/adminAuth/index.ts`. | ~3,500 lines read in full | **dense — 9 of 10 design entries.** |
| 3 | **The measurement** | `tests/integration/src/handlers/tryPost.test.ts` (574 lines, 26 named cases against a live gateway); `tests/unit/src/handlers/services/*.test.ts` (2,600 lines across 7 services); `plugins/*/**.test.ts` (23 plugin test files); `src/providers/google-vertex-ai/utils.test.ts`. 33 test files total. | 4,000+ lines | Confirms the failure taxonomy (`should handle failing after request hooks with retry`, `should include hook results in cached responses`, `should not cache file upload endpoints`, `should through a 446 if after request guardrail fails`). One reusable test strategy (§9). No benchmark, no eval harness, no measured results table anywhere in the tree. |
| 4 | **Types and config schema** | `src/types/requestBody.ts` (550); `src/providers/types.ts` (456 — `ProviderConfig`/`ParameterConfig`/`ProviderAPIConfig`/`endpointStrings` with 36 endpoint kinds); `src/middlewares/hooks/types.ts`; `conf.example.json` (49 lines, the virtual-key/integration model); `plugins/*/manifest.json` (the check contract). | ~1,500 lines | **dense — the data model, as the class predicted.** |
| 5 | **The tests** | folded into step 3. | | |
| 6 | **README last** | `README.md` 1,923 words in tree; the landing page 1,814 words as ingested. | 1,923 | **zero findings.** Provider counts, a feature list, and a hosted-product CTA. |

**Honest word/size totals**

- landing page (what a README-only run would have mined): **1,814 words**
- all in-tree markdown: **22,127 words**, of which `cookbook/` is ~14k of integration
  prose and `.github/` translations another ~4k. Genuinely operational prose:
  **~6,000 words**, and it is deployment recipes.
- **TypeScript actually read in this run: ~5,500 lines** across 24 files, out of
  430 `.ts` files under `src/` (+136 files under `plugins/`). The 78 provider
  directories were sampled (openai, anthropic, bedrock, google-vertex-ai) rather
  than swept — the shared interface in `src/providers/types.ts` and
  `src/providers/utils.ts` is what publishes the data model, and the individual
  adapters are 74 repetitions of it.
- **Where the yield actually was: the code, at a ratio of roughly 9:1 over the prose.**
  A `words:` frontmatter of 1,814 on this source would be a note about the ad.

---

## 3. Design record

Ten entries, grouped by the four systems in the tree. Product names retained
(Phase 3 defers the strip test for `design` rows).

Every `corpus:` line below was decided by **opening the golden path named** and
reading whether it states the decision's forces. No verdict here rests on a slug
match or a capped grep. Files opened for this section are listed inline.

### SYSTEM A — the routing/execution tree
*(`src/handlers/handlerUtils.ts`, `src/services/conditionalRouter.ts`, `src/middlewares/requestValidator/schema/config.ts`)*

#### A1. Routing strategy and execution policy are ONE recursive tree, and the node's address survives the routing

```
decision:   A config is a recursively-nested tree of targets. Each node carries BOTH a
            routing strategy (single | loadbalance | fallback | conditional) AND the
            execution policy for anything below it (retry, cache, timeout, custom host,
            forwarded headers, before/after hooks, guardrails, param overrides).
            `tryTargetsRecursively` merges parent config into child at every hop,
            child-wins, and threads a jsonPath (`.targets[3].targets[1]`) that is the
            leaf's identity for logging and circuit-breaking.
forces:     A gateway's operators want to say "EU-only for tagged traffic, then
            load-balance 80/20 across two vendors, and if both fail, fall back to a
            third — and the whole thing retries twice and caches for an hour." Flat
            policy cannot express that: the retry budget and the cache TTL belong to
            a SUBTREE, not to a rule. Making strategy a node type instead of a
            top-level mode is what makes the strategies compose.
buys:       Composition without new vocabulary. A team elsewhere can test for it by
            asking whether `fallback(loadbalance(a,b), c)` is expressible and whether
            `retry` set on the outer node applies to c but is overridable on b.
rejects:    A flat routing rule list with one global execution policy — the shape the
            corpus's own routing-policy technique describes. The schema says so
            explicitly: `targets: z.array(z.lazy(() => configSchema))` — targets are
            configs, recursively (config.ts:74).
where:      src/middlewares/requestValidator/schema/config.ts:12-74 (the recursive
            schema); src/handlers/handlerUtils.ts:476-560 (the inheritance merge, 26
            keys, each with its own child-wins/parent-fallback rule);
            handlerUtils.ts:655-830 (the strategy switch);
            handlerUtils.ts:700-722 (weighted loadbalance);
            handlerUtils.ts:503-513 (retry/cache are REPLACED wholesale, not
            deep-merged — a child's `{attempts:1}` erases the parent's onStatusCodes).
stage:      config resolution, before any provider is contacted.
corpus:     NONE — nearest neighbour
            `software-engineering/llm-agent/orchestration/model-routing`,
            technique `routing-policy`.
```

**Evidence — golden path opened.**
`knowledge/software-engineering/llm-agent/orchestration/model-routing/model-routing.md`
and `.../techniques/routing-policy.md` were read in full. routing-policy models
policy as **data evaluated at one door**, with a rule taxonomy (allow/block,
complexity, tag-scoped compliance), edit-time validation, and a documented
precedence ladder ("Compliance rules first… Block beats allow… Specific beats
general"). Its unit is **a flat cascade of rules over one candidate set**. It does
not model routing strategies as a *composable tree*, and — the load-bearing half —
it does not model **execution policy inheriting down a routing structure**, which
is where every hard question here lives: whether `retry` replaces or merges, whether
a child's absent `cache` means "inherit" or "off", whether a hook declared at the
root runs once or once per leaf. Portkey answers all three in code and the corpus
has no place that asks them. This **models a neighbouring decision, not this one**:
it is a seam, not a duplicate. Grain: this is *subject*-sized, not technique-sized —
see §7.

#### A2. The breaker is a filter over the candidate list, and an all-open list is not an empty list

```
decision:   Before the strategy switch runs, targets marked open by the circuit breaker
            are filtered out of the candidate list — but ONLY if at least one healthy
            target remains. If every target is open, the filter is skipped entirely and
            the request is attempted against the full list.
forces:     A breaker's evidence is a health heuristic, not a permission. Refusing to
            route when every candidate looks sick converts a partial outage into a
            total one, and the breaker's own probe traffic is the only thing that can
            ever close it. Meanwhile the filtering renumbers the array, so the leaf's
            log/telemetry address would silently shift under it.
buys:       The breaker can never take the whole gateway down, and a leaf's identity in
            the logs is stable whether or not the breaker pruned its siblings. Testable
            elsewhere: does the breaker's "everything is open" state degrade to
            attempt-anyway or to refuse-everything, and is that written down?
rejects:    Refusing the request with a breaker-denied outcome — which is what the
            corpus's own routing-policy prescribes for the analogous policy-exhausted
            state ("never as a silent fallback to whatever remained before the last
            rule ran").
where:      src/handlers/handlerUtils.ts:643-655 —
              const healthyTargets = (currentTarget.targets||[])
                .map((t,index) => ({...t, originalIndex: index}))
                .filter(t => !t.isOpen);
              if (healthyTargets.length) { currentTarget.targets = healthyTargets; }
            and the `originalIndex` read back at :662, :701, :753, :765.
stage:      after config resolution, before strategy dispatch, per tree node.
corpus:     PARTIAL / boundary case — home exists:
            `backend-platform/resilience/retry-backoff`, technique `circuit-breakers`;
            with a live discriminator against
            `llm-agent/orchestration/model-routing`, technique `routing-policy`.
```

**Evidence — both golden paths opened.**
`.../retry-backoff/techniques/circuit-breakers.md` models the breaker deeply — the
three states, the half-open bound ("If cooldown expiry re-admits *all* waiting
traffic, the 'probe' is a stampede"), what counts as evidence (law: gate-sees-target),
and scope as "a failure-domain hypothesis… per dependency". **Its unit is one breaker
in front of one dependency, whose output is admit-or-deny.** It never asks what
happens when a breaker's verdict is one input to *choosing among N candidates*, and
so it never reaches the degenerate case portkey resolves. The corpus and the source
also **disagree in the open**, which is the valuable part: routing-policy says an
exhausted candidate set must be spelled as its own failure and never silently fall
back; portkey deliberately falls back to the full list. The forces differ and both are
right — policy exhaustion is a *compliance* boundary (routing anyway is the breach the
rule existed to prevent), breaker exhaustion is a *health heuristic* (routing anyway is
the probe). **The corpus does not state that discriminator anywhere**, and it is
exactly the shape the two subjects' seam paragraph is missing. Grain: **technique**,
in `circuit-breakers` (or a boundary paragraph in `routing-policy`).

#### A3. A provider-stated retry-after outranks the ladder — until it exceeds the remaining budget, and then it ends the ladder rather than truncating the wait

```
decision:   On a 429 with `use_retry_after_header`, the gateway reads the provider's
            stated delay, ZEROES its own remaining backoff schedule, and sleeps exactly
            the stated time. But it holds a 60-second whole-request retry budget: if the
            stated delay is >= the budget, or > what remains of it, the gateway does not
            wait a shorter time and does not retry sooner — it abandons the ladder
            immediately, spends zero further attempts, and reports a distinct terminal
            state (`skip: true`, surfaced as `retryCount = -1`).
forces:     A stated retry-after is the dependency's own schedule and outranks a guessed
            ladder — but it is attacker-and-incident-controlled input to a synchronous
            proxy holding a client socket open. A provider stating 900 seconds mid-
            incident would otherwise convert "honour the stated schedule" into a
            900-second hung request, once per concurrent caller.
buys:       Both properties at once: the dependency's schedule is honoured when honouring
            it is possible, and the request's worst case stays bounded by a number the
            operator chose rather than one the provider sent. Testable elsewhere: what
            does your client do with a Retry-After larger than your request deadline?
rejects:    (a) exponential backoff over a stated schedule; (b) truncating the stated
            wait to what fits — retrying earlier than a limiter asked for gets you
            banned harder; (c) honouring an unbounded stated wait.
where:      src/handlers/retryHandler.ts:104-146 —
              if (retryAfter >= MAX_RETRY_LIMIT_MS || retryAfter > remainingRetryTimeout) {
                retrySkipped = true; rateLimiter._timeouts = []; throw errorObj; }
              remainingRetryTimeout -= retryAfter;
              rateLimiter._timeouts = Array.from({length: retryCount-attempt+1}).map(()=>0);
            src/globals.ts:5  MAX_RETRY_LIMIT_MS = 60_000
            src/globals.ts:7  POSSIBLE_RETRY_STATUS_HEADERS =
              ['retry-after-ms','x-ms-retry-after-ms','retry-after']  (ordered; the
              third has different unit semantics and is *1000 at retryHandler.ts:118)
            src/handlers/handlerUtils.ts:1283-1288 (retrySkipped -> lastAttempt = -1)
stage:      transport, inside one leaf's attempt ladder.
corpus:     PARTIAL / boundary case — home exists:
            `backend-platform/resilience/retry-backoff`, technique `backoff-design`.
```

**Evidence — golden path and technique opened.**
`.../retry-backoff/retry-backoff.md` models the class taxonomy and states in the
contracts table that for rate-limited failures "the dependency's own schedule
outranks the local ladder". `.../techniques/backoff-design.md` states both halves
independently: "**A stated schedule outranks the ladder.** …the next attempt honors
it — plus jitter — and the ladder resumes only if the stated time also fails," and,
four bullets later, "**The ladder needs a total-time budget, not just an attempt
count.** …Work with a deadline shorter than the ladder's worst case needs a shorter
ladder, not hope." **The two rules are stated separately and never collided.** The
collision is the whole decision here, and portkey's answer — the stated schedule wins
*inside* the budget and is refused *outside* it, with its own terminal spelling — is
the missing sentence. `retry-backoff.md`'s "Stopping is a first-class outcome"
section enumerates exactly four terminal states (succeeded-after-N / exhausted /
reclassified / denied); portkey's `skip` is arguably a fifth, or a sub-case of denied
attributed to the budget rather than to a breaker, and the golden path should say
which. Grain: **technique** amendment inside `backoff-design`, with a line into
`retry-backoff.md`'s terminal-states section.

*(One counter-observation, banked as a lead not a landing: portkey passes
`randomize: false` to async-retry (retryHandler.ts:169) — no jitter at all, on a
component that is by construction the fleet's correlator. `backoff-design.md` says
"Jitter belongs on *every* scheduled delay in the resilience layer". The corpus is
right and the source is wrong; this is a disproof-by-counterexample worth citing
INTO the corpus, not a correction of it.)*

#### A4. The hop marks its own failures in-band so the enclosing fallback loop can tell "the target failed" from "we failed"

```
decision:   When the leaf handler throws, the gateway synthesises a response carrying
            `x-portkey-gateway-exception: true`, and the fallback loop breaks on that
            header as if the request had succeeded — refusing to burn the remaining
            targets.
forces:     A fallback list exists to survive a sick provider. A bug or a config error
            in the gateway itself reproduces identically on every target, so a loop that
            cannot tell the two apart converts one gateway defect into N upstream calls
            per request, at the exact moment the operator is least able to see why.
            Status codes cannot carry it: a gateway 500 and an upstream 500 are the same
            number.
buys:       Failure attribution across a retry boundary. Testable elsewhere: does your
            failover loop distinguish "the candidate failed" from "the router failed",
            and does the distinction survive to the layer that loops?
rejects:    Attributing every failure to the target — the default behaviour of any
            status-code-driven loop.
where:      src/handlers/handlerUtils.ts:800-826 (the synthesis, with the comment
            "Add this header so that the fallback loop can be interrupted if its an
            exception."); handlerUtils.ts:679-690 (the loop's break condition);
            src/errors/GatewayError.ts + src/errors/RouterError.ts (the two error
            classes the distinction rests on — a RouterError from the conditional
            router at handlerUtils.ts:747 is unrecoverable by definition).
stage:      the fallback loop, between two leaf attempts.
corpus:     NONE — nearest neighbour
            `backend-platform/resilience/stream-proxy-hop`, technique
            `upstream-status-normalization`.
```

**Evidence — golden path and technique opened.**
`knowledge/software-engineering/backend-platform/resilience/stream-proxy-hop/stream-proxy-hop.md`
is the right *subject* — it is explicitly the gateway-in-the-middle subject ("a
gateway, a backend-for-frontend, an edge function, a tenant-routing shim — the label
changes, the contract does not"). `.../techniques/upstream-status-normalization.md`
models status translation **downstream**, to a dumb auto-reconnecting client: clamp
before constructing, "choose the substitute by meaning, not by convenience", never
substitute a success status, preserve the real upstream status in operator telemetry.
Every force in it is about the *client's* reconnect behaviour. Portkey's decision runs
in the opposite direction — the hop marking its own failures **upward, for a loop
inside the same process** — and its force (loop amplification on a router bug) appears
nowhere in the subject. `origin-non-disclosure` is about not naming the origin, a
third concern. So: the subject is the right home, the technique does not model these
forces. Grain: **technique**, new, in `stream-proxy-hop`.

#### A5. Routing decides on caller-supplied metadata via a query DSL, evaluated before any provider call

```
decision:   `conditional` strategy resolves a target by evaluating a MongoDB-style query
            (`$eq $ne $gt $gte $lt $lte $in $nin $regex $and $or`) against a two-level
            context of {metadata, params, url.pathname}, in declaration order, first
            match wins, with a named `default` and a hard RouterError if nothing resolves.
forces:     Operators want per-tenant, per-environment, per-endpoint routing without a
            deploy. Content-based routing needs an evaluator, and an evaluator over
            arbitrary caller input needs a closed operator set and a terminal state.
buys:       Routing as data with a decidable outcome.
rejects:    Routing by code; and silent fallthrough (the router throws rather than
            picking arbitrarily).
where:      src/services/conditionalRouter.ts:44-63 (resolveTarget, default, throw);
            :65-131 (evaluateQuery/evaluateOperator, the operator enum);
            :148-153 (getContextValue — hard-coded to exactly TWO path segments,
            `value[parts[0]]?.[parts[1]]`, so `metadata.team` works and
            `params.messages.0.role` silently yields undefined);
            src/handlers/handlerUtils.ts:724-737 (metadata is parsed from the
            caller's `x-portkey-metadata` header, and a parse failure degrades to `{}`
            — which then matches the `default` branch rather than erroring).
stage:      config resolution, per tree node.
corpus:     CATCH — `llm-agent/orchestration/model-routing`, technique `routing-policy`.
```

**Evidence — technique opened.** `routing-policy.md` models this squarely: policy as
data, one evaluation door (law: one-validation-door), a precedence ladder, edit-time
validation of rules ("A rule that can never match is worse than no rule"), and the
exhausted state spelled as its own failure. Portkey implements the same stance. Two
small deltas, both banked as leads rather than landings: (a) portkey's context is
**caller-supplied headers** — untrusted input steering the routing decision — and
routing-policy's rule kinds are asserted by the caller too ("Tags are asserted by the
caller alongside the class") without ever raising the trust question; (b) the silent
depth-2 limit in `getContextValue` is exactly the "rule that can never match" failure
routing-policy warns about, arriving through the evaluator rather than the rule — a
nice field citation *for* the technique.

### SYSTEM B — the guardrail/hook plane
*(`src/middlewares/hooks/`, `plugins/`)*

#### B1. A check that ERRORED is not a check that FAILED, and the config decides per check which way an error votes — defaulting to fail-open  *(CATCH)*

```
decision:   Each check returns {verdict, error, fail_on_error}. A hook's verdict is
              checkResults.every(r => r.verdict || (r.error && !r.fail_on_error))
            — an errored check is treated as PASSING unless that check's own parameters
            set `failOnError`. A check whose plugin function throws is caught and
            recorded as an errored check, not as a crash.
forces:     A guardrail calls a third-party scanner over the network, inside the
            synchronous request path, on every request. Its unavailability is a
            different event from its disapproval, and conflating them means a PII
            vendor's outage takes the whole gateway down (fail-closed everywhere) or
            silently disables the compliance control nobody notices is off
            (fail-open everywhere). Neither answer is right for all checks: an
            unreachable profanity filter should not block a request; an unreachable
            regulated-data scanner must.
buys:       The fail-open/fail-closed decision becomes per-check config with a stated
            default, instead of an emergent property of a try/catch.
rejects:    One global degradation policy for the whole safety layer.
where:      src/middlewares/hooks/index.ts:420-424 (the every() expression);
            :299-315 (executeFunction's catch → {verdict:false, error:{...}} with
            fail_on_error absent, i.e. fail-open);
            :303 fail_on_error: check.parameters?.failOnError || false  (the default);
            src/middlewares/hooks/types.ts:66-82 (GuardrailCheckResult carries verdict,
            error and fail_on_error as three separate fields);
            :465-470 (createFeedbackObject reports successfulChecks / failedChecks /
            erroredChecks as THREE distinct lists to the operator).
stage:      before-request and after-request hook execution, per check.
corpus:     CATCH — `llm-agent/orchestration/session-continuation`, technique
            `advisory-guard-fail-mode`. NOT the two homes the brief predicted.
```

**Evidence — three golden paths opened, and the catch was in none of the expected two.**

- `backend-platform/resilience/optional-dependency-degradation/techniques/refusal-is-not-failure.md`
  **models the distinction exactly** — "an exception is the channel through which two
  opposite messages arrive: **It broke.** … **It refused.**" — and it models the granular
  knob, but **as a per-call-site parameter, not per-check config**, and with the opposite
  default: "**An exception from registered code propagates to the caller**", "**Fallback
  is opt-in, per call, and named**", and the customary wrapper "answers both by running
  the default anyway. Degrading there is not resilience; it is overruling a check that
  someone installed on purpose."
- `llm-agent/prompt-and-context/prompt-safety` states the distinction and then
  **hardcodes the opposite universal answer**: "a sanitizer that cannot run is a
  rejection, not a pass… because 'the filter was skipped' and 'the filter found nothing'
  are opposite facts that must never share an outcome", and
  `techniques/output-sanitization.md`: "**A sanitizer that fails open is an attacker's
  feature request.**" No per-check dimension anywhere in the subject.
- **The actual catch:**
  `knowledge/software-engineering/llm-agent/orchestration/session-continuation/techniques/advisory-guard-fail-mode.md`
  is portkey's rule, already written: a hook registry carrying, per entry, "a **risk
  class** from which the fail mode is derived: **advisory**: fails open. A parse failure,
  a timeout, an exception in the checker, an input outside its model, all pass, each with
  a diagnostic. **protective**: fails closed." Plus "Fail open is not fail silent… the
  guard passes *and emits a structured diagnostic*" and "the two outcomes 'the guard ran
  and found nothing' and 'the guard could not run' are spelled differently in every
  channel." That is `fail_on_error` with better names. **This row is a catch and does
  not advance.**

**But the map turned up something worth the director's attention** (flagged, not
proposed): the corpus holds **three different answers to one question** —
`prompt-safety` says a safety check that cannot run always fails closed;
`session-continuation/advisory-guard-fail-mode` says the fail direction is per-guard and
defaults to open; `optional-dependency-degradation/refusal-is-not-failure` says it
propagates unless a call site opted in. Portkey is a fourth data point (per-check, default
open, applied to *content safety* — the case `prompt-safety` says must fail closed). The
subjects do not cite each other on this. That is an **internal inconsistency surfaced by
an external source**, which is the cheapest kind of corpus finding and the kind a
convergence lane exists for. Recorded in §8 as a lead with a return condition.


#### B2. The guardrail outcome is encoded in the response status space, not in the body

```
decision:   Three distinct outcomes get three distinct statuses. A denying guardrail that
            fails → 446 with a `hook_results` object. A non-denying guardrail that fails
            → 200 normally, but 246 when the response came from cache. A passing
            guardrail → 200. 246 and 446 are outside the registered HTTP code space,
            deliberately, so nothing downstream mistakes them for anything else.
forces:     The fallback loop, the cache layer and the client all need to branch on
            "policy refused this" vs "the provider failed" WITHOUT parsing a JSON body —
            the fallback loop branches on `strategy.on_status_codes`, which is a list of
            integers. A policy refusal routed as a 400 would be retried by every operator
            who put 400 in their retry list; routed as a 200 it would be invisible.
buys:       A verdict that survives every boundary in the pipeline as a first-class
            value. Testable elsewhere: can an operator write a fallback rule that fires
            on "guardrail denied" without a body parser?
rejects:    Carrying the verdict only in the body; and reusing 400/403, which already
            mean something the loop treats differently.
where:      src/handlers/handlerUtils.ts:1316-1335 (the 446 construction, with
            `hook_results.before_request_hooks`);
            src/handlers/services/cacheService.ts:113-118 (the 246, applied to a CACHE
            HIT — see B3); plugins/README.md § Guardrails ("the response can be returned
            with a 246 status code indicating that the guardrails failed");
            tests/integration/src/handlers/tryPost.test.ts:207 ("should through a 446 if
            after request guardrail fails").
stage:      response construction, before the fallback loop sees it.
corpus:     NONE at technique grain, with the REQUIREMENT already at law grain —
            law `software-engineering#verdict-survives-boundary`; nearest subject
            `llm-agent/prompt-and-context/prompt-safety`.
```

**Evidence — law and golden path opened.** The law `verdict-survives-boundary` is
already the requirement, and `retry-backoff/techniques/storm-control.md` restates it
operationally: "the spelling must survive to the surface callers actually see: a
refusal classified precisely inside the retry layer and then re-thrown above it as the
last dependency error has been disguised after all — the classification is judged at
the outermost boundary." **The corpus states the obligation and never states a
mechanism for meeting it across an HTTP boundary.** `prompt-safety` is silent on
enforcement outcomes entirely (its techniques are `untrusted-span-fencing`,
`canary-tripwires`, `input-caps-and-clamps`, `output-sanitization`,
`model-output-as-untrusted`, `cross-language-rule-parity`, `payoff-removal`), and
`canary-tripwires` goes the other way — one hard outcome, "**Stop the flow**", with
observe-and-continue explicitly forbidden. Portkey's contribution is the mechanism and
its constraint: **the carrier must be the status integer, because the consumer that has
to branch on it (`strategy.on_status_codes`) is a list of integers and cannot parse a
body** — which is also why they minted codes outside the registered space rather than
reusing 400/403. That is a real technique-shaped gap sitting under an existing law.
Grain: **technique**, home ambiguous (`prompt-safety` owns the verdict,
`stream-proxy-hop` owns the envelope) — see §7, where it joins the XL cluster.

#### B3. Input guardrails run once per request; output guardrails run per attempt, on 200s only, and their failures spend the transport retry budget

```
decision:   Four rules, all in one place. (1) A before-request hook is skipped when the
            span has a parent — so a fallback/retarget does not re-run input checks.
            (2) An after-request hook is skipped when the response status is not 200 —
            you do not guardrail an error body. (3) When an after-request hook rewrites
            the status into the retry list, the pipeline RE-ENTERS the transport retry
            path, carrying `retryAttemptsMade` forward, so a guardrail-triggered retry
            and a 503-triggered retry draw down the SAME budget. (4) The cache is
            consulted AFTER input hooks, and a cache hit still carries the hook results.
forces:     Input checks are a property of the request and are idempotent — re-running
            them per attempt multiplies third-party scanner spend by the fallback fan-out
            for no new information. Output checks are a property of THIS attempt's answer
            and must run per attempt. And once "the answer was bad" can trigger a retry,
            it is a retry: giving it its own budget re-creates the amplification the
            transport budget exists to bound.
buys:       One budget per request regardless of what triggered the attempt, and scanner
            spend proportional to requests-in rather than to attempts-made. Testable
            elsewhere: if your output validator can trigger a retry, whose budget does
            it spend?
rejects:    Re-running the whole hook set per attempt; and a separate quality-retry
            budget layered over the transport one.
where:      src/middlewares/hooks/index.ts:448-463 (shouldSkipHook — the parent-span
            rule at :459, the non-200 rule at :457, plus embed/mutator exclusions);
            src/handlers/handlerUtils.ts:1256-1279 (the recursion: remainingRetryCount =
            attempts - retryCount - retryAttemptsMade, re-entered with
            (retryCount ?? 0) + 1 + retryAttemptsMade);
            src/handlers/handlerUtils.ts:369-400 (cache consulted after the
            before-request hook block at :318-352);
            src/handlers/services/cacheService.ts:108-118 (hit + hook results + 246);
            tests: "should handle failing after request hooks with retry" (:408) and
            "should include hook results in cached responses" (:436).
stage:      spans the whole per-leaf pipeline.
corpus:     PARTIAL — home exists:
            `backend-platform/resilience/retry-backoff`, technique `storm-control`;
            with `llm-agent/orchestration/model-routing`, technique `failover-horizon`.
```

**Evidence — both techniques opened.** `.../retry-backoff/techniques/storm-control.md`
states the governing force directly: "**Retry at one layer per failure domain**…
When an outer layer legitimately retries (it can repair something — refresh a
credential, choose another provider), the inner layer's attempts are part of the
outer layer's budget, not a hidden multiplier under it." That **models the forces of
rule (3)** — portkey is a clean field instance of it, not a new idea.
`.../model-routing/techniques/failover-horizon.md` models rule (2)'s neighbourhood
from the other side: "the unusable success" — "a transport-shaped taxonomy…cannot see
the failure mode most specific to this subject: the request succeeded, the status was
clean, and the answer cannot serve the caller" — and "**Detection that must run before
the horizon closes must hold the first frame.**" What neither models is rule (1): the
**per-request vs per-attempt asymmetry of the check set itself**, and its cost
argument. That asymmetry is the novel half and it is one paragraph, not a subject.
Grain: **technique**, and the honest shape is a boundary paragraph in
`failover-horizon` plus a field-application citation into `storm-control`.

### SYSTEM C — the provider normalization layer
*(`src/providers/` — 78 directories over one interface)*

#### C1. Normalization strictness is a per-request switch, and the un-strict mode carries the provider-native payload alongside the normalized one

```
decision:   `strict_open_ai_compliance` is a config-tree field (inheritable like any
            other, A1) read at 165 sites across the provider adapters. When true, the
            response is coerced to the lowest common denominator — finish reasons mapped
            through a fixed table, unmappable values collapsed to `stop`, native blocks
            dropped. When false, the native structure rides ALONGSIDE the normalized
            fields in additive keys (`content_blocks` beside `content`), and the
            provider's own finish reason is passed through verbatim.
forces:     A gateway serving an OpenAI-shaped API has two consumer populations with
            opposite requirements. A stock SDK will throw or mis-branch on a finish
            reason outside its enum, so for it, lossy IS correct. An application that
            chose this gateway to reach a specific provider's capability — thinking
            blocks, citations, native tool semantics — is destroyed by exactly that
            loss. There is no single schema that serves both, and the gateway cannot
            know which caller it has.
buys:       The lossy/lossless decision is moved to the only party that knows the answer
            — the caller — and made per request rather than per deployment. Testable
            elsewhere: can a caller of your normalizing proxy opt out of the
            normalization without leaving the proxy?
rejects:    One canonical internal model for the response path — which is precisely
            what the corpus prescribes for the telemetry path.
where:      src/providers/utils.ts:73-84 (transformFinishReason: `if
            (!strictOpenAiCompliance) return finishReason;` — un-strict is the
            PASSTHROUGH branch, and unmappable-under-strict silently becomes `stop`);
            src/providers/anthropic/chatComplete.ts:597-601
              ...(!strictOpenAiCompliance && { content_blocks: response.content.filter(
                  item => item.type !== 'tool_use') })
            src/handlers/handlerUtils.ts:534-540 (it inherits down the tree);
            src/handlers/streamHandler.ts:29-36 (shouldSendHookResultChunk — the same
            switch decides whether guardrail results are injected into the STREAM).
stage:      response transformation, per attempt.
corpus:     NONE — nearest neighbour
            `llm-observability/telemetry-and-data/multi-provider-event-normalization`.
```

**Evidence — golden path opened.**
`knowledge/llm-observability/telemetry-and-data/multi-provider-event-normalization/multi-provider-event-normalization.md`
was read in full. It models the forces of many-wire-shapes-to-one-model with real
depth — "the standard itself is a moving target", attribute-precedence-lists,
provider-family-matching, and "**Resist the temptation to write one clever generic
extractor**". But its design centre is explicitly **one internal model**: "Every
downstream capability the operator sells… consumes exactly one internal event model",
and `two-doors-one-pipeline` exists to forbid a second accounting shape. That stance
is correct for its subject — telemetry is *accounting*, and a caller-selectable
schema there would produce two invoices — and it is the **opposite** of the right
answer in the request path, where the normalized payload is the product being
delivered to a caller who may have chosen the gateway precisely for what
normalization removes. The subject models normalization-for-accounting; nothing in
the corpus models **normalization-for-proxying**, where lossiness is a caller-scoped
policy. This is a genuine hole, and it is the one with the strongest fleet pull
(§10). Grain: technique-sized *if* a home exists; see §7 — it does not have one on
the request-path side.

#### C2. Request translation is declarative data; response translation is code. The asymmetry is deliberate

```
decision:   A provider adapter is `{api, <endpoint>Config, <endpoint>ResponseTransform}`.
            The REQUEST side is a pure data map: parameter name → {param, default, min,
            max, required, transform}. The RESPONSE side is a function per endpoint. The
            API side is three functions (getBaseURL / getEndpoint / headers) plus an
            optional whole-request escape hatch (`getRequestHandler`).
forces:     Request translation across 78 providers is overwhelmingly renames plus
            clamps plus defaults, and expressing that as data makes 74 of the adapters
            reviewable at a glance and generatable. Response translation is structural —
            re-shaping arrays, synthesising ids, mapping enums, accumulating usage — and
            data cannot express it. Forcing symmetry either cripples the response side or
            bloats the request side into a DSL.
buys:       A new provider is a directory of small files, most of them data, with one
            typed interface (`ProviderAPIConfig`, `ProviderConfig`, `ParameterConfig`)
            the compiler enforces. The escape hatch (`hasRequestHandler`) means a
            provider that does not fit — Bedrock's SigV4, Vertex's service-account auth —
            bypasses the whole transform path rather than distorting it.
rejects:    A symmetric imperative adapter interface; and a single generic transform.
where:      src/providers/types.ts:18-42 (ParameterConfig/ProviderConfig);
            :45-81 (ProviderAPIConfig); :83-118 (endpointStrings — 36 endpoint kinds,
            the real surface area); :127-136 (RequestHandler escape hatch);
            src/providers/anthropic/api.ts (a whole adapter API config in 42 lines);
            src/providers/utils.ts:73-100 (the shared finish-reason maps — the ONLY
            cross-provider normalization code, and it is a lookup table per direction);
            src/handlers/handlerUtils.ts:41-77 (constructRequestBody applies the map).
stage:      request construction and response transformation.
corpus:     PARTIAL — home exists:
            `llm-observability/telemetry-and-data/multi-provider-event-normalization`,
            technique `per-provider-usage-extractors`.
```

**Evidence — golden path and technique named opened.** The subject states the
matching rule for the response direction: "the extraction is per-provider by
construction, one small extractor per provider family, each producing the identical
usage tuple… the shapes are not variations on a theme, they are independent designs,
and a generic walker that guesses wrong produces a number rather than an absence."
Portkey **agrees on the response side and disagrees on the request side** — and it has
78 adapters of evidence that the request side generalizes as data where the response
side does not. That is a refinement of an existing technique, not a new mechanism:
the corpus's rule is stated over "provider shapes" generally, and the direction-
dependence is the qualifier it is missing. Grain: **technique** amendment.

#### C3. Streaming normalization is a stateful per-stream machine, and the frame delimiter is a property of (provider, endpoint) — not of the protocol

```
decision:   Chunk transforms take a mutable `streamState` object threaded across the
            whole stream (tool-call index, accumulated usage, a fallback chunk id
            synthesised once), so a chunk cannot be normalized in isolation. And the
            byte-level frame boundary is looked up per provider AND per endpoint:
            `\n\n` by default, `\r\n\r\n` for Anthropic's /complete and for Vertex's
            Google publishers, `\n` for Cohere's non-chat endpoints — while Bedrock is
            not SSE at all and is read with a hand-rolled binary reader over
            length-prefixed frames with a 4-byte prelude, a headers block and a CRC.
forces:     Providers agree on "server-sent events" and disagree on every detail of it,
            including whether it is SSE. A normalizer written against the spec works
            against most providers and silently mis-frames the rest — and mis-framing a
            stream does not error, it stalls or emits truncated JSON. Meanwhile the
            OpenAI chunk shape carries indices and cumulative usage that no single
            upstream chunk contains, so the state has to live somewhere.
buys:       Correct streams from providers whose only shared property is that bytes
            arrive over time. Testable elsewhere: does your stream reader take the
            delimiter as a parameter, and does your chunk transform own state?
rejects:    One SSE reader; and a pure per-chunk transform function.
where:      src/utils.ts:14-39 (getStreamModeSplitPattern — provider AND requestURL);
            src/handlers/streamHandler.ts:38-52 + :62-130 (getPayloadFromAWSChunk and
            readAWSStream — the binary framing, readUInt32BE prelude/headers/CRC);
            :69 `const streamState = {}` created once per stream and passed to every
            transform call; src/providers/anthropic/chatComplete.ts:638-660 (the
            transform mutating streamState.toolIndex / streamState.usage);
            src/handlers/streamHandlerUtils.ts.
stage:      response streaming, per chunk.
corpus:     NONE — nearest neighbours `llm-agent/runtime-and-io/streaming-output`
            (which prescribes the OPPOSITE) and
            `llm-observability/.../multi-provider-event-normalization`, technique
            `per-provider-usage-extractors` (right idea, explicitly non-streaming).
```

**Evidence — golden path opened, and it argues against this decision.**
`knowledge/software-engineering/llm-agent/runtime-and-io/streaming-output/streaming-output.md`
is single-producer-to-single-surface and UI-facing: "the surface renders **exactly one
run's live state**". Its `stream-parsing` technique acknowledges that framings vary in
exactly one clause — "the **framing** (how the byte flow divides into units — commonly
one record per line, sometimes length-prefixed blocks or blank-line-separated groups)" —
and then prescribes a **stateless-per-frame** parser: "the payload parser's only job is
to turn one complete frame into one typed event", "Events in **arrival order**, exactly
once each — the parser neither reorders nor deduplicates." That is the opposite of
portkey's threaded `streamState`, and it is *correct for its subject* (one known
producer) and wrong for a gateway (N producers whose chunk shapes each omit something
the output shape requires). Nothing in the corpus models per-provider **or**
per-endpoint delimiter divergence, and nothing models a provider that is not SSE at all.
`per-provider-usage-extractors` is the closest correct instinct — "**one small, explicit
extractor per provider family**… A generic walker… *finds something*" — but it says of
itself "This is a client-wrapper (sender-side) technique", is non-stateful, and treats
"a streaming path that skipped the final usage frame" only as a null case. Grain:
**subject-sized** when taken with C1 — see §7.

*(Field fact worth banking on its own, independent of any landing: the three retry-after
header spellings in `src/globals.ts:7` with different unit semantics are the same shape
as the corpus's `attribute-precedence-lists`, applied to the retry lane rather than
telemetry ingest. Two independent appearances of "provider spelling variance needs an
ordered accept-list" is convergence evidence that the technique generalizes beyond its
current subject.)*

### SYSTEM D — the operator and credential surface
*(`src/middlewares/log/`, `src/middlewares/adminAuth/`, `conf.example.json`, the injected validator)*

#### D1. The local debug stream sanitizes by allowlist and is gated behind a session the service refuses to boot without

```
decision:   The gateway ships a live log stream and a local UI. Everything it emits is
            sanitized by ALLOWLIST — exactly six provider-option keys survive
            (provider, overrideParams, retry, cache, requestURL, rubeusURL) and every
            other key becomes `[REDACTED]` — plus a blanket redaction of ALL request
            headers by key. `/log/stream` and `/public/*` require an in-memory admin
            session established from `conf.json.admin_token`, and the middleware THROWS
            AT STARTUP if that token is absent: "Set admin_token or start the gateway
            with --headless."
forces:     This process is holding every upstream provider credential in the
            installation, in memory, in the objects it is about to log. A denylist over
            that object is wrong by construction — the next provider integration adds a
            key nobody adds to the list, and the first person to notice is whoever reads
            the stream. And an observability surface on a self-hosted box defaults to
            reachable, so the choice is between an auth gate and a refusal to start.
buys:       New credential fields are redacted by default rather than exposed by
            default, and there is no configuration in which the debug surface is open.
            Testable elsewhere: does your redaction fail open or closed when a field is
            added?
rejects:    Denylist redaction; an unauthenticated local debug surface; and a
            "development only" flag (they made it a startup error instead).
where:      src/middlewares/log/index.ts:18 (sanitizeHeaders — maps EVERY key to
            [REDACTED]); :20-27 (ALLOWED_PROVIDER_OPTION_KEYS, six entries);
            :29-37 (sanitizeProviderOptions); :5 MAX_RESPONSE_LENGTH = 100000;
            src/middlewares/adminAuth/index.ts:9-19 (getConfiguredAdminToken throws);
            :71-76 (HttpOnly; SameSite=Strict; Max-Age=43200);
            :6 adminSessions is an in-memory Map — sessions die with the process;
            CLAUDE.md § Configuration.
stage:      operator surface, outside the request path.
corpus:     NONE — the cleanest gap in the run. Nearest neighbours
            `security/browser-credential-boundary`, technique
            `broker-proxy-attaches-secret` (right rule, opposite direction), and
            `security/telemetry-pii-redaction`, technique `denylist-plus-pattern-pass`
            (concedes the rule in a "when not to reach for this" note).
```

**Evidence — both techniques opened.**
`security/browser-credential-boundary/techniques/broker-proxy-attaches-secret.md`
states portkey's exact reasoning, pointed the other way — at the request being
*forwarded upstream*, not at the payload being *emitted downstream*: "**The forward set
is an allowlist.** Enumerate the request headers the route will pass upstream, and drop
everything else… A denylist fails the same way it always fails: the header added to the
protocol next year is forwarded by default, and nobody who added it knew about your
route." `opaque-upstream-errors.md` gets as close as a norm: "the log line is written as
though a screenshot of it will end up in a ticket… no credentials, no full request
bodies" — a discipline, not a mechanism. And
`security/telemetry-pii-redaction/techniques/denylist-plus-pattern-pass.md` **concedes
the whole point in a caveat**: "If you construct the outbound payload yourself, **an
allowlist replaces both passes and is strictly better.**" A service's own debug stream
is precisely the payload it constructs itself, and no technique states the allowlist as
the governing rule there. The boot-gate half is unmodelled too: the corpus's only
"refuses to start" is for malformed config
(`optional-dependency-degradation`: "boot validates its shape and refuses to start when
it is wrong"), never for a missing admin secret on a debug surface. Grain: **technique**,
home exists (`browser-credential-boundary`, or `telemetry-pii-redaction`). This one
advances cleanly and does NOT need the XL.

#### D2. Credentials are held under an opaque slug carrying its own rate limits and priced model roster; budget enforcement is a pre-request refusal

```
decision:   `conf.json.integrations[]` maps a slug (`dev_team_anthropic`) to
            {provider, credentials, rate_limits[{type: requests|tokens, unit: rph,
            value}], models[{slug, status, pricing_config}]}. A request names the slug,
            never the key. The enforcement point is a `preRequestValidator` injected on
            the Hono context, called BEFORE the provider request is constructed, able to
            return a terminal response AND a `modelPricingConfig` that is then attached
            to the request's log object.
forces:     A shared gateway is the only place in the topology that can see every team's
            spend, and the only place that can refuse a call before it costs anything —
            after the call, a budget is a report. Handing the raw key to the caller makes
            rotation a fleet-wide migration and puts the secret in every client's config.
            And a rate limit expressed per credential rather than per provider is what
            lets two teams share a vendor account without one starving the other.
buys:       Rotation is a config edit at one place; the model allowlist and the price
            book travel WITH the credential; and the spend ceiling is enforceable rather
            than merely observable.
rejects:    Callers holding provider keys; and metering-after-the-fact.
where:      conf.example.json:13-47 (the whole integration model, incl.
            `pricing_config: null` and `status: "active"` per model);
            src/handlers/services/preRequestValidatorService.ts:20-31 (the seam, and
            the returned modelPricingConfig);
            src/handlers/handlerUtils.ts:402-427 (called before the provider request,
            can terminate); handlerUtils.ts:414-416 (updateModelPricingConfig);
            src/handlers/services/logsService.ts:37-40 (modelPricingConfig rides on the
            log object); src/globals.ts HEADER_KEYS (x-portkey-provider,
            x-portkey-config, x-portkey-api-key — the three credential provenances).
stage:      admission, before request construction.
corpus:     PARTIAL, narrowing to one unmodelled clause — homes exist:
            `security/credential-vault`, technique `brokered-egress` (the slug and the
            per-credential limits), and
            `llm-observability/economics-and-governance/usage-limit-governance`,
            technique `enforcement-placement-and-reconciliation` (the inline seat).
```

**Evidence — three golden paths opened; two of the three claims are already owned.**
`security/credential-vault/techniques/brokered-egress.md` states the slug indirection
*and its forces*: the caller's contract is "a **credential reference** (an identity,
never a value)… It never holds the secret, so it cannot log it, serialize it into
state, ship it to an error tracker, or leak it in a crash — entire defect classes
closed by shape rather than review", and it names the per-credential governance
dividend explicitly: "**Per-credential rate limits and quotas applied at the door**
bound what a compromised or runaway caller can spend through any credential —
containment that N independent call sites cannot provide."
`usage-limit-governance/techniques/enforcement-placement-and-reconciliation.md` owns
the pre-request seat by name: "**Inline (gateway or proxy, before the provider call).**
The cap can refuse the call itself — prevention, not back-pressure. But it decides with
less evidence" — and `cost-metering/techniques/budget-enforcement.md` adds "**Never
spends.** The block happens before the provider is contacted."

**What survives as a gap is one clause, and it is narrow:** the price book is keyed to
the *model* everywhere in the corpus (`llm-price-book-operations`: "Given `(provider,
model, input tokens, lane)`"), never to the *credential*. Portkey attaches
`pricing_config` and a `status`-bearing model allowlist to the integration slug, so a
credential carries its own price book and its own permitted roster — which is what makes
"team A pays list, team B is on a negotiated rate, and neither may call the frontier
model" expressible at all. A corpus-wide search for an allowed-model list attached to a
credential returns nothing. Grain: **one technique**, in `credential-vault` or
`llm-price-book-operations`. Does **not** advance to a subject and does **not** join the
XL cluster; it is a paragraph, and the honest read is `partial`.

#### D3. One build targets the Web-standard runtime subset so the same gateway runs on an edge worker, a Node server, and a Lambda

```
decision:   The whole gateway is written against Web platform APIs only — `fetch`,
            `Request`/`Response`, `ReadableStream`, `AbortController`, `crypto.subtle`,
            `crypto.randomUUID`, `TextEncoder` — on Hono, with the runtime reached only
            through `hono/adapter`'s `env(c)` and `getRuntimeKey()`. `docs/installation-
            deployments.md` enumerates 15+ targets from that one source.
forces:     A gateway's value is proportional to how close it sits to the caller, and
            "close" means different runtimes for different customers — an edge worker for
            latency, a container for compliance, a Lambda for an existing AWS estate.
            Any Node-specific API in the hot path forks the codebase.
buys:       One tree, one test suite, N deployment targets. Testable elsewhere: does the
            request path import anything from `node:`?
rejects:    A Node-first implementation with an edge port. The cost is paid and visible:
            the OSS cache is a module-level in-memory object with no eviction
            (`const inMemoryCache: any = {}`), admin sessions are an in-memory Map, and
            `wrangler.toml` needs `nodejs_compat` anyway.
where:      wrangler.toml:1-5; src/middlewares/cache/index.ts:3 and :14-26
            (crypto.subtle.digest for the cache key); src/handlers/retryHandler.ts:9-14
            (AbortController); src/middlewares/log/index.ts:2 (getRuntimeKey);
            docs/installation-deployments.md (Node/Bun/Cloudflare/Docker/EC2/Replit/
            Zeabur/Supabase/Fastly/Vercel/Lambda/Lambda@Edge);
            src/handlers/realtimeHandler.ts vs realtimeHandlerNode.ts — the ONE place
            the portability broke, and they forked the file rather than the codebase.
stage:      build/deploy.
corpus:     CATCH-ish — `engineering-process/build-and-release/packaging` and the
            fleet's `deployment-contract` subject. Recorded for completeness; not
            advanced. See §8.
```

---

## 4. Routing decision

The count is **how many load-bearing design decisions this tree carries that no subject
in the corpus models** — "models" meaning a golden path that states the decision's
*forces*, not a technique that mentions the word. Every verdict below was reached by
opening the named document (§3 carries the evidence per entry). No verdict rests on a
slug match, and no absence was established from a capped or piped result.

### Counted PER SYSTEM, with the system named

| System | Where it lives | Entries | NONE | boundary/partial | catch |
| --- | --- | --- | --- | --- | --- |
| **A — the routing & execution tree** | `src/handlers/handlerUtils.ts`, `src/services/conditionalRouter.ts`, `src/middlewares/requestValidator/schema/config.ts` | A1–A5 | **2** (A1, A4) | 2 (A2, A3) | 1 (A5) |
| **B — the guardrail / hook plane** | `src/middlewares/hooks/`, `plugins/` | B1–B3 | **1** (B2) | 1 (B3) | 1 (B1) |
| **C — the provider normalization layer** | `src/providers/` (78 adapters, one interface) | C1–C3 | **2** (C1, C3) | 1 (C2) | 0 |
| **D — the operator & credential surface** | `src/middlewares/log/`, `src/middlewares/adminAuth/`, `conf.example.json`, the injected validator | D1–D3 | **1** (D1) | 1 (D2) | 1 (D3) |
| | | **13** | **6** | **5** | **3** |

### The decision

**Whole-tree count: 6 `corpus: NONE`. Three or more → this is a forge job.**

**Per-system count: the maximum is 2 (systems A and C), so no single system clears the
threshold alone.** That distinction is the useful part for the director and it changes
what the handoff should be:

- A `/forge` dispatched at **the whole repository** would scout four unrelated planes and
  produce a bundle whose subjects have nothing in common but a vendor — the failure the
  per-system rule exists to catch.
- The six NONEs are **not evenly spread**. Four of them (A1, A4, C1, C3) plus one of the
  partials (B2's mechanism) share a single home if new: **the request plane of a gateway
  that fronts many providers for many callers.** That is the XL trigger firing on the
  `HOME IF NEW` clause, mechanically, without a judgment call (§7).
- The remaining two NONEs are **standalone technique-grain landings in existing homes**
  and should not be swept into the subject: D1 → `security/browser-credential-boundary`;
  and A2/A3 → `backend-platform/resilience/retry-backoff`.

**Recommended handoff shape (the director decides, not this worker): a SCOPED forge on
one subject — not a repo-wide `/forge`** — with the design record as the scout brief,
plus three or four ordinary technique landings alongside it. This matches the shape the
`tenant-scoped-agent-runtime` proposal used on 2026-09-02 ("forge handoff scoped to one
subsystem: four `design` candidates with `corpus: NONE` and no corpus home").

Intake then resumes only for the claims the design read did not absorb — §5's claim rows,
§8's leads, §9's reusable engineering.

**Board note.** Before the home is final, the implicated bundles must be claimed and
checked against live siblings: `software-engineering/backend-platform/resilience`
(primary) and `software-engineering/llm-agent/orchestration` (alternate placement),
plus `software-engineering/security` for D1. The map was run on `main` this working tree;
the instrument's own branch warning applies, and `librarian-scan` shows
`llm-observability/operator-surfaces-for-llm-spend` at 40 attention points and rising —
a sibling may be standing on adjacent ground.

---

## 5. Candidates

### 5a. Design candidates (`shape: design`, strip test deferred to Phase 7)

| # | Title | Stage | Corpus verdict | Home if new / home if landing | Effort | Read |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Routing strategy and execution policy are one recursive tree | config resolution | **NONE** (`model-routing/routing-policy` models a flat cascade) | XL cluster | XL | **real gap** |
| A2 | Breaker as candidate filter; all-open is not empty | pre-dispatch | boundary (`circuit-breakers` models one breaker over one dependency) | `retry-backoff/circuit-breakers` | M | **real gap** (promoted, §6) |
| A3 | Stated retry-after outranks the ladder until it exceeds the budget | transport | boundary (`backoff-design` states both rules, never their collision) | `retry-backoff/backoff-design` | M | **real gap** (promoted, §6) |
| A4 | The hop marks its own failures for the enclosing loop | fallback loop | **NONE** (`upstream-status-normalization` is the downstream direction) | XL cluster / `stream-proxy-hop` | M | **real gap** |
| A5 | Conditional routing over a query DSL on request metadata | config resolution | **catch** (`routing-policy`) | — | — | likely catch |
| B1 | Errored ≠ failed; per-check fail direction, default open | hook execution | **catch** (`session-continuation/advisory-guard-fail-mode`) | — | — | likely catch |
| B2 | The guardrail verdict rides in the status space, not the body | response construction | **NONE** at technique grain; law `verdict-survives-boundary` states the obligation | XL cluster / `prompt-safety` | M | **real gap** |
| B3 | Input checks once per request, output checks per attempt, one shared budget | whole leaf pipeline | partial (`storm-control` models the budget; cadence unmodelled) | `model-routing/failover-horizon` | S | **partial → advances**, §6 |
| C1 | Normalization strictness is a per-request switch; native payload rides alongside | response transform | **NONE** (`multi-provider-event-normalization` prescribes one model, correctly, for accounting) | XL cluster | XL | **real gap** |
| C2 | Request translation is data; response translation is code | both | partial (`per-provider-usage-extractors` is response-side only) | `multi-provider-event-normalization` | S | partial |
| C3 | Stateful stream normalization; delimiter is per (provider, endpoint) | streaming | **NONE** (`streaming-output/stream-parsing` prescribes stateless-per-frame) | XL cluster | L | **real gap** |
| D1 | Allowlist-sanitized debug stream behind a boot-required admin token | operator surface | **NONE** (rule exists for forwarded headers; conceded in a caveat elsewhere) | `security/browser-credential-boundary` | M | **real gap** |
| D2 | Credential slug carrying rate limits and a priced model roster | admission | partial — only the priced roster survives (`brokered-egress` owns the rest) | `credential-vault` | S | partial |
| D3 | One build for the Web-standard runtime subset | build/deploy | catch-ish (`packaging`, fleet `deployment-contract`) | — | — | thin |

### 5b. Claim candidates (Phase 3 shape; strip test run at extraction)

| # | Lane | Shape | Eff | Title | Claim | Anchor | Strip | Prior art | Impact | Read |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | S | Take the retry-after header's three spellings in order | Providers spell the same fact three ways with two unit systems: `retry-after-ms`, `x-ms-retry-after-ms`, `retry-after` (seconds). | `src/globals.ts:7`; `retryHandler.ts:113-120` | survives — "a stated-delay reader needs an ordered accept-list, not one header name" | `multi-provider-event-normalization/attribute-precedence-lists` | new-technique / fills-stack-gap | **real gap** — and it is *convergence*: the same shape now sighted in two unrelated lanes |
| 2 | K | correction | S | Retries default to OFF in a shared gateway | `attempts ?? 0`, and `onStatusCodes` is the empty array unless attempts > 0 — the taxonomy is inert until an operator opts in. | `src/handlers/services/requestContext.ts:148-155` | survives — "a component that fans in every caller must not retry by default; its default IS the fleet's amplifier" | `retry-backoff/storm-control` | corrects-claim | partial |
| 3 | K | technique | S | A check declares which lifecycle points it may run at | 21 built-in checks each declare `supportedHooks`; schema/JSON checks are after-request only, authorization checks are before-request only, and the runtime enforces it. | `plugins/default/manifest.json`; `plugins/README.md` § Manifest | survives — "the phase a check can run at is a property of the check, declared, not a convention" | `prompt-safety`; `quality-gates/chokepoint-tag-registry` | new-technique | partial |
| 4 | K | technique | S | The cache key is the TRANSFORMED body, not the caller's | SHA-256 over `(provider-transformed body + endpoint)`, so two different gateway-level requests that transform identically share a hit. | `src/middlewares/cache/index.ts:14-26`; `cacheService.ts:88-95` | survives — "cache identity belongs at the layer where the request is canonical" | `client-architecture/client-fetch-cache`; `cost-metering` | new-technique | partial |
| 5 | K | technique | S | Streams are never cached, and the exclusion is a list not a flag | `putInCache` returns early on `stream`, and 16 endpoint kinds (files, batches, finetunes, imageEdit) are excluded by an explicit non-cacheable list. | `cache/index.ts:69-72`; `cacheService.ts:22-40` | survives — "cacheability is a per-endpoint property enumerated once, not a per-call guess" | `client-fetch-cache` | new-technique | thin |
| 6 | K | currency | S | Provider-native tool semantics have outrun the common schema | The Anthropic adapter's tool type carries `defer_loading`, `allowed_callers`, `input_examples` — fields with no OpenAI-shaped equivalent, which is *why* C1 exists. | `src/providers/anthropic/chatComplete.ts:29-62` | nothing survives (vendor field names) — but it dates C1's force | `mcp-tools/tool-schema-design` | resets-clock | partial |
| 7 | X | application | M | The fleet's gateway-shaped projects have this seam | `tracklight` ingests what a gateway emits; `pumper` is the same adapter-behind-one-interface shape for fetch engines. | §10 | n/a — application lane, names allowed | — | fills-stack-gap | **real gap** (direction input) |
| 8 | T | script | M | The pipeline integration test with a mocked provider boundary | 26 named cases exercise the whole `tryPost` pipeline through fluent builders against a booted gateway. | `tests/integration/src/handlers/tryPost.test.ts` | survives — see §9 | `engineering-process/.../test-harness` | new-technique | partial |
| 9 | K | lead | S | Untrusted headers steer the routing decision | `metadata` for the conditional router is parsed from a caller header; a parse failure degrades to `{}` and silently takes the `default` branch. | `handlerUtils.ts:724-731` | survives — "routing on caller-asserted context is an authorization question the policy layer does not currently ask" | `model-routing/routing-policy` | none | partial → lead |
| 10 | K | lead | S | An evaluator's silent depth limit is the rule-that-cannot-match failure | `getContextValue` splits on `.` and reads exactly two segments; deeper paths yield `undefined` and no error. | `conditionalRouter.ts:148-153` | survives — a field citation *for* `routing-policy`'s edit-time-validation rule | `model-routing/routing-policy` | none | thin → lead |
| 11 | K | lead | S | No jitter in a component that is the fleet's correlator | `randomize: false` passed to the retry library. | `retryHandler.ts:169` | survives as a **disproof by counterexample** — cite INTO `backoff-design`, do not correct it | `retry-backoff/backoff-design` | none | thin → lead |
| 12 | P | practice | S | The vendor-repository class needs a "no rules page" branch | This repo has no production-rules doc; step 1 of the Phase-2b sweep returned nothing and the density moved wholly into the pipeline code. | §1, §2 | n/a — skill lane | `references/source-classes.md` | corrects-claim | **real gap** (cheap) |

**Expected yield for the class, restated before the reads:** a vendor repository is
reliable for its config schema and its client's types and for nothing on its marketing
surface. Six design NONEs and twelve claim rows from a repo whose README produced zero
findings is **the class performing exactly as predicted**, not an unusually rich source.

---

## 6. Promoting questions executed

Per Phase 5 (v2): every `partial` row gets one question written and answered with one
file read before it is filed. Five were owed. All five were executed; three promoted.

| Row | The one question | File read | Answer | Verdict |
| --- | --- | --- | --- | --- |
| **A2** | Does `circuit-breakers` state what happens when the breaker's verdict is one input to choosing among N candidates, and specifically when all N are open? | `knowledge/software-engineering/backend-platform/resilience/retry-backoff/techniques/circuit-breakers.md` — read to the end (the sections `research-map` does not surface: "Provenance decides who may lift it early", "Scope must match the evidence, in both directions", "The open breaker must be loud") | **No.** The technique is deep on scope-as-hypothesis and even on cross-credential evidence ("Evidence gathered across a set must open across that set"), and its only multi-breaker rule is *layered breakers over one call*: "**Deny wins.** A call proceeds only if every applicable breaker admits it." That is N breakers → 1 call. Portkey's case is 1 breaker → N candidates, and the degenerate all-open state is never reached. | **PROMOTES to real gap.** Technique-grain, home exists. |
| **A3** | Does either `backoff-design` or `retry-backoff.md`'s terminal-states section say what happens when the dependency's stated schedule exceeds the ladder's total-time budget? | `.../techniques/backoff-design.md` and `.../retry-backoff.md` § "Stopping is a first-class outcome" | **No.** Both rules are present and never collide: "**A stated schedule outranks the ladder**" and, separately, "**The ladder needs a total-time budget, not just an attempt count.**" The four enumerated terminal states (succeeded-after-N / exhausted / reclassified / denied) have no slot for "the stated wait did not fit the budget". | **PROMOTES to real gap.** Technique-grain amendment. |
| **B3** | Does `failover-horizon` or `storm-control` state a per-request vs per-attempt cadence for the *check set* (as opposed to for the retries)? | `.../model-routing/techniques/failover-horizon.md`, plus `.../retry-backoff/techniques/storm-control.md` | **Half.** `storm-control` fully models the budget-sharing half — "the inner layer's attempts are part of the outer layer's budget, not a hidden multiplier under it" — so rule (3) is a catch. Nothing anywhere models rule (1): input checks are idempotent-per-request and must not re-run per attempt, on a cost argument. | **PROMOTES, narrowed.** One paragraph in `failover-horizon`, not a technique of its own. |
| **C2** | Does `per-provider-usage-extractors` distinguish the request direction from the response direction when it says "resist a generic extractor"? | `knowledge/llm-observability/telemetry-and-data/multi-provider-event-normalization/techniques/per-provider-usage-extractors.md` | **No — it is response-side only**, and says so of itself ("This is a client-wrapper (sender-side) technique"). It therefore neither claims nor denies the request-side generalization portkey demonstrates across 78 adapters. | **Does not promote.** Stays `partial`; a one-line qualifier on an existing technique, worth doing only if a worker is already in that file. |
| **D2** | Is pricing ever attached to a *credential* in the corpus, rather than to a model? | `knowledge/llm-observability/economics-and-governance/llm-price-book-operations/` (technique roster + `price-resolution-order`), cross-checked against `security/credential-vault/techniques/brokered-egress.md` | **No.** Resolution is keyed `(provider, model, input tokens, lane)`; the credential is not an axis. But `brokered-egress` already owns the slug indirection *and* per-credential rate limits with their forces, so only the priced-roster clause is new. | **Does not promote to a subject; promotes to a narrow technique row.** Stays `partial`. |

Two rows were **not** given promoting questions because the design record had already
closed them as catches (B1, A5) — per the rule that a `design` row is never `likely
catch`, both are recorded as catches with the technique named, not declined.

---

## 7. XL trigger

### FIRED — on the mechanical clause, not on a judgment call

> *"When three or more `design` candidates carry the same `HOME IF NEW` — or the same
> `corpus: NONE` neighbour — a subject exists by construction."*

**Counts.** By the *neighbour* clause the trigger does **not** fire: the six NONEs point
at five different neighbours (`routing-policy`, `upstream-status-normalization`,
`prompt-safety`, `multi-provider-event-normalization`, `streaming-output`,
`browser-credential-boundary`) with no three alike. By the **`HOME IF NEW`** clause it
fires at **four**, and arguably five:

| Candidate | Stage in the tree's own pipeline | Home if new |
| --- | --- | --- |
| **A1** | config resolution | the gateway request plane |
| **A4** | the fallback loop | the gateway request plane |
| **B2** | response construction | the gateway request plane *(fifth, counted separately below)* |
| **C1** | response transformation | the gateway request plane |
| **C3** | response streaming | the gateway request plane |

Four (A1, A4, C1, C3) are unambiguous: each is a decision you face **only** when one
process fronts N providers for M callers, none has a home, and they are four consecutive
stages of one pipeline. B2 is counted as a fifth with a caveat — its obligation already
exists at law grain, so it could instead land as a technique in `prompt-safety`; the
drafter should decide, and the proposal below lists it as the optional sixth technique.

Two NONEs are deliberately **excluded** from the cluster, because sweeping them in is how
a scoped forge becomes a sprawling one: **D1** (operator/credential surface — a clean
technique landing in `browser-credential-boundary`) and the **A2/A3 pair** (technique
amendments in `retry-backoff`). Also excluded: **D2** (one clause), **C2** (one
qualifier), **D3** (a catch).

---

# Subject proposal — `multi-provider-gateway-plane`

**Status:** **PROPOSED** 2026-09-02 by run `intake-portkey-0902` (intake 2.1.1, front half
by an Opus worker). Awaiting the director's direction pass. Five `design` candidates with
`corpus: NONE` and one shared home; the worker did not raise this as a repo-wide `/forge`,
because the per-system routing count (§4) says no single plane of the tree clears the
threshold alone and only this cluster shares a home.
**Bundle:** `software-engineering`
**Category:** `backend-platform` → subcategory **`resilience`** (see placement note)
**Resolved path:** `knowledge/software-engineering/backend-platform/resilience/multi-provider-gateway-plane/`
**Raised by:** `/intake`, 2026-09-02, from this run's design record — entries A1, A4, C1,
C3, and optionally B2 — over `Portkey-AI/gateway` @ `669825cb`.
**Engine:** `domain-knowledge-forge` — read `docs/forge-brief.md` first; it is the contract.

## Placement, verified against the authority

`knowledge/software-engineering/taxonomy.json` is the authority; **`categories` is a
list**, and the counts below were read from the file this run by walking
`categories[] → subcategories[] → subjects[]`, not from the directory tree:

- `backend-platform.resilience` holds **eight** — `error-handling`,
  `optional-dependency-degradation`, `rate-limiting`, `retry-backoff`,
  `scale-investment-timing`, `self-healing`, `stream-proxy-hop`, `webhook-ingestion`.
  **Cap is ten. Two slots free.**
- `llm-agent.orchestration` holds **nine** (the `tenant-scoped-agent-runtime` landing
  earlier today took the ninth). One slot free.
- **`llm-agent.runtime-and-io` holds ten — FULL.** `streaming-output` lives there, so the
  streaming-shaped half of this subject (C3) **cannot** be homed beside its nearest
  neighbour, and this constrains the placement rather than merely informing it.
- `llm-agent.prompt-and-context` seven; `llm-agent.evaluation-and-cost` five;
  `security` eight; `integration` nine.

**Placement decision: `backend-platform/resilience`.** The subject's nearest neighbour by
force is `stream-proxy-hop`, which is *the same shape with N=1* — one hop, one origin, one
credential — and lives here. `retry-backoff` (the failure lane this plane composes over)
and `rate-limiting` are here too. The alternative, `llm-agent/orchestration` beside
`model-routing`, is defensible and would consume that subcategory's last slot; the
discriminator is that this subject's decisions are **transport-and-envelope** decisions
(framing, status space, config inheritance, failure attribution) rather than
*which-model* decisions, and `model-routing` already draws that seam in its own words:
"routing decides, failover retries, metering bills." **Append the slug through
`scripts/apply-taxonomy.mjs`; do not edit the tree by hand.**

Link depths, stated so they are not derived wrongly:

- from `multi-provider-gateway-plane/multi-provider-gateway-plane.md` → `../../../_laws.md`
- from `multi-provider-gateway-plane/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling in the same subcategory: `../stream-proxy-hop/stream-proxy-hop.md`,
  `../retry-backoff/retry-backoff.md`,
  `../stream-proxy-hop/techniques/upstream-status-normalization.md`,
  `../retry-backoff/techniques/storm-control.md`
- to another subcategory in the same category: `../../data-layer/...`
- to another category's subject:
  `../../../llm-agent/orchestration/model-routing/model-routing.md`,
  `../../../llm-agent/orchestration/model-routing/techniques/failover-horizon.md`,
  `../../../llm-agent/runtime-and-io/streaming-output/streaming-output.md`,
  `../../../security/credential-vault/credential-vault.md`
- to another bundle:
  `../../../../llm-observability/telemetry-and-data/multi-provider-event-normalization/multi-provider-event-normalization.md`

## The gap, measured

Concept probes only — never product names, which return zero by construction against the
purity gate — followed by opening every golden path the map returned:

| concept probed | best hit | what it actually covers |
| --- | --- | --- |
| provider fallback and load balancing across model endpoints | `llm-agent/orchestration/model-routing` (17 pts) | *which* candidate serves a call — class, tier, effort, policy, ranking, floors. `routing-policy` is a flat rule cascade over one candidate set; nothing composes strategies or inherits execution policy down a tree |
| normalizing heterogeneous provider responses to one schema | `llm-observability/.../multi-provider-event-normalization` (21) | normalization **for accounting**: one internal event model, `refuse-to-derive`, `two-doors-one-pipeline`. Correct there, and the opposite of correct for a proxy whose normalized payload is the product |
| circuit breaker for degraded upstreams | `backend-platform/resilience/stream-proxy-hop` (9), `retry-backoff` (6) | one hop to one origin; and a breaker whose output is admit-or-deny for one dependency. Neither reaches a breaker feeding a candidate list |
| retry budget and provider-dictated backoff | `retry-backoff` (34) | the classification taxonomy, the ladder, the budget, the breaker — all of it, and this subject must **compose over it, never restate it** |
| (streaming, via the corpus worker) | `llm-agent/runtime-and-io/streaming-output` | one producer to one UI surface, with a parser prescribed **stateless per frame** — the opposite of what N providers require |

`stream-proxy-hop` is the nearest neighbour and must be **cited as a boundary, never
absorbed**: it owns one long-lived hop to one origin (heartbeats, reconnect hygiene,
origin non-disclosure, status clamping toward a dumb client). This subject owns what
changes when the hop fronts **many** origins for **many** callers — which is where
composition, inheritance, failure attribution, caller-scoped lossiness and per-provider
framing all appear at once, and none of them exist at N=1.

## The subject, in one paragraph

**Multi-provider gateway plane** is the discipline of the request/response path in a
process that fronts several interchangeable-but-not-identical upstreams for callers it
does not control. Its unit is one caller request resolved against a *tree* of candidates,
and its four recurring problems are: expressing routing and execution policy in one
structure without making inheritance ambiguous; keeping the router's own failures
distinguishable from its candidates' at every layer that loops; deciding how much of each
upstream's native shape survives translation, and who gets to choose; and re-framing
byte streams whose only shared property is that bytes arrive over time.

## Boundaries it must NOT absorb

- `retry-backoff` owns the ladder, the classes, the budget and the breaker's state
  machine. This subject owns only what changes when the breaker's verdict becomes an
  input to *candidate selection* (A2 lands **there**, not here).
- `model-routing` owns which model and why, and `failover-horizon` owns the
  substitution window. This subject owns the mechanics under that decision.
- `stream-proxy-hop` owns the N=1 hop entirely.
- `multi-provider-event-normalization` owns normalization for accounting; this subject
  must cite it and state the discriminator (is the normalized payload a *record* or the
  *product*?) rather than duplicating its extractor rules.
- `credential-vault` owns the slug and the brokered egress. D2 lands there.
- `prompt-safety` owns what a content check decides; B2 owns only how the verdict is
  carried.

## Proposed techniques (slugs are proposals; the drafter may override with an argument)

1. `strategy-tree-with-inherited-policy` — from A1. Routing strategies as composable
   nodes; the inheritance table (which keys merge, which replace wholesale, which are
   converted once at the root); the node address that survives filtering.
2. `router-failure-is-not-candidate-failure` — from A4. In-band attribution across a
   retry boundary; why a status code cannot carry it; the loop's break condition.
3. `caller-scoped-normalization-strictness` — from C1. Two consumer populations, one
   wire format; the additive-native-payload pattern; what strict mode is allowed to
   silently collapse and what it must not.
4. `per-provider-stream-framing` — from C3. The delimiter as a `(provider, endpoint)`
   lookup; non-SSE framings; the per-stream state a chunk transform must own.
5. `declarative-request-map-imperative-response-transform` — from C2 (promoted from a
   qualifier to a technique **only** inside this subject, where it is load-bearing for
   the adapter interface; otherwise it is a line in `per-provider-usage-extractors`).
6. *(optional sixth)* `policy-verdict-in-the-status-space` — from B2, if the drafter
   agrees it belongs here rather than in `prompt-safety`.

## Open questions the drafter decides rather than discovers

- Does the inheritance table belong in the golden path or in technique 1? (One tree's
  26 keys are an instance; the transplantable rule is the merge-vs-replace *distinction*.)
- Is B2 this subject's or `prompt-safety`'s? Decide before drafting, and cite either way.
- The subject is at risk of restating `retry-backoff`. The drafter should write the
  boundary section **first** and check every technique against it.

## Instances a reader can open

- `Portkey-AI/gateway` @ `669825cbe89ee51569918b8f78a9db486fd69dd4` — every anchor in §3.
- Fleet: `pumper`'s pluggable engine interface is the same shape in a non-LLM domain and
  is the natural place to look for a second sighting (§10).

## Why proposed rather than written by the intake run

Five design decisions, four consecutive pipeline stages, one home, no corpus subject —
that is a subject by construction and the routing count says forge, not amendment. It is
proposed rather than executed because the director owns the direction pass, because the
placement consumes one of `resilience`'s two remaining slots, and because the boundary
against `stream-proxy-hop` and `retry-backoff` is delicate enough that a drafter should
write it deliberately rather than inherit it from a triage table.

---

## 8. Already covered / leads / untriaged

### Already covered — with the technique named (not declined, catches)

| Row | Covered by | The technique that covers it |
| --- | --- | --- |
| A5 — conditional routing over a query DSL | `llm-agent/orchestration/model-routing` | `routing-policy` — policy as data, one evaluation door (law: one-validation-door), documented precedence, exhaustion spelled as its own failure |
| B1 — errored ≠ failed, per-check fail direction | `llm-agent/orchestration/session-continuation` | `advisory-guard-fail-mode` — per-entry risk class; advisory fails open with a diagnostic, protective fails closed; "the guard ran and found nothing" vs "the guard could not run" spelled differently in every channel |
| B3 rule (3) — hook-triggered retries share the transport budget | `backend-platform/resilience/retry-backoff` | `storm-control` — "the inner layer's attempts are part of the outer layer's budget, not a hidden multiplier under it" |
| D2 slug + per-credential limits | `security/credential-vault` | `brokered-egress` — "a credential reference (an identity, never a value)"; per-credential rate limits at the door |
| D2 pre-request refusal | `llm-observability/.../usage-limit-governance` + `llm-agent/.../cost-metering` | `enforcement-placement-and-reconciliation` ("Inline (gateway or proxy, before the provider call)"); `budget-enforcement` ("**Never spends.**") |
| D3 one build, many runtimes | `engineering-process/build-and-release/packaging`; fleet `deployment-contract` | recorded, not advanced |
| B2's *obligation* (not its mechanism) | `software-engineering/_laws.md` | law `verdict-survives-boundary` |

### Leads, each with a return condition

| Lead | Anchor | Return when |
| --- | --- | --- |
| **The corpus disagrees with itself on guardrail fail direction.** `prompt-safety` says always-closed; `session-continuation/advisory-guard-fail-mode` says per-guard, default open; `optional-dependency-degradation/refusal-is-not-failure` says propagate unless a call site opted in. None cites the others. | §3 B1 evidence | A second external source takes a side. Then it is a convergence landing at doctrine grain — probably a boundary paragraph in each of the three — not three separate edits. This is the highest-value lead in the run and it costs no fetch. |
| **Routing on caller-asserted context is an unasked authorization question.** `routing-policy` has callers assert class and compliance tags; portkey has them assert routing metadata in a header, with a parse failure degrading silently to the default branch. | `handlerUtils.ts:724-731`; `routing-policy.md` | A source shows a *consequence* (a tag spoofed past a compliance rule). Until then it is a hypothesis, and `routing-policy`'s compliance ladder may already imply the answer. |
| **No jitter in a fleet correlator.** | `retryHandler.ts:169` vs `backoff-design.md` | Cite as a counterexample the next time `backoff-design` is edited. Do not open the file for this alone. |
| **A silent depth-2 limit in a rule evaluator** is `routing-policy`'s "rule that can never match" arriving through the evaluator rather than the rule. | `conditionalRouter.ts:148-153` | Same — a free field citation when someone is already in `routing-policy`. |
| **`--headless` as a third state** between "debug surface on" and "debug surface off" — the gateway refuses to boot with the UI and no token, but will boot without the UI. | `adminAuth/index.ts:9-19` | If D1 is drafted, this belongs in it. Otherwise it is a footnote. |

### Untriaged, with anchors (unverified, never declined)

- **36 endpoint kinds** in one `endpointStrings` union (`src/providers/types.ts:83-118`) —
  batches, finetunes, files, realtime, speech, transcription, model-responses. The
  *shape* of "one gateway, many API surfaces, each with its own cacheability and hook
  eligibility" may be a subject-level fact nobody has looked at. No prior-art check run.
- **`src/handlers/realtimeHandler.ts` vs `realtimeHandlerNode.ts`** — the one place
  runtime portability broke, and they forked the file. Unread beyond the filenames; a
  plausible field application for `deployment-contract`.
- **`plugins/` guardrail vendor roster** (18 third-party scanners over one manifest
  contract) — a connector-catalog-shaped artifact. Unchecked against
  `integration/connector-catalog`.
- **`src/apm/`, `src/middlewares/log/` OTLP span emission** (`otlpSpanObject` in
  `logsService.ts:63-80`) — the gateway emits OTLP directly. Unchecked against
  `llm-observability/telemetry-and-data/llm-call-telemetry-model`, and the natural
  question is whether the emitter's field set matches that subject's `token-usage-quadruple`
  and `server-owned-fields`. **This is the highest-value untriaged row for `tracklight`.**
- **`src/middlewares/requestValidator/` custom-host validation** (`isValidCustomHost`) —
  SSRF surface on an operator-supplied base URL. Unchecked.

---

## 9. Reusable engineering

Swept for excellence, not for claims (Phase 2b's second pass). Six items, ordered by how
soon someone here would use them.

- **The pipeline integration test with a mocked provider boundary.**
  `tests/integration/src/handlers/tryPost.test.ts` boots the real gateway and drives 26
  named cases through fluent builders (`RequestBuilder().model(…).stream(true).options`,
  `URLBuilder().chat()`), asserting on the *pipeline's* behaviour rather than any unit's:
  "should handle failing after request hooks with retry", "should include hook results in
  cached responses", "should not cache file upload endpoints". The strategy worth porting
  is **the seam choice** — mock at the outbound `fetch`, test everything inboard of it as
  one thing — plus the builder DSL that makes 26 cases readable. `pumper` and `tracklight`
  both have a pipeline with this shape and no test at this altitude.
- **A failure taxonomy already enumerated, for free.** `plugins/default/manifest.json`
  is 21 checks each declaring `supportedHooks`, and the before/after split *is* a
  taxonomy: admission checks (`modelwhitelist`, `jwt`, `requiredMetadataKeys`,
  `allowedRequestTypes`) can only run before; structural checks (`jsonSchema`, `jsonKeys`,
  `notNull`, `validUrls`, `containsCode`) can only run after. Anyone building a check
  registry gets the phase-eligibility dimension handed to them.
- **The config surface itself.** `src/middlewares/requestValidator/schema/config.ts` is a
  ~170-line zod schema that expresses a recursive strategy tree, four cross-field
  `.refine()` invariants with human-readable messages, and per-provider conditional
  requirements — and it is the *whole* contract, checkable in one screen. This is the
  best small example of "the checker is the contract" (Phase 2b step 2) any recent run
  has produced, and it is worth citing in the skill's own sweep guidance.
- **`sanitizeProviderOptions` as a six-line allowlist redactor.** `middlewares/log/index.ts:20-37`.
  Directly portable to any service that logs a config object containing credentials, and
  it is the mechanism §3 D1 says the corpus is missing.
- **Two doors into one config model.** `constructConfigFromRequestHeaders`
  (`handlerUtils.ts:836+`) normalizes a namespaced-header form and a JSON-config-header
  form into the same `Options | Targets` before anything downstream runs — an independent
  arrival of the corpus's own `two-doors-one-pipeline`, applied to request configuration
  rather than telemetry ingest. Worth citing into that technique as a second sighting in a
  different domain.
- **The binary stream reader.** `streamHandler.ts:38-130` — a dependency-free reader for
  length-prefixed framed streams (4-byte prelude, headers block, CRC) in ~90 lines of
  portable Web-API TypeScript. If anything in the fleet ever reads a non-SSE provider
  stream, this is the reference implementation, and it is short enough to read in full
  before writing one.

---

## 10. Peer check and fleet direction notes

### Per design entry with a home: which projects are `candidate` absences, and does scope admit the forces

Read from `librarian/fleet-map.md` (generated 2026-09-02) — each project's scope block and
its candidate list.

| Entry → home | `candidate` in | Does scope admit the forces? |
| --- | --- | --- |
| **A2, A3 → `backend-platform/resilience/retry-backoff`** | `tracklight`, `gravity` | **tracklight: yes.** Its scope is "ingest LLM telemetry, score with judges, benchmark providers, serve an operator API" — it calls providers in a benchmark matrix, so a stated retry-after colliding with a run budget is its problem exactly. **gravity: yes but weakly** — it has a "governed multi-vendor imaging chokepoint", which is the same force at lower volume. |
| **A4 → `stream-proxy-hop`** | `tracklight`, `gravity` | **tracklight: yes.** It serves an operator API over a store and its `Device Relay` group already carries `voice-io` and `delivery-guarantees`; a hop that must not attribute its own failures to an upstream is in scope. `gravity` ships nowhere, so the hop is hypothetical there — scope admits it, deployment does not. |
| **D1 → `security/browser-credential-boundary`** | `tracklight`, `gravity` | **tracklight: strongly yes.** It is self-hosted, holds provider credentials for benchmarking, and serves an operator dashboard — the exact three conditions D1's forces name. This is the single best-matched landing in the run. |
| **D2 (priced roster) → `security/credential-vault`** | `tracklight`, `gravity` | **tracklight: yes** — it benchmarks across providers and must price the results; a credential carrying its own price book is directly usable. `personas` is **not** a candidate here (it has `credential-vault` context already) but its scope — "observe runs - cost, health, traces - and tune routing from evidence" — admits the force. |
| **B3 → `model-routing/failover-horizon`** | neither `tracklight` nor `personas` (both excluded `llm-agent/orchestration` by list) | **No project admits it.** `tracklight`, `personas`, `pumper`, `kp`, `politicas` and `gravity` all exclude `llm-agent/orchestration` explicitly. A landing here is corpus-only with no consumer — worth knowing before spending on it. |
| **The XL subject → `backend-platform/resilience` (new)** | would be a fresh candidate for `tracklight`, `pumper`, `gravity`, `politicas` | See the peer verdict below. |

### PEER VERDICT: yes — a peer exists, and there are two of them

**`tracklight` is a peer of this source.** Same class of system: a **self-hosted,
multi-provider LLM infrastructure service with an operator surface, that holds provider
credentials and sits in or beside the request path.** It is not the same product — the
gateway *emits* what the observability service *ingests* — but the two are the two halves
of one seam, and every hard problem in portkey's tree has a mirror in tracklight's.

**`pumper` is a structural peer.** "Pluggable scrape and fetch engines" behind one HTTP
API with a cost ledger is the same architecture as "78 provider adapters behind one
interface with a price book", in a different domain. Where tracklight tests whether the
*forces* transfer, pumper tests whether they transfer **outside LLM-land** — which is the
better test of whether a technique deserves the upper layers at all.

**`personas` is a routing peer only** — it has a model-routing cascade and "tune routing
from evidence", but it is a local-first desktop app with one operator per install, so the
multi-caller half of every force here is absent by design.

### Comparison points — INPUT for the director's direction pass, not proposals

Closed verdicts, per the hermes/personas precedent: **adopt / adapt / keep ours /
different forces.**

| # | Point | Portkey | Peer | Verdict |
| --- | --- | --- | --- | --- |
| 1 | **Provider adapter interface** | 78 dirs, request-side declarative param map + response-side function, typed escape hatch for misfits | `tracklight` has per-provider extractors (its own `per-provider-usage-extractors` context); `pumper` has pluggable engines | **adapt** — the request-side-as-data / response-side-as-code split is the transferable half; the 36-endpoint union is not |
| 2 | **Normalization strictness as a caller switch** | `strict_open_ai_compliance`, 165 sites, additive native payload | `tracklight` normalizes for **accounting** and must not be lossy-optional | **different forces** — and this is the discriminator the corpus is missing. Do not push C1 into tracklight; state the boundary instead |
| 3 | **Stream framing per (provider, endpoint)** | lookup table + a binary reader for the non-SSE provider | `tracklight` ingests settled events, not live chunks; `pumper` streams fetch responses | **adopt for pumper, not for tracklight** — pumper is the fleet's only live multi-engine stream reader |
| 4 | **Retry-after with a total budget** | 60s budget, stated wait honoured inside it, ladder abandoned outside it | `tracklight`'s benchmark runs have `budget-preflight-and-ceiling` — a run budget, not a request budget | **adapt** — the collision rule is the same shape one level up (a stated wait vs a *run* ceiling) |
| 5 | **Breaker as candidate filter, all-open ≠ empty** | prune unless everything is open | `tracklight` benchmarks a provider matrix and must decide what to do when every target is failing | **adopt** — same decision, and tracklight will hit it during an incident-day benchmark |
| 6 | **Router-vs-routed failure attribution** | reserved response header read by the enclosing loop | `pumper`'s engine fallback has exactly this problem: a pumper bug reproduces on every engine | **adopt for pumper** — cheapest transfer in the list |
| 7 | **Guardrail fail direction** | per-check, default open | corpus itself disagrees three ways (§8); `kp` has human approval gates where fail-closed is the only defensible answer | **keep ours** — and resolve the corpus's internal disagreement first |
| 8 | **Debug-stream allowlist redaction + boot-required admin token** | six-key allowlist, all headers redacted, refuses to boot | `tracklight` serves an operator dashboard and holds provider keys; `kp` is self-hostable with an org per install | **adopt** — the clearest, cheapest, highest-confidence transfer in the run |
| 9 | **Credential slug carrying rate limits + priced model roster** | `conf.json` integrations | `tracklight` prices benchmark runs per model; `politicas` does "LLM-assisted extraction with cost tracking" | **adapt** — the priced-roster-per-credential clause; the slug indirection they should already have from `credential-vault` |
| 10 | **Config as a recursive tree with policy inheritance** | 26 inherited keys, merge-vs-replace per key | `pumper` has engine config; `tracklight` has target-matrix runs — both flat | **adapt, carefully** — the inheritance table is the value and also the trap; a flat config that does not need a tree should stay flat |
| 11 | **Two doors into one config model** | headers or a config JSON, normalized before the pipeline | `tracklight` literally owns `two-doors-one-pipeline` as a context | **keep ours / cite theirs** — tracklight is ahead here; the transfer runs the other way |
| 12 | **Retries default OFF** | `attempts ?? 0` | `pumper` has a durable job queue where retries default *on* by design | **different forces** — a durable queue and a synchronous gateway should not share a default, and saying so is the finding |

### One caution for the direction pass

`tracklight` and `personas` both exclude `llm-agent/orchestration` by list, and `gravity`
excludes it too. Three of the four homes this run wants to land in
(`backend-platform/resilience`, `security`) are open to them; the fourth
(`model-routing/failover-horizon`, for B3) is closed to the entire fleet. B3 should be
sequenced last or dropped on that basis alone.

