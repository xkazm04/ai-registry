---
layer: application
type: application
subject: candidate-identity-and-staleness
technique: retired-outranks-stale-status-precedence
stack: react
status: forged
verified_on: 2026-09-28
verified_against: react@19
---

# One status cell, one badge: the saved-profile roster

The skill-profile roster renders a candidate profile's standing as a single
badge derived from a single pure function, and it pairs that badge with the
rebuild affordance the state implies. Re-verified at the tree's HEAD
`c39dc91a6` on 2026-09-28. Since the 2026-08-30 reading, the precedence has held
verbatim and the rebuild path behind it has been rebuilt.

## The precedence function

`app/features/tools/profile/profileRosterView.ts:58` declares the closed
vocabulary:

```ts
export type RosterStatus = "current" | "stale" | "retired";
```

and `rosterStatus` (`:100–107`) is the precedence:

```ts
if (p.archetype && archivedSet.has(p.archetype)) return "retired";
if (stale[p.id]) return "stale";
return "current";
```

The docblock at `:95–98` gives the reason, and it is the technique's argument:
"Retired outranks stale: a profile routed to an archetype that no longer exists
is the more urgent thing to fix, and showing two flags competing in one cell
was what made the old card list hard to scan."

`ProfileRosterRow.tsx:71` restates the invariant at the render site ("One
status cell, one badge. Retired outranks stale"), and the JSX at `:75–95` is a
strict `retired ? … : staleInfo ? … : current` chain. The final branch renders a
plain "current" status span, so the lower state cannot leak into the summary
position.

The module is deliberately React-free and intl-free, so the ordering is
unit-tested directly (`profileRosterView.test.ts`) rather than only through a
rendered table. That is the same anti-drift argument the shared staleness
predicate makes.

## Severity order and present-only facets

`rosterFacets` (`:112`) implements both interface rules from the technique.
Archetype and family facets are collated alphabetically for the reader's
locale; status is not. `:135–139`:

```ts
const present = new Set(profiles.map((p) => rosterStatus(p, stale, archivedSet)));
const statuses = (["retired", "stale", "current"] as const)
  .filter((s) => present.has(s))
  .map((value) => ({ value, label: statusLabel(value) }));
```

with the comment: "Status is a closed vocabulary, so it keeps its severity
order (worst first) rather than being alphabetized — but still lists only what
is present."

`ProfileRosterTable.tsx:121` declines to make Status a *sortable* column:
"Status has no meaningful order (retired vs. newer-CV is not a ranking), so it
filters but does not sort." That is the right call, because a precedence is a
display ranking, not a scalar to sort on.

`profileRosterView.ts:172–174` sorts a null completeness as `-1`: "an unknown
completeness is not a 0% one, but it is the row that needs attention". An
unmeasured value gets its own position rather than a measured-looking zero.

## What "stale" means here, and the remedy attached to it

This roster's staleness is the *superseded* cause, not the requirement-edit
cause. `ProfileRosterTypes.ts:22–23`:

```ts
export type StaleEntry = { newerSlug: string; newerAnalyzedAt: string; edited?: boolean; updatedAt?: string | null };
export type StaleMap = Record<string, StaleEntry>;
```

An entry is present only for profiles with source lineage and a newer analysis
of the same CV. `edited` and `updatedAt` are new since 2026-08-30: "an entry
that lacks either is treated as NOT provably unedited, so the batch refresh
routes it to review instead of writing it" (`:17–21`). The badge's tooltip
carries the newer analysis's date (`ProfileRosterRow.tsx:88`), and the row's
action is a Rebuild button wired to `staleInfo.newerSlug` (`:124–132`). The
badge names the state and hands over the exact remedy.

## The rebuild is a three-way field merge

The 2026-08-30 reading recorded a keep-or-overwrite dialog with a boolean
divergence flag. The tree now implements the technique's preferred rule,
*preserve*, in `app/features/tools/profile/profileRebuildMerge.ts`:

- `planRebuild` (`:53`) compares CURRENT (the profile, with edits), SOURCE (the
  analysis it was built from) and NEWER, per field. An untouched field takes the
  newer CV. A field the recruiter edited and the newer CV did not change is kept
  as `preserved`, without a question. A field both edited and changed
  differently is kept and listed as `contested`, "the only case worth a
  question". When the source analysis is gone, nothing can be attributed, so
  every differing field is contested and the current value kept.
- `rebuildDialogModel` (`:108–110`) returns `null` when nothing is contested,
  so there is no ceremony where nothing a person cared about is at risk. Otherwise
  it offers `merge | keep | replace` with **merge as the default**. That is the
  "rebuild and re-apply my edits" option the standard asked for.
- The dialog names the contested fields by their editor labels
  (`ProfileTabRebuildWarnModal.tsx:36–42`, with a dated hint at `:85–86`). That is
  the "name the loss concretely" rule.
- `openRebuild` (`useProfileTabDeepLinks.ts:111–133`) opens the editor *on* the
  merge, with the rebuild pending and an Undo to the pre-rebuild state
  (`rebuildEditorState`, `profileRebuildMerge.ts:100`). Nothing is written until
  the recruiter saves.

## Deviations

**Unknown divergence is read as "unedited" on the single-profile path.**
Divergence is `updated_at > lineage_stamped_at` (profiles DDL,
`app/_lib/db/core.ts:559–566`), and the schema says so outright: "NULL on legacy
rows ⇒ divergence unprovable ⇒ no warning." `openRebuild` then takes the
`!div?.diverged` branch and hydrates straight from the newer analysis
(`useProfileTabDeepLinks.ts:117–120`), with no merge. The batch refresh treats
the same unknown as *not provably unedited* and routes it to review. Two write
paths give two answers to one unknown. The technique's retrofit rule treats
every pre-existing record as possibly-edited, so the single path should plan the
merge whenever divergence cannot be proven false.

**Reversal ends at save.** The pending Undo covers the editor session. There is
still no persisted snapshot or revision of the profile, so a rebuild that was
saved and later found to have reintroduced a mis-parsed title cannot be
reverted from the record. The standard asks for a stated reversal window.

**"Retired" here means the archetype was archived, not the record.** The
precedence is correct and the class split holds, but the terminal class is
narrower than the domain needs. Withdrawn, erased and anonymised records are
not part of this vocabulary, and anonymisation in particular must sit above
everything as a terminal *identity* state. On the saved analysis report, the
stale chip and the label-collision chip still render independently of each
other, with no shared precedence.
