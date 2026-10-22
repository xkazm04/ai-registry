---
layer: application
type: application
subject: zero-budget-channel-planning
technique: free-channels-lead-onboarding
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Free channels lead onboarding - a tree that already took the rule, and what pins it

The Czech-first adtech workspace (`systedo-case`, a Next.js application on node@24,
the version its `.nvmrc` and CI matrix witness) is the tree this technique was
written from, so the seam is not a gap to fix. The decision is already made at one
place, and the open question is whether anything would notice it being unmade.

## The structural fact: the rule is two adjacent tables and one resolver

The order lives in `BY_TYPE` (`src/lib/onboarding/steps.ts:117` "const BY_TYPE"), the per-type requirement in
`REQUIRED_BY_TYPE` (`src/lib/onboarding/steps.ts:137` "const REQUIRED_BY_TYPE"), and the resolver `stepsForType` merges them. Both tables are
typed `Record` over the project type, not `Partial`, so the technique's
exhaustiveness rule is enforced by the compiler: a sixth project type does not
compile until someone decides. The tree's own comment states the same split the
technique does - required for app, content and leadgen, optional for eshop and
local - and for the same reason: the first three have no catalog step.

The label half is also in the tree. The step that connects nothing carries
`selfServe` (`src/lib/onboarding/steps.ts:102` "selfServe: true"), and the row's call to action branches on it
(`src/components/app/onboarding/OnboardingChecklist.tsx:104` "s.selfServe"), so the first row reads "Open", not "Connect".

The second discoverability half, which the technique names as out of scope for the
checklist, also exists as a separate surface: a public feature page for the free
channels (`src/app/kanaly-zdarma/page.tsx`), prerendered from static facts. The
tree therefore answers both halves; it does not show whether the pricing narrative
does.

## The A/B: revert the decision, count what notices

Seam chosen to falsify the technique's fourth decision rule - assert *position*, not
membership - not its first. A caught outcome would have taught that a test could be
passing on a reverted default, which would make the "reversible default" claim
unbacked.

- **Arm A**, the tree as it is: the unit file for the checklist, 12 of 12 pass.
- **Arm B**, the pre-change decision restored by mutation (channels moved last in
  `eshop`, `app` and `leadgen`; every requirement list emptied): 5 fail, 7 pass.
  The five that fail are the position, ordering-before-ads, optionality and
  required-count assertions. The seven that still pass are membership, scan, and
  completion-arithmetic checks, which is the technique's own argument made concrete:
  a membership-only suite would have been green on both arms.

So the rule held, and the pinned part of it is the part that matters. The file
was restored to its committed state afterwards and no project change was made.

## What it cannot say

- Whether the reordering changed behaviour. Neither arm touches a tenant; the
  technique itself records that the product has no tenant telemetry, and this
  experiment inherits the same blind spot. Target (a type's required step gets
  done) and floor (activation still counts every step) were both declared; the
  floor is pinned by a test, the target is not observable here.
- Whether `local` belongs in the optional set. That depends on whether local
  tenants have an ad account by default, which no file in the tree states.

## Return condition

`unmeasurable` until the product records per-step completion by project type. With
that, the technique's first trigger (a required step routed around) becomes a query
instead of a hunch. A tree with a second `selfServe` step revisits the third
trigger: the tree currently has exactly one, and a test pins it.
