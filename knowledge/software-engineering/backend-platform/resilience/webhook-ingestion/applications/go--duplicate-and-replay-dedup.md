---
layer: application
type: application
subject: webhook-ingestion
technique: duplicate-and-replay-dedup
stack: go
verified_on: 2026-08-22
---

# Delivery dedup in Convoy's ingest path (Go)

Convoy is a self-hosted webhooks gateway: it accepts deliveries at per-source
URLs and fans them out to subscribed endpoints. Citations are against
`frain-dev/convoy` `v26.6.6`, commit `2b60cc652e1d4babc1857280d5911817960e83e7`
(2026-08-21) — an external tree, not the consumer repo the sibling `rust--`
applications cite, so the pin lives in prose, not in `verified_against`.

## 1. Delivery identity is operator-declared, extracted from the request

Convoy does not guess: each HTTP source carries an `idempotency_keys` array
(`datastore/models.go:1311`, validated at `api/models/source.go:69`, documented
at `:37-39`), each entry a selector — `request.header.<name>`,
`request.body.<json.path>`, `request.query.<name>` — resolved by
`DeDuper.extractDataFromRequest` (`internal/pkg/dedup/dedup.go:72-92`,
dispatching at `:94-119`), content-type aware: gjson for JSON (`:129-148`),
depth-first lookup for form bodies (`:167-180`, `:196-232`). The parts are
concatenated and SHA-256'd into a hex checksum (`:36-52`, `:267-279`) — the
technique's "prefer the sender's identity", made configurable rather than
assumed because a gateway fronts many senders.

**The namespace is the source *name*.** `GenerateChecksum` seeds the builder
with it (`dedup.go:44`, mirrored in `Exists` at `:62-66`) while the lookup is
scoped by `project_id` (`:69`). The `(source, sender-delivery-id)` pairing
exists — but bound to a mutable display string, not the stable UID
(`api/ingest.go:164` passes `source.Name`; the same handler uses `source.UID`
as the event's `SourceID` at `:250`). **Deviation:** renaming a source
re-partitions its dedup namespace, so every retry in flight across the rename
re-mints — an identity a human can edit is not an identity
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## 2. No key configured means no dedup at all

The dedup block is guarded by `if len(source.IdempotencyKeys) > 0`
(`api/ingest.go:162`); the persist-time claim (§4) likewise skips on an empty
key (`internal/events/impl.go:89`). A source with none configured — the default
for a new source — runs `isDuplicate` false and `checksum` empty for every
delivery, so at-least-once senders double-mint by default. **Deviation:** the
fallback rung — a digest of the raw body, valid within a window sized to the
sender's retry horizon — is absent, though the raw bytes are in hand at
`api/ingest.go:184` and `GenerateChecksum` is already a package-level function
over a string (`dedup.go:268`): the missing piece is policy, not machinery.

## 3. A duplicate is answered 200, and never delivered

Confirmed, cleanly. The duplicate is admitted, persisted, and acknowledged as
success — `"Duplicate event received, but will not be sent"` at `http.StatusOK`
(`api/ingest.go:315-319`; the fanout API path says the same at `201`,
`api/handlers/event.go:304-308`), so the sender's retry machinery stops.
Suppression happens downstream at fan-out, where
`worker/task/process_event_channel.go:283-287` logs `CODE: 1007` and returns
before subscriptions are matched. Quota is not spent on it either
(`api/ingest.go:270`, reasoning at `:265-269`).

## 4. Mark-and-mint is atomic — an advisory lock at the persist point

The strongest part of the tree, and exactly the rule the technique states: the
ingest-time `Exists` check (`api/ingest.go:163-171`) is only a fast path, and
the authoritative claim lives inside the insert transaction.
`Service.CreateEvent` takes a transaction-scoped Postgres advisory lock keyed
on `"events-idempotency:"+projectID+":"+key`, re-checks under the lock, and
flags the loser as duplicate before insert (`internal/events/impl.go:79-104`);
the comment at `:80-88` names the hazard in the technique's own terms and sets
a fail-closed policy for lock or lookup errors. Two copies arriving
milliseconds apart cannot both find "unseen".

Two predicates coexist over that identity: `FindEventsByIdempotencyKey` counts
**any** prior row with the key (`internal/events/queries.sql:102-108`), while
`FindFirstEventWithIdempotencyKey` matches only `is_duplicate_event = false`
rows — a key that has only ever produced duplicates reads as *new*. Convoy pins
one predicate per path (`api/handlers/middleware.go:118-146`).

## 5. Unbounded dedup memory, and no window between the two defenses

The lookup has no time bound: `WHERE idempotency_key = $1 AND project_id = $2
AND deleted_at IS NULL` (`internal/events/repo/queries.sql.go:581-589`). Dedup
memory is the events table itself, its only reaper a retention policy that
ships **disabled**, at `720h` when enabled (`config/config.go:102-105`).
**Deviation on both halves of the bound:** no named age bound by default, and
no window in the technique's sense — a content-identical delivery months later
is absorbed, not judged a possibly-distinct fact. The labor split's other half
is missing outright: no inbound verifier implements a
signed-timestamp window (`pkg/verifier/verifier.go:35-297` declares HMAC,
basic-auth, API-key, GitHub, Shopify, Twitter and noop, none of them timed), so
replay defense rests entirely on dedup memory — which works *because* it is
unbounded, and weakens the day retention is switched on.

Nor are duplicates counted: of `convoy_ingest_total`, `convoy_ingest_success`
and `convoy_ingest_error` (`internal/pkg/metrics/data_plane.go:82-102`), a
duplicate lands in *success* — the early-warning signal folded into the healthy
line ([count-carries-predicate](../../../../_laws.md#count-carries-predicate));
the `is_duplicate_event` column (`datastore/models.go:883`) is not a counter.

One hazard falls out of where the key is computed: the dedup block runs at
`api/ingest.go:162-179` and signature verification first at `:195`, so for a
body selector the **unauthenticated** body is read and parsed — gjson over raw
bytes (`dedup.go:134-147`) or `ParseMultipartForm(32 << 20)`, a hardcoded
32 MB ceiling (`:172`) ignoring the project's `MaxIngestSize` (default 50 KB,
`config/config.go:19-20`, resolved at `api/ingest.go:135-149`).
The declared `Content-Length` is checked first (`:155-158`), so the guard is
the caller's declaration rather than the read. The JSON path restores the body
(`dedup.go:139`); the form paths do not, so raw verification can see an emptied
body and fall through to the converted payload (`:198-214`).

## Reconciliation summary

**Confirmed:** operator-declared delivery identity extracted from the sender's
own request shape, namespaced per source; check-and-mint made atomic by a
transaction-scoped advisory lock with a re-check under it and a fail-closed
error policy; duplicates acknowledged as success and suppressed at fan-out,
not at the door; duplicate rows retained; no quota spent on them.

**Deviations:** namespace keyed on the mutable source *name*, not its UID; no
dedup at all when no key is configured, and no content-digest fallback; dedup
memory unbounded by default and no window in the technique's sense; no
signed-timestamp window in any verifier, so replay defense stands on one leg;
duplicates absorbed uncounted; body-selector extraction parsing unauthenticated
input, ahead of verification, under a hardcoded 32 MB ceiling.

**Not present by scope:** stream-position dedup and resume cursors — that rung
applies to subscription-channel ingress; this set cites the HTTP path only.
