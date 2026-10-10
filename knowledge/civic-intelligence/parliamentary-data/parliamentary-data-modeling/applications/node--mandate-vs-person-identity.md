---
layer: application
type: application
subject: parliamentary-data-modeling
technique: mandate-vs-person-identity
stack: node
status: forged
verified_on: 2026-10-10
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Node: mandate-keyed events, term-keyed denominators

The politicas repo ingests the Czech Chamber of Deputies bulk dumps and scores
every sitting MP on a six-part contribution index. The stack is Node 24,
witnessed by the CI pin in `.github/workflows/ci.yml:36` "node-version: 24".
The tree was read at commit `5f88b00`. The measurements below come from the
chamber's public dumps (`poslanci.zip`, `hl-2025ps.zip`) as published on
2026-10-10, replayed outside the product because no local store was available.

## Where the split holds

The event tables keep the publisher's mandate id verbatim. The ballot loop reads
it straight off the row, `lib/ingest/sources/psp.ts:341` "const mandatePspId = colInt(r, 0);",
and the excuse table does the same. The writer resolves to the person through the
mandate table only when a query needs the human. Tenure is a stored,
closed-vocabulary property (`full_term` / `replacement` / `departed` /
`never_seated`), derived by one deterministic rule over all 207 term-10 mandates.
The tree also records the distinction the technique's last section draws:
`scripts/case-loops/effort/tenure.ts:28` "fromAt is the date the MANDATE AROSE" (not the oath).

## Where it does not: the denominators

The scorer divides by term-level counts. The writer says so:
`scripts/data-analysis/kg-contribution-ingest.ts:82` "Participation + attendance denominators (term-level)",
and `scripts/data-analysis/kg-contribution-ingest.ts:84` "const rollCallsHeld = activeVotes.length;".
Then `lib/analysis/contribution.ts:249` "input.ballotsWithPosition / input.rollCallsHeld"
and `lib/analysis/contribution.ts:250` "input.excusedDays / input.sessionDays".
The project had already seen the symptom and logged it as open:
`docs/data-analysis/frontier.md:92` "tenure normalization for replacement MPs".

## The experiment

- **Instrument.** A replay over the public dumps: 207 mandates, 2,230 active roll
  calls (voided and manual votes excluded, as the writer does), and 74 sitting days.
- **Arm A** is the tree's rule: present ballots over all roll calls of the term,
  and excused days over all sitting days of the term.
- **Arm B** is the technique's rule: the same numerators over the mandate's own
  eligible roll calls and its own sitting days. Excuses are bounded by the
  mandate's window.
- **Floor:** full-term mandates must not move. The publisher writes one ballot
  row for every roll call for each of them, so their own count is the term's
  count. 0 of 193 changed either rate, and the largest change in points was 0.000.
- **Target:** 10 short mandates change. Participation for the three sitting
  replacements goes 0.321 -> 0.974 (seated in June), 0.403 -> 0.910 (May) and
  0.577 -> 0.807 (March). For the three departed members it goes
  0.606 -> 0.904, 0.389 -> 0.699 and 0.165 -> 0.581.
- **Ranking.** Under arm A, 8 of the 15 lowest participation rates belong to
  short mandates. Under arm B only the four never-seated mandates stay there,
  and the tree already flags them. The June replacement moves from 6th lowest
  of 207 to 189th.

The error runs in opposite directions in the two rates. Participation is
depressed, because a short window's ballots are divided by a full-term count.
Attendance is flattered, because a short window's excuses are divided by
full-term days. One departed member's attendance goes from 0.743 under arm A to
0.208 under arm B. So a composite can look ordinary while both of its rate
components are wrong.

## The falsifying seams

Two seams were chosen because each could have refuted part of the technique.

**The opportunity set.** The project's own framing of the fix is a window that
starts at the mandate's start date. The technique says to use eligible
opportunities. The two disagree for the March replacement: a window from the
day the mandate arose holds 1,738 roll calls, but the publisher wrote rows for
only 1,595 of them, because the oath came later. The date-window fix would score
that member 0.741 instead of 0.807. The publisher's per-mandate rows already are
the opportunity set, and they need no date arithmetic.

**Never-seated status.** The tree classifies `never_seated` from the
activity signature the technique calls a no-observed-activity signal:
`scripts/case-loops/effort/tenure.ts:98` "const neverCast = (typeof p.props.participation_rate !==",
taken together with an end date. This could have mislabelled a seated member.
It did not. All four agree with the project's hand-researched enrichment notes,
for example `docs/data-analysis/case-effort/batch-001.md:22` "Slib nesložil".
The bulk tables also offer nothing better. The vote-code vocabulary has a
pre-oath value, but it occurs on 0 of 451,600 ballot rows this term. One of the
four has excuse rows dated a month after she gave up the seat, so an excuse row
is not evidence of being seated either. The signature also reads a missing
participation value as zero. That branch cannot fire on the current population,
because the writer stamps a value on every term mandate that has a person node.
It would fire on a partial ingest.

## What shipped

This is the first step of a `task`, not the fix. The pure helper that computes
the per-mandate denominators and its test landed on the project's default
branch as `5af5c7f`. Its 5 tests pass, the existing contribution suite passes
22 of 22, and the project's pre-push gate passed (typecheck plus 4,121 tests).
A plan beside it in `.ai/tasks/` names the remaining steps: the three writers,
the formula-reference bump, the methodology copy and the writer run. The
helper is not wired in yet. Wiring it changes a published formula, and the
stored scores only move when the writer runs against the store. Wiring the
code alone would stamp a new formula reference onto unchanged numbers.

## What this realization cannot do

The replay read the public dumps, not the stored graph, so it is inferred from
the writer's code, not observed, that the last stored scores used these
denominators. The volume components (bills, interpellations, speeches) remain
raw counts over each member's window. The technique allows that only with the
tenure stated, and the tree states it with a per-member tenure note and a
low-score reason badge.
