---
layer: application
type: application
subject: app-shell
technique: badge-and-attention
stack: next
status: forged
verified_on: 2026-11-16
verified_against: next@16
---

# badgeKey + badgeParams + showAttention — the badge that links to its own cohort, and the one that leaked

Read in a hiring-studio tree (Next.js 16.3.0 / React 19) at commit
`40363b7`, 2026-08-30; citations resolved against that tree on that date.

## The predicate is declared beside the destination, not at the badge

`app/features/shell/tabs.ts` gives a nav entry two optional fields: `badgeKey`
(`tabs.ts:112`) names which of six attention buckets it renders — the closed
`AttentionKey` union at `tabs.ts:89` — and `badgeParams` (`tabs.ts:118`) names
the query that reproduces the counted cohort. Five of ~21 entries declare a
`badgeKey` (`tabs.ts:164-177`); the rest are structurally incapable of showing a
number. That is the technique's admission discipline expressed as a type rather
than as a review habit: a section does not get a badge by adding markup, it gets
one by claiming a bucket that the count source already computes.

The predicates themselves are named where the leak note enumerates them
(`WorkspaceNav.tsx:33-38`): entries awaiting a human decision, entries past
their stage SLA, confirmed future interviews, unpublished draft roles, new
inbound arrivals. All five are **inventory** badges in the technique's
taxonomy — live queries over entities in a state — which is why nothing in this
tree stores a seen-mark and nothing clears on view. The counts fall as the work
is handled; that is the whole clearing rule, and it is the correct one for
actionable items.

## Derived, and the recomputation is named three ways

`app/features/shell/useAttention.ts` is the derivation the technique asks for:
no handler anywhere increments a badge. It re-runs on mount, on the shell's
live-refresh bus (any mutating fetch in the document), and on a 60-second poll
gated on document visibility (`useAttention.ts:16-42`). The poll is not
belt-and-braces — the header states its cause: a server-side automation
heartbeat mutates entries with no client signal, so an idle-but-open studio's
badges would lie within minutes without it. Three recomputation triggers for
three ways the predicate can change underneath the display, written down beside
the cache. Failure degrades to the last known counts and never surfaces an
error (`:29-32`): "a badge is a hint, never worth an error surface."

## The badge is its own second click target

`badgeParams` is the technique's routing promise made mechanical. When an entry
carries one and its count is non-zero, `sliceHrefFor` composes a URL that opens
the destination *pre-filtered to the counted cohort*
(`NavSectionRail.tsx:99-100`, via `buildUrl` + `clearedTabScopedParams`), and
the pill renders as a **sibling** of the row rather than inside it, overlaid on
a reserved gutter — because an interactive element may not nest inside another
(`NavPanelItem.tsx:98-119`). So the row goes to the section and the number goes
to the exact items it counted. The technique says "the badged section's landing
surface makes the badged items findable immediately"; this is the sharper
version — the badge does not merely point at a place that ought to surface the
cause, it addresses the cause.

Both targets carry accessible names built from the count itself
(`attentionLabel` / `attentionGoLabel`, `NavSectionRail.tsx:94-95`), so the
number is not a bare integer to a screen reader.

The mechanism is one entry deep, though: exactly one of the five badged entries
declares `badgeParams` (`tabs.ts:164`). The other four badges are ordinary rows —
the promise binds, but only where someone wrote the cohort query down.

## The disclosure incident — the source of the technique's seventh prohibition

The same nav renderer serves three hosts, and one of them —
`/jds/[slug]`, a shared role link — is on the public route allow-list. A
cookieless caller resolves to the default workspace, so an anonymous candidate
reading a job ad was served the recruiting team's real queue depths as bare
integers in the sidebar. `curl` with no cookies returned them. The fix, and its
reasoning, are in `WorkspaceNav.tsx:29-43`: the nav resolves `isOperator()`
**itself** rather than taking a prop, "so a page that forgot to pass the flag
would silently re-open the leak", and the counts are only computed at all for an
operator (`:48-57`).

The second half of the fix is the transferable one. `showAttention` is enforced
again at the row (`NavPanelItem.tsx:30-38,52-53`), not only at the source, "so a
future caller that hands over a populated `attention` map for a non-operator
still renders no badge" — and the suppression is total: no inline pill, no slice
pill, and no `pr-9` gutter reserved for one, because "a row that cannot show a
count must not look like it lost one." Two independent gates that compose and
neither of which depends on the other having landed.

## Where the tree falls short of the standard (kept, not hidden)

- **There is no severity vocabulary.** The technique wants a small closed scale —
  count, alert, pulse — owned at the shell. This shell has exactly one grade: a
  coral count pill (`NavPanelItem.tsx:66-73`). Nothing can say *failed and
  needs a decision* differently from *four things are waiting*; the decisions
  bucket carries both readings in one integer. That is a scale rationed to the
  point of losing information rather than a scale kept meaningful.
- **No parent aggregation, so a badged item can be invisible.** Badges render
  only on level-two panel rows. The level-one rail button shows no roll-up
  (`NavSectionRail.tsx:132-161`), and the panel shows only the previewed
  group — so a count in a section the user is not currently previewing is not on
  screen at all. The technique's "a collapsed or parent entry may sum its
  children's badges" is optional; here its absence means the ambient attention
  channel is only ambient for one section at a time.
- **The counts are snapshot-only on the deep-link hosts.** The server-rendered
  sidebar computes them once at render (`WorkspaceNav.tsx:45-57`) with no
  revalidation; only the interactive shell owns the live poll. The header says
  so ("a detail page is a snapshot"), which is honest, but a long-open detail
  page shows a number whose recomputation was named and then not run.
- **Steady state is not measured.** The technique asks that a healthy user on a
  healthy day sees near-zero signals. Five of twenty-one entries can light up
  and nothing in the tree checks how often they all do at once; the budget rule
  is unenforced here.

## 2026-11-16 re-read, at `808eb83c` (Next.js 16.4.5), public clone, read-only

Re-checked against the same tree's main branch at `808eb83c` (2026-11-10), 4,349
commits after `40363b7`. The citations above are the 08-30 anchors; the current
ones are given here.

**Still true.** `AttentionKey` (`tabs.ts:113`) now has six buckets, and the sixth,
`companion`, is declared as a bucket that no tab may render (`tabs.ts:105-112`).
Its count belongs to the dock's own status line. The payload stays one shape.
Five entries declare a `badgeKey` (`tabs.ts:218-221,234`), and only Overview declares
`badgeParams` (`tabs.ts:218`). The field's comment now states the admission rule:
declare it only when the counted cohort is not what the bare tab already shows
(`tabs.ts:137-142`). The slice href is composed at `NavSectionRail.tsx:111-112` and the
pill is still a sibling of the row (`NavPanelItem.tsx:134-177`). The viewer gate in
`WorkspaceNav.tsx:31-60` is unchanged in substance. Total suppression, including the
gutter, is at `NavPanelItem.tsx:64-68`.

**Changed: the poll now backs off.** `useAttention.ts` no longer re-arms at a flat 60 s.
`attentionPoll.ts` (from `29e81de6` and `a004d488`) waits 60 s while healthy. After
consecutive failures it waits 60 s, then 2, 4 and 8 minutes, then 10 minutes for ever.
It reads immediately when the tab becomes visible again. A 401 goes to the
session-lapse store (`useAttention.ts:47-53`). A hidden tab skips its read without
counting a failure. Failures still keep the previous counts silently. That is the
shortfall recorded under the shell-hosted-services application.

**Correction: the row gate is dormant.** The section above says the viewer gate is
"enforced again at the row" and that the two gates compose. The row parameter exists
(`NavPanelItem.tsx:35-43`, `NavSectionRail.tsx:66-73`), but it defaults to `true`, and
no caller passes it, at `40363b7` or at `808eb83c`. A `git grep showAttention` outside
the two renderer files returns nothing. Both hosts (`WorkspaceNav.tsx:85-89` and
`WorkspaceNavDrawer.tsx:130-133`) pass only `attention`. The leak is closed by one gate,
the source: counts are computed only for an operator (`WorkspaceNav.tsx:53-60`).
A future host that hands over a populated map is protected only if it also remembers
the flag. That is the forgotten-flag failure the source gate's own comment names. The
technique now says a row gate must default closed or resolve the viewer itself.

**New: a spoken roll-call of every badge** (`dda8d8e3`, 2026-09-22). A polite
`role="status"` region (`NavSectionRail.tsx:144-149,208`) speaks every non-zero badge
as "<label>: N need attention", joined in one string.
- When every badge is zero, it speaks "0 need attention".
- In the interactive shell, the counts arrive after mount, so the full roll-call is
  spoken on every load of the workspace.
- Any single change re-speaks the whole list, because the region is atomic by role.
- An unchanged poll is silent, because React leaves equal text alone.
- On the server-rendered hosts, the text is present at load and is not announced.

This is the source of the technique's spoken-channel rule. The badges' own accessible
names already carried the counts (`NavPanelItem.tsx:80-87,156-175`).

**Still short of the standard:** there is still one grade and no parent roll-up on
the level-one rail (`NavSectionRail.tsx:175-204`). The deep-link hosts are still
snapshots. Steady state is still unmeasured.
