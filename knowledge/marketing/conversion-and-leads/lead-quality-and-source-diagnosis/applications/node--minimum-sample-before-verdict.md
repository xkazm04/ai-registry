---
layer: application
type: application
subject: lead-quality-and-source-diagnosis
technique: minimum-sample-before-verdict
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A second floor on the qualified count - win rate, CPQL and the drift alert wait for it

Verified against the Czech-first marketing workspace at its origin master tip of
2026-10-22 (`7bbd1cab`) plus the unmerged junk-floor branch this change stacks on, Node 24
per `package.json` engines. Anchors: the cause floor in
`src/lib/ai/tools/lead-source-diagnosis.ts` (`pickCause`, `baseLeadSourceDiagnosis`,
`buildLeadSourceDiagnosisPrompt`), the trend and alerts in
`src/lib/lead-quality/compute.ts` (`sourceTrend`, `sourceAlerts`), and the seed in
`src/lib/diagnoses/lead-source-request.ts` (`toLeadSourceSeed`).

## Where the tree broke the rule

The technique's first step is two floors, one per stage, each on its own denominator. The
tree had one. `pickCause` returned `volume` under 30 leads and nothing else gated it, so
once a source cleared 30 leads its win-rate branch ran on any qualified count. A CRM
source with 41 leads, 22 qualified and one won deal got a medium-severity
"mis-targeting" verdict and copy saying it qualifies well but does not close. That is a
claim about closing made on 22 trials.

The drift alert had no floor at all. `sourceAlerts` raised the CPQL rise warning and the
CPQL target critical on any paid source with a prior period. The product's own i18n test
fixture showed it: one qualified lead in each period, spend 500 then 1,000, and the alert
said CPQL rose 100 %. The technique's third step names exactly that shape: a ratio of two
ratios over a handful of qualified leads is arithmetic, not evidence.

## A and B

- **A**: the floor as shipped (leads only).
- **B**: `MIN_QUALIFIED_FOR_VERDICT = 30` in the lead-quality module, labelled a
  convention in its comment. It gates the win-rate and pricing branches of `pickCause`
  (both read `volume`, severity low, with copy that names the qualified count rather than
  the lead count), a prompt line telling the model the same, the drift note, the seed's
  `cpqlDelta`, and both CPQL alerts (the rise needs both periods over the floor, the
  target the current one). The qualification verdict still runs on the lead floor, per
  the decision rule "diagnose qualification and refuse the win-rate and pricing branches".

Same inputs through the real `withMetrics`, `toLeadSourceSeed`, `seedToRequest`,
`pickCause`, `baseLeadSourceDiagnosis` and `sourceAlerts`:

| Input | Target: verdicts resting on under 30 qualified | A | B |
| --- | --- | --- | --- |
| CRM-shaped tier, 7 sources (spend 0, no prior, 33-180 leads) | win-rate verdicts | 2 | 0 |
| Paid tier with a prior period, 6 sources (35-210 leads) | win/price verdicts, rise alerts, target alerts, drift notes | 3, 2, 1, 2 | 0, 0, 0, 0 |

The seam was chosen to falsify. A caught outcome would have been B silencing the
qualification stage too, which would make the second floor a blanket gag. It did not:
the three CRM sources whose qualification rate was under the threshold kept their
qualification verdicts in B. The edge case that separates the two halves of the rise rule
also showed: a source at 31 qualified now and 29 prior keeps its target alert and loses
its rise alert.

Floor, declared before B ran: the demo spine for all five demo projects stays identical.
It did, byte for byte, across causes, prompts, base summaries and alerts, because the
spine's smallest qualified count is 50. The tool's golden contract snapshots, the LLM
gate, 230 lead tests (4 new), `tsc --noEmit`, eslint, the context-decay gate and the
agent-review gate are green.

## What the tree's shape says

Both live tiers (CRM contacts and an imported lead file) carry no spend and no prior
period. So in this product, today, the alert half of the rule cannot fire on real data:
only the illustrative spine has a prior, and its scale keeps every source over the floor.
The alert gate is preventive here. The win-rate half is the reachable one, and it is
reachable exactly on the tiers that hold real customers' data, because a small CRM is the
case the technique describes: tens of leads a month, a third qualifying.

## What this realization cannot do

- The trend pill in the lead-quality module still takes a tone from a thin CPQL delta. A
  colour is a verdict, and the technique says to remove it. The component is past the
  project's 200-line review ratchet, so that change needs its strings lifted first.
- The floor is the convention, not an interval derived from each verdict's own line. The
  comment says so; the copy does not show an interval.
- A thin source is not told when it will be judgeable (the technique's fifth step).
- The prompt line tells the model the floor, but a model that diagnoses mis-targeting
  anyway is still shown. Only the deterministic floor, the backfill and the severity
  default are bound by it.

## Proof

`ab-paired`, n = 7 CRM-shaped rows + 6 paid rows with a prior + 5 demo projects, on the
product's own functions. The change is commit `37da6315` with ledger row `a17a2f62` on
branch `cur/msbv-floor`, pushed as a branch, stacked on the unmerged junk-floor branch
whose diagnosis already imports its lead floor from the module. Not merged to master: the
full unit suite was red only outside this change, on `patterns-embeddings` (default
credentials, the known base red) and `rate-limit` (15 of 15 alone, red only inside the
full parallel suite).
