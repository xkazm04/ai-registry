---
layer: application
type: application
subject: conformance-checking
technique: edition-stratified-conformance
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# A pinned suite, a feature-to-edition map, and a diff posted where the reviewer reads

`boa-dev/boa` at `665f03924a54e5162be227e7e909612e36f6e35a` is a JavaScript engine in
Rust; the workspace `Cargo.toml:30` pins `rust-version = "1.91.0"` (version 0.22.0
at `:29`), which is the witness for the stack version above. Its conformance
suite is the ECMAScript test262 repository, which it does not own and which
grows monthly, and the tree carries every move of the technique.

## The suite is pinned as an input with its own revision

`test262_config.toml:1` opens with `commit = "d86b2294..."`, and the same file
holds the ignored-feature list (`:3-40`), grouped by reason class in comments:
"Unimplemented features", "Pending proposals" (each with its proposal link).
The run's denominator is therefore a function of the engine's commit and the
suite's, and both are in the tree. Ignored entries are scope, as the
declared-deviation neighbour requires; the compare mode counts them
separately (`tests/tester/src/results.rs:203-207`).

## Stratification by minimum edition

`tests/tester/src/edition.rs:1-14` opens with the classifier: a `SpecEdition`
type and a static perfect-hash map `FEATURE_EDITION` from every feature name the
suite uses to the *minimum* edition that requires it, with the proposal link
beside each pending entry. A test's edition is the maximum over its features'
editions, and the runner takes `--edition` to cap what is run and `--versioned`
to print the per-edition table (`tests/tester/src/main.rs:153-159,396-463`).
The consequence the technique promises is visible in the changelog: a mapping
error for one edition was fixed as its own change ("correct edition mapping for
ES16", v0.22), which is the map-edit-is-a-rescoring rule made concrete.

## Finding sets, with crashes as their own class

`compare_results` (`tests/tester/src/results.rs:172-260`) subtracts totals,
passes, ignored, failed and *panics* separately, computes the percentage as a
display line, and then renders four named lists: fixed tests, broken tests, new
panics, fixed panics (`:303-360`), each collapsible in the markdown mode. A
panic - the engine failing to complete a test - is counted apart from a failed
test throughout, which is the crash rung the technique asks for.

## Posted beside the change, decided by a human

`.github/workflows/test262.yml:43-76` runs the suite on every pull request,
checks out a *separate* data repository holding the trunk baseline
(`refs/heads/main/latest.json`), runs `compare` with the markdown flag, and
writes the result into a comment body that a second workflow
(`test262_comment.yml`) posts on the pull request under a stable marker so it
updates in place. The baseline is refreshed on every push to main
(`test262_release.yml`; changelog v0.22 "Push test262 results on pushes to
main"). Nothing in the workflow fails the check on the percentage; the human
reviewer reads the lists. The benchmark comparison is a separate workflow that
runs only when a `run-benchmark` label is present (`pull_request.yml:16-18`),
which is the technique's separate-lane rule for the slower, noisier
measurement.

## What the realisation does not do

It does not block on a new panic mechanically; the technique allows that one
gate and this tree leaves it to the reviewer. It does not publish the
per-edition table in the pull-request comment, only in the local `--versioned`
run, so the stratified number is available to a developer and not to a reader
of the comment. And the feature-to-edition map is hand-maintained against a
suite whose feature names the engine's maintainers do not control - the
changelog fix above is the cost of that, paid once so far.
