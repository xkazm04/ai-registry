---
layer: application
type: application
subject: runtime-observation-evidence
technique: bounded-evidence-with-provenance
stack: process
status: forged
verified_on: 2026-10-16
---

# Summaries in git, raw outside, bound by hash: a perf evidence tree that stopped growing by the gigabyte

Source tree: `firetv-deathride` on branch `deathride/main` at `e6ef6752`, read 2026-10-16; paths are
relative to its root. The stack is `process`: what is realized is a repository rule for device-run evidence —
which observations a perf session commits beside its verdict, which it keeps outside the repository, how the
two are bound, and a test that holds the line — with a Kotlin guard test as its enforcement. It came out of the
10-06 optimize wave's repository-bloat card and the owner's ruling of 2026-10-07, and P22 (2026-10-16) is a run
that obeys it.

## The constraint and the ruling

Every device session had committed its raw traces, logcats and captures beside its summary:
`docs/concepts/DEATH-RIDE-DECISIONS-2026-10-07.md:10 "had grown to 994.2 MiB in 6,354 files, and every perf run added traces and captures to every clone."`
The owner's words were four: `docs/concepts/DEATH-RIDE-DECISIONS-2026-10-07.md:8 "Summaries in git, raw outside"`.
The rule as written is the technique's payload discipline at repository scale:
`docs/concepts/DEATH-RIDE-DECISIONS-2026-10-07.md:9 "Raw traces and full captures live outside git, bound by their hashes"`, with a
manifest that lists each committed file with its bytes and hash and binds the raw files kept outside. The rejected
alternatives are recorded with their reasons:
`docs/concepts/DEATH-RIDE-DECISIONS-2026-10-07.md:11 "Git LFS for new evidence and art sources (a second store and a server dependency for the same problem); rewriting history"`.

## The guard

A test, not a convention, holds the rule. It caps a committed evidence file,
`deathride/core/src/test/kotlin/dev/deathride/core/EvidenceRuleTest.kt:16 "const val MAX_BYTES=512L*1024"`, and refuses raw
kinds at any size,
`deathride/core/src/test/kotlin/dev/deathride/core/EvidenceRuleTest.kt:17 "private val refusedExtensions=setOf("`, logcats
included. History is left alone, but grandfathering is by content, not by name:
`deathride/core/src/test/kotlin/dev/deathride/core/EvidenceRuleTest.kt:29 "Grandfathered by blob, not path"`. That
correction came from a gap the first version had:
`docs/concepts/DEATH-RIDE-DECISIONS-2026-10-07.md:13 "grandfathering is now by blob, not by path, because a grandfathered file that grew in place was not caught"`.
It is the technique's fourth step applied to the guard itself: an exemption bound to a name stays valid after the
content it exempted has changed; bound to a content id, it lapses.

## A run under the rule

P22's summaries went into git and its raw files did not:
`docs/concepts/deathride/P22-soak.md:5 "binds the raw"` files by SHA-256. Its manifest records both sides,
`deathride/evidence/perf/p22/manifest.json:3 "559800"` bytes committed and
`deathride/evidence/perf/p22/manifest.json:162 "91653002"` bytes kept outside, about 0.56 MB against 91.7 MB.
Where a summary itself grew past the cap, the session cut rows from the committed copy and said which:
`docs/concepts/deathride/P22-soak.md:90 "the 1,053 slow-frame rows are left out for the 512 KiB rule"`. The derived figures in the
committed summary were computed over the full raw stream before the cut, which is the technique's second step.

## The figure the card closed with

The 10-07 ledger pass closed the card as built: 994.2 MiB in 6,354 files under the evidence tree at the ruling
commit, 996.2 MiB in 6,523 files at a later commit, the growth all post-ruling summaries under the cap. The rule
stopped the growth rather than shrinking the repository; history keeps the grandfathered files.

## Deviations

- **The raw store is one machine's directory.** The manifest names an absolute location on the operator's
  machine; a reader elsewhere can check a hash but cannot fetch the file. The technique's decision rule on absolute
  references applies, and no controlled reader serves the raw store.
- **A hash binds, it does not preserve.** Nothing in the repository stops the outside copy from being deleted; the
  manifest then proves what was lost rather than restoring it.
- **A rebuilt summary.** P22's collection summary was rebuilt from the compressed raw after the uncompressed copy had
  been removed, and the session says so; a summary rebuilt from raw is only as good as the raw's binding.
