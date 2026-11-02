---
layer: application
type: application
subject: chat-vote-duels
technique: ballot-grammar-one-per-viewer
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97.1
---

# A first-word grammar, first ballot stands, counted over open spans

*Read against Castle Control, the main checkout at C:\Users\kazda\Spooky\CastleControl on
2026-11-02 (commit not recorded; the read was made without version control). The
workspace pins its toolchain in `rust-toolchain.toml` (channel 1.97.1). Nothing here was
executed; every claim is a reading of source, and the night-lane regression it cites is
recorded by the project itself as authored and not yet run.*

Castle Control is a desktop tool for a human streamer. Its tournament ("Tiltyard") runs
2-, 4- or 8-entry brackets of head-to-head duels decided by chat. The counting lives in
the core process, in `crates/cc-core/src/tiltyard/ballots.rs`, as a pure classifier over
chat lines that the moderation layer has already judged, and the tournament module
recomputes the count from that record on every action.

## The grammar

The grammar is first-word, digits only. `ballot_option` trims the line, skips an optional
paid-message prefix, and reads the first byte:

- `crates/cc-core/src/tiltyard/ballots.rs:29 "let side = match text.as_bytes().first()? {"`
  with `:30 "b'1' => TiltyardWinner::Left,"` and `:31 "b'2' => TiltyardWinner::Right,"`.
- `crates/cc-core/src/tiltyard/ballots.rs:34 "let rest = text[1..].trim_start_matches('!');"`
  then `:35 "(rest.is_empty() || rest.chars().next().is_some_and(space)).then_some(side)"`
  — the token may carry exclamation marks and must then end or be followed by whitespace,
  so "1", "1!" and "1 that intro" vote left, while "12", "1st" and "1." are chatter.

The whitespace set is spelled out rather than borrowed from the language, because the
core must agree with the TypeScript engine it was ported from:
`crates/cc-core/src/tiltyard/ballots.rs:5 "ECMAScript whitespace: Rust's trim differs for BOM and NEL."`
That is the technique's "say it in the configuration, not in the parser's habits" made
concrete: two runtimes, one written-out character class.

The paid-message prefix is read past and counted once. `cheer_end` recognises a
case-insensitive "cheer" plus digits plus whitespace
(`crates/cc-core/src/tiltyard/ballots.rs:12 "eq_ignore_ascii_case"`),
`:28 "let text = cheer_end(text).map_or(text, |end| &text[end..]);"` strips it, and the
tally reports how many counted ballots arrived that way without weighting them:
`crates/cc-core/src/tiltyard/ballots.rs:134 "tally.cheers_as_one += u32::from(event.cheer);"`.
The module's first line states the weight:
`crates/cc-core/src/tiltyard/ballots.rs:1 "Post-verdict ballots only. Mirrors ballot-window.ts and tally.ts (unit weight)."`

## Identity and redelivery

Lines are first collapsed by message identifier, then by voter, in that order:

- `crates/cc-core/src/tiltyard/ballots.rs:94 "if !messages.insert(item.message.message_id.clone()) {"`
  drops a redelivered line before it can become a repeat.
- `crates/cc-core/src/tiltyard/ballots.rs:102 "Verdict::Pass if !voted.insert(String::from(item.message.user_id.clone())) => {"`
  makes the **first** ballot stand; later ones are `Status::Repeat`. Each side's total
  therefore only rises during a window, which matches what the overlay shows.
- The match on the moderation verdict comes before the identity check
  (`crates/cc-core/src/tiltyard/ballots.rs:99 "Verdict::Bar => Status::Barred,"`,
  `:100 "Verdict::Hold => Status::Held,"`), so a barred or held first ballot does not use
  up the viewer's one vote — the precedence the status technique asks for.
- Ordering is by the time recorded with the message, stable on ties:
  `crates/cc-core/src/tiltyard/ballots.rs:88 "ordered.sort_by_key(|(t, _)| *t); // Stable: equal timestamps retain ledger/page order."`

## The window as open spans

The module does not count a single interval. It keeps a list of wall-clock spans and
classifies only lines whose recorded time falls inside one, recomputing the tally from
the moderation record on each call:

- `crates/cc-core/src/tiltyard/mod.rs:199 "let items = self.gatehouse.tiltyard_ballots().await?;"`
  and `:208 "let tally = ballots::tally_at(&events, now_ms);"` — a full recount, not a
  running total.
- `crates/cc-core/src/tiltyard/mod.rs:250 "// Close the prior wall segment at the action boundary. Paused chat"`
  and `:251 "// and earlier attempts of the same match can never leak into votes."` — the
  upward lesson the technique took: a pausable window is a list of spans, and an undone
  attempt's chat stays out of the retry.
- `crates/cc-core/src/tiltyard/mod.rs:277 "// elapsed deltas. A restart freezes downtime and resumes here."`

## Where it falls short of the technique

The grammar is never shown as a sentence; the overlay prints `1 · <title> · <count>` and
`2 · <title> · <count>` (`packages/renderer/src/tiltyard.ts:21 "snapshot.left.count"`),
which implies the tokens but not that the first word decides. The first-ballot-stands
rule is likewise not stated on screen. Lines outside the spans are filtered before
classification (`crates/cc-core/src/tiltyard/ballots.rs:86 ".filter_map(|item| time(millis(&item.message.at)).map(|t| (t, item)))"`),
so early and late lines have no status and the tally's `seen` excludes them — see the
status technique on why that reconciliation proves less than it appears to.
