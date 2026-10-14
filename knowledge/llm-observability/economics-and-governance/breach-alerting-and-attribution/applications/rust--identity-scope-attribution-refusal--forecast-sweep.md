---
layer: application
type: application
subject: breach-alerting-and-attribution
technique: identity-scope-attribution-refusal
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.90
applied: code
ab_verdict: better
---

# Refusing the customer in a forecast broadcast (LightTrack, Rust)

The technique was already honoured at one door and missed at another. The
limit-breach path refuses to enumerate a key or customer (`ApiKey`/`Customer`
scopes yield an empty contributor list and a scope note pointing at the
authenticated usage surface). The pre-emptive forecast path is a second alert
producer that shares the same channels, and it was never classified on the
infrastructure-versus-identity line: the scheduled sweep always forecasts on
the **customer** axis, and its `margin_erosion` alert wrote the customer id,
its revenue per day and its cost per day into the webhook, push and email
payload, twice (in `text`/`content` and in the serialized `forecast.subject`).

## A and B

- **A (shipped):** a margin-erosion alert for customer `acme-corp` delivered the
  name and both dollar figures to every holder of the endpoint.
- **B:** the alert is marked identity-scoped where the customer axis is known
  (`compute_forecast`), the broadcast composer emits only project, severity and
  ETA plus a pointer to `GET /v1/forecast?by=customer`, and the flag is
  serde-skipped so the authenticated response is unchanged. Budget-breach
  forecasts (an operator-owned rule id, an infrastructure axis) keep their text.
- **Target:** the delivered payload contains no customer id and no per-customer
  money. Two unit tests read the composed payload: the identity-scoped one
  contains none of the name, `40.00`, `41.50`; the unscoped one still does.
- **Floor:** the api crate suite (474 tests) and `clippy -D warnings` stayed
  green; the dedup key, severity mapping and cooldown behaviour were not touched.

## Why this seam

Chosen to falsify "the refusal is held where the alert path is wired". It is
held at the breach path only; a second producer on the same channels was
sitting outside it, so the technique caught a real instance rather than
confirming the known one. The mechanical reinforcement the technique cites (a
rollup that cannot be filtered to a key) does not exist here: the margin rows
are keyed by customer by construction, so only an explicit flag can hold the
boundary, which is weaker than data shape and is the residual risk.

## Not measured

Live delivery to a real channel; whether an operator wants the customer name in
a private channel (the technique says the answer stays no). The pointed-at
`GET /v1/forecast?by=customer` surface exists and is project-authenticated.
