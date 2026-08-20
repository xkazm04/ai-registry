---
layer: application
type: application
subject: portable-hiring-records
technique: human-versus-automated-decision-attribution-on-export
stack: node
status: forged
---

# Deriving `automated` from the actor, in the portable record mapper

`app/_lib/ats-record.ts` is the pure, dependency-free mapper that turns internal
rows into the vendor-neutral record a connector maps from. Its header (`:1`) names
the payload: *"one candidate, one role, the pipeline state, the SEALED decision with
its tamper-evident hash + auto/human attribution, and the offer comp."*

## The record's decision block

`app/_lib/ats-record.ts:65` onward defines `AtsCandidateRecord`. The decision
sub-object carries `kind`, `reasonCode`, `actor`, `automated`, `sealedRecordHash`,
`policyVersion` and `decidedAt` — or the whole block is `null` when no sealed
decision exists. Null rather than a defaulted shape is the right shape: an absent
decision is not an undecided one wearing default values.

Two things travel that the technique asks for and most exports drop. The
`policyVersion` means the receiving system holds the rule version in force, not
just the outcome. The `sealedRecordHash` — the content hash from the decision
store — means the record arrives with the marker by which it can be checked against
the source, rather than as a re-typed assertion.

## `automated` is derived, never trusted

The load-bearing line is `:111`:

```ts
/** True unless the decision actor is explicitly a human (e.g. "human:recruiter").
 *  Mirrors decision-attribution's never-default-unknown-to-auto doctrine inverted:
 *  here we only call it human when it SAYS human; everything else is automated. */
function isAutomatedActor(actor: string): boolean {
  return !actor.toLowerCase().startsWith("human");
}
```

and its single use at `:153`, `automated: isAutomatedActor(decision.actor)`.

This is the technique's rule 1 and its central decision rule in four lines. The flag
is computed at export time from the sealed actor string rather than read from a
stored boolean, so there is no field a careless writer could have set wrongly. And
the default direction is the safe one: the record only claims a human when the actor
*says* human. An unrecognised, empty or malformed actor exports as automated — the
degrade, never the upgrade.

The mechanic that makes the derivation cheap is the prefixed actor namespace:
`human:` is structurally reserved, so "is this a person" is a property of the
identifier rather than a fact stored beside it. The technique argues for exactly
this and the repo taught it — an actor namespace a human account could not occupy
is what removes the need for a flag at all.

## Versioned, and pinned in both directions

`ATS_SCHEMA_VERSION` (`:25`, `"kp.ats.v1"`) is stamped on every record with the
instruction *"bump on any breaking change to `AtsCandidateRecord` so consumers can
pin a map"*, and `exportedAt` is caller-stamped so the mapper stays pure (no clock,
no DB) — which is also what makes the record unit-testable without a database.

The round trip is pinned: `app/_lib/ats/inbound.ts`'s `toAtsEntryInput` projects an
inbound record onto the mapper's input, so *"a candidate imported from an ATS emits
exactly the same `kp.ats.v1` shape as one who applied directly"*, held by
`app/_lib/ats/inbound.test.ts`. That is the canonical-record-in-the-middle claim
enforced by a test rather than asserted in a design doc.

## The delivery boundary

`app/_lib/ats-egress.ts:78` marks the seam this subject cedes to the
communication-integrity discipline, and states the general rule in its local form:
*"DELIVERED means the RECEIVER ACCEPTED it (HTTP 2xx). A non-2xx response … is a
FAILURE — previously ANY HTTP response counted as delivered, so a receiver
[rejecting the payload] looked like success."* Non-delivery goes to the durable
delivery ledger for retry (`:126`). Credential storage, request signing, the
destination-address guard and the retry schedule around it are the neighbouring
engineering bundle's, not this subject's.

## Not present

The technique's step 5 — exporting the pre-override machine verdict alongside the
final human decision — has no realization here: the mapper pulls the latest sealed
decision only, so an export shows what was decided and not what the machine
proposed before a human changed it. The standard stays; the override-visibility
number the decision-audit discipline asks for is not computable from this record
alone.
