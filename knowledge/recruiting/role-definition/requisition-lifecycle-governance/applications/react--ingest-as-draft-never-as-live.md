---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: ingest-as-draft-never-as-live
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# Pasting a third-party advertisement: `JobsIngestAdPanel` + `POST /api/jobs/ingest`

Every line citation below was re-resolved on 2026-09-29 against kp at `006bf7a0a`;
the first version (2026-08-20) cited lines that have moved. A recruiter pastes an
advertisement — one, or a whole requisition list — and a language model parses it
into a structured, matchable role. The panel
(`app/features/library/jobs/JobsIngestAdPanel.tsx` and its extracted logic
`jobsIngestAdPanelLogic.ts`) is the client half; `app/api/jobs/ingest/route.ts` is
the server half, and the landing state is decided there.

## The landing state, and the incident that fixed it

`route.ts:57-66` carries the rule and the bug it was written for:

```ts
// Ingest as a DRAFT (insertJob defaults to "published"). A pasted ad must enter the same
// draft → publish → source-into-pipeline lifecycle that JD-builder roles get; born
// "published" it skipped publish, so the role was live but never sourced candidates.
const { id, created } = insertJob(job, jobContentHash(adText), "draft", ws, {
  derivedId: !explicitJobId,
});
```

Two things are worth extracting. First, the default was wrong in the dangerous
direction — `insertJob` defaults its `status` parameter to `"published"`
(`job-ingest.ts:67`), so the safe state has to be passed explicitly at every call
site; the standard's version of that lesson is that the landing state must not be
a parameter anyone can forget. It is still a parameter: the JD-library door
(`app/api/jds/[slug]/ingest-job/route.ts:61`) and the authored-JD ingest
(`app/api/jds/save/ingest-job.ts:52`) each pass `"draft"` by hand. Second, the
observed symptom was *"live but never sourced candidates"*: a role that has
skipped the go-live transition is not merely unapproved, it is broken, because
every downstream effect that transition triggers never fired.

The content hash (`jobContentHash(adText)`) is the dedup guard — the same
advertisement pasted twice upserts rather than piling up duplicate roles — and
`created` is returned so the panel can distinguish *added* from *already in
catalog*. The hash is per workspace (`job_ingests`, keyed `(content_hash,
workspace_id)`), so two teams pasting the same ad do not collapse into one role.

## An ingest that names its target is an edit

The route accepts an explicit `jobId`, which means *re-parse this ad into that
existing job*. The comment at `route.ts:28-36` says what that is: *"a content
overwrite of a named row — insertJob's ON CONFLICT UPDATE rewrites its title,
company, salary band and payload"*, and unguarded, team B could post team A's job
id and *"A's catalog and A's apply link silently start serving B's ad"* because the
row keeps its workspace and its `published` status. The guard is the same ownership
gate the close and publish routes carry (`canWriteJobLifecycle`, `:37-40`, 404 not
403), and it sits after the cheap refusals and before the parse. This is the
standard's "draft, always" seen from the other side: the rule governs the creation
of a role, and an ingest into a live one is a write to something candidates are
reading. Nothing on this path re-runs an approval when the content of a live role
is overwritten, which is the gap the headcount technique's snapshot rule would
name; here the snapshot is the role's level, location and band, all three of which
the parse rewrites.

The route is also rate-limited per IP (`:42-51`, 20 per ten minutes) after the
cheap refusals, because each accepted call spawns a model child; the comment notes
that in open mode the operator gate is a no-op for the whole API, so the route has
to limit itself.

## The minimum-length floor, in one place

`MIN_AD_CHARS = 30` lives in `app/_lib/split-ads.ts:11`, and the comment names why
it is a single export rather than a number in three files: it is the *"single
source of truth for the client panel guard, this splitter, and the ingest route's
server guard, which must agree or a chunk one keeps gets rejected by the other."*
All three read it — the client at `jobsIngestAdPanelLogic.ts:102` and `:151` and the
button guard at `JobsIngestAdPanel.tsx:104`, the splitter's filter at
`split-ads.ts:32`, the route at `route.ts:23`, which refuses with the coded
`JOB_AD_TOO_SHORT`.

Note the boundary the standard draws: this is the *parseability* floor. The
separate substance floor lives in the inclusive-advertising sibling's territory —
`LINT_MIN_BODY_CHARS = 40` in `app/features/library/jds/jdsLibrary.ts:41`, below
which the specificity lint stays silent because every short draft would trip the
missing-salary and missing-place findings, which reads as nagging rather than
advice. Two numbers, two purposes, two edges; the lint's rules themselves belong to
that sibling and are not this subject's to specify.

## Bulk splitting, and the delimiter incident

`splitJobAds` (`split-ads.ts:28-33`) splits on a separator line and drops sub-floor
chunks. The regex is deliberately narrow (`:23`):

```ts
const SEPARATOR = /^[ \t]*[-—–]{3,}[ \t]*$/m;
```

The comment records exactly the failure the standard warns about (`:13-22`): the
alphabet used to be `[-—_=*]`, *"which collided with ordinary in-body markdown a
single ad routinely contains — a setext heading underline (`===`/`---`), an
`___`/`***` thematic break — fragmenting ONE pasted ad into several garbage jobs."*
The fix is the standard's rule stated as a principle in the comment itself:
*"Dashes are the only glyph the UI advertises as the divider … so restricting the
alphabet to dashes drops the `= _ *` false-positives while keeping the documented
contract."* It also notes the floor doing double duty — a short heading underlined
with `---` cannot become a spurious role because the sub-30-char chunk is dropped.

## What the panel shows the operator

`bulkCount` (`jobsIngestAdPanelLogic.ts:61`) runs the splitter on every keystroke
so the import button reads `importAll {count}` before anything is parsed — the split
is previewed, not discovered afterwards. `submitBulk` (`:148` onward) then runs each
chunk through the *same* hardened single-ingest call, sequentially, and builds a
per-row result table (`added` / `exists` / `failed`), so one bad advertisement in
twenty does not take the other nineteen with it. A cancel mid-run is treated as a
real terminal outcome, not a failure: the rows that did land are kept, the note says
how far it got (`:133-135`), and the paste is preserved on failure so the operator
never loses their input.

## The extraction prompt already says the right things

`pipeline/jobfit/jobs.py:446-449` and the fidelity rules at `:492-506` are the
standard's low-confidence rule written as instructions: the system line says *"never
invent requirements that are not present"*, pay is *"the … pay range the posting
itself states … null when the ad states no pay — NEVER estimate one"*, and
company, location and work mode are *"only what the posting itself states — null
when absent, never a guess."* Instruction is not enforcement, and nothing checks the
output against the source text; the operator's review is the check, which is why
the missing preview below matters.

## Where the repo falls short of the standard

- **There is no field-by-field extraction preview.** The parse result is upserted
  straight into a `jobs` row; the operator sees a title in a results table, not
  *this went into requirements, this went into the band*. The draft landing state
  is a real mitigation — nothing is live until someone publishes it, and the posting
  modal is where the role gets read — but a review surface that shows a finished
  posting is not the same instrument as one that shows each extracted field in its
  field, which is where an invented requirement is cheap to catch.
- **Third-party framing is not stripped, and the prompt asks for it.** The
  extraction schema has a `company` key (`jobs.py:471`) filled from the posting, so
  the *source* organisation's name lands on the draft as the hiring company. Nothing
  removes brand copy or application instructions from the description either. The
  standard's rule is to strip what is theirs.
- **The prompt pushes toward requirements.** Its fidelity rules say the list *"must
  NOT be empty when the posting demands anything of the candidate — every real
  posting demands something"* (`:497-498`). That is the right guard against a
  dropped list and the wrong pressure against an ad that demands little; the
  inflation sibling owns what the role may demand, and the two should be read
  together.
- **The floor is duplicated in spirit across two constants that could drift.**
  `MIN_AD_CHARS` and `LINT_MIN_BODY_CHARS` are correctly separate numbers for
  separate purposes, but only the first has a stated single-source-of-truth
  contract; the second is pinned by a wiring test (`jdsLintWiring.test.ts`) and
  documented only in its own comment.
