---
layer: application
type: application
subject: public-work-evidence-bounding
technique: absent-signal-versus-unavailable-source
stack: node
status: forged
---

# Throttle-versus-absence, typed at the boundary (TypeScript server, GitHub deep-dive)

The public-work reader fans out across several upstream calls — the account,
three pages of owned repositories, a per-repository language map, a signal
bundle per shortlisted repository. Any of them can be throttled. This repo's
answer is to type the difference at the fetch boundary and carry it, unflattened,
into the finding vocabulary and the panel.

## The discriminator is "definitive absence", and it is one predicate

`app/_lib/github/client.ts:70-84` carries the HTTP status on the error and
derives one boolean from it:

```ts
// True when an error means "we couldn't read this", not "it isn't there". A 404 is
// a definitive absence; everything else — a 403/429 secondary-rate-limit, a 5xx, or
// a network throw with no status — is a coverage loss the caller must treat as
// "could not determine" rather than as empty evidence.
export function isCoverageLossError(error: unknown): boolean {
  return !(error instanceof GithubHttpError && error.status === 404);
}
```

The comment above `GithubHttpError` (`:64-69`) states the pairing the standard
asks for in both directions: "so normal absences aren't mistaken for incomplete
coverage, and throttles aren't mistaken for absence." And the success case is
explicitly separated from both — `analysis.ts:52-58` notes that "a merely empty
language map (`{}`) that came back 200 is real absence, not a loss." That is the
standard's fifth state, *read and empty*, kept apart from the four failures.

The upstream's own malformed-success case gets a state too: a 200 whose body is
a secondary-rate-limit object rather than the documented array throws
`BAD_SHAPE` (`client.ts:126-131`) instead of blowing up inside `.filter` with an
opaque type error.

## The empty-list return is the exact trap the repo fell into

`analysis.ts:48-66`: each `/languages` sub-fetch `.catch`es to `{}` so one
throttled repository does not fail the run — and that convenience is precisely
the anti-pattern, so the catch sets a flag before returning the empty value:

```ts
.catch((error: unknown) => {
  if (isCoverageLossError(error)) languageCoverageLost = true;
  return {} as Record<string, number>;
})
```

with the finding comment naming the candidate-visible consequence: a partial
throttle "silently drops a repo's secondary languages — which can then surface a
skill the candidate HAS as a Potential Gap."

## Degradation is asymmetric, and the code says so

`app/_lib/github/skills.ts:113-121` is the sharpest statement of the rule in
the repo, and it is the standard's asymmetry exactly:

```ts
// FINDING #2: a gap means "the JD names this AND the public evidence doesn't show
// it". When some language evidence was throttled away, "doesn't show it" is
// unreliable — the skill may live in a language map we couldn't fetch — so a gap
// must NOT be asserted from missing data. Drop gaps entirely for a partial run and
// let the panel + limitations surface "could not determine". Matches stay:
// throttling can only REMOVE evidence, so a match that was found is genuinely found.
const reliableGaps = languageCoverageComplete ? potentialGaps : [];
```

## One shared marker for the degraded run

`app/_lib/github-evidence.ts:39-61` exports the degraded-run limitation as a
single finding rather than a sentence, precisely so the producer and the
consumer cannot drift:

```ts
export const EVIDENCE_INCOMPLETE: GithubFinding = { kind: "limitation.evidenceIncomplete" };
```

The route appends it; `GithubAnalysisPanel` "keys its Potential-Gaps 'could not
determine' caveat off this". A stored analysis from before findings existed is
still recognised, because the pre-finding English sentence is kept as a
`LEGACY_EVIDENCE_INCOMPLETE_NOTE` marker — "Not copy — a marker for recognizing
it in an analysis persisted back then, so a stored report keeps suppressing its
'no gaps' reassurance. Never rendered from here." — and `hasEvidenceIncomplete()`
matches either form. The suppression survives the format change, which is what
the standard means by carrying the state to every layer.

## The scoped negative

The comparison runs against a fixed taxonomy, and `skills.ts:1-8` records what
that cost before it was declared:

> "Was 10 buckets, so a JD requiring Go/Rust/Java/K8s/security/data-eng could
> never appear as a match OR a gap — a recruiter saw 'Potential Gaps: none' and
> read it as 'no gaps' when it meant 'no gaps among 10 hard-coded skills' (a
> false-reassurance wrong-hiring signal)."

The fix is the standard's: not an open question, but a declared bound.
`trackedSkillCount` is returned with the signals (`skills.ts:122-126`, "Honest
coverage… The UI can say so") and rendered by `GithubAnalysisPanel.tsx:165-167`
as "compared against N tracked skills".

The vocabulary's mirror-image inflation is fixed in the same file
(`skills.ts:12-19`): buckets are counted as disjoint concepts, so an alias
living in several buckets "fans one JD keyword into several verdicts —
'react' used to sit in typescript + javascript + react, turning a single React
gap into THREE gap bullets (and a React-only candidate into three 'matches',
inflating apparent breadth)." The alias sets are now mutually exclusive, and
matching is whole-token so `"go"` cannot substring-match `"google"`.

## Deviation

Retryability is not distinguished at the surface: `RATE_LIMITED` (theirs) and
`REQUEST_THROTTLED` (ours) are separate codes, but the panel offers a retry
prompt rather than the system re-reading on its own schedule and refreshing the
artifact. A candidate's stored evidence therefore stays degraded until a human
happens to press the button again.
