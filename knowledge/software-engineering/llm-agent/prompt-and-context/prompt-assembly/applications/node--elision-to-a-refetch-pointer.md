---
layer: application
type: application
subject: prompt-assembly
technique: elision-to-a-refetch-pointer
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@22
---

# Large tool results sent in full twice, then projected to a handle with exact paged recall

SoL-Pi, NVIDIA's open-source efficiency extension for the Pi coding agent, read at
commit `2b791687` (2026-09-15). The version witness is `package.json:54 "22.19.0"`,
the engines floor. Paths are relative to the repo root; every anchor below was
verified against the clone with `scripts/check-anchors.mjs`. The mechanism is
`src/sol-pi/extensions/observation-pack/`.

## The decision

A pure-text tool result above
`src/sol-pi/extensions/observation-pack/observation.ts:13 "THRESHOLD_BYTES = 10 * 1024"`
is archived by content address the first time the projection sees it,
`src/sol-pi/extensions/observation-pack/observation.ts:98 "export function createObservation"`
and `src/sol-pi/extensions/observation-pack/observation.ts:123 "export async function ensureStored"`.
It is sent in full for its first two provider requests,
`src/sol-pi/extensions/observation-pack/observation.ts:15 "FULL_SENDS = 2"`, and
replaced afterwards by a stable placeholder,
`src/sol-pi/extensions/observation-pack/observation.ts:178 "export function placeholderFor"`:
the observation id, the tool, original bytes, lines and estimated tokens, the recall
instruction, and the first and last complete lines within
`src/sol-pi/extensions/observation-pack/observation.ts:17 "PLACEHOLDER_EXCERPT_BYTES = 1024"`
split evenly between head and tail.

The rewrite happens only at the projection layer, the context event handler at
`src/sol-pi/extensions/observation-pack/index.ts:137 "async (event, ctx: ExtensionContext)"`,
and the module says why in its own words:
`src/sol-pi/extensions/observation-pack/index.ts:13 "never edits history in place"`, so
`src/sol-pi/extensions/observation-pack/index.ts:15 "recall keeps working after native compaction"`
or a resume. The placeholder is a pure function of the message, and "how many
requests has this result been part of" is recovered from the transcript itself by
counting the assistant messages that follow it,
`src/sol-pi/extensions/observation-pack/index.ts:146 "priorAssistantCounts[index] = assistantCount"`,
so a fresh process reaches the same projection bytes.

Recall is exact and paged: the tool
`src/sol-pi/extensions/observation-pack/index.ts:66 "obs_recall"` reads by byte
offset, capped at `src/sol-pi/extensions/observation-pack/index.ts:41 "RECALL_MAX_BYTES = 16 * 1024"`
and `src/sol-pi/extensions/observation-pack/index.ts:42 "RECALL_MAX_LINES = 400"` per
call, trims to a UTF-8 boundary,
`src/sol-pi/extensions/observation-pack/observation.ts:207 "function trimUtf8End"`,
and returns `next_offset` and `eof`. Storage fails closed: objects are opened with
`src/sol-pi/extensions/observation-pack/observation.ts:22 "O_NOFOLLOW"`, and an
existing object is reused only after a
`src/sol-pi/extensions/observation-pack/observation.ts:144 "size mismatch"` and a
`src/sol-pi/extensions/observation-pack/observation.ts:148 "hash mismatch"` check.
The projection fails open,
`src/sol-pi/extensions/observation-pack/index.ts:203 "Fail open"`: a packing error
logs and leaves the original result in place.

## What the tree could not have been built to prove, and proves anyway

The technique treats recoverability as a property of the source: material still
addressable at its source may be elided, and a result from a tool that has since
changed the world may not. This tree makes the address at capture time — the bytes
are archived before the placeholder is ever emitted — so the class the technique
excludes becomes elidable at the price of local storage, and the pointer resolves to
the archived copy rather than to a re-run. The cost shows in the README's own
storage note: the archives are session-scoped and
`README.md:122 "not automatically deleted when the Pi session ends"`.

One measured fact from the source's blog, reported as the source reports it (n=11
tasks x 2 arms, both arms launched concurrently): the shipped configuration — two
full sends before projection, a head and a tail excerpt — was chosen over one full
send in an eight-configuration sweep, and the paired run changed response count by
0.20% while cost per response fell 23.73%. The technique's acknowledged-once floor is
the floor; the measured optimum here was two sends.

Receipts from the sibling reducer are never packed,
`src/sol-pi/extensions/observation-pack/observation.ts:28 "EVIDENCE_REDUCER_RECEIPT_PREFIX"`:
a verified reduction would otherwise be replaced by an excerpt of itself.
