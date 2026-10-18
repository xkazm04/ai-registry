---
layer: application
type: application
subject: audience-absorption-at-scale
technique: attention-share-cap
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# A share cap that had to learn rank parity

*Verified against Shadowrunr OS, an AI-hosted villain livestream (github.com/xkazm04/shadowrunr,
branch main, commit `4025231`), on 2026-10-19. The workspace pins its toolchain in
`rust-toolchain.toml` (channel 1.97.1). Measured figures come from the night tournament
night-0dd890a1ad, n as stated, 2026-10-18; its run data is private and is cited by name,
never by path.*

The technique says: cap the share of the host's answers any viewer or class may hold, let
rank buy ordering but never the queue, defer rather than drop, apply the bounds in code
after any model picker, and judge the result as answers per message by rank. The show's
chat picker is the stage that decides which already-moderated messages the host answers in
each 5-second beat. It is the clearest realization of the technique in the tree, and it
carries the incident that taught the technique its inversion section.

## What the picker does

The module header states the contract: under a volume threshold a deterministic score
decides, above it a model chooses from a pre-ranked pool, and "Either way the same
fairness" constraints apply afterwards
(`crates/shadowrunr-brain/src/picker.rs:3-4 "deterministically pre-ranked pool. Either way the same fairness"`),
including "an attention-share cap so a whale cannot monopolise the room"
(`crates/shadowrunr-brain/src/picker.rs:6 "an attention-share cap so a whale cannot monopolise the room"`).

The five layers the technique names are all present:

- **Capped rank bonus.** Rank adds a step per level up to a ceiling,
  `crates/shadowrunr-brain/src/picker.rs:29 "Dread Council cannot buy attention"`, with the
  ceiling at `crates/shadowrunr-brain/src/picker.rs:50 "rank_weight_cap: 1.5,"`.
- **Rank-aware short window.** A viewer may be picked in at most two of the last five beats
  (`crates/shadowrunr-brain/src/picker.rs:52 "share_max: 2,"`), plus one beat for the top
  three ranks
  (`crates/shadowrunr-brain/src/picker.rs:130 "self.cfg.share_max + rank_idx(rank) / 3"`), and
  the recency penalty softens with rank rather than vanishing
  (`crates/shadowrunr-brain/src/picker.rs:232 "Higher ranks wait a little less between answers."`).
- **Relative long bound.** Over an hour of beats
  (`crates/shadowrunr-brain/src/picker.rs:55 "whale_window: 720,"`) no viewer is picked more
  than twice the busiest lowest-rank viewer, floored at the short-window allowance
  (`crates/shadowrunr-brain/src/picker.rs:161 "let bound = self.cfg.whale_factor * t.max(self.cfg.share_max) as f64;"`).
  With no lowest-rank viewer in the room the bound steps aside, as the technique says
  (`crates/shadowrunr-brain/src/picker.rs:137 "or `None` when no Thrall was in"`).
- **Defer, never idle.** Over-cap candidates are set aside and fill any empty slots least
  recently answered first
  (`crates/shadowrunr-brain/src/picker.rs:303-304 "so even then nobody is favoured by rank"`).
- **Code after the model.** The picking model's prompt asks it to "Never let one viewer
  dominate"
  (`crates/shadowrunr-brain/src/picker.rs:457 "Never let one viewer dominate"`), but its
  returned order passes through the same deterministic constraints, and an unusable reply
  falls back to the deterministic pick
  (`crates/shadowrunr-brain/src/picker.rs:497 "llm picker unusable, fallback"`).

## The incident: a rank-blind cap inverted the room

The first version capped every viewer identically. In a pilot, the top rank was answered on
29% of its messages and the lowest on 48%, and the test that now guards the picker records
the cause in its doc comment:
`crates/shadowrunr-brain/src/picker.rs:553-554 "Dread Council answered 29% vs Thralls 48%, because the few high"`,
"ranks chat every beat and the share cap treated them like everyone else". Nobody had tuned
against rank; invested viewers simply talked more, and a per-head cap bound them hardest.
This is the upward lesson the technique's inversion section carries: the failure arrives by
accident, and the metric that exposes it is answers per message by rank.

The regression test runs a mixed room for 300 beats, with the lowest rank speaking every
other beat and higher ranks every beat, and asserts both directions at once: every rank is
answered per message at least as often as the lowest
(`crates/shadowrunr-brain/src/picker.rs:629 "assert!(rate(r) >= thrall"`), and no viewer
exceeds the long bound. A second test pins the small-room case: a lone top-rank viewer with
two quiet low-rank viewers is held to at most 35 of 50 beats and at least 17.

## What the measurement adds

In the night tournament night-0dd890a1ad (2026-10-18), with this picker and the input caps
held fixed, swapping the host's core model from the small tier (n=60 judged runs) to the mid
tier (n=59) moved humour landed from 41% to 69% and in-character from 90% to 99%, while
responsive-to-chat went from 74% to 73% and addresses-viewer-by-name-or-rank from 76% to
75%. Responsiveness is set by the allocation machinery, not the model: the golden path's
"attention is set by the machinery" section rests on this table.

## Deviations

The technique asks for a **class aggregate** bound; the picker has none. Its bounds are per
viewer (short window, relative long window) and a capped rank bonus, so twenty top-rank
viewers each inside their own bounds can still collectively take most answers. The
regression test would not see it, since it asserts per-viewer bounds and per-rank rates
only. Gifting reaches the picker only through rank (the rank ladder counts gifted
subscriptions), so a large gifter's priority is bounded by the capped rank bonus — the gift
rule holds, but through the rank cap rather than a gift-specific bound.
