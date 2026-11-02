---
layer: application
type: application
subject: verifiable-giveaway-draws
technique: single-attempt-no-reroll
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Single attempt in a Rust streamer desktop core (CastleControl)

CastleControl is a desktop tool a human streamer runs beside their stream; its "Lots"
giveaway draws freeze a pool, announce a seal on the stream overlay, wait for a future
drand quicknet round and derive winners. Citations were resolved against the main checkout
at commit `8ef2d8e` on 2026-11-02; the workspace pins `rust-version = "1.97"`
(`Cargo.toml:8`). Three crates carry the technique: `cc-verify` (the byte-exact proof core),
`cc-lots` (the owned, one-way draw lifecycle) and `cc-core/src/lots` (the module that
sequences seal, publication and cast).

## The lifecycle is made one-way by ownership

`seal_roll` takes the open `Roll` by value, so the pool cannot be edited after sealing, and
`SealedDraw` is deliberately not `Clone`. The guarantee is stated as compile-fail doctests
rather than as review comments:

- `crates/cc-lots/src/draw.rs:22` "The original Roll cannot be edited after sealing (ownership is transferred)"
- `crates/cc-lots/src/draw.rs:78` "No unfreeze API exists. A failed seal/cast also consumes the attempt."
- `crates/cc-lots/src/draw.rs:186` "Reusing an attempt, including after an error, is refused by the compiler"
- `crates/cc-lots/src/draw.rs:171` "A cap mismatch fails the draw, without a retry or an alternate winner set."

That last line is the strict branch of the replacement rule: winners that fail the
post-derivation cohort check fail the attempt, because the specification carries no
replacement rule the verifier could walk.

The seal is durable before it can be used: `crates/cc-lots/src/draw.rs:80` "The seal is
durably audited before the sealed value can escape", and the cast refuses to run against a
store that lost it — `crates/cc-lots/src/draw.rs:224` "seal audit is missing from draw
store". A cast also refuses a clock that runs backwards: `crates/cc-lots/src/draw.rs:216`
"cast predates seal".

## The module refuses late announcements and early casts, and never resamples

`LotsModule::seal` in `crates/cc-core/src/lots/lifecycle.rs` checks the derived round's
scheduled time against the clock both before and after it emits the synchronous
`lots.sealed` publication:

- `crates/cc-core/src/lots/lifecycle.rs:25` "every failed attempt is consumed; there is no reroll of a frozen snapshot"
- `crates/cc-core/src/lots/lifecycle.rs:71` "seal announcement missed the target round; attempt consumed"
- `crates/cc-core/src/lots/lifecycle.rs:79` "Publication is synchronous. Do not accept a late announcement even if"

`cast` returns a stored result on retry and refuses an early cast without consuming the
pending draw:

- `crates/cc-core/src/lots/lifecycle.rs:110` "A retry returns the durable result, never another random sample or event."
- `crates/cc-core/src/lots/lifecycle.rs:126` "seal announced; wait for the target quicknet round before casting"

The round itself is never a free parameter: `crates/cc-verify/src/lib.rs:16` "A drand round
is the first scheduled time STRICTLY AFTER sealed_at + margin_s", computed in
`crates/cc-verify/src/beacon.rs:63` "pub fn round_after(&self, sealed_at: &str, margin_s: u32)"
and rechecked on every verify through `selected_round` (`crates/cc-verify/src/model.rs:163`
"round schedule/chain").

The operator-controlled fallback keeps its name end to end:
`crates/cc-verify/src/lib.rs:27` "Its label is always" and
`crates/cc-lots/src/draw.rs:185` "this path is never described as a public beacon."

## Deviations from the standard

- **No resume after restart.** An announced draw lives only in memory:
  `docs/guide/lots.md:93` "An unfinished sealed attempt is memory-only and cannot resume after a".
  A crash between announcement and cast destroys a draw the room watched being announced;
  the standard is to persist the announced state and resume it.
- **A transport error consumes the attempt instead of waiting.** `cast` removes the pending
  draw (`crates/cc-core/src/lots/lifecycle.rs:132` "ok_or_else(not_found)?") before
  fetching the round at `crates/cc-core/src/lots/lifecycle.rs:136` "self.beacon.round(&pending.published.sealed)?",
  so a passing outage ends the draw; the runbook then asks for a fresh roll
  (`docs/guide/lots.md:181` "A transport/signature failure consumes that attempt; preserve its evidence").
  This is reroll-safe, but the abandoned attempt is recorded only in the local draw ledger,
  not published beside its successor.
- **The announcement is overlay-only.** `docs/guide/lots.md:174` "No Twitch chat
  announcement is sent", so the stream recording is the sole witness of timing
  (`docs/guide/lots.md:217` "announcement recording establishes timing; a downloaded writ alone cannot.").
  A chat line would give viewers a second, scroll-back witness they control.
