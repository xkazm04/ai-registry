---
subject: two-thumb-touch-layout-design
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# two-thumb-touch-layout-design

A couch-and-TV subject forged on 2026-10-01 from Death Ride. It had six techniques and one `node`
application, and no subject note before this one.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-ttl-1010)

Dispatched by Curator's projection of the attention scan on **single stack (node)**. The rank was
real, and the field had moved under the subject. On 2026-10-06 Death Ride shipped three things in
`898f4928`: a "multitouch hardening" pass, a fourth layout (Drive) as the new default, and a halved
steering stroke. It reverted the stroke 52 minutes later in `af448554`, moving the gain into the
model. By `d9990777`, 16 of the node application's 27 quotes had moved or gone.

Four lanes ran:
- **Field lane** on firetv-deathride `deathride/main` at `d9990777`. It read the controller, the
  layouts table, the drift model, the input mailbox, the owner checks and the pitfall log.
- **Experiment.** Seven touch-action variants ran in installed Chrome 154 (headless, CDP touch),
  with a positive and a negative control, twice.
- **Simulation.** The old and new pedal handlers were taken verbatim from git and driven through a
  fake element.
- **Counter-evidence web lane, and a training-data-only blind lane.** Raw spec text (Pointer
  Events, HTML activation) and the Baldauf 2015 PDF were re-fetched and grepped by this run before
  anything landed.

**Convergence:**
- Take-over on a held slot: field, training lane and simulation agree. A public gamepad library
  chose the opposite the same week, and the simulation shows the trade both choices make.
- Touch-action stops at the scroll container: the spec text, the training lane and the experiment
  agree. The project's pitfall entry blamed the ancestors. Its recorded fix (root to pan-y) changed
  nothing in the run, and the blocker was the sheet's own buttons.
- Fullscreen on release: the spec, the training lane and the field agree. The claim that the resize
  cancels touches is undocumented.
- A faster-steering request is a downstream gain that exempts the rig: field and training lane
  agree. They diverge on where the gain sits (model vs input mapping). The kotlin application
  records that as a balance cost.

**Flipped or conditioned:**
- `pointer-capture-per-control`: take-over replaces "ignore". The three release events are one
  chain. A failed claim must be decided on purpose. Activation goes on a release.
- `pad-vertical-throttle-neutral-start`: "never brake" was an absolute. It now has a full form, with
  separate travels, exclusion by geometry and lift as the only escape.
- `relative-anchor-steering`: the gain rule. The pad's first-owner refusal is guarded (take the slot
  after capture).
- `neutralise-on-sheet-open-or-layout-change`: step 7 was corrected. Two new rules cover the link
  hold and "find the element under the finger".
- The golden path carries all of the above, plus the OS three-finger disruption and the Baldauf
  study at its actual weight: fewer glances, similar performance.

**Widened:** `kotlin--relative-anchor-steering` (kotlin@2.0.21, 12 anchors held).
**Re-anchored:** `node--pointer-capture-per-control` at `d9990777`, 33 of 33 held, `verified_on`
moved. It now carries `applied: simulation`, `ab_verdict: better`.

**Deviation narrowed.** The link-loss copy of the clear still omits steering. The link-up path calls
the full clear first, and the host holds steering through a drop by design (spike verdict). So no
held-over thumb can resume.

**Verified and left untouched:**
- `handedness-mirror`: still a column-order swap over all four layouts.
- `cruise-fire-drives-throttle`: the flag is still consumed where holds combine. It now also covers
  the ability button, which is in the application, not a rule change.
- `relative-anchor-steering`'s core: anchor per contact, zero on lift.

**Impact: 0 contexts.** The map dry-run joins this subject nowhere. pof's map carries 299
game-production pairs and none for this subject, and Death Ride has no manifest. Return condition:
firetv declares game-production, or Death Ride gets its own manifest.

**Banked leads:**
- **A pad that refuses a second touch takes its slot before capture.** Field, `index.html:146`.
  Return: a reported dead steering pad, or a project that adds take-over to the pad.
- **Position-hit-tested thumb zones vs captured buttons on the right hand.** The training lane says
  zones let a thumb slide from fire to drift without lifting, and capture forbids it. Return: owner
  feedback from W-Control item 3.
- **WebKit touch-action.** The experiment ran on Chromium only. Return: a project tested on an
  iPhone.
- **Project-side drift.** `deathride/README.md:24` still describes the halved stroke, and the
  pitfall entry carries the misdiagnosis. Both are the project's to fix. Return: the next
  read-back.

Clocks: the derived per-stack window; no `refresh_by` set.
