---
source: file:bp/lessons-2026-11-18
kind: first-party practitioner account (pasted notes, one project, n=1)
url: null
title: "Lessons from the last 48 hours before a VR competition submission (2026-11-17/18)"
author: the project's agent sessions, for its owner
words: 1385
extracted: 20
accepted: 4
declined: 0
leads: 3
already_covered: 6
untriaged: 9
applied: 3
shipped: 0
dispatched: 0
run_id: intake-bp-lessons-1118
siblings: 0
---

# A deny list protects the names it lists

Intake 2.22.0, run 2026-11-18, unattended under the default scored gate (accept bar +3). A
source originates a finding. It never authorizes one. The source is a lessons file written
in a fleet project's tree at its last commit before the project was retired from the fleet:
twenty numbered lessons in four groups (headset release engineering, headset runtime,
filming a live product, agents on a shared machine), each naming a file or commit. The
ingest returned 1,385 words of prose; the container was what it said.

**Class: first-party practitioner account, pasted notes.** Authoritative about what the
project did and measured, n=1 for what works in general. Expected yield said before the
table: a few boundary amendments, several catches, the fetch budget unspent because the
anchors are a tree that can be opened. The budget went unspent (0 of 3 web fetches); the
corroboration came from three trees opened in-run (the source project's, two fleet
projects') and the engine install's own staging code.

0 siblings live on the board at start. Declared focus from the scorecard: a source run
(front of the funnel). Met. Not a repository, so no design record and no routing count;
no forge handoff and no XL trigger (zero design candidates). Directions: n/a.

## Triage (Phase 5, scored)

Upper-layer rows scored GAIN/RISK/COST; accept at GAIN - RISK >= 3 and GAIN >= COST.

| # | Lesson | Shape | Home (prior art) | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|
| 1 | Secrets in a staged config layer; gate the staged list | technique | game-production/ship-pipeline-gating | real gap | 3/0/2 | **accept** |
| 2 | Development and shipping builds are different products | catch + lead | software-engineering/build-economics `dev-variant-design` | likely catch | - | covered; residue a lead |
| 3 | A plugin with no stub breaks only the shipping build | catch | ship-pipeline-gating (configuration-conditional capability, preflight) | likely catch | - | covered |
| 4 | Read commit headroom, not free memory, before a heavy build | amendment | ship-pipeline-gating `preflight-before-an-expensive-cook` | partial | 2/1/1 | untriaged |
| 5 | Bench and film the headset with nobody wearing it | application/amendment | game-production `on-device-verification-harness`, `fire-tv-device-realities` | partial | 1/2/1 | untriaged |
| 6 | "Worn" is a global switch; synthetic input dies with it | amendment | game-production `tracked-input-record-and-replay` | partial | 1/2/1 | untriaged |
| 7 | A merged mesh cannot lose a part at runtime | amendment | game-production `distance-tiered-stand-ins/merged-cluster-proxy` | partial | 1/2/1 | untriaged |
| 8 | One voice owns the first run | amendment | software-engineering `guided-tours/narration-and-pacing` | partial | 1/2/1 | untriaged |
| 9 | A permission asked only on the happy path is never asked | amendment | software-engineering `native-shell-integration`, `voice-io/voice-setup-experience` | partial | 1/2/1 | untriaged |
| 10 | The first run follows the product's process | catch | `guided-tours/tour-path-curriculum` ("Order the path as a person meets the product") | likely catch | - | covered |
| 11 | Test the first run as a first run | catch | `guided-tours/tour-lifecycle` ("Fresh-profile testing is the lifecycle's verification gate") | likely catch | - | covered |
| 12 | Cue first; the take is locked to the cue | amendment (inverts) | media-generation `live-system-demo-film/music-bed-sized-to-the-finished-cut` | real gap | 3/0/2 | **accept** |
| 13 | Voice from the product's log, not the capture | amendment | `live-system-demo-film/script-as-single-source` | partial | 1/2/1 | untriaged (one decision rule absorbed into row 15) |
| 14 | Review stills, not runs | catch | `live-system-demo-film/prototype-the-cut-from-stills-and-a-dry-walk`, video-assembly `verify-cheapest-artifact-first` | likely catch | - | covered |
| 15 | Frame-stepped browser capture | technique | `live-system-demo-film` (`recording-that-asserts-its-claims` counts drops) | real gap | 3/0/2 | **accept** |
| 16 | Viewers need the frame before the product | lead | `live-system-demo-film/retake-without-an-edit-session` (parameters) | partial | - | lead |
| 17 | Reset the stage per take | catch | `live-system-demo-film/seeded-stage-with-a-declared-boundary` | likely catch | - | covered |
| 18 | Shell text is not file text | technique | agent-operations (none) | partial | 3/2/1 | untriaged |
| 19 | An idempotent edit must not re-match its own output | technique | codegen / agent-operations (none) | partial | 2/2/1 | untriaged |
| 20 | A guard over shared processes reads the whole command | technique | software-engineering `agent-runtime-assembly` | real gap | 3/0/2 | **accept** |

auto=4/9/0 fp=0. Rule per row: 1, 12, 15, 20 and the untriaged rows ran under the score;
row 16 and the three leads under the corroboration table; catches are recorded, not scored.

Scoring notes. Row 1: new technique (2), convergence with an independently built test lane's
structural rule that no copy of the owner's configuration may sit under its publication
directory (+1); the director opened the source project's package script and commits and the
engine's staging code (risk 0). Row 12: an amendment that inverts the target's stated order
("script, voice, narration, then music, then capture") for a featured cue (2), convergence
with trailer-structure `cue-first-assembly`, written from a different source (+1); the take
driver's cue-locked schedule opened (risk 0). Row 15: new technique (2), convergence with the
2026-09-16 renderer whose design record says "render by seeking an integer frame index, never
by playing" (+1); the capture script opened (risk 0). Row 20: new technique (2), convergence
(+1): the 2026-10-02 claude-mods note banked this as a lead with the return condition "two
runs showing the same false-positive classes (scoped pathspecs, heredoc bodies,
usage-vs-help) make it a technique in agent-runtime-assembly"; the source project's guard is
the second, independently written, with the same class (a quoted `|` read as a pipe). Row 18
scored convergence with the same note's "double-quoted backtick substitutions that visibly
corrupted their command" and still rests on the source's prose (no file with the stray
carriage returns was opened): 3 - 2 = 1. Row 4's convergence is a prior run's note that a
fleet generation guard already encodes commit charge; as a boundary amendment it tops out at 2.

## Verification (Phase 6)

- **Row 1, a corrected premise.** The source says the signing password was "a secret inside
  the shipped APK". Measured: the user configuration file was in the staged file list
  (the package script's staged-list check fails on any user configuration file; the fix
  commit records that the APK was deleted). Not measured: whether the value survived. The engine's
  `BaseGame.ini` puts the signing-password keys on its key deny list and the development file
  server's section on its section deny list, and the automation tool's staging copy filters
  text configuration files by exact key prefix and section (its ini filter),
  skipping files named for the collapsed binary configuration. So the value was probably
  stripped. The source located something true (a secret-bearing layer is staged; only a
  file-level gate on the staged list saw it) and explained the consequence beyond its
  evidence. The technique is written from the primary: the deny list matches names and one
  form, so a secret's safety comes from its layer, and the deny list is the second line.
- **Row 20, observed in this run.** A search over the registry for prior sightings was
  refused by the source project's own process-kill guard (this session's working directory),
  because the grep's quoted alternation contained a kill command name after a `|`. Same
  guard, so not counted as a second sighting; it confirms the mechanism is live.
- Rows 10, 11, 14, 17: each target technique opened and its sentence quoted above.

## Applied (Phase 7.5)

| Row | Technique | Project | Mode | Verdict | Seam chosen to |
|---|---|---|---|---|---|
| 20 | command-guard-judges-command-positions | mage-arena-vr | experiment (replay over 1,509 recorded commands) | better (1 false refusal of 189 removed, floor 25/25 + 12/12 held) | falsify: a git-verb guard, where data rarely names the verb |
| 15 | frame-stepped-page-capture | personas | experiment (one design page, 4 s at 30 fps, three arms) | not-better (target 99/118 -> 119/119; floor 0/61 identical across runs) | falsify: a page whose motion is not all script-driven |
| 1 | build-secrets-in-an-unstaged-layer | mage-arena-vr | experiment (structural over source layers) | unmeasurable (instrument: a staged list from one package run on the engine host) | falsify: a project with a secret-shaped value in a staged layer |
| 12 | music-bed amendment (featured cue) | - | unapplied | - | no fleet recorder carries a featured cue; personas' records none |

What the falsifying seams refuted. Row 15: the method as the source states it (script clock
plus style animations) is not deterministic on a page with declarative SVG animation: 0 of 61
frames identical across two runs, the page's animation list reporting zero animations
throughout. Seeking each SVG root's timeline raised it to 37 of 61; the rest differed only in
one 20 by 50 pixel spinner box. The technique now carries "a page runs on more than one
clock" and the two-run gate. Row 20: the class held but is rare under a git-verb rule set
(1 in 1,509 commands); the seam also showed a different false-refusal class the source did
not name, a verb rule matching `merge-base` at a hyphen, which became step 4. Row 1: the seam
holds a development file server token in a staged project layer, safe only because the
engine's section deny list names it; a source-layer scan would have flagged it, a staged-copy
scan would not.

Bp is retired from the fleet (projects.json, 2026-11-18), so nothing was applied against it;
its tree was read only to verify the source's anchors.

## Cross-repo lane (Phase 8): recorded, not made (operator instruction for this run)

Dropped 2026-11-18: mage-arena-vr left the fleet the same day (owner: if the game continues it is a PC game without VR),
so the two mage-arena-vr items below will not be made. Its applications stay as dated evidence for their techniques.

- mage-arena-vr, the worker guard: a quote-aware tokenizer in front of the three
  command rules; verb rules ending at a token boundary; the search row and the two
  read-only git query rows added to the allow cases first; the replay kept as a script.
- mage-arena-vr, packaging: keep a future signing password in the per-user layer; a
  post-package assertion over the staged list (no user-layer configuration, no keystore)
  beside the existing manifest-marker check.
- personas, the demo-recording skill: none. Its primary path grabs the desktop at 24 fps; frame
  stepping applies only to its optional page variant, and the design-page result says the
  two-run gate must come first.

## Already covered (catches)

Rows 2, 3, 10, 11, 14, 17, with their quotes in the table. Row 2's residue is a lead.

## Leads

- **L-a (row 2).** A store build and a development build signed by different keys refuse to
  install over each other, and the uninstall wipes app data and pairing; back up the release
  key with its password. Dated platform fact. Return: when a fleet project release-signs for
  a store, as an application of `dev-variant-design`.
- **L-b (row 16).** A demo that crosses two surfaces (web, headset) needs both on screen
  together, and an opening that says what the product is; every owner note was a pipeline
  parameter, so each round cost minutes. Return: when a second demo film's review notes say
  the same, against `retake-without-an-edit-session`.
- **L-c (row 1).** Whether the packager's collapsed binary configuration applies the key and
  section deny lists; the text filter explicitly skips it. Return: when a staged binary
  configuration can be read from a real package on the engine host.

## Untriaged (unverified, anchors kept for a later run)

Nobody verified these; they carry no judgment.

- **Row 4** - a build cache's shared-memory failure, then the compiler out of heap, with 39 GB
  physical free; a GPU server held 55 GB committed, 1.8 of 80 GB commit free. Home:
  `preflight-before-an-expensive-cook`, a new recurring inhabitant (host headroom in the unit
  the failure is about).
- **Row 5** - the keep-awake broadcast re-sent before each command; a bench pose moves the pawn for a
  resting device; screen recording chained in 180 s segments, stopped by PID with SIGINT.
  Home: `on-device-verification-harness`.
- **Row 6** - holding the proximity sensor closed disables the app's synthetic hand, which
  acts only with no headset on. Home: `tracked-input-record-and-replay`.
- **Row 7** - world-position-offset collapse ignored by a merged component on device; a
  masked material hid the legs but not a top merged under the shell's material. Home:
  `merged-cluster-proxy`.
- **Row 8** - found by logging every clip played; ambient narration now waits for the cold start. Home:
  `guided-tours/narration-and-pacing`.
- **Row 9** - the microphone request moved to first use in every mode. Home: `native-shell-integration`.
- **Row 13** - clip ids must be unique; a duplicate id played one line twice. Home:
  `script-as-single-source`. Its placement rule is absorbed into row 15's decision rules.
- **Row 18** - a heredoc turned `\\n` into a newline inside string literals twice; stray
  carriage returns surfaced ten builds later. Home: agent-operations (none yet); converges
  with the claude-mods shell-guard's backtick-substitution incidents.
- **Row 19** - an anchored replace whose replacement contains its anchor applied twice on a
  re-run. Home: none named.

## Landed

- `game-production/.../ship-pipeline-gating/techniques/build-secrets-in-an-unstaged-layer.md`
  + application `process--build-secrets-in-an-unstaged-layer.md`
- `software-engineering/.../agent-runtime-assembly/techniques/command-guard-judges-command-positions.md`
  + application `node--command-guard-judges-command-positions.md`
- `media-generation/.../live-system-demo-film/techniques/frame-stepped-page-capture.md`
  + application `python--frame-stepped-page-capture.md`
- `media-generation/.../live-system-demo-film/techniques/music-bed-sized-to-the-finished-cut.md`
  section "When the music is a featured cue, the order inverts"

Render proof (Phase 6b): no render pair. Rows 12 and 15 sit in a production-ops subject but involve
no generator: a captured product and a chosen existing track, each with a numeric observable
(sync offset per mark; frames changed and frames identical across runs), measured above for
row 15 and in the source tree for row 12. The operator may hold a different reading of 6b's
scope; row 15's frames and the review page (`report/index.html`) are kept in this run's scratch
directory until the operator has looked or says not to.
