---
layer: application
type: application
subject: deployment-contract
technique: environment-promotion
stack: node
status: forged
verified_on: 2026-08-27
---

# Preview, promote and roll back on Vercel

Vercel implements the technique's ladder natively — every push builds a Preview deployment
with its own URL, and Production is a pointer to one deployment — which makes it a clean
place to see both the technique working and the places a real fleet leaves it unused. Evidence
from a 2026-08 audit of two Vercel-deployed Next.js repositories.

## The ladder as Vercel ships it

Every push to any branch produces a Preview deployment at a unique URL, built with the
Preview-scoped environment variables. A push to the production branch (configurable; `master`
in both audited repos) builds and promotes in one motion. The promotion primitives:

```sh
vercel ls                      # deployments, newest first, with URLs and states
vercel promote <deployment-url>  # point Production at an existing deployment
vercel rollback                # shorthand: re-point at the previous Production deployment
```

`promote` is the technique's promotion and its rollback in one command: the argument is any
existing deployment, including the last known-good one. One audited runbook already encodes
the doctrine — its rollback section says *"promote the previous deployment, do not revert and
rebuild"* — and pairs it with the schema caveat: migrations are forward-only there, so the
runbook explicitly scopes rollback to code, and a bad migration is a fix-forward.

## Where the audited fleet leaves the ladder unused

**Previews with no proof obligation.** Both repositories generate previews on every push and
neither looks at them systematically. One wired a smoke workflow to the `deployment_status`
event to probe each deployment's URL — the right idea — but every run in its history shows
`skipped`: the guard condition `deployment_status.state == 'success'` never matched at the
moment the event fired, so the probe has never once executed. A probe that has never run is
the failure-not-empty-success case: the workflow's presence reads as coverage it does not
provide. (The mechanical fix is triggering on the event and polling the deployment to a
terminal state, or probing from CI after `vercel deploy` returns the URL directly.)

**Production as rebuild, not promotion.** Both repositories ship by pushing the production
branch, so Vercel rebuilds rather than promotes — the technique's weaker form. The
compensations the technique requires are partially present: input parity holds (same
`buildCommand` for both environments), but per-environment variables mean a green Preview
build does not prove the Production build, and one repository's build-time migration makes
Production's build additionally dependent on database reachability. The stricter form —
`vercel build` + `vercel deploy --prebuilt` from a gate, then promote — is recorded in each
repo's deployment doc as the upgrade path rather than adopted immediately.

## Preview environment variables are half a preview

The audited failure mode behind "preview deploys fail while production works": variables
created only in the Production scope. Vercel scopes every variable to Development / Preview /
Production, and a server route that requires a key 500s on every preview if the key exists
only in Production. The fleet's rule, landed in each deployment doc: the variable inventory
carries a scope column, and every variable is either present in Preview (with a scoped,
lower-privilege value — never the production credential) or the code path degrades without it.
The degradation posture follows one repo's existing doctrine of proving optional-dependency
behavior by building with an empty environment.

## What a preview must prove here, concretely

The fleet's minimal obligation, sized for a single owner: the deployment reaches `READY`
state (Vercel's own build-and-boot verdict), and the golden-path route returns a healthy
response at the preview URL — one `curl` or one browser visit, recorded in the push's context
when the change touched server behavior. Deeper probes stay in CI. The obligation is written
in each repository's deployment doc next to the promote commands, so "the preview passed"
has the same referent for every future session — human or agent — that ships from that repo.
