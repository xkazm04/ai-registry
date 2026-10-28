---
layer: technique
type: technique
subject: deployment-contract
technique: replace-before-retire
status: forged
stage: team
laws: [creation-names-reaper, gate-sees-target]
shared_with: []
use_when: [renaming a hosted service, a critical vulnerability is found in a deployed revision, moving a deployment to a new address, an old endpoint is left running as a fallback]
---

# Replace before retire

On most hosting platforms a service's name is part of its address. Renaming a service is
therefore not a rename: it creates a second service at a second address, and the first keeps
running — with its public binding, its last revision, and every link that points at it. The
same is true of moving a deployment to a new project, region or platform. The naive sequence
treats the old endpoint as something to tidy up later, and later rarely comes; the old service
becomes a forgotten copy of the product, running code nobody patches.

The opposite naive sequence is no better: delete the old service first, then deploy the new
one, and every link, every reviewer's bookmark, every document is dead until the new address is
found and published, and if the new deploy fails there is nothing serving at all.

The rule is the order of five steps, and the fifth is not optional: **deploy the replacement,
prove every route on it, repoint every reference, confirm the old one is unreferenced, then
delete the old one.**

## The sequence

1. **Deploy the replacement from the verified build** — the same artefact the gate passed, not a
   rebuild, per [environment-promotion](./environment-promotion.md).
2. **Prove every route on the new address.** Not the landing page: each top-level route, an
   unknown path, the security headers, the health endpoint, a cold start. Per
   [gate-sees-target](../../../../_laws.md#gate-sees-target), the check runs against the new
   address itself, not against the build that was meant to land there.
3. **Repoint every reference.** Documentation, the repository's front page, submitted links,
   dashboards, DNS, monitoring, anything that names the old address. Search the tree and the
   published documents for the old address and the old name.
4. **Confirm the old endpoint is unreferenced.** The search comes back empty; where traffic logs
   exist, requests to the old address have fallen to what the repointing cannot reach.
5. **Delete the old endpoint** — the service, its public access binding, its custom domain
   mapping — and record the deletion beside the deploy.

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), the replacement's
creation names the old endpoint's reaper: the change that introduces the new name carries the
retirement as a stated step with an owner, not as an intention.

## A vulnerable revision is deleted, not left

When the reason for the replacement is a vulnerability — a dependency audit flags a remote-code
execution in the framework of a public deployment — the old endpoint is not a fallback. It is
the vulnerability, still public. The sequence runs as above, with the patch first and every
gate rerun on the patched build, and with three additions:

- **The vulnerable revision leaves the rollback set.** A rollback-by-re-pointing design keeps the
  previous build ready; strike the vulnerable builds from what can be re-pointed to, or the next
  incident's rollback reinstates the flaw.
- **Revision-level addresses are removed too.** Platforms that give each revision its own
  addressable tag keep old revisions reachable after traffic moves; untag or delete them.
- **The interval is short and stated.** The old endpoint stays only as long as steps 2 to 4
  take, and the change records when it was deleted.

## Decision rules

- A rename or a move is a new endpoint: create, prove, repoint, confirm, delete — in that order.
- Prove every route and the headers on the new address before anything points at it.
- Search the tree and the published documents for the old name and address before deleting.
- The change that creates the replacement names the old endpoint's deletion and its owner.
- A vulnerable revision is deleted and struck from the rollback set; its revision addresses go
  with it.

## When not to use it

A redeploy under the same name and address replaces traffic in place and needs only the
revision-level clean-up above. And an endpoint that must keep serving old clients during a
migration is not being retired; it is a second environment with its own patching and its own
place in the environment ladder, until a date is set for step 5.
