---
layer: application
type: application
subject: streamer-dress-rehearsal
technique: provenance-survives-every-consumer
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97.1
---

# SIMULATED provenance from generated chat to OBS overlays in a Rust streamer desktop

Castle Control (local checkout of main @ 8ef2d8e, toolchain 1.97.1) runs its dress
rehearsal on the real native core with generated chat. This application follows the
SIMULATED flag from the private generator through the moderation gate, the vote and draw
aggregates, and onto the overlay pages OBS renders, and records the one place where two
provenance axes collapse into one word.

## Set at the source, by a door nobody else can write to

The generator is private by contract. Every message it emits carries the typed flag, a
reserved login, a session-scoped id, and a human-readable second channel in the text:

- `crates/cc-core/src/rehearsal/mod.rs:1` "Private generated-chat door. No RPC accepts text or caller-supplied identities."
- `crates/cc-core/src/rehearsal/mod.rs:51` "simulated: true,"
- `crates/cc-core/src/rehearsal/mod.rs:47` "None => (sequence, format!("
- `crates/cc-core/src/rehearsal/mod.rs:54` "simulated-rehearsal-"
- `crates/cc-core/src/rehearsal/mod.rs:33` "SIMULATED {body}"

The cast behind it realizes the labelled crowd. Rule-breakers exist so armed rules have
something to catch, keep one identity each, and are written not to cross-trigger other
features:

- `crates/cc-core/src/rehearsal/crowd.rs:3` "chatters break typical streamer rules, so a rule the streamer writes and"
- `crates/cc-core/src/rehearsal/mod.rs:38` "A recurring generated chatter keeps one identity, so an armed rule's"
- `crates/cc-core/src/rehearsal/crowd.rs:18` "Bodies carry no digits so they never count as duel"

**Upward lesson, still visible in the tree:** the film plan says the generated chat
never says anything spoiler-like, which predates the breaker cast. An armed rule with
nothing to catch is exactly what the cast was added to fix.

- `film/plan.mjs:29` "Honest limit: the rehearsal's generated chat never says anything"

**Deviation:** timing and ballot splits are drawn from an unrecorded random source, so a
rehearsal run cannot be replayed exactly. Line content is index-deterministic.

- `crates/cc-core/src/rehearsal/mod.rs:228` "rand::random_range(0.8..1.2)"
- `crates/cc-core/src/rehearsal/directions.rs:28` "ballots.shuffle(&mut rand::rng());"
- `crates/cc-core/src/rehearsal/crowd.rs:41` "Every third crowd line is a rule breaker, rotating through the cast."

## Aggregates inherit by taint

The vote bar marks its snapshot simulated if any ballot in the window was; a draw does
the same at seal time; the duel page's contract is stated the same way:

- `crates/cc-core/src/gatehouse/vote_bar.rs:55` ".consensus_simulated_in_window(&params, &consensus.at)?"
- `crates/cc-core/src/gatehouse/vote_bar.rs:67` "simulated: self.simulated || simulated,"
- `crates/cc-core/src/lots/lifecycle.rs:43` "let simulated = self.simulated || roll.simulated(at);"
- `apps/overlay/README.md:189` "a visible SIMULATED badge when a counted ballot in the displayed tally was"

## Rendered on the picture, not only in metadata

Each overlay page draws the badge from its own snapshot:

- `crates/cc-core/src/overlay/vote_bar.rs:62` "let badge = if snapshot.simulated {"
- `crates/cc-core/src/overlay/lots_page.rs:117` "if scene.simulated {"
- `crates/cc-core/src/overlay/tiltyard.rs:50` "if s.simulated {"

The beacon push stream also tags events with an SSE comment, which no viewer sees; the
visible badge comes from the snapshot field, outside the art layer, and is cleared with
the content on a stream error:

- `crates/cc-core/src/overlay/routes.rs:154` "event = event.comment("
- `apps/overlay/README.md:52` "The corner SIMULATED badge marks a simulated burst or preview, driven by"
- `apps/overlay/README.md:102` "stream error the renderer clears its layers, bindings, diagnostics and SIMULATED"

## Where it falls short: two axes, one word

The rehearsal casts its draws from the real public beacon over HTTPS, and the desktop's
Lot Chamber keeps the audience axis and the randomness axis apart. The on-stream plate
does not: its source line keys the randomness caption off the audience flag.

- `apps/desktop/README.md:465` "no recorded randomness is substituted"
- `apps/desktop/README.md:466` "public round separately from its SIMULATED audience"
- `crates/cc-core/src/overlay/lots_page.rs:75` "if scene.simulated {"
- `crates/cc-core/src/overlay/lots_page.rs:76` "Simulated · recorded transport"
- `crates/cc-core/src/overlay/lots_page.rs:78` "Live-trusted quicknet"

**Deviation:** a rehearsed draw cast from a real, live-fetched round is captioned on
stream as recorded transport, so the plate misstates the randomness axis in order to carry
the audience axis. The standard asks for one label per axis.
