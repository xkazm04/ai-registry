---
layer: application
type: application
subject: public-work-evidence-bounding
technique: absent-signal-versus-unavailable-source
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# Throttle-versus-absence, typed at the boundary (TypeScript server, GitHub deep-dive)

The public-work reader fans out across several upstream calls — the account,
three pages of owned repositories, a per-repository language map, a signal
bundle per shortlisted repository. Any of them can be throttled. This repo's
answer is to type the difference at the fetch boundary and carry it, unflattened,
into the finding vocabulary, the skill ledger and the panel.

## One transport, and its outcome is a closed set

Since the last read of this tree the two GitHub readers (the recruiter deep-dive
and the dev-case reads) share one non-throwing transport,
`githubRead` (`app/_lib/repo-snapshot.ts:62`). It never throws and answers with
`{ ok: true, data }` or `{ ok: false, kind }`, where `kind` is one of seven
(`repo-snapshot.ts:17-24`): `not_found`, `throttled`, `http_error`,
`unreachable`, `too_large`, `bad_shape`, `offline`. A 404 is the only `not_found`;
403 and 429 are `throttled` and carry `retryAfterSec` from `Retry-After` or
`x-ratelimit-reset`, clamped to an hour (`:41-60`). Throttled, unreachable and not-found — three of
the standard's five states — are therefore distinguishable at the first line
that touches the network, and "read and empty" is the outcome `ok: true`
carries, which no failure kind can spell. The fourth, *forbidden*, is not
separated: see the deviation below.

The analyzer's throwing face is `githubFetch` (`app/_lib/github/client.ts:135-165`),
which maps each kind onto a code in the closed `GithubErrorCode` union
(`:45-56`). It keeps the status on `GithubHttpError` (`:99-111`) so one predicate
survives the refactor unchanged:

```ts
// True when an error means "we couldn't read this", not "it isn't there". A 404 is
// a definitive absence; everything else — a 403/429 secondary-rate-limit, a 5xx, or
// a network throw with no status — is a coverage loss the caller must treat as
// "could not determine" rather than as empty evidence.
export function isCoverageLossError(error: unknown): boolean {
  return !(error instanceof GithubHttpError && error.status === 404);
}
```

(`client.ts:113-119`.) The comment above `GithubHttpError` states the pairing
the standard asks for in both directions: "so normal absences aren't mistaken for
incomplete coverage, and throttles aren't mistaken for absence." A merely empty
language map (`{}`) that came back 200 is real absence, not a loss
(`analysis.ts:76-80`) — the standard's *read and empty* state.

A timeout used to reach the route as an unclassified failure with a raw "operation
was aborted" string; it now takes the localizable `API_ERROR` code
(`client.ts:156-162`). A 200 whose body is not the documented array — a
secondary-rate-limit object — throws `BAD_SHAPE` per page
(`client.ts:185-190`) instead of dying inside `.filter`.

## The empty-list return is the exact trap the repo fell into

`analysis.ts:81-92`: each `/languages` sub-fetch `.catch`es to `{}` so one
throttled repository does not fail the run — and that convenience is precisely
the anti-pattern, so the catch sets a flag before returning the empty value:

```ts
(error: unknown) => {
  if (isCoverageLossError(error)) languageCoverageLost = true;
  return {} as Record<string, number>;
}
```

The repo bundle read (`client.ts:213-252`) does the same for README, commits and
file names, and returns `incomplete` beside the bundle.

## Degradation is asymmetric, and the code says so

`app/_lib/github/skills.ts:73-78` is the sharpest statement of the rule in the
repo, and it is the standard's asymmetry exactly: a gap means "the JD names this
AND the public evidence doesn't show it", so on a partial run

```ts
const reliableGaps = languageCoverageComplete ? potentialGaps : [];
const undeterminedSkills = languageCoverageComplete ? [] : potentialGaps;
```

Matches stay ("throttling can only REMOVE evidence, so a match that was found is
genuinely found"). What changed since the last read: the dropped gaps are no
longer merely suppressed. They travel as `undeterminedSkills`, so the skill
ledger can name each JD skill it could not check.

## The ledger names the fourth state

`app/_lib/github/skill-ledger.ts` (`:136`, `buildSkillLedger` at `:191`) joins the
label comparison and the code review onto one row per skill with one of four
verdicts: `corroborated`, `notReached`, `couldNotDetermine`, `unclaimed`. The
incompleteness signal is read from either engine — the route's limitation or the
review's own `partial` flag (`:198`) — and a JD skill the labels did not show
becomes `couldNotDetermine` on a partial read and `notReached` on a complete one
(`:223-252`). Before this the panel could print "no gaps" beside a caveat; now the
unreadable source cannot render as a negative because no row exists to carry it.

## One shared marker for the degraded run

`app/_lib/github-evidence.ts:46` exports the degraded-run limitation as a single
finding rather than a sentence, so the producer and the consumer cannot drift:

```ts
export const EVIDENCE_INCOMPLETE: GithubFinding = { kind: "limitation.evidenceIncomplete" };
```

The route appends it (`analysis.ts:146`); `hasEvidenceIncomplete()` (`:55`)
recognises it and also the frozen pre-finding English sentence
(`LEGACY_EVIDENCE_INCOMPLETE_NOTE`, `:51`, "Never rendered from here"), so a
stored report from before findings existed still suppresses its "no gaps"
reassurance. The suppression survives the format change.

## A degraded read is not cached

The deviation this file used to record — stored evidence stays degraded until a
human presses retry — is closed on the cache side. `isTransientlyDegraded`
(`analysis.ts:36-42`) is true for an incomplete run, a `partial` review, or a
review that errored for a reason a retry can clear (`throttled`, `fetchFailed`,
`requestFailed`, `malformed`; `:27`). The route writes the cache only when it is
false (`app/api/github-analysis/route.ts:91-97`), with the reason in the comment:
a cached copy "made that retry a silent no-op for the whole TTL — serving the same
knowingly-incomplete read of a candidate's work, with its original analyzedAt, as
though it were final." Deterministic degradations (no key, no repos, no signals)
stay cacheable, because a retry cannot change them. GitHub's own
`retryAfterSec` rides on the error answer (`route.ts:117-134`) and the panel
turns it into "try again in N minutes" (`GithubAnalysisPanel.tsx:95-104`).

## The scoped negative

The comparison runs against a fixed taxonomy, and its owner records what that
cost before it was declared (now at `skill-ledger.ts:36-43`; it moved from
`skills.ts`):

> "Was 10 buckets, so a JD requiring Go/Rust/Java/K8s/security/data-eng could
> never appear as a match OR a gap — a recruiter saw 'Potential Gaps: none' and
> read it as 'no gaps' when it meant 'no gaps among 10 hard-coded skills' (a
> false-reassurance wrong-hiring signal)."

The fix is the standard's: a declared bound. `trackedSkillCount` is returned with
the signals (`skills.ts:88`) and rendered by the panel as "compared against
N tracked skills" (`GithubAnalysisPanel.tsx:406-407`). The taxonomy has since
grown from ten buckets to 28 (the Node.js spellings, Vue and Svelte are each
recorded in the taxonomy's own comments as a silent false negative found first), which is the same lesson repeating:
every skill the taxonomy did not know was a "no gap" that meant "not asked about".
The bucket-inflation fix stands (`skill-ledger.ts:45-51`): alias sets are mutually
exclusive so one keyword yields at most one verdict, and matching is whole-token
so `"go"` cannot match `"google"`.

## The second consumer: the job seeker's own account

`app/_lib/jobseeker/github.ts` (added 2026-09-28) reads a seeker's own account
and states the same rule in its header. Its failure set is a first-class type,
`SEEKER_GITHUB_FAILURE_STATES` (`invalid_handle`, `not_found`, `not_a_person`,
`throttled`, `offline`, `unreachable`, `failed`), and an account with no public
repositories is `ok` with `repos: []` "because that was read". Its partial read
is the per-repo language pass: a throttle stops it, keeps what was read, and
`languageReads: { planned, read }` says so; the derivation reports
`budget.partial` from `read < planned`
(`pipeline/jobfit/github_evidence_cli.py`). Its `truncated` flag is stricter than
the recruiter side's: stopping once the repository cap is held is not a cut,
because rows arrive most-recently-pushed first and every later page is older.

## Deviations

**Forbidden is folded into throttled.** `githubRead` maps every 403 to
`throttled` (`repo-snapshot.ts:80`), and the one canonical sentence for it names
both causes: "GitHub rate limit or access policy blocked the request"
(`client.ts:68-69`). A 403 that is an access policy, not a quota, is not
retryable and says nothing about the candidate either way, but it is rendered as
a retry prompt. It never becomes an absence, which is the property that matters
most; it does lose the distinction the technique draws.

**The freeze drops the flag.** Coverage loss reaches the panel and the ledger, but the **frozen evidence summary
does not carry it**: see the `process--corroborate-a-claim-never-replace-it`
application. A degraded run that a recruiter adds to the pipeline has its
`partial` flag dropped at the freeze.
