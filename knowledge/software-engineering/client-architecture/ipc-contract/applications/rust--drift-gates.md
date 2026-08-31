---
layer: application
type: application
subject: ipc-contract
technique: drift-gates
stack: rust
verified_on: 2026-08-29
verified_against: rust@1.97
---

# The orphan blind spot, re-measured and finally gated (Rust side)

The sibling application on this technique
([node--drift-gates](./node--drift-gates.md)) documents the two blind spots this
repo closed — the silent no-op generator and the untracked new file — and
records the third, orphans, as structurally open with a population of **29**.
That number was wrong, its class description was wrong, and the mirror
direction had never been measured at all. This is the correction and the gate
that came out of it.

## The re-measurement (2026-08-22)

Not a text search: an inventory walk over all 963 `.rs` files in
`src-tauri/`, counting `#[derive(TS)] #[ts(export)]` types, against a listing
of `src/lib/bindings/`.

- **1,008** exported types.
- **1,039** committed binding files.
- **35** orphans — bindings with no exporting source type.

Three figures had been recorded before this one: **6**, then **29** (itself
the survivor of three implementations run the same day, which reported 48,
31 and 29). Each was produced by a grep-shaped estimate; the walk is the
first inventory. The lesson is the technique's own, turned on the person
applying it: the count of a structurally invisible class is *also* a
measurement, and a measurement produced by three disagreeing instruments has
not been made.

## The class the old figure mis-described

"Orphan" was recorded as *the source type was deleted*. The 35 split two ways,
and only the smaller half matches that story:

- **22** have no source type of that name anywhere — the deletion case.
- **13** still have a live source type of that name which merely **stopped
  carrying the export derive**. The binding and the struct are both present,
  both edited, and drifting apart with nothing comparing them. Every field
  rename on the source side since the derive came off is already invisible on
  the generated side.

The second class is worse than the first and had no name. A deleted type at
least leaves a call site that will eventually be traced to nothing; a live
type whose binding froze produces a contract that is *plausibly current* — the
type exists, the binding exists, the names match — and disagrees on fields.

## Usage is evidence of danger, confirmed at a larger scale

Of the 35, **30 are still referenced by app code and 20 are still the declared
return type of a live `invoke`**. `scripts/check-unused-bindings.sh` therefore
*protects* the great majority of them, exactly as the standard warns: its
definition of "used" is "imported", so the orphans it certifies as fine are
the ones whose standing claim is live. A reference-shaped checker over this
class is not weak, it is inverted.

## The mirror direction, never previously recorded

The same walk in reverse: **4 `#[ts(export)]` types have no committed binding
file at all** — all in the `personas-core` crate, none feature-gated, so no
build shape explains them. Nothing had ever asked this question, because
every gate here was built from the artifact side. The technique's composition
rule says the inventory must match "in both directions"; this repo had been
running half of one direction.

## The gate that closed it

`npm run check:bindings` → `scripts/check-binding-orphans.mjs`, wired into
`npm run check` so it runs on every developer machine rather than only in the
45-minute cargo job. Two properties worth copying:

- **Two-sided allowlists.** `scripts/binding-orphan-allowlist.txt` baselines
  the 35 and `scripts/binding-missing-allowlist.txt` the 4 (still 35 and 4
  non-comment lines on 2026-08-29 — the baseline has not moved in a week,
  which the gate permits and the ratchet's owner should notice). Each fails on a
  **new** entry *and* on an allowlisted name that has **stopped** being one —
  so the baseline cannot silently become fiction as the orphans are cleared,
  and clearing one is a required edit rather than an unobserved improvement.
- **Inventory, not diff.** It never regenerates and never diffs; it counts
  both populations and set-subtracts. That is the only shape that can see
  this class, and it costs milliseconds, which is why it can live at
  commit-time next to the cheap checks instead of behind the compiler.

## The barrel nobody was watching

The same pass found `src/lib/bindings/index.ts` — the re-export barrel every
consumer imports through — **hand-maintained, with no generator and no gate**.
An added binding was silently missing from it; a removed one left a dangling
`export type … from "./Gone"` that breaks the type-checker. It is now emitted
by `scripts/generate-bindings-index.mjs`, registered as the `bindings-index`
codegen task, and verified byte-for-byte by `npm run check`. Generated
vocabularies acquire hand-written index files quietly, and an index of a
generated set is itself a derived artifact — it just does not look like one,
because a human wrote it.
