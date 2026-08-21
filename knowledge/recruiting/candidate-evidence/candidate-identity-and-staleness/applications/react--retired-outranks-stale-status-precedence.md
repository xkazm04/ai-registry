---
layer: application
type: application
subject: candidate-identity-and-staleness
technique: retired-outranks-stale-status-precedence
stack: react
status: forged
verified_on: 2026-08-20
---

# One status cell, one badge: the saved-profile roster

The skill-profile roster renders a candidate profile's standing as a single
badge derived from a single pure function, and it pairs that badge with the
rebuild affordance the state implies.

## The precedence function

`app/features/tools/profile/profileRosterView.ts:15` declares the closed
vocabulary:

```ts
export type RosterStatus = "current" | "stale" | "retired";
```

and `rosterStatus` (`:43`) is the precedence:

```ts
if (p.archetype && archivedSet.has(p.archetype)) return "retired";
if (stale[p.id]) return "stale";
return "current";
```

The docblock at `:38–42` gives the reason, and it is the technique's argument:
"Retired outranks stale: a profile routed to an archetype that no longer exists
is the more urgent thing to fix, and showing two flags competing in one cell
was what made the old card list hard to scan."

`ProfileRosterRow.tsx:66` restates the invariant at the render site — "One
status cell, one badge. Retired outranks stale" — and the JSX at `:70–86` is a
strict `retired ? … : staleInfo ? … : null` chain, so the lower state cannot
leak into the summary position.

The module is deliberately React-free and intl-free so the ordering is
unit-tested directly (`profileRosterView.test.ts`) rather than only through a
rendered table — the same anti-drift argument the shared staleness predicate
makes.

## Severity order and present-only facets

`rosterFacets` (`:56`) implements both interface rules from the technique.
Archetype and family facets are collated alphabetically for the reader's
locale; status is not. `:76–81`:

```ts
const present = new Set(profiles.map((p) => rosterStatus(p, stale, archivedSet)));
const statuses = (["retired", "stale", "current"] as const)
  .filter((s) => present.has(s))
  .map((value) => ({ value, label: statusLabel(value) }));
```

with the comment: "Status is a closed vocabulary, so it keeps its severity
order (worst first) rather than being alphabetized — but still lists only what
is present." The surrounding docblock states the second rule outright: facets
offer "only values actually PRESENT in the roster, so the menus can never offer
a filter that yields zero rows."

`ProfileRosterTable.tsx:121` completes the picture by declining to make Status
a *sortable* column — "Status has no meaningful order (retired vs. newer-CV is
not a…)" — which is the right call: a precedence is a display ranking, not a
scalar to sort on.

Note also `:113–116` of `profileRosterView.ts`: a null completeness sorts as
`-1`, "an unknown completeness is not a 0% one, but it is the row that needs
attention" — an unmeasured value given its own position rather than being
coerced into a measured-looking zero.

## What "stale" means here, and the remedy attached to it

This roster's staleness is the *superseded* cause, not the requirement-edit
cause. `ProfileRosterTypes.ts:13–16`:

```ts
export type StaleMap = Record<string, { newerSlug: string; newerAnalyzedAt: string }>;
```

— "profile id → the newer same-CV analysis that makes it stale... Present ONLY
for profiles with source lineage AND a newer analysis." The badge's tooltip
carries the newer analysis's date (`ProfileRosterRow.tsx:83`), and the row's
action is a Rebuild button wired to `staleInfo.newerSlug` (`:119–126`) — the
badge names the state and hands over the exact remedy, rather than leaving the
recruiter to find it.

## The rebuild gate

`useProfileTabDeepLinks.ts:66–76` implements the "warn only when something will
actually be lost" rule. `openRebuild` first fetches the profile's `divergence`
(`{ diverged, editedAt }`) and only raises the warning when it diverged;
otherwise it hydrates from the newer analysis with no ceremony. The comment
states why the path is special: "unlike a first build, this re-points an
EXISTING profile — which may have been hand-edited since it was built."

`ProfileTabRebuildWarnModal.tsx` presents two labelled choices — `onKeep`
("Keep the recruiter's hand-edits: open the existing profile as a plain edit")
and `onProceed` ("Overwrite with the newer analysis") — and the body text
interpolates the edit date, with a dateless fallback string when `editedAt` is
null.

## Deviations

**The third option is missing.** The modal offers keep or overwrite; the
standard also asks for *rebuild and re-apply my edits*, which is usually the
one the recruiter wants. Forcing a binary choice between a fresh reading and
their own corrections means one of the two is discarded every time.

**Divergence is a boolean, not a field set.** `RebuildWarn`
(`ProfileTabTypes.ts:24`) carries `{ slug, profileId, editedAt }` — enough to
say *when* someone edited, not *what* will be lost. The standard asks the
warning to name the fields at risk; a count and a list are what turn a dialogue
from reflexively-dismissed into read.

**No reversal path.** There is no snapshot before the overwrite, so a recruiter
who picks Proceed and then discovers the rebuild reintroduced a mis-parsed
title has no undo. The standard requires a stated reversal window discoverable
from the record.

**"Retired" here means the archetype was archived, not the record.** The
precedence is correct and the class split holds, but the terminal class is
narrower than the domain needs — withdrawn, erased and anonymised records are
not part of this vocabulary, and anonymisation in particular must sit above
everything as a terminal *identity* state.
