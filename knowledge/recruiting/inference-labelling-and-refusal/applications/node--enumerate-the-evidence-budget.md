---
layer: application
type: application
subject: inference-labelling-and-refusal
technique: enumerate-the-evidence-budget
stack: node
status: forged
---

# The evidence budget as code (public-profile review, TypeScript server)

`app/_lib/github-evidence.ts` is the dependency-free evidence-vocabulary module
shared by the server route that builds the review, the client components that
render it, and the end-to-end fixture that pins it. It is where the budget is
declared, and it exists so that the documented scope and the sent scope are the
same object.

## The budget is constants, and the scope statement is derived from them

The caps are exported values — `README_TRUNCATE = 3500` (`:13`),
`COMMITS_PER_REPO = 10` (`:15`), `FILES_PER_REPO = 30` (`:17`) — and
`describeEvidenceBasis()` (`:61-73`) returns the reader-facing basis built *from
those same constants*:

```ts
{ kind: "basis.readme",   params: { chars: README_TRUNCATE } },
{ kind: "basis.commits",  params: { count: COMMITS_PER_REPO } },
{ kind: "basis.files",    params: { count: FILES_PER_REPO } },
{ kind: "basis.metadata" },
{ kind: "basis.notRead" },
```

The header states the rule the standard asks for, in the repo's own words: the
basis is "derived from the constants above so the documented scope can NOT drift
from what is actually sent to the model. Text-and-metadata only: no file *bodies*
and no recursive directory tree are ever read, so neither the model nor the UI may
imply the source code itself was inspected."

Two details are exactly the standard's procedure:

- **`basis.notRead` is a first-class item.** The negative space — what was *not*
  read — is enumerated alongside what was, rather than being left to the reader to
  infer from a list that reads as exhaustive.
- **Findings are structured, not prose.** `GithubFinding = { kind, params }`
  (`:31`) with numbers kept as numbers "so plurals and grouping work" — the
  sentence is composed at render time by the message catalog, which is what lets a
  stored analysis be "re-parsed and re-rendered years later" (`:33-36`) in a
  different locale. The one concession to history: a payload persisted before
  findings existed keeps its frozen English sentence and is rendered verbatim
  (`GithubNote = string | GithubFinding`).

## The prompt is the other half of the same budget

`app/_lib/github/code-review.ts:166-176` places the same scope in front of the
model, in the second person, immediately before the output contract:

> "You are NOT reading the source code. You only receive lightweight public
> signals: README text (truncated), recent commit subject lines, root-level
> file/directory NAMES (no file contents), the primary language, and topics."
> … "Be conservative: do not infer code quality, architecture, or implementation
> details you cannot see." … "name any MUST-HAVE job-description skills that are
> NOT evidenced by the signals explicitly — never imply full coverage."

The serialized evidence is re-labelled at the point of insertion too —
"Repository signals (metadata and text only — no file bodies)" (`:180`) — so the
budget statement sits adjacent to the data it describes, not only in a preamble.
This is the standard's "put the scope statement in both places", realized: the
same bound constrains what the model may conclude and what the reader is told.

## Truncation and incompleteness are declared, not silent

When a run loses coverage — public data throttled away — the route appends
`EVIDENCE_INCOMPLETE` (`github-evidence.ts:46`), a single exported finding, and
`hasEvidenceIncomplete()` (`:55-59`) is the one function that knows how it is
spelled, so producer and consumer "can never drift". The panel keys its
"could not determine" caveat off it, which is how a partial run is stopped from
rendering as a clean one. The module even keeps
`LEGACY_EVIDENCE_INCOMPLETE_NOTE` (`:51`) — not as copy, but as a *recognizer* so
that a report persisted under the old spelling "keeps suppressing its 'no gaps'
reassurance".

## The adjacent scoping incident

`app/_lib/github/skills.ts:3-10` records what happens when a budget is bounded but
the bound is not published. A ten-bucket skill taxonomy meant a role requiring
anything outside those ten "could never appear as a match OR a gap — a recruiter
saw 'Potential Gaps: none' and read it as 'no gaps' when it meant 'no gaps among
10 hard-coded skills'". The fix is the standard's: the list was widened to 26
buckets, and `trackedSkillCount` (`:123`) is now exported "so the UI can say
'compared against N tracked skills', honestly" — the bound stated by the same
source that enforces it. `FINDING #4` (`:12-18`) adds the counting half: overlapping
aliases fanned one gap into three, so the alias sets were made mutually exclusive
and "one underlying skill can produce at most one verdict".

## Deviation

The empty-signal path (`code-review.ts:140-151`) returns a summary — "Reviewed
repositories expose no public README, commit, or file signals to assess" — that
correctly says *nothing was assessable* rather than *nothing was found*. But the
budget's per-item truncation is not itself reported: a README cut at 3500
characters is indistinguishable in the output from one that fit. The standard's
"make truncation visible" rule stands; the repo enumerates the cap without
reporting when the cap bit.
</content>
