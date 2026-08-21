---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: ingest-as-draft-never-as-live
stack: react
status: forged
verified_on: 2026-08-20
---

# Pasting a third-party advertisement: `JobsIngestAdPanel` + `POST /api/jobs/ingest`

A recruiter pastes an advertisement — one, or a whole requisition list — and a
language model parses it into a structured, matchable role. The panel
(`app/features/library/jobs/JobsIngestAdPanel.tsx` and its extracted logic
`jobsIngestAdPanelLogic.ts`) is the client half; `app/api/jobs/ingest/route.ts`
is the server half, and the landing state is decided there.

## The landing state, and the incident that fixed it

`route.ts:29-33` carries the rule and the bug it was written for:

```ts
// Ingest as a DRAFT (insertJob defaults to "published"). A pasted ad must enter the same
// draft → publish → source-into-pipeline lifecycle that JD-builder roles get; born
// "published" it skipped publish, so the role was live but never sourced candidates.
const { id, created } = insertJob(job, jobContentHash(adText), "draft", await currentWorkspace());
```

Two things are worth extracting. First, the default was wrong in the dangerous
direction — `insertJob` defaults to `"published"`, so the safe state had to be
passed explicitly at every call site; the standard's version of that lesson is
that the landing state must not be a parameter anyone can forget. Second, the
observed symptom was *"live but never sourced candidates"*: a role that has
skipped the go-live transition is not merely unapproved, it is broken, because
every downstream effect that transition triggers never fired.

The content hash (`jobContentHash(adText)`) is the dedup guard — the same
advertisement pasted twice upserts rather than piling up duplicate roles — and
`created` is returned so the panel can distinguish *added* from *already in
catalog*.

## The minimum-length floor, in one place

`MIN_AD_CHARS = 30` lives in `app/_lib/split-ads.ts:11`, and the comment names
why it is a single export rather than a number in three files: it is the *"single
source of truth for the client panel guard, this splitter, and the ingest route's
server guard, which must agree or a chunk one keeps gets rejected by the other."*
All three read it — the client at `jobsIngestAdPanelLogic.ts:76`, the splitter's
filter at `split-ads.ts:31`, the route at `route.ts:21-23`.

Note the boundary the standard draws: this is the *parseability* floor. The
separate substance floor lives in the inclusive-advertising sibling's territory —
`LINT_MIN_BODY_CHARS = 40` in `app/features/library/jds/jdsLibrary.ts:29`, below
which the specificity lint stays silent because *"every short draft would trip
missing-salary/place, which reads as nagging rather than advice"*. Two numbers,
two purposes, two edges; the lint's rules themselves (`app/_lib/jd-lint.ts`)
belong to that sibling and are not this subject's to specify.

## Bulk splitting, and the delimiter incident

`splitJobAds` (`split-ads.ts:28-34`) splits on a separator line and drops
sub-floor chunks. The regex is deliberately narrow (`:24`):

```ts
const SEPARATOR = /^[ \t]*[-—–]{3,}[ \t]*$/m;
```

The comment records exactly the failure the standard warns about
(`:14-23`): the alphabet used to be `[-—_=*]`, *"which collided with ordinary
in-body markdown a single ad routinely contains — a setext heading underline
(`===`/`---`), an `___`/`***` thematic break — fragmenting ONE pasted ad into
several garbage jobs."* The fix is the standard's rule stated as a principle in
the comment itself: *"Dashes are the only glyph the UI advertises as the
divider … so restricting the alphabet to dashes drops the `= _ *`
false-positives while keeping the documented contract."* It also notes the floor
doing double duty — a short heading underlined with `---` cannot become a
spurious role because the sub-30-char chunk is dropped.

## What the panel shows the operator

`bulkCount` (`jobsIngestAdPanelLogic.ts:46`) runs the splitter on every keystroke
so the import button reads `importAll {count}` before anything is parsed — the
split is previewed, not discovered afterwards. `submitBulk` (`:120-165`) then
runs each chunk through the *same* hardened single-ingest call, sequentially, and
builds a per-row result table (`added` / `exists` / `failed`), so one bad
advertisement in twenty does not take the other nineteen with it. A cancel
mid-run is treated as *"a real terminal outcome, not a failure: keep the rows
that did land, say how far it got"* (`:151-153`), and the paste is preserved on
failure so the operator never loses their input.

## Where the repo falls short of the standard

- **There is no field-by-field extraction preview.** The parse result is upserted
  straight into a `jobs` row; the operator sees a title in a results table, not
  *this went into requirements, this went into the band*. The draft landing state
  is a real mitigation — nothing is live until someone publishes it, and the
  posting modal is where the role gets read — but a review surface that shows a
  finished posting is not the same instrument as one that shows each extracted
  field in its field, which is where an invented requirement is cheap to catch.
- **Third-party framing is not stripped.** Nothing in the ingest path removes the
  source employer's name, brand copy or application instructions from an imported
  advertisement.
- **The floor is duplicated in spirit across two constants that could drift.**
  `MIN_AD_CHARS` and `LINT_MIN_BODY_CHARS` are correctly separate numbers for
  separate purposes, but only the first has a stated single-source-of-truth
  contract; the second is pinned by a wiring test and documented only in its own
  comment.
