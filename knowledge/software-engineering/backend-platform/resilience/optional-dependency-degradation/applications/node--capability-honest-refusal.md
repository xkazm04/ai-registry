---
layer: application
type: application
subject: optional-dependency-degradation
technique: capability-honest-refusal
stack: node
status: forged
verified_on: 2026-08-29
verified_against: node@24
---

# One front door that refuses in the honest order, and a connector that guesses

`ascent@10cbd8fa` is a Next.js 16 org dashboard (Node 24 per `package.json`
engines) with a public, internet-facing telemetry ingest surface and a set of
provider connectors. It carries the technique's ordering rule almost verbatim
in one file, and its two live defects in two others.

## The ordering, written as a numbered contract

`src/lib/integrations/ingest-guard.ts:143-156` is the comment the technique
wants at every gate — "the common front door for every ingest route, in the
ONE order that stays honest": rate limit (429) first, "charged before any
crypto or body read"; then **not configured (503)**; then signature (401);
then revocation (401). `:166-170` explains why the configured check sits
before the signature step rather than after: "without a secret
`parseIngestToken` fails closed and EVERY caller would get 401 'invalid
token'. That is a true refusal wearing a misleading cause: it sends an
operator to check their exporter's header when the fix is a variable on the
server." That is *unconfigured is not unauthorized*, with the cost of getting
it wrong named.

`:176-185` is the rule the technique now states for state the gate cannot
read. The revocation epoch lives in the database; when the read fails, the
guard refuses with a 503 and `Retry-After: 30` — "'revocation state unknown'
must never resolve to 'accept the old token'" (`:152-154`). Unknown refuses
with the temporary code; it does not collapse to the value that admits.

`:132-141` keeps a subtler distinction the technique does not spell out but
implies: a *revoked* token and a *forged* token both get 401, deliberately,
"so a caller must not be able to distinguish a revoked org from a forged mac
by status code alone" — but the copy differs, because the exporter's
operator needs "paste the NEW token" rather than "check your typing". Same
status, different fix, and the security posture decides which of the two
audiences gets the sharper signal.

## The variable name in a public body, and why it is right here

`ingestNotConfigured()` (`:122-130`) puts `INTEGRATIONS_INGEST_SECRET` in the
response body: "Ingest is not configured on this deployment. Set
INTEGRATIONS_INGEST_SECRET on the server." Read against the technique's
original wording — the variable name goes to the log — this is a deviation.
Read against the audience rule it is the correct call: the product is
source-available and self-hosted, the caller of this endpoint is an exporter
that the deployment's own operator configured, and the variable name is in
the repository's template (`.env.example:289`). The same decision is made on
the operator surface: `src/features/admin/integrations/ClaudeCodeSetup.tsx:28-35`
renders an explicit "Ingest is not configured on this deployment" panel in
place of the token, and `IntegrationsTab.tsx:49` passes an empty token when
`isIngestConfigured()` is false — the hidden affordance with its reason
beside it.

## Where the limiter cannot answer, it says it did not

`src/lib/rate-limit.ts:386-398` is the technique's "a refusal is not an
error-rate event" applied to the limiter's own outage. When the shared store
does not answer, the old code "returned one full window (60s), which is the
shape of a real drain estimate and reads to a client as 'the budget is full
for a minute' — a refusal dressed up as a measurement." The replacement
carries `evaluated: false` and `scope: "unavailable"` so a client can tell an
outage from its own overuse, and `ingest-guard.ts:158-162` passes the whole
result through for the same reason: "Same 429, three different actions."

## Deviations

- **A denial and an outage collapse at the fetch helper.**
  `src/lib/integrations/copilot.ts:98-114` is `ghJson()`: "Returns null on any
  non-2xx — the caller degrades, never throws" (`:109`, `:111-113`). A 403
  from a credential without Copilot admin scope, a 404 for an org with no
  Copilot, and a network failure are one `null`. The route above it then
  guesses: `src/app/api/integrations/copilot/sync/route.ts:62-75` returns a 422
  whose message asserts "the cause is nearly always scope" and tells the
  operator to grant `manage_billing:copilot`. On the day the guess is wrong —
  an upstream outage, a rate limit — the operator is sent to change a
  permission that is fine. The classification existed at `:109` and died
  there. Resolved 2026-08-29 (ascent commit `bc759bca`): `ghJson` now
  returns a typed failure reason (`denied` / `absent` / `unreachable`) and
  the sync route answers from that fact — the 422 scope guess is retired.
  The bullet is kept as the dated specimen.
- **A zero that means "not reported".** `copilot.ts:4-19` and `:72` store
  `costCents: 0` and explain, at length, that "0 here means **not reported**,
  never 'spent nothing'"; a separate `hasAllocatedCost` flag keeps the row out
  of the ROI arithmetic. The comment is honest and the flag is the right
  instrument — but the value on the row is still a definite zero, and every
  reader that does not consult the flag (a raw export, a future rollup) reads
  it as money. The standard wants the absence recorded as absence on the row.
- **A card labelled Available with nothing to click.**
  `src/lib/integrations/providers.ts:75-89` declares the Copilot connector
  `status: "available"`, and `ProviderCard.tsx:38-42` renders the green
  "Available" badge from that. But `IntegrationsPanel.tsx:56-60` passes a
  connect surface only for `claude-code`; the Copilot card has no sync
  button, and the only way to invoke the connector is to POST
  `/api/integrations/copilot/sync` by hand (no caller in `src/` does). Worse,
  `ProviderStatus.tsx:18-26` renders, for every available provider with no
  data yet, "No telemetry received yet. Finish the setup below, then run
  Claude Code once." — on the Copilot card, whose data does not come from
  Claude Code and which has no setup below. This is the inverse defect the
  technique names: available means there is an affordance, and the guidance
  beside it was written for this capability.
- **The refusal code is prose.** Every 503 and 401 above carries `{ error:
  "<sentence>" }` and nothing else; there is no closed code union on the
  ingest surface, so an exporter or a dashboard can only branch on status or
  match message text. The route-level `evaluated`/`scope` fields on the
  limiter result are the one place a machine-readable verdict exists, and
  they do not reach the body.
