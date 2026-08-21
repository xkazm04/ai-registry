---
layer: application
type: application
subject: cv-parsing-and-career-reading
technique: degraded-intake-as-a-visible-queue
stack: node
---

# `intake_degraded` and the re-apply merge (TypeScript app + SQLite)

## The flag is schema, with its reason beside it

`app/_lib/db/core.ts:376-383` puts the state on the pipeline entry itself and the comment
states the whole technique:

> Intake degradation flag: set when an inbound application could not be normalized into a
> matchable profile and was demoted to a **label-only stub**. Turns a silent,
> server-log-only demotion into a **visible recruiter signal** (the entry needs manual
> profile capture). The reason carries the bounded failure detail so the recruiter knows
> what to recover.

```
intake_degraded INTEGER NOT NULL DEFAULT 0,
intake_degraded_reason TEXT,
```

Both columns are also in the migration list (`core.ts:859-860`), so pre-existing rows
read as not-degraded rather than null.

## The flag is paired with an event, and the funnel still counts the application

`app/_lib/db/pipeline.ts:1078` emits `kind: intakeDegraded ? "intake_degraded" : "added"`
at entry creation — one event either way, so a degraded intake is a *timeline* fact and
not only a column. The analytics layer then deliberately re-unifies them:
`analytics-momentum.ts:73` counts `added` and `intake_degraded` alike into the `added`
bucket ("every entry creation records one"), and `db/analytics.ts:483` and `:840` do the
same in the funnel mapping. A degraded application is still an application received —
the metric cannot argue against fixing the channel.

The recruiter surface carries it explicitly: `pipelineEventCatalog.ts:79` registers the
kind, `:205` gives it an `AlertTriangle` at `text-red-600`, and `:296-297` renders the
localized detail when a reason is present. `db/pipeline.ts:322-323` projects
`intakeDegraded` / `intakeDegradedReason` onto the read model, so every list view can
show the task.

## Merge-don't-drop on re-application

`app/api/apply/[id]/route.ts:307-317` states the rule, and the reason for it:

> **merge, don't drop.** Re-applying is the only self-service "update my info" path an
> applicant has, so a detected repeat folds its fresh signals onto the original entry
> before acknowledging:
> - a valid email backfills a contactless entry (the applicant becoming reachable is the
>   point of re-applying for most);
> - a CV-carrying repeat (or any repeat **on a degraded stub**) rebuilds the profile — in
>   place for a healthy original, a fresh save + re-point for the stub. **A FAILED
>   rebuild touches nothing**: a junk repeat can never degrade a healthy entry, and a stub
>   just stays a stub.

Three details make it the fill-only merge the standard asks for:

- `route.ts:324` guards the backfill with `if (email && !existing.contact)` — populated
  fields are never overwritten by a thinner resubmission; the handle backfill at `:330-332`
  is described in the same terms ("one already on file is kept (fill-only, see
  `mergeReapplication`)").
- `route.ts:279-306` resolves identity by strength: a valid `lead` token resolves directly
  to the entry and *is* the identity; otherwise `findApplicationByApplicant` keys on the
  email when given — "the stronger identity", since `applyDedupeKey`
  (`app/_lib/apply-intake.ts:106`) notes that "two same-named applicants with different
  addresses are different people and must get DISTINCT keys, which a name-only key
  collapsed onto one entry." A nameless applicant returns `""`, which the caller treats as
  *don't dedup* — a duplicate row beats merging two strangers.
- `route.ts:272-281` degrades an invalid or stale lead token "silently to the email/name
  identity fallback below, never an error" — the candidate's submission does not fail on
  the system's own bookkeeping.

The intake answers are assembled once (`route.ts:284-298`, `intakeAnswers`) precisely so
"the re-apply rebuild and the first-apply build are guaranteed to feed
`buildApplicantProfile` the identical answer set" — the rebuild path cannot quietly become
a lossier version of the first-apply path.

`route.ts:439` closes the loop back to the queue: `createPipelineEntry` "already logs an
`intake_degraded` event for the stub", so the recruiter-visible task exists from the
moment the demotion happens.

## Where the repo differs from the standard

- **No closed reason vocabulary.** `intake_degraded_reason` is free text ("bounded failure
  detail"), so the reason can be shown to a recruiter but cannot be selected on for a
  reprocessing cohort or aggregated by failure class. The standard's reason-code
  requirement stands.
- **No extractor-version stamp and no reprocessing pass.** Nothing marks which extraction
  build produced a record, so the "re-run the cohort the old parser degraded" obligation
  has no cohort to select. The nullable-vs-empty distinction on
  `CandidateProfile.credentials` (`pipeline/jobfit/models.py:48-52`) is the only
  version-awareness present, and it is per-field rather than per-record.
- **The degraded state does not shield the entry from automated adverse handling.** The
  flag is advisory to the recruiter; no automation path consults it.
