---
layer: application
type: application
subject: analytics-time-windows
technique: range-precedence-resolution
stack: node
verified_on: 2026-08-20
---

# The shared window module behind an org dashboard

A single isomorphic module, `src/lib/window.ts`, is the only place in the
codebase that turns a request into a period. Its header states the whole
vocabulary before any code appears (`src/lib/window.ts:1-16`): a window does
double duty as the period bound *and* the baseline date; every boundary is
computed in the canonical org zone rather than the server's local zone;
day arithmetic is calendar arithmetic; and `[start, endExclusive)` is the
interval convention. That header is the artifact the technique argues for —
the vocabulary written once where the constructors live.

## Confirmed: the precedence chain, and its one door

`resolveOrgWindow` (`src/lib/org/period.ts:19-24`) implements exactly the
default order the technique recommends, documented in the docstring above it:

1. an explicit `?range=` in the URL, so shared links stay authoritative;
2. the remembered period cookie (`PERIOD_COOKIE`, `src/lib/window.ts:42`),
   written by the selector;
3. `DEFAULT_RANGE` (`src/lib/window.ts:38`, `"90d"`, with the reasoning for
   the choice in the comment above it).

The cookie is consulted *only* when no explicit range is present
(`sp.range ? null : parsePeriodCookie(...)`) — explicit-wins expressed as a
single conditional rather than as a merge whose outcome depends on key order.

The incident that produced this file is in its header
(`src/lib/org/period.ts:3-7`): the Overview tab read the cookie fallback while
the Security and Executive tabs called `resolveWindow(sp)` directly, so a range
chosen on Overview was lost on every navigation. That is the technique's
"every surface resolves through the same function" rule, learned the expensive
way — the chain was correct and non-universal, which is the same as absent.

## Confirmed: a window value, not a day count

`ResolvedWindow` (`src/lib/window.ts:57-80`) carries `start`, `end`,
`endExclusive`, a human `title`, a `comparisonLabel`, a `reviewTitle`, and the
echoed `from`/`to` inputs. Nothing downstream receives a `days: number` to
re-derive from. `start` is documented in the type itself as doubling as the
baseline date, and `null` start is the explicit "all time — no baseline, no
deltas" case (`src/lib/window.ts:131`), which is the suppression rule rather
than a substituted earliest observation.

`weekRangeParams` (`src/lib/window.ts:97-99`) is the same discipline applied to
an outbound link: a "this week" push in a digest emits `?range=custom&from=&to=`
snapped to canonical-zone calendar days, so the notification and the page it
links to resolve identical boundaries instead of a raw rolling 168-hour offset.

## Confirmed: reversed ranges swap, and the title echoes what resolved

`resolveWindow`'s custom branch (`src/lib/window.ts:132-165`) contains both
upward lessons the technique now states as decision rules:

- **The swap** (`:137-144`): when both custom bounds parse and `from > to`, the
  bounds are swapped rather than passed through. The comment names the exact
  incoherence avoided — `start > end` matches no rows downstream (blank trend
  and forecast) while the baseline query, predicated `lt: start`, still returns
  an end-bounded "current" snapshot that predates `start`.
- **The echoed title** (`:151-154`): custom is the one period whose parameters
  are not implied by its name, so the title is built from the post-swap
  `from`/`to` rather than reading a generic "Custom range" above numbers whose
  period the reader cannot see.

The half-open upper bound for a custom `to` is `addDaysInZone(toDay, 1)`
(`src/lib/window.ts:147`) — the start of the next day in the canonical zone,
calendar-stepped so a clock-shift day is still one whole day.

## Deviation: the inclusive `end` alias travels inside the window value

The technique holds that inclusive bounds are converted in one adapter at the
system edge. Here, `end` — `endExclusive − 1ms` — is a field on
`ResolvedWindow` itself (`src/lib/window.ts:62-66`), kept for call sites whose
query builder still says `lte`. The consuming type is explicit that
`endExclusive` wins when both are present, and states why the two are not
equivalent under the store's microsecond timestamps
(`src/lib/db/org-rollup.ts:221-224`). This is a disclosed migration state, not
a second convention — but the standard does not move: the millisecond
subtraction is a precision-fragile adapter, and it belongs at one boundary
rather than in the value every consumer holds.
