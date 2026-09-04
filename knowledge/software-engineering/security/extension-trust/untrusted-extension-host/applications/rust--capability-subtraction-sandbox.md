---
layer: application
type: application
subject: untrusted-extension-host
technique: capability-subtraction-sandbox
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.96
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# Counted ceilings, and an uncounted list that is empty by construction

Two Rust trees were opened for this document, and they sit on opposite sides of
the technique's amended rule. The fleet project is a scraping and research
service that runs operator-supplied WebAssembly plugins in-process; its
`rust-toolchain.toml:6` pins `channel = "1.96.1"`, which is the witness for the
stack version above. The origin of the amendment is `boa-dev/boa` at
`665f03924a54e5162be227e7e909612e36f6e35a`, a JavaScript engine whose
`Cargo.toml:30` pins `rust-version = "1.91.0"`; it is cited here as the tree
that showed an interpreter enforcing every ceiling it counts.

## The engine: four counted ceilings, uncatchable by the guest

The engine exposes a `RuntimeLimits` value the embedder sets at construction
(`core/engine/src/vm/runtime_limits.rs:3-26`): recursion depth (default 512),
value-stack size (10,240 slots), loop iterations (unlimited unless set) and
backtrace depth (50). The loop counter is an explicit opcode the compiler
places at every back-edge; recursion is counted in frames *plus* host
re-entries, after an incident in which native accessor calls re-entered the
interpreter and overflowed the process stack before the frame count reached the
limit (changelog v0.22, "avoid stack overflow on recursive accessor calls").
Exceeding any limit raises an error the guest cannot catch: `docs/vm.md:270-274`
states that non-catchable errors "skip all handler logic and immediately unwind
everything", and the fuzzer relies on exactly that to make an infinite loop
terminate (`tests/fuzz/README.md:52-56`). What the engine does *not* count is
wall time inside a native built-in and memory a built-in allocates on the
guest's behalf; the loop counter was extended into one string built-in for that
reason (changelog v0.22), which is the uncounted list shrinking one entry at a
time.

## The plugin host: the same rule, with the uncounted list empty

The fleet project's host (`crates/engine-wasm/src/lib.rs`) gives every plugin
call a fresh store with a fuel budget - "a deterministic instruction ceiling - a
runaway plugin traps instead of hanging the host" (`:2-4`) - and a hard
linear-memory cap. The counted list is wider than memory alone: the store
limiter caps memories, tables, table elements and instances as well, because
"a module can otherwise exhaust host RAM at instantiation via huge tables,
sidestepping the memory cap entirely" (`:567-577`). A trap during the call
(`:848-853`) and a refusal at instantiation (`:590-596`) are both classed as the
sandbox stopping the guest, distinct from a host error, and the *direction* of
that stop is the host's to choose per hook class: a trapped trigger predicate
fails open unless the trigger asked for `skip`
(`crates/server/src/triggers.rs:190-195`), which is the neighbouring
per-callback rule and not this technique's concern.

The structural fact is the third rule of the amendment, instantiated: **the
plugins import nothing** (`:4-5`, "Plugins have no imports, so no ambient
authority"), so there is no host-provided call inside which wall time or
host-side allocation could escape the count. The uncounted list is empty by
construction, and the counted list is already published - the plugin listing
reports `fuel_budget` and `memory_bytes_cap` beside each plugin's last and
peak consumption (`:100-112`), on the stated reasoning that "18 million fuel
answers nothing on its own". Nobody wrote the two-list rule into this tree; it
fell out of a linker with no imports and a telemetry endpoint that refused to
print a number without its budget.

## The simulation

Three cases from the e2e suite that drives the real host
(`crates/server/src/e2e/trigger_plugins.rs`), walked under A (publish one word,
"sandboxed") and B (publish counted and uncounted lists): a fuel burn that traps
while the hop still fires (`:520`); a fuel burn under `on_error: skip` that stops
the hop without faking a veto (`:558`); a module refused at instantiation for its
declared memory (`:590-596` in the host). Every case ends the same way under both
arms, because B's second list is empty here and B's first list is already
printed. The verdict is therefore `unmeasurable` in this tree, and the instrument
that would make it measurable is named: **the count of imports in the linker,
currently zero.** The first host import - a fetch, a log line - makes the
uncounted list non-empty, and at that moment the telemetry must grow a second
list or the word "sandboxed" becomes the over-claim the amendment exists to
prevent.

## What neither realisation can do

Neither bounds the host's own work on the guest's behalf once an import exists;
the engine's changelog shows that list being paid down one built-in at a time,
and the plugin host has not yet had to start. Neither can stop a guest that is
spending its budget legitimately but slowly; a budget bounds instructions, and
the wall-clock bound is whatever the host puts around the call.
