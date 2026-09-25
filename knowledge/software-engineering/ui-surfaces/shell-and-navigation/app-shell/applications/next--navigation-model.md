---
layer: application
type: application
subject: app-shell
technique: navigation-model
stack: next
status: forged
verified_on: 2026-09-23
verified_against: next@16
applied: experiment
ab_verdict: better
---

# useUrlInboxState + shallow-nav — the address demoted to an inbox, and what it cost

First read in a hiring-studio tree (Next.js 16.3.0 / React 19) at commit
`40363b7`, 2026-08-30. Every citation below was re-resolved on 2026-09-23 at
commit `1401bb25`, where the lockfile pins `next` 16.3.3 and the installed tree
still holds 16.3.0. This
is the counterpart case to the URL-less desktop shell already recorded for this
technique: here the product *has* an address bar and deliberately declines to
put the location in it.

## The vocabulary is closed, and the retirement table is a redirect

`app/features/shell/tabs.ts` holds one union of destination ids
(`WORKSPACE_TAB_IDS`, `tabs.ts:10`) with the type derived from the array rather
than written twice (`:63`), and one validating predicate built from that same
array — "never re-listed" (`isWorkspaceTabId`, `:277-283`). `NAV_GROUPS`
(`:171`) is the single catalog the rail, the panel, the command palette, the
keyboard chords and the analytics ids all derive from; the header's own
instruction is that a flat list, if ever needed, is
`NAV_GROUPS.flatMap(g => g.items)` "rather than maintained as a fourth parallel
declaration."

`LEGACY_TAB_ALIASES` (`:285-310`) is the technique's removal rule implemented
with unusual care. It is explicitly framed as a **redirect table, not a second
name**: the resolver maps a retired id onto a live one and everything
downstream — highlight, chunk, chord, analytics — only ever sees the live id
(`resolveTabParam`, `:312-318`). The comment that earns the citation is the one
about an entry deliberately *not* in the table: a removed module is not mapped
to a neighbour, because "mapping it to a neighbour would open an unrelated tab
and read as a bug. Falling through to Overview is the honest outcome: here,
'the feature is gone' is what actually happened." (The default destination has
since become the pipeline board, `tabs.ts:128`, so the comment's "Overview" is
itself a stale name. The rule it states is unaffected.) Renamed and removed are two
different fallbacks, and the technique treats them as one.

## The finding: the address as an inbox, not as the location

`app/features/shell/nav/useUrlInboxState.ts` inverts the usual arrangement.
App state is the source of truth; the query parameter is read **only when
something arrives in it**, and cleared one render later (`:55-88`). An arriving
deep link still lands correctly, because arriving *is* the parameter appearing;
clicking around writes nothing.

Three details make it work, and all three are transferable:

- **Adoption happens during render, not in an effect** (`:63-76`), with a
  previous-value state so it fires once per arrival. Doing it in an effect renders
  the wrong destination once and corrects it on the next commit — a visible
  flash of the wrong page.
- **The inbox is emptied even for an unparseable value** (`:78-88`), because a
  stale bad parameter would make a later valid link to the same key look like a
  no-op. The clear is a `replace`, not a `push`: "the arrival already has its own
  history entry, and this is a cleanup of that entry rather than a new place to
  go back to." That is the technique's redirect-replaces-never-pushes rule
  applied to a cleanup nobody usually counts as a navigation.
- **The obligation it creates is written down**: an in-shell link that changes
  the view must *name* the destination, including when it is the default,
  because an absent parameter is not an arrival and can never become one
  (`:22-29`). A link builder that helpfully omitted the default destination
  produced dead links; the fix went into the URL builder, not the hook.

**A forbidden address is answered by doing nothing.** The parse function rejects
a feature-gated destination outright (`Workspace.tsx:77-96`), and returning null
leaves the current location alone — "so a link to a gated view is inert instead
of bouncing the reader to the default." This is the third answer the technique
now names: for an address arriving into an established session, refusing to move
beats falling back, because falling back destroys a real location to service one
that could not be honoured.

## Writes go through one door, and the door was measured

`app/features/shell/nav/shallow-nav.ts` is the single navigate operation.
`isSameDocumentUrl(url, pathname)` (`:40-50`) is a pure, unit-tested predicate —
"the whole safety of the shallow path rests on it" — deciding whether a target
can be reached by patching the current document's URL or needs a real
navigation; `useShellNavigate` exposes exactly `push` (a move the user expects
Back to undo) and `replace` (view state that should not spam history), and falls
through to the framework router automatically, "so call sites don't have to know
which kind they hold" (`:68-87`).

The reason it exists is a measurement, dated in the file: routing each
destination switch through the framework router cost **~358 KB per switch**,
byte-for-byte identical between two destinations, because the payload was
dominated by a ~412 KB translation catalog the root layout hands down — measured
against the dev server on 2026-08-05, for a page whose server output does not
depend on the parameter at all (`shallow-nav.ts:5-16`). The same header records
a corrected belief: an older comment claimed the framework did not observe
direct history patches; that was true of an earlier prerelease and is not true
of the version in the tree.

Destination-scoped parameters are cleared through one allow-list on every
switch (`clearedTabScopedParams`, `tabs.ts:448-450`, called from
`Workspace.tsx:116-117`) so a destination never inherits the previous one's
selection — and the allow-list lives beside the catalog, not at the call site.

## Where the tree falls short of the standard (kept, not hidden)

- **Back does not step through destinations. This is the deliberate cost.** With
  no URL write per switch there is no history entry per switch, so the back
  gesture leaves the workspace entirely (`useUrlInboxState.ts:31-36`). The
  technique's "section-to-section moves push history" is knowingly abandoned in
  exchange for an address bar that does not churn; the file names the fix it did
  not take (track the destination in history *state* rather than in the query).
  A shell that makes this trade should say so out loud, as this one does — the
  failure mode is making it silently.

  *Re-read 2026-09-23 against the corrected technique.* The shell runs inside
  a browser tab, so the browser owns Back. By the technique's perceived-move
  test, a destination switch that replaces the whole content region reads as a
  page, and Back is expected to undo it. Under the host rule the deviation
  stands; it is not an artifact of a route-shaped standard. The fix the file
  names is also cheaper than it looks at this framework version. In the
  installed `next` 16.3.0, the router's patch of `history.pushState` keeps the
  caller's own state object and adds the router's internal keys to it
  (`copyNextJsInternalHistoryState`,
  `node_modules/next/dist/client/components/app-router.js:84-96`, applied at
  `:252-263`). Its `popstate` handler then traverses to the entry's URL with
  the stored tree (`:284-298`). So an entry carrying `{ tab }` at an unchanged
  URL is expressible without touching the address bar. Two things are
  untested: whether that same-URL traversal costs a server round-trip, and
  whether the inbox's cleanup `replace`, which passes `null` state
  (`useUrlInboxState.ts:87`, `shallow-nav.ts:74-76`), wipes a destination
  recorded on an arrival entry.
- **The current location has no address.** Because the inbox is emptied on
  receipt, the URL after arrival names nothing: a user cannot copy the bar to
  share where they are, only follow a link someone else constructed. The
  technique's addressability contract holds for *entry* and not for *exit*, which
  is half a contract.
- **Restore-last-location does not exist.** A relaunch always lands on the
  default destination (`DEFAULT_TAB`, `tabs.ts:128`); nothing persists the last
  location or the last sub-location per section. The validation machinery a
  restore would need is already there — `resolveTabParam` treats an incoming id
  as untrusted input — but there is nothing to validate.
- **The active value is app state, so a second consumer cannot derive it.** The
  server-rendered deep-link sidebar takes the active destination as a prop
  (`WorkspaceNav({ active })`, `WorkspaceNav.tsx:29`) because it cannot read the client shell's state.
  Two renderers agree today only because the same catalog feeds both; nothing
  fails the build if a caller passes the wrong one.

## Applied 2026-09-23 - the entry-state Back, read-only experiment

The installed router's own restore reducer, run in node with fetches counted: traversal
to a same-URL entry with the same stored tree, and the push patch at an unchanged URL,
made 0 server requests. Negative controls (an entry that differs only in the page search,
and a different route) made 1 each. The push patch keeps the caller's `{tab}` beside the
router's key, and traversal preserves custom state, so the host-rule fix is cheap here.
What caught: the router's history copy keeps only its own two keys, so any replace with
null state erases the recorded tab, and its own soft-navigation replace discards custom
state too. The workspace's history writers: 4 through the shell's navigate helper with
null state, 3 direct null replaces (the arrival inbox's cleanup among them), 6 framework
replaces, and 3 that already carry the entry's state forward. Back presses landing right
over 4 real sequences (n=8): today 1, with 7 leaving the workspace early; entry-state push
as first specified 3, with 5 on the wrong tab; with the helper carrying entry state and
the inbox cleanup writing the adopted tab 7; with the 6 framework replaces moved onto the
helper 8. The history stack is a model whose two router rules are read from the installed
source; no e2e run.
