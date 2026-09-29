---
subject: file-browsing
domain: software-engineering
last_touched: 2026-09-29
dry_streak: 0
---

# file-browsing

First touch: 2026-09-29, a dispatched `/deepen` run (run id dp-fb-0929), ranked "never swept
by the librarian". Origin already carried six rule corrections (d31d6ed8) and the
2026-09-20 application re-verifications, so the sweep read the subject as recently
worked and looked for what it had never covered.

## State

6 techniques, 5 applications (node, react x3, rust). No application changed this
pass; none was re-verified against a tree, so no `verified_on` moved.

Landed (technique bodies only):

- `thumbnails-and-previews` - new section on entries whose bytes are not local:
  listing is free, the first content read is a download, so a thumbnail worker
  starts one rung lower for online-only entries. Source: Microsoft Learn, cloud
  files API (placeholders hydrate on ordinary file access; users can block an
  app from background hydration; markers are hidden from apps that do not opt in),
  fetched 2026-09-29. Convergent with the training-data reading.
- `listing-and-refresh` - watcher bullet sharpened: queue overflow loses events,
  remote writers raise no local event, non-recursive watching costs one watch per
  folder against a per-user limit. Source: inotify(7), fetched 2026-09-29.

Verified and left alone: the per-entry error policy, the two zero cases, the
identity-keyed selection claims, the bulk partial-failure contract.

## Leads (return conditions)

- Case-insensitive stores and Unicode normalisation in name conflicts and case-only
  renames: not researched this pass. Return when a project shows a rename or
  keep-both seam.
- Recursive-watch behaviour per platform (FSEvents, ReadDirectoryChangesW) is not
  cited; only inotify was read.

## Impact

Not computed: the fleet map was not regenerated this pass (registry-map writes into all fleet checkouts; run from a clean origin worktree by the next librarian pass). No new technique and no flipped rule, so no applied.md row is owed.
