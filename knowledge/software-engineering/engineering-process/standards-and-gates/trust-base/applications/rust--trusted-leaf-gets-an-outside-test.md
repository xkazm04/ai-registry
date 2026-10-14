---
layer: application
type: application
subject: trust-base
technique: trusted-leaf-gets-an-outside-test
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.88
---

# One trusted axiom has a property test, its two siblings do not, in a requirements-traceability tool

Witness: the `duvet-coverage` package of the duvet tree at commit
`44f43e87683ae6077c64f4aa8fd519910c981fb6`, `rust-version = "1.88"` and edition 2021
in its manifest, with the proofs built by a date-pinned Verus release named in CI.
Anchors were resolved against the read-only clone on the date above. The clone is a
working copy that already differs from the pinned commit in `duvet-core` (see the
marker application); the files cited here are untouched by that difference.

The coverage model proves that a requirement annotation counts as executed only
when the line it targets was hit or lies in a scope reached from a hit line.
"Hit" is defined by a single function the prover is told not to read.

## The leaf and what it carries

`collect_hit_lines` is marked as an unchecked body in
`duvet-coverage/src/execution_propagation.rs:42 "TRUST BASE (unverified leaf)"`, and
the comment states why it is the one that matters:
`duvet-coverage/src/execution_propagation.rs:48 "This is the one `external_body` whose correctness actually drives the"`
result. Its `ensures` is a two-way implication with `CoverageStatus::Hit`, and the
comment names the failure the technique exists for: a body that filtered on `Miss`
or was off by one "would keep every proof green while silently changing what the
model treats as executed".

## The outside test

`duvet-coverage/src/execution_propagation.rs:784 "fn collect_hit_lines_matches_hit_oracle()"`
runs the real body over randomised input from the property-testing harness
(`duvet-coverage/src/execution_propagation.rs:786 "bolero::check!()"`) and asserts the
contract's two clauses separately, with failure messages that name the direction:
`duvet-coverage/src/execution_propagation.rs:817 "forward iff violated"` and
`duvet-coverage/src/execution_propagation.rs:826 "backward iff violated"`. The
whole-result comparison comes third, as the technique orders it:
`duvet-coverage/src/execution_propagation.rs:830 "assert_eq!(got, expected)"`.

The comment above the test says why the proof cannot do this job:
`duvet-coverage/src/execution_propagation.rs:764 "Verification alone"` cannot catch
the drift, "because the drift is *in the axiom itself*". The test sits in the
ordinary test run; the verifier never executes it.

Traceability is tied to the requirement the axiom grounds. The test carries
`duvet-coverage/src/execution_propagation.rs:781 "type=test"` under
`duvet-coverage/src/execution_propagation.rs:780 "property-9-execution-set-containment"`,
the same requirement the implementation citation names at
`duvet-coverage/src/execution_propagation.rs:75 "property-9-execution-set-containment"`.
Deleting the test would show up as a lost test citation in the tool's own report.

## What the oracle is, and where it sits on the independence scale

The oracle is a filter over the same map the body walks:
`duvet-coverage/src/execution_propagation.rs:806 ".filter(|(_, &status)| status == CoverageStatus::Hit)"`.
It shares no code with the body, and the generator produces `(line, is_hit)` pairs
that the test folds into a map itself, with a comment that a later pair for a key
wins. That is the "same data, different code" level of the technique. It is not the
floor of deriving the expectation from the input list, so the map's last-wins
behaviour is a semantics both sides share through the test's own setup. The shared
part is small and named in a comment; a separate concrete example of that behaviour
would close it.

## Deviation: the other two trusted leaves have no such witness

The package has three unchecked leaves. `vec_from_btreeset`
(`duvet-coverage/src/execution_propagation.rs:33 "#[verifier::external_body]"`) has no
property test, and neither does `coverage_status_at`
(`duvet-coverage/src/degraded.rs:89 "#[verifier::external_body]"`); a search of the
package for their names finds the definitions and the call sites only
(`duvet-coverage/src/degraded.rs:183 "coverage_status_at(coverage, t.line_number)"`,
`duvet-coverage/src/execution_propagation.rs:186 "vec_from_btreeset(&directly_executed)"`).
The leaf at `duvet-coverage/src/degraded.rs:81 "TRUST BASE (unverified leaf)"` ends with
the same warning about a wrong key or a dropped `copied`, which is the failure the
test on its sibling guards against. The standard stays: every trusted body with an
executable form gets the outside test. For `vec_from_btreeset` the contract is
membership-only and the test is cheap; for `coverage_status_at` the contract is a
total read and the oracle is the map's own lookup, which sits at the floor.
