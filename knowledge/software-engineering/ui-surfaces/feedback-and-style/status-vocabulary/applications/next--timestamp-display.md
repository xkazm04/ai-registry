---
layer: application
type: application
subject: status-vocabulary
technique: timestamp-display
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Next.js application — the present across a delivery seam

Measured in the `ascent` tree at HEAD `62c252dd` (Next 16.3.3, Node 24 per
`.nvmrc`). This tree is a single-locale product, so the technique's
locale-binding measurement does not bite here — which makes it the clean
specimen for the other ambient input. Surfaces are rendered on the server
and hydrated in the browser, and *both* passes were reading the clock.

## The clock read twice, and what it printed

`src/lib/ui.ts:206` is the shared past-moment helper, `timeAgo`, at day
granularity; `:228` is `freshness`, the sub-day ladder that resolves
seconds → minutes → hours and falls through to `timeAgo` for older
moments. Together they are called from 47 sites outside their own module
(count taken 2026-09-20), and there is no relative-time component: the
helpers return strings that call sites interpolate.

Commit `bf53f1d1` (2026-09-20, *"fix(Live War Room): the outcome sheet's
column ages survive hydration"*) is the measurement. Its body: a run
started eighteen and a half days earlier *"printed '19d ago' server-side
and '18d ago' after hydration, so React threw a hydration mismatch naming
OutcomeSheetHeader on every cockpit render — the kind of console error
that trains a reader to ignore the console."* The fix threads the instant:
the tab that owns the pass takes its own render time and passes it down
through the section, the sheet and the header. The in-source note that
landed with it (`src/lib/ui.ts:210-213`) states the rule for the next
author — *"both passes must measure from the SAME instant … Omit it only
where the caller renders in one place"* — and dates the measurement.

The parameter is **optional** (`nowMs?: number`, defaulting to the wall
clock), which is the shape this technique now warns about, and the tree
supplies its own counter-argument. `src/features/admin/members/memberTime.ts:28-32`
cites this registry subject and technique by name and disputes the
transfer: *"the registry's warning about a defaulted parameter is about
locale arguments, whose default is the bug. A defaulted clock is the
primitive owning 'now'"* — adding that the render model forbids reading
the clock in a component body, so the read has to live inside the
renderer. That objection is what narrowed the rule upstairs: the default
is correct on a single-pass surface and is the forgettable argument on a
two-pass one, and nothing at the call site says which it is looking at.
`freshness` takes no instant at all, so it is single-pass by construction
and has no way to say so.

## The same seam, one input over: the locale

`src/components/ui/format.ts:57-68` is the tree's own statement of the
generalisation, arrived at independently and for the locale rather than
the clock. Its short-date helper is pinned to a fixed locale on purpose,
because *"the call sites are 'use client' components that Next.js still
prerenders on the SERVER, where `undefined` resolves to the server's ICU
locale — a viewer with a different browser locale then hydrates 'Jun 9'
into '9 juin' (hydration mismatch + a date that flickers between
formats)."* This is the fixed-locale override used deliberately, with the
reason beside the pin — which is the only thing that keeps it from
reading as the ambient-default defect it superficially resembles.

The unpinned form survives two directories away:
`src/features/admin/members/memberTime.ts:18` renders the hover title
with a bare host-locale call, in the same module whose header cites this
technique for the label beside it. Label and tooltip taking different
locale policies is the split the technique warns about, in its cheapest
possible form.

## Relative by default, absolute one hover away — where it landed

The house policy is implemented once and named: `MembersTable.tsx:96-100`
renders `timeAgo` in the cell with the absolute moment in the `title`, and
the comment above it says why — *"A bare toLocaleDateString() took its
format from whatever machine rendered it."* `InviteList.tsx:95` is the
future-moment mirror. `memberTime.ts` exists because the past half had a
house primitive and the future half had none, and its header records the
import boundary that stopped it from living beside `timeAgo` — the
canonical future-days helper sits in a module that constructs mail
clients, so a client component importing it would drag two SDKs into the
bundle. The boundary, not the author, produced the second copy; the
comment is the link between them.

## The clamp, unbounded

`freshness` clamps with `Math.max(0, …)` (`:232`) and the first rung is
`secs < 45` → `"just now"`. The clamp is total and it has no tolerance:
an instant a minute in the future and an instant a year in the future
both render as *just now*. That is the technique's named worse case — the
impossible value rendered as the calmest one, masking a wrong-instant bug
from users and developers alike — reached here by a guard that reads like
care. There is no skew tolerance, no fall-back to an absolute render, and
no telemetry breadcrumb; and because this is the one layer that ever sees
a future timestamp, nothing else in the system will report it either.

`src/components/org/shared/AlertsMovement.tsx:46-53` reaches the same
place without the clamp: its first rung is `ms < 60_000`, which any
negative difference satisfies, so a future moment is *just now* there too.

## No shared ticker, and the ladders that follow from that

`src/components/report/FreshnessControl.tsx:29-33` owns its own 30-second
interval and a throwaway tick counter to re-render one label. It is the
only live elapsed label in the tree, so the multiplication the technique
describes has not happened yet — but the shape that multiplies is the one
that shipped, and there is no shared, self-scaling ticker to point the
next one at. The second interval in the same area is a different job:
`ReportClientStatus.tsx:100-110` drives a 250 ms stopwatch for an
in-flight scan.

The elapsed vocabulary is hand-authored everywhere.
`Intl.RelativeTimeFormat` appears **zero** times in the tree (checked
2026-09-20); `timeAgo` and `freshness` author their own rungs, and at
least three further ladders author theirs again —
`AlertsMovement.tsx:46-53`, `src/features/shared/knowledge/knowledgeModel.ts:122`
(*"under an hour ago"* / hours / one-decimal days) and
`src/features/shared/skills/skillLifecycleViz.ts:60`. For a single-locale
product the cost of this is not translation but disagreement: the
sub-minute rung is *"just now"* below 45 seconds in one ladder and below
60 in another, and each new surface picks a third.
