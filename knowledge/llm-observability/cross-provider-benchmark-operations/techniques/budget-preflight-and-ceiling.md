---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: budget-preflight-and-ceiling
status: forged
laws: [quality-apparatus-stays-unbudgeted, estimation-announces-itself, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [a benchmark matrix could cost real money, an operator must approve spend before it happens, a halted run must not read as a passing one]
---

# Budget pre-flight and ceiling

A comparison matrix's cost is multiplicative — targets × cases × generation
samples × (one generation + k judge calls) — and humans estimate products
badly. An extra target and a ten-sample setting multiply where intuition
adds, so the invoice used to be the discovery mechanism. The technique is a
two-stage contract: **estimate before the first paid call, enforce a ceiling
during the run** — and a third clause that keeps the first two honest: a
run the ceiling stopped is *partial*, and partial is never green.

## The pre-flight

Before any paid call, print the run's shape and price: how many generation
calls, how many judge calls, and a dollar figure priced from the operator's
own price book at **nominal** token counts. The estimate is deliberately an
order-of-magnitude instrument — a benchmark's real prompts are unknown
before it runs — and it exists to catch the matrix that is a hundred times
too expensive, not to predict the invoice to the cent.

Two honesty rules make the number trustworthy:

- **Unpriced models are named, and the figure becomes a lower bound.** A
  model absent from the price book contributes zero to the estimate; the
  pre-flight names it and prints "at least this much" rather than "about
  this much". An estimate that silently reads missing prices as zero is the
  null-as-zero lie wearing a dollar sign.
- **The estimate is compared to a ceiling with a default.** A run whose
  estimate exceeds the ceiling aborts at pre-flight, printing the exact
  value to pass to proceed — so overriding is one deliberate flag naming
  the amount consented to, not a config archaeology session. Zero disables,
  for operators who genuinely want that.

## The live ceiling

The nominal estimate can be wrong in the expensive direction — real prompts
run longer than nominal — so the same ceiling is enforced *during* the run:
each unit of work checks accumulated real spend at a **case boundary**
before spending more. Never mid-call: a call already in flight is already
paid for, and killing it buys nothing but a lost verdict. Concurrent cells
sharing one budget need a race-free accumulator — integer micro-currency in
an atomic counter beats a float behind a lock — because two cells that both
pass the check by reading a stale total are how a ceiling leaks.

## The partial contract

A halted run kept its completed verdicts — they were paid for and they are
evidence — but the run itself is **partial**, and partial is contagious:

- the per-target report records that it was budget-halted, how many cases
  were skipped versus planned, and what was actually spent;
- the leaderboard renders a loud partial banner, not a quiet asterisk;
- any gate consuming the run treats partial as *unverified* — a distinct
  exit state from both pass and fail. A run that judged 30% of its dataset
  can never be a green build, because the unjudged 70% is not a random
  sample of anything: it is systematically the later cases.

## Decision rules

- **This ceiling is per-run and operator-facing; it is not the product's
  usage-limit engine.** The scoring apparatus stays unbudgeted as a matter
  of law — no usage cap ever throttles the quality path — and this ceiling
  deliberately reads none of that machinery. One is governance of customer
  traffic; this is an operator asking "am I about to spend how much?".
- **When the estimate and the invoice diverge repeatedly, fix the nominal
  constants, not the ceiling** — the ceiling's job is consent, the
  estimate's job is calibration, and conflating them turns both into noise.
- **When a run must complete regardless of cost** (a contractual deliverable,
  a one-time migration baseline), disable the ceiling explicitly and let the
  pre-flight still print — consent with eyes open beats a ceiling someone
  learns to always disable.

## When not to use it

- All-deterministic scoring (mechanical checks, no model calls) has no paid
  calls to guard; a pre-flight of $0 is fine to print but nothing here binds.
- Sub-cent single-target runs don't need the ceremony; the technique earns
  its keep where the matrix multiplies. But keep the *partial* contract even
  there — cancellation and crashes produce partial runs at any price.
