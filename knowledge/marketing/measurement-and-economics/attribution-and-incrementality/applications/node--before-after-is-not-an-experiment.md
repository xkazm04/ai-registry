---
layer: application
type: application
subject: attribution-and-incrementality
technique: before-after-is-not-an-experiment
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Before/after is not an experiment - the realized-impact read that labels itself

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` realises the
technique in one pure module, `src/lib/campaigns/realize.ts`, which measures an
applied budget change-set by the seven days after it against the seven before. The
structural fact it proves is exactly the technique's: **the honesty of the read lives
in a comment and in the states the function can return, not in any rule that stops
a consumer narrating it causally.** The module says in its own header
(`realize.ts:6-11`) that "it is not an experiment. Nothing here claims the delta was
CAUSED by the change-set - the account moved for many reasons in those 14 days. It is
the honest observable: the projection said +X, the touched campaigns then did +Y".
That is the technique's sentence verbatim; what the tree enforces structurally is the
window shape, the coverage floor and the null ratio, and what it leaves to discipline
is the verb.

## The window is equal and whole-week by construction

`REALIZE_WINDOW_DAYS = 7` (`realize.ts:18`) with the comment "a whole week on both
sides, so weekday seasonality cancels rather than being compared away". The windows
are day-aligned regardless of the time of day the change was applied
(`realize.ts:129-134`): the after window is the apply day plus the six that follow,
the before window the seven that precede the apply day, both built by `dayWindow`
over UTC day keys. Two equal windows of the same shape is the technique's first
procedural step, and it is not a parameter anyone can set unequal.

## The coverage floor returns a state, not a number

`REALIZE_MIN_DAYS = 5` (`realize.ts:24`) is the five-of-seven convention, with its
reasoning stated: "leaves room for the odd zero-delivery gap at the edges without
letting a window that has largely rolled out of the stored period masquerade as a
measurement". `daysCovered` (`realize.ts:91-103`) counts the union of covered days
across the touched campaigns, and the comment explains why the union rather than the
weakest campaign: coverage is a property of the stored period, and the failure guarded
against is the window falling outside it, which hits every campaign at once. The
result's `status` is `"measured"` only when both windows clear the floor, else
`"insufficient"` (`realize.ts:148, 154`).

The tree also separates a third state the technique names: "not due yet" returns
`null` and is never persisted (`realize.ts:105-116, 127`), because "'Not due yet' is
not a degradation, so it must not be persisted as one - the next sync will try
again". The three states - null, insufficient, measured - are typed, which is the
recruiting bundle's small-sample discipline arriving in a marketing tree.

## The ratio refuses when it would be a number dressed as a measurement

`ratio` (`realize.ts:161-164`) is computed only when `measured && projected > 0`,
otherwise `null`, with the comment: "A ratio against a projection of zero-or-worse
divides by nothing meaningful, and a ratio over a window we could not cover would be
a number dressed up as a measurement. Both read null; the UI shows the delta without
the percentage." That is the technique's fifth step as a return value.

## Touched campaigns only, and a blank id is excluded

`touchedCampaignIds` (`realize.ts:46-63`) collects every donor and every recipient of
a shift, skipping a pause's empty recipient: "measuring a blank id would silently
pull the whole account's un-keyed series into the sums". The sums run over the
change-set's own campaigns (`realize.ts:136-142`), so the read is of the treated set
and nothing else.

## The one consumer is calibration

The header names the read's consumer: "the operator (and the calibration in
./calibration) gets to see the gap instead of only ever seeing forecasts".
`src/lib/campaigns/calibration.ts` takes the median of realized over projected across
at least three measured sets, clamps it to `[0.3, 1.5]`, and discloses it on every
projection (per the scout's reading of `calibration.ts:1-30, 63-87`). That is the
technique's decision rule - several reads, a clamped median, disclosed - and it is
the only inference the tree draws from the before/after read.

## Where the tree falls short of the standard

Nothing in the tree prevents a prompt or a report line from narrating
`realizedValueDelta` with a causal verb; the honesty is by comment and by the null
ratio, not by a rule at the point of narration. The calibration is one median across
change kinds - pauses and shifts together - which the technique's "when NOT to use"
section flags as hiding two different optimisms. And the scout's own finding stands:
the tree has no holdout, so its projected-versus-realized loop is a calibration of its
forecaster and not an incrementality read of its changes. The standard stays; the
comment at `realize.ts:6-11` shows the authors knew it.
