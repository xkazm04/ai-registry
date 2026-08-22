---
layer: technique
type: technique
subject: ci-execution-trust
technique: secret-materialization-discipline
status: forged
stage: solo
laws: [creation-names-reaper, one-validation-door]
shared_with: []
use_when: [a pipeline needs a publishing or deployment credential, a secret appeared in a log, choosing where a build gets its credentials from]
---

# Secret materialization discipline

A secret is dangerous in proportion to **how long it exists, how many places it exists in, and
how much it can do**. Every rule here shortens one of those three. This is the technique that
pays from the very first project with a publishing credential, which is why it is the first
thing to adopt in this subject and the thing most often adopted last.

Where a secret is *stored* belongs to the credential-vault subject. This technique is about the
moment it leaves storage and enters a running job — the materialization — which is where nearly
all real exposure happens.

## Fetch late, scope narrow

- **Fetch at the step that uses it**, not at the start of the run. A credential fetched at the
  top of a plan is present for every subsequent step, including the ones that install
  dependencies and the ones that fail noisily.
- **Give it to the narrowest scope that works.** A single command's environment beats the job's
  environment beats the run's environment. Every widening is another set of child processes that
  inherit it, and child processes print their environment on failure more often than anyone
  expects.
- **Prefer a short-lived derived credential** over the durable one. Exchanging a long-lived
  secret for a token valid for minutes converts a permanent exposure into a bounded one, and
  makes rotation a non-event.
- **Prefer a credential the build never holds at all.** Where the platform can issue a workload
  identity to a job directly, no secret is stored anywhere and there is nothing to leak, rotate,
  or find in a log. When available, this is strictly better than everything above.

## Nothing durable

The materialized secret must not reach anything that persists:

- **Not into the plan.** This is the one that catches careful teams. If the plan is captured as
  a run artifact for auditability — which pipeline-plan-auditability requires — then a value
  interpolated into the plan at generation time is now stored, with the run's retention, in a
  place designed to be readable later. Credentials are referenced by name in a plan and resolved
  at execution.
- **Not into a file on the runner**, unless the tool demands one; then create it in a location
  that is destroyed with the job, with restrictive permissions, and delete it in a step that
  runs even when the job fails.
- **Not into a cache or artifact.** A credential in a cached directory is a credential shared
  with every future job that restores that cache, including jobs from other repositories.
- **Not into the command line.** Arguments are visible in process listings and are frequently
  echoed by the shell's own tracing.

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), whatever creates a
materialized secret names what destroys it, at creation. A temporary credential file with no
cleanup step is a permanent credential file on a warm runner.

## One door

Per [one-validation-door](../../../../_laws.md#one-validation-door), builds get credentials from
one mechanism. The failure is not a bad mechanism; it is four adequate mechanisms, of which one
was added in a hurry and never revisited: a proper secret store, plus a repository variable,
plus a value baked into a machine image, plus one exported by a lifecycle hook. The last three
are invisible to whoever audits the first, and they are where the old, over-privileged,
never-rotated credential lives.

Enumerate every route by which a value reaches a running job. Anything that is not the one door
is either migrated or explicitly recorded as an exception with an owner.

## Expiry at issue

Every credential a build can use carries, from the moment it is created: an owner, an expiry,
and a scope written down. A credential without an expiry is not a credential with a long life —
it is a credential nobody has decided about, and it will still be there in three years, held by
a system that was decommissioned two years ago.

Rotation is a schedule, not a response to an incident. A team that has never rotated a
credential does not know whether it can, and finds out during the incident.

## Detect at the boundary

Two checks, cheap, and both catch real leaks:

- **Before a change lands.** Scan for credential-shaped content in the diff. This is the
  irreversibility case: a secret that reaches a shared branch has left the machine and must be
  rotated, not deleted. Removing the commit does not un-disclose it.
- **Before output is published.** Redact known secret values from logs and artifacts on the way
  out, at the single publishing door. Redaction is a backstop, not a control — it only catches
  values it knows, so it misses derived values, encodings, and anything a tool reformats. Treat
  a redaction hit as an incident to investigate, not as the system working.

## The three defects that account for most exposure

None requires an adversary; all three are accidents:

1. **A secret resolved into a stored plan.** Fixed by resolving at execution.
2. **A secret in a broad environment, printed by a failing tool's diagnostic dump.** Fixed by
   narrowing scope.
3. **A long-lived credential nobody owns.** Fixed by expiry at issue.

## Decision rules

- Fetch at the step, scope to the command, prefer short-lived derived credentials, prefer
  workload identity over any stored secret.
- Never into the plan, a persisted file, a cache, an artifact, or a command line.
- Anything materialized names its cleanup, and the cleanup runs on failure too.
- One credential-delivery mechanism; enumerate the others and migrate or record them.
- Owner, expiry and scope at issue; rotation on a schedule, not after an incident.
- Scan diffs before they land and redact at the single publishing door; a redaction hit is an
  incident.
- A secret that reached a shared branch is rotated, never merely deleted.
