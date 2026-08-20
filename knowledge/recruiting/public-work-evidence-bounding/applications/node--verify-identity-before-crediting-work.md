---
layer: application
type: application
subject: public-work-evidence-bounding
technique: verify-identity-before-crediting-work
stack: node
status: forged
---

# Person-versus-organisation as a precondition (TypeScript server, GitHub deep-dive)

The public-work reader in this repo is `app/_lib/github/` behind
`/api/github-analysis`. Its identity gate is two things: one branch taken
before any repository is fetched, and one shared handle grammar that both entry
points into the pipeline must agree on.

## The entity check runs before the first repository fetch

`app/_lib/github/analysis.ts:31-42` fetches the account and immediately
branches on its type, with the comment naming the failure it prevents:

```ts
const user = await githubFetch<GithubUser>(`https://api.github.com/users/${encodeURIComponent(username)}`);
// FINDING #1 (fairness): /users/{login} also resolves organizations, which share
// the exact handle grammar and return a 200. Attributing an ORG's entire repo
// portfolio — stars, complexity signals, job-fit — to one applicant is a silent
// wrong-account failure. Verify "this account is a person" the moment the account
// is first seen, BEFORE any repo is fetched or analyzed.
if (user.type !== "User") {
  throw new GithubAnalysisError(
    "NOT_A_PERSON",
    "That handle is a GitHub organization, not a personal account. Enter an individual developer's username."
  );
}
```

Three things match the standard exactly:

- **It is a hard stop, not a warning.** The throw happens before
  `fetchOwnedRepoPages`, so no glowing artifact about dozens of people's work
  is ever produced — which is the standard's point that a blank result gets
  investigated and a persuasive wrong one gets acted on.
- **`NOT_A_PERSON` is its own state**, sitting in the closed
  `GithubErrorCode` union at `app/_lib/github/client.ts:44-52` beside
  `PROFILE_NOT_FOUND`, `RATE_LIMITED` and `REQUEST_THROTTLED`. It is not
  folded into a generic failure, so the surface can say *this link identifies
  an organisation* rather than *analysis failed* — a correctable input
  problem, phrased as one.
- **The check is possible only because the type field is modelled
  deliberately.** `client.ts:11-21` carries `type: string` on `GithubUser`
  with the note that it "is the ONLY field that says whose account this is —
  the identity check finding #1 turns from an assumption into a
  precondition."

The naming of the branch is also the standard's `!== "User"` shape rather than
`=== "Organization"`: bots, and any account kind the platform adds later,
fall on the non-person side by default rather than being credited by omission.

## One handle grammar, shared by intake and screening

`app/_lib/github-handle.ts:1-24` is the single normalisation routine, and its
header records the exact incident the standard's unification rule exists to
prevent:

> "these previously kept two copies that disagreed on whether the URL protocol
> was required (the route demanded `https://`, the apply gate made it
> optional), so a handle accepted at apply was rejected by the deep-dive."

`parseGithubUsername` now accepts a bare handle, a leading `@`, and a profile
URL with optional protocol, optional `www.` and ignored trailing path or query,
returning the normalised bare username — and both callers go through it:
`app/api/github-analysis/route.ts:23` at screening, and `coerceGithubHandle`
(`app/_lib/apply-intake.ts:232-235`) at application intake, whose own doc
comment states the invariant as *"a handle that passes here is one the
deep-dive can run"*.

The strict grammar (`/^[A-Za-z0-9-]{1,39}$/`, no leading or trailing hyphen)
is kept for a second reason worth naming: the value is spliced into an upstream
URL, so this is a trust boundary as well as a normalisation point — "field-by-field
coercion at the trust boundary, never a cast."

The intake side also gets the optionality rule right: junk in the profile step
"degrades to 'no handle' rather than blocking the application", so a
malformed link never costs a candidate their submission.

## Where the repo stops short of the standard

- **Kind is verified; ownership is not.** Nothing corroborates that the person
  behind a verified *personal* account is this applicant. In practice the
  candidate supplies the handle themselves in the apply flow
  (`app/api/apply/[id]/route.ts:245`), which the standard treats as the
  strongest ordinary ownership signal — but a recruiter can also type a handle
  into the deep-dive panel by hand, and that path has no ownership signal at
  all and no marker distinguishing the two provenances on the stored artifact.
- **The normalised form replaces the raw input.** Only the coerced handle is
  persisted (`app/_lib/db/pipeline.ts:1012-1014`), so a later widening of the
  grammar cannot be re-applied to what the candidate originally typed. The
  standard asks for both.
- **No collision check.** Two entries resolving to the same handle are not
  detected, so a mistyped handle that happens to belong to someone else is
  indistinguishable from a correct one.

None of these lower the standard; they are the next three commits.
