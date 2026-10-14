---
layer: application
type: application
subject: agent-memory
technique: durable-store-failure-posture
stack: node
status: forged
verified_on: 2026-10-14
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

The prune writes to a temporary file beside the original, re-reads the original, and
renames the temporary over it only if the original is still what the check expects
(`scripts/fleet-memory-cap.mjs:73 "writeFileSync(tmp, kept);"`, then
`scripts/fleet-memory-cap.mjs:75 "renameSync(tmp, FILE);"`). On a mismatch it discards
the temporary file and prunes the fresh text, up to five attempts, then exits non-zero
without writing (`scripts/fleet-memory-cap.mjs:83 "kept changing under the prune (5 attempts); nothing written. Re-run."`).

That is the technique's rule applied at the swap: the version is recorded when the input is
read and compared when the output is published. **A window remains** between the re-read
and the rename, and only a lock would close it; the script's authors accepted a much
narrower window over a lock, which is the honest trade for a tool that runs a few times a
week. The rename also means a concurrent reader never sees a torn file.

## Second pass: compare what was read, not the whole file (2026-10-14)

The first fix compared the whole file, so any append landing while an attempt was planning
forced a re-plan, and a file busy enough to append during every attempt gave up after five.
The plan only ever removes lines it read, and the file is append-only, newest last. The check
now asks whether the file still **begins with** the text the plan was read from
(`scripts/fleet-memory-cap.mjs:64 "if (!now.startsWith(text)) continue;"`); the appended tail
is carried over and planned once more in memory, in case it pushed the count back over the cap
(`scripts/fleet-memory-cap.mjs:67 "const again = planFleetMemoryPrune(kept, CAP);"`), and the
whole-file comparison moves to the narrow confirm before the rename
(`scripts/fleet-memory-cap.mjs:74 "if (readFileSync(FILE, 'utf8') === now) {"`). Only an edit
to the read text, or a concurrent prune, re-plans. Commit `64a5452e` on the project's main
branch, not pushed.

The seam was **chosen to falsify**: it already carried the store-wide check this technique
prescribed, and its read-to-publish window is milliseconds, so the read-set rule could have
added nothing. The paired harness ran the shipped script and the changed one against one
fixture (205 entries, cap 200) with writers injected into the real file I/O:

| Scenario | A (whole file) | B (read set) |
| --- | --- | --- |
| no concurrent writer | 1 attempt | 1 attempt, byte-identical file, archive and output |
| one append while the first attempt plans | 2 attempts, 0 lost | 1 attempt, 0 lost, same end state |
| an append while every attempt plans | gave up, exit 2, nothing written | 1 attempt, 0 lost |
| an append at every temporary write | gave up, exit 2 | gave up, exit 2 |
| a read line edited in place while planning | re-planned, edit kept | re-planned, edit kept |

**Floor:** no line lost in any scenario, and identical output with no concurrent writer. What
the harness also showed is the limit the technique now states: the change removes the window
spent planning, not the instant between the confirm and the rename (row four refused alike),
and in this script planning takes milliseconds, so the real-world gain is small. The rule pays
where the read is held across a model call.

Not run: the prune against the project's real notes file, which was over its cap at the
time (289 lines against 200). Running it would have changed a live shared file; the check
mode of the script gave identical output before and after.
