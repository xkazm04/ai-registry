---
layer: application
type: application
subject: cost-metering
technique: budget-enforcement
stack: node
verified_on: 2026-08-24
verified_against: node@20
---

# A spend ceiling inside an imaging chokepoint

`gravitone-gcloud` — a Next.js 16 content studio that generates images through
three vendors (Google, Leonardo, Qwen) behind one router. Paths are relative
to the repo root; citations resolved 2026-08-24 at commit `d74adc8`. The
metered unit here is an **image**, not a token, which is why the estimator can
be a table lookup rather than a tokenizer. The repo declares no `engines`
field and no CI node version; `@types/node ^20` in `package.json` is the only
node witness in a manifest, so that is the pin — a weaker witness than usual
and stated as such.

## 1. Why the file exists, stated where the file is

`lib/imaging/budget.ts:1-25` opens with the sentence the technique is
organized around: "Metering you can read but not enforce is a dashboard, not
a limit. This module is the limit." The header then names the gap it closes —
`pricing.ts` could say what a call was likely to cost and the router logged
what one *did* cost, but "nothing stood between a caller and an unbounded
bill: a loop against /api/imaging/generate spent the operator's balance as
fast as the vendor would answer."

## 2. One enforcement point, and it is the chokepoint

The technique's test is enumeration. Here the enumeration is one line.
`lib/imaging/router.ts:160-165` calls
`assertWithinBudget(estimatePendingUsd(pendingImages))` inside `run()` — the
single private function every public capability (`generate`, `edit`, and
their siblings) routes through — *before* `await walk()` starts the vendor
chain. The comment states the two properties that matter: "refused BEFORE any
vendor is touched — once per request, not per candidate in the chain."

Once-per-request is the non-obvious half. A budget check placed inside the
candidate loop would re-gate on each reroute hop, which sounds stricter and is
wrong: it makes the refusal depend on how many vendors happened to fail
first. Gating outside the walk means the decision is a property of the request.

The wiring is pinned dynamically rather than asserted. `generate()` with the
ceiling set to `0.001` and *no vendor keys at all* raises `over-budget`, not
`no-key` (`tests/golden-path/imaging-budget.probe.spec.ts:96-110`) — the
budget was consulted before the chain discovered it had nobody to call. Its
sibling flips the ceiling to `100` and asserts `no-key`, "proving the budget
let it through" (`:112-125`). Two probes, and between them they prove the gate
is on the path and that it is not simply refusing everything.

## 3. The estimate errs high, on purpose and in one direction

`estimatePendingUsd` (`budget.ts:66-78`) prices the pending call from
`estimatePerImage()` and multiplies by the image count. `estimatePerImage`
(`lib/imaging/pricing.ts:274-296`) returns the **ceiling over the priced
per-image rows** — the dearest declared rate — and says why: the price table
cannot know which vendor the router will pick, "so the answer is the ceiling
over the priced per-image rows, which errs HIGH, and erring high is the right
direction for a warning about money." That is the technique's asymmetry taken
deliberately: a false refusal costs a retry, a false pass costs money.

A batch is priced as a batch. `req.count ?? 1` is threaded into `run()` as
`pendingImages` (`router.ts:295-296`, "A batch of N images is priced (and
gated) as N, not 1"), so the gate sees the request's real size rather than one
image's worth of it.

## 4. The price table refuses to guess, and the guard survives that

`lib/imaging/pricing.ts:1-20` is built around one rule stated in capitals:
"never invent a price." Every row either carries a figure *with* its `source`
and the `checked` date that source was last verified, or carries no figure and
a `source` string explaining why there is none (`:80-82`, and rows such as
`:150-152`, "Per-token, rate unchecked"). The header's argument for the
discipline is the one the golden path makes about zero-cost defaults, arrived
at independently: Google "carries no money field at all, so every spend figure
the studio renders was structurally `undefined` in production… A number that
is always missing reads as 'free', which is the one thing it certainly is not."

The interesting part is what the *enforcement* side does with an unpriceable
call. `estimatePendingUsd` returns `0` when no per-image row carries a figure
(`budget.ts:74-78`) — the pre-call gate simply cannot bind — but the header
comment on that branch closes the loop: "an unpriceable call cannot be gated
on cost, but its ACTUAL figure is still booked afterwards via recordSpend, so
it counts toward the NEXT call's check." Enforcement degrades from prevention
to one-call-late accounting exactly where the table admits ignorance, rather
than pretending to a bound it does not have.

`recordSpend` (`budget.ts:99-111`) books the figure the call actually carried,
and the router prefers the vendor-reported cost over the estimate —
`recordSpend(served.provenance.costUsd ?? estimatePendingUsd(pendingImages))`
(`router.ts:232-234`), "so an unreported cost still counts toward the next
ceiling." A non-finite or non-positive figure is ignored rather than booked as
zero.

## 5. Defaults are safe, and `0` is a ceiling

Two configuration decisions the technique asks to be made explicitly, both
made here:

- **An unset ceiling is bounded, not unlimited.** `budgetCeilingUsd()`
  (`budget.ts:36-41`) falls back to `$5` over a one-hour window
  (`:33-34`); the header names the failure it is refusing —
  "DEFAULTS ARE SAFE, NOT UNLIMITED… An unset ceiling is a bounded ceiling,
  not an open tab." A probe pins it (`imaging-budget.probe.spec.ts:88-95`,
  "default ceiling is a real bound, not unlimited"). This is
  [an absent guard being loud](../../../../_laws.md#absent-guard-is-loud)
  resolved in the self-engaging direction: the guard does not wait to be
  configured.
- **The unlimited sentinel is not zero.** `0` passes the `n >= 0` test and
  becomes a real ceiling meaning "spend nothing" (`:36-37`) — the technique's
  requirement that whichever encoding is chosen, every reader interprets it
  identically. Here there is no unlimited encoding at all, which is the
  cleanest resolution available.

The window is rolling and pruned on read (`budget.ts:55-64`), and rollover is
pinned with an injectable clock (`assertWithinBudget(pendingUsd, now)`,
`:85`; probe at `:67-86`).

## 6. The refusal is typed, and mapped to a status once

`overBudget` (`lib/imaging/errors.ts:114-119`) is a typed `ImagingError` with
kind `over-budget`, and `statusFor` (`:122-136`) maps it to **402** in the one
switch every route reads — "One place, so two routes cannot disagree about
what a refusal is", consumed at `lib/imaging/api.ts:125`. The message carries
the machine-relevant numbers in human form: the estimate, the spend already in
the window, the window length in minutes, the ceiling, and the environment
variable that raises it (`budget.ts:89-95`), ending "Refused before any vendor
was called; wait for the window to roll over or raise the ceiling."

## Reconciliation summary

Confirmed: a single enforcement point at the chokepoint, before the vendor
walk and once per request, pinned by two dynamic probes that distinguish
`over-budget` from `no-key`; an estimate that errs high by construction and
scales with batch size; a price table where a missing figure is a declared
decision with a source and a checked date; safe-not-unlimited defaults with
`0` as a real ceiling; a typed refusal mapped to 402 in one switch, carrying
the numbers and the remedy.

Deviations against the technique. The ledger is an in-process array
(`budget.ts:49-53`) — the file says so plainly ("good enough for a
single-instance prototype; a scaled-out deployment would move the ledger to a
shared store"), but it means the ceiling is per-process and resets on deploy,
so it is a runaway-loop guard rather than a spend ceiling in the accounting
sense, and nothing counts the resets. **Refusals are not counted** — the
technique's own health metric is absent, so "zero refusals" here is
uninterpretable. There is no fail-open/fail-closed question because there is
no store to be unavailable; when one arrives, that decision arrives with it.
And an unpriceable call is gated at `0`, which is correct as a floor but means
the enumeration of *enforced* paths is narrower than the enumeration of
metered ones — the technique's gap, visible and named in the code rather than
discovered later.

Upward lesson taken into the technique's neighbours: the gate is placed
*outside* the reroute walk deliberately, so a request's refusal does not
depend on how many vendors failed before it — a placement rule that only
surfaces once a chokepoint has a candidate chain behind it.
