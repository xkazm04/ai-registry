---
layer: application
type: application
subject: isolated-broadcast-software-test-lane
technique: byte-exact-config-restore
stack: node
status: forged
verified_on: 2026-11-02
verified_against: node@24
---

# Byte-exact restore in a night lane that runs OBS beside the owner's (Node)

Castle Control (a desktop tool for Twitch streamers, `C:\Users\kazda\Spooky\CastleControl`,
main checkout, read 2026-11-02; Node `>=24.14.0` per `package.json:8`) has an unattended
"OBS lane": a Node script that launches a second OBS Studio on the owner's machine, runs a
Playwright spec against it, and must leave the owner's OBS configuration as it found it. It
does not use OBS's portable mode, so it shares `%APPDATA%/obs-studio` with the owner and
lives or dies by its restore. The same pattern, in looser form, is reused by the filming
tooling, which is the instructive contrast.

## What the night lane does

- **Restore set is the files OBS writes, not the files the test edits.**
  `scripts/night/obs.mjs:29 "const OWNED = ['global.ini', 'user.ini'];"`. The lane never
  edits either file; OBS persists the websocket settings given on its launch line into them
  on exit - stated in `film/lib/obs.mjs:4 "(obs-studio writes websocket settings there)"`.
- **Snapshot of raw bytes, verified, absence recorded.**
  `scripts/night/obs.mjs:77 "if (!fs.existsSync(source)) { files[name] = null; continue; }"`
  and `scripts/night/obs.mjs:80 "if (sha(path.join(BACKUP, name)) !== files[name]) throw new Error"`.
- **Manifest before the first shared write.** The manifest is written at
  `scripts/night/obs.mjs:204 "fs.writeFileSync(PENDING, JSON.stringify(manifest));"`, before
  `createTestProfile()` at `:210`, and updated with the child PID at `:215-216`.
- **Restore after OBS has exited.** The `finally` block closes OBS first
  (`scripts/night/obs.mjs:234 "await closeObs(child);"`, graceful then forced:
  `:155 "Graceful close first (WM_CLOSE), then force the tree within a bounded wait."`) and
  only then restores (`:236 "const failed = restore(manifest);"`).
- **Verify by hash; absent means delete.** `scripts/night/obs.mjs:91 "if (hash === null) { fs.rmSync(target, { force: true }); continue; }"`
  and `:93 "if (sha(target) !== hash) failed.push(name);"`; a mismatch fails the lane at
  `:237 "RESTORE FAILED for"`.
- **Backups are deleted because they are secrets.** `scripts/night/obs.mjs:240 "The backups may hold the owner's websocket settings: keep them only while needed."`
  The README says the same at `e2e/night/README.md:61 "deleted after a verified restore because they may hold the owner's websocket"`.
- **Only this run's crash markers are removed.** OBS drops a per-session sentinel in the
  shared root; the lane lists them before (`scripts/night/obs.mjs:201 "const sentinelsBefore = new Set(sentinels());"`)
  and removes only the new ones (`:245 "for (const name of sentinels().filter((entry) => !sentinelsBefore.has(entry)))"`),
  so the owner's next launch does not offer safe mode for the lane's forced kill.

This sentinel handling, and the observation that a launch-line password lands in the
shared `global.ini`, were upward lessons for the technique: neither was in the expert draft.

## Deviations from the technique

- **The backups live inside the publishable output tree.** `scripts/night/obs.mjs:34 "const BACKUP = path.join(OUT, 'obs-backup');"`
  where `OUT` is `NIGHT_OUT`, the night runner's per-lane report directory
  (`scripts/night/run.mjs:92 "NIGHT_OUT: dir"`). On a verified restore they are deleted; on a
  failed one they are kept exactly there (`:237 "backups kept in ${BACKUP}"`), next to the
  reports - the one case the technique says must never ship them. The leak scan looks only
  for the per-run password, not for the owner's copy.
- **Restore under a survivor.** If OBS survives the forced kill the lane logs
  `scripts/night/obs.mjs:161 "'OBS did not exit after a forced kill'"` and restores anyway
  at `:236`; the survivor's exit write-back can then undo the restore after it was verified.
- **No atomic writes.** Manifest and restore both write in place
  (`:204` `fs.writeFileSync`, `:92 "fs.copyFileSync(path.join(manifest.backup, name), target);"`)
  rather than temp-file-and-rename.
- **Recovery does not check for an owner's edit since the crash.** The recovery path at
  `scripts/night/obs.mjs:187 "const failed = restore(manifest);"` overwrites whatever is on
  disk, so a setting the owner changed between the killed run and the next one is reverted.

## The filming variant, which drops most of it

The film harness (`film/lib/obs.mjs`) launches OBS with the same flags but keeps its backup
only in process memory (`film/lib/obs.mjs:40 "const backup = Object.fromEntries(OWNED.map"`),
writes it back without a hash check (`:54 "if (bytes) fs.writeFileSync(path.join(CONFIG, f), bytes);"`),
and restores even after a forced kill whose exit it never confirmed (`:52-54`). It has no
manifest, so a crashed filming session leaves the film's websocket password in the owner's
`global.ini`. The one-time setup script does get one rule right that the technique adopted:
it never snapshots over an existing backup
(`film/obs-setup.mjs:31 "!fs.existsSync(path.join(BACKUP, f))) fs.copyFileSync"`), so a
second setup run cannot replace the owner's original with the film's state - though its
`--restore` (`film/obs-setup.mjs:25`) copies back without verifying.
