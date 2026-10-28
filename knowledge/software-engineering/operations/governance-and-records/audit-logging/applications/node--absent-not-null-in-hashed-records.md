---
layer: application
type: application
subject: audit-logging
technique: absent-not-null-in-hashed-records
stack: node
status: forged
verified_on: 2026-10-27
---

# Five optional fields on a chain that never re-hashed (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). An agentic DevSecOps control plane keeps an
append-only, hash-chained ledger of every agent action per project as JSON lines in a
repository; a CI component writes it, a server imports it into an index, a proof checker
verifies it. The ledger grew five optional fields after chains existed — a guardrail
verdict, a deployment environment, the policy revision a gate read, the grants it
withdrew, and what the next autonomy rung would have decided — and no chain was rewritten.

## The rule is written on every field

The digest is `sha256(prev_hash + canonical(event without hash))`
(`src/schemas/ledger.ts:59` "hash: string; // sha256(prev_hash + canonical(event without
hash))"), and `canonical()` hashes a null as a value. So the type carries the reason on each
optional field, starting with the first: "When absent the key is absent, never null:
canonical() would hash a null, and an event without a verdict must hash as it always did. An
explicit undefined hashes as absent, as JSON writes it." (`src/schemas/ledger.ts:31-32`). The
later fields repeat "absent, never null, for the same reason as `verdict`"
(`src/schemas/ledger.ts:37`). The module README makes it a rule for every layer: "The key is
absent, never `null`, at every step (the engine's `parseLedgerEvent`, `parse.ts`, the index's
`readLedger`)" (`src/server/ledger/README.md:28-29`), and the index's nullable columns are the
store's representation, read back with the key dropped (`src/server/ledger/README.md:32-33`).

## One parser, rebuilding field by field

`src/schemas/chain/parse.ts:1` "The one ledger-event parser. The writer (engine `ledger
append`), the importer (server parseLedgerJsonl) and the checker (ledger-record) all call it",
and `:3-4` states the method: "an event is rebuilt field by field, anything unknown is dropped,
and an optional key that is absent stays absent (the hash depends on it)". Optional keys are
copied by presence (`src/schemas/chain/parse.ts:43` "...('state_rev' in v ? { state_rev: rev
as string } : {})"). The pin test is the technique's: `src/server/ledger/__tests__/verdict.test.ts:20`
"an event without one hashes exactly as it did before the field existed", and `:34` runs a
mixed chain through parse, append and read-back.

## Unknown keys: refused as newer, not as tampered

Dropping unknown keys and then recomputing the hash would report a newer writer's line as
tampered. The stricter layer the importer and the writer share refuses it instead:
`src/schemas/chain/strict.ts:29` "written by a newer version than this reader, not a
tampered chain", with the README stating the same at
`src/server/ledger/README.md:57`. The known-key set is bound to the type
(`src/schemas/chain/strict.ts:14` "const KEYS: { readonly [K in keyof LedgerEvent]-?: true }"),
and its comment at `:11-12` names the failure it exists to prevent: "a key added to the type and
not here ... is a typecheck error, not every new line refused as \"newer than this reader\"".
That binding is an upward lesson the technique took: the known-key list is a vocabulary, and a
hand-kept copy would refuse the writer's own next line.

## Deviations recorded

- The shared parser's header (`src/schemas/chain/parse.ts:3`) still says unknown keys are
  dropped; the refusal lives one layer up in `strict.ts`. The proof checker reads "by its own
  rules" (`src/schemas/chain/strict.ts:3`), so whether it also refuses-as-newer is outside the
  shared door — the one-parser rule holds for writer and importer, and is weaker for the
  verifier.
- The open-record discipline is the only evolution path; no record carries a recipe version.
  Adequate while every new field is optional; the first required field will need one.
