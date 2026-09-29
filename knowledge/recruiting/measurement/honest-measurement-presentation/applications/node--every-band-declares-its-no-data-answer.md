---
layer: application
type: application
subject: honest-measurement-presentation
technique: every-band-declares-its-no-data-answer
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The null placement, stated in the query that feeds a cap

kp's analytics read is bounded. `pipelineAnalytics()` in `app/_lib/db/analytics.ts`
reads at most a cap of `pipeline_entries` rows, newest first, and says when the
cap bit (`truncated`), because a funnel computed over the first N of M rows is a
different number from the one the page claims. `created_at` is nullable in the
schema (`app/_lib/db/core.ts:589`), and an undated row has no cohort to belong
to. The comment on the read put those rows last on purpose: they "are the first
thing a bounded read should drop". Citations are at kp `24006b85e`.

## Where the position came from

The windowed reads filter `created_at >= ?`, which already excludes an undated
row. The all-time read has no such filter, and its placement of undated rows
came from the engine. SQLite ranks NULL below every value, so
`ORDER BY created_at DESC` put them last. That is the technique's rule 6 held
by accident.

kp documents a Postgres backend as its migration path
(`docs/architecture/postgres-backend.md`), with a portability audit
(`app/_lib/db/pg-portability.ts`) listing the SQLite-isms a port must touch.
PostgreSQL's documentation says the opposite of SQLite: "By default, null values
sort as if larger than any non-null value; that is, NULLS FIRST is the default
for DESC order, and NULLS LAST otherwise." On the port, the undated rows would
have filled the cap before any dated one, and the audit had no rule to flag it.

## The fix, and what pins it

kp `24006b85e` writes `ORDER BY created_at DESC NULLS LAST` on the all-time
read (`analytics.ts:368`) and rewrites the comment to say the placement is
stated, not inherited. On SQLite 3.53.4 the two orderings return the same rows;
a probe on an in-memory table confirmed it before the change.

The pin is a test in `app/_lib/db/analytics-cohort-cap.test.ts`. It seeds three
dated entries and three undated ones on one role and cuts the all-time read at
three. With `NULLS LAST` the cut holds only dated rows, and the test passes.
With the ordering Postgres uses by default for DESC, emulated as
`NULLS FIRST` in SQLite, an undated row takes a place inside the cap and the
test fails. The test pins the placement, not the engine.

## What is still inherited

The portability audit has no rule for implicit null ordering, and the data
layer holds 191 `ORDER BY` clauses, 121 of them descending. Most sort
non-null keys and are safe on either engine. Which ones sort a nullable key is
a question the audit cannot answer from a regex. A port has to ask it of each
one.
