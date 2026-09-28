---
layer: application
type: application
subject: short-form-narrative-structure
technique: but-therefore-beat-linking
stack: next
status: forged
applied: code
ab_verdict: better
verified_on: 2026-09-26
verified_against: next@16.3.3
---

# The connector as data, and the one door that defaulted it

*Verified against the Gravitone studio tree at commit `f7ecedb` (the apply
below; parent `3ee32c6`), 2026-09-26. The version is witnessed by the
tree's own `package.json` pin.*

The two `process` applications of this subject record the studio's
*doctrine*: a pattern study that says every beat should display its
connector and that AND THEN should render as a defect. This one records
the code that doctrine became, which is where the technique's decision
rule — "in a generation pipeline, make the connector explicit data" — is
either true or not.

## Three layers, three alphabets

The tree keeps the law at three layers and gives each its own vocabulary
on purpose:

- **Script beats** — `app/_phases/_shared/notebook/types.ts:147`:
  `Connector = "BUT" | "THEREFORE" | "AND THEN" | null`. AND THEN is in the
  alphabet so that it can be *drawn*: `Chips.tsx:11-13` renders it rose
  with a cross, the defect in the same visual language as an error.
- **Research mechanism chains** — `types.ts:164`:
  `ChainConnector = "BUT" | "THEREFORE" | "TRANSFER"`, enforced lexically
  by the notebook validator (`lib/notebook/validate.ts:391`). TRANSFER is
  a typed non-causal step — a deduction, a hand-off — added after the law,
  applied to a ledger, cost a five-step royalty chain the two parties
  whose shares were its subject (neither BUT nor THEREFORE describes a
  transfer, and the rule says find the link or drop the step), and after
  an earlier run's chains were found carrying two bare ANDs under a bar
  of zero — the vocabulary ran out and the researcher wrote AND anyway. The
  comment at `types.ts:160` is explicit that it "is not a render licence":
  when those steps become beats, the script layer holds them to the
  two-word alphabet again.
- **Trailer cuts** — `trailer/structure.ts:374` `checkConnectors`, the one
  *computed* connector check in the tree, with four verdicts: AND THEN or a
  connector on the opening beat is a violation; an undeclared connector is
  `unmeasured` (`:401`), "not the same as it being causal"; a cut whose
  adjacencies declare nothing is `not-engaged` (`:421`) and does not count
  as enforcement.

The TRANSFER word is the sharpest thing here for the technique. It is a
condition the technique does not yet carry — *a ledger is not an
argument, and a deduction has no honest BUT or THEREFORE* — and the tree
resolved it by widening the research vocabulary while refusing to widen
the render's. One tree, one sighting: held here, not written into the
technique.

## The seam, and the A/B

The explainer half had no computed connector check at all. Its craft row
"but/therefore between adjacent beats, no AND THEN" is a transcribed
`pass` (`app/_phases/script/renders.ts:48`), badged "not re-run" once a
recalibration rewrites the chain (`_parts/HypothesisColumn.tsx:144`). Two
structural guards held the invariant instead: the edit schema offers only
BUT and THEREFORE for an insert (`editPlan.ts:66`), and cuts are caught as
chain breaks (recorded under `review-iteration-loops`).

The first guard was a request. On the local CLI the schema is not
enforced by the server, the parser passed an edit's connector through
unchecked, and `applyEdits` filled a missing one with `?? "THEREFORE"`.
Measured through the real parser and apply, inserting after `0:35` of the
reversal-chain render:

| input connector | A (`3ee32c6`) | B (`f7ecedb`) |
| --- | --- | --- |
| absent | parsed, lands as **THEREFORE** | rejected, "connector is missing" |
| `AND THEN` | parsed, lands as AND THEN | rejected |
| `SO` | parsed, lands as SO | rejected |
| `but` | parsed, lands as `but` | rejected |
| `BUT` / `THEREFORE` (controls) | parsed, lands as declared | parsed, lands as declared |

B: `parseEditPlan` refuses an insert whose connector is not BUT or
THEREFORE (`editPlan.ts:368`), and `applyEdits` leaves an undeclared
connector `null` (`:194`) for any caller that skips the parser. The
controls were asserted in both arms, so this is not a check that fires on
everything. One existing probe changed meaning — its insert carried no
connector and now fails on the contract before the bad mark it tests — and
was given a declared connector, which is the parser's own stated order
(contract first, then the script). Node lane 506/506, `tsc` clean. Probe:
`tests/golden-path/edit-plan-connector.probe.spec.ts`.

## What this does not prove

- **No viewer was measured.** "Better" is the invariant held on every
  input tried, not retention. The claim is that the pipeline no longer
  writes a causal link nobody asserted.
- **A rewrite is still invisible.** A rewrite keeps the beat's connector
  while replacing the sentence under it, so the relation can break with no
  positional evidence. Nothing here or in the chain-break check sees it.
- **The explainer's craft rows are still transcribed.** A computed
  explainer twin of `checkConnectors` would be a small function and would
  make the row honest after a rewrite. It is the next seam, not this one.
