---
layer: application
type: application
subject: app-shell
technique: lazy-section-loading
stack: next
status: forged
verified_on: 2026-09-23
verified_against: next@16
applied: experiment
ab_verdict: better
---

# TAB_CHUNKS + TabChunkGap: one import map, two consumers, and the skeleton they deleted

First read in a hiring-studio tree (Next.js 16.3.0 / React 19) at commit
`40363b7`, 2026-08-30. Every citation below was re-resolved on 2026-09-23 at
commit `1401bb25`. The lockfile there pins `next` 16.3.3 and `react` 19.2.8,
and the installed tree still holds `next` 16.3.0. The case reaches the
*opposite* conclusion to the desktop-shell case already recorded for this
technique on one point, the placeholder, and that disagreement is the finding.

## One loadable unit per destination, and one import map for both consumers

`app/features/shell/tabChunks.ts` holds the specifiers for all 24 destination
chunks exactly once (`TAB_CHUNKS`, `:22-47`), split at the destination's root:
one unit per nav entry, no deeper. Its whole reason for existing is that the
loaders need *two* consumers: the renderer, which awaits a chunk, and the
prefetcher, which only starts one (`:3-12`). Going through one map is what makes
the two "provably request the same chunk". The header also states the trap that
makes this non-optional: a differing specifier string is a different module
record, so a prefetch written against a copy would warm a chunk the render never
awaits, and nothing would report it (`:14-18`). The consumer registry
(`WorkspaceTabChunks.tsx:31-54`) reaches every chunk only through that map.

Idempotence is a set, not a hope. `claimChunk` records one attempt per
destination per document, and a rejected prefetch removes its own record so the
click path can try again (`tabChunks.ts:59-89`). A prefetch failure is swallowed
deliberately ("a prefetch must never be the thing that breaks a page", `:62`),
while a render-path failure surfaces through the destination's error boundary.
That is the technique's silent-prefetch / loud-click-path split, implemented.

## Intent, prediction and idle warm-up, all three present

- **Expressed intent, at two levels.** A panel row starts its chunk on
  `onPointerEnter` *and* `onFocus`, "because a keyboard user never hovers"
  (`NavPanelItem.tsx:125-127`). The level-one rail button warms the whole group
  on click, hover and focus (`NavSectionRail.tsx:141-162`). It was added because
  reaching a second-level destination was otherwise two sequential waits: open
  the section, then start the chunk on the row hover a beat before the click.
  The cost is bounded and stated: groups are 2–7 small chunks and the call is
  idempotent, so at most one extra download per group per session.
- **Predicted intent.** `IDLE_WARM` is the four hiring-flow destinations the
  sidebar opens on (`tabChunks.ts:91-93`), minus whichever is already rendering.
- **Idle warm-up, politely.** `warmLikelyTabChunks` runs in an idle callback so
  it never competes with hydration or the active destination's first paint. It
  has a 2s timeout so a permanently busy main thread cannot starve it forever,
  and a 500ms macrotask fallback where idle callbacks are unavailable
  (`tabChunks.ts:95-115`). It is re-armed when the active destination changes
  (`Workspace.tsx:148`), so the warm set never includes what is already
  rendering.

## The finding: the shell's placeholder is the destination's chrome or nothing

The technique used to prescribe a geometry-matched low-fidelity placeholder: the
stable chrome the destination will have. This tree shipped that, measured it,
and **deleted it**. `TabChunkGap` is now deliberately empty
(`WorkspaceTabChunks.tsx:17-28`), and the reason is written in full: the old
three-bar skeleton "drew a header + card silhouette that matched no tab in
particular, so a cold navigation showed two unrelated loading shapes in a row
(this one, then the tab's own) before content — the exact flicker the
choreography forbids."

The replacement keeps the other three clauses of the placeholder contract and
drops only the shape. It renders nothing visible, behind a 150ms delayed fade,
on a `min-h-[24rem]` block that holds the surrounding chrome from jumping into
the gap, and it is marked `aria-hidden`. So a warm chunk paints no placeholder
at all, and a genuinely slow one gets a calm held frame rather than a fake page.

The transferable rule, and the correction it produced upstream: a shell-level
placeholder must be either *the destination's own* loading chrome or nothing at
all. A third, generic shape is not a compromise between them. It is a second
wrong silhouette stacked in front of the right one, and it converts the
technique's "one continuous settle" into the two-skeleton flicker the technique
was written to prevent. The already-recorded desktop-shell case ghosts only the
one region every destination shares at the same position. That is the same rule
reached from the other side: ghost what is genuinely common, or ghost nothing.

## Where the tree falls short of the standard (kept, not hidden)

- **The unit is code, not code plus strings.** The translation catalog is
  handed down whole from the root layout, measured at ~412 KB
  (`shallow-nav.ts:11-16`), rather than split along the destination boundary.
  The technique's "the unit includes what the section needs to render
  meaningfully" is satisfied by shipping everything eagerly instead of by
  splitting correctly. That catalog is the single largest item in the eager
  frame, and most of it serves destinations the session will never open.
- **Warm return keeps the code, not the surface, and the cause is the mount
  model, not the key.** *Corrected 2026-09-23.* This entry used to say the
  panel's per-destination key was what scoped the error boundary, so warm
  return and error containment were in genuine tension. The tree says
  otherwise, and said so at `40363b7` too. The boundary is scoped by its own
  `resetKey={navActive}` (`WorkspaceTabChunks.tsx:62`), which clears a captured
  error when the destination changes (`ErrorBoundary.ts:53-55`). The inner
  `key={navActive}` (`:63`) exists only to replay the entrance animation, as the
  comment at `Workspace.tsx:214-217` says. Removing that key would not bring the
  surface back either: the panel renders exactly one destination, chosen by 24
  conditionals (`WorkspaceTabChunks.tsx:64-89`), so every other destination is
  unmounted whatever the key does. The technique's "no cold-load choreography on
  warm return" is unmet because the shell mounts one section at a time with no
  restore path, not because error containment requires it.
- **The framework's route keep-alive is switched on and never engages.** The
  tree enables `cacheComponents` (`next.config.ts:91-99`). Under it, the
  framework's own guide says pages are hidden with React's `<Activity>` rather
  than unmounted, and "Next.js preserves up to 3 routes. Beyond that, the oldest
  route is evicted and will re-render fresh" (Next.js, *Guides: Preserving UI
  state*, docs version 16.3.6, last updated 2026-07-01,
  `https://nextjs.org/docs/app/guides/preserving-ui-state`, retrieved
  2026-09-23). Every destination here is the same route (`/`) switched in
  client state (`Workspace.tsx:77-96`), so that preservation never applies. A
  shell with this architecture has to build keep-alive itself if it wants it:
  hide the visited destinations instead of unmounting them, and bound how many.
  React documents tabs as the case it had in mind (`https://react.dev/reference/react/Activity`,
  retrieved 2026-09-23). The upstream technique's warm-return rules for hidden
  sections (transient UI, mount-time init, media, duplicate identity, reset on
  session change) are what that change would owe. The framework's open issue on
  route-level preservation shows each of them breaking in the field: dropdowns
  still open on return, mount-time dialog logic running once, and duplicate form
  fields failing strict-mode end-to-end selectors (`vercel/next.js#86577`,
  open, retrieved 2026-09-23).
- **Chunk failure has a boundary and a manual retry, but no cure.** A failed
  chunk lands in the destination's error boundary, which resets when the
  destination changes and, since the first read, offers a retry button that
  clears the captured error (`ErrorBoundary.ts:72,92`). There is still no
  automatic retry. Nothing detects the version-skew case, so a post-deploy
  client asking for a unit address that no longer exists gets a stated failure
  with no refresh offer, and the technique's named cure is absent. Whether the
  manual retry re-requests a rejected chunk or replays it was not tested in this
  pass.
- **Nothing warms on a live signal.** The technique's "the section a live
  notification points at" has no implementation. The attention counts refresh
  on a 60-second visible-tab poll (`attentionPoll.ts:16`) that backs off on
  failure, and none of them warms the destination it points at.

## Applied 2026-09-23 - the keep-alive hazard census, read-only experiment

Census over the 24 tab chunks' import closures, with 9 of 9 detector controls passing.
Transient open/menu flags: 40 across 14 of 24 tabs (21 of 24 counting shared components).
Live microphone/voice sessions: 2 tabs. Cross-tab duplicate static ids or test ids: 0 of
39 literals, and 0 of 10 e2e id selectors hit two tabs. The 60 text-, label- and
placeholder-based e2e locators, which also match hidden nodes, were not measured.
Document-level style hazards: 0. The installed React 19.2.5's hide path runs passive-effect
cleanups and its reveal re-runs them, so all 22 tabs that load data in effects re-request
on every return; 18 keep their last data on screen while reloading, 4 blank first. Today 0
of 24 surfaces survive a return; bounded keep-alive would keep at least 20. What caught:
the voice interview's unmount cleanup ends the call and beacons a completion, so under
keep-alive it fires on every hide, and a ref that survives the reveal marks the call
finished - the kept surface would show a dead call. That corrected the technique's
lifecycle bullet. The lockfile pins Next 16.3.3 and React ^19.2.8; the installed 16.3.0
and 19.2.5 were what was read.
