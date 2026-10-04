---
layer: application
type: application
subject: fire-tv-device-realities
technique: wake-before-launch
stack: process
status: forged
verified_on: 2026-10-01
---

# The sleeping display, written down once and never coded

Source tree: `C:\Users\kazda\kiro\firetv-deathride` (root for the paths below); the
proof-of-concept repo `C:\Users\kazda\kiro\firetv` is named where used. One streaming stick,
a 4K model reported at 1.7 GB, 32-bit userland only. The stack is `process`: the
realization is a pitfall log and a written rule for the build agents, not a launcher.
Nothing here was felt by a person, and every statement is about this single unit.

## The pitfall as the log states it

`docs/concepts/deathride/PITFALLS.md:6 "Send WAKEUP (224), confirm"` that the power service
reports the display awake, then launch. The same entry holds the two facts the draft of this
technique needed to be taught: the launch command *"can report success while the Stick
display is asleep"*, and *"Keep-screen-on prevents sleeping after the activity is active; it
does not wake an already sleeping device"* (same line, 6). That second sentence is the seam
between this technique and the keep-awake flag, and it is the clearest statement of why they
are two techniques.

The readiness half of the lesson is a separate entry:
`docs/concepts/deathride/PITFALLS.md:14 "A successful \`am start\` is not proof"` that the
listener is ready. A save check read the pairing code after a fixed 2.6 seconds, before the
new process had logged its ready message; the entry's remedy is to poll that message with a
bounded timeout and never reuse a previous process's code. This became step 7 of the
technique, which the draft did not have.

## The neighbours of that pitfall, in the same two trees

The other five realities have one anchor each in this tree, and they differ in how far they
were turned into code.

- **Architecture.** `deathride/docs/concepts/DEATH-RIDE-PITFALLS.md:4 "inspect the built APK"`
  states that 64-bit silicon can still run a 32-bit userland and names three architectures.
  The code is `deathride/tools/verify_apk.py:14 "assert f'lib/{abi}/libgdx.so' in names"`,
  which reads the archive, not the build file. It deviates from the standard in two ways: it
  checks one library per architecture where the technique asks per-library comparison, and it
  never asks the device which architecture it supports. The result it prints carries
  `'deviceLaunch':'not measured'` (line 20), which is the honest label.
- **Screensaver.** The game sets the flag unconditionally at activity creation:
  `deathride/app/src/main/java/dev/deathride/tv/MainActivity.kt:13 "FLAG_KEEP_SCREEN_ON"`. That
  fits an unattended test and a driving screen; the technique's advice to release it on static
  menus is not followed, and nothing was run past the device's idle interval for the racing
  game. The origin of the rule is the proof-of-concept repo:
  `docs/POC-FINDINGS.md:260 "FLAG_KEEP_SCREEN_ON"` after the platform ran the screensaver
  mid-session and reclaimed the process.
- **Address.** `docs/concepts/DEATH-RIDE-PHASE2.md:111 "scan the /24 for port 5555"` is a rule
  in the build brief with its honest fallback, *"say `not measured`"*. No scanner was found:
  `scripts/dev.ps1` takes the address as a parameter (the `-Device` argument, with a
  comment on the `:5555` form) and nothing in `tools/` probes a subnet. The technique is
  authored, not implemented.
- **Listening sockets.** `docs/PLATFORM-RISK.md:35 "Whether a Vega app can open a listening"`
  (proof-of-concept repo) records the platform unknown, and `docs/PLATFORM-RISK.md:59 "The relay
  path becomes mandatory"` sets the hedge. The same file reports a relay test that drove a
  stroke with nothing listening on the device (`docs/PLATFORM-RISK.md:72 "tools/relay-test.mjs"`):
  a hedge that was built and run on the current platform, not on the restricted one. Whether the
  new platform forbids listening remains unmeasured.

## Where the tree falls short of the standard

- **No wake code exists.** A search of the tools, scripts and sources found no wake key
  event, no power-service query and no display confirmation; the device scripts in
  `deathride/tools/` send remote key events (for example `career-check.mjs`) but never wake
  the device first. The rule lives in a log that a human or an agent must remember, which is
  exactly the checklist-step form the technique warns against. It was observed once (wave 1) and
  the remedy was the written entry; it was never tested for recurrence.
- **Evidence is one unit.** Every anchor above is from the same stick. No claim about a
  sibling model, a different launcher or a newer platform generation is made here.
