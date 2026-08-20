---
layer: application
type: application
subject: llm-call-telemetry-model
technique: dual-clock-event-time
stack: process
status: forged
---

# The dual clock as a written field contract (LightTrack)

LightTrack keeps the record contract as a human-owned document,
`docs/DATA_MODEL.md`, and the dual-clock doctrine lives *in the field
table itself* rather than in a design doc nobody re-reads — the process
realization of the technique: the contract travels with the schema.

## The two rows state their owners and their readers

The `events` table (`DATA_MODEL.md:6-33`) gives each timestamp a row that
names its owner and enumerates exactly which reads key on it:

- `ts` (`:16`) — "when the call happened, **as the client reports it**.
  Queryable/orderable; drives `since`/`until` on `GET /v1/events`, traces,
  and the cost/use-case rollups", with the skew bound inline: rejected
  when beyond the configured window from server time (`ts_too_old` /
  `ts_too_new`, HTTP 400).
- `received_at` (`:17`) — "when the API accepted the call —
  **server-stamped, never read from the request body**. Every rolling-window
  accounting read keys on this: limit admission, `GET /v1/limits/status`,
  and the daily forecast series." The row then states *why* in one
  sentence — "a client owns its `ts`, so if budgets were measured on it a
  single wrong clock would silently corrupt enforcement" — and the
  backfill sentinel: pre-column rows carry `received_at = ts`.

A new consumer deciding which clock to read answers the question from the
field table alone; the enumeration of reads per clock is the decision rule
made concrete.

## The query contract carries the same honesty posture

The same document binds the read side to the model's disclosure rules:
`since`/`until` are explicitly "(client `ts`)" (`:36`), and backends that
have not ported an extended predicate must answer "**501 `unsupported`**
naming the filter — never an unfiltered page presented as if the filter had
been honored" (`:47-48`). The contract also fixes tag matching as
"membership, not substring" and `X-Total-Count` as cursor-independent
(`:37-43`) — semantics pinned in prose so two store backends cannot drift
into subtly different answers under one API.

## The skew policy is a documented, testable module

The rejection bounds referenced from `ts`'s row live in
`crates/api/src/events_validate.rs:21-37`: a symmetric override env var
(`0` disables, for deliberate historical imports), and asymmetric defaults
— 300 s toward the future ("almost always a wrong client clock — a small
tolerance covers ordinary NTP drift and nothing else") versus 7 days
toward the past ("legitimate backfill and offline-buffered SDK retries are
real; it only rules out timestamps that are nonsense"). The module header
(`events_validate.rs:1-11`) records the load-bearing consequence of the
dual clock: "Rolling-window *accounting* no longer rides on `ts` at all …
so this layer is about data quality, and it is ON by default" — the
contract explaining why a check survives after the risk it originally
guarded moved elsewhere.
