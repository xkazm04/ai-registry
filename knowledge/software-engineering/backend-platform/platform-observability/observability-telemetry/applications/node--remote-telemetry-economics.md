---
layer: application
type: application
subject: observability-telemetry
technique: remote-telemetry-economics
stack: node
verified_on: 2026-08-22
---

# Remote telemetry economics in the Sentry JavaScript SDK (Node)

How the client half of a commercial telemetry channel budgets itself. Citations are against
`@sentry/core` 10.67.0, `getsentry/sentry-javascript` commit `bc57430` (2026-08-21), packages
`core/src` and `node/src` — an external tree, so the pin lives in prose rather than in
`verified_against`, whose contract is a stack runtime version. The vendor of the quota wrote
this client: every gram of payload it sheds is revenue it declined to bill for.

## 1. Every drop is counted, by reason and by category

`Client.recordDroppedEvent` (`core/src/client.ts:629-640`) accumulates into `this._outcomes`
under the composite key `` `${reason}:${category}` `` (`:637`), where reason is one of twelve
closed values (`before_send`, `event_processor`, `network_error`, `queue_overflow`,
`ratelimit_backoff`, `sample_rate`, `send_error`, `internal_sdk_error`, `buffer_overflow`,
`ignored`, `invalid`, `no_parent_span` — `core/src/types/clientreport.ts:3-15`) and category is
the billing unit (error, transaction, span, session, log_item, replay…).

Every gate reports in, which is what makes the ledger complete rather than decorative: an event
processor returning null (`client.ts:1501`), `beforeSend` returning null (`:1515`, plus a `span`
debit of `1 + spans.length` at `:1517-1520`), the error `sampleRate` roll (`:1531`), the
processing buffer overflowing (`:1598`), negative trace sampling (`tracing/trace.ts:525`,
per-child at `:576-581`), rate-limit backoff and network failure in the transport
(`transports/base.ts:46`, `:99`, `:110`), a 413 from the ingest edge (`base.ts:77-83`).
`_clearOutcomes` drains (`client.ts:1609-1620`), `createClientReportEnvelope` shapes
(`utils/clientreport.ts:11-23`), `_flushOutcomes` ships (`client.ts:1625-1648`). This is
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) at channel scale:
arriving events are a sampled, rate-limited, filtered stream that reads as ground truth, and the
client report supplies the denominator.

Flush cadence is per-runtime: Node a 60 s interval plus a `process.on('beforeExit')` hook from
`startClientReportTracking` (`node/src/sdk/client.ts:164-180`; constant at `:25`), the interval
`.unref()`ed so accounting never keeps the process alive, with `flush()`/`close()` draining and
unregistering (`:119-121`, `:128-147`); browser on `visibilitychange → hidden`
(`browser/src/client.ts:103-114`). One ledger, one definition of orderly shutdown per host.

## 2. The channel obeys the meter it is charged against

`updateRateLimits` (`core/src/utils/ratelimit.ts:53-107`) parses `X-Sentry-Rate-Limits` into
category → wall-clock deadline, with fallbacks in descending specificity: per-category deadlines
(`:89-98`), an `all` deadline when the header names no categories (`:87`), `Retry-After`
(`:101-102`), a bare 429 as 60 s across everything (`:103-104`); `DEFAULT_RETRY_AFTER` is 60 s
(`:8`). Enforcement is per envelope item and *before* the request: `send` filters through
`isRateLimited`, debits `ratelimit_backoff` for what it discards (`transports/base.ts:43-50`),
skips the request if nothing survives (`:53-55`). Degradation is server-directed and
per-category rather than client-invented — stronger than the technique's "know your budget",
because the budget holder names the class to shed. The buffer in front is bounded at 64
in-flight requests (`DEFAULT_TRANSPORT_BUFFER_SIZE`, `base.ts:21`; overridable `:32-34`);
overflow rejects synchronously with `SENTRY_BUFFER_FULL_ERROR` (`utils/promisebuffer.ts:45-48`)
rather than queueing, and that rejection becomes a `queue_overflow` outcome (`base.ts:108-111`).

## 3. Breadcrumbs free, rates attached, counts instead of events

`addBreadcrumb` (`core/src/breadcrumbs.ts:18-40`) writes to the isolation scope, not the wire —
nothing ships until an event assembles. The ring is 100 deep (`breadcrumbs.ts:10`;
`scope.ts:32`), `maxBreadcrumbs: 0` disables collection (`breadcrumbs.ts:26`), messages truncate
to 2048 chars *on insert* (`scope.ts:571`) because the trail is memory-resident before it is
bandwidth, and eviction is `slice(-maxCrumbs)` (`:575-578`).

Error sampling reads `sampleRate` through `parseSampleRate` (`client.ts:1495`;
`utils/parseSampleRate.ts:8-19`, rejecting anything outside `[0,1]` as `undefined` rather than
coercing) and rolls per event (`:1531`). For traces the applied rate is written onto the root
span (`tracing/trace.ts:516-517`) and then *forced into the dynamic sampling context even when
the DSC is frozen* (`tracing/dynamicSamplingContext.ts:100-118`), riding baggage downstream
beside `sample_rand` (`:176-181`) and arriving as `parentSampleRate` (`trace.ts:507`) — the
technique's non-negotiable as a distributed-tracing invariant, not a documentation promise.

Request health ships as counts: `recordRequestSession`
(`core/src/integrations/http/record-request-session.ts:24-88`) buckets by minute (`:46-48`),
tallies `exited/crashed/errored` (`:51-52`), emits one `sessions` aggregate per window
(`:66-74`) on a 60 s timer (`server-subscription.ts:115`) or early on the `flush` hook
(`:77-80`). Logs batch to a 100-entry threshold (`logs/internal.ts:19`, `:56-57`); payloads
bound at `normalizeDepth = 3` / `normalizeMaxBreadth = 1000` (`utils/prepareEvent.ts:50`).

## Deviations

- **The accounting travels only over the channel it audits.** Client reports are ordinary
  envelopes on the same transport, so an `all` rate limit or a dead network suppresses the
  ledger that would explain the silence. The code half-notices — `recordEnvelopeLoss` refuses to
  record outcomes *for* a failed client report (`base.ts:60-65`), the offline transport refuses
  to persist one (`transports/offline.ts:84-88`) — but the pre-send rate-limit filter has no
  such guard, so a discarded client report is itself debited as `ratelimit_backoff:internal`
  (`base.ts:43-50`) into the next one. Counting send failures into the **local** sink is unmet:
  the only local witness is `debug.error` (`client.ts:1267`, `:1272`; `base.ts:100`),
  double-gated behind the `DEBUG_BUILD` compile flag (`core/src/debug-build.ts:8`) and a runtime
  toggle defaulting to off (`utils/debug-logger.ts:113`). In production with `debug: false`, a
  Node service gone telemetry-dark says nothing on its own stdout.
- **`maxValueLength` has no default.** Declared optional (`core/src/types/options.ts:296-299`),
  every use site guarded by `if (maxValueLength)` (`utils/prepareEvent.ts:150-159`,
  `integrations/extraerrordata.ts:114-115`), no package supplying a value. An exception message
  containing the document that caused it ships whole, bounded only at the ingest edge — the 413
  path (`base.ts:77-83`) is the consequence, charged as a `send_error` drop of the whole
  envelope. "Bound everything" holds for breadcrumbs and object graphs, not for free prose.
- **Client-side dedup is one slot deep, and off by default here.** Dedupe compares only against
  the immediately previous event (`integrations/dedupe.ts:12`, `:25-31`), so alternating
  failures in a reconnect loop defeat it; it is in the browser defaults (`browser/src/sdk.ts:47`)
  but not Node's (`node/src/sdk/index.ts:50-69`). The "loop without a limiter" ban lands on the
  SDK's user, not the SDK.
- **Ring rotation is billed as an overflow.** Ordinary breadcrumb eviction records
  `recordDroppedEvent('buffer_overflow', 'log_item')` (`scope.ts:577`) — a free-tier ring doing
  what a ring does, reported into the metered tier's ledger under a category it never belonged to.

## Not present by scope

Consent is the host application's, the SDK exposing handles only (`sendDefaultPii`; the
`infer_ip: 'auto' | 'never'` metadata setting at `browser/src/client.ts:95-100`); scrubbing
beyond truncation is `beforeSend`'s job. Operator-side liveness expectation is Sentry the
product, not Sentry the SDK, and correctly absent here.

## Reconciliation summary

Confirmed: a twelve-reason × category drop ledger fed by every gate and shipped as its own
envelope class; per-runtime flush with an unref'd interval and an exit hook; server-directed
per-category quota degradation; a bounded send buffer whose overflow is itself an accounted
outcome; breadcrumbs free-until-event, ring-capped, truncated on insert; the sampling rate
propagated through a frozen DSC downstream; minute-bucketed session aggregates and
threshold-batched logs. Deviations: the ledger rides the channel it audits with no local sink;
`maxValueLength` defaults to unbounded; dedup is depth-1 and absent from Node's defaults;
breadcrumb eviction is miscounted as a metered `log_item` overflow. Not present by scope:
consent policy, payload scrubbing, receiving-end liveness alerting.
