---
layer: application
type: application
subject: agent-memory
technique: consolidation
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A near-duplicate merge that never loses a line, and a supersedence table nobody writes (icm)

Source tree: `github:rtk-ai/icm@5f402434` (2026-10-13), a single-binary memory store for
coding agents, read at release 0.11.4. The stack version is the floor its crates declare
(`edition = "2024"`, Rust 1.85). Nothing was executed; every claim is a traced path.

## The merge door, as it was corrected

When a new memory is stored, the store looks for one in the same topic above a cosine
threshold (`crates/icm-core/src/store.rs:61 "pub const DEDUP_SIMILARITY_THRESHOLD: f32 = 0.95;"`)
and updates it instead of adding a row. Two corrections in this door are the technique's own
rules, reached the hard way:

- **The measure follows the question.** The door used to ask the hybrid ranking score, whose
  blend (`crates/icm-core/src/store.rs:71 "is tuned for human-facing recall RANKING, not"`)
  meant a purely semantic match
  (`crates/icm-core/src/store.rs:76 "match (no shared keywords, cosine=1.0) could never exceed"`)
  the threshold. It now asks cosine alone.
- **Never overwrite.** Similar is not the same: two distinct turns of a benchmark dialogue
  (`crates/icm-core/src/store.rs:100 "conversation scored 0.98 and the second overwrote the first)."`).
  The merge now appends
  (`crates/icm-core/src/store.rs:104 "`incoming` rather than discarding `existing`, trading a little"`),
  and a merge may raise an importance and never lower it
  (`crates/icm-core/src/memory.rs:124 "Re-store with a higher priority upgrades; it never"`).

## What the door still does not ask

The technique orders the questions: contradiction and supersedence first, duplicate last,
because a contradiction is usually a one-word polarity swap of the belief it overturns and
clears any surface threshold comfortably. This door asks only the duplicate question. A
sentence that reverses a stored one in the same topic ("always run the migration first",
"never run the migration first") is the pair a surface measure scores as near-identical
(unmeasured on this tree's embedder, which is the return condition below), and when it clears
the threshold it is appended into the old entry
(`crates/icm-mcp/src/tools.rs:1182 "summary: icm_core::merge_summaries(&existing.summary, content),"`).
Nothing is lost, which is what the correction set out to buy; nothing is superseded either.
The entry now asserts both, in order, and the reader adjudicates at every recall.

The merged entry also keeps the old entry's date
(`crates/icm-mcp/src/tools.rs:1171 "created_at: existing.created_at,"`). The tree's own recall
votes on that column when a question names a period, and its session-start pack ranks on it,
so the newer statement is read at the older statement's date by both.

## The supersedence the tree did build

There is a keyed facts table with exactly the supersedence the technique asks for, on a
code-owned key: setting a value for an entity and key closes the active row
(`crates/icm-store/src/store/facts.rs:73 "UPDATE facts SET superseded_at = ?1 WHERE id = ?2"`)
and reads see only open rows
(`crates/icm-store/src/store/facts.rs:59 "WHERE entity = ?1 AND key = ?2 AND superseded_at IS NULL"`).
Its writers are a command a person types
(`crates/icm-cli/src/main.rs:5413 "let id = store.set_fact(entity, key, value, source)?;"`) and the
import of an export. The extraction hooks write memories, the agent tool surface has no fact
call, and neither recall nor the session-start pack reads the table. So the mechanism that
would retire "the deploy day is Wednesday" when Thursday arrives exists in the tree and is
reached by no automatic writer and no reader; the beliefs agents actually write and read live
in the table that only appends.

## Return condition

`unmeasurable` until replayed: build the binary, store a rule and its polarity reversal in one
topic through the agent tool, and recall the topic. The prediction to falsify: one entry,
holding both sentences, dated at the first.
