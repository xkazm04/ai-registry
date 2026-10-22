---
layer: application
type: application
subject: tracked-input-record-and-replay
technique: versioned-input-corpus
stack: cpp
status: draft
verified_on: 2026-10-22
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A corpus whose clip header is closed, so its provenance lives beside it

Source tree: `mage-arena-vr` on `master` at `3ee293a` (the root of every path below), read in
a clean checkout of the remote head. The stack is C++ in an Unreal Engine project, as in this
subject's other applications; the `cpp@20` witness is the same one those applications cite.
This run landed `14a0f63` in the project: a manifest tool and a manifest for the committed clips.

**No tracked hand made any clip counted here.** All 111 committed clips are `"source":"synthetic"`.

## The seam

The corpus is 111 committed clips, 14,132 samples, each header carrying exactly ten fields:
schema, name, action, variant, hands, hz, space, keypoints, source and seed. Every sample keeps
its timestamp and confidence. None of the technique's origin fields exists: runtime and
version, sensor mode, device class, rules revision, performer. No manifest listed the clips.

The header cannot grow without a loader change. The loader counts fields:
`apps/vr/Game/Source/MageArenaVR/Hands/HandClip.cpp:133` "ExpectFieldCount(Header, 10, TEXT("header"), 1, OutError)".
The validator checks the same ten and the file name:
`apps/vr/tools/clipgen/validate.mjs:20` "const HEADER_KEYS = ['schema', 'name', 'action', 'variant', 'hands', 'hz', 'space', 'keypoints', 'source', 'seed'];".
A device recorder is planned to write `source: "recorded"` into this same file with `seed: 0`
(`docs/CLIP-SCHEMA.md:147` "A device recording is this schema with"), so the runtime that made a recorded clip would have had nowhere to go.

## Arm A and arm B

- **Arm A (as shipped):** the schema validator. It judges a clip's shape.
- **Arm B (this technique, sidecar form):** `apps/vr/tools/clipgen/corpus-manifest.json` lists
  each clip by path with its sha256, source, seed, performer, runtime, device and intent, and
  `tools/clipgen/manifest.mjs --check` quarantines any clip that is unlisted or whose bytes differ.

Instrument: three edits to a copy of the corpus, run through both arms. A clip trimmed by eight
samples, one confidence value changed in another, and a copy of a clip under a new identifier.

| Edit | A (validator) | B (manifest check) |
| --- | --- | --- |
| trim: 31 samples to 23 | passes | `changed` |
| one confidence 1.0 to 0.9 | passes | `changed` |
| copy under a new identifier | passes | `unlisted` |
| committed corpus | 111 ok | 111 listed, 0 quarantined |

**Target:** edits visible to the gate, 0 of 3 to 3 of 3. **Floor:** the committed corpus judged
clean by both arms, and the validator's verdict unchanged. Held. Clip files are pinned to LF
(`.gitattributes`), so the hashes do not move between checkouts.

**Chosen to falsify.** A schema validator that rejects malformed clips might make an identity
check redundant. It does not: the validator judges shape, and an edited clip is still well
formed. A first attempt at the confidence edit produced a malformed number, and the validator
caught that one, which is the shape check doing its own job and nothing more.

## What the tree shows about the technique

- **When the loader is a closed schema, provenance goes in a manifest keyed by clip path, not in
  the header.** The technique's "store each clip with its provenance" is satisfied by a
  sidecar; widening a closed header is a loader and schema change that old clips cannot meet.
  The technique gained that boundary from this run.
- **Fields the tool cannot know are written as `unrecorded`, not guessed.** Synthetic clips carry
  `none` for runtime and device, since nothing tracked them. A recorded clip written by a tool
  that cannot name its runtime stays visibly incomplete.

## What this realization cannot do

- It does not make any gating test name the clips it reads. The automation tests build clip
  paths from action names inside C++; no Unreal build ran, so that half is unmeasured.
- It cannot tell whether a recorded corpus matches the runtime that ships, because no recorded
  clip exists. The re-record rule waits for the first device session.
- The manifest is hand-run: nothing in CI calls `--check` yet.
