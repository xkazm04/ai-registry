---
layer: technique
type: technique
subject: llm-call-telemetry-model
technique: server-owned-fields
status: forged
laws: [server-owns-the-accounting-clock, no-retroactive-restatement]
shared_with: []
use_when: [deciding which event fields the ingest path must stamp or strip, reviewing an ingest API for spoofable attribution, adding a field that feeds budgets or billing]
---

# Server-owned fields

Some fields on the call record are facts about the *transaction between
client and server*, not about the call — and for those, the client is not a
witness, it is an interested party. The technique: enumerate them, and have
the one shared ingest step **stamp each from server-side truth, overwriting
or stripping whatever the request body claimed**, before validation, pricing,
or storage.

The canonical set:

- **Receipt time** — stamped from the server clock; every rolling
  accounting window keys on it (the rationale lives in
  [dual-clock-event-time](./dual-clock-event-time.md)).
- **Project scope** — derived from the authenticated credential, not read
  from the body, when a credential is present. The client cannot write into
  a project it did not authenticate to.
- **Writing credential id** — stamped from the authenticated principal into
  the attribution map. The reason is one sentence long: without it, a
  caller writes `{"api_key_id": "<the-other-key>"}` and either **launders
  its spend onto another key's budget** or dodges its own per-key cap, and
  attribution names whoever the attacker chose.
- **Cost provenance** — the `client`/`book` stamp is the server's verdict
  on how the cost was resolved; a client asserting "book" about its own
  self-reported number would defeat the stamp's purpose.

The membership rule: **any field that feeds accounting, enforcement, or
attribution is either server-stamped or explicitly documented as a client
claim** — there is no third state where a field quietly does both.

## Stamp-and-strip, not stamp-or-trust

Overwriting when you have a value is only half the mechanism. The
load-bearing half is **stripping when you do not**: on a request with no
credential behind it (an admin surface, a keyless development mode), the
ingest step must *remove* a client-sent credential id rather than let it
pass through as ambient data. An ownership rule with a bypass lane for
"unauthenticated" writers is not an ownership rule — the attacker simply
uses the lane. The same posture at the serialization layer: receipt time is
skip-on-deserialize (or unconditionally overwritten), so ownership holds
even for code paths that forget to call the stamping function.

Two subtleties earned in production:

- **Stamp the opaque id, never the secret.** What is persisted for the
  writing credential is its database id — not the presented token, not a
  prefix, not a hash. Event rows outlive keys, get exported, and leak;
  nothing replayable or reversible may ride on them.
- **History gets a bucket, not a guess.** Rows written before a server-owned
  field existed carry no value and fall into a named unattributed bucket.
  Backfilling an *ownership* field from client-era data would launder
  untrusted claims into trusted ones — and restating attribution inside
  already-reported windows is retroactive restatement wearing a migration's
  clothes.

## One door, tested from the outside

All stamping lives in the single preparation function every ingest surface
passes through — single-event, batch, and any protocol adapter. Two doors
with two stamping implementations *will* diverge, and the divergent one is
the one the attacker finds. The property is cheap to verify and must be
verified at the serialization boundary, not by unit-testing the stamping
function: construct a request that sets every server-owned field to a
malicious value, ingest it, and assert each came out server-stamped. That
test is the specification; a reviewer adding a field that feeds money can
be pointed at it and asked "is yours in here?"

## When not to server-own

Ownership is for transaction facts, not for distrust in general. Event
time, token counts, and reported cost are client claims the server cannot
independently know — the honest treatments there are bounding
([ingest-skew-rejection](./ingest-skew-rejection.md)) and provenance
disclosure ([nullable-cost-never-zero](./nullable-cost-never-zero.md)), not
overwriting. Stamping what you cannot actually verify does not add trust;
it destroys the client's data and signs your name to the result.
