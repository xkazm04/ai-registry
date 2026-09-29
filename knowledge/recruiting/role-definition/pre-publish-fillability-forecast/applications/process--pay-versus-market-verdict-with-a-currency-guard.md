---
layer: application
type: application
subject: pre-publish-fillability-forecast
technique: pay-versus-market-verdict-with-a-currency-guard
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The pay verdict over an ad that stated no pay, and the guard it was missing

The winnability coach's salary block (`assess_winnability`, `salary`) already
carried the technique's currency guard: `belowMarket` is `None`, not `False`,
when the job's and the benchmark's currencies differ, and the panel renders
nothing for `None`. The technique's rule 6 says the guard generalises past
currency. Nothing in the tree applied it to the two inputs the ad itself may
never have stated.

## What the tree did, run

`normalize_job` fills what an ad omits and records it in
`Job.defaulted_fields`: a level from `DEFAULT_POLICY` (`medior`), and, when no
usable pay range is stated, the taxonomy market-anchor band, recorded as the
`salary_band` phantom. The coach never read that record. Three ads through the
unmodified `assess_winnability`, one market (CZK, the benchmark's own):

| Ad | What it stated | `belowMarket` | `topVsMarketFloorPct` | `jobBand` |
| --- | --- | --- | --- | --- |
| A | no pay, no level | `False` | +57 | the market band itself |
| B | 40–50k, no level | `True` | −24 | 40–50k, judged against the `medior` band |
| C | 20–30k, level senior | `True` | −71 | 20–30k |

A is the technique's failure with no currency in it: the stamped band *is* the
market band, top-against-floor of a band with itself can never read "below", and
the coach returned a clean bill for a role that named no figure. B is the same
disease on the other input: a range the ad did state, measured against the band
of a level it never claimed. Only C is a verdict the ad earned.

## The same tree already had the rule, on the other side

`_salary_flag` in `matching.py` compares a *seeker's* expectation with the posted
range, and it reads a defaulted band as unknown: `if not job.salary_band or
"salary_band" in job.defaulted_fields:` → `state="unknown"`, detail "posting
states no pay", with the comment that a band stamped from the market anchor "is
a PHANTOM the ad never asserted ... Missing pay is UNKNOWN, never 'under'". The
work-mode branch of `ko_filter` carries the same rule, and its comment claims the
salary coach follows it ("like campaign.py's `_job_facts` and the salary coach it
is treated as absent"). It did not. Two consumers of one phantom, one guarded: the
divergence is the tell the technique now names.

## The change and its arms

Kp `d790fdf67` makes `assess_winnability` collect `assumed = [f for f in
("salary_band", "seniority") if f in job.defaulted_fields]`; when non-empty,
`belowMarket` is `None`, `topVsMarketFloorPct` is omitted, a stamped band is not
reported as `jobBand`, and `assumedInputs` names what was assumed (typed as
optional on the wire). Arm A is the unmodified code above; arm B is the change.
Ad A: `None`, no percentage, `jobBand null`, `["salary_band"]`. Ad B: `None`,
`jobBand` kept, `["seniority"]`. Ad C: `True`, −71%, `[]`, unchanged. Three tests
pin the three ads (a fourth, below, pins the currency), the module's 27 winnability tests
pass, `ruff check` is clean.

The technique's other clause is *not* met: the panel renders no row for a silent
verdict (`derivePatterns` emits the salary row only for `belowMarket === true`),
so the third state still has no sentence of its own. The fix removed a false
"fine"; it did not add the words for "cannot say", and a role that names no pay
looks the same on the panel as one that is at market.

## A second gap in the same guard, and the third commit

The guard itself compared the benchmark's currency with `market.currency`, the
currency of the market the job was authored for, and never read the currency the
*posting* stated. A range stated in EUR on a CZK-market job (3000–4000, currency
EUR) came back `belowMarket True`, −95% under the CZK floor: read as CZK. The
seeker-side flag had fixed the same trap ("answering every ad in the market's
currency is how a EUR posting reached the reader as 'no pay'"). Kp `0c6c9e39c`
lets the posting's own currency win, through the symbol-aware `_norm_currency`
(a euro sign is EUR), and falls back to the market's only for an ad that named
none; the EUR ad is now `currencyComparable False`, `belowMarket None`. This is the
technique's rule 3 met from the other direction: one comparability predicate, fed
the same currency the rest of the tree reads.

## Deviations

- **The third state has no sentence.** `assumedInputs` and `currencyComparable` are
  on the wire and unused by the surface; a role that names no pay looks the same
  on the panel as one at market.
- **Period is only handled by omission.** A posting that states an hourly range gets
  no band (the market band is monthly), so it now falls under the `salary_band`
  phantom and is silent; a yearly figure is restated ×12 upstream. Neither is
  visible in the coach, which never reads `salary_period`.
- **Seniority is silenced whole.** A defaulted level silences the verdict rather
  than comparing against the family's full range across levels, which would still
  answer a narrower question ("below every level's floor"); the technique's rule
  holds either way, and silence is the conservative reading.
