---
layer: application
type: application
subject: codebase-scanning
technique: causes-beside-the-finding-count
stack: node
status: reconciled
applied: code
ab_verdict: better
proof: ab-paired
shipped: 2026-09-17
verified_on: 2026-09-17
verified_against: node@24
---

# A backlog that deleted the one cause it had found

The witness for `node@24` is the project's CI pin (`.github/workflows/ci.yml`,
`node-version: 24`); the tree was opened and the arms run in it.

A deterministic overlap check emits one candidate row per (scope, artifact-pair)
into a backlog a human then close-reads, sixteen rows a batch. A later detector,
run once, compared the two artifacts' change sets verbatim and found that one was
carried inside the other — so the pair collided in every scope they shared. It
published two relations in a register and printed the consequence in its own
words: *"2 bill-level relations explain 9 candidate pairs that the pair-by-pair
method would have read as independent findings"*, and in the register's
`interpretation` field, *"the unit of analysis for these pairs is the BILL, not
the pair, and reading them statute-by-statute multiplies one fact into many."*

The consumer of that result did not read the register. It read one row of it, as
a literal:

```ts
// scripts/case-loops/law/archive/prepare-collision-queue-012.ts:34 (before)
const closedDuplicate = (a: number, b: number) => (a === 68 && b === 90) || (a === 90 && b === 68);
```

This is the seam, and it was chosen because it could falsify the technique: if
mechanical cause attribution over the real backlog moved nothing, the constant was
complete and the rule bought only maintenance. A caught outcome would have changed
the landing from "publish the cause count" to "a hand-maintained exclusion is
sufficient for a finite backlog".

## The arms

Both run over the committed payloads in `docs/data-analysis/case-law/payloads/`;
neither fetches, and the source corpus cache is gitignored and absent, so the
register is the only cause evidence either arm can reach.

- **A** — the shipped behaviour: 83 escalated rows, minus the seven rows the
  constant matched, published as `backlogRemaining: 76`. No row carries a cause.
- **B** — `scripts/case-loops/law/cause-collapse.ts`: every row attributed to a
  cause read from the register, nothing removed, and `causeCount` published beside
  `backlogRemaining`.

**Positive control**, asserted first: arm A's reconstruction must reproduce the
`backlogRemaining` that `batch-011-collision-queue.json` actually shipped. It does
— 76. **Negative control**: an empty register makes B report 83 causes, so the
collapse is visibly switchable. The test file was also made to fail once on
purpose, to prove it can.

## What the seam returned

| | arm A | arm B |
| --- | --- | --- |
| rows in the artifact | 76 of 83 | 83 of 83 |
| rows carrying a cause | 0 | 83 |
| items presented as independent | 76 | 77 |
| rows explained by a relation | 7, deleted | 7, attributed |

The target moved (76 rows with no cause attribution → 0) and the floor held: the
(scope, artifact-pair) set is identical across the arms, asserted as a set
equality, and the project's unit lane is green at 222 files / 3,048 tests.

**It also refuted the rule the landing was drafted from.** The candidate claim was
that a raw count *overstates* the independent things it contains. Here it
understated: subtracting the seven rows removed the fact along with its instances,
so 76 was simultaneously too high (76 rows read as 76 findings) and too low (the
cause counted nowhere). The technique carries that as its direction rule rather
than as a prediction.

One thing the register could not be asked: its second relation explains no
escalated row, so it contributes nothing to the numbers above. That is why the
change is worth more than the one row it moves — under the constant that relation
could never apply, and under the register it applies without a code change, which
the test asserts on synthetic rows.

Shipped as `d73126e` on `backlog/c29`: the module, its test, the consumer rewired
to the register and to publishing `causeCount`, and the lane doc.
