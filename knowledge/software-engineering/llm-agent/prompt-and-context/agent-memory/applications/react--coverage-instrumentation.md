---
layer: application
type: application
subject: agent-memory
technique: coverage-instrumentation
stack: react
status: forged
verified_on: 2026-09-23
verified_against: react@19
---

# A coverage tile that keeps "never measured" out of the numbers (personas)

The realization is the Brain dashboard's coverage tile in personas, a desktop agent
platform (a React front end over a Rust core). Each persona's memory is a stream of
episodes, and each episode may be filed under a charter (a standing responsibility the
agent owns). The tile answers the question this technique exists for: which charters
does the brain hold nothing about? `verified_against` is the `react ^19.2.6` range in
`package.json`. Read at `39272628`.

## The denominator is the roster, joined in the client

The backend's coverage read is one grouped count
(`src-tauri/db/src/repos/core/episodes.rs:209`): episodes per charter id, with no
charter mapped to an `unassigned` key. A grouped count cannot name a charter that has
no rows, so the backend alone could never show an absence. The front end fetches the live
charter roster beside it and takes the difference in `splitCoverage`
(`src/features/agents/sub_brain/brainMath.ts:172`). Its own comment names the technique's
structural point: a list of cells can only show what is there.

Three of the technique's honest-zero cases show up as separate outputs:

- **An uncovered charter is listed first, not dropped.** The tile renders
  `uncovered` ahead of `covered`
  (`src/features/agents/sub_brain/CoverageTile.tsx:41`), with a warning accent on
  every row that has nothing (`:117`).
- **A roster that failed to load is not "all covered".** `chartersFailed` selects a
  roster-unavailable sentence (`:83`, `:96`), and an empty roster gets a different one
  (`:86`). Failure, an empty population and full coverage are three different messages.
- **Rows that belong to no live charter are kept apart.** Cells whose charter is gone
  become `orphans`, and unfiled episodes become `unassigned`. Neither one counts as
  coverage.

## Unmeasured stays null, and the reason is irreversibility

The join is where the law
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) says the damage
happens: an optional lookup meets a numeric field. `counts.get(c.id)` misses for every
uncovered charter, and the code keeps the miss as `count: null` instead of `?? 0`
(`brainMath.ts:183`). The field's type is `number | null` and its doc comment
(`:140`) states the contract: null means the read said nothing about this charter. The
test pins it (`__tests__/brainMath.test.ts:103-109`): `expect(...count).toBeNull()`,
with the comment that a 0 "would be a claim the coverage read never made, and nothing
downstream could undo it". The rule behind it is the one the measurement-honesty subject
states for collectors. The value has to be typed at the join, because the first
consumer that turns it into a number cannot recover the distinction later.

The render then merges the two cases on purpose, and it is right to. An unmeasured
charter and a measured empty one both display "nothing recorded" (`CoverageTile.tsx:67`),
because to the operator both mean the brain has nothing here. In this tree a measured
zero cannot even arrive, since a grouped count emits no zero rows. So the null is not
there to change what the tile shows. It protects every other consumer of the split
(the gap count, the sort, a future chart) from reading "not asked" as "asked, and zero".
The distinction lives in the type, and each surface decides whether to show it.

## Where it departs from the technique

- **No freshness window.** Coverage here means "one episode ever, under this charter".
  The count is all-time and the episode table has no liveness column, so a charter that
  last produced a record long ago reads as covered. The technique's covered-within-a-window
  clause is not implemented.
- **The uncovered are ordered alphabetically** (`brainMath.ts:190`), not
  never-covered-first and then longest-since-confirmed. With no window, every uncovered
  charter is equally never-covered, so the ordering costs nothing yet. It will once a
  window exists.
