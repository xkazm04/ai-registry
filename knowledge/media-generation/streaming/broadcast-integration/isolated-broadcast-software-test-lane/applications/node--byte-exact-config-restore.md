---
layer: application
type: application
subject: isolated-broadcast-software-test-lane
technique: byte-exact-config-restore
stack: node
status: forged
verified_on: 2026-11-03
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Byte-exact restore in a night lane that runs OBS beside the owner's (Node)

Castle Control (a desktop tool for Twitch streamers, `Spooky/CastleControl`,
read at 8ef2d8e on 2026-11-02 and re-read at d15a474 on 2026-11-03, the commit this
application's correction landed; Node `>=24.14.0` per `package.json:8`) has an unattended
"OBS lane": a Node script that launches a second OBS Studio on the owner's machine, runs a
Playwright spec against it, and must leave the owner's OBS configuration as it found it. It
does not use OBS's portable mode, so it shares `%APPDATA%/obs-studio` with the owner and
lives or dies by its restore. The same pattern, in looser form, is reused by the filming
tooling, which is the instructive contrast.

## What the night lane does

- **Restore set is the files OBS writes, not the files the test edits.**
  `scripts/night/obs.mjs:32 "const OWNED = ['global.ini', 'user.ini', path.join('plugin_config', 'obs-websocket', 'config.json')];"`.
  The lane edits none of the three. OBS writes the two ini files on exit, and obs-websocket
  re-serialises its `config.json` on every start. Until d15a474 the set was the two ini
  files alone, and the reason given was that OBS saves the launch-line websocket settings
  into `global.ini` (a comment in the untracked `film/lib/obs.mjs:4`, which no longer exists).
  That is not what the plugin does: see the measured section below.
- **Snapshot of raw bytes, verified, absence recorded.**
  `scripts/night/obs.mjs:80 "if (!fs.existsSync(source)) { files[name] = null; continue; }"`
  and `scripts/night/obs.mjs:84 "if (sha(path.join(BACKUP, name)) !== files[name]) throw new Error"`.
- **Manifest before the first shared write.** The manifest is written at
  `scripts/night/obs.mjs:208 "fs.writeFileSync(PENDING, JSON.stringify(manifest));"`, before
  `createTestProfile()` at `:214`, and updated with the child PID at `:219-220`.
- **Restore after OBS has exited.** The `finally` block closes OBS first
  (`scripts/night/obs.mjs:238 "await closeObs(child);"`, graceful then forced:
  `:159 "Graceful close first (WM_CLOSE), then force the tree within a bounded wait."`) and
  only then restores (`:240 "const failed = restore(manifest);"`).
- **Verify by hash; absent means delete.** `scripts/night/obs.mjs:95 "if (hash === null) { fs.rmSync(target, { force: true }); continue; }"`
  and `:97 "if (sha(target) !== hash) failed.push(name);"`; a mismatch fails the lane at
  `:241 "RESTORE FAILED for"`.
- **Backups are deleted because they are secrets.** `scripts/night/obs.mjs:244 "The backups may hold the owner's websocket settings: keep them only while needed."`
  The README says the same at `e2e/night/README.md:64 "deleted after a verified restore because they may hold the owner's websocket"`.
- **Only this run's crash markers are removed.** OBS 32 and later can leave a per-session
  sentinel under `.sentinel/` in the shared root; the lane lists them before (`scripts/night/obs.mjs:205 "const sentinelsBefore = new Set(sentinels());"`)
  and removes only the new ones (`:249 "for (const name of sentinels().filter((entry) => !sentinelsBefore.has(entry)))"`),
  so the owner's next launch does not offer safe mode for the lane's forced kill. On 32 and
  later this is a guard that never fires for this lane: a `--multi` instance gets a crash
  handler with no sentinel at all (OBS 33.0.1 `frontend/OBSApp.cpp`, `if (multi)` builds
  `CrashHandler()` without the launch UUID that `setupSentinel()` needs). Before 32 the
  marker was a single `obs-studio/safe_mode` file. `--disable-shutdown-check` suppressed its
  dialog then, and since 32.0.0 the argument parser no longer knows the flag. The guard
  stays right for any build or launch mode that does write one.

The sentinel handling was an upward lesson for the technique. The other lesson in the
first draft, that a launch-line password lands in the shared `global.ini`, was refuted on
2026-11-03 and corrected upward too.

## Measured on a real OBS (2026-11-03)

Source first, then a run. In obs-websocket, `Config::Save` writes the port only
`if (!PortOverridden)` and the password only `if (!PasswordOverridden)`. That holds at
every version read: the commit that added the launch-line overrides (c73f6608b, 2021-04-28),
5.0.0, 5.4.2, 5.5.0 and master. Since 5.5.0 the plugin keeps its settings in
`plugin_config/obs-websocket/config.json`, not in `global.ini`. `Config::Load` calls `Save()`
on any non-empty loaded config before it applies the overrides (6c9fd55c6, "Always write
config when migrating"). So every start rewrites the file with the owner's own values, pretty-printed with sorted
keys.

The run used OBS 33.0.1 with obs-websocket 5.7.6, as reported by `GetVersion`. It ran a
portable copy of the installed build in a scratch root. A harness mirrored this lane's
backup, launch flags and restore. Every run closed gracefully: OBS logged its shutdown and
exited 0. The owner's `%APPDATA%/obs-studio` kept the same file list and mtimes in every run.

| Seeded owner `config.json` | Restore set | Runs | Owner files with changed bytes after restore | `config.json` mtime |
|---|---|---|---|---|
| not canonical (compact, unsorted) | the two ini files (before d15a474) | 2 | 1 (`config.json`) in each run | moved |
| not canonical | plus `config.json` (d15a474) | 2 | 0 in both | kept |
| canonical (as the plugin writes it) | the two ini files | 1 | 0 | moved |
| canonical | plus `config.json` | 1 | 0 | kept |

The per-run password appeared in no file of the configuration root in any of the six runs,
or in three earlier graceful runs. On exit OBS wrote `global.ini`, `user.ini` and the
scene collection it had loaded, and rotated that collection's `.bak`. `plugin_manager/modules.json`
was rewritten with the same bytes on every start. Neither arm restores it, and its bytes never
differed, so the measurement cannot say what happens when the lane's plugin set differs from the owner's.
Applied as castle-control d15a474: `ab_verdict: better`, mode `experiment`, n=2 per arm on the case
that discriminates. Caveat: the harness re-implements the lane's restore. The lane script
itself was not run, because it hard-codes the owner's root.

## Deviations from the technique

- **The backups live inside the publishable output tree.** `scripts/night/obs.mjs:37 "const BACKUP = path.join(OUT, 'obs-backup');"`
  where `OUT` is `NIGHT_OUT`, the night runner's per-lane report directory
  (`scripts/night/run.mjs:92 "NIGHT_OUT: dir"`). On a verified restore they are deleted; on a
  failed one they are kept exactly there (`:241 "backups kept in ${BACKUP}"`), next to the
  reports - the one case the technique says must never ship them. The leak scan looks only
  for the per-run password, not for the owner's copy.
- **Restore under a survivor.** If OBS survives the forced kill the lane logs
  `scripts/night/obs.mjs:165 "'OBS did not exit after a forced kill'"` and restores anyway
  at `:240`; the survivor's exit write-back can then undo the restore after it was verified.
- **No atomic writes.** Manifest and restore both write in place
  (`:208` `fs.writeFileSync`, `:96 "fs.copyFileSync(path.join(manifest.backup, name), target);"`)
  rather than temp-file-and-rename.
- **Recovery does not check for an owner's edit since the crash.** The recovery path at
  `scripts/night/obs.mjs:191 "const failed = restore(manifest);"` overwrites whatever is on
  disk, so a setting the owner changed between the killed run and the next one is reverted.

## The filming variant, which drops most of it

The film files below were untracked: no commit holds them, and they are gone from disk as
of 2026-11-03. What follows is the 2026-11-02 reading and cannot be re-verified. The film harness (`film/lib/obs.mjs`) launches OBS with the same flags but keeps its backup
only in process memory (`film/lib/obs.mjs:40 "const backup = Object.fromEntries(OWNED.map"`),
writes it back without a hash check (`:54 "if (bytes) fs.writeFileSync(path.join(CONFIG, f), bytes);"`),
and restores even after a forced kill whose exit it never confirmed (`:52-54`). It has no
manifest, so a crashed filming session leaves whatever OBS wrote before the crash. That does
not include the film's launch-line websocket password, which the plugin never saves. The one-time setup script does get one rule right that the technique adopted:
it never snapshots over an existing backup
(`film/obs-setup.mjs:31 "!fs.existsSync(path.join(BACKUP, f))) fs.copyFileSync"`), so a
second setup run cannot replace the owner's original with the film's state - though its
`--restore` (`film/obs-setup.mjs:25`) copies back without verifying.
