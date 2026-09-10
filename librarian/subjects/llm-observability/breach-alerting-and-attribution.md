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
