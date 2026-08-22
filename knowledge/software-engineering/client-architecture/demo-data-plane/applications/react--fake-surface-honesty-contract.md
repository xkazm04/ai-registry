---
layer: application
type: application
subject: demo-data-plane
technique: fake-surface-honesty-contract
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# The honesty contract in the Personas web dashboard

The dashboard ships a public demo at `/demo` inside the same Next.js 16 / React
19 production build that serves signed-in tenants. Every clause of the contract
has a site in the tree, and the count rule has the sharpest one.

## The count rule

`src/components/dashboard/DashboardNavigation.tsx:85` is the single most
load-bearing comment in this subject's source material:

```ts
const getBadge = (item: NavItem) => {
  // Reviews/executions badges come from real stores. Messages/incidents/health
  // have no synced source yet, so their counts are illustrative fixtures —
  // show them ONLY in demo mode; a real tenant must not see fabricated alert
  // counts (they'd act on incidents/health that don't exist in their fleet).
  if (item.key === "reviews" && pendingReviewCount > 0) return pendingReviewCount;
  if (item.key === "executions" && activeCount > 0) return activeCount;
  if (!isDemo) return null;
  if (item.key === "messages" && MOCK_UNREAD_MESSAGES > 0) return MOCK_UNREAD_MESSAGES;
  ...
```

Two badges have real predicates and render in every plane. The rest have none,
so `:91` returns `null` for any non-demo session before the fixtures are
consulted at all. The comment names the harm rather than the rule, which is why
it will survive a cleanup: *they'd act on incidents/health that don't exist in
their fleet.*

The same rule appears three more times, each on a surface that would otherwise
draw a fabricated shape over genuine data:

- `src/components/dashboard/CostChartWithCompare.tsx:81` — the previous-period
  overlay prop is documented *"Empty in real mode (no synced prior period) so no
  fabricated 'Previous' line is drawn over genuine data"*, and `:92` refuses to
  merge the series when it is empty. The timeline annotations at `:84` follow the
  same rule.
- `src/app/dashboard/observability/performance-view/useSparklines.ts:44` — the
  agents-over-time series *"has no synced source, so it stays empty."*
- `src/app/dashboard/home/home-page/DashboardIntelligencePanels.tsx:11` — both
  panels *"render in demo and nothing at all otherwise"*, enforced by an early
  `if (!isDemo) return null` at `:20`.

**Deviation.** `useSparklines` substitutes `EMPTY_SPARKLINES` (`:37`) and the
comment notes the card then *"renders a flat line rather than a fabricated
trend"*. A flat line is a weaker refusal than an absent one: it still reads as
"no change over the period." The standard's answer is to render no trend at all
on a card whose source is missing.

## Plane first, emptiness second

`src/app/dashboard/observability/UsageView.tsx:39` documents the gate and `:43`
implements it:

```ts
// Demo mode renders the illustrative MOCK_* fixtures (and the example-data
// notice). Real mode uses the genuine — possibly empty — analytics, never the
// mock; an empty real dataset renders the empty charts honestly.
const hasRealData = (data?.toolUsage ?? []).length > 0;
const useMock = isDemo && !hasRealData;
```

The shape is exactly the one the technique prescribes: `isDemo` is the outermost
term, and the emptiness test only chooses between two honest sources *inside*
the plane the viewer explicitly entered. A real tenant with zero tool
invocations gets empty charts and the honest empty state, never the fixtures.
The accompanying notice string lives at `src/i18n/en.ts:2700`
(`exampleDataNotice`): *"Showing example data. Real analytics will appear once
agents start running executions."*

## Marker, controls, source, indexing

**Persistent marker.** `src/components/dashboard/DashboardNavbar.tsx:53` renders
an amber pill with a flask icon beside the product name whenever `isDemo` is
set. It is in the dashboard chrome, present on every dashboard page, and it
survives a crop of the header region.

**Lying controls removed, replaced by the conversion action.** The same file:
`:105` renders the sign-out button only when `!isDemo`, with the reason written
at `:102` — *"Sign out is only meaningful for a real account — a demo session has
nothing to sign out of."* The slot is not left empty: `:87` puts a "Sign in"
button there for demo sessions, described in its own comment as *"a one-click
upgrade to a real account from any page."* The removal of the lie and the
conversion path are the same edit.

**The data source is named.** `src/app/dashboard/settings/page.tsx:119` renders
the orchestrator endpoint row as `mock://demo-data` in demo mode and the real
`NEXT_PUBLIC_ORCHESTRATOR_URL` otherwise. It occupies the same `<code>` element
as a real address, so it needs no special layout, and it is unmistakable in a
screenshot.

**Not indexed.** `src/app/robots.ts:13` disallows `/demo` alongside
`/dashboard/`, `/api/`, `/m/` and `/preview`.

**Fabrication is visible in the identifiers themselves.**
`src/lib/mockData.ts:26` mints every fixture id through
``id(prefix, n) => `${prefix}-${String(n).padStart(4, "0")}-mock` ``, so
`p-0001-mock` announces what it is wherever it lands — a log line, a support
ticket, a pasted screenshot.

## Asserted end to end, against the shipped artifact

`e2e/dashboard-demo.spec.ts:3` is the contract's enforcement. The suite drives
the real build: `/demo` must land on `/dashboard/home` and show the demo badge
(`:13`), the dashboard must render on mock data (`:16`), and a hard navigation
to a mobile route must show the sign-in prompt with its always-available "Try
Demo" rather than a restored demo session (`:23`). Because the demo is a route
in the production build rather than a build variant, these assertions run over
the artifact they exist to protect.

**Gap.** The suite asserts the marker's presence in demo. It does not assert the
negative direction — that a real session renders no fabricated badge on
messages, incidents or health. That is the assertion protecting the expensive
failure, and it is the one missing.
