---
layer: application
type: application
subject: probe-confirmed-model-proposals
technique: found-not-hinted
stack: node
status: forged
verified_on: 2026-10-31
---

# Node — the save step that reads only sealed findings

Citations are against the public tree
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893` on
`main`, read on the `verified_on` date. The project onboards a repository into
a CI-and-production watcher: a model proposes what to watch, typed probes
confirm each line, and a person clicks Save. This application follows the
proposal from the probe runner to the stored file, because the
[found-not-hinted](../techniques/found-not-hinted.md) rule is enforced at three
points on that path, not one.

## The runner records the spec, not the provider

`src/server/discover/probes/run.ts:43` "The provider's own kind, args, at and ms
are not trusted over the spec that was asked: the line is the spec's." Each
result line is rebuilt from the validated spec (`src/server/discover/probes/run.ts:44`), and only the
provider's `status`, `summary` and `data` survive. A spec that fails validation
still yields a line — `src/server/discover/probes/run.ts:35` "is not a probe Afterlife runs" —
and a provider that throws becomes a `fail` with its message (`src/server/discover/probes/run.ts:39-40`),
so one broken provider never hides the others' verdicts.

A probe that would run target code does not run here at all:
`src/server/discover/probes/run.ts:24` returns `status: 'skipped', summary: 'runs on your click'` for a
`local-command`. Follow-ups that need an identifier only a finding carries are
derived from the result, never proposed: `src/server/discover/probes/followUp.ts:1-2`
"a query needs the id only a found resource carries ... so the model can never
propose it up front", inserted next in the queue once (`src/server/discover/probes/run.ts:56-57`).

## The verdicts are sealed across the round trip

The checklist streams one probe per request and the save request carries the
results back, so the save is reading verdicts a client handed it.
`src/server/discover/probes/seal.ts:2-4` "the server seals each result it
produced (an HMAC under a key that lives only in this process) and the save
keeps only results whose seal holds: a client cannot hand in an `ok` no probe
returned." The seal is over a key-sorted serialization bound to the root
(`src/server/discover/probes/seal.ts:19-20`), verified with `timingSafeEqual` (`src/server/discover/probes/seal.ts:33`), and the save
route filters before confirming: `src/app/api/onboard/save/route.ts:18`
`body.results.filter((s: unknown): s is Sealed => verifySeal(s, root))`,
answering how many it discarded (`src/app/api/onboard/save/route.ts:20`, `unsealed`). This is the
`claimant-does-not-adjudicate` site that law names in its own statement.

## The assembly copies findings

`src/server/discover/confirm.ts:1-5` states the mapping as the module header:
"The host comes from the git-remote probe's data, a pipeline only if a
pipelines probe listed its id, a variant only with its pipeline, the cloud
resource only from what the App Insights component probe found ... The model's
metrics and its cloud hint are never saved as such: a hint is what the
component probe was asked, not what it found." The code matches it line for
line: `hostOf` reads `git-remote` result data (`src/server/discover/confirm.ts:16`); pipelines are
filtered to ids a listing returned (`src/server/discover/confirm.ts:49-50`); variants fall with
their pipeline (`src/server/discover/confirm.ts:52`); the cloud resource requires `appId`, `name`,
`resourceGroup` and `subscription` all present in the component probe's data
(`src/server/discover/confirm.ts:42-43`); App Insights wins over the log workspace, which is then
kept as metadata only (`src/server/discover/confirm.ts:38`). Every result is stored with the
configuration (`src/server/discover/confirm.ts:65`, `probes: results`).

## Where it falls short

Two fields leave the proposal without a finding. Components are kept when
`existsSync(path.join(root, c.path))` holds (`src/server/discover/confirm.ts:53`), but the stored
component is the proposal's object — its `stack`, `tests` and `build` strings
ride through with the path. And the test commands become runner gates directly
(`src/server/discover/confirm.ts:54`, `const gates = [...new Set(components.flatMap((c) => c.tests ?? []))]`),
although the `local-command` probe that would confirm them was skipped. The
technique's edge case applies: hold those gates out, or store them marked
unconfirmed until a person's click records an exit. Separately, `src/server/discover/probes/run.ts:40`
maps a thrown provider (a lapsed login, an unbuilt stub) to `fail`, the same
status a refuting listing produces; nothing is saved either way, but the
checklist cannot tell "not there" from "could not ask".
