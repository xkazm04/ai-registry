---
layer: application
type: application
subject: app-shell
technique: shell-hosted-services
stack: next
status: forged
verified_on: 2026-11-16
verified_against: next@16
---

# Workspace.tsx as host — declared mount order, and the sibling that must not be a child

Read in a hiring-studio tree (Next.js 16.3.0 / React 19) at commit
`40363b7`, 2026-08-30; citations resolved against that tree on that date.

## The host region is one file, and the order is the file's shape

`app/features/shell/Workspace.tsx` is the enumerable host the technique asks
for: every session-lifetime resident is mounted in one 60-line return, readable
top to bottom (`Workspace.tsx:163-221`). Three providers nest in a declared
order — tasks, then simulation, then the companion dock (`:164-169`) — and the
nesting *is* the dependency story: the dock lives inside both because it reads
from them. Below them sit the two populations the technique separates:

- **Workers / headless residents**: the keyboard-chord engine
  (`KeyboardShortcuts`, `:202`), the visibility-gated attention poll
  (`useAttention`, `:48`), the idle chunk warmer (`warmLikelyTabChunks`,
  `:142`), and the breakpoint watcher whose only output is the `inert` and
  focus-trap decisions (`:59-65`).
- **Global surfaces**: the command palette (mounted inside the nav drawer's
  rail footer so it is reachable from any destination), the simulation
  surfaces (`SimSurfaces`, `:215`), the first-run wizard (`:216`), and the
  companion dock.

Two shell-level accessibility residents mount here and nowhere else: the skip
link as the first focusable element in the frame (`:171-176`), and a single
polite live region (`:180-182`) that announces the newly active destination.
Both are shell property, not page property, exactly as the golden path's
accessibility posture says — a page cannot own the affordance that skips past
the page.

## The finding: the host must sit above the swap point

The comment at `Workspace.tsx:166-168` is the sharpest thing in this file. The
companion dock is mounted as a **sibling** of the frame's content div, inside
every provider and *outside the keyed tab panel* — "so a conversation survives
tab switches." The panel it sits beside is deliberately re-keyed per
destination, so that a destination's render crash is contained to the panel and
so the entrance animation replays on each switch (`:207-213`,
`WorkspaceTabChunks.tsx`). That key is a teardown instruction. Anything hosted
inside it is not a shell resident at all, however permanent the surrounding
frame is — it is a page-lifetime component that will reset on every navigation,
silently, with no error and no symptom except an assistant that forgets the
conversation whenever the user looks at something else.

This is the case the technique did not name and now does: the never-unmounts
guarantee is only inherited *above* whatever gets re-keyed per location, and a
frame can be perfectly permanent while the region a service was dropped into
is not.

## Readiness and start-up, checked

- **Start-up does not block first paint.** The attention poll, the chunk
  warmer, and the breakpoint watcher all run in effects after mount; the frame
  and the nav render from local knowledge (`NAV_GROUPS`, the persisted brand
  and locale) with no loading state of its own. The one deliberate exception is
  the breakpoint state, which initialises `false` so the server and first client
  render agree and an effect corrects it (`:56-58`) — a hydration constraint
  standing in for readiness.
- **Focus movement is gated on a real transition.** The effect that moves focus
  to the `<main>` landmark and announces the destination compares against a
  ref of the previous value and returns early when they match
  (`:126-136`), so it never steals focus on first load or on an unrelated
  re-render (an attention count arriving, the drawer toggling). The technique's
  "no consumer of a service fires before that service is ready, silently" has a
  twin here: no resident fires on a non-event.
- **Failure containment is per-destination, not per-resident.** The error
  boundary wraps the tab panel and clears itself when the destination changes,
  so "sidebar + sim bar survive" a page crash (`:207-210`). That protects the
  frame from its pages. It does not protect residents from each other: a crash
  inside a provider takes the whole frame.

## Where the tree falls short of the standard (kept, not hidden)

- **No named reaper, for either ending class.** Sign-out is a button that POSTs
  and hard-navigates away (`SignOutButton`, reached from the rail footer), so
  the process simply ends and the residents die with the document. That works
  by accident of the architecture, not by design: nothing enumerates what must
  flush, and there is no workspace-switch path today that would exercise the
  session-end class the technique separates out. Add one and the missing
  teardown story becomes a leak between two users on one machine.
- **A dead worker is not distinguishable from a quiet one.** The attention poll
  swallows every failure and keeps the previous counts (`useAttention.ts:29-32`).
  That is the right call for a hint, but it is also the technique's exact
  failure mode: a permanently unreachable count source and a genuinely empty
  queue render identically, forever, with no stale indicator.
- **Residency is not tested.** Nothing enumerates the resident list or asserts
  that a candidate mounted above the swap point. The dock's placement is
  correct because a comment says why; a refactor that moves it one level in
  breaks it with no failing test and no visible symptom on the first read.

## 2026-11-16 re-read, at `808eb83c` (Next.js 16.4.5), public clone, read-only

Re-checked on main at `808eb83c` (2026-11-10). The anchors have drifted, as the
09-23 lead said, so here are the current ones. `Workspace.tsx` is now 310 lines,
and its host return is `:240-309`.

**The host grew, and the order still tells the dependency story.** The nesting now
reads as follows:
- a shell-principal context (`:241`), seeded synchronously from a `useState`
  initializer before any child renders (`:55`, `shellPrincipal.ts`, from `1821ecd8`);
- tasks;
- the document-title resident (`:243`);
- simulation;
- the companion dock (`:242-248`).

The principal has to come first. The non-React stores (recents, the palette preview,
board storage) read the tenant from it synchronously. The newest resident is
`SessionLapseDialog` (`:303`, from `a004d488`).

**The swap point is unchanged.** The panel is still re-keyed per destination, inside a
boundary that resets on the same key (`WorkspaceTabChunks.tsx:128-129`). The dock is
still a sibling outside it (comment `:245-247`). The skip link (`:250-255`) and the
tab-switch live region (`:259-261`) are still shell property. The focus move is still
gated on a real change (`:203-213`).

**Correction: the session-end class now has a reaper, by design.** The section above
records "no named reaper" and warns that a workspace-switch path would leak. That path
now exists, and it routes through document replacement:
- the team switch reloads the page (`app/features/settings/workspace/WorkspaceTab.tsx:94-107`);
- the shell-principal header states the rule: "Team switching does a full reload ...
  so neither fact can go stale inside a document" (`shellPrincipal.ts:30-31`).

The in-place re-sign-in after a lapse classifies by identity (`sessionLapse.ts:83-95`):
- the same person resumes and re-reads (`useSessionLapse.ts:163-191`);
- the same person landing in another team is switched back through the
  membership-checked door, or reloaded;
- a different person, or no readable session, reloads to `/` (`useSessionLapse.ts:74-76`).
  The header says it in one line: "A different person signing in never inherits the page:
  reload."

That is the technique's new "identity decides the class" rule, found here first.

**The other half was learned by incident.** Document replacement did not reap
persisted state. Before `55ef8c32` (2026-08-14), recents lived under one bare
`localStorage` key for the whole browser. After a team switch, which reloads the page,
the sidebar and palette still listed the previous team's candidate and job-description
names, and "a recruiter had already read the name of someone they are no longer
allowed to see". The fix is in `recents.ts:14-21,34-38`:
- the key now carries the tenant;
- nothing is read until the tenant is known;
- the pre-tenancy key is dropped, not adopted.

The rest of the persisted shell state is benign:
- `kp.recent-tabs` and `kp.nav.section` in `sessionStorage` hold tab ids only;
- companion preferences hold display settings.

One open question remains. Recents are keyed per team, not per person, so a second
member on a shared browser reads the first member's recent names. Whether that leaks
depends on whether entity visibility differs between members of one team. This read
did not settle it.

**Still short of the standard:**
- A dead attention worker is still indistinguishable from a quiet one. The poll now
  backs off, and routes a 401 to the lapse store, but a 5xx loop still shows the last
  counts with no stale mark (`useAttention.ts:36-53`).
- Residency is still untested.
- The frame now carries two polite live regions (`Workspace.tsx:259-261` and
  `NavSectionRail.tsx:208`). They can speak over each other on a switch whose
  mutation also moves a count.
