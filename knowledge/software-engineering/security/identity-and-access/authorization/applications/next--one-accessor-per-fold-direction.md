---
layer: application
type: application
subject: authorization
technique: one-accessor-per-fold-direction
stack: next
verified_on: 2026-09-16
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# Two empties in a metering decision, and the test that asserted the distinction it could not see

The technique's *"two empties are two facts"* rule was written from a policy
engine that keeps them apart on purpose. This is the same rule found failing,
in a metering decision on a scanning product, at the moment the shape was being
frozen — and the seam was chosen because it could have refuted the finding.

## The seam was picked to falsify, and the first candidate did refute it

The hunt was for a verdict wider than the branch consuming it. The first
candidate was an entitlement gate that computes permission by negation:

    allowed: orgExists && charge !== "denied"

`ScanCharge` has four values, so `charge !== "denied"` is exactly the
`!allowed()` fold the technique warns about — every value that is not the one
named folds to permission, on an authority-bearing predicate where
[failure-direction](../techniques/failure-direction.md) requires the opposite.

**It is correct here, and that is a result.** The four values are
`"unlimited" | "allowance" | "credit" | "denied"`, the enum is closed, and the
three non-denied members all genuinely mean *this scan may run*. A negation
fold over a closed enum whose non-negated members are homogeneous is safe.
The technique's decision rule is about what happens when the enum grows, not
about arithmetic, and this call site refuted the stronger reading of it.

That same gate carries the scar that shows the risk is not theoretical. The
comment above it records a fix: a configured database that matched no
organization row used to report `allowed: true`, because an unknown
organization and a real free organization with monthly headroom resolved
identically. Unknown was rendered as a definite value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and
the read gate and the write gate disagreed for as long as it lasted. The
repair added a third fact to the inputs rather than adjusting the fold.

## The defect was one function further on, in the one written to be the future

The lane-aware generalization of that decision exists so the shape can be
settled before anything depends on it — its own comment says it ships as a
no-op for exactly that reason. The field it dispatches on documents three
distinct facts, `src/lib/plans.ts:180` "A lane ABSENT from the map is unmetered (the current state for all four non-scan lanes); an":
absent means this lane is not part of this plan's billing model, an explicit
`null` means the lane is metered and this plan includes it without limit, and a
number is a monthly quota.

The dispatch then collapsed the first two in a single line, in a comment that
named them as different:

    // Absent = this lane is not metered on this plan. `null` = metered but included without limit.
    if (allowance === undefined || allowance === null) return "unlimited";

Both empties answered `"unlimited"`. Both are free at the point of the call,
which is what makes the collapse invisible: no caller is billed wrongly, no
test fails, and the only thing lost is which of two reasons applied. The
consumer that needs them apart is the usage ledger the allowances field exists
to feed — a lane a plan does not price does not belong in that plan's usage
statement at all, while a lane it prices and includes does, carrying its
unlimited marker.

## The assertion that could not observe its own comment

The strongest evidence was in the test, one line above the assertion:

    // An explicit null is "included, unlimited" — different from absent, which is "not metered".
    expect(decideCharge("athena", { ...opted, laneAllowances: { athena: null } })).toBe("unlimited");

The distinction is stated in a comment and the assertion checks the value that
erases it. Absent also produces `"unlimited"`, so the test passes whether or
not the two are distinguished, and it would have kept passing through any
future collapse. This is the shape
[vacuous-by-evaluation](../../../../engineering-process/standards-and-gates/quality-gates/techniques/vacuous-by-evaluation.md)
names, arrived at from the other direction: not a rule satisfied by its
evaluator, but a claim parked in a comment because the predicate available
could not carry it.

## The arms

One variable: whether the two empties resolve to one value or two.

- **Arm A** — the tree at `84226a65`. The new predicate asserts
  `decideCharge` answers differently for `laneAllowances: {}` and
  `laneAllowances: { athena: null }`. It fails:
  `AssertionError: expected 'unlimited' not to be 'unlimited'`. 54 of 55 pass.
- **Arm B** — `21b2bebe`. A `LaneCharge` union adds one outcome the scan lane
  cannot produce, and the branch splits:
  `src/lib/plans.ts:441` "if (allowance === undefined) return" and
  `src/lib/plans.ts:442` "if (allowance === null) return".
  55 of 55 pass.

**Target**: outcomes distinguishable for the two empty inputs — 1 in A, 2 in B.
**Floor**: no billing path changes and the scan lane stays byte-identical. Held
— `src/lib/plans.ts:431` "return decideScanCharge(opts);"
is untouched and the standing table-wide equality test covers it; the full
suite is 12,597 passed / 2 skipped / 0 failed, and `tsc --noEmit` is clean after
the return type widened.

The plan-level exemption is deliberately *not* folded with the lane-level one
and now has its own assertion: an unlimited plan answers `"unlimited"` for
every lane, because a plan that includes a lane is not a plan that does not
price it.

## What this cost, and why now was the cheapest moment

The change is not free: one test's expected value moved from `"unlimited"` to
`"unmetered"` for non-scan lanes on metered tiers, and that test now asserts
free-ness and the reason separately rather than asserting they are the same
word. That is a behaviour change in a function with no production consumers —
which is the entire argument for doing it here. The union widened and the
typecheck stayed clean precisely because nothing outside the tests reads the
result yet. Once one caller has been written against the collapsed answer, the
distinction is no longer recoverable by adding a value; it is recoverable only
by auditing callers, and the comment that documents the distinction will by
then have been true and unenforced for a year.

## What the realization cannot do

Nothing prevents a later `if (charge !== "denied")` over `LaneCharge` from
folding `"unmetered"` into permission the way the entitlement gate folds the
scan charges — and there the members are no longer homogeneous, because
`"unmetered"` is a statement about the plan's model rather than about this
call's cost. The type makes the distinction available; it does not make the
fold explicit at the call site, which in a language without the two-accessor
idiom would need a discriminated union and a total `switch`. That is the
residual, and it is named here rather than solved.
