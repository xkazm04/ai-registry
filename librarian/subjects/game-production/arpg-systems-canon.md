---
domain: game-production
subject: arpg-systems-canon
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# arpg-systems-canon

## Architecture review - 2026-09-10

Read all nine documents. Reframed canon examples as local rules and corrected
stacking, mitigation, loot and effective-health arithmetic. Both applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/arpg-systems-canon",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b15a69af0914f5f8",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "An additive sum grows without bound even while each fixed addition has diminishing relative gain.",
    "At 100% critical chance, increasing critical multiplier still increases damage.",
    "Physical-only armour and nonphysical-only resistance act on disjoint components and commute.",
    "Comparing mitigated damage against EHP counts the same mitigation twice.",
    "Six equal-value affixes need not have the same total power as two.",
    "The example level-25 versus level-1 multiplier ratio is 3.5/1.1, not 3.5."
  ],
  "sources": [
    {
      "url": "https://www.pathofexile.com/forum/view-thread/1930316",
      "scope": "Official historical 3.0 ailment/hit separation; counterexample to universal doctrine, not verification of current game formulas or local consumer."
    }
  ],
  "documents": {
    "arpg-systems-canon.md": {
      "disposition": "clarify",
      "reason": "Reframe local canon as project policy and correct additive saturation, disjoint mitigation, loot power and EHP bases."
    },
    "techniques/added-increased-more-stacking.md": {
      "disposition": "clarify",
      "reason": "Correct relative diminishing returns versus saturation, unbounded multiplier chains and critical throughput terminology."
    },
    "techniques/mitigation-order-and-soft-caps.md": {
      "disposition": "clarify",
      "reason": "Correct commutativity, percentage-point penetration and negative resistance; qualify caps and entropy guarantees."
    },
    "techniques/ailments-scale-off-the-hit.md": {
      "disposition": "clarify",
      "reason": "Scope hit-derived ailments; clarify double mitigation, duration, hybrids and independent scaling."
    },
    "techniques/rarity-is-an-affix-budget.md": {
      "disposition": "clarify",
      "reason": "Resolve constant-power contradiction; separate frequency from desirability and define sampling/functional effect contracts."
    },
    "techniques/ilvl-gated-affix-tiers.md": {
      "disposition": "clarify",
      "reason": "Correct example ratios and tier ordering; qualify level relationships and enforce weighted-sampling boundaries."
    },
    "techniques/layered-defenses-and-the-ehp-floor.md": {
      "disposition": "clarify",
      "reason": "Fix raw-versus-mitigated EHP comparison and strict survival boundary; scope probabilistic and temporal guarantees."
    },
    "applications/node--mitigation-order-and-soft-caps.md": {
      "disposition": "reverify",
      "reason": "Reverify runtime parity, invalid inputs, default damage types and RNG migration claims."
    },
    "applications/process--rarity-is-an-affix-budget.md": {
      "disposition": "reverify",
      "reason": "Reverify canon parity and power allocation; correct level-scaling ratio and scope historical genre comparison."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

Read all nine documents at their reverted bytes, read the cited consumer
(`C:/Users/kazda/kiro/pof`, `master`) as source, and checked two external claims against
primary sources. Reading a source is not executing the software it describes: no combat
sim, kernel test or game was run.

**Retraction, and it is the sharpest thing in this entry.** The "Review boundary -
2026-09-10" section appended to `applications/process--rarity-is-an-affix-budget.md`
cites the [Path of Exile 3.0.0 patch notes](https://www.pathofexile.com/forum/view-thread/1930316)
as describing "separate ailment and hit scaling, a historical counterexample to treating
hit-derived ailments as genre law". I fetched that source. Its Damage Over Time Rework
section says the opposite: "Skills calculate their Ignite, Poison or Bleed values as a
separate damage value, **taken straight from the base and added damage of the skill**",
and "Poison, Bleed and Ignite damage values are based on the base damage of the skill,
and then affected by appropriate damage modifiers." 3.0.0 is the patch that *unified*
ailment magnitude onto the applying hit. The citation supports the canon it was entered
to undercut, and the appended paragraph must be removed or rewritten. A cited URL that
contradicts the sentence it is attached to is worse than an uncited claim, because it
reads as checked.

That same appended section also asserts the golden path's equal-power-across-rarities
claim "does not follow from more affixes with unchanged tier ranges". The technique does
not claim it follows; it reports it as a project-wide power target the consumer holds
(`ARPG-LAWS.md` §1, "Total item power still targets the tier ~100 (+/-10%) envelope"),
which is a design invariant, not a derivation. That part of the boundary is over-reach.
Its arithmetic correction is right, though, and now leaves the document contradicting
itself: the body says a level-1 and a level-25 source "differ only by a 3.5x scalar"
while the appended paragraph computes 3.5/1.1 = 3.18. One document, two numbers, no
reconciliation.

The live defect I did not expect is a formula disagreement between the golden path and
its own technique. The golden path writes the armour soft cap as
`armour / (armour + 5 x rawPhysicalHit)`; `mitigation-order-and-soft-caps` writes
`reduction = armour / (armour + k x rawHit) with k around 5`. Those are different
functions on a mixed-type hit, and the difference is load-bearing, because the technique
builds its central "the order is load-bearing" argument on it: "Put resistance first and
armour sees a smaller hit". Under the technique's own type split — armour answers
physical, resistance answers everything else — resistance never touches the physical
portion, so with `rawPhysicalHit` the two fractional layers *do* commute and the
argument evaporates. The consumer settles which reading was intended:
`canon-kernel.ts:118` is `armourReduction(armour, rawPhysHit, weight)` returning
`eff / (eff + ARMOUR_HIT_COEFF * rawPhysHit)`. The golden path is right, the technique's
`rawHit` is the error, and the non-commutativity paragraph needs rewriting rather than a
one-word fix. The appended boundary on `node--mitigation-order-and-soft-caps` had already
noticed the contradiction from the consumer side; that observation is affirmed.

The ailment envelopes are the second substantive finding, and it is a units problem of
the kind this bundle usually catches. `ailments-scale-off-the-hit` defines the coefficient
as a total spread over the duration — `ailment damage per second = coefficient x
(matching-type damage of the applying hit) / duration` — and then states envelopes of
~90% over 4s (ignition), ~70% over 5s (bleeding), ~20% per stack over 2s (poison). The
genre convention those numbers come from states them per second: ignite 90% of the base
fire damage of the hit *per second* for 4s, bleed 70% *per second* for 5s, poison 30%
*per second* for 2s. Read as totals they are four to five times weaker, and poison is
also 20 where the convention is 30. That is not a nitpick here, because the same document
tells you how to handle "an ailment meant to be a build's main damage source" — at 90%
of one hit spread over four seconds, with a *highest-only* accumulation law, ignition
cannot be one. Either state the coefficient as per-second and drop the `/ duration`, or
keep the total form and raise the envelopes; the golden path carries the same figures and
must move with it.

Smaller: the golden path introduces the fifth damage type as one that "leans toward
damage over time and bypasses the physical mitigation layer". Every non-physical type
bypasses armour by the canon's own type split, so as written the property is either
trivial or a mis-statement of the genre-distinctive one, which is that the type bypasses
the *shield buffer*. `layered-defenses-and-the-ehp-floor` names the buffer layer and does
not connect it to the chaos-shaped type, so the gap is real and cheap to close.

Everything else held under re-reading. The arithmetic checks out where it can be checked:
75% resistance cap gives at most a 4x effective-health multiple, 20% penetration against
a capped target mitigates as 55%, block at 75%, crit cap at 0.95, crit multiplier 2.5,
the accuracy curve and the 5% floor. The consumer confirms the kernel constants named in
`node--mitigation-order-and-soft-caps` at `canon-kernel.ts:34-43`, and the `Physical`
versus `RESIST_TYPES` split at `:34`. `rarity-is-an-affix-budget`,
`ilvl-gated-affix-tiers` and `added-increased-more-stacking` I could find nothing wrong
with beyond the ailment coupling above; the `1/(1+S)` marginal-value derivation, the
1.4-1.6x within-tier spread and 1.5-2x between-tier step, and the prefix/suffix budget
table are all internally consistent and stated with their bases.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/arpg-systems-canon",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:9a0893f9b812d20f",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read at reverted bytes. Two external claims checked against primary sources (the PoE 3.0.0 patch notes cited by an appended review boundary, and the genre's ailment coefficient convention). The cited consumer C:/Users/kazda/kiro/pof was read as source for canon-kernel.ts constants and the armour signature. Not evaluated: no combat simulation, kernel unit test, item generation run or gameplay was executed; the balance defensibility of the stated envelopes (crit multiplier 2.5, tier spreads, the three-hit floor) against real play is untested; ARPG-LAWS.md and the catalog pipelines cited by process--rarity-is-an-affix-budget were not re-read line by line.",
  "counterexamples": [
    "mitigation-order-and-soft-caps: on a hit that is 60% physical and 40% fire, the technique's non-commutativity argument requires resistance to shrink the hit armour sees. Under its own type split resistance touches only the fire portion, so with the golden path's rawPhysicalHit denominator (which the consumer implements) the two fractional layers commute exactly and the stated reason for fixing their order does not hold.",
    "ailments-scale-off-the-hit: a build whose damage is meant to come from ignition. Under the stated formula (coefficient / duration) at ~90% over 4s with highest-only accumulation, ignition peaks at roughly 22% of one hit per second and can never be a main channel - contradicting the same document's decision rule for exactly that case.",
    "arpg-systems-canon.md: a hit carrying only fire damage against a defender with armour. The stated distinguishing property of the fifth damage type - that it 'bypasses the physical mitigation layer' - is equally true of the fire hit, so the property distinguishes nothing; the genre-distinctive behaviour (bypassing the shield buffer) is named nowhere in the subject."
  ],
  "sources": [
    {
      "url": "https://www.pathofexile.com/forum/view-thread/1930316",
      "result": "Fetched. Its Damage Over Time Rework states that Ignite, Poison and Bleed values are 'taken straight from the base and added damage of the skill', which supports hit-derived ailment magnitude. It therefore refutes the appended review-boundary claim in process--rarity-is-an-affix-budget.md that this source is a counterexample to hit-derived ailments. It does not validate this subject's specific coefficients, durations or accumulation laws, and it is a historical patch note, not a statement about the current game."
    },
    {
      "url": "https://pathofexile.fandom.com/wiki/Ailment",
      "result": "Searched for the genre's damaging-ailment coefficients. The convention is stated per second - ignite 90%/s for 4s, bleed 70%/s for 5s, poison 30%/s for 2s - which is 4x, 5x and 3x the totals this subject's envelopes imply under its own coefficient/duration formula. This establishes the ambiguity; it does not establish what this canon intended, which only the author can settle."
    },
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/combat/canon-kernel.ts:34-43, :118-121",
      "result": "Confirmed CRIT_MULTIPLIER 2.5, CRIT_CHANCE_CAP 0.95, RESIST_CAP 0.75, ARMOUR_HIT_COEFF 5, and RESIST_TYPES = Fire/Cold/Lightning/Chaos, and confirmed armourReduction takes rawPhysHit - settling the golden-path-versus-technique formula disagreement in the golden path's favour. The module was read, not executed; no parity or regression test was run."
    }
  ],
  "documents": {
    "arpg-systems-canon.md": {
      "disposition": "clarify",
      "reason": "Two fixes. The fifth damage type's stated distinguishing property ('bypasses the physical mitigation layer') is trivially true of every non-physical type under the canon's own split; the genre-distinctive property is that it bypasses the shield buffer, which appears nowhere. And the ailment envelopes (~90% of the fire hit over 4s, ~70% over 5s, ~20% per stack over 2s) must move with whatever ailments-scale-off-the-hit resolves - as totals they are 3-5x below the convention they are drawn from. The armour formula here is the correct one and should be the one the technique adopts."
    },
    "techniques/added-increased-more-stacking.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The composition order, the 1/(1+S) marginal-value derivation, the +50% more ceiling with its two-stacking consequence (x2.25), the conversion-before-scaling rule and the crit stage all check out arithmetically and are stated with their bases. No claim found that is wrong, unsupported or ambiguous at a boundary."
    },
    "techniques/ailments-scale-off-the-hit.md": {
      "disposition": "clarify",
      "reason": "The coefficient is defined as a total over the duration (per second = coefficient x hit / duration) but the envelopes are the genre's per-second figures (90%/s for 4s, 70%/s for 5s, 30%/s for 2s), so the table is 3-5x below its own source and poison is 20 where the convention is 30. Under the total reading the document's own decision rule for an ailment as a build's main damage source is unreachable. State whether the coefficient is per-second or total-over-duration, and reconcile the envelopes to that choice."
    },
    "techniques/ilvl-gated-affix-tiers.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The worked ladder, the two monotonicities, the 1.4-1.6x within-tier and 1.5-2x between-tier shape constants, and the item-level / required-level / character-level separation are internally consistent and each number carries its basis. Filter-then-weight versus bucket-then-look-up is a real distinction with a stated consequence."
    },
    "techniques/layered-defenses-and-the-ehp-floor.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The effective-health expression carries its basis triple, the 75% cap's 4x ceiling is correct, the avoidance-variance argument (50% avoidance means two consecutive hits about a quarter of the time) is right, and the floor is stated with its equipment expectation and its reference hit. The one thing it does not do is connect the buffer layer to the chaos-shaped damage type, which is where that gap belongs."
    },
    "techniques/mitigation-order-and-soft-caps.md": {
      "disposition": "clarify",
      "reason": "The soft-cap denominator is written as k x rawHit here and as 5 x rawPhysicalHit in the golden path; the consumer implements the latter (canon-kernel.ts:118). The discrepancy is load-bearing because the 'why the order is load-bearing' section argues from it: under the document's own type split, resistance never reduces the physical portion, so with the physical denominator the two fractional layers commute and the stated justification fails. Fix the formula and rewrite the argument to rest on the mixed-type portioning instead."
    },
    "techniques/rarity-is-an-affix-budget.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The count-versus-magnitude orthogonality argument, the prefix/suffix split, the family-distinctness rule and the affix-is-a-gameplay-effect requirement are consistent and each carries its reason. The constant-total-power framing is presented as a project invariant that makes 'rare rolls higher' visibly a violation, not as a theorem, so the appended boundary's derivation objection does not land against this document."
    },
    "applications/node--mitigation-order-and-soft-caps.md": {
      "disposition": "keep",
      "reason": "Its citations of canon-kernel.ts (the constants at :34-43, the required hit argument on armourReduction, the RESIST_TYPES split, the barred legacyArmorMitigation) were re-read against the live tree and hold. Its appended review boundary correctly identifies that the disjoint Physical/RESIST_TYPES handling contradicts the general swap-changes-a-mixed-hit claim; that observation is affirmed and is now carried as a finding against the technique rather than against this record. The historical migration was not re-run and verified_on is not refreshed."
    },
    "applications/process--rarity-is-an-affix-budget.md": {
      "disposition": "clarify",
      "reason": "Its appended review boundary cites the PoE 3.0.0 patch notes as a counterexample to hit-derived ailments; the source says the opposite ('taken straight from the base and added damage of the skill'), so that paragraph must be removed or rewritten. The same boundary's correction leaves the document self-contradictory - the body states a 3.5x scalar between level 1 and 25 while the boundary computes 3.18x - and its objection to the equal-power invariant treats a stated project target as a claimed derivation. The consumer files it cites were not re-read for this entry."
    }
  }
}
```
