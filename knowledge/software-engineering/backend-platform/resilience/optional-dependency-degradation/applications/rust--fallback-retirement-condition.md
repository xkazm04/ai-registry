---
layer: application
type: application
subject: optional-dependency-degradation
technique: fallback-retirement-condition
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.97
applied: simulation
ab_verdict: better
proof: structural-only
---

# A floor ledger that records every fix and no removal condition

A connected desktop application wraps a third-party command-line binary as
its model provider. The wrapper is a thin contract — flags, injected and
stripped environment variables, a streamed line format the parser consumes —
and the binary ships several releases a week, so the wrapper carries a
**minimum-version floor** and a handful of version-keyed workarounds around
it: a pinned default reasoning effort minted against a silent upstream
default change, an environment flag that disables a startup scan, a timeout
buffer sized to let the binary's own stall error arrive first.

## The structural fact

The floor is documented as a per-range ledger in the source, and the ledger
already separates three of the shapes the technique's pinned-dependency
section asks for, reached independently: the *decisive* fixes that moved the
floor, fixes marked **not reachable** from the wrapper's spawn surface, and
knobs marked **not adopted** with the reason. Nobody designed that against a
standard; it fell out of a research loop that reads each release's changelog
and records what it means for one call site.

What the ledger does not carry is the other half. **No row has a removal
condition**, including the three workarounds above. **Every row's evidence
tier is the changelog** — source-inspected, never labelled as such — and the
ledger's own prose records the consequence twice: a floor advanced from a
changelog "sat INSIDE" a broken window that a release two versions earlier
had opened, and a later floor "sat ON TOP of" a regression the release it
adopted had introduced. Both are the section's claim that the accepted
version can itself regress, observed in a tree before the section existed.

## The paired comparison

Arm A is the technique as it stood: a workaround either tests its premise at
run time or carries a dated stamp and is re-tested on the next substrate
version. Arm B adds the pinned-dependency lane: a published artifact is the
reaper, every row re-runs on a pin move with its evidence tier labelled, and
rows are marked policy or workaround. Three cases from the tree, walked under
both.

1. **The pinned default effort.** Minted because one release silently changed
   the implicit default on several account tiers; the docstring says the pin
   keeps behaviour deterministic across tiers. Under A the stamp says re-test
   on the next version and retire when the default reverts, which would remove
   the determinism the pin actually buys. Under B the row is labelled
   *policy*, never reaped. B is better. Falsifier: if the pin's only purpose is
   the one release's change, A's audit is the right instrument.
2. **The floor advanced into a broken window.** Under A nothing re-tests a
   closed row when the pin moves. Under B every row re-runs at the new floor
   and the evidence label would have read *source-inspected* for a decision
   made from a changelog. Prediction: B catches the regression only if the
   rerun set includes a **timed** spawn, because the regression was a per-spawn
   stall, not a failure. Falsifier: the minted cases are untimed, in which
   case both arms miss it.
3. **The scan-disabling flag.** Adopted in the same research run that
   recorded a release fixing the scan's slowness — a workaround minted on the
   day its reason weakened, with no removal condition. Under A a dated stamp
   re-tests it; under B the condition is written down: a released binary whose
   spawn without the flag matches the flagged spawn, measured. Both arms reach
   the same reaper; B adds the number.

Verdict `better`, on two of three cases. The proof is structural: the tree
was not changed, and the arms are read from what the ledger already says
about itself.

## What this realization cannot do

The floor is advisory — it prompts the operator to upgrade rather than
refusing to run — so retirement cannot be observed as the share of traffic
still taking a workaround, which is the instrument the technique's own
"measure the path" section asks for. Until the wrapper emits which
version-keyed path a spawn took, every row here closes on a rerun, never on a
number.
