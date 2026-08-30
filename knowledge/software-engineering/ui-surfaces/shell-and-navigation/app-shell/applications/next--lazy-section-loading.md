---
layer: application
type: application
subject: app-shell
technique: lazy-section-loading
stack: next
status: forged
verified_on: 2026-08-30
verified_against: next@16
---

# TAB_CHUNKS + TabChunkGap — one import map, two consumers, and the skeleton they deleted

Read in a hiring-studio tree (Next.js 16.3.0 / React 19) at commit
`40363b7`, 2026-08-30; citations resolved against that tree on that date. It
reaches the *opposite* conclusion to the desktop-shell case already recorded
for this technique on one point — the placeholder — and the disagreement is the
finding.

## One loadable unit per destination, and one import map for both consumers

`app/features/shell/tabChunks.ts` holds the specifiers for all 23 destination
chunks exactly once (`TAB_CHUNKS`, `:22-46`), split at the destination's root:
one unit per nav entry, no deeper. Its whole reason for existing is that the
loaders need *two* consumers — the renderer, which awaits a chunk, and the
prefetcher, which only starts one (`:3-12`). Going through one map is what makes
the two "provably request the same chunk", and the header states the trap that
makes this non-optional: a differing specifier string is a different module
record, so a prefetch written against a copy would warm a chunk the render never
awaits, and nothing would report it (`:14-18`). The consumer registry
(`WorkspaceTabChunks.tsx:31-53`) reaches every chunk only through that map.

Idempotence is a set, not a hope: `prefetchTabChunk` records one attempt per
destination per document, and a rejected prefetch removes its own record so the
click path can try again (`tabChunks.ts:62-72`). A prefetch failure is swallowed
deliberately — "a prefetch must never be the thing that breaks a page" — while a
render-path failure surfaces through the destination's error boundary. That is
the technique's silent-prefetch / loud-click-path split, implemented.

## Intent, prediction and idle warm-up, all three present

- **Expressed intent, at two levels.** A panel row starts its chunk on
  `onPointerEnter` *and* `onFocus`, "because a keyboard user never hovers"
  (`NavPanelItem.tsx:87-92`). The level-one rail button warms the whole group on
  click, hover and focus (`NavSectionRail.tsx:127-146`) — added because reaching
  a second-level destination was otherwise two sequential waits: open the
  section, then start the chunk on the row hover a beat before the click. The
  cost is bounded and stated: groups are 2–7 small chunks and the call is
  idempotent, so at most one extra download per group per session.
- **Predicted intent.** `IDLE_WARM` is the four operational destinations "a
  session almost always visits" (`tabChunks.ts:76`), minus whichever is already
  rendering.
- **Idle warm-up, politely.** `warmLikelyTabChunks` runs in an idle callback so
  it never competes with hydration or the active destination's first paint, with
  a 2s timeout so a permanently busy main thread cannot starve it forever, and a
  500ms macrotask fallback where idle callbacks are unavailable
  (`tabChunks.ts:84-97`). It is re-armed when the active destination changes
  (`Workspace.tsx:142`) so the warm set never includes what is already
  rendering.

## The finding: the shell's placeholder is the destination's chrome or nothing

The technique prescribes a geometry-matched low-fidelity placeholder — the
stable chrome the destination will have. This tree shipped that, measured it,
and **deleted it**. `TabChunkGap` is now deliberately empty
(`WorkspaceTabChunks.tsx:17-28`), and the reason is written in full: the old
three-bar skeleton "drew a header + card silhouette that matched no tab in
particular, so a cold navigation showed two unrelated loading shapes in a row
(this one, then the tab's own) before content — the exact flicker the
choreography forbids."

What replaced it keeps the other three clauses of the placeholder contract and
drops only the shape: nothing visible, behind a 150ms delayed fade, on a
`min-h-[24rem]` block that holds the surrounding chrome from jumping into the
gap, marked `aria-hidden`. So a warm chunk paints no placeholder at all; a
genuinely slow one gets a calm held frame rather than a fake page.

The transferable rule, and the correction it produced upstream: a shell-level
placeholder must be either *the destination's own* loading chrome or nothing at
all. A third, generic shape is not a compromise between them — it is a second
wrong silhouette stacked in front of the right one, and it converts the
technique's "one continuous settle" into the two-skeleton flicker the technique
was written to prevent. The already-recorded desktop-shell case ghosts only the
one region every destination shares at the same position, which is the same rule
reached from the other side: ghost what is genuinely common, or ghost nothing.

## Where the tree falls short of the standard (kept, not hidden)

- **The unit is code, not code plus strings.** The translation catalog is
  handed down whole from the root layout — measured at ~412 KB
  (`shallow-nav.ts:5-20`) — rather than split along the destination boundary.
  The technique's "the unit includes what the section needs to render
  meaningfully" is satisfied by shipping everything eagerly instead of by
  splitting correctly, and that catalog is the single largest item in the eager
  frame, most of it for destinations the session will never open.
- **Warm return keeps the code, not the surface.** The destination panel is
  re-keyed on the active id (`WorkspaceTabChunks.tsx:61-62`), so returning to a
  destination replays the entrance animation and remounts its subtree. The
  chunk stays warm for the session; the surface state does not. The technique's
  "no cold-load choreography on warm return" is not met, and the re-key is
  deliberate — it is also what scopes the error boundary — so the two goals are
  in genuine tension here rather than merely unaddressed.
- **Chunk failure has a boundary but no cure.** A failed chunk lands in the
  destination's error boundary, which resets when the destination changes
  (`WorkspaceTabChunks.tsx:61`). There is no automatic retry, and nothing
  detects the version-skew case, so the post-deploy client asking for a unit
  address that no longer exists gets a stated failure with no refresh offer —
  the technique's named cure is absent.
- **Nothing warms on a live signal.** The technique's "the section a live
  notification points at" has no implementation: the attention counts arrive
  every 60 seconds and none of them warms the destination they point at.
