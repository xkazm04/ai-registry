---
layer: application
type: application
subject: deployment-contract
technique: build-context-filter-parity
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@24
---

# Two ignore files over one tree, and the nested `docs` folder that broke a remote build

Project `afterlife` (https://github.com/xkazm04/afterlife), read at `main` commit `009c7893`. The
public replay image (`infra/cloudrun/Dockerfile`, Node 24) was first built locally with a
container runtime, whose build context is filtered by a context filter beside the Dockerfile. To
build without a local container runtime, the project added a remote build on the hosting
platform's build service, whose upload tool reads gitignore-style rules.

## The two filters

The container context filter lists root-only entries as bare names, which in its dialect match
from the context root:
`infra/cloudrun/Dockerfile.dockerignore:17 "docs"`. The first upload filter reused the same set.
In the upload tool's gitignore dialect a bare name is unanchored, so `docs` also dropped
`src/server/gitlab/__fixtures__/docs/` — not a test fixture in the build's eyes, since runtime code
imports it (`src/server/gitlab/fake/dataset.ts:8 "import projectsFx from '../__fixtures__/docs/projects.json';"`)
— and the remote build failed while the container build of the same commit passed.

## The fix, as the technique states it

A dedicated upload filter, passed explicitly, whose header names its twin and the dialect rule:
`infra/cloudrun/replay.gcloudignore:1 "Same set as Dockerfile.dockerignore, but in"`,
`infra/cloudrun/replay.gcloudignore:2 "gitignore syntax, where an unanchored name matches at any depth"`.
Root-only entries are anchored (`infra/cloudrun/replay.gcloudignore:16 "/docs/"`), any-depth ones
say so (`infra/cloudrun/replay.gcloudignore:4 "**/node_modules/"`), and the secret pattern is
any-depth in both files (`infra/cloudrun/replay.gcloudignore:13 "**/.env*"`,
`infra/cloudrun/Dockerfile.dockerignore:13 "**/.env*"`). The build config names the filter it
expects to be passed (`infra/cloudrun/cloudbuild.yaml:3 "--ignore-file=infra/cloudrun/replay.gcloudignore"`,
`infra/cloudrun/cloudbuild.yaml:4 "anchored for gitignore syntax"`), and the deployment README's
file table records why (`infra/cloudrun/README.md:19`).

## Deviation

The two lists are hand-maintained copies kept in step by a comment. Nothing compares the files
each filter admits, and nothing renders both from one list, so the next entry added to one and
not the other is caught the way this one was — by a failed remote build, or, for a folder only
read at runtime, by the deployed service. The technique's step 4 is a listing of what the upload
tool would send, diffed against the context the container build received; it is not in the
pipeline. The redeploy command passes the filter explicitly (`infra/cloudrun/README.md:30`), but
a bare upload from the repository root without `--ignore-file` would fall back to the tool's
default behaviour rather than this filter.
