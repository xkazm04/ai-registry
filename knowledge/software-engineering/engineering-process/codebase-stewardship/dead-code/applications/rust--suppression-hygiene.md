---
layer: application
type: application
subject: dead-code
technique: suppression-hygiene
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# The self-retiring form, measured: 0 reported becomes 63 reported, on the same tree

The technique's amendment claims that where an instrument offers two suppression forms — one
asserting the finding is *expected*, one *permitting* it — the first is mandatory, because it
fails when the underlying condition lapses and the second succeeds forever. This tree offered a
clean way to test that, because the language's unused-item lint has exactly those two forms and
the codebase uses only the permanent one.

## The surface

Counted across the workspace, excluding vendored trees and generated output:

| Form | Behaviour when the cause lapses | Count |
|---|---|---|
| assertion-style (self-retiring) | reported as unfulfilled | **6** |
| permit-style, unused-item | silent forever | 644 (357 of them unused-item specifically) |
| permit-style, lint directives | silent forever | 182 |
| permit-style, type-checker | silent forever | 3 |

Roughly **0.7%** of the suppression surface is in the form that can retire itself. That ratio is
the finding's premise, not the finding.

## The paired comparison

Scoped to one crate with no foreign uncommitted work in it — 32 files, **71** unused-item
suppression sites. Both arms are the same checker over the same sources, one minute apart, with
only the suppression *form* changed:

- **Arm A** — the tree as it stands, permit-style: **0 warnings.** The checker reports the crate
  clean. Every one of the 71 suppressions is indistinguishable from a suppression doing its job.
- **Arm B** — the same 71 sites rewritten to the assertion-style form, nothing else touched:
  **63 warnings, all "this lint expectation is unfulfilled", across 24 of the 32 files.**

**63 of 71 — 89% — of the suppressions guarded code that is no longer unused.** They were correct
when written and stopped being correct at some unrecorded later point, and the tree carried them
green the entire time. The eight that remain are load-bearing: those items really are unused, and
the assertion form keeps them suppressed exactly as the permit form did.

The concentration is worth reporting because it is not uniform: 9 sites in one provider module, 7
each in two others, 6 in a queue implementation. A cluster like that is the signature of a
suppression added once during a refactor and copied along a file as it grew.

Arms were run against a warm build cache; arm A took 1m19s, arm B 5m33s (the second arm
re-checked the crate after every file changed). The experiment was reverted in full and the
working tree verified byte-identical to its prior state.

## What the tree shows that the technique did not claim

A cheap approximation was run first, before the compiler: extract the item name each suppression
guards and count references elsewhere in the tree. It estimated 123 of 156 stale — **79%** —
against the compiler's 89% on the crate it could be checked on. The approximation is honest but
conservative, because a name referenced only through a trait implementation reads as unreferenced.

That matters for adoption rather than for the claim: **the grep-shaped estimate is available in
seconds and lands within ten points of the authoritative answer.** A team deciding whether the
migration is worth doing does not need to run the paired build first, which removes the usual
reason this kind of cleanup never starts.

## The structural fact

Nobody chose the ratio. The two forms are adjacent in the language's documentation, the permanent
one is older and shorter to type, and every individual author reached for it correctly — a
suppression that permits is precisely what each of them wanted *at the moment they wrote it*. The
decision that produced 829 permanent suppressions and 6 self-retiring ones was never made; it is
the sum of 835 local decisions none of which was about retirement.

That is the argument for treating the form as a standard rather than a preference. The permanent
form's cost is not visible at the site, is not visible to review, and is not visible to the
instrument — it is only visible in aggregate, years later, as a number nobody can produce without
doing the experiment above.

## What this realization cannot do

It measures one lint in one language. The self-retiring form exists here as a first-class
language feature; where an instrument offers no assertion-style directive the amendment's rule
has nothing to select and falls back to the reaper clause. Nothing here tests the reaper-form
ranking (dates versus version thresholds) — that half of the amendment is unexercised by this
tree, which uses neither.

The census counts suppression *sites*, not the defects behind them, and a stale suppression is
not by itself a defect: it is a lost signal. What the 63 cost is not established here, and
would need the follow-up nobody has run — how many of those items would have been deleted had
the checker named them when they went live.

## Not shipped

The repair is a mechanical rewrite of 71 sites across 32 files in one crate, and 835 across the
workspace. That is past what a reviewer reads in one diff, and this run held no confirmation to
change a project tree. The diff was produced, measured, and reverted.

**Return condition:** ship it crate by crate, assertion-form first in new code, and re-run the
paired check after each — the number that matters on the second pass is whether the count of
load-bearing suppressions stays near eight, because a rising floor means the form is being used
to silence rather than to assert.
