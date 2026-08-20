---
layer: application
type: application
subject: plan-entitlements
technique: deployment-mode-short-circuit
stack: node
verified_on: 2026-08-20
---

# "The cloud sells operation, not features" as executable doctrine

Ascent ships as AGPL software with a hosted offering, which forces the
deployment-mode question, and the answer is written where the gates are.

## The declaration

`src/lib/plans.ts:14-19` states the doctrine at the top of the file every gate
lives in:

> SELF-HOSTED DEPLOYMENTS. Ascent is AGPL software whose cloud sells
> OPERATION, not features. Every `planAllows*` gate below therefore
> short-circuits to "allowed" when `selfHosted()` is true, scans are
> unmetered, and retention is unbounded … Keep this discipline when adding a
> gate: a new `planAllows*` that forgets the short-circuit silently makes the
> open-source build worse than the cloud one.

Three things this gets right. The mode is one predicate, `selfHosted()`, with
one detection site (`src/lib/env.ts`) — a single authority, not an environment
variable re-read per call site. The doctrine names its own failure as a **bug
class** ("silently makes the open-source build worse than the cloud one")
rather than as a preference, which is what makes it reviewable. And it records
that the tier model still *exists* on a self-hosted box — it is the same code
— it is simply not enforced, which is the correct separation of the model from
the gate.

## The root short-circuit

`src/lib/entitlement.ts:16-25` places the short-circuit where the technique
argues it belongs, and explains why in the code:

> Short-circuiting HERE (rather than only in `checkScanEntitlement`) turns the
> whole billing path off at its root — no allowance count, no credit debit, no
> 402 — instead of relying on every downstream gate to independently notice.
> `isUnlimitedPlan`/`scanAllowance` also self-host short-circuit, so the two
> agree either way.

`isMeteredScan` returns `false` before any of the metering machinery is
consulted. The redundancy in the derived helpers — `isUnlimitedPlan`
(`plans.ts:187-189`) and `scanAllowance` (`:193-197`) each check the mode — is
deliberate and is not a second authority, because all three read the same
`selfHosted()` declaration.

## Cost-of-goods floors short-circuit too

`retentionCutoff` (`plans.ts:297-303`) is the class that is easy to miss: a
tier's history window is a hosted-cost control, so it short-circuits as well,
with the reasoning spelled out — "it is the operator's own disk and their own
retention policy … applying it to someone else's Postgres would hide their
data from them for no reason". The same function is also a clean example of
the read-floor discipline: it returns a **cutoff date that callers clamp read
queries to**, described in its own comment as "a NON-DESTRUCTIVE read floor …
without ever deleting data", with `nowMs` injected so the function stays pure
and testable. Nothing is reaped when a tenant downgrades; the window simply
narrows, and widens again on upgrade.

## Where the repo leaves the standard unmet

The short-circuit is repeated verbatim in every gate — `if (selfHosted())
return true;` at `plans.ts:238`, `:246`, `:255`, `:274`, `:285` — rather than
being structurally unavoidable via a shared entry point. That is exactly the
"enforced by remembering" arrangement the technique warns about, and the file
header effectively concedes it by having to instruct future authors to
remember. The doctrine is strong and the discipline has held so far; the
standard remains that a gate helper taking the capability as an argument, and
short-circuiting once inside it, would make a forgotten gate impossible rather
than merely discouraged.

The mode also does not visibly gate the pricing surfaces. `PLAN_FEATURES` and
`planPriceLabel` (`:150-157`) are mode-independent, so a self-hosted build has
no structural guarantee that it stops advertising upgrades for capabilities it
already grants.
