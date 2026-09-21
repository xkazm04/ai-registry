---
domain: llm-observability
subject: breach-alerting-and-attribution
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# breach-alerting-and-attribution

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/breach-alerting-and-attribution",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2babf8adee39e4fd",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A workload label contains a customer email although its dimension is classified infrastructure.",
    "Current rolling spend is 90 of 100, 80 expires tomorrow and predicted new spend is 15: ignoring expiry forecasts a breach while the actual next window is 25.",
    "A burst creates thousands of detached attribution tasks and exhausts the same database pool used for admission."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/economics-and-governance/breach-alerting-and-attribution",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://sre.google/workbook/alerting-on-slos/",
      "scope": "Primary error-budget alerting rationale checked; money-budget thresholds are an adaptation, not a directly validated transfer."
    },
    {
      "url": "https://prometheus.io/docs/alerting/latest/alertmanager/",
      "scope": "Primary grouping, inhibition and deduplication reference accessed."
    },
    {
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html",
      "scope": "Primary SSRF guidance accessed for destination-validation scope; no network probe run."
    }
  ],
  "documents": {
    "breach-alerting-and-attribution.md": {
      "disposition": "reverify",
      "reason": "Rejected attempts can be stored with separate accounting semantics; refusing telemetry after spend cannot prevent upstream spend. Local logs can cross process/audience boundaries. Off-path work still consumes shared resources, labels can contain identities, and omitted attribution cannot distinguish unknown from none. Forecast and dedup defaults require workload validation."
    },
    "techniques/identity-scope-attribution-refusal.md": {
      "disposition": "clarify",
      "reason": "Repaired infrastructure labels and scope notes as potential identity leaks, recipient/channel policy and authenticated link handling. Known recipient addresses do not make forwarded email an access-controlled dashboard."
    },
    "techniques/notification-channel-security.md": {
      "disposition": "reverify",
      "reason": "DNS checks need connection-time binding and redirect controls; single tenancy does not eliminate SSRF from compromised configuration. Logs can leave the process. Signatures need signed delivery identity and within-window dedup; native token auth and message authenticity have different scope. Secret URL may itself be an intentional bearer credential and must be protected."
    },
    "techniques/off-request-path-delivery.md": {
      "disposition": "clarify",
      "reason": "Repaired unbounded task spawning, shared-resource contention, synchronous log guarantees and best-effort versus durable handoff. Enrichment failures remain explicit and per-sink outcomes observable."
    },
    "techniques/pre-breach-forecasting.md": {
      "disposition": "clarify",
      "reason": "Repaired rolling-window rolloff, current daily bucket, model assumptions, missing coverage, parameters and uncertainty. Omitting rolloff is an upper scenario under assumptions, not a credible breach ETA."
    },
    "techniques/scope-inverted-attribution.md": {
      "disposition": "reverify",
      "reason": "Free-axis grouping is useful but not always available or sufficient; compound scopes can still have free dimensions. Use matched metric/window/coverage and distinguish errors from genuinely empty scope. Empty data does not prove unpriced or out-of-scope traffic caused the breach."
    },
    "techniques/scoped-dedup-keys.md": {
      "disposition": "reverify",
      "reason": "Rule id/version, threshold/tier and destination state can distinguish conditions beyond listed axes. Concurrent dedup requires atomic claim; in-process cooldown should use monotonic elapsed time. Scope encoding needs collision safety. Clear/rebreach and escalation need policy; dedup outages should retain bounded delivery rather than generate unbounded storms."
    },
    "techniques/top-contributor-attribution.md": {
      "disposition": "reverify",
      "reason": "Three contributors is a policy, not universal optimum. Rollup queries can scan and disagree across snapshots or windows; off-path is not zero resource cost. Match attribution metric to the breached metric, preserve unknown cost, missing coverage and failed fetches. Fetch/filter authorization is important test coverage, not almost untestable boilerplate."
    },
    "applications/process--scoped-dedup-keys.md": {
      "disposition": "reverify",
      "reason": "Dated survey retained. Primary SRE and Alertmanager sources support multi-window burn-rate, grouping and inhibition concepts, not universal 2026 timing or novelty claims. Error-budget fractions do not transfer unchanged to rolling cash budgets. Vendor capability and channel-security survey claims remain partially unverified."
    },
    "applications/rust--pre-breach-forecasting.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. EWMA alpha and fit horizon are parameters despite knob-free claim. Rolling-month rolloff-free ETA can forecast a breach that never occurs; constant revenue and nonnegative spend need scope. Function reuse is not proof of all callers, valid inputs or stable alert keys."
    },
    "applications/rust--top-contributor-attribution.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. unwrap_or_default erases query failure, two rollups need shared scope/time, current tags may leak customer data, and cost proxies do not explain every count/token breach. Rejected telemetry is not necessarily prevented spend; in-memory dedup and disabled hosted attribution remain coverage limits."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

I retract the `documents` map of the earlier 2026-09-10 record. It was written
against the compressed rewrite that has since been reverted; its "Repaired ..."
reasons describe text no longer on disk, and its overall `reverify` came from
restating each technique's own limits section as a finding. This entry is a fresh
reading of the current bytes.

All eleven documents read in full. The subject is well built and the dominant
disposition is `keep`. Its organizing move — routing on the audience question rather
than on the vocabulary of budgets and caps, and naming which two obligations survive
when the audience precondition lapses — is unusual and correct. The three obligations
(don't storm, don't tax the path you measure, answer the next question) each have a
technique, and the scope-inversion rule with its within-scope denominator is the kind
of arithmetic detail that quietly corrupts every share figure when missed.

Two findings.

**A primary source contradicts a numeric claim in the dated survey.**
`process--scoped-dedup-keys` attributes to the Google SRE Workbook "the canonical
tiers: 14.4x burn over 1h (paged, ~2% of a 30-day budget), 6x over 6h (paged), 3x over
24h/72h (ticketed)". I read the workbook's *Alerting on SLOs* chapter. Its
recommended parameters table for a 99.9% SLO is 14.4 / 1h / 5m / 2% (page), 6 / 6h /
30m / 5% (page), and **1 / 3 days / 6h / 10% (ticket)** — burn rate one, not three.
The first two rows are transcribed correctly; the third is not the workbook's. The
"1/12 of the long window" short-window guideline the same paragraph cites is
confirmed verbatim. A 3x/24h ticket tier does circulate in vendor documentation, so
this is most likely a conflation rather than an invention, but the sentence
attributes it to the SRE Workbook and the SRE Workbook does not say it.

**`notification-channel-security` stops one step short on the SSRF control.** It
requires resolving the destination and refusing private, loopback and link-local
addresses "at configuration time *and* re-checked at delivery time (DNS answers
change between the two)", and re-applying on every redirect hop. That is the right
shape, and it explicitly names the window it is closing. What it does not require is
that the address checked at delivery be the address actually connected to — resolve,
then connect, leaves a rebinding window between the two lookups that a hostile sink
controls. The fix in the field is connection-time binding (pin the vetted IP, or
validate inside the socket callback), and the technique is otherwise thorough enough
that its absence reads as an omission rather than a scope decision.

Everything else held on reading. `pre-breach-forecasting`'s window table is right
about direction — ignoring roll-off on a rolling monthly window overstates cumulative
spend and therefore errs early, which is the correct direction for a warning — and it
refuses to forecast an hourly budget from a daily series rather than fabricating
precision. `scoped-dedup-keys`'s separation of accidental suppression (a bug nobody
chose, fixed by keeping scope in the key) from deliberate suppression (an operator's
inhibition rule, which belongs in visible configuration) resolves what looks like a
conflict with the three-layer field stack, and does it in two sentences.
`top-contributor-attribution` is honest about the limit of cost-based attribution on
a calls- or tokens-metric breach, and about unpriced traffic being absent from the
list rather than ranked at zero.

Unresolved: I read the SRE Workbook chapter and nothing else external. The
Alertmanager, PagerDuty, webhooks.fyi, AWS Budgets and GCP budget-alert claims in the
survey were not re-checked; the survey is dated 2026-08-20 with `refresh_by`
2026-11-20 and stays inside that window. Neither LightTrack application was cloned or
rerun, and no verified_on field was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/breach-alerting-and-attribution",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:19d2ce4bc86521b8",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at current bytes, with the survey's burn-rate tiers checked against the primary SRE source. Retracts the earlier 2026-09-10 record's document map, which described reverted content. Not evaluated: the LightTrack tree was not cloned or built; the Alertmanager, PagerDuty, webhook-security, AWS Budgets and GCP claims in the dated survey were not re-checked; no network probe was run against any SSRF control; no verified_on or refresh_by field was refreshed.",
  "counterexamples": [
    "An operator reads the survey's third burn-rate tier as the SRE Workbook's recommendation and configures 3x over 24 hours as a ticket threshold. The workbook's third tier is burn rate 1 over 3 days at 10% of the budget - a materially slower burn caught over a longer window.",
    "A vetted webhook host re-resolves to 169.254.169.254 between the delivery-time DNS check and the TCP connect. Every rule in the technique passed and the platform still fetched its own metadata endpoint.",
    "A cap scoped to a conjunction of model AND workload breaches. Scope inversion presumes exactly one pinned axis, so the technique correctly says attribute nothing - and the operator gets a bare fact, which is the failure mode the subject opens by naming.",
    "A workload label carries a customer name. The payload boundary is drawn at infrastructure axes, and 'workload' was classified infrastructure when the axis was created, not when this label was minted.",
    "Dedup state is in-memory and the deployment is scaled to eight instances. One sustained breach yields up to eight alerts per cooldown - documented as an accepted trade, and still the storm the technique exists to prevent, at one eighth scale."
  ],
  "sources": [
    {
      "url": "https://sre.google/workbook/alerting-on-slos/",
      "result": "Establishes the recommended multiwindow multi-burn-rate parameters for a 99.9% SLO as 14.4/1h/5m/2% (page), 6/6h/30m/5% (page), 1/3d/6h/10% (ticket), and confirms the short window guideline of 1/12 the long window. It does not contain a 3x tier, which is what the subject's survey attributes to it. It says nothing about transferring burn rates to a cash budget, which the survey correctly flags as an adaptation."
    },
    {
      "path": "knowledge/llm-observability/economics-and-governance/breach-alerting-and-attribution",
      "result": "Every owned document read at current bytes; the audience-precondition rule and the identity/infrastructure boundary traced across golden path, techniques and applications for consistency. Establishes what the documents claim, not whether the LightTrack code still reads as described."
    }
  ],
  "documents": {
    "breach-alerting-and-attribution.md": {
      "disposition": "keep",
      "reason": "The audience precondition and the two obligations that survive it (a level is still not an edge; a bare fact is still homework) are the right cut, and the phantom-evidence failure mode - rejected events deliberately never stored, so there is nothing behind the most important alert to query - is the structural difference from builder-side alerting stated once and properly."
    },
    "techniques/identity-scope-attribution-refusal.md": {
      "disposition": "keep",
      "reason": "The mechanical reinforcement is the part that makes this hold: rollups that cannot be filtered to a key mean the leak is not one code review away. The refuse-loudly-with-a-forwarding-address rule and the requirement that the pointed-at surface exist before the refusal ships are both necessary and both easy to omit."
    },
    "techniques/notification-channel-security.md": {
      "disposition": "clarify",
      "reason": "Requires destination vetting at configuration and again at delivery, naming DNS drift as the reason, but never requires the connection to use the address that was vetted. Resolve-then-connect leaves a rebinding window the sink controls. Add connection-time binding of the checked address; the signing, rotation-overlap and bounded-trust sections need nothing."
    },
    "techniques/off-request-path-delivery.md": {
      "disposition": "keep",
      "reason": "The partition is stated as a boundary rather than a preference - on-path work ends at the boolean - and 'best-effort is a semantic, not a shrug' enumerates the three clauses plus the one thing it may never mean. The carve-out for enforcement side effects (if losing it changes a future admission decision it is accounting, not alerting) is exactly the right test."
    },
    "techniques/pre-breach-forecasting.md": {
      "disposition": "keep",
      "reason": "Refuses to forecast an hourly budget from a daily series, states the roll-off omission's direction and why that direction is correct for a warning, keeps the margin path's asymmetric zero, and pairs the fitted projection with the model-free burn rate rather than claiming either dominates. The methodology-free dedup key is a genuinely non-obvious rule."
    },
    "techniques/scope-inverted-attribution.md": {
      "disposition": "keep",
      "reason": "The free-axis rule with a lever test for extending the table, the within-scope denominator, the scope note that keeps two same-labelled contributors distinguishable, and the empty-scope-speaks clause that turns absence into a redirect toward pricing coverage. Subordinated correctly to the identity refusal."
    },
    "techniques/scoped-dedup-keys.md": {
      "disposition": "keep",
      "reason": "The key as a claim about sameness, with what stays out stated as deliberately as what goes in, and the dedup/grouping/inhibition separation resolving the apparent conflict about scope in the key. The server-clock rule closes a real replay attack on the cooldown."
    },
    "techniques/top-contributor-attribution.md": {
      "disposition": "keep",
      "reason": "Share and absolute figure together with the reason each alone misleads, shares against the window total rather than the top-k total, and a clean concession that cost-based attribution is an approximation for a calls- or tokens-metric breach with unpriced traffic absent rather than ranked at zero. The pure-composition split is a testability argument, not a style preference."
    },
    "applications/process--scoped-dedup-keys.md": {
      "disposition": "clarify",
      "reason": "Attributes to the Google SRE Workbook a third canonical tier of '3x over 24h/72h (ticketed)'. The workbook's recommended table gives burn rate 1 over 3 days at 10% of the budget; the 14.4/1h/2% and 6/6h rows and the 1/12 short-window guideline are transcribed correctly. Fix the tier or move it to the vendor practice it actually describes. The survey's own contributions - which axes must never be grouped away, and where this subject is ahead of observed practice - stand."
    },
    "applications/rust--pre-breach-forecasting.md": {
      "disposition": "keep",
      "reason": "The window table appears as a single match with each arm's rationale quoted, the asymmetric zero is present in both directions, and the dedup key's doc comment states the discipline outright. It names alpha 0.5 as a default rather than hiding it behind the knob-free claim. Not rerun."
    },
    "applications/rust--top-contributor-attribution.md": {
      "disposition": "keep",
      "reason": "One compose function realizing three sibling techniques - inversion, within-scope denominator, identity refusal with a forwarding address - with the fixture test pinning the share math. The two deviations it records (attribution disabled on hosted backends, in-memory dedup) are the coverage gaps stated as gaps. Not rerun."
    }
  }
}
```
