---
layer: application
type: application
subject: usage-limit-governance
technique: enforcement-placement-and-reconciliation
stack: process
status: forged
refresh_by: 2026-12-05
verified_on: 2026-09-05
---

# The 2026 enforcement landscape: gateways, providers, and the reconcile loop

A dated survey (August 2026, re-read against the primary documentation on
2026-09-05) of where the field actually enforces LLM usage limits, mapped
to the technique's seats. Refresh by the frontmatter date — provider limit
features moved twice in the last year alone.

## The inline seat has a product category name: the LLM/AI gateway

The gateway layer the golden path names as "the upgrade path" is a
crowded product category. LiteLLM (open-source proxy) attaches budgets
and rate limits to virtual keys, teams, and customers, with per-model
limits — the closest field analogue to this subject's dimension-scoped
caps, enforced inline. Portkey and Kong AI Gateway ship the same shape as
policy plugins: per-consumer, per-model, per-route token and cost limits.
Azure API Management's `llm-token-limit` policy is the most instructive,
because its documentation states the reconcile loop explicitly: without
prompt estimation it enforces on actuals from the response's usage block
— "Prompts may be sent to the backend even when the limit is exceeded;
this is detected from the response, after which subsequent requests are
blocked until the limit resets" — i.e. one call late by documented design
— and with `estimate-prompt-tokens="true"` it refuses before spending at
the cost of estimating. That is the technique's two modes, shipping as a
checkbox. The same reference page (ms.date 2026-04-01, read 2026-09-05)
documents four more of this subject's positions as product properties:
the concurrency race ("concurrent or near-concurrent requests can
temporarily exceed the configured token limit" because consumption is
only known once responses return — the race concurrent-admission-integrity
closes, left open here by design); the coherence boundary ("tracks token
usage independently at each gateway where it is applied... doesn't
aggregate token counts across the entire instance"); streaming as
estimate-only ("prompt tokens are always estimated regardless of the
`estimate-prompt-tokens` setting. Completion tokens are also estimated
when responses are streamed", with each image over-counted at 1200
tokens); and the two refusal vocabularies — a `tokens-per-minute` breach
answers `429 Too Many Requests`, an exhausted `token-quota` answers
`403 Forbidden`.

Algorithm choice is also visible in the field: Azure's v2 API Management
tiers moved per-minute token limiting from a sliding-window counter to a
token bucket — cheaper state, burst-tolerant — while the `token-quota` is
a *fixed* window ("the start time of a quota period is calculated as the
UTC timestamp truncated to the unit"), Hourly through Yearly, the
calendar-aligned edge this subject's rolling windows avoid. The field
treats short-window *pacing* and long-window *budget* as different
mechanisms in one policy, which matches this subject's boundary with rate
limiting.

## The provider seat hardened in 2025-2026

- **OpenAI** rolled out hard spend limits to all API accounts in the week
  of 22 July 2026 (developer-community announcement, corroborated by two
  independent write-ups): a monthly cap at organization or project level
  — "an organization hard limit applies to API traffic across all
  projects; a project hard limit applies only to API traffic billed to
  that project". At the cap, requests return HTTP 429 with the code
  `organization_spend_limit_exceeded` or `project_spend_limit_exceeded`
  (the broader error *type* stays `insufficient_quota`, so a client
  keying on type alone cannot tell a spend cap from exhausted prepaid
  credit), and "the limit resets with the next monthly cycle". Spend
  alerts remain a separate observe-only tier — "alerts do not enforce a
  cap". Two sentences from the guide belong in this subject verbatim:
  "Enforcement is not instantaneous, so recorded spend can slightly
  exceed the configured amount" — the provider's own backstop overshoots
  — and the recommendation to set alert thresholds "that allow time to
  adjust usage, raise the limit, or investigate", which is the
  soft-warning tier stated by a provider.
- **Anthropic** offers per-workspace monthly spend caps plus threshold
  notifications — a two-tier observe/enforce model per workspace — and
  documents the nesting rule this subject's flat ledgers do not model:
  "You can set workspace limits lower than (but not higher than) your
  organization's limits", "If not set, workspace limits match the
  organization's limits", and "Organization-wide limits always apply, even
  if workspace limits add up to more". The Default Workspace cannot carry
  limits at all, and per-*user* monthly spend limits exist only in the
  auto-created Claude Code workspace. A programmatic Spend Limits API is
  documented as Enterprise-only.
- **Azure OpenAI** has *no* hard service-level spend cap: TPM/RPM quota
  paces the rate but does not bound the month, and subscription budgets
  only alert. Teams that need a hard ceiling on Azure must build the
  inline seat themselves — which is much of why the APIM token policies
  exist.
- **AWS Bedrock** is the clearest case of the technique's "absent
  altogether in money terms": its service quotas are denominated in
  requests and tokens per minute, and there is no dollar ceiling on the
  service; the account-level budgets tool alerts (and can trigger
  actions) on billing data that lags usage by hours.
- **Google Cloud** moved the other way: alerts-only budgets, which
  "don't automatically prevent the use or billing of your services",
  gained a *spend cap* budget type that pauses a named service in a
  project when the cap is reached, lifted manually — a provider-side hard
  stop scoped to (project, service), not to the organization.

The layering advice follows directly: where the provider cap exists it is
the backstop, and its calendar-month reset (with the midnight-burst edge
this subject's rolling windows avoid) is one more reason the platform's
own caps do not simply mirror it — and the platform's status surface
should say which clock it is quoting.

## What the field does *not* do

Two of this subject's positions are ahead of observed practice, not
behind it. No surveyed gateway imputes a cost for models missing from its
price table — the common default is to track unknown models at zero,
which is exactly the spends-for-free failure cost-evidence-and-imputation
names. And graduated pre-threshold shedding is absent from the gateway
policy engines, which ship cliff-edge limits; the graduated tier's field
precedent lives in general overload control — the SRE handbook's adaptive
client throttling (reject locally with a probability derived from the
request/accept ratio, and reject lower criticality first), and Tencent's
DAGOR overload controller for WeChat (SoCC 2018), which hashes user ids
into 128 user-priority levels per business priority and rotates the hash
hourly for fairness — not yet in LLM budget products. The client-side
seat, however, now has a fleet instance: see the
`rust--enforcement-placement-and-reconciliation` application.

Sources (read 2026-09-05 unless noted): Azure API Management
`llm-token-limit` policy reference, learn.microsoft.com, ms.date
2026-04-01; OpenAI "Spend limits" guide, developers.openai.com, plus the
OpenAI Developer Community thread "Hard spend limits rolling out to all
API Platform accounts" and the @OpenAIDevs announcement; Anthropic
"Workspaces" and "Spend Limits API" pages, platform.claude.com; Google
Cloud Billing "Manage spend cap budgets" and "Create, edit, or delete
budgets and budget alerts"; AWS "Quotas for Amazon Bedrock"; Microsoft
Q&A on Azure OpenAI budget caps (August 2026 read); Zhou et al., "Overload
Control for Scaling WeChat Microservices", SoCC 2018 (arXiv:1806.04075);
Google SRE book ch. 21 "Handling Overload"; LiteLLM / Portkey / Kong
gateway documentation and 2026 gateway comparisons (TrueFoundry, Flotorch,
Spheron; August 2026 read).
