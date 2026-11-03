---
layer: application
type: application
subject: isolated-broadcast-software-test-lane
technique: never-touch-the-owner-instance
stack: node
status: forged
verified_on: 2026-11-03
verified_against: node@24
---

# Keeping a night lane off the owner's OBS (Node)

Castle Control (`Spooky/CastleControl`, read at 8ef2d8e on 2026-11-02, re-anchored at
d15a474 on 2026-11-03; Node
`>=24.14.0` per `package.json:8`) tests its OBS integration against a real OBS Studio in an
unattended lane, `scripts/night/obs.mjs`, on the same Windows machine the owner streams
from. The script's header states the contract:
`scripts/night/obs.mjs:6 "Isolation: never touches the owner's OBS (skips if obs64 is running), never port"`.

## Connection, identity, termination

- **Skip, never close.** `scripts/night/obs.mjs:198 "if (obsRunning()) { finish('skipped', 'an obs64 process is already running; the owner OBS is never touched'); process.exit(); }"`.
  Detection is by image name (`:46 "IMAGENAME eq obs64.exe"`), used only to decide to stay
  away - never to pick a process to talk to. Since the configuration root is shared, this
  is the "do not launch beside a running owner" rule, not merely politeness.
- **Skipped is reported as skipped.** `scripts/night/obs.mjs:182 "if (outcome === 'skipped') console.log(`skipped: ${reason}`);"`
  with the outcome written to `obs-lane.json`; the README lists every skip condition at
  `e2e/night/README.md:46 "It skips when an `obs64` process is already running, OBS is not installed,"`.
- **Its own port, checked free, never the default.** `scripts/night/obs.mjs:25 "const PORT = 4466;"`
  and `:201 "if (!(await portFree(PORT))) { finish('skipped', `port ${PORT} is in use`);"`;
  the relay refuses the default everywhere: `e2e/night/README.md:85 "Port 4455 is refused everywhere."`.
- **A password only its instance knows.** `scripts/night/obs.mjs:203 "const password = randomBytes(24).toString('hex'); // Per run, memory and child environments only."`,
  passed on the launch line at `:216-217` (`--websocket_port`, `--websocket_password`). The
  readiness probe treats an authentication refusal as "not ours":
  `:137 "throw new Error('OBS refused the per-run websocket password'"`.
- **Ready means a request answered.** `scripts/night/obs.mjs:133 "const version = await socket.request('GetVersion');"`;
  launch flags `--disable-shutdown-check` and `--minimize-to-tray` (`:217`) were chosen to
  keep the unattended instance from stalling on dialogs. On OBS 32 and later the first flag
  is no longer parsed. The unclean-shutdown dialog stays away because of `--multi`: that
  instance's crash handler has no sentinel to write or find (OBS 33.0.1 source; measured
  2026-11-03, where two force-killed `--multi` runs left no `.sentinel`). The filming setup showed, in an untracked file since deleted, what happens
  without that care: `film/obs-setup.mjs:44 "OBS never became ready (a dialog may be open in its window: safe mode or the auto-configuration wizard)"`.
- **Stops only its own child, by handle.** `scripts/night/obs.mjs:160 "spawnSync('taskkill', ['/PID', String(child.pid), '/T']"`
  on the `child` object it spawned.
- **The code under test cannot reach a real instance.** Live switches are stripped from the
  spec's environment, `scripts/night/obs.mjs:171 "for (const key of ['CC_LIVE_TWITCH', 'CC_LIVE_OBS', 'CC_LIVE_FLOOR']) delete env[key];"`
  (and again by the runner, `scripts/night/run.mjs:26`), and the core reaches OBS only
  through a test relay holding the in-memory password, never the keychain:
  `e2e/night/README.md:83 "authentication with the in-memory password, so the core never reads the"`.
  This - isolating the tool under test, not just the harness's own connection - was an
  upward lesson for the technique.

The lane states what it does not cover at `e2e/night/README.md:92 "## What it cannot prove"`,
including no Twitch at all (`:95`).

## Deviations from the technique

- **Recovery terminates a recorded PID.** A run killed by the night runner's lane timeout
  (`scripts/night/run.mjs:56 "killing tree"`) leaves a manifest with the old child PID; the
  next start does `scripts/night/obs.mjs:190 "if (manifest.pid && obsRunning()) killTree(manifest.pid);"`
  - a forced tree kill of that PID whenever *any* `obs64` is running. After a reboot, or
  simply after Windows reuses the number, that PID can be the owner's OBS or an unrelated
  process. The technique's rule is that recovery never stops what it cannot prove is its
  own; this line is the one place the lane can touch the owner's instance.
- **A fixed port.** 4466 is constant rather than chosen per run; it is checked free, so the
  failure mode is a skip, not a collision.
- **Reserved name treated as ownership.** `scripts/night/obs.mjs:111 "Leftovers can only be this lane's own (the name is reserved for it); replace them."`
  The technique asks for the manifest's claim before deleting a leftover profile; the lane
  relies on the reserved name `CastleControl-Test` alone.
- **The filming harness has no owner check** (2026-11-02 reading of untracked files that are gone
  as of 2026-11-03). `film/lib/obs.mjs:42` launches `obs64.exe --multi`
  with no test for a running owner OBS, against the shared configuration root. It is not a
  test lane - its profile carries the owner's connected account and it can go live
  (`film/lib/obs.mjs:89 "await socket.request('StartStream');"`) - which is exactly why it
  falls outside this subject and needs the owner present.
