---
layer: application
type: application
subject: agent-session-archive
technique: prefix-proof-retirement
stack: node
verified_on: 2026-10-15
applied: experiment
ab_verdict: better
---

# Pricing a mirror against "just keep the harness's files longer"

This registry's replay instruments read the agent harness's transcripts, and the harness
deletes each one 30 days after its last write. On 2026-10-15 the registry's
structure-only process cache remembered 3,705 sessions, and 1,773 of them (48%) no
longer had a transcript. The cheapest fix is a setting: raise the harness's retention.
That keeps every byte raw, with no budget and no dedupe. The technique's fix is a mirror
that stores content-addressed chunks, retires an older capture only when a newer capture
of the same source provably contains it, and pauses at a byte budget instead of evicting.
The decision between them is a storage decision, so it was measured as one.

## A and B

- **A:** raise the retention setting. Cost is the raw bytes of the newest version of each
  file, since the harness overwrites in place.
- **B:** `scripts/transcript-mirror.mjs` (branch `ab/transcript-mirror`, `0329f789`, merged
  `e3ad2550`; zero dependencies). `capture` splits each transcript into 4 MiB chunks,
  stores new chunks brotli-compressed under their sha256, and writes one capture record
  per file. `retire` drops an older capture only when the newer one's chunk list starts
  with it and a hash over the partial last chunk agrees. `verify` and `restore` rebuild
  files and check whole-file sha256. The archive defaults to a per-user location outside
  the harness's directory and outside any checkout, and the script refuses an archive
  inside a git work tree.

## Result (the same 7 days of transcripts, about 4.7 GB, two passes 21 minutes apart)

- **Target, bytes kept:** A 4,697,018,927; B **1,116,874,142** after pass 2 and retire,
  **23.8% of A**. Projected per year at this week's rate: A 245 GB, B 58 GB. With about
  130 GB free, A fills the disk in about six months.
- **Floor:** 5,007 of 5,007 retained captures verify, and 50 of 50 sampled restores are
  byte-exact against both the capture record and the live file's prefix. Zero tolerance,
  zero mismatches.
- **Retirement did what the technique says:** pass 2 skipped 4,985 unchanged files without
  reading them, captured 22, and stored 0.11% of a full re-copy. All 7 grown files were
  verified prefixes of their newer capture, so 7 older captures retired and 6 chunks were
  freed. Nothing was evicted by age.

## What the seam taught the technique

Chunking was argued for dedupe and paid for compression. Across the full window,
cross-file dedupe was **0.00%** at 256 KiB, 1 MiB and 4 MiB. Transcripts share no
content-addressed chunks with each other; they share only their own prefixes over time.
Smaller chunks bought nothing and cost compression: brotli reached a ratio of 3.25 at
256 KiB and 4.41 at 4 MiB, and gzip stayed near 2.9 at every size. The technique's
arithmetic now rests on the prefix, not on cross-file dedupe. Chunk size follows
compression and the cost of re-storing one partial chunk per recapture.

## What it cannot do yet

It is not wired. Nothing runs it on a session-end hook or a schedule, because that changes
the operator's harness configuration and is the operator's decision. Until it runs, the
48% loss continues. Rewrites over weeks, restoring after a real upstream deletion and the
budget pause on the live store are covered by unit tests only.
