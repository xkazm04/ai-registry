---
layer: application
type: application
subject: legislative-change-tracking
technique: bill-fate-dating
stack: node
status: forged
---

# Fate dating in the print-register ingest (Node)

The politicas ingest (`lib/ingest/sources/psp-legislation.ts`) reconstructs
bill fates and committee-assignment dates from the psp.cz `tisky.zip` dump,
where the assignment table (`hist_vybory.unl`) carries no date column — timing
comes only via `id_hist → hist.datum` (`:19-27`).

## The date rule, and the incident that forced it

`parseCommitteeAssignments` (`:197-247`) collapses event rows to one
assignment per (tisk, committee): strongest status wins, and `assignedOn` is
the **earliest** dated step at that strongest status. The rule is stated in
the header "because it used to be dump row order" (`:181-196`): the previous
`if (rank >= prev.rank)` loop let the *last* row in file order win ties, so
psp.cz's dump-write order decided a published date. Measured: 180 pairs had
multiple rows at their strongest status, 175 resolving to different dates;
one was live on /denik (tisk 43204 → organ 1772, 2026-02-03 vs 2026-02-12).
The fixed comparator (`:233-243`) takes a strictly stronger step *with its
own date, including a null one* ("the date must describe the step the status
names"), and on rank ties keeps the earliest non-null date — deterministic
under any input order, "which is the whole point".

The status ladder confirms the routing standard too: `STATUS_BY_TYP` maps
only documented codes, and an undocumented `typ` (the live dump carries a
`typ = 4` no constant covers) becomes `"unknown"`, ranked *below* every real
status (`:150-165`) — the parser previously folded unknowns into `"navrzeno"`,
the weakest real status, which rendered on /zakony as a factual claim that
the print had been proposed for referral. The token is deliberately left out
of the renderer's label catalog so it prints verbatim (`:144-148`).

## Publication: refuse, keep, count

`parseBillFates` (`:385-441`) resolves procedural state through the
`stavy → typ_stavu` lookup chain and attaches the Sbírka (statute collection)
publication from `hist` zaver fields. Two separate checks, matching the
standard's "two distinct findings": `zaverIsoDate` (`:354-361`) round-trips
through `Date.UTC` to reject non-calendar dates (and documents that years
0–99 fail the round-trip on purpose — a two-digit year is not a publication
year); then `isPlausibleIsoDate`, **imported** from the app's single
plausibility boundary (`lib/analysis/plausible-date.ts` — its own header:
"so the boundary is one and the same across the whole application"), bounds
it by `retrievedOn`, the day the dump was read, defaulted to the ingest clock
and pinnable by tests (`:379-390`).

The incident is kept in the header (`:369-377`): the dump's
`zaver_publik = "28.08.0202"` typo once published `sb: "88/0202"` — a law of
the year 202 — because the citation was built from anything regex-shaped like
a date. A refused step now leaves `sb`/`publishedOn` null together, keeps the
bill and its `stav`, and increments `refusedPublications`, which the ingest
consumer reports as a corpus total (`BillFate`, `:335-344`). Rows whose zaver
fields are empty or the literal `"null"` are skipped as non-publications —
verified live that such rows are different event types entirely (`:364-367`).
Multiple valid publication steps keep the latest (`:434-438`).

## Sponsorship confirmation

The adjacent role parsing confirms the attribution standard: authorship comes
from the signature table with rank and joined-later flag preserved and
lowest-rank dedupe (`parseSponsorRoles`, `:281-297`) — **not** from
`tisky.id_osoba`, which is empty for recent-term MP bills; that column is
authoritative only for written interpellations (`psp-activity.ts:43-50`).
Rapporteurs are collected from three tables with scope preserved and are
keyed by seat id, mapped to the person id via the mandate table
(`:299-333`).
