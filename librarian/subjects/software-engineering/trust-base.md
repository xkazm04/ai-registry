# trust-base

Founded 2026-10-14 by intake run duvet-1014 from one verified-core repository (n=1) plus
a compile experiment and a fleet audit. Home: engineering-process/standards-and-gates.
Boundaries held: proof cost (test-input-generation), runtime invariant placement,
gates and waivers, dependency policy, test-harness structure. Review again when a
second independent source (another verifier or an unsafe-heavy codebase) reaches the
same rules; until then every technique rests on one tree read plus training convergence.
Resolved 2026-10-14 (/deepen n136): a lint can enforce a comment on unsafe trait impls (clippy undocumented_unsafe_blocks visits them); the original claim "block form only" was a phantom, corrected in the golden path and soundness technique.
Deepen pass 1 (2026-10-14): L1 synthesis + one L2 source read (linter source). Yield: 1 correction. No new technique - single convergence only. Banked: Rust 2024 edition widened the spelled base (unsafe attributes required, unsafe extern, unsafe_op_in_unsafe_fn warn default - last unverified at primary) ; return when a second verifier/unsafe-heavy tree is read. Saturation: dry=0, L2 not reached for verifier-side claims (external_body semantics, Kani stubbing).
Impact: see registry-map stale queue after regeneration.
2026-10-14 (intake icm-1014, while vox held the subject): a second unsafe-using tree read against `soundness-argument-names-its-dependencies` - application `rust--soundness-argument-names-its-dependencies--icm` (three per-module test mutexes standing in for one environment lock; a transmute under a lint allowance). Not a verifier, so it does not discharge the review condition above for the verifier-side techniques.
