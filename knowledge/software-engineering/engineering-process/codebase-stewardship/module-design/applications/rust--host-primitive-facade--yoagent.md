---
layer: application
type: application
subject: module-design
technique: host-primitive-facade
stack: rust
status: forged
verified_on: 2026-10-02
verified_against: rust@1.86
---

# One crate for a threaded runtime and a single-threaded script host (Rust, agent library)

Stack version from the crate's `rust-version` field (`Cargo.toml:24 "rust-version"`);
commit `2428f68d` of a public agent library that runs on native hosts and as a
Cloudflare-Worker-style `wasm32-unknown-unknown` build. The CI file, the lint config
and the facade module were read at this commit; none of the jobs was executed here.

## The facade

All host-dependent primitives pass through one module, and its header says why:
`src/rt.rs:1 "Task and timer facilities that work on every target"`. Natively it
re-exports the runtime's own `sleep`, `timeout` and `Instant` untouched; on the
other host it uses the host's single-threaded executor and `setTimeout`. The
thread-safety bounds get the same treatment, as a blanket-implemented marker that
means "movable between threads" only where threads exist:
`src/rt.rs:23 "pub trait MaybeSend: Send {}"`, with an empty twin for the script
host. The contributor document states the rule and the async-trait attribute pair that
goes with it (`CLAUDE.md:181 "Tasks and timers via"`).

## The ban, scoped to the job that needs it

The raw calls are banned with a reason on each entry that names the replacement:
`.github/clippy-wasm32/clippy.toml:8 "std::time::Instant::now"` is listed as "panics on
wasm32; use web_time::Instant or yoagent::rt::Instant". The file is selected by an
environment variable in the portable job only, and its header gives the reason it
cannot be the default config: natively the facade's sleep *is* the runtime's sleep,
so the same paths are the correct calls there.

## The lint's limit, stated in the pipeline

The portable job does not stop at the lint. It also runs the suite under Node and
carries a 15-minute cap, with the comment that explains both:
`.github/workflows/ci.yml:89 "A broken timer or spawn shim hangs under Node rather than failing."`.
The runner for that suite is installed at the version the run resolved, read from the
dependency metadata, because the lockfile is not committed.

## What it cost and what it cannot do

- The facade is a second implementation of five primitives; the tree's guard against
  drift is the real-host suite, not a conformance proof.
- Native-only items (filesystem and shell tools, the stdio transport, the file-backed
  state store) sit behind a default feature, so the portable build compiles a smaller
  crate. The CI matrix builds the no-default-feature set natively as well, because the
  all-features jobs never compile the set a plain dependency declaration gets.
- The ban list is a hand-kept list of eight calls. A new raw runtime call that is not
  on it compiles, lints clean and fails only under the real host.
