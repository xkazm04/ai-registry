---
layer: application
type: application
subject: native-guest-interop
technique: class-from-impl-with-borrow-warning
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1.96
applied: simulation
ab_verdict: not-better
---

# Class from impl with borrow warning, in a component-model host

Verified against a Rust workspace whose `rust-toolchain.toml` pins channel
1.96.1 (the toolchain witness) at commit `31714bf`, with `Cargo.lock` resolving
`wasmtime` to 49.0.4. The host is the dynamic-app embedding in
`crates/engine-wasm/src/app_host.rs`; the guest contract is
`crates/engine-wasm/wit/pumper-app.wit`. The engine's own source was read from
the registry copy of `wasmtime-49.0.4` that the lockfile names.

## What the derivation is here

`wasmtime::component::bindgen!` (`app_host.rs:59`) is this technique's
derivation: the host writes `impl Host for AppStore` (`app_host.rs:275`) and the
macro generates the guest-callable import for each method. Every generated
import receives `&mut self` — `restore` and `log`, which only read, included.
The technique calls exactly that choice ("takes the exclusive borrow for both
receiver kinds") the one that makes every method a hazard against every other.

## A and B

- **A** — the tree as it stands: seven imports, each with an exclusive
  compile-time receiver on the per-run store, JSON text across the boundary.
- **B** — the technique applied: shared receivers for the read-only imports,
  the borrow hazard written into the derivation's documentation, a failed
  re-borrow converted into a typed guest error.
- **Target**: the number of re-entrant borrow hazards guest input can reach.
  **Floor**: the guest-visible behaviour of the seven imports, unchanged.

The seam was chosen to falsify: a host that already takes the exclusive
receiver everywhere is where the technique predicts the hazard is worst.

## Three cases walked

1. **`restore` while another import is live.** The prediction under the
   technique: an exclusive receiver on a read makes it collide with its
   siblings. In the tree it cannot collide: imports on one store run on one
   suspended guest fiber in sequence, and the WIT declares no function-typed
   parameter and no `resource`, so no import holds anything it could call back
   through. A = 0 reachable hazards, B = 0. Falsifier: any import that accepts
   a guest-callable value; there is none (`pumper-app.wit:21` to `:55`).
2. **`fetch` holding the store across an await.** `app_host.rs:289` awaits the
   network with `&mut self` borrowed. Under the fiber model this is sound for
   the same reason as case 1. It would stop being sound under the engine's
   concurrent import model, and the engine already answers that the way the
   technique's first decision rule asks: `Accessor::with`
   (`wasmtime-49.0.4/src/runtime/component/concurrent.rs:464`) hands a closure
   temporary access whose return value "is not allowed to capture borrows";
   data needed past it "must be `clone`d out". The same function panics on a
   nested `with`, and only host code can nest it.
3. **A guest re-entering the instance.** The engine checks `may_enter()` and
   returns `Trap::CannotEnterComponent` as an `Err`
   (`wasmtime-49.0.4/src/runtime/component/func.rs:471`), so the refusal is a
   value the host reads, never an abort — the fallible door the technique
   wants, already built.

## Verdict: not-better

The target cannot move, because A already reaches zero, and the floor holds
trivially. B changes nothing this host can measure, because the premise the
technique rests on — host payload in a cell the guest can alias — does not
hold: the host state is owned by the store, not the guest heap. That
condition is now an amendment on the technique, together with the
discriminator the engine source supplied: a re-borrow only host code can
trigger may panic, one guest input can trigger may not.

## What the tree shows that it was not built to show

The three-way inconsistency in how a malformed payload is refused is the
typed-wrapper half of the technique, and it is real. `upsert_many` builds its
typed batch once at the boundary and names the bad entry on the catchable
`err` arm (`parse_upsert_items`, `app_host.rs:225`). `checkpoint` tells the
guest `false`. `progress` (`app_host.rs:382`) drops an unparseable snapshot
and tells nobody: not the guest, because the WIT gives it a unit return, and
not the operator, because there is no log. Correcting it on the guest side
is a WIT MAJOR, so it is filed beside the major already pending from the
async-native application rather than shipped.

## What this realization cannot do

It cannot exercise the concurrent model or a resource-carrying import; both
are read from the engine source, not run. The day the WIT grows either, this
row's verdict is void and the technique applies in full.
