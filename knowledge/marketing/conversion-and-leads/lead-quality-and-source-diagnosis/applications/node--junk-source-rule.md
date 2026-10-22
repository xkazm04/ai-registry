---
layer: application
type: application
subject: lead-quality-and-source-diagnosis
technique: junk-source-rule
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The junk badge on the diagnosis's own sample floor - one predicate, one threshold

Verified against the Czech-first marketing workspace at its origin master tip of
2026-10-22 (`7bbd1cab`), Node 24 per `package.json` engines. Anchors: the junk predicate
in `src/lib/lead-quality/compute.ts` (`withMetrics`, `JUNK_QUAL_RATE`), the deterministic
cause floor in `src/lib/ai/tools/lead-source-diagnosis.ts` (`pickCause`), the picker in
`src/lib/diagnoses/lead-source-request.ts` (`underperformingRows`), and the recap
grounding in `src/lib/lead-signals/summary.ts` (`leadSignalsText`).

## What the tree already did right

The threshold is one exported constant, and the module's picker reads the predicate's
boolean rather than re-deriving it. Junk is restricted to paid sources (`spend > 0`), so an
unpaid referral source is never accused. The picker offers junk sources and
weak-win-rate sources (`WEAK_WIN_RATE`) as the two failures this subject keeps apart.

## Where it broke the rule

The technique says the junk predicate clears **the same sample floor the diagnosis
uses**, and that a copy of the threshold literal anywhere else is a second threshold.
The tree broke both halves:

- `withMetrics` set `junk: s.spend > 0 && qualRate < JUNK_QUAL_RATE`, with no lead floor.
  `pickCause` returns `volume` for any source under `MIN_LEADS_FOR_SIGNAL = 30`. So a
  paid source on twelve leads showed the junk badge, entered the junk count and was named
  in the recap's junk line, while its own diagnosis said there was too little data:
  two verdicts on one row.
- The diagnosis kept `MIN_QUAL_RATE = 0.35` as its own literal beside the module's
  `JUNK_QUAL_RATE = 0.35`. They agreed only because nobody had edited one yet.

The seam was chosen to falsify the floor rule. A caught outcome (no row both junk and
volume on real shapes) would have made the floor clause decoration for this product,
because the demo spine's smallest paid source has 95 leads. It did not hold that way:
the live CRM tier (contacts joined to campaign spend) and the recap's scaling of the
sample spine to the report's lead total both produce sub-floor paid rows.

## A and B

- **A**: the predicate as shipped.
- **B**: `junk` also needs `leads >= MIN_LEADS_FOR_VERDICT` (30, exported from the
  module), and the diagnosis reads that floor and `JUNK_QUAL_RATE` from the module
  instead of keeping copies.

Same inputs through the real `withMetrics`, `toLeadSourceSeed`, `seedToRequest`,
`pickCause` and `leadSignalsText`:

| Input | Target: rows junk while the diagnosis reads volume | A | B |
| --- | --- | --- | --- |
| Constructed small live tier, six sources (8-45 leads, five paid) | junk-but-volume | 3 of 5 junk | 0 of 2 junk |
| Recap over the sample spine, scaled to 9 lead totals (25-1275) | totals naming a junk source on under 30 leads | 2 (about 11 and 21 leads) | 0 |

Floor, declared before B ran: the junk set and the diagnosis seeds for the demo spine
across 12 projects stay identical (they did, byte for byte). The cause floor's
behaviour stays unchanged: the tool's golden contract snapshots and the LLM gate are
green, and 158 lead tests pass, 4 of them new. `tsc --noEmit`, eslint and the
context-decay gate are green. That gate required the diagnosis context to declare its
new import from the lead-quality context, which already declared the reverse.

## What this realization cannot do

- The threshold is still a bare fraction. The technique's standard (relative to the
  business's blended qualification rate, with the constant saying which kind it is) is
  unmet. The tree's comment does not say the 0.35 is a convention.
- The junk sub-label and alert copy say "cheap but low quality" and "low CPL" for every
  junk source. A junk source whose cost per lead is not cheap against its peers is
  mis-targeted by the technique's second decision rule, and the copy still calls it cheap.
- The alert names no source and none of the two numbers the technique asks for. The
  table row beside it carries them.

## Proof

`ab-paired`, n = 6 constructed live rows + 9 scaled recap totals + 12 demo projects, on
the product's own functions. The change is commits `31640195` (predicate, shared
constants, tests) and `2dfc967d` (context-map crossing) on branch `cur/junk-floor-sys`,
**not pushed**. The pre-push gate (`check:ci`) was red on 3 of 4,391 unit tests outside
this change. `patterns-embeddings` fails on its own with a default-credentials
rejection. `generated-instruction-drill` passes 5/5 alone and failed only inside the
full parallel suite.
