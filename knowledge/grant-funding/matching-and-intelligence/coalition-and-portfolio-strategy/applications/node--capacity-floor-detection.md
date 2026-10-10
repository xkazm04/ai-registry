---
layer: application
type: application
subject: coalition-and-portfolio-strategy
technique: capacity-floor-detection
stack: node
status: forged
verified_on: 2026-10-11
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A coalition pointer that rode on every capacity fail

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-11 at `a2ea85c5` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `849f03d` and its ledger row is `a1e95cb`,
both on the project's `main`.

## The tree had the gate and the conversion, but not the boundary

The eligibility layer already did most of what the technique asks for. Its capacity check fails
hard when the award floor exceeds annual revenue. It resolves a missing floor to zero and a
missing ceiling to unbounded. It returns *unknown, supply the figure* when revenue is unrecorded.
Its fail detail carries the forward pointer ("Reachable as a coalition with complementary
partners"). A pure, tested coalition module sits downstream. The layer reads like a finished
implementation.

The one rule it did not implement is the one this technique calls load-bearing: **propose a
coalition only when the capacity gate is the sole hard fail.** The capacity check wrote the
pointer into its own detail string, and a single check cannot see its siblings. So a grant that
also required a different legal form, had already closed, or was a national programme in another
country was still pitched to the organization as reachable by partnership. The check order made
this worse. Capacity is evaluated before the deadline, and the screen-out reason shown on the
dashboard and the draft page is the *first* failing hard gate. For a closed grant over the floor,
the headline reason was the coalition pitch rather than "the window has closed".

I chose this seam to falsify the technique. If the tree had already gated the pointer, the
boundary rule would have been moot in the one consumer that implements the conversion. It had
not.

## A and B

- **A**: the tree as read. The capacity fail always carries the pointer.
- **B**: the pointer is attached after all checks have run, and only when capacity is the sole
  failing check.
- **Instrument**: a 16-case cross-product (capacity over/under the floor x applicant type
  eligible/not x window open/closed x country gate open/foreign). Each case went through the
  project's own eligibility function and its own first-hard-fail selector, against the project's
  demo organization at a fixed clock. Positive control: every dimension produced the failure it
  was built to produce in both arms.
- **Target**: capacity-fail grants that showed the pointer beside another fail. A 7 of 8, and 3
  of those carried the pointer as the headline screen-out reason. B 0 of 8. The headline-reason
  pointer went from 4 to 1, and the remaining case is the legitimate sole-capacity one.
- **Floor**: check statuses changed on 0 of 64 checks, the first-hard-fail key on 0 of 16 cases,
  and the sole-capacity case kept its pointer (1 of 1). The project's local gate held: type check
  clean, lint clean, 376 test files and 3,581 tests green. The four new tests fail 3 of 3 on A.

## What the tree adds to the technique

The technique lists geography as a fail that does not convert. This tree deliberately does *not*
make geography a hard gate: a prose-level location miss is a "verify the solicitation" signal.
Its only geography **fail**, though, is the structural country gate, and no coalition cures that.
So B treats "fails" as the non-converting set, not "hard fails". The verdict is unchanged, and
the conversion respects the technique's list. A consumer that softens a gate for verdict purposes
still has to keep it out of the conversion if its failures are structural. The technique's
phrase "sole hard fail" is exact only where every structural fail is also hard.

## What this realization cannot do

- The pointer is copy, not a pipeline. The coalition module has no production caller, so B
  corrects what the organization is told; no coalition was being assembled from the wrong grants.
  When something does call the module, it needs the same sole-fail predicate. Today the module's
  only precondition is "the organization cannot clear the floor alone".
- Revenue is compared with the floor without the award's duration. A multi-year floor set against
  one year's revenue overstates the mismatch, and nothing in the tree carries the award period
  that would correct it.
- Revenue stays the capacity proxy for every legal form. The technique's "when not to use"
  classes (fiscally sponsored projects, pass-through budgets, first-year entities) have no
  representation in the profile, so the gate cannot route them to a human.
