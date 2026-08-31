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
shipped: ba7f613e
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

**63 of 71 — 89% — of the suppressions are not suppressing anything.** The eight that remain are
load-bearing: those items really are unused, and the assertion form keeps them suppressed exactly
as the permit form did.

### Two causes, and the second one is not what the technique predicted

The first reading of this result was that the 63 were correct when written and went stale later.
That is true of only some of them, and the shipped slice below is what forced the correction.

This crate is a **library**, and the unused-item lint does not fire on a reachable `pub` item in a
library, because the public surface *is* a use. **42 of the 71 sites sit on `pub` items**, where
the lint was never going to fire at all — those suppressions were inert from the moment they were
typed. The remaining 29 are private, and the ones among them that came back unfulfilled are the
historical case: genuinely dead once, referenced now.

Both repair to the same edit — delete the attribute — but they are different defects, and only the
second is the "correct when written, stale since" story. Recording the split matters because the
first is *preventable at review* and the second is not: nobody can be asked to notice that a
suppression aged out, but "this lint cannot fire here" is a fact available when the line is
written.

**This makes the case for the assertion form stronger rather than weaker.** The permit form
produces one observable — silence — across three genuinely different states: suppressing a real
finding, suppressing a finding that has gone away, and suppressing a finding that was never
possible. The assertion form separates all three in a single compile, with no census, no
reasoning about crate structure, and no knowledge of which lint fires where.

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

## The shipped slice — one file, seven sites, two insertions and seven deletions

The full migration is 71 sites across 32 files in this crate and 835 across the workspace, which
is past what a reviewer reads in one diff. One file was shipped instead, chosen because its
suppressions are the *most defensible* ones in the tree rather than the worst: all seven carry
written reasons, and the reasons are true.

The file exposes two `pub` entry points for lenient parsing, each annotated *"planned API — no
Tauri command wires into lenient parsing yet"*, above a chain of five private helpers each
annotated *"used by [the entry points] (not yet wired to a command)"*. Every statement there is
accurate about the product. All seven are wrong about the lint: the entry points are `pub` in a
library, so they are reachable by definition, and their reachability makes the whole private chain
below them reachable too. **A carefully documented suppression chain, none of which could ever
have fired.**

The repair was verified by removal rather than by argument — the same discipline the technique
asks of any suppression audit:

| arm | state | result |
|---|---|---|
| A | all seven attributes present | 0 warnings |
| B | all seven removed | 0 warnings, across lib **and all test targets** |

Arm B checked a strictly broader target set than arm A, which only strengthens the negative: the
suppressions were inert under more compilation than ever originally covered them. The product-state
note was kept as a plain comment on the two entry points, where it still says something true, and
dropped on the five helpers, where it only explained the attribute.

## What this realization cannot do

It measures one lint in one language. The self-retiring form exists here as a first-class language
feature; where an instrument offers no assertion-style directive the amendment's rule has nothing
to select and falls back to the reaper clause. Nothing here tests the reaper-form ranking (dates
versus version thresholds) — that half of the amendment is unexercised by this tree, which uses
neither.

The census counts suppression *sites*, not the defects behind them, and a stale suppression is not
by itself a defect: it is a lost signal. What the 63 cost is not established here, and would need
the follow-up nobody has run — how many of those items would have been deleted had the checker
named them when they went live.

The shipped slice is also the easy third of the problem. Deleting an inert suppression is safe by
construction; converting a *load-bearing* one to the assertion form is the change that alters what
the build reports, and none of the eight was touched.

**Return condition:** continue crate by crate, assertion-form first in new code, and re-run the
paired check after each. The number that matters on the second pass is whether the count of
load-bearing suppressions stays near eight — a rising floor means the form is being used to
silence rather than to assert. The cheap pre-check before each slice is the `pub`-in-a-library
question, which predicts inertness for free and accounted for 42 of the 71 sites here.
