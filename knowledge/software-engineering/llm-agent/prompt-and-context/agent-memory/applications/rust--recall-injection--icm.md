---
layer: application
type: application
subject: agent-memory
technique: recall-injection
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A session-start pack built for the prompt cache, packed by cutting items (icm)

Source tree: `github:rtk-ai/icm@5f402434` (2026-10-13), a single-binary memory store for
coding agents, read at release 0.11.4. The stack version is the floor its crates declare
(`edition = "2024"`, Rust 1.85). Nothing was executed; every claim is a traced path.

## The always-include tier, and what it was optimized for

Every session opens with one injected block, split between a deterministic identity and
preferences snapshot and a pack of the project's important memories
(`crates/icm-cli/src/main.rs:5243 "let snapshot_budget = max_tokens.saturating_mul(2) / 5;"`,
two fifths to the snapshot). The block is built to keep a provider's prompt cache warm, and
says so twice: ties in the ranking are broken by id so the
`crates/icm-core/src/wake_up.rs:128 "ordering stays deterministic — required for the prompt-cache prefix"`
match survives, and the body carries no count header, because
`crates/icm-core/src/wake_up.rs:327 "Render body without prepending a token-count header — that count"`
would change with every edit and break the prefix. That is the technique's always-include
tier treated as a tax paid on every call, and priced as such.

The snapshot half also does the technique's "say what you did not show": when entries do not
fit, it reports how many were dropped rather than dropping them silently
(`crates/icm-core/src/context_snapshot.rs:14 "budget is exhausted, surface `over_budget` + `dropped` so the caller"`).

## Where the pack departs from the packing rules

- **Items are truncated.** An entry longer than half the budget is cut to a per-entry cap
  (`crates/icm-core/src/wake_up.rs:258 "let per_memory_cap = (max_chars / 2).max(200);"`),
  and the tree marks the cut
  (`crates/icm-core/src/wake_up.rs:268 "elaboration. Add a `[…]` marker so the user knows."`).
  The technique's rule is that half a memory reads as a complete one; a marker says that
  something was cut and not what, which is the trailing-ellipsis case the subject's loss-site
  inventory already names. The cut lands on exactly the long entries this store produces by
  design, because its near-duplicate merge appends a new statement to the end of an old one,
  so the newest line of a merged entry is the first thing the cap removes.
- **The packer stops at the first entry that does not fit**
  (`crates/icm-core/src/wake_up.rs:275 "if !out.is_empty() && total.saturating_add(line_len) > max_chars {"`,
  then `break`), where the technique skips it and keeps walking. With the cap above, the
  stop rarely costs a whole entry, because no entry is larger than half the budget; it does
  cost the shorter entries ranked behind the one that tipped the total.
- **The cached narrative outranks the live pack.** When an LLM-written briefing of the
  project exists, it is injected in place of the ranked pack
  (`crates/icm-cli/src/main.rs:5273 "load_cached_briefing(project_name.as_deref()).unwrap_or(live_pack)"`),
  guarded only against an empty store
  (`crates/icm-cli/src/main.rs:5262 "by a stale cache (a briefing whose memories were since pruned/forgotten)."`),
  and refreshed at session end once it is
  `crates/icm-cli/src/main.rs:10599 "const BRIEFING_REFRESH_INTERVAL: std::time::Duration = std::time::Duration::from_secs(6 * 3600);"`
  old. A memory forgotten or corrected inside that window keeps being injected, in the
  tier with the most standing, until the next refresh fires. The cache is keyed by age,
  not by the state of the memories it summarizes; the refresh rule that fits a summary is
  the one the context-hierarchy subject uses for its digests, regenerate when the inputs'
  digest changes.

## What this realization cannot do

It cannot tell a reader how current the briefing is: the injected block carries no date of
generation and no count of the memories it summarized, so a consumer cannot discount it.

## Return condition

`unmeasurable` until replayed: build the binary, generate a briefing, forget one memory it
mentions, open a session within six hours. The prediction to falsify: the forgotten memory's
content is in the session's opening block.
