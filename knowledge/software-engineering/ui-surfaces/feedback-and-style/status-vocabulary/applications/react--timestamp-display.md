---
layer: application
type: application
subject: status-vocabulary
technique: timestamp-display
stack: react
verified_on: 2026-08-18
---

# React application — timestamp display

This repo built both pieces of infrastructure the technique mandates —
the display primitives and the shared self-scaling ticker — and neither
sibling repo has either (`personas-web` runs three independent timers;
`brainiac/console` has none, so its relative labels go permanently
stale). It is also the cleanest specimen of the technique's sharpest
finding: the primitives are ahead *and locale-blind*, and the blindness
is a **missing argument, not a forgotten one**. Deep audit:
`docs/concepts/golden-paths/timestamp-display.md` (2026-08-14, recurrence
141, against `58d82e608`).

Re-checked 2026-10-31 at personas@22260d77, and **the locale verdict is
reversed**: both primitives now bind to the active UI language and the
shared ladder is `Intl.RelativeTimeFormat`. The sections below are kept as
the 2026-08 record; the dated notes in them say what changed.

## The primitives and the ticker

- `src/features/shared/components/display/RelativeTime.tsx` — 100 tags /
  86 files. Normalizes the backend's zone-less string at the boundary
  (`:49`, the only display primitive that does), subscribes to the shared
  ticker (`:53`), memoized, absolute value in the tooltip.
- `display/AbsoluteTime.tsx` — 37 tags / 31 files, four named variants in
  its `FORMATS` map (`:13-19`) so dense tables and drawers agree.
- `src/hooks/utility/timing/relativeTimeTicker.ts` — one timer for the
  whole app: `cadenceForAge` scales 1s → 30s → 5m as labels age
  (`:33-38`), restarts only when the target cadence changes, stops at
  zero subscribers (`cadenceForAge` is now at `:64-69`). Consumers:
  **2 files** (3 at the 2026-10-31 re-check: `AbsoluteTime.tsx` and
  `LiveRoadmapStatusPill.tsx` joined `RelativeTime.tsx`) — while 13 sites hand-roll a
  ≤1s interval and `plugins/fleet/relativeAgo.ts:10-31` is a *second*
  shared ticker whose comment restates the first one's rationale.

## Four locale policies in three modules

Measured (§7.0 of the audit): `RelativeTime`'s label is hardcoded English
(`formatRelativeTime`'s ladder), its own tooltip is host-OS
(`:38` `toLocaleString()`); `AbsoluteTime`'s label is host-OS
(`new Intl.DateTimeFormat(undefined, …)`, `:51`, unmemoized per render),
its tooltip is English. One row — "created 2h ago · 24.05.26" — is
simultaneously English and host-German, each half internally consistent,
so no gate keyed on either can see it. Of **221** moment renders
app-wide, **one** receives the app's language
(`LiveRoadmapStatusPill.tsx:38`). Neither primitive *can* be corrected at
the call site: no locale prop exists — the missing-argument case, fix at
the primitive (export `activeLanguage()` from `formatters.ts:21`, read it
in both). The doctrine effect is on record verbatim:
`overview/sub_cron_agents/libs/cronHelpers.ts:8-12` — *"Uses the same
`undefined`-locale convention as the shared AbsoluteTime component"* — a
primitive's defect copied as house style.

Re-checked 2026-10-31 at personas@22260d77: the missing argument was
supplied at the primitive, as this section prescribed. `RelativeTime`
reads `language` from `useTranslation()` and formats its tooltip with
`toLocaleString(language)` (`RelativeTime.tsx:39`, `:56`); `AbsoluteTime`
formats with `languageOverride ?? language` through a per-(locale, variant)
formatter cache (`AbsoluteTime.tsx:25-35`, `:76-77`), so it is no longer
unmemoized; `formatRelativeTime` reads `activeLanguage()` and uses
`Intl.RelativeTimeFormat` (`src/lib/utils/formatters.ts:99-129`, citing
`LiveRoadmapStatusPill.tsx:38` as precedent). The four-policy row no
longer reproduces from the primitives. The 221 / 1 count was not
re-measured. `cronHelpers.ts` is gone; the same sentence now sits at
`src/features/schedules/libs/calendarHelpers.ts:170`, citing a convention
`AbsoluteTime` has since dropped.

## The elapsed vocabulary, forked 28 + 14 times

28 hand-rolled elapsed ladders (12 hardcoded English including the
shared `formatRelativeTime` behind all 100 `<RelativeTime>` tags; 7
fully translated, *each with its own key namespace*; 3 using
`Intl.RelativeTimeFormat`). The catalog holds **48 rung strings across
14 namespaces = 611 translations of one four-rung vocabulary**, already
drifted per locale (Czech: `"před {n}min"` vs `"před {minutes}m"` on one
screen) with nine placeholder spellings and 143 dead strings no code
consumes — invisible to `check-coverage.mjs` because they are present in
every locale. The platform answer is used 3 times here, 0 in either
sibling; the one complete site is the one to copy.
Re-checked 2026-10-31: the shared `formatRelativeTime` is now an
`Intl.RelativeTimeFormat` ladder, so it is no longer one of the hardcoded
English ones; the 28 / 48 / 14 / 611 / 143 counts were not re-measured.

## The clamp, and the copy-worthy exemplar

`src/features/home/sub_releases/LiveRoadmapStatusPill.tsx:27-45` is the
only site that gets every clause right at once: a docblock naming the
skew causes (NTP, DST, sleep-wake), `Math.min(0, diff)` (`:40`), a
declarative `BUCKETS` table, and `Intl.RelativeTimeFormat(language)`
with `language` as a **required prop** — the type answer applied once.
Against it: two sites render `-45s ago`
(`PersonaHealthDashboard.tsx:74`, `StatusPageView.tsx:45` — the same
negative render both siblings independently reinvented), and ~16 ladders
let any negative satisfy the first rung and render a future instant as
*just now* — masking the wrong-instant bug (`AbsoluteTime.tsx:46` parses
without `normalizeTimestamp`, so zone-less rows render hours in the
future west of UTC; CI, being UTC, cannot see it). No skew telemetry
exists here; `personas-web`'s `format.ts:28-64`
(`FUTURE_SKEW_TOLERANCE_MS`, abandon-relative + one Sentry breadcrumb
per session) is the shape to adopt.

Re-checked 2026-10-31 at personas@22260d77: `PersonaHealthDashboard.tsx`
and `StatusPageView.tsx` are gone; `formatRelativeTime` now clamps the
future to zero (`Math.max(0, …)`, `formatters.ts:115`); and `AbsoluteTime`
parses through `normalizeTimestamp` (`AbsoluteTime.tsx:92`), with a comment
recording the two-hour offset it caused. The wrong-instant bug named here
is fixed at the primitive. `language` is still a required prop of
`LiveRoadmapStatusPill` (`:62`). No skew telemetry was found in this pass.
