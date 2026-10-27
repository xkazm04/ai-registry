---
layer: application
type: application
subject: deployment-contract
technique: public-build-inert-by-mode
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@24
---

# A public replay of an agent control plane, and the night its framework had an RCE

Project `afterlife` (https://github.com/xkazm04/afterlife), read at `main` commit `009c7893`.
In live mode the application holds GitLab tokens, spawns `glab` and `git`, opens a local index
and polls. For reviewers it is also deployed as a public, login-free container on a hosted
container platform: the same Next.js standalone build in a replay mode, serving a ledger snapshot
read-only. The runtime image is Node 24
(`infra/cloudrun/Dockerfile:6 "ARG NODE_IMAGE=node:24-bookworm-slim"`).

## The mode: one value is live, everything else is demo

`src/server/data/config.ts:19 "mode: envOf(env, 'MODE') === 'live' ? 'live' : 'demo',"` — any
value but `live`, including none, is demo. The deployment's security contract restates it and
lists what demo means on every path (`infra/cloudrun/README.md:59 "Any value but"`),
and the inertness test calls every server action as an anonymous caller in `replay`, `demo` and
unset, failing on any spawn, network call, index open or poll
(`src/server/actions/__tests__/replay/inert.test.ts:46 "describe.each([['replay'], ['demo'], [undefined]])"`).
That third case is the technique's "inert and unset modes" exactly.

## The image: nothing to take

The runtime stage is commented with the contract it holds
(`infra/cloudrun/Dockerfile:25 "No glab, no token, no AFTERLIFE_* but AFTERLIFE_MODE, no volume"`),
sets the mode explicitly (`infra/cloudrun/Dockerfile:31 "AFTERLIFE_MODE=replay"`), runs as the
unprivileged user over root-owned files (`infra/cloudrun/Dockerfile:39 "USER node"`) and starts the
standalone server, never a dev server
(`infra/cloudrun/Dockerfile:41 "Never npm start or next dev."`). The contract's six items
(`infra/cloudrun/README.md:53-68`) add the spend bound for an endpoint with no rate limit
(`infra/cloudrun/README.md:68 "Cap the spend on Cloud Run"`).

## The proof on the shipped image

The pipeline's `cloudrun-image` job builds the same Dockerfile, boots it, waits for it, requests
the home page with headers shown, and asserts the process user
(`.gitlab-ci.yml:122-136`, `.gitlab-ci.yml:136 "docker exec replay whoami"`).
The environment inspection is an operator command in the README, not a pipeline step
(`infra/cloudrun/README.md:40 "env | grep -E '^(AFTERLIFE|BELAY)_|TOKEN'"`), and the image
inventory was recorded by hand on one date (`infra/cloudrun/README.md:85 "What the image holds (2026-10-18)"`).

**Deviation.** The technique puts the environment inspection in the pipeline on every change that
can reach the public build. Here a token added to the Dockerfile's `ENV` would pass every CI job;
only the next manual run of the README command would see it. The CI job also requests only `/`,
where the technique asks for several routes and an unknown path (the README's record of a manual
check did both, `infra/cloudrun/README.md:77`).

## What inertness did not cover

The evening before the public link was due, the pipeline's dependency audit
(`.gitlab-ci.yml:102-108`, `.gitlab-ci.yml:108 "npm audit --omit=dev --audit-level=high"`)
flagged critical advisories in the framework, including an unauthenticated remote code execution,
for the publicly deployed app. Commit `0eff95e5` records the response: Next.js `16.3.8` to
`16.4.3`, every gate rerun, a production audit of zero (`package.json:39 "^16.4.3"`).
This is the case the technique's section on patching was written from: a flaw below the mode
switch executes whatever it is sent, and the empty environment was what bounded it, not the mode.

The same commit renamed the service, so the redeploy was a new endpoint
(`infra/cloudrun/service.yaml:8 "name: afterlife-replay"`, `infra/cloudrun/deploy.sh:17 "SERVICE=afterlife-replay"`)
and the README now names the new address (`infra/cloudrun/README.md:21-25`). The order the session
followed — the new service deployed and health-checked, the documents repointed, and only then the
old vulnerable service deleted — is [replace-before-retire](../techniques/replace-before-retire.md);
that sequence was carried out at the platform and has no file in the tree recording it, which is
itself the gap that technique's step 5 asks to close.

**Deviation.** The audit job is report-only (`.gitlab-ci.yml:106 "allow_failure: true"`). It caught
the flaw because someone read the report on the night that mattered; the technique asks that the
public build's path either block on it or name who reads it before each deploy.
