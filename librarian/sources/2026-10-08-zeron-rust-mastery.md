---
source: github:zeronsh/zeron
kind: vendor-free repository (a native multi-device agent controller; Rust workspace of 22 crates, gpui UI, CRDT sync over a TypeScript edge)
url: https://github.com/zeronsh/zeron
title: zeron - multi-device controller for coding agents
author: zeronsh
words: 3241 (ARCHITECTURE.md) + about 22000 across the operating docs read; 543 Rust files, 428k lines in tree
extracted: 8
accepted: 2
declined: 0
leads: 2
already_covered: 1
untriaged: 3
applied: 1
shipped: 0
dispatched: 0
run_id: zeron-rust
siblings: 1
rescan_when: a release adds the foreign-cursor or per-profile sync backend the architecture marks deferred; or 8 weeks elapse (2026-12-03)
---

# Rust mastery from a Rust-first agent controller: what the transport layer knows

Intake 2.15.0, run 2026-10-08, operator focus "Rust coding mastery". A source
originates a finding. It never authorizes one. One live sibling at claim
(a doctor-dispatch run, not holding any subject this run touched).

**Declared focus from the last scorecard row, applied:** classify a `ship 0`
as `no-seam`, `blocked` or `declined`. This run's zero is `blocked`, see below.

**Mined from a clone**, commit `0c4835d2b73aa632b7b4d626ee0826a25ec1c9b9`. The
checkout dropped the `.github/` tree (long-path failure on this platform), which
cost the CI definitions and nothing else read here. Swept in the method's
order: operating documents (`ARCHITECTURE.md`, `docs/transport-reliability.md`,
`docs/sync-resource-resilience.md`, `docs/regressions/*`), the instrument and
its tests (`crates/sync/src/socket.rs`, `socket/progress.rs`), the types (the
registry outbox in `crates/doc/src/registry.rs`), then the README never.
Landing-page words are not the count of record.

**Expected yield, said before the table:** a repository of this size is a
forge-shaped source, but its public lessons live in a handful of
measurement-bearing docs; expect two techniques and a pile of banked leads.

## Design record (abridged; three of seven entries written, the rest not verified)

- decision: liveness is time since a byte last moved at the lowest layer,
  judged per direction. forces: slow uplinks where "sent" completes long before
  the peer has it. buys: slow healthy sessions survive, stalled writes die.
  rejects: a total-duration cap and reply-based keep-alive evidence. where:
  `crates/sync/src/socket.rs:89`, `crates/sync/src/socket/progress.rs:77`.
  corpus: stream-proxy-hop (heartbeat technique present, endpoint lease absent).
- decision: in-flight is a per-connection flag, pending is durable. forces:
  retransmit amplification at high round-trip time. where:
  `crates/doc/src/registry.rs:751`. corpus: sync-replication (no technique).
- decision: `WorkspaceScope` captured once at start and never re-resolved on an
  auth change (`ARCHITECTURE.md` local-first section). corpus: NOT CHECKED.

**Routing count:** two entries with no home verified, one unchecked. Below the
handoff threshold of three; the run stays in intake. The unchecked entry is
banked, so this is a lower bound, not a clean zero.

## Triage

| # | Lane | Shape | Eff | Candidate | Prior art | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Progress lease, not wall clock | stream-proxy-hop (heartbeat) | 3/1/2 | **accept** (+1 gain: it inverts "a keep-alive proves liveness" for a blocked write; +1 risk: home contested with the hop box) |
| 2 | K | technique | M | In-flight is per connection | sync-replication | 2/0/2 | **accept** |
| 3 | K | technique | M | Prove a fix by restoring the base methods under retained tests | quality-gates | -/-/- | untriaged |
| 4 | K | catch | S | Receiver check and clear outside the attach lock | concurrency-guards | - | already covered (critical-section-across-a-suspension) |
| 5 | K | technique | M | A reserved slot survives a handoff; a displaced focus cannot win it back | admission-queue | -/-/- | untriaged |
| 6 | K | technique | S | Focus priority is a monotonic sequence apart from the cache clock | admission-queue | -/-/- | untriaged |
| 7 | K | lead | S | Drop that defers directory removal to the blocking pool | none found | - | lead: return when a second tree shows the same Drop-on-runtime hazard |
| 8 | K | lead | M | Immutable workspace scope captured at start, apart from live auth state | not mapped | - | lead: return after a map over settings/auth subjects |

Rows 3, 5, 6 are untriaged, not declined: nobody judged them. Anchors:
`docs/regressions/whale-session-revisit.md` (restored-base red run),
`docs/sync-resource-resilience.md` (slot and focus paragraphs).

**Auto-admission:** auto=2/0/0, fp=0. Rows 3, 5, 6 were not scored (budget), so
this is the count of rows that were.

## Landed

- `stream-proxy-hop/techniques/progress-lease-not-wall-clock` with
  `applications/rust--progress-lease-not-wall-clock`; every anchor checked with
  `check-anchors.mjs` against the clone (6 of 6 held).
- `sync-replication/techniques/in-flight-is-per-connection` with
  `applications/rust--in-flight-is-per-connection` (5 of 5 held).
- Corroboration: code read in the cloned tree for both, plus the source's own
  repeated measurement for the second (three alternating runs per arm, 30 vs 20
  push attempts). No web fetch spent (0 of 3). Not a measurement of ours.

## Apply (Phase 7.5)

Mode **simulation**, three real cases from a managed project's own history, and
the project's measured ledger was read first. That project had already
converged on the same rule independently on 2026-09-08 (a decision call
supervised by a wall clock died twice, at 180 s and at 480 s, the second having
produced nothing because the spawn never started; it moved to liveness
supervision with an absolute backstop). Case 1 and 2 are those deaths; case 3
is a later CLI read with no deadline at all that sat 15 minutes. Policy B
(progress lease plus a hard ceiling) survives 1, kills 2 early on the
spawn-produced-nothing rule, and bounds 3. **Falsifier:** a child that prints
spinner lines while stuck keeps a lease alive; the project's own supervisor
stamps on any stdout or stderr line and so does not apply rule 2. Remaining
seam: five callers of a shared prompt runner still use an absolute 120 to 600 s
cap. Verdict `better`, at simulation.

**Ship 0 is `blocked`:** a seam exists and the change is coverage, but the
paired arm needs a build and test of the host crate that did not run in this
session. Not `declined`, not `no-seam`.

## Currency

None. No application's citations were re-resolved.
