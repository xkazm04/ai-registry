---
layer: application
type: application
subject: agent-session-archive
technique: prefix-proof-retirement
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Rust: raw-mirror retention in coding_agent_session_search

The tree is coding_agent_session_search (cass) 0.10.0 at commit 7fc01958d367;
the version witness is the toolchain pin `nightly-2026-08-31` in
`rust-toolchain.toml`, stated in dotted form because the tree names no stable
release. Mechanisms are restated; the anchor quotes are the only verbatim text.

## Confirmed: automatic retirement only by verified prefix

The retention module opens by stating its own scope, narrower than the
operator's prune command:
`src/raw_mirror/retention.rs:2 "only a checksum-verified prefix of a retained same-source"`.
The operator documentation spells out the same-source identity the technique
requires, provider, source id, origin kind, origin host and original path, and
the byte-level containment test:
`docs/raw-mirror-retention.md:56 "origin host and original-path identity preserves every one of"`.
It also states that the proof needs only the two captures, so it holds after
the harness has deleted the file:
`docs/raw-mirror-retention.md:60 "This also works when the original upstream file is gone."`
What is not proof is listed as such, and those copies stay:
`docs/raw-mirror-retention.md:62 "A truncation, rewrite or origin mismatch is not proof"`.

The selection code never picks what it does not recognise. Orphans, abandoned
staging files, nonstandard evidence records and divergent versions are
excluded from automatic selection by construction:
`src/raw_mirror/retention.rs:225 "are NEVER automatically selected"`.

The protections that do not depend on the proof are configuration with
defaults: at least two snapshots kept per exact source identity,
`docs/raw-mirror-retention.md:20 "Minimum snapshots kept per exact source identity"`,
and a six-hour hold-down on young captures,
`docs/raw-mirror-retention.md:21 "Younger snapshots are never automatically retired."`

## Confirmed: the budget bounds admission

The byte cap is documented as a bound on new captures only, with capture
pausing when protected data keeps the store above it:
`docs/raw-mirror-retention.md:80 "not permission to destroy pinned"`.

## Upward lesson: chunk the population, not the outliers

The capture codec went through two steps, and the second is the lesson the
technique's arithmetic section carries. The first replaced whole-file copies
with 4 MiB content-addressed chunks, but only for sources of 8 MiB and above:
`CHANGELOG.md:1688 "Replaced full-copy raw-mirror snapshots for sources at least 8 MiB"`.
Recaptures of smaller transcripts kept amplifying, because the whole-file path
below the threshold was untouched:
`src/raw_mirror.rs:56 "is the whole-file path below 8 MiB"`. The second step
applied 256 KiB chunks to append-oriented transcript formats, which bounds the
duplicated tail of each recapture to one small chunk:
`src/raw_mirror.rs:59 "duplicate tail to less than 256 KiB"`. On the
installation measured for the golden path the mean transcript is about one
megabyte, entirely under the first step's threshold.

## Tension: the default cap against a real archive

The default admission cap is 8 GiB,
`docs/raw-mirror-retention.md:18 "(8 GiB)"`, while the project's own audit
measured the owner's mirror at 12 GB:
`docs/planning/REALITY_CHECK_AND_BRIDGE_PLAN_2026-09-01.md:1689 "12 GB raw-mirror"`.
Under defaults, capture on that archive pauses unless prefix retirement
reclaims about 4 GB, and retirement cannot reclaim rewritten histories. The
technique's rule applies directly: a pause is only safe while it is loud,
because the harness keeps deleting during it. Whether cass surfaces the pause
prominently enough was not established in this read.

## Deviation: the coverage claim is disputed in the same tree

The retention document lists regression coverage for append-heavy captures,
cap admission and disk-pressure resumption:
`docs/raw-mirror-retention.md:105 "covers append-heavy captures, concurrent cap"`.
The project's own reality-check plan records that the store's capture tests
ran through a test-only path that bypasses the budget, and queues the fix:
`docs/planning/REALITY_CHECK_AND_BRIDGE_PLAN_2026-09-01.md:112 "off the dead"`.
Read the retention guarantee as designed and documented, with its budget path
not yet proven by the tests that claim it. No test was run for this document.
