---
source: github:millionco/debug-agent
kind: practitioner tool repository (a skill that makes a coding agent debug from runtime evidence, a local NDJSON log server, a hosted log relay, a small browser-automation package)
url: https://github.com/millionco/debug-agent
title: debug-agent - evidence-based debugging for coding agents
author: millionco
words: 119 (README) + about 5,700 across the operating documents read (two SKILL.md revisions, remote-relay plan, server and relay source); 141 files in tree
extracted: 9
accepted: 1
declined: 0
leads: 1
already_covered: 0
untriaged: 2
applied: 1
shipped: 0
dispatched: 1
run_id: intake-1009-dbga
siblings: 0
rescan_when: a release changes the skill's loop (the older revision in the tree is the history of one such change); or 8 weeks elapse (2026-12-04)
---

# The loop that precedes the failing check: a debugging subject, forged from one tool's skill

Intake 2.15.0, run 2026-10-09. A source originates a finding. It never authorizes one.
No live sibling at claim. Commit `295af90bcfc16ba3578e6be91ed1c552261bb257`, cloned per
Phase 2b, deleted at Phase 9. Class: **practitioner tool, skill-shaped repository**.
The landing page is 119 words; the in-tree skill documents are about 5,700. Expected
yield: one mechanism family, not a spread of claims. The README was read last.

**Declared focus from the previous scorecard row, applied:** "when the consumer cannot
run arm B, say in the applied row which session will, and put the audit into that
session's existing checklist". It applied (see Apply).

## Sweep

Operating documents: `packages/debug-agent/skill/SKILL.md` (the loop),
`.agents/skills/debug-agent/SKILL.md` (an earlier revision; the diff is the history of
one change), `.agents/skills/web-performance/SKILL.md`, `.ultraplans/remote-logging/
prompt.md` (the relay's build plan). Instrument: `src/server.ts` (the per-session sink,
dedup, one DELETE that clears one session). Relay: `debug-agent-remote/src/log-session.ts`
and `constants.ts` (the caps). Tests: none of them exercises the loop's rules.

## Design record

Systems in the tree: one (the debugging loop and its sink). Entries are mechanisms of the
loop, not the architecture of the code.

| # | decision | forces | corpus | home |
|---|---|---|---|---|
| D1 | no fix without runtime evidence | an explanation is produced at the same confidence right or wrong | boundary of a chain-verification technique, not owned | NEW |
| D2 | 3-5 hypotheses, probes mapped to them, closed three-state verdict | a probe nobody can attribute proves nothing | NONE | NEW |
| D3 | code for a rejected hypothesis is reverted before the next round | speculative guards accumulate and mask the next defect | NONE | NEW |
| D4 | every probe in a find-able marker; cleanup is search, delete, search, diff | removal by memory leaves strays | NONE | NEW |
| D5 | clear own sink per run, label runs, never touch another session's sink | several sessions share one machine | NONE | NEW |
| D6 | reproduction ladder: existing check, own script, human steps | the human is the slowest rung | boundary of a repair-oracle technique | NEW |

Routing count: six entries, one system, six with no home, **all six share one
home-if-new**. The per-system clause (three or more with no home) and the cluster clause
both fire. A scoped forge was needed, not a handoff of the repository: the repository is
one small tool, the subject is the loop.

## Triage

Class read before the table: practitioner tool, n=1. Corroboration here is
corpus-internal plus a prior-art agent that opened the nearest neighbours; the fetch
budget was not binding for the subject (0 of 3) and 1 of 3 was spent on a primary for a
side finding.

| # | candidate | shape | prior art | G/R/C | read | decision |
|---|---|---|---|---|---|---|
| 1 | The live-defect debugging loop (D1-D6) | subject | none; closest are about other jobs | XL | real gap | **accepted, forged** (E4: an XL row is a forge dispatch the run owns, the operator sees it here) |
| 2 | Attribute a slow frame to a script instead of timing a suspect | technique | page-load-pipeline names responsiveness as its job and the applied record says responsiveness "has no proxy" | 2/1/2 | real gap | **untriaged**: GAIN 2 - RISK 1 = 1 < 2. Primary read in run (W3C long-animation-frames: 50 ms threshold, per-script attribution, `sourceURL` empty for opaque scripts, forced style/layout field not normative). Return: next run that has a second leg, or a fleet UI project with an INP complaint |
| 3 | A helper that prints one JSON handshake line and exits, idempotent by liveness probe, instead of telling the agent to background it | amendment | boundary of a persistent-daemon technique | 1/2/1 | partial | **untriaged**: rests on the tool's own history alone. Return: a second independent source |
| 4 | An unauthenticated hosted relay for probe output: capability id, 1 h TTL, entry and total caps, 413 | lead | no home; nearest is a telemetry budget technique | - | thin | **lead**: the secrets rule is prose only and the endpoint answers any origin. Return: when a fleet project debugs a deployed service, or a security subject takes the capability-URL shape |
| 5 | Anchors for 9 mechanisms | - | - | - | - | folded into 1 |

Nothing declined. Untriaged is not declined: rows 2 and 3 carry anchors above and nobody
verified them against a second source.

**Rule that governed each admitted row:** row 1 under the escalation rule (E4); row 4
under the corroboration table (a lead needs no corroboration).

## What the forge produced

Subject `engineering-process/codebase-stewardship/live-defect-debugging`: a golden path,
six techniques (`reproduction-ladder`, `hypothesis-mapped-probes`, `marked-temporary-
probes`, `run-scoped-evidence`, `evidence-gated-fix`, `revert-rejected-fixes`) and three
`node` applications against the source's clone. 54 of 54 anchors held under
`check-anchors.mjs`. Placement: `llm-agent/orchestration` and `llm-agent/runtime-and-io`
were both at the 10-subject cap (V1), `codebase-stewardship` held eight.

Worker overrides: none. Its answers to the spec's open questions: one technique for
hypotheses and probes (each half decays alone); a read is evidence when it observes a
fact reasoning cannot change; an absent probe firing is a precondition on the run, not a
fourth verdict.

**Deviations the applications record, read from the source and not run:** the mandatory
one-line probe template carries no marker, run label or hypothesis id; a second daemon
start in the same temp directory returns the first session's sink, so one agent's clear
wipes another's evidence; the server serves or deletes any session id in the URL; the
cleanup search string is a single literal with no positive control; an empty sink after a
run and after a clear look identical; the tests never exercise the loop.

**Upward lesson (source-contradicts-itself):** the newer revision clears through the
server instead of deleting the file; it keeps the clear with whoever created the sink,
which is the property the technique asks for.

## Apply (Phase 7.5)

Seam hunt: personas `.claude/skills/sentry/SKILL.md`, section 3.3 Diagnose to 3.4 Apply.
It diagnoses from a stack trace, applies the fix and marks the issue resolved on a local
gate, with no evidence step between. A stack trace locates; it does not confirm which
hypothesis is true. The seam was chosen to falsify: if the project's fixes from that
skill never needed more than a one-line guard, the technique would not apply there.
Result: **unapplied**. The project's history does not tag fix commits with the Sentry
issue id, so the three real cases needed for a simulation cannot be pulled from the tree,
and the live arm needs the project's Sentry token and a live issue. The unpaired edit to
that skill was not shipped (unproven does not commit). Which session will run arm B: the
next `/sentry` batch in personas that meets a non-guard diagnosis; the audit belongs in
that skill's existing Phase 3.3 step, not a new checklist. Instrument that would make it
measurable: a count of Sentry issues reopened after `inNextRelease` resolution, per
diagnosis class.

## Directions

`directions=n/a` for the tool's own architecture; no fleet project's scope names an
agent-debugging context. Not proposed: personas (the skill above is coverage, not a
direction).

## Leads

- Row 4 (relay), return condition above.
- A fleet project that deploys a service the agent cannot reach on localhost would be the
  first real consumer of the remote half.
