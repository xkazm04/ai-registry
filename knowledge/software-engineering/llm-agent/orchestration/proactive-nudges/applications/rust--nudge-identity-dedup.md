---
layer: application
type: application
subject: proactive-nudges
technique: nudge-identity-dedup
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Nudge identity & dedup in Athena's proactive queue (Personas)

Witness: personas master `47d21e927`, read on 2026-10-31. The version is the `rust-toolchain.toml` pin (`channel = "1.96.1"`). Identity
is minted in `src-tauri/src/companion/proactive/`, and the presentation tier
dedups in `src/features/companions/athena/athenaStore.ts`.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Key = (kind, subject-ref) | `Nudge { trigger_kind, trigger_ref }`. The module doc says rows are "deduped against any already-unresolved message for the same `(trigger_kind, trigger_ref)`" (`mod.rs`). |
| Dedup at admission | `enqueue_if_new` runs one query over `status IN ('queued', 'delivered')` and inserts only on a miss. Resolved and expired rows do not block. |
| Live window as the cooldown | This is the technique's state-predicate variant. A delivered card blocks its identity until the user engages or dismisses it, or until `PROACTIVE_DELIVERED_EXPIRY_WINDOW` (7 days) ages it out. There is no tuned cooldown. |
| Identity persisted | The ref is stored on the row, so a restart re-reads it and mints nothing new. A read-only query of the live database found zero duplicate identities among queued and delivered rows. |
| Stable subject-refs | Per-entity kinds key on the entity id. `credential_reauth` is 12 rows over 3 refs, and `dev_goal_stalled` is 327 rows over 33 refs: re-noticing coalesces onto the same identity across expiries. |
| Cross-tier dedup on the same key | `appendProactive` drops a delivery whose id is already loaded ("Dedupe by id", `athenaStore.ts:1080`). |

## The seam that could falsify it: hour-bucketed digests

Two digest kinds put time into the identity on purpose:
`trigger_ref: Some(format!("bucket:{bucket}"))` with the bucket set to
`Utc::now().format("%Y-%m-%dT%H")`, in `message_triage.rs` and `execution_review.rs`.
The comments claim "at most one execution-review card per hour can be pending - a
flood aggregates instead of stacking". This is a deliberate counter-design to the
technique's "no timestamps in the key". It was chosen as the seam because, if the
bucket held, the rule would be too strict for digests.

**The live record.** The database holds four `message_digest` rows. All four came
from 2026-10-16, at 14:57, 15:02, 16:58 and 17:04. Each pair is five to six minutes
apart and straddles an hour boundary. All four were delivered, all four were live at
once, and all four expired unread. The flood stacked at exactly the edges the
bucket creates.

**Paired experiment.** The four recorded arrivals were replayed through the verbatim
`enqueue_if_new` predicate in an in-memory table:

| Arm | Identity | On hit | Cards delivered | Peak concurrent unresolved | Pass summaries reachable |
|---|---|---|---|---|---|
| A (shipped) | hour bucket | none | 4 | 4 | 4/4 |
| B1 | singleton | replace payload | 1 | 1 | **1/4** |
| B2 | singleton | merge payload | 1 | 1 | 4/4 |

Target: cards delivered and peak concurrency. Floor: summaries still reachable,
because the user ignored every card. B1, the technique as first written, moves the
target and fails the floor: each digest pass is a delta, so replacing it throws the
unread deltas away. B2 moves the target and holds the floor. The technique now
carries the delta-payload amendment this produced.

**Structural fact.** Neither tier could build B2 as the code stands. The Rust side
has no supersede path at all: on a hit, `enqueue_if_new` returns `None` and the new
digest text is dropped. That is why the bucket exists. The React side drops any
redelivery of a loaded id, so a superseded card would never repaint. Adopting B2
means changing both tiers: a merge-on-hit for digest kinds, plus a version-aware
replace in `appendProactive`.

## What this realization cannot do

- No supersede for any kind. A per-entity nudge whose substance changes, such as a
  credential failing in a new way, keeps its first text until it is resolved or
  expires.
- No times-noticed or superseded counter. Coalesced re-noticing leaves no trace, so
  efficacy tuning cannot tell "noticed once" from "noticed forty times while live".
- `execution_review` has no rows on this machine. Its bucket is the same code shape,
  but that kind was not observed.

Ship: not in this run. The change spans both tiers. It is recorded in the project's
`.ai/applied.jsonl` as its next change.
