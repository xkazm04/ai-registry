---
layer: application
type: application
subject: triage-queues
technique: source-normalization
stack: react
verified_on: 2026-11-16
verified_against: react@19
---

# Source normalization: the React implementations in this repo

*Re-read 2026-11-16 at project HEAD `8d076db46a` (`react ^19.2.6`), read only.
The 2026-08-18 version described three surfaces. One of them, the companion
inbox, was deleted on 2026-10-06 (`f5a1c27d2b`), and its successor is the
decision roster below. The triage deck lost one source on 2026-09-14
(`bec576bc8f`, which removed the workspace-knowledge surfaces).*

## The unified triage model (six kinds)

`src/features/agents/quick-answer/triage/useUnifiedTriage.ts` fuses six "a
human must decide" kinds into one `TriageItem[]`: persona manual reviews,
build question groups, backlog ideas, policy proposals, evolution promotions,
and goals awaiting acceptance (`TRIAGE_KINDS`, `triageTypes.ts:337-344`). Its
deck UI is retired. The model now feeds the decision roster.

- **The item contract** is `TriageItem` (`triageTypes.ts`), and the adapters
  are in `triageAdapters.ts`. The adapters file's header (`:11`) calls
  `weight` an "explicit editorial judgement, documented per adapter". The
  severity exchange rate is applied at the adapter, in one place where it
  can be reviewed.
- **Per-source metadata survives in a compartment.** `TriageItem.payload` is
  a flat string map of machine ids. The roster's tiering reads
  `assignmentId` / `stepId` from it (`decisionOrder.ts:31-33`), and the
  deep links read it too. Ordering never does.
- **Source-count honesty is implemented twice.**
  - The `failures` ledger (`useUnifiedTriage.ts:199-208`, fed by
    `noteFailure`) exists because of an earlier bug. Every source used to
    end in a swallowed catch, so "a total outage settled `loading:false`
    with an empty array and rendered 'Deck cleared — nothing is waiting on
    you'".
  - `capped` (fed by `noteCapped`, `:451-455`) marks fixed-limit reads that
    came back full: "A query that asks for 50 and gets 50 has told you
    nothing about what is behind it" (`:159`). Only ideas, whose
    `triageIdeas` keyset page reports a pending total, give a printable
    `remaining` (`:784`).
- **Fan-in tolerates latency skew.** Each source has its own effect and its
  own generation counter (`ideaFetch.gen`, `proposalGen`, `goalGen`,
  `:525-550`), and the comments at `:667` and `:730` reject one
  `Promise.all` over unrelated subsystems.

## The decision roster (successor of the companion inbox)

`src/features/decision-center/useDecisionRoster.ts` is now "the ONE source of
decision items and counts" for every reader: the command bar, the title-bar
badge, the companion's orb queue, the Home widget and the sidebar badges
(header, `:1-31`).

- It takes the triage model's sources before any session filters (`:224`).
  It adds approvals, incidents, reports and council subjects through
  adapters in `roster/decisionAdapters.ts`, plus chat threads derived on the
  client.
- It orders the merged list by one law, `compareDecision`.
- Counts come from one backend round-trip. `roster/chipCounts.ts:6-8`
  states the honesty rule: a failed count read marks every chip it feeds as
  `failed`, "keeping the last number it ever answered, never inventing a 0".
- Per-chip load errors carry each source's own failure (`:284-305`).

## The incidents inbox (nine source tables)

`src/features/overview/sub_incidents/libs/incidentTaxonomy.ts` is unchanged in
shape. It maps nine tables (`IncidentSourceTable`, `:14-23`) onto one row
shape, with:

- a shared `severityRank` (`:89`);
- per-source icons and labels (`INCIDENT_SOURCE_ICONS` at `:25`,
  `sourceTableLabel` at `:49`);
- a severity shape that does not depend on colour (`severityShapeStatus`,
  `:105`);
- per-source operator guidance (`incidentGuidance`, `:139`).

## Where the technique's roster warning bites

The 2026-08-17 replay in `docs/concepts/golden-paths/findings-triage-queue.md`
§0 measured this. The badge's count hand-enumerated six human-decision
queues out of thirteen. That left 314 of 370 waiting items (84.9%) invisible,
including `persona_healing_issues` (179 items, oldest 82 days) and
`audit_incidents` (99 items). The only queues ever drained to zero were the
ones on the roster. The figures above were re-read in that document today
(lines 51, 68 and 86). They were not re-measured.

The roster has since grown. `pending_counts`, now in
`src-tauri/db/src/repos/dev/portfolio.rs:287` (`PendingCounts`, `:160-190`),
counts nine queues on the server:

- goal acceptance, manual reviews, ideas, policy proposals and promotion
  proposals;
- open `audit_incidents`;
- unread reports;
- companion approvals (folded in by the command layer);
- council subjects a person can decide.

Build questions and chat are added on the client. `audit_incidents` is
therefore now on the roster. `persona_healing_issues` is still not one of
the counts, although the incidents inbox lists it as a source table
(`incidentTaxonomy.ts:21`). Whether its backlog has drained since it became
visible there has not been measured.
