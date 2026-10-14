---
layer: application
type: application
subject: trust-base
technique: verifier-footprint-stays-contained
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.88
---

# One proc-macro in the published graph, exact pins with their cost written down, in a requirements-traceability tool

Witness: the `duvet-coverage` and `duvet` packages of the duvet tree at commit
`44f43e87683ae6077c64f4aa8fd519910c981fb6` (`rust-version = "1.88"`, edition 2021 in
every workspace manifest), with the proofs built by the Verus release named in CI.
Anchors resolved against the read-only clone on the date above.

## Package graph: the smallest mandatory piece

`duvet-coverage/Cargo.toml` splits its verification dependencies by whether a plain
build needs them. `verus_builtin_macros` is mandatory because the `verus!` macro
performs ghost erasure; the manifest says it is a proc-macro, "compiled at build time,
never linked into a consumer's binary". `verus_builtin` and `vstd` are optional,
`duvet-coverage/Cargo.toml:38 "vstd = { version = "`,
reachable only through
`duvet-coverage/Cargo.toml:16 "verify = ["`, whose
comment says a plain build erases all of them and "nothing verus-shaped reaches the
published artifact". The umbrella package forwards the one switch:
`duvet/Cargo.toml:19 "duvet-coverage/verify"`.

## Exact pins named as published constraints

The pins are exact requirements on dated pre-releases:
`duvet-coverage/Cargo.toml:36 "verus_builtin_macros = "`. The manifest carries the cost in
a comment, as the technique asks:
`duvet-coverage/Cargo.toml:31 "These pins are published constraints"` explains that an
exact requirement on a pre-release cannot be unified with any other requirement in a
consumer's tree and that an upstream yank would make every release pinning it
unbuildable from a fresh registry. The closing rule is
`duvet-coverage/Cargo.toml:35 "keep the rest behind `verify`"`. The reason for pinning at
all is given too: the lockfile is ignored (`.gitignore:3 "Cargo.lock"`), so a floating
requirement would let CI resolve libraries newer than the installed verifier. The pin
meets the technique's three conditions: one build-time macro, an external versioned
release it must match, and no committed lockfile.

## One value for the version, mostly

CI states the verifier version once,
`.github/workflows/ci.yml:145 "VERUS_VERSION: "`, uses it for
the download URL, and reads the toolchain the verifier requires from the verifier's own
output instead of duplicating it:
`.github/workflows/ci.yml:178 "ver_out=$(verus --version 2>&1 || true)"`. The manifest
comment tells the maintainer the pins must match the release verified against, naming
the CI variable.

Deviation: the manifest repeats the value in a second spelling, and the three pins do
not carry the same date (`verus_builtin` is
`duvet-coverage/Cargo.toml:37 "verus_builtin = { version = "`,
the other two `2026-05-24`). The comment names the CI variable as the thing to match,
but I found no script in the tree comparing the pins to the variable, so the "one
value" holds in CI and by comment in the manifest. The differing builtin date may be a
legitimate lockstep release; I did not check it against the upstream release list.

## Source tree: the verified subset in its own package

`design/query/coverage-model-decisions.md:734 "Decision 12: Separate"` records a separate
package, and the reason is leakage, not importance: the verifier's subset constraints
(no shared-ownership pointers, no async, no I/O, no trait objects) would leak into the
rest of the tool. The chosen package holds plain data, and the decision names the
adapter that bridges to the host's richer types, which lives in
`duvet/src/query/checks/coverage.rs:17 "use duvet_coverage::{"`. The dependency runs one
way, from the host to the verified package:
`duvet/Cargo.toml:24 "duvet-coverage = { version = "`.

The collection choice is recorded as its own decision,
`design/query/coverage-model-decisions.md:655 "Decision 10: BTreeMap/BTreeSet for coverage model collections"`,
with the reason that hash-based collections have nondeterministic iteration and make
proofs harder, and the trigger sized in the text: per-file data of hundreds to low
thousands of lines.
