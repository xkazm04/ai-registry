---
layer: application
type: application
subject: usage-limit-governance
technique: enforcement-placement-and-reconciliation
stack: process
status: forged
refresh_by: 2026-11-20
---

# The 2026 enforcement landscape: gateways, providers, and the reconcile loop

A dated survey (August 2026) of where the field actually enforces LLM
usage limits, mapped to the technique's three seats. Refresh by the
frontmatter date — provider limit features moved twice in the last year
alone.

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
— "prompts may be sent to the backend even when the limit is exceeded",
i.e. one call late by documented design — and with `estimate-prompt-tokens`
it refuses before spending at the cost of estimating. That is the
technique's two modes, shipping as a checkbox.

Algorithm choice is also visible in the field: Azure's v2 API Management
tiers moved token limiting from a sliding-window counter to a token
bucket — cheaper state, burst-tolerant — while long-window quotas stay
windowed sums. The field treats short-window *pacing* (tokens-per-minute)
and long-window *budget* as different mechanisms in one policy, which
matches this subject's boundary with rate limiting.

## The provider seat hardened in 2025-2026

- **OpenAI** rolled out hard spend limits to all API accounts in July
  2026: a monthly cap at organization or project level; at the cap,
  requests return 429 `insufficient_quota` until the next billing cycle.
  Notably, the older "budget threshold" had been *softened* to
  alert-only in early 2026 before the hard limit shipped — a reminder
  that provider-side semantics change under you (observe-only and
  hard-stop are different tiers, and a provider can silently reclassify).
- **Anthropic** offers per-workspace monthly spend caps (bounded above by
  the organization limit) plus threshold notifications — a two-tier
  observe/enforce model per workspace.
- **Azure OpenAI** has *no* hard service-level spend cap: TPM/RPM quota
  paces the rate but does not bound the month, and subscription budgets
  only alert. Teams that need a hard ceiling on Azure must build the
  inline seat themselves — which is much of why the APIM token policies
  exist.

The layering advice follows directly: where the provider cap exists it is
the backstop, and its calendar-month reset (with the midnight-burst edge
this subject's rolling windows avoid) is one more reason the platform's
own caps do not simply mirror it.

## What the field does *not* do

Two of this subject's positions are ahead of observed practice, not
behind it. No surveyed gateway imputes a cost for models missing from its
price table — the common default is to track unknown models at zero,
which is exactly the spends-for-free failure cost-evidence-and-imputation
names. And graduated pre-threshold shedding is absent from the gateway
policy engines, which ship cliff-edge limits; the graduated tier's field
precedent lives in general overload control (probabilistic early drop,
adaptive client throttling), not yet in LLM budget products.

Sources: Azure API Management `llm-token-limit` policy reference
(learn.microsoft.com); OpenAI spend-limits guide
(developers.openai.com) and the July 2026 hard-limit rollout notes;
Anthropic workspace spend-limit docs; Microsoft Q&A on Azure OpenAI
budget caps; LiteLLM / Portkey / Kong gateway documentation and 2026
gateway comparisons (TrueFoundry, Flotorch, Spheron).
