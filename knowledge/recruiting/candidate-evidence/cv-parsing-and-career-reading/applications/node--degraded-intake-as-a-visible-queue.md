---
layer: application
type: application
subject: cv-parsing-and-career-reading
technique: degraded-intake-as-a-visible-queue
stack: node
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: better
---

# `intake_degraded`, the proof-gated merge, and the held sweep (TypeScript app + SQLite)

Re-read at `bc82cb703` (2026-09-28). Since the first verification the re-apply merge moved
out of the route into one filing core shared by every door, and it gained the
authentication split the technique now carries.

## The flag is schema, with its reason beside it

`app/_lib/db/core.ts:592-598` puts the state on the pipeline entry itself and the comment
states the whole technique:

> Intake degradation flag: set when an inbound application could not be
> normalized into a matchable profile and was demoted to a label-only stub.
> Turns a silent, server-log-only demotion into a visible recruiter signal
> (the entry needs manual profile capture). The reason carries the bounded
> failure detail so the recruiter knows what to recover.

```
intake_degraded INTEGER NOT NULL DEFAULT 0,
intake_degraded_reason TEXT,
```

Both columns are also in the migration list (`core.ts:1768-1769`), so pre-existing rows
read as not-degraded rather than null.

## The flag is paired with an event, and the funnel still counts the application

`app/_lib/db/pipeline.ts:1696` emits `kind: intakeDegraded ? "intake_degraded" : "added"`
at entry creation — one event either way, so a degraded intake is a *timeline* fact and
not only a column. The analytics layer deliberately re-unifies them:
`analytics-momentum.ts:76` counts `added` and `intake_degraded` alike into the `added`
bucket, and the cohort mapping that used to be copied twice in the analytics module is
now one function (`analytics-cohort.ts:69-72`). A degraded application is still an
application received — the metric cannot argue against fixing the channel.

The recruiter surface carries it explicitly: `pipelineEventCatalog.ts:81` registers the
kind, `:221` gives it an `AlertTriangle` at `text-red-600`, and `:342-343` renders the
localized detail when a reason is present. The read model projects
`intakeDegraded` / `intakeDegradedReason` onto every entry (`db/pipeline.ts:497-498`, and
a second copy of the row mapper at `db/pipeline-core.ts:85-86`).

## Degraded holds the entry out of the automated sweep

`app/_lib/automation-pass.ts:297` selects entries for unattended scoring with
`(e) => e.matchScore == null && !e.intakeDegraded && …` — a stub the pipeline could not
read is never scored on its fragment by the sweep, and unattended rejection is retired
outright (`:425`, "AUTO1 RETIRED (UAT M6 / GDPR Art. 22)"). The record that asserts
nothing was read also keeps the early-career shield: `apply.ts:73`
`FALLBACK_ARCHETYPE = "unknown"`, pinned by `apply-fallback-archetype.test.ts:52`.

## The merge: finding is not authorising

`app/_lib/application-filing.ts:18-33` states the rule every door now files through:

> PROOF — what a match may do is the door's stated proof, not scattered code:
> - "token": the applicant proved possession of the entry with the capability
>   token we emailed them (the ?lead= enrichment walk). The PROVEN MERGE:
>   fill-only contact and GitHub handle, and — when the repeat carries a CV or
>   the entry is a degraded stub — a profile REBUILD into the entry's own
>   profile id. A failed rebuild touches nothing. The only proof that rebuilds.
> - "channel": … A repeat backfills a missing contact (fill-only), refreshes
>   consent and records the repeat. It never rebuilds or re-points the stored profile.
> - "none": the match came from a typed name/email, which is not a secret.
>   Nothing on the matched entry moves

The code is that sentence: `:221` returns at `proof === "none"` with `merged: false`;
`:227` backfills only `if (email && !existing.contact)`; and `:239`
`if (proof === "token" && (answers.cvText || existing.intakeDegraded))` is the one path
that rebuilds. The route keeps its own statement of identity by strength
(`app/api/apply/[id]/route.ts:341-345`: the lead token, "else the EMAIL when given (the
stronger identity), else the provided name"), and the filing key is now a domain-separated
hash (`app/_lib/applicant-key.ts:5`: "It replaced applyDedupeKey, which put the email IN
CLEAR into the entry's primary key"). An invalid lead token still "degrades silently to
the email/name identity fallback below, never an error" (`route.ts:324`).

`application-filing.test.ts` pins the split: `:270` "proof 'none': a name+email match
moves nothing on the matched entry", `:317` "proof 'token': the proven merge backfills,
REBUILDS the profile over the stub", `:373` "proof 'channel': … never builds". 13/13 pass
at `bc82cb703`.

## A/B (simulation, 2026-09-29)

A = the technique before this pass (merge on the strongest identifier present). B = the
split (the identifier finds; only proof rebuilds). Three real paths from the tests above.
(1) A stranger types the applicant's name and email with a different CV: A rebuilds the
applicant's profile from the stranger's file; B moves nothing (`:270`). (2) The applicant
returns through the emailed link with a CV onto a degraded stub: both rebuild (`:317`).
(3) A channel repeat: A would rebuild on the matched address; B backfills and records
(`:373`). B blocks an unauthenticated overwrite on 1 of 3 paths and agrees on the other
two. Falsifier: a path where the proof requirement strands a legitimate owner — and the
tree has one (below), which is why the technique now names the cost.

## Where the repo differs from the standard

- **The reason vocabulary is half closed.** Channel stubs carry codes
  (`ats/ingest.ts:175` `codedReasonDetail("atsImported", …)`; the lead stub reason is
  coded, `lead-intake.ts:161`; both render through `pipelineEventCatalog.ts:377`), but
  extraction and build failures are still prose
  (`applicant-profile.ts:87`, "profile normalization exited …"). The cohort a parser fix
  should reprocess — "the parser failed" — is exactly the one that cannot be selected.
- **No extractor-version stamp and no reprocessing pass.** Engine kind and provider are now
  recorded per analysis, and a prompt version keys the cache, but neither names the parser
  that produced a record. A new instance of the gap: the job-seeker CV table reuses a
  cached draft by the content hash of the extracted text, with no reader version in the key,
  so a future draft-reader fix is hidden behind cached drafts for unchanged text.
- **A degraded stub with no address cannot recover itself.** Under the proof gate a
  typed repeat moves nothing (`application-filing.ts:221`), and the recovery link goes to
  the address on file — which a stub filed without one does not have. The stub needs a
  recruiter path; the queue item is it.
