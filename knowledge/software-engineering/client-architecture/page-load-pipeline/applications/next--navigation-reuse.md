---
layer: application
type: application
subject: page-load-pipeline
technique: navigation-reuse
stack: next
status: forged
verified_on: 2026-10-31
verified_against: next@16.3.8
applied: code
ab_verdict: better
proof: ab-paired
---

# Eligible everywhere, counted nowhere: the restored return the page-view metric missed

Tree: personas-web, built from `origin/master` at `8d6a695b` in a clean worktree and changed
in `da43eade` (pushed). Version witness: `package-lock.json` at that commit resolves
`node_modules/next` to 16.3.8 and `react` to 19.3.1 (the lockfile, not the `^16.3.8` range in
`package.json`). The seam is the page-view counter mounted in the root layout,
`src/components/PageViewTracker.tsx`, and the technique's first half (staying eligible) was
tested across every route before that seam was chosen.

## The seam was chosen to falsify the eligibility half

The technique names four things that shut a page out of back/forward restoration by
accident: an unload handler, a blanket no-store header, an open connection and a live opener
handle. The source tree holds candidates for two of them. One stream hook opens an event
source and closes it only on unmount, with no page-hide handling. The sibling Next trees in
the fleet set no-store on whole areas of the app. So the question was whether this site loses
restoration anywhere. If it did, the technique's central rule would be confirmed on a real
tree. If it did not, the eligibility half would have held on a tree that could have broken it.

Instrument: a production build served locally. Installed Chrome 156 with the cache enabled.
For each route, visit it, navigate to a page on another origin, go Back, and read
`pageshow.persisted` and the navigation entry's not-restored reasons. Two controls run
first. A plain page restored, and a page with an unload handler was refused for
`unload-listener`, so the instrument can see both outcomes. **The test runner's default
headless shell is not an instrument for this property**: it refused every page, the plain
control included, with its reasons masked. A probe run on it reports "nothing is ever
restored", which looks like evidence and isn't. Run the controls first.

Result: 12 of 12 public routes restored, and 8 of 8 demo dashboard routes restored. The
eligibility half held. The site carries no unload handler and no document no-store. The one
open-connection risk sits behind sign-in, where the probe cannot reach.

## What the tree's shape says about the standard

The demo dashboard is an in-memory session that is never persisted. The tree says so, and
its smoke suite enters the demo once and walks the sidebar because a fresh load of any
dashboard route lands on the sign-in prompt. Run the same Back cycle with the cache disabled
and that is exactly what happens: the visitor who followed a link out of the demo and came
back has lost it. With the cache enabled the demo survives Back on every route. Nobody
designed that dependency. It falls out of the store being memory-only, and it makes
eligibility a product property here, not a speed one. Any future blocker (a dashboard-wide
no-store or an unload handler) would cost the visitor the demo, not just a few hundred
milliseconds. No test currently guards it.

## The half that did not hold: restoration is a lifecycle

The technique's second section says a restored page resumes and nothing that runs on load
runs again, so analytics must count the view on the page-show event. The tree had no
page-show handler anywhere in its source. Its counter ran in an effect keyed on the pathname,
and a restored page neither re-runs effects nor changes its pathname. Since every route is
restorable, every Back or Forward return the browser served from the cache was missing from
the page-view metric. The better the site did on the first half, the more the second half's
absence cost.

- **A (as shipped):** the counter dedupes by normalized route inside the effect. A restored
  return emits nothing.
- **B (`da43eade`):** the counting rules move into a pure module,
  `src/lib/page-view-counter.ts:32 "if (event.persisted && current !== null) track(current);"`,
  and the tracker subscribes to the event at
  `src/components/PageViewTracker.tsx:22 "window.addEventListener("`.
  Only a restored show counts, so a fresh load's first page-show is not counted twice.
- **Target:** views counted per restored return. B counts 1 per return, and the five new
  unit tests pass. Removing the restoration branch (A's behaviour) fails 2 of the 5.
- **Floor:** one count per route and none for a fresh load's page-show (the other three tests
  pass on both arms). Restoration is unchanged by the new listener: B restores 12/12 public
  and 8/8 dashboard routes. 2,442 unit tests, type check, lint and the pre-push gate are green.

## What this realization cannot do

- The proof of the count is unit-level. The local build has no telemetry endpoint
  configured, so the browser run proves restoration happens and the unit tests prove what the
  counter does when it does. No emitted metric was observed end to end.
- **Session re-check on restore is not measured.** It is left to the auth client's own
  visibility handling, and checking it needs a real signed-in session signed out in a
  second tab.
- **The signed-in event stream still holds its connection across page-hide.** The
  technique's rule (close on hide, reopen on show) is unmet there. Whether it costs
  restoration was not measured, because the stream runs only in a real signed-in session.
- **Dated fact, Chrome 156:** a control page served with `Cache-Control: no-store` was
  restored. The technique's line that a blanket no-store header forbids keeping the page is
  engine- and version-dependent. The advice still stands (the header is no guarantee either
  way, and engines differ), but a probe expecting a refusal should not assert one.
