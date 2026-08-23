---
layer: application
type: application
subject: companion-runtime
technique: host-seam-contracts
stack: rust
status: forged
verified_on: 2026-08-23
---

# The host seam in the Personas companion (Athena)

A Tauri desktop application hosts a persistent companion. Two of its subsystems
sit on opposite sides of this technique's line, and a third — a second channel
that already exists — is the clearest evidence in the tree that the seam has not
been built.

## Confirmed: the sleep cycle has a real seam, with a double

The memory-maintenance cycle takes its model access as a trait object rather
than calling the process spawner directly:

```rust
pub trait CycleLlm: Send + Sync {
    async fn call(&self, leg: &str, prompt: &str, timeout: Duration) -> Result<String, AppError>;
}
```
(`src-tauri/src/companion/brain/sleep_cycle/run.rs:57-59`)

The production implementation is `MeteredLegs` (`run.rs:62-71`), which forwards
to the metered one-shot path; the test implementation is `Canned`
(`sleep_cycle/tests.rs:86`), and both `run` helpers in the test module take
`llm: &dyn CycleLlm` (`tests.rs:99`, `:103`). This is the technique's acceptance
test satisfied for one subsystem: the whole cycle — admission, both legs, the
apply path, the report — runs with no model, no network and no interface.

Note what the seam's signature carries. `leg: &str` is a required parameter, not
an option, which is the same structural rule
[metered-llm-seam](../techniques/metered-llm-seam.md) describes: the seam cannot
be called without stating what kind of work is being paid for.

## Deviation: the turn path has no seam at all

The chat turn is the companion's primary callable and it is bound to the desktop
host in its signature. `send_turn` (`src-tauri/src/companion/session/turn.rs:46`)
takes `app: &AppHandle`, and the module imports `tauri::{AppHandle, Emitter}`
(`turn.rs:9`) because streaming is done by emitting framework events directly
from inside the turn. There is no turn sink; the sink *is* the desktop event bus.

The consequence is exactly the one the technique predicts: the turn cannot be
constructed in a test without the desktop framework, and a second transport
cannot reuse it. The cycle path — the one subsystem that was extracted behind a
trait — is the one that is unit-tested; the turn path is the one that is not.

## Deviation: the second consumer re-implements the companion, by written contract

The strongest evidence that the seam does not exist is that a second channel
already exists and does not use it. `.claude/skills/athena/brain.py` is a
232-line, zero-dependency Python bridge that reads and writes the companion's
brain from outside the application, so that a terminal channel can hold a
conversation whose episodes the sleep cycle will later consolidate. Its own
module docstring states the arrangement plainly (`brain.py:16-22`):

> Parity contract (verify against source when upgrading):
>   - markdown  `episodic.rs:478` `format_episode_markdown`
>   - node row  `episodic.rs` `append_episode` INSERT (importance 3, excerpt<=500B)
>   - FTS row   (node_id, body=content, tags='session:{sid} role:{role}')
>   - ids       `ep_{8 hex}` / `turn_{12 hex}`
>   - machine markers `episodic.rs:45` — terminal content must never start with one

Five behaviours of the durable write path, re-implemented in a second language
and kept aligned by a checklist that names Rust line numbers. Two admission
constants are mirrored as well and labelled honestly — "mirrored from
`brain/sleep_cycle.rs` (display only — the app's admission is authoritative)"
(`brain.py:36-38`).

Every property of the parity trap in the technique is present: it works today,
the copy is smaller than the original, the alignment is a human obligation, and
the anchors it cites are line numbers that move. It is a debt marker, correctly
labelled as one, and it is not a seam.

## The pattern that did work, in a neighbouring subsystem

The same product's daemon bridge faced the same problem — a second process could
not see in-memory ambient signals — and solved it the way this subject
prescribes rather than by re-implementing:
`docs/features/companion/athena-daemon-bridge.md` records the design space, and
the decisive line is that both processes render through the same function:
"The same `format_signals_for_prompt` is used by `AmbientContextFusion::format_for_prompt`
(windowed path) and the daemon. Byte-identical rendering for byte-identical
input." The alternative of letting each process capture its own signals was
rejected in writing because "two clipboard listeners on one machine race;
redaction runs twice with potentially different decisions, breaking the privacy
contract" — the argument
[operative-working-set](../techniques/operative-working-set.md) makes in general
form.

## What an extraction would cost here

Small, and localized. The turn already has its own lock module
(`session/locks.rs`), its own interrupt registry (`session/interrupts.rs`), its
own failure-ledger wrapper (`session/failure.rs`) and its own stream module
(`session/stream.rs`). What binds it to the host is the emit calls and the
`AppHandle` parameter — one capability, of the five, that has not been named.
Naming it would let the terminal channel call the turn instead of
re-implementing its write path, which is the whole return.
