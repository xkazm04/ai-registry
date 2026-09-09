---
layer: application
type: application
subject: lead-quality-and-source-diagnosis
technique: cause-taxonomy-spam-mistargeting-pricing-volume
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The cause rule mirroring the prompt - a deterministic floor in lockstep with the model's taxonomy

Verified against the Czech-first marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24 per `package.json`
engines. The whole of `src/lib/ai/tools/lead-source-diagnosis.ts` is the anchor; the
closed cause set lives in `src/lib/ai-types.ts:1056-1078`, and the picker that decides
which sources are offered for diagnosis is `src/lib/diagnoses/lead-source-request.ts:44-108`.

## The structural fact the tree proves

The technique says a diagnosis is produced two ways - a model reading the numbers and
a rule reading the same numbers - and that the rule and the prompt must describe the
same taxonomy in the same words. The tree does exactly this, and admits the cost.
`LEAD_SOURCE_DIAGNOSIS_SYSTEM` (`lead-source-diagnosis.ts:31-48`) defines the five
causes qualitatively in Czech - spam is "cheap leads, almost nothing qualifies",
mis-targeting is "qualifies but almost nothing closes", pricing is "expensive per
qualified lead despite reasonable qualification", volume is "too little data" - and
`pickCause()` (`:169-178`) is the deterministic mirror, guarded by five named
constants (`:155-163`) with the comment that the floor and the prompt wording "move in
lockstep (edit both together)". The order of the rule is the order the technique
prescribes: volume first (`:170`), then qualification split by cheap cost per lead
into spam or mis-targeting (`:172-173`), then win rate (`:175`), then pricing only on
a paid source (`:176`), else ok.

The floor is used three ways, all named in the technique: as the demo when no model
is connected (`demoLeadSourceDiagnosis`, `:232-237`), as the per-field backfill when
the model leaves a field empty (`normalizeLeadSourceDiagnosis`, `:193-201`), and as
the source of severity when the model omits it (`:208`).

## Two upward lessons the tree taught

**Severity derives from the cause actually shown.** The comment at `:203-207` records
the incident: the old middle term `?? fallback.severity` took the demo's severity,
computed from `pickCause()` independently of the model, so a model "spam" (high)
could render under a green "low" pill. The fix, `severityFor(likelyCause)` over the
cause the reader will see, is now the technique's decision rule.

**A cause outside the set coerces to the least accusatory failure.** `coerceCause`
(`:148-150`) defaults an unknown `likelyCause` to `mis-targeting`, with the comment
"a safe, non-accusatory catch-all". The technique adopts the reasoning: a coerced
mis-targeting is a claim about the campaign, a coerced spam a claim about the leads.

## Confirmed craft

- **One cause, closed set, schema-constrained.** The schema (`:124-146`) describes
  `likelyCause` as "one of" the enumeration, the prompt repeats the allowed values
  (`:111`), and a missing cause fails validation (`:218-226`) so the wrapper repairs
  once before the normaliser coerces - a truncated response no longer falls straight
  to the demo floor.
- **A budget shift names a concrete peer.** The prompt lists peer sources with their
  qualification rate, win rate and cost per qualified lead (`:101-108`) and instructs
  the model to name a specific better source by its numbers (`:42`, `:115-119`);
  `toLeadSourceSeed` supplies those peers best-first (`lead-source-request.ts:52-56`).
- **Trend and velocity change urgency, not the taxonomy.** The prompt receives the
  period-over-period drift, the days lead-to-close and any live alerts (`:76-91`),
  and the floor appends a drift note when cost per qualified lead rose more than a
  quarter (`:252-257`); the system prompt says a slow source "is a different problem
  from a poor one" (`:44`).
- **Unpaid sources skip the cost branches.** `:73-74` tells the model not to reason
  about cost for an unpaid source; the floor's `paid` guard (`:171`) does the same.
- **The picker offers the two failures the subject keeps apart.** `underperformingRows`
  (`lead-source-request.ts:104-107`) offers junk sources and sources with a win rate
  under `WEAK_WIN_RATE` (`:48`), falling back to the weakest by score so an action is
  always available.
- **The click-identifier share is fenced against over-reading.** The conversion
  ledger line (`:96-100`) says the share "can be uploaded, not how many happened" -
  the boundary with `attribution-and-incrementality`, stated inside the prompt.

## The deviation the standard keeps

The thresholds are currency-anchored constants: `CHEAP_CPL_CZK = 200` and
`HIGH_CPQL_CZK = 3000` (`:160`, `:163`), beside `MIN_LEADS_FOR_SIGNAL = 30`,
`MIN_QUAL_RATE = 0.35` and `MIN_WIN_RATE = 0.15`. The code admits it at `:157-158`:
"CZK-denominated - they assume a Czech SMB context; a different currency/business size
would want different anchors." The standard is the technique's: each constant
expressed relative to the business's deal value, blended rates or peer median, with a
source and a confidence band, and labelled as convention until calibrated. The tree
labels the currency dependence in a comment the user never sees; the diagnosis copy
presents the verdict with no such label. Also unmet: `MIN_LEADS_FOR_SIGNAL` gates
leads only, so a source with forty leads and nine qualified can be diagnosed
"mis-targeting" on a win rate over nine - the per-stage floor of
`minimum-sample-before-verdict` is absent here.
