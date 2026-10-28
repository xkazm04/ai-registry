---
layer: technique
type: technique
subject: deployment-contract
technique: public-build-inert-by-mode
status: forged
stage: team
laws: [absent-guard-is-loud, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [publishing a read-only demonstration of an application that can write in its full form, a public deployment has no login, deciding what a public image may contain, an application has a mode switch between demonstration and live operation]
---

# The public build is inert by mode

An application that acts on the world — it holds tokens, spawns processes, writes files, calls
services — is sometimes also deployed publicly as a demonstration: a read-only replay for
reviewers, a sandbox for prospective users, a showcase with no login. The tempting design is the
live application with its dangerous paths disabled by configuration. That design is one missing
setting away from being the live application on a public address, and per
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) a deployed fleet converges on
whatever the default is.

The rule: **the public build is inert by construction, enabled by exactly one explicit value,
holds nothing worth taking, and is proven inert on the image that ships.**

## Inert is the default; live is the exception

The mode switch has one value that enables live operation and treats every other value — unset,
misspelled, empty, an unknown future mode — as the inert mode. Per
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value), an unrecognised mode never
resolves to the more capable one. The public deployment sets the inert value explicitly as well,
so the image and the service definition both say what they are, but its safety does not depend on
either line being present.

Inert means something checkable at every entry point the public can reach, not "the buttons are
hidden": no action spawns a process, opens a writable store, reaches the network, writes a file,
schedules work or polls; boot starts nothing. An unauthenticated public page answers every route
and every server action to anyone, so each of those entry points is in scope, and a test runs
each one in the inert mode — and in the unset mode — and asserts that nothing of the kind
happened.

## The image holds nothing worth taking

Inert behaviour is the first wall; the image's contents are the second, and the one that holds
when the first fails. A framework vulnerability that grants remote code execution runs below the
application's mode switch — it executes whatever the attacker sends, in whatever the process can
reach. What it finds is then the whole of the damage, so the image is built so that it finds
nothing:

- **No credential of any kind** in the image or its runtime environment, and no write client or
  its configuration. The inert mode reads no credential, so none needs to be present.
- **No writable volume and no writable application files.** The application runs as an
  unprivileged user; its files are owned by another, so the process can read them and not rewrite
  them.
- **The production server entry point,** never a development server, which serves real error
  messages, stack traces and a debugging overlay.
- **Bounded spend.** A public endpoint with no rate limit is bounded by its instance count and
  per-instance concurrency; set both, and the request timeout, deliberately.

## Prove it on the shipped image

The claim is about the image, so the proof reads the image, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) — an inertness
asserted in a design document and never observed is an empty success. Three checks, and the
pipeline runs them on every change that can reach the public build:

1. **Environment inspection.** Start the built image and list its environment; assert that the
   only application-prefixed setting is the mode, and that nothing matches a token or key
   pattern. Inspect for the write client binary and for its configuration directory.
2. **Boot and serve.** Start the image, wait for it, request pages — more than the landing page,
   and an unknown path — and assert the status codes and the security headers. Assert the
   process user.
3. **The inertness test** over every action, in the inert and unset modes, as above.

## Inertness does not replace patching

A build with nothing to take still runs attacker code when its framework has a remote-execution
flaw: it can be used to serve something else, to mine, to pivot through whatever the network
allows. A public deployment therefore also carries a dependency audit over the production
dependency set, at a high-severity threshold, in its pipeline. When the audit finds a critical
flaw in a public deployment, the response is the full sequence — patch, rerun every gate,
redeploy — and the vulnerable revision is retired rather than left addressable, per
[replace-before-retire](./replace-before-retire.md). An audit job left report-only is a finding
someone must read; for a public build, make it blocking on the deploy path, or name who reads it
before each deploy.

## Decision rules

- One explicit value enables live operation; every other value, including unset, is inert.
- Every publicly reachable entry point is tested in the inert and unset modes for no process, no
  write, no network, no schedule.
- The image holds no credential, no write client, no writable volume; the app runs unprivileged
  over files it cannot rewrite; the entry point is the production server.
- Instance count, concurrency and timeout bound a public endpoint's spend.
- The pipeline inspects the shipped image's environment, boots it, and requests real routes.
- A dependency audit at a high threshold runs on the public build's path.

## When not to use it

An application with no write path in any form has nothing to make inert; deploy it and audit its
dependencies. And a public deployment that genuinely must act — sign-ups, payments — is not a
demonstration; it is the live product, and needs authentication and the full production
contract, not a mode.
