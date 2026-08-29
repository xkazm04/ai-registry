---
layer: application
type: application
subject: entity-lifecycle
technique: archive-restore-semantics
stack: node
verified_on: 2026-08-29
verified_against: node@24
---

# Archiving a job description without breaking its public links

The hiring app (`kp`, Next.js 16 / Node 24, sqlite) added archive to a
library that was previously append-only — the route comment records the
starting defect the technique predicts: "the library was fully
append-only: no update, delete or archive path existed anywhere … A
typo'd JD was permanent; the only 'fix' was a duplicate under a new slug,
forking the analysis history keyed on jd_slug"
(`app/api/jds/[slug]/route.ts:54-61`). Identity-splitting duplication as
the workaround for a missing lifecycle is exactly the silt the reversible
promise exists to drain.

## The encoding and the door

The stronger default from the technique, verbatim: a dedicated
`archived_at` timestamp added by migration (`app/_lib/db/core.ts:1393`),
absent = live. One write door, `setJdArchived`
(`app/_lib/db/jobs.ts:300-306`), sets it to now-ISO or `NULL`; the same
PATCH endpoint handles archive and unarchive as `{ archived: bool }`
(`route.ts:80-83`), gated recruiter-only at the handler because "the JD
detail page is public/shareable, so edit + archive must be recruiter-only
at the handler — not just hidden in the UI" (`route.ts:62-64`) — the
restore door carries the same privilege as the archive door.

## The archived-behavior matrix, decided per behavior

- **Visibility:** list and picker queries filter `archived_at IS NULL`
  (`jobs.ts:157`, the checklist derivation at `:140`, workspace search at
  `app/_lib/db/analytics.ts:1072`).
- **Referential duties:** `loadJd` deliberately does *not* filter —
  "Archived rows still load: the public page renders them with a banner
  so existing analysis/report links never 404" (`jobs.ts:181-183`); the
  page shows an archived banner (`app/jds/[slug]/page.tsx:216-221`) and
  keeps the actions surface offering unarchive (`:223`). Inbound edges
  degrade to a clearly-archived surface, never to a not-found.
- **A behavior most matrices forget — the crawler:** an archived JD's
  metadata switches to `robots: { index: false, follow: true }` with the
  comment "A retired role shouldn't keep ranking / drawing applicants;
  keep links followable" (`page.tsx:88`). "Stops acting" enumerated
  against search engines, not only against the app's own lists.
- **Resource claims:** the slug stays held (the row keeps its identity
  and its URL), so restore can never collide with a name claimed while it
  slept — the collision case is traded away by never releasing the name.

## Where the technique's decay warning is already true

The archived predicate is **not centralized**: `archived_at IS NULL` is
hand-written per query (`jobs.ts:140`, `:157`, `analytics.ts:1072`), the
exact per-caller re-implementation the technique flags for review — the
next list surface that forgets the clause will show archived JDs in a
picker. Resolved 2026-08-29 (kp commit `b8467ff5`): the predicate is now
the single exported `JD_ACTIVE_SQL` constant (`jobs.ts:63`) interpolated
by every list/search query — one authority instead of a hand-written
clause per site. Restore is also a bare flag-clear: no validation pass against the
current world (safe today only because the slug is never released and the
JD references nothing deletable).
