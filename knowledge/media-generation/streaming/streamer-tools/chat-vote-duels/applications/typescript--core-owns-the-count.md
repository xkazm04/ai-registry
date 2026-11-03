---
layer: application
type: application
subject: chat-vote-duels
technique: core-owns-the-count
stack: typescript
status: forged
verified_on: 2026-11-02
verified_against: typescript@6.0.3
---

# The desktop never counts: one core, two renderers, and the producer that drifted

*Read against Castle Control, the main checkout at Spooky/CastleControl on
2026-11-02 (commit not recorded; the read was made without version control). The root
`package.json` pins TypeScript 6.0.3. Nothing was executed for this document. The
project's own record says the corrected night run and its Rust regression were still
pending when it was written, and this document does not claim them.*

The tournament has two faces: the desktop's Map Room stage, where the streamer opens,
calls and advances duels, and a browser-source page the broadcasting software renders on
stream. An earlier version had the desktop read moderated chat and count ballots itself;
the current one removed that path and made both faces renderers of the core.

## The desktop renders, it does not count

The design record says so in as many words:
`apps/desktop/src/rooms/studio/TILTYARD_LIVE.md:6 "status. No room socket, Gatehouse chat read or ballot feed remains in this path."`
and `:10 "does not consume chat or tally ballots. Polling stops during reads/mutations,"`.
The stage component is held to the same limit:
`apps/desktop/src/rooms/studio/TILTYARD_LIVE.md:24 "It does not infer a winner, index ballots, fabricate a chat ticker or barred"`.

The adapter reads authoritative state and nothing else. Live counts refresh on the
core's events and, failing those, by a one-second poll scheduled only after the previous
read finished:
`apps/desktop/src/rooms/studio/tiltyard-core.ts:48 "// Full authoritative reads also refresh live counts if no turn event arrives."`.
Stale replies cannot repaint the picture — every call captures a generation and
publishes only if it still matches
(`apps/desktop/src/rooms/studio/tiltyard-core.ts:79 "if (active && run === generation) publish({ stage }, ['error']);"`),
and a reconnect bumps it (`:116 "generation++;"`). Writes are never replayed; a write in
flight when the connection drops is reported as unknown rather than retried:
`apps/desktop/src/rooms/studio/tiltyard-core.ts:119 "? 'Core disconnected during the request. Its outcome is unknown; reconnect to check before trying again.'"`.

## The overlay renders whole snapshots and clears when it cannot

The browser-source page replaces the whole card on every snapshot and clears itself on
a feed error or an unparseable message:

- `packages/renderer/src/tiltyard.ts:16 "/** Labels only enter textContent; a snapshot always replaces the complete card. */"`
- `packages/renderer/src/tiltyard.ts:35 "catch { clear(); }"` and `:41 "source.onerror = clear;"`.

The core side sends a full snapshot on connect and then replacements:
`apps/overlay/README.md:194 "carries the SIMULATED comment. Closed cards keep the recorded"` /
`:196 "pair. The SSE sends an immediate latest snapshot and then one replacement per"`.
The snapshot is projected from the session by the core
(`crates/cc-core/src/tiltyard/projection.rs:1 "//! Viewer-free aggregate projection; closed cards keep the recorded pair."`).

Provenance is derived from the ballots, not from a mode: the core's tally sets
`simulated` when any counted ballot came from a generator
(`crates/cc-core/src/tiltyard/ballots.rs:133 "tally.simulated |= event.simulated;"`), and the
page draws the badge from that field
(`packages/renderer/src/tiltyard.ts:19 "if (snapshot.simulated) nodes.push(line('SIMULATED', 'simulated'));"`).

## Local demos carry their label

The two duel modes that still run a local TypeScript engine say so in their own detail
line: `apps/desktop/src/rooms/studio/local-duel-demos.tsx:8 "ladder: { ...tiltyardWords.modes.ladder, detail: 'Local demo · not sent anywhere' },"`.
The design record quotes an older wording
(`apps/desktop/src/rooms/studio/TILTYARD_LIVE.md:18 "engines and visibly say **Local demo · not sent to the core or OBS**. FIXTURE"`);
the code is the authority and the record has drifted.

## The producer that drifted

The project's night lane generated ballots whose spelling the authoritative parser did
not accept, and a whole duel closed at nothing to nothing:
`apps/desktop/src/rooms/studio/TILTYARD_LIVE.md:112 "D5c round 4 root cause: the night executable emitted"`,
`:114 "authoritative parser accepts a leading"`,
`:115 "cheer prefix); all nine generated messages were therefore chatter."`.
The repair moved the token to the front and made the regression import the exact
producer rather than restate it:
`crates/cc-core/src/tiltyard/tests/night.rs:4 "// Exercise the exact producer used by the night executable, not a second fixture spelling."`,
with the producer itself at
`crates/cc-core/examples/e2e-night/ballots.rs:1 "//! Generated SIMULATED night ballots; the leading token is the real Chat grammar."`.

## Where it falls short of the technique

The producer and the parser still hold two spellings of the grammar: the producer
hard-codes `"1 SIMULATED duel ballot left"` and agreement is proved only by a regression
the record lists as authored and unrun
(`apps/desktop/src/rooms/studio/TILTYARD_LIVE.md:48 "(authored; unrun)"`).
Neither face shows the snapshot's version or time, so a panel and overlay that disagree
cannot be told apart from a stale subscriber by looking. The overlay prints the verdict's
raw enumeration value (`packages/renderer/src/tiltyard.ts:26 "snapshot.verdict.how"`),
so a tie-break reads "· tie" on stream while the panel says
`packages/ui/src/duel/core-chat.tsx:66 "{decision.how === 'call' ? 'Your call' : decision.how === 'tie' ? 'Tie · seed wins' : 'Chat chose'}"` —
the two faces agree on the fact and disagree on the words.
