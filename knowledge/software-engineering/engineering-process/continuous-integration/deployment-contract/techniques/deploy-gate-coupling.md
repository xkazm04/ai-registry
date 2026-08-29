---
layer: technique
type: technique
subject: deployment-contract
technique: deploy-gate-coupling
status: forged
stage: solo
laws: [verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a platform deploys on push while the pipeline is still running, production shipped from a commit whose checks later failed, choosing between platform-coupled deploys and gate-first pushing, a deploy and a verification race the same event]
---

# Deploy-gate coupling

A hosting platform's push-to-deploy integration and a verification pipeline's push-to-verify
trigger are two consumers of one event, and nothing makes them wait for each other. The
platform deploys in minutes; the pipeline reports in minutes; whichever finishes second finds
the decision already made. This technique is about refusing to leave that race in place.

## Name the race before choosing a fix

The failure shape: a commit reaches the default branch, the platform builds and promotes it to
production, and the pipeline — later — turns red on the same commit. Production is now serving
a build whose verification failed, and no surface says so; the deploy dashboard shows a green
deploy (the *build* succeeded) and the pipeline shows a red run, and only a human holding both
in mind notices they describe the same commit. Per
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary), a verdict that
never reaches the deploy decision might as well not exist; per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), "deployed before
the verdict existed" must never be readable as "deployed verified."

## Resolution one: the deploy waits

Where the platform supports it, couple mechanically: the platform holds a deployment until the
required checks on that commit pass, or the deploy is triggered *by* the pipeline as its final
step instead of by the push. The former keeps the platform's convenience; the latter gives the
pipeline full custody — build here, upload the prebuilt result, promote — and turns the
platform into pure hosting, which also buys the parity argument from
[platform-build-parity](./platform-build-parity.md). Pipeline-custody deploys need a deploy
credential in the pipeline, priced under
[secret-materialization-discipline@ci-execution-trust](../../ci-execution-trust/techniques/secret-materialization-discipline.md),
and a serialization guard so two runs cannot deploy at once, owned by
[shared-resource-serialization@runner-fleet](../../runner-fleet/techniques/shared-resource-serialization.md).

Coupling has a cost worth stating: every deploy now pays the pipeline's full latency, and a
hotfix pays it at the worst time. That cost is real and it is the argument for the second
resolution, not for uncoupling.

## Resolution two: the gate moves ahead of the push

Accept the race and win it by moving the entire blocking gate before the event both systems
consume — which is exactly the direct-push topology's precondition set
([direct-push-delivery](./direct-push-delivery.md)): the full gate runs at push time, so any
push the platform reacts to has already passed everything the pipeline would have blocked on.
The pipeline remains as the clean-environment backstop, and the after-push watch closes the
loop on the rare divergence.

This resolution fits the single-owner, high-tempo case: deploys stay instant, and the gate's
latency is paid where the author is already waiting, with the change still in their head. Its
honesty condition is that the local gate genuinely equals the blocking set — the moment the
remote gate grows a check the local gate lacks, the race is live again on exactly that check.
Parity between the two sets is therefore a maintained invariant, re-checked whenever either
side's workflow changes, not a one-time setup fact.

## What is never acceptable

The default wiring: both consumers on the same event, no coupling, no compensating gate, and
the mismatch surfaced by users. A repository in this state has a deployment process that
merely resembles one — every green deploy is an unexamined claim. The tell is
cheap to look for: any commit in history whose deploy succeeded and whose verification run
failed. One such commit proves the race is live; the fix is choosing a resolution, not
promising vigilance.

## Rollback interacts with the choice

Under resolution one, a red verdict can arrive only before the deploy, so production never
needs un-deploying for gate reasons. Under resolution two, the backstop can still catch what
only a clean environment sees — and the response is the promotion model's rollback
([environment-promotion](./environment-promotion.md)): re-point production to the last
known-good build first, then fix forward. Either way the deploy history must make "which
build is serving, and what was its verdict" answerable in one place — the observing side of
that record is
[deployment-history@cicd-monitoring](../../../../integration/cicd-monitoring/techniques/deployment-history.md).

## Decision rules

- Find the race before designing around it: look for one historical commit with a green
  deploy and a red verification run; one is proof.
- Prefer mechanical coupling (checks-gated deploys, or pipeline-custody prebuilt deploys)
  when deploy latency is tolerable and the platform supports it.
- Prefer gate-ahead-of-push (the direct-push preconditions) when deploy tempo matters and the
  owner controls every push; treat local-remote gate parity as a maintained invariant.
- Never leave both consumers wired to the push with neither resolution; that state is
  indistinguishable from having no gate on production.

- Point the verifying check at the address production serves, never at a
  local or replica twin of it. Timing is one half of the coupling and address
  is the other: a verdict can arrive at exactly the right moment and still
  describe the wrong executor — a check that starts its own copy of the
  artifact, or exercises a staging replica, and reports on it as though it
  had reached the deployed one. The race is closed, the ordering is correct,
  and nothing has verified what production serves
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)). A green verdict
  names the target it exercised, or it is not readable as a verdict about the
  deployment at all.
- Keep "which build serves production, under what verdict" answerable from one record,
  whichever resolution is chosen.
