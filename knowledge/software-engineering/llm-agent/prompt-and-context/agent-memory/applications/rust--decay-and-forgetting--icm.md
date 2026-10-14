---
layer: application
type: application
subject: agent-memory
technique: decay-and-forgetting
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# The tiers exempt from forgetting are the tiers the session opens with (icm)

Source tree: `github:rtk-ai/icm@5f402434` (2026-10-13), a single-binary memory store for
coding agents, read at release 0.11.4. The stack version is the floor its crates declare
(`edition = "2024"`, Rust 1.85). Nothing was executed; every claim is a traced path, read
against what the default configuration actually runs.

## The policy as the code states it

Each memory carries an importance: critical, high, medium or low. Decay multiplies a weight
down at a rate set by importance, and critical is exempt
(`crates/icm-store/src/store/memory.rs:546 "Critical-importance memories still skip decay entirely."`).
Pruning deletes what fell below a weight threshold, and two whole tiers are exempt
(`crates/icm-store/src/store/memory.rs:586 "Never prune critical or high importance memories."`,
`crates/icm-store/src/store/memory.rs:606 "DELETE FROM memories WHERE weight < ?1 AND importance NOT IN ('critical', 'high')"`).

## The policy as the default configuration runs it

- **Pruning runs only by hand.** Outside tests, prune has three callers: the prune command
  (`crates/icm-cli/src/main.rs:5557 "let pruned = store.prune(threshold)?;"`), a terminal UI
  action and a web dashboard action. No hook, schedule or recall calls it. So nothing ever
  leaves the store unless a person asks, in any tier.
- **Decay runs, and almost nothing reads it.** Recall triggers it
  (`crates/icm-store/src/recall.rs:274 "if bookkeeping && let Err(e) = store.maybe_auto_decay() {"`),
  but the default recall engine ranks by fusing lexical, vector and time ranks, with no weight
  term, so the decayed weight does not move on-demand recall. The one reader that multiplies
  it in is the session-start pack.
- **The session-start pack draws from the two exempt tiers.** Every session opens with a pack
  of this project's memories, injected before the first prompt, and its eligibility filter is
  importance (`crates/icm-core/src/wake_up.rs:113 "matches!(m.importance, Importance::Critical | Importance::High) || is_pref"`),
  ranked by importance, recency and weight
  (`crates/icm-core/src/wake_up.rs:210 "let recency = 1.0 / (1.0 + days / 30.0);"`).
- **Automatic writers fill those tiers.** The semantic extractor that turns tool output into
  memories files a decision, a bug fix, a preference or a constraint at high importance
  (`crates/icm-cli/src/extract_semantic.rs:48 "| AnchorKind::Constraint => Importance::High,"`),
  on an anchor match against the text. The optional rollup, which joins the three heaviest
  summaries of a topic and drops the rest (`crates/icm-store/src/store/maintenance.rs:362 "**Lossy by design.** The rollup is the join of the summaries of the"`),
  writes its result at high importance too
  (`crates/icm-store/src/store/maintenance.rs:449 "let mut consolidated = Memory::new(topic.into(), consolidated_summary, Importance::High);"`).
  That rollup is off by default (`crates/icm-cli/src/config.rs:372 "auto_consolidate_enabled: false,"`).

## What the tree shows about the technique

The technique's sharpest rule is that the tier the always-on lane draws from must be governed
at least as strictly as the tier retrieved on demand, and that an exemption is granted to the
kind whose loss is unrecoverable, never to a whole tier. This tree inverts both, without any
file being wrong. The always-on lane draws from exactly the tiers that cannot be pruned, and
the exemption covers every memory an anchor match calls a decision or a constraint, which is
the kind of entry that goes stale when the decision changes.

The tree's own guard is ranking by age inside a small budget: an old high entry loses its
place in the pack to newer ones. That is demotion by recency, not retirement, and it fails on
the case the technique was written from. A correction stored at the default importance does
not enter the pack at all (the agent tool defaults an omitted importance to medium,
`crates/icm-core/src/memory.rs:120 "near-duplicate MCP `icm_memory_store` call defaults to `Medium` when the"`
caller omits it), while the critical rule it corrects has weight that never decays and a
tier weight of ten (`crates/icm-core/src/wake_up.rs:200 "Importance::Critical => 10.0,"`). The
superseded rule keeps opening every session; the correction waits to be retrieved. Two
exceptions narrow this and do not remove it: a topic named as a preference is eligible at
any importance, and a correction phrased closely enough to clear the store's near-duplicate
threshold is appended into the rule's own entry, so both lines open the session together and
the reader adjudicates.

The second rule the tree illustrates: a store's forgetting policy is what its default
configuration runs. Here that is a weight only one reader consults and a delete nobody calls.

## Return condition

`unmeasurable` until replayed: build the binary, store a critical rule, then a contradicting
correction through the agent tool with no importance, then open a session. The prediction to
falsify: the pack shows the rule and not the correction.
