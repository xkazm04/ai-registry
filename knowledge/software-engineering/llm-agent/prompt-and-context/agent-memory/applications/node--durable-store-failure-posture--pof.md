---
layer: application
type: application
subject: agent-memory
technique: durable-store-failure-posture
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A prune that read, edited and overwrote a file other sessions append to (Node script)

The version witness is the tree's Node type declarations (`@types/node ^24`), as for the
dispatcher above. The file is a shared notes file that every agent session in the project
appends to, and a script that keeps it under a line cap by dropping the oldest delivered
entries. It is the long-window boundary the technique now names, in its smallest form: no
model, no copy of a store, just a read, a filter and a write with a gap between them.

## The defect

The script read the file, computed the lines to keep, and wrote the result back over the
file. Any line another session appended between the read and the write ceased to exist,
with no error and no corruption: the file after the prune was well formed and shorter than
it should have been. Every failure posture the technique lists is satisfied throughout.

## The paired proof

The real script was run with a preload that appends a line at a chosen point after the
script's read:

| Scenario | Appends injected | Lines lost, before | Lines lost, after |
| --- | --- | --- | --- |
| append in the window | 1 | 1 | 0 |
| append in the window and another during the retry | 2 | 2 | 0 |
| append in the window, file already under the cap | 1 | 1 | 0 |

**Floor:** with no concurrent writer the output file, standard output and exit code were
byte-identical before and after the fix, for an over-cap file, an under-cap file and a
file with no trailing newline, and no temporary file was left behind.

## The fix and its remaining window

The prune now writes to a temporary file beside the original, re-reads the original, and
renames the temporary over it only if the original is unchanged
(`scripts/fleet-memory-cap.mjs:37 "writeFileSync(tmp, kept.join('\n'));"`,
then `scripts/fleet-memory-cap.mjs:39 "renameSync(tmp, FILE);"`). On a mismatch it discards
the temporary file and prunes the fresh text, up to five attempts, then exits non-zero
without writing (`scripts/fleet-memory-cap.mjs:44 "kept changing under the prune (5 attempts); nothing written. Re-run."`).

That is the technique's rule applied at the swap: the version is recorded when the input is
read and compared when the output is published. **A window remains** between the re-read
and the rename, and only a lock would close it; the script's authors accepted a much
narrower window over a lock, which is the honest trade for a tool that runs a few times a
week. The rename also means a concurrent reader never sees a torn file.

Not run: the prune against the project's real notes file, which was over its cap at the
time (289 lines against 200). Running it would have changed a live shared file; the check
mode of the script gave identical output before and after.
