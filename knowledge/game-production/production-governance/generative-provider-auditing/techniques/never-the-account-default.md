---
layer: technique
type: technique
subject: generative-provider-auditing
technique: never-the-account-default
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [integrating a hosted generative service, output changed with no code change, reviewing a provider integration for audit gaps]
---

# Never the account default

## The concern

Hosted generative services resolve an unqualified request against a **default** — an
account setting, a workspace preference, or a family alias that points at whatever the
provider currently considers current. That default moves. A newer version ships, the
alias repoints, an administrator changes a setting in a console, and from that moment
every artifact the pipeline produces comes from a model nobody benchmarked.

What makes this the sharpest failure in provider auditing is that **the change is
invisible from inside your repository**. There is no commit, no deploy, no diff, no
failing test. The endpoint keeps returning success. The output simply becomes different:
denser or sparser, differently textured, differently prone to stray fragments — a
behavioural regression with no artifact in version control to blame it on. Teams lose
days to this before they think to ask whether the model changed, because nothing in
their own history suggests it could have.

## Procedure

1. **Send the model identifier explicitly on every request**, including requests where
   the default happens to be the model you want today. Agreeing with the default is not
   the same as stating your choice.
2. **Prefer a dated or immutable version identifier over a family alias.** A family name
   is a moving pointer wearing the costume of a name.
3. **Fail rather than default in your own code.** If configuration does not name a model
   for the requested class, the call does not go out. An internal fallback to "whatever
   the provider picks" re-creates the failure inside your own system.
4. **Treat the model identifier as reviewable configuration** — it changes through the
   same review path as code, so a model change is always a diff somebody approved.
5. **Log the resolved model identity with every produced artifact**, from the response
   where the provider echoes it rather than from your own request. Where the two
   disagree, the provider's answer is the fact and the disagreement is an incident.

## Decision rules

- **When the provider's response does not state which model served the request, treat
  the artifact's model identity as unverified**, and record it as such rather than
  recording your intent as though it were confirmed. A request parameter is a claim by
  the caller; only the echoed identity is a claim by the party that did the work.
- **When an alias is the only addressable form**, pin the alias, record the date, and
  add a periodic check that the underlying version has not moved. An unavoidable moving
  target is monitored, not accepted.
- **When a provider announces a deprecation of a pinned version**, schedule a
  re-benchmark before the retirement date. Migrating on the day the endpoint breaks means
  migrating without evidence.
- **When someone proposes reading the model from an environment variable with a
  sensible default baked in**, refuse the default. A default in the code is the same
  failure relocated: it will silently serve a class it was never benchmarked for.
- **When the requested asset class is unknown or absent, resolve to the audited pin —
  never to no pin.** This is the subtle re-entry point for the whole failure: a resolver
  that returns "no opinion" for an unrecognised class hands the request back to the
  provider's default, and the one code path built to eliminate the silent default becomes
  the thing that invokes it. An unknown class either resolves to an audited pairing or is
  refused; it never falls through.

## The audit test

Take any artifact in the current build. Ask which model version produced it, and answer
from stored data rather than inference. If the answer is "whatever was current in that
week", the integration is running on defaults regardless of what the configuration file
appears to say.

## What this technique is not

It is not version *conservatism*. Pinning is not a refusal to upgrade; it is the
insistence that upgrades are events with dates, evidence and approval, rather than
weather. Nor is pinning permanence: a fixed identifier does not freeze the provider's
surrounding infrastructure, moderation layers, or regional routing, so a pinned pipeline
still needs periodic re-measurement — it just gets to attribute changes correctly when
they happen.

## When NOT to use this

- **In a throwaway prototype** whose output will never enter a build and whose findings
  will be re-established before anything ships.
- **Where the provider's contract is genuinely versionless** and exposes no identifier at
  all — in which case record the absence, and treat any output from that provider as
  unattributable, which is itself a reason to keep it out of shipping classes.
