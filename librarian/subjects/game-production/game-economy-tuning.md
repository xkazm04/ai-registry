---
domain: game-production
subject: game-economy-tuning
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# game-economy-tuning

## Architecture review - 2026-09-10

Read and assessed all 16 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/game-economy-tuning",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:812bb01d27be67a8",
  "disposition": "reverify",
  "coverage": "All 16 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "A central-resource valuation is contextual and may be nonadditive. Price differences isolate effect value only under justified comparability; an outlier alone does not decide whether price or effect is wrong. A conditional benefit can have zero value when its condition is unreachable.",
    "A neutral stance and three axes are design choices. Identical output on one metric does not prove that stances collapse; derived tables can preserve a single authored parameter authority.",
    "The opening net/inflow definition conflicts with the later absolute-net/max(inflow,outflow) formula. State one signed basis, zero-flow behavior, time units and threshold policy; optional measurements cannot satisfy a required gate."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/systems-canon/game-economy-tuning/game-economy-tuning.md",
      "scope": "Owned golden path, every technique and every application read as primary local review evidence. Document decisions identify internal contradictions and explicit counterexamples. Historical external implementation and mutable provider claims remain unverified; no new witness is asserted."
    }
  ],
  "documents": {
    "game-economy-tuning.md": {
      "disposition": "reverify",
      "reason": "Reverify mandatory drains for every currency, universal feedback requirements, price versus stock-flow inflation, arbitrary bands and graph-only stability claims. Finite progression can intentionally accumulate; policy thresholds need an authored basis."
    },
    "techniques/cost-curve-object-audit.md": {
      "disposition": "reverify",
      "reason": "A central-resource valuation is contextual and may be nonadditive. Price differences isolate effect value only under justified comparability; an outlier alone does not decide whether price or effect is wrong. A conditional benefit can have zero value when its condition is unreachable."
    },
    "techniques/economy-philosophy-multipliers.md": {
      "disposition": "reverify",
      "reason": "A neutral stance and three axes are design choices. Identical output on one metric does not prove that stances collapse; derived tables can preserve a single authored parameter authority."
    },
    "techniques/faucet-sink-balance-band.md": {
      "disposition": "reverify",
      "reason": "The opening net/inflow definition conflicts with the later absolute-net/max(inflow,outflow) formula. State one signed basis, zero-flow behavior, time units and threshold policy; optional measurements cannot satisfy a required gate."
    },
    "techniques/feedback-loop-topology-and-polarity.md": {
      "disposition": "reverify",
      "reason": "Loop polarity depends on the signs of local effects, and gain and delays affect dynamics. Positive feedback need not diverge, negative feedback need not stabilize, and external sources can grow stocks without a reinforcing cycle."
    },
    "techniques/intransitive-equilibrium-solving.md": {
      "disposition": "clarify",
      "reason": "Repaired strict versus weak dominance, the weakly dominated equilibrium counterexample, both-player payoff requirements and off-support best-response inequalities. Equilibrium is separated from dynamic convergence."
    },
    "techniques/progression-curve-shape-tests.md": {
      "disposition": "reverify",
      "reason": "A low coefficient of variation of adjacent ratios does not identify the intended curve family. Check the target ratio or formula, residuals, finite range, offsets and rounding; a polynomial over a narrow range can pass the proposed threshold."
    },
    "techniques/rarity-inflation-and-affix-saturation-alerts.md": {
      "disposition": "reverify",
      "reason": "Small percentage differences are not statistically indistinguishable by definition. Handle zero baselines, denominators and uncertainty; pool share alone does not establish build collapse, and pity mechanics can change expected value."
    },
    "techniques/source-drain-converter-trader-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Counts of unlike resources cannot establish conservation. Classify relative to the boundary; finite vendor stock, transaction fees, caps and intentional accumulation need explicit semantics."
    },
    "techniques/structural-economy-simulation-before-numbers.md": {
      "disposition": "clarify",
      "reason": "Repaired the assertion that unit-rate simulation establishes structural stability. Added equal-topology stable and divergent recurrences and bounded claims for finite traces, reachability and stochastic mean substitution."
    },
    "techniques/tornado-sensitivity-sweeps.md": {
      "disposition": "reverify",
      "reason": "Endpoint sweeps miss interior extrema without monotonicity. Distinguish input ranges, confidence intervals and predictive uncertainty; fixed seeds improve pairing but do not remove sampling error or nonlinear interactions."
    },
    "techniques/wealth-concentration-and-price-imbalance-alerts.md": {
      "disposition": "reverify",
      "reason": "Gini thresholds need population and cohort context; an unnormalized finite population has maximum (n-1)/n. Handle zero total wealth and negative balances. Price divided by earning rate is time, and repeated purchase frequency affects affordability."
    },
    "applications/node--source-drain-converter-trader-vocabulary.md": {
      "disposition": "reverify",
      "reason": "The historical five-kind implementation was not rerun. A vocabulary rename does not establish correct resource boundaries or finite-vendor semantics. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--tornado-sensitivity-sweeps.md": {
      "disposition": "reverify",
      "reason": "The historical seeded sweep was not rerun. A broad random input range and reused seeds do not establish a noiseless derivative; confirm endpoint monotonicity and reported units. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--wealth-concentration-and-price-imbalance-alerts.md": {
      "disposition": "reverify",
      "reason": "The historical alert implementation was not rerun. Validate the 1% affordability basis and purchase frequency; stock-flow growth and concentration are distinct measurements that may legitimately coexist. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--faucet-sink-balance-band.md": {
      "disposition": "reverify",
      "reason": "The historical process was not rerun. For inflow 1.2 and outflow 0.8 the imbalance is 50% of outflow or 33.3% of max flow, so the denominator matters. A max(...,1) floor is unit-dependent, and unmeasured optional fields are not a completed check. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

Read all sixteen documents at their reverted bytes, and read the consumer this
subject's applications cite (`C:/Users/kazda/kiro/pof`, `master`) as a primary source.
Reading source is not executing it: no simulation, sweep, playtest or build was run.

**Retraction.** The earlier 2026-09-10 record on this note filed eleven of sixteen
documents as `reverify` against documents that no longer exist, and several of its
objections are answered by the current text. I retract them specifically:
`feedback-loop-topology-and-polarity` already states that convergence is behaviour and
never deduced from a signed list ("structural proof is never sufficient... behaviour is
observed"); `tornado-sensitivity-sweeps` already states the monotonicity limitation in
"What the method cannot tell you"; `source-drain-converter-trader-vocabulary` already
closes the books *per resource* (step 5) and already gives pool caps an overflow entry
(step 4), so the "unlike resources" and "caps" objections do not land;
`cost-curve-object-audit`'s "never zero" is an authoring rule about not pricing a
conditional at or below zero, not a claim that no condition can be unreachable. Those
four are `keep`.

The findings that survive are smaller and sharper. The strongest is a live internal
contradiction in `faucet-sink-balance-band`: the entry-shape section defines net flow as
the faucet-sink difference "as a fraction of the faucet total: that fraction is the net
flow, and it is the only number the band applies to", while procedure step 5 mandates
"the absolute difference between inflow and outflow over the larger of the two, **not**
over the faucet total", and step 6's worked verdict then reports "+9% of faucet
throughput". Three sentences, two denominators, one band. The consumer resolves it the
step-5 way — `canon-conformance.ts:108` computes `Math.max(inflow, outflow, 1)` — and
`process--faucet-sink-balance-band` calls that "the symmetric denominator the technique
specifies" without noticing the technique also specifies the other one. The golden path
inherits the ambiguity by stating its ±15% band with no denominator at all.

`structural-economy-simulation-before-numbers` rests on a bolded claim it calls "the
entire value of the technique": "A pool that diverges at unit rates diverges at every set
of rates that preserves the loop; only the date changes." That is false in the
converging direction, and the technique's own step 2 is what makes it false — it sets
"every conversion ratio to one for one", discarding exactly the term that decides loop
gain. A crafting loop authored at ten ore per bar walks at 1:1 and shows a divergent bar
pool; at authored ratios the loop gain is below one and the pool starves. The weaker
claim the walk actually supports is that a divergence at unit rates identifies a
*topology worth pricing*, not one that survives every pricing.

`intransitive-equilibrium-solving` step 2 deletes to a fixpoint any option "whose payoffs
are less than or equal to another option's in every column", asserting it "will see zero
rational use *at any price*". That is the statement for *strict* dominance. A weakly
dominated strategy can be played with positive probability in a Nash equilibrium, and
iterated deletion of weakly dominated strategies is order-dependent, so the step can
delete a rationally-used option and can return different survivor sets depending on scan
order. Step 3 also states only the indifference condition on the support; equilibrium
additionally requires no off-support option to beat it, and existence/uniqueness are not
addressed.

Two smaller ones. `feedback-loop-topology-and-polarity` defines gain as "the multiple by
which one full traversal amplifies a perturbation" and calls 1.02 "a texture", then makes
"gain exceeds one and latency longer than the test session" a *critical* finding — which
fires on the texture case by the doc's own definition. `progression-curve-shape-tests`
lists the polynomial diagnostic as "the ratio of logarithms is near-constant"; for a
power law it is the log-log *slope* (a ratio of differences of logarithms) that is
constant, while the ratio of successive log-values tends to one and discriminates nothing.
The same technique says the geometric signature "is visible in three points" two steps
after requiring evaluation "across the entire supported range", and is silent on the two
cases that break the CV test in practice: an offset family (`a·bⁿ + c`) and integer
rounding at low levels. `rarity-inflation-and-affix-saturation-alerts` calls a sub-2%
per-level power gain "statistically indistinguishable" — a perceptual claim wearing a
statistical word, with no test behind it.

The applications are where the verified news is. `node--source-drain-converter-trader-vocabulary`
(verified_on 2026-09-02) is now false in the present tense: PoF commit `bec84b0a`
(2026-09-03, "fix: eight defects the game-production knowledge harvest exposed") widened
`EconomyEventType` to `'faucet' | 'sink' | 'converter' | 'trader' | 'pool'`
(`src/types/economy-simulator.ts:29`) and added `src/lib/economy/node-audit.ts`, which
implements the five-kind classification, the book-closing and the unaudited verdict, and
quotes this technique in its header. The document's central assertion — "There is no
converter kind, no trader kind, and no pool as a first-class node" — and its
"transplantable repair" describe a state the consumer left one day after the citation was
resolved. `process--faucet-sink-balance-band` is stale in the same direction and for the
same commit: its closing finding (an empty violation list reads as a clean pass) is now
answered at the caller, where `lintCanonConformance` emits a `critical` violation when the
sim's balance verdict is neither `pass` nor `fail`. Both need re-cutting against current
bytes; neither gets a refreshed `verified_on` from me.

The other two applications I re-read against the live tree and they hold: the sweep still
overrides `baseAmount` only and still defaults to `range 0.5`
(`sensitivity-sweep.ts:36-37,64`), and the triviality floor is still hardcoded to
`item.id === 'health-potion'` at `info` severity (`simulation-engine.ts:639-652`). Their
line-number citations have drifted (`:477` is now `:639`); the symbol names are all
still correct, which is the argument for citing symbols rather than lines.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/game-economy-tuning",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:cbea1e79760b8811",
  "disposition": "clarify",
  "coverage": "All 16 owned documents read at reverted bytes. The cited consumer (C:/Users/kazda/kiro/pof, master) was read as source for every application claim I report on, including git history for the 2026-09-03 vocabulary adoption. Not evaluated: no economy simulation, sweep, goal-seek or test was executed; no telemetry, playtest or market data was consulted; the numeric defensibility of the +/-15% band, the Gini 0.6/0.8 thresholds and the five loot thresholds against real player data is untested and out of scope for a document review.",
  "counterexamples": [
    "faucet-sink-balance-band: at inflow 1.2 and outflow 0.8 the entry-shape rule gives 50% of the faucet total and procedure step 5 gives 33.3% of max(inflow,outflow). Against a +/-15% band both are failures, but at inflow 1.0 / outflow 0.87 they read 13% and 13% versus a case at inflow 0.87 / outflow 1.0 where the faucet denominator reads 15% and the max denominator reads 13% - the same economy passes or fails on which sentence the reader obeyed.",
    "structural-economy-simulation-before-numbers: a converter authored at ten ore per bar is walked at one-for-one by step 2, so the bar pool diverges at unit rates and starves at authored rates. That falsifies 'a pool that diverges at unit rates diverges at every set of rates that preserves the loop'.",
    "intransitive-equilibrium-solving: a weakly dominated strategy can be played with positive probability in a Nash equilibrium, so step 2's deletion of options whose payoffs are 'less than or equal to another option's in every column' can remove a rationally-used option; iterated weak deletion is also order-dependent, so the survivor set is not well-defined.",
    "source-drain-converter-trader-vocabulary: a vendor with finite stock, or a trader that charges a percentage fee, is neither cleanly a trader nor cleanly a converter under the stated test; the doc's 'split it rather than widen a name' covers the fee case only if the author already knows to look for it, and says nothing about throughput bounded by stock."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof src/types/economy-simulator.ts, src/lib/economy/node-audit.ts, git log bec84b0a (2026-09-03)",
      "result": "Established that EconomyEventType now carries all five node kinds and that node-audit.ts implements the classification, book-closing and unaudited verdict, one day after node--source-drain-converter-trader-vocabulary's stated citation date. Did not establish whether the audit is correct or reachable from the UI; the module was read, not run."
    },
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/balance/canon-conformance.ts:103-118, 206-231",
      "result": "Confirmed the max(inflow,outflow,1) denominator and confirmed that the unmeasured-verdict escalation now lives at the caller, so process--faucet-sink-balance-band's closing gap is closed. Did not run the linter or its tests."
    },
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/economy/sensitivity-sweep.ts, src/lib/economy/simulation-engine.ts:639-652",
      "result": "Confirmed the two tornado limitations and the hardcoded health-potion triviality guard still stand; confirmed line-number citations have drifted while symbol names have not. Did not execute a sweep."
    }
  ],
  "documents": {
    "game-economy-tuning.md": {
      "disposition": "clarify",
      "reason": "States the +/-15% band with no denominator, so it inherits the faucet-total versus max(inflow,outflow) ambiguity from the technique it summarises. Name one basis here, since this is the sentence a checker is told to read the threshold from."
    },
    "techniques/cost-curve-object-audit.md": {
      "disposition": "keep",
      "reason": "Retracts the earlier reverify. 'A restricted benefit is never a cost, and its value is never zero' is an authoring rule against pricing a conditional at or below zero, stated with its reason; it is not a claim that no condition can be unreachable. The technique already scopes itself to intended rather than emergent value."
    },
    "techniques/economy-philosophy-multipliers.md": {
      "disposition": "keep",
      "reason": "Retracts the earlier reverify. The neutral 1.0 vector and the three axes are presented as design choices with stated reasons, and 'when two stances produce the same simulated outcome, one of them is not a stance' is a decision rule about axis reach, not a proof that stances collapse."
    },
    "techniques/faucet-sink-balance-band.md": {
      "disposition": "clarify",
      "reason": "Two denominators for one quantity: the entry-shape section says net flow is the difference over the faucet total and is 'the only number the band applies to'; step 5 says the imbalance is the absolute difference over max(inflow, outflow) and explicitly 'not over the faucet total'; step 6's worked verdict then quotes '+9% of faucet throughput'. Pick one, state zero-flow behaviour, and reconcile the worked example."
    },
    "techniques/feedback-loop-topology-and-polarity.md": {
      "disposition": "clarify",
      "reason": "Retracts the earlier reverify - the doc already refuses to deduce convergence from a signed topology. The live defect is narrower: gain is defined so that every reinforcing loop exceeds one and 1.02 is called 'a texture', yet the decision rule makes gain>1 with long latency a critical finding, which fires on the texture case. State a gain threshold, not the sign."
    },
    "techniques/intransitive-equilibrium-solving.md": {
      "disposition": "clarify",
      "reason": "Step 2 applies the strict-dominance guarantee ('zero rational use at any price') to a weak-dominance test ('less than or equal to ... in every column'). Weakly dominated strategies can appear in Nash equilibria and iterated weak deletion is order-dependent. Step 3 states only the on-support indifference condition and omits the off-support best-response requirement and any existence/uniqueness caveat."
    },
    "techniques/progression-curve-shape-tests.md": {
      "disposition": "clarify",
      "reason": "'The ratio of logarithms is near-constant' does not characterise a power law - the constant quantity is the log-log slope, a ratio of differences of logarithms. Also: 'visible in three points' contradicts step 2's whole-range requirement, and the CV<0.15 test is silent on offset families (a*b^n + c) and on integer rounding at low levels, both of which produce false family failures."
    },
    "techniques/rarity-inflation-and-affix-saturation-alerts.md": {
      "disposition": "clarify",
      "reason": "'Statistically indistinguishable' is asserted for a sub-2% per-level power gain with no test, sample or distribution behind it; the claim being made is perceptual. Rarity inflation as a ratio to baseline is also undefined when the baseline rate is zero, which the procedure does not address."
    },
    "techniques/source-drain-converter-trader-vocabulary.md": {
      "disposition": "keep",
      "reason": "Retracts the earlier reverify. Step 5 already closes the books per resource rather than across unlike ones, and step 4 already gives a capped pool's overflow an entry. Finite vendor stock and percentage transaction fees are boundary cases the five names handle only if the auditor already knows to split the node; that is a counterexample, not a wrong claim."
    },
    "techniques/structural-economy-simulation-before-numbers.md": {
      "disposition": "clarify",
      "reason": "The bolded claim called 'the entire value of the technique' - a pool that diverges at unit rates diverges at every set of rates preserving the loop - is falsified by the technique's own step 2, which sets every conversion ratio to one for one and so discards the term that sets loop gain. The supportable claim is that unit-rate divergence identifies a topology worth pricing."
    },
    "techniques/tornado-sensitivity-sweeps.md": {
      "disposition": "keep",
      "reason": "Retracts the earlier reverify. The interior-optimum and interaction limitations are already stated in 'What the method cannot tell you', ranges are already tagged by provenance with the confidence interval named for measured inputs, and the run-to-run noise floor is already handled as 'indistinguishable, not zero'."
    },
    "techniques/wealth-concentration-and-price-imbalance-alerts.md": {
      "disposition": "keep",
      "reason": "Retracts the earlier reverify. Population, count and simulated variance parameters are already required by step 1 and step 2, the single-agent case is already excluded, and cost is already expressed as a fraction of hourly income rather than an absolute. The finite-population (n-1)/n Gini maximum and the negative-balance case are unstated boundaries, not wrong claims."
    },
    "applications/node--source-drain-converter-trader-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Verified stale against the live consumer. PoF commit bec84b0a (2026-09-03) widened EconomyEventType to all five kinds and added src/lib/economy/node-audit.ts, so the document's present-tense claims ('there is no converter kind, no trader kind, and no pool as a first-class node') and its entire 'transplantable repair' section describe a state that ended one day after the stated citation date. Re-cut against current bytes; verified_on is not refreshed."
    },
    "applications/node--tornado-sensitivity-sweeps.md": {
      "disposition": "keep",
      "reason": "Re-read against the live consumer: withOverride still writes only baseAmount (sensitivity-sweep.ts:36-37) and range still defaults to 0.5 (:64), so both stated limitations hold. Line-number citations have drifted from the 2026-08-30 reading while every cited symbol name resolves; prefer symbol anchors on the next edit. No sweep was executed and verified_on is not refreshed."
    },
    "applications/node--wealth-concentration-and-price-imbalance-alerts.md": {
      "disposition": "keep",
      "reason": "Re-read against the live consumer: the triviality floor is still guarded by item.id === 'health-potion' and still emits at info severity (simulation-engine.ts:639-652), so the document's central finding stands. Line numbers have drifted from :477 to :639. No simulation was run and verified_on is not refreshed."
    },
    "applications/process--faucet-sink-balance-band.md": {
      "disposition": "reverify",
      "reason": "Its closing finding is now stale: lintCanonConformance (canon-conformance.ts:206-231) escalates an unaudited or unspecified balance verdict to a critical violation, so an empty violation list no longer reads as a clean pass at the caller. It also calls max(inflow,outflow,1) 'the symmetric denominator the technique specifies' without noting that the technique specifies a second, incompatible one, or that the ,1 floor is an addition with unit-dependent behaviour. verified_on is not refreshed."
    }
  }
}
```
