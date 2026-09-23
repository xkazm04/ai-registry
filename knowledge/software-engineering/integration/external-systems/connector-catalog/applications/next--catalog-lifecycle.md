---
layer: application
type: application
subject: connector-catalog
technique: catalog-lifecycle
stack: next
status: forged
verified_on: 2026-09-23
verified_against: next@16
applied: experiment
ab_verdict: better
---

# The stage decides the surface: a three-row catalog keyed by id, then by row

*Verified against the project tree at `43730115` (next 16.3.3, react 19.2.4
from the lockfile).*

The technique's front-end paragraph says the surfaces derive from a row's
stage. An announced entry gets a card but no connect action, and a surface
that tests a particular identity ignores the stage it should be reading.
This tree shipped that failure and then fixed it, on a catalog of three rows.
The catalog is too small for scale to have played any part.

## The catalog

`src/lib/integrations/providers.ts` is a code-resident registry: a typed
`ProviderDef` (`:27-42`) with two closed vocabularies that matter here,
`ProviderStatus = "available" | "planned"` (`:24`) and `ConnectKind =
"otel-push" | "admin-pull"` (`:25`). The three rows sit at `:55-100`. Two are
`available` (one per connect kind), and one is `planned` with a connect kind
already declared.

## The failure, as it stood

Until commit `ee21f7d5` (2026-09-05), the integrations page chose the connect
surface by testing `p.id === "claude-code"`. The Copilot row had been
declared `available` with `admin-pull` for weeks, and an owner-gated sync
route existed behind it. The commit message records that the route had
"ZERO callers in src/". So the card showed a green "Available" badge and
offered nothing to do. The row declared a stage and a mechanism, and no
surface read either of them. A consumer's conformance verdict of 2026-08-24
recorded exactly this state.

## The fix, and the property it bought

`IntegrationsPanel.tsx:80-91` now derives the surface from the row:

- `if (provider.status !== "available") return null;` (`:84`). A planned row
  still gets its card, so it can be announced, but it gets no connect
  action. The stage decides, not the id.
- `switch (provider.connectKind)` (`:85-90`) covers both members of the
  closed kind vocabulary. The doc above it (`:73-79`) states the purpose:
  "a new kind is a compile error here rather than a card that silently
  offers nothing". Adding a row is now a data change. Adding a *kind* fails
  the build until a surface exists for it, which is a verification mechanism
  for a declaration of the kind the catalog-as-data technique asks for.
- The header (`:6-10`) records the old test and why it was wrong, next to the
  code that replaced it.

The badge already read the row (`ProviderCard.tsx:21`, `provider.status ===
"available"`), which is why it said Available while the action was keyed on
an id. Before the fix, the badge and the action read two different
authorities. Now both read the same field, so they cannot disagree.

## What this realization cannot show

- **Only the front of the lifecycle exists.** There is no `deprecated` or
  `retired` member in `ProviderStatus`, and no row has ever left. The tree
  says nothing about tombstones or about resolving an entry once it is gone.
- **Three rows is not a catalog economy.** This shows that dispatching on id
  fails as early as the second row. It does not measure the cost of adding
  service N+1.
- **The stage and support axes are not separable here.** With two stages and
  no notion of who maintains a provider, the technique's advice to keep
  those axes apart has nothing to test against.

## Applied 2026-09-23 - confirmation row, read-only experiment

Not independent evidence: this application was written from the same tree. All 3 surfaces
on the page (connect action, first-action copy, badge) read the stage, and 0 test a
literal id. Before the fix (the dispatch as it stood at the parent of the fixing commit),
1 of 2 available rows had no connect surface; at HEAD 0 of 1 planned rows get one and 2 of
2 available rows get exactly one. A component test pins the planned case, and the pre-fix
id test run over the same rows reproduces the bug. Off the page: the generic ingest write
door accepts any source string, including the planned row's identity, and checks neither
catalog nor stage; whether those records reach the delivery views while the card says
Planned was not hunted. `better`.
