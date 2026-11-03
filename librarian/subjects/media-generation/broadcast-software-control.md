---
subject: broadcast-software-control
domain: media-generation
last_touched: 2026-11-03
dry_streak: 0
---

# broadcast-software-control

First note. The subject was harvested on 2026-11-03 (326b3b04e) from one Castle Control
tree. A Curator dispatch ranked it on "single stack (rust)".

## State

6 techniques, 3 applications, all `rust`. Two are against Castle Control (8ef2d8e) and one
against overlord (83a9156). The stack finding still stands: a second stack is not
available. A seam search over every registered fleet tree and the Spooky build root
(obs-websocket / CreateInput / RemoveInput, outside markdown and lockfiles, with Castle
Control as the known positive) found two OBS control clients, and both are Rust. Castle
Control's desktop TypeScript only renders state that its Rust core produces. It has no
socket of its own.

## 2026-11-03 - deepen (bsc-deepen-1103)

Landed in a1b45e6c0. Lanes: counter-evidence against the golden path's protocol claims
(protocol.md and the obs-websocket and obs-studio sources, fetched and grepped verbatim),
the fleet seam search, and overlord's tree read in full at the recorder.

- **A third instance: the provisioned, persistent install.** The boundary named the
  streamer's instance and a throwaway test one. overlord's recorder sits in neither. Its
  guide installs OBS "once per machine", and the recorder then treats it as its own: it
  adopts its fixed-name source, sets the canvas, switches the program scene and mutes the
  global inputs. OBS's source shows where each of those persists. `SetVideoSettings` and
  `SetRecordDirectory` write the current profile's config. The global audio sources, mute
  included, save into the current scene collection. OBS reopens the last-used pair. So
  "my instance" means "whatever a person or another tool had open". On the dev machine
  that was Castle Control's film profile and collection. The golden path and
  `claim-only-what-you-created` gained the condition: ownership rises to the container,
  not the instance. The condition flipped a rule, so it owed an applied row.
- **Applied, code, better.** overlord 83a9156 (pushed) has `ensure_own_containers`. It
  switches to the profile and collection `Shadowrunr`, creating each once. It refuses
  while streaming and reads the switch back. Fake-peer A/B: foreign-container writes went
  from 6 to 0. Caveat: real OBS already refuses `SetVideoSettings` while an output runs.
  Ledger row in overlord 4153693.
- **Verified untouched.** These match today's protocol text verbatim: RemoveInput's "Will
  immediately remove all associated scene items", the result-flag-plus-code success rule,
  and the NotReady and ResourceAlreadyExists codes. The golden path's correction (marked,
  pruned on render) rests on the Castle Control tree and was not re-tested. The two
  volatile facts are tree constants in the applications ("five-second", "three seconds").
  The applications were verified on 2026-11-02, inside their clock.
- **Gate repair.** The harvest left an absolute home path on line 14 of ten applications
  across five subjects, two of them here. CI `registry` was red on 637d7e8a5. Replaced
  with `Spooky/CastleControl` in 987735108.

## Impact

- Map: overlord pairs this subject with one context, `stage-kit-overlays` (0 judged, 0
  stale). No other project's map pairs it. **No overlord context covers
  `crates/shadowrunr-daemon/src/record/`**, which is the seam this pass changed, so the
  map cannot route a `/conform` there. That is a lead for overlord's context map, not for
  the corpus. overlord's map was generated to scratch only, because a sibling holds an
  uncommitted edit to `.ai/registry-map.json`.
- No stale verdicts against this subject anywhere. It has never been judged.

## Banked leads

- **Second stack.** Return when a fleet project drives the broadcasting software from
  anything but Rust (an obs-websocket-js client, a Python obsws client).
- **Switch back after recording.** overlord stays on `Shadowrunr` after a recording. The
  guide tells the operator to switch back. Return when a person reports being left on the
  wrong collection, or when the recorder grows a stop hook that can verify a second switch.
- **Peer-authored comments.** overlord's `ObsError` displays OBS's refusal comment
  verbatim, against `credential-custody-for-the-control-socket`. Return on the next
  overlord recorder pass.
