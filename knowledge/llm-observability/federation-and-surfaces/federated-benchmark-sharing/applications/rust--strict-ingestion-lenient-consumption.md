---
layer: application
type: application
subject: federated-benchmark-sharing
technique: strict-ingestion-lenient-consumption
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.85
---

# `exit 1` at the gate, `cargo:warning` at the build

`AlexsJones/llmfit` at `d19380bac5d82c5cd3080ff1afef6d1dc20615bf` has the
asymmetry the technique describes as two files with opposite failure policies
over the same data, and the comment in the second one names the reason.

**At ingestion, strict.** `scripts/validate_community_benchmarks.py` runs on
every proposal touching the community directory
(`.github/workflows/community-benchmarks.yml`) and its contract is
*"Exit code 0 when every file passes; 1 with one line per problem otherwise."*
Path conventions, a size cap, schema conformance against `schema.json`, and the
cross-field arithmetic the schema cannot express — tps ordering, hardware bounds,
timestamp floor and ceiling. A bad submission does not merge.

**At consumption, lenient.** `llmfit-core/build.rs` aggregates the merged
directory into the compiled binary. When a file fails to parse there
(`build.rs:50-58`):

```rust
match serde_json::from_str::<serde_json::Value>(&text) {
    Ok(v) => payloads.push(v),
    // CI validates submissions on PR; a bad file here should never
    // happen, but a warning beats breaking every build.
    Err(e) => println!(
        "cargo:warning=community submission invalid JSON, skipped: {}: {e}",
        f.display()
    ),
}
```

Skip, warn by file and reason, continue. The unreadable-file case above it
(`build.rs:46-49`) does the same. The comment is the technique's argument in one
line: the gate is upstream, and a failure here would break the build for every
user who did not submit the file.

## Who pays, made concrete

The parties are exactly the ones the standard names. At the gate, the contributor
is present and can read `submittedAtUnix ... predates the share feature`
(`validate_community_benchmarks.py:98`) and fix it. At the build, the contributor
merged weeks ago; the people who would pay for a hard failure are everyone
compiling the tool, including maintainers of unrelated features and anyone
installing from source.

## Validate the whole store, not the change — with the return condition written

The workflow validates the entire directory rather than the changed files, and
says why in a comment (`community-benchmarks.yml`):

> Validates the whole directory, not just changed files: repo-wide integrity is
> the invariant, and the directory stays small.

Both halves of the standard's rule are present: the invariant is the store's
validity rather than the diff's, and the decision carries its own expiry — *the
directory stays small* is the return condition, recorded where the next person
to notice a slow CI job will find it. The store is currently 33 hardware slugs.

## The gap: nobody counts the skips

The standard's operator obligation is **a count of entries skipped at
consumption, in the build output, where zero is the expected value**. This tree
emits one warning per skipped file and totals nothing. `cargo:warning` lines are
easy to miss in a normal build and are invisible in a release pipeline nobody
reads interactively, so the signal that would identify a gate defect — an entry
that passed ingestion and failed consumption — exists but is not surfaced as a
number anyone would notice.

The realization is otherwise a clean instance, and the missing counter is the
cheapest possible addition: the aggregation loop already knows how many files it
walked and how many it pushed.
