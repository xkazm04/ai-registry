---
layer: application
type: application
subject: import-normalization
technique: overlay-merge-absence-semantics
status: forged
stack: node
verified_on: 2026-09-01
verified_against: node@20
---

# Translation overlays — the empty array that deleted the canonical, past a green checksum

`src/lib/personas/templates/templateOverlays.ts` deep-merges per-language
translation overlays onto canonical English template documents. Canonical
files at `scripts/templates/<category>/<name>.json` are the structural
source of truth; sibling `<name>.<lang>.json` files carry only user-facing
strings, and the module header states the contract outright
(`templateOverlays.ts:1-14`): *"structural fields (ids, cron, connector
names, event types, maps_to paths) stay single-sourced in the canonical
file… overlays are not independently checksummed."* All citations resolved
at HEAD `b6dcf28aa1a5197407112922fa84692bed2f104d`.

## The vacuous guard, verbatim

`mergeArray` (`templateOverlays.ts:130-204`) is the array arm of the merge.
Its wholesale-replace branch is a primitive-only test:

```ts
142:  if (overlay.every((v) => !isPlainObject(v) && !Array.isArray(v))) {
143:    return overlay;
144:  }
```

The intended reading is "a strings-only overlay list replaces the canonical
list wholesale — the translator supplied the whole translated set". For
`overlay === []` the predicate is vacuously true, the branch returns `[]`,
and the canonical array is gone. Not a bypass: the guard ran and returned
true over zero members. A translator writing `"use_cases": []`, or a
generator emitting an empty list for a section it had not translated yet,
deleted structural content the module's own contract says it does not own.

The bug shipped with the module (`b3f6788a5`, the overlay loader's first
commit — the `.every()` branch is verbatim from birth) and was fixed in
`be39ca221 fix(lib-personas): scan-sweep wave 2`.

## The landed fix — absence made a separate branch

`templateOverlays.ts:131-137`, ahead of the `.every()` test:

```ts
131:  // An EMPTY overlay array carries no translation, so it means "not mentioned",
132:  // never "delete this". Without this guard the `every(...)` predicate below is
133:  // vacuously true for `[]` and the wholesale-replace branch returns `[]` — so a
134:  // translator writing `"use_cases": []` (or a generator emitting an empty list
135:  // for an untranslated section) silently erased structural content that this
136:  // module's contract says stays single-sourced in the canonical file.
137:  if (overlay.length === 0) return canonical;
```

This is the technique's shape exactly: the emptiness precondition is
written *first and separately*, and empty is resolved to **not mentioned**
— the design choice this codebase's authorship model demands, since the
overlay's author is a translator who omits what they have not reached.

## The integrity gate was upstream of the erasure

The full ordering, confirmed in `templateCatalog.ts`:

| Step | Site |
| --- | --- |
| checksum over the canonical | `templateCatalog.ts:182-188` |
| schema validation (canonical) | `templateCatalog.ts:194-199` |
| entry accepted as verified | `templateCatalog.ts:201` |
| overlay load + merge | `getLocalizedTemplateCatalog`, `:353-390`, call at `:384` |

Everything after line 201 is downstream of the gate. The digest is computed
over `JSON.stringify(template)` — the pre-merge canonical — so it certifies
a document that no consumer of a non-English locale ever sees. The
docstring at `templateCatalog.ts:346-348` states the gap as a design note
rather than a finding: *"Overlays are not independently checksummed —
structural integrity is gated by the English canonical's checksum, which
was verified at catalog load time."* That sentence is true and is precisely
the failure: the gate observed a state the erasure then left behind, and
reported green about it.

Worth recording alongside: the sync digest at
`src/lib/templates/templateVerification.ts:38-51` is a deterministic 64-bit
mix, not a cryptographic hash (the SHA-256 sibling at `:26-32` is the async
path). It is a tamper-*evidence* device against accidental edit, mirrored
into the Rust backend by `scripts/generate-template-checksums.mjs:223-280`
— one authority, generated mirror, the pattern this bundle's cap-constant
application already credits this repo for.

## The regression test does what the technique asks

`src/lib/personas/templates/__tests__/templateOverlays.test.ts:302-318`
pins both shapes in one case — an object array (`use_cases: []`) and a
primitive array (`service_flow: []`) — and asserts the canonical survives
both. The adjacent pre-existing case at `:297-300` covered the empty
*object* only, which is why the empty *array* went unnoticed for the
module's whole life: the emptiness fixture existed and tested the other
container kind.

## Where it still diverges from the technique — honestly

- **No explicit replace marker.** The technique's stated contract pairs
  absence-as-unmentioned with a typed override for deliberate whole-set
  replacement. Here empty now always means "keep canonical", so a
  translator who genuinely wants a list emptied in one locale has no way
  to say it. Acceptable while overlays are strings-only by contract; the
  day an overlay legitimately owns a set, the marker has to exist or
  someone will reintroduce the erasure as a feature.
- **The merge does not count what it changed.** No membership diff, no
  refusal on an unexplained drop, no ledger entry — a merge that removes
  canonical members is silent about it. The technique's
  count-carries-predicate obligation ("42 after, 51 before, 9 by explicit
  marker") has no implementation; the guard is the only defence, so the
  next merge branch added below it inherits none of it.
- **The digest still precedes the transform.** The fix removed this
  erasure, not the ordering that hid it. Nothing verifies the *merged*
  document, and overlays remain unchecksummed by design — so any future
  structural write from the overlay path is equally invisible to the gate.
  The nearby prototype-pollution fix in the same file (`f51ad219d`,
  `templateOverlays.ts:100-113`) is a second finding of the same class,
  which is the argument for gating the merged artifact rather than
  enumerating merge bugs.
