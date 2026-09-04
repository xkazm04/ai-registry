---
layer: application
type: application
subject: quality-gates
technique: deterministic-proxy-gate
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22
applied: simulation
ab_verdict: better
---

# A byte-count ratchet whose baseline sat still through a major toolchain bump, and crossed machines without moving

The version witness is the tree's own pin: personas' `.nvmrc` says `22`, and
`.github/workflows/ci.yml:108-110` installs from it (`node-version-file: .nvmrc`).
Read at commit `e6ed57e55`; the tree was not modified. The build tool is pinned
by lockfile (`vite` 8.0.16 at head).

The technique's determinism claim flipped on 2026-09-04. It used to say a
counting proxy is a function of the tree alone — same revision, same number, and
a different machine does not move it. It now says the number is a function of
the tree **and the toolchain that built it**, that the counter's repeat spread is
to be *measured* on the gating machine rather than asserted zero, and that the
machine class and toolchain are pinned so a count from elsewhere is a different
instrument's reading. This document walks five real revisions of one such gate
under both readings.

## Seam

`scripts/check-bundle-budget.mjs` with `scripts/lib/bundle-budget.mjs`: a
blocking CI step ("Check bundle size budget", `ci.yml:171-182`, deliberately
*not* `if: always()`) that reads every `.js` in `dist/assets/` after `npm run
build`, normalises the Vite content-hash out of each name, and fails when the
total or any chunk grows past `max(1%, 10 KB)` over the committed
`scripts/bundle-baseline.json`. The baseline is written by `--update`, "locally,
as a deliberate, reviewed re-baseline" — on the developer's Windows box — and
the gate runs on `ubuntu-latest`. The baseline carries `timestamp`, `totalKB`
and a chunk map; **no toolchain version and no machine identity**.

Bytes of a minified artifact are the technique's counting proxy: no clock, no
scheduler, and a threshold in the unit the gate actually measures.

## Measurable, chosen before walking

Over the baseline's revision history: how many baseline moves (or non-moves)
each arm can attribute correctly to *tree* versus *toolchain*; and, for the one
cross-machine comparison the history contains, the measured residue between the
Windows-written baseline and the ubuntu-built count on an unchanged frontend.

## Arms

**A** — tree alone: every difference between baseline and build is a tree
difference; a baseline written on one machine is valid on another by definition.
**B** — tree + toolchain on the gating machine; the residue is measured, the
threshold names it, and the toolchain and machine class are pinned beside the
number.

## The five revisions

| revision | date | `totalKB` | chunks | `vite` in lockfile | what moved |
| --- | --- | --- | --- | --- | --- |
| `8d4b61383` | 2026-03-15 | 4720 | 154 | 7.3.1 | baseline created, measured |
| `59d75ecde` | 2026-04-28 | 4720 | 152 | **8.0.3** | two entries hand-deleted; `timestamp` unchanged |
| `ac9c9f507` | 2026-05-08 | 4720 | 152 | 8.0.3 | `vite.config.ts` +24/-7 (chunking), six baseline lines hand-edited; `timestamp` still 2026-03-14 |
| `517c15559` | 2026-08-30 | **33380** | **1452** | 8.0.16 | "honest baseline" re-measure; the CI comment records the old one was "stale (57 phantom chunks, a baseline from 2026-03-14)" and had run green under `if: always()` |
| `dbd2c4563` | 2026-08-30 | 34021 | 1515 | 8.0.16 | re-measure after the `en` locale split |

**Under A** the record reads as: the tree grew from 4.7 MB to 33 MB and from 154
to 1452 chunks between March and August. That is what a reader with only the
tree axis can say, and the gate said the same — it compared every build for five
months against a Vite 7 measurement and, because the step was `if: always()`
among failing neighbours, nobody read the verdict.

**Under B** the same rows split: the major toolchain bump (7.3.1 → 8.0.3, with a
chunking-config change five weeks later) is a *toolchain* move that the baseline
never absorbed — the `timestamp` did not change across three revisions while the
lockfile did — and the August jump is the sum of five months of tree growth
**plus** the chunking change B's stamp would have separated and A's cannot. The
ninefold chunk-count change is not something 1,300 features did; it is what a
different splitter does to the same tree. B cannot apportion the 33 MB either —
nobody measured at the bump — but B *names the confound*, and A does not have a
word for it.

## The cross-machine measurement the history happens to contain

The technique now asks for the spread to be measured, so here is the one paired
observation available. `dbd2c4563` was written by `--update` on the Windows
box. The next CI run on its line, `923d36ef1` (2026-08-31), is **three commits
later with zero files changed under `src/`, `package.json`,
`package-lock.json` or `vite.config.ts`** — same tree, same lockfile, different
machine class. The bundle step **passed**: 0 violations across 1,515 chunks, and
the rows the report prints match the baseline to its 0.1 KB resolution
(`vendor-three` 1008.7 = 1008.7, `en` 488.1 = 488.1, `fleetTerminalManager`
492.3 vs 492.2). The Windows-to-ubuntu residue for this counter, with the
toolchain lockfile-pinned, is **at most 0.1 KB per chunk against a 10 KB
floor** — measured, not asserted, and for this counter class the "pin the
machine class" clause is satisfied by the lockfile and `.nvmrc`, not by the
runner image.

By contrast the run of 2026-09-04 (`c5cf0d5ca`) fails the step with 19 chunk
violations while the **total is 968 KB *under* baseline** and 97 entries are
stale: every `agents#2` … `agents#14` positional key moved by 10-25 KB in the
same direction. That is chunk-boundary reshuffling after five days of tree
changes, compared through rank-position keys that pair unlike chunks — a defect
in the gate's key scheme, and neither arm's business; it is recorded here so
the next reader does not mistake it for machine residue.

## Verdict and falsifier

`better`. B attributes the March-to-August record correctly where A must call a
toolchain change tree growth; B's demand to *measure* the spread is met by the
tree's own history and gives a number A never asked for. The condition the row
buys the technique: **which pin matters is a property of the counter class.**
For an artifact-size counter under a lockfile the toolchain pin is the whole
pin and the machine residue measures at the noise floor; the machine-class pin
the flip added is for simulated-CPU and hardware counters, where the reference
manual's ASLR and shared-library terms live, and should be stated as such
rather than as a blanket rule.

Falsifier: a baseline written on the Windows box that fails on `ubuntu-latest`
with the frontend tree and lockfile unchanged — that would put the machine
residue above the threshold and reinstate the machine-class pin for this
counter. The instrument is already in place; it is the pass on `923d36ef1`
repeated on every future re-baseline commit. Return condition: the first such
pair that disagrees, or a re-baseline that lands in the same commit as a
`vite` major bump — the case B says must be recorded as two moves.
