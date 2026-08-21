---
layer: application
type: application
subject: game-economy-tuning
technique: faucet-sink-balance-band
stack: process
status: forged
verified_on: 2026-08-20
---

# Specifying faucets, sinks and the band in the PoF pipeline

PoF is a catalog-driven aRPG content pipeline. Its economy is specified in three places
that are deliberately connected: a prose law in the canon seed, a typed flow table, and
a linter that reads the law's number out of the prose. This is the technique's
specification half realized as a methodology rather than as runtime code.

## The law, in prose, once

`src/lib/catalog/canon/canon-seed.ts:22` holds the whole economy law as one rule body:

> Every currency must define at least one sink; caps prevent runaway inflation; the
> per-hour faucet and sink should stay balanced within ±15%. Premium and soft
> currencies never inter-convert freely.

Four separate requirements in one sentence, and all four are structural rather than
numeric — the ±15% is the only tunable in it. `docs/catalog/ARPG-LAWS.md` §10(d)
restates the same law in long form and adds the reason: the genre's economy is
*currency-as-crafting*, so "the currency sink **is** the crafting system" (§10(a)). That
is the doctrine behind the technique's rule that the best drain is a system players
want to use — every orb in the §10(c) list (transmute, alteration, regal, alchemy,
chaos, exalt, divine) is simultaneously a crafting operation and a sink.

The declaration rule reaches the authoring shape, which is the point. §10(b) types a
currency as `{ id, name, kind, effect, cap?, sinks: string[], faucetPerHour?,
sinkPerHour? }` — the sink list and both throughput estimates are fields of the
currency itself, so a currency authored without a sink is visibly incomplete at
authoring time rather than at balance time.

## The flow table

`src/lib/economy/definitions.ts:41` declares six faucets and `:112` declares nine sinks.
Every entry carries exactly the four fields the technique asks for:

- `baseAmount` — the magnitude of one occurrence;
- `levelScaling` — the per-level growth term;
- `frequencyPerHour` — the throughput estimate, which is what turns a magnitude into a
  rate;
- `minLevel` / `maxLevel` — the applicability window (`maxLevel: 0` meaning open-ended).

The faucets are enemy kills (5 base, 2.5/level, 60/hr), elite kills (25, 8, 8/hr), boss
kills (150, 30, 1.5/hr), quest rewards (50, 15, 2/hr), vendor loot sales (8, 3, 25/hr)
and chest gold (20, 6, 4/hr). The nine sinks run from health potions (10, 3, 8/hr) down
to a stash upgrade at 0.05/hr and a death penalty. Two things are worth transplanting
from this table verbatim. First, **vendor loot sales are classified as a faucet** — gold
paid by a vendor is created, not moved, and mis-filing it as a wash is the single most
common enumeration error. Second, **every entry has a frequency**; there are no holes,
which is why the balance verdict here is a real number rather than an unspecified one.

## The check reads the law

`src/lib/balance/canon-conformance.ts:53` parses `±\s*(\d+(?:\.\d+)?)\s*%` out of the
`proj-economy` rule body and divides by 100. Nothing hardcodes 0.15, and a canon edit
that breaks the parse throws rather than falling back — `canon-conformance.test.ts`
asserts the parse still resolves. `checkFaucetSinkBalance` (`:105`) then computes
`|inflow − outflow| / max(inflow, outflow, 1)` at the last metrics sample, which is the
symmetric denominator the technique specifies, and escalates to `critical` at twice the
tolerance.

The mechanism by which prose becomes an enforced threshold is the neighbouring subject
on executable design canon; what matters here is that the band the economy is judged
against and the band the design document states are literally the same characters.

## The deviation the project documents against itself

The module header at `src/lib/balance/canon-conformance.ts:1-19` states it plainly: "the
shipped `loot-driven` economy default runs the faucet hot and the sink cold, which
breaks the ±15% balance law". `DEFAULT_CONFIG` (`definitions.ts:250`) ships
`philosophy: 'loot-driven'`, and `simulation-engine.ts:25` gives that stance
`faucetMul: 1.2, sinkMul: 0.8` — a 50% structural mismatch before a single flow is
tuned. The check fires on the product's own defaults, by construction, on every run.

This is the technique's "point the check at the shipped configuration" rule, and the
right reading of it is that the project got this *right*: the violation is stated in the
header of the file that detects it, rather than being suppressed, tolerance-widened, or
excluded from the default run. The standard does not move. What moves is that the
finding is visible to everyone who opens the linter.

## Facet absence — the one place to hold a higher line

`CanonLintInput` (`:85`) is facet-shaped: each law's data is optional and "a check runs
only when its data is present". Structurally correct — but `checkFaucetSinkBalance`
returns `[]` when handed zero metrics, and an empty violation list is indistinguishable
from a clean pass to every consumer above it. The technique's standard is that an absent
facet renders as *unmeasured*, carried through to the report as a distinct state. Adopt
the facet design; do not adopt the empty return.
