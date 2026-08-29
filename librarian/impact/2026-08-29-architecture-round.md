---
plan: 2026-08-29-architecture-round
domain: software-engineering
source_run: 2026-08-29-4
machine: kazda-dev-box
status: ready
---

# Impact plan — landing the architecture round in the connected fleet

Seven `/deepen` workers read all seven connected trees on this device while
enriching the bundle; every candidate below was seen in code this day, with
paths. Standing authorization (operator, 2026-08-26, recorded in memory):
findings may be applied and committed on each project's active branch without
asking; never push. This plan sequences that work so a session can execute a
wave, verify, and record.

**Read this first — the round's own techniques govern the plan.** Wave 1 items
are mechanical and small: execute directly. Wave 3 items are structural:
`structure-is-not-delegable` says the operator picks which candidates are worth
having, and `structural-improvement-loop` says each emits a **spec before a
diff**. Do not promote a Wave-3 item into Wave 1 because it looks easy.

## Wave 0 — pre-flight (per session, cheap)

1. `git -C <project> status` — pof (65 dirty), systedo-case (76), gravitone (99)
   carry heavy in-flight work: commit ONLY with pathspecs (`git commit --only`),
   never `add -A`; skip any file already dirty and note it instead.
2. Confirm the cited line still exists before editing (citations drift in days —
   this round re-anchored dozens).

## Wave 1 — quick wins (mechanical, technique-cited, ≤ ~20 lines each)

Grouped by project; each carries its governing technique and the check that
proves it landed. Execute in one session per project; one commit per item or one
per project with itemized body.

### personas (master; rust needs `cargo test -p` scoped runs — full suite is 45m)
| # | Change | Technique | Where |
|---|---|---|---|
| P1 | `get_cipher`: memoise success only (same fix `get_master_key` already got) — a transient keychain failure currently bricks encryption until restart | guarded-singleton-accessor | `src-tauri/core/src/crypto.rs:1223-1233` |
| P2 | Auth guard rejects via `AppError` (kind `forbidden` + category); then `isIpcAuthFailure` branches on `kind`, not substring; fix `errorRegistry.ts:135` | error-shape-mapping | `src-tauri/src/ipc_auth.rs:634-637`, `src/lib/tauriInvoke.ts:536-551` |
| P3 | `lab_crud! update_run_status`: add status predicate (CAS spelling from `events.rs:370-390`) — read-validate-update race, ×5 lab modes | transactions-and-units-of-work | `src-tauri/db/src/macros.rs:429-482` |
| P4 | Blast-radius probes: stop `.unwrap_or(0)` — propagate, render broken-preview (register #w9 item 1) | blast-radius-computation | `src-tauri/db/src/repos/core/personas.rs:1974,2023,2038` |
| P5 | One strict boolean env parser for the crate (two vocabularies today) | absent-degrades-malformed-fails-fast | `core/src/crypto.rs:463-469` vs `core/src/run_budget.rs:83-88` |
| P6 | Autosave: version check before write (older build must not overwrite newer `autosave.json`) | persistence-and-migration | `src-tauri/…/persistence.rs:149-176` |
| P7 | `JSON.parse(...) as Composition` → membership test on the migration path | persistence-and-migration (rehydration) | `src/features/plugins/artist/sub_media_studio/hooks/useMediaStudioPersistence.ts:171,281` |

### ascent (moonshot/wave-0)
| # | Change | Technique | Where |
|---|---|---|---|
| A1 | `DB_CONNECTION_LIMIT`: default a real cap (file documents the fan-out×pool failure, then defaults to none) | next-order-of-magnitude-only / absent-guard-is-loud | `src/lib/db/client.ts:93-112` |
| A2 | `envInt`: refuse/loud-log a present-but-unparseable value (recorded deviation) | absent-degrades-malformed-fails-fast | `src/lib/integrations/ingest-guard.ts:32-35,61-62` |
| A3 | `ghJson`: typed `denied / absent / unreachable`; retire the 422 "nearly always scope" guess (recorded deviation) | capability-honest-refusal | `src/lib/integrations/copilot.ts:99-114`, `copilot/sync/route.ts:62-75` |
| A4 | Import-boundary lint on `@/lib/db/client` / raw client (one `$transaction` already escaped) | layering-rules | eslint config + `src/lib/public-scan-quota.ts` |
| A5 | `scan-ingest.ts:81`: stop swallowing the PR-fetch throw to null — a failed sensor must not persist as "repo has no PRs" (recorded deviation, oldest on this device) | failure-not-empty-success / codebase-scanning | `src/lib/scan-ingest.ts:81` + `buildScanWarnings` |

### kp (main)
| # | Change | Technique | Where |
|---|---|---|---|
| K1 | Centralize `archived_at IS NULL` (scoped accessor or view) before the next picker forgets it | archive-restore-semantics / layering-rules | `app/_lib/db/jobs.ts:140,157`, `app/_lib/db/analytics.ts:1072` |
| K2 | Two routes loop singular fetches past `getJobsByIds` — batch them | batching-and-n-plus-one | `app/api/decisions/peer-context/route.ts:92-93`, `app/api/schedule/invite/bulk/route.ts:83-84` |
| K3 | `devcase.ts:733-734`: add LIMIT/pagination to the full-table load on the fastest-growing table (sync driver blocks the event loop) | read-models-and-projections | `app/_lib/db/devcase.ts:733-734` |
| K4 | `payloadJson` decoding: route the three silent conventions through the existing `safeRowParse` | row-mapping | `decision-record-store.ts` + `threshold-history/route.ts:82-86`, `group-eval.ts:118-122` |

### personas-web (master)
| # | Change | Technique | Where |
|---|---|---|---|
| W1 | Add incidents filter store to `clearUserScopedCaches` (its own application already reports the gap) | identity-scoped-eviction | `src/app/dashboard/incidents/incidents-page/useIncidentsFilterStore.ts` |
| W2 | Waitlist GET: stop returning failed counts as zeros under 200 (comment already names the defect) | capability-honest-refusal | `src/app/api/waitlist/route.ts:178-189` |

### pof (master — 65 dirty files: pathspec discipline)
| # | Change | Technique | Where |
|---|---|---|---|
| F1 | Wrap the read-merge-upsert in the transaction its sibling already documents | transactions-and-units-of-work | `src/app/api/checklist/complete/route.ts:64-96` (pattern at `project-progress/route.ts:98-134`) |

### systedo-case (master — 76 dirty)
| # | Change | Technique | Where |
|---|---|---|---|
| S1 | Archive cap eviction: recorded accounting instead of `console.warn` (it deletes audit records) | change-logging | `src/lib/twin/archive-store.firestore.ts` |

## Wave 2 — record the verdicts (analysis, no code edits)

The scan's deviation counts for this round's subjects come from the OTHER
machine; this device's map pairs are `unknown`. Each Wave-1 session finishes by
writing verdicts into that project's `.ai/registry-map.json` (the `/conform`
shape: `state`, `evidence`, `evaluatedAt`, `evaluatedAgainst`) for every pair
its items touched — deviation → fixed-this-session where applicable. That makes
run N+1 start from judgments instead of re-reading, and feeds the signals lane
so the registry's demand column stops being another machine's number.

Also owed here: `node scripts/signals-collect.mjs` after the waves, and one
re-verification touch on the applications that cite code Wave 1 changes (their
`verified_on` moves again; the personas drift-gates application already carries
the "resolved" addendum shape to copy).

## Wave 3 — structural candidates (operator picks; spec before diff)

1. **personas — orphaned vector store** (register #108; 100% orphaned today):
   implement `orphan-reconciliation` — registry over the 8 delete doors, durable
   ledger, one dependent-side sweep over `persona_memory_embedding_meta`. The
   new technique is the spec's skeleton.
2. **personas — preview through the enforcement path** (register #31, 3.29×
   understatement): wire the zero-caller dry-run at `storage.rs:99` into the
   delete preview.
3. **personas — sceneStore**: keyed token map + in-flight dedup registry
   (residual after the 2026-08-29 fix); and the unbounded
   `browser_bridge/relay.rs:87` channel gets a bound + shed policy.
4. **kp — member removal** hard-deletes user+memberships with no blast radius or
   reassignment: the ownership-transfer gap; also the banked return condition
   for an `entity-lifecycle` technique — implementing it pays twice.
5. **kp — cv_analysis fold-in** (Phase 3 in kp's own docs): fold the multimodal
   path behind the provider seam; closes kp's self-documented single-door
   violation.
6. **systedo-case — dependent-side orphan walk** (its own comment admits
   operator-memory reliance).
7. **gravitone — in-payload schema version + rehydration validation** for
   `studioDb` (its backlog names it; millions of unkeyed records).
8. **ascent — followups/handoff**: membership read + CAS around the per-id
   unguarded writes.
9. **Fleet-wide, smallest-first**: one load test anywhere (zero exist in seven
   projects; every stated limit is `basis: inherited`) — unlocks L3 for
   scale-investment-timing and the ceiling's missing *method* half.

## Sequencing and effort

- Wave 1: one session per project; personas is the largest (P1–P7, scoped cargo
  tests). Suggested order: personas → ascent → kp → personas-web → pof/systedo
  (tiny). Each session: fix → test → path-scoped commit per item → Wave-2
  verdicts → done. No pushes.
- Wave 3: separate sessions, one candidate each, spec first, operator approves
  the spec (items 1–3 are personas-heavy; 4–5 kp).
- Re-run `librarian-scan` after Waves 1–2; the demand column for this machine
  becomes real, and the next `/deepen` round selects against honest numbers.
