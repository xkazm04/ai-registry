---
layer: application
type: application
subject: prompt-assembly
technique: live-attachment-delta-resharing
stack: rust
verified_on: 2026-09-05
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A companion prefix rebuilt every turn, measured block by block

A local-first desktop companion whose runtime composes a system prompt per
turn from named blocks (constitution, identity, an observability digest,
recalled memory, plugins, voice, mode and static addenda) and hands it to a
stateful coding-agent process that holds the conversation. Observed toolchain
`rustc 1.96.1`; the crate's floor is `rust-version = "1.80.0"`
(`src-tauri/Cargo.toml:115`).

The seam is the composer's block table
(`src-tauri/src/companion/prompt/compose.rs:154-176`) and the instrument the
project had already built beside it: a per-block FNV-1a content hash recorded
on every turn (`prompt/budget.rs:116-131`, `turn_ledger.rs:138`,
`prompt_block_hashes_json`), added because the ledger's cache-creation count
had climbed 239,852 to 305,401 tokens turn over turn while block *sizes*
held, which sizes alone could not explain.

## The measured arms

Same recorded turns through both policies. The ledger held 66 turns with
block hashes (of 1,829 turns total; the column is recent), 65 consecutive
pairs, 2026-08-09 to 2026-09-01, read from the companion database read-only.

| Arm | Policy | Bytes composed across the 65 pairs |
| --- | --- | --- |
| A | re-render every block every turn (current) | 11,708,577 chars |
| B | send a block only when its content hash moved | 1,662,815 chars (14.2% of A) |

Per block, share of turns unchanged from the previous turn:

| Block | Turns | Unchanged | Chars | Chars unchanged |
| --- | ---: | ---: | ---: | ---: |
| constitution | 65 | 96.9% | 8,083,589 | 7,824,698 |
| recall | 65 | 47.7% | 1,303,078 | 474,530 |
| mode_addenda | 65 | 92.3% | 670,996 | 650,664 |
| plugins | 65 | 96.9% | 655,001 | 635,110 |
| observability | 65 | 7.7% | 582,188 | 47,035 |
| static_addenda | 65 | 100.0% | 190,580 | 190,580 |
| voice | 65 | 100.0% | 143,845 | 143,845 |
| identity | 65 | 100.0% | 79,300 | 79,300 |

Verdict **better** on the measurable the technique names, bytes transmitted
per turn: 86% of the composed prefix is unchanged turn over turn and would
not be sent under the policy. The churn is two blocks, the observability
digest (rewritten on 92% of turns) and recall (52%).

## The structural fact

The observability block sits **third of eight** in the composed order
(`compose.rs:156`), above plugins, voice, mode and static addenda, which
are stable on 92 to 100% of turns. A block that changes on nine turns in ten,
placed above 1.6 million characters of stable material, rebuilds the prefix
from its own position down on every call. The ledger's cache series says the
same thing from the provider's side: cache creation ran 310,223 tokens on the
first recorded turn and 171,947 on the last, against cache reads of 11,332 to
15,064, so the prefix was being created, not read, on every turn of the
series. Nobody designed that; it fell out of an ordering nobody measured
until the hash column existed.

This is the technique's stated boundary made concrete. The prefix is rebuilt
per turn for an agent-held conversation, so there is no base in the record
for a diff to land on; the delivery of the delta is **position**, a
stability-ordered stack with the volatile blocks last, and the hash column is
the witness the technique says to consult before calling a block stable.

## The next change, filed rather than shipped

Move `observability` and `recall` below every block whose unchanged share is
above 90%, and re-read the ledger: the measurable is cache creation per turn
falling toward the size of the two volatile blocks while cache reads rise
toward the size of the six stable ones. The change is a few lines in the
block table, but its proof needs live turns the run cannot produce, so it is
filed as the project's next change with the number that decides it, not
committed on the strength of the replay.

## What this realization cannot do

It cannot send nothing. The stable 86% still has to be present in every
prompt, because the agent process re-sends its system prompt on every call;
the saving the policy buys here is cache reads instead of cache creation, not
absent bytes. And the replay counts characters, not tokens: the ledger's
token columns are per turn, not per block, so the 14.2% is a byte share and
the token share is inferred.
