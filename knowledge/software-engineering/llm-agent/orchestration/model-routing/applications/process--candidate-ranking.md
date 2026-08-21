---
layer: application
type: application
subject: model-routing
technique: candidate-ranking
stack: process
status: forged
refresh_by: 2026-11-20
verified_on: 2026-08-20
---

# Free-tier gateway routing, 2026 (field study)

A dated application of candidate-ranking — and of its neighbours model-identity
and failover-horizon — to the one place where multi-provider routing is under
maximum pressure: the **free-tier aggregation gateway**, where dozens of
providers are stacked behind one interface, every one of them metered, several
of them broken at any moment, and none of them under contract. The class
optimizes for exactly the variables the technique names, which makes its choices
unusually legible.

Primary specimen: **FreeLLMAPI** (`github.com/tashfeenahmed/freellmapi`, MIT,
~19k stars, 588 commits, ~220 test files, ~10 contributors in the last 50
commits). Read at commit `20d41b3`, **2026-08-20**. Secondary reference points:
LiteLLM's router, OpenRouter's provider-vs-model routing split, Portkey. The
provider landscape below is the fastest-moving fact here — re-verify by the
frontmatter date.

## The scoring redesign, and what it replaced

FreeLLMAPI's `server/src/services/scoring.ts` documents its own predecessor as
the anti-pattern the technique names: "a pile of hand-tuned, dimensionally-
incompatible bonuses (a probability + a raw latency term + an intelligence term,
each hand-capped to keep orderings sane)". The replacement is the technique's
shape, term for term:

```
base      = w_rel·reliability + w_speed·speed + w_intel·intelligence   (Σw = 1)
effective = base × headroomFactor × rateLimitFactor
```

with the comment that the two guardrails "never reorder good models against each
other, they only pull a model down as it gets dangerous". Reliability is a Beta
posterior under Thompson sampling with a `Beta(1,1)` prior — "an unseen model is
genuinely uncertain, not assumed good or bad" — so nothing is frozen out by two
early failures. Strategies (`balanced`, `smartest`, `fastest`, `reliable`,
`priority`, `custom`) are weight vectors over one engine: `{reliability: 0.5,
speed: 0.25, intelligence: 0.25}` for balanced, `0.7/0.15/0.15` for reliable.
Community-sourced priors are folded in as starting counts that local samples
dilute automatically.

The measured origin of the "cap" tell is worth keeping: the old design needed a
hand-cap so a candidate would "still beat a 0%-success model" — a constant whose
only job was to defeat an ordering produced by incommensurable terms.

## Quota is metered on a pool you do not route on

The sharpest correction this specimen offers is not in the ranker but in the
guardrail's input. `services/provider-quota.ts` derives a **quota pool key** per
platform, and the pools do not line up with the routing unit:

| Pool shape | Meaning |
|---|---|
| `google::project` | one allowance across every model and key in a cloud project |
| `openrouter::free` vs `openrouter::account` | free-suffixed models metered separately from the account's own budget |
| `nvidia::credit-pool`, `cerebras::shared`, `sambanova::shared` | one pool across models |
| `groq::account`, `bai::promo` | account-scoped, promo-scoped |

Headroom computed per `(platform, model, key)` against a provider that meters per
project is arithmetic about a limit nobody enforces. Quota observations also
carry a **source and a confidence** — `header`/`quota_api` at 1.0, `error_body`
0.75, `probe` 0.6, `local_usage` 0.45, `documentation` 0.35 — with a priority
order that decides which observation overwrites which. Documentation is the
weakest evidence in the system, which is the correct ranking and the opposite of
where most implementations start. (This is the field evidence behind the pool-axis
note now in
[`rate-limiting/key-design`](../../../../backend-platform/resilience/rate-limiting/techniques/key-design.md).)

## Degraded mode: exploration suspended, with asymmetric grace

`services/degradation.ts` implements the technique's health state as a two-state
machine over the healthy-provider ratio, with the defaults visible as
environment-overridable constants: threshold **0.5**, minimum population **3
providers**, entry grace **60s**, exit grace **120s** — exit deliberately longer
than entry, with the stated reason that "exiting prematurely re-enters quickly".
While degraded, "the router skips exploration and sticks to the scored order of
remaining healthy providers". An unprobed key counts as healthy, matching the
router's own optimistic default rather than inventing a second one.

## Identity and drift, in the field

`services/model-groups.ts` computes logical groups at runtime from curated
display names — explicitly "NO schema change" — with operator `merges` and
`splits` persisted as data, and strict in-group failover between the providers
serving one model. That is model-identity's override channel, arrived at
independently of LiteLLM's `model_group` and OpenRouter's provider-routing split.

`lib/served-model.ts` is the field evidence for the golden path's served-vs-
selected correction, and it is unusually candid about the trade: the gateway
overwrites the upstream `model` field because provider metadata is unreliable
(one provider returns the literal string `default` for concrete models) — and
that overwrite "destroys the only evidence when a provider silently serves a
DIFFERENT model than requested", which the maintainers report verifying live on
an auto-routing endpoint. The fix captures the raw value before the overwrite,
compares under the same normalization grouping uses (case, trailing `:free`-style
tier tags, org namespace, separator runs), warns once per
`(platform, requested, served)` tuple with a bounded cache, and persists the drift
— leaving the response contract untouched.

## The unusable-success class, enumerated by incident

`lib/error-classify.ts` is the largest concentration of failover-horizon
evidence available in public code, and nearly every branch cites the issue that
produced it. Its retryable set includes the content failures a transport
taxonomy cannot see — `empty completion`, `ignored response_format`,
`truncated json`, `invalid tool arguments`, `unparseable inline tool-call
dialect`, `stream stalled`, `no first byte` — each annotated with the same
justification: "thrown before any byte reached the client, so the next candidate
can serve it invisibly". The horizon, named in the code as the reason.

Three incidents from the same file are worth carrying:

- **#337/#339** — a substring allowlist that ignored the structured status
  stranded healthy routes behind an unenumerated upstream code. Structured
  evidence first, message matching as the quarantined fallback.
- **#592** — conflating "retryable" with "rate-limited" let a slow local endpoint
  timing out twice escalate a cooldown ladder to 24 hours. The two predicates
  were split because *different subsystems consume them*.
- The **sibling-key rule** — schema-invalid tool arguments and cap-truncated
  structure "mark the model skipped for this request, since a sibling key would
  misbehave identically". Deterministic failures eliminate the model, not the
  credential.

`lib/fallback-loop.ts` adds the wall-clock bound the technique asks for, with the
number: a measured worst case of **38.8s time-to-first-byte over 11 attempts**
against a 20-hop cap, checked before starting each hop so a slow attempt is never
killed mid-flight.

## Two things this specimen gets wrong, kept as counter-evidence

- **A success purges the failure window.** `clearModelFailure` deletes a model's
  accumulated failure timestamps on any served request, with the rationale that
  "a served request is the strongest counter-evidence". Under a struggling
  endpoint there is always an occasional lucky call, and this is exactly the
  reset that
  [circuit-breakers](../../../../backend-platform/resilience/retry-backoff/techniques/circuit-breakers.md) forbids
  — decrement, do not purge. The registry rule stands; this is a live instance of
  the defect it names, in code that is otherwise careful.
- **The sticky-session rationale is unsourced.** The gateway pins a conversation
  to one model for 30 minutes "to avoid the hallucination spike that comes from
  mid-conversation model switches". No measurement supports that claim anywhere
  in the repository. The *mechanism* is still instructive — on a forced switch a
  compact handoff note is injected, and its token cost is added to the routing
  estimate before the context-window and rate checks run, which is
  failover-horizon's "a mitigation that consumes tokens is charged against the
  budget already checked" — but the quality premise is a vendor claim, and no
  technique in this bundle rests on it. Also observed: the two windows disagree
  (sticky 30 min, handoff context 3 h), which produced spurious handoffs on
  session-id reuse.

## Trust verdict, 2026-08-20

**Usable as a knowledge source; not a dependency for a production routing layer.**

Reasons to trust the *code* as evidence: permissive license; a large, currently
active contributor base; a real test suite; comments that cite the issue numbers
behind their rules, which is what makes the incidents above verifiable rather
than anecdotal; a catalog feed verified against a **pinned public key over the
exact bytes received**, with a minimum-version floor so a stale snapshot cannot
roll the local roster back below what shipped; provider credentials encrypted at
rest and decrypted per request; no outbound host in the server tree beyond the
catalog service.

Reasons not to build on it: the project's own README says it is "for personal
experimentation and learning, not production", and the free tiers it stacks carry
no service level. Its own provider-by-provider terms review (dated May 2026)
marks one provider **avoid** outright on a personal-use prohibition and three
more **caution** on evaluation-only or experimentation-only scoping — meaning
compliance risk sits entirely on whoever runs it. Catalog freshness beyond a
monthly snapshot is behind a paid tier, and the advertised install path pipes a
remote script to a shell. Secondary coverage is also unreliable: write-ups still
circulating in August 2026 report "16 providers", "800M tokens", and "no tool
calling or vision", all contradicted by the tree read here — check the repository,
not the articles.

The transferable content is the routing craft, and it has been lifted into
candidate-ranking, model-identity, and failover-horizon. Nothing here recommends
adopting the gateway itself.
