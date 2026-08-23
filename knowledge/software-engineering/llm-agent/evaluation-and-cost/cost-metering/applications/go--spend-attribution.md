---
layer: application
type: application
subject: cost-metering
technique: spend-attribution
stack: go
verified_on: 2026-08-23
---

# Spend attribution in OpenMeter

How a production usage-metering service built to feed billing realizes the
attribution technique. Citations are against `openmeterio/openmeter` commit
`7e57a39` (2026-08-18), Go module `github.com/openmeterio/openmeter`. A
reconciliation against an external tree, not the consumer repo the sibling
`rust--*` applications cite — so the pin lives in prose, not `verified_against`.

## 1. The mandatory axes are checked at the door

`ValidateKafkaPayloadToCloudEvent`
(`openmeter/ingest/kafkaingest/serializer/serializer.go:90-113`) requires
**`id`, `type`, `source`, `subject`, and a non-zero `time`** — five checks joined,
so a caller learns every missing axis at once. An event that cannot say *who* it
is for never reaches storage: `DROP`, with the validation error in
`DropError` (`openmeter/sink/sink.go:951-958`). `namespace` is a sixth
axis carried out of band on a Kafka header, absent likewise a `DROP`
(`sink.go:926-936`). "Fails loudly rather than writing an anonymous row", at one
chokepoint rather than by convention.

## 2. Axes resolve from the raw payload at query time — an upward lesson

Against a technique that says axes are captured at write time or never:
OpenMeter captures **no axes at write time at all**. `om_events` stores the
CloudEvent body verbatim in a single `data String` column
(`openmeter/streaming/clickhouse/event_query.go:26-45`). A `Meter`'s
`GroupBy map[string]string` (`openmeter/meter/meter.go:172`) maps axis name to a
**JSONPath into that stored body**, compiled at read time into
`JSON_VALUE(om_events.data, '$.model') as model`
(`streaming/clickhouse/meter_query.go:242-247`).

So a new axis defined today applies to history already stored, provided the
property was in the payload. The write-time obligation does not disappear — it
moves: from "enumerate the axes you will group by" to "emit every property you
might ever group by, and never truncate the payload". Strictly weaker and cheaper
than the technique states, and available to any ledger that keeps the raw record.

Axis names stay stable SQL identifiers: `^[a-zA-Z_][0-9a-zA-Z_]*$`, non-empty,
JSONPath starting with `$`, never the meter's own value property
(`validateMeterGroupBy`, `meter.go:310-333`). Dropping an axis on update is
refused when a feature depends on it — "meter group by: %s cannot be dropped
because it is used by feature: %s" (`openmeter/meter/service/manage.go:186-211`):
a contract, not a display preference. And retroactivity has a declared floor —
a meter's optional `EventFrom` (`meter.go:170`) **clamps every query**, the floor
winning over any earlier `from` (`meter_query.go:62-88`), so "history before
attribution began" is guaranteed rather than annotated.

## 3. Customer attribution is a late-bound join with a uniqueness constraint

Events carry `subject`; money is owed by a *customer*, and the two are joined at
query time. `CustomerUsageAttribution` holds an id, an optional key and a list of
subject keys — "We don't attribute usage to the customer by ID but we need it to
be able to map subjects to customers"
(`openmeter/streaming/usageattribution.go:30-38`); neither key nor subject keys
fails validation (`:46-48`). The join compiles to
`mapFromArrays(subjectKeys, customerIDs)[om_events.subject] AS customer_id`
(`streaming/clickhouse/queryhelper.go:50`), and the identity guard is at the
database: a subject key already belonging to another customer in the namespace
raises `SubjectKeyConflictError` (`openmeter/customer/errors.go:66-70`, from a
constraint error at `openmeter/customer/adapter/customer.go:338`, `:787`,
`:809`). One subject resolves to at most one customer, so a per-customer rollup
cannot double count — "axis values are identities", structural.

## 4. Idempotency: the dedupe key is the attribution triple

A duplicate event is double-billed spend. The dedupe identity is
`namespace-source-id` (`openmeter/dedupe/dedupe.go:33-41`) — tenant plus emitter
plus event id, so two producers may safely share an id space. The ordering is
at-least-once and commented as such: persist, commit offset, then set dedupe keys
(`sink.go:328-373`) — "if Redis write fails we potenitally accept messages with
same idempotency key in future" (`:352`) [sic]. Dropped messages are deliberately
**not** deduplicated, keeping a transient validation failure retryable
(`sink.go:495-499`).

**Deviation.** Dedupe is off by default with a finite window —
`sink.dedupe.enabled: false`, `sink.dedupe.config.expiration: 24h`
(`app/config/sink.go:138,149`). A redelivery past the window is counted twice;
the default deployment counts every redelivery twice. The code is honest —
"deduplicator is not set, deduplication will be disabled" at startup
(`sink.go:184-187`) — but a warning is not a counter, and `dedupe` declares none.

## 5. The unattributed bucket: surfaced once, spelled as empty string twice

Confirmed on the read surface: `validateEvents`
(`openmeter/meterevent/adapter/event.go:226-272`) attaches per-event
`ValidationErrors` for exactly the two attribution failures that matter — "no
meter found for event type: %s" and "no customer found for event subject: %s".
Unattributed events are stored, listed and labeled, never dropped; drops are
counted, `sink.flush.events` carrying `namespace` and `status`
(`sink.go:199-203`, `:409-414`).

**Deviation, the sharper one.** A group-by whose JSONPath misses resolves to `""`
— "we allow the group by fields to be missing in the event data or the data to be
null, in such cases we set the group by value to empty string"
(`openmeter/meter/parse.go:177-179,189`). That is the forbidden "default value
that masquerades as data": an event carrying `model: ""` and one carrying no
`model` land in one bucket, and nothing counts the second kind. The read model
has the slot the write model refuses to use — `MeterQueryRow.GroupBy` is
`map[string]*string` (`meter.go:336-342`), `ParsedEvent.GroupBy` is
`map[string]string` (`parse.go:62-66`). The customer join flattens the same way,
selecting `'' AS customer_id` with no customer in scope (`queryhelper.go:15`).

**Rollup honesty is enforced.** Query params refuse two shapes that would produce
a labelless number — more than one subject filter without grouping by subject,
more than one customer filter without grouping by `customer_id` — both carrying
the comment "This is required because otherwise the response would be ambiguous"
(`openmeter/streaming/query_params.go:48-56`).

## Reconciliation summary

Confirmed: mandatory axes at one ingest chokepoint; axis names validated as stable
identifiers; one subject to at most one customer by database constraint; a
declared attribution start date that clamps queries; an idempotency key scoped to
tenant and emitter; unattributable events stored and labeled, not dropped; rollups
refused when the response would be ambiguous. Deviations: dedupe off by default
with a 24h window and no duplicate-acceptance metric; a missing group-by value
flattened to empty string with no counted unattributed bucket, in a read model
that has the nullable slot to express it. Upward lesson: storing the raw payload
turns attribution axes from a write-time commitment into a query-time projection,
making new axes retroactive. Not present by scope: price tables and per-unit
rating live in billing and productcatalog — this reconciles counting, not costing.
