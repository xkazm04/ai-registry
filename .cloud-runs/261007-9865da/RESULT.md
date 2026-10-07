# cloud(261007-9865da) - lead corroboration, software-engineering ordering cluster

Run date 2026-10-07. Branch `claude/cloud-261007-9865da`, cut from `origin/main` at `067127d4`.
`librarian/inbox.md` is unchanged between `067127d4` and the clone, so the lead keys are valid.

## Summary

- **Dispatch check:** all seven keys (L159, L160, L330, L334, L335, L336, L353) are unstruck
  rows in `software-engineering`, each with nearest subject `-`. No dispatch errors.
- **Ruled (struck in inbox, rulings in subject notes):** L159, L160 and L335. All three are COVERED.
- **Left open (not struck):** L330, L334, L336 and L353. They are undecidable this run.
- **No technique, golden path or application was changed.** Nothing was regenerated, because
  the generated files are current.

### Why nothing landed upstairs: egress

The environment's network policy denied every documentation host I tried:

| host | result |
| --- | --- |
| `www.postgresql.org` | EGRESS_BLOCKED |
| `developer.mozilla.org` | EGRESS_BLOCKED |
| `www.ag-grid.com` | EGRESS_BLOCKED |
| `tc39.es` | connect_rejected |
| `sqlite.org` | connect_rejected |
| `learn.microsoft.com` | connect_rejected |

The proxy's `noProxy` list allows only package registries. So **zero** primary sources were
fetched. The three attempted fetches failed before any content arrived.

The brief requires a cited primary source with a verbatim quote for any amendment. I did not
write quotes from memory. Training-data convergence is real for L330, L334 and L353 (SQL
`RANK`/`ROW_NUMBER` semantics, ES2019 stable `Array.prototype.sort`). However, landing on it
without a fetched page would break the brief's "primary source cited" rule. I therefore left
those leads open and drafted their text below for a session that can fetch.

### What was measured instead (supporting evidence only, not authorization)

I reproduced the mechanisms in the container. The scripts are in the session scratchpad and
are not committed.

- **SQLite 3.45.1.** I stored two rows with the same `started_at` (ids 2 then 1) and ran
  `SELECT id ... WHERE bench='b' ORDER BY started_at DESC LIMIT 1`:
  - With no index, the plan was `SCAN runs` plus `USE TEMP B-TREE FOR ORDER BY`, and the query returned **id 1**.
  - After `CREATE INDEX idx_bench ON runs(bench, started_at)`, the plan was `SEARCH runs USING COVERING INDEX idx_bench (bench=?)`, and the query returned **id 2**.
  - Adding `, id DESC` pinned the result to id 2 in both cases.

  This reproduces L159's mechanism: adding an index changed which tied row read as "latest".
- **SQLite window functions** over the same tie: `rank()` returned 1, 1, 3 and `row_number()`
  returned 1, 2, 3.
- **Node v22.22.0.** The input was pre-sorted by population. A stable sort on tier alone kept
  the order `Praha, Prachatice, Prasily`. Adding `|| a.id - b.id` changed it to
  `Praha, Prasily, Prachatice`: the 572-person village came before the 11,119-person town,
  which is the shape L353 describes. This was a synthetic reproduction, not politicas data.

## Verdicts

| lead | subject | verdict | evidence (URL) | verbatim quote | proposed landing |
| --- | --- | --- | --- | --- | --- |
| L159 | table (sorting); also versioning-snapshots | covered | corpus: `knowledge/software-engineering/operations/governance-and-records/versioning-snapshots/techniques/version-identity.md`; `.../ui-surfaces/data-display/table/techniques/sorting.md`. Mechanism reproduced in SQLite (above). Primary-doc fetch blocked by egress. | version-identity: "\"the latest version\" queried by highest number is not merely wrong on a duplicate — it is *unstable*, returning whichever row the query plan prefers." sorting: "**Always append an immutable unique tiebreaker** — the row identity — as the final comparison term." | none. Inbox struck; ruling in `librarian/subjects/software-engineering/table.md`. |
| L160 | test-harness (negative-control-tests) | covered | corpus: `knowledge/software-engineering/engineering-process/build-and-release/test-harness/techniques/negative-control-tests.md` | "Measured: a listing whose tied rows came back in plan-dependent order was first covered by reading it twice and comparing; that test passed on the unfixed code. The replacement arranges inputs that *disagree* with the intended order and asserts the pinned sequence, and it was verified by deleting the tie-break clause and watching it fail." | none. Inbox struck; ruling in `librarian/subjects/software-engineering/test-harness.md`. |
| L330 | table (sorting) | undecidable (egress): no primary source could be fetched. Mechanism reproduced (rank 1,1 vs row_number 1,2). Corroborates in corrected form; see draft. | intended: PostgreSQL "Window Functions" page (`postgresql.org/docs/current/functions-window.html`) - blocked | none (not fetched; no quote written from memory) | Draft amendment A to `table/techniques/sorting.md` (below), for the Director after a fetch. |
| L334 | table (sorting) | undecidable (egress). The symptom is real by construction. The prescription ("same tiebreaker as the display sort") is weaker than the corrected rule: rank over peers so the tiebreaker never enters the rank. | same as L330 - blocked | none | Same draft amendment A. L330 and L334 are two lanes (politicas, personas-web) converging on one rule. |
| L335 | table (client-server-split) | covered | corpus: `knowledge/software-engineering/ui-surfaces/data-display/table/techniques/client-server-split.md`; prior ruling L332 (2026-09-23 note) | "Never: sort or filter on the client below a server-truncated window; counts computed on a tier that cannot see the whole predicate's extent." | none. Inbox struck. The facet-count tell needs the personas-web tree (Handoff). |
| L336 | table (filtering) | undecidable (egress + tree). Plausible, with one boundary the lead misses: where the client paginates, the tbody maps the *page*, so the export must take the filtered and sorted array **before** windowing, not "the same array the tbody maps". | intended: a data-grid vendor's CSV-export page (AG Grid) - blocked; systedo-case tree not in clone | none | Draft amendment B to `table/techniques/filtering.md` (below). |
| L353 | table (sorting) | undecidable (egress + tree). Mechanism reproduced in Node. Commits `26d695a` and `22f03d6` are unverified (no politicas tree). | intended: MDN `Array.prototype.sort` stability section - blocked | none | Draft amendment C to `table/techniques/sorting.md` (below). |

Of the public-documentation evidence the brief named:
- **Would settle (once fetchable):** L159 (PostgreSQL's ORDER BY ties / LIMIT plan-dependence
  text; the lead is covered anyway), L330 and L334 (PostgreSQL `rank` vs `row_number`), and
  L353's rule (ECMAScript/MDN sort stability).
- **Needs a fleet tree, not a doc:** L335's facet-count evidence, L336's export wiring, and
  L353's commit hashes.

## Draft amendments (NOT landed - each owes the fetch named)

**A - `sorting.md`, after "The tiebreaker must be the *identity*..." (L330 + L334; owes the
PostgreSQL window-functions page):**

> A tiebreaker decides *position*, never *rank*. It makes tied rows reproducible, but it does
> not make one of them better than the other. A rank shown to readers is computed on the sort
> key alone, so peers share it (the `RANK`/`DENSE_RANK` shape). A number minted from the full
> order, tiebreaker included, is a row number, and it claims an ordering the data does not
> hold. Two things follow. A rank badge then cannot disagree with on-screen position inside a
> tie, whatever column the view is sorted by. And the shared number is itself the
> disclosure: where readers will read order as merit (a public leaderboard), say once what
> order the tied rows are listed in and that the order carries no meaning.

**B - `filtering.md`, end of "Derive the whole predicate, not one axis of it" (L336; owes a
grid vendor's export doc and the systedo-case tree):**

> In the all-client regime there is a stronger form: the export takes the derived rows, not
> a predicate. Those rows are the filtered and sorted array the count is read from, taken
> *before* any client windowing. An export that enumerates no axes cannot forget one, and
> its row count and the on-screen count are one array's length. The array the body maps is
> the right input only when nothing windows it; under client pagination it is one page.

**C - `sorting.md`, end of "The order must be total and deterministic" (L353; owes MDN/ECMA
stability text):**

> Before appending the identity, find what the old order was carrying. A stable sort keeps
> tied rows in input order, so a caller that fed pre-sorted input got an undeclared second
> key for free. Appending the identity straight after the primary key silently replaces that
> key with identity order. Name the implicit key as an explicit term first, then append the
> identity. The test then feeds the input reversed, so it fails if the named term is ever
> dropped.

## Handoff

For a local session (or the Director):

1. **L330 / L334.** Fetch PostgreSQL "Window Functions" (`rank`, `row_number`, peer rows),
   quote it, and land draft A in
   `knowledge/software-engineering/ui-surfaces/data-display/table/techniques/sorting.md`.
   Then strike both rows. If A lands, it owes `applied.md` rows (Director step) for politicas
   and personas-web.
2. **L353.** Fetch MDN `Array.prototype.sort` (stability). Open the **politicas** tree and
   resolve commits `26d695a` and `22f03d6` (town picker within-tier population order). Land
   draft C and strike the row.
3. **L336.** Open the **systedo-case** tree: `src/components/campaigns/CampaignTable.tsx`
   (:438 export, :549 count, :616 tbody) and `src/components/campaigns/table/csv.ts`.
   Confirm whether the table windows on the client; this decides the boundary in draft B.
   Fetch one grid vendor's CSV-export doc, then land draft B or decline it.
4. **L335 (application evidence only; the rule is covered).** Open **personas-web**:
   `src/stores/executionStore.ts:89`, `src/lib/supabaseApi.ts:336`,
   `src/app/dashboard/executions/page.tsx:49-57, :69-78`, and
   `executions-page/ExecutionsFilters.tsx:30-34`. Confirm the 50-row window and the facet
   counts. If true, it is a defect owed to personas-web (it would join L332's).
5. **L334 citation** `src/app/dashboard/leaderboard/leaderboard-page/leaderboardSort.ts:8-39`
   in personas-web, and **L330 citations** `features/civicscore/components/LeaderboardTable.tsx:579`,
   `messages/cs.json:1292` and `features/civicscore/getLeaderboardData.ts:198` in politicas,
   are unverified and needed for any application row.

No technique landed, so no `applied.md` row is owed from this run.

## Owed to their owners

None found. I opened no project tree, so this run verified no project defect. The defects
the leads assert (personas-web's 50-row facets, personas-web's name-tiebroken rank badge)
remain unverified claims and are listed in the Handoff, not here.

## Ledger rows

No row would have been appended to `librarian/applied.md` or `librarian/sources/index.md`.
No source was successfully read. The three attempted fetches (postgresql.org,
developer.mozilla.org, ag-grid.com) all failed on egress.

## Files changed

- `librarian/inbox.md`: lines 159, 160 and 335 struck, with the nearest subject filled and the ruling appended. No other line touched.
- `librarian/subjects/software-engineering/table.md`: ruling section for the seven leads.
- `librarian/subjects/software-engineering/test-harness.md`: L160 ruling.
- `.cloud-runs/261007-9865da/RESULT.md`: this file.

## Open questions

- Should training-data convergence plus an in-container reproduction be enough to land A
  and C when egress blocks every primary? The corroboration table's wording allows it, but
  this brief requires a cited primary, so I held. A Director ruling would settle it for
  future egress-blocked runs.

## Gate

`node scripts/gate.mjs --lane knowledge` (run after the source commit):

```
gate: 8 step(s), lane knowledge, check mode
...
check-public-paths: 36 machine home path(s) in 8472 published file(s).
Write a repo-relative path (`<project>/src/x.ts`) or a placeholder (`<vault>`). Absolute roots belong in .machine.local.json.

gate FAILED at scripts/check-public-paths.mjs - exit 1 (VIOLATIONS)
2 step(s) passed before it; 5 not run.
```

All 36 violations are under `knowledge/game-production/` (inherited, as the brief
predicted). None is in a file this run touched. Remaining steps, run one by one:

| step | exit | tail |
| --- | --- | --- |
| `node scripts/build-index.mjs --check` | 0 | `index is current` |
| `node scripts/build-knowledge-rules.mjs --check` | 0 | `rules are current.` |
| `node scripts/review-coverage.mjs` | 0 | `Architecture decisions: 513 subjects; 393 pending, 71 reviewed, 49 stale, 0 invalid` |
| `node scripts/check-hash-stability.mjs` | 0 | `generated output is checkout-stable — digest identical across LF and CRLF trees and still content-sensitive; ...` |
| `node scripts/build-catalog.mjs --check` | 0 | `catalog.json is fresh — 11 bundle(s) indexed, usage from 1 of 1 contributor file(s)` |

No generated file needed regeneration, because no `knowledge/` source changed.
