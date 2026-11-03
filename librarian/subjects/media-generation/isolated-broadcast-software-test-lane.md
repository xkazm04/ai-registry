---
subject: isolated-broadcast-software-test-lane
domain: media-generation
last_touched: 2026-11-03
dry_streak: 0
---

# isolated-broadcast-software-test-lane

First note. The subject was harvested on 2026-11-02 (326b3b04e) from one Castle Control
tree. A Curator dispatch ranked it on "single stack (node)".

## State

6 techniques, 3 applications: 2 `node` and 1 `rust`, all against Castle Control
(d15a474). The stack finding is answered from the same tree. The Node lane launches OBS,
and the program it tests is a Rust build of the product core, which carries its own guard
against the owner's instance. No other fleet project launches broadcasting software for tests.

## 2026-11-03 - deepen (ibstl-deepen-1103)

Landed in aca2868dc. Lanes:
- Counter-evidence against the subject's software-behaviour claims, read from obs-websocket
  and obs-studio source fetched verbatim, at several tags.
- An empirical lane on the installed OBS 33.0.1 / obs-websocket 5.7.6, run as a portable
  copy in a scratch root, never the owner's root.
- Castle Control's tree, read in full at the night lane and the Rust night core.
- No blind training-data lane ran. Nothing here sought technique-level convergence, and
  every claim is a vendor fact, which training memory cannot confirm.

- **Refuted: launch-line control settings are saved on exit.** The golden path,
  byte-exact-config-restore and own-profile-port-and-password all said it. obs-websocket's
  `Config::Save` skips an overridden port and password. It has done so since the overrides
  existed (c73f6608b, 2021-04-28), and the skip holds at 5.0.0, 5.4.2, 5.5.0 and master. In
  9 graceful runs the per-run password reached no file. The claim had come from a code
  comment in an untracked file that has since been deleted.
- **What the program does write, observed.** Since 5.5.0 the plugin keeps
  `plugin_config/obs-websocket/config.json` and rewrites it on every start (6c9fd55c6). On
  exit OBS writes global.ini, user.ini and the scene collection it loaded, rotating that
  collection's .bak. The technique's step 1 now tells the reader to observe the restore set
  per build in a scratch root, not to recall it.
- **Crash markers depend on the build and the launch mode.** Through 31.x OBS wrote one
  `safe_mode` file. From 32.0.0 it writes `.sentinel/run_<uuid>`, except that a `--multi`
  instance gets no sentinel at all. `--disable-shutdown-check` is not parsed from 32.0.0.
- **Condition added: loopback.** "The control socket is bound to loopback" was an absolute
  that the software cannot meet. obs-websocket has no bind-address option (the loopback bind
  was reverted in 711746524), and the measured listener was `0.0.0.0` plus `[::]`. The
  technique now says to bind to loopback where possible. Otherwise the password is the only
  lock, and a host firewall rule is the second.
- **Applied, experiment, better.** castle-control d15a474 (pushed) adds the plugin config to
  the night lane's restore set. A/B on real OBS with the lane's flags: with a non-canonical
  owner `config.json`, files whose bytes changed went from A 1 to B 0 (n=2 per arm). With a
  canonical one, neither arm changed bytes, but only B kept the mtime. Caveat: the harness
  re-implements the lane's restore, so the lane script itself was not run. Ledger row in
  castle-control 0b1c6b7.
- **Second stack.** New `rust--never-touch-the-owner-instance--castle-control`. The core
  refuses port 4455 and port 0 itself. With no endpoint it starts a fake peer and never
  falls back to a default instance. Its port check is a denylist of one number, so identity
  rests on the per-run password.
- **Verified untouched.** The lane mechanics, re-anchored at d15a474 with check-anchors. The three
  applications carry 58 anchors: 46 quoted anchors held, 5 are unquoted, and 7 are
  `missing-file`. The 7 are the film harness, whose files were never committed and are gone. Both
  node applications now say so. A graceful WM_CLOSE works with `--minimize-to-tray` once OBS
  has finished loading. The early forced kills in this pass were the harness closing too
  soon, not the flag.

## Impact

- Map: no fleet project pairs this subject. Fresh scratch maps for gravitone, systedo-case
  and overlord, the three media-generation projects, hold 944, 935 and 298 pairs, and none
  is this subject. The known positive (overlord, stage-kit-overlays to
  broadcast-software-control) was found. Castle Control is not in the fleet and has no map.
- No stale verdicts, because the subject has never been judged.

## Banked leads

- **Restore under a survivor.** The node application's deviation stands: a survivor of the
  forced kill can undo a verified restore. Return when the lane gains an exit check after
  the kill, or when a run reports `OBS did not exit after a forced kill`.
- **plugin_manager/modules.json.** OBS 33 rewrites it on every start, with the same bytes in
  every run here. Return when a lane runs with a plugin set that differs from the owner's
  (`--only-bundled-plugins`, a portable copy), because then the bytes can differ.
- **Firewall second lock.** Unapplied, because it needs an elevated shell, which is an
  operator act. Return when the operator adds the rule, or when obs-websocket gains a bind
  address.
- **Castle Control CI.** Base e2d7a17 was already red. d15a474 and 0b1c6b7 were in progress
  at the time of writing. Read their failing step against base before blaming this change.
