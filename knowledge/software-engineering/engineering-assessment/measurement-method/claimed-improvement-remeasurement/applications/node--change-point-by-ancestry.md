---
layer: application
type: application
subject: claimed-improvement-remeasurement
technique: change-point-by-ancestry
stack: node
status: forged
verified_on: 2026-10-27
---

# Change point, queued batch and held watermark (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). The judge in the sibling application decides over two
sample sets; this one shows where the sets come from — the passive split around a change point
found by ancestry, the queued batch that becomes a head sample, and the incremental collector
whose watermark keeps slow runs from vanishing.

## The change point, by binary search over one line of history

`src/server/vitals/measure/passive.ts:1-3` defines the change point as "the first run whose
commit holds ref.sha (the sha merged: git merge-base --is-ancestor in the project's own
checkout, else the exact sha)". The ancestry query has three answers: `src/server/vitals/measure/passive.ts:25` maps exit 0
to true, 1 to false and anything else to `undefined` — git cannot tell — and an unknown answer
abandons the search for the exact-sha match (`src/server/vitals/measure/passive.ts:51` "if (has === undefined) { known =
false; break; }"). The search is binary because the series is one line of history:
`src/server/vitals/measure/passive.ts:38` "a binary search asks git about log2(n) commits only". That monotonicity
argument is an **upward lesson** now in the technique.

Base and head are bounded by count, not date: `src/server/vitals/measure/passive.ts:71` takes the last `n` values before
the change point and the first `n` from it, so later changes stacked on the claim do not enter a
head window that keeps growing.

**Deviation**: a claim naming only a branch, on a variant that does not run on that branch,
falls back to time — `src/server/vitals/measure/passive.ts:63-65` "its first run there is the time" — and the resulting
verdict does not record that it was reached by a time split. The technique requires the
fallback to be named in the verdict record.

## The queued batch is the head, by identity

`src/server/vitals/measure/queued.ts:1-5` records a queued batch as `{claimId, runIds, at}` in its
own file and compares "over exactly those run ids (head) against the claim's variant's last N
runs before them (base)". The judge waits for the whole batch — `src/server/vitals/measure/queued.ts:46` "waiting:
${finished.length} of ${of} queued runs collected" — takes the base as the same number of runs
preceding the batch's first id (`src/server/vitals/measure/queued.ts:49-50`), and appends one verdict per batch
(`src/server/vitals/measure/queued.ts:35-36`). The queue write itself runs as the person and is capped: the intent parser
at `src/server/actions/vitals/intents.ts:31` requires "n (1 to 5)". Confirmed: whole-batch wait,
balanced sides, batch record as the mark.

**Deviations**: the runs are queued "of the change's branch" (`src/server/vitals/measure/queued.ts:1`), not pinned to a
commit, and the commit each run built is not checked by ancestry before it counts; and the base
is always organic, never a fresh queued base batch, so a triggered head is compared with organic
base runs.

## The watermark halts at the first run in flight

`src/server/vitals/collect/collect.ts:1-3` states the rule exactly: "A run still in flight is not
stored (a stored run is never rewritten), and neither is any finished run newer than it, so the
next collect's `sinceRunId` cannot step past it." Because the watermark is derived from the newest
stored run (`src/server/vitals/collect/collect.ts:19`), the append-only shape is the only one that works, and `storable` at
`src/server/vitals/collect/collect.ts:26-29` stores only finished runs below the lowest in-flight id — the **upward lesson**
that split the technique's two store shapes. A stuck run stops holding after a day:
`src/server/vitals/collect/collect.ts:16` "export const HOLD_MAX_MS = 24 * 3_600_000;".

**Deviation**: a run released by that ceiling is not recorded as abandoned; it is simply never
stored, and once the watermark moves past it, it is lost even if it later finishes.
